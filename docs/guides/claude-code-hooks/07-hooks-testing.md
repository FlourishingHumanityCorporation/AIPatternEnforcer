```markdown
# Claude Code Hooks Testing Guide

**Last Updated**: 2025-07-16
**System Version**: 4.0 (Categorized Parallel Architecture)
**Framework**: HookRunner Base Class + Jest Test Suite
**Active Hooks**: 41 hooks across 9 categories

## Overview

This guide covers comprehensive testing strategies for Claude Code
hooks, including unit testing, integration testing, performance
benchmarking, and automated validation. The v4.0 architecture provides
a standardized testing framework built on HookRunner base class
patterns with parallel execution support across 9 specialized categories.

## Table of Contents

- [Testing Architecture](#testing-architecture)
- [Core Testing Principles](#core-testing-principles)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Performance Benchmarking](#performance-benchmarking)
- [Parallel Execution Testing](#parallel-execution-testing)
- [Folder-Based Control Testing](#folder-based-control-testing)
- [End-to-End (E2E) Testing](#end-to-end-e2e-testing)
- [Test-Driven Development (TDD)](#test-driven-development-tdd)
- [Continuous Integration (CI)](#continuous-integration-ci)

## Testing Architecture

### Test Types

| Test Type       | Directory                | Purpose                                  |
| --------------- | ------------------------ | ---------------------------------------- |
| **Unit**        | `__tests__/unit/`        | Test individual hooks in isolation       |
| **Integration** | `__tests__/integration/` | Test hook chains and family interactions |
| **Performance** | `__tests__/performance/` | Benchmark execution speed and memory     |
| **E2E**         | `__tests__/e2e/`         | Validate real-world AI scenarios         |

### Testing Framework Structure

The hooks testing system is organized around the v4.0 categorized parallel architecture:
```

tools/hooks/**tests**/
├── unit/ # Individual hook tests (41 hooks)
│ ├── ai-patterns/
│ │ ├── prevent-improved-files.test.js
│ │ ├── context-validator.test.js
│ │ └── streaming-pattern-enforcer.test.js
│ ├── architecture/
│ │ ├── architecture-validator.test.js
│ │ └── test-location-enforcer.test.js
│ ├── security/
│ │ ├── security-scan.test.js
│ │ └── scope-limiter.test.js
│ └── [category]/ # 9 categories total
├── integration/ # Cross-hook testing
│ ├── parallel-execution.test.js
│ ├── folder-control.test.js
│ ├── family-timeout.test.js
│ └── category-interaction.test.js
├── performance/ # Performance benchmarks
│ ├── parallel-execution-speed.test.js
│ ├── category-performance.test.js
│ └── hook-optimization.test.js
├── e2e/ # End-to-end scenario tests
│ ├── common-ai-mistakes.test.js
│ └── enterprise-pattern-blocking.test.js
└── test-utils.js # Shared testing utilities

````
### Test Utilities (`test-utils.js`)
Provides `runHook` helper function to simulate hook execution:
```javascript
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runHook(hookFile, inputJson) {
  return new Promise((resolve) => {
    const child = exec(`node ${hookFile}`, (error, stdout, stderr) => {
      resolve({
        exitCode: error ? error.code : 0,
        stdout,
        stderr,
      });
    });
    child.stdin.write(JSON.stringify(inputJson));
    child.stdin.end();
  });
}

// CRITICAL: Environment variable testing utilities
function setEnvForTesting(envVars) {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(envPath, envContent);
}

function clearTestEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    fs.unlinkSync(envPath);
  }
}

// Environment variable test helper
function testWithEnv(envVars, testFn) {
  return async () => {
    setEnvForTesting(envVars);
    try {
      await testFn();
    } finally {
      clearTestEnv();
    }
  };
}

module.exports = { runHook, setEnvForTesting, clearTestEnv, testWithEnv };
````

### 🚨 CRITICAL: Environment Variable Testing Requirements

**❌ WRONG WAY** (Command-line env vars don't work with hooks):

```javascript
// This DOES NOT work - hooks ignore command-line environment variables
process.env.HOOK_AI_PATTERNS = 'false';
HOOK_DEVELOPMENT=false node tools/hooks/ai-patterns/prevent-improved-files.js
```

**✅ CORRECT WAY** (Always modify .env file):

```javascript
// This works - hooks load environment variables from .env file
const { setEnvForTesting, clearTestEnv } = require("./test-utils");

