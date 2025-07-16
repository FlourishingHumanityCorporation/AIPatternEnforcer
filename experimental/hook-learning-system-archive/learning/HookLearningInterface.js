#!/usr/bin/env node

/**
 * Hook Learning Interface
 * Standard learning API that all hooks can use to improve their effectiveness
 *
 * This class provides:
 * - Pattern extraction from executions
 * - Success/failure correlation analysis
 * - Optimization opportunity identification
 * - Adaptive parameter adjustment
 * - Learning state management
 */

const LearningDatabase = require("./LearningDatabase");
const PatternAnalyzer = require("./PatternAnalyzer");
const { getConfig } = require("./config");
const crypto = require("crypto");

class HookLearningInterface {
  constructor(hookName, options = {}) {
    this.hookName = hookName;
    this.options = options;

    // Learning components
    this.learningDB = new LearningDatabase();
    this.patternAnalyzer = new PatternAnalyzer(hookName, this.learningDB);

    // Learning state
    this.patterns = new Map();
    this.adaptiveParameters = new Map();
    this.optimizationHistory = [];
    this.learningState = {
      totalExecutions: 0,
      lastOptimization: null,
      learningEnabled: true,
      confidence: 0,
    };

    // Configuration
    this.config = getConfig();
    this.minExecutionsForLearning =
      options.minExecutions || this.config.minExecutionsForPatterns;
    this.minConfidenceForChanges =
      options.minConfidence || this.config.minConfidenceForInsights;
    this.maxParameterChangeRate = options.maxChangeRate || 0.2; // 20% max change per optimization

    this.initialized = false;
  }

  /**
   * Initialize learning interface
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await this.learningDB.initialize();
      await this.loadLearningState();
      await this.loadAdaptiveParameters();
      this.initialized = true;
    } catch (error) {
      console.error(
        `Failed to initialize learning for ${this.hookName}:`,
        error.message,
      );
      this.learningState.learningEnabled = false;
    }
  }

  /**
   * Main learning entry point - called after each execution
   */
  async learnFromExecution(context, result, executionTime) {
    if (!this.learningState.learningEnabled) return null;

    await this.initialize();

    try {
      // Update execution count
      this.learningState.totalExecutions++;

      // Extract patterns from this execution
      const patterns = await this.extractPatterns(context, result);

      // Update pattern statistics
      await this.updatePatternStatistics(patterns, result);

      // Check if we have enough data to optimize
      if (this.learningState.totalExecutions >= this.minExecutionsForLearning) {
        // Identify optimization opportunities
        const optimizations = await this.identifyOptimizations();

        // Apply adaptive adjustments if confidence is high enough
        if (optimizations.length > 0) {
          const applied = await this.applyAdaptiveAdjustments(optimizations);

          // Record optimization history
          if (applied.length > 0) {
            this.optimizationHistory.push({
              timestamp: Date.now(),
              optimizations: applied,
              executionCount: this.learningState.totalExecutions,
            });
            this.learningState.lastOptimization = Date.now();
          }

          return {
            patternsLearned: patterns.length,
            optimizationsIdentified: optimizations.length,
            optimizationsApplied: applied.length,
            learningConfidence: await this.calculateLearningConfidence(),
          };
        }
      }

      return {
        patternsLearned: patterns.length,
        optimizationsIdentified: 0,
        optimizationsApplied: 0,
        learningConfidence: await this.calculateLearningConfidence(),
      };
    } catch (error) {
      console.error("Learning error:", error.message);
      return null;
    }
  }

  /**
   * Extract patterns from execution context and result
   */
  async extractPatterns(context, result) {
    const patterns = [];

    // File-based patterns
    if (context.filePath) {
      patterns.push({
        type: "file_pattern",
        pattern: this.extractFilePattern(context.filePath),
        metadata: {
          extension: context.fileExtension,
          directory: this.extractDirectoryPattern(context.filePath),
        },
      });
    }

    // Content-based patterns
    if (context.contentHash) {
      patterns.push({
        type: "content_pattern",
        pattern: context.contentHash,
        metadata: {
          complexity: context.codeComplexity,
          size: context.contentSize,
        },
      });
    }

    // Execution patterns
    patterns.push({
      type: "execution_pattern",
      pattern: {
        timeRange: this.categorizeExecutionTime(result.executionTime || 0),
        systemLoad: this.categorizeSystemLoad(context.systemLoad || 0),
        timeOfDay: this.categorizeTimeOfDay(),
      },
    });

    // Context patterns
    if (context.projectType || context.frameworks) {
      patterns.push({
        type: "context_pattern",
        pattern: {
          projectType: context.projectType,
          frameworks: context.frameworks || [],
        },
      });
    }

    return patterns;
  }

