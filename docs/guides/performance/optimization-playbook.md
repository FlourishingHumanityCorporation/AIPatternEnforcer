[← Back to Documentation](../../README.md) | [↑ Up to Guides](../README.md)

---

# Performance Optimization Playbook

## Table of Contents

1. [Purpose](#purpose)
2. [Quick Performance Wins](#quick-performance-wins)
3. [Frontend Performance Patterns](#frontend-performance-patterns)
  4. [Bundle Size Optimization](#bundle-size-optimization)
  5. [Component Performance](#component-performance)
  6. [Image Optimization](#image-optimization)
7. [Database Query Optimization](#database-query-optimization)
  8. [Query Performance Basics](#query-performance-basics)
  9. [Efficient Pagination](#efficient-pagination)
  10. [Database Connection Pooling](#database-connection-pooling)
11. [Caching Strategies](#caching-strategies)
  12. [In-Memory Caching](#in-memory-caching)
  13. [API Response Caching](#api-response-caching)
  14. [Browser Caching](#browser-caching)
15. [Performance Monitoring](#performance-monitoring)
  16. [Frontend Performance Metrics](#frontend-performance-metrics)
  17. [Backend Performance Monitoring](#backend-performance-monitoring)
18. [Optimization Checklists](#optimization-checklists)
  19. [Frontend Performance Checklist](#frontend-performance-checklist)
  20. [Backend Performance Checklist](#backend-performance-checklist)
21. [AI Performance Optimization Prompts](#ai-performance-optimization-prompts)
  22. [Frontend Optimization](#frontend-optimization)
  23. [Database Query Optimization](#database-query-optimization)
24. [Common Performance Anti-Patterns](#common-performance-anti-patterns)
25. [Further Reading](#further-reading)

## Purpose

This guide provides practical performance optimization techniques for local development. Good performance habits during
development lead to faster applications in production.

## Quick Performance Wins

```bash
# 1. Enable production builds locally
NODE_ENV=production npm run build

# 2. Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build -- --analyze

# 3. Profile React components
# Add to Chrome DevTools Profiler
localStorage.setItem('React_Profile', 'true');

# 4. Enable SQLite optimizations
sqlite3 app.db "PRAGMA optimize;"
```

## Frontend Performance Patterns

### Bundle Size Optimization

```typescript
// 1. Use dynamic imports for code splitting
// ❌ Imports everything upfront
import { HeavyComponent } from './HeavyComponent';

// ✅ Loads only when needed
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Route-based code splitting
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard'))
  },
  {
    path: '/analytics',
    component: lazy(() => import('./pages/Analytics'))
  }
];

// 2. Tree shake unused code
// package.json
{
  "sideEffects": false, // Enable tree shaking
  "module": "dist/index.esm.js" // ESM for better tree shaking
}

// 3. Analyze and eliminate duplicate dependencies
// Run: npm ls --depth=0 | grep "deduped"
// Fix: npm dedupe
```

### Component Performance

```typescript
// 1. Memoization for expensive computations
import { useMemo, memo } from 'react';

// ❌ Recalculates on every render
function ExpensiveList({ items, filter }) {
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  return <List items={filtered} />;
}

// ✅ Only recalculates when dependencies change
const ExpensiveList = memo(({ items, filter }) => {
  const filtered = useMemo(() =>
    items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    ),
    [items, filter]
  );

  return <List items={filtered} />;
});

// 2. Virtualization for long lists
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// 3. Debounce expensive operations
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

function SearchInput({ onSearch }) {
  const debouncedSearch = useMemo(
    () => debounce(onSearch, 300),
    [onSearch]
  );

  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Image Optimization

```typescript
// 1. Lazy load images
function LazyImage({ src, alt, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy" // Native lazy loading
      decoding="async" // Non-blocking decode
      {...props}
    />
  );
}

// 2. Responsive images
function ResponsiveImage({ src, alt }) {
  return (
    <picture>
      <source
        srcSet={`${src}?w=400 400w, ${src}?w=800 800w`}
        sizes="(max-width: 600px) 400px, 800px"
        type="image/webp"
      />
      <img
        src={`${src}?w=800`}
        alt={alt}
        loading="lazy"
      />
    </picture>
  );
}

// 3. Image optimization pipeline
// vite.config.ts
import imagemin from 'vite-plugin-imagemin';

export default {
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 75 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true }
        ]
      }
    })
  ]
};
```

## Database Query Optimization

### Query Performance Basics

```typescript
// 1. Use EXPLAIN to analyze queries
const explainQuery = db.prepare(`
  EXPLAIN QUERY PLAN
  SELECT * FROM posts 
  WHERE user_id = ? AND status = 'published'
  ORDER BY created_at DESC
  LIMIT 10
`);

console.log(explainQuery.all(userId));

// 2. Create appropriate indexes
db.exec(`
  -- Index for common WHERE clauses
  CREATE INDEX idx_posts_user_status 
  ON posts(user_id, status) 
  WHERE deleted_at IS NULL;
  
  -- Covering index for SELECT queries
  CREATE INDEX idx_posts_listing 
  ON posts(user_id, status, title, created_at, view_count)
  WHERE deleted_at IS NULL;
  
  -- Index for sorting
  CREATE INDEX idx_posts_created 
  ON posts(created_at DESC);
`);

// 3. Batch operations
// ❌ N+1 query problem
for (const userId of userIds) {
  const posts = db.prepare("SELECT * FROM posts WHERE user_id = ?").all(userId);
}

// ✅ Single query
const posts = db
  .prepare(
    `
  SELECT * FROM posts 
  WHERE user_id IN (${userIds.map(() => "?").join(",")})
`,
  )
  .all(...userIds);
```

### Efficient Pagination

```typescript
// 1. Cursor-based pagination (most efficient)
interface CursorPagination {
  limit: number;
  cursor?: string;
}

function getPosts({ limit = 20, cursor }: CursorPagination) {
  let query = `
    SELECT * FROM posts 
    WHERE status = 'published'
  `;

  const params = [];

  if (cursor) {
    const decoded = JSON.parse(atob(cursor));
    query += ` AND created_at < ?`;
    params.push(decoded.created_at);
  }

  query += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(limit + 1); // Fetch one extra

  const posts = db.prepare(query).all(...params);

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  const nextCursor = hasMore
    ? btoa(
        JSON.stringify({
          created_at: posts[posts.length - 1].created_at,
        }),
      )
    : null;

  return { posts, nextCursor, hasMore };
}

// 2. Optimize count queries
// ❌ Slow for large tables
const total = db.prepare("SELECT COUNT(*) FROM posts").get();

// ✅ Use approximate counts when exact isn't needed
const approx = db
  .prepare(
    `
  SELECT COUNT(*) * 1.0 / (
    SELECT COUNT(*) FROM posts LIMIT 1000
  ) * 1000 as estimate
  FROM posts
`,
  )
  .get();
```

### Database Connection Pooling

```typescript
// For SQLite (single connection, but with proper settings)
import Database from "better-sqlite3";

const db = new Database("app.db", {
  // Verbose logging in development
  verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
});

// Performance optimizations
db.pragma("journal_mode = WAL"); // Better concurrency
db.pragma("synchronous = NORMAL"); // Faster writes
db.pragma("cache_size = -64000"); // 64MB cache
db.pragma("temp_store = MEMORY"); // Temp tables in RAM
db.pragma("mmap_size = 268435456"); // 256MB memory map

// For PostgreSQL
import { Pool } from "pg";

const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Connection pooling for better performance
  statement_timeout: 30000,
  query_timeout: 30000,
});

// Use prepared statements
const getUserById = {
  name: "get-user-by-id",
  text: "SELECT * FROM users WHERE id = $1",
  values: [],
};
```

## Caching Strategies

### In-Memory Caching

```typescript
// 1. Simple LRU cache
class LRUCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttlSeconds = 300) {
    this.maxSize = maxSize;
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);

    if (!item) return undefined;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key: string, value: T): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Usage
const userCache = new LRUCache<User>(1000, 600); // 1000 items, 10 min TTL

async function getUser(id: string): Promise<User> {
  // Check cache first
  const cached = userCache.get(id);
  if (cached) return cached;

  // Fetch from database
  const user = await db.getUserById(id);

  // Cache for next time
  userCache.set(id, user);

  return user;
}
```

### API Response Caching

```typescript
// 1. Response caching middleware
function cacheMiddleware(ttlSeconds = 300) {
  const cache = new LRUCache<any>(100, ttlSeconds);

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached) {
      res.set("X-Cache", "HIT");
      return res.json(cached);
    }

    // Intercept response
    const originalJson = res.json;
    res.json = function (data: any) {
      res.set("X-Cache", "MISS");
      cache.set(key, data);
      return originalJson.call(this, data);
    };

    next();
  };
}

// 2. Conditional requests (ETags)
import etag from "etag";

app.get("/api/posts/:id", async (req, res) => {
  const post = await getPost(req.params.id);

  // Generate ETag
  const etagValue = etag(JSON.stringify(post));

  // Check if client has current version
  if (req.headers["if-none-match"] === etagValue) {
    return res.status(304).end(); // Not Modified
  }

  res.set("ETag", etagValue);
  res.json(post);
});
```

### Browser Caching

```typescript
// 1. Service Worker caching
// sw.js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open("v1").then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }),
  );
});

// 2. React Query for data caching
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function useUser(userId: string) {
  return useQuery(["user", userId], () => fetchUser(userId), {
    // Custom cache settings
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
```

## Performance Monitoring

### Frontend Performance Metrics

```typescript
// 1. Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  console.log(metric);
  // Send to your analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// 2. Custom performance marks
performance.mark('myFeature-start');

// ... your feature code ...

performance.mark('myFeature-end');
performance.measure(
  'myFeature-duration',
  'myFeature-start',
  'myFeature-end'
);

const measure = performance.getEntriesByName('myFeature-duration')[0];
console.log(`Feature took ${measure.duration}ms`);

// 3. React Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: string,
  actualDuration: number
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="ExpensiveComponent" onRender={onRenderCallback}>
  <ExpensiveComponent />
</Profiler>
```

### Backend Performance Monitoring

```typescript
// 1. Request timing middleware
function timingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // Convert to ms

    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
    });
  });

  next();
}

// 2. Database query timing
const db = new Database("app.db");

// Wrap database methods
const originalPrepare = db.prepare.bind(db);
db.prepare = function (sql: string) {
  const statement = originalPrepare(sql);
  const originalAll = statement.all.bind(statement);
  const originalGet = statement.get.bind(statement);
  const originalRun = statement.run.bind(statement);

  statement.all = function (...params: any[]) {
    const start = performance.now();
    const result = originalAll(...params);
    const duration = performance.now() - start;

    if (duration > 100) {
      // Log slow queries
      console.warn(`Slow query (${duration.toFixed(2)}ms): ${sql}`);
    }

    return result;
  };

  // Wrap other methods similarly...

  return statement;
};
```

## Optimization Checklists

### Frontend Performance Checklist

- [ ] Bundle size < 200KB (gzipped)
- [ ] Code splitting implemented
- [ ] Images lazy loaded
- [ ] Fonts optimized (subset, preload)
- [ ] CSS purged of unused styles
- [ ] React components memoized where needed
- [ ] Debouncing on input handlers
- [ ] Virtual scrolling for long lists
- [ ] Service worker for offline caching
- [ ] Lighthouse score > 90

### Backend Performance Checklist

- [ ] Database queries use indexes
- [ ] N+1 queries eliminated
- [ ] Response caching implemented
- [ ] Gzip compression enabled
- [ ] Connection pooling configured
- [ ] Slow queries logged
- [ ] API responses < 200ms
- [ ] Memory usage stable
- [ ] CPU usage reasonable
- [ ] No memory leaks

## AI Performance Optimization Prompts

### Frontend Optimization

````markdown
Analyze this React component for performance issues:

```tsx
[paste component code]
```text
````

Check for:

- Unnecessary re-renders
- Missing memoization
- Expensive computations in render
- Large bundle imports
- Missing lazy loading

Provide optimized version with explanations.

````

### Database Query Optimization

```markdown
Optimize this database query:
```sql
[paste query]
````

Table structure:

```sql
[paste CREATE TABLE statements]
```

Requirements:

- Identify missing indexes
- Suggest query rewrites
- Explain the optimization
- Provide EXPLAIN QUERY PLAN analysis

````

## Common Performance Anti-Patterns

1. **Importing Entire Libraries**
   ```typescript
   ❌ import _ from 'lodash';
   ✅ import debounce from 'lodash/debounce';
````

2. **Inline Function Definitions**

   ```tsx
   ❌ <button onClick={() => handleClick(id)}>
   ✅ const handleClick = useCallback((id) => {...}, []);
   ```

3. **Synchronous Operations in Render**

   ```tsx
   ❌ const sorted = items.sort((a, b) => b.score - a.score);
   ✅ const sorted = useMemo(() =>
        [...items].sort((a, b) => b.score - a.score),
        [items]
      );
   ```

4. **Missing Database Indexes**
   ```sql
   ❌ SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC;
   ✅ CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
   ```

## Further Reading

- Web Performance Working Group
- React Performance Documentation
- SQLite Performance Tuning
- Project examples: `examples/performance/`
