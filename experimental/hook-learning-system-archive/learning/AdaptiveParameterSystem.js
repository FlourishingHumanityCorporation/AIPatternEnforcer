#!/usr/bin/env node

/**
 * Adaptive Parameter System
 * Enables hooks to automatically adjust their parameters based on learned patterns
 *
 * Key features:
 * - Dynamic timeout adjustment based on execution history
 * - Pattern-based rule refinement
 * - Gradual parameter changes to prevent instability
 * - Automatic rollback on performance degradation
 * - A/B testing for parameter changes
 */

const LearningDatabase = require("./LearningDatabase");
const { getConfig } = require("./config");

class AdaptiveParameterSystem {
  constructor(hookName, options = {}) {
    this.hookName = hookName;
    this.db = new LearningDatabase();
    this.config = getConfig().adaptiveLearningConfig;

    // Current parameters
    this.parameters = new Map();

    // Optimization history
    this.optimizationHistory = [];

    // A/B testing state
    this.abTests = new Map();

    // Performance baselines
    this.baselines = {
      successRate: null,
      avgExecutionTime: null,
      errorRate: null,
    };

    // Options
    this.options = {
      maxChangeRate:
        options.maxChangeRate || this.config.maxParameterChangeRate,
      cooldownPeriod:
        options.cooldownPeriod || this.config.optimizationCooldown,
      rollbackThreshold:
        options.rollbackThreshold || this.config.rollbackThreshold,
      ...options,
    };

    this.initialized = false;
  }

  /**
   * Initialize the adaptive parameter system
   */
  async initialize() {
    if (this.initialized) return;

    await this.db.initialize();
    await this.loadParameters();
    await this.loadBaselines();
    await this.loadOptimizationHistory();

    this.initialized = true;
  }

  /**
   * Optimize timeout parameter based on execution history
   */
  async optimizeTimeout() {
    await this.initialize();

    // Check cooldown period
    if (!this.canOptimize("timeout")) {
      return null;
    }

    // Get recent execution times
    const recentExecutions = await this.db.getRecentExecutions(
      this.hookName,
      100,
    );
    if (recentExecutions.length < 50) {
      return null; // Not enough data
    }

    // Calculate statistics
    const times = recentExecutions.map((e) => e.execution_time);
    const stats = this.calculateTimeStatistics(times);

    // Current timeout
    const currentTimeout = this.parameters.get("timeout") || 3000;

    // Calculate optimal timeout (95th percentile + buffer)
    const optimalTimeout = Math.max(
      stats.p95 * 1.2, // 20% buffer above 95th percentile
      stats.mean + 3 * stats.stdDev, // 3 standard deviations
      1000, // Minimum 1 second
    );

    // Apply gradual adjustment
    const adjustedTimeout = this.applyGradualChange(
      currentTimeout,
      optimalTimeout,
    );

    // Check if change is significant
    if (Math.abs(adjustedTimeout - currentTimeout) < 50) {
      return null;
    }

    // Create optimization record
    const optimization = {
      parameter: "timeout",
      oldValue: currentTimeout,
      newValue: adjustedTimeout,
      confidence: this.calculateConfidence(
        recentExecutions.length,
        stats.consistency,
      ),
      reason: "execution_time_optimization",
      stats: stats,
    };

    // Apply the optimization
    await this.applyOptimization(optimization);

    return optimization;
  }

  /**
   * Refine patterns based on effectiveness
   */
  async refinePatterns() {
    await this.initialize();

    // Get pattern effectiveness data
    const patterns = await this.db.getAllRows(
      `SELECT * FROM pattern_effectiveness 
       WHERE hook_name = ? AND (true_positives + false_positives + true_negatives + false_negatives) > 20`,
      [this.hookName],
    );

    const refinements = [];

    for (const pattern of patterns) {
      const effectiveness = this.calculatePatternEffectiveness(pattern);

      // Check if pattern needs refinement
      if (
        effectiveness.precision < 0.7 &&
        effectiveness.falsePositiveRate > 0.2
      ) {
        refinements.push({
          parameter: `pattern_sensitivity_${pattern.pattern_type}`,
          targetPattern: pattern.pattern_key,
          oldValue:
            this.parameters.get(
              `pattern_sensitivity_${pattern.pattern_type}`,
            ) || "standard",
          newValue: "reduced",
          confidence: effectiveness.confidence,
          reason: "high_false_positive_rate",
          stats: effectiveness,
        });
      } else if (
        effectiveness.recall < 0.7 &&
        effectiveness.falseNegativeRate > 0.2
      ) {
        refinements.push({
          parameter: `pattern_sensitivity_${pattern.pattern_type}`,
          targetPattern: pattern.pattern_key,
          oldValue:
            this.parameters.get(
              `pattern_sensitivity_${pattern.pattern_type}`,
            ) || "standard",
          newValue: "increased",
          confidence: effectiveness.confidence,
          reason: "high_false_negative_rate",
          stats: effectiveness,
        });
      }
    }

    // Apply refinements
    for (const refinement of refinements) {
      if (this.canOptimize(refinement.parameter)) {
        await this.applyOptimization(refinement);
      }
    }

    return refinements;
  }