beforeEach(() => {
  // Set environment variables in .env file
  setEnvForTesting({
    HOOK_DEVELOPMENT: "false",
    HOOK_AI_PATTERNS: "true",
    HOOK_SECURITY: "true",
  });
});

afterEach(() => {
  // Clean up .env file
  clearTestEnv();
});
```

## Core Testing Principles

All tests follow these standards:

1. **Fail-Open Testing**: Verify hooks allow operations when they error
2. **Performance Requirements**: Tests must verify <5s total execution for parallel system
3. **Input Validation**: Test malformed JSON handling
4. **Exit Code Compliance**: Verify 0=allow, 2=block pattern
5. **Family-Based Testing**: Test timeout management by hook family
6. **Parallel Execution Testing**: Verify concurrent hook execution and fallback mechanisms
7. **Folder-Based Control Testing**: Test environment variable hook filtering
8. **Category Testing**: Test hooks by their 9 specialized categories

---

## Unit Testing

### Purpose

Verify a single hook's logic in isolation.

### Example: `security-scan.test.js`

```javascript
const { runHook } = require("../../test-utils");

describe("security/security-scan.js", () => {
  it("should block content with XSS vulnerability", async () => {
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "components/Button.tsx",
        content: "el.innerHTML = userData;",
      },
    };
    const { exitCode, stderr } = await runHook(
      "security/security-scan.js",
      input,
    );
    expect(exitCode).toBe(2);
    expect(stderr).toContain("XSS vulnerability");
  });

  it("should allow sanitized content", async () => {
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "components/Button.tsx",
        content: "el.textContent = userData;",
      },
    };
    const { exitCode } = await runHook("security/security-scan.js", input);
    expect(exitCode).toBe(0);
  });

  it("should respect HOOK_SECURITY environment variable", async () => {
    // CRITICAL: Must modify .env file, not process.env
    setEnvForTesting({
      HOOK_DEVELOPMENT: "false",
      HOOK_SECURITY: "false",
    });

    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "components/Button.tsx",
        content: "el.innerHTML = userData;",
      },
    };
    const { exitCode } = await runHook("security/security-scan.js", input);
    expect(exitCode).toBe(0); // Should be bypassed

    clearTestEnv();
  });
});
```

---

## Integration Testing

### Purpose

Verify that hooks work correctly together in parallel execution chains.

### Example: `parallel-execution.test.js`

```javascript
const { runHook } = require("../test-utils");

describe("Parallel Hook Execution", () => {
  it("should execute hooks in parallel with proper priority", async () => {
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "test_improved.js",
        content: "const key = '...' // also setup Kubernetes",
      },
    };

    const startTime = Date.now();
    const result = await runHook("pre-tool-use-parallel.js", input);
    const executionTime = Date.now() - startTime;

    // Should block due to improved filename (critical priority)
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Don't create test_improved.js");

    // Parallel execution should be faster than sequential
    expect(executionTime).toBeLessThan(5000); // <5s for full chain
  });

  it("should handle fallback to sequential execution", async () => {
    // Mock a scenario where parallel execution fails
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "test.js",
        content: "console.log('test');",
      },
    };

    const result = await runHook("pre-tool-use-parallel.js", input);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain("fallback"); // Should indicate fallback usage
  });
});
```

---

## Performance Benchmarking

### Purpose

Ensure hooks meet performance targets (<50ms individual, <5s parallel chain).

### Example: `parallel-execution-speed.test.js`

```javascript
const { PerformanceAnalyzer } = require("../../lib");

