import axios from 'axios';

const FIREWORKS_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const DEFAULT_MODEL = 'accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b';

function assertEnv() {
  const key = process.env.FIREWORKS_API_KEY;
  if (!key || /your_fireworks_api_key_here/i.test(key)) {
    throw new Error('FIREWORKS_API_KEY environment variable is required');
  }
}

function normalizeOptions(options = {}) {
  return {
    model: options.model || DEFAULT_MODEL,
    maxTokens: typeof options.maxTokens === 'number' ? options.maxTokens : 1000,
    temperature: typeof options.temperature === 'number' ? options.temperature : 0.7,
    stream: Boolean(options.stream) || false,
    // optional: top_p, presence_penalty, frequency_penalty could go here
  };
}

async function callFireworksAPI(messages, options = {}) {
  assertEnv();

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array of { role, content }');
  }

  const opts = normalizeOptions(options);

  try {
    const response = await axios.post(
      FIREWORKS_API_URL,
      {
        model: opts.model,
        messages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
        stream: opts.stream,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: options.timeoutMs || 30000,
      }
    );

    const choice = response?.data?.choices?.[0]?.message?.content;
    if (!choice) {
      throw new Error('No content returned from Fireworks API');
    }
    return choice;
  } catch (error) {
    const apiData = error?.response?.data;
    const status = error?.response?.status;
    const reason =
      apiData?.error?.message ||
      apiData?.message ||
      error.message ||
      'Unknown error';
    // Log minimal, non-sensitive context
    console.error('Fireworks API failed', { status, reason });
    throw new Error(`Fireworks API failed: ${reason}`);
  }
}

/* -------------------- Prompt Builders -------------------- */

const PLAIN_TEXT_STYLE_RULES = `
FORMATTING RULES:
- No markdown formatting (no **bold**, *italic*, or headings)
- Always put a blank line between sections
- Always put a blank line between bullet points
- Always put a blank line between numbered list items
- Sentences must be short, clear, and readable
- Use bullet points for lists
- Use numbered lists when order matters
- Do not use brackets for emphasis
- Brackets are reserved only for citations
`.trim();

/**
 * Utility to build a consistent system prompt
 */
function buildSystemPrompt({ roleName = 'Dobby', sources = 'No sources available', citationFormat = '[S{source_id}:{chunk_index}]', extra = '' } = {}) {
  return `
You are ${roleName}, a helpful AI assistant. You always respond in plain text only.

${PLAIN_TEXT_STYLE_RULES}

CITATIONS:
- Always include citations in this format: ${citationFormat}
- Only cite when a statement comes directly from the provided sources

SOURCES TO REFERENCE:
${sources}

${extra}`.trim();
}

/**
 * Chat prompt builder
 */
function createChatPrompt(query, context, citations = '[S{source_id}:{chunk_index}]') {
  const systemPrompt = buildSystemPrompt({
    sources: context || 'No sources available',
    citationFormat: citations,
    extra: `
EXAMPLE STRUCTURE:

Here is what I found:

Key Points:

• First important point

• Second important point

• Third important point

Additional Details:

Write short paragraphs separated by blank lines. Each paragraph should be one clear idea.

Main Benefits:

1. First benefit explained briefly

2. Second benefit with supporting detail

3. Third benefit, clear and structured

Always follow this spacing and structure exactly. Never remove the blank lines.
`.trim(),
  });

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: String(query || '').trim() },
  ];
}

/**
 * Summary prompt builder
 * type: 'briefing' | 'section'
 */
function createSummaryPrompt(content, type = 'briefing', citations = '[S{source_id}:{chunk_index}]') {
  const system = 'You are an expert at creating clear, well-formatted summaries that follow the style rules exactly.';
  const sharedHeader = `
${PLAIN_TEXT_STYLE_RULES}

Always include citations in the form ${citations} when referencing sources.
`.trim();

  const templates = {
    briefing: `
Create a well-structured briefing from the sources below.

${sharedHeader}

Executive Summary:
[2–4 sentences; what matters most]

Key Points:
• Key point one with one short sentence
• Key point two with one short sentence
• Key point three with one short sentence

Important Details:
[Short paragraphs, each separated by a blank line]

Conclusions:
[1–3 short sentences with the bottom line]

Sources:
${content}
`.trim(),

    section: `
Create a detailed section summary from the sources below.

${sharedHeader}

Overview:
[2–3 sentence introduction]

Main Points:
• Main point one with one short supporting sentence
• Main point two with one short supporting sentence
• Main point three with one short supporting sentence

Supporting Details:
[Short paragraphs with blank lines]

Key Takeaways:
1. Takeaway one
2. Takeaway two
3. Takeaway three

Sources:
${content}
`.trim(),
  };

  return [
    { role: 'system', content: system },
    { role: 'user', content: templates[type] || templates.briefing },
  ];
}

/**
 * Quiz prompt builder
 */
function createQuizPrompt(content) {
  const prompt = `
Create a 10-question quiz from the sources below.

RULES:
- Mix multiple choice and short answer
- Keep questions and answers concise
- Focus on key facts and concepts
- Never include citations, references, or links
- Use clear numbering and spacing
- Plain text only (no markdown)

Sources:
${content}

FORMAT EXACTLY:

QUIZ QUESTIONS

1. [Multiple Choice]
Question text here

A) Option 1
B) Option 2
C) Option 3
D) Option 4

Answer: Letter of correct option

---

2. [Short Answer]
Question text here

Answer: Brief, clear answer

---

Continue with 8 more questions in the same format.
`.trim();

  return [
    { role: 'system', content: 'You are a professional assistant that creates well-formatted, plain-text quizzes.' },
    { role: 'user', content: prompt },
  ];
}

export {
  callFireworksAPI,
  createChatPrompt,
  createSummaryPrompt,
  createQuizPrompt,
};