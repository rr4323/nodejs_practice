import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server configuration
  port: parseInt(process.env.WEBSOCKET_PORT || '4005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  // Kafka configuration (for future use)
  kafka: {
    brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
    clientId: 'websocket-service',
    groupId: 'websocket-service-group',
    topics: {
      stockUpdates: 'stock-updates',
      stockAlerts: 'stock-alerts',
      userEvents: 'user-events',
    },
  },
  
  // WebSocket configuration
  websocket: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    path: process.env.WEBSOCKET_PATH || '/socket.io',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    issuer: process.env.JWT_ISSUER || 'stock-analytics',
    audience: process.env.JWT_AUDIENCE || 'stock-analytics-client',
  },
};

export default config;
