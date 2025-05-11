import { Request, Response, NextFunction } from 'express';
import { register, collectDefaultMetrics } from 'prom-client';

// Initialize default metrics
collectDefaultMetrics();

// Metrics endpoint
export const metricsController = {
  // Get metrics
  getMetrics: async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  },

  // Clear metrics
  clearMetrics: async (req: Request, res: Response, next: NextFunction) => {
    register.clear();
    res.json({ message: 'Metrics cleared' });
  }
};