describe("Parallel Hook Performance", () => {
  it("full parallel chain should execute under 5s", async () => {
    const analyzer = new PerformanceAnalyzer();
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "components/Button.tsx",
        content:
          "export default function Button() { return <button>Click</button>; }",
      },
    };

    analyzer.start();
    await runHook("pre-tool-use-parallel.js", input);
    const duration = analyzer.end();

    expect(duration).toBeLessThan(5000); // <5s for full parallel chain
  });

  it("individual hook should execute under 50ms", async () => {
    const analyzer = new PerformanceAnalyzer();
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "components/Button.tsx",
        content: "test content",
      },
    };

    analyzer.start();
    await runHook("ai-patterns/context-validator.js", input);
    const duration = analyzer.end();

    expect(duration).toBeLessThan(50);
  });

  it("should track performance across categories", async () => {
    const categories = ["ai-patterns", "security", "validation", "cleanup"];
    const results = {};

    for (const category of categories) {
      const analyzer = new PerformanceAnalyzer();
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "test.js",
          content: "console.log('test');",
        },
      };

      analyzer.start();
      // Test category-specific hooks
      const duration = analyzer.end();
      results[category] = duration;
    }

    // Verify all categories perform within acceptable ranges
    Object.values(results).forEach((duration) => {
      expect(duration).toBeLessThan(100); // Category-specific performance
    });
  });
});
```

---

## Parallel Execution Testing

### Purpose

Test the parallel execution system and fallback mechanisms.

### Example: `parallel-execution.test.js`

```javascript
const { runHook } = require("../test-utils");

describe("Parallel Execution System", () => {
  it("should execute hooks in parallel with proper priority ordering", async () => {
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "test_improved.js", // Will trigger critical priority hook
        content: 'const auth = require("auth0"); // Enterprise pattern',
      },
    };

    const startTime = Date.now();
    const result = await runHook("pre-tool-use-parallel.js", input);
    const executionTime = Date.now() - startTime;

    // Should block due to improved filename (critical priority wins)
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Don't create test_improved.js");

    // Parallel execution should be faster than sequential
    expect(executionTime).toBeLessThan(5000);
  });

  it("should handle parallel execution failures gracefully", async () => {
    // Mock a scenario where parallel execution fails
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "test.js",
        content: 'console.log("test");',
      },
    };

    const result = await runHook("pre-tool-use-parallel.js", input);

    // Should fallback to sequential or emergency mode
    expect(result.exitCode).toBe(0); // Should allow operation
    expect(result.stderr).toMatch(/fallback|emergency/i);
  });

  it("should respect family-based timeout management", async () => {
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "test.js",
        content: 'const largeContent = "x".repeat(100000);', // Large content
      },
    };

    const startTime = Date.now();
    const result = await runHook("pre-tool-use-parallel.js", input);
    const executionTime = Date.now() - startTime;

    // Should complete within overall timeout
    expect(executionTime).toBeLessThan(10000); // 10s max
    expect(result.exitCode).toBeOneOf([0, 2]); // Should return valid exit code
  });
});
```

---

## Folder-Based Control Testing

### Purpose

Test environment variable-based hook filtering by category.

### Example: `folder-control.test.js`

```javascript
const { runHook } = require("../test-utils");

describe("Folder-Based Hook Control", () => {
  beforeEach(() => {
    // CRITICAL: Clean .env file before each test
    clearTestEnv();
  });

  afterEach(() => {
    // CRITICAL: Clean .env file after each test
    clearTestEnv();
  });

  it("should bypass all hooks when HOOK_DEVELOPMENT=true", async () => {
    // CRITICAL: Must modify .env file, not process.env
    setEnvForTesting({
      HOOK_DEVELOPMENT: "true",
    });

    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "test_improved.js", // Should normally be blocked
        content: "el.innerHTML = userData;", // Should normally be blocked
      },
    };

    const result = await runHook("pre-tool-use-parallel.js", input);
    expect(result.exitCode).toBe(0); // Should be allowed
  });

  it("should respect category-specific controls", async () => {
    // CRITICAL: Must modify .env file, not process.env
    setEnvForTesting({
      HOOK_DEVELOPMENT: "false",
      HOOK_AI_PATTERNS: "false", // Disable AI patterns
      HOOK_SECURITY: "true", // Keep security enabled
    });

    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "test_improved.js", // AI patterns disabled, should pass
        content: "el.innerHTML = userData;", // Security enabled, should block
      },
    };

    const result = await runHook("pre-tool-use-parallel.js", input);
    expect(result.exitCode).toBe(2); // Should block due to security
    expect(result.stderr).toContain("Security"); // Should mention security issue
    expect(result.stderr).not.toContain("improved"); // Should not mention filename
  });

  it("should test each category independently", async () => {
    const categories = [
      "AI_PATTERNS",
      "ARCHITECTURE",
      "CLEANUP",
      "CONTEXT",
      "IDE",
      "LOCAL_DEV",
      "PERFORMANCE",
      "PROJECT_BOUNDARIES",
      "PROMPT",
      "SECURITY",
      "VALIDATION",
      "WORKFLOW",
    ];

    for (const category of categories) {
      // CRITICAL: Must modify .env file for each test
      const envVars = { HOOK_DEVELOPMENT: "false" };
      for (const cat of categories) {
        envVars[`HOOK_${cat}`] = cat === category ? "true" : "false";
      }
      setEnvForTesting(envVars);

      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "test.js",
          content: 'console.log("test");',
        },
      };

      const result = await runHook("pre-tool-use-parallel.js", input);
      expect(result.exitCode).toBeOneOf([0, 2]);

      // Clean up after each category test
      clearTestEnv();
    }
  });
});
```

---

## End-to-End (E2E) Testing

### Purpose

Simulate real-world developer scenarios to validate overall system effectiveness.

### Example: `common-ai-mistakes.test.js`

```javascript
const { runHook } = require("../test-utils");

