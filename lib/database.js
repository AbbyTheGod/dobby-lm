import { Pool } from 'pg';

let pool;

function getPool() {
  // PostgreSQL is disabled - always use mock database
  throw new Error('PostgreSQL is disabled. Using mock database instead.');
}

async function query(text, params) {
  // Always use mock database for now to avoid PostgreSQL connection issues
  console.log('🔧 Using mock database for testing');
  const { query: mockQuery } = await import('./mock-database.js');
  return await mockQuery(text, params);
  
  // TODO: Re-enable PostgreSQL when properly configured
  /*
  // Use mock database if PostgreSQL connection failed or not configured
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password') || process.env.DATABASE_URL.includes('your_')) {
    console.log('🔧 Using mock database for testing');
    const { query: mockQuery } = require('./mock-database');
    return await mockQuery(text, params);
  }
  
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    console.log('🔧 Falling back to mock database');
    const { query: mockQuery } = require('./mock-database');
    return await mockQuery(text, params);
  }
  */
}

async function getClient() {
  // PostgreSQL is disabled - always use mock database
  throw new Error('PostgreSQL is disabled. Using mock database instead.');
}

export {
  query,
  getClient,
  getPool,
};
