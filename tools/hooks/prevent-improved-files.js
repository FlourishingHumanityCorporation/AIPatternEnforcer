#!/usr/bin/env node

/**
 * Claude Code Hook: Prevent AI from creating _improved, _enhanced, _v2 files
 * 
 * This hook solves 80% of AI development friction by preventing the creation
 * of duplicate files with version suffixes. Forces AI to edit original files.
 * 
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 * 
 */

const path = require('path');

const BAD_PATTERNS = [
  /_improved\./i,
  /_enhanced\./i,
  /_v2\./i,
  /_v\d+\./i,
  /_fixed\./i,
  /_updated\./i,
  /_new\./i,
  /_final\./i,
  /_refactored\./i,
  /_optimized\./i,
  /_better\./i
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
    const content = toolInput.content || toolInput.new_string || '';
    
    // Allow operations without file paths
    if (!filePath) {
      process.exit(0);
    }
    
    // Protect HOOK_DEVELOPMENT setting in .env file
    if (filePath.endsWith('.env') && content) {
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('HOOK_DEVELOPMENT=')) {
          console.error(
            `🔒 Environment Protection Active\n` +
            `\n` +
            `❌ Cannot modify HOOK_DEVELOPMENT setting\n` +
            `📁 Protected: Hook development control\n` +
            `\n` +
            `ℹ️ This setting controls AI's ability to modify hooks\n` +
            `✅ Only humans can enable/disable hook development mode\n` +
            `\n` +
            `💡 This prevents AI from disabling its own constraints`
          );
          process.exit(2);
        }
      }
    }
    
    const fileName = path.basename(filePath);
    
    // Check for bad patterns
    for (const pattern of BAD_PATTERNS) {
      if (pattern.test(fileName)) {
        // Exit code 2 blocks the operation and shows stderr to Claude
        console.error(
          `❌ Don't create ${fileName}\n` +
          `✅ Edit the original file instead\n` +
          `💡 Use Edit or MultiEdit tool on existing file\n` +
          `\n` +
          `This prevents duplicate files and maintains clean code.`
        );
        process.exit(2);
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

module.exports = { BAD_PATTERNS };