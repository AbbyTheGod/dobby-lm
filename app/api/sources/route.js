import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.js';
import { extractTextFromPDF, extractTextFromURL } from '../../../lib/text-processing.js';
import { extractTextFromURL as extractTextFromURLSimple } from '../../../lib/simple-scraping.js';
import { extractTextFromURLWithAbstractAPI } from '../../../lib/abstract-scraping.js';

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
        
        let urlResult;
        try {
          // Try Abstract API first
          console.log('🚀 Attempting to use Abstract API for URL scraping');
          urlResult = await extractTextFromURLWithAbstractAPI(url);
        } catch (abstractError) {
          console.log('⚠️ Abstract API failed, falling back to simple scraping:', abstractError.message);
          // Fallback to simple scraping
          urlResult = await extractTextFromURLSimple(url);
        }
        
        extractedContent = urlResult.content;
        // Use the extracted title if no title was provided
        if (!title || title.trim() === '') {
          title = urlResult.title || new URL(url).hostname;
        }
        
        console.log(`✅ URL processed successfully using ${urlResult.source}`);
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

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Sources API: Error fetching sources:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sources', 
      details: error.message 
    }, { status: 500 });
  }
}
