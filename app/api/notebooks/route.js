import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';

export async function POST(request) {
  try {
    const { title, description } = await request.json();
    
    console.log('📝 Creating notebook:', { title, description });
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Ensure tables exist before creating notebook
    try {
      await query('SELECT 1 FROM notebooks LIMIT 1');
    } catch (tableError) {
      console.log('⚠️ Tables might not exist, creating notebooks table...');
      await query(`
        CREATE TABLE IF NOT EXISTS notebooks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    const result = await query(
      'INSERT INTO notebooks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || '']
    );

    console.log('✅ Notebook created:', result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('❌ Error creating notebook:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    return NextResponse.json({ 
      error: 'Failed to create notebook',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    console.log('📚 Fetching notebooks...');
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // First, try to check if tables exist
    try {
      await query('SELECT 1 FROM notebooks LIMIT 1');
    } catch (tableError) {
      console.log('⚠️ Tables might not exist, initializing database...');
      // Try to create tables if they don't exist
      await query(`
        CREATE TABLE IF NOT EXISTS notebooks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS sources (
          id SERIAL PRIMARY KEY,
          notebook_id INTEGER REFERENCES notebooks(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          content TEXT,
          url VARCHAR(500),
          file_path VARCHAR(500),
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          notebook_id INTEGER REFERENCES notebooks(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL,
          content TEXT NOT NULL,
          citations JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Database tables created');
    }

    const result = await query(
      `SELECT n.*, 
              COUNT(s.id) as source_count,
              COUNT(m.id) as message_count
       FROM notebooks n
       LEFT JOIN sources s ON n.id = s.notebook_id
       LEFT JOIN messages m ON n.id = m.notebook_id
       GROUP BY n.id
       ORDER BY n.updated_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    console.log('✅ Notebooks fetched:', result.rows.length);
    // Ensure we always return an array
    const rows = Array.isArray(result.rows) ? result.rows : [];
    return NextResponse.json(rows);
  } catch (error) {
    console.error('❌ Error fetching notebooks:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    return NextResponse.json({ 
      error: 'Failed to fetch notebooks',
      details: error.message 
    }, { status: 500 });
  }
}
