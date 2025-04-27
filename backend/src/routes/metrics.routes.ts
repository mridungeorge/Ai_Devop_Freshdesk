
import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';

const router = Router();

router.get('/', metricsController.getMetrics);

export default router;
