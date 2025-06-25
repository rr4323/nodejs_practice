import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { JWT_SECRET } from '../config';
import { ApiError } from '../utils/apiError';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace 'any' with your User type
    }
  }
}

/**
 * Protect routes - require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Get token from cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      throw ApiError.unauthorized('Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

      // Get user from the token
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      // Add user to request object
      req.user = user;

      next();
    } catch (error) {
      throw ApiError.unauthorized('Not authorized, token failed');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authorized to access this route');
      }

      if (!roles.includes(req.user.role)) {
        throw ApiError.forbidden(
          `User role ${req.user.role} is not authorized to access this route`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is the owner of the resource or admin
 */
export const checkOwnership = (model: any, paramName = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Skip if user is admin
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      const resource = await model.findByPk(req.params[paramName]);

      if (!resource) {
        throw ApiError.notFound('Resource not found');
      }

      // Check if user is the owner of the resource
      if (resource.userId.toString() !== req.user.id) {
        throw ApiError.forbidden('Not authorized to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is the owner of the resource or admin (for user resources)
 */
export const checkUserOwnership = (paramName = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Skip if user is admin
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      // Check if the requested user ID matches the authenticated user's ID
      if (req.params[paramName] !== req.user.id) {
        throw ApiError.forbidden('Not authorized to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
