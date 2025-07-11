---meta: title = API Documentation---
---

meta: description = This document defines our API patterns and rules---

---human---

# API Documentation

This document describes our API design patterns and best practices.

## RESTful Endpoints

Our API follows RESTful principles with consistent naming and behavior.

---ai-rule---
Always use RESTful naming conventions: GET /users, POST /users, GET /users/:id

---ai-rule---
Return consistent error responses with code, message, and details fields

---ai-pattern---

### Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}
```

---ai-example---

### Successful Response Example

```typescript
// GET /api/users/123
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

---ai-context: endpoint-naming---
Use plural nouns for collections (users, not user)

---ai-context: http-methods---
GET for reading, POST for creating, PUT for full updates, PATCH for partial updates, DELETE for removal
