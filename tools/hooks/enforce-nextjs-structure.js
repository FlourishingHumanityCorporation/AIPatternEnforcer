#!/usr/bin/env node

/**
 * Claude Code Hook: Enforce Next.js App Router Structure
 * 
 * Ensures files are created with proper extensions in the right directories
 * for Next.js App Router projects (recommended stack in GOAL.md).
 * 
 * Usage: Called by Claude Code before Write operations  
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const path = require('path');

// Directory-specific file extension rules for Next.js App Router
const STRUCTURE_RULES = {
  '/app/': {
    pattern: /\.(tsx|jsx|ts|js)$/,
    description: 'Next.js App Router files (.tsx, .jsx, .ts, .js)'
  },
  '/components/': {
    pattern: /\.(tsx|jsx)$/,
    description: 'React components (.tsx, .jsx)'
  },
  '/lib/': {
    pattern: /\.(ts|js)$/,
    description: 'Utility libraries (.ts, .js)'
  },
  '/hooks/': {
    pattern: /^use.+\.(ts|js)$/,
    description: 'React hooks starting with "use" (.ts, .js)'
  },
  '/utils/': {
    pattern: /\.(ts|js)$/,
    description: 'Utility functions (.ts, .js)'
  },
  '/types/': {
    pattern: /\.ts$/,
    description: 'TypeScript type definitions (.ts)'
  },
  '/api/': {
    pattern: /\.(ts|js)$/,
    description: 'API route handlers (.ts, .js)'
  }
};

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
    
    // Allow operations without file paths
    if (!filePath) {
      process.exit(0);
    }
    
    const fileName = path.basename(filePath);
    const dirPath = path.dirname(filePath);
    
    // Check each directory rule
    for (const [dirPattern, rule] of Object.entries(STRUCTURE_RULES)) {
      // If the file is in this directory (but not in tools/hooks)
      if (filePath.includes(dirPattern) && !filePath.includes('tools/hooks')) {
        
        // Check if filename matches the required pattern
        if (!rule.pattern.test(fileName)) {
          // Exit code 2 blocks the operation and shows stderr to Claude
          console.error(
            `❌ Wrong file type for ${dirPattern}\n` +
            `✅ Expected: ${rule.description}\n` +
            `💡 You tried to create: ${fileName}\n` +
            `\n` +
            `Next.js App Router has specific file patterns for each directory.`
          );
          process.exit(2);
        }
      }
    }
    
    // Allow the operation
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

module.exports = { STRUCTURE_RULES };