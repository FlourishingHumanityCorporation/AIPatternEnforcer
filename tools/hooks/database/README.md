# Database Hooks

This directory contains hooks for validating database patterns in the recommended tech stack.

**Environment Variable**: `HOOK_DATABASE`

## Available Hooks

### 1. `postgresql-pattern-enforcer.js`

**Purpose**: Validates PostgreSQL database best practices

**Validates**:

- ✅ Connection string configuration with SSL
- ✅ Neon-specific connection patterns
- ✅ Query optimization and security patterns
- ✅ Prisma integration best practices
- ✅ Performance optimization patterns
- ✅ SQL injection prevention

**Common Issues Detected**:

- 🚫 Connection strings without SSL configuration
- 🚫 SELECT \* queries instead of specific columns
- 🚫 String interpolation in SQL queries (injection risk)
- 🚫 N+1 query patterns in loops
- 🚫 Missing pagination in findMany operations
- 🚫 ORDER BY without LIMIT clauses
- 🚫 Hardcoded database credentials

### 2. `pgvector-validator.js`

**Purpose**: Validates pgvector usage for vector embeddings

**Validates**:

- ✅ Vector column definition with proper dimensions
- ✅ Similarity search optimization patterns
- ✅ Index configuration (IVFFlat, HNSW)
- ✅ Performance patterns for vector operations
- ✅ Embedding storage best practices
- ✅ Dimension validation and consistency

**Common Issues Detected**:

- 🚫 Vector columns without dimension specification
- 🚫 Missing NOT NULL constraints on vector columns
- 🚫 Similarity search without LIMIT clauses
- 🚫 Vector indexes without proper configuration
- 🚫 Individual vector inserts in loops
- 🚫 Hardcoded embedding dimensions
- 🚫 High-dimensional vectors without justification

## Usage

### Basic Hook Configuration

```bash
# In .env file
HOOKS_DISABLED=false    # Enable hooks
HOOK_DATABASE=true      # Enable database validation
```

### Testing Hook Functionality

```bash
# Test PostgreSQL hook
echo '{"tool_name":"Write","tool_input":{"file_path":"db.sql","content":"SELECT * FROM users"}}' | node tools/hooks/database/postgresql-pattern-enforcer.js

# Test pgvector hook
echo '{"tool_name":"Write","tool_input":{"file_path":"vector.sql","content":"embedding vector()"}}' | node tools/hooks/database/pgvector-validator.js
```

### Integration with Claude Code

Add to `.claude/settings.json`:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [
        {
          "type": "command",
          "command": "node tools/hooks/database/postgresql-pattern-enforcer.js",
          "timeout": 2,
          "family": "database",
          "priority": "high"
        },
        {
          "type": "command",
          "command": "node tools/hooks/database/pgvector-validator.js",
          "timeout": 2,
          "family": "database",
          "priority": "high"
        }
      ]
    }
  ]
}
```

## Best Practices

### PostgreSQL Best Practices

- Use SSL connections for security
- Implement proper connection pooling
- Use parameterized queries to prevent SQL injection
- Select specific columns instead of SELECT \*
- Add pagination to prevent large result sets
- Use proper error handling for database operations

### pgvector Best Practices

- Specify vector dimensions explicitly
- Use NOT NULL constraints for vector columns
- Configure proper indexes (IVFFlat for < 1M vectors, HNSW for > 1M)
- Use LIMIT in similarity searches
- Batch vector operations for better performance
- Normalize vectors when necessary

## Configuration

### Environment Variables

- `HOOK_DATABASE=true` - Enable database hooks
- `HOOK_VERBOSE=true` - Enable verbose output for debugging

### Folder Structure

```
database/
├── postgresql-pattern-enforcer.js
├── pgvector-validator.js
├── __tests__/
│   ├── postgresql-pattern-enforcer.test.js
│   └── pgvector-validator.test.js
└── README.md
```

## Testing

Run tests for database hooks:

```bash
npm test -- tools/hooks/database/__tests__/
```

## Debugging

Enable verbose output to see hook execution details:

```bash
HOOK_VERBOSE=true echo '{"tool_input":{"file_path":"test.sql","content":"..."}}' | node tools/hooks/database/postgresql-pattern-enforcer.js
```

## Integration

These hooks are designed to work with the recommended tech stack:

- **PostgreSQL (Neon)** - Cloud-native PostgreSQL
- **Prisma** - Type-safe database ORM
- **pgvector** - Vector similarity search
- **TypeScript** - Type safety throughout

The hooks ensure that database integration follows best practices for performance, security, and maintainability in local development environments.

## Common Patterns

### Secure Connection Configuration

```javascript
// ✅ Good
const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://user:pass@host/db?ssl=true";

// ❌ Bad
const DATABASE_URL = "postgresql://user:pass@host/db";
```

### Safe Query Patterns

```sql
-- ✅ Good
SELECT id, name, email FROM users WHERE active = $1 LIMIT 10;

-- ❌ Bad
SELECT * FROM users WHERE active = true;
```

### Vector Operations

```sql
-- ✅ Good
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  embedding vector(1536) NOT NULL
);

CREATE INDEX ON documents USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- ❌ Bad
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  embedding vector()
);
```

### Similarity Search

```sql
-- ✅ Good
SELECT id, content
FROM documents
ORDER BY embedding <-> '[0.1, 0.2, 0.3]'::vector
LIMIT 5;

-- ❌ Bad
SELECT * FROM documents ORDER BY embedding <-> '[0.1, 0.2, 0.3]';
```
