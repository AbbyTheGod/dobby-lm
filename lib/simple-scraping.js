// Multi-method web scraping with fallbacks
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
  
  // Check for known problematic domains (social media and video platforms)
  const problematicDomains = [
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
    console.log(`🔗 Extracting content from: ${url}`);
    
    // Validate URL
    new URL(url);
    
    // Use only ScraperAPI for safe, reliable scraping
    console.log('🔄 Using ScraperAPI...');
    const result = await scrapeWithScraperAPI(url);
    
    if (result && result.content && result.content.length > 100) {
      console.log(`✅ ScraperAPI successful: ${result.content.length} characters`);
      return result;
    }
    
    throw new Error('ScraperAPI failed to extract sufficient content');
    
  } catch (error) {
    console.error('All scraping methods failed:', error.message);
    throw new Error(`Failed to extract text from URL: ${error.message}`);
  }
}

async function scrapeWithScraperAPI(url) {
  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('here')) {
    throw new Error('ScraperAPI key not configured');
  }
  
  console.log('🔑 Using ScraperAPI with JavaScript rendering...');
  
  const scraperApiUrl = 'http://api.scraperapi.com';
  const response = await axios.get(scraperApiUrl, {
    params: {
      api_key: apiKey,
      url: url,
      render: 'true', // Enable JavaScript rendering
      country_code: 'us',
      device: 'desktop',
      premium_proxy: 'true',
      session_number: Math.floor(Math.random() * 1000),
      wait: 5000, // Wait 5 seconds for JavaScript to load
      format: 'html' // Get full HTML for better processing
    },
    timeout: 60000,
  });
  
  const textContent = response.data;
  
  // Check if scraping was successful
  const isScrapingSuccessful = checkScrapingSuccess(textContent, url);
  
  if (!isScrapingSuccessful.success) {
    throw new Error(`ScraperAPI: ${isScrapingSuccessful.reason}`);
  }
  
  return processScrapedContent(textContent, url, 'scraperapi');
}


function processScrapedContent(htmlContent, url, source) {
  // Process HTML content to extract clean text
  let text = htmlContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/\n+/g, ' ') // Convert line breaks to spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/&nbsp;/g, ' ') // Replace HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
  
  // Extract title from HTML
  const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
  
  // Limit text length
  if (text.length > 50000) {
    text = text.substring(0, 50000) + '...';
  }
  
  console.log(`✅ ${source}: Extracted ${text.length} characters from ${url}`);
  console.log(`📄 Title: ${title}`);
  
  return {
    title,
    content: text,
    source
  };
}

export { extractTextFromURL };