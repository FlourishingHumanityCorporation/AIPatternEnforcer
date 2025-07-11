# Local Development Stack Decision Guide

## Quick Start Recommendations

### For Different Project Types

```
Web Application → Node.js + Vite + SQLite
Data Analysis → Python + Jupyter + Pandas
Desktop App → Electron or Tauri
CLI Tool → Go or Node.js
API Only → Node.js/Express or Python/FastAPI
Learning Project → Whatever you want to learn!
```

## Core Principles for Local Development

1. **Minimize Setup Friction** - Get coding in < 10 minutes
2. **Fast Feedback Loops** - Hot reload everything possible
3. **Resource Efficiency** - Your laptop isn't a server farm
4. **Offline First** - Everything works without internet
5. **Simple Dependencies** - Prefer built-in over external

## Complete Local Stack Recommendations

### 1. The "Just Works" Stack (Recommended for most)

```
Backend:    Node.js + Express/Fastify
Frontend:   Vite + React/Vue
Database:   SQLite (via Prisma/Drizzle)
Auth:       Local sessions (express-session)
Storage:    Local filesystem
Tools:      tsx for TypeScript, nodemon for watching
```

**Why this works:**

- Single language (JavaScript/TypeScript)
- Instant startup times
- Excellent debugging experience
- Huge ecosystem
- AI tools know it well

### 2. The "Data Science" Stack

```
Runtime:    Python 3.11+
Framework:  Jupyter + FastAPI
Database:   SQLite or DuckDB
Analysis:   Pandas + Matplotlib/Plotly
ML:         Scikit-learn (local), Transformers
Tools:      Poetry, Black, IPython
```

**Why this works:**

- Best data manipulation tools
- Interactive development
- Visualization built-in
- Can grow into production

### 3. The "Learning Systems" Stack

```
Language:   Go or Rust
Framework:  Standard library (Go) or Actix (Rust)
Database:   Embedded SQLite
Tools:      Air (Go) or cargo-watch (Rust)
```

**Why this works:**

- Learn lower-level concepts
- Minimal magic
- Great performance
- Single binary output

### 4. The "Desktop App" Stack

```
Framework:  Electron (web tech) or Tauri (Rust/web)
Frontend:   Your favorite web framework
Backend:    IPC to main process
Database:   SQLite or LocalStorage
Packaging:  electron-builder or Tauri CLI
```

**Why this works:**

- Use web skills for desktop
- Cross-platform by default
- Access to system APIs
- Easy distribution

## Database Choices for Local Development

### SQLite (Default Choice)

```typescript
// With Prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// With Drizzle
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database('local.db');
const db = drizzle(sqlite);
```

**Advantages:**

- Zero configuration
- Single file storage
- Surprisingly powerful
- Works everywhere

### PostgreSQL (When you need it)

```bash
# Quick local PostgreSQL
docker run -d \
  --name local-postgres \
  -e POSTGRES_PASSWORD=localdev \
  -p 5432:5432 \
  postgres:15-alpine
```

**Use when:**

- You need PostgreSQL-specific features
- Team uses PostgreSQL in production
- Complex queries/transactions needed

### DuckDB (For Analytics)

```python
import duckdb

# In-memory or file-based
conn = duckdb.connect('local.duckdb')
df = conn.execute("SELECT * FROM 'data.csv'").fetchdf()
```

**Perfect for:**

- Analyzing CSVs/Parquet files
- OLAP workloads
- Data exploration

## Essential Local Development Tools

### Cross-Runtime Tools

```bash
# API Testing
bruno       # Offline-first Postman alternative
httpie      # CLI HTTP client

# Database
sqlitebrowser  # SQLite GUI
tableplus      # Multi-database GUI

# Process Management
tmux          # Terminal multiplexer
overmind      # Procfile runner
```

### Node.js Specific

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsx build src/index.ts",
    "db:studio": "prisma studio",
    "db:push": "prisma db push"
  },
  "devDependencies": {
    "tsx": "latest",
    "@types/node": "latest",
    "prisma": "latest"
  }
}
```

### Python Specific

```toml
# pyproject.toml
[tool.poetry.scripts]
dev = "uvicorn app:app --reload"
test = "pytest"
format = "black ."
lint = "ruff ."

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.100.0"
uvicorn = {extras = ["standard"], version = "^0.23.0"}
sqlalchemy = "^2.0.0"
```

### Go Specific

```makefile
# Makefile
.PHONY: dev build test

dev:
	air

build:
	go build -o bin/app .

