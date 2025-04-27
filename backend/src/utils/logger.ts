
import winston from 'winston';
import config from '../config';

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ticket-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, service, ...rest }) => 
            `${timestamp} [${service}] ${level}: ${message} ${Object.keys(rest).length ? JSON.stringify(rest) : ''}`
        )
      )
    })
  ]
});

// Create a stream object with a write function that will be used by morgan
const stream = {
  write: (message: string) => {
    // Remove the new line character
    logger.info(message.trim());
  }
};

export { logger, stream };
