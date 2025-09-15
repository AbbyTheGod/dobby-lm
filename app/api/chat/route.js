import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { generateEmbedding, formatCitations } from '../../../lib/text-processing.js';
import { callFireworksAPI, createChatPrompt } from '../../../lib/fireworks.js';
import { initializeDatabase } from '../../../scripts/init-db.js';

export async function POST(request) {
  try {
    const { notebookId, message, topK = 5 } = await request.json();

    if (!notebookId || !message) {
      return NextResponse.json({ error: 'Notebook ID and message are required' }, { status: 400 });
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
    
    // Debug: Check total chunks in database
    const allChunks = await query('SELECT * FROM chunks');
    console.log(`🔍 Debug: Total chunks in database: ${allChunks.rows.length}`);
    
    // Debug: Check chunks for this notebook
    const notebookChunks = await query('SELECT c.*, s.notebook_id FROM chunks c JOIN sources s ON c.source_id = s.id WHERE s.notebook_id = $1', [notebookId]);
    console.log(`🔍 Debug: Chunks for notebook ${notebookId}: ${notebookChunks.rows.length}`);

    if (chunksResult.rows.length === 0) {
      console.log('❌ No relevant chunks found - Dobby has no information to answer');
      return NextResponse.json({
        message: `I don't have any information to answer your question. This could be because:

• No sources have been uploaded yet
• The uploaded sites are not supported for scraping
• The sources failed to process properly

**Supported sites include:**
• Wikipedia articles
• News websites (BBC, CNN, Reuters)
• Blog posts and articles
• Documentation sites
• Educational content

**Not supported:**
• JavaScript-heavy sites (Binance, social media)
• Sites requiring login
• Video platforms (YouTube, TikTok)

Try uploading a supported website URL to get started!`,
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
    let aiResponse;
    try {
      aiResponse = await callFireworksAPI(messages);
      console.log(`✅ Dobby responded with ${aiResponse.length} characters`);
      console.log('🔧 Chat API - Final response preview:', aiResponse.substring(0, 300));
    } catch (fireworksError) {
      console.error('❌ Fireworks API error:', fireworksError);
      // Return a fallback response if Fireworks API fails
      aiResponse = "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again later.";
    }

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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      notebookId
    });
    return NextResponse.json({ 
      error: 'Failed to process chat message',
      details: error.message 
    }, { status: 500 });
  }
}
