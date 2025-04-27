
import app from './app';
import config from './config';
import { logger } from './utils/logger';
import { checkConnection } from './db';

// Check database connection before starting the server
const startServer = async () => {
  try {
    // Wait for database connection
    await checkConnection();
    logger.info('Database connection established successfully');

    // Start Express server
    const server = app.listen(config.server.port, () => {
      logger.info(`Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);
      logger.info(`Health check available at http://localhost:${config.server.port}/api/health`);
    });

    // Handle server shutdown
    const handleShutdown = () => {
      logger.info('Received shutdown signal, closing server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Server close timeout, forcing shutdown');
        process.exit(1);
      }, 10000);
    };

    // Handle signals
    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
