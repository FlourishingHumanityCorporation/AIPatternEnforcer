# Backend Runtime Decision Matrix (Local Development Focus)

## Quick Decision Flow for Local Projects

```
Start → Is this a learning/experimental project?
         ├─ Yes → Use what you want to learn
         └─ No → Is this data/ML heavy?
                  ├─ Yes → Python (best libraries)
                  └─ No → Need fast iteration?
                          ├─ Yes → Node.js or Python
                          └─ No → Want best tooling?
                                  ├─ Yes → Node.js (npm ecosystem)
                                  └─ No → Go (simple deployment)
```

## Requirements Assessment

### Local Development Requirements

- [ ] Development machine specs (RAM/CPU)
- [ ] Quick startup time needed?
- [ ] Hot reload importance
- [ ] Debugging tool preferences
- [ ] Database integration (SQLite/PostgreSQL)

### Project Requirements

- [ ] Solo project or team?
- [ ] Learning new tech acceptable?
- [ ] Iteration speed priority
- [ ] Type safety requirements
- [ ] AI tool compatibility needs

### Developer Experience Requirements

- [ ] IDE/editor preferences
- [ ] Package management simplicity
- [ ] Documentation quality needs
- [ ] Community support importance
- [ ] Local tooling ecosystem

## Evaluation Matrix for Local Development

| Criteria                       | Weight | Node.js | Python | Go  | Rust | Java | .NET |
| ------------------------------ | ------ | ------- | ------ | --- | ---- | ---- | ---- |
| **Local Dev Experience**       |        |         |        |     |      |      |      |
| Startup speed                  | 5      | 5/5     | 4/5    | 5/5 | 3/5  | 2/5  | 2/5  |
| Hot reload                     | 5      | 5/5     | 4/5    | 3/5 | 2/5  | 3/5  | 4/5  |
| Resource usage                 | 3      | 4/5     | 4/5    | 5/5 | 5/5  | 2/5  | 3/5  |
| Debug experience               | 4      | 5/5     | 5/5    | 3/5 | 2/5  | 4/5  | 5/5  |
| **Developer Productivity**     |        |         |        |     |      |      |      |
| Setup simplicity               | 5      | 5/5     | 4/5    | 4/5 | 2/5  | 3/5  | 3/5  |
| Package management             | 4      | 5/5     | 4/5    | 4/5 | 3/5  | 3/5  | 4/5  |
| AI tool support                | 4      | 5/5     | 5/5    | 3/5 | 2/5  | 4/5  | 3/5  |
| Iteration speed                | 5      | 5/5     | 5/5    | 3/5 | 2/5  | 3/5  | 4/5  |
| **Local Integration**          |        |         |        |     |      |      |      |
| SQLite support                 | 3      | 5/5     | 5/5    | 4/5 | 3/5  | 4/5  | 4/5  |
| File system ops                | 3      | 5/5     | 5/5    | 5/5 | 5/5  | 4/5  | 4/5  |
| Local server                   | 4      | 5/5     | 4/5    | 5/5 | 4/5  | 4/5  | 4/5  |
| **Learning & Experimentation** |        |         |        |     |      |      |      |
| Learning curve                 | 5      | 5/5     | 5/5    | 3/5 | 2/5  | 3/5  | 3/5  |
| Prototype speed                | 5      | 5/5     | 5/5    | 3/5 | 2/5  | 3/5  | 4/5  |
| REPL/Interactive               | 4      | 5/5     | 5/5    | 2/5 | 1/5  | 3/5  | 3/5  |

### Weighted Score Calculation

```
Node.js:  (Σ weight × score) / total_weight = ___
Python:   (Σ weight × score) / total_weight = ___
Go:       (Σ weight × score) / total_weight = ___
Rust:     (Σ weight × score) / total_weight = ___
Java:     (Σ weight × score) / total_weight = ___
.NET:     (Σ weight × score) / total_weight = ___
```

## Detailed Runtime Analysis

### Node.js (JavaScript/TypeScript)

**Best for local development:**

- Rapid prototyping and experimentation
- Full-stack JavaScript projects
- Projects needing npm's vast ecosystem
- Quick CLI tools and scripts
- Electron desktop applications

**Local dev advantages:**

- Instant startup with nodemon/tsx watch
- Excellent debugging in VS Code/Cursor
- No compile step (JavaScript)
- Rich REPL for experimentation
- Single language for frontend/backend

**Example architecture:**

```typescript
// Express + TypeScript setup
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.get("/api/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
```

**Common local setups:**

- Express/Fastify for APIs
- Vite for build tooling
- Electron for desktop apps
- tsx/ts-node for TypeScript execution
- SQLite with Prisma/Drizzle

### Python (FastAPI/Django/Flask)

**Best for local development:**

- Data analysis and visualization projects
- Machine learning experiments
- Quick scripts and automation
- Educational/learning projects
- Jupyter notebook integration

**Local dev advantages:**

- Excellent REPL and notebook support
- Simple virtual environment setup
- No compilation needed
- Great for exploratory programming
- Extensive scientific libraries

**Example architecture:**

```python
# FastAPI + async setup
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()

@app.get("/api/users")
async def get_users(db: AsyncSession):
    result = await db.execute(select(User))
    return result.scalars().all()
```

**Common local setups:**

- Flask for simple web apps
- FastAPI for modern APIs
- Jupyter for data exploration
- Poetry for dependency management
- SQLite with SQLAlchemy

### Go

**Best for local development:**

