#!/usr/bin/env node

/**
 * Architecture Checker
 *
 * Detects when files are created in wrong directories
 * Enforces proper project structure
 */

const { HookRunner } = require("../lib");
const {
  isInRootDirectory,
  shouldBeInRoot,
  isCodeFile,
} = require("../lib/shared-utils");
const { FILE_STRUCTURE } = require("../lib/constants");
const path = require("path");

function architectureChecker(hookData, runner) {
  try {
    const startTime = Date.now();

    // Only check Write operations
    if (hookData.tool_name !== "Write") {
      return runner.allow();
    }

    const filePath = hookData.file_path || hookData.tool_input?.file_path;
    if (!filePath) {
      return runner.allow();
    }

    const fileName = path.basename(filePath);
    const dirPath = path.dirname(filePath);
    const isRoot = isInRootDirectory(filePath);

    // Check if file is in root but shouldn't be
    if (isRoot && isCodeFile(filePath) && !shouldBeInRoot(fileName)) {
      // Suggest proper location based on file type
      let suggestedLocation = "";

      if (
        fileName.includes("component") ||
        fileName.endsWith(".tsx") ||
        fileName.endsWith(".jsx")
      ) {
        suggestedLocation = "components/";
      } else if (fileName.includes("test") || fileName.includes("spec")) {
        suggestedLocation = "__tests__/ or tests/";
      } else if (fileName.includes("util") || fileName.includes("helper")) {
        suggestedLocation = "lib/ or utils/";
      } else if (fileName.includes("hook")) {
        suggestedLocation = "hooks/";
      } else if (fileName.includes("service") || fileName.includes("api")) {
        suggestedLocation = "services/ or api/";
      } else {
        suggestedLocation = "src/";
      }

      return runner.block(
        [
          "🏗️ Architecture Violation: Root Directory",
          "",
          `❌ Creating "${fileName}" in root directory`,
          "",
          "📁 Application code should be organized in subdirectories:",
          `  • Components → ${suggestedLocation}`,
          "  • Business logic → lib/ or services/",
          "  • Tests → __tests__/ or tests/",
          "  • Utilities → utils/ or lib/",
          "",
          "✅ Root directory is only for:",
          "  • Project config (package.json, tsconfig.json)",
          "  • Documentation (README.md, CLAUDE.md)",
          "  • Build configs (.eslintrc, .prettierrc)",
          "",
          `💡 Move this file to: ${suggestedLocation}${fileName}`,
        ].join("\n"),
      );
    }

    // Check for common misplacements
    const misplacementChecks = [
      {
        pattern: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
        wrongDirs: ["components/", "lib/", "utils/"],
        rightDir: "__tests__/",
        message: "Test files should be in __tests__/ directory",
      },
      {
        pattern: /Component\.(jsx|tsx)$/,
        wrongDirs: ["lib/", "utils/", "helpers/"],
        rightDir: "components/",
        message: "React components should be in components/ directory",
      },
    ];

    for (const check of misplacementChecks) {
      if (check.pattern.test(fileName)) {
        const isWrongDir = check.wrongDirs.some((dir) => dirPath.includes(dir));
        if (isWrongDir && !dirPath.includes(check.rightDir)) {
          console.warn(
            [
              "",
              `⚠️  Architecture Warning: ${check.message}`,
              `   Current: ${filePath}`,
              `   Suggested: ${check.rightDir}${fileName}`,
              "",
            ].join("\n"),
          );
        }
      }
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(
        `Architecture check took ${executionTime}ms (target: <50ms)`,
      );
    }

    return runner.allow();
  } catch (error) {
    console.error(`Architecture check failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("architecture-checker", architectureChecker, {
  timeout: 50,
  priority: "high",
  family: "workflow",
});
