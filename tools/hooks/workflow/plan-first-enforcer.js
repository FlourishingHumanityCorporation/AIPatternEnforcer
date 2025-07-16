#!/usr/bin/env node

/**
 * Plan-First Enforcer
 *
 * Ensures developers create a plan before implementing features
 * Prevents the "code first, think later" anti-pattern
 */

const { HookRunner } = require("../lib");
const {
  isNewFeature,
  hasPlanFile,
  getPlanFilePath,
} = require("../lib/shared-utils");
const { MESSAGES } = require("../lib/constants");

function planFirstEnforcer(hookData, runner) {
  try {
    const startTime = Date.now();

    // Only check for Write/Edit operations
    if (!["Write", "Edit", "MultiEdit"].includes(hookData.tool_name)) {
      return runner.allow();
    }

    // Check if this looks like a new feature
    if (!isNewFeature(hookData)) {
      return runner.allow();
    }

    // Check if creating the plan file itself
    const filePath = hookData.file_path || hookData.tool_input?.file_path || "";
    if (
      filePath.toLowerCase().includes("plan") ||
      filePath.toLowerCase().includes("todo")
    ) {
      return runner.allow();
    }

    // Check for existing plan
    if (!hasPlanFile()) {
      return runner.block(
        [
          "📋 Plan-First Development Required",
          "",
          "❌ New feature detected without a plan document",
          "",
          "💡 Create a plan first:",
          "  1. Create PLAN.md in the project root",
          "  2. Outline your approach and architecture",
          "  3. List key implementation steps",
          "  4. Consider edge cases and testing strategy",
          "",
          "✅ Benefits:",
          "  • Clearer implementation path",
          "  • Better AI assistance with context",
          "  • Fewer refactoring cycles",
          "  • Documentation for future reference",
          "",
          `📝 Suggested location: ${getPlanFilePath()}`,
        ].join("\n"),
      );
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Plan check took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`Plan enforcement failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("plan-first-enforcer", planFirstEnforcer, {
  timeout: 50,
  priority: "high",
  family: "workflow",
});
