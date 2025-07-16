#!/usr/bin/env node

/**
 * Example: prevent-improved-files.js with learning enabled
 * Shows how to add learning to the actual prevent-improved-files hook
 */

const SimpleLearningRunner = require("./SimpleLearningRunner");
const path = require("path");
const fs = require("fs");

// Create a learning-enabled version of prevent-improved-files
class PreventImprovedFilesWithLearning {
  constructor() {
    this.runner = new SimpleLearningRunner("prevent-improved-files", {
      family: "enforcement",
      priority: "critical",
    });

    // Patterns that trigger blocking
    this.blockedPatterns = [
      "_improved",
      "_enhanced",
      "_v2",
      "_updated",
      "_fixed",
      "_new",
      "_better",
    ];
  }

  /**
   * Main hook logic
   */
  async run(hookData) {
    return await this.runner.executeWithLearning(
      this.checkFile.bind(this),
      hookData,
    );
  }

  /**
   * Core logic for checking files
   */
  async checkFile(data) {
    const filePath = data.filePath || data.file_path;

    if (!filePath) {
      return {
        success: true,
        blocked: false,
        message: "No file path provided",
      };
    }

    const fileName = path.basename(filePath);
    const fileNameLower = fileName.toLowerCase();

    // Check against blocked patterns
    for (const pattern of this.blockedPatterns) {
      if (fileNameLower.includes(pattern)) {
        // Check for exceptions based on learned patterns
        const shouldBlock = await this.shouldBlockBasedOnLearning(
          filePath,
          pattern,
        );

        if (shouldBlock) {
          return {
            success: false,
            blocked: true,
            message: this.getBlockMessage(pattern, fileName),
            exitCode: 1,
          };
        }
      }
    }

    return {
      success: true,
      blocked: false,
      message: "File name is acceptable",
    };
  }

  /**
   * Use learning to refine blocking decisions
   */
  async shouldBlockBasedOnLearning(filePath, pattern) {
    // In a real implementation, this would query learned patterns
    // For now, always block but this is where ML refinement would happen

    // Example: Don't block test files even if they have _improved
    if (filePath.includes("/test/") || filePath.includes("/__tests__/")) {
      return false;
    }

    // Example: Don't block documentation files
    if (filePath.endsWith(".md") || filePath.endsWith(".txt")) {
      return false;
    }

    return true;
  }

  /**
   * Generate appropriate block message
   */
  getBlockMessage(pattern, fileName) {
    const messages = {
      _improved: `❌ Blocked: "${fileName}" contains "_improved". Edit the original file instead.`,
      _enhanced: `❌ Blocked: "${fileName}" contains "_enhanced". Enhance the original file instead.`,
      _v2: `❌ Blocked: "${fileName}" contains "_v2". Update the original file instead.`,
      _updated: `❌ Blocked: "${fileName}" contains "_updated". Update the original file directly.`,
      _fixed: `❌ Blocked: "${fileName}" contains "_fixed". Apply fixes to the original file.`,
      _new: `❌ Blocked: "${fileName}" contains "_new". Consider a more descriptive name.`,
      _better: `❌ Blocked: "${fileName}" contains "_better". Improve the original file instead.`,
    };

    return (
      messages[pattern] ||
      `❌ Blocked: "${fileName}" contains "${pattern}". Edit the original file instead.`
    );
  }

  /**
   * Get learning statistics
   */
  async getStats() {
    const stats = await this.runner.getLearningStats();

    if (stats) {
      console.log(`
Learning Statistics for prevent-improved-files:
- Total Executions: ${stats.executions}
- Files Blocked: ${100 - stats.successRate}%
- Average Check Time: ${stats.avgExecutionTime}ms
- Patterns Learned: ${stats.patternsLearned}
- Optimization Insights: ${stats.insightsGenerated}
`);
    }

    return stats;
  }
}

// Export for use in other hooks
module.exports = PreventImprovedFilesWithLearning;

// Run if called directly
if (require.main === module) {
  const hook = new PreventImprovedFilesWithLearning();

  // Test mode
  if (process.argv[2] === "test") {
    console.log("Testing prevent-improved-files with learning...\n");

    const testCases = [
      { filePath: "/src/component.tsx" },
      { filePath: "/src/component_improved.tsx" },
      { filePath: "/test/component_improved.test.js" },
      { filePath: "/docs/readme_updated.md" },
      { filePath: "/src/utils_v2.js" },
    ];

    (async () => {
      for (const testCase of testCases) {
        const result = await hook.run(testCase);
        console.log(
          `${testCase.filePath}: ${result.blocked ? "❌ Blocked" : "✅ Allowed"}`,
        );
        if (result.message) console.log(`  ${result.message}`);
      }

      console.log("\n--- Learning Statistics ---");
      await hook.getStats();
    })();
  } else if (process.argv[2]) {
    // Direct file path argument
    (async () => {
      const result = await hook.run({ filePath: process.argv[2] });
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.exitCode || 0);
    })();
  } else {
    // Stdin mode - process hook data
    let input = "";
    process.stdin.on("data", (chunk) => (input += chunk));
    process.stdin.on("end", async () => {
      try {
        const hookData = input ? JSON.parse(input) : {};
        const result = await hook.run(hookData);
        console.log(JSON.stringify(result));
        process.exit(result.exitCode || 0);
      } catch (error) {
        console.error(
          JSON.stringify({
            success: false,
            error: error.message,
          }),
        );
        process.exit(1);
      }
    });
  }
}
