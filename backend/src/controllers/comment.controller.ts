
import { Request, Response } from 'express';
import * as CommentModel from '../models/comment.model';
import * as TicketModel from '../models/ticket.model';
import { logger } from '../utils/logger';

export const getTicketComments = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    
    // Check if ticket exists
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found'
      });
    }
    
    // Parse pagination parameters
    const limit = parseInt(req.query.limit as string || '10', 10);
    const page = parseInt(req.query.page as string || '1', 10);
    const offset = (page - 1) * limit;
    
    const { comments, total } = await CommentModel.findByTicketId(ticketId, limit, offset);
    
    return res.status(200).json({
      comments,
      pagination: {
        total,
        limit,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get ticket comments error:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving comments'
    });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { ticketId } = req.params;
    const { content } = req.body;
    
    // Validate content
    if (!content) {
      return res.status(400).json({
        message: 'Comment content is required'
      });
    }
    
    // Check if ticket exists
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found'
      });
    }
    
    // Create comment
    const comment = await CommentModel.create(
      ticketId,
      { content },
      req.user.id
    );
    
    return res.status(201).json(comment);
  } catch (error) {
    logger.error('Create comment error:', error);
    return res.status(500).json({
      message: 'An error occurred while creating the comment'
    });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { commentId } = req.params;
    const { content } = req.body;
    
    // Validate content
    if (!content) {
      return res.status(400).json({
        message: 'Comment content is required'
      });
    }
    
    // Check if comment exists
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found'
      });
    }
    
    // Check if user has permission to update this comment
    if (req.user.role !== 'Admin' && comment.author_id !== req.user.id) {
      return res.status(403).json({
        message: 'You do not have permission to update this comment'
      });
    }
    
    // Update comment
    const updatedComment = await CommentModel.update(commentId, content);
    
    return res.status(200).json(updatedComment);
  } catch (error) {
    logger.error('Update comment error:', error);
    return res.status(500).json({
      message: 'An error occurred while updating the comment'
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { commentId } = req.params;
    
    // Check if comment exists
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found'
      });
    }
    
    // Check if user has permission to delete this comment
    if (req.user.role !== 'Admin' && comment.author_id !== req.user.id) {
      return res.status(403).json({
        message: 'You do not have permission to delete this comment'
      });
    }
    
    // Delete comment
    await CommentModel.remove(commentId);
    
    return res.status(200).json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete comment error:', error);
    return res.status(500).json({
      message: 'An error occurred while deleting the comment'
    });
  }
};
