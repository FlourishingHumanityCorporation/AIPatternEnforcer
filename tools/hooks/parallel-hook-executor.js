#!/usr/bin/env node

/**
 * Parallel Hook Executor - Integration Script for Claude Code
 *
 * This script serves as a single entry point that Claude Code calls instead of individual hooks.
 * It uses the ParallelExecutor engine to run all hooks in parallel based on priority.
 *
 * This is the bridge between Claude Code's hook system and our parallel execution engine.
 */

const path = require("path");
const fs = require("fs");
const ParallelExecutor = require("./engine/parallel-executor");
const HookPriority = require("./engine/hook-priority");
const HookEnvUtils = require("./lib/hook-env-utils");

class ParallelHookExecutor {
  constructor(options = {}) {
    this.verbose = options.verbose || process.env.HOOK_VERBOSE === "true";
    this.timeout = options.timeout || 30000;
    this.hookType = options.hookType || "PreToolUse"; // PreToolUse or PostToolUse
    this.toolMatcher = options.toolMatcher || "Write|Edit|MultiEdit";

    this.executor = new ParallelExecutor({
      verbose: this.verbose,
      timeout: this.timeout,
      fallbackToSequential: true,
    });

    this.priority = new HookPriority();
  }

  /**
   * Main execution function called by Claude Code
   */
  async execute() {
    const startTime = Date.now();

    try {
      // Early exit for testing/development mode
      if (HookEnvUtils.shouldBypassHooks()) {
        if (this.verbose) {
          process.stderr.write(
            `🔧 Parallel hook executor bypassed: ${HookEnvUtils.getBypassReason()}\n`,
          );
        }
        process.exit(0);
      }

      // Read input from stdin (Claude Code sends JSON)
      const input = await this.readStdin();
      let parsedInput;

      try {
        parsedInput = input ? JSON.parse(input) : {};
      } catch (e) {
        parsedInput = { raw: input };
      }

      if (this.verbose) {
        process.stderr.write(
          `📥 Received input: ${JSON.stringify(parsedInput, null, 2)}\n`,
        );
      }

      // Get hooks configuration
      const hooks = await this.getHooksConfiguration();

      if (!hooks || hooks.length === 0) {
        if (this.verbose) {
          process.stderr.write(
            `⚠️  No hooks configured for ${this.hookType}\n`,
          );
        }
        process.exit(0);
      }

      if (this.verbose) {
        process.stderr.write(
          `🚀 Starting parallel execution of ${hooks.length} hooks\n`,
        );
      }

      // Execute hooks in parallel
      const result = await this.executor.runParallel(hooks, parsedInput);

      const executionTime = Date.now() - startTime;

      if (this.verbose) {
        this.logExecutionResults(result, executionTime);
      }

      // Handle results according to Claude Code hook protocol
      this.handleExecutionResults(result);
    } catch (error) {
      const executionTime = Date.now() - startTime;

      if (this.verbose) {
        process.stderr.write(
          `❌ Parallel execution failed after ${executionTime}ms: ${error.message}\n`,
        );
        process.stderr.write(
          `🔄 Attempting fallback to sequential execution...\n`,
        );
      }

      try {
        // Fallback to sequential execution
        const hooks = await this.getHooksConfiguration();
        const result = await this.executeSequentialFallback(hooks, parsedInput);
        this.handleExecutionResults(result);
      } catch (fallbackError) {
        if (this.verbose) {
          process.stderr.write(
            `❌ Sequential fallback also failed: ${fallbackError.message}\n`,
          );
          process.stderr.write(
            `🛡️  Attempting emergency fallback executor...\n`,
          );
        }

        try {
          // Ultimate fallback: use emergency fallback executor
          const FallbackExecutor = require("./fallback-executor");
          const emergencyExecutor = new FallbackExecutor({
            hookType: this.hookType,
            toolMatcher: this.toolMatcher,
            verbose: this.verbose,
          });

          const emergencyResult =
            await emergencyExecutor.executeSequentialFallback(parsedInput);
          this.handleExecutionResults(emergencyResult);
        } catch (emergencyError) {
          if (this.verbose) {
            process.stderr.write(
              `💥 Emergency fallback failed: ${emergencyError.message}\n`,
            );
            process.stderr.write(
              `🛡️  All fallback mechanisms exhausted - allowing operation\n`,
            );
          }
          // Don't fail hook on errors, just allow operation (fail-safe design)
          process.exit(0);
        }
      }
    }
  }

