#!/usr/bin/env node

/**
 * Pattern Analyzer
 * Real statistical analysis and pattern recognition for the learning system
 */

const path = require("path");

class PatternAnalyzer {
  constructor(hookName, db) {
    this.hookName = hookName;
    this.db = db;
  }

  /**
   * Analyze execution patterns with real statistics
   */
  async analyzeExecutionPatterns(minExecutions = 10) {
    const executions = await this.db.getExecutionHistory(this.hookName, 1000);

    if (executions.length < minExecutions) {
      return { insufficient_data: true, executions: executions.length };
    }

    return {
      timePatterns: await this.analyzeTimePatterns(executions),
      successPatterns: await this.analyzeSuccessPatterns(executions),
      filePatterns: await this.analyzeFilePatterns(executions),
      anomalies: await this.detectAnomalies(executions),
    };
  }

  /**
   * Analyze execution time patterns
   */
  async analyzeTimePatterns(executions) {
    const times = executions.map((e) => e.execution_time);

    // Calculate statistics
    const stats = this.calculateStatistics(times);

    // Detect time-based patterns
    const hourlyPattern = this.analyzeHourlyPattern(executions);
    const weeklyPattern = this.analyzeWeeklyPattern(executions);

    // Identify outliers
    const outliers = this.identifyOutliers(times, stats);

    return {
      statistics: stats,
      hourlyPattern,
      weeklyPattern,
      outliers,
      recommendation: this.generateTimeRecommendation(stats, outliers),
    };
  }

  /**
   * Analyze success/failure patterns
   */
  async analyzeSuccessPatterns(executions) {
    const patterns = new Map();

    // Group by various dimensions
    const byExtension = this.groupBy(
      executions,
      (e) => e.file_extension || "unknown",
    );
    const byHour = this.groupBy(executions, (e) =>
      new Date(e.timestamp).getHours(),
    );
    const byDayOfWeek = this.groupBy(executions, (e) =>
      new Date(e.timestamp).getDay(),
    );

    // Calculate success rates for each group
    const extensionStats = this.calculateGroupSuccessRates(byExtension);
    const hourlyStats = this.calculateGroupSuccessRates(byHour);
    const weeklyStats = this.calculateGroupSuccessRates(byDayOfWeek);

    // Find correlations
    const correlations = {
      extension: this.findSignificantCorrelations(extensionStats),
      hourly: this.findSignificantCorrelations(hourlyStats),
      weekly: this.findSignificantCorrelations(weeklyStats),
    };

    return {
      overallSuccessRate: this.calculateSuccessRate(executions),
      byExtension: extensionStats,
      byHour: hourlyStats,
      byDayOfWeek: weeklyStats,
      correlations,
      recommendations: this.generateSuccessRecommendations(correlations),
    };
  }

  /**
   * Analyze file patterns
   */
  async analyzeFilePatterns(executions) {
    const filePatterns = new Map();

    executions.forEach((exec) => {
      if (!exec.file_path) return;

      // Extract patterns from file path
      const patterns = this.extractFilePatterns(exec.file_path);
      patterns.forEach((pattern) => {
        if (!filePatterns.has(pattern)) {
          filePatterns.set(pattern, {
            count: 0,
            successes: 0,
            failures: 0,
            avgTime: 0,
            times: [],
          });
        }

        const stats = filePatterns.get(pattern);
        stats.count++;
        stats.times.push(exec.execution_time);
        if (exec.success) {
          stats.successes++;
        } else {
          stats.failures++;
        }
      });
    });

    // Calculate final statistics
    const patternStats = [];
    filePatterns.forEach((stats, pattern) => {
      stats.avgTime =
        stats.times.reduce((a, b) => a + b, 0) / stats.times.length;
      stats.successRate = stats.successes / stats.count;
      stats.pattern = pattern;
      patternStats.push(stats);
    });

    // Sort by frequency and impact
    patternStats.sort((a, b) => b.count - a.count);

    return {
      patterns: patternStats.slice(0, 20), // Top 20 patterns
      totalPatterns: filePatterns.size,
      recommendations: this.generateFilePatternRecommendations(patternStats),
    };
  }

