import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';

export async function POST(request) {
  try {
    console.log('🚀 Initializing database schema...');
    
    // Enable pgvector extension
    await query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✅ pgvector extension enabled');
    
    // Create notebooks table
    await query(`
      CREATE TABLE IF NOT EXISTS notebooks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ notebooks table created');
    
    // Create sources table
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
    console.log('✅ sources table created');
    
    // Create chunks table with vector embeddings
    await query(`
      CREATE TABLE IF NOT EXISTS chunks (
        id SERIAL PRIMARY KEY,
        source_id INTEGER REFERENCES sources(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        embedding vector(384),
        chunk_index INTEGER NOT NULL,
        token_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ chunks table created');
    
    // Create messages table
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
    console.log('✅ messages table created');
    
    // Create study_tools table
    await query(`
      CREATE TABLE IF NOT EXISTS study_tools (
        id SERIAL PRIMARY KEY,
        notebook_id INTEGER REFERENCES notebooks(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ study_tools table created');
    
    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops);');
    await query('CREATE INDEX IF NOT EXISTS idx_sources_notebook_id ON sources(notebook_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_chunks_source_id ON chunks(source_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_notebook_id ON messages(notebook_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_study_tools_notebook_id ON study_tools(notebook_id);');
    console.log('✅ Database indexes created');
    
    console.log('🎉 Database initialization completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return NextResponse.json({ 
      error: 'Database initialization failed',
      details: error.message 
    }, { status: 500 });
  }
}
