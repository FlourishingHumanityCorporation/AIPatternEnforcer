#!/usr/bin/env node

/**
 * Claude Code Hook: Streaming Pattern Enforcer
 * 
 * Ensures proper implementation of AI streaming responses.
 * Validates error handling and abort controller usage for streaming operations.
 */

const path = require('path');

// Simple patterns for streaming operations
const STREAMING_PATTERNS = [
  /stream:\s*true/i,
  /for\s+await.*(?:openai|anthropic)/i,
  /ServerSentEvents|EventSource/i
];

// Required for safe streaming
const REQUIRED_PATTERNS = [
  /AbortController|abort.*signal/i,
  /try[\s\S]*?stream[\s\S]*?catch/i
];

function hasStreamingOperations(content) {
  return STREAMING_PATTERNS.some(pattern => pattern.test(content));
}

function hasRequiredPatterns(content) {
  return REQUIRED_PATTERNS.every(pattern => pattern.test(content));
}

function isStreamingFile(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();
  const isCodeFile = ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
  
  return isCodeFile && hasStreamingOperations(content);
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
    
    if (!filePath || !content) {
      process.exit(0);
    }
    
    if (isStreamingFile(filePath, content) && !hasRequiredPatterns(content)) {
      console.error(
        '🌊 Streaming Pattern Issues\n\n' +
        '❌ Missing required patterns for safe streaming:\n' +
        '• AbortController for timeout handling\n' +
        '• try-catch blocks around streaming operations\n\n' +
        '✅ Add proper error handling and abort controller\n' +
        '📖 Guide: docs/guides/ai-integration/streaming-best-practices.md'
      );
      process.exit(2);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error(`Streaming Pattern Enforcer error: ${error.message}`);
    process.exit(0);
  }
});

setTimeout(() => {
  process.exit(0);
}, 2000);

module.exports = { STREAMING_PATTERNS, REQUIRED_PATTERNS, hasStreamingOperations };
EOF < /dev/null