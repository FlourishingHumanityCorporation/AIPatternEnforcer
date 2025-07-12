[← Back to Documentation](../../README.md) | [↑ Up to Architecture](../README.md)

---

# API Design Standards

Core principles and standards for designing consistent, maintainable APIs.

## Table of Contents

1. [Purpose](#purpose)
2. [Quick Start](#quick-start)
3. [RESTful Design Principles](#restful-design-principles)
4. [Resource Naming Conventions](#resource-naming-conventions)
5. [URL Structure Standards](#url-structure-standards)
6. [HTTP Methods Usage](#http-methods-usage)
7. [API Design Checklist](#api-design-checklist)
8. [Common Anti-Patterns](#common-anti-patterns)
9. [Related Guides](#related-guides)

## Purpose

This guide establishes consistent API design patterns for local development projects. Following these standards ensures
APIs are predictable, maintainable, and easy to consume - whether by your frontend, other services, or AI assistants.

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

### Core REST Principles

1. **Stateless** - Each request contains all necessary information
2. **Resource-based** - URLs represent resources, not actions
3. **HTTP methods** - Use standard HTTP verbs appropriately
4. **Consistent** - Follow patterns across all endpoints
5. **Cacheable** - Enable caching where appropriate

### Resource Naming Conventions

```text
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

## URL Structure Standards

### URL Construction Rules

```text
# Standard patterns
/api/{version}/{resource}
/api/{version}/{resource}/{id}
/api/{version}/{resource}/{id}/{sub-resource}

# Examples
/api/v1/users
/api/v1/users/123
/api/v1/users/123/posts
/api/v1/posts/456/comments

# Query parameters for filtering/sorting
/api/v1/users?role=admin&status=active
/api/v1/posts?sort=-createdAt&limit=10
```

### Naming Conventions

- **Resources**: Use plural nouns (`users`, not `user`)
- **URLs**: Use kebab-case (`reset-password`, not `resetPassword`)
- **Query params**: Use camelCase (`createdAt`, not `created_at`)
- **JSON fields**: Use camelCase consistently

## HTTP Methods Usage

### Standard HTTP Verbs

| Method | Usage | Safe | Idempotent | Body |
|--------|-------|------|------------|------|
| GET | Retrieve data | ✅ | ✅ | No |
| POST | Create resource | ❌ | ❌ | Yes |
| PUT | Replace entire resource | ❌ | ✅ | Yes |
| PATCH | Partial update | ❌ | ❌ | Yes |
| DELETE | Remove resource | ❌ | ✅ | No |

### Method Implementation Examples

```typescript
// GET - Retrieve
app.get('/api/users/:id', async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: { code: 'USER_NOT_FOUND' } });
  }
  res.json({ data: user });
});

// POST - Create
app.post('/api/users', async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json({ data: user });
});

// PUT - Replace
app.put('/api/users/:id', async (req, res) => {
  const user = await userService.replace(req.params.id, req.body);
  res.json({ data: user });
});

// PATCH - Update
app.patch('/api/users/:id', async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  res.json({ data: user });
});

// DELETE - Remove
app.delete('/api/users/:id', async (req, res) => {
  await userService.delete(req.params.id);
  res.status(204).send();
});
```

## API Design Checklist

### Before Implementation

- [ ] **Resource identified** - Clear noun-based resource
- [ ] **HTTP method appropriate** - Correct verb for action
- [ ] **URL follows conventions** - Consistent with existing patterns
- [ ] **Authentication considered** - Who can access this endpoint
- [ ] **Authorization defined** - What permissions are required
- [ ] **Input validation planned** - What data is required/optional
- [ ] **Error responses defined** - What errors can occur
- [ ] **Response format consistent** - Matches project standards

### During Implementation

- [ ] **Input sanitization** - Prevent injection attacks
- [ ] **Rate limiting applied** - Prevent abuse
- [ ] **Logging implemented** - For debugging and monitoring
- [ ] **Error handling complete** - All edge cases covered
- [ ] **Documentation written** - OpenAPI/Swagger spec
- [ ] **Tests written** - Unit and integration tests

### After Implementation

- [ ] **Performance tested** - Response times acceptable
- [ ] **Security reviewed** - No vulnerabilities introduced
- [ ] **Monitoring configured** - Alerts for failures
- [ ] **Documentation updated** - API docs reflect changes

## Common Anti-Patterns

### Avoid These Patterns

```typescript
// ❌ Verbs in URLs
POST /api/createUser
GET /api/getUsers

// ✅ Use HTTP methods with nouns
POST /api/users
GET /api/users

// ❌ Inconsistent naming
GET /api/user_profile
GET /api/userSettings

// ✅ Consistent camelCase
GET /api/userProfile
GET /api/userSettings

// ❌ Non-standard responses
{ success: true, user: {...} }
{ status: "ok", data: {...} }

// ✅ Consistent structure
{ data: {...} }
{ error: { code: "...", message: "..." } }

// ❌ Exposing internal IDs
GET /api/users/12345  // Database ID

// ✅ Use UUIDs or slugs
GET /api/users/user_abc123
GET /api/users/john-doe
```

### Performance Anti-Patterns

- **N+1 queries** - Fetch related data efficiently
- **Over-fetching** - Only return requested fields
- **No pagination** - Always paginate large collections
- **No caching** - Cache static or slow-changing data
- **Blocking operations** - Use async for I/O operations

## Related Guides

### Detailed Implementation Guides

- **[API Request/Response Patterns](api-request-response.md)** - Standard formats, error handling
- **[API Advanced Features](api-advanced-features.md)** - Pagination, filtering, authentication, versioning
- **[OpenAPI Documentation](../../guides/testing/comprehensive-testing-guide.md#api-testing)** - API testing patterns

### Supporting Documentation

- **[Data Modeling Guide](data-modeling-guide.md)** - Database schema patterns for APIs
- **[Security Optimal Practices](../../guides/security/security-best-practices.md)** - API authentication and authorization
- **[Error Handling Patterns](error-handling.md)** - Consistent error responses
- **[Performance Optimization](../../guides/performance/optimization-playbook.md)** - API performance tuning
- **[Testing Guide](../../guides/testing/comprehensive-testing-guide.md)** - API testing patterns

### External Resources

- [REST API Design Rulebook](https://www.oreilly.com/library/view/rest-api-design/9781449317904/) - O'Reilly comprehensive guide
- [HTTP Status Codes](https://httpstatuses.com/) - Complete status code reference
- [OpenAPI Specification](https://swagger.io/specification/) - API documentation standards

### Project Examples

- **[API Implementation Examples](../../guides/testing/comprehensive-testing-guide.md)** - Testing patterns
- **[Authentication Patterns](../../guides/security/security-best-practices.md)** - Auth implementation
- **[Testing Examples](../../guides/testing/comprehensive-testing-guide.md)** - Complete testing guide