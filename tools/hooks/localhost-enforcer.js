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

const {
  HookRunner,
  FileAnalyzer,
  PatternLibrary,
  ErrorFormatter,
} = require("./lib");

// Use shared localhost patterns from PatternLibrary (95% code reduction!)
// All patterns are now centralized in PatternLibrary.LOCAL_ONLY_PATTERNS and PatternLibrary.GOOD_LOCAL_PATTERNS

function detectRemoteConfigurations(content, filePath) {
  const detectedIssues = [];

  // Use shared localhost patterns from PatternLibrary
  for (const [category, config] of Object.entries(PatternLibrary.LOCAL_ONLY_PATTERNS)) {
    for (const pattern of config.remote) {
      const matches = content.match(pattern);
      if (matches) {
        detectedIssues.push({
          category,
          pattern: pattern.source,
          match: matches[0],
          message: config.message,
          suggestions: config.local,
          severity: "high",
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
    /prisma.*schema/,
  ];

  return configPatterns.some((pattern) => pattern.test(filePath));
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
ENABLE_DEBUG=true`,
  };

  return suggestions[category] || "Use local alternatives";
}

// Hook logic
async function localhostEnforcer(input) {
  const { filePath, content } = input;

  // Skip if no content
  if (!content) {
    return { allow: true };
  }

  // Skip non-configuration files unless they contain obvious config
  if (!isConfigurationFile(filePath) && !content.includes("process.env")) {
    return { allow: true };
  }

  // Detect remote configurations
  const issues = detectRemoteConfigurations(content, filePath);
  const hasGoodPatterns = PatternLibrary.GOOD_LOCAL_PATTERNS.some((p) => p.test(content));

  // Block if remote configs found without local alternatives
  if (issues.length > 0 && !hasGoodPatterns) {
    let message = `🏠 Local-Only Configuration Required\n\n`;
    message += `This project must run entirely on localhost!\n\n`;

    // Group by category
    const byCategory = {};
    issues.forEach((issue) => {
      if (!byCategory[issue.category]) {
        byCategory[issue.category] = [];
      }
      byCategory[issue.category].push(issue);
    });

    // Show issues by category
    Object.entries(byCategory).forEach(([category, categoryIssues]) => {
      message += `❌ ${category.charAt(0).toUpperCase() + category.slice(1)} issues:\n`;
      categoryIssues.slice(0, 2).forEach((issue) => {
        message += `   • Found: ${issue.match}\n`;
      });
      if (categoryIssues.length > 2) {
        message += `   ... and ${categoryIssues.length - 2} more\n`;
      }
      message += `\n✅ Use instead:\n`;
      message += generateLocalSuggestions(category)
        .split("\n")
        .map((line) => `   ${line}`)
        .join("\n");
      message += `\n\n`;
    });

    message += `💡 Benefits of local-only:\n`;
    message += `   • No deployment needed\n`;
    message += `   • Works offline\n`;
    message += `   • Zero cloud costs\n`;
    message += `   • Instant feedback loop\n`;
    message += `   • Perfect for AI experiments\n\n`;

    message += `📖 See .env.example for local configuration patterns`;

    return { block: true, message };
  }

  // Warn if mixing local and remote
  if (issues.length > 0 && hasGoodPatterns) {
    process.stderr.write(
      `⚠️ Mixed local/remote configurations detected\n` +
        `💡 Ensure all services run locally for development\n`,
    );
  }

  return { allow: true };
}

// Run the hook
const runner = new HookRunner("localhost-enforcer", { timeout: 1500 });
runner.run(localhostEnforcer);

module.exports = {
  detectRemoteConfigurations,
  isConfigurationFile,
  localhostEnforcer,
};
