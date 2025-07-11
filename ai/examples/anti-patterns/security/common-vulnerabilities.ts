/**
 * Security Anti-Patterns - Common Vulnerabilities
 * 
 * This file demonstrates common security vulnerabilities and how to avoid them.
 * These are examples of what NOT to do, with explanations and better alternatives.
 */

// ❌ ANTI-PATTERN 1: Storing sensitive data in localStorage
export const BAD_TOKEN_STORAGE = {
  // DON'T DO THIS - Accessible via XSS
  saveTokenBad: (token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userPassword', 'password123'); // NEVER store passwords!
    localStorage.setItem('apiKey', 'sk-1234567890abcdef'); // Exposed to any script
  },

  // DON'T DO THIS - Sensitive data in sessionStorage
  saveUserDataBad: (userData: any) => {
    sessionStorage.setItem('creditCard', '4111-1111-1111-1111');
    sessionStorage.setItem('ssn', '123-45-6789');
    sessionStorage.setItem('privateKey', 'BEGIN_PRIVATE_KEY...');
  }
};

// ✅ BETTER APPROACH: Secure token storage
export const SECURE_TOKEN_STORAGE = {
  // Use httpOnly cookies for sensitive tokens (set by server)
  // Store only necessary data client-side
  saveTokenGood: (token: string) => {
    // Short-lived access token in memory/sessionStorage
    sessionStorage.setItem('accessToken', token);
    
    // Refresh token should be httpOnly cookie set by server
    // Never store sensitive credentials client-side
  },

  saveUserDataGood: (userData: { id: string; name: string; email: string }) => {
    // Only store non-sensitive user data
    sessionStorage.setItem('userData', JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email
      // NO credit cards, SSNs, private keys, etc.
    }));
  }
};

// ❌ ANTI-PATTERN 2: SQL Injection vulnerabilities
export const SQL_INJECTION_VULNERABILITIES = {
  // DON'T DO THIS - Direct string concatenation
  getUserBad: async (userId: string) => {
    const query = `SELECT * FROM users WHERE id = '${userId}'`;
    // Vulnerable to: '; DROP TABLE users; --
    return await database.query(query);
  },

  // DON'T DO THIS - Template literals with user input
  searchUsersBad: async (searchTerm: string) => {
    const query = `
      SELECT * FROM users 
      WHERE name LIKE '%${searchTerm}%' 
      OR email LIKE '%${searchTerm}%'
    `;
    return await database.query(query);
  },

  // DON'T DO THIS - Dynamic query building
  buildQueryBad: (filters: Record<string, any>) => {
    let query = "SELECT * FROM products WHERE 1=1";
    
    Object.keys(filters).forEach(key => {
      query += ` AND ${key} = '${filters[key]}'`; // Injection risk
    });
    
    return query;
  }
};

// ✅ BETTER APPROACH: Parameterized queries
export const SECURE_DATABASE_QUERIES = {
  getUserGood: async (userId: string) => {
    // Use parameterized queries
    const query = 'SELECT * FROM users WHERE id = ?';
    return await database.query(query, [userId]);
  },

  searchUsersGood: async (searchTerm: string) => {
    const query = `
      SELECT * FROM users 
      WHERE name LIKE ? OR email LIKE ?
    `;
    const searchPattern = `%${searchTerm}%`;
    return await database.query(query, [searchPattern, searchPattern]);
  },

  buildQueryGood: (filters: Record<string, any>) => {
    const allowedFields = ['name', 'category', 'price']; // Whitelist
    const conditions: string[] = [];
    const values: any[] = [];
    
    Object.keys(filters).forEach(key => {
      if (allowedFields.includes(key)) {
        conditions.push(`${key} = ?`);
        values.push(filters[key]);
      }
    });
    
    const query = `SELECT * FROM products WHERE ${conditions.join(' AND ')}`;
    return { query, values };
  }
};

// ❌ ANTI-PATTERN 3: XSS vulnerabilities
export const XSS_VULNERABILITIES = {
  // DON'T DO THIS - Dangerous innerHTML usage
  displayUserContentBad: (userContent: string) => {
    document.getElementById('content')!.innerHTML = userContent;
    // Vulnerable to: <script>alert('XSS')</script>
  },

  // DON'T DO THIS - Unescaped user data in URLs
  redirectUserBad: (returnUrl: string) => {
    window.location.href = returnUrl;
    // Vulnerable to: javascript:alert('XSS')
  },

  // DON'T DO THIS - eval() with user input
  executeUserCodeBad: (userCode: string) => {
    eval(userCode); // NEVER use eval with user input
  },

  // DON'T DO THIS - Unsafe React dangerouslySetInnerHTML
  UnsafeReactComponentBad: ({ userHtml }: { userHtml: string }) => {
    return (
      <div dangerouslySetInnerHTML={{ __html: userHtml }} />
      // Vulnerable to XSS attacks
    );
  }
};

