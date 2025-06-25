import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { logger } from '../utils/logger';
import config from '../config';

type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

class WebSocketService {
  private io: Server;
  private pubClient: Redis;
  private subClient: Redis;
  private connectedClients: Map<string, Set<string>> = new Map(); // Map<userId, Set<socketId>>
  private roomSubscriptions: Map<string, Set<string>> = new Map(); // Map<room, Set<socketId>>


  constructor(server: HttpServer) {
    // Initialize Redis clients
    this.pubClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
    });

    this.subClient = this.pubClient.duplicate();

    // Initialize Socket.IO server
    this.io = new Server(server, {
      ...config.websocket,
      transports: ['websocket', 'polling'],
    });

    // Set up Redis adapter for horizontal scaling
    this.io.adapter(createAdapter(this.pubClient, this.subClient));

    // Initialize connection handling
    this.initializeConnection();
    this.initializeErrorHandling();
  }


  private initializeConnection(): void {
    this.io.on('connection', (socket: Socket) => {
      const clientId = socket.id;
      logger.info(`Client connected: ${clientId}`);

      // Handle authentication
      this.handleAuthentication(socket);

      // Handle subscription to stock updates
      this.handleStockSubscriptions(socket);

      // Handle disconnect
      socket.on('disconnect', () => this.handleDisconnect(socket));

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error: ${error.message}`, { error });
      });
    });
  }

  private handleAuthentication(socket: Socket): void {
    // In a real app, you would validate the JWT token here
    // For now, we'll just accept all connections
    const userId = socket.handshake.query.userId as string || 'anonymous';
    
    // Track connected clients
    if (!this.connectedClients.has(userId)) {
      this.connectedClients.set(userId, new Set());
    }
    this.connectedClients.get(userId)?.add(socket.id);
    
    logger.info(`User ${userId} connected with socket ${socket.id}`);
    
    // Join user's personal room for direct messaging
    socket.join(`user:${userId}`);
    
    // Acknowledge successful connection
    socket.emit('authenticated', { success: true, userId });
  }

  private handleStockSubscriptions(socket: Socket): void {
    // Subscribe to stock updates
    socket.on('subscribe:stock', (symbol: string) => {
      const room = `stock:${symbol.toUpperCase()}`;
      socket.join(room);
      
      // Track room subscriptions
      if (!this.roomSubscriptions.has(room)) {
        this.roomSubscriptions.set(room, new Set());
      }
      this.roomSubscriptions.get(room)?.add(socket.id);
      
      logger.info(`Socket ${socket.id} subscribed to ${room}`);
      socket.emit('subscription:confirmed', { symbol, success: true });
    });

    // Unsubscribe from stock updates
    socket.on('unsubscribe:stock', (symbol: string) => {
      const room = `stock:${symbol.toUpperCase()}`;
      socket.leave(room);
      
      // Update room subscriptions
      if (this.roomSubscriptions.has(room)) {
        this.roomSubscriptions.get(room)?.delete(socket.id);
        if (this.roomSubscriptions.get(room)?.size === 0) {
          this.roomSubscriptions.delete(room);
        }
      }
      
      logger.info(`Socket ${socket.id} unsubscribed from ${room}`);
      socket.emit('unsubscription:confirmed', { symbol, success: true });
    });
  }

  private handleDisconnect(socket: Socket): void {
    const clientId = socket.id;
    logger.info(`Client disconnected: ${clientId}`);
    
    // Clean up user tracking
    for (const [userId, sockets] of this.connectedClients.entries()) {
      if (sockets.has(clientId)) {
        sockets.delete(clientId);
        if (sockets.size === 0) {
          this.connectedClients.delete(userId);
        }
        break;
      }
    }
    
    // Clean up room subscriptions
    for (const [room, sockets] of this.roomSubscriptions.entries()) {
      if (sockets.has(clientId)) {
        sockets.delete(clientId);
        if (sockets.size === 0) {
          this.roomSubscriptions.delete(room);
        }
      }
    }
  }

  private initializeErrorHandling(): void {
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', { error });
      // In production, you might want to restart the process here
      // process.exit(1);
    });
  }

  // Public methods for broadcasting messages
  public broadcastStockUpdate(symbol: string, data: any): void {
    const room = `stock:${symbol.toUpperCase()}`;
    this.io.to(room).emit('stock:update', { symbol, ...data });
  }

  public broadcastStockAlert(symbol: string, alert: any): void {
    const room = `stock:${symbol.toUpperCase()}`;
    this.io.to(room).emit('stock:alert', { symbol, ...alert });
  }

  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public getConnectedUsersCount(): number {
    return this.connectedClients.size;
  }

  public getActiveRooms(): string[] {
    return Array.from(this.roomSubscriptions.keys());
  }

  // Cleanup resources
  public async close(): Promise<void> {
    await Promise.all([
      new Promise<void>((resolve) => {
        this.io.close(() => {
          logger.info('WebSocket server closed');
          resolve();
        });
      }),
      this.pubClient.quit(),
      this.subClient.quit(),
    ]);
  }
}

export default WebSocketService;
