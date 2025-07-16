#!/usr/bin/env node

/**
 * Test Rollback Mechanism
 * Verifies that parameter rollbacks actually work when performance degrades
 */

const AdaptiveParameterSystem = require("./AdaptiveParameterSystem");
const FeedbackLoopSystem = require("./FeedbackLoopSystem");
const LearningDatabase = require("./LearningDatabase");

async function testRollback() {
  console.log("🔄 Testing Rollback Mechanism\n");

  const hookName = "rollback-test-" + Date.now();
  const db = new LearningDatabase();
  await db.initialize();

  // Step 1: Create baseline performance data
  console.log("1️⃣ Creating baseline performance data...");

  // Good baseline: 90% success rate, 100ms avg time
  for (let i = 0; i < 50; i++) {
    await db.recordExecution(hookName, {
      family: "test",
      priority: "high",
      executionTime: 90 + Math.random() * 20,
      success: Math.random() < 0.9, // 90% success
      blocked: false,
    });
  }

  // Step 2: Initialize systems
  const adaptiveParams = new AdaptiveParameterSystem(hookName, {
    rollbackThreshold: 0.1, // 10% degradation triggers rollback
  });
  await adaptiveParams.initialize();

  const feedbackLoop = new FeedbackLoopSystem(hookName);
  await feedbackLoop.initialize();

  // Set up rollback handler
  let rollbackTriggered = false;
  let rollbackReason = null;

  feedbackLoop.on("optimization:rollback", (data) => {
    rollbackTriggered = true;
    rollbackReason = data.reason;
    console.log(`\n⚠️  Rollback triggered: ${data.reason}`);
    console.log("   Degradation:", data.degradation);

    // Actually perform the rollback
    adaptiveParams.parameters.set(
      data.optimization.parameter,
      data.optimization.oldValue,
    );
  });

  // Step 3: Apply an optimization
  console.log("\n2️⃣ Applying optimization...");

  const optimization = {
    parameter: "enforcement_strictness",
    oldValue: "standard",
    newValue: "very_strict",
    confidence: 0.8,
  };

  adaptiveParams.parameters.set(optimization.parameter, optimization.newValue);
  console.log(
    `   Changed ${optimization.parameter}: ${optimization.oldValue} → ${optimization.newValue}`,
  );

  // Start monitoring
  const monitoringId = await feedbackLoop.monitorOptimization(optimization);

  // Step 4: Simulate degraded performance
  console.log("\n3️⃣ Simulating performance degradation...");

  // Bad performance: 70% success rate (20% drop), 150ms avg time
  for (let i = 0; i < 30; i++) {
    await db.recordExecution(hookName, {
      family: "test",
      priority: "high",
      executionTime: 140 + Math.random() * 20,
      success: Math.random() < 0.7, // 70% success
      blocked: false,
    });
  }

  // Step 5: Trigger monitoring check
  console.log("\n4️⃣ Checking optimization performance...");

  // Force immediate check instead of waiting
  await feedbackLoop.checkOptimizationPerformance(monitoringId);

  // Give event handlers time to process
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Step 6: Verify rollback
  console.log("\n5️⃣ Verifying rollback...");

  const currentValue = adaptiveParams.parameters.get(optimization.parameter);

  if (rollbackTriggered && currentValue === optimization.oldValue) {
    console.log("✅ Rollback mechanism WORKS!");
    console.log(
      `   Parameter restored: ${optimization.parameter} = ${currentValue}`,
    );
    console.log(`   Rollback reason: ${rollbackReason}`);

    // Check database record
    const rollbackRecords = await db.getAllRows(
      "SELECT * FROM optimization_results WHERE hook_name = ? AND rolled_back = 1",
      [hookName],
    );

    if (rollbackRecords.length > 0) {
      console.log("✅ Rollback recorded in database");
    }

    return true;
  } else {
    console.log("❌ Rollback mechanism FAILED");
    console.log(`   Rollback triggered: ${rollbackTriggered}`);
    console.log(`   Current value: ${currentValue}`);
    console.log(`   Expected: ${optimization.oldValue}`);
    return false;
  }
}

// Run test
if (require.main === module) {
  testRollback()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test error:", error);
      process.exit(1);
    });
}
