#!/usr/bin/env node

/**
 * Feedback Loop System
 *
 * Monitors optimization effectiveness and triggers adjustments or rollbacks
 * based on real performance data. This creates closed-loop control for
 * the adaptive learning system.
 */

const LearningDatabase = require("./LearningDatabase");
const { getConfig } = require("./config");
const EventEmitter = require("events");

class FeedbackLoopSystem extends EventEmitter {
  constructor(hookName) {
    super();

    this.hookName = hookName;
    this.db = new LearningDatabase();
    this.config = getConfig().adaptiveLearningConfig;

    // Performance baselines
    this.baselines = {
      successRate: null,
      avgExecutionTime: null,
      errorRate: null,
      lastUpdated: null,
    };

    // Active optimizations being monitored
    this.activeOptimizations = new Map();

    // Monitoring intervals
    this.monitoringIntervals = new Map();

    this.initialized = false;
  }

  /**
   * Initialize feedback system
   */
  async initialize() {
    if (this.initialized) return;

    await this.db.initialize();
    await this.loadBaselines();
    await this.loadActiveOptimizations();

    this.initialized = true;
  }

  /**
   * Start monitoring an optimization
   */
  async monitorOptimization(optimization) {
    await this.initialize();

    const monitoringId = `${optimization.parameter}_${Date.now()}`;

    // Capture current performance as baseline
    const baselineMetrics = await this.getCurrentMetrics();

    // Store optimization details
    const monitoringData = {
      id: monitoringId,
      optimization,
      baselineMetrics,
      startTime: Date.now(),
      checkpoints: [],
      status: "active",
    };

    this.activeOptimizations.set(monitoringId, monitoringData);

    // Set up periodic monitoring
    const interval = setInterval(async () => {
      await this.checkOptimizationPerformance(monitoringId);
    }, 60000); // Check every minute

    this.monitoringIntervals.set(monitoringId, interval);

    // Schedule final evaluation
    setTimeout(async () => {
      await this.evaluateOptimization(monitoringId);
    }, this.config.optimizationCooldown || 3600000); // 1 hour default

    // Emit event
    this.emit("optimization:started", { monitoringId, optimization });

    return monitoringId;
  }

  /**
   * Check optimization performance at checkpoint
   */
  async checkOptimizationPerformance(monitoringId) {
    const monitoring = this.activeOptimizations.get(monitoringId);
    if (!monitoring || monitoring.status !== "active") return;

    // Get current metrics
    const currentMetrics = await this.getCurrentMetrics();

    // Calculate performance changes
    const changes = this.calculateMetricChanges(
      monitoring.baselineMetrics,
      currentMetrics,
    );

    // Record checkpoint
    monitoring.checkpoints.push({
      timestamp: Date.now(),
      metrics: currentMetrics,
      changes,
    });

    // Check for significant degradation
    if (this.shouldTriggerRollback(changes)) {
      await this.rollbackOptimization(
        monitoringId,
        "performance_degradation",
        changes,
      );
      return;
    }

    // Check for early success
    if (this.shouldAcceptEarly(changes, monitoring.checkpoints.length)) {
      await this.acceptOptimization(monitoringId, "early_success", changes);
      return;
    }

    // Emit progress event
    this.emit("optimization:checkpoint", {
      monitoringId,
      checkpoint: monitoring.checkpoints.length,
      changes,
    });
  }

  /**
   * Final evaluation of optimization
   */
  async evaluateOptimization(monitoringId) {
    const monitoring = this.activeOptimizations.get(monitoringId);
    if (!monitoring || monitoring.status !== "active") return;

    // Clear monitoring interval
    const interval = this.monitoringIntervals.get(monitoringId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(monitoringId);
    }

    // Get final metrics
    const finalMetrics = await this.getCurrentMetrics();
    const finalChanges = this.calculateMetricChanges(
      monitoring.baselineMetrics,
      finalMetrics,
    );

    // Determine success/failure
    const success = this.evaluateOptimizationSuccess(
      finalChanges,
      monitoring.checkpoints,
    );

    if (success) {
      await this.acceptOptimization(
        monitoringId,
        "evaluation_complete",
        finalChanges,
      );
    } else {
      await this.rollbackOptimization(
        monitoringId,
        "evaluation_failed",
        finalChanges,
      );
    }
  }

