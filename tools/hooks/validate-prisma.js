#!/usr/bin/env node

/**
 * Claude Code Hook: Validate Prisma Schema
 * 
 * Performs basic validation on Prisma schema files to catch common AI mistakes.
 * Checks for required sections and basic syntax.
 * 
 * Usage: Called by Claude Code after Write/Edit operations on schema.prisma
 * Returns: { status: 'ok' | 'warning', message?: string }
 */

const fs = require('fs');
const path = require('path');

// Required sections in a Prisma schema
const REQUIRED_SECTIONS = {
  'generator client': 'Prisma Client generator',
  'datasource db': 'Database connection'
};

// Common mistakes to detect
const COMMON_ISSUES = [
  {
    pattern: /model\s+\w+\s*{[^}]*}/g,
    check: (match) => !match.includes('@@map'),
    warning: 'Models without @@map annotations may cause issues'
  },
  {
    pattern: /String\s*@id/g,
    check: () => true,
    warning: 'Consider using cuid() for String @id fields'
  }
];

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
    
    // Only process schema.prisma files
    if (!filePath.endsWith('schema.prisma')) {
      process.exit(0);
    }
    
    // Skip if file doesn't exist
    if (!fs.existsSync(filePath)) {
      process.exit(0);
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const warnings = [];
    
    // Check for required sections
    for (const [section, description] of Object.entries(REQUIRED_SECTIONS)) {
      if (!content.includes(section)) {
        warnings.push(`Missing ${description} (${section})`);
      }
    }
    
    // Check for common issues
    for (const issue of COMMON_ISSUES) {
      const matches = content.match(issue.pattern);
      if (matches) {
        for (const match of matches) {
          if (issue.check(match)) {
            warnings.push(issue.warning);
            break; // Only warn once per issue type
          }
        }
      }
    }
    
    // Additional basic syntax checks
    if (content.includes('model') && !content.includes('{')) {
      warnings.push('Models must have field definitions in braces');
    }
    
    if (content.includes('enum') && !content.includes('{')) {
      warnings.push('Enums must have value definitions in braces');
    }
    
    // Report warnings if any
    if (warnings.length > 0) {
      // PostToolUse hooks show stdout in transcript mode
      console.log(
        `⚠️ Prisma schema validation:\n${warnings.map(w => `  • ${w}`).join('\n')}\n\n` +
        `💡 These are suggestions, not blocking issues.\n` +
        `📖 See Prisma docs for best practices.`
      );
    } else {
      // No issues found
      console.log('✅ Prisma schema looks good');
    }
    
    // Success - exit code 0
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

module.exports = { REQUIRED_SECTIONS, COMMON_ISSUES };