[← Back to Documentation](../README.md)

---

# New Project Decisions

Technology selection guides and decision matrices for starting new projects with ProjectTemplate.

## Table of Contents

1. [🚀 Start Here](#-start-here)
2. [📊 Decision Matrices](#-decision-matrices)
  3. [Core Stack Decisions](#core-stack-decisions)
  4. [Infrastructure Decisions](#infrastructure-decisions)
  5. [Specialized Topics](#specialized-topics)
  6. [Examples](#examples)
7. [🎯 Quick Decision Paths](#-quick-decision-paths)
  8. ["I'm building a web application"](#im-building-a-web-application)
  9. ["I need maximum performance"](#i-need-maximum-performance)
  10. ["I want fastest development"](#i-want-fastest-development)
  11. ["I'm building a desktop app"](#im-building-a-desktop-app)
12. [📋 Decision Checklist](#-decision-checklist)
13. [🔄 Stack Combinations](#-stack-combinations)
  14. [Popular Combinations](#popular-combinations)
15. [See Also](#see-also)

## 🚀 Start Here

1. **[Local Development Stack Guide](local-development-stack-guide.md)** - Quick recommendations for local development
2. **[Project Requirements Template](project-requirements.md)** - Define your project needs first

## 📊 Decision Matrices

Detailed comparisons to help you choose the right technology:

### Core Stack Decisions

- **[Backend Runtime](decision-matrix-backend-runtime.md)** - Node.js vs Python vs Go vs Rust
- **[API Architecture](decision-matrix-api-architecture.md)** - REST vs GraphQL vs gRPC vs tRPC
- **[Database Selection](decision-matrix-database.md)** - PostgreSQL vs SQLite vs MongoDB
- **[Frontend Framework](decision-matrix-frontend.md)** - React vs Vue vs Angular vs Svelte

### Infrastructure Decisions

- **[Build Tools](decision-matrix-build-tools.md)** - Vite vs Webpack vs Parcel vs esbuild
- **[Monorepo Setup](decision-matrix-monorepo.md)** - Monorepo vs Polyrepo approaches

### Specialized Topics

- **[SQLite vs PostgreSQL](sqlite-vs-postgresql-decision-guide.md)** - Detailed database comparison
- **[Desktop App Patterns](desktop-app-patterns.md)** - Electron vs Tauri for desktop apps
- **[AI Integration Patterns](ai-integration-patterns.md)** - Integrating AI into your stack
- **[Local Error Handling](local-error-handling.md)** - Error management strategies

### Examples

- **[Project Examples with Stacks](project-examples-with-stacks.md)** - Real-world stack combinations

## 🎯 Quick Decision Paths

### "I'm building a web application"
1. Read [Local Development Stack Guide](local-development-stack-guide.md)
2. Review [Frontend Framework](decision-matrix-frontend.md)
3. Check [API Architecture](decision-matrix-api-architecture.md)
4. Choose from [Database Selection](decision-matrix-database.md)

### "I need maximum performance"
1. Consider Go or Rust in [Backend Runtime](decision-matrix-backend-runtime.md)
2. Use SQLite from [Database Selection](decision-matrix-database.md)
3. Pick Vite from [Build Tools](decision-matrix-build-tools.md)

### "I want fastest development"
1. Choose Node.js from [Backend Runtime](decision-matrix-backend-runtime.md)
2. Use REST from [API Architecture](decision-matrix-api-architecture.md)
3. Pick React/Next.js from [Frontend Framework](decision-matrix-frontend.md)

### "I'm building a desktop app"
1. Read [Desktop App Patterns](desktop-app-patterns.md)
2. Review web stack options above
3. Consider [AI Integration](ai-integration-patterns.md) for enhanced features

## 📋 Decision Checklist

Before making technology decisions:

- [ ] Define project requirements using [Project Requirements Template](project-requirements.md)
- [ ] Consider team expertise and learning curve
- [ ] Evaluate long-term maintenance needs
- [ ] Check community support and ecosystem
- [ ] Review performance requirements
- [ ] Consider deployment constraints
- [ ] Assess integration requirements

## 🔄 Stack Combinations

### Popular Combinations

**Full-Stack TypeScript:**
- Node.js + Express + TypeScript
- React + Vite
- PostgreSQL or SQLite
- REST or tRPC

**Python Data App:**
- Python + FastAPI
- React or Vue frontend
- PostgreSQL
- REST API

**High-Performance App:**
- Go + Gin
- React + Vite
- SQLite
- REST or gRPC

See [Project Examples](project-examples-with-stacks.md) for more combinations.

## See Also

- [Architecture Patterns](../architecture/patterns/) - Implementation patterns
- [Comprehensive Testing Guide](../guides/testing/comprehensive-testing-guide.md) - Testing your stack
- [Local Development Stack Guide](local-development-stack-guide.md) - Quick start recommendations
- [CLAUDE.md](../../CLAUDE.md) - Development standards