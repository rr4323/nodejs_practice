import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { config } from '../config';

type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // Map<socketId, userId>

  constructor(server: HttpServer) {
    // Initialize Socket.IO server
    this.io = new SocketIOServer(server, {
      path: '/ws',
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    // Initialize middleware and event handlers
    this.initializeMiddlewares();
    this.initializeEventHandlers();
  }

  private initializeMiddlewares(): void {
    // Authentication middleware
    this.io.use(this.authenticateSocket);
  }

  private authenticateSocket(socket: Socket, next: (err?: Error) => void): void {
    const token = socket.handshake.auth.token || 
                 socket.handshake.query.token as string;

    if (!token) {
      logger.warn('WebSocket connection attempt without token');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      
      // Attach user ID to socket for future use
      (socket as any).userId = decoded.userId;
      this.connectedUsers.set(socket.id, decoded.userId);
      
      logger.info(`User ${decoded.userId} connected with socket ${socket.id}`);
      next();
    } catch (error) {
      logger.error('WebSocket authentication failed', { error });
      next(new Error('Authentication error: Invalid token'));
    }
  }

  private initializeEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      logger.info(`Socket connected: ${socket.id} (User: ${userId})`);

      // Join user to their personal room
      socket.join(`user:${userId}`);

      // Handle subscription to stock updates
      this.handleStockSubscriptions(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id} (User: ${userId})`);
        this.connectedUsers.delete(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error (${socket.id}):`, error);
      });
    });
  }

  private handleStockSubscriptions(socket: Socket): void {
    // Subscribe to stock updates
    socket.on('subscribe:stock', (symbol: string) => {
      const room = `stock:${symbol.toUpperCase()}`;
      socket.join(room);
      logger.info(`Socket ${socket.id} subscribed to ${room}`);
      
      // Acknowledge subscription
      socket.emit('subscription:confirmed', { 
        symbol, 
        success: true,
        message: `Subscribed to ${symbol} updates`
      });
    });

    // Unsubscribe from stock updates
    socket.on('unsubscribe:stock', (symbol: string) => {
      const room = `stock:${symbol.toUpperCase()}`;
      socket.leave(room);
      logger.info(`Socket ${socket.id} unsubscribed from ${room}`);
      
      // Acknowledge unsubscription
      socket.emit('unsubscription:confirmed', { 
        symbol, 
        success: true,
        message: `Unsubscribed from ${symbol} updates`
      });
    });
  }

  // Public method to broadcast stock updates to all subscribers
  public broadcastStockUpdate(symbol: string, data: any): void {
    const room = `stock:${symbol.toUpperCase()}`;
    this.io.to(room).emit('stock:update', { symbol, ...data });
    logger.debug(`Broadcasted update for ${symbol} to room ${room}`);
  }

  // Public method to send direct message to a user
  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Sent ${event} to user ${userId}`);
  }

  // Get number of connected users
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Cleanup resources
  public close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        logger.info('WebSocket server closed');
        resolve();
      });
    });
  }
}

export default WebSocketService;
