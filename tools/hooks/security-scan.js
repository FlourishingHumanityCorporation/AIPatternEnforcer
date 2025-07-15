#!/usr/bin/env node

/**
 * Claude Code Hook: Security Vulnerability Scanner
 *
 * Prevents AI from introducing common security vulnerabilities by scanning
 * code before it's written. Addresses friction point 4.1 from FRICTION-MAPPING.md.
 *
 * MIGRATED: Now uses shared PatternLibrary for 90% code reduction
 *
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const fs = require("fs");
const HookRunner = require("./lib/HookRunner");
const {
  FileAnalyzer,
  PatternLibrary,
  ErrorFormatter,
} = require("./lib");

// Enhanced security patterns with fix suggestions (using shared patterns as base)
const SECURITY_FIXES = {
  xss: {
    issue: "XSS vulnerability: Dynamic HTML injection",
    fix: "Use textContent, createElement, or a sanitization library",
  },
  codeInjection: {
    issue: "Code injection vulnerability",
    fix: "Use JSON.parse() or safer alternatives instead of eval",
  },
  sqlInjection: {
    issue: "Potential SQL injection: String concatenation in query",
    fix: "Use parameterized queries or ORM methods",
  },
  hardcodedSecrets: {
    issue: "Hardcoded credentials detected",
    fix: "Use environment variables or secure credential storage",
  },
  urlInjection: {
    issue: "Potential injection: Template literals in URLs",
    fix: "Validate and sanitize dynamic URL parts",
  },
  insecureStorage: {
    issue: "Insecure token storage in browser storage",
    fix: "Use httpOnly cookies or secure token handling",
  },
  weakCrypto: {
    issue: "Weak random number generation for security",
    fix: "Use crypto.getRandomValues() for cryptographic purposes",
  },
};

// Files to always ignore
const IGNORED_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.next/,
  /test.*\.js$/,
  /spec.*\.js$/,
  /\.test\./,
  /\.spec\./,
  /VulnerableComponent/, // Demo component - intentionally vulnerable
];

function shouldIgnoreFile(filePath) {
  return IGNORED_PATTERNS.some((pattern) => pattern.test(filePath));
}

function scanContent(content, fileName) {
  const violations = [];

  // Use shared security patterns from PatternLibrary (90% code reduction!)
  for (const [category, patterns] of Object.entries(PatternLibrary.SECURITY_PATTERNS)) {
    const fixInfo = SECURITY_FIXES[category];
    if (!fixInfo) continue;

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          issue: fixInfo.issue,
          fix: fixInfo.fix,
          matches: matches.slice(0, 3), // Limit to first 3 matches
          count: matches.length,
          category,
        });
      }
    }
  }

  return violations;
}

// Hook logic
async function securityScan(input) {
  const filePath = input.filePath || input.file_path;
  const content = input.content;

  // Skip if no file path
  if (!filePath) {
    return { allow: true };
  }

  // Get content from input or read from file
  let contentToScan = content || "";

  // If no content provided, try to read from file
  if (!contentToScan && fs.existsSync(filePath)) {
    contentToScan = fs.readFileSync(filePath, "utf8");
  }

  // Skip if no content available
  if (!contentToScan) {
    return { allow: true };
  }

  const fileInfo = FileAnalyzer.extractFileInfo(filePath);

  // Skip non-scannable files (use FileAnalyzer instead of hardcoded extensions)
  if (!FileAnalyzer.isCodeFile(filePath)) {
    return { allow: true };
  }

  // Skip ignored files
  if (shouldIgnoreFile(filePath)) {
    return { allow: true };
  }

  // Scan for security vulnerabilities
  const violations = scanContent(contentToScan, fileInfo.fileName);

  if (violations.length > 0) {
    const message =
      `🔒 Security vulnerabilities detected in ${fileInfo.fileName}:\n\n` +
      violations
        .map(
          (v, i) =>
            `${i + 1}. ❌ ${v.issue}\n` +
            `   ✅ ${v.fix}\n` +
            `   📍 Found ${v.count} instance${v.count > 1 ? "s" : ""}\n`,
        )
        .join("\n") +
      `\n💡 Fix these security issues before proceeding.\n` +
      `📖 See config/security/ for approved patterns.`;

    return {
      block: true,
      message: message,
    };
  }

  return { allow: true };
}

// Create and run the hook
HookRunner.create("security-scan", securityScan, {
  timeout: 2000,
});

module.exports = { SECURITY_FIXES, scanContent, securityScan };