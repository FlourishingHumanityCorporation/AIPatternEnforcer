#!/usr/bin/env node

/**
 * Pattern Effectiveness Tracker
 *
 * Critical missing component that actually tracks true/false positives/negatives
 * for patterns and updates the pattern_effectiveness table.
 *
 * This enables the adaptive system to learn which patterns are effective
 * and which cause false positives.
 */

const LearningDatabase = require("./LearningDatabase");
const crypto = require("crypto");

class PatternEffectivenessTracker {
  constructor(hookName) {
    this.hookName = hookName;
    this.db = new LearningDatabase();
    this.initialized = false;

    // Cache for recent decisions
    this.recentDecisions = new Map();
    this.maxCacheSize = 1000;
  }

  /**
   * Initialize the tracker
   */
  async initialize() {
    if (this.initialized) return;

    await this.db.initialize();
    this.initialized = true;
  }

  /**
   * Record a hook decision and its pattern
   */
  async recordDecision(context, decision, patterns) {
    await this.initialize();

    const decisionId = this.generateDecisionId(context);

    // Store decision for later validation
    this.recentDecisions.set(decisionId, {
      context,
      decision,
      patterns,
      timestamp: Date.now(),
    });

    // Maintain cache size
    if (this.recentDecisions.size > this.maxCacheSize) {
      const oldestKey = this.recentDecisions.keys().next().value;
      this.recentDecisions.delete(oldestKey);
    }

    return decisionId;
  }

  /**
   * Validate a previous decision with actual outcome
   */
  async validateDecision(decisionId, actualOutcome) {
    await this.initialize();

    const decision = this.recentDecisions.get(decisionId);
    if (!decision) {
      // Decision not in cache, try to reconstruct from context
      return false;
    }

    // Determine if decision was correct
    const wasCorrect = this.evaluateDecision(decision.decision, actualOutcome);

    // Update pattern effectiveness for each pattern involved
    for (const pattern of decision.patterns) {
      await this.updatePatternEffectiveness(
        pattern,
        decision.decision,
        actualOutcome,
        wasCorrect,
      );
    }

    // Clean up
    this.recentDecisions.delete(decisionId);

    return true;
  }

  /**
   * Record pattern effectiveness based on execution result
   */
  async recordPatternResult(pattern, predictedResult, actualResult) {
    await this.initialize();

    const patternKey = this.generatePatternKey(pattern);
    const wasCorrect = this.evaluateDecision(predictedResult, actualResult);

    await this.updatePatternEffectiveness(
      pattern,
      predictedResult,
      actualResult,
      wasCorrect,
    );
  }

  /**
   * Update pattern effectiveness metrics
   */
  async updatePatternEffectiveness(pattern, predicted, actual, wasCorrect) {
    const patternType = pattern.type;
    const patternKey = this.generatePatternKey(pattern);

    // Determine which metric to increment
    let updateField;

    if (predicted.blocked && actual.shouldBlock) {
      updateField = "true_positives"; // Correctly blocked
    } else if (predicted.blocked && !actual.shouldBlock) {
      updateField = "false_positives"; // Incorrectly blocked
    } else if (!predicted.blocked && !actual.shouldBlock) {
      updateField = "true_negatives"; // Correctly allowed
    } else if (!predicted.blocked && actual.shouldBlock) {
      updateField = "false_negatives"; // Incorrectly allowed
    }

    // Update the pattern effectiveness
    await this.db.run(
      `
      INSERT INTO pattern_effectiveness 
        (hook_name, pattern_type, pattern_key, ${updateField})
      VALUES (?, ?, ?, 1)
      ON CONFLICT(hook_name, pattern_type, pattern_key) 
      DO UPDATE SET 
        ${updateField} = ${updateField} + 1,
        last_updated = CURRENT_TIMESTAMP
    `,
      [this.hookName, patternType, patternKey],
    );

    // Check if pattern needs review
    await this.checkPatternHealth(patternType, patternKey);
  }

  /**
   * Check if a pattern's effectiveness has degraded
   */
  async checkPatternHealth(patternType, patternKey) {
    const stats = await this.db.getAllRows(
      `
      SELECT * FROM pattern_effectiveness
      WHERE hook_name = ? AND pattern_type = ? AND pattern_key = ?
    `,
      [this.hookName, patternType, patternKey],
    );

    if (stats.length === 0) return;

    const s = stats[0];
    const total =
      s.true_positives +
      s.false_positives +
      s.true_negatives +
      s.false_negatives;

    if (total < 20) return; // Not enough data

    // Calculate metrics
    const precision = s.true_positives / (s.true_positives + s.false_positives);
    const recall = s.true_positives / (s.true_positives + s.false_negatives);
    const fpr = s.false_positives / (s.false_positives + s.true_negatives);

    // Generate insight if pattern is problematic
    if (precision < 0.5 && total > 50) {
      await this.db.recordLearningInsight(
        this.hookName,
        "pattern_degradation",
        {
          patternType,
          patternKey,
          precision,
          recall,
          falsePositiveRate: fpr,
          totalObservations: total,
          recommendation: "Consider reducing sensitivity or removing pattern",
        },
        0.9,
      );
    }
  }

