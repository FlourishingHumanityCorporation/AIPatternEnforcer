#!/usr/bin/env node

/**
 * Hook Priority Classification System
 * Manages hook execution priorities and strategies for optimal performance
 */

class HookPriority {
  constructor() {
    // Priority levels with execution characteristics
    this.priorities = {
      critical: {
        level: 1,
        timeout: 2000,
        description:
          "Must complete successfully, blocks all subsequent hooks on failure",
        executionStrategy: "sequential",
        examples: [
          "prevent-improved-files",
          "block-root-mess",
          "meta-project-guardian",
        ],
      },
      high: {
        level: 2,
        timeout: 4000,
        description: "Important validations, can run in parallel within group",
        executionStrategy: "parallel",
        examples: [
          "security-scan",
          "enterprise-antibody",
          "architecture-validator",
        ],
      },
      medium: {
        level: 3,
        timeout: 3000,
        description: "Standard validations, parallel execution within group",
        executionStrategy: "parallel",
        examples: [
          "test-location-enforcer",
          "mock-data-enforcer",
          "streaming-pattern-enforcer",
        ],
      },
      low: {
        level: 4,
        timeout: 2000,
        description:
          "Nice-to-have validations, can be skipped under time pressure",
        executionStrategy: "parallel",
        examples: ["import-janitor", "docs-enforcer"],
      },
      background: {
        level: 5,
        timeout: 5000,
        description: "Non-blocking operations, run asynchronously",
        executionStrategy: "async",
        examples: ["performance-monitoring", "analytics-collection"],
      },
    };

    // Hook family classifications
    this.families = {
      file_hygiene: {
        priority: "critical",
        description: "Prevents file system pollution",
        blockingBehavior: "hard-block",
      },
      infrastructure_protection: {
        priority: "critical",
        description: "Protects meta-project infrastructure",
        blockingBehavior: "hard-block",
      },
      security: {
        priority: "high",
        description: "Security and vulnerability scanning",
        blockingBehavior: "soft-block",
      },
      validation: {
        priority: "high",
        description: "Data and context validation",
        blockingBehavior: "soft-block",
      },
      architecture: {
        priority: "high",
        description: "Architectural pattern enforcement",
        blockingBehavior: "soft-block",
      },
      pattern_enforcement: {
        priority: "medium",
        description: "Development pattern enforcement",
        blockingBehavior: "warning",
      },
      performance: {
        priority: "medium",
        description: "Performance monitoring and optimization",
        blockingBehavior: "warning",
      },
      testing: {
        priority: "medium",
        description: "Test-related validations",
        blockingBehavior: "warning",
      },
      code_cleanup: {
        priority: "low",
        description: "Code cleanup and formatting",
        blockingBehavior: "none",
      },
      documentation: {
        priority: "low",
        description: "Documentation enforcement",
        blockingBehavior: "none",
      },
      data_hygiene: {
        priority: "medium",
        description: "Database and data structure validation",
        blockingBehavior: "warning",
      },
    };

    // Current hook classifications based on settings.json
    this.currentHooks = this.initializeCurrentHooks();
  }

