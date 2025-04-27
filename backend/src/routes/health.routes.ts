
import { Router } from 'express';
import * as HealthController from '../controllers/health.controller';

const router = Router();

// GET /api/health - Detailed health check
router.get('/', HealthController.healthCheck);

// GET /api/health/simple - Simple health check
router.get('/simple', HealthController.simpleHealthCheck);

export default router;
