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

const fs = require('fs');
const path = require('path');

// Security vulnerability patterns
const SECURITY_PATTERNS = [
  {
    pattern: /(?:innerHTML|outerHTML)\s*=\s*[^;]+\+/gi,
    issue: 'XSS vulnerability: Dynamic HTML injection',
    fix: 'Use textContent, createElement, or a sanitization library'
  },
  {
    pattern: /eval\s*\(/gi,
    issue: 'Code injection: eval() usage',
    fix: 'Use JSON.parse() or safer alternatives'
  },
  {
    pattern: /new\s+Function\s*\(/gi,
    issue: 'Code injection: Function constructor',
    fix: 'Use safer alternatives or validate input strictly'
  },
  {
    pattern: /document\.write\s*\(/gi,
    issue: 'XSS vulnerability: document.write usage',
    fix: 'Use DOM manipulation methods instead'
  },
  {
    pattern: /password\s*[:=]\s*['"][\w\d!@#$%^&*]{8,}['"]|api[_-]?key\s*[:=]\s*['"][\w\d-]{20,}['"]|secret\s*[:=]\s*['"][\w\d]{16,}['"]/gi,
    issue: 'Hardcoded credentials detected',
    fix: 'Use environment variables or secure credential storage'
  },
  {
    pattern: /SELECT\s+.+\s+FROM\s+.+\s+WHERE\s+.+\+/gi,
    issue: 'Potential SQL injection: String concatenation in query',
    fix: 'Use parameterized queries or ORM methods'
  },
  {
    pattern: /fetch\s*\(\s*['"`][^'"`]*\$\{[^}]*\}[^'"`]*['"`]/gi,
    issue: 'Potential injection: Template literals in URLs',
    fix: 'Validate and sanitize dynamic URL parts'
  },
  {
    pattern: /localStorage\.setItem\s*\(\s*['"].*token.*['"]|sessionStorage\.setItem\s*\(\s*['"].*token.*['"]/gi,
    issue: 'Insecure token storage in browser storage',
    fix: 'Use httpOnly cookies or secure token handling'
  },
  {
    pattern: /Math\.random\s*\(\s*\).*(?:password|token|secret|key)/gi,
    issue: 'Weak random number generation for security',
    fix: 'Use crypto.getRandomValues() for cryptographic purposes'
  },
  {
    pattern: /window\.location\.href\s*=\s*[^;]+\+/gi,
    issue: 'Open redirect vulnerability',
    fix: 'Validate redirect URLs against allowed domains'
  }
];

// File extensions to scan
const SCANNABLE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs', '.vue', '.svelte']);

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
  /VulnerableComponent/ // Demo component - intentionally vulnerable
];

function shouldIgnoreFile(filePath) {
  return IGNORED_PATTERNS.some(pattern => pattern.test(filePath));
}

function scanContent(content, fileName) {
  const violations = [];
  
  for (const {pattern, issue, fix} of SECURITY_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        issue,
        fix,
        matches: matches.slice(0, 3), // Limit to first 3 matches
        count: matches.length
      });
    }
  }
  
  return violations;
}

function checkFile(input) {
  try {
    const filePath = input.file_path || input.filePath || '';
    
    // Skip if no file path
    if (!filePath) {
      process.exit(0);
    }
    
    // Get content from input or read from file
    let content = input.content || input.new_string || input.new_content || '';
    
    // If no content provided, try to read from file
    if (!content && fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    }
    
    // Skip if no content available
    if (!content) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Skip non-scannable files
    const ext = path.extname(filePath);
    if (!SCANNABLE_EXTENSIONS.has(ext)) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Skip ignored files
    if (shouldIgnoreFile(filePath)) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Scan for security vulnerabilities
    const violations = scanContent(content, path.basename(filePath));
    
    if (violations.length > 0) {
      const message = `🔒 Security vulnerabilities detected in ${path.basename(filePath)}:\n\n` +
        violations.map((v, i) => 
          `${i + 1}. ❌ ${v.issue}\n` +
          `   ✅ ${v.fix}\n` +
          `   📍 Found ${v.count} instance${v.count > 1 ? 's' : ''}\n`
        ).join('\n') +
        `\n💡 Fix these security issues before proceeding.\n` +
        `📖 See config/security/ for approved patterns.`;
      
      // Write to stderr for Claude Code to see the message
      console.error(message);
      // Exit with code 2 to block the operation
      process.exit(2);
    }
    
    // No violations found - exit with code 0 to allow
    process.exit(0);
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.log(JSON.stringify({ 
      status: 'ok',
      debug: `Security scan error: ${error.message}` 
    }));
  }
}

// Handle command line execution
if (require.main === module) {
  // Read input from stdin
  let input = '';
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('readable', () => {
    let chunk;
    while ((chunk = process.stdin.read()) !== null) {
      input += chunk;
    }
  });
  
  process.stdin.on('end', () => {
    try {
      const data = input ? JSON.parse(input) : {};
      checkFile(data);
    } catch (error) {
      // Always allow operation if hook fails - fail open
      console.log(JSON.stringify({ 
        status: 'ok',
        debug: `Input parsing error: ${error.message}` 
      }));
      process.exit(0);
    }
  });
  
  // Handle timeout
  setTimeout(() => {
    console.log(JSON.stringify({ 
      status: 'ok',
      debug: 'Hook timeout - allowing operation' 
    }));
    process.exit(0);
  }, 3000);
}

module.exports = { checkFile, SECURITY_PATTERNS, scanContent };