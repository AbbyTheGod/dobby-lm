import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { callFireworksAPI, createFlashcardPrompt } from '../../../lib/fireworks.js';
import { initializeDatabase } from '../../../scripts/init-db.js';

export async function POST(request) {
  try {
    const { notebookId, title = 'Flashcards' } = await request.json();

    if (!notebookId) {
      return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });
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

    // Get all chunks from the notebook
    const chunksResult = await query(
      `SELECT c.*, s.title as source_title
       FROM chunks c
       JOIN sources s ON c.source_id = s.id
       WHERE s.notebook_id = $1
       ORDER BY s.created_at, c.chunk_index`,
      [notebookId]
    );

    console.log(`📊 Flashcards API: Found ${chunksResult.rows.length} chunks for notebook ${notebookId}`);

    if (chunksResult.rows.length === 0) {
      console.log('❌ Flashcards API: No content found in notebook');
      return NextResponse.json({ error: 'No content found in notebook' }, { status: 400 });
    }

    // Prepare content for flashcard generation
    const content = chunksResult.rows.map((chunk, index) => {
      const sourceId = chunk.source_id.substring(0, 8);
      return `[Source ${index + 1} - ${chunk.source_title}]\n${chunk.content}`;
    }).join('\n\n');

    // Create flashcard prompt
    const messages = createFlashcardPrompt(content);

    // Call Fireworks API
    console.log('🤖 Flashcards API: Calling Fireworks API for flashcard generation...');
    console.log('🔧 Flashcards API: Messages being sent:', JSON.stringify(messages, null, 2));
    let aiResponse;
    try {
      aiResponse = await callFireworksAPI(messages, { maxTokens: 2000 });
      console.log(`✅ Flashcards API: Generated flashcards with ${aiResponse.length} characters`);
      console.log('🔧 Flashcards API: Raw response:', aiResponse.substring(0, 200) + '...');
    } catch (fireworksError) {
      console.error('❌ Flashcards API: Fireworks API error:', fireworksError);
      console.error('❌ Flashcards API: Error details:', {
        message: fireworksError.message,
        stack: fireworksError.stack,
        response: fireworksError.response?.data
      });
      return NextResponse.json({ 
        error: 'Failed to generate flashcards - AI service unavailable',
        details: fireworksError.message 
      }, { status: 500 });
    }

    // Parse JSON response
    let flashcards;
    try {
      flashcards = JSON.parse(aiResponse);
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Error parsing flashcards JSON:', parseError);
      return NextResponse.json({ error: 'Failed to generate valid flashcards' }, { status: 500 });
    }

    // Save flashcards to database
    const result = await query(
      `INSERT INTO study_tools (notebook_id, type, title, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [notebookId, 'flashcards', title, JSON.stringify(flashcards)]
    );

    return NextResponse.json({
      id: result.rows[0].id,
      title: result.rows[0].title,
      flashcards: flashcards,
      createdAt: result.rows[0].created_at
    });

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const notebookId = searchParams.get('notebookId');

    if (!notebookId) {
      return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });
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
      'SELECT * FROM study_tools WHERE notebook_id = $1 AND type = $2 ORDER BY created_at DESC',
      [notebookId, 'flashcards']
    );

    const flashcards = result.rows.map(row => {
      let cards = [];
      try {
        cards = JSON.parse(row.content);
        if (!Array.isArray(cards)) {
          throw new Error('Flashcards content is not an array');
        }
      } catch (parseError) {
        console.error(`Error parsing flashcards for id ${row.id}:`, parseError);
        cards = [];
      }
      return {
        id: row.id,
        title: row.title,
        flashcards: cards,
        createdAt: row.created_at
      };
    });

    return NextResponse.json(flashcards);

  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}
