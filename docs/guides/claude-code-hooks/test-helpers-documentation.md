# Claude Code Hook Test Helpers Documentation

**Last Updated**: 2025-07-15  
**File**: `tools/hooks/__tests__/test-helpers.js`  
**Purpose**: Utility functions for testing Claude Code hooks

## Overview

The test-helpers.js module provides essential utilities for testing Claude Code hooks in isolation, enabling comprehensive validation of hook behavior without requiring a full Claude Code session.

## Core Functions

### runHook(hookFile, inputJson)

Executes a hook with specified input and returns the result.

**Parameters**:

- `hookFile` (string): Name of the hook file (e.g., 'prevent-improved-files.js')
- `inputJson` (object): JSON input matching Claude Code hook schema

**Returns**: Promise resolving to object with:

- `exitCode` (number): 0 for allow, 2 for block
- `stdout` (string): Standard output from hook
- `stderr` (string): Standard error output (blocking messages)
- `error` (Error|null): Execution error if any

**Example**:

```javascript
const { runHook } = require("./test-helpers");

const result = await runHook("prevent-improved-files.js", {
  tool_input: {
    file_path: "component_improved.tsx",
    content: "export default function Component() {}",
  },
});

// Result:
// {
//   exitCode: 2,
//   stdout: '',
//   stderr: '❌ Please don\'t create component_improved.tsx\n✅ Edit the original file instead',
//   error: null
// }
```

### Implementation Details

```javascript
const { exec } = require("child_process");
const path = require("path");

function runHook(hookFile, inputJson) {
  return new Promise((resolve) => {
    const hookPath = path.join(__dirname, "..", hookFile);
    const child = exec(`node ${hookPath}`, (error, stdout, stderr) => {
      resolve({
        exitCode: error ? error.code : 0,
        stdout,
        stderr,
        error,
      });
    });

    child.stdin.write(JSON.stringify(inputJson));
    child.stdin.end();
  });
}
```

## Testing Patterns

### Basic Allow/Block Testing

```javascript
describe("security-scan", () => {
  it("should block XSS vulnerability", async () => {
    const { exitCode, stderr } = await runHook("security-scan.js", {
      tool_input: {
        content: "element.innerHTML = userInput;",
      },
    });

    expect(exitCode).toBe(2);
    expect(stderr).toContain("XSS vulnerability");
  });

  it("should allow safe code", async () => {
    const { exitCode } = await runHook("security-scan.js", {
      tool_input: {
        content: "element.textContent = userInput;",
      },
    });

    expect(exitCode).toBe(0);
  });
});
```

### Testing with Different Tool Names

```javascript
it("should apply different thresholds for Edit vs Write", async () => {
  // Test Write operation (lower threshold)
  const writeResult = await runHook("context-validator.js", {
    tool_name: "Write",
    tool_input: {
      file_path: "new-file.js",
      content: "minimal content",
    },
  });

  // Test Edit operation (higher threshold)
  const editResult = await runHook("context-validator.js", {
    tool_name: "Edit",
    tool_input: {
      file_path: "existing.js",
      old_string: "a",
      new_string: "b",
    },
  });

  expect(editResult.exitCode).toBe(2); // Edit needs more context
});
```

### Testing Error Messages

```javascript
it("should provide helpful error messages", async () => {
  const { stderr } = await runHook("enterprise-antibody.js", {
    tool_input: {
      content: 'import { SignIn } from "@clerk/nextjs";',
    },
  });

  // Check for problem description
  expect(stderr).toContain("❌");
  expect(stderr).toContain("Enterprise");

  // Check for solution
  expect(stderr).toContain("✅");
  expect(stderr).toContain("mockUser");
});
```

### Testing with Environment Variables

```javascript
it("should respect HOOKS_TESTING_MODE", async () => {
  // Save original value
  const originalMode = process.env.HOOKS_TESTING_MODE;

  try {
    // Enable testing mode
    process.env.HOOKS_TESTING_MODE = "true";

    const { exitCode } = await runHook("enterprise-antibody.js", {
      tool_input: {
        content: "firebase.auth()", // Normally blocked
      },
    });

    expect(exitCode).toBe(0); // Allowed in testing mode
  } finally {
    // Restore original value
    process.env.HOOKS_TESTING_MODE = originalMode;
  }
});
```

### Testing PostToolUse Hooks

```javascript
it("should modify content in PostToolUse", async () => {
  const { exitCode, stdout } = await runHook("fix-console-logs.js", {
    tool_output: {
      content: 'console.log("debug info");',
    },
  });

  expect(exitCode).toBe(0);

  // PostToolUse hooks output modifications to stdout
  const modifications = JSON.parse(stdout);
  expect(modifications.content).toContain("logger.info");
  expect(modifications.content).not.toContain("console.log");
});
```

### Performance Testing

```javascript
it("should execute within performance budget", async () => {
  const start = Date.now();

  await runHook("security-scan.js", {
    tool_input: {
      content: "large content string here...",
    },
  });

  const duration = Date.now() - start;
  expect(duration).toBeLessThan(50); // 50ms budget
});
```

### Testing Multiple Patterns

```javascript
describe("prevent-improved-files patterns", () => {
  const blockedPatterns = [
    "component_improved.tsx",
    "util_enhanced.js",
    "service_v2.ts",
    "helper_fixed.js",
  ];

  blockedPatterns.forEach((filename) => {
    it(`should block ${filename}`, async () => {
      const { exitCode } = await runHook("prevent-improved-files.js", {
        tool_input: { file_path: filename },
      });

      expect(exitCode).toBe(2);
    });
  });
});
```

## Advanced Testing Utilities

