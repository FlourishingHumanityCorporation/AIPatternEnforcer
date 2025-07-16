#!/usr/bin/env node

/**
 * Hook Environment Utilities
 *
 * Centralized environment variable checking for Claude Code hooks.
 * Provides consistent testing mode support across all hooks.
 */

class HookEnvUtils {
  /**
   * Folder name to environment variable mapping
   */
  static FOLDER_ENV_MAP = {
    "ai-patterns": "HOOK_AI_PATTERNS",
    architecture: "HOOK_ARCHITECTURE",
    cleanup: "HOOK_CLEANUP",
    context: "HOOK_CONTEXT",
    ide: "HOOK_IDE",
    "local-dev": "HOOK_LOCAL_DEV",
    performance: "HOOK_PERFORMANCE",
    prompt: "HOOK_PROMPT",
    "project-boundaries": "HOOK_PROJECT_BOUNDARIES",
    security: "HOOK_SECURITY",
    validation: "HOOK_VALIDATION",
    workflow: "HOOK_WORKFLOW",
  };

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
   * Check if a specific hook folder should be bypassed
   */
  static shouldBypassHookFolder(folderName) {
    // Global controls take precedence
    if (this.shouldBypassHooks()) {
      return true;
    }

    // Check folder-specific environment variable
    const envVar = this.FOLDER_ENV_MAP[folderName];
    if (envVar) {
      const envValue = process.env[envVar];

      // If folder-specific var is explicitly set to false, bypass this folder
      if (envValue === "false") {
        return true;
      }

      // If folder-specific var is explicitly set to true, don't bypass
      if (envValue === "true") {
        return false;
      }
    }

    // Default: don't bypass (run hooks)
    return false;
  }

  /**
   * Check if a specific hook should be bypassed based on its file path
   */
  static shouldBypassHook(hookCommand, options = {}) {
    // Global controls take precedence
    if (this.shouldBypassHooks()) {
      return true;
    }

    // Extract folder name from hook command path
    const folderName = this.extractFolderFromHookCommand(hookCommand);
    if (folderName) {
      return this.shouldBypassHookFolder(folderName);
    }

    // Default: don't bypass
    return false;
  }

  /**
   * Extract folder name from hook command path
   */
  static extractFolderFromHookCommand(hookCommand) {
    const match = hookCommand.match(/tools\/hooks\/([^\/]+)\//);
    return match ? match[1] : null;
  }

  /**
   * Get environment variable status for debugging
   */
  static getEnvStatus() {
    const folderStatus = {};
    Object.entries(this.FOLDER_ENV_MAP).forEach(([folder, envVar]) => {
      folderStatus[folder] = {
        envVar: envVar,
        value: process.env[envVar],
        bypassed: this.shouldBypassHookFolder(folder),
      };
    });

    return {
      HOOKS_TESTING_MODE: process.env.HOOKS_TESTING_MODE,
      HOOK_DEVELOPMENT: process.env.HOOK_DEVELOPMENT,
      HOOK_VERBOSE: process.env.HOOK_VERBOSE,
      shouldBypass: this.shouldBypassHooks(),
      isTestingMode: this.isTestingMode(),
      isDevelopmentMode: this.isDevelopmentMode(),
      folderStatus: folderStatus,
    };
  }

  /**
   * Get bypass reason for a specific hook command
   */
  static getHookBypassReason(hookCommand) {
    if (this.isTestingMode()) {
      return "HOOKS_TESTING_MODE=true";
    }
    if (this.isDevelopmentMode()) {
      return "HOOK_DEVELOPMENT=true";
    }

    const folderName = this.extractFolderFromHookCommand(hookCommand);
    if (folderName) {
      const envVar = this.FOLDER_ENV_MAP[folderName];
      if (envVar && process.env[envVar] === "false") {
        return `${envVar}=false`;
      }
    }

    return "unknown";
  }
}

module.exports = HookEnvUtils;
