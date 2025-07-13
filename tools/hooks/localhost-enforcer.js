#!/usr/bin/env node

/**
 * Claude Code Hook: Localhost Enforcer
 * 
 * Ensures all configurations point to local resources only, preventing
 * accidental production deployments or cloud service integrations.
 * This supports GOAL.md's focus on local-only development.
 * 
 * Validates:
 * - Database URLs (must be localhost/sqlite)
 * - API endpoints (no production URLs)
 * - Environment variables (development only)
 * - Service configurations (local services)
 * - File paths (no cloud storage)
 * 
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const path = require('path');

// Configuration patterns that must be local
const LOCAL_ONLY_PATTERNS = {
  // Database connections
  database: {
    remote: [
      // Cloud databases
      /mongodb\+srv:\/\//gi,
      /\.mongodb\.net/gi,
      /\.amazonaws\.com.*:5432/gi,
      /\.database\.azure/gi,
      /\.supabase\.co/gi,
      /\.planetscale\.com/gi,
      /\.neon\.tech(?!.*localhost)/gi,
      
      // Remote postgres/mysql
      /postgres:\/\/(?!localhost|127\.0\.0\.1|postgres:|:memory:)/gi,
      /mysql:\/\/(?!localhost|127\.0\.0\.1|root@localhost)/gi,
      
      // Connection strings with remote hosts
      /host=["'](?!localhost|127\.0\.0\.1)[\w\.-]+["']/gi,
      /DATABASE_URL.*=.*(?!localhost|127\.0\.0\.1|sqlite)https?:/gi
    ],
    local: [
      'postgresql://localhost',
      'postgres://localhost:5432',
      'mysql://localhost:3306',
      'sqlite:./dev.db',
      ':memory:',
      'file:./local.db'
    ],
    message: 'Use local database only'
  },

  // API endpoints
  endpoints: {
    remote: [
      // Production APIs
      /(?:API|ENDPOINT).*_URL.*=.*https:\/\/(?!localhost|127\.0\.0\.1)/gi,
      /baseURL.*:.*["']https:\/\/(?!localhost|127\.0\.0\.1)/gi,
      /fetch\(["']https:\/\/(?!localhost|127\.0\.0\.1).*api/gi,
      
      // Specific services
      /https:\/\/api\..*\.(?:com|io|net|org)(?!.*mock|.*test)/gi,
      /wss:\/\/(?!localhost|127\.0\.0\.1)/gi,
      
      // Production domains
      /\.vercel\.app|\.netlify\.app|\.herokuapp\.com/gi,
      /\.railway\.app|\.render\.com|\.fly\.io/gi
    ],
    local: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8080',
      '/api/', // Relative URLs
      'ws://localhost'
    ],
    message: 'Use localhost URLs only'
  },

  // Cloud services
  services: {
    remote: [
      // AWS
      /aws-sdk|@aws-sdk|amazonaws\.com/gi,
      /s3\..*\.amazonaws|cloudfront\.net/gi,
      
      // Google Cloud
      /googleapis\.com|cloud\.google\.com/gi,
      /storage\.googleapis|firebaseapp\.com/gi,
      
      // Azure
      /\.blob\.core\.windows\.net|\.azure\.com/gi,
      
      // CDNs
      /cloudinary\.com|imgix\.net|fastly\.net/gi,
      /unpkg\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare/gi,
      
      // Monitoring
      /sentry\.io|datadog\.com|newrelic\.com/gi,
      /logrocket\.com|bugsnag\.com/gi
    ],
    local: [
      'Local file system',
      'public/ directory',
      'localhost services',
      'SQLite for storage'
    ],
    message: 'Use local services only'
  },

  // Environment configurations
  environment: {
    remote: [
      /NODE_ENV.*=.*["']production["']/gi,
      /NEXT_PUBLIC_ENV.*=.*["']production["']/gi,
      /\.env\.production/gi,
      /process\.env\.(?:PROD|PRODUCTION|STAGING)/gi,
      
      // Deployment configs
      /VERCEL_|NETLIFY_|HEROKU_|RENDER_/gi,
      /CI=true|CI_COMMIT|GITHUB_ACTIONS/gi
    ],
    local: [
      'NODE_ENV=development',
      '.env.local',
      '.env.development',
      'Local environment only'
    ],
    message: 'Use development environment only'
  }
};

// Good local patterns to encourage
const GOOD_LOCAL_PATTERNS = [
  /localhost|127\.0\.0\.1/,
  /\.env\.local|\.env\.development/,
  /sqlite|:memory:/i,
  /public\/|static\/|assets\//,
  /NODE_ENV.*development/i,
  /mockServiceWorker/i
];

function detectRemoteConfigurations(content, filePath) {
  const detectedIssues = [];
  
  // Check each category
  for (const [category, config] of Object.entries(LOCAL_ONLY_PATTERNS)) {
    for (const pattern of config.remote) {
      const matches = content.match(pattern);
      if (matches) {
        detectedIssues.push({
          category,
          pattern: pattern.source,
          match: matches[0],
          message: config.message,
          suggestions: config.local,
          severity: 'high'
        });
      }
    }
  }
  
  return detectedIssues;
}

function isConfigurationFile(filePath) {
  const configPatterns = [
    /\.env/,
    /config\./,
    /settings\./,
    /\.json$/,
    /\.yaml$/,
    /\.yml$/,
    /next\.config/,
    /vite\.config/,
    /webpack\.config/,
    /database\./,
    /prisma.*schema/
  ];
  
  return configPatterns.some(pattern => pattern.test(filePath));
}

function generateLocalSuggestions(category) {
  const suggestions = {
    database: `# Local database options:
# SQLite (simplest)
DATABASE_URL="file:./dev.db"

# Local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"

# In-memory (testing)
DATABASE_URL=":memory:"`,

    endpoints: `# Local API endpoints:
API_URL="http://localhost:3000/api"
NEXT_PUBLIC_API_URL="/api"  # Relative URL

# WebSocket
WS_URL="ws://localhost:3000"`,

    services: `# Local file storage:
UPLOAD_DIR="./uploads"
PUBLIC_DIR="./public"

# Local cache:
CACHE_DIR="./cache"

# Mock services:
USE_MOCK_SERVICES=true`,

    environment: `# Local environment:
NODE_ENV="development"
NEXT_PUBLIC_ENV="development"

# Local-only flags:
IS_LOCAL=true
ENABLE_DEBUG=true`
  };
  
  return suggestions[category] || 'Use local alternatives';
}

// Read from stdin
let inputData = '';
process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(inputData);
    const toolInput = input.tool_input || {};
    const filePath = toolInput.file_path || toolInput.filePath || '';
    const content = toolInput.content || toolInput.new_string || '';
    
    // Skip if no content
    if (!content) {
      process.exit(0);
    }
    
    // Skip non-configuration files unless they contain obvious config
    if (!isConfigurationFile(filePath) && !content.includes('process.env')) {
      process.exit(0);
    }
    
    // Detect remote configurations
    const issues = detectRemoteConfigurations(content, filePath);
    const hasGoodPatterns = GOOD_LOCAL_PATTERNS.some(p => p.test(content));
    
    // Block if remote configs found without local alternatives
    if (issues.length > 0 && !hasGoodPatterns) {
      let message = `🏠 Local-Only Configuration Required\n\n`;
      message += `This project must run entirely on localhost!\n\n`;
      
      // Group by category
      const byCategory = {};
      issues.forEach(issue => {
        if (!byCategory[issue.category]) {
          byCategory[issue.category] = [];
        }
        byCategory[issue.category].push(issue);
      });
      
      // Show issues by category
      Object.entries(byCategory).forEach(([category, categoryIssues]) => {
        message += `❌ ${category.charAt(0).toUpperCase() + category.slice(1)} issues:\n`;
        categoryIssues.slice(0, 2).forEach(issue => {
          message += `   • Found: ${issue.match}\n`;
        });
        if (categoryIssues.length > 2) {
          message += `   ... and ${categoryIssues.length - 2} more\n`;
        }
        message += `\n✅ Use instead:\n`;
        message += generateLocalSuggestions(category).split('\n').map(line => `   ${line}`).join('\n');
        message += `\n\n`;
      });
      
      message += `💡 Benefits of local-only:\n`;
      message += `   • No deployment needed\n`;
      message += `   • Works offline\n`;
      message += `   • Zero cloud costs\n`;
      message += `   • Instant feedback loop\n`;
      message += `   • Perfect for AI experiments\n\n`;
      
      message += `📖 See .env.example for local configuration patterns`;
      
      console.error(message);
      process.exit(2);
    }
    
    // Warn if mixing local and remote
    if (issues.length > 0 && hasGoodPatterns) {
      console.error(
        `⚠️ Mixed local/remote configurations detected\n` +
        `💡 Ensure all services run locally for development`
      );
    }
    
    // All good
    process.exit(0);
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.error(`Hook error: ${error.message}`);
    process.exit(0);
  }
});

// Handle timeout
setTimeout(() => {
  console.error('Hook timeout - allowing operation');
  process.exit(0);
}, 1500);

module.exports = { 
  LOCAL_ONLY_PATTERNS,
  GOOD_LOCAL_PATTERNS,
  detectRemoteConfigurations,
  isConfigurationFile
};