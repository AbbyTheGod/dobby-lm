// import { pipeline } from '@xenova/transformers';
import pdfParse from 'pdf-parse';
import { extractTextFromURL as extractTextFromURLSimple } from './simple-scraping.js';

// Mock embedding function for development
async function getEmbeddingPipeline() {
  console.log('🔧 Using mock embedding pipeline for development');
  return {
    async (text) {
      // Generate a mock embedding vector (384 dimensions for bge-small-en)
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random() - 0.5);
      return { data: mockEmbedding };
    }
  };
}

async function generateEmbedding(text) {
  try {
    const pipeline = await getEmbeddingPipeline();
    const result = await pipeline(text);
    return Array.from(result.data);
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
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF');
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
