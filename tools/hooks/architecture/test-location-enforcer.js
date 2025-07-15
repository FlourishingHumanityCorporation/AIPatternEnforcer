#!/usr/bin/env node

/**
 * Claude Code Hook: Test Location Enforcer
 *
 * Enforces proper test file organization and placement according to testing conventions.
 * Ensures tests are co-located with source files for better maintainability.
 */

const HookRunner = require("./lib/HookRunner");
const path = require("path");

const TEST_PATTERNS = {
  components: {
    pattern: /^(components|src\/components)/,
    testLocation: "co-located", // Component.test.tsx next to Component.tsx
  },
  apiRoutes: {
    pattern: /^(pages\/api|app\/api)/,
    testLocation: "co-located", // [route].test.ts next to [route].ts
  },
  utilities: {
    pattern: /^(lib|utils|src\/lib)/,
    testLocation: "co-located", // util.test.ts next to util.ts
  },
  hooks: {
    pattern: /^(hooks|src\/hooks)/,
    testLocation: "co-located", // useHook.test.ts next to useHook.ts
  },
  integration: {
    pattern: /^tests\//,
    testLocation: "centralized", // Top-level tests/ directory
  },
};

/**
 * Hook logic function - enforces test file organization
 * @param {Object} hookData - Parsed and standardized hook data
 * @param {HookRunner} runner - Hook runner instance for utilities
 * @returns {Object} Hook result
 */
function enforceTestLocation(hookData, runner) {
  // Allow operations without file paths
  if (!hookData.hasFilePath()) {
    return { allow: true };
  }

  const filePath = hookData.filePath || hookData.file_path;
  const fileName = path.basename(filePath);

  // Only validate test files
  if (!fileName.includes(".test.") && !fileName.includes(".spec.")) {
    return { allow: true };
  }

  // Check if this is a misplaced test file
  for (const [category, config] of Object.entries(TEST_PATTERNS)) {
    if (config.pattern.test(filePath)) {
      // For co-located tests, ensure they're next to source files
      if (config.testLocation === "co-located") {
        const sourceFile = filePath.replace(/\.(test|spec)\./, ".");
        const fs = require("fs");

        // Check if source file exists nearby
        const expectedSourcePath = path.resolve(
          path.dirname(filePath),
          path.basename(sourceFile),
        );

        // This is informational - we don't block test creation
        if (!fs.existsSync(expectedSourcePath)) {
          // Just log a warning but allow the operation
          console.warn(
            `⚠️  Test file created without corresponding source: ${expectedSourcePath}`,
          );
        }
      }
      return { allow: true };
    }
  }

  // Check for tests in wrong locations (e.g., components in tests/)
  if (filePath.startsWith("tests/") && fileName.includes("component")) {
    const message = runner.formatError(
      `Test file should be co-located with component`,
      `❌ ${fileName} is in tests/ directory`,
      `✅ Move to components/ directory next to the component file`,
      `Co-located tests improve maintainability and discoverability`,
    );

    return {
      block: true,
      message,
    };
  }

  // Allow all other test file operations
  return { allow: true };
}

// Create and run the hook
HookRunner.create("test-location-enforcer", enforceTestLocation, {
  timeout: 3000,
});

module.exports = { TEST_PATTERNS, enforceTestLocation };
