# Minimal AI App Starter

A clean, minimal starter for building AI-powered applications with Next.js, TypeScript, and your choice of AI providers.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your API keys:
# - OPENAI_API_KEY=sk-your-key... (from https://platform.openai.com/api-keys)
# - ANTHROPIC_API_KEY=sk-ant-your-key... (from https://console.anthropic.com)
# - DATABASE_URL=your-database-url

# 3. Set up database (choose one):
# Option A: Use Neon (recommended - free tier available)
#   1. Sign up at https://neon.tech
#   2. Create a new project
#   3. Copy the connection string to DATABASE_URL in .env
# Option B: Local PostgreSQL
#   1. Install PostgreSQL locally
#   2. Create database: createdb my_ai_app
#   3. Update DATABASE_URL in .env
npx prisma db push

# 4. Start developing
npm run dev
```

Your app will be running at [http://localhost:3000](http://localhost:3000)

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run g:c Button   # Generate a new component
npm test            # Run tests
npm run check:all   # Run all checks (lint, type, test)
```

## 📁 Project Structure

```
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/             # Utilities and shared code
│   ├── ai/         # AI service integrations
│   ├── db.ts       # Database client
│   └── store.ts    # Zustand store
├── prisma/          # Database schema
└── public/          # Static assets
```

## 🤖 AI Features

This starter includes integrations for:

- **OpenAI** - GPT models, embeddings, and more
- **Anthropic** - Claude models
- **Local Models** - Ollama/LocalAI support

## 🎨 UI Components

Pre-configured with:

- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide** for icons
- **CVA** for component variants

## 📊 State Management

- **Zustand** for global state
- **TanStack Query** for server state
- **React Hook Form** for forms

## 🗄️ Database

- **Prisma** ORM with PostgreSQL
- **pgvector** support for embeddings
- Migration and seeding scripts included

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 🔧 Development Tips

1. **Generate Components**: Use `npm run g:c ComponentName` to scaffold new components with tests
2. **Type Safety**: TypeScript strict mode is enabled - embrace it!
3. **AI Context**: Keep your AI prompts in `lib/ai/prompts/` for reusability
4. **Error Handling**: Use the built-in error boundaries and logging

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Anthropic API Reference](https://docs.anthropic.com)

## 🚀 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm run build
# Deploy with Vercel CLI or Git integration
```

---

Built with ❤️ for AI developers who value simplicity and productivity.
