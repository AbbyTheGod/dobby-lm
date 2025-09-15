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
    
    // Try ScraperAPI first, then simple fallback
    try {
      console.log('🔄 Using ScraperAPI without JavaScript...');
      const result = await scrapeWithScraperAPI(url);
      
      if (result && result.content && result.content.length > 100) {
        console.log(`✅ ScraperAPI successful: ${result.content.length} characters`);
        return result;
      }
    } catch (error) {
      console.log('❌ ScraperAPI failed, trying simple fallback...');
    }
    
    // Simple fallback for basic sites
    try {
      console.log('🔄 Trying simple HTTP fallback...');
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000,
      });
      
      return processScrapedContent(response.data, url, 'simple-fallback');
    } catch (fallbackError) {
      console.log('❌ Simple fallback also failed');
    }
    
    throw new Error('All scraping methods failed');
    
  } catch (error) {
    console.error('All scraping methods failed:', error.message);
    throw new Error(`Failed to extract text from URL: ${error.message}`);
  }
}


async function scrapeWithScraperAPI(url) {
  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('here')) {
    console.log('❌ ScraperAPI key not configured or invalid');
    throw new Error('ScraperAPI key not configured');
  }
  
  console.log('🔑 ScraperAPI key found, length:', apiKey.length);
  
  console.log('🔑 Using ScraperAPI without JavaScript for speed...');
  
  const scraperApiUrl = 'https://api.scraperapi.com';
  const response = await axios.get(scraperApiUrl, {
    params: {
      api_key: apiKey,
      url: url,
      output_format: 'text', // Use text format like your working example
      render: 'false' // No JavaScript rendering for speed
    },
    timeout: 25000, // 25 seconds timeout for Vercel
  });
  
  const textContent = response.data;
  
  // Log the response for debugging
  console.log('🔍 ScraperAPI response length:', textContent.length);
  console.log('🔍 ScraperAPI response preview:', textContent.substring(0, 200));
  
  // Check if scraping was successful
  const isScrapingSuccessful = checkScrapingSuccess(textContent, url);
  
  if (!isScrapingSuccessful.success) {
    console.log('❌ ScraperAPI failed:', isScrapingSuccessful.reason);
    console.log('❌ Full response:', textContent);
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