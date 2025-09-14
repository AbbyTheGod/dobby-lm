# 🚀 Quick Start - Live Backend Testing

## Option 1: Free Cloud Database (Recommended - 2 minutes)

### Step 1: Get Free PostgreSQL Database
1. Go to [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com)
2. Sign up for free
3. Create a new project
4. Copy the connection string

### Step 2: Update Environment Variables
Edit your `.env.local` file:

```env
# Replace with your cloud database URL
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Get your Fireworks API key from https://fireworks.ai
FIREWORKS_API_KEY=fw-your-api-key-here

# Optional: Web scraping APIs
ABSTRACTAPI_KEY=your-key-here
```

### Step 3: Start the Application
```bash
npm run dev
```

## Option 2: Local PostgreSQL (10 minutes)

### Step 1: Install PostgreSQL
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Remember the password you set

### Step 2: Enable pgvector
```sql
-- Connect to your database and run:
CREATE EXTENSION vector;
```

### Step 3: Update Environment Variables
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/notebooklm_lite
FIREWORKS_API_KEY=fw-your-api-key-here
```

## Option 3: Docker (5 minutes)

### Step 1: Install Docker Desktop
1. Download from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop

### Step 2: Run PostgreSQL with pgvector
```bash
docker run --name notebooklm-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=notebooklm_lite -p 5432:5432 -d pgvector/pgvector:pg16
```

### Step 3: Update Environment Variables
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/notebooklm_lite
FIREWORKS_API_KEY=fw-your-api-key-here
```

## 🎯 Which Option Do You Prefer?

**A) Cloud Database** - Fastest, no local installation
**B) Local PostgreSQL** - Full control, requires installation  
**C) Docker** - Easy setup, requires Docker
**D) I'll handle the database setup myself**

Let me know which option you'd like and I'll guide you through it!
