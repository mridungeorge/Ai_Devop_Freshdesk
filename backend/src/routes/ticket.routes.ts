
import { Router } from 'express';
import * as TicketController from '../controllers/ticket.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/tickets - Get all tickets
router.get('/', TicketController.getAllTickets);

// POST /api/tickets - Create a new ticket
router.post('/', TicketController.createTicket);

// GET /api/tickets/me - Get tickets for current user
router.get('/me', TicketController.getUserTickets);

// GET /api/tickets/stats - Get ticket statistics (Admin only)
router.get('/stats', authorize(['Admin']), TicketController.getTicketStats);

// GET /api/tickets/:id - Get ticket by ID
router.get('/:id', TicketController.getTicketById);

// PUT /api/tickets/:id - Update ticket
router.put('/:id', TicketController.updateTicket);

// DELETE /api/tickets/:id - Delete ticket
router.delete('/:id', TicketController.deleteTicket);

export default router;
