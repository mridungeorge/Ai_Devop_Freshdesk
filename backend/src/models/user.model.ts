
import { query } from '../db';
import { User, CreateUserDto, AuthUser } from '../types';
import { hashPassword } from '../utils/auth';

export const findAll = async (): Promise<User[]> => {
  const result = await query('SELECT id, name, email, role, avatar, created_at FROM users');
  return result.rows;
};

export const findById = async (id: string): Promise<User | null> => {
  const result = await query('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const findByEmail = async (email: string): Promise<AuthUser | null> => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const create = async (user: CreateUserDto): Promise<User> => {
  const hashedPassword = await hashPassword(user.password);
  
  const result = await query(
    'INSERT INTO users (name, email, password, role, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, avatar, created_at',
    [user.name, user.email, hashedPassword, user.role, user.avatar]
  );
  
  return result.rows[0];
};

export const update = async (id: string, user: Partial<User>): Promise<User | null> => {
  const { name, email, role, avatar } = user;
  
  // Build the SET part of the query dynamically based on provided fields
  let updateFields = [];
  const values = [];
  let valueIndex = 1;
  
  if (name !== undefined) {
    updateFields.push(`name = $${valueIndex++}`);
    values.push(name);
  }
  
  if (email !== undefined) {
    updateFields.push(`email = $${valueIndex++}`);
    values.push(email);
  }
  
  if (role !== undefined) {
    updateFields.push(`role = $${valueIndex++}`);
    values.push(role);
  }
  
  if (avatar !== undefined) {
    updateFields.push(`avatar = $${valueIndex++}`);
    values.push(avatar);
  }
  
  // If no fields to update
  if (updateFields.length === 0) {
    return findById(id);
  }
  
  // Add id to values
  values.push(id);
  
  const result = await query(
    `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${valueIndex} RETURNING id, name, email, role, avatar, created_at`,
    values
  );
  
  return result.rows[0] || null;
};

export const remove = async (id: string): Promise<boolean> => {
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
};

export const updatePassword = async (id: string, password: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password);
  const result = await query('UPDATE users SET password = $1 WHERE id = $2 RETURNING id', [hashedPassword, id]);
  return result.rowCount > 0;
};