  /**
   * Adjust thresholds based on performance
   */
  async adjustThresholds() {
    await this.initialize();

    const adjustments = [];

    // Get current performance metrics
    const currentMetrics = await this.getCurrentPerformanceMetrics();

    // Compare with baselines
    if (this.baselines.successRate && currentMetrics.successRate) {
      const successRateChange =
        currentMetrics.successRate - this.baselines.successRate;

      // If success rate dropped significantly
      if (successRateChange < -0.1) {
        adjustments.push({
          parameter: "enforcement_strictness",
          oldValue: this.parameters.get("enforcement_strictness") || "standard",
          newValue: "relaxed",
          confidence: 0.8,
          reason: "success_rate_drop",
          stats: { successRateChange, current: currentMetrics.successRate },
        });
      }
      // If success rate improved significantly with room for more
      else if (successRateChange > 0.1 && currentMetrics.successRate < 0.95) {
        adjustments.push({
          parameter: "enforcement_strictness",
          oldValue: this.parameters.get("enforcement_strictness") || "standard",
          newValue: "strict",
          confidence: 0.7,
          reason: "success_rate_improvement",
          stats: { successRateChange, current: currentMetrics.successRate },
        });
      }
    }

    // Apply adjustments
    for (const adjustment of adjustments) {
      if (this.canOptimize(adjustment.parameter)) {
        await this.applyOptimization(adjustment);
      }
    }

    return adjustments;
  }

  /**
   * Start A/B test for a parameter change
   */
  async startABTest(parameter, variantValue, options = {}) {
    const testId = `${parameter}_${Date.now()}`;

    const abTest = {
      id: testId,
      parameter,
      controlValue: this.parameters.get(parameter),
      variantValue,
      startTime: Date.now(),
      duration: options.duration || 3600000, // 1 hour default
      sampleSize: options.sampleSize || 0.5, // 50% get variant
      metrics: {
        control: { executions: 0, successes: 0, totalTime: 0 },
        variant: { executions: 0, successes: 0, totalTime: 0 },
      },
    };

    this.abTests.set(testId, abTest);

    return testId;
  }

  /**
   * Get parameter value considering A/B tests
   */
  getParameter(parameter, context = {}) {
    // Check for active A/B tests
    for (const [testId, test] of this.abTests) {
      if (test.parameter === parameter && this.isTestActive(test)) {
        // Determine if this execution should get variant
        const useVariant = this.shouldUseVariant(test, context);
        return useVariant ? test.variantValue : test.controlValue;
      }
    }

    // Return current parameter value
    return this.parameters.get(parameter);
  }

  /**
   * Record execution result for A/B testing
   */
  async recordABTestResult(parameter, value, result) {
    for (const [testId, test] of this.abTests) {
      if (test.parameter === parameter && this.isTestActive(test)) {
        const group = value === test.variantValue ? "variant" : "control";
        test.metrics[group].executions++;
        if (result.success) test.metrics[group].successes++;
        test.metrics[group].totalTime += result.executionTime || 0;

        // Check if test is complete
        if (this.isTestComplete(test)) {
          await this.concludeABTest(testId);
        }
      }
    }
  }

  /**
   * Conclude A/B test and apply winning variant
   */
  async concludeABTest(testId) {
    const test = this.abTests.get(testId);
    if (!test) return;

    // Calculate success rates
    const controlRate =
      test.metrics.control.successes / test.metrics.control.executions;
    const variantRate =
      test.metrics.variant.successes / test.metrics.variant.executions;

    // Calculate average execution times
    const controlAvgTime =
      test.metrics.control.totalTime / test.metrics.control.executions;
    const variantAvgTime =
      test.metrics.variant.totalTime / test.metrics.variant.executions;

    // Determine winner (prioritize success rate, then performance)
    let winner = "control";
    if (variantRate > controlRate + 0.05) {
      // 5% improvement threshold
      winner = "variant";
    } else if (
      Math.abs(variantRate - controlRate) < 0.05 &&
      variantAvgTime < controlAvgTime * 0.9
    ) {
      winner = "variant"; // Similar success rate but 10% faster
    }

    // Apply winning value
    if (winner === "variant") {
      await this.applyOptimization({
        parameter: test.parameter,
        oldValue: test.controlValue,
        newValue: test.variantValue,
        confidence: this.calculateABTestConfidence(test),
        reason: "ab_test_winner",
        stats: {
          controlRate,
          variantRate,
          controlAvgTime,
          variantAvgTime,
          improvement: variantRate - controlRate,
        },
      });
    }

    // Clean up test
    this.abTests.delete(testId);

    return {
      winner,
      controlRate,
      variantRate,
      improvement: variantRate - controlRate,
    };
  }

