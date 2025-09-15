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
  const systemPrompt = `You are Dobby, a helpful AI assistant powered by advanced language models. You excel at answering questions based on provided sources with accurate citations.

CORE PRINCIPLES:
1. Source-based responses: Only answer using information from the provided sources below
2. Honest uncertainty: If information isn't in the sources, clearly state "I don't have that information in the sources"
3. Proper citations: Always include citations using the format [S{source_id}:{chunk_index}] when referencing information
4. Clear communication: Be concise yet comprehensive, and explain complex concepts clearly
5. Transparency: If you're uncertain about something, acknowledge it

RESPONSE FORMATTING:
- Use clear, well-structured responses
- Break down complex information into digestible points
- Use bullet points or numbered lists when appropriate
- Maintain a professional yet friendly tone
- Keep responses focused and relevant
- Do not use markdown formatting like **bold** or *italic*
- Use plain text formatting only

SOURCES TO REFERENCE:
${context || 'No sources available'}

CITATION FORMAT: ${citations}

Remember: You are Dobby, and you're here to help with grounded, well-cited responses!`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ];
}

function createSummaryPrompt(content, type = 'briefing') {
  const prompts = {
    briefing: `Create a concise, well-formatted briefing from the sources below.

CRITICAL RULES:
- Keep it concise and easy to read
- Use clear headings and bullet points
- Focus on the most important information
- NEVER include citations, references, or links
- Be professional and well-structured

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
    
    section: `Create a detailed section summary from the sources below. Organize the information logically.

CRITICAL RULES:
- Use clear headings and structure
- Cover all important points
- Maintain proper flow and connections
- Be comprehensive yet readable
- NEVER include citations, references, or links
- Be professional and well-structured

Sources:
${content}`
  };

  return [
    { role: 'system', content: 'You are a professional AI assistant expert at creating clear, comprehensive summaries with professional structure.' },
    { role: 'user', content: prompts[type] || prompts.briefing }
  ];
}


function createQuizPrompt(content) {
  const prompt = `Create a well-formatted quiz with 10 questions from the sources below.

CRITICAL RULES:
- Keep questions and answers concise and clear
- Mix multiple choice and short answer questions
- Focus on important facts and key concepts
- NEVER include citations, references, or links
- Use proper spacing and formatting
- Number questions clearly
- Make it easy to read

Sources:
${content}

Create questions in this EXACT format with proper spacing:

**QUIZ QUESTIONS**

**1. [Multiple Choice]**
What is the main topic discussed in the sources?

A) Option 1
B) Option 2  
C) Option 3
D) Option 4

**Answer:** Correct option

---

**2. [Short Answer]**
What are the key points mentioned about this topic?

**Answer:** Brief, clear answer

---

**3. [Multiple Choice]**
Which statement is true based on the information provided?

A) First option
B) Second option
C) Third option
D) Fourth option

**Answer:** Correct option

---

Continue with 7 more questions following this exact format with proper spacing, numbering, and clear structure.`;

  return [
    { role: 'system', content: 'You are a professional AI assistant expert at creating well-formatted educational quizzes with proper spacing and structure.' },
    { role: 'user', content: prompt }
  ];
}

export {
  callFireworksAPI,
  createChatPrompt,
  createSummaryPrompt,
  createQuizPrompt,
};
