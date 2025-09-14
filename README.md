# NotebookLM-lite

A lightweight AI-powered notebook application built with Next.js, Express, and PostgreSQL with pgvector for embeddings. Features grounded Q&A with citations, study tools (flashcards, quizzes, briefings), and support for multiple source types (PDF, text, URLs).

## Features

- **Multi-source Support**: Upload PDFs, paste text, or add URLs
- **AI-powered Chat**: Grounded Q&A with inline citations
- **Study Tools**: Generate flashcards, quizzes, and briefings
- **Vector Search**: Semantic search using pgvector embeddings
- **Citation System**: Hover over citations to see source content
- **Modern UI**: Clean 3-column layout with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Express
- **Database**: PostgreSQL with pgvector extension
- **AI**: Fireworks API (Dobby 8B model)
- **Embeddings**: BGE-small-en model via Transformers.js
- **File Processing**: PDF parsing, web scraping

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+ with pgvector extension
- Fireworks API key
- (Optional) Web scraping API keys for better URL content extraction

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notebooklm-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL with pgvector**
   ```bash
   # Install pgvector extension
   # On Ubuntu/Debian:
   sudo apt install postgresql-14-pgvector
   
   # On macOS with Homebrew:
   brew install pgvector
   ```

4. **Create database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE notebooklm_lite;
   \q
   ```

5. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/notebooklm_lite
   FIREWORKS_API_KEY=your_fireworks_api_key_here
   
   # Optional: Web scraping APIs for better URL content extraction
   ABSTRACTAPI_KEY=your_abstractapi_key_here
   EXTRACTOR_API_KEY=your_extractor_api_key_here
   APYHUB_API_KEY=your_apyhub_api_key_here
   ```

6. **Set up database schema**
   ```bash
   npm run db:setup
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Notebook
1. Click "New" to create a new notebook
2. Enter a title and optional description
3. Click "Create"

### Adding Sources
1. Select your notebook
2. Click "Add Source" in the sources panel
3. Choose source type:
   - **Text**: Paste content directly
   - **URL**: Enter a web page URL
   - **PDF**: Upload a PDF file
4. The source will be automatically processed and chunked

### Chatting
1. Once sources are processed, start asking questions
2. Responses include citations in format `[S{source_id}:{chunk_index}]`
3. Hover over citations to see the original content

### Study Tools
1. Use the right panel to generate:
   - **Flashcards**: Interactive study cards
   - **Quizzes**: Multiple choice and short answer questions
   - **Briefings**: Comprehensive summaries
2. Click "Generate" buttons to create new study materials

## API Endpoints

- `POST /api/notebooks` - Create a new notebook
- `GET /api/notebooks` - List all notebooks
- `POST /api/sources` - Add a new source
- `GET /api/sources` - List sources for a notebook
- `POST /api/ingest/:sourceId` - Process and embed a source
- `POST /api/chat` - Send a chat message
- `POST /api/flashcards` - Generate flashcards
- `POST /api/quiz` - Generate a quiz
- `POST /api/briefing` - Generate a briefing

## Database Schema

### Tables
- `notebooks` - User notebooks
- `sources` - Source documents (PDF, text, URL)
- `chunks` - Text chunks with vector embeddings
- `messages` - Chat conversation history
- `study_tools` - Generated flashcards, quizzes, briefings

### Key Features
- Vector similarity search using cosine distance
- Automatic text chunking (~800 tokens)
- Citation tracking and display
- JSON storage for study tool content

## Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `FIREWORKS_API_KEY` - API key for Fireworks AI
- `NEXT_PUBLIC_APP_URL` - Application URL (default: http://localhost:3000)

### Model Configuration
- **LLM**: `accounts/fireworks/models/sentientfoundation-serverless/dobby-mini-unhinged-plus-llama-3-1-8b`
- **Embeddings**: `Xenova/bge-small-en-v1.5` (384 dimensions)
- **Chunk Size**: ~800 tokens (configurable)

### Web Scraping APIs
The application uses multiple APIs for URL content extraction with automatic fallback:

1. **Mercury Parser** (Free, Default)
   - 1,000 requests/month free
   - Excellent article extraction
   - No API key required

2. **AbstractAPI** (Free)
   - 1,000 requests/month free
   - JavaScript rendering, CAPTCHA handling
   - Proxy management, IP rotation
   - Requires `ABSTRACTAPI_KEY`

3. **Extractor API** (Paid)
   - $0.001 per request
   - JavaScript rendering, IP rotation
   - Requires `EXTRACTOR_API_KEY`

4. **ApyHub** (Free)
   - 2M requests/month free
   - Simple text extraction
   - Requires `APYHUB_API_KEY`

5. **Fallback Scraping** (Free)
   - Direct scraping with Cheerio
   - Always available as last resort
   - Basic content extraction

## Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── globals.css        # Global styles
├── lib/                   # Utility libraries
│   ├── database.js        # Database connection
│   ├── text-processing.js # Text chunking & embeddings
│   └── fireworks.js       # AI API client
├── scripts/               # Database setup scripts
└── package.json
```

### Adding New Features
1. Create API routes in `app/api/`
2. Add React components in `app/components/`
3. Update database schema in `scripts/setup-db.js`
4. Add utility functions in `lib/`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check connection string in `.env.local`
   - Ensure pgvector extension is installed

2. **Embedding Generation Fails**
   - Check internet connection (model downloads on first use)
   - Verify sufficient disk space for model cache

3. **Fireworks API Errors**
   - Verify API key is correct
   - Check API quota and limits
   - Ensure model name is correct

4. **PDF Processing Issues**
   - Verify PDF is not password protected
   - Check file size limits
   - Ensure PDF contains extractable text

### Performance Tips
- Use SSD storage for better embedding performance
- Increase PostgreSQL shared_buffers for large datasets
- Consider using connection pooling for production
- Monitor memory usage during embedding generation

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information
