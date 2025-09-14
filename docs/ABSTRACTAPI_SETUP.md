# Abstract API Setup Guide

This guide will help you set up Abstract API for enhanced web scraping capabilities in NotebookLM-lite.

## What is Abstract API?

Abstract API provides a powerful web scraping service that:
- Handles JavaScript rendering
- Manages proxy rotation
- Solves CAPTCHAs automatically
- Provides better content extraction than simple HTTP requests

## Setup Steps

### 1. Create Abstract API Account

1. Go to [Abstract API](https://www.abstractapi.com/)
2. Sign up for a free account
3. Navigate to the Web Scraping API section
4. Get your API key

### 2. Configure Environment Variables

1. Open your `.env.local` file
2. Add your Abstract API key:

```bash
ABSTRACTAPI_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your real API key from Abstract API.

### 3. Test the Setup

1. Start the development server: `npm run dev`
2. Try adding a URL source in the app
3. Check the terminal logs to see if Abstract API is being used

## How It Works

The app uses a **fallback system**:

1. **First**: Tries Abstract API (if API key is configured)
2. **Fallback**: Uses simple axios scraping if Abstract API fails
3. **Error**: Shows user-friendly error message if both fail

## Benefits of Abstract API

- **Better Content Extraction**: Handles dynamic content and JavaScript
- **Anti-Bot Protection**: Bypasses common blocking mechanisms
- **Reliability**: More consistent results across different websites
- **Rate Limiting**: Built-in rate limiting and retry logic

## Free Tier Limits

Abstract API offers:
- **Free tier**: 1,000 requests per month
- **Paid plans**: Higher limits and additional features

## Troubleshooting

### Common Issues

1. **"Abstract API key not configured"**
   - Make sure you've added the API key to `.env.local`
   - Restart the development server after adding the key

2. **"Invalid Abstract API key"**
   - Verify your API key is correct
   - Check that you're using the Web Scraping API key (not other Abstract API services)

3. **"Rate limit exceeded"**
   - You've hit the free tier limit
   - Wait for the next month or upgrade your plan

### Logs to Check

Look for these messages in the terminal:
- `🚀 Attempting to use Abstract API for URL scraping` - Trying Abstract API
- `✅ Abstract API: Extracted X characters from URL` - Success
- `⚠️ Abstract API failed, falling back to simple scraping` - Fallback to simple method

## Alternative: Simple Scraping

If you don't want to use Abstract API, the app will automatically fall back to simple scraping using axios. This works for most basic websites but may not handle:
- JavaScript-heavy sites
- Sites with anti-bot protection
- Complex dynamic content

## Support

For issues with Abstract API:
- Check their [documentation](https://docs.abstractapi.com/scrape)
- Contact their support team
- Check your API key and usage limits