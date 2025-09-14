// Test script to verify database initialization
import { query } from '../lib/database.js';
import { initializeDatabase } from './init-db.js';

async function testDatabaseInitialization() {
  try {
    console.log('🧪 Testing database initialization...');
    
    // Run the initialization
    await initializeDatabase();
    console.log('✅ Database initialization completed');
    
    // Test that all tables exist
    const tables = ['notebooks', 'sources', 'chunks', 'messages', 'study_tools'];
    
    for (const table of tables) {
      try {
        const result = await query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ Table '${table}' exists and is accessible (${result.rows[0].count} rows)`);
      } catch (error) {
        console.error(`❌ Table '${table}' failed:`, error.message);
      }
    }
    
    // Test pgvector extension
    try {
      const result = await query('SELECT * FROM pg_extension WHERE extname = $1', ['vector']);
      if (result.rows.length > 0) {
        console.log('✅ pgvector extension is enabled');
      } else {
        console.log('⚠️ pgvector extension not found');
      }
    } catch (error) {
      console.error('❌ pgvector extension test failed:', error.message);
    }
    
    console.log('🎉 Database initialization test completed!');
    
  } catch (error) {
    console.error('❌ Database initialization test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseInitialization();
