#!/usr/bin/env node

/**
 * Example: Adaptive Prevent Improved Files Hook
 *
 * This example shows how to upgrade the prevent-improved-files hook
 * to use the full HookLearningInterface with adaptive parameters.
 *
 * New capabilities:
 * - Learns which file patterns are legitimate vs problematic
 * - Adapts timeout based on execution patterns
 * - Refines pattern sensitivity to reduce false positives
 * - A/B tests new parameters before full adoption
 */

const HookLearningInterface = require("../HookLearningInterface");
const AdaptiveParameterSystem = require("../AdaptiveParameterSystem");
const SimpleLearningRunner = require("../SimpleLearningRunner");
const path = require("path");

class AdaptivePreventImprovedFiles {
  constructor() {
    this.hookName = "prevent-improved-files-adaptive";

    // Initialize learning components
    this.learningInterface = new HookLearningInterface(this.hookName, {
      minExecutions: 20, // Lower threshold for demo
      minConfidence: 0.6,
    });

    this.adaptiveParams = new AdaptiveParameterSystem(this.hookName);

    this.runner = new SimpleLearningRunner(this.hookName, {
      family: "enforcement",
      priority: "critical",
    });

    // Base patterns that trigger blocking
    this.basePatterns = [
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
   * Main hook execution with full learning
   */
  async run(hookData) {
    const startTime = Date.now();

    try {
      // Execute with learning runner for basic tracking
      const result = await this.runner.executeWithLearning(
        async (data) => await this.checkFileWithAdaptation(data),
        hookData,
      );

      // Advanced learning from execution
      const executionTime = Date.now() - startTime;
      const learningResult = await this.learningInterface.learnFromExecution(
        await this.createEnhancedContext(hookData),
        result,
        executionTime,
      );

      // Record result for A/B testing if applicable
      if (result._parameterUsed) {
        await this.adaptiveParams.recordABTestResult(
          result._parameterUsed.parameter,
          result._parameterUsed.value,
          result,
        );
      }

      // Log learning progress
      if (learningResult && learningResult.optimizationsApplied > 0) {
        console.log(
          `Learning applied ${learningResult.optimizationsApplied} optimizations`,
        );
      }

      return result;
    } catch (error) {
      console.error("Adaptive hook error:", error);
      return {
        success: false,
        blocked: false,
        error: error.message,
      };
    }
  }

  /**
   * Check file with adaptive parameters
   */
  async checkFileWithAdaptation(data) {
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
    const fileExt = path.extname(fileName);

    // Get adaptive parameters
    const timeout = this.adaptiveParams.getParameter("timeout") || 3000;
    const sensitivity =
      this.adaptiveParams.getParameter(`pattern_sensitivity_${fileExt}`) ||
      "standard";
    const strictness =
      this.adaptiveParams.getParameter("enforcement_strictness") || "standard";

    // Record which parameters were used (for A/B testing)
    const result = {
      _parameterUsed: null,
    };

    // Check against patterns with adaptive sensitivity
    for (const pattern of this.basePatterns) {
      if (fileNameLower.includes(pattern)) {
        // Apply learned exceptions
        const shouldBlock = await this.shouldBlockWithLearning(
          filePath,
          pattern,
          sensitivity,
          strictness,
        );

        if (shouldBlock) {
          return {
            ...result,
            success: false,
            blocked: true,
            message: this.getAdaptiveBlockMessage(
              pattern,
              fileName,
              sensitivity,
            ),
            exitCode: 1,
          };
        }
      }
    }

    return {
      ...result,
      success: true,
      blocked: false,
      message: "File name is acceptable",
    };
  }

  /**
   * Enhanced blocking decision with learning
   */
  async shouldBlockWithLearning(filePath, pattern, sensitivity, strictness) {
    // Get learned patterns for this file type
    const adaptiveParams = this.learningInterface.getAdaptiveParameters();
    const fileContext = this.extractFileContext(filePath);

    // Check learned exceptions
    if (sensitivity === "reduced") {
      // In reduced sensitivity mode, allow more exceptions
      if (fileContext.isTest || fileContext.isDoc || fileContext.isConfig) {
        return false;
      }
    }

    // Check strictness level
    if (strictness === "relaxed") {
      // In relaxed mode, only block the most egregious patterns
      const criticalPatterns = ["_improved", "_enhanced", "_v2"];
      if (!criticalPatterns.includes(pattern)) {
        return false;
      }
    } else if (strictness === "strict") {
      // In strict mode, block more aggressively
      return true;
    }

    // Standard mode - use default logic
    return !fileContext.isTest && !fileContext.isDoc;
  }

  /**
   * Extract context about the file
   */
  extractFileContext(filePath) {
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1];

    return {
      isTest:
        filePath.includes("/test/") ||
        filePath.includes("/__tests__/") ||
        fileName.includes(".test.") ||
        fileName.includes(".spec."),
      isDoc:
        filePath.endsWith(".md") ||
        filePath.endsWith(".txt") ||
        filePath.includes("/docs/"),
      isConfig:
        fileName.includes("config") ||
        fileName.includes(".json") ||
        fileName.includes(".yml") ||
        fileName.includes(".yaml"),
      directory: parts.length > 1 ? parts[parts.length - 2] : "root",
      depth: parts.length,
    };
  }

  /**
   * Create enhanced context for learning
   */
  async createEnhancedContext(hookData) {
    const baseContext = {
      filePath: hookData.filePath || hookData.file_path,
      fileExtension: path.extname(
        hookData.filePath || hookData.file_path || "",
      ),
      timestamp: Date.now(),
    };

    // Add file context
    if (baseContext.filePath) {
      const fileContext = this.extractFileContext(baseContext.filePath);
      baseContext.fileContext = fileContext;
      baseContext.projectType = this.inferProjectType(fileContext);
    }

    // Add content analysis if available
    if (hookData.content) {
      baseContext.contentSize = hookData.content.length;
      baseContext.contentHash = this.hashContent(hookData.content);
    }

    return baseContext;
  }

  /**
   * Infer project type from context
   */
  inferProjectType(fileContext) {
    if (
      fileContext.directory === "components" ||
      fileContext.directory === "pages"
    ) {
      return "react";
    } else if (
      fileContext.directory === "src" ||
      fileContext.directory === "lib"
    ) {
      return "nodejs";
    }
    return "unknown";
  }

  /**
   * Hash content for pattern matching
   */
  hashContent(content) {
    const crypto = require("crypto");
    return crypto.createHash("md5").update(content).digest("hex");
  }

  /**
   * Get adaptive block message
   */
  getAdaptiveBlockMessage(pattern, fileName, sensitivity) {
    const baseMessage = `❌ Blocked: "${fileName}" contains "${pattern}".`;

    if (sensitivity === "reduced") {
      return `${baseMessage} (Sensitivity: Reduced - allowing some exceptions)`;
    } else if (sensitivity === "increased") {
      return `${baseMessage} (Sensitivity: Increased - stricter enforcement)`;
    }

    return `${baseMessage} Edit the original file instead.`;
  }

  /**
   * Run adaptive optimizations
   */
  async runOptimizations() {
    console.log("Running adaptive optimizations...\n");

    // Optimize timeout
    const timeoutOpt = await this.adaptiveParams.optimizeTimeout();
    if (timeoutOpt) {
      console.log(
        `✓ Timeout optimized: ${timeoutOpt.oldValue}ms → ${timeoutOpt.newValue}ms`,
      );
    }

    // Refine patterns
    const patternRefinements = await this.adaptiveParams.refinePatterns();
    if (patternRefinements.length > 0) {
      console.log(`✓ Refined ${patternRefinements.length} patterns`);
      patternRefinements.forEach((r) => {
        console.log(`  - ${r.targetPattern}: ${r.oldValue} → ${r.newValue}`);
      });
    }

    // Adjust thresholds
    const thresholdAdjustments = await this.adaptiveParams.adjustThresholds();
    if (thresholdAdjustments.length > 0) {
      console.log(`✓ Adjusted ${thresholdAdjustments.length} thresholds`);
    }

    console.log("\nOptimization complete!");
  }

  /**
   * Start an A/B test
   */
  async startABTest(parameter, variantValue, options) {
    const testId = await this.adaptiveParams.startABTest(
      parameter,
      variantValue,
      options,
    );
    console.log(`Started A/B test ${testId} for ${parameter}`);
    return testId;
  }

  /**
   * Get current statistics
   */
  async getStats() {
    const learningStats = await this.learningInterface.getLearningStatistics();
    const parameters = this.adaptiveParams.getAllParameters();
    const history = this.adaptiveParams.getOptimizationHistory();

    console.log(`
Adaptive Learning Statistics for ${this.hookName}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Learning Progress:
- Total Executions: ${learningStats.totalExecutions}
- Patterns Learned: ${learningStats.patternsLearned}
- Adaptive Parameters: ${learningStats.adaptiveParameters}
- Learning Confidence: ${(learningStats.confidence * 100).toFixed(1)}%

Current Parameters:
${Object.entries(parameters)
  .map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`)
  .join("\n")}

Recent Optimizations: ${history.length}
${history
  .slice(0, 3)
  .map(
    (h) =>
      `- ${new Date(h.timestamp).toLocaleString()}: ${h.optimization.parameter} → ${h.optimization.newValue}`,
  )
  .join("\n")}
`);

    return { learningStats, parameters, history };
  }
}

// Export for use
module.exports = AdaptivePreventImprovedFiles;

// Run if called directly
if (require.main === module) {
  const hook = new AdaptivePreventImprovedFiles();

  // Demo mode
  if (process.argv[2] === "demo") {
    console.log("Running adaptive hook demo...\n");

    const testCases = [
      { filePath: "/src/component.tsx" },
      { filePath: "/src/component_improved.tsx" },
      { filePath: "/test/component_improved.test.js" },
      { filePath: "/docs/readme_updated.md" },
      { filePath: "/src/utils_v2.js" },
      { filePath: "/config/settings_new.json" },
    ];

    (async () => {
      // Run test cases
      for (const testCase of testCases) {
        const result = await hook.run(testCase);
        console.log(
          `${testCase.filePath}: ${result.blocked ? "❌ Blocked" : "✅ Allowed"}`,
        );
        if (result.message) console.log(`  ${result.message}`);
      }

      // Show stats
      await hook.getStats();

      // Run optimizations
      await hook.runOptimizations();

      // Start an A/B test
      console.log("\nStarting A/B test for enforcement_strictness...");
      await hook.startABTest("enforcement_strictness", "relaxed", {
        duration: 60000, // 1 minute for demo
        sampleSize: 0.5,
      });
    })();
  }
  // Optimization mode
  else if (process.argv[2] === "optimize") {
    (async () => {
      await hook.runOptimizations();
    })();
  }
  // Stats mode
  else if (process.argv[2] === "stats") {
    (async () => {
      await hook.getStats();
    })();
  }
  // Normal execution
  else {
    // Process stdin or file argument
    if (process.argv[2]) {
      (async () => {
        const result = await hook.run({ filePath: process.argv[2] });
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.exitCode || 0);
      })();
    } else {
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
}