  /**
   * Read JSON input from stdin
   */
  readStdin() {
    return new Promise((resolve) => {
      let data = "";
      process.stdin.setEncoding("utf8");

      process.stdin.on("data", (chunk) => {
        data += chunk;
      });

      process.stdin.on("end", () => {
        resolve(data.trim());
      });

      // Handle case where no stdin data
      if (process.stdin.isTTY) {
        resolve("");
      }
    });
  }

  /**
   * Get hooks configuration from hooks-config.json
   */
  async getHooksConfiguration() {
    try {
      const configPath = path.join(__dirname, "hooks-config.json");

      if (!fs.existsSync(configPath)) {
        if (this.verbose) {
          process.stderr.write(
            `⚠️  Hooks configuration file not found: ${configPath}\n`,
          );
        }
        return [];
      }

      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

      if (!config.hooks || !config.hooks[this.hookType]) {
        if (this.verbose) {
          process.stderr.write(`⚠️  No ${this.hookType} hooks configured\n`);
        }
        return [];
      }

      // Find matching hooks based on tool matcher
      const matchingHooks = [];

      for (const hookGroup of config.hooks[this.hookType]) {
        if (hookGroup.matcher && this.matchesToolMatcher(hookGroup.matcher)) {
          // Filter hooks based on folder-specific environment variables
          const enabledHooks = hookGroup.hooks.filter((hook) => {
            return !HookEnvUtils.shouldBypassHook(hook.command);
          });
          matchingHooks.push(...enabledHooks);
        }
      }

      if (
        this.verbose &&
        matchingHooks.length < this.getTotalHooksCount(config)
      ) {
        const totalCount = this.getTotalHooksCount(config);
        const filteredCount = totalCount - matchingHooks.length;
        process.stderr.write(
          `🔧 Filtered out ${filteredCount} hooks due to folder-specific environment variables\n`,
        );
      }

      return matchingHooks;
    } catch (error) {
      if (this.verbose) {
        process.stderr.write(
          `❌ Error reading hooks configuration: ${error.message}\n`,
        );
      }
      return [];
    }
  }

  /**
   * Check if a hook matcher matches the current tool matcher
   */
  matchesToolMatcher(hookMatcher) {
    // Split both matchers by | and check for any overlap
    const hookTools = hookMatcher.split("|").map((t) => t.trim());
    const currentTools = this.toolMatcher.split("|").map((t) => t.trim());

    return hookTools.some((tool) => currentTools.includes(tool));
  }

  /**
   * Get total number of hooks that would match without folder filtering
   */
  getTotalHooksCount(config) {
    let totalCount = 0;
    for (const hookGroup of config.hooks[this.hookType]) {
      if (hookGroup.matcher && this.matchesToolMatcher(hookGroup.matcher)) {
        totalCount += hookGroup.hooks.length;
      }
    }
    return totalCount;
  }

  /**
   * Execute hooks sequentially as fallback
   */
  async executeSequentialFallback(hooks, input) {
    if (this.verbose) {
      process.stderr.write(
        `🔄 Executing ${hooks.length} hooks sequentially as fallback\n`,
      );
    }

    const results = [];

    for (const hook of hooks) {
      try {
        const result = await this.executor.executeHook(hook, input);
        results.push(result);

        // Stop on first blocking result
        if (result.blocked) {
          if (this.verbose) {
            process.stderr.write(`🚫 Hook ${hook.command} blocked operation\n`);
          }
          break;
        }
      } catch (error) {
        if (this.verbose) {
          process.stderr.write(
            `⚠️  Hook ${hook.command} failed: ${error.message}\n`,
          );
        }
        results.push({
          hook: hook.command,
          error: error.message,
          blocked: false,
          failed: true,
        });
      }
    }

    return this.executor.mergeResults(results);
  }

