
import { query } from '../db';
import { Comment, CreateCommentDto } from '../types';

export const findByTicketId = async (
  ticket_id: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ comments: Comment[], total: number }> => {
  const countResult = await query(
    'SELECT COUNT(*) FROM comments WHERE ticket_id = $1',
    [ticket_id]
  );
  
  const total = parseInt(countResult.rows[0].count, 10);
  
  const result = await query(
    'SELECT * FROM comments WHERE ticket_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [ticket_id, limit, offset]
  );
  
  return {
    comments: result.rows,
    total
  };
};

export const findById = async (id: string): Promise<Comment | null> => {
  const result = await query('SELECT * FROM comments WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const create = async (
  ticket_id: string,
  comment: CreateCommentDto,
  author_id: string
): Promise<Comment> => {
  const result = await query(
    'INSERT INTO comments (ticket_id, content, author_id) VALUES ($1, $2, $3) RETURNING *',
    [ticket_id, comment.content, author_id]
  );
  
  return result.rows[0];
};

export const update = async (id: string, content: string): Promise<Comment | null> => {
  const result = await query(
    'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
    [content, id]
  );
  
  return result.rows[0] || null;
};

export const remove = async (id: string): Promise<boolean> => {
  const result = await query('DELETE FROM comments WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
};
