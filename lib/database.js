// Production PostgreSQL database connection for Vercel deployment
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function query(text, params = []) {
  console.log('🔧 PostgreSQL Query:', text);
  console.log('🔧 Query params:', params);
  
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export { query };