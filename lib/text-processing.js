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
  throw new Error('PDF functionality has been removed. Please use text or URL sources only.');
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
