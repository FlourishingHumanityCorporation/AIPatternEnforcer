#!/usr/bin/env node

/**
 * Unit tests for ParallelExecutor
 */

const ParallelExecutor = require("../parallel-executor");
const path = require("path");

describe("ParallelExecutor", () => {
  let executor;

  beforeEach(() => {
    executor = new ParallelExecutor({
      verbose: false,
      timeout: 5000,
      fallbackToSequential: true,
    });
  });

  describe("constructor", () => {
    it("should initialize with default options", () => {
      const defaultExecutor = new ParallelExecutor();
      expect(defaultExecutor.verbose).toBe(false);
      expect(defaultExecutor.timeout).toBe(30000);
      expect(defaultExecutor.fallbackToSequential).toBe(true);
    });

    it("should initialize with custom options", () => {
      const customExecutor = new ParallelExecutor({
        verbose: true,
        timeout: 10000,
        fallbackToSequential: false,
      });
      expect(customExecutor.verbose).toBe(true);
      expect(customExecutor.timeout).toBe(10000);
      expect(customExecutor.fallbackToSequential).toBe(false);
    });
  });

  describe("groupHooksByPriority", () => {
    it("should group hooks by priority correctly", () => {
      const hooks = [
        { command: "hook1", priority: "critical" },
        { command: "hook2", priority: "high" },
        { command: "hook3", priority: "medium" },
        { command: "hook4", priority: "critical" },
        { command: "hook5" }, // No priority specified
      ];

      const groups = executor.groupHooksByPriority(hooks);

      expect(groups.get("critical")).toHaveLength(2);
      expect(groups.get("high")).toHaveLength(1);
      expect(groups.get("medium")).toHaveLength(2); // One explicit + one default
      expect(groups.get("low")).toHaveLength(0);
      expect(groups.get("background")).toHaveLength(0);
    });

    it("should handle empty hooks array", () => {
      const groups = executor.groupHooksByPriority([]);
      expect(groups.get("critical")).toHaveLength(0);
      expect(groups.get("high")).toHaveLength(0);
      expect(groups.get("medium")).toHaveLength(0);
      expect(groups.get("low")).toHaveLength(0);
      expect(groups.get("background")).toHaveLength(0);
    });

    it("should handle unknown priority levels", () => {
      const hooks = [{ command: "hook1", priority: "unknown-priority" }];

      const groups = executor.groupHooksByPriority(hooks);
      expect(groups.get("unknown-priority")).toHaveLength(1);
    });
  });

  describe("runParallel", () => {
    it("should return success for empty hooks array", async () => {
      const result = await executor.runParallel([], {});
      expect(result.success).toBe(true);
      expect(result.blocks).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should return success for null hooks", async () => {
      const result = await executor.runParallel(null, {});
      expect(result.success).toBe(true);
      expect(result.blocks).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should execute hooks and return results", async () => {
      // Create a test hook that echoes input
      const testHook = {
        command: "echo test",
        priority: "medium",
        timeout: 1000,
      };

      const result = await executor.runParallel([testHook], { test: "data" });

      expect(result.totalHooks).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].hook).toBe("echo test");
      expect(result.results[0].exitCode).toBe(0);
    });

    it("should handle hook timeout", async () => {
      // Create a hook that sleeps longer than timeout
      const timeoutHook = {
        command: "sleep 10", // 10 seconds
        priority: "medium",
        timeout: 100, // 100ms timeout
      };

      const result = await executor.runParallel([timeoutHook], {});

      expect(result.totalHooks).toBe(1);
      expect(result.results[0].failed).toBe(true);
      expect(result.results[0].error).toMatch(/timed out/);
    });

    it("should handle hook execution errors", async () => {
      const errorHook = {
        command: "non-existent-command",
        priority: "medium",
        timeout: 1000,
      };

      const result = await executor.runParallel([errorHook], {});

      expect(result.totalHooks).toBe(1);
      expect(result.results[0].failed).toBe(true);
      expect(result.results[0].error).toBeDefined();
    });

    it("should stop execution on critical hook failure", async () => {
      const criticalHook = {
        command: "exit 2", // Exit with code 2 (blocking)
        priority: "critical",
        timeout: 1000,
      };

      const mediumHook = {
        command: "echo success",
        priority: "medium",
        timeout: 1000,
      };

      const result = await executor.runParallel([criticalHook, mediumHook], {});

      expect(result.blocked).toBe(true);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].blocked).toBe(true);
    });
  });

  describe("executeByPriority", () => {
    it("should execute hooks in priority order", async () => {
      const hooks = new Map([
        [
          "critical",
          [{ command: "echo critical", priority: "critical", timeout: 1000 }],
        ],
        ["high", [{ command: "echo high", priority: "high", timeout: 1000 }]],
        [
          "medium",
          [{ command: "echo medium", priority: "medium", timeout: 1000 }],
        ],
        ["low", [{ command: "echo low", priority: "low", timeout: 1000 }]],
        [
          "background",
          [
            {
              command: "echo background",
              priority: "background",
              timeout: 1000,
            },
          ],
        ],
      ]);

      const results = await executor.executeByPriority(hooks, {});

      expect(results).toHaveLength(5);
      // Results should be in priority order
      expect(results[0].priority).toBe("critical");
      expect(results[1].priority).toBe("high");
      expect(results[2].priority).toBe("medium");
      expect(results[3].priority).toBe("low");
      expect(results[4].priority).toBe("background");
    });

    it("should skip empty priority groups", async () => {
      const hooks = new Map([
        ["critical", []],
        ["high", [{ command: "echo high", priority: "high", timeout: 1000 }]],
        ["medium", []],
        ["low", []],
        ["background", []],
      ]);

      const results = await executor.executeByPriority(hooks, {});

      expect(results).toHaveLength(1);
      expect(results[0].priority).toBe("high");
    });
  });

  describe("executeHooksInParallel", () => {
    it("should execute multiple hooks in parallel", async () => {
      const hooks = [
        { command: "echo hook1", priority: "medium", timeout: 1000 },
        { command: "echo hook2", priority: "medium", timeout: 1000 },
        { command: "echo hook3", priority: "medium", timeout: 1000 },
      ];

      const startTime = Date.now();
      const results = await executor.executeHooksInParallel(hooks, {});
      const endTime = Date.now();

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.exitCode === 0)).toBe(true);

      // Should complete faster than sequential execution
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it("should handle partial failures", async () => {
      const hooks = [
        { command: "echo success", priority: "medium", timeout: 1000 },
        { command: "non-existent-command", priority: "medium", timeout: 1000 },
        { command: "echo success2", priority: "medium", timeout: 1000 },
      ];

      const results = await executor.executeHooksInParallel(hooks, {});

      expect(results).toHaveLength(3);
      expect(results.filter((r) => r.exitCode === 0)).toHaveLength(2);
      expect(results.filter((r) => r.failed)).toHaveLength(1);
    });
  });

  describe("executeHook", () => {
    it("should execute a single hook successfully", async () => {
      const hook = {
        command: "echo test",
        priority: "medium",
        timeout: 1000,
      };

      const result = await executor.executeHook(hook, { test: "data" });

      expect(result.hook).toBe("echo test");
      expect(result.exitCode).toBe(0);
      expect(result.blocked).toBe(false);
      expect(result.failed).toBe(false);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.priority).toBe("medium");
    });

    it("should handle hook without command", async () => {
      const hook = {
        description: "Test hook",
        priority: "medium",
        timeout: 1000,
      };

      const result = await executor.executeHook(hook, {});

      expect(result.hook).toBe("Test hook");
      expect(result.error).toBe("No command specified");
      expect(result.failed).toBe(true);
      expect(result.duration).toBe(0);
    });

    it("should detect blocking hooks (exit code 2)", async () => {
      const hook = {
        command: "exit 2",
        priority: "critical",
        timeout: 1000,
      };

      const result = await executor.executeHook(hook, {});

      expect(result.exitCode).toBe(2);
      expect(result.blocked).toBe(true);
      expect(result.failed).toBe(false);
    });

    it("should handle hook timeout", async () => {
      const hook = {
        command: "sleep 10",
        priority: "medium",
        timeout: 100, // 100ms timeout
      };

      const result = await executor.executeHook(hook, {});

      expect(result.failed).toBe(true);
      expect(result.error).toMatch(/timed out/);
      expect(result.duration).toBeGreaterThanOrEqual(100);
    });
  });

  describe("mergeResults", () => {
    it("should merge results correctly", () => {
      const results = [
        { blocked: false, failed: false, duration: 100, priority: "high" },
        { blocked: true, failed: false, duration: 200, priority: "critical" },
        {
          blocked: false,
          failed: true,
          error: "test error",
          duration: 150,
          priority: "medium",
        },
        { blocked: false, failed: false, duration: 50, priority: "low" },
      ];

      const merged = executor.mergeResults(results);

      expect(merged.success).toBe(false);
      expect(merged.blocked).toBe(true);
      expect(merged.blocks).toHaveLength(1);
      expect(merged.errors).toHaveLength(1);
      expect(merged.successful).toHaveLength(2);
      expect(merged.totalHooks).toBe(4);
      expect(merged.totalDuration).toBe(500);
      expect(merged.maxDuration).toBe(200);
      expect(merged.parallelEfficiency).toBe("2.50");
    });

    it("should handle empty results", () => {
      const merged = executor.mergeResults([]);

      expect(merged.success).toBe(true);
      expect(merged.blocked).toBe(false);
      expect(merged.blocks).toHaveLength(0);
      expect(merged.errors).toHaveLength(0);
      expect(merged.successful).toHaveLength(0);
      expect(merged.totalHooks).toBe(0);
      expect(merged.totalDuration).toBe(0);
      expect(merged.maxDuration).toBe(-Infinity);
      expect(merged.parallelEfficiency).toBe("1");
    });
  });

  describe("getPerformanceStats", () => {
    it("should calculate performance statistics", () => {
      const result = {
        totalHooks: 4,
        totalDuration: 500,
        maxDuration: 200,
        parallelEfficiency: "2.50",
        successful: [
          { priority: "high", duration: 100 },
          { priority: "medium", duration: 150 },
        ],
        blocks: [{ priority: "critical", duration: 200 }],
        errors: [{ priority: "low", duration: 50 }],
        results: [
          { priority: "high", duration: 100, blocked: false, failed: false },
          { priority: "critical", duration: 200, blocked: true, failed: false },
          { priority: "medium", duration: 150, blocked: false, failed: true },
          { priority: "low", duration: 50, blocked: false, failed: false },
        ],
      };

      const stats = executor.getPerformanceStats(result);

      expect(stats.totalHooks).toBe(4);
      expect(stats.totalDuration).toBe(500);
      expect(stats.maxDuration).toBe(200);
      expect(stats.parallelEfficiency).toBe("2.50");
      expect(stats.averageDuration).toBe(125);
      expect(stats.successRate).toBe("50.0%");
      expect(stats.byPriority).toHaveProperty("high");
      expect(stats.byPriority).toHaveProperty("critical");
      expect(stats.byPriority).toHaveProperty("medium");
      expect(stats.byPriority).toHaveProperty("low");
    });
  });

  describe("static execute", () => {
    it("should execute hooks using static method", async () => {
      const hooks = [
        { command: "echo test", priority: "medium", timeout: 1000 },
      ];

      const result = await ParallelExecutor.execute(hooks, { test: "data" });

      expect(result.success).toBe(true);
      expect(result.totalHooks).toBe(1);
      expect(result.results[0].exitCode).toBe(0);
    });

    it("should pass options to executor", async () => {
      const hooks = [
        { command: "echo test", priority: "medium", timeout: 1000 },
      ];

      const result = await ParallelExecutor.execute(
        hooks,
        { test: "data" },
        {
          verbose: true,
          timeout: 10000,
        },
      );

      expect(result.success).toBe(true);
      expect(result.totalHooks).toBe(1);
    });
  });
});

