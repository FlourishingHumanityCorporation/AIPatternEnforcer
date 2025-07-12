[← Back to Documentation](../../README.md) | [↑ Up to Guides](../README.md)

---

# Security Optimal Practices for Local Development

## Table of Contents

1. [Purpose](#purpose)
2. [Quick Start Security Checklist](#quick-start-security-checklist)
3. [Authentication Implementation](#authentication-implementation)
  4. [Password Hashing](#password-hashing)
  5. [JWT Token Management](#jwt-token-management)
  6. [Session Management](#session-management)
7. [Authorization Strategies](#authorization-strategies)
  8. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
  9. [Resource-Based Access Control](#resource-based-access-control)
10. [Input Validation and Sanitization](#input-validation-and-sanitization)
  11. [Schema Validation with Zod](#schema-validation-with-zod)
  12. [SQL Injection Prevention](#sql-injection-prevention)
  13. [XSS Prevention](#xss-prevention)
14. [CSRF Protection](#csrf-protection)
15. [Environment Variables and Secrets](#environment-variables-and-secrets)
  16. [Secure Configuration](#secure-configuration)
  17. [Secret Generation Script](#secret-generation-script)
18. [Security Headers](#security-headers)
19. [Rate Limiting](#rate-limiting)
20. [File Upload Security](#file-upload-security)
21. [Security Audit Commands](#security-audit-commands)
  22. [Security ESLint Rules](#security-eslint-rules)
23. [AI Security Prompt Templates](#ai-security-prompt-templates)
  24. [Security Review Prompt](#security-review-prompt)
  25. [Secure Implementation Prompt](#secure-implementation-prompt)
26. [Security Checklist](#security-checklist)
27. [Common Security Anti-Patterns](#common-security-anti-patterns)
28. [Further Reading](#further-reading)

## Purpose

This guide provides practical security patterns that should be implemented from day one, even in local development.
Security vulnerabilities introduced during development often make it to production, so it's crucial to build secure
habits early.

## Quick Start Security Checklist

```bash
# 1. Install security dependencies
npm install --save bcrypt jsonwebtoken helmet express-rate-limit
npm install --save-dev @types/bcrypt @types/jsonwebtoken

# 2. Create .env.example (commit this)
cp .env .env.example
# Remove all secret values from .env.example

# 3. Add .env to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# 4. Set up pre-commit hook
npm install --save-dev husky
npx husky add .husky/pre-commit "npm run security:check"
```

## Authentication Implementation

### Password Hashing

```typescript
// NEVER store plain text passwords
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; // Good balance of security and speed

export async function hashPassword(password: string): Promise<string> {
  // Validate password strength first
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Usage in registration
async function register(email: string, password: string) {
  // Validate input
  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  // Check if user exists
  const existing = await db.findUserByEmail(email);
  if (existing) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  return db.createUser({
    email,
    password_hash: passwordHash,
  });
}
```

### JWT Token Management

```typescript
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate secure secret for development
const JWT_SECRET =
  process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  Using random JWT secret. Set JWT_SECRET in .env for persistence.",
  );
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
    issuer: "your-app",
    audience: "your-app-users",
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "your-app",
      audience: "your-app-users",
    }) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

// Refresh token pattern
export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");

  // Store in database with expiry
  await db.createRefreshToken({
    user_id: userId,
    token: await hashPassword(token), // Hash refresh tokens too!
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  return token;
}
```

### Session Management

```typescript
import session from "express-session";
import SQLiteStore from "connect-sqlite3";

const SQLiteStoreSession = SQLiteStore(session);

app.use(
  session({
    store: new SQLiteStoreSession({
      db: "sessions.db",
      dir: "./data",
    }),
    secret:
      process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // Prevent XSS
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict", // CSRF protection
    },
  }),
);

// Session-based auth middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
  }
  next();
}
```

## Authorization Strategies

### Role-Based Access Control (RBAC)

```typescript
// Define roles and permissions
const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
} as const;

const PERMISSIONS = {
  "post:create": [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN],
  "post:edit": [ROLES.MODERATOR, ROLES.ADMIN],
  "post:delete": [ROLES.ADMIN],
  "user:ban": [ROLES.MODERATOR, ROLES.ADMIN],
  "admin:access": [ROLES.ADMIN],
} as const;

// Middleware to check permissions
export function requirePermission(permission: keyof typeof PERMISSIONS) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        error: {
          code: "NO_ROLE",
          message: "User role not found",
        },
      });
    }

    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles.includes(userRole as any)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        },
      });
    }

    next();
  };
}

// Usage
app.delete(
  "/api/posts/:id",
  requireAuth,
  requirePermission("post:delete"),
  deletePost,
);
```

### Resource-Based Access Control

```typescript
// Check if user owns the resource
export async function requireOwnership(
  resourceType: "post" | "comment" | "profile",
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const resourceId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const resource = await db.findResource(resourceType, resourceId);

    if (!resource) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: `${resourceType} not found`,
        },
      });
    }

    if (resource.user_id !== userId && req.user?.role !== "admin") {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have access to this resource",
        },
      });
    }

    req.resource = resource;
    next();
  };
}
```

## Input Validation and Sanitization

### Schema Validation with Zod

```typescript
import { z } from "zod";

// Define schemas for all inputs
const userRegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  username: z
    .string()
    .min(3, "Username too short")
    .max(20, "Username too long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
});

const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title required")
    .max(200, "Title too long")
    .transform((str) => str.trim()), // Sanitize whitespace
  content: z
    .string()
    .max(10000, "Content too long")
    .transform((str) => sanitizeHtml(str)), // Remove dangerous HTML
  tags: z.array(z.string()).max(10).optional(),
});

// Validation middleware
export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated; // Replace with sanitized data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: error.errors,
          },
        });
      }
      next(error);
    }
  };
}

// Usage
app.post("/api/users", validate(userRegistrationSchema), registerUser);
```

### SQL Injection Prevention

```typescript
// ❌ NEVER do this - SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Use parameterized queries
// With query builders (Knex, Kysely)
const user = await db
  .selectFrom("users")
  .where("email", "=", email)
  .selectAll()
  .executeTakeFirst();

// With raw SQL (better-sqlite3)
const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
const user = stmt.get(email);

// With ORMs (Prisma)
const user = await prisma.user.findUnique({
  where: { email },
});

// Validate dynamic column names
const ALLOWED_SORT_COLUMNS = ["created_at", "title", "updated_at"];

function buildSortQuery(sortBy: string) {
  if (!ALLOWED_SORT_COLUMNS.includes(sortBy)) {
    throw new Error("Invalid sort column");
  }
  return `ORDER BY ${sortBy} DESC`;
}
```

### XSS Prevention

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user-generated HTML
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
}

// Escape for display
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// React automatically escapes by default
// But be careful with dangerouslySetInnerHTML
<div>{userContent}</div> // Safe
<div dangerouslySetInnerHTML={{__html: sanitizeHtml(userContent)}} /> // Sanitize first!
```

## CSRF Protection

```typescript
import csrf from "csurf";

// Setup CSRF middleware
const csrfProtection = csrf({ cookie: true });

// Apply to state-changing routes
app.use("/api", csrfProtection);

// Provide token to frontend
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Frontend implementation
async function fetchWithCsrf(url: string, options: RequestInit = {}) {
  // Get CSRF token
  const tokenResponse = await fetch("/api/csrf-token");
  const { csrfToken } = await tokenResponse.json();

  // Include in request
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "CSRF-Token": csrfToken,
    },
  });
}
```

## Environment Variables and Secrets

### Secure Configuration

```typescript
// config/index.ts
import { z } from 'zod';

// Define and validate environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});

// Validate environment
const env = envSchema.parse(process.env);

// Export typed config
export const config = {
  isDevelopment: env.NODE_ENV === 'development',
  port: parseInt(env.PORT),
  database: {
    url: env.DATABASE_URL
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    sessionSecret: env.SESSION_SECRET
  },
  cors: {
    origins: env.ALLOWED_ORIGINS.split(',')
  }
} as const;

// .env.example (commit this)
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./dev.db
JWT_SECRET=your-highly-secret-jwt-key-change-this
SESSION_SECRET=your-highly-secret-session-key-change-this
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Secret Generation Script

```bash
#!/bin/bash
# scripts/generate-secrets.sh

echo "Generating secure secrets for local development..."

JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

cat > .env.local << EOF
# Generated secrets - DO NOT COMMIT
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF

echo "✅ Secrets generated in .env.local"
echo "⚠️  Make sure .env.local is in .gitignore!"
```

## Security Headers

```typescript
import helmet from "helmet";

// Basic security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust for your needs
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // May need to disable for local dev
  }),
);

// Additional security headers
app.use((req, res, next) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  next();
});
```

## Rate Limiting

```typescript
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: {
      code: "RATE_LIMIT",
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Progressive slowdown
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50, // Start slowing after 50 requests
  delayMs: 500, // Add 500ms delay per request after threshold
});

// Apply limiters
app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);
app.use("/api/", speedLimiter);

// Per-user rate limiting
const userLimiter = rateLimit({
  keyGenerator: (req) => req.user?.id || req.ip,
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per user
});
```

## File Upload Security

```typescript
import multer from "multer";
import path from "path";
import crypto from "crypto";

// Configure safe file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    // Generate safe filename
    const uniqueName = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Single file per request
  },
  fileFilter: (req, file, cb) => {
    // Whitelist allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Scan uploaded files (example with clamav)
import NodeClam from "clamscan";

const clamscan = await new NodeClam().init({
  clamdscan: {
    socket: "/var/run/clamav/clamd.ctl",
  },
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    // Scan for viruses
    const { isInfected } = await clamscan.scanFile(req.file.path);

    if (isInfected) {
      // Delete infected file
      await fs.unlink(req.file.path);
      return res.status(400).json({
        error: {
          code: "INFECTED_FILE",
          message: "File appears to be infected",
        },
      });
    }

    // Process safe file
    res.json({
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
});
```

## Security Audit Commands

```json
// package.json
{
  "scripts": {
    "security:check": "npm audit && npm run security:deps && npm run security:code",
    "security:deps": "npm audit --audit-level=moderate",
    "security:code": "eslint . --ext .ts,.tsx --config .eslintrc.security.js",
    "security:fix": "npm audit fix"
  }
}
```

### Security ESLint Rules

```javascript
// .eslintrc.security.js
module.exports = {
  rules: {
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",
    "no-with": "error",
    "prefer-template": "error",
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
  },
};
```

## AI Security Prompt Templates

### Security Review Prompt

````markdown
Review this code for security vulnerabilities:

```typescript
[paste code]
```text
````

Check for:

- SQL injection risks
- XSS vulnerabilities
- Authentication bypasses
- Authorization flaws
- Input validation issues
- Sensitive data exposure
- CSRF vulnerabilities
- Rate limiting needs

Provide specific fixes for any issues found.

````

### Secure Implementation Prompt

```markdown
Implement [feature] with these security requirements:
- Input validation using Zod
- SQL injection prevention
- XSS protection
- Proper authentication checks
- Authorization for resource access
- Rate limiting
- Audit logging
- Error messages that don't leak information
````

## Security Checklist

Before deploying any code:

- [ ] All user inputs are validated
- [ ] Database queries use parameterization
- [ ] Passwords are hashed with bcrypt
- [ ] Authentication is required for protected routes
- [ ] Authorization checks resource ownership
- [ ] CSRF protection on state-changing endpoints
- [ ] Rate limiting is configured
- [ ] Security headers are set
- [ ] Sensitive data is not logged
- [ ] Error messages don't reveal system details
- [ ] File uploads are restricted and scanned
- [ ] Dependencies are up to date
- [ ] Environment variables are properly managed

## Common Security Anti-Patterns

1. **Trusting Client Data**

   ```typescript
   ❌ const isAdmin = req.body.isAdmin;
   ✅ const isAdmin = req.user.role === 'admin';
   ```

2. **Weak Password Requirements**

   ```typescript
   ❌ if (password.length > 0)
   ✅ if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password))
   ```

3. **Exposing Stack Traces**

   ```typescript
   ❌ res.status(500).json({ error: err.stack });
   ✅ res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
   ```

4. **Direct Object References**
   ```typescript
   ❌ const userId = req.params.userId; // User can access any user
   ✅ const userId = req.user.id; // User can only access themselves
   ```

## Further Reading

- OWASP Top 10
- Node.js Security Checklist
- Express Security Optimal Practices
- Project examples: `examples/security/`
