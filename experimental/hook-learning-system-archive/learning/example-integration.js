#!/usr/bin/env node

/**
 * Example: How to integrate learning with existing hooks
 * This shows the practical usage of the learning system
 */

const SimpleLearningRunner = require("./SimpleLearningRunner");

// Example 1: Simple hook with learning
async function exampleBasicHook() {
  console.log("\n📚 Example 1: Basic Hook with Learning\n");

  // Create a learning-enabled runner for your hook
  const runner = new SimpleLearningRunner("example-basic-hook", {
    family: "code-quality",
    priority: "medium",
    learningEnabled: true,
  });

  // Define your hook logic
  const hookLogic = async (hookData) => {
    // Your existing hook code here
    console.log(`Processing file: ${hookData.filePath}`);

    // Simulate some processing
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

    // Return result
    return {
      success: true,
      blocked: false,
      message: "File processed successfully",
    };
  };

  // Execute with learning
  const result = await runner.executeWithLearning(hookLogic, {
    filePath: "/example/test.js",
    content: 'console.log("Hello World");',
  });

  console.log("Result:", result);

  // Get learning statistics
  const stats = await runner.getLearningStats();
  console.log("Learning Stats:", stats);
}

// Example 2: Converting existing hook to use learning
async function exampleConvertExistingHook() {
  console.log("\n🔄 Example 2: Converting Existing Hook\n");

  // Original hook function
  const preventImprovedFiles = async (hookData) => {
    const fileName = hookData.filePath?.split("/").pop() || "";

    if (fileName.includes("_improved") || fileName.includes("_enhanced")) {
      return {
        success: false,
        blocked: true,
        message: "Prevented creation of _improved file",
      };
    }

    return { success: true, blocked: false };
  };

  // Wrap with learning
  const runner = new SimpleLearningRunner("prevent-improved-files", {
    family: "file-patterns",
    priority: "high",
  });

  // Test with various files
  const testFiles = [
    "/src/component.tsx",
    "/src/component_improved.tsx",
    "/src/utils.js",
    "/src/utils_enhanced.js",
  ];

  for (const filePath of testFiles) {
    const result = await runner.executeWithLearning(preventImprovedFiles, {
      filePath,
    });
    console.log(`${filePath}: ${result.blocked ? "❌ Blocked" : "✅ Allowed"}`);
  }
}

// Example 3: Using learning insights
async function exampleUsingInsights() {
  console.log("\n💡 Example 3: Using Learning Insights\n");

  const runner = new SimpleLearningRunner("performance-sensitive-hook", {
    family: "performance",
    priority: "high",
  });

  // Simulate multiple executions to generate data
  console.log("Generating execution data...");

  const hookLogic = async (hookData) => {
    // Simulate variable execution times
    const baseTime = 50;
    const variance = hookData.isComplex ? 200 : 20;
    await new Promise((resolve) =>
      setTimeout(resolve, baseTime + Math.random() * variance),
    );

    return { success: true, blocked: false };
  };

  // Run multiple times
  for (let i = 0; i < 20; i++) {
    await runner.executeWithLearning(hookLogic, {
      filePath: `/test/file${i}.js`,
      isComplex: i % 5 === 0,
    });
  }

  // Check for generated insights
  const stats = await runner.getLearningStats();
  console.log("\nLearning Statistics:");
  console.log(`- Executions: ${stats?.executions || 0}`);
  console.log(`- Avg Time: ${stats?.avgExecutionTime || 0}ms`);
  console.log(`- Success Rate: ${stats?.successRate || 0}%`);
  console.log(`- Patterns Learned: ${stats?.patternsLearned || 0}`);
  console.log(`- Insights Generated: ${stats?.insightsGenerated || 0}`);
}

// Example 4: Production-ready integration
async function exampleProductionIntegration() {
  console.log("\n🚀 Example 4: Production-Ready Integration\n");

  class LearningEnabledHook {
    constructor(name, options) {
      this.name = name;
      this.runner = new SimpleLearningRunner(name, options);
    }

    async execute(hookData) {
      // Always use learning in production
      return await this.runner.executeWithLearning(
        this.hookImplementation.bind(this),
        hookData,
      );
    }

    async hookImplementation(hookData) {
      // Override in subclass
      throw new Error("Hook implementation required");
    }

    async getStats() {
      return await this.runner.getLearningStats();
    }
  }

  // Example concrete hook
  class FileValidationHook extends LearningEnabledHook {
    constructor() {
      super("file-validation", {
        family: "validation",
        priority: "high",
      });
    }

    async hookImplementation(hookData) {
      const { filePath, content } = hookData;

      // Validation logic
      if (!filePath) {
        return { success: false, blocked: true, message: "No file path" };
      }

      if (filePath.endsWith(".test.js") && !content?.includes("describe")) {
        return {
          success: false,
          blocked: true,
          message: "Test file missing test structure",
        };
      }

      return { success: true, blocked: false };
    }
  }

  // Use the production hook
  const hook = new FileValidationHook();

  const result1 = await hook.execute({
    filePath: "/src/utils.test.js",
    content: 'console.log("not a test");',
  });
  console.log("Test file validation:", result1);

  const result2 = await hook.execute({
    filePath: "/src/utils.test.js",
    content: 'describe("Utils", () => { test("works", () => {}); });',
  });
  console.log("Valid test file:", result2);

  const stats = await hook.getStats();
  console.log("\nHook statistics:", stats);
}

// Run all examples
async function runExamples() {
  try {
    await exampleBasicHook();
    await exampleConvertExistingHook();
    await exampleUsingInsights();
    await exampleProductionIntegration();

    console.log("\n✅ All examples completed successfully!\n");
  } catch (error) {
    console.error("Example error:", error);
  }
}

// Run if called directly
if (require.main === module) {
  runExamples();
}

module.exports = {
  SimpleLearningRunner,
  exampleBasicHook,
  exampleConvertExistingHook,
  exampleUsingInsights,
  exampleProductionIntegration,
};
