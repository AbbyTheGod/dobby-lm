// Session-based in-memory database that clears on refresh/close
let sessionData = {
  notebooks: [],
  sources: [],
  chunks: [],
  messages: [],
  study_tools: []
};

let nextId = 1;

function getNextId() {
  return (nextId++).toString();
}

function normalizeSQL(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function query(text, params = []) {
  console.log('🔧 Session Query:', text);
  console.log('🔧 Query params:', params);
  
  const normalizedText = normalizeSQL(text);
  
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Handle CREATE TABLE queries
  if (normalizedText.includes('create table')) {
    console.log('🔧 Table creation requested (already exists in session)');
    return { rows: [] };
  }
  
  // Handle CREATE EXTENSION queries
  if (normalizedText.includes('create extension')) {
    console.log('🔧 Extension creation requested (already exists in session)');
    return { rows: [] };
  }
  
  // Handle CREATE INDEX queries
  if (normalizedText.includes('create index')) {
    console.log('🔧 Index creation requested (already exists in session)');
    return { rows: [] };
  }
  
  // Handle INSERT queries
  if (normalizedText.includes('insert into notebooks')) {
    const [title, description] = params;
    const notebook = {
      id: getNextId(),
      title,
      description: description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    sessionData.notebooks.push(notebook);
    console.log('🔧 Created notebook:', notebook);
    return { rows: [notebook] };
  }
  
  if (normalizedText.includes('insert into sources')) {
    const [notebook_id, title, type, content, url, file_path, status] = params;
    const source = {
      id: getNextId(),
      notebook_id,
      title,
      type,
      content: content || '',
      url: url || null,
      file_path: file_path || null,
      status: status || 'pending',
      created_at: new Date().toISOString()
    };
    sessionData.sources.push(source);
    console.log('🔧 Created source:', source);
    return { rows: [source] };
  }
  
  if (normalizedText.includes('insert into chunks')) {
    const [source_id, content, chunk_index, token_count, embedding] = params;
    const chunk = {
      id: getNextId(),
      source_id,
      content,
      chunk_index,
      token_count: token_count || 0,
      embedding: embedding || null,
      created_at: new Date().toISOString()
    };
    sessionData.chunks.push(chunk);
    console.log('🔧 Created chunk:', chunk);
    return { rows: [chunk] };
  }
  
  if (normalizedText.includes('insert into messages')) {
    const [notebook_id, role, content, citations] = params;
    const message = {
      id: getNextId(),
      notebook_id,
      role,
      content,
      citations: citations ? JSON.parse(citations) : null,
      created_at: new Date().toISOString()
    };
    sessionData.messages.push(message);
    console.log('🔧 Created message:', message);
    return { rows: [message] };
  }
  
  if (normalizedText.includes('insert into study_tools')) {
    const [notebook_id, type, title, content] = params;
    const studyTool = {
      id: getNextId(),
      notebook_id,
      type,
      title,
      content: typeof content === 'string' ? JSON.parse(content) : content,
      created_at: new Date().toISOString()
    };
    sessionData.study_tools.push(studyTool);
    console.log('🔧 Created study tool:', studyTool);
    return { rows: [studyTool] };
  }
  
  // Handle SELECT queries
  if (normalizedText.includes('select * from notebooks')) {
    if (normalizedText.includes('order by') && normalizedText.includes('limit')) {
      const limit = params[0] || 20;
      const offset = params[1] || 0;
      const sortedNotebooks = sessionData.notebooks
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(offset, offset + limit);
      
      // Add source and message counts
      const notebooksWithCounts = sortedNotebooks.map(notebook => ({
        ...notebook,
        source_count: sessionData.sources.filter(s => s.notebook_id === notebook.id).length,
        message_count: sessionData.messages.filter(m => m.notebook_id === notebook.id).length
      }));
      
      console.log('🔧 Fetched notebooks with counts:', notebooksWithCounts.length);
      return { rows: notebooksWithCounts };
    }
    console.log('🔧 Fetched all notebooks:', sessionData.notebooks.length);
    return { rows: sessionData.notebooks };
  }
  
  if (normalizedText.includes('select * from sources')) {
    if (normalizedText.includes('where notebook_id')) {
      const notebookId = params[0];
      const sources = sessionData.sources.filter(s => s.notebook_id === notebookId);
      console.log('🔧 Fetched sources for notebook:', sources.length);
      return { rows: sources };
    }
    if (normalizedText.includes('where id')) {
      const sourceId = params[0];
      const source = sessionData.sources.find(s => s.id === sourceId);
      console.log('🔧 Fetched source by ID:', source ? 'found' : 'not found');
      return { rows: source ? [source] : [] };
    }
    console.log('🔧 Fetched all sources:', sessionData.sources.length);
    return { rows: sessionData.sources };
  }
  
  if (normalizedText.includes('select * from chunks')) {
    if (normalizedText.includes('where source_id')) {
      const sourceId = params[0];
      const chunks = sessionData.chunks.filter(c => c.source_id === sourceId);
      console.log('🔧 Fetched chunks for source:', chunks.length);
      return { rows: chunks };
    }
    console.log('🔧 Fetched all chunks:', sessionData.chunks.length);
    return { rows: sessionData.chunks };
  }
  
  if (normalizedText.includes('select * from messages')) {
    if (normalizedText.includes('where notebook_id')) {
      const notebookId = params[0];
      const messages = sessionData.messages.filter(m => m.notebook_id === notebookId);
      console.log('🔧 Fetched messages for notebook:', messages.length);
      return { rows: messages };
    }
    console.log('🔧 Fetched all messages:', sessionData.messages.length);
    return { rows: sessionData.messages };
  }
  
  if (normalizedText.includes('select * from study_tools')) {
    if (normalizedText.includes('where notebook_id') && normalizedText.includes('and type')) {
      const notebookId = params[0];
      const type = params[1];
      const studyTools = sessionData.study_tools
        .filter(st => st.notebook_id === notebookId && st.type === type)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      console.log('🔧 Fetched study tools:', studyTools.length);
      return { rows: studyTools };
    }
    console.log('🔧 Fetched all study tools:', sessionData.study_tools.length);
    return { rows: sessionData.study_tools };
  }
  
  // Handle UPDATE queries
  if (normalizedText.includes('update sources set status')) {
    const [status, sourceId] = params;
    const source = sessionData.sources.find(s => s.id === sourceId);
    if (source) {
      source.status = status;
      console.log('🔧 Updated source status:', sourceId, status);
    }
    return { rows: [] };
  }
  
  // Handle DELETE queries
  if (normalizedText.includes('delete from chunks where source_id')) {
    const sourceId = params[0];
    const initialLength = sessionData.chunks.length;
    sessionData.chunks = sessionData.chunks.filter(c => c.source_id !== sourceId);
    const deletedCount = initialLength - sessionData.chunks.length;
    console.log('🔧 Deleted chunks for source:', sourceId, deletedCount);
    return { rowCount: deletedCount, rows: [] };
  }
  
  if (normalizedText.includes('delete from sources where id')) {
    const sourceId = params[0];
    const sourceIndex = sessionData.sources.findIndex(s => s.id === sourceId);
    if (sourceIndex !== -1) {
      const deletedSource = sessionData.sources[sourceIndex];
      sessionData.sources.splice(sourceIndex, 1);
      console.log('🔧 Deleted source:', sourceId);
      return { rowCount: 1, rows: [deletedSource] };
    }
    console.log('🔧 Source not found for deletion:', sourceId);
    return { rowCount: 0, rows: [] };
  }
  
  if (normalizedText.includes('update sources set status') && normalizedText.includes('updated_at')) {
    const [status, sourceId] = params;
    const source = sessionData.sources.find(s => s.id === sourceId);
    if (source) {
      source.status = status;
      source.updated_at = new Date().toISOString();
      console.log('🔧 Updated source status and timestamp:', sourceId, status);
    }
    return { rows: [] };
  }
  
  // Handle complex queries with JOINs
  if (normalizedText.includes('select c.*, s.title as source_title') && normalizedText.includes('from chunks c join sources s')) {
    if (normalizedText.includes('where s.notebook_id')) {
      const notebookId = params[0];
      const chunks = sessionData.chunks.filter(c => {
        const source = sessionData.sources.find(s => s.id === c.source_id);
        return source && source.notebook_id === notebookId;
      });
      
      const chunksWithSourceInfo = chunks.map(chunk => {
        const source = sessionData.sources.find(s => s.id === chunk.source_id);
        return {
          ...chunk,
          source_title: source ? source.title : 'Unknown',
          source_type: source ? source.type : 'unknown'
        };
      });
      
      console.log('🔧 Fetched chunks with source info:', chunksWithSourceInfo.length);
      return { rows: chunksWithSourceInfo };
    }
  }
  
  // Handle vector similarity queries (mock)
  if (normalizedText.includes('order by c.embedding') && normalizedText.includes('limit')) {
    const notebookId = params[0];
    const topK = params[2] || 5;
    
    const chunks = sessionData.chunks.filter(c => {
      const source = sessionData.sources.find(s => s.id === c.source_id);
      return source && source.notebook_id === notebookId;
    });
    
    const chunksWithSourceInfo = chunks.slice(0, topK).map(chunk => {
      const source = sessionData.sources.find(s => s.id === chunk.source_id);
      return {
        ...chunk,
        source_title: source ? source.title : 'Unknown',
        source_type: source ? source.type : 'unknown'
      };
    });
    
    console.log('🔧 Vector similarity query (mocked):', chunksWithSourceInfo.length);
    return { rows: chunksWithSourceInfo };
  }
  
  // Handle COUNT queries
  if (normalizedText.includes('select count(*) from')) {
    const tableName = normalizedText.match(/from (\w+)/)[1];
    const count = sessionData[tableName] ? sessionData[tableName].length : 0;
    console.log('🔧 Count query:', tableName, count);
    return { rows: [{ count: count.toString() }] };
  }
  
  // Handle extension queries
  if (normalizedText.includes('select * from pg_extension')) {
    const extname = params[0];
    if (extname === 'vector') {
      console.log('🔧 pgvector extension check: found');
      return { rows: [{ extname: 'vector' }] };
    }
    console.log('🔧 pgvector extension check: not found');
    return { rows: [] };
  }
  
  // Default empty result
  console.log('🔧 No matching query found, returning empty result');
  return { rows: [] };
}

export { query };