describe("Real-World AI Scenarios", () => {
  it("should prevent AI from creating a _v2 file with security issues", async () => {
    const scenarioInput = {
      tool_name: "Write",
      tool_input: {
        file_path: "component_v2.js",
        content: "el.innerHTML = userData;",
      },
    };

    // Test full parallel chain
    const result = await runHook("pre-tool-use-parallel.js", scenarioInput);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Don't create component_v2.js");
  });

  it("should handle complex multi-violation scenarios", async () => {
    const scenarioInput = {
      tool_name: "Write",
      tool_input: {
        file_path: "App.tsx", // Root level (should be blocked)
        content: `
          import { Auth0Provider } from '@auth0/nextjs-auth0'; // Enterprise pattern
          
          function App() {
            const userInput = getUserInput();
            document.getElementById('content').innerHTML = userInput; // XSS vulnerability
            return <div>App</div>;
          }
        `,
      },
    };

    const result = await runHook("pre-tool-use-parallel.js", scenarioInput);
    expect(result.exitCode).toBe(2);
    // Should block on first critical violation (likely root directory)
    expect(result.stderr).toMatch(/root|enterprise|security/i);
  });
});
```

## Test-Driven Development (TDD)

When creating a new hook:

1. **Write a failing test**: Define the desired behavior in a test file.
2. **Write the hook code**: Implement the simplest code to make the test pass.
3. **Refactor**: Clean up the code while ensuring tests still pass.

## Continuous Integration (CI)

All tests are run automatically on every commit using GitHub Actions:

```yaml
# .github/workflows/hooks-ci.yml
name: Hook System CI
on: [push, pull_request]
jobs:
  test-hooks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install

      # Test individual hook categories
      - name: Test AI Patterns hooks
        run: npm test tools/hooks/ai-patterns/__tests__/

      - name: Test Security hooks
        run: npm test tools/hooks/security/__tests__/

      - name: Test Project Boundaries hooks
        run: npm test tools/hooks/project-boundaries/__tests__/

      # Test parallel execution system
      - name: Test Parallel Execution
        run: npm test tools/hooks/__tests__/parallel-execution.test.js

      # Test folder-based controls
      - name: Test Folder Control System
        run: npm test tools/hooks/__tests__/folder-control.test.js

      # Test performance requirements
      - name: Test Hook Performance
        run: npm test tools/hooks/__tests__/performance/

      # Test full integration
      - name: Test Complete Hook System
        run: npm test tools/hooks/__tests__/

      # Generate coverage report
      - name: Generate Coverage
        run: npm run test:coverage -- tools/hooks/

      # Performance benchmarking
      - name: Performance Benchmark
        run: npm run test:performance -- tools/hooks/
