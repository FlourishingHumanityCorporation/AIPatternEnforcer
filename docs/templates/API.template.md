# API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
  3. [Obtain Access Token](#obtain-access-token)
  4. [Refresh Token](#refresh-token)
5. [Error Responses](#error-responses)
6. [Endpoints](#endpoints)
  7. [Users](#users)
    8. [List Users](#list-users)
    9. [Get User](#get-user)
    10. [Create User](#create-user)
    11. [Update User](#update-user)
    12. [Delete User](#delete-user)
  13. [[Resource Name]](#resource-name)
    14. [List [Resources]](#list-resources)
    15. [Get [Resource]](#get-resource)
    16. [Create [Resource]](#create-resource)
    17. [Update [Resource]](#update-resource)
    18. [Delete [Resource]](#delete-resource)
19. [Pagination](#pagination)
20. [Filtering](#filtering)
21. [Sorting](#sorting)
22. [Rate Limiting](#rate-limiting)
23. [Webhooks](#webhooks)
  24. [Configure Webhook](#configure-webhook)
  25. [Webhook Payload](#webhook-payload)
26. [API Versioning](#api-versioning)
27. [SDK Usage](#sdk-usage)
  28. [JavaScript/TypeScript](#javascripttypescript)
  29. [Python](#python)
30. [Testing](#testing)
  31. [Test Environment](#test-environment)
  32. [Example Requests](#example-requests)
33. [Changelog](#changelog)
  34. [v1.2.0 (2024-01-15)](#v120-2024-01-15)
  35. [v1.1.0 (2023-12-01)](#v110-2023-12-01)
  36. [v1.0.0 (2023-10-01)](#v100-2023-10-01)
37. [Support](#support)

## Overview

Base URL: `https://api.[your-domain].com/v1`

All requests must include:

- `Content-Type: application/json` header
- `Authorization: Bearer {token}` header (for authenticated endpoints)

## Authentication

### Obtain Access Token

```http
POST /auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600,
    "user": {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### Refresh Token

```http
POST /auth/refresh
```

Request:

```json
{
  "refreshToken": "eyJ..."
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

Common error codes:

- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `RATE_LIMITED` - Too many requests

## Endpoints

### Users

#### List Users

```http
GET /users
```

Query parameters:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search by name or email
- `role` (string): Filter by role

Response:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "123",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### Get User

```http
GET /users/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "profile": {
      "avatar": "https://...",
      "bio": "Software developer"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Create User

```http
POST /users
```

Request:

```json
{
  "email": "newuser@example.com",
  "password": "secure-password",
  "name": "Jane Doe",
  "role": "user"
}
```

Validation:

- `email`: Required, valid email format
- `password`: Required, min 8 characters
- `name`: Required, 2-100 characters
- `role`: Optional, enum: ['user', 'admin']

#### Update User

```http
PUT /users/:id
```

Request:

```json
{
  "name": "Updated Name",
  "profile": {
    "bio": "Updated bio"
  }
}
```

#### Delete User

```http
DELETE /users/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

### [Resource Name]

#### List [Resources]

```http
GET /[resources]
```

Query parameters:

- Standard pagination parameters
- Resource-specific filters

#### Get [Resource]

```http
GET /[resources]/:id
```

#### Create [Resource]

```http
POST /[resources]
```

#### Update [Resource]

```http
PUT /[resources]/:id
```

#### Delete [Resource]

```http
DELETE /[resources]/:id
```

## Pagination

All list endpoints support pagination:

```http
GET /users?page=2&limit=50
```

Response includes pagination metadata:

```json
{
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 200,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Filtering

Most list endpoints support filtering:

```http
GET /users?role=admin&createdAfter=2024-01-01
```

## Sorting

Use `sortBy` and `order` parameters:

```http
GET /users?sortBy=createdAt&order=desc
```

## Rate Limiting

- 100 requests per minute for authenticated requests
- 20 requests per minute for unauthenticated requests
- Rate limit info in response headers:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Webhooks

### Configure Webhook

```http
POST /webhooks
```

Request:

```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["user.created", "user.updated"],
  "secret": "webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "user.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "id": "123",
    "email": "user@example.com"
  }
}
```

Verify webhook signatures using HMAC-SHA256 with your secret.

## API Versioning

The API uses URL versioning:

- Current version: `v1`
- Legacy version: `v0` (deprecated)

Version in URL: `https://api.domain.com/v1/users`

## SDK Usage

### JavaScript/TypeScript

```typescript
import { ApiClient } from "@company/api-client";

const client = new ApiClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.domain.com/v1",
});

// List users
const users = await client.users.list({ page: 1, limit: 20 });

// Get specific user
const user = await client.users.get("123");

// Create user
const newUser = await client.users.create({
  email: "user@example.com",
  name: "John Doe",
});
```

### Python

```python
from company_api import Client

client = Client(api_key='your-api-key')

# List users
users = client.users.list(page=1, limit=20)

# Get specific user
user = client.users.get('123')
```

## Testing

### Test Environment

Base URL: `https://api-test.[your-domain].com/v1`

Use test API keys prefixed with `test_`.

### Example Requests

cURL:

```bash
curl -X GET https://api.domain.com/v1/users \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json"
```

Postman Collection: [Download](https://api.domain.com/postman-collection.json)

## Changelog

### v1.2.0 (2024-01-15)

- Added webhook support
- Improved error messages
- Added rate limiting

### v1.1.0 (2023-12-01)

- Added filtering and sorting
- Performance improvements
- Bug fixes

### v1.0.0 (2023-10-01)

- Initial release

## Support

- Email: api-support@[your-domain].com
- Documentation: https://docs.[your-domain].com
- Status: https://status.[your-domain].com
