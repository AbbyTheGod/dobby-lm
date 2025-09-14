import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { callFireworksAPI, createQuizPrompt } from '../../../lib/fireworks.js';
import { initializeDatabase } from '../../../scripts/init-db.js';

export async function POST(request) {
  try {
    const { notebookId, title = 'Quiz', questionCount = 10 } = await request.json();

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

    console.log(`📊 Quiz API: Found ${chunksResult.rows.length} chunks for notebook ${notebookId}`);

    if (chunksResult.rows.length === 0) {
      console.log('❌ Quiz API: No content found in notebook');
      return NextResponse.json({ error: 'No content found in notebook' }, { status: 400 });
    }

    // Prepare content for quiz generation
    const content = chunksResult.rows.map((chunk, index) => {
      const sourceId = chunk.source_id.substring(0, 8);
      return `[Source ${index + 1} - ${chunk.source_title}]\n${chunk.content}`;
    }).join('\n\n');

    // Create quiz prompt using the proper function
    const messages = createQuizPrompt(content);

    // Call Fireworks API
    console.log('🤖 Quiz API: Calling Fireworks API for quiz generation...');
    const aiResponse = await callFireworksAPI(messages, { maxTokens: 3000 });
    console.log(`✅ Quiz API: Generated quiz with ${aiResponse.length} characters`);

    // Parse JSON response
    let quiz;
    try {
      quiz = JSON.parse(aiResponse);
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error('Response does not contain questions array');
      }
    } catch (parseError) {
      console.error('Error parsing quiz JSON:', parseError);
      return NextResponse.json({ error: 'Failed to generate valid quiz' }, { status: 500 });
    }

    // Save quiz to database
    const result = await query(
      `INSERT INTO study_tools (notebook_id, type, title, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [notebookId, 'quiz', title, JSON.stringify(quiz)]
    );

    return NextResponse.json({
      id: result.rows[0].id,
      title: result.rows[0].title,
      quiz: quiz,
      createdAt: result.rows[0].created_at
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
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
      [notebookId, 'quiz']
    );

    const quizzes = result.rows.map(row => {
      let quiz;
      try {
        quiz = JSON.parse(row.content);
        if (!quiz || !Array.isArray(quiz.questions)) {
          throw new Error('Quiz content does not contain questions array');
        }
      } catch (parseError) {
        console.error(`Error parsing quiz for id ${row.id}:`, parseError);
        quiz = { questions: [] };
      }
      return {
        id: row.id,
        title: row.title,
        quiz,
        createdAt: row.created_at
      };
    });

    return NextResponse.json(quizzes);

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
