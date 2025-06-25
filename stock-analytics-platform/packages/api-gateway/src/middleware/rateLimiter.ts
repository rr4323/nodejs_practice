import { Redis } from 'ioredis';
import { Socket } from 'socket.io';
import { logger } from '../utils/logger';

export interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  max: number;        // Max requests per window
  message?: string;
  statusCode?: number;
  keyGenerator?: (socket: Socket) => string;
}

export class RateLimiter {
  private redis: Redis;
  private options: Required<RateLimitOptions>;

  constructor(redis: Redis, options: RateLimitOptions) {
    this.redis = redis;
    this.options = {
      windowMs: options.windowMs,
      max: options.max,
      message: options.message || 'Too many requests, please try again later.',
      statusCode: options.statusCode || 429,
      keyGenerator: options.keyGenerator || ((socket) => socket.handshake.address || 'unknown')
    };
  }

  public middleware() {
    return async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const key = `rate_limit:${this.options.keyGenerator(socket)}`;
        const current = await this.redis.get(key);
        const currentCount = current ? parseInt(current, 10) : 0;

        if (currentCount >= this.options.max) {
          const ttl = await this.redis.ttl(key);
          const error = new Error(this.options.message) as any;
          error.retryAfter = ttl;
          error.statusCode = this.options.statusCode;
          return next(error);
        }

        // Increment counter or create new key
        if (currentCount === 0) {
          await this.redis.setex(key, Math.ceil(this.options.windowMs / 1000), 1);
        } else {
          await this.redis.incr(key);
        }

        next();
      } catch (error) {
        logger.error('Rate limiter error:', error);
        next(new Error('Internal server error'));
      }
    };
  }

  public static createPerUserRateLimiter(redis: Redis) {
    return new RateLimiter(redis, {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute per user
      keyGenerator: (socket) => `user:${socket.data?.user?.userId || 'anonymous'}`
    });
  }

  public static createGlobalRateLimiter(redis: Redis) {
    return new RateLimiter(redis, {
      windowMs: 60 * 1000, // 1 minute
      max: 1000, // 1000 requests per minute globally
      keyGenerator: () => 'global'
    });
  }
}

// Rate limiter for authentication attempts
export const authRateLimiter = (redis: Redis) => {
  return new RateLimiter(redis, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later.'
  }).middleware();
};
