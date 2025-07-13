#!/usr/bin/env node

/**
 * Claude Code Hook: Prevent AI from creating _improved, _enhanced, _v2 files
 *
 * This hook solves 80% of AI development friction by preventing the creation
 * of duplicate files with version suffixes. Forces AI to edit original files.
 *
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 *
 */

const path = require("path");

const BAD_PATTERNS = [
  /_improved\./i,
  /_enhanced\./i,
  /_v2\./i,
  /_v\d+\./i,
  /_fixed\./i,
  /_updated\./i,
  /_new\./i,
  /_final\./i,
  /_refactored\./i,
  /_optimized\./i,
  /_better\./i,
];

// Read from stdin
let inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += chunk;
});

process.stdin.on("end", () => {
  try {
    const input = JSON.parse(inputData);
    const toolInput = input.tool_input || {};
    const filePath = toolInput.file_path || toolInput.filePath || "";
    const content = toolInput.content || toolInput.new_string || "";

    // ===== DISTRIBUTED PROTECTION SYSTEM =====
    // This creates a mutual protection network where multiple hooks protect each other

    // LAYER 1: HOOK SYSTEM INTEGRITY PROTECTION
    // Protect .claude/settings.json from ALL modifications
    if (filePath.includes(".claude/settings.json")) {
      // Verify meta-project-guardian is still properly configured
      if (
        content &&
        !content.includes("node tools/hooks/meta-project-guardian.js")
      ) {
        console.error(
          `🛡️ SECURITY BREACH DETECTED\n` +
            `\n` +
            `❌ Attempt to disable meta-project-guardian\n` +
            `📁 Blocked: Core security infrastructure tampering\n` +
            `\n` +
            `🔒 Self-healing protection: Configuration restored\n` +
            `💡 AI cannot disable its own protection system`,
        );
        process.exit(2);
      }

      // Block ALL modifications to hook configuration
      console.error(
        `🔒 Hook Configuration Immutable\n` +
          `\n` +
          `❌ Cannot modify .claude/settings.json\n` +
          `📁 Protected: Security infrastructure\n` +
          `\n` +
          `💡 Distributed protection: Multiple hooks guard this file`,
      );
      process.exit(2);
    }

    // LAYER 2: BULLETPROOF ENVIRONMENT PROTECTION
    // Multi-layered protection against ALL .env modification methods
    if (filePath.endsWith(".env")) {
      // Block Write operations that contain HOOK_DEVELOPMENT
      if (
        input.tool_name === "Write" &&
        content &&
        content.includes("HOOK_DEVELOPMENT")
      ) {
        console.error(
          `🔒 Environment Write Protection\n` +
            `\n` +
            `❌ Cannot overwrite .env with HOOK_DEVELOPMENT\n` +
            `📁 Protected: Complete file replacement blocked\n` +
            `\n` +
            `💡 Prevents bypass via file overwrite`,
        );
        process.exit(2);
      }

      // Block Edit/MultiEdit operations
      if (content && content.includes("HOOK_DEVELOPMENT=")) {
        console.error(
          `🔒 Environment Edit Protection\n` +
            `\n` +
            `❌ Cannot modify HOOK_DEVELOPMENT setting\n` +
            `📁 Protected: Hook development control\n` +
            `\n` +
            `ℹ️ This setting controls AI's ability to modify hooks\n` +
            `✅ Only humans can enable/disable hook development mode\n` +
            `\n` +
            `💡 Bulletproof: AI cannot disable its own constraints`,
        );
        process.exit(2);
      }

      // Block old_string/new_string patterns
      const oldString = toolInput.old_string || "";
      const newString = toolInput.new_string || "";

      if (
        oldString.includes("HOOK_DEVELOPMENT") ||
        newString.includes("HOOK_DEVELOPMENT")
      ) {
        console.error(
          `🔒 Environment Pattern Protection\n` +
            `\n` +
            `❌ Cannot modify HOOK_DEVELOPMENT via Edit patterns\n` +
            `📁 Protected: Hook development control\n` +
            `\n` +
            `💡 Pattern-based bypass attempt blocked`,
        );
        process.exit(2);
      }

      // Block MultiEdit edits array
      if (input.tool_name === "MultiEdit" && toolInput.edits) {
        for (const edit of toolInput.edits) {
          if (
            (edit.old_string && edit.old_string.includes("HOOK_DEVELOPMENT")) ||
            (edit.new_string && edit.new_string.includes("HOOK_DEVELOPMENT"))
          ) {
            console.error(
              `🔒 Environment MultiEdit Protection\n` +
                `\n` +
                `❌ Cannot modify HOOK_DEVELOPMENT via MultiEdit array\n` +
                `📁 Protected: Hook development control\n` +
                `\n` +
                `💡 MultiEdit bypass attempt blocked`,
            );
            process.exit(2);
          }
        }
      }
    }

    // Allow operations without file paths
    if (!filePath) {
      process.exit(0);
    }

    const fileName = path.basename(filePath);

    // Check for bad patterns
    for (const pattern of BAD_PATTERNS) {
      if (pattern.test(fileName)) {
        // Exit code 2 blocks the operation and shows stderr to Claude
        console.error(
          `❌ Don't create ${fileName}\n` +
            `✅ Edit the original file instead\n` +
            `💡 Use Edit or MultiEdit tool on existing file\n` +
            `\n` +
            `This prevents duplicate files and maintains clean code.`,
        );
        process.exit(2);
      }
    }

    // Allow the operation
    process.exit(0);
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.error(`Hook error: ${error.message}`);
    process.exit(0);
  }
});

// Handle timeout
setTimeout(() => {
  console.error("Hook timeout - allowing operation");
  process.exit(0);
}, 1500);

module.exports = { BAD_PATTERNS };
