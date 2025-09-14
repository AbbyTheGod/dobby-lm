// Database initialization script for session storage
import { query } from '../lib/database.js';

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing session database schema...');
    
    // For session storage, we just need to ensure the session data structure exists
    // The database.js file already handles this with the sessionData object
    
    // Test that the session database is working
    await query('SELECT COUNT(*) FROM notebooks');
    await query('SELECT COUNT(*) FROM sources');
    await query('SELECT COUNT(*) FROM chunks');
    await query('SELECT COUNT(*) FROM messages');
    await query('SELECT COUNT(*) FROM study_tools');
    
    console.log('✅ Session database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Session database initialization failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { initializeDatabase };