  /**
   * Apply parameter optimization
   */
  async applyOptimization(optimization) {
    // Update parameter
    this.parameters.set(optimization.parameter, optimization.newValue);

    // Record change
    await this.db.run(
      `INSERT INTO parameter_changes 
       (hook_name, parameter_name, old_value, new_value, metadata, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        this.hookName,
        optimization.parameter,
        JSON.stringify(optimization.oldValue),
        JSON.stringify(optimization.newValue),
        JSON.stringify(optimization),
      ],
    );

    // Update optimization history with consistent structure
    this.optimizationHistory.push({
      timestamp: Date.now(),
      optimization: optimization,
      parameter: optimization.parameter,
    });

    // Save parameters
    await this.saveParameters();

    // Set up monitoring for rollback
    this.monitorOptimization(optimization);
  }

  /**
   * Monitor optimization for potential rollback
   */
  async monitorOptimization(optimization) {
    // Use FeedbackLoopSystem if available
    if (!this.feedbackLoop) {
      const FeedbackLoopSystem = require("./FeedbackLoopSystem");
      this.feedbackLoop = new FeedbackLoopSystem(this.hookName);

      // Set up event handlers
      this.feedbackLoop.on("optimization:rollback", async (data) => {
        // Perform actual rollback
        await this.rollbackOptimization(data.optimization, data.degradation);
      });

      this.feedbackLoop.on("optimization:accepted", async (data) => {
        // Log success
        console.log(
          `Optimization ${data.optimization.parameter} confirmed successful`,
        );
      });
    }

    // Start monitoring
    await this.feedbackLoop.monitorOptimization(optimization);
  }

  /**
   * Rollback an optimization
   */
  async rollbackOptimization(optimization, reason) {
    // Restore old value
    this.parameters.set(optimization.parameter, optimization.oldValue);

    // Record rollback
    await this.db.run(
      `INSERT INTO optimization_results 
       (hook_name, optimization_type, success_rate_before, success_rate_after, 
        performance_impact, rolled_back, rollback_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        this.hookName,
        optimization.parameter,
        reason.successRateBefore || null,
        reason.successRateAfter || null,
        reason.executionTimeIncrease || null,
        true,
        JSON.stringify(reason),
      ],
    );

    await this.saveParameters();
  }

