#!/usr/bin/env node

/**
 * Claude Hook Adapter - Normalizes input format between Claude Code and testing
 * 
 * Usage: node claude-hook-adapter.js <path-to-actual-hook>
 * 
 * Claude Code sends: {session_id, tool_name, tool_input: {file_path, content}}
 * Hooks expect: {file_path, content}
 * 
 * This adapter bridges the gap without modifying existing hooks.
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the actual hook to run
const hookPath = process.argv[2];
if (!hookPath) {
  console.error('Error: No hook path provided');
  console.error('Usage: node claude-hook-adapter.js <path-to-hook>');
  process.exit(1);
}

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
    // Parse the input
    const data = JSON.parse(input);
    
    // Determine if this is Claude Code format or test format
    let normalizedInput;
    
    if (data.session_id && data.tool_input) {
      // Claude Code format - extract tool_input
      normalizedInput = data.tool_input;
      
      // Also preserve some context that hooks might need
      if (data.tool_name) {
        normalizedInput.tool_name = data.tool_name;
      }
    } else {
      // Test format or already normalized - pass through
      normalizedInput = data;
    }
    
    // Call the actual hook with normalized input
    try {
      const result = execSync(`node ${hookPath}`, {
        input: JSON.stringify(normalizedInput),
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Pass through the hook's output unchanged
      process.stdout.write(result);
      process.exit(0);
      
    } catch (error) {
      // Handle hook execution errors
      if (error.status === 2) {
        // Hook blocked the operation (exit code 2)
        process.stderr.write(error.stderr || error.message);
        process.exit(2);
      } else if (error.status === 0 && error.stdout) {
        // Hook succeeded but execSync threw (shouldn't happen)
        process.stdout.write(error.stdout);
        process.exit(0);
      } else {
        // Other errors
        process.stderr.write(error.stderr || error.message);
        process.exit(error.status || 1);
      }
    }
    
  } catch (error) {
    // JSON parsing error or other issues
    console.error('Adapter Error:', error.message);
    process.exit(1);
  }
});

// Handle timeout
setTimeout(() => {
  console.error('Adapter Error: Timeout waiting for input');
  process.exit(1);
}, 5000);