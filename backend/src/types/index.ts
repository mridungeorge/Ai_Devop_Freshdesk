
// User-related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Developer' | 'Tester';
  avatar?: string;
  created_at: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Developer' | 'Tester';
  avatar?: string;
}

export interface AuthUser extends User {
  password: string;
}

export interface UserSession {
  id: string;
  email: string;
  role: string;
}

// Ticket-related types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee_id?: string;
  reporter_id: string;
  ai_suggestion?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee_id?: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: 'Open' | 'In Progress' | 'Review' | 'Done';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee_id?: string | null;
  ai_suggestion?: string;
}

// Comment-related types
export interface Comment {
  id: string;
  ticket_id: string;
  content: string;
  author_id: string;
  created_at: Date;
}

export interface CreateCommentDto {
  content: string;
}
