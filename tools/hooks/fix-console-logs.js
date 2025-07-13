#!/usr/bin/env node

/**
 * Claude Code Hook: Auto-Fix Console Logs
 * 
 * Automatically converts console.log/error/warn/info to proper logger calls.
 * Runs after file operations to silently fix a common AI mistake.
 * 
 * This prevents production console.log pollution while maintaining dev experience.
 * 
 * Usage: Called by Claude Code after Write/Edit/MultiEdit operations
 * Input: JSON via stdin
 * Output: Exit code 0 for success, stdout shown in transcript mode
 */

const fs = require('fs');
const path = require('path');

// File types to process
const PROCESSABLE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs']);

// Console methods to replace - IMPORTANT: Keep as console.* -> logger.*
const CONSOLE_REPLACEMENTS = {
  'console.log': 'logger.info',
  'console.error': 'logger.error', 
  'console.warn': 'logger.warn',
  'console.info': 'logger.info',
  'console.debug': 'logger.debug'
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
    const toolResponse = input.tool_response || {};
    
    // Get file path from input or response
    const filePath = toolInput.file_path || toolInput.filePath || 
                    toolResponse.filePath || toolResponse.file_path || '';
    
    // Skip if no file path
    if (!filePath) {
      process.exit(0);
    }
    
    // Skip if file is in hooks or scripts directory to prevent self-modification
    if (filePath.includes('/hooks/') || filePath.includes('\\hooks\\') ||
        filePath.includes('/scripts/') || filePath.includes('\\scripts\\')) {
      process.exit(0);
    }
    
    // Skip if not a processable file type
    const ext = path.extname(filePath);
    if (!PROCESSABLE_EXTENSIONS.has(ext)) {
      process.exit(0);
    }
    
    // Skip if file doesn't exist
    if (!fs.existsSync(filePath)) {
      process.exit(0);
    }
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let changesCount = 0;
    
    // Apply console.* replacements
    for (const [oldPattern, newPattern] of Object.entries(CONSOLE_REPLACEMENTS)) {
      const regex = new RegExp(`\\b${oldPattern.replace('.', '\\.')}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newPattern);
        changesCount += matches.length;
      }
    }
    
    // If changes were made, write back to file
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      
      // PostToolUse hooks show stdout in transcript mode
      const fileName = path.basename(filePath);
      // Use process.stdout.write to avoid console.log being replaced
      process.stdout.write(`✨ Auto-fixed ${changesCount} console.* → logger.* calls in ${fileName}\n`);
    }
    
    // Success - exit code 0
    process.exit(0);
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    // Use process.stderr.write to avoid console.error being replaced
    process.stderr.write(`Hook error: ${error.message}\n`);
    process.exit(0);
  }
});

// Handle timeout
setTimeout(() => {
  process.stderr.write('Hook timeout - allowing operation\n');
  process.exit(0);
}, 1500);

module.exports = { CONSOLE_REPLACEMENTS, PROCESSABLE_EXTENSIONS };