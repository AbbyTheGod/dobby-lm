# DobbyLM

A lightweight AI-powered notebook application built with Next.js and session-based storage. Features grounded Q&A with citations, study tools (quizzes and briefings), and support for multiple source types (text and URLs).

## 🚀 Live Demo

**Try DobbyLM Live** - Ready to use!

*All API keys are already configured - just start chatting!*

## ✨ Features

- 📄 **Multi-source Support**: Paste text or add URLs (PDF support temporarily disabled for security)
- 🤖 **AI-powered Chat**: Grounded Q&A with inline citations via Dobby AI
- 📚 **Study Tools**: Generate quizzes and briefings
- 🔍 **Vector Search**: Semantic search using in-memory embeddings
- 🎯 **Deterministic Embeddings**: Hash-based mock ensures identical text produces the same vector during development
- 📖 **Citation System**: Hover over citations to see source content
- 🎨 **Modern UI**: Clean 3-column layout with Tailwind CSS and dark mode support
- ✨ **Smart Formatting**: AI responses with proper spacing and whitespace preservation
- 🔒 **Security**: Latest dependencies with no known vulnerabilities
- 🛠️ **Testing Tools**: Built-in scripts to verify setup and API connections

## 🛠️ Tech Stack

- ⚛️ **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- 🔧 **Backend**: Next.js API Routes
- 💾 **Storage**: Session-based in-memory database (clears on refresh)
- 🤖 **AI**: Fireworks API (Dobby 8B model)
- 🧠 **Embeddings**: BGE-small-en model via Transformers.js
- 🌐 **Web Scraping**: Perplexity API for JavaScript-heavy sites, SPAs, social media



## 📖 Usage

### 📝 Creating a Notebook
1. Click "New" to create a new notebook
2. Enter a title and optional description
3. Click "Create"

### 📄 Adding Sources
1. Select your notebook
2. Click "Add Source" in the sources panel
3. Choose source type:
   - **Text**: Paste content directly
   - **URL**: Enter a web page URL
4. The source will be automatically processed and chunked

### 🌐 Supported Websites
✅ **Works Great**: Wikipedia, news sites, blogs, documentation, articles, JavaScript-heavy sites, SPAs, social media, e-commerce
❌ **Not Supported**: Paywalled content, private/restricted sites

### 💬 Chatting
1. Once sources are processed, start asking questions
2. Responses include citations in format `[S{source_id}:{chunk_index}]`
3. Hover over citations to see the original content

### 📚 Study Tools
1. Use the right panel to generate:
   - **Quizzes**: Multiple choice and short answer questions
   - **Briefings**: Comprehensive summaries
2. Click "Generate" buttons to create new study materials


## License

MIT License


