#!/usr/bin/env node

/**
 * Anthropic Claude Validator Hook
 *
 * Validates Anthropic Claude API integration patterns and best practices for local AI development.
 * Focuses on proper API usage, error handling, and Claude-specific patterns.
 */

const fs = require("fs");
const path = require("path");
const HookRunner = require("../lib/HookRunner");
const FileAnalyzer = require("../lib/FileAnalyzer");

class AnthropicClaudeValidator extends HookRunner {
  constructor() {
    super("anthropic-claude-validator");
  }

  async validateContent(content, filePath) {
    // Early exit for non-code files
    if (!FileAnalyzer.isCodeFile(filePath)) {
      return this.allow();
    }

    // Skip if content doesn't contain Anthropic patterns
    if (!this.containsAnthropicPatterns(content)) {
      return this.allow();
    }

    const issues = [];

    // Check for Anthropic import patterns
    this.checkImportPatterns(content, issues);

    // Check for API key handling
    this.checkAPIKeyPatterns(content, issues);

    // Check for configuration patterns
    this.checkConfigurationPatterns(content, issues);

    // Check for message formatting patterns
    this.checkMessagePatterns(content, issues);

    // Check for error handling patterns
    this.checkErrorHandlingPatterns(content, issues);

    // Check for streaming patterns
    this.checkStreamingPatterns(content, issues);

    // Check for rate limiting patterns
    this.checkRateLimitingPatterns(content, issues);

    // Check for token usage patterns
    this.checkTokenUsagePatterns(content, issues);

    // Check for model selection patterns
    this.checkModelSelectionPatterns(content, issues);

    // Check for system prompt patterns
    this.checkSystemPromptPatterns(content, issues);

    if (issues.length > 0) {
      return this.block(issues.join("\n"));
    }

    return this.allow();
  }

  containsAnthropicPatterns(content) {
    const patterns = [
      /import.*@anthropic-ai/i,
      /from.*@anthropic-ai/i,
      /require.*@anthropic-ai/i,
      /Anthropic/,
      /claude-/i,
      /sonnet/i,
      /haiku/i,
      /opus/i,
      /messages\.create/i,
      /process\.env\.ANTHROPIC_API_KEY/,
      /system.*role/i,
      /user.*role/i,
      /assistant.*role/i,
      /max_tokens/i,
      /temperature/i,
      /stop_sequences/i,
    ];

    return patterns.some((pattern) => pattern.test(content));
  }

