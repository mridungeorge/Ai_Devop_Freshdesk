
import { Request, Response } from 'express';
import * as TicketModel from '../models/ticket.model';
import * as UserModel from '../models/user.model';
import { logger } from '../utils/logger';

export const getAllTickets = async (req: Request, res: Response) => {
  try {
    // Parse pagination parameters
    const limit = parseInt(req.query.limit as string || '10', 10);
    const page = parseInt(req.query.page as string || '1', 10);
    const offset = (page - 1) * limit;
    
    // Parse filter parameters
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const assignee_id = req.query.assignee_id as string;
    
    const { tickets, total } = await TicketModel.findAll(
      limit,
      offset,
      status,
      priority,
      assignee_id
    );
    
    return res.status(200).json({
      tickets,
      pagination: {
        total,
        limit,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get all tickets error:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving tickets'
    });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const ticket = await TicketModel.findById(id);
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found'
      });
    }
    
    return res.status(200).json(ticket);
  } catch (error) {
    logger.error('Get ticket by ID error:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving the ticket'
    });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { title, description, status, priority, assignee_id } = req.body;
    
    // Validate required fields
    if (!title || !description || !status || !priority) {
      return res.status(400).json({
        message: 'Title, description, status and priority are required'
      });
    }
    
    // If assignee_id is provided, check if user exists
    if (assignee_id) {
      const assignee = await UserModel.findById(assignee_id);
      if (!assignee) {
        return res.status(404).json({
          message: 'Assignee not found'
        });
      }
    }
    
    // Create ticket
    const ticket = await TicketModel.create(
      {
        title,
        description,
        status,
        priority,
        assignee_id
      },
      req.user.id
    );
    
    return res.status(201).json(ticket);
  } catch (error) {
    logger.error('Create ticket error:', error);
    return res.status(500).json({
      message: 'An error occurred while creating the ticket'
    });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if ticket exists
    const existingTicket = await TicketModel.findById(id);
    if (!existingTicket) {
      return res.status(404).json({
        message: 'Ticket not found'
      });
    }
    
    // If assignee_id is provided, check if user exists
    if ('assignee_id' in req.body && req.body.assignee_id) {
      const assignee = await UserModel.findById(req.body.assignee_id);
      if (!assignee) {
        return res.status(404).json({
          message: 'Assignee not found'
        });
      }
    }
    
    // Update ticket
    const ticket = await TicketModel.update(id, req.body);
    
    return res.status(200).json(ticket);
  } catch (error) {
    logger.error('Update ticket error:', error);
    return res.status(500).json({
      message: 'An error occurred while updating the ticket'
    });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if ticket exists
    const existingTicket = await TicketModel.findById(id);
    if (!existingTicket) {
      return res.status(404).json({
        message: 'Ticket not found'
      });
    }
    
    // Check if user has permission to delete this ticket
    if (req.user && req.user.role !== 'Admin' && existingTicket.reporter_id !== req.user.id) {
      return res.status(403).json({
        message: 'You do not have permission to delete this ticket'
      });
    }
    
    // Delete ticket
    await TicketModel.remove(id);
    
    return res.status(200).json({
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    logger.error('Delete ticket error:', error);
    return res.status(500).json({
      message: 'An error occurred while deleting the ticket'
    });
  }
};

export const getUserTickets = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { type } = req.query;
    
    // Parse pagination parameters
    const limit = parseInt(req.query.limit as string || '10', 10);
    const page = parseInt(req.query.page as string || '1', 10);
    const offset = (page - 1) * limit;
    
    let result;
    
    if (type === 'assigned') {
      result = await TicketModel.findTicketsByAssigneeId(req.user.id, limit, offset);
    } else {
      result = await TicketModel.findTicketsByReporterId(req.user.id, limit, offset);
    }
    
    return res.status(200).json({
      tickets: result.tickets,
      pagination: {
        total: result.total,
        limit,
        page,
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    logger.error('Get user tickets error:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving tickets'
    });
  }
};

export const getTicketStats = async (req: Request, res: Response) => {
  try {
    const stats = await TicketModel.getTicketsStats();
    return res.status(200).json(stats);
  } catch (error) {
    logger.error('Get ticket stats error:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving ticket statistics'
    });
  }
};
