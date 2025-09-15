// import { pipeline } from '@xenova/transformers';
import axios from 'axios';
import crypto from 'crypto';
import { extractTextFromURL as extractTextFromURLSimple } from './simple-scraping.js';

// Deterministic mock embedding function for development
async function generateEmbedding(text) {
  try {
    console.log('🔧 Using deterministic hash-based embedding mock');
    const hash = crypto.createHash('sha256').update(text).digest();
    let seed = hash.readUInt32LE(0);
    const embedding = new Array(384);
    for (let i = 0; i < embedding.length; i++) {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      embedding[i] = seed / 4294967296 - 0.5;
    }
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

function chunkText(text, maxTokens = 800) {
  // Simple token estimation: ~4 characters per token
  const maxChars = maxTokens * 4;
  const chunks = [];
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If any chunk is still too long, split by sentences
  const finalChunks = [];
  for (const chunk of chunks) {
    if (chunk.length > maxChars) {
      const sentences = chunk.split(/[.!?]+/);
      let currentSentenceChunk = '';
      
      for (const sentence of sentences) {
        if (currentSentenceChunk.length + sentence.length > maxChars && currentSentenceChunk.length > 0) {
          finalChunks.push(currentSentenceChunk.trim());
          currentSentenceChunk = sentence;
        } else {
          currentSentenceChunk += (currentSentenceChunk ? '. ' : '') + sentence;
        }
      }
      
      if (currentSentenceChunk.trim()) {
        finalChunks.push(currentSentenceChunk.trim());
      }
    } else {
      finalChunks.push(chunk);
    }
  }
  
  return finalChunks;
}

async function extractTextFromPDF(buffer) {
  try {
    console.log('📄 Processing PDF file...');
    
    // For now, we'll use a simple approach that works with Vercel
    // This extracts basic text from PDFs without external dependencies
    
    // Convert buffer to string and try to extract readable text
    const text = buffer.toString('utf8');
    
    // Look for text content in the PDF
    const textMatches = text.match(/BT\s+([^E]+)ET/g);
    
    if (textMatches && textMatches.length > 0) {
      let extractedText = '';
      
      for (const match of textMatches) {
        // Extract text between BT and ET (PDF text objects)
        const textContent = match.replace(/BT\s+/, '').replace(/\s+ET/, '');
        
        // Clean up PDF text formatting
        const cleanText = textContent
          .replace(/\[([^\]]+)\]/g, '$1') // Remove brackets around text
          .replace(/\(([^)]+)\)/g, '$1') // Remove parentheses around text
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (cleanText.length > 0) {
          extractedText += cleanText + ' ';
        }
      }
      
      if (extractedText.trim().length > 0) {
        console.log(`✅ PDF text extracted: ${extractedText.length} characters`);
        return extractedText.trim();
      }
    }
    
    // Fallback: try to extract any readable text
    const readableText = text
      .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII and whitespace
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (readableText.length > 100) {
      console.log(`✅ PDF text extracted (fallback): ${readableText.length} characters`);
      return readableText;
    }
    
    throw new Error('No readable text could be extracted from the PDF. The PDF might be image-based or corrupted.');
    
  } catch (error) {
    console.error('❌ Error processing PDF:', error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}

async function extractTextFromURL(url) {
  try {
    const result = await extractTextFromURLSimple(url);
    return result.content;
  } catch (error) {
    console.error('Error extracting text from URL:', error);
    throw new Error('Failed to extract text from URL');
  }
}

function estimateTokenCount(text) {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

function formatCitations(citations) {
  if (!citations || citations.length === 0) return '';
  
  return citations.map((citation, index) => {
    const sourceId = citation.source_id.substring(0, 8);
    const chunkIndex = citation.chunk_index;
    return `[S${sourceId}:${chunkIndex}]`;
  }).join(' ');
}

export {
  generateEmbedding,
  chunkText,
  extractTextFromPDF,
  extractTextFromURL,
  estimateTokenCount,
  formatCitations,
};
