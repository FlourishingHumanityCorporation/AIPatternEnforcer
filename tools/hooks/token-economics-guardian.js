#!/usr/bin/env node

/**
 * Claude Code Hook: Token Economics Guardian
 * 
 * Manages AI API costs proactively for "super lazy coder" workflow.
 * Warns about expensive operations before they happen.
 */

const fs = require('fs');
const path = require('path');

// Cost thresholds
const COST_LIMITS = {
  single_request_warning: 0.10,
  daily_budget: 10.00
};

// Simple patterns for expensive operations
const EXPENSIVE_PATTERNS = [
  /for.*await.*openai/i,
  /forEach.*await.*anthropic/i,
  /model:\s*['"`]gpt-4(?!o)['"`]/i,
  /model:\s*['"`]claude-3-opus['"`]/i
];

function hasExpensivePatterns(content) {
  return EXPENSIVE_PATTERNS.some(pattern => pattern.test(content));
}

function isAiCodeFile(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();
  const isCodeFile = ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
  const hasAiCalls = /(?:openai|anthropic)\..*\.create/i.test(content);
  
  return isCodeFile && hasAiCalls;
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
    
    if (isAiCodeFile(filePath, content) && hasExpensivePatterns(content)) {
      console.error(
        '🏦 Token Economics Warning\n\n' +
        '⚠️ Expensive AI operation patterns detected\n' +
        '💡 Consider using cheaper models for development:\n' +
        '   • gpt-4o instead of gpt-4 (75% cheaper)\n' +
        '   • claude-3-haiku instead of opus (90% cheaper)\n' +
        '   • Add caching for repeated requests\n\n' +
        '📖 Guide: docs/guides/ai-integration/cost-optimization.md'
      );
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error(`Token Economics Guardian error: ${error.message}`);
    process.exit(0);
  }
});

setTimeout(() => {
  process.exit(0);
}, 2000);

module.exports = { COST_LIMITS, EXPENSIVE_PATTERNS, hasExpensivePatterns };