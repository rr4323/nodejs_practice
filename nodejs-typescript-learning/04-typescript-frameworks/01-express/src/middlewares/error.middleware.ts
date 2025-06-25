import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/apiError';
import { NODE_ENV } from '../config';

/**
 * Error handling middleware for Express
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Log the error
  logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${'statusCode' in err ? err.statusCode : 500}, Message:: ${err.message}`);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation Error',
      errors: (err as any).errors,
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Unauthorized',
    });
    return;
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle other types of errors
  const statusCode = 500;
  const message = NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Cannot ${req.method} ${req.path}`,
  });
};

/**
 * Async handler to wrap async/await route handlers and middleware
 * This eliminates the need for try/catch blocks in route handlers
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Error handler for unhandled promise rejections
 */
process.on('unhandledRejection', (reason: Error | any) => {
  logger.error(`Unhandled Rejection: ${reason.message || reason}`);
  throw new Error(reason.message || reason);
});

/**
 * Error handler for uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`, error);
  // Consider whether to exit the process here in production
  // process.exit(1);
});
