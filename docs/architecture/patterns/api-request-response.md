[← Back to Documentation](../../README.md) | [↑ Up to Architecture](../README.md)

---

# API Request/Response Patterns

Standardized patterns for API request structure, response format, and error handling.

## Table of Contents

1. [Request/Response Standards](#requestresponse-standards)
2. [Standard Request Structure](#standard-request-structure)
3. [Standard Response Structure](#standard-response-structure)
4. [Error Response Patterns](#error-response-patterns)
5. [HTTP Status Code Usage](#http-status-code-usage)

## Request/Response Standards

### Standard Request Structure

All API requests should follow this structure:

```typescript
interface APIRequest {
  // Path parameters
  params: Record<string, string>;
  
  // Query parameters
  query: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: Record<string, any>;
    include?: string[];
  };
  
  // Request body (POST/PUT/PATCH)
  body?: {
    data: Record<string, any>;
    meta?: Record<string, any>;
  };
  
  // Headers
  headers: {
    'Content-Type': 'application/json';
    'Authorization'?: string;
    'X-Request-ID'?: string;
  };
}
```

### Standard Response Structure

All API responses should follow this consistent format:

```typescript
interface APIResponse<T> {
  // Success responses
  data: T | T[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    requestId?: string;
    timestamp?: string;
  };
  
  // Error responses
  error?: {
    code: string;
    message: string;
    details?: any;
    requestId?: string;
    timestamp?: string;
  };
}
```

Example successful response:

```json
{
  "data": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Error Response Patterns

### Standard Error Format

All errors should follow this consistent structure:

```typescript
interface ErrorResponse {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: {             // Additional context
      field?: string;       // For validation errors
      value?: any;          // Invalid value
      constraints?: string[];
    };
    requestId?: string;     // For debugging
    timestamp?: string;     // When error occurred
  };
}
```

### HTTP Status Code Usage

Use appropriate HTTP status codes consistently:

**2xx Success**
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST with resource creation
- `202 Accepted` - Async operation accepted
- `204 No Content` - Successful DELETE or update with no response body

**4xx Client Errors**
- `400 Bad Request` - Invalid request format or missing required fields
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Valid auth but insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (duplicate email, etc.)
- `422 Unprocessable Entity` - Valid format but business logic validation failed
- `429 Too Many Requests` - Rate limit exceeded

**5xx Server Errors**
- `500 Internal Server Error` - Unexpected server error
- `502 Bad Gateway` - Upstream service error
- `503 Service Unavailable` - Temporary service outage
- `504 Gateway Timeout` - Upstream service timeout

Example error responses:

```typescript
// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request format",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "constraints": ["must be a valid email address"]
    },
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token",
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// 404 Not Found
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User with ID 'user_123' not found",
    "details": {
      "resourceType": "User",
      "resourceId": "user_123"
    },
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// 429 Rate Limited
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 60 seconds.",
    "details": {
      "retryAfter": 60,
      "limit": 100,
      "remaining": 0,
      "resetTime": "2024-01-15T10:31:00Z"
    },
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## See Also

- [API Design Standards](api-design-standards.md) - Core REST principles
- [API Advanced Features](api-advanced-features.md) - Pagination, auth, versioning
- [Testing Guide](../../guides/testing/comprehensive-testing-guide.md) - API testing patterns