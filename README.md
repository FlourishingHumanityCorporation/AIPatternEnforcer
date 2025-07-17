# AIPatternEnforcer: AI App Starter Generator

**Create AI-powered apps in under 2 minutes. No enterprise complexity.**

AIPatternEnforcer generates ready-to-use starter projects for local AI development. Perfect for lazy developers who want AI tools (Cursor, Claude) to work flawlessly without configuration.

```bash
# Create your AI app in one command
npx create-ai-app my-dating-assistant
cd my-dating-assistant
npm run dev

# Perfect for: AI dating assistants, document processors, personal VLM apps
```

> **⚡ What's New:** Hooks enabled by default • Clear project separation • True 2-minute setup
> **🚀 For Existing Users:** Run `npm run migrate:check` to see your migration path
> **📖 Need Help?** [Migration Guide](MIGRATION-STRATEGY.md) | [Quick Reference](docs/quick-reference.md)

## Table of Contents

1. [⚡ Quick Start](#-quick-start)
2. [🎯 Available Starters](#-available-starters)
3. [🔧 What You Get](#-what-you-get)
4. [🚀 For Existing Users](#-for-existing-users)
5. [📚 Documentation](#-documentation)

## ⚡ Quick Start

### Option 1: Create New Project (Recommended)

```bash
# Coming soon - for now use Option 2
npx create-ai-app my-project
cd my-project
npm run dev
```

### Option 2: Use Starter Directly

```bash
# Clone AIPatternEnforcer
git clone https://github.com/yourusername/AIPatternEnforcer.git
cd AIPatternEnforcer

# Copy a starter template
cp -r starters/minimal-ai-app ../my-ai-app
cd ../my-ai-app

# Install and run
npm install
npm run dev
```

## 🎯 Available Starters

### Minimal AI App

Perfect for starting any AI project. Includes:

- ✅ Next.js 14 with App Router
- ✅ AI service integrations (OpenAI, Anthropic)
- ✅ Mock authentication for local development
- ✅ Prisma + PostgreSQL with pgvector
- ✅ Zustand for state management
- ✅ Component generator built-in

### AI Chat Interface (Coming Soon)

Pre-built chat UI with streaming responses

### AI Document Processor (Coming Soon)

OCR and document analysis starter

## 🔧 What You Get

### 🛡️ Protection by Default

- **Hooks Enabled**: AI coding mistakes blocked automatically
- **No Manual Setup**: Everything configured out of the box
- **Smart Defaults**: SQLite option for zero-config database

### 🚀 Instant Productivity

```bash
# In your new project:
npm run g:c ChatMessage    # Generate component with tests
npm run dev                # Start developing
npm run check:all          # Validate everything
```

### 📦 Included Tools

- **Component Generator**: Creates complete components in 30 seconds
- **Real-time Protection**: Claude Code hooks prevent common mistakes
- **Type Safety**: TypeScript strict mode configured
- **Testing Setup**: Jest + Testing Library ready to go
- **AI Integration**: OpenAI/Anthropic clients pre-configured

## 🚀 For Existing Users

If you previously cloned AIPatternEnforcer and worked in the root:

```bash
# Check your migration status
npm run migrate:check

# Your components have been moved to:
# starters/minimal-ai-app/components/

# Continue working in the starter:
cd starters/minimal-ai-app
npm install
npm run dev
```

## 📚 Documentation

### For Lazy Developers

- [QUICK-START.md](QUICK-START.md) - Get running in 5 minutes
- [Migration Guide](MIGRATION-STRATEGY.md) - For existing users

### For Curious Developers

- [CLAUDE.md](CLAUDE.md) - AI development rules and patterns
- [FRICTION-MAPPING.md](FRICTION-MAPPING.md) - Why this project exists
- [Documentation Index](DOCS_INDEX.md) - Complete documentation

### For Contributors

- [CONTRIBUTING.md](CONTRIBUTING.md) - How to help
- [Architecture](docs/architecture/) - System design

## 🎯 Philosophy

**For Lazy Developers, By Lazy Developers**

We believe AI development should be:

- **Simple**: One command to start
- **Protected**: Mistakes prevented automatically
- **Fast**: Under 2 minutes to productivity

This is a meta-project that generates starters. You don't develop in AIPatternEnforcer - you use it to create your project, then develop there.

## 🤝 Contributing

Found a friction point we missed? Have a better solution? PRs welcome!

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT - Use this for whatever you want.

---

_Built with ❤️ for developers who value their time_