  /**
   * Update pattern statistics with execution results
   */
  async updatePatternStatistics(patterns, result) {
    for (const pattern of patterns) {
      const patternKey = this.generatePatternKey(pattern);

      if (!this.patterns.has(patternKey)) {
        this.patterns.set(patternKey, {
          type: pattern.type,
          pattern: pattern.pattern,
          metadata: pattern.metadata,
          totalCount: 0,
          successCount: 0,
          blockCount: 0,
          avgExecutionTime: 0,
          executionTimes: [],
        });
      }

      const stats = this.patterns.get(patternKey);
      stats.totalCount++;

      if (result.success) {
        stats.successCount++;
      }

      if (result.blocked) {
        stats.blockCount++;
      }

      // Update execution time average
      if (result.executionTime) {
        stats.executionTimes.push(result.executionTime);
        // Keep only last 100 execution times
        if (stats.executionTimes.length > 100) {
          stats.executionTimes.shift();
        }
        stats.avgExecutionTime =
          stats.executionTimes.reduce((a, b) => a + b, 0) /
          stats.executionTimes.length;
      }

      // Persist pattern updates
      await this.learningDB.updatePattern(
        this.hookName,
        pattern.type,
        JSON.stringify(pattern.pattern),
        result.success,
        result.blocked,
      );
    }
  }

  /**
   * Identify optimization opportunities based on learned patterns
   */
  async identifyOptimizations() {
    const optimizations = [];

    // Analyze recent execution patterns
    const analysis = await this.patternAnalyzer.analyzeExecutionPatterns(
      this.minExecutionsForLearning,
    );

    if (analysis.insufficient_data) {
      return optimizations;
    }

    // Timeout optimization
    if (analysis.timePatterns && analysis.timePatterns.recommendation) {
      for (const rec of analysis.timePatterns.recommendation) {
        if (
          rec.type === "timeout_reduction" &&
          rec.confidence >= this.minConfidenceForChanges
        ) {
          optimizations.push({
            type: "timeout",
            parameter: "executionTimeout",
            currentValue: rec.current,
            recommendedValue: rec.recommended,
            confidence: rec.confidence,
            reason: "Execution times consistently below current timeout",
          });
        }
      }
    }

    // Pattern sensitivity optimization
    if (analysis.successPatterns && analysis.successPatterns.correlations) {
      // Check for patterns with high false positive rates
      const extensionCorrelations =
        analysis.successPatterns.correlations.extension || [];

      for (const corr of extensionCorrelations) {
        if (
          corr.direction === "negative" &&
          corr.successRate < 0.5 &&
          corr.count > 20
        ) {
          optimizations.push({
            type: "pattern_refinement",
            parameter: "patternSensitivity",
            targetPattern: `file_extension:${corr.key}`,
            currentValue: "standard",
            recommendedValue: "reduced",
            confidence: corr.confidence || 0.7,
            reason: `High false positive rate for ${corr.key} files`,
          });
        }
      }
    }

    // Performance optimizations based on context
    if (analysis.filePatterns && analysis.filePatterns.recommendations) {
      for (const rec of analysis.filePatterns.recommendations) {
        if (rec.type === "performance_optimization" && rec.avgTime > 1000) {
          optimizations.push({
            type: "performance",
            parameter: "processingStrategy",
            targetPattern: rec.pattern,
            currentValue: "standard",
            recommendedValue: "optimized",
            confidence: Math.min(rec.frequency / 50, 0.9),
            reason: `Slow processing for pattern: ${rec.pattern}`,
          });
        }
      }
    }

    return optimizations;
  }

