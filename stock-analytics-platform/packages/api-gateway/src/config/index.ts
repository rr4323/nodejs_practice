import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'REDIS_URL',
  'KAFKA_BROKERS',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Configuration object
const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'stock-analytics-api',
    audience: process.env.JWT_AUDIENCE || 'stock-analytics-client',
  },
  
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL!,
    ttl: parseInt(process.env.REDIS_TTL || '86400', 10), // 24 hours in seconds
  },
  
  // Kafka configuration
  kafka: {
    brokers: process.env.KAFKA_BROKERS!.split(',').map(broker => broker.trim()),
    clientId: process.env.KAFKA_CLIENT_ID || 'api-gateway',
    groupId: process.env.KAFKA_GROUP_ID || 'api-gateway-group',
    topics: {
      stockUpdates: 'stock-updates',
      stockAlerts: 'stock-alerts',
      userEvents: 'user-events',
    },
  },
  
  // API configuration
  api: {
    prefix: '/api',
    version: 'v1',
    docsPath: '/api-docs',
  },
  
  // WebSocket configuration
  websocket: {
    path: '/ws',
    pingInterval: 10000,
    pingTimeout: 5000,
    maxHttpBufferSize: 1e6, // 1MB
  },
};

export default config;
