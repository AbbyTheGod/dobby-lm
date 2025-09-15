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
  const systemPrompt = `You are Dobby, a helpful AI assistant. You provide clear, well-formatted responses based on the provided sources.

RESPONSE FORMATTING RULES:
1. Use proper spacing between paragraphs and sections
2. Use bullet points with clear spacing:
   • Point one
   • Point two
   • Point three

3. Use numbered lists with proper spacing:
   1. First item
   2. Second item
   3. Third item

4. Use clear section breaks with blank lines
5. Keep sentences concise and readable
6. Use proper capitalization and punctuation
7. Do NOT use markdown formatting (**bold**, *italic*)
8. Do NOT use brackets [ ] for emphasis
9. Use plain text only

EXAMPLE OF GOOD FORMATTING:
Here's what I found about the topic:

Key Points:
• First important point with proper spacing
• Second important point with clear structure
• Third point that's easy to read

Additional Details:
The information shows that this topic has several important aspects. Each aspect should be clearly separated with proper spacing.

Main Benefits:
1. First benefit with clear explanation
2. Second benefit with supporting details
3. Third benefit that's well-structured

Remember to always include citations [S1:2] when referencing sources.

SOURCES TO REFERENCE:
${context || 'No sources available'}

CITATION FORMAT: ${citations}

Always format your responses with proper spacing, clear structure, and easy-to-read formatting.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ];
}

function createSummaryPrompt(content, type = 'briefing') {
  const prompts = {
    briefing: `Create a well-formatted briefing from the sources below.

FORMATTING REQUIREMENTS:
- Use proper spacing between sections
- Use bullet points with clear spacing
- Include blank lines between major sections
- Keep sentences concise and readable
- Do NOT use markdown formatting
- Use plain text only

STRUCTURE YOUR RESPONSE:

Executive Summary:
[Brief overview with proper spacing]

Key Points:
• First key point with clear explanation
• Second key point with supporting details
• Third key point that's well-structured

Important Details:
[Detailed information with proper paragraph spacing]

Conclusions:
[Clear conclusions with proper formatting]

Always include citations [S{source_id}:{chunk_index}] when referencing sources.

Sources:
${content}`,
    
    section: `Create a detailed, well-formatted section summary from the sources below.

FORMATTING REQUIREMENTS:
- Use proper spacing between sections
- Use bullet points with clear spacing
- Include blank lines between major sections
- Keep sentences concise and readable
- Do NOT use markdown formatting
- Use plain text only

STRUCTURE YOUR RESPONSE:

Overview:
[Clear introduction with proper spacing]

Main Points:
• First main point with detailed explanation
• Second main point with supporting information
• Third main point that's well-structured

Supporting Details:
[Additional information with proper paragraph spacing]

Key Takeaways:
1. First takeaway with clear explanation
2. Second takeaway with supporting details
3. Third takeaway that's well-structured

Always include citations [S{source_id}:{chunk_index}] when referencing sources.

Sources:
${content}`
  };

  return [
    { role: 'system', content: 'You are an expert at creating clear, well-formatted summaries with proper spacing, structure, and citations.' },
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

QUIZ QUESTIONS

1. [Multiple Choice]
What is the main topic discussed in the sources?

A) Option 1
B) Option 2  
C) Option 3
D) Option 4

Answer: Correct option

---

2. [Short Answer]
What are the key points mentioned about this topic?

Answer: Brief, clear answer

---

3. [Multiple Choice]
Which statement is true based on the information provided?

A) First option
B) Second option
C) Third option
D) Fourth option

Answer: Correct option

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
