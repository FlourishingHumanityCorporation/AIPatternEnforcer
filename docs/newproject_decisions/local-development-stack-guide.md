[← Back to Documentation](../README.md) | [↑ Up to Decisions](README.md)

---

# Local Development Stack Decision Guide

## Table of Contents

1. [Quick Start Recommendations](#quick-start-recommendations)
  2. [For Different Project Types](#for-different-project-types)
3. [Core Principles for Local Development](#core-principles-for-local-development)
4. [Complete Local Stack Recommendations](#complete-local-stack-recommendations)
  5. [1. The "Just Works" Stack (Recommended for most)](#1-the-just-works-stack-recommended-for-most)
  6. [2. The "Data Science" Stack](#2-the-data-science-stack)
  7. [3. The "Learning Systems" Stack](#3-the-learning-systems-stack)
  8. [4. The "Desktop App" Stack](#4-the-desktop-app-stack)
9. [Database Choices for Local Development](#database-choices-for-local-development)
  10. [SQLite (Default Choice)](#sqlite-default-choice)
  11. [PostgreSQL (When you need it)](#postgresql-when-you-need-it)
  12. [DuckDB (For Analytics)](#duckdb-for-analytics)
13. [Essential Local Development Tools](#essential-local-development-tools)
  14. [Cross-Runtime Tools](#cross-runtime-tools)
  15. [Node.js Specific](#nodejs-specific)
  16. [Python Specific](#python-specific)
  17. [Go Specific](#go-specific)
18. [Environment Configuration](#environment-configuration)
  19. [Simple .env Setup](#simple-env-setup)
  20. [Development vs Production](#development-vs-production)
21. [Common Local Development Patterns](#common-local-development-patterns)
  22. [1. Hot Module Replacement (HMR)](#1-hot-module-replacement-hmr)
  23. [2. Database Migrations](#2-database-migrations)
  24. [3. Mock External Services](#3-mock-external-services)
  25. [4. Local File Storage](#4-local-file-storage)
26. [Performance Tips for Local Development](#performance-tips-for-local-development)
  27. [1. Limit Watchers](#1-limit-watchers)
  28. [2. Use Development Builds](#2-use-development-builds)
  29. [3. Lazy Load Development Tools](#3-lazy-load-development-tools)
30. [Security Considerations for Local Dev](#security-considerations-for-local-dev)
  31. [1. Separate Secrets](#1-separate-secrets)
  32. [2. Local HTTPS (when needed)](#2-local-https-when-needed)
  33. [3. Mock Authentication](#3-mock-authentication)
34. [Debugging Setup](#debugging-setup)
  35. [VS Code / Cursor Launch Config](#vs-code-cursor-launch-config)
  36. [Browser DevTools Integration](#browser-devtools-integration)
37. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
  38. [1. Over-Engineering](#1-over-engineering)
  39. [2. Production Parity Obsession](#2-production-parity-obsession)
  40. [3. Dependency Bloat](#3-dependency-bloat)
41. [Quick Decision Matrix](#quick-decision-matrix)
42. [Project Template Setup](#project-template-setup)
43. [See Also](#see-also)
  44. [Decision Matrices](#decision-matrices)
  45. [Implementation Guides](#implementation-guides)
  46. [Related Topics](#related-topics)

## Quick Start Recommendations

### For Different Project Types

```text
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

```text
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
- Robust debugging experience
- Huge ecosystem
- AI tools know it well

### 2. The "Data Science" Stack

```text
Runtime:    Python 3.11+
Framework:  Jupyter + FastAPI
Database:   SQLite or DuckDB
Analysis:   Pandas + Matplotlib/Plotly
ML:         Scikit-learn (local), Transformers
Tools:      Poetry, Black, IPython
```

**Why this works:**

- Optimal data manipulation tools
- Interactive development
- Visualization built-in
- Can grow into production

### 3. The "Learning Systems" Stack

```text
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

```text
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

**Complete for:**

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
✅ Fast feedback > complete parity

### 3. Dependency Bloat

❌ Installing every cool package
❌ Complex state management for simple apps
✅ Start minimal, add as needed
✅ Built-in > external when possible

## Quick Decision Matrix

| Need          | Optimal Choice    | Why                     |
| ------------- | -------------- | ----------------------- |
| Fast startup  | Node.js/Python | Interpreted, no compile |
| Type safety   | TypeScript     | Optimal of both worlds     |
| Data analysis | Python         | Optimal libraries          |
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

Remember: The optimal local development stack is the one that gets out of your way and lets you build. Don't overthink
it -
pick something and start creating!

## See Also

### Decision Matrices
- [Backend Runtime Selection](decision-matrix-backend-runtime.md) - Node.js vs Python vs Go vs Rust
- [API Architecture](decision-matrix-api-architecture.md) - REST vs GraphQL vs gRPC
- [Database Selection](decision-matrix-database.md) - PostgreSQL vs SQLite vs MongoDB
- [Frontend Framework](decision-matrix-frontend.md) - React vs Vue vs Svelte
- [Build Tools](decision-matrix-build-tools.md) - Vite vs Webpack vs others

### Implementation Guides
- [API Design Standards](../architecture/patterns/api-design-standards.md) - RESTful API patterns
- [Data Modeling Guide](../architecture/patterns/data-modeling-guide.md) - Database schema design
- [Testing Guide](../guides/testing/comprehensive-testing-guide.md) - Test-first development
- [Security Optimal Practices](../guides/security/security-optimal-practices.md) - Authentication patterns

### Related Topics
- [AI Integration Patterns](ai-integration-patterns.md) - Using AI in local development
- [Desktop App Patterns](desktop-app-patterns.md) - Electron and Tauri approaches
- [Local Error Handling](local-error-handling.md) - Error management strategies
- [Project Examples](project-examples-with-stacks.md) - Real-world stack combinations
