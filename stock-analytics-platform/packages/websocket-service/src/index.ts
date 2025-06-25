import http from 'http';
import { logger } from './utils/logger';
import config from './config';
import WebSocketService from './services/WebSocketService';

// Create HTTP server
const server = http.createServer((req, res) => {
  // Simple health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  }
  
  // Not found for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Initialize WebSocket service
const webSocketService = new WebSocketService(server);

// Start the server
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`🚀 WebSocket service running on port ${PORT}`);
  logger.info(`🔌 WebSocket path: ${config.websocket.path}`);
  logger.info(`🌐 Environment: ${config.nodeEnv}`);
});

// Handle graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down WebSocket service...');
  
  try {
    await webSocketService.close();
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    
    // Force close after timeout
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 5000);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // In production, you might want to restart the process here
  // process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

export default webSocketService;
