
import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login - Login user
router.post('/login', AuthController.login);

// POST /api/auth/register - Register new user
router.post('/register', AuthController.register);

// GET /api/auth/profile - Get user profile (protected)
router.get('/profile', authenticate, AuthController.getProfile);

// PUT /api/auth/password - Update user password (protected)
router.put('/password', authenticate, AuthController.updatePassword);

export default router;
