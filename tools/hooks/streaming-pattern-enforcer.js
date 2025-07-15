#!/usr/bin/env node

/**
 * Claude Code Hook: Streaming Pattern Enforcer
 *
 * Ensures proper implementation of AI streaming responses.
 * Validates error handling and abort controller usage for streaming operations.
 */

const {
  HookRunner,
  FileAnalyzer,
  PatternLibrary,
  ErrorFormatter,
} = require("./lib");

// Simple patterns for streaming operations
const STREAMING_PATTERNS = [
  /stream:\s*true/i,
  /for\s+await.*(?:openai|anthropic)/i,
  /ServerSentEvents|EventSource/i,
];

// Required for safe streaming
const REQUIRED_PATTERNS = [
  /AbortController|abort.*signal/i,
  /try[\s\S]*?stream[\s\S]*?catch/i,
];

function hasStreamingOperations(content) {
  return STREAMING_PATTERNS.some((pattern) => pattern.test(content));
}

function hasRequiredPatterns(content) {
  return REQUIRED_PATTERNS.every((pattern) => pattern.test(content));
}

function isStreamingFile(filePath, content) {
  return FileAnalyzer.isCodeFile(filePath) && hasStreamingOperations(content);
}

// Hook logic
async function streamingPatternEnforcer(input) {
  const { filePath, content } = input;

  if (!filePath || !content) {
    return { allow: true };
  }

  if (isStreamingFile(filePath, content) && !hasRequiredPatterns(content)) {
    const message =
      "🌊 Streaming Pattern Issues\n\n" +
      "❌ Missing required patterns for safe streaming:\n" +
      "• AbortController for timeout handling\n" +
      "• try-catch blocks around streaming operations\n\n" +
      "✅ Add proper error handling and abort controller\n" +
      "📖 Guide: docs/guides/ai-integration/streaming-best-practices.md";

    return { block: true, message };
  }

  return { allow: true };
}

// Run the hook
// Create and run the hook
HookRunner.create("streaming-pattern-enforcer", streamingPatternEnforcer, {
  timeout: 2000,
});

module.exports = {
  STREAMING_PATTERNS,
  REQUIRED_PATTERNS,
  hasStreamingOperations,
  streamingPatternEnforcer,
};
