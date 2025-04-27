
import { Router } from 'express';
import * as CommentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/tickets/:ticketId/comments - Get comments for a ticket
router.get('/:ticketId/comments', CommentController.getTicketComments);

// POST /api/tickets/:ticketId/comments - Create a comment for a ticket
router.post('/:ticketId/comments', CommentController.createComment);

// PUT /api/comments/:commentId - Update comment
router.put('/comments/:commentId', CommentController.updateComment);

// DELETE /api/comments/:commentId - Delete comment
router.delete('/comments/:commentId', CommentController.deleteComment);

export default router;
