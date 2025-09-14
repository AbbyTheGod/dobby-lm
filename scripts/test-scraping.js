#!/usr/bin/env node

/**
 * Test script for web scraping APIs
 * Tests the configured scraping service to ensure it's working properly
 */

require('dotenv').config();
const axios = require('axios');

async function testScraping() {
  console.log('🧪 Testing Web Scraping Configuration...\n');

  // Check environment variables
  const scraperApiKey = process.env.SCRAPERAPI_KEY;
  
  if (!scraperApiKey) {
    console.log('❌ SCRAPERAPI_KEY not found in environment variables');
    console.log('   Please add SCRAPERAPI_KEY to your .env file');
    return;
  }

  console.log('✅ SCRAPERAPI_KEY found');
  console.log(`   Key: ${scraperApiKey.substring(0, 8)}...`);

  // Test URL
  const testUrl = 'https://example.com';
  
  try {
    console.log(`\n🌐 Testing scraping with URL: ${testUrl}`);
    
    const response = await axios.get('https://api.scraperapi.com', {
      params: {
        api_key: scraperApiKey,
        url: testUrl,
        render: 'false'
      },
      timeout: 10000
    });

    if (response.status === 200) {
      console.log('✅ Scraping API is working!');
      console.log(`   Response length: ${response.data.length} characters`);
      console.log(`   Content preview: ${response.data.substring(0, 100)}...`);
    } else {
      console.log(`❌ Unexpected response status: ${response.status}`);
    }

  } catch (error) {
    if (error.response) {
      console.log(`❌ API Error: ${error.response.status} - ${error.response.statusText}`);
      console.log(`   Response: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.log('❌ Network Error: No response received');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n📋 Scraping Test Complete');
}

// Run the test
testScraping().catch(console.error);
