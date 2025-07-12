# Common Web Application Vulnerabilities

**Purpose**: Comprehensive guide to identifying and preventing common security vulnerabilities in web applications.

## Table of Contents

1. [Cross-Site Scripting (XSS)](#cross-site-scripting-xss)
2. [Cross-Site Request Forgery (CSRF)](#cross-site-request-forgery-csrf)
3. [SQL Injection](#sql-injection)
4. [Insecure Authentication](#insecure-authentication)
5. [Authorization Vulnerabilities](#authorization-vulnerabilities)
6. [Input Validation Issues](#input-validation-issues)
7. [Prevention Strategies](#prevention-strategies)

## Cross-Site Scripting (XSS)

### Description
XSS attacks inject malicious scripts into web pages viewed by other users.

### Types
- **Stored XSS**: Malicious script stored in database
- **Reflected XSS**: Script reflected in URL parameters
- **DOM XSS**: Client-side script manipulation

### Prevention
- Always sanitize user input
- Use Content Security Policy (CSP)
- Escape output in templates
- Validate on both client and server

### React Prevention
```typescript
// Good: React automatically escapes content
const UserProfile = ({ userName }: { userName: string }) => (
  <div>Welcome, {userName}</div>
);

// Dangerous: Using dangerouslySetInnerHTML
const DangerousComponent = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);

// Safe alternative: Use markdown libraries with sanitization
import DOMPurify from 'dompurify';
const SafeComponent = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
);
```

## Cross-Site Request Forgery (CSRF)

### Description
CSRF attacks trick users into performing unwanted actions on applications where they're authenticated.

### Prevention
- Implement CSRF tokens
- Check Referer headers
- Use SameSite cookies
- Require re-authentication for sensitive actions

### Implementation
```typescript
// CSRF token validation middleware
const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session.csrfToken;
  
  if (!token || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
};

// SameSite cookie configuration
app.use(session({
  cookie: {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}));
```

## SQL Injection

### Description
SQL injection attacks insert malicious SQL code into application queries.

### Prevention
- Use parameterized queries/prepared statements
- Validate and sanitize input
- Apply principle of least privilege
- Use ORM frameworks properly

### Safe Query Patterns
```typescript
// Vulnerable: String concatenation
const vulnerableQuery = `SELECT * FROM users WHERE id = ${userId}`;

// Safe: Parameterized query
const safeQuery = 'SELECT * FROM users WHERE id = ?';
db.query(safeQuery, [userId]);

// Safe: ORM usage
const user = await User.findByPk(userId);

// Safe: Query builder
const users = await db('users').where('id', userId).select();
```

## Insecure Authentication

### Common Issues
- Weak password requirements
- Insecure password storage
- Missing account lockout
- Insecure session management

### Secure Implementation
```typescript
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';

// Secure password hashing
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Secure session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));
```

## Authorization Vulnerabilities

### Common Issues
- Missing access controls
- Insecure direct object references
- Privilege escalation
- Broken function-level authorization

### Secure Authorization
```typescript
// Role-based access control middleware
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Resource ownership verification
const requireOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const resourceId = req.params.id;
  const userId = req.user?.id;
  
  const resource = await Resource.findByPk(resourceId);
  
  if (!resource || resource.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

// Usage in routes
app.delete('/api/posts/:id', 
  authenticateToken,
  requireOwnership,
  deletePost
);
```

## Input Validation Issues

### Common Problems
- Missing input validation
- Client-side only validation
- Inadequate sanitization
- Type confusion attacks

### Comprehensive Validation
```typescript
import Joi from 'joi';
import validator from 'validator';

// Schema-based validation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  age: Joi.number().integer().min(13).max(120).required()
});

// Input sanitization
const sanitizeInput = (input: string): string => {
  return validator.escape(validator.trim(input));
};

// Validation middleware
const validateInput = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    
    req.body = value;
    next();
  };
};
```

## Prevention Strategies

### Development Process
1. **Security by Design**: Consider security from project inception
2. **Code Reviews**: Include security-focused reviews
3. **Static Analysis**: Use automated security scanning tools
4. **Dependency Scanning**: Monitor third-party dependencies
5. **Regular Testing**: Implement security testing in CI/CD

### Security Headers
```typescript
import helmet from 'helmet';

// Essential security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Custom security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

### Environment Security
```typescript
// Environment variable validation
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'SESSION_SECRET'];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
});

// Secure defaults
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  dbUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
```

## Security Checklist

### Authentication & Authorization
- [ ] Strong password requirements implemented
- [ ] Secure password storage (bcrypt/scrypt)
- [ ] Account lockout after failed attempts
- [ ] Multi-factor authentication for sensitive accounts
- [ ] Secure session management
- [ ] Proper access control implementation
- [ ] Regular security audits

### Input Validation
- [ ] All user input validated and sanitized
- [ ] Server-side validation for all forms
- [ ] File upload restrictions implemented
- [ ] SQL injection prevention measures
- [ ] XSS prevention implemented

### Infrastructure
- [ ] HTTPS enforced in production
- [ ] Security headers implemented
- [ ] CSRF protection enabled
- [ ] Regular dependency updates
- [ ] Security monitoring in place
- [ ] Error handling doesn't leak information
- [ ] Logging implemented for security events

## Related Documentation

- [Security Optimal Practices](security-optimal-practices.md)
- [Authentication Patterns](../../architecture/patterns/authentication.md)
- [API Security Guidelines](../../architecture/patterns/api-design-standards.md)

---

**Security Note**: This documentation should be regularly updated as new vulnerabilities are discovered. Always stay informed about the latest security threats and prevention techniques.