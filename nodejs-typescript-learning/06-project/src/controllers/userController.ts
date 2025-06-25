import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export const getAllUsers = (req: Request, res: Response) => {
  const users = userService.getAllUsers();
  res.json(users);
};

export const getUserById = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = userService.getUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const newUser = userService.createUser(name, email);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const updateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const updatedUser = userService.updateUser(id, name, email);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const success = userService.deleteUser(id);
    if (success) {
      res.status(204).send(); // No Content
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};
