# Next.js AI Unified Template

A comprehensive AI starter template combining chat interfaces, document processing, vision analysis, and vector search capabilities.

## Features

- **🤖 AI Chat**: Multi-provider support (OpenAI, Anthropic, Local models via Ollama)
- **📄 Document Processing**: OCR, PDF parsing, DOCX extraction with Tesseract.js
- **👁️ Vision Analysis**: Image analysis with GPT-4V and LLaVA
- **🔍 Vector Search**: Semantic search with embeddings and pgvector
- **⚡ Local AI**: Full support for local models (Ollama, LocalAI)

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Setup database
npm run db:push

# Start development server
npm run dev
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_app"

# AI Provider API Keys (optional)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Local AI Endpoints (optional)
OLLAMA_BASE_URL="http://localhost:11434"
LOCALAI_BASE_URL="http://localhost:8080"
```

## Architecture

This template consolidates features from multiple AI templates:
- Unified AI service supporting multiple providers
- Modular component architecture
- Shared configuration and utilities
- Comprehensive type safety with TypeScript

## Usage

### Chat Interface
```typescript
import { aiService } from "@/lib/ai";

const response = await aiService.chat([
  { role: "user", content: "Hello!" }
]);
```

### Document Processing
```typescript
const result = await aiService.processDocument(file);
console.log(result.text, result.confidence);
```

### Vision Analysis
```typescript
const analysis = await aiService.analyzeImage(
  imageBase64, 
  "Describe this image"
);
```

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run type-check   # TypeScript validation
npm run lint         # ESLint validation
```