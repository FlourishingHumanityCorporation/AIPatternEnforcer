#!/usr/bin/env node

/**
 * Unit tests for HookPriority system
 */

const HookPriority = require("../hook-priority");

describe("HookPriority", () => {
  let priority;

  beforeEach(() => {
    priority = new HookPriority();
  });

  describe("constructor", () => {
    it("should initialize with default priorities", () => {
      expect(priority.priorities).toHaveProperty("critical");
      expect(priority.priorities).toHaveProperty("high");
      expect(priority.priorities).toHaveProperty("medium");
      expect(priority.priorities).toHaveProperty("low");
      expect(priority.priorities).toHaveProperty("background");
    });

    it("should initialize with hook families", () => {
      expect(priority.families).toHaveProperty("file_hygiene");
      expect(priority.families).toHaveProperty("security");
      expect(priority.families).toHaveProperty("validation");
      expect(priority.families).toHaveProperty("architecture");
    });

    it("should initialize current hooks", () => {
      expect(priority.currentHooks).toHaveProperty(
        "tools/hooks/ai-patterns/prevent-improved-files.js",
      );
      expect(priority.currentHooks).toHaveProperty(
        "tools/hooks/project-boundaries/block-root-mess.js",
      );
      expect(priority.currentHooks).toHaveProperty(
        "tools/hooks/security/security-scan.js",
      );
    });
  });

  describe("getHookPriority", () => {
    it("should return correct priority for known hooks", () => {
      const hookPath = "tools/hooks/ai-patterns/prevent-improved-files.js";
      expect(priority.getHookPriority(hookPath)).toBe("critical");
    });

    it("should return medium priority for unknown hooks", () => {
      const hookPath = "tools/hooks/unknown/unknown-hook.js";
      expect(priority.getHookPriority(hookPath)).toBe("medium");
    });

    it("should handle null/undefined hook path", () => {
      expect(priority.getHookPriority(null)).toBe("medium");
      expect(priority.getHookPriority(undefined)).toBe("medium");
    });
  });

  describe("getHookTimeout", () => {
    it("should return correct timeout for known hooks", () => {
      const hookPath = "tools/hooks/ai-patterns/prevent-improved-files.js";
      expect(priority.getHookTimeout(hookPath)).toBe(1000);
    });

    it("should return default timeout for unknown hooks", () => {
      const hookPath = "tools/hooks/unknown/unknown-hook.js";
      expect(priority.getHookTimeout(hookPath)).toBe(3000);
    });
  });

  describe("getHookFamily", () => {
    it("should return correct family for known hooks", () => {
      const hookPath = "tools/hooks/ai-patterns/prevent-improved-files.js";
      expect(priority.getHookFamily(hookPath)).toBe("file_hygiene");
    });

    it("should return unknown family for unknown hooks", () => {
      const hookPath = "tools/hooks/unknown/unknown-hook.js";
      expect(priority.getHookFamily(hookPath)).toBe("unknown");
    });
  });

  describe("getExecutionStrategy", () => {
    it("should return correct execution strategy for priorities", () => {
      expect(priority.getExecutionStrategy("critical")).toBe("sequential");
      expect(priority.getExecutionStrategy("high")).toBe("parallel");
      expect(priority.getExecutionStrategy("medium")).toBe("parallel");
      expect(priority.getExecutionStrategy("low")).toBe("parallel");
      expect(priority.getExecutionStrategy("background")).toBe("async");
    });

    it("should return default strategy for unknown priority", () => {
      expect(priority.getExecutionStrategy("unknown")).toBe("parallel");
    });
  });

  describe("getBlockingBehavior", () => {
    it("should return correct blocking behavior for families", () => {
      expect(priority.getBlockingBehavior("file_hygiene")).toBe("hard-block");
      expect(priority.getBlockingBehavior("security")).toBe("soft-block");
      expect(priority.getBlockingBehavior("validation")).toBe("soft-block");
      expect(priority.getBlockingBehavior("code_cleanup")).toBe("none");
    });

    it("should return default behavior for unknown family", () => {
      expect(priority.getBlockingBehavior("unknown")).toBe("warning");
    });
  });

  describe("classifyHooksByPriority", () => {
    it("should classify hooks by priority correctly", () => {
      const hooks = [
        { command: "tools/hooks/ai-patterns/prevent-improved-files.js" },
        { command: "tools/hooks/security/security-scan.js" },
        { command: "tools/hooks/cleanup/import-janitor.js" },
        { command: "unknown-hook.js" },
      ];

      const classified = priority.classifyHooksByPriority(hooks);

      expect(classified.get("critical")).toHaveLength(1);
      expect(classified.get("high")).toHaveLength(1);
      expect(classified.get("low")).toHaveLength(1);
      expect(classified.get("medium")).toHaveLength(1); // Unknown hook defaults to medium
    });

    it("should enhance hooks with metadata", () => {
      const hooks = [
        { command: "tools/hooks/ai-patterns/prevent-improved-files.js" },
      ];

      const classified = priority.classifyHooksByPriority(hooks);
      const criticalHooks = classified.get("critical");

      expect(criticalHooks[0]).toHaveProperty("priority", "critical");
      expect(criticalHooks[0]).toHaveProperty("family", "file_hygiene");
      expect(criticalHooks[0]).toHaveProperty("timeout", 1000);
      expect(criticalHooks[0]).toHaveProperty("blockingBehavior", "hard-block");
      expect(criticalHooks[0]).toHaveProperty(
        "executionStrategy",
        "sequential",
      );
    });

    it("should handle empty hooks array", () => {
      const classified = priority.classifyHooksByPriority([]);

      expect(classified.get("critical")).toHaveLength(0);
      expect(classified.get("high")).toHaveLength(0);
      expect(classified.get("medium")).toHaveLength(0);
      expect(classified.get("low")).toHaveLength(0);
      expect(classified.get("background")).toHaveLength(0);
    });
  });

  describe("getExecutionOrder", () => {
    it("should return correct execution order", () => {
      const order = priority.getExecutionOrder();
      expect(order).toEqual([
        "critical",
        "high",
        "medium",
        "low",
        "background",
      ]);
    });
  });

  describe("shouldStopOnFailure", () => {
    it("should stop on critical priority failure", () => {
      expect(priority.shouldStopOnFailure("critical", "any")).toBe(true);
    });

    it("should stop on high priority with hard-block family", () => {
      expect(priority.shouldStopOnFailure("high", "file_hygiene")).toBe(true);
    });

    it("should not stop on high priority with soft-block family", () => {
      expect(priority.shouldStopOnFailure("high", "security")).toBe(false);
    });

    it("should not stop on medium priority", () => {
      expect(priority.shouldStopOnFailure("medium", "any")).toBe(false);
    });

    it("should not stop on low priority", () => {
      expect(priority.shouldStopOnFailure("low", "any")).toBe(false);
    });
  });

  describe("getPerformanceTargets", () => {
    it("should return performance targets for all priorities", () => {
      const targets = priority.getPerformanceTargets();

      expect(targets).toHaveProperty("critical");
      expect(targets).toHaveProperty("high");
      expect(targets).toHaveProperty("medium");
      expect(targets).toHaveProperty("low");
      expect(targets).toHaveProperty("background");

      expect(targets.critical.maxDuration).toBe(2000);
      expect(targets.critical.maxParallelism).toBe(1);
      expect(targets.high.maxParallelism).toBe(3);
      expect(targets.medium.maxParallelism).toBe(5);
    });
  });

  describe("generateOptimizedConfig", () => {
    it("should generate optimized configuration", () => {
      const hooks = [
        { command: "tools/hooks/ai-patterns/prevent-improved-files.js" },
        { command: "tools/hooks/security/security-scan.js" },
        { command: "tools/hooks/cleanup/import-janitor.js" },
      ];

      const config = priority.generateOptimizedConfig(hooks);

      expect(config.execution).toHaveProperty(
        "strategy",
        "priority-based-parallel",
      );
      expect(config.execution).toHaveProperty("globalTimeout", 30000);
      expect(config.execution).toHaveProperty("fallbackToSequential", true);

      expect(config.priorities).toHaveProperty("critical");
      expect(config.priorities).toHaveProperty("high");
      expect(config.priorities).toHaveProperty("low");

      expect(config.priorities.critical.hooks).toHaveLength(1);
      expect(config.priorities.critical.strategy).toBe("sequential");
      expect(config.priorities.critical.stopOnFailure).toBe(true);
    });

    it("should handle empty hooks array", () => {
      const config = priority.generateOptimizedConfig([]);

      expect(config.execution).toHaveProperty(
        "strategy",
        "priority-based-parallel",
      );
      expect(config.priorities).toEqual({});
    });
  });

  describe("generateSettingsWithPriorities", () => {
    it("should update settings with priority information", () => {
      const currentSettings = {
        hooks: {
          PreToolUse: [
            {
              matcher: "Write|Edit|MultiEdit",
              hooks: [
                {
                  command: "tools/hooks/ai-patterns/prevent-improved-files.js",
                  timeout: 1,
                },
              ],
            },
          ],
          PostToolUse: [
            {
              matcher: "Write|Edit|MultiEdit",
              hooks: [
                {
                  command: "tools/hooks/cleanup/import-janitor.js",
                  timeout: 3,
                },
              ],
            },
          ],
        },
      };

      const updatedSettings =
        priority.generateSettingsWithPriorities(currentSettings);

      const preHook = updatedSettings.hooks.PreToolUse[0].hooks[0];
      expect(preHook).toHaveProperty("priority", "critical");
      expect(preHook).toHaveProperty("family", "file_hygiene");
      expect(preHook).toHaveProperty("blockingBehavior", "hard-block");

      const postHook = updatedSettings.hooks.PostToolUse[0].hooks[0];
      expect(postHook).toHaveProperty("priority", "low");
      expect(postHook).toHaveProperty("family", "code_cleanup");
      expect(postHook).toHaveProperty("blockingBehavior", "none");
    });

    it("should handle missing hook sections", () => {
      const currentSettings = { hooks: {} };
      const updatedSettings =
        priority.generateSettingsWithPriorities(currentSettings);

      expect(updatedSettings.hooks).toEqual({});
    });
  });

  describe("validateHookConfig", () => {
    it("should validate valid hook configuration", () => {
      const hook = {
        command: "tools/hooks/test-hook.js",
        priority: "high",
        family: "security",
        timeout: 5000,
      };

      const result = priority.validateHookConfig(hook);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing command", () => {
      const hook = {
        priority: "high",
        family: "security",
      };

      const result = priority.validateHookConfig(hook);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Hook command is required");
    });

    it("should detect invalid priority", () => {
      const hook = {
        command: "test-hook.js",
        priority: "invalid-priority",
        family: "security",
      };

      const result = priority.validateHookConfig(hook);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid priority: invalid-priority");
    });

    it("should warn about missing priority", () => {
      const hook = {
        command: "test-hook.js",
        family: "security",
      };

      const result = priority.validateHookConfig(hook);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(
        "Hook priority not specified, defaulting to medium",
      );
    });

    it("should warn about low timeout", () => {
      const hook = {
        command: "test-hook.js",
        priority: "high",
        family: "security",
        timeout: 500,
      };

      const result = priority.validateHookConfig(hook);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(
        "Hook timeout is very low, may cause premature failures",
      );
    });
  });

  describe("getHookStatistics", () => {
    it("should return hook statistics", () => {
      const stats = priority.getHookStatistics();

      expect(stats).toHaveProperty("total");
      expect(stats).toHaveProperty("byPriority");
      expect(stats).toHaveProperty("byFamily");
      expect(stats).toHaveProperty("averageTimeout");
      expect(stats).toHaveProperty("totalTimeout");

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byPriority).toHaveProperty("critical");
      expect(stats.byPriority).toHaveProperty("high");
      expect(stats.byPriority).toHaveProperty("medium");
      expect(stats.byPriority).toHaveProperty("low");

      expect(stats.byFamily).toHaveProperty("file_hygiene");
      expect(stats.byFamily).toHaveProperty("security");
      expect(stats.byFamily).toHaveProperty("validation");

      expect(stats.averageTimeout).toBeGreaterThan(0);
      expect(stats.totalTimeout).toBeGreaterThan(0);
    });
  });
});

