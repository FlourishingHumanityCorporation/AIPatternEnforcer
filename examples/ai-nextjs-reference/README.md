# AI-First Next.js Reference Implementation

**Lightweight reference for building AI-powered Next.js applications**

This is a **reference implementation** - not a full starter. It contains the essential patterns, configurations, and
components needed to build AI applications without the bloat.

## Table of Contents

1. [📁 What's Included](#-whats-included)
2. [🚀 Quick Setup](#-quick-setup)
3. [🏗️ Architecture Patterns](#-architecture-patterns)
  4. [1. Local-First AI Service](#1-local-first-ai-service)
  5. [2. Streaming Components](#2-streaming-components)
  6. [3. Vector Database Integration](#3-vector-database-integration)
7. [🔧 Key Features](#-key-features)
8. [📊 Dependencies](#-dependencies)
  9. [Core AI Stack](#core-ai-stack)
  10. [Database & Vectors](#database-vectors)
  11. [UI Components](#ui-components)
12. [💡 Implementation Guide](#-implementation-guide)
  13. [1. Start with Chat](#1-start-with-chat)
  14. [2. Add Document Processing](#2-add-document-processing)
  15. [3. Enable Vision Analysis](#3-enable-vision-analysis)
16. [🎯 Next Steps](#-next-steps)
17. [📚 Resources](#-resources)

## 📁 What's Included

- `package.json` - AI dependencies (Ollama, OpenAI, Anthropic)
- `prisma/schema.prisma` - Database schema with pgvector support
- `lib/ai/` - Core AI service abstraction layer
- `components/ai/` - Essential AI UI components
- `app/api/ai/` - API routes for chat, vision, embeddings

## 🚀 Quick Setup

```bash
# 1. Copy to your project
cp -r examples/ai-nextjs-reference/* my-ai-app/
cd my-ai-app

# 2. Install dependencies
npm install

# 3. Setup database
createdb my_ai_app
psql my_ai_app -c "CREATE EXTENSION vector;"

# 4. Configure environment
cp .env.example .env
# Add DATABASE_URL and API keys

# 5. Setup database schema
npx prisma db push

# 6. Install and start Ollama
brew install ollama
ollama serve &
ollama pull llama2

# 7. Start development
npm run dev
```

## 🏗️ Architecture Patterns

### 1. Local-First AI Service
```typescript
// lib/ai/index.ts - Smart routing between local and API models
const response = await aiService.chat(messages, {
  preferLocal: true,
  fallbackToAPI: true,
  stream: true
});
```

### 2. Streaming Components
```typescript
// components/ai/chat/chat-interface.tsx
// Real-time streaming with proper abort handling
```

### 3. Vector Database Integration
```sql
-- prisma/schema.prisma
model Document {
  embedding Float[] @db.Vector(1536)
  @@index([embedding])
}
```

## 🔧 Key Features

- **Hybrid AI**: Local models (Ollama) + API fallback
- **Streaming**: Real-time AI responses
- **Vector Search**: Semantic similarity with pgvector
- **Cost Tracking**: Monitor usage and costs
- **Type Safety**: Full TypeScript support

## 📊 Dependencies

### Core AI Stack
- `ollama` - Local model server
- `openai` - OpenAI API client
- `@anthropic-ai/sdk` - Claude API client
- `@huggingface/inference` - HF models

### Database & Vectors
- `prisma` - Type-safe database client
- `@prisma/client` - Prisma client
- `pgvector` - PostgreSQL vector extension

### UI Components
- `@radix-ui/react-*` - Accessible UI primitives
- `lucide-react` - Icon library
- `tailwindcss` - Utility-first CSS

## 💡 Implementation Guide

### 1. Start with Chat
1. Copy `components/ai/chat/` components
2. Use `app/api/ai/chat/` API routes
3. Integrate `lib/ai/` service layer

### 2. Add Document Processing
1. Implement file upload component
2. Use `app/api/ai/extract/` for text extraction
3. Store embeddings for semantic search

### 3. Enable Vision Analysis
1. Copy `app/api/ai/vision/` routes
2. Configure vision models in Ollama
3. Add image upload to UI

## 🎯 Next Steps

After copying this reference:
1. **Configure your environment** - Database, AI providers
2. **Customize the UI** - Brand, styling, additional components
3. **Add authentication** - NextAuth.js or your preferred solution
4. **Deploy** - Vercel (API models) or VPS (local models)

## 📚 Resources

- [Project Template Documentation](../../README.md)
- [Ollama Documentation](https://ollama.ai)
- [Prisma with pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Next.js 14 App Router](https://nextjs.org/docs)

---

**Size**: ~50KB (vs 1.5GB full starter)
**Setup Time**: ~10 minutes
**Ideal For**: Starting new AI projects with proven patterns