  /**
   * Handle execution results according to Claude Code protocol
   */
  handleExecutionResults(result) {
    // Handle parallel execution results FIRST (they have detailed messages)
    if (result.blocks && result.blocks.length > 0) {
      // Find the first blocking result to report
      const blockingResult = result.blocks[0];

      // More robust error message extraction
      let errorMessage = "Operation blocked by hook validation\n";

      if (
        blockingResult &&
        blockingResult.stderr &&
        blockingResult.stderr.trim()
      ) {
        errorMessage = blockingResult.stderr;
      } else if (blockingResult && blockingResult.message) {
        errorMessage = blockingResult.message;
      } else if (
        blockingResult &&
        blockingResult.stdout &&
        blockingResult.stdout.trim()
      ) {
        errorMessage = blockingResult.stdout;
      }

      // Ensure message ends with newline
      if (!errorMessage.endsWith("\n")) {
        errorMessage += "\n";
      }

      process.stderr.write(errorMessage);
      process.exit(2); // Exit 2 for Claude Code hook blocking
    }

    // Handle emergency fallback results (different format)
    if (result.blocked === true) {
      process.stderr.write(
        result.message || "Operation blocked by hook validation\n",
      );
      process.exit(2); // Exit 2 for Claude Code hook blocking
    }

    if (result.errors && result.errors.length > 0) {
      // Report errors but don't block (fail-safe design)
      if (this.verbose) {
        process.stderr.write(
          `⚠️  ${result.errors.length} hooks had errors but operation will continue\n`,
        );
        result.errors.forEach((error) => {
          process.stderr.write(`  - ${error.hook}: ${error.error}\n`);
        });
      }
      process.exit(0); // Allow operation to continue
    } else if (result.success === false) {
      // Handle fallback failure
      if (this.verbose) {
        process.stderr.write(
          `⚠️  Execution failed: ${result.message || "Unknown error"}\n`,
        );
      }
      process.exit(0); // Fail-safe: allow operation to continue
    } else {
      // Success
      if (this.verbose) {
        process.stderr.write(`✅ All hooks passed successfully\n`);
      }
      process.exit(0);
    }
  }

  /**
   * Log execution results for debugging
   */
  logExecutionResults(result, executionTime) {
    process.stderr.write(`\n📊 Execution Results (${executionTime}ms):\n`);
    process.stderr.write(`  Total hooks: ${result.totalHooks}\n`);
    process.stderr.write(`  Successful: ${result.successful.length}\n`);
    process.stderr.write(`  Blocked: ${result.blocks.length}\n`);
    process.stderr.write(`  Errors: ${result.errors.length}\n`);
    process.stderr.write(
      `  Parallel efficiency: ${result.parallelEfficiency}\n`,
    );

    if (result.blocks.length > 0) {
      process.stderr.write(`\n🚫 Blocking hooks:\n`);
      result.blocks.forEach((block) => {
        process.stderr.write(`  - ${block.hook} (${block.priority})\n`);
      });
    }

    if (result.errors.length > 0) {
      process.stderr.write(`\n⚠️  Failed hooks:\n`);
      result.errors.forEach((error) => {
        process.stderr.write(`  - ${error.hook}: ${error.error}\n`);
      });
    }

    // Performance breakdown by priority
    const stats = this.executor.getPerformanceStats(result);
    process.stderr.write(`\n⚡ Performance by priority:\n`);
    Object.entries(stats.byPriority).forEach(([priority, data]) => {
      const avgTime =
        data.count > 0 ? Math.round(data.duration / data.count) : 0;
      process.stderr.write(
        `  ${priority}: ${data.count} hooks, ${avgTime}ms avg\n`,
      );
    });
  }

  /**
   * Create a specialized executor for a specific hook type
   */
  static createForHookType(hookType, toolMatcher = "Write|Edit|MultiEdit") {
    return new ParallelHookExecutor({
      hookType,
      toolMatcher,
      verbose: process.env.HOOK_VERBOSE === "true",
    });
  }
}

// CLI execution
if (require.main === module) {
  // Parse command line arguments
  const hookType = process.argv[2] || "PreToolUse";
  const toolMatcher = process.argv[3] || "Write|Edit|MultiEdit";

  const executor = ParallelHookExecutor.createForHookType(
    hookType,
    toolMatcher,
  );
  executor.execute().catch((error) => {
    if (process.env.HOOK_VERBOSE === "true") {
      process.stderr.write(`💥 Fatal error: ${error.message}\n`);
    }
    process.exit(0); // Fail-safe: don't block operations on catastrophic failure
  });
}

module.exports = ParallelHookExecutor;
