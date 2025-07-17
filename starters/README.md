# Starters Directory

**Purpose**: Ready-to-use complete project templates for immediate development

## What's Here

- **Complete Projects**: Full project setups ready for development
- **Production-Ready**: Includes testing, linting, and deployment configuration  
- **AI-Optimized**: Pre-configured for AI development patterns
- **Copy-Paste Ready**: Can be copied and used as project foundation

## Directory Structure

```
starters/
├── minimal-ai-app/             # Main AI app starter (recommended)
│   ├── app/                    # Next.js App Router structure
│   ├── components/             # Pre-built UI components
│   ├── lib/                    # AI services and utilities
│   ├── prisma/                 # Database schema
│   ├── tests/                  # Test setup and examples
│   └── package.json            # Complete dependency list
└── [Future starters]           # Additional specialized starters
```

## Available Starters

### 1. minimal-ai-app (Recommended)
**Best for**: Most AI projects, general-purpose AI applications

**What's Included**:
- Next.js 14 with App Router
- OpenAI and Anthropic API integration
- PostgreSQL + Prisma + pgvector
- Tailwind CSS + shadcn/ui components
- AI chat interface with streaming
- Vector embeddings and search
- Mock authentication system
- Comprehensive testing setup
- Hook protection system (enabled)

**AI Features**:
- Multi-provider AI support (OpenAI, Anthropic, local models)
- Real-time chat streaming
- Document processing capabilities
- Vector search with embeddings
- Vision analysis (GPT-4V ready)

**Tech Stack**:
- Frontend: Next.js + React + TypeScript
- UI: Tailwind CSS + shadcn/ui + Radix UI
- State: Zustand + TanStack Query
- Database: PostgreSQL + Prisma + pgvector
- Testing: Jest + React Testing Library
- Linting: ESLint + Prettier

## How to Use Starters

### Option 1: CLI Tool (Recommended)
```bash
# Create new project from starter
npx create-ai-app my-ai-project
cd my-ai-project
npm run dev
```

### Option 2: Direct Copy
```bash
# Copy starter for immediate development
cp -r starters/minimal-ai-app my-ai-project
cd my-ai-project

# Remove starter-specific files
rm -rf .git starters/

# Initialize as new project
git init
npm install
npm run dev
```

### Option 3: Development Mode
```bash
# Work directly in starter (for testing/development)
cd starters/minimal-ai-app
npm install
npm run dev
```

## Configuration

### Environment Setup
1. Copy environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure API keys:
   ```env
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   DATABASE_URL=postgresql://...
   ```

3. Setup database:
   ```bash
   npm run db:push
   ```

### Hook Protection
Starters come with hook protection **enabled by default**:
- `HOOKS_DISABLED=false` in generated projects
- Automatic prevention of AI anti-patterns
- Real-time code quality enforcement

## Key Features

### AI-First Architecture
- **Multi-provider support**: OpenAI, Anthropic, local models
- **Streaming interfaces**: Real-time chat responses
- **Vector search**: Semantic search with embeddings
- **Document processing**: OCR and text extraction
- **Vision analysis**: Image processing capabilities

### Development Experience
- **Fast setup**: Ready to code in minutes
- **Hot reloading**: Instant feedback during development
- **Comprehensive testing**: Jest + RTL setup included
- **Type safety**: Full TypeScript coverage
- **AI protection**: Hooks prevent common AI coding mistakes

### Production Ready
- **Performance optimized**: Next.js optimizations included
- **Security baseline**: Basic security practices implemented
- **Scalable structure**: Organized for growth
- **Deployment ready**: Configured for major platforms

## Key Differences

| Directory | Purpose | Usage |
|-----------|---------|-------|
| **examples/** | Reference & learning | Read-only patterns and code snippets |
| **templates/** | Code generation | Used by generators to create new files |
| **starters/** | Project foundation | Copy-paste ready complete projects |

## Customization

### Adding Features
Starters are designed for easy customization:
- Add new AI providers in `lib/ai/`
- Create custom components using generators
- Extend database schema in `prisma/schema.prisma`
- Add new API routes in `app/api/`

### Removing Features
To simplify starters:
- Remove unused AI providers from `lib/ai/index.ts`
- Delete unnecessary components
- Update `package.json` dependencies
- Modify database schema as needed

## Development Workflow

1. **Start from starter**: Copy or generate from starter template
2. **Configure environment**: Set up API keys and database
3. **Customize features**: Add/remove AI capabilities as needed
4. **Develop iteratively**: Use generators for new components
5. **Test thoroughly**: Leverage included testing framework
6. **Deploy confidently**: Use production-ready configuration

## Support

For starter-specific issues:
- Check starter's individual README
- Review environment configuration
- Verify API key setup
- Test database connection

For general questions:
- See main project documentation
- Check [Documentation Index](../DOCS_INDEX.md)
- Review [Migration Guide](../MIGRATION-GUIDE.md)