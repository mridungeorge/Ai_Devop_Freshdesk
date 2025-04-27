
import { Request, Response } from 'express';
import { checkConnection } from '../db';
import config from '../config';

export const healthCheck = async (_req: Request, res: Response) => {
  try {
    // Check database connection
    const dbResult = await checkConnection();
    
    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.nodeEnv,
      services: {
        database: {
          status: 'healthy',
          timestamp: dbResult.now
        }
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.nodeEnv,
      services: {
        database: {
          status: 'unhealthy',
          error: (error as Error).message
        }
      }
    });
  }
};

export const simpleHealthCheck = (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'OK' });
};
