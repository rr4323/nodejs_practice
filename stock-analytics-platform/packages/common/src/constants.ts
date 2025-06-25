// Redis keys
export const REDIS_KEYS = {
  STOCK_PREFIX: 'stock:',
  USER_PREFIX: 'user:',
  SESSION_PREFIX: 'session:',
} as const;

// WebSocket events
export const WS_EVENTS = {
  STOCK_UPDATE: 'stock:update',
  STOCK_ALERT: 'stock:alert',
  STOCK_PREDICTION: 'stock:prediction',
  ERROR: 'error',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
} as const;

// API routes
export const API_ROUTES = {
  GRAPHQL: '/graphql',
  HEALTH: '/health',
  METRICS: '/metrics',
} as const;

// Environment variables
export const ENV_VARS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  KAFKA_BROKERS: 'KAFKA_BROKERS',
  REDIS_URL: 'REDIS_URL',
  MONGODB_URI: 'MONGODB_URI',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
} as const;

// Default values
export const DEFAULTS = {
  PORT: 4000,
  KAFKA_BROKERS: 'localhost:9092',
  REDIS_URL: 'redis://localhost:6379',
  MONGODB_URI: 'mongodb://localhost:27017/stock-analytics',
  JWT_EXPIRES_IN: '7d',
} as const;
