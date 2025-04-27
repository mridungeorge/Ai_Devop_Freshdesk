
import { Request, Response } from 'express';
import * as UserModel from '../models/user.model';
import { comparePasswords, generateToken } from '../utils/auth';
import { logger } from '../utils/logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Check if user exists
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Return user info and token
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      message: 'An error occurred during login'
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Name, email, password and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = await UserModel.create({
      name,
      email,
      password,
      role,
      avatar: req.body.avatar
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    // Return user info and token
    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      },
      token
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      message: 'An error occurred during registration'
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving the profile'
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required'
      });
    }

    // Check if current password is correct
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await UserModel.updatePassword(req.user.id, newPassword);

    return res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Update password error:', error);
    return res.status(500).json({
      message: 'An error occurred while updating the password'
    });
  }
};
