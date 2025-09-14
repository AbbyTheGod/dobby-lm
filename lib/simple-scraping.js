// Simple web scraping without cheerio to avoid undici conflicts
import axios from 'axios';

async function extractTextFromURL(url) {
  try {
    console.log(`🔗 Extracting content from: ${url}`);
    
    // Validate URL
    new URL(url);
    
    // Simple text extraction using axios
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    
    // Basic text extraction (remove HTML tags)
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
    if (text.length > 50000) {
      text = text.substring(0, 50000) + '...';
    }
    
    return {
      title,
      content: text,
      source: 'simple-scraper'
    };
    
  } catch (error) {
    console.error('Error extracting text from URL:', error.message);
    if (error.code === 'ENOTFOUND') {
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

export { extractTextFromURL };
