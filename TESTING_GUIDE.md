# 🧪 NotebookLM-lite Testing Guide

This guide will help you test all components of the NotebookLM-lite application.

## 📋 **Prerequisites Checklist**

Before testing, ensure you have:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL with pgvector extension
- [ ] Fireworks API key
- [ ] (Optional) Web scraping API keys

## 🚀 **Quick Start Testing**

### **1. Test Dependencies**
```bash
npm install
```

### **2. Test Fireworks API (Recommended First)**
```bash
npm run test-fireworks
```

### **3. Test Web Scraping APIs**
```bash
npm run test-scraping
```

### **4. Check Overall Setup**
```bash
npm run check-setup
```

### **5. Start the Application**
```bash
npm run dev
```

## 🔧 **Detailed Testing Steps**

### **Step 1: Environment Setup**

1. **Edit `.env.local`** with your actual credentials:
   ```env
   # Database (Required)
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/notebooklm_lite
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=notebooklm_lite
   DB_USER=your_username
   DB_PASSWORD=your_password

   # Fireworks API (Required)
   FIREWORKS_API_KEY=fw-your-actual-api-key-here

   # Web Scraping APIs (Optional)
   SCRAPERAPI_KEY=your_scraperapi_key_here
   ```

### **Step 2: Database Setup**

1. **Install PostgreSQL** (if not already installed)
2. **Install pgvector extension**:
   ```sql
   CREATE EXTENSION vector;
   ```
3. **Create database**:
   ```sql
   CREATE DATABASE notebooklm_lite;
   ```
4. **Run database setup**:
   ```bash
   npm run db:setup
   ```

### **Step 3: Test Individual Components**

#### **A. Test Fireworks API**
```bash
npm run test-fireworks
```

**Expected Output:**
```
🧪 Testing Fireworks API with Dobby Model

✅ Fireworks API key found
🤖 Model: accounts/fireworks/models/sentientfoundation-serverless/dobby-mini-unhinged-plus-llama-3-1-8b

📤 Sending test message...
✅ Response received successfully!
⏱️  Response time: 1234ms
📝 Response length: 245 characters

🤖 Dobby Response:
──────────────────────────────────────────────────
Hello! I'm Dobby, your AI assistant...
──────────────────────────────────────────────────

🎉 Fireworks API test completed successfully!
```

#### **B. Test Web Scraping**
```bash
npm run test-scraping
```

**Expected Output:**
```
🧪 Testing Web Scraping APIs

📋 Available Scraping APIs:
  ✅ Mercury Parser (Free)
  ✅ AbstractAPI (Free)
  ❌ Extractor API (Paid)
  ❌ ApyHub (Free)

🔗 Testing URL Extraction:

Testing: https://en.wikipedia.org/wiki/Artificial_intelligence
✅ Success!
   Title: Artificial intelligence - Wikipedia
   Content Length: 12345 characters
   Source: mercury

🎉 Scraping test complete!
```

#### **C. Test Database Connection**
```bash
npm run check-setup
```

**Expected Output:**
```
🔍 Checking NotebookLM-lite setup...

📋 Environment Variables:
  ✅ DATABASE_URL: Set
  ✅ FIREWORKS_API_KEY: Set

🗄️  Database Connection:
  ✅ Connected to PostgreSQL
  ✅ pgvector extension installed

📊 Database Tables:
  ✅ notebooks
  ✅ sources
  ✅ chunks
  ✅ messages
  ✅ study_tools

🤖 Fireworks API:
  ✅ API key is valid

🎉 Setup check complete!
```

### **Step 4: Test the Application**

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** to `http://localhost:3000`

3. **Test the UI**:
   - [ ] Dark/light mode toggle works
   - [ ] Responsive design on mobile
   - [ ] Smooth animations and transitions
   - [ ] All buttons and interactions work

### **Step 5: Test Core Functionality**

#### **A. Create a Notebook**
1. Click "New" button
2. Enter title: "Test Notebook"
3. Enter description: "Testing the application"
4. Click "Create"
5. ✅ Verify notebook appears in sidebar

#### **B. Add Sources**
1. Click "Add Source"
2. **Test Text Source**:
   - Select "Text" type
   - Enter title: "Sample Text"
   - Paste some text content
   - Click "Add Source"
   - ✅ Verify source appears with "pending" status
   - ✅ Wait for status to change to "completed"

3. **Test URL Source**:
   - Select "URL" type
   - Enter title: "Wikipedia Article"
   - Enter URL: "https://en.wikipedia.org/wiki/Artificial_intelligence"
   - Click "Add Source"
   - ✅ Verify source is processed

#### **C. Test Chat Interface**
1. Select your notebook
2. Wait for sources to be processed
3. **Ask a question**: "What is artificial intelligence?"
4. ✅ Verify Dobby responds with citations
5. ✅ Hover over citations to see source content
6. ✅ Check that responses are grounded to sources

#### **D. Test Study Tools**
1. **Generate Flashcards**:
   - Go to Tools panel
   - Click "Generate Flashcards"
   - ✅ Verify flashcards are created
   - ✅ Test flashcard interaction

2. **Generate Quiz**:
   - Click "Generate Quiz"
   - ✅ Verify quiz is created
   - ✅ Test quiz questions and answers

3. **Generate Briefing**:
   - Click "Generate Briefing"
   - ✅ Verify briefing is created
   - ✅ Check formatting and citations

### **Step 6: Test Mobile Experience**

1. **Open browser dev tools** (F12)
2. **Switch to mobile view**
3. **Test mobile navigation**:
   - [ ] Bottom navigation works
   - [ ] Tab switching is smooth
   - [ ] All features accessible on mobile

## 🐛 **Troubleshooting Common Issues**

### **Database Issues**
```bash
# Check PostgreSQL is running
pg_ctl status

# Test connection
psql -U your_username -d notebooklm_lite -c "SELECT 1;"
```

### **API Issues**
```bash
# Test Fireworks API
npm run test-fireworks

# Check API key format
echo $FIREWORKS_API_KEY
```

### **Port Issues**
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Use different port
npm run dev -- -p 3001
```

### **Dependency Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📊 **Performance Testing**

### **Load Testing**
1. **Add multiple sources** (5-10 documents)
2. **Generate multiple study tools**
3. **Test concurrent chat requests**
4. **Monitor response times**

### **Memory Testing**
1. **Upload large PDFs** (10MB+)
2. **Process many sources**
3. **Monitor memory usage**
4. **Test with long conversations**

## ✅ **Success Criteria**

Your testing is successful when:

- [ ] All test scripts pass
- [ ] Database connection works
- [ ] Fireworks API responds correctly
- [ ] Web scraping works for URLs
- [ ] UI is responsive and beautiful
- [ ] Chat interface works with citations
- [ ] Study tools generate correctly
- [ ] Mobile experience is smooth
- [ ] Dark/light mode works
- [ ] All animations are smooth

## 🎉 **Ready for Production**

Once all tests pass:

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Deploy to your hosting platform**

## 📞 **Getting Help**

If you encounter issues:

1. **Check the logs** in terminal
2. **Run diagnostic scripts**:
   ```bash
   npm run check-setup
   npm run test-fireworks
   npm run test-scraping
   ```
3. **Check the documentation** in `/docs` folder
4. **Review error messages** carefully
5. **Test individual components** to isolate issues

Happy testing! 🚀
