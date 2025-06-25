import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { WebSocketUser, WebSocketEvents, StockUpdateEvent, StockAlertEvent } from './types';
import { logger } from '../../utils/logger';
import { config } from '../../config';
import { AuthHandlers } from './handlers/AuthHandlers';
import { StockHandlers } from './handlers/StockHandlers';
import { NotificationHandlers } from './handlers/NotificationHandlers';

export class WebSocketService {
  private io: Server;
  private redis: Redis;
  private pubClient: Redis;
  private subClient: Redis;
  private authHandlers: AuthHandlers;
  private stockHandlers: StockHandlers;
  private notificationHandlers: NotificationHandlers;
  private isInitialized = false;

  constructor(private httpServer: HttpServer) {
    // Initialize Redis clients
    this.redis = new Redis(config.redis.url);
    this.pubClient = this.redis.duplicate();
    this.subClient = this.redis.duplicate();

    // Configure Socket.IO server
    this.io = new Server(httpServer, {
      path: config.websocket.path,
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 30000,
      pingInterval: 25000,
      cookie: false
    });

    // Initialize handlers
    this.authHandlers = new AuthHandlers(this.io, this.redis, config.jwt.secret);
    this.stockHandlers = new StockHandlers(this.io, this.redis);
    this.notificationHandlers = new NotificationHandlers(this.io, this.redis);
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('WebSocketService already initialized');
      return;
    }

    try {
      // Set up Redis adapter for horizontal scaling
      await this.setupRedisAdapter();
      
      // Initialize Socket.IO connection handling
      this.setupConnectionHandlers();
      
      // Initialize stock data and start updates
      await this.initializeStockData();
      
      this.isInitialized = true;
      logger.info('WebSocketService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WebSocketService:', error);
      throw error;
    }
  }

  private async setupRedisAdapter(): Promise<void> {
    try {
      // Test Redis connection
      await Promise.all([
        this.pubClient.ping(),
        this.subClient.ping()
      ]);

      // Set up Redis adapter for Socket.IO
      const adapter = createAdapter(this.pubClient, this.subClient);
      this.io.adapter(adapter);

      logger.info('Redis adapter configured for Socket.IO');
    } catch (error) {
      logger.error('Failed to set up Redis adapter:', error);
      throw new Error('Redis connection failed');
    }
  }

  private setupConnectionHandlers(): void {
    // Initialize auth handlers
    this.io.on(WebSocketEvents.CONNECTION, (socket: Socket) => {
      logger.info(`New connection: ${socket.id}`);
      
      // Initialize auth handlers
      this.authHandlers.initializeHandlers(socket);
      
      // Initialize notification handlers
      this.notificationHandlers.initializeHandlers(socket);
      
      // Stock subscription handlers
      socket.on(WebSocketEvents.STOCK_SUBSCRIBE, async ({ symbol }: { symbol: string }) => {
        try {
          const user = await this.authHandlers.getUserFromSocket(socket);
          if (!user) {
            throw new Error('User not authenticated');
          }
          await this.stockHandlers.handleSubscribe(socket, symbol, user);
        } catch (error) {
          this.handleError(socket, 'subscription_error', error);
        }
      });

      socket.on(WebSocketEvents.STOCK_UNSUBSCRIBE, async ({ symbol }: { symbol: string }) => {
        try {
          const user = await this.authHandlers.getUserFromSocket(socket);
          if (!user) {
            throw new Error('User not authenticated');
          }
          await this.stockHandlers.handleUnsubscribe(socket, symbol, user);
        } catch (error) {
          this.handleError(socket, 'unsubscription_error', error);
        }
      });

      // Disconnection handler
      socket.on(WebSocketEvents.DISCONNECT, async () => {
        try {
          const user = await this.authHandlers.getUserFromSocket(socket);
          if (user) {
            logger.info(`User ${user.userId} disconnected from socket ${socket.id}`);
          }
        } catch (error) {
          logger.error('Error handling disconnection:', error);
        }
      });
    });

    // Global error handling
    this.io.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });
  }

  private async initializeStockData(): Promise<void> {
    // This would be replaced with actual data initialization
    logger.info('Initializing stock data...');
    // The StockHandlers class already handles its own initialization
  }

  // Public API methods
  public async broadcastStockUpdate(update: StockUpdateEvent): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('WebSocketService not initialized');
    }
    this.io.emit(WebSocketEvents.STOCK_UPDATE, update);
  }

  public async sendStockAlert(alert: StockAlertEvent, userIds: string[] = []): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('WebSocketService not initialized');
    }
    await this.notificationHandlers.sendAlert(alert, userIds);
  }

  public async getConnectedUsers(): Promise<number> {
    if (!this.isInitialized) {
      return 0;
    }
    const sockets = await this.io.fetchSockets();
    return sockets.length;
  }

  public async disconnectUser(userId: string): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      // Find all sockets for this user
      const sockets = await this.io.fetchSockets();
      const userSockets = sockets.filter(socket => 
        (socket as any).data?.user?.userId === userId
      );

      // Disconnect all sockets for this user
      userSockets.forEach(socket => {
        socket.disconnect(true);
      });

      // Clean up user data
      await this.stockHandlers.cleanupUserConnections(userId);
      
      logger.info(`Disconnected user ${userId} from ${userSockets.length} sockets`);
      return true;
    } catch (error) {
      logger.error(`Error disconnecting user ${userId}:`, error);
      return false;
    }
  }

  private handleError(socket: Socket, code: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    const errorResponse = {
      code,
      message: errorMessage,
      timestamp: Date.now()
    };
    
    socket.emit(WebSocketEvents.ERROR, errorResponse);
    logger.error(`WebSocket error (${code}):`, error);
  }

  public async close(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Close all WebSocket connections
      this.io.close();
      
      // Close Redis connections
      await Promise.all([
        this.redis.quit(),
        this.pubClient.quit(),
        this.subClient.quit()
      ]);
      
      this.isInitialized = false;
      logger.info('WebSocketService closed successfully');
    } catch (error) {
      logger.error('Error closing WebSocketService:', error);
      throw error;
    }
  }
}
