import jwt, { JwtPayload, Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config';
import { UserSession } from '../types';

export const generateToken = (user: UserSession): string => {
  const secret: Secret = config.jwt.secret;
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as any, algorithm: 'HS256' };
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    options
  );
};

export const verifyToken = (token: string): UserSession => {
  try {
    const secret: Secret = config.jwt.secret;
    const options: VerifyOptions = { algorithms: ['HS256'] };
    const decoded = jwt.verify(token, secret, options) as JwtPayload;
    return decoded as UserSession;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
