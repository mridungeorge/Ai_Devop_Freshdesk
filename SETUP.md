
# DevCompass: Development & Deployment Guide

## Project Overview

DevCompass is a complete ticket tracking system with a React frontend and Node.js/Express backend. The project follows a monorepo structure for easier development and deployment.

## Repository Structure

```
devcompass/
├── backend/              # Node.js/Express API
├── frontend/             # React/Vite frontend
├── docker-compose.yml    # Docker Compose configuration
└── .gitignore            # Git ignore file
```

## Getting Started

### Prerequisites

- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized development/deployment)
- Supabase account (for authentication and data storage)

### Local Development

#### Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Using Docker Compose

The easiest way to run the entire stack is with Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Environment Variables

### Frontend (.env)

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENABLE_AI_FEATURES=true
VITE_APP_VERSION=1.0.0
```

### Backend (.env)

```
PORT=8080
NODE_ENV=development
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=devuser
POSTGRES_PASSWORD=devpassword
POSTGRES_DB=ticketdb
DATABASE_URL=postgresql://devuser:devpassword@postgres:5432/ticketdb
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## API Documentation

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get current user profile (requires authentication)
- `PUT /api/auth/password` - Update password (requires authentication)

### Users

- `GET /api/users` - Get all users (requires authentication)
- `GET /api/users/:id` - Get user by ID (requires authentication)
- `PUT /api/users/:id` - Update user (requires admin)
- `DELETE /api/users/:id` - Delete user (requires admin)

### Tickets

- `GET /api/tickets` - Get all tickets (requires authentication)
- `GET /api/tickets/:id` - Get ticket by ID (requires authentication)
- `POST /api/tickets` - Create new ticket (requires authentication)
- `PUT /api/tickets/:id` - Update ticket (requires authentication)
- `DELETE /api/tickets/:id` - Delete ticket (requires authentication)

### Comments

- `GET /api/tickets/:ticketId/comments` - Get comments for ticket (requires authentication)
- `POST /api/tickets/:ticketId/comments` - Add comment to ticket (requires authentication)
- `PUT /api/comments/:commentId` - Update comment (requires authentication)
- `DELETE /api/comments/:commentId` - Delete comment (requires authentication)

### Health

- `GET /api/health` - Detailed health check
- `GET /api/health/simple` - Simple health check

## Deployment

### Prerequisites

- Docker and Docker Compose installed on the server
- Git for pulling updates

### Basic Deployment Steps

1. Clone the repository on your server:
   ```bash
   git clone https://your-repo-url/devcompass.git
   cd devcompass
   ```

2. Create `.env` files for both frontend and backend based on the `.env.example` files.

3. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

4. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api

### Production Considerations

- Set up a reverse proxy (like Nginx) in front of your containers
- Configure SSL certificates for HTTPS
- Set up CI/CD pipelines for automated testing and deployment
- Implement proper logging and monitoring
- Consider using container orchestration tools like Kubernetes for larger deployments