// ✅ BETTER APPROACH: XSS prevention
export const XSS_PREVENTION = {
  displayUserContentGood: (userContent: string) => {
    // Use textContent instead of innerHTML
    document.getElementById('content')!.textContent = userContent;
    
    // Or use proper escaping library
    const escapedContent = escapeHtml(userContent);
    document.getElementById('content')!.innerHTML = escapedContent;
  },

  redirectUserGood: (returnUrl: string) => {
    // Validate and sanitize URLs
    const allowedDomains = ['example.com', 'app.example.com'];
    const url = new URL(returnUrl, window.location.origin);
    
    if (allowedDomains.includes(url.hostname)) {
      window.location.href = url.href;
    }
  },

  // Use safer alternatives to eval
  parseUserDataGood: (userJson: string) => {
    try {
      return JSON.parse(userJson); // Safe for JSON
    } catch {
      return null;
    }
  },

  // Safe React component
  SafeReactComponentGood: ({ userText }: { userText: string }) => {
    return (
      <div>{userText}</div> // React automatically escapes
    );
  }
};

// ❌ ANTI-PATTERN 4: Insecure authentication
export const INSECURE_AUTHENTICATION = {
  // DON'T DO THIS - Weak password validation
  validatePasswordBad: (password: string) => {
    return password.length >= 6; // Too weak
  },

  // DON'T DO THIS - Storing passwords in plain text
  createUserBad: async (userData: any) => {
    await database.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [userData.email, userData.password] // Plain text password!
    );
  },

  // DON'T DO THIS - Predictable session tokens
  generateSessionTokenBad: () => {
    return Date.now().toString(); // Predictable
  },

  // DON'T DO THIS - No rate limiting
  loginAttemptBad: async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    return user && user.password === password; // No rate limiting
  },

  // DON'T DO THIS - Exposing sensitive info in JWTs
  createJWTBad: (user: any) => {
    return jwt.sign({
      id: user.id,
      email: user.email,
      password: user.password, // NEVER include passwords
      creditCard: user.creditCard, // NEVER include sensitive data
    }, 'secret');
  }
};

// ✅ BETTER APPROACH: Secure authentication
export const SECURE_AUTHENTICATION = {
  validatePasswordGood: (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  },

  createUserGood: async (userData: any) => {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    await database.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [userData.email, hashedPassword]
    );
  },

  generateSessionTokenGood: () => {
    return crypto.randomBytes(32).toString('hex'); // Cryptographically secure
  },

  // Implement rate limiting
  loginAttemptGood: async (email: string, password: string, ip: string) => {
    // Check rate limiting first
    const attempts = await getRateLimitAttempts(ip, email);
    if (attempts > 5) {
      throw new Error('Too many login attempts. Please try again later.');
    }
    
    const user = await findUserByEmail(email);
    if (!user) return false;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      await incrementRateLimitAttempts(ip, email);
    } else {
      await clearRateLimitAttempts(ip, email);
    }
    
    return isValid;
  },

  createJWTGood: (user: any) => {
    // Only include non-sensitive, necessary data
    return jwt.sign({
      id: user.id,
      role: user.role,
      // No passwords, credit cards, or other sensitive data
    }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
      issuer: 'your-app',
      audience: 'your-app-users'
    });
  }
};

// ❌ ANTI-PATTERN 5: Insecure API design
export const INSECURE_API_DESIGN = {
  // DON'T DO THIS - No input validation
  createPostBad: async (req: any, res: any) => {
    const { title, content, authorId } = req.body;
    
    // No validation - accepts any data
    const post = await database.query(
      'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
      [title, content, authorId]
    );
    
    res.json(post);
  },

  // DON'T DO THIS - Exposing internal data
  getUserBad: async (req: any, res: any) => {
    const user = await database.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    // Exposes password hash, internal IDs, etc.
    res.json(user);
  },

  // DON'T DO THIS - No authorization checks
  deletePostBad: async (req: any, res: any) => {
    await database.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  },

  // DON'T DO THIS - Verbose error messages
  errorHandlerBad: (error: any, req: any, res: any, next: any) => {
    res.status(500).json({
      error: error.message,
      stack: error.stack, // Exposes internal structure
      query: req.query,   // Might expose sensitive data
      database: error.originalError // Database internals
    });
  }
};