  /**
   * Get pattern effectiveness statistics
   */
  async getPatternStats(patternType = null) {
    await this.initialize();

    let sql = `
      SELECT 
        pattern_type,
        pattern_key,
        true_positives as tp,
        false_positives as fp,
        true_negatives as tn,
        false_negatives as fn,
        (true_positives + false_positives + true_negatives + false_negatives) as total,
        CASE 
          WHEN (true_positives + false_positives) > 0 
          THEN CAST(true_positives AS REAL) / (true_positives + false_positives)
          ELSE 0 
        END as precision,
        CASE 
          WHEN (true_positives + false_negatives) > 0 
          THEN CAST(true_positives AS REAL) / (true_positives + false_negatives)
          ELSE 0 
        END as recall,
        CASE 
          WHEN (false_positives + true_negatives) > 0 
          THEN CAST(false_positives AS REAL) / (false_positives + true_negatives)
          ELSE 0 
        END as false_positive_rate
      FROM pattern_effectiveness
      WHERE hook_name = ?
    `;

    const params = [this.hookName];

    if (patternType) {
      sql += " AND pattern_type = ?";
      params.push(patternType);
    }

    sql += " ORDER BY total DESC";

    return await this.db.getAllRows(sql, params);
  }

  /**
   * Get patterns that need attention
   */
  async getProblematicPatterns(threshold = 0.7) {
    const allStats = await this.getPatternStats();

    return allStats.filter((stat) => {
      // Need sufficient data
      if (stat.total < 20) return false;

      // Check for problems
      return (
        stat.precision < threshold ||
        stat.false_positive_rate > 1 - threshold ||
        stat.recall < threshold
      );
    });
  }

  /**
   * Generate decision ID from context
   */
  generateDecisionId(context) {
    const data = JSON.stringify({
      filePath: context.filePath,
      timestamp: Date.now(),
      random: Math.random(),
    });
    return crypto.createHash("md5").update(data).digest("hex");
  }

  /**
   * Generate pattern key
   */
  generatePatternKey(pattern) {
    if (typeof pattern === "string") return pattern;
    return crypto
      .createHash("md5")
      .update(JSON.stringify(pattern.pattern))
      .digest("hex");
  }

  /**
   * Evaluate if a decision was correct
   */
  evaluateDecision(predicted, actual) {
    return predicted.blocked === actual.shouldBlock;
  }

  /**
   * Clean up old cached decisions
   */
  cleanupCache() {
    const cutoff = Date.now() - 3600000; // 1 hour

    for (const [id, decision] of this.recentDecisions) {
      if (decision.timestamp < cutoff) {
        this.recentDecisions.delete(id);
      }
    }
  }

  /**
   * Integrate with hook execution
   */
  async trackExecution(context, patterns, decision, callback) {
    // Record the decision
    const decisionId = await this.recordDecision(context, decision, patterns);

    // Execute the actual hook logic
    const result = await callback();

    // In a real system, we'd validate against actual outcomes
    // For now, we'll use the result as ground truth
    const actualOutcome = {
      shouldBlock:
        result.userReportedFalsePositive === false && decision.blocked,
    };

    // Validate the decision
    await this.validateDecision(decisionId, actualOutcome);

    return result;
  }
}

// Example integration with a hook
class PatternAwareHook {
  constructor(hookName) {
    this.hookName = hookName;
    this.tracker = new PatternEffectivenessTracker(hookName);
  }

  async run(context) {
    // Extract patterns from context
    const patterns = this.extractPatterns(context);

    // Make decision based on patterns
    const decision = this.makeDecision(patterns);

    // Track the execution
    return await this.tracker.trackExecution(
      context,
      patterns,
      decision,
      async () => {
        // Actual hook logic here
        return {
          success: true,
          blocked: decision.blocked,
          message: decision.message,
        };
      },
    );
  }

  extractPatterns(context) {
    // Extract relevant patterns for decision making
    return [
      {
        type: "file_extension",
        pattern: context.fileExtension,
      },
      {
        type: "file_path",
        pattern: context.filePath,
      },
    ];
  }

  makeDecision(patterns) {
    // Make decision based on patterns
    // This would use the adaptive parameters in a real implementation
    return {
      blocked: false,
      message: "Allowed",
    };
  }
}

module.exports = PatternEffectivenessTracker;

// CLI interface for testing
if (require.main === module) {
  const tracker = new PatternEffectivenessTracker("test-hook");

  (async () => {
    console.log("Pattern Effectiveness Tracker Test\n");

    // Simulate some pattern results
    const patterns = [
      { type: "file_extension", pattern: ".js" },
      { type: "file_extension", pattern: ".tsx" },
      { type: "file_path", pattern: "/src/components" },
    ];

    // Record some results
    for (let i = 0; i < 30; i++) {
      const pattern = patterns[i % patterns.length];
      const predicted = { blocked: Math.random() > 0.5 };
      const actual = { shouldBlock: Math.random() > 0.3 };

      await tracker.recordPatternResult(pattern, predicted, actual);
    }

    // Get statistics
    console.log("Pattern Statistics:");
    const stats = await tracker.getPatternStats();

    stats.forEach((stat) => {
      console.log(`\n${stat.pattern_type}: ${stat.pattern_key}`);
      console.log(`  Total: ${stat.total}`);
      console.log(`  Precision: ${(stat.precision * 100).toFixed(1)}%`);
      console.log(`  Recall: ${(stat.recall * 100).toFixed(1)}%`);
      console.log(`  FPR: ${(stat.false_positive_rate * 100).toFixed(1)}%`);
    });

    // Check for problematic patterns
    console.log("\n\nProblematic Patterns:");
    const problems = await tracker.getProblematicPatterns();

    if (problems.length === 0) {
      console.log("  None found");
    } else {
      problems.forEach((p) => {
        console.log(
          `  - ${p.pattern_type}: ${p.pattern_key} (precision: ${(p.precision * 100).toFixed(1)}%)`,
        );
      });
    }
  })();
}