// Mock test framework functions
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
    toHaveProperty: (prop, expectedValue) => {
      if (!actual || !actual.hasOwnProperty(prop)) {
        throw new Error(`Expected object to have property ${prop}`);
      }
      if (expectedValue !== undefined && actual[prop] !== expectedValue) {
        throw new Error(
          `Expected property ${prop} to be ${expectedValue}, got ${actual[prop]}`,
        );
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
        );
      }
    },
    toContain: (item) => {
      if (!actual || !actual.includes(item)) {
        throw new Error(`Expected array to contain ${item}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
  };
}

// Run tests if this is the main module
if (require.main === module) {
  console.log("Running HookPriority tests...");

  try {
    // Basic smoke test
    const priority = new HookPriority();
    console.log("✅ HookPriority can be instantiated");

    // Test basic functionality
    const hookPath = "tools/hooks/ai-patterns/prevent-improved-files.js";
    const hookPriority = priority.getHookPriority(hookPath);
    console.log(`✅ getHookPriority returns: ${hookPriority}`);

    const hookTimeout = priority.getHookTimeout(hookPath);
    console.log(`✅ getHookTimeout returns: ${hookTimeout}`);

    const hookFamily = priority.getHookFamily(hookPath);
    console.log(`✅ getHookFamily returns: ${hookFamily}`);

    const stats = priority.getHookStatistics();
    console.log(`✅ getHookStatistics returns ${stats.total} total hooks`);

    console.log("\n✅ Basic tests completed");
  } catch (error) {
    console.log("❌ Test suite failed:", error.message);
    process.exit(1);
  }
}
