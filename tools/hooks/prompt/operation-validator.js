#!/usr/bin/env node

/**
 * Operation Validator
 *
 * Ensures prompt matches intended operation
 * Prevents destructive operations without confirmation
 */

const { HookRunner } = require("../lib");
const { isDestructiveOperation } = require("../lib/shared-utils");
const { PATTERNS, MESSAGES } = require("../lib/constants");

function operationValidator(hookData, runner) {
  try {
    const startTime = Date.now();

    // Check tool operation type
    const toolName = hookData.tool_name || "";
    const filePath = hookData.file_path || hookData.tool_input?.file_path || "";
    const content = hookData.content || hookData.new_string || "";
    const prompt = hookData.prompt || hookData.instruction || "";

    // Check for mismatched operations
    const operationMismatches = [
      {
        condition:
          toolName === "Write" &&
          filePath &&
          require("../lib/shared-utils").fileExists(filePath),
        message: "Using Write on existing file - use Edit instead",
      },
      {
        condition:
          toolName === "Edit" &&
          !require("../lib/shared-utils").fileExists(filePath),
        message: "Using Edit on non-existent file - use Write instead",
      },
      {
        condition: toolName === "MultiEdit" && content.split("\n").length < 10,
        message: "Using MultiEdit for small change - use Edit instead",
      },
    ];

    for (const { condition, message } of operationMismatches) {
      if (condition) {
        console.warn(
          [
            "",
            `⚠️  Operation Mismatch: ${message}`,
            "💡 Using the right tool improves AI accuracy",
            "",
          ].join("\n"),
        );
        break;
      }
    }

    // Check for destructive operations
    if (isDestructiveOperation(hookData)) {
      const hasExplicitConfirmation =
        prompt.includes("yes") ||
        prompt.includes("confirm") ||
        prompt.includes("sure") ||
        prompt.includes("definitely");

      if (!hasExplicitConfirmation) {
        return runner.block(
          [
            "⚠️  Destructive Operation Detected",
            "",
            "❌ This operation appears to be destructive:",
            `   Tool: ${toolName}`,
            `   File: ${filePath}`,
            "",
            "🔍 Detected patterns:",
            "   • Delete/remove all",
            "   • Clear/truncate data",
            "   • Drop tables/collections",
            "",
            "⚡ To proceed, add explicit confirmation:",
            '   "Yes, delete all user data"',
            '   "Confirm: drop the products table"',
            "",
            "✅ Safety tips:",
            "   • Make backups first",
            "   • Test in development",
            "   • Use version control",
            "   • Consider soft deletes",
          ].join("\n"),
        );
      }
    }

    // Validate operation scope
    const scopeValidations = [
      {
        pattern: /all files|entire project|everything/i,
        warning:
          "Operation affects entire project - be specific about which files",
      },
      {
        pattern: /delete.*test|remove.*spec/i,
        warning: "Removing tests - are you sure?",
      },
      {
        pattern: /disable.*lint|ignore.*error/i,
        warning:
          "Disabling quality checks - consider fixing the issues instead",
      },
    ];

    const allContent = JSON.stringify(hookData).toLowerCase();

    for (const { pattern, warning } of scopeValidations) {
      if (pattern.test(allContent)) {
        console.warn(["", `⚠️  Scope Warning: ${warning}`, ""].join("\n"));
        break;
      }
    }

    // Check for common operation mistakes
    if (toolName === "Write" && filePath.includes("_improved")) {
      return runner.block(
        [
          "🚫 Operation Pattern Error",
          "",
          '❌ Creating an "_improved" file detected',
          "",
          "✅ Correct approach:",
          "   1. Use Edit tool on the original file",
          "   2. Make improvements directly",
          "   3. Use git for version history",
          "",
          "This maintains clean project structure.",
        ].join("\n"),
      );
    }

    // Track operation patterns
    const state = require("../lib/state-manager").readState();
    const operationHistory = state.operationHistory || [];

    operationHistory.push({
      timestamp: Date.now(),
      tool: toolName,
      fileType: filePath.split(".").pop() || "unknown",
      isDestructive: isDestructiveOperation(hookData),
    });

    // Keep last 100 operations
    if (operationHistory.length > 100) {
      operationHistory.shift();
    }

    require("../lib/state-manager").updateState({ operationHistory });

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(
        `Operation validation took ${executionTime}ms (target: <50ms)`,
      );
    }

    return runner.allow();
  } catch (error) {
    console.error(`Operation validation failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("operation-validator", operationValidator, {
  timeout: 50,
  priority: "high",
  family: "prompt",
});