  /**
   * Detect anomalies in execution patterns
   */
  async detectAnomalies(executions) {
    const anomalies = [];

    // Time-based anomaly detection
    const times = executions.map((e) => e.execution_time);
    const timeStats = this.calculateStatistics(times);
    const timeOutliers = this.identifyOutliers(times, timeStats);

    timeOutliers.forEach((outlier) => {
      anomalies.push({
        type: "execution_time",
        execution: executions[outlier.index],
        deviation: outlier.deviation,
        severity: outlier.deviation > 3 ? "high" : "medium",
      });
    });

    // Pattern-based anomaly detection
    const recentExecs = executions.slice(0, 20);
    const olderExecs = executions.slice(20);

    if (olderExecs.length > 0) {
      const recentSuccessRate = this.calculateSuccessRate(recentExecs);
      const olderSuccessRate = this.calculateSuccessRate(olderExecs);
      const rateDiff = Math.abs(recentSuccessRate - olderSuccessRate);

      if (rateDiff > 0.2) {
        anomalies.push({
          type: "success_rate_change",
          recent: recentSuccessRate,
          historical: olderSuccessRate,
          change: recentSuccessRate - olderSuccessRate,
          severity: rateDiff > 0.4 ? "high" : "medium",
        });
      }
    }

    return anomalies;
  }