  /**
   * Accept optimization as successful
   */
  async acceptOptimization(monitoringId, reason, finalChanges) {
    const monitoring = this.activeOptimizations.get(monitoringId);
    if (!monitoring) return;

    monitoring.status = "accepted";
    monitoring.endTime = Date.now();
    monitoring.reason = reason;
    monitoring.finalChanges = finalChanges;

    // Record success
    await this.db.run(
      `
      INSERT INTO optimization_results
        (hook_name, optimization_type, applied_at, 
         success_rate_before, success_rate_after,
         performance_impact, rolled_back, rollback_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        this.hookName,
        monitoring.optimization.parameter,
        new Date(monitoring.startTime).toISOString(),
        monitoring.baselineMetrics.successRate,
        monitoring.baselineMetrics.successRate + finalChanges.successRateChange,
        finalChanges.executionTimeChange,
        false,
        null,
      ],
    );

    // Update baselines
    await this.updateBaselines();

    // Emit success event
    this.emit("optimization:accepted", {
      monitoringId,
      optimization: monitoring.optimization,
      improvement: finalChanges,
      duration: monitoring.endTime - monitoring.startTime,
    });

    // Clean up
    this.cleanupMonitoring(monitoringId);
  }

  /**
   * Rollback failed optimization
   */
  async rollbackOptimization(monitoringId, reason, changes) {
    const monitoring = this.activeOptimizations.get(monitoringId);
    if (!monitoring) return;

    monitoring.status = "rolled_back";
    monitoring.endTime = Date.now();
    monitoring.reason = reason;
    monitoring.finalChanges = changes;

    // Record failure
    await this.db.run(
      `
      INSERT INTO optimization_results
        (hook_name, optimization_type, applied_at, 
         success_rate_before, success_rate_after,
         performance_impact, rolled_back, rollback_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        this.hookName,
        monitoring.optimization.parameter,
        new Date(monitoring.startTime).toISOString(),
        monitoring.baselineMetrics.successRate,
        monitoring.baselineMetrics.successRate + changes.successRateChange,
        changes.executionTimeChange,
        true,
        JSON.stringify({ reason, changes }),
      ],
    );

    // Emit rollback event (actual rollback handled by AdaptiveParameterSystem)
    this.emit("optimization:rollback", {
      monitoringId,
      optimization: monitoring.optimization,
      reason,
      degradation: changes,
    });

    // Clean up
    this.cleanupMonitoring(monitoringId);
  }

  /**
   * Calculate metric changes
   */
  calculateMetricChanges(baseline, current) {
    return {
      successRateChange: current.successRate - baseline.successRate,
      executionTimeChange:
        (current.avgExecutionTime - baseline.avgExecutionTime) /
        baseline.avgExecutionTime,
      errorRateChange: current.errorRate - baseline.errorRate,
      executionCountChange: current.executionCount - baseline.executionCount,
    };
  }

  /**
   * Check if rollback should be triggered
   */
  shouldTriggerRollback(changes) {
    // Significant success rate drop
    if (changes.successRateChange < -this.config.rollbackThreshold) {
      return true;
    }

    // Significant performance degradation
    if (changes.executionTimeChange > this.config.rollbackThreshold) {
      return true;
    }

    // Significant error rate increase
    if (changes.errorRateChange > this.config.rollbackThreshold) {
      return true;
    }

    return false;
  }

  /**
   * Check if optimization should be accepted early
   */
  shouldAcceptEarly(changes, checkpointCount) {
    // Need at least 3 checkpoints
    if (checkpointCount < 3) return false;

    // Significant improvement with stability
    return (
      changes.successRateChange > 0.1 &&
      changes.executionTimeChange < -0.2 &&
      changes.errorRateChange <= 0
    );
  }

  /**
   * Evaluate final optimization success
   */
  evaluateOptimizationSuccess(finalChanges, checkpoints) {
    // Check final metrics
    if (
      finalChanges.successRateChange >= 0 &&
      finalChanges.executionTimeChange <= 0.1 &&
      finalChanges.errorRateChange <= 0.05
    ) {
      return true;
    }

    // Check trend over time
    if (checkpoints.length >= 5) {
      const trend = this.calculateTrend(checkpoints);
      return trend.improving;
    }

    return false;
  }

  /**
   * Calculate performance trend
   */
  calculateTrend(checkpoints) {
    if (checkpoints.length < 2) {
      return { improving: false, stable: false };
    }

    // Simple linear regression on success rate
    const xValues = checkpoints.map((_, i) => i);
    const yValues = checkpoints.map((c) => c.changes.successRateChange);

    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return {
      improving: slope > 0,
      stable: Math.abs(slope) < 0.01,
      slope,
    };
  }