  /**
   * Initialize current hook classifications from existing settings
   */
  initializeCurrentHooks() {
    return {
      // PreToolUse hooks
      "tools/hooks/project-boundaries/meta-project-guardian.js": {
        priority: "critical",
        family: "infrastructure_protection",
        timeout: 2000,
        description:
          "Protects meta-project infrastructure from AI modifications",
      },
      "tools/hooks/ai-patterns/context-validator.js": {
        priority: "high",
        family: "validation",
        timeout: 3000,
        description: "Validates context efficiency and prevents pollution",
      },
      "tools/hooks/ai-patterns/prevent-improved-files.js": {
        priority: "critical",
        family: "file_hygiene",
        timeout: 1000,
        description: "Prevents duplicate file creation patterns",
      },
      "tools/hooks/security/scope-limiter.js": {
        priority: "high",
        family: "security",
        timeout: 4000,
        description: "Enforces project scope boundaries",
      },
      "tools/hooks/security/security-scan.js": {
        priority: "high",
        family: "security",
        timeout: 4000,
        description: "Scans for security vulnerabilities",
      },
      "tools/hooks/architecture/test-location-enforcer.js": {
        priority: "medium",
        family: "testing",
        timeout: 3000,
        description: "Enforces proper test file placement",
      },
      "tools/hooks/project-boundaries/enterprise-antibody.js": {
        priority: "high",
        family: "pattern_enforcement",
        timeout: 2000,
        description: "Blocks enterprise feature patterns",
      },
      "tools/hooks/architecture/architecture-validator.js": {
        priority: "high",
        family: "architecture",
        timeout: 3000,
        description: "Validates architectural patterns and AI integration",
      },
      "tools/hooks/local-dev/mock-data-enforcer.js": {
        priority: "medium",
        family: "pattern_enforcement",
        timeout: 2000,
        description: "Enforces mock data usage patterns",
      },
      "tools/hooks/local-dev/localhost-enforcer.js": {
        priority: "medium",
        family: "pattern_enforcement",
        timeout: 2000,
        description: "Enforces local development patterns",
      },
      "tools/hooks/performance/vector-db-hygiene.js": {
        priority: "medium",
        family: "data_hygiene",
        timeout: 2000,
        description: "Maintains vector database hygiene",
      },
      "tools/hooks/performance/performance-guardian.js": {
        priority: "high",
        family: "performance",
        timeout: 3000,
        description: "Comprehensive performance monitoring and optimization",
      },
      "tools/hooks/ai-patterns/streaming-pattern-enforcer.js": {
        priority: "medium",
        family: "pattern_enforcement",
        timeout: 2000,
        description: "Enforces proper streaming patterns",
      },
      "tools/hooks/cleanup/docs-enforcer.js": {
        priority: "medium",
        family: "documentation",
        timeout: 2000,
        description: "Enforces documentation standards and organization",
      },
      "tools/hooks/project-boundaries/block-root-mess.js": {
        priority: "critical",
        family: "file_hygiene",
        timeout: 2000,
        description: "Prevents root directory pollution",
      },

      // PostToolUse hooks
      "tools/hooks/cleanup/fix-console-logs.js": {
        priority: "low",
        family: "code_cleanup",
        timeout: 3000,
        description: "Fixes console.log statements",
      },
      "tools/hooks/validation/validate-prisma.js": {
        priority: "medium",
        family: "validation",
        timeout: 2000,
        description: "Validates Prisma schema changes",
      },
      "tools/hooks/validation/api-validator.js": {
        priority: "high",
        family: "validation",
        timeout: 4000,
        description: "Validates API patterns and structure",
      },
      "tools/hooks/validation/template-integrity-validator.js": {
        priority: "medium",
        family: "validation",
        timeout: 2000,
        description: "Validates template integrity",
      },
      "tools/hooks/cleanup/import-janitor.js": {
        priority: "low",
        family: "code_cleanup",
        timeout: 3000,
        description: "Cleans up unused imports",
      },
    };
  }

  /**
   * Get priority level for a hook
   * @param {string} hookPath - Path to the hook file
   * @returns {string} Priority level
   */
  getHookPriority(hookPath) {
    const hook = this.currentHooks[hookPath];
    return hook ? hook.priority : "medium";
  }

  /**
   * Get timeout for a hook
   * @param {string} hookPath - Path to the hook file
   * @returns {number} Timeout in milliseconds
   */
  getHookTimeout(hookPath) {
    const hook = this.currentHooks[hookPath];
    return hook ? hook.timeout : 3000;
  }

  /**
   * Get family for a hook
   * @param {string} hookPath - Path to the hook file
   * @returns {string} Hook family
   */
  getHookFamily(hookPath) {
    const hook = this.currentHooks[hookPath];
    return hook ? hook.family : "unknown";
  }

  /**
   * Get execution strategy for a priority level
   * @param {string} priority - Priority level
   * @returns {string} Execution strategy
   */
  getExecutionStrategy(priority) {
    return this.priorities[priority]?.executionStrategy || "parallel";
  }

