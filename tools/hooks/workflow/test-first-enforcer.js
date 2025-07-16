#!/usr/bin/env node

/**
 * Test-First Enforcer
 *
 * Ensures test files exist before implementation
 * Promotes TDD practices for better code quality
 */

const { HookRunner } = require("../lib");
const {
  isCodeFile,
  hasTestFile,
  getTestFilePath,
} = require("../lib/shared-utils");
const { FILE_EXTENSIONS } = require("../lib/constants");
const path = require("path");

function testFirstEnforcer(hookData, runner) {
  try {
    const startTime = Date.now();

    // Only check Write operations for new files
    if (hookData.tool_name !== "Write") {
      return runner.allow();
    }

    const filePath = hookData.file_path || hookData.tool_input?.file_path;
    if (!filePath) {
      return runner.allow();
    }

    // Skip if this is a test file itself
    const fileName = path.basename(filePath).toLowerCase();
    if (FILE_EXTENSIONS.TEST.some((ext) => fileName.includes(ext))) {
      return runner.allow();
    }

    // Only enforce for code files
    if (!isCodeFile(filePath)) {
      return runner.allow();
    }

    // Skip for utility files, configs, etc.
    const skipPatterns = [
      "config",
      "util",
      "helper",
      "constant",
      "type",
      "interface",
      "mock",
      "fixture",
      "seed",
      "migration",
    ];

    if (skipPatterns.some((pattern) => fileName.includes(pattern))) {
      return runner.allow();
    }

    // Check if it's a component or feature file
    const componentPatterns = [
      "component",
      "service",
      "controller",
      "model",
      "view",
      "page",
      "hook",
      "provider",
      "context",
    ];

    const isComponent = componentPatterns.some(
      (pattern) =>
        fileName.includes(pattern) || filePath.includes(`${pattern}s/`), // in a components/ directory
    );

    if (isComponent && !hasTestFile(filePath)) {
      const testPath = getTestFilePath(filePath);
      const testFileName = path.basename(testPath);

      return runner.block(
        [
          "🧪 Test-First Development Required",
          "",
          `❌ Creating ${path.basename(filePath)} without a test file`,
          "",
          "💡 Create the test file first:",
          `  1. Create ${testFileName}`,
          "  2. Write test cases for expected behavior",
          "  3. Then implement the component",
          "",
          "✅ Benefits of Test-First:",
          "  • Clear specification of behavior",
          "  • Better API design",
          "  • Confidence in refactoring",
          "  • Living documentation",
          "",
          `📝 Suggested test location: ${testPath}`,
        ].join("\n"),
      );
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Test check took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`Test enforcement failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("test-first-enforcer", testFirstEnforcer, {
  timeout: 50,
  priority: "high",
  family: "workflow",
});
