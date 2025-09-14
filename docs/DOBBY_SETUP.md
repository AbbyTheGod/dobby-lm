# Dobby Model Setup Guide

This guide will help you set up and use the Dobby Mini Unhinged Plus Llama 3.1 8B model with NotebookLM-lite.

## 🤖 About Dobby

**Dobby Mini Unhinged Plus Llama 3.1 8B** is an advanced language model from Sentient Foundation, available through Fireworks AI. It's optimized for:

- **Conversational AI** with natural, helpful responses
- **Source-grounded Q&A** with accurate citations
- **Educational content** generation (flashcards, quizzes, summaries)
- **Professional writing** and analysis

### Model Specifications

- **Model Size**: 8B parameters
- **Context Length**: 131,072 tokens
- **Pricing**: $0.2 per 1M tokens
- **Fine-tuning**: Supported with LoRA
- **Deployment**: On-demand available

## 🚀 Quick Setup

### 1. Get Fireworks API Key

1. Visit [Fireworks AI](https://fireworks.ai/)
2. Sign up for an account
3. Go to your [API Keys](https://fireworks.ai/console/keys) page
4. Create a new API key
5. Copy the key (starts with `fw-`)

### 2. Configure Environment

Add your API key to `.env.local`:

```env
FIREWORKS_API_KEY=fw-your-actual-api-key-here
```

### 3. Test the Connection

Run the test script to verify everything works:

```bash
npm run test-fireworks
```

You should see output like:
```
🧪 Testing Fireworks API with Dobby Model

✅ Fireworks API key found
🤖 Model: accounts/fireworks/models/sentientfoundation-serverless/dobby-mini-unhinged-plus-llama-3-1-8b

📤 Sending test message...
✅ Response received successfully!
⏱️  Response time: 1234ms
📝 Response length: 245 characters

🤖 Dobby Response:
──────────────────────────────────────────────────
Hello! I'm Dobby, your AI assistant. I'm here to help you with questions, analysis, and creating educational content based on your sources. I can help you understand complex topics, create summaries, generate flashcards and quizzes, and provide well-cited responses to your questions.

What would you like to explore today?
──────────────────────────────────────────────────

🎉 Fireworks API test completed successfully!
```

## 🎯 Using Dobby in NotebookLM-lite

### Chat Interface

Dobby is configured to:
- **Answer questions** based on your uploaded sources
- **Provide citations** in format `[S{source_id}:{chunk_index}]`
- **Admit uncertainty** when information isn't in sources
- **Give helpful, conversational responses**

### Study Tools

Dobby can generate:

1. **Flashcards**: Educational cards with questions and answers
2. **Quizzes**: Multiple choice and short answer questions
3. **Briefings**: Comprehensive summaries with structured format

### Example Interactions

**Question**: "What are the main findings in this research paper?"

**Dobby Response**: "Based on the research paper, the main findings include three key points: [S12:3] First, the study found that... [S12:5] Second, the data showed... [S12:7] Finally, the researchers concluded that..."

## 🔧 Advanced Configuration

### Customizing Prompts

You can modify the prompts in `lib/fireworks.js` to customize Dobby's behavior:

```javascript
// Chat prompt customization
function createChatPrompt(query, context, citations) {
  const systemPrompt = `You are Dobby, a helpful AI assistant...`;
  // Your custom prompt here
}
```

### Model Parameters

Adjust model parameters in API calls:

```javascript
const response = await callFireworksAPI(messages, {
  maxTokens: 1000,    // Maximum response length
  temperature: 0.7,   // Creativity level (0.0-1.0)
});
```

### Fine-tuning (Advanced)

For custom use cases, you can fine-tune Dobby:

1. Prepare your training data
2. Use Fireworks' LoRA fine-tuning
3. Deploy your custom model
4. Update the model name in the code

## 📊 Performance Tips

### Optimizing Response Quality

1. **Clear Questions**: Ask specific, well-formed questions
2. **Good Sources**: Upload high-quality, relevant documents
3. **Appropriate Context**: Don't overload with too many sources at once
4. **Follow-up Questions**: Use Dobby's responses to ask deeper questions

### Cost Management

- **Monitor Usage**: Check your Fireworks dashboard regularly
- **Optimize Prompts**: Shorter, clearer prompts use fewer tokens
- **Batch Operations**: Generate multiple study tools at once
- **Cache Results**: Store generated content to avoid regeneration

## 🐛 Troubleshooting

### Common Issues

**"API key invalid"**
- Check your API key in `.env.local`
- Verify the key is active in Fireworks dashboard
- Ensure no extra spaces or characters

**"Model not found"**
- Verify the model name is correct
- Check if the model is available in your account
- Try the test script to verify connectivity

**"Rate limit exceeded"**
- Wait a moment before making another request
- Consider upgrading your Fireworks plan
- Implement request queuing for high-volume usage

**"Response too slow"**
- Check your internet connection
- Try reducing `maxTokens` parameter
- Consider using on-demand deployment for better performance

### Getting Help

1. **Fireworks Documentation**: [docs.fireworks.ai](https://docs.fireworks.ai)
2. **Model Page**: [Dobby Model](https://app.fireworks.ai/models/sentientfoundation-serverless/dobby-mini-unhinged-plus-llama-3-1-8b)
3. **Community Support**: Fireworks Discord/Forum
4. **Test Script**: Run `npm run test-fireworks` for diagnostics

## 🎉 Ready to Use!

Once you've completed the setup:

1. **Start the app**: `npm run dev`
2. **Create a notebook**: Click "New" in the sidebar
3. **Add sources**: Upload PDFs, paste text, or add URLs
4. **Start chatting**: Ask Dobby questions about your sources
5. **Generate study tools**: Create flashcards, quizzes, and briefings

Dobby is now ready to help you with intelligent, source-grounded responses! 🚀
