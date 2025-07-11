# Next.js + FastAPI Starter

A production-ready full-stack application with AI-first development setup.

## 🚀 Quick Start (60 seconds)

```bash
# Clone this starter
cp -r starters/nextjs-fastapi/* ~/my-project
cd ~/my-project

# Install dependencies
npm install
cd api && pip install -r requirements.txt && cd ..

# Start everything
npm run dev

# Open http://localhost:3000
```

## ✨ What's Included

### Frontend (Next.js 14)

- ✅ App Router with TypeScript
- ✅ Authentication (NextAuth.js)
- ✅ Tailwind CSS + shadcn/ui
- ✅ API client with type safety
- ✅ Dark mode support

### Backend (FastAPI)

- ✅ RESTful API with OpenAPI docs
- ✅ JWT authentication
- ✅ SQLAlchemy + PostgreSQL
- ✅ Alembic migrations
- ✅ Background tasks with Celery

### AI Development

- ✅ Pre-configured CLAUDE.md
- ✅ AI context management
- ✅ Smart .aiignore
- ✅ VS Code AI settings

### Features Included

- 🔐 User registration/login
- 👤 User profile management
- 📝 CRUD example (Tasks)
- 🔄 Real-time updates (WebSocket)
- 📊 Dashboard with charts

## 📁 Project Structure

```
my-project/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Protected pages
│   ├── api/               # API routes
│   └── components/        # React components
├── api/                    # FastAPI backend
│   ├── routers/           # API endpoints
│   ├── models/            # Database models
│   ├── schemas/           # Pydantic schemas
│   └── services/          # Business logic
├── lib/                    # Shared utilities
├── prisma/                 # Database schema
└── public/                # Static assets
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11, SQLAlchemy, Alembic
- **Database**: PostgreSQL (or SQLite for development)
- **Auth**: NextAuth.js + JWT
- **Deployment**: Vercel + Railway/Fly.io

## 📚 Documentation

- [Frontend Guide](docs/frontend.md)
- [Backend Guide](docs/backend.md)
- [Deployment Guide](docs/deployment.md)
- [AI Development](docs/ai-development.md)
