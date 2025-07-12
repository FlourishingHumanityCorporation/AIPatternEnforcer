# Error Handling Patterns

## Table of Contents

1. [Overview](#overview)
2. [Patterns](#patterns)
  3. [1. Error Types](#1-error-types)
  4. [2. Error Handling Middleware](#2-error-handling-middleware)
  5. [3. Async Error Handling](#3-async-error-handling)
6. [Optimal Practices](#optimal-practices)

## Overview

Consistent error handling across the application ensures better debugging, monitoring, and user experience.

## Patterns

### 1. Error Types

```typescript
// Base error class
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}
```

### 2. Error Handling Middleware

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Log unexpected errors
  logger.error("Unexpected error:", err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
```

### 3. Async Error Handling

```typescript
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await userService.findById(req.params.id);
    if (!user) {
      throw new NotFoundError("User");
    }
    res.json(user);
  }),
);
```

## Optimal Practices

1. **Always throw meaningful errors** - Include context about what failed
2. **Catch errors at boundaries** - API routes, service methods
3. **Log appropriately** - Errors with stack traces, warnings for expected issues
4. **Don't expose internals** - Sanitize error messages for users
5. **Monitor and alert** - Set up alerts for error rate spikes