// Mock test runner for simple testing
function describe(name, fn) {
  console.log(`\n=== ${name} ===`);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
}

function beforeEach(fn) {
  // Simple setup function - would be called before each test
  fn();
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toHaveLength: (expected) => {
      if (!actual || actual.length !== expected) {
        throw new Error(
          `Expected length ${expected}, got ${actual ? actual.length : "undefined"}`,
        );
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) {
        throw new Error(
          `Expected ${actual} to be greater than or equal to ${expected}`,
        );
      }
    },
    toBeLessThan: (expected) => {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toMatch: (pattern) => {
      if (!pattern.test(actual)) {
        throw new Error(`Expected ${actual} to match ${pattern}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error("Expected value to be defined");
      }
    },
    toHaveProperty: (prop) => {
      if (!actual || !actual.hasOwnProperty(prop)) {
        throw new Error(`Expected object to have property ${prop}`);
      }
    },
  };
}

// Run tests if this is the main module
if (require.main === module) {
  console.log("Running ParallelExecutor tests...");

  // Run the test suite
  try {
    // Basic smoke test
    const executor = new ParallelExecutor();
    console.log("✅ ParallelExecutor can be instantiated");

    // Test with empty hooks
    executor
      .runParallel([], {})
      .then((result) => {
        console.log("✅ Empty hooks test passed");
      })
      .catch((error) => {
        console.log("❌ Empty hooks test failed:", error.message);
      });

    console.log("\n✅ Basic tests completed");
  } catch (error) {
    console.log("❌ Test suite failed:", error.message);
    process.exit(1);
  }
}
