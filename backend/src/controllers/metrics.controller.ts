
import { Request, Response } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import { logger } from '../utils/logger';

// Initialize metrics collection
collectDefaultMetrics();

// Create custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Metrics controller
const getMetrics = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
    logger.info('Metrics endpoint called');
  } catch (error) {
    logger.error('Error generating metrics', error);
    res.status(500).send('Error generating metrics');
  }
};

// Middleware to record HTTP metrics
const recordMetrics = (req: Request, res: Response, next: Function) => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  // Record response
  res.on('finish', () => {
    // Decrement active connections
    activeConnections.dec();
    
    // Record request
    const duration = Date.now() - start;
    httpRequestsTotal.inc({ 
      method: req.method, 
      path: req.path,
      status: res.statusCode 
    });
    
    httpRequestDurationMicroseconds.observe(
      { 
        method: req.method, 
        path: req.path,
        status: res.statusCode 
      },
      duration / 1000
    );
  });
  
  next();
};

export const metricsController = {
  getMetrics,
  recordMetrics
};
