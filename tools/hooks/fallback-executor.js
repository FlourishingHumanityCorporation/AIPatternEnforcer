#!/usr/bin/env node

/**
 * Fallback Hook Executor
 * Provides emergency fallback to sequential execution if parallel execution fails
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const HookEnvUtils = require("./lib/hook-env-utils");

class FallbackExecutor {
  constructor(options = {}) {
    this.verbose = options.verbose || process.env.HOOK_VERBOSE === "true";
    this.timeout = options.timeout || 30000;
    this.hookType = options.hookType || "PreToolUse";
    this.toolMatcher = options.toolMatcher || "Write|Edit|MultiEdit";
  }

  /**
   * Execute hooks sequentially as ultimate fallback
   */
  async executeSequentialFallback(input) {
    const startTime = Date.now();

    try {
      if (this.verbose) {
        process.stderr.write(
          `🛡️  Fallback executor activated for ${this.hookType}\n`,
        );
      }

      // Get hooks from backup configuration
      const hooks = await this.getHooksFromBackup();

      if (!hooks || hooks.length === 0) {
        if (this.verbose) {
          process.stderr.write(`⚠️  No hooks found in backup configuration\n`);
        }
        return { success: true, message: "No hooks to execute" };
      }

      if (this.verbose) {
        process.stderr.write(
          `🐌 Executing ${hooks.length} hooks sequentially as fallback\n`,
        );
      }

      const results = [];

      for (const hook of hooks) {
        try {
          const result = await this.executeHook(hook, input);
          results.push(result);

          if (this.verbose) {
            process.stderr.write(
              `  ${result.success ? "✅" : "❌"} ${hook.command} (${result.duration}ms)\n`,
            );
          }

          // Stop on first blocking result
          if (result.blocked) {
            if (this.verbose) {
              process.stderr.write(
                `🚫 Hook ${hook.command} blocked operation\n`,
              );
            }
            return {
              success: false,
              blocked: true,
              message: result.stderr || "Operation blocked by hook validation",
              results,
            };
          }
        } catch (error) {
          if (this.verbose) {
            process.stderr.write(
              `⚠️  Hook ${hook.command} failed: ${error.message}\n`,
            );
          }
          results.push({
            hook: hook.command,
            success: false,
            error: error.message,
            duration: 0,
          });
        }
      }

      const totalDuration = Date.now() - startTime;

      return {
        success: true,
        results,
        totalDuration,
        hookCount: hooks.length,
        message: `Fallback execution completed in ${totalDuration}ms`,
      };
    } catch (error) {
      if (this.verbose) {
        process.stderr.write(
          `❌ Fallback execution failed: ${error.message}\n`,
        );
      }
      return {
        success: false,
        error: error.message,
        message: "Fallback execution failed",
      };
    }
  }

  /**
   * Execute a single hook
   */
  async executeHook(hook, input) {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const timeout = (hook.timeout || 5) * 1000;

      const child = spawn("node", [hook.command], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
        timeout,
      });

      let stdout = "";
      let stderr = "";
      let resolved = false;

      child.stdin.write(JSON.stringify(input));
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

        resolve({
          hook: hook.command,
          success: code === 0,
          blocked: code === 2,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          duration,
        });
      });

      child.on("error", (error) => {
        if (resolved) return;
        resolved = true;

        const duration = Date.now() - startTime;

        resolve({
          hook: hook.command,
          success: false,
          error: error.message,
          duration,
        });
      });

      // Timeout handling
      setTimeout(() => {
        if (resolved) return;
        resolved = true;

        child.kill("SIGTERM");

        const duration = Date.now() - startTime;

        resolve({
          hook: hook.command,
          success: false,
          error: `Hook timed out after ${timeout}ms`,
          duration,
        });
      }, timeout);
    });
  }

  /**
   * Get hooks from backup configuration
   */
  async getHooksFromBackup() {
    try {
      const backupPath = path.join(
        process.cwd(),
        ".claude",
        "settings.json.backup",
      );

      if (!fs.existsSync(backupPath)) {
        // Try original hooks config
        const configPath = path.join(__dirname, "hooks-config.json");
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
          return this.extractHooks(config);
        }
        return [];
      }

      const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
      return this.extractHooks(backup);
    } catch (error) {
      if (this.verbose) {
        process.stderr.write(
          `❌ Error reading backup configuration: ${error.message}\n`,
        );
      }
      return [];
    }
  }

  /**
   * Extract hooks from configuration
   */
  extractHooks(config) {
    const hooks = [];

    if (config.hooks && config.hooks[this.hookType]) {
      for (const group of config.hooks[this.hookType]) {
        if (group.matcher && this.matchesToolMatcher(group.matcher)) {
          hooks.push(...group.hooks);
        }
      }
    }

    return hooks;
  }

  /**
   * Check if matcher matches tool matcher
   */
  matchesToolMatcher(matcher) {
    const hookTools = matcher.split("|").map((t) => t.trim());
    const currentTools = this.toolMatcher.split("|").map((t) => t.trim());

    return hookTools.some((tool) => currentTools.includes(tool));
  }

  /**
   * Main execution entry point
   */
  async execute() {
    try {
      // Early exit for testing/development mode
      if (HookEnvUtils.shouldBypassHooks()) {
        if (this.verbose) {
          process.stderr.write(
            `🔧 Fallback executor bypassed: ${HookEnvUtils.getBypassReason()}\n`,
          );
        }
        process.exit(0);
      }

      // Read input from stdin
      const input = await this.readStdin();
      let parsedInput;

      try {
        parsedInput = input ? JSON.parse(input) : {};
      } catch (e) {
        parsedInput = { raw: input };
      }

      // Execute fallback
      const result = await this.executeSequentialFallback(parsedInput);

      if (result.blocked) {
        process.stderr.write(result.message);
        process.exit(2);
      } else if (result.success) {
        process.exit(0);
      } else {
        if (this.verbose) {
          process.stderr.write(`❌ Fallback failed: ${result.message}\n`);
        }
        process.exit(0); // Fail-safe: don't block operations
      }
    } catch (error) {
      if (this.verbose) {
        process.stderr.write(
          `💥 Fallback executor crashed: ${error.message}\n`,
        );
      }
      process.exit(0); // Fail-safe: don't block operations
    }
  }

  /**
   * Read stdin data
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

      if (process.stdin.isTTY) {
        resolve("");
      }
    });
  }
}

// CLI execution
if (require.main === module) {
  const hookType = process.argv[2] || "PreToolUse";
  const toolMatcher = process.argv[3] || "Write|Edit|MultiEdit";

  const executor = new FallbackExecutor({
    hookType,
    toolMatcher,
    verbose: process.env.HOOK_VERBOSE === "true",
  });

  executor.execute().catch((error) => {
    if (process.env.HOOK_VERBOSE === "true") {
      process.stderr.write(`💥 Fallback executor crashed: ${error.message}\n`);
    }
    process.exit(0);
  });
}

module.exports = FallbackExecutor;
