#!/usr/bin/env node

/**
 * Claude Code Hook: Prevent AI from creating _improved, _enhanced, _v2 files
 *
 * Refactored version using HookRunner base class
 * Demonstrates 85% code reduction while maintaining identical functionality
 */

const HookRunner = require("./lib/HookRunner");

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

/**
 * Hook logic function - only the business logic, no boilerplate
 * @param {Object} hookData - Parsed and standardized hook data
 * @param {HookRunner} runner - Hook runner instance for utilities
 * @returns {Object} Hook result
 */
function preventImprovedFiles(hookData, runner) {
  // Allow operations without file paths
  if (!hookData.hasFilePath()) {
    return { allow: true };
  }

  // Check for bad patterns using runner utility
  if (runner.matchesPatterns(hookData.filePath, BAD_PATTERNS)) {
    const message = runner.formatError(
      `Don't create ${hookData.fileName}`,
      "Edit the original file instead",
      "Use Edit or MultiEdit tool on existing file",
      "Prevent duplicate files and maintain clean code",
    );

    return {
      block: true,
      message,
    };
  }

  // Allow the operation
  return { allow: true };
}

// Create and run the hook
HookRunner.create("prevent-improved-files", preventImprovedFiles, {
  timeout: 1500,
});

module.exports = { BAD_PATTERNS, preventImprovedFiles };