- Learning systems programming
- Building developer tools
- Single binary distribution
- Performance-critical local apps
- Cross-platform CLI tools

**Local dev advantages:**

- Single binary output (easy sharing)
- Fast compilation
- Minimal dependencies
- Built-in testing and benchmarking
- Great for local network tools

**Example architecture:**

```go
// Fiber + GORM setup
package main

import (
    "github.com/gofiber/fiber/v2"
    "gorm.io/gorm"
)

func main() {
    app := fiber.New()

    app.Get("/api/users", func(c *fiber.Ctx) error {
        var users []User
        db.Find(&users)
        return c.JSON(users)
    })

    app.Listen(":3000")
}
```

**Common local setups:**

- Gin/Echo for web APIs
- Cobra for CLI tools
- Air for hot reloading
- go-sqlite3 for databases
- Minimal external dependencies

### Rust

**Best for local development:**

- Learning systems programming safely
- Performance experiments
- WASM compilation projects
- Security-focused tools
- When you have time to learn

**Local dev advantages:**

- Excellent error messages
- Cargo is fantastic package manager
- Great for learning low-level concepts
- Memory safety without GC
- Strong local tooling (rustup, cargo)

**Example architecture:**

```rust
// Actix-web + SQLx setup
use actix_web::{web, App, HttpServer};
use sqlx::PgPool;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = PgPool::connect(&database_url).await?;

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .route("/api/users", web::get().to(get_users))
    })
    .bind("127.0.0.1:3000")?
    .run()
    .await
}
```

## Local Development Scenarios

### Scenario 1: Personal Project/Side Project

**Requirements**: Fast iteration, learning friendly, minimal setup
**Recommendation**: **Node.js** or **Python**
**Rationale**: Both have excellent local dev experience, choose based on preference

### Scenario 2: Local Data Analysis Tool

**Requirements**: CSV/JSON processing, visualizations, ad-hoc scripts
**Recommendation**: **Python** with Jupyter
**Rationale**: Best data libraries, interactive development

### Scenario 3: Desktop Application

**Requirements**: Native UI, local file access, cross-platform
**Recommendation**: **Node.js** (Electron) or **Rust** (Tauri)
**Rationale**: Electron for web tech familiarity, Tauri for performance

### Scenario 4: Local Development Tools

**Requirements**: Fast startup, single binary, cross-platform
**Recommendation**: **Go** or **Rust**
**Rationale**: Go for simplicity, Rust for correctness

## Local Development Considerations

### Setup Time (Fresh Machine)

- Node.js: 5 minutes (download + npm)
- Python: 10 minutes (download + pip + venv)
- Go: 5 minutes (single installer)
- Rust: 15 minutes (rustup + cargo)
- Java/.NET: 20-30 minutes (JDK/SDK + IDE)

### Resource Usage (Typical Local Project)

```
Idle Memory Usage:
Node.js:  ~50-100 MB
Python:   ~30-80 MB
Go:       ~10-30 MB
Rust:     ~5-20 MB
Java:     ~200-500 MB

Startup Time:
Node.js:  <100ms
Python:   ~200ms
Go:       <50ms
Rust:     <50ms
Java:     1-3 seconds
```

## AI Assistant Guidance

### For AI Code Generation

```markdown
When generating [RUNTIME] code for this project:

1. Follow patterns in @examples/[runtime]/
2. Use these libraries:
   - Web framework: [specific choice]
   - Database: [specific ORM/driver]
   - Validation: [specific library]
3. Always include error handling
4. Follow @docs/architecture/patterns/
```

### Runtime-Specific .cursorrules

```markdown
# Node.js Project Rules

- Use TypeScript with strict mode
- Prefer async/await over callbacks
- Use Zod for validation
- Handle errors with custom error classes

# Go Project Rules

- Follow standard Go project layout
- Use contexts for cancellation
- Return errors, don't panic
- Keep interfaces small

# Python Project Rules

- Use type hints everywhere
- Follow PEP 8 strictly
- Use async where possible
- Validate with Pydantic
```

## Migration Strategies

### Incremental Migration Pattern

```mermaid
graph LR
    A[Monolith] --> B[Extract Service]
    B --> C[Parallel Run]
    C --> D[Gradual Cutover]
    D --> E[Deprecate Old]
```

### Hybrid Architecture Example

- **API Gateway**: Go (performance)
- **Business Logic**: Node.js (productivity)
- **ML Services**: Python (ecosystem)
- **Data Processing**: Rust (efficiency)

## Decision Template for Local Projects

**Project**: ultrathink (local development)
**Selected Runtime**: ****\_\_\_\_****
**Primary Use Case**: ****\_\_\_\_****

**Why this runtime for local dev:**

1. ***
2. ***
3. ***

**Local Setup Plan**:

- [ ] Install runtime and package manager
- [ ] Set up IDE/editor integration
- [ ] Configure hot reload/watch mode
- [ ] Set up local database (SQLite)
- [ ] Install debugging tools

**Success Criteria**:

- [ ] Project starts in < 2 seconds
- [ ] Hot reload works reliably
- [ ] Debugging is straightforward
- [ ] Can iterate quickly on features
- [ ] Resource usage acceptable for my machine

**Fallback Plan**: ****\_\_\_\_****

## References

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Python API Performance](https://fastapi.tiangolo.com/benchmarks/)
- [Go vs Node.js Benchmark](https://benchmarksgame-team.pages.debian.net/)
- [Rust Web Framework Comparison](https://www.arewewebyet.org/)
- [Stack Overflow Developer Survey](https://survey.stackoverflow.co/)
