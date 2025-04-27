
-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Developer', 'Tester')),
    avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Review', 'Done')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_suggestion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on ticket status and priority for faster filtering
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee_id ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter_id ON tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);

-- Create or replace function to update the "updated_at" column on tickets
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger for updated_at on tickets table
CREATE OR REPLACE TRIGGER update_tickets_modtime
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmrjDzPjG0FoxxXmLjL7VUDUrdSJC', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Insert some demo tickets
INSERT INTO tickets (title, description, status, priority, reporter_id)
SELECT 
    'Demo ticket ' || i,
    'This is a description for demo ticket ' || i,
    CASE (i % 4)
        WHEN 0 THEN 'Open'
        WHEN 1 THEN 'In Progress'
        WHEN 2 THEN 'Review'
        ELSE 'Done'
    END,
    CASE (i % 4)
        WHEN 0 THEN 'Low'
        WHEN 1 THEN 'Medium'
        WHEN 2 THEN 'High'
        ELSE 'Critical'
    END,
    (SELECT id FROM users WHERE email = 'admin@example.com')
FROM generate_series(1, 10) AS i
ON CONFLICT DO NOTHING;
