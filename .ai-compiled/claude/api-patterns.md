## api-patterns

### Rules

- Always use RESTful naming conventions: GET /users, POST /users, GET /users/:id
- Return consistent error responses with code, message, and details fields

### Patterns

### Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}
```

### Context

**endpoint-naming**: Use plural nouns for collections (users, not user)

**http-methods**: GET for reading, POST for creating, PUT for full updates, PATCH for partial updates, DELETE for removal
