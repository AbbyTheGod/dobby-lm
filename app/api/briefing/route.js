import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { callFireworksAPI, createSummaryPrompt } from '../../../lib/fireworks.js';

export async function POST(request) {
  try {
    const { notebookId, type = 'briefing', title } = await request.json();

    if (!notebookId) {
      return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });
    }

    // Get all chunks from the notebook
    const chunksResult = await query(
      `SELECT c.*, s.title as source_title
       FROM chunks c
       JOIN sources s ON c.source_id = s.id
       WHERE s.notebook_id = $1
       ORDER BY s.created_at, c.chunk_index`,
      [notebookId]
    );

    console.log(`📊 Briefing API: Found ${chunksResult.rows.length} chunks for notebook ${notebookId}`);

    if (chunksResult.rows.length === 0) {
      console.log('❌ Briefing API: No content found in notebook');
      return NextResponse.json({ error: 'No content found in notebook' }, { status: 400 });
    }

    // Prepare content for summary generation
    const content = chunksResult.rows.map((chunk, index) => {
      const sourceId = chunk.source_id.substring(0, 8);
      return `[Source ${index + 1} - ${chunk.source_title}]\n${chunk.content}`;
    }).join('\n\n');

    // Create summary prompt
    const messages = createSummaryPrompt(content, type);

    // Call Fireworks API
    console.log('🤖 Briefing API: Calling Fireworks API for summary generation...');
    const aiResponse = await callFireworksAPI(messages, { maxTokens: 2000 });
    console.log(`✅ Briefing API: Generated summary with ${aiResponse.length} characters`);

    // Save briefing to database
    const result = await query(
      `INSERT INTO study_tools (notebook_id, type, title, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [notebookId, 'briefing', title || `${type.charAt(0).toUpperCase() + type.slice(1)} Summary`, JSON.stringify({ content: aiResponse, type })]
    );

    return NextResponse.json({
      id: result.rows[0].id,
      title: result.rows[0].title,
      content: aiResponse,
      type: type,
      createdAt: result.rows[0].created_at
    });

  } catch (error) {
    console.error('Error generating briefing:', error);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const notebookId = searchParams.get('notebookId');

    if (!notebookId) {
      return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });
    }

    const result = await query(
      'SELECT * FROM study_tools WHERE notebook_id = $1 AND type = $2 ORDER BY created_at DESC',
      [notebookId, 'briefing']
    );

    const briefings = result.rows.map(row => {
      let parsed = {};
      try {
        parsed = JSON.parse(row.content);
      } catch (parseError) {
        console.error(`Error parsing briefing for id ${row.id}:`, parseError);
        parsed = { content: row.content };
      }
      return {
        id: row.id,
        title: row.title,
        content: parsed.content || '',
        type: parsed.type,
        createdAt: row.created_at
      };
    });

    return NextResponse.json(briefings);

  } catch (error) {
    console.error('Error fetching briefings:', error);
    return NextResponse.json({ error: 'Failed to fetch briefings' }, { status: 500 });
  }
}
