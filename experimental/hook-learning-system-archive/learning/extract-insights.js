#!/usr/bin/env node

/**
 * Extract insights from learning database
 * Used to understand what patterns we discovered before simplifying the system
 */

const LearningDatabase = require("./LearningDatabase.js");
const fs = require("fs");
const path = require("path");

async function extractInsights() {
  const db = new LearningDatabase();
  await db.initialize();

  console.log("=== HOOK LEARNING INSIGHTS EXTRACTION ===\n");

  // Get all execution data
  const executions = await db.getAllRows(
    "SELECT * FROM hook_executions ORDER BY timestamp DESC",
  );
  console.log("Total executions recorded:", executions.length);

  // Hook usage summary
  const hookSummary = {};
  executions.forEach((exec) => {
    if (!hookSummary[exec.hook_name]) {
      hookSummary[exec.hook_name] = { total: 0, blocked: 0, successful: 0 };
    }
    hookSummary[exec.hook_name].total++;
    if (exec.blocked) hookSummary[exec.hook_name].blocked++;
    if (exec.success) hookSummary[exec.hook_name].successful++;
  });

  console.log("\n=== HOOK EFFECTIVENESS SUMMARY ===");
  Object.entries(hookSummary).forEach(([hook, stats]) => {
    console.log(`${hook}:`);
    console.log(`  Total executions: ${stats.total}`);
    console.log(`  Blocks: ${stats.blocked}`);
    console.log(
      `  Success rate: ${((stats.successful / stats.total) * 100).toFixed(1)}%`,
    );
    console.log(
      `  Block rate: ${((stats.blocked / stats.total) * 100).toFixed(1)}%`,
    );
  });

  // File patterns analysis
  const filePatterns = {};
  executions.forEach((exec) => {
    if (exec.file_path) {
      const ext = exec.file_extension || "unknown";
      if (!filePatterns[ext]) filePatterns[ext] = { total: 0, blocked: 0 };
      filePatterns[ext].total++;
      if (exec.blocked) filePatterns[ext].blocked++;
    }
  });

  console.log("\n=== FILE PATTERN ANALYSIS ===");
  Object.entries(filePatterns).forEach(([ext, stats]) => {
    console.log(
      `${ext}: ${stats.total} total, ${stats.blocked} blocked (${((stats.blocked / stats.total) * 100).toFixed(1)}%)`,
    );
  });

  // Most common file paths that were blocked
  const blockedPaths = executions
    .filter((exec) => exec.blocked && exec.file_path)
    .map((exec) => exec.file_path);

  const pathCounts = {};
  blockedPaths.forEach((path) => {
    pathCounts[path] = (pathCounts[path] || 0) + 1;
  });

  console.log("\n=== MOST BLOCKED FILE PATTERNS ===");
  const sortedPaths = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  sortedPaths.forEach(([path, count]) => {
    console.log(`${count}x: ${path}`);
  });

  // Pattern effectiveness from pattern_effectiveness table
  const patterns = await db.getAllRows("SELECT * FROM pattern_effectiveness");
  console.log("\n=== PATTERN EFFECTIVENESS (Phase 2) ===");
  patterns.forEach((pattern) => {
    const total =
      pattern.true_positives +
      pattern.false_positives +
      pattern.true_negatives +
      pattern.false_negatives;
    const precision =
      pattern.true_positives /
        (pattern.true_positives + pattern.false_positives) || 0;
    const recall =
      pattern.true_positives /
        (pattern.true_positives + pattern.false_negatives) || 0;
    if (total > 0) {
      console.log(`${pattern.hook_name} - ${pattern.pattern_type}:`);
      console.log(
        `  TP: ${pattern.true_positives}, FP: ${pattern.false_positives}, TN: ${pattern.true_negatives}, FN: ${pattern.false_negatives}`,
      );
      console.log(
        `  Precision: ${(precision * 100).toFixed(1)}%, Recall: ${(recall * 100).toFixed(1)}%`,
      );
    }
  });

  // Learning insights generated
  const insights = await db.getAllRows(
    "SELECT * FROM learning_insights ORDER BY timestamp DESC LIMIT 10",
  );
  console.log("\n=== RECENT LEARNING INSIGHTS ===");
  insights.forEach((insight) => {
    console.log(`${insight.insight_type} (confidence: ${insight.confidence}):`);
    try {
      const data = JSON.parse(insight.insight_data);
      console.log(`  ${JSON.stringify(data, null, 2)}`);
    } catch (e) {
      console.log(`  ${insight.insight_data}`);
    }
  });

  // Generate summary report
  const report = {
    summary: {
      totalExecutions: executions.length,
      uniqueHooks: Object.keys(hookSummary).length,
      totalBlocks: executions.filter((e) => e.blocked).length,
      overallSuccessRate: (
        (executions.filter((e) => e.success).length / executions.length) *
        100
      ).toFixed(1),
    },
    hookEffectiveness: hookSummary,
    filePatterns: filePatterns,
    mostBlockedPaths: Object.fromEntries(sortedPaths),
    patternEffectiveness: patterns,
    insights: insights.slice(0, 5),
  };

  // Save report for documentation
  const reportPath = path.join(__dirname, "extracted-insights.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);

  return report;
}

if (require.main === module) {
  extractInsights().catch(console.error);
}

module.exports = { extractInsights };
