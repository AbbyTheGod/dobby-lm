// ScraperAPI web scraping - reliable and handles anti-bot protection
import axios from 'axios';

async function extractTextFromURL(url) {
  try {
    console.log(`🔗 Extracting content from: ${url} using ScraperAPI`);
    
    // Validate URL
    new URL(url);
    
    // Check if ScraperAPI key is available
    const apiKey = process.env.SCRAPERAPI_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('here')) {
      throw new Error('ScraperAPI key not configured. Please add SCRAPERAPI_KEY to environment variables.');
    }
    
    // Use ScraperAPI for reliable web scraping
    const scraperApiUrl = 'http://api.scraperapi.com';
    const response = await axios.get(scraperApiUrl, {
      params: {
        api_key: apiKey,
        url: url,
        render: 'true', // Render JavaScript for dynamic content
        country_code: 'us',
        device: 'desktop' // Use desktop user agent
      },
      timeout: 70000, // 70 seconds timeout as recommended by ScraperAPI
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
    
    console.log(`✅ ScraperAPI: Extracted ${text.length} characters from ${url}`);
    console.log(`📄 Title: ${title}`);
    console.log(`📝 Content preview: ${text.substring(0, 200)}...`);
    
    return {
      title,
      content: text,
      source: 'scraperapi'
    };
    
  } catch (error) {
    console.error('ScraperAPI error:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid ScraperAPI key. Please check your API key.');
    } else if (error.response?.status === 403) {
      throw new Error('ScraperAPI access forbidden. Check your API key permissions.');
    } else if (error.response?.status === 429) {
      throw new Error('ScraperAPI rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 422) {
      throw new Error('Invalid URL provided to ScraperAPI. Please check the URL format.');
    } else if (error.response?.status === 500) {
      throw new Error('ScraperAPI server error. Please try again later.');
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

export { extractTextFromURL };