// ✅ BETTER APPROACH: Secure API design
export const SECURE_API_DESIGN = {
  createPostGood: async (req: any, res: any) => {
    // Input validation
    const schema = {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      content: { type: 'string', minLength: 1, maxLength: 10000 },
    };
    
    const validationResult = validateInput(req.body, schema);
    if (!validationResult.isValid) {
      return res.status(400).json({ errors: validationResult.errors });
    }
    
    // Authorization check
    const authorId = req.user.id; // From authenticated token
    
    const post = await database.query(
      'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
      [req.body.title, req.body.content, authorId]
    );
    
    res.status(201).json({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.author_id,
      createdAt: post.created_at
    });
  },

  getUserGood: async (req: any, res: any) => {
    const user = await database.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?', 
      [req.params.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Only return safe, public data
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at
    });
  },

  deletePostGood: async (req: any, res: any) => {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Check if post exists and user owns it
    const post = await database.query(
      'SELECT author_id FROM posts WHERE id = ?', 
      [postId]
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.author_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await database.query('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ success: true });
  },

  errorHandlerGood: (error: any, req: any, res: any, next: any) => {
    // Log full error internally
    console.error('API Error:', error);
    
    // Send minimal error info to client
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
      error: 'Internal server error',
      ...(isDevelopment && { 
        message: error.message,
        stack: error.stack 
      })
    });
  }
};

// ❌ ANTI-PATTERN 6: Insecure CORS configuration
export const INSECURE_CORS = {
  // DON'T DO THIS - Allow all origins
  corsConfigBad: {
    origin: '*', // Allows any domain
    credentials: true, // Dangerous with wildcard origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['*'] // Too permissive
  }
};

// ✅ BETTER APPROACH: Secure CORS configuration
export const SECURE_CORS = {
  corsConfigGood: {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://localhost:3001']
      : ['https://yourdomain.com', 'https://app.yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight for 24 hours
  }
};

// ❌ ANTI-PATTERN 7: Weak cryptography
export const WEAK_CRYPTOGRAPHY = {
  // DON'T DO THIS - Weak hashing
  hashPasswordBad: (password: string) => {
    return crypto.createHash('md5').update(password).digest('hex'); // MD5 is broken
  },

  // DON'T DO THIS - Predictable random values
  generateResetTokenBad: () => {
    return Math.random().toString(36); // Not cryptographically secure
  },

  // DON'T DO THIS - Weak encryption
  encryptDataBad: (data: string, key: string) => {
    // Using outdated/weak algorithms
    const cipher = crypto.createCipher('des', key); // DES is weak
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  }
};

// ✅ BETTER APPROACH: Strong cryptography
export const STRONG_CRYPTOGRAPHY = {
  hashPasswordGood: async (password: string) => {
    const saltRounds = 12; // Adjust based on server capacity
    return await bcrypt.hash(password, saltRounds);
  },

  generateResetTokenGood: () => {
    return crypto.randomBytes(32).toString('hex'); // Cryptographically secure
  },

  encryptDataGood: (data: string, key: Buffer) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
};

// Utility functions referenced above
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateInput(data: any, schema: any): { isValid: boolean; errors: string[] } {
  // Implementation would validate data against schema
  return { isValid: true, errors: [] };
}

async function findUserByEmail(email: string): Promise<any> {
  // Database lookup implementation
  return null;
}

async function getRateLimitAttempts(ip: string, email: string): Promise<number> {
  // Rate limiting implementation
  return 0;
}

async function incrementRateLimitAttempts(ip: string, email: string): Promise<void> {
  // Increment rate limit counter
}

async function clearRateLimitAttempts(ip: string, email: string): Promise<void> {
  // Clear rate limit counter
}

// Mock database object
const database = {
  query: async (sql: string, params?: any[]) => ({ id: '1' })
};

// Mock bcrypt
const bcrypt = {
  hash: async (password: string, rounds: number) => 'hashed_password',
  compare: async (password: string, hash: string) => true
};

// Mock jwt
const jwt = {
  sign: (payload: any, secret: string, options?: any) => 'jwt_token'
};

// Mock crypto (in real Node.js environment)
const crypto = {
  randomBytes: (size: number) => ({ toString: (encoding: string) => 'random_string' }),
  createHash: (algorithm: string) => ({
    update: (data: string) => ({ digest: (encoding: string) => 'hash' })
  }),
  createCipher: (algorithm: string, key: any) => ({
    update: (data: string, inputEncoding: string, outputEncoding: string) => 'encrypted',
    final: (encoding: string) => 'final',
    getAuthTag: () => ({ toString: (encoding: string) => 'auth_tag' })
  })
};