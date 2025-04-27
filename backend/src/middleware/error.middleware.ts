
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '📦' : err.stack
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
