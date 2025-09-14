// Mock database for immediate testing
// This provides sample data so you can test the UI and functionality

const mockData = {
  notebooks: [
    {
      id: '1',
      title: 'AI Research Notes',
      description: 'My research on artificial intelligence and machine learning',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2', 
      title: 'Web Development Guide',
      description: 'Notes on modern web development practices',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  sources: [
    {
      id: '1',
      notebook_id: '1',
      title: 'Introduction to AI',
      type: 'text',
      content: 'Artificial Intelligence (AI) is a branch of computer science that aims to create machines capable of intelligent behavior. AI systems can learn, reason, and make decisions similar to humans.',
      status: 'completed',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      notebook_id: '1', 
      title: 'Machine Learning Basics',
      type: 'text',
      content: 'Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed. It uses algorithms to identify patterns in data.',
      status: 'completed',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      notebook_id: '2',
      title: 'React Best Practices',
      type: 'text', 
      content: 'React is a JavaScript library for building user interfaces. Best practices include using functional components, hooks, and proper state management.',
      status: 'completed',
      created_at: new Date().toISOString()
    }
  ],
  chunks: [
    {
      id: '1',
      source_id: '1',
      content: 'Artificial Intelligence (AI) is a branch of computer science that aims to create machines capable of intelligent behavior.',
      embedding: [0.1, 0.2, 0.3], // Mock embedding
      chunk_index: 0,
      created_at: new Date().toISOString()
    },
    {
      id: '2', 
      source_id: '1',
      content: 'AI systems can learn, reason, and make decisions similar to humans.',
      embedding: [0.4, 0.5, 0.6],
      chunk_index: 1,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      source_id: '2', 
      content: 'Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed.',
      embedding: [0.7, 0.8, 0.9],
      chunk_index: 0,
      created_at: new Date().toISOString()
    }
  ],
  messages: [
    {
      id: '1',
      notebook_id: '1',
      role: 'user',
      content: 'What is artificial intelligence?',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      notebook_id: '1', 
      role: 'assistant',
      content: 'Based on the sources, artificial intelligence (AI) is a branch of computer science that aims to create machines capable of intelligent behavior [S1:0]. AI systems can learn, reason, and make decisions similar to humans [S1:1].',
      created_at: new Date().toISOString()
    }
  ],
  study_tools: [
    {
      id: '1',
      notebook_id: '1',
      type: 'flashcards',
      content: JSON.stringify([
        {
          front: 'What is AI?',
          back: 'A branch of computer science that aims to create machines capable of intelligent behavior'
        },
        {
          front: 'What can AI systems do?',
          back: 'Learn, reason, and make decisions similar to humans'
        }
      ]),
      created_at: new Date().toISOString()
    }
  ]
};

// Mock database functions
const mockQuery = async (query, params = []) => {
  console.log('🔧 Mock Database Query:', query);
  
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Handle different query types
  if (query.includes('SELECT * FROM notebooks')) {
    return { rows: mockData.notebooks };
  }
  
  if (query.includes('SELECT * FROM sources WHERE notebook_id')) {
    const notebookId = params[0];
    return { 
      rows: mockData.sources.filter(s => s.notebook_id === notebookId) 
    };
  }
  
  if (query.includes('INSERT INTO notebooks')) {
    const newNotebook = {
      id: String(mockData.notebooks.length + 1),
      title: params[0],
      description: params[1],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockData.notebooks.push(newNotebook);
    return { rows: [newNotebook] };
  }
  
  if (query.includes('INSERT INTO sources')) {
    const newSource = {
      id: String(mockData.sources.length + 1),
      notebook_id: params[0],
      title: params[1],
      type: params[2],
      content: params[3],
      url: params[4] || null,
      file_path: params[5] || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    mockData.sources.push(newSource);
    console.log('🔧 Mock Database: Created source:', newSource);
    return { rows: [newSource] };
  }
  
  if (query.includes('INSERT INTO messages')) {
    const newMessage = {
      id: String(mockData.messages.length + 1),
      notebook_id: params[0],
      role: params[1],
      content: params[2],
      created_at: new Date().toISOString()
    };
    mockData.messages.push(newMessage);
    return { rows: [newMessage] };
  }
  
  if (query.includes('SELECT * FROM messages WHERE notebook_id')) {
    const notebookId = params[0];
    return { 
      rows: mockData.messages.filter(m => m.notebook_id === notebookId) 
    };
  }
  
  if (query.includes('SELECT * FROM chunks WHERE source_id')) {
    const sourceId = params[0];
    return { 
      rows: mockData.chunks.filter(c => c.source_id === sourceId) 
    };
  }
  
  if (query.includes('SELECT * FROM study_tools WHERE notebook_id')) {
    const notebookId = params[0];
    return { 
      rows: mockData.study_tools.filter(st => st.notebook_id === notebookId) 
    };
  }
  
  // Default empty result
  return { rows: [] };
};

export { mockQuery as query };
