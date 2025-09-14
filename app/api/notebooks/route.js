import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';

export async function POST(request) {
  try {
    const { title, description } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO notebooks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || '']
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating notebook:', error);
    return NextResponse.json({ error: 'Failed to create notebook' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

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

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching notebooks:', error);
    return NextResponse.json({ error: 'Failed to fetch notebooks' }, { status: 500 });
  }
}
