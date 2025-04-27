
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config';
import { UserSession } from '../types';

export const generateToken = (user: UserSession): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  );
};

export const verifyToken = (token: string): UserSession => {
  try {
    return jwt.verify(token, config.jwt.secret) as UserSession;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
