
import { query } from '../db';
import { Ticket, CreateTicketDto, UpdateTicketDto } from '../types';

export const findAll = async (
  limit: number = 10,
  offset: number = 0,
  status?: string,
  priority?: string,
  assignee_id?: string
): Promise<{ tickets: Ticket[], total: number }> => {
  // Build the WHERE clause dynamically
  let whereConditions = [];
  const values = [];
  let valueIndex = 1;
  
  if (status) {
    whereConditions.push(`status = $${valueIndex++}`);
    values.push(status);
  }
  
  if (priority) {
    whereConditions.push(`priority = $${valueIndex++}`);
    values.push(priority);
  }
  
  if (assignee_id) {
    whereConditions.push(`assignee_id = $${valueIndex++}`);
    values.push(assignee_id);
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // Get total count
  const countQuery = `SELECT COUNT(*) FROM tickets ${whereClause}`;
  const countResult = await query(countQuery, values);
  const total = parseInt(countResult.rows[0].count, 10);
  
  // Get paginated tickets
  const paginatedValues = [...values, limit, offset];
  const ticketsQuery = `
    SELECT * FROM tickets 
    ${whereClause} 
    ORDER BY created_at DESC 
    LIMIT $${valueIndex++} OFFSET $${valueIndex++}
  `;
  
  const ticketsResult = await query(ticketsQuery, paginatedValues);
  
  return {
    tickets: ticketsResult.rows,
    total
  };
};

export const findById = async (id: string): Promise<Ticket | null> => {
  const result = await query('SELECT * FROM tickets WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const create = async (ticket: CreateTicketDto, reporter_id: string): Promise<Ticket> => {
  const result = await query(
    'INSERT INTO tickets (title, description, status, priority, assignee_id, reporter_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [ticket.title, ticket.description, ticket.status, ticket.priority, ticket.assignee_id, reporter_id]
  );
  
  return result.rows[0];
};

export const update = async (id: string, ticket: UpdateTicketDto): Promise<Ticket | null> => {
  // Build the SET part of the query dynamically based on provided fields
  let updateFields = [];
  const values = [];
  let valueIndex = 1;
  
  if (ticket.title !== undefined) {
    updateFields.push(`title = $${valueIndex++}`);
    values.push(ticket.title);
  }
  
  if (ticket.description !== undefined) {
    updateFields.push(`description = $${valueIndex++}`);
    values.push(ticket.description);
  }
  
  if (ticket.status !== undefined) {
    updateFields.push(`status = $${valueIndex++}`);
    values.push(ticket.status);
  }
  
  if (ticket.priority !== undefined) {
    updateFields.push(`priority = $${valueIndex++}`);
    values.push(ticket.priority);
  }
  
  // Handle null assignee_id case explicitly
  if ('assignee_id' in ticket) {
    updateFields.push(`assignee_id = $${valueIndex++}`);
    values.push(ticket.assignee_id);
  }
  
  if (ticket.ai_suggestion !== undefined) {
    updateFields.push(`ai_suggestion = $${valueIndex++}`);
    values.push(ticket.ai_suggestion);
  }
  
  // If no fields to update
  if (updateFields.length === 0) {
    return findById(id);
  }
  
  // Add id to values
  values.push(id);
  
  const result = await query(
    `UPDATE tickets SET ${updateFields.join(', ')} WHERE id = $${valueIndex} RETURNING *`,
    values
  );
  
  return result.rows[0] || null;
};

export const remove = async (id: string): Promise<boolean> => {
  const result = await query('DELETE FROM tickets WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
};

export const findTicketsByReporterId = async (
  reporter_id: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ tickets: Ticket[], total: number }> => {
  const countResult = await query('SELECT COUNT(*) FROM tickets WHERE reporter_id = $1', [reporter_id]);
  const total = parseInt(countResult.rows[0].count, 10);
  
  const ticketsResult = await query(
    'SELECT * FROM tickets WHERE reporter_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [reporter_id, limit, offset]
  );
  
  return {
    tickets: ticketsResult.rows,
    total
  };
};

export const findTicketsByAssigneeId = async (
  assignee_id: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ tickets: Ticket[], total: number }> => {
  const countResult = await query('SELECT COUNT(*) FROM tickets WHERE assignee_id = $1', [assignee_id]);
  const total = parseInt(countResult.rows[0].count, 10);
  
  const ticketsResult = await query(
    'SELECT * FROM tickets WHERE assignee_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [assignee_id, limit, offset]
  );
  
  return {
    tickets: ticketsResult.rows,
    total
  };
};

export const getTicketsStats = async (): Promise<{ status: Record<string, number>, priority: Record<string, number> }> => {
  // Get counts by status
  const statusResult = await query(`
    SELECT status, COUNT(*) 
    FROM tickets 
    GROUP BY status
  `);
  
  // Get counts by priority
  const priorityResult = await query(`
    SELECT priority, COUNT(*) 
    FROM tickets 
    GROUP BY priority
  `);
  
  // Convert results to record objects
  const statusCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};
  
  statusResult.rows.forEach(row => {
    statusCounts[row.status] = parseInt(row.count, 10);
  });
  
  priorityResult.rows.forEach(row => {
    priorityCounts[row.priority] = parseInt(row.count, 10);
  });
  
  return {
    status: statusCounts,
    priority: priorityCounts
  };
};
