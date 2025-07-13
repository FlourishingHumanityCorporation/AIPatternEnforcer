# AI Local App Starter

**Copy-paste ready template for local AI projects.** No enterprise features, no user management - just you and AI.

Perfect for: AI dating assistant, document processor, personal AI tools, hobby projects.

## 🚀 Quick Start (< 5 minutes)

```bash
# 1. Copy this template
cp -r templates/nextjs-app-router my-ai-app
cd my-ai-app

# 2. Install dependencies
npm install

# 3. Setup database
cp .env.example .env
# Edit .env with your database URL
npm run db:push

# 4. Start developing
npm run dev
```

Visit `http://localhost:3000` - your AI app is ready!

## 🛠️ Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **UI**: Tailwind CSS + Radix UI components  
- **State**: Zustand + TanStack Query
- **Database**: PostgreSQL + Prisma + pgvector
- **AI**: Multi-provider (OpenAI, Anthropic, Local Ollama)
- **Auth**: Mock user (local development only)

## 🤖 AI Features

### Built-in AI Routes
- `/api/ai/chat` - Chat completions with local/API fallback
- `/api/ai/embed` - Text embeddings for similarity search
- `/api/ai/vision` - Image analysis and OCR
- `/api/ai/extract` - Document data extraction

### Provider Support
- **Local**: Ollama (free, private)
- **Fallback**: OpenAI, Anthropic APIs
- **Auto-fallback**: If local fails, tries API providers

### Mock Authentication
```typescript
import { getCurrentUser } from '@/lib/auth'

const user = getCurrentUser() // Always returns local user
// { id: 'local-user', email: 'local@dev.com', name: 'Local User' }
```

## 📝 Database Schema

Simple, single-user focused:

```prisma
model Document {
  id          String @id @default(cuid())
  filename    String
  status      ProcessingStatus
  embedding   Float[] // Vector search
  // ... AI processing fields
}

model Chat {
  id       String @id @default(cuid())
  title    String
  model    String
  provider AIProvider
  messages Message[]
}
```

No User model needed - everything assumes single local user.

## 🚀 Example: AI Dating Assistant

```typescript
// pages/dating-assistant.tsx
import { useChat } from '@/lib/hooks/useChat'

export default function DatingAssistant() {
  const { messages, sendMessage } = useChat()
  
  const analyzeProfile = async (profileText: string) => {
    await sendMessage({
      role: 'user',
      content: `Analyze this dating profile and suggest improvements: ${profileText}`
    })
  }
  
  return (
    <div>
      {/* AI-powered profile analysis */}
      {/* Message suggestions */}
      {/* Swipe recommendations */}
    </div>
  )
}
```

## 📁 Project Structure

```
my-ai-app/
├── app/
│   ├── api/ai/           # AI API routes
│   ├── globals.css       # Tailwind styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ai/               # AI-specific components
│   └── chat/             # Chat interface
├── lib/
│   ├── ai/               # AI utilities
│   ├── auth.ts           # Mock auth
│   ├── db.ts             # Prisma client
│   └── store.ts          # Zustand store
├── prisma/
│   └── schema.prisma     # Database schema
└── package.json          # Dependencies
```

## 🔧 Development Commands

```bash
npm run dev          # Start dev server
npm run db:studio    # View database
npm test             # Run tests
npm run build        # Build for production
```

## 🤖 AI Provider Setup

### Option 1: Local Only (Recommended)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Run a model
ollama run llama2
```

### Option 2: API Providers
```bash
# Add to .env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

The app automatically tries local first, falls back to APIs.

## 🎯 What This Template Is For

✅ **Perfect for:**
- Personal AI assistants
- Document processors
- Local AI experiments  
- Hobby projects
- Learning AI development

❌ **Not for:**
- Multi-user applications
- Production deployments
- Enterprise features
- Authentication systems

## 🚫 What's Excluded (By Design)

No enterprise complexity:
- ❌ User sign-up/login
- ❌ Role-based access
- ❌ Multi-tenancy
- ❌ Payment processing
- ❌ Team collaboration
- ❌ CI/CD pipelines
- ❌ Monitoring/analytics

This keeps development simple and friction-free for AI experimentation.

## 🔍 Example AI App Ideas

**AI Dating Assistant**
- Profile analysis and optimization
- Message suggestions based on context
- Photo selection recommendations
- Conversation starters

**Document Processor**  
- PDF text extraction and analysis
- Smart categorization
- Automatic summaries
- Vector search across documents

**Personal Knowledge Base**
- Chat with your documents
- Intelligent note-taking
- Cross-reference information
- Semantic search

**AI Writing Assistant**
- Content generation
- Style adaptation
- Grammar and tone analysis
- Research integration

## 🤝 Contributing

This template focuses on simplicity. PRs welcome for:
- Bug fixes
- AI provider integrations
- Performance improvements
- Documentation clarity

Avoid adding enterprise features - keep it simple for local development.

---

**Ready to build your AI app?** Just copy this folder and start coding! 🚀