import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createTerminus } from '@godaddy/terminus';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { healthRouter } from './routes/health';
import { createContext } from './graphql/context';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import config from './config';
import WebSocketService from './services/WebSocketService';

// Create Express app
const app: Express = express();
const httpServer = createServer(app);

// Initialize WebSocket service
let webSocketService: WebSocketService;

// Apply middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.isDevelopment) {
  app.use(morgan('combined', { 
    stream: { 
      write: (message) => logger.info(message.trim()) 
    } 
  }));
}

// REST API Routes
app.use('/health', healthRouter);

// Simple REST endpoint example
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    websocket: {
      connected: webSocketService ? webSocketService.getConnectedUsersCount() : 0
    }
  });
});

// Create Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Proper shutdown for the WebSocket server
    {
      async serverWillStart() {
        return {
          async drainServer() {
            if (webSocketService) {
              await webSocketService.close();
            }
          },
        };
      },
    },
  ],
  formatError: (error) => {
    logger.error('GraphQL Error', { error });
    return error;
  },
});

// Start Apollo Server
const startApolloServer = async () => {
  await apolloServer.start();
  
  // Apply GraphQL middleware
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: createContext,
    })
  );

  // Initialize WebSocket service
  webSocketService = new WebSocketService(httpServer);
  logger.info('WebSocket service initialized');

  // Apply 404 handler
  app.use(notFoundHandler);
  
  // Apply error handler (should be last)
  app.use(errorHandler);

  // Start the server with Terminus for graceful shutdown
  const server = httpServer.listen(config.port, () => {
    const address = server.address();
    const serverAddress = typeof address === 'string' 
      ? address 
      : `http://localhost:${address?.port}`;
    
    logger.info(`🚀 Server ready at ${serverAddress}`);
    logger.info(`🚀 GraphQL endpoint: ${serverAddress}/graphql`);
    logger.info(`🔌 WebSocket endpoint: ws://localhost:${config.port}${config.websocket.path}`);
  });

  // Graceful shutdown
  const onSignal = async () => {
    logger.info('Server is starting cleanup');
    
    // Close WebSocket connections
    if (webSocketService) {
      await webSocketService.close();
    }
    
    // Close any other resources here (database connections, etc.)
  };

  const onShutdown = () => {
    logger.info('Cleanup finished, server is shutting down');
  };

  const healthCheck = async () => {
    // Add any health checks here
    return Promise.resolve();
  };

  createTerminus(server, {
    signal: 'SIGINT',
    healthChecks: { '/healthcheck': healthCheck },
    onSignal,
    onShutdown,
  });
};

// Start the server
startApolloServer().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});

// Apply error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
