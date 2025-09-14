// Abstract API web scraping implementation
import axios from 'axios';

async function extractTextFromURLWithAbstractAPI(url) {
  try {
    console.log(`🔗 Extracting content from: ${url} using Abstract API`);
    
    // Validate URL
    new URL(url);
    
    // Check if API key is available
    const apiKey = process.env.ABSTRACTAPI_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('here')) {
      console.log('⚠️ Abstract API key not configured, falling back to simple scraping');
      throw new Error('Abstract API key not configured');
    }
    
    // Make request to Abstract API
    const response = await axios.get('https://scrape.abstractapi.com/v1/', {
      params: {
        api_key: apiKey,
        url: url
      },
      timeout: 30000, // 30 second timeout for Abstract API
      headers: {
        'User-Agent': 'NotebookLM-Lite/1.0'
      }
    });
    
    const html = response.data;
    
    // Extract text from HTML
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
    
    // Limit text length
    if (text.length > 100000) {
      text = text.substring(0, 100000) + '...';
    }
    
    console.log(`✅ Abstract API: Extracted ${text.length} characters from ${url}`);
    
    return {
      title,
      content: text,
      source: 'abstract-api'
    };
    
  } catch (error) {
    console.error('❌ Abstract API error:', error.message);
    
    // Provide specific error messages
    if (error.response?.status === 401) {
      throw new Error('Invalid Abstract API key. Please check your API key.');
    } else if (error.response?.status === 429) {
      throw new Error('Abstract API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 403) {
      throw new Error('Abstract API access forbidden. Check your API key permissions.');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Website not found. Please check the URL.');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Connection refused. The website may be down.');
    } else if (error.response?.status === 404) {
      throw new Error('Page not found (404). Please check the URL.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(`Failed to extract text from URL: ${error.message}`);
    }
  }
}

export { extractTextFromURLWithAbstractAPI };
