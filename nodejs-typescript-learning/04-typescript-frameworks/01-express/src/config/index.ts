import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment variables with defaults
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = 100; // Limit each IP to 100 requests per windowMs

// Database configuration
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'express_ts',
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Redis configuration
export const REDIS_CONFIG = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  ttl: 3600, // 1 hour
};

// Email configuration
export const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
  from: `"${process.env.EMAIL_FROM_NAME || 'App Name'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
};

// AWS configuration
export const AWS_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'us-east-1',
  s3: {
    bucket: process.env.AWS_S3_BUCKET || 'your-bucket-name',
  },
};

// Logging configuration
export const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');

// API configuration
export const API_PREFIX = '/api/v1';

// Export all config as default
export default {
  NODE_ENV,
  PORT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  DB_CONFIG,
  REDIS_CONFIG,
  EMAIL_CONFIG,
  AWS_CONFIG,
  LOG_LEVEL,
  API_PREFIX,
};
