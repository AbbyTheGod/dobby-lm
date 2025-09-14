const { callFireworksAPI } = require('../lib/fireworks');
require('dotenv').config();

async function testFireworksAPI() {
  console.log('🧪 Testing Fireworks API with Dobby Model\n');

  // Check if API key is set
  if (!process.env.FIREWORKS_API_KEY) {
    console.log('❌ FIREWORKS_API_KEY not found in environment variables');
    console.log('   Please add your Fireworks API key to .env.local');
    return;
  }

  console.log('✅ Fireworks API key found');
  console.log('🤖 Model: accounts/fireworks/models/sentientfoundation-serverless/dobby-mini-unhinged-plus-llama-3-1-8b\n');

  try {
    // Test with a simple message
    const testMessages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant that answers questions based on provided sources. Always include citations when referencing information.'
      },
      {
        role: 'user',
        content: 'Hello! Can you tell me a bit about yourself and what you can help with?'
      }
    ];

    console.log('📤 Sending test message...');
    const startTime = Date.now();
    
    const response = await callFireworksAPI(testMessages, {
      maxTokens: 200,
      temperature: 0.7
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('✅ Response received successfully!');
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📝 Response length: ${response.length} characters\n`);
    
    console.log('🤖 Dobby Response:');
    console.log('─'.repeat(50));
    console.log(response);
    console.log('─'.repeat(50));

    console.log('\n🎉 Fireworks API test completed successfully!');
    console.log('\n📋 Model Details:');
    console.log('   • Model: Dobby Mini Unhinged Plus Llama 3.1 8B');
    console.log('   • Context Length: 131,072 tokens');
    console.log('   • Pricing: $0.2 per 1M tokens');
    console.log('   • Fine-tuning: Supported with LoRA');

  } catch (error) {
    console.log('❌ Fireworks API test failed:');
    console.log('   Error:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   • Check if your API key is correct');
      console.log('   • Verify the API key has proper permissions');
      console.log('   • Make sure the key is set in .env.local');
    } else if (error.message.includes('404')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   • Check if the model name is correct');
      console.log('   • Verify the model is available in your account');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   • Check your internet connection');
      console.log('   • Try again in a few moments');
    }
  }
}

// Run the test
testFireworksAPI().catch(console.error);
