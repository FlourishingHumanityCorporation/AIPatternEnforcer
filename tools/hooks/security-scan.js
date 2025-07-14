#!/usr/bin/env node

/**
 * Claude Code Hook: Security Vulnerability Scanner
 *
 * Prevents AI from introducing common security vulnerabilities by scanning
 * code before it's written. Addresses friction point 4.1 from FRICTION-MAPPING.md.
 *
 * Blocks operations that would introduce:
 * - SQL injection vulnerabilities
 * - XSS vulnerabilities
 * - Insecure direct object references
 * - Hardcoded secrets/keys
 * - Unsafe eval/innerHTML usage
 *
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const fs = require("fs");
const {
  HookRunner,
  FileAnalyzer,
  PatternLibrary,
  ErrorFormatter,
} = require("./lib");

// Security vulnerability patterns
const SECURITY_PATTERNS = [
  {
    pattern: /(?:innerHTML|outerHTML)\s*=\s*[^;]+\+/gi,
    issue: "XSS vulnerability: Dynamic HTML injection",
    fix: "Use textContent, createElement, or a sanitization library",
  },
  {
    pattern: /eval\s*\(/gi,
    issue: "Code injection: eval() usage",
    fix: "Use JSON.parse() or safer alternatives",
  },
  {
    pattern: /new\s+Function\s*\(/gi,
    issue: "Code injection: Function constructor",
    fix: "Use safer alternatives or validate input strictly",
  },
  {
    pattern: /document\.write\s*\(/gi,
    issue: "XSS vulnerability: document.write usage",
    fix: "Use DOM manipulation methods instead",
  },
  {
    pattern:
      /password\s*[:=]\s*['"][\w\d!@#$%^&*]{8,}['"]|api[_-]?key\s*[:=]\s*['"][\w\d-]{20,}['"]|secret\s*[:=]\s*['"][\w\d]{16,}['"]/gi,
    issue: "Hardcoded credentials detected",
    fix: "Use environment variables or secure credential storage",
  },
  {
    pattern: /SELECT\s+.+\s+FROM\s+.+\s+WHERE\s+.+\+/gi,
    issue: "Potential SQL injection: String concatenation in query",
    fix: "Use parameterized queries or ORM methods",
  },
  {
    pattern: /fetch\s*\(\s*['"`][^'"`]*\$\{[^}]*\}[^'"`]*['"`]/gi,
    issue: "Potential injection: Template literals in URLs",
    fix: "Validate and sanitize dynamic URL parts",
  },
  {
    pattern:
      /localStorage\.setItem\s*\(\s*['"].*token.*['"]|sessionStorage\.setItem\s*\(\s*['"].*token.*['"]/gi,
    issue: "Insecure token storage in browser storage",
    fix: "Use httpOnly cookies or secure token handling",
  },
  {
    pattern: /Math\.random\s*\(\s*\).*(?:password|token|secret|key)/gi,
    issue: "Weak random number generation for security",
    fix: "Use crypto.getRandomValues() for cryptographic purposes",
  },
  {
    pattern: /window\.location\.href\s*=\s*[^;]+\+/gi,
    issue: "Open redirect vulnerability",
    fix: "Validate redirect URLs against allowed domains",
  },
];

// File extensions to scan (use FileAnalyzer instead)
// const SCANNABLE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs', '.vue', '.svelte']);

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

  for (const { pattern, issue, fix } of SECURITY_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        issue,
        fix,
        matches: matches.slice(0, 3), // Limit to first 3 matches
        count: matches.length,
      });
    }
  }

  return violations;
}

// Hook logic
async function securityScan(input) {
  const { filePath, content } = input;

  // Skip if no file path
  if (!filePath) {
    return { allow: true };
  }

  // Get content from input or read from file
  let scanContent = content || "";

  // If no content provided, try to read from file
  if (!scanContent && fs.existsSync(filePath)) {
    scanContent = fs.readFileSync(filePath, "utf8");
  }

  // Skip if no content available
  if (!scanContent) {
    return { allow: true };
  }

  const fileInfo = FileAnalyzer.extractFileInfo(filePath);

  // Skip non-scannable files (use FileAnalyzer instead of hardcoded extensions)
  if (!fileInfo.isCodeFile() && !FileAnalyzer.isWebFile(filePath)) {
    return { allow: true };
  }

  // Skip ignored files
  if (shouldIgnoreFile(filePath)) {
    return { allow: true };
  }

  // Scan for security vulnerabilities
  const violations = scanContent(scanContent, fileInfo.fileName);

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

// Run the hook
const runner = new HookRunner("security-scan", { timeout: 2000 });
runner.run(securityScan);

module.exports = { SECURITY_PATTERNS, scanContent, securityScan };