```

### Test Categories and Coverage

The testing system covers all 41 active hooks across 9 categories:

| Category           | Hook Count | Unit Tests | Integration Tests | Performance Tests |
| ------------------ | ---------- | ---------- | ----------------- | ----------------- |
| AI Patterns        | 3          | ✅         | ✅                | ✅                |
| Architecture       | 2          | ✅         | ✅                | ✅                |
| Cleanup            | 3          | ✅         | ✅                | ✅                |
| Context            | 4          | ✅         | ✅                | ✅                |
| IDE                | 4          | ✅         | ✅                | ✅                |
| Local Dev          | 2          | ✅         | ✅                | ✅                |
| Performance        | 2          | ✅         | ✅                | ✅                |
| Project Boundaries | 3          | ✅         | ✅                | ✅                |
| Prompt             | 4          | ✅         | ✅                | ✅                |
| Security           | 2          | ✅         | ✅                | ✅                |
| Validation         | 4          | ✅         | ✅                | ✅                |
| Workflow           | 5          | ✅         | ✅                | ✅                |

### Running Tests

```bash
# Run all hook tests
npm test tools/hooks/__tests__/

# Run tests for specific categories
npm test tools/hooks/ai-patterns/__tests__/
npm test tools/hooks/security/__tests__/
npm test tools/hooks/project-boundaries/__tests__/

# Run integration tests
npm test tools/hooks/__tests__/integration/

# Run performance tests
npm test tools/hooks/__tests__/performance/

# Run folder control tests
npm test tools/hooks/__tests__/folder-control.test.js

# Run parallel execution tests
npm test tools/hooks/__tests__/parallel-execution.test.js

# Run with coverage
npm run test:coverage -- tools/hooks/

# Run performance benchmarks
npm run test:performance -- tools/hooks/
```

### 🚨 CRITICAL: Manual Testing with Environment Variables

When testing hooks manually, you MUST modify the .env file:

```bash
# ❌ WRONG - This doesn't work
HOOK_DEVELOPMENT=false node tools/hooks/ai-patterns/prevent-improved-files.js

# ✅ CORRECT - Edit .env file first
echo "HOOK_DEVELOPMENT=false" > .env
echo "HOOK_AI_PATTERNS=true" >> .env
echo '{"tool_input": {"file_path": "test_improved.js"}}' | node tools/hooks/ai-patterns/prevent-improved-files.js

# ✅ CORRECT - Test with category disabled
echo "HOOK_DEVELOPMENT=false" > .env
echo "HOOK_AI_PATTERNS=false" >> .env
echo '{"tool_input": {"file_path": "test_improved.js"}}' | node tools/hooks/ai-patterns/prevent-improved-files.js
# Expected: No output (hook bypassed)

# ✅ CORRECT - Test parallel executor
echo "HOOK_DEVELOPMENT=false" > .env
echo "HOOK_AI_PATTERNS=true" >> .env
echo '{"tool_input": {"file_path": "test_improved.js"}}' | node tools/hooks/pre-tool-use-parallel.js
# Expected: Error message blocking _improved file
```

### Environment Variable Testing Checklist

Before testing hooks:

- [ ] Create/modify .env file with required variables
- [ ] Do NOT use command-line environment variables
- [ ] Do NOT use process.env in tests
- [ ] Use setEnvForTesting() and clearTestEnv() utilities
- [ ] Clean up .env file after tests (clearTestEnv())
- [ ] Test both enabled and disabled states for each category

### Current .env File Configuration

The project's .env file currently has:

```bash
# Global controls (currently DISABLED - all hooks bypassed)
HOOK_DEVELOPMENT=true
HOOK_TESTING=true

# Folder controls (currently enabled but overridden by global controls)
HOOK_AI_PATTERNS=true
HOOK_SECURITY=true
HOOK_PROJECT_BOUNDARIES=true
# ... all other categories set to true
```

**To enable hooks for testing:**

```bash
# Edit .env file to enable hooks
HOOK_DEVELOPMENT=false  # Turn on hooks
HOOK_TESTING=false      # Turn on hooks
```

**Control Priority:**

1. `HOOK_DEVELOPMENT=true` → All hooks bypassed (current state)
2. `HOOK_TESTING=true` → All hooks bypassed (current state)
3. `HOOK_[CATEGORY]=false` → Only that category bypassed
4. Default → All hooks run
