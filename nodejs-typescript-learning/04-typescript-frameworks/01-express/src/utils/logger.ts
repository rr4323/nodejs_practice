import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import { TransformableInfo } from 'logform';
import { Request, Response } from 'express';
import { NODE_ENV, LOG_LEVEL } from '../config';

const { combine, timestamp, printf, colorize, json } = format;

// Custom log format for console
const consoleFormat = printf(({ level, message, timestamp, ...meta }: TransformableInfo) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  // Add metadata if it exists
  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta, null, 2)}`;
  }
  
  return log;
});

// Custom log format for files
const fileFormat = printf(({ level, message, timestamp, ...meta }: TransformableInfo) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...meta,
  });
});

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine if we're in development mode
const isDevelopment = NODE_ENV === 'development';

// Create the logger instance
const logger = createLogger({
  level: LOG_LEVEL || 'info',
  levels,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'express-app' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: fileFormat,
    }),
    // Write all logs with level 'info' and below to 'combined.log'
    new transports.File({ 
      filename: 'logs/combined.log',
      format: fileFormat,
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// If we're in development, log to the console as well
if (isDevelopment) {
  logger.add(new transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    ),
  }));
}

// Create a stream for Morgan to use with Winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

/**
 * Logs request details
 */
const logRequest = (req: Request, res: Response, next: () => void) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.http(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      query: Object.keys(req.query).length ? req.query : undefined,
      params: Object.keys(req.params).length ? req.params : undefined,
      // Don't log request body in production for security reasons
      ...(isDevelopment && { body: req.body }),
    });
  });
  
  next();
};

/**
 * Logs unhandled promise rejections
 */
const logUnhandledRejections = () => {
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', { reason });
    // Consider whether to exit the process here in production
    // process.exit(1);
  });
};

/**
 * Logs uncaught exceptions
 */
const logUncaughtExceptions = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error });
    // Consider whether to exit the process here in production
    // process.exit(1);
  });
};

export { 
  logger, 
  stream, 
  logRequest, 
  logUnhandledRejections, 
  logUncaughtExceptions 
};

export default logger;