  /**
   * Get current performance metrics
   */
  async getCurrentMetrics() {
    const recentExecutions = await this.db.getRecentExecutions(
      this.hookName,
      100,
    );

    if (recentExecutions.length === 0) {
      return {
        successRate: 0,
        avgExecutionTime: 0,
        errorRate: 0,
        executionCount: 0,
      };
    }

    const successes = recentExecutions.filter((e) => e.success).length;
    const errors = recentExecutions.filter((e) => e.error_message).length;
    const totalTime = recentExecutions.reduce(
      (sum, e) => sum + e.execution_time,
      0,
    );

    return {
      successRate: successes / recentExecutions.length,
      avgExecutionTime: totalTime / recentExecutions.length,
      errorRate: errors / recentExecutions.length,
      executionCount: recentExecutions.length,
    };
  }

  /**
   * Load performance baselines
   */
  async loadBaselines() {
    // Try to load from database
    const stored = await this.db.getAllRows(
      "SELECT * FROM learning_state WHERE hook_name = ?",
      [this.hookName],
    );

    if (stored.length > 0) {
      const state = JSON.parse(stored[0].state_data);
      if (state.baselines) {
        this.baselines = state.baselines;
        return;
      }
    }

    // Calculate initial baselines
    await this.updateBaselines();
  }

  /**
   * Update performance baselines
   */
  async updateBaselines() {
    this.baselines = await this.getCurrentMetrics();
    this.baselines.lastUpdated = Date.now();

    // Store in database
    await this.db.run(
      `
      INSERT OR REPLACE INTO learning_state (hook_name, state_data, last_updated)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `,
      [this.hookName, JSON.stringify({ baselines: this.baselines })],
    );
  }

  /**
   * Load active optimizations from database
   */
  async loadActiveOptimizations() {
    // In a production system, this would restore monitoring from persistent storage
    // For now, we start fresh
  }

  /**
   * Clean up monitoring data
   */
  cleanupMonitoring(monitoringId) {
    // Clear interval if exists
    const interval = this.monitoringIntervals.get(monitoringId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(monitoringId);
    }

    // Archive monitoring data (keep for analysis)
    const monitoring = this.activeOptimizations.get(monitoringId);
    if (monitoring) {
      monitoring.archived = true;
    }
  }

  /**
   * Get optimization history
   */
  async getOptimizationHistory(limit = 10) {
    return await this.db.getAllRows(
      `
      SELECT * FROM optimization_results
      WHERE hook_name = ?
      ORDER BY applied_at DESC
      LIMIT ?
    `,
      [this.hookName, limit],
    );
  }

  /**
   * Get current monitoring status
   */
  getMonitoringStatus() {
    const active = [];
    const completed = [];

    for (const [id, monitoring] of this.activeOptimizations) {
      const summary = {
        id,
        parameter: monitoring.optimization.parameter,
        startTime: monitoring.startTime,
        status: monitoring.status,
        checkpoints: monitoring.checkpoints.length,
      };

      if (monitoring.status === "active") {
        active.push(summary);
      } else {
        completed.push({
          ...summary,
          endTime: monitoring.endTime,
          reason: monitoring.reason,
        });
      }
    }

    return { active, completed };
  }
}

module.exports = FeedbackLoopSystem;

// CLI interface for testing
if (require.main === module) {
  (async () => {
    console.log("Feedback Loop System Demo\n");

    const feedback = new FeedbackLoopSystem("demo-hook");
    await feedback.initialize();

    // Listen to events
    feedback.on("optimization:started", (data) => {
      console.log(`\n✅ Started monitoring: ${data.optimization.parameter}`);
    });

    feedback.on("optimization:checkpoint", (data) => {
      console.log(`📊 Checkpoint ${data.checkpoint}:`, data.changes);
    });

    feedback.on("optimization:accepted", (data) => {
      console.log(`\n🎉 Optimization accepted: ${data.optimization.parameter}`);
      console.log(`   Improvement:`, data.improvement);
    });

    feedback.on("optimization:rollback", (data) => {
      console.log(
        `\n⚠️  Optimization rolled back: ${data.optimization.parameter}`,
      );
      console.log(`   Reason: ${data.reason}`);
    });

    // Simulate an optimization
    const optimization = {
      parameter: "timeout",
      oldValue: 3000,
      newValue: 1500,
      confidence: 0.8,
    };

    console.log("Starting optimization monitoring...");
    const monitoringId = await feedback.monitorOptimization(optimization);

    // Show status
    console.log("\nMonitoring Status:");
    console.log(feedback.getMonitoringStatus());

    // Show history
    console.log("\nOptimization History:");
    const history = await feedback.getOptimizationHistory();
    console.log(history);
  })();
}