test:
	go test -v ./...

lint:
	golangci-lint run
```

## Environment Configuration

### Simple .env Setup

```bash
# .env.local
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./dev.db
SESSION_SECRET=local-dev-secret-change-in-prod
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### Development vs Production

```typescript
// config.ts
const config = {
  isDev: process.env.NODE_ENV !== "production",
  port: process.env.PORT || 3000,
  db: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
  // Local defaults, env vars for production
  auth: {
    secret: process.env.SESSION_SECRET || "dev-secret",
  },
};
```

## Common Local Development Patterns

### 1. Hot Module Replacement (HMR)

```typescript
// Vite config for frontend
export default {
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
};

// Backend with tsx watch
// Automatically restarts on changes
```

### 2. Database Migrations

```bash
# Development workflow
npm run db:push     # Push schema changes
npm run db:studio   # Visual database editor

# No migration files needed for local dev!
```

### 3. Mock External Services

```typescript
// services/email.ts
export const sendEmail = async (to: string, subject: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`📧 Email to ${to}: ${subject}`);
    return { sent: true };
  }
  // Production implementation
};
```

### 4. Local File Storage

```typescript
// Simple file upload handling
import { writeFile } from "fs/promises";
import { join } from "path";

const uploadDir = join(process.cwd(), "uploads");

export async function saveUpload(file: Buffer, filename: string) {
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, file);
  return `/uploads/${filename}`;
}
```

## Performance Tips for Local Development

### 1. Limit Watchers

```json
// .gitignore patterns also exclude from watchers
{
  "watchOptions": {
    "excludeDirectories": ["**/node_modules", "**/.git", "**/dist"]
  }
}
```

### 2. Use Development Builds

```typescript
// Vite/webpack dev config
export default {
  mode: "development",
  devtool: "eval-source-map", // Fast rebuilds
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
};
```

### 3. Lazy Load Development Tools

```typescript
// Only load in development
if (process.env.NODE_ENV === "development") {
  // Lazy load dev tools
  import("./dev-tools").then(({ setupDevTools }) => {
    setupDevTools();
  });
}
```

## Security Considerations for Local Dev

### 1. Separate Secrets

```bash
# .env.local (git ignored)
REAL_API_KEY=xxx

# .env.example (committed)
REAL_API_KEY=your-api-key-here
```

### 2. Local HTTPS (when needed)

```bash
# Quick local HTTPS
npx local-ssl-proxy --source 3001 --target 3000

# Or with mkcert
mkcert -install
mkcert localhost
```

### 3. Mock Authentication

```typescript
// Local dev auth bypass
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    req.user = { id: "dev-user", role: "admin" };
    next();
  });
}
```

## Debugging Setup

### VS Code / Cursor Launch Config

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "tsx",
      "program": "${workspaceFolder}/src/index.ts",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Browser DevTools Integration

```typescript
// Expose useful stuff globally in dev
if (process.env.NODE_ENV === "development") {
  window.__APP__ = {
    store: appStore,
    api: apiClient,
    reset: () => localStorage.clear(),
  };
}
```

## Common Pitfalls to Avoid

### 1. Over-Engineering

❌ Kubernetes for local dev
❌ Microservices for a todo app
❌ Complex build pipelines
✅ Simple, fast, focused

### 2. Production Parity Obsession

❌ Matching production exactly
❌ Using production databases locally
✅ Close enough is good enough
✅ Fast feedback > perfect parity

### 3. Dependency Bloat

❌ Installing every cool package
❌ Complex state management for simple apps
✅ Start minimal, add as needed
✅ Built-in > external when possible

## Quick Decision Matrix

| Need          | Best Choice    | Why                     |
| ------------- | -------------- | ----------------------- |
| Fast startup  | Node.js/Python | Interpreted, no compile |
| Type safety   | TypeScript     | Best of both worlds     |
| Data analysis | Python         | Best libraries          |
| System tools  | Go             | Single binary           |
| Desktop app   | Electron       | Web skills              |
| Learning      | Any            | Pick what interests you |
| API server    | Node.js        | Huge ecosystem          |
| Real-time     | Node.js        | Socket.io, etc          |

## Project Template Setup

```bash
# Clone and setup
git clone my-template my-project
cd my-project

# Install dependencies
npm install

# Setup database
npm run db:push

# Start development
npm run dev

# You're coding in < 2 minutes!
```

Remember: The best local development stack is the one that gets out of your way and lets you build. Don't overthink it - pick something and start creating!
