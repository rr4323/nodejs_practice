import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { 
  WebSocketUser, 
  WebSocketMessage,
  WebSocketEvents,
  WebSocketError 
} from '../types';
import { logger } from '../../../utils/logger';

export class AuthHandlers {
  private io: Server;
  private redis: Redis;
  private jwtSecret: string;
  private connectedUsers: Map<string, WebSocketUser> = new Map();

  constructor(io: Server, redis: Redis, jwtSecret: string) {
    this.io = io;
    this.redis = redis;
    this.jwtSecret = jwtSecret;
  }

  public initializeHandlers(socket: Socket) {
    // Authentication middleware
    socket.use((packet, next) => {
      // Skip auth for connection events
      if (packet[0] === WebSocketEvents.CONNECTION) {
        return next();
      }

      const token = this.getTokenFromSocket(socket);
      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      try {
        const decoded = this.verifyToken(token);
        socket.data.user = decoded;
        next();
      } catch (error) {
        logger.warn('Authentication failed:', error);
        next(new Error('Invalid or expired token'));
      }
    });

    // Connection handler
    socket.on(WebSocketEvents.CONNECTION, () => {
      logger.info(`New connection: ${socket.id}`);
      
      // Send connection confirmation
      socket.emit(WebSocketEvents.CONNECTION, { 
        connected: true, 
        socketId: socket.id 
      });

      // Handle authentication
      socket.on(WebSocketEvents.AUTHENTICATE, async (data: { token: string }) => {
        try {
          const user = await this.handleAuthentication(socket, data.token);
          this.connectedUsers.set(socket.id, user);
          
          // Notify client of successful authentication
          socket.emit(WebSocketEvents.AUTHENTICATED, {
            success: true,
            user: {
              userId: user.userId,
              socketId: socket.id,
              connectedAt: user.joinedAt.toISOString()
            }
          });

          logger.info(`User ${user.userId} authenticated on socket ${socket.id}`);
        } catch (error) {
          this.handleAuthError(socket, error);
        }
      });

      // Handle disconnection
      socket.on(WebSocketEvents.DISCONNECT, () => {
        this.handleDisconnect(socket);
      });

      // Ping handler
      socket.on(WebSocketEvents.PING, (callback) => {
        if (typeof callback === 'function') {
          callback(WebSocketEvents.PONG);
        }
      });
    });
  }

  private getTokenFromSocket(socket: Socket): string | null {
    // Try to get token from query params
    const token = socket.handshake.auth?.token || 
                 socket.handshake.query?.token as string ||
                 null;
    
    if (token) return token;

    // Try to get token from authorization header
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    return null;
  }

  private verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      });
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  }

  private async handleAuthentication(
    socket: Socket, 
    token: string
  ): Promise<WebSocketUser> {
    try {
      const decoded = this.verifyToken(token);
      
      // Basic user validation
      if (!decoded.userId) {
        throw new Error('Invalid token payload: userId is required');
      }

      const user: WebSocketUser = {
        userId: decoded.userId,
        socketId: socket.id,
        joinedAt: new Date(),
        lastActive: new Date(),
        subscriptions: [],
        metadata: {
          ...decoded,
          // Remove sensitive fields
          iat: undefined,
          exp: undefined
        }
      };

      // Store user session in Redis
      await this.redis.setex(
        `ws:user:${user.userId}:${socket.id}`,
        parseInt(process.env.REDIS_TTL || '86400', 10),
        JSON.stringify(user)
      );

      return user;
    } catch (error) {
      logger.error('Authentication error:', error);
      throw new Error('Authentication failed');
    }
  }

  private handleAuthError(socket: Socket, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    const errorResponse: WebSocketError = {
      code: 'auth_error',
      message: errorMessage,
      timestamp: Date.now()
    };
    
    socket.emit(WebSocketEvents.UNAUTHORIZED, errorResponse);
    socket.disconnect(true);
  }

  private async handleDisconnect(socket: Socket) {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      logger.info(`User ${user.userId} disconnected from socket ${socket.id}`);
      
      // Clean up user session
      await this.redis.del(`ws:user:${user.userId}:${socket.id}`);
      this.connectedUsers.delete(socket.id);
      
      // Notify other services about user disconnection
      this.io.emit(WebSocketEvents.USER_OFFLINE, {
        userId: user.userId,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.info(`Anonymous client disconnected: ${socket.id}`);
    }
  }

  public async getUserFromSocket(socket: Socket): Promise<WebSocketUser | null> {
    // First check in-memory
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      user.lastActive = new Date();
      return user;
    }

    // If not in memory, try to load from Redis
    const userId = socket.data?.user?.userId;
    if (userId) {
      const userData = await this.redis.get(`ws:user:${userId}:${socket.id}`);
      if (userData) {
        const parsedUser = JSON.parse(userData) as WebSocketUser;
        this.connectedUsers.set(socket.id, parsedUser);
        return parsedUser;
      }
    }

    return null;
  }

  public async validateUser(socket: Socket): Promise<boolean> {
    const user = await this.getUserFromSocket(socket);
    if (!user) {
      this.handleAuthError(socket, new Error('User not authenticated'));
      return false;
    }
    return true;
  }
}
