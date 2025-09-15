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
    
    // Try multiple scraping services in order of preference
    const methods = [
      { name: 'ScrapingBee', fn: scrapeWithScrapingBee },
      { name: 'ScraperAPI', fn: scrapeWithScraperAPI }
    ];
    
    for (const method of methods) {
      try {
        console.log(`🔄 Trying ${method.name}...`);
        const result = await method.fn(url);
        if (result && result.content && result.content.length > 100) {
          console.log(`✅ ${method.name} successful: ${result.content.length} characters`);
          return result;
        }
      } catch (error) {
        console.log(`❌ ${method.name} failed: ${error.message}`);
        continue;
      }
    }
    
    throw new Error('All scraping methods failed');
    
  } catch (error) {
    console.error('All scraping methods failed:', error.message);
    throw new Error(`Failed to extract text from URL: ${error.message}`);
  }
}

async function scrapeWithScrapingBee(url) {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('here')) {
    throw new Error('ScrapingBee API key not configured');
  }
  
  console.log('🐝 Using ScrapingBee with JavaScript rendering...');
  
  const scrapingBeeUrl = 'https://app.scrapingbee.com/api/v1/';
  
  try {
    // Try with JavaScript rendering first
    const response = await axios.get(scrapingBeeUrl, {
      params: {
        api_key: apiKey,
        url: url,
        render_js: 'true', // Enable JavaScript rendering
        premium_proxy: 'false', // Use free tier
        country_code: 'us',
        wait: 2000, // Wait 2 seconds for JavaScript to load
        return_page_text: 'true', // Return clean text content instead of HTML
        transparent_status_code: 'true' // Return actual HTTP status codes
      },
      timeout: 20000, // 20 seconds timeout for JavaScript
    });
    
    const textContent = response.data;
    
    // Check if scraping was successful
    const isScrapingSuccessful = checkScrapingSuccess(textContent, url);
    
    if (!isScrapingSuccessful.success) {
      console.log(`⚠️ ScrapingBee: ${isScrapingSuccessful.reason}`);
      throw new Error(`ScrapingBee: ${isScrapingSuccessful.reason}`);
    }
    
    return processScrapedContent(textContent, url, 'scrapingbee-js');
    
  } catch (error) {
    // If JavaScript rendering fails, try without it
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('🔄 ScrapingBee JavaScript timed out, trying without JavaScript...');
      
      try {
        const fallbackResponse = await axios.get(scrapingBeeUrl, {
          params: {
            api_key: apiKey,
            url: url,
            render_js: 'false', // No JavaScript for speed
            premium_proxy: 'false',
            country_code: 'us',
            return_page_text: 'true', // Return clean text content
            transparent_status_code: 'true' // Return actual HTTP status codes
          },
          timeout: 15000,
        });
        
        const textContent = fallbackResponse.data;
        const isScrapingSuccessful = checkScrapingSuccess(textContent, url);
        
        if (!isScrapingSuccessful.success) {
          throw new Error(`ScrapingBee fallback: ${isScrapingSuccessful.reason}`);
        }
        
        return processScrapedContent(textContent, url, 'scrapingbee-fallback');
        
      } catch (fallbackError) {
        throw new Error(`ScrapingBee failed with both methods: ${fallbackError.message}`);
      }
    }
    
    throw error;
  }
}

async function scrapeWithScraperAPI(url) {
  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('here')) {
    throw new Error('ScraperAPI key not configured');
  }
  
  console.log('🔑 Using ScraperAPI with JavaScript rendering...');
  
  const scraperApiUrl = 'https://api.scraperapi.com';
  const response = await axios.get(scraperApiUrl, {
    params: {
      api_key: apiKey,
      url: url,
      output_format: 'text', // Use text format like your working example
      render: 'true' // Enable JavaScript rendering
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

function processScrapedContent(content, url, source) {
  let text = content;
  
  // If it's HTML content, clean it up
  if (content.includes('<')) {
    text = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }
  
  // Clean up whitespace
  text = text
    .replace(/\n+/g, ' ') // Convert line breaks to spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Extract title from content (look for title pattern or fallback to URL)
  const titleMatch = content.match(/^(.+?)\n/) || content.match(/<title[^>]*>([^<]+)<\/title>/i);
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