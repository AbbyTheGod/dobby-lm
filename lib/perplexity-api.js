/**
 * Perplexity API integration for web scraping
 * Can be easily reverted to ScraperAPI if needed
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_MODEL = 'sonar'; // Lightweight, cost-effective model

/**
 * Scrape content using Perplexity API
 * @param {string} url - URL to scrape
 * @param {string} apiKey - Perplexity API key
 * @returns {Promise<{success: boolean, content: string, error?: string}>}
 */
async function scrapeWithPerplexity(url, apiKey) {
  try {
    console.log('🔍 Scraping with Perplexity API:', url);
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a web content extractor. Extract the main content from the provided URL. Return only the clean, readable text content without any formatting or explanations. Focus on the main article content, removing navigation, ads, and other non-essential elements.`
          },
          {
            role: 'user',
            content: `Extract the main content from this URL: ${url}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from Perplexity API');
    }

    console.log('✅ Perplexity scraping successful');
    return {
      success: true,
      content: content.trim(),
      source: 'perplexity'
    };

  } catch (error) {
    console.error('❌ Perplexity API error:', error.message);
    return {
      success: false,
      error: error.message,
      source: 'perplexity'
    };
  }
}

/**
 * Get scraping configuration status
 * @returns {Object} Configuration status
 */
function getScrapingConfig() {
  return {
    perplexityAvailable: !!process.env.PERPLEXITY_API_KEY,
    method: 'perplexity'
  };
}

module.exports = {
  scrapeWithPerplexity,
  getScrapingConfig
};
