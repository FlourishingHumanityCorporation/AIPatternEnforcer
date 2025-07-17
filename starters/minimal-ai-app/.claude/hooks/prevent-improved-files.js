#!/usr/bin/env node

/**
 * Simplified Claude Code Hook: Prevent AI from creating _improved, _enhanced, _v2 files
 *
 * This is a standalone version for the AI app starter template.
 * It provides the core AI pattern protection without requiring the full hook infrastructure.
 */

const fs = require("fs");
const path = require("path");

// Anti-patterns that lead to code duplication and maintenance issues
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

async function main() {
  try {
    // Read input from Claude Code
    const input = await readStdin();
    let parsedInput;

    try {
      parsedInput = input ? JSON.parse(input) : {};
    } catch (e) {
      // Not valid JSON, exit silently
      process.exit(0);
    }

    // Check if we should bypass hooks
    if (process.env.HOOKS_DISABLED === "true") {
      process.exit(0);
    }

    // Extract file path from input
    const filePath =
      parsedInput.tool_input?.file_path ||
      parsedInput.file_path ||
      parsedInput.path;

    if (!filePath) {
      // No file path, allow operation
      process.exit(0);
    }

    // Check for bad patterns
    const fileName = path.basename(filePath);
    const matchedPattern = BAD_PATTERNS.find((pattern) =>
      pattern.test(fileName),
    );

    if (matchedPattern) {
      const errorMessage = [
        "❌ AI File Naming Anti-Pattern Detected",
        "",
        `File: ${fileName}`,
        `Pattern: ${matchedPattern.source}`,
        "",
        "💡 Instead of creating versioned files:",
        "✅ Edit the original file directly",
        "✅ Use git branches for different versions",
        "✅ Use the MultiEdit tool for multiple changes",
        "",
        "This prevents code duplication and maintains a clean codebase.",
      ].join("\n");

      process.stderr.write(errorMessage + "\n");
      process.exit(1); // Block the operation
    }

    // Allow the operation
    process.exit(0);
  } catch (error) {
    // Fail gracefully - don't block operations due to hook errors
    process.exit(0);
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";

    process.stdin.on("data", (chunk) => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      resolve(data);
    });

    // Timeout after 1 second
    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
}

main();
