# DobbyLM

A lightweight AI-powered notebook application built with Next.js, Express, and PostgreSQL with pgvector for embeddings. Features grounded Q&A with citations, study tools (quizzes and briefings), and support for multiple source types (text and URLs).

## Features

- **Multi-source Support**: Paste text or add URLs (PDF support temporarily disabled for security)
- **AI-powered Chat**: Grounded Q&A with inline citations via Dobby AI
- **Study Tools**: Generate quizzes and briefings
- **Vector Search**: Semantic search using pgvector embeddings
- **Deterministic Embeddings**: Hash-based mock ensures identical text produces the same vector during development
- **Citation System**: Hover over citations to see source content
- **Modern UI**: Clean 3-column layout with Tailwind CSS and dark mode support
- **Smart Formatting**: AI responses with proper spacing and whitespace preservation
- **Security**: Latest dependencies with no known vulnerabilities
- **Testing Tools**: Built-in scripts to verify setup and API connections

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Express
- **Database**: PostgreSQL with pgvector extension
- **AI**: Fireworks API (Dobby 8B model)
- **Embeddings**: BGE-small-en model via Transformers.js
- **Web Scraping**: ScraperAPI for reliable content extraction
- **Security**: Latest dependencies with no known vulnerabilities

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+ with pgvector extension
- Fireworks API key
- ScraperAPI key (for URL content extraction)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dobbylm
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
   CREATE DATABASE dobbylm;
   \q
   ```

5. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/dobbylm
   FIREWORKS_API_KEY=your_fireworks_api_key_here
   
   # Required: Web scraping API for URL content extraction
   SCRAPERAPI_KEY=your_scraperapi_key_here
   ```

6. **Set up database schema**
   ```bash
   npm run db:setup
   ```

7. **Test your setup** (optional)
   ```bash
   npm run check-setup
   npm run test-fireworks
   npm run test-scraping
   ```

8. **Start the development server**
   ```bash
   npm run dev
   ```

9. **Open your browser**
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
4. The source will be automatically processed and chunked

### Supported Websites
The URL scraper works best with traditional websites that serve content in the initial HTML:

#### ✅ **Well-Supported Sites:**
- **News & Media**: BBC News, CNN, Reuters, Associated Press, The Guardian
- **Educational**: Wikipedia, Britannica, Khan Academy, MIT OpenCourseWare
- **Blogs & Articles**: Medium, Substack, WordPress blogs, Ghost blogs
- **Documentation**: GitHub README files, Stack Overflow, MDN Web Docs, Dev.to
- **Business & Finance**: SEC filings, company websites, financial news
- **Academic**: Research papers (arXiv, PubMed), university websites

#### ❌ **Not Supported:**
- **JavaScript-heavy sites**: Binance main site, social media platforms
- **Single-page apps**: React/Vue applications
- **E-commerce**: Amazon, eBay product pages
- **Real-time data**: Stock tickers, live feeds

#### 🧪 **Test Sites:**
Try these URLs to test the scraper:
- `https://en.wikipedia.org/wiki/Bitcoin`
- `https://www.bbc.com/news/technology`
- `https://medium.com/@username/article-title`

### Chatting
1. Once sources are processed, start asking questions
2. Responses include citations in format `[S{source_id}:{chunk_index}]`
3. Hover over citations to see the original content

### Study Tools
1. Use the right panel to generate:
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
- `POST /api/quiz` - Generate a quiz
- `POST /api/briefing` - Generate a briefing

## Database Schema

### Tables
- `notebooks` - User notebooks
- `sources` - Source documents (text, URL)
- `chunks` - Text chunks with vector embeddings
- `messages` - Chat conversation history
- `study_tools` - Generated quizzes and briefings

### Key Features
- Vector similarity search using cosine distance
- Automatic text chunking (~800 tokens)
- Citation tracking and display
- JSON storage for study tool content

## Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `FIREWORKS_API_KEY` - API key for Fireworks AI (required)
- `SCRAPERAPI_KEY` - API key for ScraperAPI (required for URL scraping)
- `NEXT_PUBLIC_APP_URL` - Application URL (default: http://localhost:3000)

### Model Configuration
- **LLM**: `accounts/fireworks/models/sentientfoundation-serverless/dobby-mini-unhinged-plus-llama-3-1-8b`
- **Embeddings**: `Xenova/bge-small-en-v1.5` (384 dimensions)
- **Chunk Size**: ~800 tokens (configurable)

### Web Scraping APIs
The application uses ScraperAPI for reliable URL content extraction:

**ScraperAPI** (Paid, Required)
- $0.001 per request
- JavaScript rendering, CAPTCHA handling
- Proxy management, IP rotation
- Anti-bot protection bypass
- Reliable content extraction
- Requires `SCRAPERAPI_KEY`

## Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat API with Dobby
│   │   ├── sources/       # Source management
│   │   ├── ingest/        # Content processing
│   │   └── ...            # Other endpoints
│   ├── components/        # React components
│   └── globals.css        # Global styles
├── lib/                   # Utility libraries
│   ├── database.js        # Database connection & handlers
│   ├── text-processing.js # Text chunking & embeddings
│   ├── fireworks.js       # Dobby AI API client
│   └── simple-scraping.js # Web scraping utilities
├── scripts/               # Setup & testing scripts
│   ├── init-db.js         # Database initialization
│   ├── check-setup.js     # Setup verification
│   ├── test-fireworks.js  # AI API testing
│   └── test-scraping.js   # Scraping API testing
└── package.json
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:setup` - Initialize database schema
- `npm run init-db` - Alternative database setup command
- `npm run check-setup` - Verify configuration
- `npm run test-fireworks` - Test AI API connection
- `npm run test-scraping` - Test web scraping API

### Adding New Features
1. Create API routes in `app/api/`
2. Add React components in `app/components/`
3. Update database schema in `scripts/init-db.js`
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

4. **Web Scraping Issues**
   - Verify ScraperAPI key is correct
   - Check API quota and limits
   - Ensure URL is accessible
   - Test with `npm run test-scraping`

5. **Source Processing Issues**
   - Note: PDF support is currently disabled for security
   - Use text input or URL sources instead
   - PDF parsing will be re-enabled in future updates

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

## Recent Updates

### UI/UX Improvements
- ✅ **Fixed** whitespace preservation in AI chat responses
- ✅ **Added** complete dark mode support across all components
- ✅ **Improved** text formatting with proper spacing between sections
- ✅ **Enhanced** visual consistency with blue primary color headings
- ✅ **Fixed** collapsed text issues in bullet points and numbered lists

### Security & Stability Improvements
- ✅ **Removed** vulnerable `pdf-parse` dependency
- ✅ **Updated** all dependencies to latest versions
- ✅ **Fixed** missing npm scripts (`db:setup`, `test-scraping`)
- ✅ **Cleaned** obsolete Next.js configuration
- ✅ **Standardized** environment variable documentation
- ✅ **Enhanced** error handling and debugging

### Dependencies Updated
- `next`: 14.0.4 → 15.5.3
- `axios`: 1.6.2 → 1.12.1
- `@xenova/transformers`: 2.6.2 → 2.17.2

## Support

For issues and questions:
1. Check the troubleshooting section
2. Run `npm run check-setup` to verify configuration
3. Test APIs with `npm run test-fireworks` and `npm run test-scraping`
4. Search existing GitHub issues
5. Create a new issue with detailed information
