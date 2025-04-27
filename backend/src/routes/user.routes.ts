
import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected and require authentication
router.use(authenticate);

// GET /api/users - Get all users
router.get('/', UserController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', UserController.getUserById);

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id', authorize(['Admin']), UserController.updateUser);

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', authorize(['Admin']), UserController.deleteUser);

export default router;
