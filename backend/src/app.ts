
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import { stream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import ticketRoutes from './routes/ticket.routes';
import commentRoutes from './routes/comment.routes';
import healthRoutes from './routes/health.routes';

// Create Express app
const app = express();

// Middleware
app.use(cors(config.server.cors));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { stream }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', commentRoutes);
app.use('/api/health', healthRoutes);

// Health check endpoint
app.get('/api/health/simple', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Handle 404 errors
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

export default app;
