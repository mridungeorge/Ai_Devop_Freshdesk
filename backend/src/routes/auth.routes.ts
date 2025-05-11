import express from 'express';
import { login, register, getProfile, updatePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/register - Register new user
router.post('/register', register);

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticate, getProfile);

// PUT /api/auth/password - Update password
router.put('/password', authenticate, updatePassword);

export default router;
