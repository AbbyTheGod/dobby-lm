// Session-only in-memory database for Vercel deployment
// Data persists during the serverless function execution but resets between invocations

let sessionData = {
  notebooks: [],
  sources: [],
  chunks: [],
  messages: [],
  study_tools: []
};

let nextId = 1;

function getNextId() {
  return String(nextId++);
}

async function query(text, params = []) {
  console.log('🔧 Session Database Query:', text);
  console.log('🔧 Query params:', params);
  
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Handle SELECT queries
  if (text.includes('SELECT n.*, COUNT(s.id) as source_count, COUNT(m.id) as message_count FROM notebooks n LEFT JOIN sources s ON n.id = s.notebook_id LEFT JOIN messages m ON n.id = m.notebook_id GROUP BY n.id ORDER BY n.updated_at DESC LIMIT $1 OFFSET $2')) {
    const limit = params[0] || 50;
    const offset = params[1] || 0;
    
    const notebooks = sessionData.notebooks.map(notebook => ({
      ...notebook,
      source_count: sessionData.sources.filter(s => s.notebook_id === notebook.id).length,
      message_count: sessionData.messages.filter(m => m.notebook_id === notebook.id).length
    }));
    
    // Sort by updated_at DESC and apply limit/offset
    const sortedNotebooks = notebooks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    const paginatedNotebooks = sortedNotebooks.slice(offset, offset + limit);
    
    return { rows: paginatedNotebooks };
  }
  
  if (text.includes('SELECT n.*, COUNT(s.id) as source_count, COUNT(m.id) as message_count FROM notebooks n')) {
    const notebooks = sessionData.notebooks.map(notebook => ({
      ...notebook,
      source_count: sessionData.sources.filter(s => s.notebook_id === notebook.id).length,
      message_count: sessionData.messages.filter(m => m.notebook_id === notebook.id).length
    }));
    return { rows: notebooks };
  }
  
  if (text.includes('SELECT * FROM notebooks')) {
    return { rows: sessionData.notebooks };
  }
  
  if (text.includes('SELECT * FROM sources WHERE notebook_id = $1')) {
    const notebookId = params[0];
    const sources = sessionData.sources.filter(s => s.notebook_id === notebookId);
    return { rows: sources };
  }
  
  if (text.includes('SELECT * FROM sources WHERE id = $1')) {
    const sourceId = params[0];
    const sources = sessionData.sources.filter(s => s.id === sourceId);
    return { rows: sources };
  }
  
  if (text.includes('SELECT * FROM chunks WHERE source_id = $1')) {
    const sourceId = params[0];
    const chunks = sessionData.chunks.filter(c => c.source_id === sourceId);
    return { rows: chunks };
  }
  
  if (text.includes('SELECT * FROM messages WHERE notebook_id = $1')) {
    const notebookId = params[0];
    const messages = sessionData.messages.filter(m => m.notebook_id === notebookId);
    return { rows: messages };
  }
  
  if (text.includes('SELECT * FROM study_tools WHERE notebook_id = $1 AND type = $2')) {
    const notebookId = params[0];
    const type = params[1];
    const studyTools = sessionData.study_tools.filter(st => st.notebook_id === notebookId && st.type === type);
    return { rows: studyTools };
  }
  
  if (text.includes('SELECT * FROM study_tools WHERE notebook_id = $1')) {
    const notebookId = params[0];
    const studyTools = sessionData.study_tools.filter(st => st.notebook_id === notebookId);
    return { rows: studyTools };
  }
  
  // Handle chunks with sources JOIN queries
  if (text.includes('SELECT c.*, s.title as source_title FROM chunks c JOIN sources s ON c.source_id = s.id WHERE s.notebook_id = $1 ORDER BY s.created_at, c.chunk_index')) {
    const notebookId = params[0];
    
    // Get all chunks for the notebook
    const chunks = sessionData.chunks.filter(c => {
      const source = sessionData.sources.find(s => s.id === c.source_id);
      return source && source.notebook_id === notebookId;
    });
    
    // Add source information to chunks
    const chunksWithSources = chunks.map(chunk => {
      const source = sessionData.sources.find(s => s.id === chunk.source_id);
      return {
        ...chunk,
        source_title: source ? source.title : 'Unknown'
      };
    });
    
    return { rows: chunksWithSources };
  }
  
  // Handle vector similarity query (simplified for session storage)
  if (text.includes('SELECT c.*, s.title as source_title, s.type as source_type FROM chunks c JOIN sources s ON c.source_id = s.id WHERE s.notebook_id = $1 ORDER BY c.embedding <=> $2 LIMIT $3')) {
    const notebookId = params[0];
    const queryEmbedding = params[1];
    const limit = params[2];
    
    // Get all chunks for the notebook (simplified - no actual vector similarity)
    const chunks = sessionData.chunks.filter(c => {
      const source = sessionData.sources.find(s => s.id === c.source_id);
      return source && source.notebook_id === notebookId;
    });
    
    // Add source information to chunks
    const chunksWithSources = chunks.slice(0, limit).map(chunk => {
      const source = sessionData.sources.find(s => s.id === chunk.source_id);
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
      id: getNextId(),
      title: params[0],
      description: params[1],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    sessionData.notebooks.push(newNotebook);
    return { rows: [newNotebook] };
  }
  
  if (text.includes('INSERT INTO sources')) {
    const newSource = {
      id: getNextId(),
      notebook_id: params[0],
      title: params[1],
      type: params[2],
      content: params[3],
      url: params[4] || null,
      file_path: params[5] || null,
      status: 'pending', // Match the SQL default
      created_at: new Date().toISOString()
    };
    sessionData.sources.push(newSource);
    return { rows: [newSource] };
  }
  
  if (text.includes('INSERT INTO chunks')) {
    const newChunk = {
      id: getNextId(),
      source_id: params[0],
      content: params[1],
      chunk_index: params[2],
      token_count: params[3] || 0,
      embedding: params[4],
      created_at: new Date().toISOString()
    };
    sessionData.chunks.push(newChunk);
    return { rows: [newChunk] };
  }
  
  if (text.includes('INSERT INTO messages')) {
    const newMessage = {
      id: getNextId(),
      notebook_id: params[0],
      role: params[1],
      content: params[2],
      citations: params[3] || null,
      created_at: new Date().toISOString()
    };
    sessionData.messages.push(newMessage);
    return { rows: [newMessage] };
  }
  
  if (text.includes('INSERT INTO study_tools')) {
    const newStudyTool = {
      id: getNextId(),
      notebook_id: params[0],
      type: params[1],
      title: params[2],
      content: params[3],
      created_at: new Date().toISOString()
    };
    sessionData.study_tools.push(newStudyTool);
    return { rows: [newStudyTool] };
  }
  
  // Handle UPDATE queries
  if (text.includes('UPDATE notebooks SET updated_at = CURRENT_TIMESTAMP WHERE id = $1')) {
    const notebookId = params[0];
    const notebook = sessionData.notebooks.find(n => n.id === notebookId);
    if (notebook) {
      notebook.updated_at = new Date().toISOString();
    }
    return { rows: [] };
  }
  
  if (text.includes('UPDATE sources SET status = $1 WHERE id = $2')) {
    const status = params[0];
    const sourceId = params[1];
    const source = sessionData.sources.find(s => s.id === sourceId);
    if (source) {
      source.status = status;
    }
    return { rows: [] };
  }
  
  if (text.includes('UPDATE sources SET status = $1, updated_at = NOW() WHERE id = $2')) {
    const status = params[0];
    const sourceId = params[1];
    const source = sessionData.sources.find(s => s.id === sourceId);
    if (source) {
      source.status = status;
      source.updated_at = new Date().toISOString();
    }
    return { rows: [] };
  }
  
  // Default empty result
  console.log('🔧 No matching query found, returning empty result');
  return { rows: [] };
}

async function getClient() {
  // Mock client for session database
  return {
    query: query,
    release: () => {}
  };
}

function getPool() {
  // Mock pool for session database
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