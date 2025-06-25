import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user.model';
import { ApiError, isApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    throw ApiError.internal('Failed to get users');
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id, {
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
    logger.error(`Get user ${req.params.id} error:`, error);
    
    if (isApiError(error)) {
      throw error;
    }
    
    throw ApiError.internal('Failed to get user');
  }
};

/**
 * @desc    Create user
 * @route   POST /api/v1/users
 * @access  Private/Admin
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest('Validation Error', errors.array());
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw ApiError.badRequest('User already exists with this email');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    logger.error('Create user error:', error);
    
    if (isApiError(error)) {
      throw error;
    }
    
    throw ApiError.internal('Failed to create user');
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const { name, email, role } = req.body;

    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
    });

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
    logger.error(`Update user ${req.params.id} error:`, error);
    
    if (isApiError(error)) {
      throw error;
    }
    
    throw ApiError.internal('Failed to update user');
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Prevent deleting self
    if (user.id === (req as any).user.id) {
      throw ApiError.badRequest('Cannot delete your own account');
    }

    await user.destroy();

    res.status(200).json({
      status: 'success',
      data: {},
    });
  } catch (error) {
    logger.error(`Delete user ${req.params.id} error:`, error);
    
    if (isApiError(error)) {
      throw error;
    }
    
    throw ApiError.internal('Failed to delete user');
  }
};