  /**
   * Apply adaptive adjustments based on optimizations
   */
  async applyAdaptiveAdjustments(optimizations) {
    const applied = [];

    for (const optimization of optimizations) {
      try {
        // Check if we should apply this optimization
        if (!this.shouldApplyOptimization(optimization)) {
          continue;
        }

        // Apply gradual adjustment
        const adjusted = await this.applyGradualAdjustment(optimization);

        if (adjusted) {
          applied.push(adjusted);

          // Record the adjustment
          await this.recordParameterChange(
            optimization.parameter,
            optimization.currentValue,
            adjusted.newValue,
            optimization,
          );
        }
      } catch (error) {
        console.error(`Failed to apply optimization: ${error.message}`);
      }
    }

    // Save updated parameters
    await this.saveAdaptiveParameters();

    return applied;
  }

  /**
   * Apply gradual adjustment to prevent drastic changes
   */
  async applyGradualAdjustment(optimization) {
    const { parameter, currentValue, recommendedValue, type } = optimization;

    let newValue;

    switch (type) {
      case "timeout":
        // Numeric adjustment with max change rate
        const currentTimeout = currentValue || 3000;
        const maxChange = currentTimeout * this.maxParameterChangeRate;
        const desiredChange = recommendedValue - currentTimeout;
        const actualChange = Math.max(
          -maxChange,
          Math.min(maxChange, desiredChange),
        );
        newValue = Math.round(currentTimeout + actualChange);

        // Don't adjust if change is too small
        if (Math.abs(actualChange) < 50) return null;

        this.adaptiveParameters.set(parameter, newValue);
        break;

      case "pattern_refinement":
        // Categorical adjustment
        if (currentValue !== recommendedValue) {
          newValue = recommendedValue;
          const patternKey = `${parameter}_${optimization.targetPattern}`;
          this.adaptiveParameters.set(patternKey, newValue);
        }
        break;

      case "performance":
        // Strategy adjustment
        newValue = recommendedValue;
        const strategyKey = `${parameter}_${optimization.targetPattern}`;
        this.adaptiveParameters.set(strategyKey, newValue);
        break;
    }

    return newValue
      ? {
          parameter,
          oldValue: currentValue,
          newValue,
          type,
          confidence: optimization.confidence,
        }
      : null;
  }

  /**
   * Check if optimization should be applied
   */
  shouldApplyOptimization(optimization) {
    // Check confidence threshold
    if (optimization.confidence < this.minConfidenceForChanges) {
      return false;
    }

    // Check if we've made recent changes to this parameter
    const recentChanges = this.optimizationHistory
      .filter((h) => Date.now() - h.timestamp < 3600000) // Last hour
      .flatMap((h) => h.optimizations)
      .filter((o) => o.parameter === optimization.parameter);

    if (recentChanges.length > 2) {
      return false; // Too many recent changes
    }

    return true;
  }

  /**
   * Calculate overall learning confidence
   */
  async calculateLearningConfidence() {
    if (this.learningState.totalExecutions < this.minExecutionsForLearning) {
      return (
        (this.learningState.totalExecutions / this.minExecutionsForLearning) *
        0.5
      );
    }

    // Base confidence on data quality and optimization success
    let confidence = 0.5;

    // Factor in execution count
    if (this.learningState.totalExecutions > 100) confidence += 0.2;
    if (this.learningState.totalExecutions > 1000) confidence += 0.1;

    // Factor in pattern stability
    const patternStability = await this.calculatePatternStability();
    confidence += patternStability * 0.2;

    this.learningState.confidence = Math.min(confidence, 1.0);
    return this.learningState.confidence;
  }

  /**
   * Calculate pattern stability metric
   */
  async calculatePatternStability() {
    if (this.patterns.size === 0) return 0;

    let totalStability = 0;
    let patternCount = 0;

    for (const [key, stats] of this.patterns) {
      if (stats.totalCount < 10) continue;

      // Calculate success rate variance
      const successRate = stats.successCount / stats.totalCount;
      const recentRate = this.calculateRecentSuccessRate(key);
      const variance = Math.abs(successRate - recentRate);

      // Lower variance = higher stability
      const stability = 1 - Math.min(variance, 1);
      totalStability += stability;
      patternCount++;
    }

    return patternCount > 0 ? totalStability / patternCount : 0;
  }

