// Session-only in-memory database
// Data disappears when user closes site or server restarts

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
  
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Handle SELECT queries
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
  
  if (text.includes('SELECT * FROM study_tools WHERE notebook_id = $1')) {
    const notebookId = params[0];
    const studyTools = sessionData.study_tools.filter(st => st.notebook_id === notebookId);
    return { rows: studyTools };
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
      status: 'completed',
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
      embedding: params[2],
      chunk_index: params[3],
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
  
  // Default empty result
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