  /**
   * Get blocking behavior for a family
   * @param {string} family - Hook family
   * @returns {string} Blocking behavior
   */
  getBlockingBehavior(family) {
    return this.families[family]?.blockingBehavior || "warning";
  }

  /**
   * Classify hooks by priority groups
   * @param {Array} hooks - Array of hook configurations
   * @returns {Map} Priority groups
   */
  classifyHooksByPriority(hooks) {
    const groups = new Map([
      ["critical", []],
      ["high", []],
      ["medium", []],
      ["low", []],
      ["background", []],
    ]);

    hooks.forEach((hook) => {
      const priority =
        this.getHookPriority(hook.command) || hook.priority || "medium";
      const family =
        this.getHookFamily(hook.command) || hook.family || "unknown";
      const timeout = this.getHookTimeout(hook.command) || hook.timeout || 3000;

      const enhancedHook = {
        ...hook,
        priority,
        family,
        timeout,
        blockingBehavior: this.getBlockingBehavior(family),
        executionStrategy: this.getExecutionStrategy(priority),
      };

      groups.get(priority).push(enhancedHook);
    });

    return groups;
  }

  /**
   * Get recommended execution order
   * @returns {Array} Priority levels in execution order
   */
  getExecutionOrder() {
    return ["critical", "high", "medium", "low", "background"];
  }

  /**
   * Should stop execution on hook failure
   * @param {string} priority - Hook priority
   * @param {string} family - Hook family
   * @returns {boolean} Whether to stop execution
   */
  shouldStopOnFailure(priority, family) {
    if (priority === "critical") return true;
    if (
      priority === "high" &&
      this.getBlockingBehavior(family) === "hard-block"
    )
      return true;
    return false;
  }

  /**
   * Get performance targets for priority levels
   * @returns {Object} Performance targets
   */
  getPerformanceTargets() {
    return {
      critical: { maxDuration: 2000, maxParallelism: 1 },
      high: { maxDuration: 4000, maxParallelism: 3 },
      medium: { maxDuration: 3000, maxParallelism: 5 },
      low: { maxDuration: 2000, maxParallelism: 10 },
      background: { maxDuration: 5000, maxParallelism: 10 },
    };
  }

  /**
   * Generate optimized hook configuration
   * @param {Array} hooks - Current hook configuration
   * @returns {Object} Optimized configuration
   */
  generateOptimizedConfig(hooks) {
    const priorityGroups = this.classifyHooksByPriority(hooks);
    const config = {
      execution: {
        strategy: "priority-based-parallel",
        globalTimeout: 30000,
        fallbackToSequential: true,
      },
      priorities: {},
    };

    // Configure each priority group
    for (const [priority, groupHooks] of priorityGroups) {
      if (groupHooks.length > 0) {
        config.priorities[priority] = {
          hooks: groupHooks,
          strategy: this.getExecutionStrategy(priority),
          timeout: this.priorities[priority].timeout,
          stopOnFailure: priority === "critical",
          parallelism: this.getPerformanceTargets()[priority].maxParallelism,
        };
      }
    }

    return config;
  }

  /**
   * Generate settings.json with priority classifications
   * @param {Object} currentSettings - Current settings object
   * @returns {Object} Updated settings with priorities
   */
  generateSettingsWithPriorities(currentSettings) {
    const updatedSettings = JSON.parse(JSON.stringify(currentSettings));

    // Update PreToolUse hooks
    if (updatedSettings.hooks.PreToolUse) {
      updatedSettings.hooks.PreToolUse.forEach((matcher) => {
        if (matcher.hooks) {
          matcher.hooks.forEach((hook) => {
            const hookInfo = this.currentHooks[hook.command];
            if (hookInfo) {
              hook.priority = hookInfo.priority;
              hook.family = hookInfo.family;
              hook.timeout = Math.ceil(hookInfo.timeout / 1000); // Convert to seconds
              hook.blockingBehavior = this.getBlockingBehavior(hookInfo.family);
            }
          });
        }
      });
    }

    // Update PostToolUse hooks
    if (updatedSettings.hooks.PostToolUse) {
      updatedSettings.hooks.PostToolUse.forEach((matcher) => {
        if (matcher.hooks) {
          matcher.hooks.forEach((hook) => {
            const hookInfo = this.currentHooks[hook.command];
            if (hookInfo) {
              hook.priority = hookInfo.priority;
              hook.family = hookInfo.family;
              hook.timeout = Math.ceil(hookInfo.timeout / 1000); // Convert to seconds
              hook.blockingBehavior = this.getBlockingBehavior(hookInfo.family);
            }
          });
        }
      });
    }

    return updatedSettings;
  }

