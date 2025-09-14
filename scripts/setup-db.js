import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Enable pgvector extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✓ pgvector extension enabled');

    // Create notebooks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notebooks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ notebooks table created');

    // Create sources table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('pdf', 'text', 'url')),
        content TEXT,
        url VARCHAR(500),
        file_path VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ sources table created');

    // Create chunks table with vector embeddings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        token_count INTEGER,
        embedding VECTOR(384), -- bge-small-en embedding dimension
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ chunks table created');

    // Create index for vector similarity search
    await pool.query(`
      CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks 
      USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    `);
    console.log('✓ vector index created');

    // Create messages table for chat history
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        citations JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ messages table created');

    // Create study_tools table for flashcards, quizzes, and briefings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS study_tools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('flashcards', 'quiz', 'briefing')),
        title VARCHAR(255) NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ study_tools table created');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS sources_notebook_id_idx ON sources(notebook_id);
      CREATE INDEX IF NOT EXISTS chunks_source_id_idx ON chunks(source_id);
      CREATE INDEX IF NOT EXISTS messages_notebook_id_idx ON messages(notebook_id);
      CREATE INDEX IF NOT EXISTS study_tools_notebook_id_idx ON study_tools(notebook_id);
    `);
    console.log('✓ performance indexes created');

    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
