# Example Projects

This directory contains complete example implementations using the project template.

## Available Examples

### 1. Next.js + PostgreSQL (`nextjs-postgres/`)
A full-stack web application with:
- Next.js 14 with App Router
- PostgreSQL database with Prisma ORM
- TypeScript strict mode
- Authentication with NextAuth
- API routes following REST patterns

### 2. Vite + Fastify (`vite-fastify/`)
A modern SPA with separate API:
- Vite for lightning-fast frontend builds
- React with TypeScript
- Fastify backend API
- JWT authentication
- OpenAPI documentation

## How to Use

Each example includes:
- Complete implementation following template patterns
- README with setup instructions
- Docker Compose for local development
- Example tests and documentation

### Quick Start
```bash
# Copy an example
cp -r examples/nextjs-postgres ../my-new-project
cd ../my-new-project

# Remove example-specific files
rm -rf .git
git init

# Install and start
npm install
npm run dev
```

## Adding New Examples

To add a new example:
1. Create a new directory with descriptive name
2. Implement using template patterns
3. Include comprehensive README
4. Add to this index with description
5. Test complete setup flow

## Example Requirements

Each example should demonstrate:
- ✅ Proper project structure
- ✅ AI-friendly documentation
- ✅ Security best practices
- ✅ Testing setup
- ✅ Development workflow
- ✅ Error handling patterns
- ✅ State management
- ✅ API patterns