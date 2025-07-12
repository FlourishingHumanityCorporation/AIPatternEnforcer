[← Back to Documentation](../../README.md) | [↑ Up to Architecture](../README.md)

---

# API Advanced Features

Advanced API patterns including pagination, filtering, versioning, authentication, and rate limiting.

## Table of Contents

1. [Pagination Strategies](#pagination-strategies)
2. [Filtering and Sorting](#filtering-and-sorting)
3. [Versioning Approaches](#versioning-approaches)
4. [Authentication Patterns](#authentication-patterns)
5. [Rate Limiting](#rate-limiting)

## Pagination Strategies

### Offset-Based Pagination

Traditional page-based pagination for stable datasets:

```typescript
// Request
GET /api/users?page=1&limit=20

// Response
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}

// Implementation
interface PaginationParams {
  page: number;
  limit: number;
}

function paginateQuery(query: any, { page, limit }: PaginationParams) {
  const offset = (page - 1) * limit;
  return query.offset(offset).limit(limit);
}
```

### Cursor-Based Pagination

For real-time feeds and large datasets:

```typescript
// Request
GET /api/posts?cursor=eyJ0aW1lc3RhbXAiOiIyMDI0LTAxLTE1VDEwOjMwOjAwWiJ9&limit=20

// Response  
{
  "data": [...],
  "meta": {
    "limit": 20,
    "hasNext": true,
    "nextCursor": "eyJ0aW1lc3RhbXAiOiIyMDI0LTAxLTE1VDEwOjQ1OjAwWiJ9",
    "prevCursor": "eyJ0aW1lc3RhbXAiOiIyMDI0LTAxLTE1VDEwOjE1OjAwWiJ9"
  }
}

// Implementation
interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

function parseCursor(cursor: string): { timestamp: string } {
  return JSON.parse(Buffer.from(cursor, 'base64').toString());
}

function createCursor(item: any): string {
  return Buffer.from(JSON.stringify({ timestamp: item.createdAt })).toString('base64');
}
```

## Filtering and Sorting

### Filter Syntax

Consistent query parameter syntax for filtering:

```typescript
// Basic filters
GET /api/users?filter[role]=admin
GET /api/users?filter[status]=active

// Multiple values (OR)
GET /api/users?filter[role]=admin,user

// Comparison operators
GET /api/users?filter[age][gte]=18
GET /api/users?filter[age][lt]=65
GET /api/users?filter[name][contains]=john

// Date ranges
GET /api/posts?filter[createdAt][gte]=2024-01-01&filter[createdAt][lt]=2024-02-01

// Implementation
interface FilterOperators {
  eq?: any;        // equals
  ne?: any;        // not equals
  gt?: any;        // greater than
  gte?: any;       // greater than or equal
  lt?: any;        // less than
  lte?: any;       // less than or equal
  in?: any[];      // in array
  nin?: any[];     // not in array
  contains?: string; // string contains
  startsWith?: string; // string starts with
  endsWith?: string;   // string ends with
}

function parseFilters(filterParams: Record<string, any>): Record<string, FilterOperators> {
  const filters: Record<string, FilterOperators> = {};
  
  for (const [field, value] of Object.entries(filterParams)) {
    if (typeof value === 'object' && value !== null) {
      filters[field] = value;
    } else {
      filters[field] = { eq: value };
    }
  }
  
  return filters;
}
```

### Sort Syntax

Flexible sorting with multiple fields:

```typescript
// Single field ascending
GET /api/users?sort=name

// Single field descending  
GET /api/users?sort=-createdAt

// Multiple fields
GET /api/users?sort=role,-createdAt,name

// Implementation
interface SortField {
  field: string;
  direction: 'asc' | 'desc';
}

function parseSort(sortParam: string): SortField[] {
  if (!sortParam) return [];
  
  return sortParam.split(',').map(field => {
    const direction = field.startsWith('-') ? 'desc' : 'asc';
    const fieldName = field.startsWith('-') ? field.slice(1) : field;
    return { field: fieldName, direction };
  });
}
```

## Versioning Approaches

### URL Path Versioning (Recommended for Simplicity)

```typescript
// Version in URL path
GET /api/v1/users
GET /api/v2/users

// Implementation
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// Version-specific controllers
const v1Controller = {
  getUsers: async (req, res) => {
    // v1 format
    const users = await userService.getUsers();
    res.json({ users }); // Legacy format
  }
};

const v2Controller = {
  getUsers: async (req, res) => {
    // v2 format with pagination
    const result = await userService.getUsersPaginated(req.query);
    res.json({
      data: result.users,
      meta: result.pagination
    });
  }
};
```

### Header Versioning

```typescript
// Version in Accept header
GET /api/users
Accept: application/vnd.api+json;version=2

// Implementation
function getAPIVersion(req: Request): string {
  const acceptHeader = req.headers.accept || '';
  const versionMatch = acceptHeader.match(/version=(\d+)/);
  return versionMatch ? versionMatch[1] : '1';
}

app.use('/api', (req, res, next) => {
  req.apiVersion = getAPIVersion(req);
  next();
});
```

## Authentication Patterns

### Token-Based Auth

```typescript
// JWT implementation
interface AuthToken {
  sub: string;      // User ID
  iat: number;      // Issued at
  exp: number;      // Expires at
  scope: string[];  // Permissions
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthToken;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
}

// Role-based permissions
function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.scope.some(scope => roles.includes(scope))) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }
    next();
  };
}

// Usage
app.get('/api/users', requireAuth, requireRole(['admin']), getUsersHandler);
```

## Rate Limiting

```typescript
// Rate limiting with Redis
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'api_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});

// Per-user rate limiting
const userLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'user_limit:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    // Different limits based on user tier
    const userTier = req.user?.tier || 'free';
    return userTier === 'premium' ? 1000 : 100;
  },
  keyGenerator: (req) => req.user?.sub || req.ip
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/', requireAuth, userLimiter);
```

## See Also

- [API Design Standards](api-design-standards.md) - Core REST principles
- [API Request/Response Patterns](api-request-response.md) - Standard formats
- [Testing Guide](../../guides/testing/comprehensive-testing-guide.md) - API testing patterns