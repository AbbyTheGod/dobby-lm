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
  const systemPrompt = `You are Dobby, a helpful AI assistant. Answer questions based on the provided sources.

RESPONSE GUIDELINES:
- Keep answers concise and well-formatted
- Use bullet points or short paragraphs for clarity
- If user asks for "short" or "brief" answer, keep it under 2-3 sentences
- If user asks for "in short", give a 1-2 sentence summary
- NEVER include citations, references, or links
- NEVER use brackets [ ] or parentheses ( ) for references
- NEVER include URLs or website links
- Give direct, clean answers without any citation formatting

SOURCES TO USE:
${context || 'No sources available'}

Answer the user's question directly and clearly.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ];
}

function createSummaryPrompt(content, type = 'briefing') {
  const prompts = {
    briefing: `Create a concise, well-formatted briefing from the sources below.

GUIDELINES:
- Keep it concise and easy to read
- Use clear headings and bullet points
- Focus on the most important information
- NEVER include citations, references, or links

Structure with clear headings:
**Executive Summary**
- Brief overview (2-3 sentences)

**Key Points**
- Main findings in bullet points

**Important Details**
- Supporting information

**Conclusions**
- Key takeaways

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
  const prompt = `Create 5-8 educational flashcards from the sources below. Return ONLY a JSON array.

GUIDELINES:
- Keep questions and answers concise (1-2 sentences max)
- Focus on key facts and important concepts
- Make answers clear and easy to understand
- NEVER include citations, references, or links

Sources:
${content}

Return ONLY this JSON format:
[
  {
    "front": "Short question or term",
    "back": "Brief, clear answer"
  }
]`;

  return [
    { role: 'system', content: 'You are Dobby, an expert at creating educational flashcards. Always return valid JSON format.' },
    { role: 'user', content: prompt }
  ];
}

function createQuizPrompt(content) {
  const prompt = `Create 5-7 quiz questions from the sources below. Return ONLY a JSON object.

GUIDELINES:
- Keep questions and answers concise and clear
- Mix multiple choice and short answer questions
- Focus on important facts and key concepts
- NEVER include citations, references, or links

Sources:
${content}

Return ONLY this JSON format:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Clear, concise question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Brief, clear answer"
    },
    {
      "type": "short_answer", 
      "question": "Clear, concise question",
      "answer": "Brief, clear answer"
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
