# 🚀 Copy & Start Guide

**Get your AI app running in under 5 minutes.**

## Step 1: Copy Template
```bash
# From the AIPatternEnforcer root directory:
cp -r templates/nextjs-app-router my-ai-app
cd my-ai-app
```

## Step 2: Install & Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL (see below)

# Initialize database
npm run db:push
```

## Step 3: Database Setup

### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (if not installed)
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb ai_local_app

# Add to .env:
DATABASE_URL="postgresql://username:password@localhost:5432/ai_local_app"
```

### Option B: Neon (Free PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create database
4. Copy connection string to .env

## Step 4: AI Providers (Optional)

### Local AI (Recommended)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2
```

### API Providers (Fallback)
Add to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=claude-your-key-here
```

## Step 5: Start Development
```bash
npm run dev
```

Visit `http://localhost:3000` - your AI app is running!

## Verify Everything Works

1. **Database**: `npm run db:studio` should open Prisma Studio
2. **AI Chat**: Visit `/api/ai/chat` and send a POST request
3. **Tests**: `npm test` should pass
4. **Build**: `npm run build` should complete

## Next Steps

1. Customize `app/page.tsx` for your use case
2. Add your AI logic to `/api/ai/` routes  
3. Build your UI components
4. Test with real AI providers

**You're ready to build your AI app!** 🎉

---

**Need help?** Check the main README.md for detailed examples and API documentation.