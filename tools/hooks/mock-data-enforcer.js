#!/usr/bin/env node

/**
 * Claude Code Hook: Mock Data Enforcer
 *
 * Forces the use of mock data for local development, preventing real authentication
 * implementations and production data connections. This aligns with GOAL.md's
 * focus on local-only, single-person projects.
 *
 * Enforces:
 * - Use of mockUser instead of real auth
 * - Local data sources only
 * - Seed data for testing
 * - No real user management
 * - Simplified auth patterns
 *
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const {
  HookRunner,
  FileAnalyzer,
  PatternLibrary,
  ErrorFormatter,
} = require("./lib");

// Authentication patterns to block
const REAL_AUTH_PATTERNS = [
  // Auth libraries
  /import.*(?:firebase\/auth|@supabase\/auth|@auth0|@clerk)/gi,
  /from\s+["'](?:next-auth|@auth\/|passport|jsonwebtoken)["']/gi,

  // Auth methods
  /createUserWithEmailAndPassword|signInWithEmailAndPassword/gi,
  /signInWithPopup|signInWithRedirect|signOut/gi,
  /verifyIdToken|createCustomToken|setCustomUserClaims/gi,
  /generateAuthToken|validateAuthToken|refreshToken/gi,

  // User management
  /class\s+(?:User|Auth)(?:Service|Manager|Controller)/i,
  /(?:create|update|delete)User(?:Account|Profile|Data)/gi,
  /(?:register|signup|signin)(?:User|WithEmail|WithPhone)/gi,

  // Session management
  /(?:create|destroy|validate)Session/gi,
  /(?:set|get|clear)(?:Session|Cookie)(?:Data)?/gi,
  /express-session|cookie-session|iron-session/gi,

  // JWT/Token patterns
  /jwt\.(?:sign|verify|decode)/gi,
  /Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,

  // Database user tables
  /CREATE\s+TABLE\s+(?:users|accounts|sessions)/gi,
  /(?:INSERT|UPDATE|DELETE).*(?:users|accounts).*WHERE/gi,

  // Password handling
  /(?:hash|verify)Password|bcrypt|argon2|scrypt/gi,
  /password(?:Reset|Recovery|Change)Token/gi,
];

// Production data patterns to block
const PRODUCTION_DATA_PATTERNS = [
  // Cloud databases
  /mongodb\+srv:\/\/|postgresql:\/\/.*\.amazonaws\.com/gi,
  /(?:cosmos|dynamo)db\..*\.azure|aws/gi,
  /firestore|realtime.*database|supabase\.co/gi,

  // Production APIs
  /https:\/\/api\..*\.(?:com|io|net)(?!.*localhost)/gi,
  /production.*endpoint|prod.*api.*url/gi,

  // Real email services
  /(?:sendgrid|mailgun|postmark|ses).*api/gi,
  /smtp\.(?:gmail|outlook|yahoo)/gi,

  // Payment systems
  /stripe\.com\/v1|paypal\.com.*\/payments/gi,
  /(?:payment|billing|subscription).*processor/gi,
];

// Good mock patterns to encourage
const GOOD_MOCK_PATTERNS = [
  /mockUser|testUser|demoUser|localUser/i,
  /getMockData|generateTestData|seedData/i,
  /localStorage.*mock|sessionStorage.*demo/i,
  /sqlite|:memory:|localhost.*postgres/i,
  /\.env\.local|\.env\.development/i,
];

// Suggested mock implementations
const MOCK_SUGGESTIONS = {
  auth: `// Use simple mock auth for local development
export const mockUser = {
  id: 'mock-user-123',
  email: 'user@example.com',
  name: 'Test User',
  avatar: '/default-avatar.png'
};

export const getMockUser = () => mockUser;
export const isAuthenticated = () => true; // Always authenticated locally`,

  database: `// Use local database with seed data
// SQLite for simple storage
// PostgreSQL on localhost for vector operations
// Prisma with db push for quick iteration`,

  api: `// Mock API responses for development
export const mockApiResponse = (data, delay = 100) => {
  return new Promise(resolve => {
    setTimeout(() => resolve({ data, status: 'success' }), delay);
  });
};`,
};

function detectRealAuthPatterns(content, filePath) {
  const detectedPatterns = [];

  for (const pattern of REAL_AUTH_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      detectedPatterns.push({
        type: "auth",
        pattern: pattern.source,
        match: matches[0],
        severity: "high",
      });
    }
  }

  for (const pattern of PRODUCTION_DATA_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      detectedPatterns.push({
        type: "production",
        pattern: pattern.source,
        match: matches[0],
        severity: "high",
      });
    }
  }

  return detectedPatterns;
}

function checkForGoodPatterns(content) {
  return GOOD_MOCK_PATTERNS.filter((pattern) => pattern.test(content));
}

function shouldSkipFile(filePath) {
  // Skip checking certain files
  const skipPatterns = [
    /node_modules/,
    /\.test\./,
    /\.spec\./,
    /\.md$/,
    /mock/i,
    /example/i,
    /demo/i,
  ];

  return skipPatterns.some((pattern) => pattern.test(filePath));
}

// Hook logic
async function mockDataEnforcer(input) {
  const { filePath, content } = input;

  // Skip if no content or should skip file
  if (!content || shouldSkipFile(filePath)) {
    return { allow: true };
  }

  // Detect real auth/production patterns
  const detectedPatterns = detectRealAuthPatterns(content, filePath);
  const goodPatterns = checkForGoodPatterns(content);

  // If we detect real auth but no mock patterns, block
  if (detectedPatterns.length > 0 && goodPatterns.length === 0) {
    let message = `🚫 Real Authentication/Production Data Blocked\n\n`;
    message += `This is a LOCAL-ONLY project. Use mock data!\n\n`;

    // Group by type
    const authPatterns = detectedPatterns.filter((p) => p.type === "auth");
    const prodPatterns = detectedPatterns.filter(
      (p) => p.type === "production",
    );

    if (authPatterns.length > 0) {
      message += `❌ Authentication patterns detected:\n`;
      authPatterns.slice(0, 3).forEach((p) => {
        message += `   • ${p.match}\n`;
      });
      if (authPatterns.length > 3) {
        message += `   ... and ${authPatterns.length - 3} more\n`;
      }
      message += `\n✅ Instead use:\n${MOCK_SUGGESTIONS.auth}\n\n`;
    }

    if (prodPatterns.length > 0) {
      message += `❌ Production data patterns detected:\n`;
      prodPatterns.slice(0, 3).forEach((p) => {
        message += `   • ${p.match}\n`;
      });
      message += `\n✅ Use local data sources:\n`;
      message += `   • SQLite or localhost PostgreSQL\n`;
      message += `   • Mock API responses\n`;
      message += `   • Seed data scripts\n\n`;
    }

    message += `💡 Why mock data?\n`;
    message += `   • Faster development iteration\n`;
    message += `   • No authentication complexity\n`;
    message += `   • No cloud service costs\n`;
    message += `   • Works offline\n`;
    message += `   • Perfect for AI experimentation\n\n`;

    message += `📖 See lib/auth.ts for mockUser pattern\n`;
    message += `📖 See prisma/seed.ts for test data`;

    return { block: true, message };
  }

  // If good patterns exist alongside some auth patterns, allow with warning
  if (detectedPatterns.length > 0 && goodPatterns.length > 0) {
    process.stderr.write(
      `⚠️ Found auth patterns but also mock patterns - allowing\n` +
        `💡 Ensure you're using mock implementations only\n`,
    );
  }

  return { allow: true };
}

// Run the hook
const runner = new HookRunner("mock-data-enforcer", { timeout: 1500 });
runner.run(mockDataEnforcer);

module.exports = {
  REAL_AUTH_PATTERNS,
  PRODUCTION_DATA_PATTERNS,
  GOOD_MOCK_PATTERNS,
  MOCK_SUGGESTIONS,
  detectRealAuthPatterns,
  mockDataEnforcer,
};
