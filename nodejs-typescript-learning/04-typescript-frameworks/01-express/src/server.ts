import 'module-alias/register';
import 'reflect-metadata';
import 'express-async-errors';
import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { logger } from './utils/logger';
import { PORT, NODE_ENV } from './config';

// Create Express application
const app = createApp();
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: NODE_ENV === 'production' ? 'your-production-url.com' : '*',
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection handler
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Start the server
const startServer = async (): Promise<void> => {
  try {
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error | any) => {
  logger.error(`Unhandled Rejection: ${reason.message || reason}`);
  throw new Error(reason.message || reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`, error);
  process.exit(1);
});

// Start the server
startServer();

export { server, io };