  /**
   * Helper: Calculate recent success rate for a pattern
   */
  calculateRecentSuccessRate(patternKey) {
    // In a real implementation, this would query recent executions
    // For now, return the overall rate
    const stats = this.patterns.get(patternKey);
    return stats ? stats.successCount / stats.totalCount : 0;
  }

  /**
   * Helper: Generate unique key for pattern
   */
  generatePatternKey(pattern) {
    const data = `${pattern.type}:${JSON.stringify(pattern.pattern)}`;
    return crypto.createHash("md5").update(data).digest("hex");
  }

  /**
   * Helper: Extract file pattern
   */
  extractFilePattern(filePath) {
    const parts = filePath.split("/");
    return {
      depth: parts.length,
      directories: parts.slice(0, -1).slice(-3), // Last 3 directories
      filename: parts[parts.length - 1],
    };
  }

  /**
   * Helper: Extract directory pattern
   */
  extractDirectoryPattern(filePath) {
    const parts = filePath.split("/");
    if (parts.length < 2) return "root";

    // Common directory patterns
    const dir = parts[parts.length - 2];
    if (["src", "lib", "components", "pages", "app"].includes(dir)) {
      return dir;
    }

    return "other";
  }

  /**
   * Helper: Categorize execution time
   */
  categorizeExecutionTime(time) {
    if (time < 100) return "very_fast";
    if (time < 500) return "fast";
    if (time < 1000) return "normal";
    if (time < 3000) return "slow";
    return "very_slow";
  }

  /**
   * Helper: Categorize system load
   */
  categorizeSystemLoad(load) {
    if (load < 0.3) return "low";
    if (load < 0.7) return "medium";
    return "high";
  }

  /**
   * Helper: Categorize time of day
   */
  categorizeTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }

  /**
   * Load learning state from database
   */
  async loadLearningState() {
    try {
      const state = await this.learningDB.getAllRows(
        "SELECT * FROM learning_state WHERE hook_name = ? LIMIT 1",
        [this.hookName],
      );

      if (state.length > 0) {
        this.learningState = JSON.parse(state[0].state_data);
      }
    } catch (error) {
      // Table might not exist yet, that's okay
    }
  }

  /**
   * Load adaptive parameters from database
   */
  async loadAdaptiveParameters() {
    try {
      const params = await this.learningDB.getAllRows(
        "SELECT * FROM adaptive_parameters WHERE hook_name = ?",
        [this.hookName],
      );

      for (const param of params) {
        this.adaptiveParameters.set(
          param.parameter_name,
          JSON.parse(param.parameter_value),
        );
      }
    } catch (error) {
      // Table might not exist yet, that's okay
    }
  }

  /**
   * Save adaptive parameters to database
   */
  async saveAdaptiveParameters() {
    for (const [name, value] of this.adaptiveParameters) {
      await this.learningDB.run(
        `INSERT OR REPLACE INTO adaptive_parameters 
         (hook_name, parameter_name, parameter_value, last_updated)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [this.hookName, name, JSON.stringify(value)],
      );
    }
  }

  /**
   * Record parameter change for tracking
   */
  async recordParameterChange(parameter, oldValue, newValue, metadata) {
    await this.learningDB.run(
      `INSERT INTO parameter_changes 
       (hook_name, parameter_name, old_value, new_value, metadata, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        this.hookName,
        parameter,
        JSON.stringify(oldValue),
        JSON.stringify(newValue),
        JSON.stringify(metadata),
      ],
    );
  }

  /**
   * Get current adaptive parameters
   */
  getAdaptiveParameters() {
    return Object.fromEntries(this.adaptiveParameters);
  }

  /**
   * Get learning statistics
   */
  async getLearningStatistics() {
    return {
      hookName: this.hookName,
      totalExecutions: this.learningState.totalExecutions,
      patternsLearned: this.patterns.size,
      adaptiveParameters: this.adaptiveParameters.size,
      optimizationHistory: this.optimizationHistory.length,
      lastOptimization: this.learningState.lastOptimization,
      confidence: await this.calculateLearningConfidence(),
      learningEnabled: this.learningState.learningEnabled,
    };
  }
}

module.exports = HookLearningInterface;
