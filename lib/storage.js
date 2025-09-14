// File-based storage for Vercel deployment
// This provides persistent storage that works across serverless function invocations

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'notebooks.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load data from file
function loadData() {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  
  // Return default empty structure
  return {
    notebooks: [],
    sources: [],
    chunks: [],
    messages: [],
    study_tools: [],
    nextId: 1
  };
}

// Save data to file
function saveData(data) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
}

// Get next ID
function getNextId(data) {
  return String(data.nextId++);
}

// Main query function
async function query(text, params = []) {
  console.log('🔧 File Database Query:', text);
  console.log('🔧 Query params:', params);
  
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const data = loadData();
  
  // Handle SELECT queries
  if (text.includes('SELECT n.*, COUNT(s.id) as source_count, COUNT(m.id) as message_count FROM notebooks n')) {
    const notebooks = data.notebooks.map(notebook => ({
      ...notebook,
      source_count: data.sources.filter(s => s.notebook_id === notebook.id).length,
      message_count: data.messages.filter(m => m.notebook_id === notebook.id).length
    }));
    return { rows: notebooks };
  }
  
  if (text.includes('SELECT * FROM notebooks')) {
    return { rows: data.notebooks };
  }
  
  if (text.includes('SELECT * FROM sources WHERE notebook_id = $1')) {
    const notebookId = params[0];
    const sources = data.sources.filter(s => s.notebook_id === notebookId);
    return { rows: sources };
  }
  
  if (text.includes('SELECT * FROM sources WHERE id = $1')) {
    const sourceId = params[0];
    const sources = data.sources.filter(s => s.id === sourceId);
    return { rows: sources };
  }
  
  if (text.includes('SELECT * FROM chunks WHERE source_id = $1')) {
    const sourceId = params[0];
    const chunks = data.chunks.filter(c => c.source_id === sourceId);
    return { rows: chunks };
  }
  
  if (text.includes('SELECT * FROM messages WHERE notebook_id = $1')) {
    const notebookId = params[0];
    const messages = data.messages.filter(m => m.notebook_id === notebookId);
    return { rows: messages };
  }
  
  if (text.includes('SELECT * FROM study_tools WHERE notebook_id = $1')) {
    const notebookId = params[0];
    const studyTools = data.study_tools.filter(st => st.notebook_id === notebookId);
    return { rows: studyTools };
  }
  
  // Handle vector similarity query (simplified for file storage)
  if (text.includes('SELECT c.*, s.title as source_title, s.type as source_type FROM chunks c JOIN sources s ON c.source_id = s.id WHERE s.notebook_id = $1 ORDER BY c.embedding <=> $2 LIMIT $3')) {
    const notebookId = params[0];
    const queryEmbedding = params[1];
    const limit = params[2];
    
    // Get all chunks for the notebook (simplified - no actual vector similarity)
    const chunks = data.chunks.filter(c => {
      const source = data.sources.find(s => s.id === c.source_id);
      return source && source.notebook_id === notebookId;
    });
    
    // Add source information to chunks
    const chunksWithSources = chunks.slice(0, limit).map(chunk => {
      const source = data.sources.find(s => s.id === chunk.source_id);
      return {
        ...chunk,
        source_title: source ? source.title : 'Unknown',
        source_type: source ? source.type : 'unknown'
      };
    });
    
    return { rows: chunksWithSources };
  }
  
  // Handle INSERT queries
  if (text.includes('INSERT INTO notebooks')) {
    const newNotebook = {
      id: getNextId(data),
      title: params[0],
      description: params[1],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.notebooks.push(newNotebook);
    saveData(data);
    return { rows: [newNotebook] };
  }
  
  if (text.includes('INSERT INTO sources')) {
    const newSource = {
      id: getNextId(data),
      notebook_id: params[0],
      title: params[1],
      type: params[2],
      content: params[3],
      url: params[4] || null,
      file_path: params[5] || null,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    data.sources.push(newSource);
    saveData(data);
    return { rows: [newSource] };
  }
  
  if (text.includes('INSERT INTO chunks')) {
    const newChunk = {
      id: getNextId(data),
      source_id: params[0],
      content: params[1],
      embedding: params[2],
      chunk_index: params[3],
      token_count: params[4] || 0,
      created_at: new Date().toISOString()
    };
    data.chunks.push(newChunk);
    saveData(data);
    return { rows: [newChunk] };
  }
  
  if (text.includes('INSERT INTO messages')) {
    const newMessage = {
      id: getNextId(data),
      notebook_id: params[0],
      role: params[1],
      content: params[2],
      citations: params[3] || null,
      created_at: new Date().toISOString()
    };
    data.messages.push(newMessage);
    saveData(data);
    return { rows: [newMessage] };
  }
  
  if (text.includes('INSERT INTO study_tools')) {
    const newStudyTool = {
      id: getNextId(data),
      notebook_id: params[0],
      type: params[1],
      title: params[2],
      content: params[3],
      created_at: new Date().toISOString()
    };
    data.study_tools.push(newStudyTool);
    saveData(data);
    return { rows: [newStudyTool] };
  }
  
  // Handle UPDATE queries
  if (text.includes('UPDATE notebooks SET updated_at = CURRENT_TIMESTAMP WHERE id = $1')) {
    const notebookId = params[0];
    const notebook = data.notebooks.find(n => n.id === notebookId);
    if (notebook) {
      notebook.updated_at = new Date().toISOString();
      saveData(data);
    }
    return { rows: [] };
  }
  
  if (text.includes('UPDATE sources SET status = $1 WHERE id = $2')) {
    const status = params[0];
    const sourceId = params[1];
    const source = data.sources.find(s => s.id === sourceId);
    if (source) {
      source.status = status;
      saveData(data);
    }
    return { rows: [] };
  }
  
  if (text.includes('UPDATE sources SET status = $1, updated_at = NOW() WHERE id = $2')) {
    const status = params[0];
    const sourceId = params[1];
    const source = data.sources.find(s => s.id === sourceId);
    if (source) {
      source.status = status;
      source.updated_at = new Date().toISOString();
      saveData(data);
    }
    return { rows: [] };
  }
  
  // Default empty result
  console.log('🔧 No matching query found, returning empty result');
  return { rows: [] };
}

async function getClient() {
  // Mock client for file database
  return {
    query: query,
    release: () => {}
  };
}

function getPool() {
  // Mock pool for file database
  return {
    query: query,
    connect: () => getClient()
  };
}

export {
  query,
  getClient,
  getPool,
};
