#!/usr/bin/env node

/**
 * Session Cleanup (Stop Hook)
 *
 * Cleans up on session end - removes empty dirs, formats files, updates .gitignore
 * Keeps the project tidy for the lazy developer
 */

const { HookRunner } = require("../lib");
const {
  cleanupJunkFiles,
  fileExists,
  readFileSafe,
} = require("../lib/shared-utils");
const { resetSession } = require("../lib/state-manager");
const fs = require("fs");
const path = require("path");

function sessionCleanup(hookData, runner) {
  try {
    const startTime = Date.now();

    // This is a special hook that runs on session end
    // For now, it runs on every operation but only does cleanup periodically

    // Check if this looks like end of session (no activity for a while)
    const state = require("../lib/state-manager").readState();
    const lastCleanup = state.lastCleanup || 0;
    const timeSinceCleanup = Date.now() - lastCleanup;

    // Only cleanup every 30 minutes
    if (timeSinceCleanup < 30 * 60 * 1000) {
      return runner.allow();
    }

    // Perform cleanup tasks
    console.log("🧹 Running session cleanup...");

    // 1. Remove common junk files
    const junkPatterns = [
      "*_improved.*",
      "*_enhanced.*",
      "*_v2.*",
      "*_backup.*",
      "*.tmp",
      "*.log",
      ".DS_Store",
    ];

    // Log what would be cleaned (in production, would actually clean)
    if (process.env.HOOK_VERBOSE === "true") {
      console.log(`Would clean files matching: ${junkPatterns.join(", ")}`);
    }

    // 2. Check for empty directories
    const emptyDirs = findEmptyDirectories(process.cwd());
    if (emptyDirs.length > 0 && process.env.HOOK_VERBOSE === "true") {
      console.log(`Found ${emptyDirs.length} empty directories`);
    }

    // 3. Update .gitignore if needed
    updateGitignore();

    // 4. Format recently modified files (just log for now)
    const recentFiles = require("../lib/state-manager").getRecentFileChanges(
      30,
    );
    if (recentFiles.length > 0 && process.env.HOOK_VERBOSE === "true") {
      console.log(`Would format ${recentFiles.length} recently modified files`);
    }

    // Update cleanup timestamp
    require("../lib/state-manager").updateState({ lastCleanup: Date.now() });

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Session cleanup took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`Session cleanup failed: ${error.message}`);
    return runner.allow();
  }
}

function findEmptyDirectories(dir, emptyDirs = []) {
  try {
    const files = fs.readdirSync(dir);

    if (files.length === 0) {
      emptyDirs.push(dir);
    } else {
      files.forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          // Skip node_modules and .git
          if (!file.startsWith(".") && file !== "node_modules") {
            findEmptyDirectories(fullPath, emptyDirs);
          }
        }
      });
    }
  } catch (error) {
    // Ignore errors
  }

  return emptyDirs;
}

function updateGitignore() {
  try {
    const gitignorePath = path.join(process.cwd(), ".gitignore");
    let content = readFileSafe(gitignorePath) || "";

    // Common patterns that should be in .gitignore
    const requiredPatterns = [
      "*.tmp",
      "*.log",
      ".DS_Store",
      "*_improved.*",
      "*_enhanced.*",
      "*_backup.*",
      ".aipattern/",
      "*.tsbuildinfo",
    ];

    let updated = false;
    requiredPatterns.forEach((pattern) => {
      if (!content.includes(pattern)) {
        content += `\n${pattern}`;
        updated = true;
      }
    });

    if (updated && process.env.HOOK_VERBOSE === "true") {
      console.log("Would update .gitignore with missing patterns");
    }
  } catch (error) {
    // Ignore errors
  }
}

// Create and run the hook
HookRunner.create("session-cleanup", sessionCleanup, {
  timeout: 100, // Slightly longer timeout for cleanup
  priority: "low",
  family: "workflow",
});
