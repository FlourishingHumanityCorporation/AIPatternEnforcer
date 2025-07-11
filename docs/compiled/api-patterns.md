# API Documentation

This document defines our API patterns and rules

# API Documentation

This document describes our API design patterns and best practices.

## RESTful Endpoints

Our API follows RESTful principles with consistent naming and behavior.

## Technical Patterns

### Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}
```
