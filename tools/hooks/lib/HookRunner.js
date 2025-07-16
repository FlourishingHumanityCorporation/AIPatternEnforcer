#!/usr/bin/env node

/**
 * Base class for Claude Code hooks
 * Handles stdin/stdout communication and common hook patterns
 */

const HookEnvUtils = require("./hook-env-utils");

class HookRunner {
  constructor(name, options = {}) {
    this.name = name;
    this.timeout = options.timeout || 5000;
    this.verbose = options.verbose || false;
    this.priority = options.priority || "medium";
    this.family = options.family || "unknown";
    this.executionId = options.executionId || null;
    this.parentExecutor = options.parentExecutor || null;

    // Derive hook command from current process argv
    this.hookCommand = process.argv[1] || "";

    // Load environment variables from .env file
    this.loadEnvFile();
  }

  /**
   * Load environment variables from .env file
   */
  loadEnvFile() {
    const fs = require("fs");
    const path = require("path");

    try {
      // Find project root by looking for .env file up the directory tree
      let currentDir = path.dirname(this.hookCommand);
      let envPath = null;

      // Walk up directories to find .env file (max 10 levels to prevent infinite loop)
      for (let i = 0; i < 10; i++) {
        const testPath = path.join(currentDir, ".env");
        if (fs.existsSync(testPath)) {
          envPath = testPath;
          break;
        }
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) break; // Reached filesystem root
        currentDir = parentDir;
      }

      // Fallback to process.cwd() if not found via hook path
      if (!envPath) {
        const fallbackPath = path.join(process.cwd(), ".env");
        if (fs.existsSync(fallbackPath)) {
          envPath = fallbackPath;
        }
      }

      if (envPath) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const lines = envContent.split("\n");

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith("#")) {
            const [key, ...valueParts] = trimmedLine.split("=");
            if (key && valueParts.length > 0) {
              const value = valueParts.join("=").trim();
              process.env[key.trim()] = value;
            }
          }
        }

        // Store which .env file was loaded for debugging
        this.envFilePath = envPath;
      }
    } catch (error) {
      // Fail silently if .env file cannot be read
    }
  }

  /**
   * Main entry point for hook execution
   * Reads JSON from stdin, calls hook function, writes result to stdout
   */
  async run(hookFunction) {
    const startTime = Date.now();

    try {
      // Early exit for testing/development mode or folder-specific bypass
      if (HookEnvUtils.shouldBypassHook(this.hookCommand)) {
        if (process.env.HOOK_VERBOSE === "true") {
          process.stderr.write(
            `🔧 Hook ${this.name} bypassed: ${HookEnvUtils.getHookBypassReason(this.hookCommand)}\n`,
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

      // Enhance input with helper methods
      const enhancedInput = this.enhanceHookData(parsedInput);

      // Execute the hook function
      const result = await Promise.race([
        hookFunction(enhancedInput, this),
        this.timeoutPromise(),
      ]);

      // Add execution metadata
      const executionData = {
        ...result,
        executionTime: Date.now() - startTime,
        hookName: this.name,
        priority: this.priority,
        family: this.family,
        executionId: this.executionId,
      };

      // Notify parent executor if present
      if (this.parentExecutor && this.parentExecutor.onHookComplete) {
        this.parentExecutor.onHookComplete(executionData);
      }

      // Handle response
      if (result.block) {
        process.stderr.write(result.message || "Operation blocked by hook");
        process.exit(2); // Exit 2 for Claude Code hook blocking
      } else if (result.allow !== false) {
        process.exit(0);
      } else {
        process.exit(2); // Exit 2 for Claude Code hook blocking
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Notify parent executor of error
      if (this.parentExecutor && this.parentExecutor.onHookError) {
        this.parentExecutor.onHookError({
          hookName: this.name,
          priority: this.priority,
          family: this.family,
          executionId: this.executionId,
          error: error.message,
          executionTime,
        });
      }

      if (this.verbose) {
        process.stderr.write(`Hook ${this.name} error: ${error.message}\n`);
      }
      process.exit(0); // Don't fail hook on errors, just allow operation
    }
  }

  /**
   * Read all data from stdin
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
   * Create timeout promise
   */
  timeoutPromise() {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(`Hook ${this.name} timed out after ${this.timeout}ms`),
        );
      }, this.timeout);
    });
  }

  /**
   * Enhance hook data with utility methods
   */
  enhanceHookData(data) {
    const path = require("path");

    // Flatten tool_input fields to root level for easier access
    const toolInput = data.tool_input || {};
    const flattened = {
      ...data,
      ...toolInput, // This flattens file_path, content, etc. to root level
    };

    const enhanced = {
      ...flattened,

      // Helper methods
      hasFilePath() {
        return !!(this.filePath || this.file_path);
      },

      // Computed properties
      get fileName() {
        const filePath = this.filePath || this.file_path;
        return filePath ? path.basename(filePath) : "";
      },

      get fileExtension() {
        const filePath = this.filePath || this.file_path;
        return filePath ? path.extname(filePath) : "";
      },
    };

    return enhanced;
  }

  /**
   * Check if a string matches any of the provided patterns
   */
  matchesPatterns(text, patterns) {
    if (!text || !Array.isArray(patterns)) return false;
    return patterns.some((pattern) => pattern.test(text));
  }

  /**
   * Format an error message for hook blocking
   */
  formatError(title, ...details) {
    let message = `🚫 ${title}\n\n`;

    details.forEach((detail) => {
      if (detail) {
        message += `${detail}\n`;
      }
    });

    return message.trim();
  }

  /**
   * Helper method to create a block result
   */
  block(message) {
    return {
      block: true,
      message: message,
    };
  }

  /**
   * Helper method to create an allow result
   */
  allow() {
    return {
      allow: true,
    };
  }

  /**
   * Check if hook should run based on priority and context
   */
  shouldRun(context = {}) {
    // Skip background hooks under time pressure
    if (context.timeConstraint && this.priority === "background") {
      return false;
    }

    // Skip low priority hooks if many hooks are queued
    if (context.queueSize > 10 && this.priority === "low") {
      return false;
    }

    return true;
  }

  /**
   * Get hook metadata for parallel execution
   */
  getMetadata() {
    return {
      name: this.name,
      priority: this.priority,
      family: this.family,
      timeout: this.timeout,
      executionId: this.executionId,
    };
  }

  /**
   * Create a hook runner for parallel execution
   */
  static createForParallel(name, hookFunction, options = {}) {
    const runner = new HookRunner(name, options);

    // Return a promise that resolves with execution data
    return async (input) => {
      const startTime = Date.now();

      try {
        // Check if hook should run
        if (!runner.shouldRun(options.context)) {
          return {
            skipped: true,
            reason: "Priority/context filtering",
            hookName: name,
            priority: runner.priority,
            family: runner.family,
            executionTime: 0,
          };
        }

        // Execute hook function
        const result = await Promise.race([
          hookFunction(input, runner),
          runner.timeoutPromise(),
        ]);

        return {
          ...result,
          executionTime: Date.now() - startTime,
          hookName: name,
          priority: runner.priority,
          family: runner.family,
          executionId: runner.executionId,
        };
      } catch (error) {
        return {
          error: error.message,
          blocked: false,
          failed: true,
          executionTime: Date.now() - startTime,
          hookName: name,
          priority: runner.priority,
          family: runner.family,
          executionId: runner.executionId,
        };
      }
    };
  }

  /**
   * Static factory method for simple hooks
   */
  static create(name, hookFunction, options = {}) {
    const runner = new HookRunner(name, options);
    runner.run(hookFunction);
    return runner;
  }
}

module.exports = HookRunner;
