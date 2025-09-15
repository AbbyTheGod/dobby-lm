import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { extractTextFromPDF, extractTextFromURL } from '../../../lib/text-processing.js';
import { scrapeWithPerplexity } from '../../../lib/perplexity-api.js';

export async function POST(request) {
  try {
    console.log('📥 Sources API: Received request');
    
    const formData = await request.formData();
    const notebookId = formData.get('notebookId');
    let title = formData.get('title');
    const type = formData.get('type');
    const content = formData.get('content');
    const url = formData.get('url');

    console.log('📋 Sources API: Form data:', { notebookId, title, type, content: content?.substring(0, 100), url });

    if (!notebookId || !type) {
      console.log('❌ Sources API: Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let extractedContent = '';
    let filePath = null;

    // Handle different source types
    if (type === 'url' && url) {
      try {
        // Validate URL format
        new URL(url);
        
        // Use Perplexity API for web scraping (handles JavaScript-heavy sites)
        console.log('🚀 Using Perplexity API for URL scraping:', url);
        const perplexityResult = await scrapeWithPerplexity(url, process.env.PERPLEXITY_API_KEY);
        
        console.log('🔍 Perplexity scraping result:', {
          success: perplexityResult.success,
          contentLength: perplexityResult.content?.length || 0,
          source: perplexityResult.source,
          error: perplexityResult.error
        });
        
        if (!perplexityResult.success) {
          console.log('❌ Perplexity API failed:', perplexityResult.error);
          return NextResponse.json({ 
            error: `Failed to extract content from URL: ${perplexityResult.error}`, 
            details: 'Perplexity API scraping failed'
          }, { status: 400 });
        }
        
        extractedContent = perplexityResult.content;
        
        // Use the URL hostname as title if no title was provided
        if (!title || title.trim() === '') {
          title = new URL(url).hostname;
        }
        
        console.log(`✅ URL processed successfully using ${perplexityResult.source}`);
        
        // Check if scraping returned very little content (likely failed)
        if (!extractedContent || extractedContent.length < 50) {
          console.log('⚠️ Sources API: Scraping returned minimal content, setting status to unsupported');
          const result = await query(
            `INSERT INTO sources (notebook_id, title, type, content, url, file_path, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'unsupported') RETURNING *`,
            [notebookId, title, type, 'This website content could not be retrieved properly.', url, filePath]
          );
          return NextResponse.json(result.rows[0], { status: 201 });
        }
      } catch (urlError) {
        console.error('❌ URL processing error:', urlError);
        return NextResponse.json({ 
          error: 'Failed to extract content from URL. This could be because:\n• The website is temporarily unavailable\n• The URL is invalid or inaccessible\n• Perplexity API is not configured\n\nTry a different URL or contact support if the issue persists.', 
          details: urlError.message 
        }, { status: 400 });
      }
    } else if (type === 'text' && content) {
      extractedContent = content;
    } else {
      return NextResponse.json({ error: 'Invalid source type or missing content' }, { status: 400 });
    }

    // Create source record
    console.log('💾 Sources API: Creating source record');
    const result = await query(
      `INSERT INTO sources (notebook_id, title, type, content, url, file_path, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [notebookId, title, type, extractedContent, url, filePath]
    );

    console.log('✅ Sources API: Source created successfully:', result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('❌ Sources API: Error creating source:', error);
    return NextResponse.json({ 
      error: 'Failed to create source', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const notebookId = searchParams.get('notebookId');

    if (!notebookId) {
      return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });
    }

    const result = await query(
      'SELECT * FROM sources WHERE notebook_id = $1 ORDER BY created_at DESC',
      [notebookId]
    );

    // Ensure we always return an array
    const rows = Array.isArray(result.rows) ? result.rows : [];
    return NextResponse.json(rows);
  } catch (error) {
    console.error('❌ Sources API: Error fetching sources:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sources', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');

    if (!sourceId) {
      return NextResponse.json({ error: 'Source ID is required' }, { status: 400 });
    }

    // Database should already be initialized, no need to reinitialize on every delete

    console.log('🗑️ Sources API: Deleting source:', sourceId);
    
    // Convert sourceId to string to ensure consistent type
    const sourceIdStr = String(sourceId);

    // Check if the specific source exists
    const sourceCheck = await query('SELECT * FROM sources WHERE id = $1', [sourceIdStr]);
    
    if (sourceCheck.rows.length === 0) {
      console.log('❌ Sources API: Source not found in database');
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }
    
    // Delete associated chunks first
    await query('DELETE FROM chunks WHERE source_id = $1', [sourceIdStr]);

    // Delete the source
    const result = await query('DELETE FROM sources WHERE id = $1 RETURNING *', [sourceIdStr]);

    console.log('✅ Sources API: Source deleted successfully');
    return NextResponse.json({ 
      message: 'Source deleted successfully',
      deletedSource: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Sources API: Error deleting source:', error);
    return NextResponse.json({ 
      error: 'Failed to delete source', 
      details: error.message 
    }, { status: 500 });
  }
}
