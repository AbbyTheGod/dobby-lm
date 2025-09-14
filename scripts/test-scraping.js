const { extractTextFromURL, getScrapingAPIsStatus } = require('../lib/web-scraping-apis');
require('dotenv').config();

async function testScraping() {
  console.log('🧪 Testing Web Scraping APIs\n');

  // Show available APIs
  console.log('📋 Available Scraping APIs:');
  const status = getScrapingAPIsStatus();
  status.forEach(api => {
    const status = api.available ? '✅' : '❌';
    const cost = api.free ? 'Free' : `$${api.cost}/req`;
    console.log(`  ${status} ${api.name} (${cost})`);
  });

  // Test URLs (including some that require JavaScript rendering)
  const testUrls = [
    'https://en.wikipedia.org/wiki/Artificial_intelligence',
    'https://www.bbc.com/news/technology',
    'https://github.com/features',
    'https://react.dev/learn' // This site uses JavaScript rendering
  ];

  console.log('\n🔗 Testing URL Extraction:\n');

  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const result = await extractTextFromURL(url);
      
      console.log(`✅ Success!`);
      console.log(`   Title: ${result.title || 'N/A'}`);
      console.log(`   Content Length: ${result.content.length} characters`);
      console.log(`   Source: ${result.source}`);
      console.log(`   Preview: ${result.content.substring(0, 100)}...`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }

  console.log('🎉 Scraping test complete!');
}

// Run the test
testScraping().catch(console.error);
