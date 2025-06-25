import winston from 'winston';

const { combine, timestamp, json, errors, prettyPrint } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json(),
    prettyPrint()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ],
  exitOnError: false
});

// Create a stream for morgan to use with winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger, stream };
