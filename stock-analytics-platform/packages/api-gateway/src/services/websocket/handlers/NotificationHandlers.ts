import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { 
  WebSocketUser, 
  WebSocketMessage,
  WebSocketEvents,
  WebSocketError,
  StockAlertEvent
} from '../types';
import { logger } from '../../../utils/logger';

export class NotificationHandlers {
  private io: Server;
  private redis: Redis;
  private static readonly NOTIFICATION_PREFIX = 'notification';
  private static readonly USER_NOTIFICATIONS_KEY = 'user:notifications';

  constructor(io: Server, redis: Redis) {
    this.io = io;
    this.redis = redis;
  }

  public initializeHandlers(socket: Socket) {
    // Handle notification subscription
    socket.on(WebSocketEvents.USER_SUBSCRIBE, async (data: { userId: string }) => {
      try {
        const { userId } = data;
        const user = await this.validateUser(socket, userId);
        if (!user) return;

        // Join user's notification room
        socket.join(`notifications:${userId}`);
        logger.info(`User ${userId} subscribed to notifications`);

        // Send unread notifications count
        const unreadCount = await this.getUnreadCount(userId);
        socket.emit(WebSocketEvents.NOTIFICATION, {
          type: 'subscription_success',
          message: 'Successfully subscribed to notifications',
          unreadCount
        });
      } catch (error) {
        this.handleError(socket, 'notification_subscribe_error', error);
      }
    });

    // Handle marking notifications as read
    socket.on(WebSocketEvents.NOTIFICATION_READ, async (data: { notificationIds: string[] }) => {
      try {
        const user = await this.getUserFromSocket(socket);
        if (!user) return;

        const { notificationIds } = data;
        await this.markAsRead(user.userId, notificationIds);

        socket.emit(WebSocketEvents.NOTIFICATION_READ, {
          success: true,
          readCount: notificationIds.length
        });
      } catch (error) {
        this.handleError(socket, 'notification_read_error', error);
      }
    });
  }

  public async sendAlert(alert: StockAlertEvent, userIds: string[] = []) {
    try {
      const notification = {
        id: alert.id || `alert_${Date.now()}`,
        type: 'stock_alert',
        title: `Stock Alert: ${alert.symbol}`,
        message: alert.message,
        priority: alert.priority || 'MEDIUM',
        data: alert,
        timestamp: alert.timestamp || Date.now(),
        read: false
      };

      // Store notification
      await this.storeNotification(notification, userIds);

      // Broadcast to specified users or all connected clients
      if (userIds.length > 0) {
        // Send to specific users
        for (const userId of userIds) {
          this.io.to(`notifications:${userId}`).emit(WebSocketEvents.NOTIFICATION, notification);
        }
      } else {
        // Broadcast to all connected clients
        this.io.emit(WebSocketEvents.NOTIFICATION, notification);
      }

      return notification;
    } catch (error) {
      logger.error('Error sending alert:', error);
      throw error;
    }
  }

  public async storeNotification(notification: any, userIds: string[] = []) {
    try {
      const notificationKey = `${NotificationHandlers.NOTIFICATION_PREFIX}:${notification.id}`;
      
      // Store notification data
      await this.redis.hmset(notificationKey, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority || 'MEDIUM',
        data: JSON.stringify(notification.data || {}),
        timestamp: notification.timestamp || Date.now(),
        read: notification.read ? '1' : '0'
      });

      // Set TTL for notification (7 days)
      await this.redis.expire(notificationKey, 60 * 60 * 24 * 7);

      // Add to user's notification list if userIds are provided
      for (const userId of userIds) {
        const userNotificationsKey = `${NotificationHandlers.USER_NOTIFICATIONS_KEY}:${userId}`;
        await this.redis.lpush(userNotificationsKey, notification.id);
        
        // Keep only the last 100 notifications per user
        await this.redis.ltrim(userNotificationsKey, 0, 99);
      }

      return notification;
    } catch (error) {
      logger.error('Error storing notification:', error);
      throw error;
    }
  }

  public async getNotifications(userId: string, limit: number = 20, offset: number = 0) {
    try {
      const userNotificationsKey = `${NotificationHandlers.USER_NOTIFICATIONS_KEY}:${userId}`;
      const notificationIds = await this.redis.lrange(
        userNotificationsKey,
        offset,
        offset + limit - 1
      );

      const notifications = [];
      for (const id of notificationIds) {
        const notificationData = await this.redis.hgetall(
          `${NotificationHandlers.NOTIFICATION_PREFIX}:${id}`
        );
        
        if (notificationData && Object.keys(notificationData).length > 0) {
          notifications.push({
            ...notificationData,
            data: notificationData.data ? JSON.parse(notificationData.data) : {},
            read: notificationData.read === '1',
            timestamp: parseInt(notificationData.timestamp, 10)
          });
        }
      }

      return notifications;
    } catch (error) {
      logger.error('Error getting notifications:', error);
      throw error;
    }
  }

  public async markAsRead(userId: string, notificationIds: string[]) {
    try {
      for (const id of notificationIds) {
        await this.redis.hset(
          `${NotificationHandlers.NOTIFICATION_PREFIX}:${id}`,
          'read',
          '1'
        );
      }
      return true;
    } catch (error) {
      logger.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  public async getUnreadCount(userId: string): Promise<number> {
    try {
      const userNotificationsKey = `${NotificationHandlers.USER_NOTIFICATIONS_KEY}:${userId}`;
      const notificationIds = await this.redis.lrange(userNotificationsKey, 0, -1);
      
      let unreadCount = 0;
      for (const id of notificationIds) {
        const isRead = await this.redis.hget(
          `${NotificationHandlers.NOTIFICATION_PREFIX}:${id}`,
          'read'
        );
        if (isRead === '0') unreadCount++;
      }
      
      return unreadCount;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  private async validateUser(socket: Socket, userId: string): Promise<WebSocketUser | null> {
    try {
      const user = await this.getUserFromSocket(socket);
      if (!user || user.userId !== userId) {
        this.handleError(socket, 'unauthorized', new Error('Unauthorized'));
        return null;
      }
      return user;
    } catch (error) {
      this.handleError(socket, 'validation_error', error);
      return null;
    }
  }

  private async getUserFromSocket(socket: Socket): Promise<WebSocketUser | null> {
    try {
      // This would be implemented based on your auth system
      // For example, you might have a service that validates the socket's auth token
      // and returns the associated user
      return socket.data?.user || null;
    } catch (error) {
      logger.error('Error getting user from socket:', error);
      return null;
    }
  }

  private handleError(socket: Socket, code: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    const errorResponse: WebSocketError = {
      code,
      message: errorMessage,
      timestamp: Date.now()
    };
    
    socket.emit(WebSocketEvents.ERROR, errorResponse);
    logger.error(`Notification error (${code}):`, error);
  }
}
