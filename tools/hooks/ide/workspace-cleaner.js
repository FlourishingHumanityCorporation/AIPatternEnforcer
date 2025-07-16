#!/usr/bin/env node

/**
 * Workspace Cleaner
 *
 * Removes common AI-generated junk files
 * Keeps the workspace clean and focused
 */

const { HookRunner } = require("../lib");
const { PATTERNS } = require("../lib/constants");
const path = require("path");

function workspaceCleaner(hookData, runner) {
  try {
    const startTime = Date.now();

    // Check if creating a junk file
    const filePath = hookData.file_path || hookData.tool_input?.file_path || "";
    const fileName = path.basename(filePath);

    // Only check Write operations
    if (hookData.tool_name !== "Write") {
      return runner.allow();
    }

    // Check against junk patterns
    const isJunkFile =
      PATTERNS.IMPROVED_FILES.some((pattern) => pattern.test(fileName)) ||
      PATTERNS.TEMP_FILES.some((pattern) => pattern.test(fileName));

    if (isJunkFile) {
      // Find which pattern matched
      const matchedPattern = [
        ...PATTERNS.IMPROVED_FILES,
        ...PATTERNS.TEMP_FILES,
      ].find((pattern) => pattern.test(fileName));

      return runner.block(
        [
          "🗑️ Junk File Detected",
          "",
          `❌ Attempting to create: ${fileName}`,
          `   Matches pattern: ${matchedPattern?.source || "junk file pattern"}`,
          "",
          "💡 This appears to be a temporary or versioned file.",
          "",
          "✅ Better alternatives:",
          "  • Edit the original file directly",
          "  • Use version control (git) for history",
          "  • Create meaningful file names",
          "",
          "📋 Common junk patterns blocked:",
          "  • *_improved.* → Edit original instead",
          "  • *_backup.* → Use git for backups",
          "  • *.tmp → Use proper file extensions",
          "  • *_v2.* → Use git branches for versions",
        ].join("\n"),
      );
    }

    // Check for other workspace pollution patterns
    const pollutionPatterns = [
      { pattern: /^test\d*\.(js|py|txt)$/i, message: "Generic test file" },
      { pattern: /^untitled/i, message: "Untitled file" },
      { pattern: /^new file/i, message: "Generic new file" },
      { pattern: /^temp/i, message: "Temporary file" },
      { pattern: /\(\d+\)\./i, message: "Duplicate file (1), (2), etc." },
    ];

    for (const { pattern, message } of pollutionPatterns) {
      if (pattern.test(fileName)) {
        console.warn(
          [
            "",
            `⚠️  Workspace Pollution Warning: ${message}`,
            `   File: ${fileName}`,
            "💡 Use descriptive, meaningful file names",
            "",
          ].join("\n"),
        );
        break;
      }
    }

    // Periodic cleanup reminder
    const state = require("../lib/state-manager").readState();
    const fileCount = (state.changedFiles || []).length;

    if (fileCount > 50 && fileCount % 10 === 0) {
      console.log(
        [
          "",
          "🧹 Workspace Cleanup Reminder",
          `📊 ${fileCount} files changed this session`,
          "💡 Consider cleaning up:",
          "   • Remove unused files",
          "   • Delete empty directories",
          "   • Run: git clean -n (preview)",
          "",
        ].join("\n"),
      );
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Workspace check took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`Workspace cleaning failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("workspace-cleaner", workspaceCleaner, {
  timeout: 50,
  priority: "medium",
  family: "ide",
});
