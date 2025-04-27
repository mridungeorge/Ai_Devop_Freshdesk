
import { Request, Response } from 'express';
import * as UserModel from '../models/user.model';
import { logger } from '../utils/logger';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.findAll();
    return res.status(200).json(users);
  } catch (error) {
    logger.error('Get all users error:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving users'
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    logger.error('Get user by ID error:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving the user'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar } = req.body;
    
    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // If email is being changed, check if it's already in use
    if (email && email !== existingUser.email) {
      const userWithEmail = await UserModel.findByEmail(email);
      if (userWithEmail) {
        return res.status(409).json({
          message: 'Email is already in use'
        });
      }
    }
    
    // Update user
    const updatedUser = await UserModel.update(id, {
      name,
      email,
      role,
      avatar
    });
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    logger.error('Update user error:', error);
    return res.status(500).json({
      message: 'An error occurred while updating the user'
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Check if user is trying to delete themselves
    if (req.user?.id === id) {
      return res.status(403).json({
        message: 'You cannot delete your own account'
      });
    }
    
    // Delete user
    await UserModel.remove(id);
    
    return res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    return res.status(500).json({
      message: 'An error occurred while deleting the user'
    });
  }
};
