import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';

export interface QueuedMessage<T = any> {
  id: string;
  timestamp: number;
  expiresAt: number;
  data: T;
  attempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface QueueOptions {
  maxRetries?: number;
  ttlMs?: number;
  batchSize?: number;
  concurrency?: number;
}

export class MessageQueue<T = any> {
  private readonly redis: Redis;
  private readonly queueName: string;
  private readonly options: Required<QueueOptions>;
  private isProcessing: boolean = false;
  private processingMessages: Set<string> = new Set();

  constructor(
    redis: Redis,
    queueName: string,
    options: QueueOptions = {}
  ) {
    this.redis = redis;
    this.queueName = `queue:${queueName}`;
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      ttlMs: options.ttlMs ?? 24 * 60 * 60 * 1000, // 24 hours
      batchSize: options.batchSize ?? 10,
      concurrency: options.concurrency ?? 5
    };
  }

  /**
   * Add a message to the queue
   */
  public async enqueue(data: T, delayMs: number = 0): Promise<string> {
    const message: QueuedMessage<T> = {
      id: uuidv4(),
      timestamp: Date.now(),
      expiresAt: Date.now() + this.options.ttlMs,
      data,
      attempts: 0,
      status: 'pending'
    };

    const score = Date.now() + delayMs;
    await this.redis.zadd(
      this.queueName,
      score.toString(),
      JSON.stringify(message)
    );

    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }

    return message.id;
  }

  /**
   * Process messages from the queue
   */
  private async startProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.isProcessing) {
        // Get batch of messages that are ready to be processed
        const now = Date.now();
        const messages = await this.redis.zrangebyscore(
          this.queueName,
          0,
          now,
          'LIMIT',
          0,
          this.options.batchSize
        );

        if (messages.length === 0) {
          // No messages to process, wait a bit before checking again
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        // Process messages in parallel with concurrency limit
        const processingPromises = [];
        const processingBatch = [];

        for (const messageStr of messages) {
          if (processingBatch.length >= this.options.concurrency) {
            await Promise.all(processingBatch);
            processingBatch.length = 0;
          }

          const processPromise = this.processMessage(messageStr)
            .finally(() => {
              processingBatch.splice(processingBatch.indexOf(processPromise), 1);
            });

          processingBatch.push(processPromise);
          processingPromises.push(processPromise);
        }

        // Wait for all messages in this batch to be processed
        await Promise.all(processingPromises);
      }
    } catch (error) {
      logger.error('Error in message queue processing:', error);
      // Restart processing after an error
      setTimeout(() => this.startProcessing(), 5000);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single message
   */
  private async processMessage(messageStr: string): Promise<void> {
    let message: QueuedMessage<T>;
    try {
      message = JSON.parse(messageStr);
      
      // Skip if already being processed or completed
      if (this.processingMessages.has(message.id) || message.status === 'completed') {
        return;
      }

      this.processingMessages.add(message.id);

      // Check if message has expired
      if (message.expiresAt < Date.now()) {
        await this.removeMessage(message.id);
        return;
      }

      // Update message status to processing
      message.attempts++;
      message.status = 'processing';
      await this.updateMessage(message);

      // Process the message (to be implemented by subclass)
      await this.handleMessage(message.data, (ack) => {
        return this.handleAck(message.id, ack);
      });

    } catch (error) {
      logger.error('Error processing message:', error);
      if (message) {
        await this.handleError(message, error);
      }
    } finally {
      if (message) {
        this.processingMessages.delete(message.id);
      }
    }
  }

  /**
   * Handle message acknowledgment
   */
  private async handleAck(messageId: string, ack: boolean): Promise<void> {
    try {
      const messageStr = await this.redis.zrangebyscore(
        this.queueName,
        '-inf',
        '+inf',
        'LIMIT',
        0,
        1,
        'WITHSCORES'
      );

      if (!messageStr || messageStr.length === 0) return;

      const message = JSON.parse(messageStr[0]) as QueuedMessage<T>;
      if (message.id !== messageId) return;

      if (ack) {
        // Message processed successfully
        message.status = 'completed';
        await this.removeMessage(message.id);
      } else {
        // Message processing failed
        await this.handleError(message, new Error('Message processing failed'));
      }
    } catch (error) {
      logger.error('Error handling ack:', error);
    }
  }

  /**
   * Handle message processing error
   */
  private async handleError(message: QueuedMessage<T>, error: Error): Promise<void> {
    try {
      message.status = 'failed';
      message.error = error.message;

      if (message.attempts >= this.options.maxRetries) {
        logger.warn(`Message ${message.id} failed after ${message.attempts} attempts`);
        await this.removeMessage(message.id);
        await this.handleDeadLetter(message, error);
      } else {
        // Retry with exponential backoff
        const backoff = Math.min(
          Math.pow(2, message.attempts) * 1000,
          30000 // Max 30 seconds
        );
        
        await this.redis.zadd(
          this.queueName,
          'NX',
          (Date.now() + backoff).toString(),
          JSON.stringify(message)
        );
      }
    } catch (err) {
      logger.error('Error handling message error:', err);
    }
  }

  /**
   * Move message to dead letter queue
   */
  private async handleDeadLetter(
    message: QueuedMessage<T>,
    error: Error
  ): Promise<void> {
    try {
      const deadLetterQueue = `${this.queueName}:dead`;
      await this.redis.zadd(
        deadLetterQueue,
        Date.now().toString(),
        JSON.stringify({
          ...message,
          error: error.message,
          failedAt: new Date().toISOString()
        })
      );
    } catch (err) {
      logger.error('Error moving message to dead letter queue:', err);
    }
  }

  /**
   * Update message in the queue
   */
  private async updateMessage(message: QueuedMessage<T>): Promise<void> {
    await this.redis.zremrangebyscore(this.queueName, '-inf', '+inf');
    await this.redis.zadd(
      this.queueName,
      message.timestamp.toString(),
      JSON.stringify(message)
    );
  }

  /**
   * Remove message from the queue
   */
  private async removeMessage(messageId: string): Promise<void> {
    const messages = await this.redis.zrange(this.queueName, 0, -1);
    for (const msg of messages) {
      try {
        const parsedMsg = JSON.parse(msg);
        if (parsedMsg.id === messageId) {
          await this.redis.zrem(this.queueName, msg);
          break;
        }
      } catch (error) {
        // Skip invalid messages
        continue;
      }
    }
  }

  /**
   * Stop processing messages
   */
  public stop(): void {
    this.isProcessing = false;
  }

  /**
   * To be implemented by subclasses to handle actual message processing
   */
  protected async handleMessage(
    data: T,
    ack: (success: boolean) => Promise<void>
  ): Promise<void> {
    throw new Error('Method not implemented');
  }
}
