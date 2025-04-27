
# DevCompass Backend

A complete Node.js/Express backend API for the DevCompass ticket tracking system.

## Features

- RESTful API with Express.js
- TypeScript for type safety
- PostgreSQL database integration
- JWT authentication
- Role-based authorization
- Docker support
- Health checks and API monitoring

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register a new user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/password` - Update password (protected)

### Users

- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Tickets

- `GET /api/tickets` - Get all tickets (protected)
- `POST /api/tickets` - Create a ticket (protected)
- `GET /api/tickets/me` - Get current user's tickets (protected)
- `GET /api/tickets/stats` - Get ticket statistics (Admin only)
- `GET /api/tickets/:id` - Get ticket by ID (protected)
- `PUT /api/tickets/:id` - Update ticket (protected)
- `DELETE /api/tickets/:id` - Delete ticket (protected)

### Comments

- `GET /api/tickets/:ticketId/comments` - Get comments for a ticket
- `POST /api/tickets/:ticketId/comments` - Add a comment to a ticket
- `PUT /api/comments/:commentId` - Update a comment
- `DELETE /api/comments/:commentId` - Delete a comment

### Health

- `GET /api/health` - Detailed health check
- `GET /api/health/simple` - Simple health check

## Project Structure

```
src/
  ├── controllers/      # Request handlers
  ├── models/           # Database models
  ├── routes/           # API routes
  ├── middleware/       # Express middleware
  ├── utils/            # Utility functions
  ├── db/               # Database connection and queries
  ├── config/           # Configuration
  ├── types/            # TypeScript type definitions
  ├── app.ts            # Express app setup
  └── server.ts         # Server entry point
```

## Docker Setup

The project includes Docker support for easy deployment:

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop containers
docker-compose down
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server with hot-reload
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=devuser
POSTGRES_PASSWORD=devpassword
POSTGRES_DB=ticketdb
DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/ticketdb

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```
