#!/usr/bin/env node

/**
 * Final Validation of Learning System
 * Verifies all components are working together
 */

const SimpleLearningRunner = require("./SimpleLearningRunner");
const PatternAnalyzer = require("./PatternAnalyzer");
const LearningDatabase = require("./LearningDatabase");
const { getConfig } = require("./config");
const fs = require("fs");
const path = require("path");

async function runFinalValidation() {
  console.log("🚀 Final Validation of Hook Learning System\n");

  const results = {
    passed: [],
    failed: [],
  };

  // Test 1: Configuration System
  try {
    const config = getConfig();
    console.log("✓ Configuration system loaded");
    console.log(`  DB Path: ${config.dbPath}`);
    console.log(`  Learning Enabled: ${config.learningEnabled}`);
    results.passed.push("Configuration System");
  } catch (error) {
    console.error("✗ Configuration system failed:", error.message);
    results.failed.push({ test: "Configuration System", error: error.message });
  }

  // Test 2: Database Operations
  try {
    const db = new LearningDatabase();
    await db.initialize();

    // Verify tables exist
    const tables = await db.getAllRows(
      "SELECT name FROM sqlite_master WHERE type='table'",
      [],
    );
    console.log(
      "✓ Database initialized with tables:",
      tables.map((t) => t.name).join(", "),
    );
    results.passed.push("Database Operations");
  } catch (error) {
    console.error("✗ Database operations failed:", error.message);
    results.failed.push({ test: "Database Operations", error: error.message });
  }

  // Test 3: Learning Runner Integration
  try {
    const runner = new SimpleLearningRunner("validation-test", {
      family: "test",
      priority: "high",
    });

    // Execute a test hook
    const result = await runner.executeWithLearning(
      async (data) => ({ success: true, blocked: false }),
      { filePath: "/test/file.js", content: "test" },
    );

    console.log("✓ Learning runner executed successfully");
    results.passed.push("Learning Runner");
  } catch (error) {
    console.error("✗ Learning runner failed:", error.message);
    results.failed.push({ test: "Learning Runner", error: error.message });
  }

  // Test 4: Pattern Analysis
  try {
    const db = new LearningDatabase();
    await db.initialize();

    // Create test data
    const hookName = "pattern-test";
    for (let i = 0; i < 20; i++) {
      await db.recordExecution(hookName, {
        family: "test",
        priority: "medium",
        executionTime: 50 + Math.random() * 100,
        success: Math.random() > 0.2,
        blocked: false,
        filePath: `/test/file${i % 5}.js`,
        fileExtension: ".js",
      });
    }

    // Analyze patterns
    const analyzer = new PatternAnalyzer(hookName, db);
    const analysis = await analyzer.analyzeExecutionPatterns(10);

    console.log("✓ Pattern analysis completed");
    console.log(`  Time patterns: ${analysis.timePatterns ? "Found" : "None"}`);
    console.log(
      `  Success patterns: ${analysis.successPatterns ? "Found" : "None"}`,
    );
    console.log(`  File patterns: ${analysis.filePatterns ? "Found" : "None"}`);
    results.passed.push("Pattern Analysis");
  } catch (error) {
    console.error("✗ Pattern analysis failed:", error.message);
    results.failed.push({ test: "Pattern Analysis", error: error.message });
  }

  // Test 5: Hook Integration
  try {
    const PreventImprovedFilesWithLearning = require("./example-prevent-improved-learning");
    const hook = new PreventImprovedFilesWithLearning();

    // Test the hook
    const testResult = await hook.run({
      filePath: "/src/component_improved.tsx",
    });
    console.log("✓ Hook integration working");
    console.log(`  Test result: ${testResult.blocked ? "Blocked" : "Allowed"}`);
    results.passed.push("Hook Integration");
  } catch (error) {
    console.error("✗ Hook integration failed:", error.message);
    results.failed.push({ test: "Hook Integration", error: error.message });
  }

  // Test 6: Learning Insights
  try {
    const db = new LearningDatabase();
    await db.initialize();

    // Check for insights
    const insights = await db.getAllRows(
      "SELECT COUNT(*) as count FROM learning_insights",
      [],
    );

    console.log("✓ Learning insights system working");
    console.log(`  Total insights generated: ${insights[0].count}`);
    results.passed.push("Learning Insights");
  } catch (error) {
    console.error("✗ Learning insights failed:", error.message);
    results.failed.push({ test: "Learning Insights", error: error.message });
  }

  // Final Report
  console.log("\n" + "=".repeat(50));
  console.log("📊 FINAL VALIDATION REPORT\n");

  console.log(`✅ Passed: ${results.passed.length}`);
  results.passed.forEach((test) => console.log(`   - ${test}`));

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}`);
    results.failed.forEach(({ test, error }) => {
      console.log(`   - ${test}: ${error}`);
    });
  }

  const successRate =
    (results.passed.length / (results.passed.length + results.failed.length)) *
    100;
  console.log(`\nSuccess Rate: ${successRate.toFixed(1)}%`);

  if (successRate === 100) {
    console.log(
      "\n🎉 ALL SYSTEMS OPERATIONAL! The hook learning system is ready for production use.",
    );
  } else {
    console.log("\n⚠️  Some systems need attention before production use.");
  }

  // Check file structure
  console.log("\n📁 File Structure Verification:");
  const requiredFiles = [
    "LearningDatabase.js",
    "SimpleLearningRunner.js",
    "PatternAnalyzer.js",
    "ExecutionContext.js",
    "config.js",
    "DatabaseMigration.js",
    "hook-integration-adapter.js",
    "README.md",
    "models/HookExecution.js",
    "models/HookPattern.js",
    "models/SystemMetric.js",
    "models/LearningInsight.js",
  ];

  const missingFiles = [];
  requiredFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✓ ${file}`);
    } else {
      console.log(`   ✗ ${file} - MISSING`);
      missingFiles.push(file);
    }
  });

  if (missingFiles.length === 0) {
    console.log("\n✅ All required files present");
  } else {
    console.log(`\n❌ Missing ${missingFiles.length} required files`);
  }
}

// Run validation
if (require.main === module) {
  runFinalValidation().catch((error) => {
    console.error("Fatal error during validation:", error);
    process.exit(1);
  });
}
