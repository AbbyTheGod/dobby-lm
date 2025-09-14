import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { extractTextFromPDF, extractTextFromURL } from '../../../lib/text-processing.js';
import { extractTextFromURL as extractTextFromURLScraperAPI } from '../../../lib/simple-scraping.js';

export async function POST(request) {
  try {
    console.log('📥 Sources API: Received request');
    
    const formData = await request.formData();
    const notebookId = formData.get('notebookId');
    let title = formData.get('title');
    const type = formData.get('type');
    const content = formData.get('content');
    const url = formData.get('url');
    const file = formData.get('file');

    console.log('📋 Sources API: Form data:', { notebookId, title, type, content: content?.substring(0, 100), url, file: file?.name });

    if (!notebookId || !type) {
      console.log('❌ Sources API: Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let extractedContent = '';
    let filePath = null;

    // Handle different source types
    if (type === 'pdf' && file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      extractedContent = await extractTextFromPDF(buffer);
      filePath = `uploads/${Date.now()}_${file.name}`;
      // In production, you'd save the file to disk or cloud storage
    } else if (type === 'url' && url) {
      try {
        // Validate URL format
        new URL(url);
        
        // Use ScraperAPI for reliable web scraping
        console.log('🚀 Using ScraperAPI for URL scraping:', url);
        const urlResult = await extractTextFromURLScraperAPI(url);
        
        console.log('🔍 Scraping result:', {
          title: urlResult.title,
          contentLength: urlResult.content?.length || 0,
          source: urlResult.source,
          status: urlResult.status
        });
        
        extractedContent = urlResult.content;
        // Use the extracted title if no title was provided
        if (!title || title.trim() === '') {
          title = urlResult.title || new URL(url).hostname;
        }
        
        console.log(`✅ URL processed successfully using ${urlResult.source}`);
        
        // Check if the site is unsupported or scraping failed
        if (urlResult.status === 'unsupported') {
          console.log('⚠️ Sources API: Site is unsupported, setting status to unsupported');
          // Create source with unsupported status
          const result = await query(
            `INSERT INTO sources (notebook_id, title, type, content, url, file_path, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'unsupported') RETURNING *`,
            [notebookId, title, type, extractedContent, url, filePath]
          );
          return NextResponse.json(result.rows[0], { status: 201 });
        }
        
        // Check if scraping returned very little content (likely failed)
        if (!extractedContent || extractedContent.length < 50) {
          console.log('⚠️ Sources API: Scraping returned minimal content, setting status to unsupported');
          const result = await query(
            `INSERT INTO sources (notebook_id, title, type, content, url, file_path, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'unsupported') RETURNING *`,
            [notebookId, title, type, 'This website is not supported for scraping. The content could not be retrieved properly.', url, filePath]
          );
          return NextResponse.json(result.rows[0], { status: 201 });
        }
      } catch (urlError) {
        console.error('❌ URL processing error:', urlError);
        return NextResponse.json({ 
          error: 'Invalid URL or failed to extract content', 
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

    // Ensure all database tables exist
    try {
      const { initializeDatabase } = await import('../../../scripts/init-db.js');
      await initializeDatabase();
    } catch (initError) {
      console.error('❌ Database initialization failed:', initError);
      return NextResponse.json({ 
        error: 'Database initialization failed',
        details: initError.message 
      }, { status: 500 });
    }

    console.log('🗑️ Sources API: Deleting source:', sourceId);
    console.log('🗑️ Sources API: Source ID type:', typeof sourceId);
    
    // Convert sourceId to string to ensure consistent type
    const sourceIdStr = String(sourceId);
    console.log('🗑️ Sources API: Converted source ID:', sourceIdStr);

    // First, check what sources exist in the database
    const allSources = await query('SELECT id, title, notebook_id FROM sources ORDER BY created_at DESC LIMIT 10');
    console.log('🔍 Sources API: All sources in database:', allSources.rows.map(s => ({ id: s.id, title: s.title, notebook_id: s.notebook_id })));

    // Check if the specific source exists
    const sourceCheck = await query('SELECT * FROM sources WHERE id = $1', [sourceIdStr]);
    console.log('🔍 Sources API: Source check result:', sourceCheck.rows.length, 'rows found');
    
    if (sourceCheck.rows.length === 0) {
      console.log('❌ Sources API: Source not found in database');
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }
    
    console.log('✅ Sources API: Source found, proceeding with deletion');

    // Delete associated chunks first
    const chunksResult = await query('DELETE FROM chunks WHERE source_id = $1', [sourceIdStr]);
    console.log('🗑️ Sources API: Deleted', chunksResult.rowCount, 'associated chunks');

    // Delete the source
    const result = await query('DELETE FROM sources WHERE id = $1 RETURNING *', [sourceIdStr]);
    console.log('🗑️ Sources API: Source deletion result:', result.rowCount, 'rows deleted');

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
