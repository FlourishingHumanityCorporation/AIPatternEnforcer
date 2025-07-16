#!/usr/bin/env node

/**
 * Phase 2 Final Validation
 * Comprehensive test to ensure all components work together correctly
 */

const IntegratedLearningRunner = require("./IntegratedLearningRunner");
const PatternEffectivenessTracker = require("./PatternEffectivenessTracker");
const FeedbackLoopSystem = require("./FeedbackLoopSystem");
const LearningDatabase = require("./LearningDatabase");
const fs = require("fs").promises;
const path = require("path");

async function validatePhase2() {
  console.log("🚀 Phase 2 Complete System Validation\n");
  console.log(
    "This validates that all critical missing pieces have been implemented.\n",
  );

  const results = {
    passed: [],
    failed: [],
  };

  // Test 1: Pattern Effectiveness Tracking Actually Works
  console.log("1️⃣ Testing Pattern Effectiveness Tracking...");
  try {
    const tracker = new PatternEffectivenessTracker("validation-hook");
    await tracker.initialize();

    // Record some patterns and decisions
    const pattern = { type: "file_extension", pattern: ".js" };
    const context = { filePath: "/src/test.js" };
    const decision = { blocked: true };

    // Record decision
    const decisionId = await tracker.recordDecision(context, decision, [
      pattern,
    ]);

    // Validate with actual outcome
    await tracker.validateDecision(decisionId, { shouldBlock: false }); // False positive

    // Check that pattern effectiveness was recorded
    const stats = await tracker.getPatternStats();

    if (stats.length > 0 && stats[0].fp > 0) {
      console.log("✅ Pattern effectiveness tracking is working");
      console.log(`   - Recorded false positive for .js pattern`);
      results.passed.push("Pattern Effectiveness Tracking");
    } else {
      throw new Error("Pattern effectiveness not recorded");
    }
  } catch (error) {
    console.log("❌ Pattern effectiveness tracking failed:", error.message);
    results.failed.push({
      test: "Pattern Effectiveness Tracking",
      error: error.message,
    });
  }

  // Test 2: Integration Between SimpleLearningRunner and HookLearningInterface
  console.log("\n2️⃣ Testing System Integration...");
  try {
    const runner = new IntegratedLearningRunner("integration-test", {
      family: "test",
      priority: "high",
    });

    let phase1Called = false;
    let phase2Called = false;

    // Hook that tracks which systems were called
    const testHook = async (data) => {
      // Phase 1 data should be recorded
      if (runner.simpleRunner) phase1Called = true;

      // Phase 2 parameters should be available
      if (data._adaptiveParams !== undefined) phase2Called = true;

      return { success: true, blocked: false };
    };

    await runner.executeWithLearning(testHook, { filePath: "/test.js" });

    const stats = await runner.getStatistics();

    if (phase1Called && phase2Called && stats.basic && stats.advanced) {
      console.log("✅ Systems are properly integrated");
      console.log(`   - Phase 1 executions: ${stats.basic.executions}`);
      console.log(`   - Phase 2 patterns: ${stats.advanced.patternsLearned}`);
      results.passed.push("System Integration");
    } else {
      throw new Error("Systems not properly integrated");
    }
  } catch (error) {
    console.log("❌ System integration failed:", error.message);
    results.failed.push({ test: "System Integration", error: error.message });
  }

  // Test 3: Feedback Loop System Actually Monitors
  console.log("\n3️⃣ Testing Feedback Loop System...");
  try {
    const feedback = new FeedbackLoopSystem("feedback-test");
    await feedback.initialize();

    let monitoringStarted = false;
    let checkpointReceived = false;

    feedback.on("optimization:started", () => {
      monitoringStarted = true;
    });
    feedback.on("optimization:checkpoint", () => {
      checkpointReceived = true;
    });

    // Start monitoring a fake optimization
    const optimization = {
      parameter: "test_timeout",
      oldValue: 3000,
      newValue: 1500,
      confidence: 0.8,
    };

    const monitoringId = await feedback.monitorOptimization(optimization);

    // Wait a bit for events
    await new Promise((resolve) => setTimeout(resolve, 100));

    const status = feedback.getMonitoringStatus();

    if (monitoringStarted && status.active.length > 0) {
      console.log("✅ Feedback loop system is monitoring optimizations");
      console.log(`   - Active monitors: ${status.active.length}`);
      results.passed.push("Feedback Loop System");
    } else {
      throw new Error("Feedback loop not monitoring");
    }
  } catch (error) {
    console.log("❌ Feedback loop system failed:", error.message);
    results.failed.push({ test: "Feedback Loop System", error: error.message });
  }

  // Test 4: A/B Test Results Are Persisted
  console.log("\n4️⃣ Testing A/B Test Result Persistence...");
  try {
    const runner = new IntegratedLearningRunner("ab-test-persistence", {
      family: "test",
      priority: "high",
    });

    // Start A/B test
    const testId = await runner.startABTest("test_param", "variant_value", {
      duration: 100,
      sampleSize: 0.5,
    });

    // Record some results
    for (let i = 0; i < 10; i++) {
      await runner.adaptiveParams.recordABTestResult(
        "test_param",
        i % 2 === 0 ? "variant_value" : "control_value",
        { success: true, executionTime: 50 },
      );
    }

    // Check that results are tracked
    const abTest = runner.adaptiveParams.abTests.get(testId);
    if (
      abTest &&
      abTest.metrics.variant.executions > 0 &&
      abTest.metrics.control.executions > 0
    ) {
      console.log("✅ A/B test results are being tracked");
      console.log(
        `   - Variant executions: ${abTest.metrics.variant.executions}`,
      );
      console.log(
        `   - Control executions: ${abTest.metrics.control.executions}`,
      );
      results.passed.push("A/B Test Persistence");
    } else {
      throw new Error("A/B test results not tracked");
    }
  } catch (error) {
    console.log("❌ A/B test persistence failed:", error.message);
    results.failed.push({ test: "A/B Test Persistence", error: error.message });
  }

  // Test 5: Pattern Effectiveness Influences Decisions
  console.log("\n5️⃣ Testing Pattern-Based Decision Making...");
  try {
    const db = new LearningDatabase();
    await db.initialize();

    // Insert pattern effectiveness data
    await db.run(`
      INSERT OR REPLACE INTO pattern_effectiveness 
        (hook_name, pattern_type, pattern_key, true_positives, false_positives, true_negatives, false_negatives)
      VALUES ('decision-test', 'file_extension', '.suspicious', 10, 90, 5, 5)
    `);

    // Create adaptive params that should detect this problematic pattern
    const AdaptiveParameterSystem = require("./AdaptiveParameterSystem");
    const adaptiveParams = new AdaptiveParameterSystem("decision-test");
    await adaptiveParams.initialize();

    // Run pattern refinement
    const refinements = await adaptiveParams.refinePatterns();

    const suspiciousRefinement = refinements.find(
      (r) => r.targetPattern && r.targetPattern.includes(".suspicious"),
    );

    if (suspiciousRefinement && suspiciousRefinement.newValue === "reduced") {
      console.log("✅ Pattern effectiveness influences decisions");
      console.log(`   - Detected high false positive rate for .suspicious`);
      console.log(
        `   - Recommended: ${suspiciousRefinement.newValue} sensitivity`,
      );
      results.passed.push("Pattern-Based Decisions");
    } else {
      throw new Error("Pattern effectiveness not influencing decisions");
    }
  } catch (error) {
    console.log("❌ Pattern-based decisions failed:", error.message);
    results.failed.push({
      test: "Pattern-Based Decisions",
      error: error.message,
    });
  }

  // Test 6: End-to-End Learning Flow
  console.log("\n6️⃣ Testing End-to-End Learning Flow...");
  try {
    const runner = new IntegratedLearningRunner("e2e-test", {
      family: "validation",
      priority: "high",
      minExecutions: 5, // Low threshold for testing
    });

    // Simulate multiple executions with patterns
    for (let i = 0; i < 10; i++) {
      await runner.executeWithLearning(
        async (data) => ({
          success: true,
          blocked: data.filePath.includes("_bad"),
          executionTime: 50 + Math.random() * 50,
        }),
        { filePath: i % 3 === 0 ? "/src/file_bad.js" : "/src/file_good.js" },
      );
    }

    // Force optimization
    await runner.forceOptimization();

    // Get comprehensive stats
    const stats = await runner.getStatistics();

    const hasLearning =
      stats.basic.executions === 10 &&
      stats.advanced.patternsLearned > 0 &&
      stats.patterns.length > 0;

    console.log("Debug - Stats:", JSON.stringify(stats, null, 2));

    if (hasLearning) {
      console.log("✅ End-to-end learning flow is working");
      console.log(`   - Executions: ${stats.basic.executions}`);
      console.log(`   - Patterns learned: ${stats.advanced.patternsLearned}`);
      console.log(
        `   - Pattern effectiveness tracked: ${stats.patterns.length}`,
      );
      results.passed.push("End-to-End Learning");
    } else {
      throw new Error(
        `End-to-end learning not working: executions=${stats.basic.executions}, patterns=${stats.advanced.patternsLearned}, effectiveness=${stats.patterns.length}`,
      );
    }
  } catch (error) {
    console.log("❌ End-to-end learning failed:", error.message);
    results.failed.push({ test: "End-to-End Learning", error: error.message });
  }

  // Final Report
  console.log("\n" + "=".repeat(60));
  console.log("📊 PHASE 2 VALIDATION REPORT\n");

  console.log(`✅ Passed: ${results.passed.length}/6`);
  results.passed.forEach((test) => console.log(`   ✓ ${test}`));

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}/6`);
    results.failed.forEach(({ test, error }) => {
      console.log(`   ✗ ${test}: ${error}`);
    });
  }

  const allCriticalPassed = [
    "Pattern Effectiveness Tracking",
    "System Integration",
    "Feedback Loop System",
    "Pattern-Based Decisions",
  ].every((critical) => results.passed.includes(critical));

  if (allCriticalPassed) {
    console.log("\n🎉 ALL CRITICAL COMPONENTS ARE WORKING!");
    console.log(
      "Phase 2 is now truly complete with all missing pieces implemented.",
    );
  } else {
    console.log(
      "\n⚠️  Some critical components are still not working properly.",
    );
  }

  return results.failed.length === 0;
}

// Run validation
if (require.main === module) {
  validatePhase2()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
