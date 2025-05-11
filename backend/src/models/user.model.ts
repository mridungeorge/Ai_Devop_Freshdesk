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
  let updateFields = [];
  const values = [];
  let valueIndex = 1;

  if (user.name !== undefined) {
    updateFields.push(`name = $${valueIndex++}`);
    values.push(user.name);
  }

  if (user.email !== undefined) {
    updateFields.push(`email = $${valueIndex++}`);
    values.push(user.email);
  }

  if (user.role !== undefined) {
    updateFields.push(`role = $${valueIndex++}`);
    values.push(user.role);
  }

  if (user.avatar !== undefined) {
    updateFields.push(`avatar = $${valueIndex++}`);
    values.push(user.avatar);
  }

  if (updateFields.length === 0) {
    return findById(id);
  }

  values.push(id);

  const result = await query(
    `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${valueIndex} RETURNING id, name, email, role, avatar, created_at`,
    values
  );

  return result.rows[0] || null;
};

export const remove = async (id: string): Promise<boolean> => {
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return result?.rowCount ? result.rowCount > 0 : false;
};

export const updatePassword = async (id: string, newPassword: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(newPassword);
  const result = await query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
    [hashedPassword, id]
  );
  return result?.rowCount ? result.rowCount > 0 : false;
};