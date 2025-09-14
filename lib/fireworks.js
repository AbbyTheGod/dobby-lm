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
  const systemPrompt = `You are a professional AI assistant. You MUST ONLY use information from the provided sources below.

CRITICAL RULES:
- ONLY answer using information from the sources provided below
- NEVER use any outside knowledge or information not in the sources
- If the information is NOT in the sources, say "I don't have that information in the provided sources"
- Be professional and respectful at all times
- Keep answers concise and well-formatted
- If user asks for "short" or "brief" answer, keep it under 2-3 sentences
- If user asks for "in short", give a 1-2 sentence summary
- If user asks to "summarize" or "summarise", give a CONCISE summary (3-5 key points max)
- If user asks for "quiz" or "questions", create a quiz with 10 questions in this EXACT format with proper line breaks:

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

Continue with 8 more questions following this exact format. IMPORTANT: Use proper line breaks and spacing. Each question should be clearly separated with blank lines.
- NEVER mention citations, references, or sources in your answer
- NEVER use brackets [ ] or parentheses ( ) for references
- NEVER include URLs or website links
- NEVER use profanity or unprofessional language
- Give direct, clean answers without any citation formatting

SOURCES TO USE (ONLY USE THESE):
${context || 'No sources available'}

IMPORTANT: Only answer if the information is in the sources above. If not, say "I don't have that information in the provided sources."`;

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