  checkImportPatterns(content, issues) {
    const importPatterns = [
      {
        pattern:
          /import\s+Anthropic\s+from\s+['"]@anthropic-ai\/sdk['"];?\s*$/gm,
        message: "Consider using named imports for better tree-shaking",
        suggestion: 'Use: import { Anthropic } from "@anthropic-ai/sdk"',
      },
      {
        pattern: /require\s*\(\s*['"]@anthropic-ai\/sdk['"]\s*\)/g,
        message: "CommonJS require detected",
        suggestion:
          'Use ES6 imports: import Anthropic from "@anthropic-ai/sdk"',
      },
      {
        pattern: /import.*@anthropic-ai\/sdk\/.*$/gm,
        message: "Direct path imports detected",
        suggestion:
          'Import from main package: import Anthropic from "@anthropic-ai/sdk"',
      },
    ];

    importPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkAPIKeyPatterns(content, issues) {
    const keyPatterns = [
      {
        pattern: /apiKey\s*:\s*['"][^'"]*['"](?!\s*process\.env)/g,
        message: "Hardcoded API key detected",
        suggestion:
          "Use environment variable: apiKey: process.env.ANTHROPIC_API_KEY",
      },
      {
        pattern: /sk-ant-[A-Za-z0-9]{32,}/g,
        message: "Exposed Anthropic API key in code",
        suggestion: "Move API key to environment variables",
      },
      {
        pattern: /new\s+Anthropic\s*\(\s*\)/g,
        message: "Anthropic client without configuration",
        suggestion:
          "Provide apiKey: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })",
      },
      {
        pattern: /process\.env\.ANTHROPIC_API_KEY(?!\s*\|\|)/g,
        message: "No fallback for missing API key",
        suggestion:
          'Add fallback: process.env.ANTHROPIC_API_KEY || "your-fallback-key"',
      },
    ];

    keyPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkConfigurationPatterns(content, issues) {
    const configPatterns = [
      {
        pattern: /new\s+Anthropic\s*\(\s*\{\s*apiKey[^}]*\}\s*\)/g,
        check: (match) => {
          return !(/timeout\s*:/.test(match) || /maxRetries\s*:/.test(match));
        },
        message: "Anthropic client without timeout or retry configuration",
        suggestion:
          "Add timeout and maxRetries: new Anthropic({ apiKey, timeout: 30000, maxRetries: 3 })",
      },
      {
        pattern: /\.messages\.create\s*\([^)]*\)/g,
        check: (match) => {
          return !/max_tokens\s*:/.test(match);
        },
        message: "Message creation without max_tokens",
        suggestion: "Add max_tokens: { max_tokens: 4096 }",
      },
      {
        pattern:
          /model\s*:\s*['"]claude-instant-1\.2['"]|['"]claude-1\.3['"]|['"]claude-2\.0['"]|['"]claude-2\.1['"]|['"]claude-instant-1\.1['"]|['"]claude-instant-1\.0['"]|['"]claude-1\.0['"]|['"]claude-1\.2['"]/g,
        message: "Using deprecated Claude model",
        suggestion:
          "Use current models: claude-3-sonnet-20240229, claude-3-haiku-20240307, or claude-3-opus-20240229",
      },
    ];

    configPatterns.forEach(({ pattern, check, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!check || check(match)) {
            issues.push(`❌ ${message}\n✅ ${suggestion}`);
          }
        });
      }
    });
  }

  checkMessagePatterns(content, issues) {
    const messagePatterns = [
      {
        pattern: /messages\s*:\s*\[\s*\{[^}]*role\s*:\s*['"]human['"][^}]*\}/g,
        message: 'Using deprecated "human" role',
        suggestion: 'Use "user" role instead: { role: "user", content: "..." }',
      },
      {
        pattern: /messages\s*:\s*\[\s*\{[^}]*role\s*:\s*['"]ai['"][^}]*\}/g,
        message: 'Using deprecated "ai" role',
        suggestion:
          'Use "assistant" role instead: { role: "assistant", content: "..." }',
      },
      {
        pattern:
          /messages\s*:\s*\[\s*\{[^}]*content\s*:\s*['"][^'"]*\\n[^'"]*['"][^}]*\}/g,
        message: "Using string concatenation for multi-line messages",
        suggestion:
          "Use template literals or array format for better readability",
      },
      {
        pattern: /system\s*:\s*['"][^'"]*['"](?!.*messages)/g,
        message: "Using deprecated system parameter",
        suggestion:
          'Use system message in messages array: { role: "system", content: "..." }',
      },
    ];

    messagePatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkErrorHandlingPatterns(content, issues) {
    const errorPatterns = [
      {
        pattern: /\.messages\.create\s*\([^)]*\)(?!\s*\.catch)/g,
        message: "Anthropic API call without error handling",
        suggestion:
          "Add error handling: .catch(error => { /* handle error */ })",
      },
      {
        pattern: /catch\s*\(\s*error?\s*\)\s*\{[^}]*console\.log/g,
        message: "Error handling with console.log",
        suggestion:
          'Use proper error logging: logger.error("Anthropic API error:", error)',
      },
      {
        pattern: /catch\s*\(\s*error?\s*\)\s*\{[^}]*throw\s+error/g,
        message: "Re-throwing error without context",
        suggestion:
          "Add context: throw new Error(`Anthropic API failed: ${error.message}`)",
      },
      {
        pattern: /RateLimitError|rate_limit_exceeded/g,
        message: "Rate limit error detection",
        suggestion:
          'Handle rate limits with exponential backoff: if (error.type === "rate_limit_error") { /* retry logic */ }',
      },
    ];

    errorPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkStreamingPatterns(content, issues) {
    const streamPatterns = [
      {
        pattern: /stream\s*:\s*true/g,
        check: (match, context) => {
          const nearbyCode = context.substring(
            context.indexOf(match) - 200,
            context.indexOf(match) + 200,
          );
          return !(
            /for\s+await/.test(nearbyCode) ||
            /\.on\s*\(\s*['"]message['"]/.test(nearbyCode)
          );
        },
        message: "Streaming enabled but no stream handling found",
        suggestion:
          "Handle stream: for await (const message of stream) { /* process message */ }",
      },
      {
        pattern: /for\s+await\s*\([^)]*\)\s*\{[^}]*console\.log/g,
        message: "Streaming with console.log",
        suggestion: "Use proper streaming handler or callback function",
      },
      {
        pattern: /\.on\s*\(\s*['"]message['"].*console\.log/g,
        message: "Stream event handler with console.log",
        suggestion:
          'Use proper message processing: .on("message", (message) => processMessage(message))',
      },
    ];

    streamPatterns.forEach(({ pattern, check, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!check || check(match, content)) {
            issues.push(`❌ ${message}\n✅ ${suggestion}`);
          }
        });
      }
    });
  }

  checkRateLimitingPatterns(content, issues) {
    const rateLimitPatterns = [
      {
        pattern: /\.messages\.create.*Promise\.all/gs,
        message: "Concurrent API calls without rate limiting",
        suggestion:
          "Use rate limiting: p-limit or similar to control concurrency",
      },
      {
        pattern: /for\s*\([^)]*\)\s*\{[^}]*\.messages\.create/gs,
        message: "Loop with API calls without delay",
        suggestion:
          "Add delay between calls: await new Promise(resolve => setTimeout(resolve, 100))",
      },
      {
        pattern: /rate_limit_error/g,
        check: (match, context) => {
          const nearbyCode = context.substring(
            context.indexOf(match) - 100,
            context.indexOf(match) + 100,
          );
          return !/retry|backoff|delay/.test(nearbyCode);
        },
        message: "Rate limit error handling without retry logic",
        suggestion: "Implement exponential backoff for rate limit errors",
      },
    ];

    rateLimitPatterns.forEach(({ pattern, check, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!check || check(match, content)) {
            issues.push(`❌ ${message}\n✅ ${suggestion}`);
          }
        });
      }
    });
  }

  checkTokenUsagePatterns(content, issues) {
    const tokenPatterns = [
      {
        pattern: /max_tokens\s*:\s*(?:8192|4096|2048)/g,
        message: "Using high token limit",
        suggestion: "Consider lower max_tokens for cost optimization",
      },
      {
        pattern: /\.messages\.create/g,
        check: (match, context) => {
          const nearbyCode = context.substring(
            context.indexOf(match) - 200,
            context.indexOf(match) + 200,
          );
          return !/usage|input_tokens|output_tokens/.test(nearbyCode);
        },
        message: "No token usage tracking",
        suggestion:
          "Track token usage: const response = await anthropic.messages.create(...); console.log(response.usage);",
      },
    ];

    tokenPatterns.forEach(({ pattern, check, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!check || check(match, content)) {
            issues.push(`❌ ${message}\n✅ ${suggestion}`);
          }
        });
      }
    });
  }

  checkModelSelectionPatterns(content, issues) {
    const modelPatterns = [
      {
        pattern:
          /model\s*:\s*['"]claude-instant-1\.2['"]|['"]claude-1\.3['"]|['"]claude-2\.0['"]|['"]claude-2\.1['"]|['"]claude-instant-1\.1['"]|['"]claude-instant-1\.0['"]|['"]claude-1\.0['"]|['"]claude-1\.2['"]/g,
        message: "Using deprecated Claude model",
        suggestion:
          "Use current models: claude-3-sonnet-20240229, claude-3-haiku-20240307, or claude-3-opus-20240229",
      },
      {
        pattern: /model\s*:\s*['"]claude-3-opus['"](?!-20240229)/g,
        message: "Using Claude 3 Opus without date suffix",
        suggestion: "Use versioned model: claude-3-opus-20240229",
      },
      {
        pattern: /model\s*:\s*process\.env\./g,
        message: "Model selection via environment variable",
        suggestion:
          'Consider validation: const model = process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20240229"',
      },
    ];

    modelPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkSystemPromptPatterns(content, issues) {
    const systemPatterns = [
      {
        pattern: /system\s*:\s*['"][^'"]*['"](?!.*messages)/g,
        message: "Using deprecated system parameter",
        suggestion:
          'Use system message: { role: "system", content: "..." } in messages array',
      },
      {
        pattern:
          /messages\s*:\s*\[\s*\{[^}]*role\s*:\s*['"]system['"][^}]*\}[^}]*\{[^}]*role\s*:\s*['"]system['"][^}]*\}/g,
        message: "Multiple system messages detected",
        suggestion: "Use single system message at the beginning",
      },
      {
        pattern:
          /\{[^}]*role\s*:\s*['"]system['"][^}]*content\s*:\s*['"][^'"]*\\n[^'"]*['"][^}]*\}/g,
        message: "System prompt with string concatenation",
        suggestion: "Use template literals for multi-line system prompts",
      },
    ];

    systemPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new AnthropicClaudeValidator();
  validator.run(async (data) => {
    const { content = "", file_path = "" } = data;
    return await validator.validateContent(content, file_path);
  });
}

module.exports = AnthropicClaudeValidator;
