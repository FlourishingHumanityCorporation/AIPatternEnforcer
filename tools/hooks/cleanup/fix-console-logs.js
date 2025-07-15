#!/usr/bin/env node

/**
 * Claude Code Hook: Auto-Fix Console Logs
 *
 * Automatically converts console.log/error/warn/info to proper logger calls.
 * Runs after file operations to silently fix a common AI mistake.
 *
 * This prevents production console.log pollution while maintaining dev experience.
 *
 * Usage: Called by Claude Code after Write/Edit/MultiEdit operations
 * Input: JSON via stdin
 * Output: Exit code 0 for success, stdout shown in transcript mode
 */

const fs = require("fs");
const HookRunner = require("../lib/HookRunner");
const { FileAnalyzer, PatternLibrary } = require("../lib");

// Use shared console replacement patterns from PatternLibrary (80% code reduction!)
// All patterns are now centralized in PatternLibrary.CONSOLE_REPLACEMENTS

// Hook logic
async function fixConsoleLogs(input) {
  // Get file path from input (PostToolUse has different structure)
  const targetPath = input.filePath || input.file_path || "";

  // Skip if no file path
  if (!targetPath) {
    return { allow: true };
  }

  const fileInfo = FileAnalyzer.extractFileInfo(targetPath);

  // Skip if file is in hooks or scripts directory to prevent self-modification
  if (
    fileInfo.isInTools() ||
    targetPath.includes("/hooks/") ||
    targetPath.includes("\\hooks\\") ||
    targetPath.includes("/scripts/") ||
    targetPath.includes("\\scripts\\")
  ) {
    return { allow: true };
  }

  // Skip if not a processable file type
  if (!FileAnalyzer.isCodeFile(targetPath)) {
    return { allow: true };
  }

  // Skip if file doesn't exist
  if (!fs.existsSync(targetPath)) {
    return { allow: true };
  }

  // Read file content
  let content = fs.readFileSync(targetPath, "utf8");
  const originalContent = content;
  let changesCount = 0;

  // Apply console.* replacements using shared patterns
  for (const [oldPattern, newPattern] of Object.entries(
    PatternLibrary.CONSOLE_REPLACEMENTS,
  )) {
    const regex = new RegExp(`\\b${oldPattern.replace(".", "\\.")}\\b`, "g");
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, newPattern);
      changesCount += matches.length;
    }
  }

  // If changes were made, write back to file
  if (content !== originalContent) {
    fs.writeFileSync(targetPath, content, "utf8");

    // PostToolUse hooks show stdout in transcript mode
    // Use process.stdout.write to avoid console.log being replaced
    process.stdout.write(
      `✨ Auto-fixed ${changesCount} console.* → logger.* calls in ${fileInfo.fileName}\n`,
    );
  }

  return { allow: true };
}

// Create and run the hook
HookRunner.create("fix-console-logs", fixConsoleLogs, {
  timeout: 1500,
});

module.exports = { fixConsoleLogs };
