import { Socket as BaseSocket } from 'socket.io';
import { createBrotliCompress, createGzip, ZlibOptions } from 'zlib';
import { promisify } from 'util';
import { pipeline, Readable, Transform } from 'stream';
import { logger } from '../../utils/logger';
import { WebSocketError } from './types';

const pipelineAsync = promisify(pipeline);

export interface EnhancedSocketOptions {
  compression?: 'none' | 'gzip' | 'brotli';
  compressionLevel?: number;
  maxPayloadSize?: number;
  pingTimeout?: number;
  pingInterval?: number;
  maxReconnectAttempts?: number;
}

export class EnhancedSocket {
  private socket: BaseSocket;
  private options: Required<EnhancedSocketOptions>;
  private reconnectAttempts: number = 0;
  private lastPingTime: number = 0;
  private isConnected: boolean = false;
  private messageQueue: Array<{ event: string; data: any; ack?: (response: any) => void }> = [];
  private ackCallbacks: Map<string, (response: any) => void> = new Map();
  private messageIdCounter: number = 0;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(socket: BaseSocket, options: EnhancedSocketOptions = {}) {
    this.socket = socket;
    this.options = {
      compression: options.compression || 'none',
      compressionLevel: options.compressionLevel || 6,
      maxPayloadSize: options.maxPayloadSize || 10 * 1024 * 1024, // 10MB
      pingTimeout: options.pingTimeout || 30000, // 30 seconds
      pingInterval: options.pingInterval || 25000, // 25 seconds
      maxReconnectAttempts: options.maxReconnectAttempts || 5,
    };

    this.setupEventHandlers();
    this.setupHeartbeat();
  }

  private setupEventHandlers(): void {
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('error', this.handleError.bind(this));
    this.socket.on('pong', this.handlePong.bind(this));
  }

  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (!this.isConnected) return;

      const timeSinceLastPong = Date.now() - this.lastPingTime;
      if (timeSinceLastPong > this.options.pingTimeout) {
        logger.warn('No pong received, disconnecting...');
        this.socket.disconnect(true);
        return;
      }

      this.lastPingTime = Date.now();
      this.socket.emit('ping', { timestamp: this.lastPingTime });
    }, this.options.pingInterval);
  }

  private handleConnect(): void {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.lastPingTime = Date.now();
    this.flushMessageQueue();
    logger.info('Socket connected');
  }

  private handleDisconnect(reason: string): void {
    this.isConnected = false;
    
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, attempt to reconnect
      this.attemptReconnect();
    } else if (reason === 'io client disconnect') {
      // Client initiated disconnect, don't reconnect
      logger.info('Client disconnected');
    } else {
      // Network error, attempt to reconnect
      this.attemptReconnect();
    }
  }

  private handleError(error: Error): void {
    logger.error('Socket error:', error);
    // Attempt to reconnect on error
    this.attemptReconnect();
  }

  private handlePong(): void {
    this.lastPingTime = Date.now();
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      this.cleanup();
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff with 30s max
    
    logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.socket.connect();
      }
    }, delay);
  }

  private async compressData(data: any): Promise<Buffer> {
    if (this.options.compression === 'none') {
      return Buffer.from(JSON.stringify(data));
    }

    const compressOptions: ZlibOptions = {
      level: this.options.compressionLevel,
    };

    try {
      const compressor = this.options.compression === 'brotli'
        ? createBrotliCompress(compressOptions)
        : createGzip(compressOptions);

      const source = Readable.from(JSON.stringify(data));
      const chunks: Buffer[] = [];
      
      const transform = new Transform({
        transform(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      });

      await pipelineAsync(source, compressor, transform);
      return Buffer.concat(chunks);
    } catch (error) {
      logger.error('Compression error:', error);
      throw new Error('Failed to compress data');
    }
  }

  private async decompressData(buffer: Buffer): Promise<any> {
    if (this.options.compression === 'none') {
      return JSON.parse(buffer.toString());
    }

    // Implementation would use zlib.inflate or similar
    // This is a simplified example
    try {
      // In a real implementation, you would use the appropriate decompression method
      // based on the compression algorithm used
      return JSON.parse(buffer.toString());
    } catch (error) {
      logger.error('Decompression error:', error);
      throw new Error('Failed to decompress data');
    }
  }

  private async emitWithAck(event: string, data: any, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected'));
        return;
      }

      const messageId = `${Date.now()}-${++this.messageIdCounter}`;
      const timer = setTimeout(() => {
        this.ackCallbacks.delete(messageId);
        reject(new Error('Ack timeout'));
      }, timeout);

      this.ackCallbacks.set(messageId, (response) => {
        clearTimeout(timer);
        this.ackCallbacks.delete(messageId);
        resolve(response);
      });

      this.socket.emit(event, { id: messageId, data });
    });
  }

  private flushMessageQueue(): void {
    if (!this.isConnected || this.messageQueue.length === 0) {
      return;
    }

    // Process messages in the order they were queued
    while (this.messageQueue.length > 0) {
      const { event, data, ack } = this.messageQueue.shift()!;
      this.emit(event, data, ack);
    }
  }

  public emit(event: string, data: any, ack?: (response: any) => void): void {
    if (!this.isConnected) {
      // Queue the message if not connected
      this.messageQueue.push({ event, data, ack });
      return;
    }

    try {
      // Check payload size
      const payloadSize = Buffer.byteLength(JSON.stringify(data));
      if (payloadSize > this.options.maxPayloadSize) {
        throw new Error(`Payload too large: ${payloadSize} bytes (max: ${this.options.maxPayloadSize} bytes)`);
      }

      if (ack) {
        // If an ack callback is provided, use the ack mechanism
        this.emitWithAck(event, data)
          .then(ack)
          .catch((error) => {
            logger.error('Ack error:', error);
            ack({ error: error.message });
          });
      } else {
        // Otherwise, just emit the event
        this.socket.emit(event, data);
      }
    } catch (error) {
      logger.error('Emit error:', error);
      if (ack) {
        ack({ error: error.message });
      }
    }
  }

  public on(event: string, callback: (data: any, ack: (response: any) => void) => void): void {
    this.socket.on(event, async (message: any, clientAck: (response: any) => void) => {
      try {
        // Handle message with ack
        const ackWrapper = (response: any) => {
          if (typeof clientAck === 'function') {
            clientAck(response);
          }
        };

        // Decompress data if needed
        let processedData = message;
        if (message && Buffer.isBuffer(message.data)) {
          processedData = await this.decompressData(message.data);
        }

        // Call the handler
        await callback(processedData, ackWrapper);
      } catch (error) {
        logger.error('Error in message handler:', error);
        if (typeof clientAck === 'function') {
          clientAck({ error: error.message });
        }
      }
    });
  }

  public disconnect(): void {
    this.cleanup();
    this.socket.disconnect();
  }

  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.messageQueue = [];
    this.ackCallbacks.clear();
  }

  public get id(): string {
    return this.socket.id;
  }

  public get connected(): boolean {
    return this.isConnected;
  }
}
