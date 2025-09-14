// ScraperAPI web scraping - reliable and handles anti-bot protection
import axios from 'axios';

function checkScrapingSuccess(content, url) {
  // Check for common failure indicators
  const failureIndicators = [
    'javascript is needed',
    'enable javascript',
    'please enable javascript',
    'javascript required',
    'this site requires javascript',
    'access denied',
    'blocked',
    'forbidden',
    'not found',
    'page not found',
    'error 404',
    'error 403',
    'error 500',
    'server error',
    'temporarily unavailable',
    'maintenance mode',
    'coming soon',
    'under construction'
  ];
  
  const contentLower = content.toLowerCase();
  const urlLower = url.toLowerCase();
  
  // Check if content is too short (likely failed scraping)
  if (content.length < 100) {
    return {
      success: false,
      reason: 'Content too short - likely a JavaScript-heavy site or access denied'
    };
  }
  
  // Check for failure indicators
  for (const indicator of failureIndicators) {
    if (contentLower.includes(indicator)) {
      return {
        success: false,
        reason: `Site requires JavaScript or has access restrictions (detected: "${indicator}")`
      };
    }
  }
  
  // Check for known problematic domains
  const problematicDomains = [
    'binance.com',
    'coinbase.com',
    'kraken.com',
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'youtube.com',
    'tiktok.com',
    'snapchat.com'
  ];
  
  for (const domain of problematicDomains) {
    if (urlLower.includes(domain)) {
      return {
        success: false,
        reason: `This domain (${domain}) is known to require JavaScript or has anti-scraping protection`
      };
    }
  }
  
  // Check if content looks like an error page
  if (contentLower.includes('error') && contentLower.includes('page')) {
    return {
      success: false,
      reason: 'Appears to be an error page'
    };
  }
  
  return { success: true };
}

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
    
    // Use ScraperAPI LLM-ready data mode for clean, structured content
    const scraperApiUrl = 'http://api.scraperapi.com';
    const response = await axios.get(scraperApiUrl, {
      params: {
        api_key: apiKey,
        url: url,
        render: 'false', // Don't render JavaScript (faster)
        country_code: 'us',
        device: 'desktop', // Use desktop user agent
        output_format: 'text' // LLM-ready text format
      },
      timeout: 50000, // 50 seconds timeout to avoid Vercel timeout
    });
    
    const textContent = response.data;
    
    // Check if scraping was successful
    const isScrapingSuccessful = checkScrapingSuccess(textContent, url);
    
    if (!isScrapingSuccessful.success) {
      console.log(`⚠️ ScraperAPI: Site not supported - ${isScrapingSuccessful.reason}`);
      return {
        title: new URL(url).hostname,
        content: `This website is not supported for scraping. ${isScrapingSuccessful.reason}

Supported sites include:
• Wikipedia articles
• News websites (BBC, CNN, Reuters)
• Blog posts and articles
• Documentation sites
• Educational content

Try uploading a different URL or use a supported website.`,
        source: 'scraperapi',
        status: 'unsupported'
      };
    }
    
    // ScraperAPI LLM-ready mode returns clean text, so minimal processing needed
    let text = textContent
      .replace(/\n+/g, ' ') // Convert line breaks to spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Extract title from text (look for title pattern or fallback to URL)
    const titleMatch = textContent.match(/^(.+?)\n/);
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
    
    // Limit text length
    if (text.length > 50000) {
      text = text.substring(0, 50000) + '...';
    }
    
    console.log(`✅ ScraperAPI LLM-ready: Extracted ${text.length} characters from ${url}`);
    console.log(`📄 Title: ${title}`);
    console.log(`📝 Content preview: ${text.substring(0, 200)}...`);
    console.log(`🔍 Full content length: ${textContent.length} characters`);
    console.log(`🔍 Processed text length: ${text.length} characters`);
    
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
