import { Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { WebSocketError } from '../services/websocket/types';

/**
 * Security middleware to validate and sanitize WebSocket messages
 */
export class SecurityMiddleware {
  private static readonly MAX_MESSAGE_LENGTH = 1024; // 1KB
  private static readonly ALLOWED_EVENT_TYPES = new Set([
    'stock:subscribe',
    'stock:unsubscribe',
    'auth:login',
    'user:typing',
    'chat:message',
    'notification:read'
  ]);

  /**
   * Validates and sanitizes incoming WebSocket messages
   */
  public static validateMessage(socket: Socket, next: (err?: Error) => void) {
    try {
      // Validate message format
      const [event, data] = socket.handshake.query.event || [];
      
      if (!event || typeof event !== 'string') {
        return this.sendError(socket, 'invalid_message', 'Invalid message format');
      }

      // Validate event type
      if (!this.ALLOWED_EVENT_TYPES.has(event)) {
        return this.sendError(socket, 'invalid_event_type', 'Event type not allowed');
      }

      // Validate message size
      if (JSON.stringify(data).length > this.MAX_MESSAGE_LENGTH) {
        return this.sendError(socket, 'message_too_large', 'Message too large');
      }

      // Sanitize input based on event type
      try {
        switch (event) {
          case 'stock:subscribe':
          case 'stock:unsubscribe':
            this.validateStockSubscription(data);
            break;
          case 'auth:login':
            this.validateAuthData(data);
            break;
          case 'chat:message':
            this.sanitizeChatMessage(data);
            break;
        }
      } catch (error) {
        return this.sendError(socket, 'validation_error', error.message);
      }

      next();
    } catch (error) {
      logger.error('Security validation error:', error);
      this.sendError(socket, 'internal_error', 'Internal server error');
    }
  }

  private static validateStockSubscription(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid subscription data');
    }

    const { symbol } = data;
    if (!symbol || typeof symbol !== 'string' || !/^[A-Z]{1,10}$/.test(symbol)) {
      throw new Error('Invalid stock symbol');
    }
  }

  private static validateAuthData(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid authentication data');
    }

    const { token } = data;
    if (!token || typeof token !== 'string' || token.length > 1024) {
      throw new Error('Invalid authentication token');
    }
  }

  private static sanitizeChatMessage(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid message data');
    }

    // Basic XSS protection
    const message = String(data.message || '')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .substring(0, 1000);

    // Update the message with sanitized content
    data.message = message;
  }

  private static sendError(socket: Socket, code: string, message: string) {
    const error: WebSocketError = {
      code,
      message,
      timestamp: Date.now()
    };
    
    socket.emit('error', error);
    socket.disconnect(true);
  }

  /**
   * Adds security headers to HTTP responses
   */
  public static securityHeaders(req: any, res: any, next: () => void) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data:; " +
      "connect-src 'self' ws: wss:;"
    );
    
    // HTTP Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Prevent caching of sensitive data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
  }
}
