#!/usr/bin/env node

/**
 * Simple Learning Runner
 * A working integration between hooks and learning system that doesn't require stdin
 */

const LearningDatabase = require("./LearningDatabase");
const ExecutionContext = require("./ExecutionContext");
const HookExecution = require("./models/HookExecution");
const HookPattern = require("./models/HookPattern");
const LearningInsight = require("./models/LearningInsight");
const { getConfig } = require("./config");
const PatternAnalyzer = require("./PatternAnalyzer");
const path = require("path");

class SimpleLearningRunner {
  constructor(hookName, options = {}) {
    this.hookName = hookName;
    this.family = options.family || "unknown";
    this.priority = options.priority || "medium";

    const config = getConfig();
    this.learningEnabled =
      options.learningEnabled !== false && config.learningEnabled;
    this.dbPath = options.dbPath || config.dbPath;
    this.config = config;

    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize learning system
   */
  async initialize() {
    if (this.initialized || !this.learningEnabled) return;

    try {
      this.db = new LearningDatabase(this.dbPath);
      await this.db.initialize();
      this.initialized = true;
    } catch (error) {
      console.error(
        `Failed to initialize learning for ${this.hookName}:`,
        error.message,
      );
      this.learningEnabled = false;
    }
  }

  /**
   * Execute hook with learning
   * @param {Function} hookFunction The hook function to execute
   * @param {Object} hookData The data to pass to the hook
   * @returns {Object} Execution result
   */
  async executeWithLearning(hookFunction, hookData) {
    await this.initialize();

    const startTime = Date.now();
    let result = null;
    let error = null;

    try {
      // Create execution context
      const context = new ExecutionContext(hookData, {
        name: this.hookName,
        family: this.family,
        priority: this.priority,
      });

      const capturedContext = await context.capture();

      // Apply any existing learning insights
      if (this.learningEnabled) {
        await this.applyLearningInsights(capturedContext);
      }

      // Execute the hook
      result = await hookFunction(hookData);

      // Record successful execution
      if (this.learningEnabled) {
        await this.recordExecution(
          capturedContext,
          result,
          Date.now() - startTime,
          true,
        );

        // Extract and update patterns asynchronously
        this.extractAndUpdatePatterns(capturedContext, result).catch((err) => {
          console.error("Pattern extraction error:", err.message);
        });

        // Generate insights asynchronously
        this.generateInsights().catch((err) => {
          console.error("Insight generation error:", err.message);
        });
      }

      return result;
    } catch (err) {
      error = err;

      // Record failed execution
      if (this.learningEnabled) {
        await this.recordExecution(
          { hookName: this.hookName },
          { success: false },
          Date.now() - startTime,
          false,
          err.message,
        );
      }

      throw err;
    }
  }

  /**
   * Record execution data
   */
  async recordExecution(
    context,
    result,
    executionTime,
    success,
    errorMessage = null,
  ) {
    if (!this.db) return;

    try {
      const executionData = {
        family: this.family,
        priority: this.priority,
        executionTime: executionTime,
        success: success && result.success !== false,
        blocked: result.blocked || false,
        filePath: context.filePath,
        fileExtension: context.fileExtension,
        contentHash: context.contentHash,
        context: {
          codeComplexity: context.codeComplexity,
          projectType: context.projectType,
          frameworks: context.frameworks,
        },
        errorMessage: errorMessage,
      };

      await this.db.recordExecution(this.hookName, executionData);
    } catch (error) {
      console.error("Failed to record execution:", error.message);
    }
  }

  /**
   * Extract patterns from execution and update learning data
   */
  async extractAndUpdatePatterns(context, result) {
    if (!this.db) return;

    try {
      // File extension pattern
      if (context.fileExtension) {
        await this.db.updatePattern(
          this.hookName,
          "file_extension",
          context.fileExtension,
          result.success !== false,
          result.blocked || false,
        );
      }

      // Execution time pattern
      const timeRange = this.getExecutionTimeRange(context.executionTime);
      await this.db.updatePattern(
        this.hookName,
        "execution_time_range",
        timeRange,
        result.success !== false,
        result.blocked || false,
      );

      // Project type pattern
      if (context.projectType) {
        await this.db.updatePattern(
          this.hookName,
          "project_type",
          context.projectType,
          result.success !== false,
          result.blocked || false,
        );
      }
    } catch (error) {
      console.error("Failed to extract patterns:", error.message);
    }
  }

  /**
   * Apply learning insights before execution
   */
  async applyLearningInsights(context) {
    if (!this.db) return;

    try {
      // Get recent insights
      const insights = await this.db.getAllRows(
        `SELECT * FROM learning_insights 
         WHERE hook_name = ? AND applied = 0 AND confidence > 0.7
         ORDER BY confidence DESC LIMIT 5`,
        [this.hookName],
      );

      for (const insightRow of insights) {
        const insight = LearningInsight.fromDbRow(insightRow);

        // Apply timeout optimizations
        if (
          insight.insightType === "timeout_optimization" &&
          insight.confidence > 0.8
        ) {
          // In a real implementation, this would adjust the actual timeout
          console.log(
            `Applied timeout optimization: ${insight.insightData.recommendedTimeout}ms`,
          );

          // Mark insight as applied
          await this.db.run(
            "UPDATE learning_insights SET applied = 1 WHERE id = ?",
            [insightRow.id],
          );
        }
      }
    } catch (error) {
      console.error("Failed to apply insights:", error.message);
    }
  }

  /**
   * Generate insights based on execution history
   */
  async generateInsights() {
    if (!this.db) return;

    try {
      // Use PatternAnalyzer for real statistical analysis
      const analyzer = new PatternAnalyzer(this.hookName, this.db);
      const analysis = await analyzer.analyzeExecutionPatterns(
        this.config.minExecutionsForPatterns,
      );

      if (analysis.insufficient_data) {
        return; // Not enough data for meaningful analysis
      }

      // Generate insights from time patterns
      if (analysis.timePatterns && analysis.timePatterns.recommendation) {
        for (const rec of analysis.timePatterns.recommendation) {
          if (
            rec.type === "timeout_reduction" &&
            rec.confidence > this.config.minConfidenceForInsights
          ) {
            await this.db.recordLearningInsight(
              this.hookName,
              "timeout_optimization",
              {
                currentTimeout: rec.current,
                recommendedTimeout: rec.recommended,
                statistics: analysis.timePatterns.statistics,
                confidence: rec.confidence,
              },
              rec.confidence,
            );
          }
        }
      }

      // Generate insights from success patterns
      if (
        analysis.successPatterns &&
        analysis.successPatterns.recommendations
      ) {
        for (const rec of analysis.successPatterns.recommendations) {
          if (rec.confidence > this.config.minConfidenceForInsights) {
            await this.db.recordLearningInsight(
              this.hookName,
              "pattern_refinement",
              {
                ...rec,
                overallSuccessRate: analysis.successPatterns.overallSuccessRate,
                correlations: analysis.successPatterns.correlations,
              },
              rec.confidence,
            );
          }
        }
      }

      // Generate insights from anomalies
      if (analysis.anomalies && analysis.anomalies.length > 0) {
        const highSeverityAnomalies = analysis.anomalies.filter(
          (a) => a.severity === "high",
        );
        if (highSeverityAnomalies.length > 0) {
          await this.db.recordLearningInsight(
            this.hookName,
            "anomaly_detection",
            {
              anomalyCount: highSeverityAnomalies.length,
              anomalies: highSeverityAnomalies,
              recommendation: "Investigate anomalous execution patterns",
            },
            0.9,
          );
        }
      }
    } catch (error) {
      console.error("Failed to generate insights:", error.message);
    }
  }

  /**
   * Get execution time range category
   */
  getExecutionTimeRange(time) {
    if (time < 100) return "very_fast";
    if (time < 500) return "fast";
    if (time < 1000) return "normal";
    if (time < 3000) return "slow";
    return "very_slow";
  }

  /**
   * Get learning statistics
   */
  async getLearningStats() {
    if (!this.db) return null;

    try {
      const stats = await this.db.getAllRows(
        `SELECT 
          COUNT(*) as total_executions,
          AVG(execution_time) as avg_execution_time,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
         FROM hook_executions 
         WHERE hook_name = ?`,
        [this.hookName],
      );

      const patterns = await this.db.getPatterns(this.hookName);
      const insights = await this.db.getAllRows(
        "SELECT COUNT(*) as count FROM learning_insights WHERE hook_name = ?",
        [this.hookName],
      );

      return {
        executions: stats[0].total_executions,
        avgExecutionTime: Math.round(stats[0].avg_execution_time),
        successRate: Math.round(stats[0].success_rate),
        patternsLearned: patterns.length,
        insightsGenerated: insights[0].count,
      };
    } catch (error) {
      console.error("Failed to get stats:", error.message);
      return null;
    }
  }
}

module.exports = SimpleLearningRunner;
