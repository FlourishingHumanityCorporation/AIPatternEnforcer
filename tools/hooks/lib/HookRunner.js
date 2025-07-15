#!/usr/bin/env node

/**
 * Base class for Claude Code hooks
 * Handles stdin/stdout communication and common hook patterns
 */

class HookRunner {
  constructor(name, options = {}) {
    this.name = name;
    this.timeout = options.timeout || 5000;
    this.verbose = options.verbose || false;
  }

  /**
   * Main entry point for hook execution
   * Reads JSON from stdin, calls hook function, writes result to stdout
   */
  async run(hookFunction) {
    try {
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
   * Static factory method for simple hooks
   */
  static create(name, hookFunction, options = {}) {
    const runner = new HookRunner(name, options);
    runner.run(hookFunction);
    return runner;
  }
}

module.exports = HookRunner;
