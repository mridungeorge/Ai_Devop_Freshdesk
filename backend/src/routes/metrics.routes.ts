import { Router } from 'express';
import client from 'prom-client';

const router = Router();

// Create a default metrics registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Expose the metrics endpoint
router.get('/', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export default router;
