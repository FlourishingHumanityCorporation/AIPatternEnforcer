#!/usr/bin/env node

/**
 * OpenAI API Validator Hook
 *
 * Validates OpenAI API integration patterns and best practices for local AI development.
 * Focuses on proper API usage, error handling, and performance optimization.
 */

const fs = require("fs");
const path = require("path");
const HookRunner = require("../lib/HookRunner");
const FileAnalyzer = require("../lib/FileAnalyzer");

class OpenAIAPIValidator extends HookRunner {
  constructor() {
    super("openai-api-validator");
  }

  async validateContent(content, filePath) {
    // Early exit for non-code files
    if (!FileAnalyzer.isCodeFile(filePath)) {
      return this.allow();
    }

    // Skip if content doesn't contain OpenAI patterns
    if (!this.containsOpenAIPatterns(content)) {
      return this.allow();
    }

    const issues = [];

    // Check for OpenAI import patterns
    this.checkImportPatterns(content, issues);

    // Check for API key handling
    this.checkAPIKeyPatterns(content, issues);

    // Check for configuration patterns
    this.checkConfigurationPatterns(content, issues);

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

    if (issues.length > 0) {
      return this.block(issues.join("\n"));
    }

    return this.allow();
  }

  containsOpenAIPatterns(content) {
    const patterns = [
      /import.*openai/i,
      /from.*openai/i,
      /require.*openai/i,
      /OpenAI/,
      /gpt-/i,
      /davinci/i,
      /turbo/i,
      /completions/i,
      /chat\/completions/i,
      /embeddings/i,
      /fine-tuning/i,
      /whisper/i,
      /dall-e/i,
      /tts/i,
      /process\.env\.OPENAI_API_KEY/,
    ];

    return patterns.some((pattern) => pattern.test(content));
  }

