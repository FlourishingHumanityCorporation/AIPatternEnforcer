#!/usr/bin/env node

/**
 * Hook Environment Utilities
 *
 * Centralized environment variable checking for Claude Code hooks.
 * Provides consistent testing mode support across all hooks.
 */

class HookEnvUtils {
  /**
   * Check if hooks should be bypassed due to testing/development mode
   */
  static shouldBypassHooks() {
    return (
      process.env.HOOKS_TESTING_MODE === "true" ||
      process.env.HOOK_DEVELOPMENT === "true"
    );
  }

  /**
   * Check if we're specifically in testing mode
   */
  static isTestingMode() {
    return process.env.HOOKS_TESTING_MODE === "true";
  }

  /**
   * Check if we're specifically in development mode
   */
  static isDevelopmentMode() {
    return process.env.HOOK_DEVELOPMENT === "true";
  }

  /**
   * Get bypass reason for logging/debugging
   */
  static getBypassReason() {
    if (this.isTestingMode()) {
      return "HOOKS_TESTING_MODE=true";
    }
    if (this.isDevelopmentMode()) {
      return "HOOK_DEVELOPMENT=true";
    }
    return "unknown";
  }

  /**
   * Create a bypass result for hooks to return
   */
  static createBypassResult(hookName, verbose = false) {
    if (verbose) {
      process.stderr.write(
        `=' Hook ${hookName} bypassed: ${this.getBypassReason()}\n`,
      );
    }

    return {
      allow: true,
      bypass: true,
      reason: this.getBypassReason(),
    };
  }

  /**
   * Exit process with bypass (for direct use in hook scripts)
   */
  static exitWithBypass(exitCode = 0) {
    if (process.env.HOOK_VERBOSE === "true") {
      process.stderr.write(`=' Hook bypassed: ${this.getBypassReason()}\n`);
    }
    process.exit(exitCode);
  }

  /**
   * Check if a specific hook should be bypassed
   */
  static shouldBypassHook(hookName, options = {}) {
    return this.shouldBypassHooks();
  }

  /**
   * Get environment variable status for debugging
   */
  static getEnvStatus() {
    return {
      HOOKS_TESTING_MODE: process.env.HOOKS_TESTING_MODE,
      HOOK_DEVELOPMENT: process.env.HOOK_DEVELOPMENT,
      HOOK_VERBOSE: process.env.HOOK_VERBOSE,
      shouldBypass: this.shouldBypassHooks(),
      isTestingMode: this.isTestingMode(),
      isDevelopmentMode: this.isDevelopmentMode(),
    };
  }
}

module.exports = HookEnvUtils;
