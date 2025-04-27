
import { Pool, PoolConfig } from 'pg';
import { config } from '../config';

// Create a new Pool instance using the connection details from environment variables
const poolConfig: PoolConfig = {
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  // Connection timeout - time to wait for a connection to become available
  connectionTimeoutMillis: 0,
  // Idle timeout - time a connection can stay idle in the pool
  idleTimeoutMillis: 30000,
  // Maximum number of clients the pool should contain
  max: 20
};

const pool = new Pool(poolConfig);

// Pool event listeners for better debugging and monitoring
pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
  // Don't exit process on connection errors - let the application handle them
});

// Export a function to get a client from the pool
export const query = async (text: string, params: any[] = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (over 100ms)
    if (duration > 100) {
      console.log('Slow query:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Function to check database connection
export const checkConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    return res.rows[0];
  } catch (error) {
    console.error('Database connection check failed:', error);
    throw error;
  }
};

export default pool;
