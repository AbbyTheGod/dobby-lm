import axios from 'axios';

const FIREWORKS_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const MODEL_NAME = 'accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b';

async function callFireworksAPI(messages, options = {}) {
  // Require real Fireworks API key
  if (!process.env.FIREWORKS_API_KEY || process.env.FIREWORKS_API_KEY.includes('your_fireworks_api_key_here')) {
    throw new Error('FIREWORKS_API_KEY environment variable is required');
  }
  
  console.log('🔑 Using Fireworks API key:', process.env.FIREWORKS_API_KEY.substring(0, 10) + '...');
  console.log('🤖 Using model:', MODEL_NAME);
  
  try {
    const response = await axios.post(FIREWORKS_API_URL, {
      model: MODEL_NAME,
      messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      stream: false,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    console.log('✅ Fireworks API response received');
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Fireworks API error:', error.response?.data || error.message);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error headers:', error.response?.headers);
    throw new Error(`Fireworks API failed: ${error.message}`);
  }
}

function createChatPrompt(query, context, citations) {
  const systemPrompt = `You are Dobby, a helpful AI assistant powered by advanced language models. You excel at answering questions based on provided sources.

CORE PRINCIPLES:
1. **Source-based responses**: Only answer using information from the provided sources below
2. **Honest uncertainty**: If information isn't in the sources, clearly state "I don't have that information in the sources"
3. **Clear communication**: Be concise yet comprehensive, and explain complex concepts clearly
4. **Transparency**: If you're uncertain about something, acknowledge it
5. **No citations**: Do not include any citation format or references in your responses

SOURCES TO REFERENCE:
${context || 'No sources available'}

Remember: You are Dobby, and you're here to help with clear, helpful responses without citations!`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ];
}

function createSummaryPrompt(content, type = 'briefing') {
  const prompts = {
    briefing: `As Dobby, create a comprehensive one-page briefing from the following sources. Structure it professionally with:

- Executive Summary
- Key Points & Findings  
- Important Details & Evidence
- Conclusions & Implications

Make it clear, well-organized, and actionable. Do not include any citations or references.

Sources:
${content}`,
    
    section: `As Dobby, create a detailed section summary from the following sources. Organize the information logically with:

- Clear headings and structure
- All important points covered
- Proper flow and connections
- Comprehensive coverage

Make it thorough yet readable. Do not include any citations or references.

Sources:
${content}`
  };

  return [
    { role: 'system', content: 'You are Dobby, an expert at creating clear, comprehensive summaries with professional structure.' },
    { role: 'user', content: prompts[type] || prompts.briefing }
  ];
}

function createFlashcardPrompt(content) {
  const prompt = `As Dobby, create educational flashcards from the following sources. Return a JSON array of flashcards, each with "front" and "back" properties.

Focus on:
- Key concepts and definitions
- Important facts and details
- Critical information for learning
- Clear, concise questions and answers

Do not include any citations or references in the answers.

Sources:
${content}

Return format (valid JSON only):
[
  {
    "front": "Question or term",
    "back": "Answer without citations"
  }
]`;

  return [
    { role: 'system', content: 'You are Dobby, an expert at creating educational flashcards. Always return valid JSON format.' },
    { role: 'user', content: prompt }
  ];
}

function createQuizPrompt(content) {
  const prompt = `As Dobby, create an educational quiz from the following sources. Return a JSON object with "questions" array.

Create a mix of:
- Multiple choice questions (4 options each)
- Short answer questions
- Questions that test understanding, not just memorization
- Questions covering key concepts and important details

Each question should have:
- "type": "multiple_choice" or "short_answer"
- "question": Clear, well-written question
- "options": Array of 4 options (for multiple choice only)
- "answer": Correct answer without citations

Sources:
${content}

Return format (valid JSON only):
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct answer without citations"
    },
    {
      "type": "short_answer",
      "question": "Question text",
      "answer": "Answer without citations"
    }
  ]
}`;

  return [
    { role: 'system', content: 'You are Dobby, an expert at creating educational quizzes. Always return valid JSON format.' },
    { role: 'user', content: prompt }
  ];
}

export {
  callFireworksAPI,
  createChatPrompt,
  createSummaryPrompt,
  createFlashcardPrompt,
  createQuizPrompt,
};
