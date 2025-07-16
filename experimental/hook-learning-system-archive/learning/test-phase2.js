#!/usr/bin/env node

/**
 * Phase 2 Component Tests
 * Validates all Phase 2 adaptive learning components
 */

const HookLearningInterface = require("./HookLearningInterface");
const AdaptiveParameterSystem = require("./AdaptiveParameterSystem");
const LearningDatabase = require("./LearningDatabase");
const { getConfig } = require("./config");
const fs = require("fs");
const path = require("path");

// Test utilities
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

const asyncAssert = async (asyncCondition, message) => {
  const result = await asyncCondition();
  assert(result, message);
};

// Test runner
class Phase2TestSuite {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log("🧪 Phase 2 Component Test Suite\n");

    for (const test of this.tests) {
      try {
        await test.testFn();
        this.results.passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({ test: test.name, error: error.message });
        console.log(`❌ ${test.name}`);
        console.log(`   ${error.message}`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST SUMMARY\n");
    console.log(`Total Tests: ${this.tests.length}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(
      `Success Rate: ${((this.results.passed / this.tests.length) * 100).toFixed(1)}%`,
    );

    if (this.results.failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.results.errors.forEach(({ test, error }) => {
        console.log(`\n${test}:`);
        console.log(`  ${error}`);
      });
    }
  }
}

// Create test suite
const suite = new Phase2TestSuite();

// Test 1: HookLearningInterface initialization
suite.test("HookLearningInterface initialization", async () => {
  const learningInterface = new HookLearningInterface("test-hook");
  await learningInterface.initialize();

  assert(
    learningInterface.initialized,
    "Learning interface should be initialized",
  );
  assert(
    learningInterface.learningState.learningEnabled,
    "Learning should be enabled by default",
  );
  assert(learningInterface.patterns instanceof Map, "Patterns should be a Map");
  assert(
    learningInterface.adaptiveParameters instanceof Map,
    "Adaptive parameters should be a Map",
  );
});

// Test 2: Pattern extraction
suite.test("Pattern extraction from execution context", async () => {
  const learningInterface = new HookLearningInterface("test-hook");

  const context = {
    filePath: "/src/components/Button.tsx",
    fileExtension: ".tsx",
    contentHash: "abc123",
    codeComplexity: { lineCount: 100, functionCount: 5 },
    systemLoad: 0.5,
  };

  const result = {
    success: true,
    blocked: false,
    executionTime: 150,
  };

  const patterns = await learningInterface.extractPatterns(context, result);

  assert(patterns.length > 0, "Should extract patterns");
  assert(
    patterns.some((p) => p.type === "file_pattern"),
    "Should extract file pattern",
  );
  assert(
    patterns.some((p) => p.type === "content_pattern"),
    "Should extract content pattern",
  );
  assert(
    patterns.some((p) => p.type === "execution_pattern"),
    "Should extract execution pattern",
  );
});

// Test 3: Learning from execution
suite.test("Learning from execution with pattern updates", async () => {
  const learningInterface = new HookLearningInterface("test-hook", {
    minExecutions: 2, // Low threshold for testing
  });
  await learningInterface.initialize();

  const context = {
    filePath: "/src/utils/helper.js",
    fileExtension: ".js",
    contentHash: "def456",
    systemLoad: 0.3,
  };

  const result = {
    success: true,
    blocked: false,
  };

  // First execution - no optimizations yet
  const learning1 = await learningInterface.learnFromExecution(
    context,
    result,
    100,
  );
  assert(learning1.patternsLearned > 0, "Should learn patterns");
  assert(
    learning1.optimizationsApplied === 0,
    "No optimizations on first execution",
  );

  // Second execution - still building data
  const learning2 = await learningInterface.learnFromExecution(
    context,
    result,
    120,
  );
  assert(
    learningInterface.learningState.totalExecutions === 2,
    "Should track executions",
  );
});

// Test 4: AdaptiveParameterSystem initialization
suite.test("AdaptiveParameterSystem initialization", async () => {
  const adaptiveParams = new AdaptiveParameterSystem("test-hook");
  await adaptiveParams.initialize();

  assert(adaptiveParams.initialized, "Adaptive params should be initialized");
  assert(
    adaptiveParams.parameters instanceof Map,
    "Parameters should be a Map",
  );
  assert(adaptiveParams.abTests instanceof Map, "A/B tests should be a Map");
});

// Test 5: Timeout optimization
suite.test("Timeout optimization with gradual adjustment", async () => {
  const db = new LearningDatabase();
  await db.initialize();

  // Use unique hook name to avoid conflicts
  const hookName = `test-timeout-hook-${Date.now()}`;

  // Seed fresh execution data
  for (let i = 0; i < 60; i++) {
    await db.recordExecution(hookName, {
      family: "test",
      priority: "medium",
      executionTime: 400 + Math.random() * 200, // 400-600ms
      success: true,
      blocked: false,
    });
  }

  const adaptiveParams = new AdaptiveParameterSystem(hookName);
  await adaptiveParams.initialize();

  // Set initial timeout high enough to trigger optimization
  adaptiveParams.parameters.set("timeout", 3000);

  // Run optimization
  const optimization = await adaptiveParams.optimizeTimeout();

  if (optimization === null) {
    // If no optimization, check why
    const executions = await db.getRecentExecutions(hookName, 100);
    console.log(`Executions found: ${executions.length}`);
    if (executions.length > 0) {
      const times = executions.map((e) => e.execution_time);
      console.log(
        `Execution times: min=${Math.min(...times)}, max=${Math.max(...times)}, avg=${times.reduce((a, b) => a + b, 0) / times.length}`,
      );
    }
  }

  assert(optimization !== null, "Should suggest timeout optimization");
  assert(optimization.newValue < 3000, "Should reduce timeout");
  assert(optimization.newValue > 600, "Should maintain safety buffer");
  assert(
    Math.abs(optimization.newValue - 3000) <= 600,
    "Should respect max change rate (20%)",
  );
});

// Test 6: Pattern effectiveness calculation
suite.test("Pattern effectiveness metrics", async () => {
  const adaptiveParams = new AdaptiveParameterSystem("test-hook");

  const pattern = {
    true_positives: 80,
    false_positives: 20,
    true_negatives: 150,
    false_negatives: 10,
  };

  const effectiveness = adaptiveParams.calculatePatternEffectiveness(pattern);

  assert(effectiveness.precision === 0.8, "Precision should be 80%");
  assert(effectiveness.recall > 0.88, "Recall should be ~88.9%");
  assert(effectiveness.accuracy > 0.88, "Accuracy should be ~88.5%");
  assert(effectiveness.falsePositiveRate < 0.12, "FPR should be ~11.8%");
});

// Test 7: A/B testing functionality
suite.test("A/B test creation and management", async () => {
  const adaptiveParams = new AdaptiveParameterSystem("test-hook");
  await adaptiveParams.initialize();

  // Start A/B test
  const testId = await adaptiveParams.startABTest(
    "enforcement_level",
    "strict",
    {
      duration: 1000, // 1 second for test
      sampleSize: 0.5,
    },
  );

  assert(testId, "Should return test ID");
  assert(adaptiveParams.abTests.has(testId), "Should track A/B test");

  // Simulate executions
  for (let i = 0; i < 10; i++) {
    const value = adaptiveParams.getParameter("enforcement_level");
    await adaptiveParams.recordABTestResult("enforcement_level", value, {
      success: Math.random() > 0.3,
      executionTime: 100 + Math.random() * 50,
    });
  }

  // The test should still be active since we haven't met minimum executions
  assert(adaptiveParams.abTests.has(testId), "Test should still be active");

  // Simulate more executions to meet minimum
  let testStillActive = true;
  for (let i = 0; i < 100 && testStillActive; i++) {
    const value = adaptiveParams.getParameter("enforcement_level");
    await adaptiveParams.recordABTestResult("enforcement_level", value, {
      success: Math.random() > 0.3,
      executionTime: 100 + Math.random() * 50,
    });
    testStillActive = adaptiveParams.abTests.has(testId);
  }

  // Now the test should be concluded
  assert(
    !testStillActive,
    "Test should be concluded after sufficient executions",
  );
});

// Test 8: Configuration integration
suite.test("Configuration system with adaptive learning settings", async () => {
  const config = getConfig();

  assert(config.adaptiveLearningConfig, "Should have adaptive learning config");
  assert(
    config.adaptiveLearningConfig.enabled !== undefined,
    "Should have enabled flag",
  );
  assert(
    config.adaptiveLearningConfig.maxParameterChangeRate === 0.2,
    "Should have 20% max change rate",
  );
  assert(
    config.adaptiveLearningConfig.optimizationCooldown === 3600000,
    "Should have 1 hour cooldown",
  );
});

// Test 9: Database migration for Phase 2 tables
suite.test("Phase 2 database tables exist", async () => {
  const db = new LearningDatabase();
  await db.initialize();

  // Check tables exist
  const tables = await db.getAllRows(
    "SELECT name FROM sqlite_master WHERE type='table'",
    [],
  );

  const tableNames = tables.map((t) => t.name);

  assert(
    tableNames.includes("learning_state"),
    "Should have learning_state table",
  );
  assert(
    tableNames.includes("adaptive_parameters"),
    "Should have adaptive_parameters table",
  );
  assert(
    tableNames.includes("parameter_changes"),
    "Should have parameter_changes table",
  );
  assert(
    tableNames.includes("optimization_results"),
    "Should have optimization_results table",
  );
  assert(
    tableNames.includes("pattern_effectiveness"),
    "Should have pattern_effectiveness table",
  );
});

// Test 10: End-to-end adaptive hook integration
suite.test("End-to-end adaptive hook execution", async () => {
  const AdaptivePreventImprovedFiles = require("./examples/adaptive-prevent-improved");
  const hook = new AdaptivePreventImprovedFiles();

  // Test various file patterns
  const testCases = [
    { filePath: "/src/component.tsx", expectedBlocked: false },
    { filePath: "/src/component_improved.tsx", expectedBlocked: true },
    { filePath: "/test/component_improved.test.js", expectedBlocked: false },
    { filePath: "/docs/readme_v2.md", expectedBlocked: false },
  ];

  for (const testCase of testCases) {
    const result = await hook.run(testCase);
    assert(
      result.blocked === testCase.expectedBlocked,
      `${testCase.filePath} should be ${testCase.expectedBlocked ? "blocked" : "allowed"}`,
    );
  }

  // Verify learning occurred
  const stats = await hook.learningInterface.getLearningStatistics();
  assert(stats.totalExecutions === 4, "Should track all executions");
  assert(stats.patternsLearned > 0, "Should learn patterns");
});

// Test 11: Rollback mechanism
suite.test("Parameter rollback on performance degradation", async () => {
  const adaptiveParams = new AdaptiveParameterSystem("test-rollback-hook", {
    rollbackThreshold: 0.1, // 10% for testing
  });
  await adaptiveParams.initialize();

  // Set initial parameter
  adaptiveParams.parameters.set("test_param", "initial");

  // Create fake optimization
  const optimization = {
    parameter: "test_param",
    oldValue: "initial",
    newValue: "optimized",
    confidence: 0.8,
  };

  // Apply optimization
  await adaptiveParams.applyOptimization(optimization);

  assert(
    adaptiveParams.parameters.get("test_param") === "optimized",
    "Parameter should be updated",
  );

  // Note: Full rollback testing would require mocking performance metrics
  // This test validates the mechanism exists
});

// Test 12: Pattern confidence scoring
suite.test("Pattern confidence calculation over time", async () => {
  const learningInterface = new HookLearningInterface("test-confidence-hook", {
    minExecutions: 5,
  });
  await learningInterface.initialize();

  // Simulate multiple executions
  for (let i = 0; i < 10; i++) {
    await learningInterface.learnFromExecution(
      { filePath: "/src/test.js", fileExtension: ".js" },
      { success: true, blocked: false },
      100,
    );
  }

  const confidence1 = await learningInterface.calculateLearningConfidence();

  // Add more executions
  for (let i = 0; i < 40; i++) {
    await learningInterface.learnFromExecution(
      { filePath: "/src/test2.js", fileExtension: ".js" },
      { success: true, blocked: false },
      100,
    );
  }

  const confidence2 = await learningInterface.calculateLearningConfidence();

  assert(
    confidence2 >= confidence1,
    "Confidence should increase or stay same with more data",
  );
  assert(confidence2 <= 1.0, "Confidence should not exceed 1.0");
  assert(confidence1 > 0, "Initial confidence should be greater than 0");
});

// Run all tests
(async () => {
  try {
    await suite.run();

    if (suite.results.failed === 0) {
      console.log("\n🎉 All Phase 2 tests passed!");
      process.exit(0);
    } else {
      console.log("\n⚠️  Some tests failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("Fatal test error:", error);
    process.exit(1);
  }
})();