  /**
   * Calculate time statistics
   */
  calculateTimeStatistics(times) {
    const sorted = [...times].sort((a, b) => a - b);
    const n = times.length;

    const mean = times.reduce((a, b) => a + b, 0) / n;
    const variance =
      times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const percentile = (p) => {
      const index = (n - 1) * p;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index % 1;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    // Calculate consistency (inverse of coefficient of variation)
    const consistency = stdDev > 0 ? 1 - Math.min(stdDev / mean, 1) : 1;

    return {
      mean,
      stdDev,
      min: sorted[0],
      max: sorted[n - 1],
      p50: percentile(0.5),
      p90: percentile(0.9),
      p95: percentile(0.95),
      p99: percentile(0.99),
      consistency,
    };
  }

  /**
   * Calculate pattern effectiveness metrics
   */
  calculatePatternEffectiveness(pattern) {
    const tp = pattern.true_positives || 0;
    const fp = pattern.false_positives || 0;
    const tn = pattern.true_negatives || 0;
    const fn = pattern.false_negatives || 0;

    const total = tp + fp + tn + fn;

    return {
      precision: tp > 0 ? tp / (tp + fp) : 0,
      recall: tp > 0 ? tp / (tp + fn) : 0,
      f1Score: tp > 0 ? (2 * tp) / (2 * tp + fp + fn) : 0,
      accuracy: total > 0 ? (tp + tn) / total : 0,
      falsePositiveRate: fp / (fp + tn) || 0,
      falseNegativeRate: fn / (fn + tp) || 0,
      confidence: Math.min(total / 100, 1), // Confidence based on sample size
    };
  }

  /**
   * Apply gradual change to prevent instability
   */
  applyGradualChange(currentValue, targetValue) {
    const maxChange = currentValue * this.options.maxChangeRate;
    const desiredChange = targetValue - currentValue;
    const actualChange = Math.max(
      -maxChange,
      Math.min(maxChange, desiredChange),
    );
    return currentValue + actualChange;
  }

  /**
   * Check if optimization can be performed
   */
  canOptimize(parameter) {
    const lastOptimization = this.optimizationHistory
      .filter(
        (h) =>
          h.optimization &&
          (h.optimization.parameter === parameter || h.parameter === parameter),
      )
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (!lastOptimization) return true;

    const timeSinceLastOptimization = Date.now() - lastOptimization.timestamp;
    const canOptimize = timeSinceLastOptimization > this.options.cooldownPeriod;

    if (!canOptimize) {
      console.log(
        `Skipping ${parameter} optimization - cooldown active (${Math.round(timeSinceLastOptimization / 1000)}s < ${Math.round(this.options.cooldownPeriod / 1000)}s)`,
      );
    }

    return canOptimize;
  }

  /**
   * Calculate confidence for optimization
   */
  calculateConfidence(sampleSize, consistency) {
    let confidence = 0.5;

    // Sample size factor
    if (sampleSize > 50) confidence += 0.2;
    if (sampleSize > 100) confidence += 0.1;
    if (sampleSize > 500) confidence += 0.1;

    // Consistency factor
    confidence += consistency * 0.1;

    return Math.min(confidence, 0.95);
  }

  /**
   * Calculate A/B test confidence
   */
  calculateABTestConfidence(test) {
    const totalExecutions =
      test.metrics.control.executions + test.metrics.variant.executions;
    const balance =
      Math.min(
        test.metrics.control.executions,
        test.metrics.variant.executions,
      ) /
      Math.max(
        test.metrics.control.executions,
        test.metrics.variant.executions,
      );

    let confidence = 0.5;

    // Sample size
    if (totalExecutions > 100) confidence += 0.2;
    if (totalExecutions > 500) confidence += 0.2;

    // Balance between groups
    confidence += balance * 0.1;

    return confidence;
  }

  /**
   * Check if A/B test is active
   */
  isTestActive(test) {
    return Date.now() - test.startTime < test.duration;
  }

  /**
   * Check if A/B test is complete
   */
  isTestComplete(test) {
    const minExecutions = 50;
    return (
      !this.isTestActive(test) ||
      (test.metrics.control.executions >= minExecutions &&
        test.metrics.variant.executions >= minExecutions)
    );
  }

  /**
   * Determine if execution should use variant in A/B test
   */
  shouldUseVariant(test, context) {
    // Simple random assignment based on sample size
    return Math.random() < test.sampleSize;
  }

  /**
   * Get current performance metrics
   */
  async getCurrentPerformanceMetrics() {
    const recentExecutions = await this.db.getRecentExecutions(
      this.hookName,
      100,
    );

    if (recentExecutions.length === 0) {
      return {
        successRate: 0,
        avgExecutionTime: 0,
        errorRate: 0,
      };
    }

    const successes = recentExecutions.filter((e) => e.success).length;
    const totalTime = recentExecutions.reduce(
      (sum, e) => sum + e.execution_time,
      0,
    );

    return {
      successRate: successes / recentExecutions.length,
      avgExecutionTime: totalTime / recentExecutions.length,
      errorRate: 1 - successes / recentExecutions.length,
    };
  }

  /**
   * Load parameters from database
   */
  async loadParameters() {
    try {
      const params = await this.db.getAllRows(
        "SELECT * FROM adaptive_parameters WHERE hook_name = ?",
        [this.hookName],
      );

      for (const param of params) {
        this.parameters.set(
          param.parameter_name,
          JSON.parse(param.parameter_value),
        );
      }
    } catch (error) {
      // Table might not exist yet
    }
  }

  /**
   * Save parameters to database
   */
  async saveParameters() {
    for (const [name, value] of this.parameters) {
      await this.db.run(
        `INSERT OR REPLACE INTO adaptive_parameters 
         (hook_name, parameter_name, parameter_value, last_updated)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [this.hookName, name, JSON.stringify(value)],
      );
    }
  }

  /**
   * Load performance baselines
   */
  async loadBaselines() {
    const metrics = await this.getCurrentPerformanceMetrics();
    if (!this.baselines.successRate) {
      this.baselines = metrics;
    }
  }

  /**
   * Load optimization history
   */
  async loadOptimizationHistory() {
    try {
      const history = await this.db.getAllRows(
        `SELECT * FROM parameter_changes 
         WHERE hook_name = ? 
         ORDER BY timestamp DESC 
         LIMIT 100`,
        [this.hookName],
      );

      this.optimizationHistory = history.map((h) => ({
        timestamp: new Date(h.timestamp).getTime(),
        optimization: JSON.parse(h.metadata),
      }));
    } catch (error) {
      // Table might not exist yet
    }
  }

  /**
   * Get all current parameters
   */
  getAllParameters() {
    return Object.fromEntries(this.parameters);
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory() {
    return this.optimizationHistory;
  }
}

module.exports = AdaptiveParameterSystem;
