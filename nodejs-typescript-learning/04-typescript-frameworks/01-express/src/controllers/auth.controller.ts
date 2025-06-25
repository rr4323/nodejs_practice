import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/user.model';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';
import { ApiError, isApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest('Validation Error', errors.array());
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw ApiError.badRequest('User already exists with this email');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    
    if (isApiError(error)) {
      throw error;
    }
    
    throw ApiError.internal('Registration failed');
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest('Validation Error', errors.array());
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    
    if (isApiError(error)) {
      throw error;
    }
    
    throw ApiError.internal('Login failed');
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findByPk((req as any).user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    
    if (isApiError(error)) {
      throw error;
    }
    
    throw ApiError.internal('Failed to get current user');
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/v1/auth/update-details
 * @access  Private
 */
export const updateDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByPk((req as any).user.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await user.update(fieldsToUpdate);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    logger.error('Update user details error:', error);
    
    if (isApiError(error)) {
      throw error;
    }
    
    throw ApiError.internal('Failed to update user details');
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/update-password
 * @access  Private
 */
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk((req as any).user.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check current password
    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();

    // Generate new token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'success',
      token,
      message: 'Password updated successfully',
    });
  } catch (error) {
    logger.error('Update password error:', error);
    
    if (isApiError(error)) {
      throw error;
    }
    
    throw ApiError.internal('Failed to update password');
  }
};
