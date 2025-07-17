#!/usr/bin/env node

/**
 * Hook Environment Utilities
 *
 * Centralized environment variable checking for Claude Code hooks.
 * Provides consistent testing mode support across all hooks.
 */

class HookEnvUtils {
  /**
   * Ensure environment variables are loaded from .env file
   */
  static ensureEnvLoaded() {
    if (this._envLoaded) return;
    
    const fs = require("fs");
    const path = require("path");
    
    try {
      const envPath = path.join(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const lines = envContent.split("\n");
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith("#")) {
            const [key, ...valueParts] = trimmedLine.split("=");
            if (key && valueParts.length > 0) {
              const value = valueParts.join("=").trim();
              // Only set if not already set
              if (!process.env[key.trim()]) {
                process.env[key.trim()] = value;
              }
            }
          }
        }
      }
      this._envLoaded = true;
    } catch (error) {
      // Fail silently if .env file cannot be read
    }
  }

  /**
   * Folder name to environment variable mapping
   */
  static FOLDER_ENV_MAP = {
    "ai-patterns": "HOOK_AI_PATTERNS",
    architecture: "HOOK_ARCHITECTURE",
    cleanup: "HOOK_CLEANUP",
    context: "HOOK_CONTEXT",
    ide: "HOOK_IDE",
    ui: "HOOK_UI",
    state: "HOOK_STATE",
    ai: "HOOK_AI",
    database: "HOOK_DATABASE",
    engine: "HOOK_ENGINE",
    learning: "HOOK_LEARNING",
    "local-dev": "HOOK_LOCAL_DEV",
    logs: "HOOK_LOGS",
    performance: "HOOK_PERFORMANCE",
    prompt: "HOOK_PROMPT",
    "project-boundaries": "HOOK_PROJECT_BOUNDARIES",
    security: "HOOK_SECURITY",
    tools: "HOOK_TOOLS",
    "ui-framework": "HOOK_UI_FRAMEWORK",
    validation: "HOOK_VALIDATION",
    workflow: "HOOK_WORKFLOW",
  };

  /**
   * Check if hooks should be bypassed globally
   */
  static shouldBypassHooks() {
    this.ensureEnvLoaded();
    return process.env.HOOKS_DISABLED === "true";
  }


  /**
   * Get bypass reason for logging/debugging
   */
  static getBypassReason() {
    this.ensureEnvLoaded();
    if (process.env.HOOKS_DISABLED === "true") {
      return "HOOKS_DISABLED=true";
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
    this.ensureEnvLoaded();
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
    this.ensureEnvLoaded();
    const folderStatus = {};
    Object.entries(this.FOLDER_ENV_MAP).forEach(([folder, envVar]) => {
      folderStatus[folder] = {
        envVar: envVar,
        value: process.env[envVar],
        bypassed: this.shouldBypassHookFolder(folder),
      };
    });

    return {
      HOOKS_DISABLED: process.env.HOOKS_DISABLED,
      HOOK_VERBOSE: process.env.HOOK_VERBOSE,
      shouldBypass: this.shouldBypassHooks(),
      folderStatus: folderStatus,
    };
  }

  /**
   * Get bypass reason for a specific hook command
   */
  static getHookBypassReason(hookCommand) {
    if (this.shouldBypassHooks()) {
      return "HOOKS_DISABLED=true";
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
