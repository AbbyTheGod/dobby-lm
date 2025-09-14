import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { callFireworksAPI, createQuizPrompt } from '../../../lib/fireworks';

export async function POST(request) {
  try {
    const { notebookId, title = 'Quiz', questionCount = 10 } = await request.json();

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

    if (chunksResult.rows.length === 0) {
      return NextResponse.json({ error: 'No content found in notebook' }, { status: 400 });
    }

    // Prepare content for quiz generation
    const content = chunksResult.rows.map((chunk, index) => {
      const sourceId = chunk.source_id.substring(0, 8);
      return `[Source ${index + 1} - ${chunk.source_title}]\n${chunk.content}`;
    }).join('\n\n');

    // Create quiz prompt with question count
    const prompt = `Create a quiz with approximately ${questionCount} questions from the following sources. Return a JSON object with "questions" array. Each question should have "type" (either "multiple_choice" or "short_answer"), "question", "options" (for multiple choice), and "answer". Include citations [S{source_id}:{chunk_index}] in answers.

Sources:
${content}

Return format:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct answer with citation [S{source_id}:{chunk_index}]"
    },
    {
      "type": "short_answer",
      "question": "Question text",
      "answer": "Answer with citation [S{source_id}:{chunk_index}]"
    }
  ]
}`;

    const messages = [
      { role: 'system', content: 'You are an expert at creating educational quizzes. Always return valid JSON.' },
      { role: 'user', content: prompt }
    ];

    // Call Fireworks API
    const aiResponse = await callFireworksAPI(messages, { maxTokens: 3000 });

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

    const result = await query(
      'SELECT * FROM study_tools WHERE notebook_id = $1 AND type = $2 ORDER BY created_at DESC',
      [notebookId, 'quiz']
    );

    const quizzes = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at
    }));

    return NextResponse.json(quizzes);

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
