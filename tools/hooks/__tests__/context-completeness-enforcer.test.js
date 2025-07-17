/**
 * Tests for Context Completeness Enforcer Hook
 */

const { execSync } = require("child_process");
const path = require("path");

describe("context-completeness-enforcer", () => {
  const hookPath = path.join(
    __dirname,
    "../context/context-completeness-enforcer.js",
  );

  function runHook(input) {
    try {
      const result = execSync(`node ${hookPath}`, {
        input: JSON.stringify(input),
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      return { exitCode: 0, stdout: result };
    } catch (error) {
      return {
        exitCode: error.status || 1,
        stderr: error.stderr?.toString() || "",
        stdout: error.stdout?.toString() || "",
      };
    }
  }

  beforeEach(() => {
    // Reset environment
    delete process.env.HOOKS_DISABLED;
    delete process.env.HOOK_CONTEXT;
  });

  it("should block operations without CLAUDE.md reference", () => {
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "components/Button.tsx",
        content: "export function Button() { return <button>Click</button> }",
      },
    };

    const result = runHook(input);

    expect(result.exitCode).toBe(2); // Blocked
    expect(result.stderr).toContain("Insufficient context");
    expect(result.stderr).toContain("npm run context");
  });

  it("should allow operations with CLAUDE.md reference", () => {
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "components/Button.tsx",
        content:
          "// Based on CLAUDE.md patterns\nexport function Button() {...}",
      },
      prompt: "Create button following CLAUDE.md guidelines",
    };

    const result = runHook(input);

    expect(result.exitCode).toBe(0); // Allowed
  });

  it("should have different thresholds for different operations", () => {
    const baseInput = {
      tool_input: {
        file_path: "components/Complex.tsx",
        content: "complex component code",
      },
    };

    // MultiEdit should have higher threshold
    const multiEditResult = runHook({ ...baseInput, tool_name: "MultiEdit" });
    expect(multiEditResult.exitCode).toBe(2);

    // Edit should have lower threshold
    const editResult = runHook({
      ...baseInput,
      tool_name: "Edit",
      prompt: "updating based on /components/Button.tsx pattern",
    });
    expect(editResult.exitCode).toBe(0);
  });

  it("should respect bypass environment variables", () => {
    process.env.HOOKS_DISABLED = "true";

    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "test.js",
        content: "no context",
      },
    };

    const result = runHook(input);
    expect(result.exitCode).toBe(0); // Bypassed
  });

  it("should complete within performance budget", () => {
    const input = {
      tool_name: "Write",
      tool_input: {
        file_path: "test.js",
        content: "test content",
      },
    };

    const startTime = Date.now();
    runHook(input);
    const executionTime = Date.now() - startTime;

    expect(executionTime).toBeLessThan(100); // Should be well under 50ms + overhead
  });
});
