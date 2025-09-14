const { Pool } = require('pg');
require('dotenv').config();

async function checkSetup() {
  console.log('🔍 Checking NotebookLM-lite setup...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  const requiredEnvVars = [
    'DATABASE_URL',
    'FIREWORKS_API_KEY',
  ];

  let envIssues = 0;
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`  ✅ ${envVar}: Set`);
    } else {
      console.log(`  ❌ ${envVar}: Missing`);
      envIssues++;
    }
  });

  if (envIssues > 0) {
    console.log('\n⚠️  Please set missing environment variables in .env.local');
    return;
  }

  // Check database connection
  console.log('\n🗄️  Database Connection:');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();
    console.log('  ✅ Connected to PostgreSQL');

    // Check pgvector extension
    const vectorCheck = await client.query('SELECT * FROM pg_extension WHERE extname = \'vector\'');
    if (vectorCheck.rows.length > 0) {
      console.log('  ✅ pgvector extension installed');
    } else {
      console.log('  ❌ pgvector extension not found');
      console.log('     Install with: CREATE EXTENSION vector;');
    }

    // Check tables
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('notebooks', 'sources', 'chunks', 'messages', 'study_tools')
    `);

    const expectedTables = ['notebooks', 'sources', 'chunks', 'messages', 'study_tools'];
    const existingTables = tableCheck.rows.map(row => row.table_name);

    console.log('\n📊 Database Tables:');
    expectedTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table}: Missing`);
      }
    });

    client.release();
    await pool.end();

  } catch (error) {
    console.log('  ❌ Database connection failed:', error.message);
    console.log('     Check your DATABASE_URL and ensure PostgreSQL is running');
  }

  // Check Fireworks API
  console.log('\n🤖 Fireworks API:');
  try {
    const response = await fetch('https://api.fireworks.ai/inference/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`,
      },
    });

    if (response.ok) {
      console.log('  ✅ API key is valid');
    } else {
      console.log('  ❌ API key validation failed');
    }
  } catch (error) {
    console.log('  ❌ Could not validate API key:', error.message);
  }

  console.log('\n🎉 Setup check complete!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:3000');
  console.log('3. Create your first notebook and add sources');
}

checkSetup().catch(console.error);
