```markdown
# Claude Code Hooks Development Guide

**Last Updated**: 2025-07-14
**System Version**: 3.0 (Consolidated Architecture)
**Framework**: HookRunner Base Class + Shared Utilities

## Overview

This guide covers developing custom Claude Code hooks using the v3.0
consolidated architecture. The system provides a HookRunner base class
and shared utilities library that eliminates boilerplate and ensures
consistent behavior across all hooks.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [HookRunner Architecture](#hookrunner-architecture)
- [Creating Your First Hook](#creating-your-first-hook)
- [Hook Development Patterns](#hook-development-patterns)
- [Shared Utilities Library](#shared-utilities-library)
- [Testing Custom Hooks](#testing-custom-hooks)
- [Performance Optimization](#performance-optimization)
- [Deployment and Configuration](#deployment-and-configuration)

## Development Environment Setup

### Prerequisites

- Node.js v20+
- npm v10+
- Claude Code CLI installed

### Project Structure
```

tools/hooks/
├── lib/ # Shared utilities library
│ ├── HookRunner.js # Base class for all hooks
│ ├── FileAnalyzer.js # File type detection and analysis
│ ├── PatternLibrary.js # Centralized regex patterns
│ ├── ErrorFormatter.js # Consistent error messaging
│ ├── PerformanceAnalyzer.js # Performance monitoring
│ └── index.js # Barrel export
├── **tests**/ # Test files
├── prevent-improved-files.js # Example hook
└── [your-hook].js # Your custom hook

````
### Setup Commands
```bash
# Navigate to the hooks directory
cd tools/hooks

# Install dependencies
npm install

# Run existing tests to verify setup
npm test __tests__/

# List available hooks for reference
ls -la *.js
````

## HookRunner Architecture

The HookRunner base class standardizes hook creation and execution.

### Key Features

- **Standardized input/output processing**: JSON parsing and error handling
- **Timeout management**: Family-based timeout enforcement
- **Fail-open architecture**: Operations proceed if hooks error
- **Debug mode**: Enhanced logging for troubleshooting
- **Local development focus**: Built-in execution time tracking

### Usage

```javascript
// tools/hooks/your-hook.js
const { HookRunner } = require("./lib");

function myHookLogic(hookData, runner) {
  // Your validation logic here
  // ...
  if (problemDetected) {
    return runner.block("❌ Problem detected\n✅ Suggestion for fix");
  }
  return runner.allow();
}

HookRunner.create("your-hook-name", myHookLogic);
```

## Creating Your First Hook

### 1. Create the Hook File

Create `tools/hooks/my-new-hook.js`

### 2. Implement the Logic

```javascript
// tools/hooks/my-new-hook.js
const { HookRunner } = require("./lib");

function preventTODOs(hookData, runner) {
  const { content, new_string } = hookData.tool_input;
  const combinedContent = `${content || ""} ${new_string || ""}`;

  if (combinedContent.toLowerCase().includes("todo:")) {
    return runner.block(
      "❌ 'TODO:' comments are not allowed.\n✅ Create a ticket instead.",
    );
  }
  return runner.allow();
}

HookRunner.create("prevent-todos-hook", preventTODOs);
```

### 3. Add to Configuration

Update `.claude/settings.json`:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [
        // ... other hooks
        {
          "type": "command",
          "command": "node tools/hooks/my-new-hook.js",
          "timeout": 1,
          "family": "pattern_enforcement",
          "priority": "low"
        }
      ]
    }
  ]
}
```

## Hook Development Patterns

### PreToolUse Hooks (Block/Allow)

- Analyze `hookData.tool_input` before execution
- Return `runner.block(message)` or `runner.allow()`
- Focus on validation and prevention
- Examples: `security-scan.js`, `scope-limiter.js`

### PostToolUse Hooks (Modify/Validate)

- Analyze `hookData.tool_output` or resulting files
- Can modify content with `runner.modify(modifications)`
- Can validate post-operation state
- Examples: `fix-console-logs.js`, `import-janitor.js`

## Shared Utilities Library

Located in `tools/hooks/lib/`, these utilities prevent code duplication.

- **FileAnalyzer**: Detect file types, parse content, analyze AST.
- **PatternLibrary**: Centralized repository for regex patterns.
- **ErrorFormatter**: Standardized error and feedback messages.
- **PerformanceAnalyzer**: Track execution time and memory usage.

### Example: Using PatternLibrary

```javascript
const { PatternLibrary } = require("./lib");

// ...
if (PatternLibrary.enterprise.test(content)) {
  return runner.block("🚫 Enterprise pattern detected");
}
```

## Testing Custom Hooks

### Unit Testing

Create `tools/hooks/__tests__/unit/my-new-hook.test.js`:

```javascript
const { runHook } = require("../test-utils");

describe("prevent-todos-hook", () => {
  it('should block content with "TODO:"', async () => {
    const input = {
      tool_input: { content: "function() { // TODO: fix this }" },
    };
    const { exitCode, stderr } = await runHook("my-new-hook.js", input);
    expect(exitCode).toBe(2);
    expect(stderr).toContain("❌ 'TODO:' comments are not allowed.");
  });

  it('should allow content without "TODO:"', async () => {
    const input = { tool_input: { content: "function() { /* all good */ }" } };
    const { exitCode } = await runHook("my-new-hook.js", input);
    expect(exitCode).toBe(0);
  });
});
```

### Integration Testing

Add cases to `tools/hooks/__tests__/integration/hook-chain.test.js` to verify interaction with other hooks.

## Performance Optimization

- **Use Shared Utilities**: Optimized for performance.
- **Avoid Heavy Computations**: Offload to asynchronous tasks if possible.
- **Cache Results**: Use in-memory caching for repeated lookups within a single run.
- **Benchmark Your Hook**: Use `PerformanceAnalyzer` to measure execution time.

## Deployment and Configuration

1. Ensure the hook script is in `tools/hooks/`.
2. Add the hook to the appropriate section in `.claude/settings.json`.
3. Set a reasonable `timeout` based on benchmarking.
4. Assign a `family` for group timeout management.
5. Set a `priority` to control execution order.
6. Restart the Claude Code session to load the new configuration.

## Implementation Patterns

### Early Exit Pattern

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

### Pattern Detection

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

### File Type Analysis

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

### Scoring System

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

### Security Scanning

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

### PostToolUse Modification

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

### Error Message Formatting

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

### Performance Patterns

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

```

```
