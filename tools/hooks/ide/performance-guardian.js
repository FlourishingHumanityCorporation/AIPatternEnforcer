#!/usr/bin/env node

/**
 * Performance Guardian (IDE Integration)
 *
 * Detects obviously bad performance patterns in code
 * Helps lazy developers avoid common performance pitfalls
 */

const { HookRunner } = require("../lib");
const { isCodeFile } = require("../lib/shared-utils");

function performanceGuardian(hookData, runner) {
  try {
    const startTime = Date.now();

    // Only check code files
    const filePath = hookData.file_path || hookData.tool_input?.file_path || "";
    if (!isCodeFile(filePath)) {
      return runner.allow();
    }

    // Only check content modifications
    const content = hookData.content || hookData.new_string || "";
    if (!content) {
      return runner.allow();
    }

    // Performance anti-patterns to detect
    const antiPatterns = [
      {
        pattern:
          /for\s*\([^)]*\)\s*{[^}]*for\s*\([^)]*\)\s*{[^}]*for\s*\([^)]*\)/s,
        message: "Triple nested loops detected",
        severity: "high",
        suggestion:
          "Consider using array methods like map/filter/reduce or optimizing algorithm",
      },
      {
        pattern: /\.forEach\([^)]*\.forEach\([^)]*\.forEach/s,
        message: "Triple nested forEach detected",
        severity: "high",
        suggestion:
          "Refactor to use more efficient data structures or algorithms",
      },
      {
        pattern: /JSON\.parse\(JSON\.stringify\(/,
        message: "Deep clone via JSON detected",
        severity: "medium",
        suggestion: "Use structured cloning or a proper deep clone utility",
      },
      {
        pattern:
          /document\.querySelector.*inside.*\.(forEach|map|filter|reduce)/s,
        message: "DOM query inside loop detected",
        severity: "high",
        suggestion: "Query DOM once before the loop",
      },
      {
        pattern: /setState\([^)]*\).*setState\([^)]*\).*setState/s,
        message: "Multiple setState calls detected",
        severity: "medium",
        suggestion: "Batch state updates into a single setState call",
      },
      {
        pattern: /await.*inside.*\.(forEach|map)/s,
        message: "Async operation inside sync loop",
        severity: "high",
        suggestion: "Use Promise.all() or for...of loop with await",
      },
      {
        pattern: /new Array\(\d{4,}\)/,
        message: "Very large array allocation detected",
        severity: "medium",
        suggestion: "Consider lazy loading or pagination",
      },
      {
        pattern: /innerHTML\s*\+=|innerHTML\s*=\s*innerHTML\s*\+/,
        message: "innerHTML concatenation detected",
        severity: "high",
        suggestion: "Use createElement/appendChild or a template system",
      },
    ];

    const foundIssues = [];

    antiPatterns.forEach(({ pattern, message, severity, suggestion }) => {
      if (pattern.test(content)) {
        foundIssues.push({ message, severity, suggestion });
      }
    });

    // Check for large inline data
    const inlineDataPattern = /\[[\s\S]{5000,}\]|\{[\s\S]{5000,}\}/;
    if (inlineDataPattern.test(content)) {
      foundIssues.push({
        message: "Large inline data structure detected",
        severity: "medium",
        suggestion: "Move large data to separate file or load from API",
      });
    }

    // Block only for high severity issues
    const highSeverityIssues = foundIssues.filter(
      (issue) => issue.severity === "high",
    );

    if (highSeverityIssues.length > 0) {
      return runner.block(
        [
          "⚡ Performance Anti-Patterns Detected",
          "",
          "❌ Found critical performance issues:",
          "",
          ...highSeverityIssues.map(({ message, suggestion }) =>
            [`  🔴 ${message}`, `     → ${suggestion}`].join("\n"),
          ),
          "",
          "💡 Why this matters:",
          "  • Poor performance frustrates users",
          "  • Inefficient code wastes resources",
          "  • Performance issues compound over time",
          "",
          "✅ Fix these issues before proceeding.",
        ].join("\n"),
      );
    }

    // Warn for medium severity
    const mediumSeverityIssues = foundIssues.filter(
      (issue) => issue.severity === "medium",
    );

    if (mediumSeverityIssues.length > 0) {
      console.warn(
        [
          "",
          "⚠️  Performance Warning",
          ...mediumSeverityIssues.map(({ message, suggestion }) =>
            [`  🟡 ${message}`, `     → ${suggestion}`].join("\n"),
          ),
          "",
        ].join("\n"),
      );
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Performance check took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`Performance check failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("performance-guardian", performanceGuardian, {
  timeout: 50,
  priority: "medium",
  family: "ide",
});
