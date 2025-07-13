#!/usr/bin/env node

/**
 * Claude Code Hook: AI Integration Validator
 * 
 * Validates proper AI service integration patterns for OpenAI, Anthropic, and other
 * AI services. Prevents common mistakes in AI API usage that lead to errors,
 * high costs, or poor user experience.
 * 
 * Validates:
 * - API key security (no hardcoding)
 * - Proper retry logic for rate limits
 * - Streaming implementation patterns
 * - Error handling for AI failures
 * - Token usage optimization
 * - Cost-aware patterns
 * 
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const path = require('path');

// AI service patterns grouped by concern
const AI_INTEGRATION_PATTERNS = {
  // Security issues
  security: {
    patterns: [
      // Hardcoded API keys
      /(?:OPENAI|ANTHROPIC|CLAUDE)_API_KEY\s*=\s*["']sk-[A-Za-z0-9-_]{20,}["']/gi,
      /(?:openai|anthropic)\.apiKey\s*=\s*["'][^"']+["']/gi,
      /api[_-]?key\s*[:=]\s*["'](?:sk-|claude-)[A-Za-z0-9-_]{20,}["']/gi,
      
      // API keys in client-side code
      /(?:window|document|localStorage|sessionStorage).*(?:apiKey|api_key)/gi,
      /fetch.*headers.*(?:apiKey|api_key|Authorization).*["']Bearer\s+sk-/gi,
      
      // Exposed in logs
      /console\.log.*(?:apiKey|api_key|OPENAI|ANTHROPIC)/gi,
      /logger\..*\(.*(?:apiKey|api_key|headers|Authorization)/gi
    ],
    message: 'API key security vulnerability',
    suggestions: [
      'Use environment variables: process.env.OPENAI_API_KEY',
      'Never expose API keys in client-side code',
      'Use server-side API routes for AI calls',
      'Never log API keys or auth headers'
    ]
  },

  // Missing error handling
  errorHandling: {
    patterns: [
      // No try-catch around AI calls
      /(?:openai|anthropic|claude)\.[a-zA-Z]+\.create\s*\([^)]*\)(?!\s*\.catch|\s*\)\.catch)/g,
      /await\s+(?:openai|anthropic)\.(?!.*try\s*\{)/g,
      
      // No rate limit handling
      /catch\s*\([^)]*\)\s*\{[^}]*(?:console|throw)[^}]*\}(?!.*retry|backoff|delay)/gi,
      
      // No timeout handling
      /fetch.*(?:openai|anthropic)(?!.*AbortController|timeout|signal)/gi
    ],
    message: 'Missing AI error handling',
    suggestions: [
      'Add try-catch blocks around AI calls',
      'Implement exponential backoff for rate limits',
      'Add timeout handling with AbortController',
      'Handle specific error types (rate limit, network, etc.)'
    ]
  },

  // Improper streaming implementation
  streaming: {
    patterns: [
      // Wrong streaming setup
      /stream\s*:\s*true(?!.*(?:on|data|chunk|delta))/gi,
      /createChatCompletion.*stream.*(?!.*for await|async\*|on\('data)/gi,
      
      // Missing abort handling
      /(?:SSE|EventSource|stream)(?!.*(?:abort|close|cleanup))/gi,
      
      // No backpressure handling
      /stream.*write(?!.*drain|pause|resume)/gi
    ],
    message: 'Improper streaming implementation',
    suggestions: [
      'Use for await...of for OpenAI streaming',
      'Implement proper SSE for client streaming',
      'Add abort signal handling',
      'Handle backpressure in streams'
    ]
  },

  // Inefficient token usage
  tokenUsage: {
    patterns: [
      // Sending entire context repeatedly
      /messages\s*:\s*\[[^]]{1000,}/g,
      /prompt\s*:\s*[`"'][^`"']{5000,}/g,
      
      // No token counting
      /(?:openai|anthropic).*create(?!.*(?:max_tokens|maxTokens))/gi,
      
      // Inefficient model selection
      /model\s*:\s*["'](?:gpt-4|claude-3-opus)["'].*(?:simple|basic|short)/gi
    ],
    message: 'Inefficient token usage',
    suggestions: [
      'Implement conversation pruning',
      'Count tokens before sending',
      'Use appropriate models for task complexity',
      'Set max_tokens limits'
    ]
  },

  // Cost-unaware patterns
  costManagement: {
    patterns: [
      // No cost tracking
      /(?:completion|response)\.usage(?!.*cost|price|budget)/gi,
      
      // Expensive operations in loops
      /(?:for|while|map|forEach).*(?:openai|anthropic)\..*create/gi,
      
      // No caching
      /(?:openai|anthropic)\..*create(?!.*cache|memoize)/gi
    ],
    message: 'Cost-unaware AI usage',
    suggestions: [
      'Track token usage and costs',
      'Batch operations when possible',
      'Implement response caching',
      'Add usage limits and budgets'
    ]
  },

  // Outdated API patterns
  outdated: {
    patterns: [
      // Old OpenAI SDK
      /openai\.Completion\.create/gi,
      /openai\.ChatCompletion/gi,
      /Configuration\s*\(\s*\{.*apiKey/gi,
      
      // Old Anthropic patterns
      /claude\.complete/gi,
      /anthropic\.ai\.complete/gi
    ],
    message: 'Outdated AI API patterns',
    suggestions: [
      'Use openai.chat.completions.create()',
      'Use latest SDK versions',
      'Follow current documentation',
      'Update to new streaming patterns'
    ]
  }
};

// Best practice patterns to encourage
const GOOD_AI_PATTERNS = [
  /try\s*\{.*await.*(?:openai|anthropic)/s,
  /AbortController|timeout.*(?:openai|anthropic)/,
  /process\.env\.(?:OPENAI|ANTHROPIC)_API_KEY/,
  /exponentialBackoff|retry.*attempt/i,
  /(?:cache|memoize).*(?:embedding|completion)/i,
  /token.*(?:count|limit|budget)/i
];

function detectAIIntegrationIssues(content, filePath) {
  const issues = [];
  
  // Skip if not likely to contain AI code
  const hasAICode = /(?:openai|anthropic|claude|gpt|completion|embedding)/i.test(content);
  if (!hasAICode) {
    return issues;
  }
  
  // Check for issues
  for (const [category, config] of Object.entries(AI_INTEGRATION_PATTERNS)) {
    for (const pattern of config.patterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          category,
          pattern: pattern.source,
          match: matches[0].substring(0, 100), // Truncate long matches
          message: config.message,
          suggestions: config.suggestions,
          severity: category === 'security' ? 'critical' : 'high'
        });
      }
    }
  }
  
  // Check for good patterns to provide positive feedback
  const goodPatterns = GOOD_AI_PATTERNS.filter(pattern => pattern.test(content));
  
  return { issues, goodPatterns };
}

function generateAISuggestions(issues) {
  const suggestions = new Set();
  
  issues.forEach(issue => {
    issue.suggestions.forEach(suggestion => suggestions.add(suggestion));
  });
  
  // Add general best practices
  if (issues.some(i => i.category === 'security')) {
    suggestions.add('Create .env.local with API keys');
    suggestions.add('Add .env.local to .gitignore');
  }
  
  if (issues.some(i => i.category === 'errorHandling')) {
    suggestions.add('See examples/ai-nextjs-reference/lib/ai/ for patterns');
  }
  
  return Array.from(suggestions);
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
    
    // Skip if no content
    if (!content) {
      process.exit(0);
    }
    
    // Skip certain files
    const skipPatterns = [
      /node_modules/,
      /\.md$/,
      /\.json$/,
      /\.test\./,
      /\.spec\./
    ];
    
    if (skipPatterns.some(pattern => pattern.test(filePath))) {
      process.exit(0);
    }
    
    // Detect AI integration issues
    const { issues, goodPatterns } = detectAIIntegrationIssues(content, filePath);
    
    // Filter critical issues
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    
    if (criticalIssues.length > 0 || highIssues.length > 2) {
      let message = `🤖 AI Integration Issues Detected\n\n`;
      
      // Show critical issues first
      if (criticalIssues.length > 0) {
        message += `🔴 Critical Security Issues:\n`;
        criticalIssues.forEach((issue, i) => {
          message += `${i + 1}. ${issue.message}\n`;
          message += `   Found: ${issue.match}\n`;
        });
        message += '\n';
      }
      
      // Show other issues
      if (highIssues.length > 0) {
        message += `⚠️ Integration Issues:\n`;
        highIssues.slice(0, 3).forEach((issue, i) => {
          message += `${i + 1}. ${issue.message}\n`;
        });
        if (highIssues.length > 3) {
          message += `... and ${highIssues.length - 3} more\n`;
        }
        message += '\n';
      }
      
      // Generate suggestions
      const suggestions = generateAISuggestions(issues);
      message += `✅ Required fixes:\n`;
      suggestions.slice(0, 5).forEach(suggestion => {
        message += `• ${suggestion}\n`;
      });
      
      message += `\n💡 Best practices for AI integration:\n`;
      message += `• Always use environment variables for API keys\n`;
      message += `• Implement proper error handling and retries\n`;
      message += `• Use server-side routes for AI calls\n`;
      message += `• Monitor token usage and costs\n`;
      
      message += `\n📖 See examples/ai-nextjs-reference/ for patterns`;
      
      console.error(message);
      process.exit(2);
    } else if (issues.length > 0 && goodPatterns.length === 0) {
      // Some issues but not blocking - show warning
      console.error(
        `⚠️ AI Integration Warnings (${issues.length} issues)\n` +
        `Consider reviewing: ${issues[0].message}\n` +
        `💡 Add proper error handling and security patterns`
      );
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
}, 2000);

module.exports = { 
  AI_INTEGRATION_PATTERNS,
  GOOD_AI_PATTERNS,
  detectAIIntegrationIssues
};