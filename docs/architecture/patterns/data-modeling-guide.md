[← Back to Documentation](../../README.md) | [↑ Up to Patterns](../README.md)

---

# Data Modeling Guide for Local Development

## Table of Contents

1. [Purpose](#purpose)
2. [Quick Start](#quick-start)
3. [Schema Design Principles](#schema-design-principles)
  4. [1. Choose the Right Primary Key](#1-choose-the-right-primary-key)
  5. [2. Naming Conventions](#2-naming-conventions)
  6. [3. Data Types for SQLite](#3-data-types-for-sqlite)
7. [Relationship Patterns](#relationship-patterns)
  8. [One-to-One Relationships](#one-to-one-relationships)
  9. [One-to-Many Relationships](#one-to-many-relationships)
  10. [Many-to-Many Relationships](#many-to-many-relationships)
  11. [Self-Referential Relationships](#self-referential-relationships)
12. [Common Patterns](#common-patterns)
  13. [Soft Deletes](#soft-deletes)
  14. [Audit Trails](#audit-trails)
  15. [Versioning](#versioning)
  16. [Slugs and URLs](#slugs-and-urls)
17. [Migration Strategies](#migration-strategies)
  18. [Schema Migrations with SQL](#schema-migrations-with-sql)
  19. [Migration Runner](#migration-runner)
20. [Seeding and Fixtures](#seeding-and-fixtures)
  21. [Development Seeds](#development-seeds)
  22. [Test Fixtures](#test-fixtures)
23. [Index Optimization](#index-optimization)
  24. [When to Add Indexes](#when-to-add-indexes)
  25. [Index Anti-Patterns](#index-anti-patterns)
26. [SQLite-Specific Optimal Practices](#sqlite-specific-optimal-practices)
  27. [1. Enable Foreign Keys](#1-enable-foreign-keys)
  28. [2. Use WAL Mode](#2-use-wal-mode)
  29. [3. Configure for Performance](#3-configure-for-performance)
  30. [4. Handle Date/Time](#4-handle-datetime)
31. [AI Prompt Templates](#ai-prompt-templates)
  32. [Generate Schema](#generate-schema)
  33. [Generate Migration](#generate-migration)
34. [Schema Design Checklist](#schema-design-checklist)
35. [Common Anti-Patterns](#common-anti-patterns)
36. [Further Reading](#further-reading)

## Purpose

This guide provides practical patterns for designing database schemas in local development environments. It focuses on
SQLite as the default choice while providing patterns that work across different databases.

## Quick Start

```sql
-- Example well-designed schema for a blog application
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

CREATE TABLE posts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    status TEXT CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX idx_posts_user_id ON posts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_status ON posts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_published ON posts(published_at) WHERE status = 'published';

-- Trigger for updated_at
CREATE TRIGGER update_posts_timestamp
AFTER UPDATE ON posts
BEGIN
    UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

## Schema Design Principles

### 1. Choose the Right Primary Key

```typescript
// UUID v4 (Recommended for distributed systems)
id: string = crypto.randomUUID();

// Auto-increment (Simple, but problematic for sync)
id: number = AUTO_INCREMENT;

// ULID (Sortable, unique, URL-safe)
id: string = ulid();

// SQLite-specific UUID generation
DEFAULT(lower(hex(randomblob(16))));
```

### 2. Naming Conventions

```sql
-- Tables: plural, snake_case
users, blog_posts, order_items

-- Columns: snake_case
first_name, created_at, is_active

-- Join tables: alphabetical order
posts_tags (not tags_posts)

-- Indexes: idx_table_column(s)
idx_users_email, idx_posts_user_id_status

-- Foreign keys: fk_table_column
fk_posts_user_id
```

### 3. Data Types for SQLite

```typescript
// TypeScript to SQLite mapping
interface DataTypeMapping {
  // Strings
  string: "TEXT"; // Variable length text
  email: "TEXT"; // With CHECK constraint
  url: "TEXT"; // With CHECK constraint

  // Numbers
  integer: "INTEGER"; // 64-bit signed integer
  float: "REAL"; // 64-bit float
  decimal: "TEXT"; // Store as string for precision

  // Booleans
  boolean: "INTEGER"; // 0 or 1

  // Dates
  date: "DATE"; // YYYY-MM-DD
  datetime: "DATETIME"; // YYYY-MM-DD HH:MM:SS
  timestamp: "INTEGER"; // Unix timestamp

  // JSON
  json: "TEXT"; // JSON string

  // Binary
  blob: "BLOB"; // Binary data
}
```

## Relationship Patterns

### One-to-One Relationships

```sql
-- User profile (optional one-to-one)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL
);

CREATE TABLE user_profiles (
    user_id TEXT PRIMARY KEY,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### One-to-Many Relationships

```sql
-- User has many posts
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for efficient queries
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

### Many-to-Many Relationships

```sql
-- Posts have many tags, tags have many posts
CREATE TABLE posts_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Indexes for both directions
CREATE INDEX idx_posts_tags_tag_id ON posts_tags(tag_id);
```

### Self-Referential Relationships

```sql
-- Comments with replies
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    parent_id TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Hierarchical categories
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    parent_id TEXT,
    name TEXT NOT NULL,
    path TEXT, -- Materialized path for efficient queries
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

## Common Patterns

### Soft Deletes

```sql
-- Add deleted_at column
ALTER TABLE users ADD COLUMN deleted_at DATETIME DEFAULT NULL;

-- Create partial index for active records
CREATE INDEX idx_users_email_active
ON users(email)
WHERE deleted_at IS NULL;

-- View for active records
CREATE VIEW active_users AS
SELECT * FROM users WHERE deleted_at IS NULL;

-- TypeScript implementation
interface SoftDeletable {
  deleted_at: Date | null;
}

async function softDelete(id: string) {
  return db.update(users)
    .set({ deleted_at: new Date() })
    .where(eq(users.id, id));
}

async function findActive() {
  return db.select()
    .from(users)
    .where(isNull(users.deleted_at));
}
```

### Audit Trails

```sql
-- Audit log table
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT CHECK(action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    user_id TEXT,
    changes TEXT, -- JSON string of changes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for audit logging
CREATE TRIGGER audit_users_update
AFTER UPDATE ON users
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, changes)
    VALUES (
        'users',
        NEW.id,
        'UPDATE',
        json_object(
            'old', json_object('email', OLD.email, 'username', OLD.username),
            'new', json_object('email', NEW.email, 'username', NEW.username)
        )
    );
END;
```

### Versioning

```sql
-- Content versioning
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE
);

CREATE TABLE post_versions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    post_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    version INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(post_id, version)
);
```

### Slugs and URLs

```sql
-- Unique slugs with conflicts handling
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    slug_suffix INTEGER DEFAULT 0
);

-- TypeScript slug generation
function generateSlug(title: string, existingSlugs: string[]): string {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let suffix = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return slug;
}
```

## Migration Strategies

### Schema Migrations with SQL

```sql
-- migrations/001_create_users.sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- migrations/002_add_username.sql
ALTER TABLE users ADD COLUMN username TEXT;
UPDATE users SET username = email WHERE username IS NULL;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- migrations/003_add_soft_delete.sql
ALTER TABLE users ADD COLUMN deleted_at DATETIME DEFAULT NULL;
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
```

### Migration Runner

```typescript
// Simple migration runner for SQLite
import { readdir, readFile } from "fs/promises";
import { Database } from "better-sqlite3";

async function runMigrations(db: Database) {
  // Create migrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get executed migrations
  const executed = db
    .prepare("SELECT filename FROM migrations")
    .all()
    .map((row) => row.filename);

  // Read migration files
  const files = await readdir("./migrations");
  const pending = files
    .filter((f) => f.endsWith(".sql"))
    .filter((f) => !executed.includes(f))
    .sort();

  // Execute pending migrations
  for (const file of pending) {
    const sql = await readFile(`./migrations/${file}`, "utf-8");

    db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO migrations (filename) VALUES (?)").run(file);
    })();

    console.log(`✓ Executed migration: ${file}`);
  }
}
```

## Seeding and Fixtures

### Development Seeds

```typescript
// seeds/development.ts
import { faker } from "@faker-js/faker";

export async function seed(db: Database) {
  // Clear existing data
  await db.exec("DELETE FROM posts");
  await db.exec("DELETE FROM users");

  // Create users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = {
      id: crypto.randomUUID(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      created_at: faker.date.past(),
    };
    users.push(user);

    await db.insert("users").values(user);
  }

  // Create posts for each user
  for (const user of users) {
    const postCount = faker.number.int({ min: 0, max: 10 });

    for (let i = 0; i < postCount; i++) {
      await db.insert("posts").values({
        id: crypto.randomUUID(),
        user_id: user.id,
        title: faker.lorem.sentence(),
        slug: faker.lorem.slug(),
        content: faker.lorem.paragraphs(),
        status: faker.helpers.arrayElement(["draft", "published"]),
        published_at: faker.date.recent(),
      });
    }
  }
}
```

### Test Fixtures

```typescript
// fixtures/users.ts
export const testUsers = {
  alice: {
    id: "user-alice",
    email: "alice@test.com",
    username: "alice",
    password_hash: "$2b$10$hashed",
  },
  bob: {
    id: "user-bob",
    email: "bob@test.com",
    username: "bob",
    password_hash: "$2b$10$hashed",
  },
};

// fixtures/posts.ts
export const testPosts = {
  published: {
    id: "post-1",
    user_id: testUsers.alice.id,
    title: "Published Post",
    slug: "published-post",
    status: "published",
    published_at: new Date("2024-01-01"),
  },
  draft: {
    id: "post-2",
    user_id: testUsers.alice.id,
    title: "Draft Post",
    slug: "draft-post",
    status: "draft",
  },
};
```

## Index Optimization

### When to Add Indexes

```sql
-- Foreign key columns (automatic in some databases)
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Columns used in WHERE clauses
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_status ON posts(status);

-- Columns used in ORDER BY
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Composite indexes for multiple conditions
CREATE INDEX idx_posts_user_status ON posts(user_id, status);

-- Partial indexes for common queries
CREATE INDEX idx_posts_published
ON posts(published_at)
WHERE status = 'published' AND deleted_at IS NULL;

-- Covering indexes (include all needed columns)
CREATE INDEX idx_posts_listing
ON posts(user_id, status, title, created_at)
WHERE deleted_at IS NULL;
```

### Index Anti-Patterns

```sql
-- ❌ Too many indexes slow down writes
-- ❌ Indexing low-cardinality columns (like boolean)
-- ❌ Redundant indexes (idx_a_b covers idx_a)
-- ❌ Indexing columns that are rarely queried
```

## SQLite-Specific Optimal Practices

### 1. Enable Foreign Keys

```typescript
// Always enable foreign keys in SQLite
db.pragma("foreign_keys = ON");
```

### 2. Use WAL Mode

```typescript
// Write-Ahead Logging for better concurrency
db.pragma("journal_mode = WAL");
```

### 3. Configure for Performance

```typescript
// Development settings
db.pragma("synchronous = NORMAL"); // Faster, still safe
db.pragma("cache_size = -64000"); // 64MB cache
db.pragma("temp_store = MEMORY"); // Temp tables in memory
```

### 4. Handle Date/Time

```sql
-- Store as ISO 8601 strings
created_at DATETIME DEFAULT (datetime('now'))

-- Or as Unix timestamps
created_at INTEGER DEFAULT (unixepoch())
```

## AI Prompt Templates

### Generate Schema

```markdown
Generate a SQLite schema for a [application type] with these entities:

- [Entity 1]: [description]
- [Entity 2]: [description]

Requirements:

- Use TEXT for UUID primary keys with DEFAULT (lower(hex(randomblob(16))))
- Include created_at, updated_at timestamps
- Add soft delete support (deleted_at)
- Create appropriate indexes
- Add foreign key constraints
- Include audit triggers for important tables
```

### Generate Migration

```markdown
Generate a SQL migration to:
[describe the change needed]

Current schema:
[paste relevant CREATE TABLE statements]

Requirements:

- Make it backward compatible if possible
- Include any necessary data migrations
- Add/update relevant indexes
- Handle existing data appropriately
```

## Schema Design Checklist

Before finalizing a schema:

- [ ] Primary keys are UUIDs or appropriate type
- [ ] Foreign keys have indexes
- [ ] Soft deletes implemented where needed
- [ ] Timestamps (created_at, updated_at) added
- [ ] Appropriate constraints (NOT NULL, UNIQUE, CHECK)
- [ ] Indexes for common query patterns
- [ ] Naming follows conventions
- [ ] Migrations are reversible
- [ ] Test data seeders created
- [ ] Performance settings configured

## Common Anti-Patterns

1. **EAV (Entity-Attribute-Value)**

   ```sql
   ❌ CREATE TABLE attributes (entity_id, attribute, value)
   ✅ Use proper columns or JSON for flexibility
   ```

2. **Missing Indexes on Foreign Keys**

   ```sql
   ❌ user_id INTEGER REFERENCES users(id)
   ✅ user_id INTEGER REFERENCES users(id),
      CREATE INDEX idx_table_user_id ON table(user_id)
   ```

3. **Using ENUM in SQLite**

   ```sql
   ❌ status ENUM('active', 'inactive')
   ✅ status TEXT CHECK(status IN ('active', 'inactive'))
   ```

4. **Storing Arrays as Comma-Separated**
   ```sql
   ❌ tags TEXT -- "tag1,tag2,tag3"
   ✅ CREATE TABLE post_tags -- Proper join table
   ```

## Further Reading

- SQLite Documentation
- Database Design Patterns
- Migration Optimal Practices
- Project examples: `examples/schemas/`
