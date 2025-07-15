# Claude Code Hook Implementation Patterns

**Last Updated**: 2025-07-15  
**System Version**: 3.0 (20 hooks)  
**Purpose**: Common patterns and code examples for hook implementation

## Overview

This guide provides practical implementation patterns used across the Claude Code hooks system, with code examples and references to actual implementations.

## Basic Hook Structure

### HookRunner Pattern

All modern hooks use the `HookRunner.create()` pattern:

```javascript
#!/usr/bin/env node
const { HookRunner } = require("./lib");

function myHookLogic(hookData, runner) {
  const { file_path, content } = hookData.tool_input;

  // Validation logic
  if (/* condition */) {
    return runner.block("❌ Error message\n✅ Suggestion");
  }

  return runner.allow();
}

HookRunner.create("my-hook-name", myHookLogic);
```

**Example**: [`tools/hooks/prevent-improved-files.js`](../../../tools/hooks/prevent-improved-files.js)

## Common Patterns

### 1. Early Exit Pattern

Exit quickly for non-applicable cases:

```javascript
function hookLogic(hookData, runner) {
  // Quick checks first
  if (!hookData.tool_input.content) {
    return runner.allow();
  }

  // Skip certain file types
  const { file_path } = hookData.tool_input;
  if (file_path.endsWith(".md") || file_path.endsWith(".json")) {
    return runner.allow();
  }

  // Then perform expensive operations
  // ...
}
```

**Used in**: Most hooks for performance optimization

### 2. Pattern Detection

Using the PatternLibrary for consistent detection:

```javascript
const { PatternLibrary } = require("./lib");

function detectEnterprisePatterns(hookData, runner) {
  const { content } = hookData.tool_input;

  if (PatternLibrary.hasEnterprisePattern(content)) {
    const details = PatternLibrary.getMatchDetails(content);
    return runner.block(
      `🚫 Enterprise pattern detected: ${details.pattern}\n` +
        `✅ Use ${details.alternative} instead`,
    );
  }

  return runner.allow();
}
```

**Example**: [`tools/hooks/enterprise-antibody.js`](../../../tools/hooks/enterprise-antibody.js)

### 3. File Type Analysis

Using FileAnalyzer for intelligent decisions:

```javascript
const { FileAnalyzer } = require("./lib");

function validateByFileType(hookData, runner) {
  const { file_path, content } = hookData.tool_input;

  // Skip non-code files
  if (!FileAnalyzer.isCode(file_path)) {
    return runner.allow();
  }

  // Apply relaxed rules for infrastructure
  if (FileAnalyzer.isInfrastructure(file_path)) {
    const threshold = NORMAL_THRESHOLD * 2;
    // Use relaxed threshold
  }

  // Normal validation for app code
  // ...
}
```

**Example**: [`tools/hooks/performance-guardian.js`](../../../tools/hooks/performance-guardian.js)

### 4. Scoring System

For complex validation with multiple factors:

```javascript
function scoreBasedValidation(hookData, runner) {
  const { prompt, tool_input } = hookData;
  let score = 0;

  const SCORING_FACTORS = {
    hasContext: 3,
    hasRequirements: 2,
    hasReferences: 2,
    clearObjective: 3,
  };

  // Calculate score
  if (prompt.includes("@") || prompt.includes("based on")) {
    score += SCORING_FACTORS.hasContext;
  }

  // Check against threshold
  const threshold = tool_name === "Edit" ? 10 : 6;

  if (score < threshold) {
    return runner.block(
      `❌ Insufficient context (${score}/${threshold})\n` +
        `✅ Include architectural context and requirements`,
    );
  }

  return runner.allow();
}
```

**Example**: [`tools/hooks/context-validator.js`](../../../tools/hooks/context-validator.js)

### 5. Security Scanning

Pattern-based security vulnerability detection:

```javascript
function securityScan(hookData, runner) {
  const { content = "", new_string = "" } = hookData.tool_input;
  const combinedContent = `${content} ${new_string}`;

  const issues = [];

  const SECURITY_PATTERNS = {
    xss: {
      pattern: /innerHTML\s*=.*[+`$]/gi,
      message: "XSS vulnerability",
      suggestion: "Use textContent or DOMPurify",
    },
    sqlInjection: {
      pattern: /query\s*\(\s*['"`].*\+/gi,
      message: "SQL injection risk",
      suggestion: "Use parameterized queries",
    },
  };

  for (const [type, config] of Object.entries(SECURITY_PATTERNS)) {
    if (config.pattern.test(combinedContent)) {
      issues.push({
        type,
        message: config.message,
        suggestion: config.suggestion,
      });
    }
  }

  if (issues.length > 0) {
    const report = issues
      .map((i) => `🔴 ${i.message}\n✅ ${i.suggestion}`)
      .join("\n\n");

    return runner.block(`🔒 Security issues detected:\n\n${report}`);
  }

  return runner.allow();
}
```

**Example**: [`tools/hooks/security-scan.js`](../../../tools/hooks/security-scan.js)

### 6. PostToolUse Modification

Auto-fixing issues after operations:

```javascript
function autoFix(hookData, runner) {
  const output = hookData.tool_output;

  if (!output || !output.content) {
    return runner.allow();
  }

  let { content } = output;
  let modified = false;

  // Fix patterns
  const fixes = {
    "console.log": "logger.info",
    "console.error": "logger.error",
    "console.warn": "logger.warn",
  };

  for (const [pattern, replacement] of Object.entries(fixes)) {
    const regex = new RegExp(pattern.replace(".", "\\."), "g");
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  }

  if (modified) {
    // Add import if needed
    if (!content.includes("logger")) {
      content = `import { logger } from '@/lib/logger';\n\n${content}`;
    }

    return runner.modify({ content });
  }

  return runner.allow();
}
```

**Example**: [`tools/hooks/fix-console-logs.js`](../../../tools/hooks/fix-console-logs.js)

## Error Message Formatting

### Standard Format

```javascript
function formatBlockMessage(issue) {
  return [
    `❌ ${issue.problem}`,
    "",
    issue.location && `📍 Found at: ${issue.location}`,
    issue.details && `🔍 Details: ${issue.details}`,
    "",
    `💡 ${issue.context}`,
    `✅ ${issue.suggestion}`,
  ]
    .filter(Boolean)
    .join("\n");
}
```

### Icons Reference

- ❌ Problem/Error
- ✅ Solution/Suggestion
- 🚫 Blocked/Forbidden
- 📍 Location
- 💡 Tip/Context
- 🔍 Details
- ⚡ Performance
- 🔒 Security
- 📐 Architecture
- 🎯 Scope/Target

## Performance Patterns

### 1. Lazy Pattern Compilation

```javascript
// Compile patterns once at module level
const COMPLEX_PATTERNS = [/pattern1/gi, /pattern2/gi, /pattern3/gi].map(
  (p) => ({ regex: p, source: p.source }),
);

