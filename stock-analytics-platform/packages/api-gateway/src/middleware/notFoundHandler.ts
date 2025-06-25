import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to handle 404 Not Found errors
 * This should be the last middleware in the chain
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export default notFoundHandler;
