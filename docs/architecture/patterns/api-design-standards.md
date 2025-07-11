# API Design Standards

## Purpose

This guide establishes consistent API design patterns for local development projects. Following these standards ensures APIs are predictable, maintainable, and easy to consume - whether by your frontend, other services, or AI assistants.

## Quick Start

```typescript
// Example well-designed endpoint
// GET /api/users?page=1&limit=20&sort=-createdAt&filter[role]=admin

app.get("/api/users", async (req, res) => {
  const { page = 1, limit = 20, sort = "-createdAt", filter = {} } = req.query;

  const users = await userService.findAll({
    pagination: { page, limit },
    sort: parseSort(sort),
    filter: parseFilter(filter),
  });

  res.json({
    data: users,
    meta: {
      page,
      limit,
      total: users.total,
      totalPages: Math.ceil(users.total / limit),
    },
  });
});
```

## RESTful Design Principles

### Resource Naming Conventions

```
# Collection Resources (plural nouns)
GET    /api/users              # List users
POST   /api/users              # Create user
GET    /api/users/:id          # Get specific user
PUT    /api/users/:id          # Update entire user
PATCH  /api/users/:id          # Partial update
DELETE /api/users/:id          # Delete user

# Nested Resources
GET    /api/users/:userId/posts       # User's posts
POST   /api/users/:userId/posts       # Create post for user
GET    /api/posts/:postId/comments    # Post's comments

# Actions (when REST doesn't fit)
POST   /api/users/:id/activate        # Activate user
POST   /api/users/:id/reset-password  # Trigger password reset
POST   /api/auth/login               # Login action
POST   /api/auth/logout              # Logout action
```

### URL Structure Best Practices

```typescript
// ✅ Good URLs
/api/users
/api/users/123
/api/users/123/posts
/api/posts?status=published&author=123

// ❌ Bad URLs
/api/getUsers                 // Don't use verbs
/api/users/list              // Redundant
/api/user-posts              // Use nested resources
/api/users/123/get-posts     // Don't mix REST with RPC
```

## Request/Response Standards

### Standard Request Structure

```typescript
// POST/PUT request body
{
  "data": {
    "type": "user",              // Resource type
    "attributes": {              // Resource data
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin"
    },
    "relationships": {           // Related resources
      "team": {
        "data": { "type": "team", "id": "456" }
      }
    }
  }
}

// Query parameters
interface QueryParams {
  // Pagination
  page?: number;              // Page number (1-based)
  limit?: number;             // Items per page

  // Sorting
  sort?: string;              // -createdAt, name, +updatedAt

  // Filtering
  filter?: {
    [field: string]: string | string[];
  };

  // Field selection
  fields?: string[];          // Sparse fieldsets

  // Relationships
  include?: string[];         // Include related resources
}
```

### Standard Response Structure

```typescript
// Success Response - Single Resource
{
  "data": {
    "type": "user",
    "id": "123",
    "attributes": {
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "relationships": {
      "posts": {
        "links": {
          "related": "/api/users/123/posts"
        }
      }
    }
  },
  "meta": {
    "version": "1.0",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}

// Success Response - Collection
{
  "data": [
    { "type": "user", "id": "1", "attributes": {...} },
    { "type": "user", "id": "2", "attributes": {...} }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "links": {
    "self": "/api/users?page=1",
    "first": "/api/users?page=1",
    "last": "/api/users?page=5",
    "next": "/api/users?page=2",
    "prev": null
  }
}
```

## Error Response Patterns

### Standard Error Format

```typescript
interface ErrorResponse {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: any;          // Additional error context
    field?: string;         // Field that caused error (validation)
    timestamp: string;      // When error occurred
    requestId?: string;     // For debugging
  };
}

// Examples
// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    },
    "timestamp": "2024-01-15T10:00:00Z"
  }
}

// 404 Not Found
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}

// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req_123abc",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### HTTP Status Code Usage

```typescript
// Success Codes
200 OK                  // GET, PUT, PATCH success
201 Created            // POST success with new resource
204 No Content         // DELETE success, no body needed

// Client Error Codes
400 Bad Request        // Invalid request format/data
401 Unauthorized       // No/invalid authentication
403 Forbidden          // Authenticated but not allowed
404 Not Found          // Resource doesn't exist
409 Conflict           // Resource state conflict
422 Unprocessable      // Validation errors

// Server Error Codes
500 Internal Error     // Unexpected server error
502 Bad Gateway        // Upstream service error
503 Service Unavailable // Temporary overload/maintenance
```

## Pagination Strategies

### Offset-Based Pagination

```typescript
// Request: GET /api/users?page=2&limit=20

// Implementation
async function paginate(model: any, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({ skip: offset, take: limit }),
    model.count(),
  ]);

  return {
    data,
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    },
  };
}
```

### Cursor-Based Pagination

```typescript
// Request: GET /api/users?cursor=eyJpZCI6MTIzfQ&limit=20

