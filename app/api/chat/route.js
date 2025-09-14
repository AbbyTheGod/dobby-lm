import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { generateEmbedding, formatCitations } from '../../../lib/text-processing.js';
import { callFireworksAPI, createChatPrompt } from '../../../lib/fireworks.js';

export async function POST(request) {
  try {
    const { notebookId, message, topK = 5 } = await request.json();

    if (!notebookId || !message) {
      return NextResponse.json({ error: 'Notebook ID and message are required' }, { status: 400 });
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(message);

    // Find similar chunks using cosine similarity
    const chunksResult = await query(
      `SELECT c.*, s.title as source_title, s.type as source_type
       FROM chunks c
       JOIN sources s ON c.source_id = s.id
       WHERE s.notebook_id = $1
       ORDER BY c.embedding <=> $2
       LIMIT $3`,
      [notebookId, JSON.stringify(queryEmbedding), topK]
    );

    console.log(`🔍 Found ${chunksResult.rows.length} relevant chunks for query: "${message}"`);

    if (chunksResult.rows.length === 0) {
      console.log('❌ No relevant chunks found - Dobby has no information to answer');
      return NextResponse.json({
        message: "I don't have any relevant information in the sources to answer your question.",
        citations: []
      });
    }

    // Prepare context and citations
    const context = chunksResult.rows.map((chunk, index) => {
      const sourceId = chunk.source_id.substring(0, 8);
      return `[Source ${index + 1} - ${chunk.source_title} (${chunk.source_type})]\n${chunk.content}`;
    }).join('\n\n');

    const citations = chunksResult.rows.map(chunk => ({
      source_id: chunk.source_id.substring(0, 8),
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      source_title: chunk.source_title
    }));

    const citationsText = formatCitations(citations);

    console.log(`📚 Using ${chunksResult.rows.length} chunks as context for Dobby`);
    console.log(`🔗 Citations: ${citationsText}`);

    // Create chat prompt
    const messages = createChatPrompt(message, context, citationsText);

    // Call Fireworks API
    console.log('🤖 Calling Fireworks API for Dobby response...');
    const aiResponse = await callFireworksAPI(messages);
    console.log(`✅ Dobby responded with ${aiResponse.length} characters`);

    // Save user message
    await query(
      'INSERT INTO messages (notebook_id, role, content) VALUES ($1, $2, $3)',
      [notebookId, 'user', message]
    );

    // Save assistant response
    const messageResult = await query(
      'INSERT INTO messages (notebook_id, role, content, citations) VALUES ($1, $2, $3, $4) RETURNING *',
      [notebookId, 'assistant', aiResponse, JSON.stringify(citations)]
    );

    return NextResponse.json({
      message: aiResponse,
      citations: citations,
      messageId: messageResult.rows[0].id
    });

  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