  /**
   * Calculate comprehensive statistics
   */
  calculateStatistics(values) {
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;

    // Basic statistics
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Variance and standard deviation
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Percentiles
    const percentile = (p) => {
      const index = (n - 1) * p;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index % 1;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    return {
      count: n,
      min: sorted[0],
      max: sorted[n - 1],
      mean: mean,
      median: percentile(0.5),
      stdDev: stdDev,
      p25: percentile(0.25),
      p75: percentile(0.75),
      p90: percentile(0.9),
      p95: percentile(0.95),
      p99: percentile(0.99),
      iqr: percentile(0.75) - percentile(0.25),
    };
  }

  /**
   * Identify statistical outliers
   */
  identifyOutliers(values, stats) {
    const outliers = [];

    values.forEach((value, index) => {
      // Z-score method
      const zScore = Math.abs(value - stats.mean) / stats.stdDev;

      // IQR method
      const iqrLower = stats.p25 - 1.5 * stats.iqr;
      const iqrUpper = stats.p75 + 1.5 * stats.iqr;
      const isIqrOutlier = value < iqrLower || value > iqrUpper;

      if (zScore > 2.5 || isIqrOutlier) {
        outliers.push({
          index,
          value,
          deviation: zScore,
          method: zScore > 2.5 ? "z-score" : "iqr",
        });
      }
    });

    return outliers;
  }

  /**
   * Analyze hourly patterns
   */
  analyzeHourlyPattern(executions) {
    const hourlyData = Array(24)
      .fill(null)
      .map(() => ({
        count: 0,
        totalTime: 0,
        successes: 0,
      }));

    executions.forEach((exec) => {
      const hour = new Date(exec.timestamp).getHours();
      hourlyData[hour].count++;
      hourlyData[hour].totalTime += exec.execution_time;
      if (exec.success) hourlyData[hour].successes++;
    });

    return hourlyData.map((data, hour) => ({
      hour,
      count: data.count,
      avgTime: data.count > 0 ? data.totalTime / data.count : null,
      successRate: data.count > 0 ? data.successes / data.count : null,
    }));
  }

  /**
   * Analyze weekly patterns
   */
  analyzeWeeklyPattern(executions) {
    const weeklyData = Array(7)
      .fill(null)
      .map(() => ({
        count: 0,
        totalTime: 0,
        successes: 0,
      }));

    executions.forEach((exec) => {
      const day = new Date(exec.timestamp).getDay();
      weeklyData[day].count++;
      weeklyData[day].totalTime += exec.execution_time;
      if (exec.success) weeklyData[day].successes++;
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return weeklyData.map((data, day) => ({
      day: dayNames[day],
      count: data.count,
      avgTime: data.count > 0 ? data.totalTime / data.count : null,
      successRate: data.count > 0 ? data.successes / data.count : null,
    }));
  }

  /**
   * Helper: Group executions by a key function
   */
  groupBy(executions, keyFn) {
    const groups = new Map();

    executions.forEach((exec) => {
      const key = keyFn(exec);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(exec);
    });

    return groups;
  }

  /**
   * Calculate success rates for grouped data
   */
  calculateGroupSuccessRates(groups) {
    const stats = [];

    groups.forEach((executions, key) => {
      const successRate = this.calculateSuccessRate(executions);
      stats.push({
        key,
        count: executions.length,
        successRate,
        avgTime:
          executions.reduce((sum, e) => sum + e.execution_time, 0) /
          executions.length,
      });
    });

    return stats;
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate(executions) {
    if (executions.length === 0) return 0;
    const successes = executions.filter((e) => e.success).length;
    return successes / executions.length;
  }

  /**
   * Find statistically significant correlations
   */
  findSignificantCorrelations(stats) {
    const significant = [];
    const overallRate =
      stats.reduce((sum, s) => sum + s.successRate * s.count, 0) /
      stats.reduce((sum, s) => sum + s.count, 0);

    stats.forEach((stat) => {
      if (stat.count < 5) return; // Need enough data

      const deviation = Math.abs(stat.successRate - overallRate);
      if (deviation > 0.15) {
        // 15% deviation threshold
        significant.push({
          ...stat,
          deviation,
          direction: stat.successRate > overallRate ? "positive" : "negative",
        });
      }
    });

    return significant;
  }

  /**
   * Extract patterns from file path
   */
  extractFilePatterns(filePath) {
    const patterns = [];
    const parts = filePath.split("/");

    // Directory patterns
    for (let i = 1; i <= Math.min(3, parts.length - 1); i++) {
      patterns.push(`dir:${parts.slice(0, i).join("/")}`);
    }

    // File name patterns
    const fileName = parts[parts.length - 1];
    if (fileName) {
      // Extension
      const ext = path.extname(fileName);
      if (ext) patterns.push(`ext:${ext}`);

      // Common patterns
      if (fileName.includes("test")) patterns.push("type:test");
      if (fileName.includes("spec")) patterns.push("type:spec");
      if (fileName.includes("config")) patterns.push("type:config");
      if (fileName.includes("index")) patterns.push("type:index");
      if (fileName.match(/^[A-Z]/)) patterns.push("type:component");
    }

    return patterns;
  }

  /**
   * Generate recommendations based on time analysis
   */
  generateTimeRecommendation(stats, outliers) {
    const recommendations = [];

    // Timeout optimization
    const currentTimeout = 3000; // Default
    const recommended = Math.max(
      stats.p99 * 1.2,
      stats.mean + 3 * stats.stdDev,
    );

    if (recommended < currentTimeout * 0.7) {
      recommendations.push({
        type: "timeout_reduction",
        current: currentTimeout,
        recommended: Math.round(recommended),
        confidence: 0.85,
        impact: "performance",
      });
    }

    // Outlier handling
    if (outliers.length > stats.count * 0.05) {
      recommendations.push({
        type: "outlier_investigation",
        count: outliers.length,
        percentage: ((outliers.length / stats.count) * 100).toFixed(1),
        impact: "reliability",
      });
    }

    return recommendations;
  }

  /**
   * Generate recommendations based on success patterns
   */
  generateSuccessRecommendations(correlations) {
    const recommendations = [];

    // Extension-based recommendations
    correlations.extension.forEach((corr) => {
      if (corr.direction === "negative" && corr.count > 10) {
        recommendations.push({
          type: "pattern_adjustment",
          pattern: `file_extension:${corr.key}`,
          currentSuccessRate: corr.successRate,
          recommendation: "Consider adjusting rules for this file type",
          confidence: Math.min(corr.count / 50, 0.9),
        });
      }
    });

    // Time-based recommendations
    correlations.hourly.forEach((corr) => {
      if (corr.direction === "negative" && corr.count > 5) {
        recommendations.push({
          type: "temporal_adjustment",
          hour: corr.key,
          successRate: corr.successRate,
          recommendation: `Performance degrades at hour ${corr.key}`,
          confidence: Math.min(corr.count / 20, 0.8),
        });
      }
    });

    return recommendations;
  }

  /**
   * Generate file pattern recommendations
   */
  generateFilePatternRecommendations(patterns) {
    const recommendations = [];

    patterns.forEach((pattern) => {
      // High-frequency low-success patterns
      if (pattern.count > 20 && pattern.successRate < 0.5) {
        recommendations.push({
          type: "pattern_review",
          pattern: pattern.pattern,
          frequency: pattern.count,
          successRate: pattern.successRate,
          recommendation: "High-frequency pattern with low success rate",
        });
      }

      // Slow patterns
      if (pattern.avgTime > 1000 && pattern.count > 10) {
        recommendations.push({
          type: "performance_optimization",
          pattern: pattern.pattern,
          avgTime: pattern.avgTime,
          frequency: pattern.count,
          recommendation: "Pattern shows slow execution times",
        });
      }
    });

    return recommendations;
  }
}

module.exports = PatternAnalyzer;