// Combine for efficiency
const COMBINED_PATTERN = new RegExp(
  COMPLEX_PATTERNS.map((p) => p.source).join("|"),
  "gi",
);

function hookLogic(hookData, runner) {
  if (COMBINED_PATTERN.test(hookData.tool_input.content)) {
    // Detailed check to find which pattern matched
  }
}
```

### 2. Caching Results

```javascript
const cache = new Map();

function expensiveOperation(content) {
  const key = createHash(content);

  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = performAnalysis(content);
  cache.set(key, result);

  // Limit cache size
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }

  return result;
}
```

## Testing Patterns

### Hook Test Structure

```javascript
const { runHook } = require("./test-helpers");

describe("my-hook", () => {
  it("should block invalid pattern", async () => {
    const input = {
      tool_input: {
        file_path: "test.js",
        content: "invalid pattern here",
      },
    };

    const { exitCode, stderr } = await runHook("my-hook.js", input);

    expect(exitCode).toBe(2);
    expect(stderr).toContain("expected error message");
  });

  it("should allow valid pattern", async () => {
    const input = {
      tool_input: {
        file_path: "test.js",
        content: "valid code",
      },
    };

    const { exitCode } = await runHook("my-hook.js", input);

    expect(exitCode).toBe(0);
  });
});
```

## Debug Patterns

### Debug Logging

```javascript
const DEBUG = process.env.HOOK_DEBUG === "true";

function debug(...args) {
  if (DEBUG) {
    console.error(
      `[${new Date().toISOString()}] ${path.basename(__filename)}:`,
      ...args,
    );
  }
}

function hookLogic(hookData, runner) {
  debug("Input:", JSON.stringify(hookData, null, 2));

  // Validation logic
  const decision = shouldBlock ? "BLOCK" : "ALLOW";
  debug("Decision:", decision, "Reason:", reason);

  return shouldBlock ? runner.block(message) : runner.allow();
}
```

### Performance Tracking

```javascript
function hookLogic(hookData, runner) {
  const start = process.hrtime();

  // Hook logic here

  const [seconds, nanoseconds] = process.hrtime(start);
  const ms = seconds * 1000 + nanoseconds / 1000000;

  if (process.env.HOOK_TIMING) {
    console.error(`[TIMING] ${path.basename(__filename)}: ${ms.toFixed(2)}ms`);
  }

  return result;
}
```

## Integration with Shared Libraries

### Using Multiple Utilities

```javascript
const {
  HookRunner,
  FileAnalyzer,
  PatternLibrary,
  PerformanceAnalyzer,
} = require("./lib");

function complexHook(hookData, runner) {
  const { file_path, content } = hookData.tool_input;

  // Use FileAnalyzer
  if (FileAnalyzer.isDocumentation(file_path)) {
    return runner.allow();
  }

  // Use PatternLibrary
  if (PatternLibrary.hasEnterprisePattern(content)) {
    return runner.block("Enterprise patterns not allowed");
  }

  // Use PerformanceAnalyzer
  const analyzer = new PerformanceAnalyzer();
  const stats = analyzer.calculateStats(content);

  if (stats.complexity > 50) {
    return runner.block(`Complexity too high: ${stats.complexity}`);
  }

  return runner.allow();
}

HookRunner.create("complex-hook", complexHook);
```

## Summary

These patterns form the foundation of the Claude Code hooks system:

1. **Use HookRunner.create()** for consistent structure
2. **Exit early** for non-applicable cases
3. **Leverage shared utilities** for common operations
4. **Format errors helpfully** with problems and solutions
5. **Track performance** in development
6. **Test thoroughly** with realistic scenarios

All patterns are battle-tested in the 20 production hooks.

---

_For complete implementations, see [`tools/hooks/`](../../../tools/hooks/)_  
_For creating new hooks, see [Development Guide](05-hooks-development.md)_
