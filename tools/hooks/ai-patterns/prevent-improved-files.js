#!/usr/bin/env node

/**
 * Claude Code Hook: Prevent AI from creating _improved, _enhanced, _v2 files
 *
 * Refactored version using HookRunner base class
 * Demonstrates 85% code reduction while maintaining identical functionality
 */

const HookRunner = require("../lib/HookRunner");

const BAD_PATTERNS = [
  // Core patterns that prevent AI from creating versioned files
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
  const filePath = hookData.filePath || hookData.file_path;
  if (runner.matchesPatterns(filePath, BAD_PATTERNS)) {
    const ErrorFormatter = require("../lib/ErrorFormatter");

    // Find which pattern was matched for better context
    const matchedPattern = BAD_PATTERNS.find((pattern) =>
      pattern.test(filePath),
    );
    const patternName = matchedPattern ? matchedPattern.source : "unknown";

    const message = ErrorFormatter.formatComprehensiveError({
      title: "AI File Naming Anti-Pattern Detected",
      details: [
        `File name contains prohibited pattern: ${hookData.fileName}`,
        "AI tools should edit original files, not create versioned copies",
        "This pattern leads to code duplication and maintenance issues",
      ],
      hookName: "prevent-improved-files",
      filePath: filePath,
      pattern: patternName,
      errorType: "improved-file",
      executionTime: Date.now() - (runner.startTime || Date.now()),
      suggestions: [
        "Use the Edit tool to modify the existing file",
        "Use the MultiEdit tool for multiple changes to the same file",
        'Create meaningful branch names like "feature/new-component" instead of file suffixes',
      ],
    });

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
