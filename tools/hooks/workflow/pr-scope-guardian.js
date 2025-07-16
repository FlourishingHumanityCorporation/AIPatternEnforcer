#!/usr/bin/env node

/**
 * PR Scope Guardian
 *
 * Prevents oversized PRs by monitoring file changes
 * Encourages smaller, focused pull requests
 */

const { HookRunner } = require("../lib");
const {
  getRecentFileChanges,
  trackFileChange,
} = require("../lib/state-manager");
const { SESSION_LIMITS } = require("../lib/constants");

function prScopeGuardian(hookData, runner) {
  try {
    const startTime = Date.now();

    // Track all file changes
    const filePath = hookData.file_path || hookData.tool_input?.file_path;
    if (filePath) {
      trackFileChange(filePath);
    }

    // Only warn for Write/Edit operations
    if (!["Write", "Edit", "MultiEdit"].includes(hookData.tool_name)) {
      return runner.allow();
    }

    // Get changed files in current session
    const changedFiles = getRecentFileChanges(240); // Last 4 hours
    const uniqueFiles = [...new Set(changedFiles)];

    // Check against PR size limits
    const fileCount = uniqueFiles.length;
    const isGettingLarge = fileCount > SESSION_LIMITS.MAX_PR_FILES;
    const isTooLarge = fileCount > SESSION_LIMITS.MAX_PR_FILES * 1.5;

    if (isTooLarge) {
      return runner.block(
        [
          "🚨 PR Scope Too Large",
          "",
          `❌ ${fileCount} files changed (limit: ${SESSION_LIMITS.MAX_PR_FILES})`,
          "",
          "💡 Your PR is getting too large to review effectively.",
          "",
          "📋 Consider:",
          "  1. Commit current changes to a feature branch",
          "  2. Create a PR for completed work",
          "  3. Start a new branch for additional changes",
          "",
          "✅ Benefits of smaller PRs:",
          "  • Faster review cycles",
          "  • Easier to spot issues",
          "  • Less merge conflicts",
          "  • Clearer change history",
          "",
          "🔍 Changed files:",
          ...uniqueFiles.slice(0, 10).map((f) => `  • ${f}`),
          uniqueFiles.length > 10
            ? `  ... and ${uniqueFiles.length - 10} more`
            : "",
        ].join("\n"),
      );
    }

    if (isGettingLarge) {
      // Just warn, don't block
      console.warn(
        [
          "",
          `⚠️  PR Scope Warning: ${fileCount} files changed`,
          `💡 Consider splitting into smaller PRs after ${SESSION_LIMITS.MAX_PR_FILES} files`,
          "",
        ].join("\n"),
      );
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`PR scope check took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`PR scope check failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("pr-scope-guardian", prScopeGuardian, {
  timeout: 50,
  priority: "medium",
  family: "workflow",
});
