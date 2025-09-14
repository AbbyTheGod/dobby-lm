import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { initializeDatabase } from '../../../scripts/init-db.js';

export async function POST(request) {
  try {
    const { title, description } = await request.json();
    
    console.log('📝 Creating notebook:', { title, description });
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Ensure all database tables exist
    try {
      await initializeDatabase();
    } catch (initError) {
      console.error('❌ Database initialization failed:', initError);
      return NextResponse.json({ 
        error: 'Database initialization failed',
        details: initError.message 
      }, { status: 500 });
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

    // Ensure all database tables exist
    try {
      await initializeDatabase();
    } catch (initError) {
      console.error('❌ Database initialization failed:', initError);
      return NextResponse.json({ 
        error: 'Database initialization failed',
        details: initError.message 
      }, { status: 500 });
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
