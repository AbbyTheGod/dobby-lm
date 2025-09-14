import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database.js';
import { chunkText, generateEmbedding, estimateTokenCount } from '../../../../lib/text-processing.js';

export async function POST(request, { params }) {
  try {
    const { sourceId } = params;

    // Get source
    const sourceResult = await query(
      'SELECT * FROM sources WHERE id = $1',
      [sourceId]
    );

    if (sourceResult.rows.length === 0) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const source = sourceResult.rows[0];

    if (!source.content || source.content.trim().length === 0) {
      console.log(`❌ Source ${sourceId} has no content to process`);
      return NextResponse.json({ error: 'No content to process' }, { status: 400 });
    }
    
    console.log(`📄 Source ${sourceId} content length: ${source.content.length} characters`);

    // Update source status to processing
    await query(
      'UPDATE sources SET status = $1 WHERE id = $2',
      ['processing', sourceId]
    );

    try {
      // Chunk the content
      const chunks = chunkText(source.content);
      console.log(`📊 Created ${chunks.length} chunks for source ${sourceId}`);
      console.log(`📄 Source content length: ${source.content.length} characters`);
      console.log(`📝 First chunk preview: ${chunks[0]?.substring(0, 100)}...`);
      
      if (chunks.length === 0) {
        console.log(`❌ No chunks created for source ${sourceId}`);
        throw new Error('No chunks created from content');
      }

      // Process each chunk
      const chunkPromises = chunks.map(async (chunkContent, index) => {
        const tokenCount = estimateTokenCount(chunkContent);
        const embedding = await generateEmbedding(chunkContent);
        
        console.log(`🔧 Processing chunk ${index + 1}/${chunks.length} (${tokenCount} tokens)`);

        return query(
          `INSERT INTO chunks (source_id, content, chunk_index, token_count, embedding)
           VALUES ($1, $2, $3, $4, $5)`,
          [sourceId, chunkContent, index, tokenCount, JSON.stringify(embedding)]
        );
      });

      await Promise.all(chunkPromises);
      console.log(`✅ Successfully processed all ${chunks.length} chunks for source ${sourceId}`);
      
      // Debug: Check if chunks were actually stored
      const storedChunks = await query('SELECT * FROM chunks WHERE source_id = $1', [sourceId]);
      console.log(`🔍 Debug: Found ${storedChunks.rows.length} chunks stored in database for source ${sourceId}`);

      // Update source status to completed
      await query(
        'UPDATE sources SET status = $1, updated_at = NOW() WHERE id = $2',
        ['completed', sourceId]
      );

      return NextResponse.json({ 
        message: 'Source ingested successfully',
        chunksCreated: chunks.length 
      });

    } catch (processingError) {
      // Update source status to failed
      await query(
        'UPDATE sources SET status = $1 WHERE id = $2',
        ['failed', sourceId]
      );
      throw processingError;
    }

  } catch (error) {
    console.error('Error ingesting source:', error);
    return NextResponse.json({ error: 'Failed to ingest source' }, { status: 500 });
  }
}