// Implementation
async function cursorPaginate(model: any, cursor?: string, limit = 20) {
  const decodedCursor = cursor
    ? JSON.parse(Buffer.from(cursor, "base64").toString())
    : null;

  const data = await model.findMany({
    take: limit + 1, // Fetch one extra to check if there's more
    ...(decodedCursor && {
      where: { id: { gt: decodedCursor.id } },
      orderBy: { id: "asc" },
    }),
  });

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  const nextCursor = hasMore
    ? Buffer.from(JSON.stringify({ id: items[items.length - 1].id })).toString(
        "base64",
      )
    : null;

  return {
    data: items,
    meta: {
      hasMore,
      nextCursor,
    },
  };
}
```

## Filtering and Sorting

### Filter Syntax

```typescript
// Simple filters
GET /api/users?filter[role]=admin
GET /api/users?filter[status]=active

// Multiple values (OR)
GET /api/users?filter[role]=admin,moderator

// Range filters
GET /api/users?filter[age][gte]=18&filter[age][lte]=65

// Implementation
function parseFilter(filter: any) {
  const where = {};

  Object.entries(filter).forEach(([key, value]) => {
    if (typeof value === 'object') {
      // Handle operators like gte, lte, etc.
      where[key] = value;
    } else if (value.includes(',')) {
      // Handle multiple values
      where[key] = { in: value.split(',') };
    } else {
      // Simple equality
      where[key] = value;
    }
  });

  return where;
}
```

### Sort Syntax

```typescript
// Sort syntax: +field (asc) or -field (desc)
GET /api/users?sort=-createdAt        // Newest first
GET /api/users?sort=+name,-createdAt  // Name A-Z, then newest

// Implementation
function parseSort(sort: string) {
  return sort.split(',').map(field => {
    const direction = field.startsWith('-') ? 'desc' : 'asc';
    const fieldName = field.replace(/^[+-]/, '');
    return { [fieldName]: direction };
  });
}
```

## Versioning Approaches

### URL Path Versioning (Recommended for Simplicity)

```typescript
// Version in URL path
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);

// Implementation
const v1Routes = express.Router();
v1Routes.get("/users", v1UserController.list);

const v2Routes = express.Router();
v2Routes.get("/users", v2UserController.list); // New response format
```

### Header Versioning

```typescript
// Version in Accept header
// Accept: application/vnd.api+json;version=1

app.use((req, res, next) => {
  const acceptHeader = req.get("Accept") || "";
  const version = acceptHeader.match(/version=(\d+)/)?.[1] || "1";
  req.apiVersion = version;
  next();
});
```

## Authentication Patterns

### Token-Based Auth

```typescript
// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await validateCredentials(email, password);
  if (!user) {
    return res.status(401).json({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      },
    });
  }

  const token = generateToken(user);

  res.json({
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
  });
});

// Protected endpoint
app.get("/api/users/me", authenticate, async (req, res) => {
  res.json({
    data: req.user,
  });
});

// Authentication middleware
function authenticate(req, res, next) {
  const token = req.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: {
        code: "NO_TOKEN",
        message: "Authentication required",
      },
    });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired token",
      },
    });
  }
}
```

## Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
});

app.use("/api", globalLimiter);
app.use("/api/auth", authLimiter);
```

## API Documentation

### OpenAPI/Swagger Example

```yaml
openapi: 3.0.0
info:
  title: Local API
  version: 1.0.0

paths:
  /api/users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/User"
                  meta:
                    $ref: "#/components/schemas/PaginationMeta"
```

## AI Prompt Templates

### Generate RESTful API

```markdown
Generate a RESTful API for [resource name] with the following:

- Standard CRUD operations
- Pagination with page/limit parameters
- Sorting by multiple fields
- Filtering by [list specific fields]
- Error handling with standard format
- Input validation
- Authentication middleware

Use Express.js with TypeScript and follow these patterns:

- Response format: { data, meta, links }
- Error format: { error: { code, message, details } }
- Status codes: 200/201/204/400/401/403/404/500
```

### Generate API Tests

```markdown
Generate integration tests for this API endpoint:
[paste endpoint code]

Include tests for:

- Happy path with valid data
- Validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Pagination parameters
- Sorting parameters
- Filter parameters

Use supertest and follow arrange-act-assert pattern.
```

## API Design Checklist

Before implementing an API:

- [ ] Resources use plural nouns
- [ ] URLs follow RESTful conventions
- [ ] Response format is consistent
- [ ] Error format is standardized
- [ ] Pagination is implemented
- [ ] Sorting supports multiple fields
- [ ] Filtering is flexible
- [ ] Authentication is required where needed
- [ ] Rate limiting is configured
- [ ] API is documented
- [ ] Integration tests exist

## Common API Anti-Patterns

1. **Inconsistent Naming**

   ```
   ❌ /api/getUser, /api/user-list, /api/CreateUser
   ✅ /api/users (GET, POST)
   ```

2. **Nested Resources Too Deep**

   ```
   ❌ /api/users/123/posts/456/comments/789/likes
   ✅ /api/comments/789/likes
   ```

3. **Using Status Codes Wrong**

   ```typescript
   ❌ res.status(200).json({ error: "Not found" })
   ✅ res.status(404).json({ error: { code: "NOT_FOUND" } })
   ```

4. **Exposing Internal Details**
   ```typescript
   ❌ { error: "SequelizeValidationError: email must be unique" }
   ✅ { error: { code: "EMAIL_EXISTS", message: "Email already in use" } }
   ```

## Further Reading

- REST API Design Rulebook
- JSON:API Specification
- OpenAPI Specification
- Project examples: `examples/api/`