  checkImportPatterns(content, issues) {
    const importPatterns = [
      {
        pattern: /import\s+OpenAI\s+from\s+['"]openai['"];?\s*$/gm,
        message: "Consider using named imports for better tree-shaking",
        suggestion: 'Use: import { OpenAI } from "openai"',
      },
      {
        pattern: /require\s*\(\s*['"]openai['"]\s*\)/g,
        message: "CommonJS require detected",
        suggestion: 'Use ES6 imports: import OpenAI from "openai"',
      },
      {
        pattern: /import.*openai\/.*$/gm,
        message: "Direct path imports detected",
        suggestion: 'Import from main package: import OpenAI from "openai"',
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
          "Use environment variable: apiKey: process.env.OPENAI_API_KEY",
      },
      {
        pattern: /sk-[A-Za-z0-9]{32,}/g,
        message: "Exposed API key in code",
        suggestion: "Move API key to environment variables",
      },
      {
        pattern: /new\s+OpenAI\s*\(\s*\)/g,
        message: "OpenAI client without configuration",
        suggestion:
          "Provide apiKey: new OpenAI({ apiKey: process.env.OPENAI_API_KEY })",
      },
      {
        pattern: /process\.env\.OPENAI_API_KEY(?!\s*\|\|)/g,
        message: "No fallback for missing API key",
        suggestion:
          'Add fallback: process.env.OPENAI_API_KEY || "your-fallback-key"',
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
        pattern: /new\s+OpenAI\s*\(\s*\{\s*apiKey[^}]*\}\s*\)/g,
        check: (match) => {
          return !(/timeout\s*:/.test(match) || /maxRetries\s*:/.test(match));
        },
        message: "OpenAI client without timeout or retry configuration",
        suggestion:
          "Add timeout and maxRetries: new OpenAI({ apiKey, timeout: 30000, maxRetries: 3 })",
      },
      {
        pattern: /\.chat\.completions\.create\s*\([^)]*\)/g,
        check: (match) => {
          return !(
            /temperature\s*:/.test(match) || /max_tokens\s*:/.test(match)
          );
        },
        message: "Chat completion without temperature or max_tokens",
        suggestion: "Add configuration: { temperature: 0.7, max_tokens: 1000 }",
      },
      {
        pattern: /model\s*:\s*['"]gpt-4['"](?!-turbo)/g,
        message: "Using expensive GPT-4 model",
        suggestion: "Consider gpt-4-turbo for better cost/performance ratio",
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

  checkErrorHandlingPatterns(content, issues) {
    const errorPatterns = [
      {
        pattern: /\.chat\.completions\.create\s*\([^)]*\)(?!\s*\.catch)/g,
        message: "OpenAI API call without error handling",
        suggestion:
          "Add error handling: .catch(error => { /* handle error */ })",
      },
      {
        pattern: /catch\s*\(\s*error?\s*\)\s*\{[^}]*console\.log/g,
        message: "Error handling with console.log",
        suggestion:
          'Use proper error logging: logger.error("OpenAI API error:", error)',
      },
      {
        pattern: /catch\s*\(\s*error?\s*\)\s*\{[^}]*throw\s+error/g,
        message: "Re-throwing error without context",
        suggestion:
          "Add context: throw new Error(`OpenAI API failed: ${error.message}`)",
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
            /\.on\s*\(\s*['"]data['"]/.test(nearbyCode)
          );
        },
        message: "Streaming enabled but no stream handling found",
        suggestion:
          "Handle stream: for await (const chunk of stream) { /* process chunk */ }",
      },
      {
        pattern: /for\s+await\s*\([^)]*\)\s*\{[^}]*console\.log/g,
        message: "Streaming with console.log",
        suggestion: "Use proper streaming handler or callback function",
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
        pattern: /\.chat\.completions\.create.*Promise\.all/gs,
        message: "Concurrent API calls without rate limiting",
        suggestion:
          "Use rate limiting: p-limit or similar to control concurrency",
      },
      {
        pattern: /for\s*\([^)]*\)\s*\{[^}]*\.chat\.completions\.create/gs,
        message: "Loop with API calls without delay",
        suggestion:
          "Add delay between calls: await new Promise(resolve => setTimeout(resolve, 100))",
      },
      {
        pattern: /RateLimitError|rate_limit_exceeded/g,
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
        pattern: /max_tokens\s*:\s*(?:4096|8192|16384|32768)/g,
        message: "Using maximum token limit",
        suggestion: "Consider lower max_tokens for cost optimization",
      },
      {
        pattern: /\.chat\.completions\.create/g,
        check: (match, context) => {
          const nearbyCode = context.substring(
            context.indexOf(match) - 200,
            context.indexOf(match) + 200,
          );
          return !/usage|prompt_tokens|completion_tokens/.test(nearbyCode);
        },
        message: "No token usage tracking",
        suggestion:
          "Track token usage: const response = await openai.chat.completions.create(...); console.log(response.usage);",
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
          /model\s*:\s*['"]text-davinci-003['"]|['"]code-davinci-002['"]|['"]davinci['"]|['"]curie['"]|['"]babbage['"]|['"]ada['"]/g,
        message: "Using deprecated legacy model",
        suggestion: "Use current models: gpt-3.5-turbo, gpt-4, or gpt-4-turbo",
      },
      {
        pattern:
          /model\s*:\s*['"]gpt-3\.5-turbo-instruct['"]|['"]gpt-3\.5-turbo-16k['"]|['"]gpt-4-32k['"]|['"]gpt-4-0314['"]|['"]gpt-4-0613['"]|['"]gpt-3\.5-turbo-0613['"]|['"]gpt-3\.5-turbo-0301['"]/g,
        message: "Using deprecated model version",
        suggestion: "Use latest models: gpt-3.5-turbo, gpt-4, or gpt-4-turbo",
      },
      {
        pattern: /model\s*:\s*process\.env\./g,
        message: "Model selection via environment variable",
        suggestion:
          'Consider validation: const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo"',
      },
    ];

    modelPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new OpenAIAPIValidator();
  validator.run(async (data) => {
    const { content = "", file_path = "" } = data;
    return await validator.validateContent(content, file_path);
  });
}

module.exports = OpenAIAPIValidator;
