#!/usr/bin/env node

/**
 * Parallel Hook Execution Engine
 * Executes Claude Code hooks in parallel based on priority to reduce execution time
 */

const { spawn } = require("child_process");
const path = require("path");

class ParallelExecutor {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.timeout = options.timeout || 30000; // 30 second global timeout
    this.fallbackToSequential = options.fallbackToSequential !== false;
  }

  /**
   * Execute hooks in parallel based on priority
   * @param {Array} hooks - Array of hook configurations
   * @param {Object} input - Hook input data
   * @returns {Promise<Object>} Combined execution result
   */
  async runParallel(hooks, input) {
    if (!hooks || hooks.length === 0) {
      return { success: true, blocks: [], errors: [] };
    }

    try {
      // Group hooks by priority
      const priorityGroups = this.groupHooksByPriority(hooks);

      // Execute in priority order with parallel execution within each group
      const results = await this.executeByPriority(priorityGroups, input);

      return this.mergeResults(results);
    } catch (error) {
      if (this.fallbackToSequential) {
        if (this.verbose) {
          process.stderr.write(
            `⚠️  Parallel execution failed, falling back to sequential: ${error.message}\n`,
          );
        }
        return await this.runSequential(hooks, input);
      }
      throw error;
    }
  }

  /**
   * Group hooks by priority for execution order
   * @param {Array} hooks - Hook configurations
   * @returns {Map} Priority groups map
   */
  groupHooksByPriority(hooks) {
    const groups = new Map([
      ["critical", []],
      ["high", []],
      ["medium", []],
      ["low", []],
      ["background", []],
    ]);

    hooks.forEach((hook) => {
      const priority = hook.priority || "medium";
      if (!groups.has(priority)) {
        groups.set(priority, []);
      }
      groups.get(priority).push(hook);
    });

    return groups;
  }

  /**
   * Execute hooks by priority groups
   * @param {Map} priorityGroups - Grouped hooks by priority
   * @param {Object} input - Hook input data
   * @returns {Promise<Array>} Array of execution results
   */
  async executeByPriority(priorityGroups, input) {
    const results = [];
    const executionOrder = ["critical", "high", "medium", "low", "background"];

    for (const priority of executionOrder) {
      const hooks = priorityGroups.get(priority);
      if (!hooks || hooks.length === 0) continue;

      if (this.verbose) {
        process.stderr.write(
          `🔄 Executing ${hooks.length} ${priority} priority hooks in parallel...\n`,
        );
      }

      try {
        // Execute hooks in parallel within the same priority group
        const priorityResults = await this.executeHooksInParallel(hooks, input);
        results.push(...priorityResults);

        // Check if any critical/high priority hooks blocked - stop execution if so
        const hasBlockingResult = priorityResults.some(
          (result) => result.blocked,
        );
        if (
          hasBlockingResult &&
          (priority === "critical" || priority === "high")
        ) {
          if (this.verbose) {
            process.stderr.write(
              `🚫 ${priority} priority hook blocked, stopping execution\n`,
            );
          }
          break;
        }
      } catch (error) {
        if (this.verbose) {
          process.stderr.write(
            `❌ Error executing ${priority} priority hooks: ${error.message}\n`,
          );
        }
        results.push({
          priority,
          error: error.message,
          blocked: false,
          hooks: hooks.map((h) => h.command || h.description || "unknown"),
        });
      }
    }

    return results;
  }

  /**
   * Execute multiple hooks in parallel
   * @param {Array} hooks - Hooks to execute
   * @param {Object} input - Hook input data
   * @returns {Promise<Array>} Array of execution results
   */
  async executeHooksInParallel(hooks, input) {
    const promises = hooks.map((hook) => this.executeHook(hook, input));

    try {
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      // Handle partial failures - some hooks might succeed while others fail
      const settledResults = await Promise.allSettled(promises);
      return settledResults.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          return {
            hook: hooks[index].command || hooks[index].description || "unknown",
            error: result.reason.message,
            blocked: false,
            failed: true,
          };
        }
      });
    }
  }

  /**
   * Execute a single hook
   * @param {Object} hook - Hook configuration
   * @param {Object} input - Hook input data
   * @returns {Promise<Object>} Hook execution result
   */
  async executeHook(hook, input) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const hookTimeout = hook.timeout ? hook.timeout * 1000 : 5000;
      const command = hook.command;

      if (!command) {
        resolve({
          hook: hook.description || "unknown",
          error: "No command specified",
          blocked: false,
          failed: true,
          duration: 0,
        });
        return;
      }

      // Parse command to get executable and args
      const args = command.split(" ");
      const executable = args[0];
      const execArgs = args.slice(1);

      const child = spawn(executable, execArgs, {
        stdio: ["pipe", "pipe", "pipe"],
        timeout: hookTimeout,
        cwd: process.cwd(),
      });

      let stdout = "";
      let stderr = "";
      let resolved = false;

      // Send input to hook
      if (input) {
        child.stdin.write(JSON.stringify(input));
      }
      child.stdin.end();

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (resolved) return;
        resolved = true;

        const duration = Date.now() - startTime;
        const result = {
          hook: hook.command,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          blocked: code === 2, // Claude Code hook blocking convention
          failed: code !== 0 && code !== 2,
          duration,
          priority: hook.priority || "medium",
          family: hook.family || "unknown",
        };

        if (this.verbose) {
          process.stderr.write(
            `✅ Hook completed: ${hook.command} (${duration}ms, exit: ${code})\n`,
          );
        }

        resolve(result);
      });

      child.on("error", (error) => {
        if (resolved) return;
        resolved = true;

        const duration = Date.now() - startTime;
        if (this.verbose) {
          process.stderr.write(
            `❌ Hook error: ${hook.command} - ${error.message}\n`,
          );
        }

        resolve({
          hook: hook.command,
          error: error.message,
          blocked: false,
          failed: true,
          duration,
          priority: hook.priority || "medium",
          family: hook.family || "unknown",
        });
      });

      // Timeout handling
      setTimeout(() => {
        if (resolved) return;
        resolved = true;

        child.kill("SIGTERM");

        const duration = Date.now() - startTime;
        if (this.verbose) {
          process.stderr.write(
            `⏱️  Hook timeout: ${hook.command} (${duration}ms)\n`,
          );
        }

        resolve({
          hook: hook.command,
          error: `Hook timed out after ${hookTimeout}ms`,
          blocked: false,
          failed: true,
          duration,
          priority: hook.priority || "medium",
          family: hook.family || "unknown",
        });
      }, hookTimeout);
    });
  }

  /**
   * Fallback to sequential execution
   * @param {Array} hooks - Hooks to execute
   * @param {Object} input - Hook input data
   * @returns {Promise<Object>} Execution result
   */
  async runSequential(hooks, input) {
    const results = [];

    for (const hook of hooks) {
      try {
        const result = await this.executeHook(hook, input);
        results.push(result);

        // Stop on first blocking result
        if (result.blocked) {
          break;
        }
      } catch (error) {
        results.push({
          hook: hook.command || hook.description || "unknown",
          error: error.message,
          blocked: false,
          failed: true,
        });
      }
    }

    return this.mergeResults(results);
  }

  /**
   * Merge execution results from all hooks
   * @param {Array} results - Individual hook results
   * @returns {Object} Combined result
   */
  mergeResults(results) {
    const blocks = results.filter((r) => r.blocked);
    const errors = results.filter((r) => r.failed || r.error);
    const successful = results.filter(
      (r) => !r.blocked && !r.failed && !r.error,
    );

    const totalDuration = results.reduce(
      (sum, r) => sum + (r.duration || 0),
      0,
    );
    const maxDuration = Math.max(...results.map((r) => r.duration || 0));

    return {
      success: blocks.length === 0,
      blocked: blocks.length > 0,
      blocks,
      errors,
      successful,
      totalHooks: results.length,
      totalDuration,
      maxDuration,
      parallelEfficiency:
        results.length > 0 ? (totalDuration / maxDuration).toFixed(2) : 1,
      results,
    };
  }

  /**
   * Get performance statistics
   * @param {Object} result - Execution result
   * @returns {Object} Performance stats
   */
  getPerformanceStats(result) {
    const stats = {
      totalHooks: result.totalHooks,
      totalDuration: result.totalDuration,
      maxDuration: result.maxDuration,
      parallelEfficiency: result.parallelEfficiency,
      averageDuration: result.totalDuration / result.totalHooks,
      successRate:
        ((result.successful.length / result.totalHooks) * 100).toFixed(1) + "%",
    };

    // Group by priority
    const priorityStats = {};
    result.results.forEach((r) => {
      const priority = r.priority || "medium";
      if (!priorityStats[priority]) {
        priorityStats[priority] = { count: 0, duration: 0, success: 0 };
      }
      priorityStats[priority].count++;
      priorityStats[priority].duration += r.duration || 0;
      if (!r.blocked && !r.failed) {
        priorityStats[priority].success++;
      }
    });

    stats.byPriority = priorityStats;
    return stats;
  }

  /**
   * Static factory method for simple usage
   * @param {Array} hooks - Hook configurations
   * @param {Object} input - Hook input data
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result
   */
  static async execute(hooks, input, options = {}) {
    const executor = new ParallelExecutor(options);
    return await executor.runParallel(hooks, input);
  }
}

module.exports = ParallelExecutor;

// CLI usage support
if (require.main === module) {
  const fs = require("fs");

  async function main() {
    try {
      // Read hooks configuration from stdin or file
      const input = process.argv[2]
        ? JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
        : JSON.parse(await readStdin());

      const executor = new ParallelExecutor({ verbose: true });
      const result = await executor.runParallel(
        input.hooks || [],
        input.data || {},
      );

      console.log(JSON.stringify(result, null, 2));

      if (result.blocked) {
        process.exit(2);
      } else if (result.errors.length > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    } catch (error) {
      console.error("ParallelExecutor error:", error.message);
      process.exit(1);
    }
  }

  function readStdin() {
    return new Promise((resolve) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => resolve(data.trim()));
    });
  }

  main();
}
