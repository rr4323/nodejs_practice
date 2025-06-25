import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { Server } from 'socket.io';
import http from 'http';
import { createClient } from 'redis';
import { createClient as createRedisClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { logger, stream } from './utils/logger';
import { NODE_ENV, CORS_ORIGIN, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from './config';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { ApiError } from './utils/apiError';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace 'any' with your User type
      io?: Server;
    }
  }
}

// Initialize Redis client
const redisClient = createRedisClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Create Express application
export const createApp = (): Application => {
  const app = express();

  // Initialize Redis pub/sub clients
  const pubClient = redisClient.duplicate();
  const subClient = redisClient.duplicate();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.io with Redis adapter
  const io = new Server(server, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  // Use Redis adapter for Socket.io
  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.io Redis adapter initialized');
  });

  // Add Socket.io to app locals
  app.set('io', io);

  // Trust proxy
  app.set('trust proxy', 1);

  // Global middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Security headers
  app.use(helmet());
  
  // Enable CORS
  app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }));

  // Compression
  app.use(compression());

  // Logging
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev', { stream }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  });
  app.use(limiter);

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  // Handle unhandled routes
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
  });

  return app;
};

export default createApp;