### Creating Test Fixtures

```javascript
// test-fixtures.js
const testFixtures = {
  enterprisePatterns: {
    auth: 'import { useAuth } from "@clerk/nextjs";',
    payment: 'const stripe = require("stripe")(key);',
    monitoring: 'Sentry.init({ dsn: "..." });',
  },

  securityVulnerabilities: {
    xss: "div.innerHTML = userInput;",
    sql: "db.query(`SELECT * FROM users WHERE id = ${id}`);",
    eval: "eval(userCode);",
  },

  validCode: {
    component:
      "export default function Button() { return <button>Click</button>; }",
    util: "export const formatDate = (date) => date.toISOString();",
  },
};

module.exports = testFixtures;
```

### Mock Input Builder

```javascript
class MockInputBuilder {
  constructor(toolName = "Write") {
    this.input = {
      tool_name: toolName,
      tool_input: {},
    };
  }

  withFile(filePath) {
    this.input.tool_input.file_path = filePath;
    return this;
  }

  withContent(content) {
    this.input.tool_input.content = content;
    return this;
  }

  withEdit(oldString, newString) {
    this.input.tool_input.old_string = oldString;
    this.input.tool_input.new_string = newString;
    return this;
  }

  withPrompt(prompt) {
    this.input.prompt = prompt;
    return this;
  }

  build() {
    return this.input;
  }
}

// Usage
const input = new MockInputBuilder("Edit")
  .withFile("component.tsx")
  .withEdit("old", "new")
  .withPrompt("Update component based on @design-system")
  .build();
```

### Batch Testing Helper

```javascript
async function testPatterns(hookName, patterns, expectedResult) {
  const results = await Promise.all(
    patterns.map(async (pattern) => {
      const { exitCode } = await runHook(hookName, {
        tool_input: { content: pattern },
      });
      return { pattern, exitCode };
    }),
  );

  const failures = results.filter((r) => r.exitCode !== expectedResult);

  if (failures.length > 0) {
    throw new Error(
      `Pattern test failures:\n${failures
        .map((f) => `  - "${f.pattern}" (got ${f.exitCode})`)
        .join("\n")}`,
    );
  }
}

// Usage
await testPatterns(
  "enterprise-antibody.js",
  ["firebase.auth()", "stripe.checkout.create()", "Auth0Client()"],
  2,
); // All should block
```

## Integration with Jest

### Custom Matchers

```javascript
// jest.setup.js
expect.extend({
  toAllowOperation(result) {
    const pass = result.exitCode === 0;
    return {
      pass,
      message: () =>
        pass
          ? `Expected hook to block but it allowed`
          : `Expected hook to allow but it blocked with: ${result.stderr}`,
    };
  },

  toBlockWithMessage(result, expectedMessage) {
    const blocked = result.exitCode === 2;
    const hasMessage = result.stderr.includes(expectedMessage);

    return {
      pass: blocked && hasMessage,
      message: () => {
        if (!blocked) return `Expected hook to block but it allowed`;
        if (!hasMessage)
          return `Expected message "${expectedMessage}" not found in: ${result.stderr}`;
        return `Hook blocked with expected message`;
      },
    };
  },
});

// Usage
const result = await runHook("security-scan.js", input);
expect(result).toBlockWithMessage("XSS vulnerability");
```

### Test Organization

```javascript
// __tests__/unit/[hook-name].test.js
describe("Hook: [hook-name]", () => {
  describe("blocking scenarios", () => {
    // Test cases that should block
  });

  describe("allowing scenarios", () => {
    // Test cases that should allow
  });

  describe("error messages", () => {
    // Test error message quality
  });

  describe("edge cases", () => {
    // Test edge cases and error handling
  });

  describe("performance", () => {
    // Test execution time
  });
});
```

## Debugging Test Failures

### Verbose Output

```javascript
it("should handle complex scenario", async () => {
  const input = {
    /* complex input */
  };
  const result = await runHook("complex-hook.js", input);

  // Log full result on failure
  if (result.exitCode !== 0) {
    console.log("Full result:", JSON.stringify(result, null, 2));
  }

  expect(result.exitCode).toBe(0);
});
```

### Environment Debugging

```javascript
beforeEach(() => {
  // Log environment for debugging
  console.log("Test environment:", {
    HOOKS_TESTING_MODE: process.env.HOOKS_TESTING_MODE,
    HOOK_DEBUG: process.env.HOOK_DEBUG,
    NODE_ENV: process.env.NODE_ENV,
  });
});
```

## Best Practices

1. **Test both positive and negative cases** - Ensure hooks allow valid patterns and block invalid ones

2. **Test error message quality** - Verify messages are helpful and include solutions

3. **Use realistic test data** - Test with actual code patterns users might write

4. **Test edge cases** - Empty strings, null values, malformed input

5. **Test performance** - Ensure hooks stay within budget

6. **Isolate tests** - Each test should be independent

7. **Use descriptive test names** - Make failures easy to understand

## Summary

The test-helpers.js utilities enable comprehensive testing of Claude Code hooks:

- **runHook()** - Core function for executing hooks with test input
- **Exit codes** - 0 for allow, 2 for block
- **Environment control** - Test with different configurations
- **Performance testing** - Ensure hooks meet speed requirements
- **Error validation** - Verify helpful error messages

These utilities form the foundation for the hook testing infrastructure, ensuring all 20 hooks work correctly and maintain high quality standards.

---

_For test examples, see [`tools/hooks/__tests__/`](../../../tools/hooks/__tests__/)_  
_For testing guide, see [Hook Testing Guide](../testing/hook-testing-guide.md)_