  /**
   * Validate hook configuration
   * @param {Object} hook - Hook configuration
   * @returns {Object} Validation result
   */
  validateHookConfig(hook) {
    const errors = [];
    const warnings = [];

    if (!hook.command) {
      errors.push("Hook command is required");
    }

    if (!hook.priority) {
      warnings.push("Hook priority not specified, defaulting to medium");
    } else if (!this.priorities[hook.priority]) {
      errors.push(`Invalid priority: ${hook.priority}`);
    }

    if (!hook.family) {
      warnings.push("Hook family not specified, defaulting to unknown");
    } else if (!this.families[hook.family]) {
      warnings.push(`Unknown family: ${hook.family}`);
    }

    if (hook.timeout && hook.timeout < 1000) {
      warnings.push("Hook timeout is very low, may cause premature failures");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get statistics about current hook configuration
   * @returns {Object} Hook statistics
   */
  getHookStatistics() {
    const stats = {
      total: Object.keys(this.currentHooks).length,
      byPriority: {},
      byFamily: {},
      averageTimeout: 0,
      totalTimeout: 0,
    };

    let totalTimeout = 0;
    Object.values(this.currentHooks).forEach((hook) => {
      // Priority stats
      if (!stats.byPriority[hook.priority]) {
        stats.byPriority[hook.priority] = 0;
      }
      stats.byPriority[hook.priority]++;

      // Family stats
      if (!stats.byFamily[hook.family]) {
        stats.byFamily[hook.family] = 0;
      }
      stats.byFamily[hook.family]++;

      // Timeout stats
      totalTimeout += hook.timeout;
    });

    stats.totalTimeout = totalTimeout;
    stats.averageTimeout = Math.round(totalTimeout / stats.total);

    return stats;
  }
}

module.exports = HookPriority;

// CLI usage support
if (require.main === module) {
  const fs = require("fs");
  const path = require("path");

  function main() {
    const priority = new HookPriority();

    const command = process.argv[2];

    switch (command) {
      case "stats":
        console.log(JSON.stringify(priority.getHookStatistics(), null, 2));
        break;

      case "classify":
        const hooksFile = process.argv[3];
        if (!hooksFile) {
          console.error("Usage: node hook-priority.js classify <hooks-file>");
          process.exit(1);
        }

        const hooks = JSON.parse(fs.readFileSync(hooksFile, "utf8"));
        const classified = priority.classifyHooksByPriority(hooks);

        console.log(JSON.stringify(Object.fromEntries(classified), null, 2));
        break;

      case "update-settings":
        const settingsFile = process.argv[3] || ".claude/settings.json";
        if (!fs.existsSync(settingsFile)) {
          console.error(`Settings file not found: ${settingsFile}`);
          process.exit(1);
        }

        const currentSettings = JSON.parse(
          fs.readFileSync(settingsFile, "utf8"),
        );
        const updatedSettings =
          priority.generateSettingsWithPriorities(currentSettings);

        fs.writeFileSync(
          settingsFile,
          JSON.stringify(updatedSettings, null, 2),
        );
        console.log(`Updated settings file: ${settingsFile}`);
        break;

      default:
        console.log("Usage: node hook-priority.js <command>");
        console.log("Commands:");
        console.log("  stats              - Show hook statistics");
        console.log("  classify <file>    - Classify hooks from file");
        console.log(
          "  update-settings [file] - Update settings.json with priorities",
        );
        process.exit(1);
    }
  }

  main();
}
