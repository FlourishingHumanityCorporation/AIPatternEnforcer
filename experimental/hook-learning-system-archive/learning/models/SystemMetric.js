#!/usr/bin/env node

/**
 * SystemMetric Data Model
 * Represents system-wide metrics and performance data
 */

class SystemMetric {
  constructor(data = {}) {
    this.id = data.id || null;
    this.metricName = data.metricName || data.metric_name;
    this.metricValue =
      data.metricValue !== undefined
        ? data.metricValue
        : data.metric_value !== undefined
          ? data.metric_value
          : 0;
    this.metricType = data.metricType || data.metric_type || "gauge"; // gauge, counter, histogram
    this.context = data.context || {};
    this.timestamp = data.timestamp || new Date().toISOString();
    this.source = data.source || "system";
    this.aggregationPeriod =
      data.aggregationPeriod || data.aggregation_period || null;

    // Additional metric metadata
    this.unit = data.unit || null; // ms, count, percentage, bytes, etc.
    this.tags = data.tags || [];
    this.dimensions = data.dimensions || {};
    this.metadata = data.metadata || {};

    // Statistical properties
    this.min = data.min !== undefined ? data.min : null;
    this.max = data.max !== undefined ? data.max : null;
    this.avg = data.avg !== undefined ? data.avg : null;
    this.stdDev =
      data.stdDev !== undefined
        ? data.stdDev
        : data.std_dev !== undefined
          ? data.std_dev
          : null;
    this.count = data.count !== undefined ? data.count : null;
    this.sum = data.sum !== undefined ? data.sum : null;

    // Percentiles for histogram metrics
    this.p50 = data.p50 !== undefined ? data.p50 : null;
    this.p75 = data.p75 !== undefined ? data.p75 : null;
    this.p90 = data.p90 !== undefined ? data.p90 : null;
    this.p95 = data.p95 !== undefined ? data.p95 : null;
    this.p99 = data.p99 !== undefined ? data.p99 : null;
  }

  /**
   * Validate the metric data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!this.metricName) {
      errors.push("metricName is required");
    }

    if (typeof this.metricValue !== "number" && this.metricValue !== null) {
      errors.push("metricValue must be a number or null");
    }

    if (!["gauge", "counter", "histogram"].includes(this.metricType)) {
      errors.push("metricType must be one of: gauge, counter, histogram");
    }

    // Type-specific validation
    if (this.metricType === "counter" && this.metricValue < 0) {
      errors.push("counter metrics cannot have negative values");
    }

    if (this.metricType === "histogram" && (!this.count || !this.sum)) {
      warnings.push("histogram metrics should include count and sum");
    }

    // Statistical validation
    if (this.min !== null && this.max !== null && this.min > this.max) {
      errors.push("min value cannot be greater than max value");
    }

    if (this.avg !== null && this.min !== null && this.avg < this.min) {
      errors.push("average cannot be less than minimum");
    }

    if (this.avg !== null && this.max !== null && this.avg > this.max) {
      errors.push("average cannot be greater than maximum");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDbFormat() {
    return {
      metric_name: this.metricName,
      metric_value: this.metricValue,
      metric_type: this.metricType,
      context:
        typeof this.context === "string"
          ? this.context
          : JSON.stringify(this.context),
      timestamp: this.timestamp,
      source: this.source,
      aggregation_period: this.aggregationPeriod,
      unit: this.unit,
      tags:
        typeof this.tags === "string" ? this.tags : JSON.stringify(this.tags),
      dimensions:
        typeof this.dimensions === "string"
          ? this.dimensions
          : JSON.stringify(this.dimensions),
      metadata:
        typeof this.metadata === "string"
          ? this.metadata
          : JSON.stringify(this.metadata),
      min: this.min,
      max: this.max,
      avg: this.avg,
      std_dev: this.stdDev,
      count: this.count,
      sum: this.sum,
      p50: this.p50,
      p75: this.p75,
      p90: this.p90,
      p95: this.p95,
      p99: this.p99,
    };
  }

  /**
   * Create from database row
   * @param {Object} row Database row
   * @returns {SystemMetric} SystemMetric instance
   */
  static fromDbRow(row) {
    const data = {
      id: row.id,
      metricName: row.metric_name,
      metricValue: row.metric_value,
      metricType: row.metric_type,
      context: row.context ? JSON.parse(row.context) : {},
      timestamp: row.timestamp,
      source: row.source,
      aggregationPeriod: row.aggregation_period,
      unit: row.unit,
      tags: row.tags ? JSON.parse(row.tags) : [],
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : {},
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      min: row.min,
      max: row.max,
      avg: row.avg,
      stdDev: row.std_dev,
      count: row.count,
      sum: row.sum,
      p50: row.p50,
      p75: row.p75,
      p90: row.p90,
      p95: row.p95,
      p99: row.p99,
    };

    return new SystemMetric(data);
  }

  /**
   * Create a gauge metric
   * @param {string} name Metric name
   * @param {number} value Metric value
   * @param {Object} options Additional options
   * @returns {SystemMetric} SystemMetric instance
   */
  static createGauge(name, value, options = {}) {
    return new SystemMetric({
      metricName: name,
      metricValue: value,
      metricType: "gauge",
      ...options,
    });
  }

  /**
   * Create a counter metric
   * @param {string} name Metric name
   * @param {number} value Counter value
   * @param {Object} options Additional options
   * @returns {SystemMetric} SystemMetric instance
   */
  static createCounter(name, value, options = {}) {
    if (value < 0) {
      throw new Error("Counter values must be non-negative");
    }

    return new SystemMetric({
      metricName: name,
      metricValue: value,
      metricType: "counter",
      ...options,
    });
  }

  /**
   * Create a histogram metric
   * @param {string} name Metric name
   * @param {Array<number>} values Array of values
   * @param {Object} options Additional options
   * @returns {SystemMetric} SystemMetric instance
   */
  static createHistogram(name, values, options = {}) {
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("Histogram requires a non-empty array of values");
    }

    const stats = SystemMetric.calculateStatistics(values);

    return new SystemMetric({
      metricName: name,
      metricValue: stats.avg,
      metricType: "histogram",
      min: stats.min,
      max: stats.max,
      avg: stats.avg,
      stdDev: stats.stdDev,
      count: stats.count,
      sum: stats.sum,
      p50: stats.p50,
      p75: stats.p75,
      p90: stats.p90,
      p95: stats.p95,
      p99: stats.p99,
      ...options,
    });
  }

  /**
   * Calculate statistics from an array of values
   * @param {Array<number>} values Array of numeric values
   * @returns {Object} Statistics object
   */
  static calculateStatistics(values) {
    if (!values || values.length === 0) {
      return {
        min: null,
        max: null,
        avg: null,
        stdDev: null,
        count: 0,
        sum: 0,
        p50: null,
        p75: null,
        p90: null,
        p95: null,
        p99: null,
      };
    }

    // Sort values for percentile calculation
    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / count;

    // Calculate standard deviation
    const variance =
      values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    // Calculate percentiles
    const percentile = (p) => {
      const index = (count - 1) * (p / 100);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index % 1;

      if (lower === upper) {
        return sorted[lower];
      }

      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    return {
      min: sorted[0],
      max: sorted[count - 1],
      avg: avg,
      stdDev: stdDev,
      count: count,
      sum: sum,
      p50: percentile(50),
      p75: percentile(75),
      p90: percentile(90),
      p95: percentile(95),
      p99: percentile(99),
    };
  }

  /**
   * Aggregate multiple metrics of the same type
   * @param {Array<SystemMetric>} metrics Array of metrics to aggregate
   * @param {string} aggregationPeriod Period description (e.g., '5min', '1hour')
   * @returns {SystemMetric} Aggregated metric
   */
  static aggregate(metrics, aggregationPeriod) {
    if (!metrics || metrics.length === 0) {
      throw new Error("Cannot aggregate empty metrics array");
    }

    const firstMetric = metrics[0];
    const metricName = firstMetric.metricName;
    const metricType = firstMetric.metricType;

    // Verify all metrics are of the same name and type
    if (
      !metrics.every(
        (m) => m.metricName === metricName && m.metricType === metricType,
      )
    ) {
      throw new Error(
        "All metrics must have the same name and type for aggregation",
      );
    }

    switch (metricType) {
      case "gauge":
        return SystemMetric.aggregateGauges(metrics, aggregationPeriod);

      case "counter":
        return SystemMetric.aggregateCounters(metrics, aggregationPeriod);

      case "histogram":
        return SystemMetric.aggregateHistograms(metrics, aggregationPeriod);

      default:
        throw new Error(`Unknown metric type: ${metricType}`);
    }
  }

  /**
   * Aggregate gauge metrics
   * @param {Array<SystemMetric>} metrics Array of gauge metrics
   * @param {string} aggregationPeriod Period description
   * @returns {SystemMetric} Aggregated gauge metric
   */
  static aggregateGauges(metrics, aggregationPeriod) {
    const values = metrics.map((m) => m.metricValue).filter((v) => v !== null);
    const stats = SystemMetric.calculateStatistics(values);

    return new SystemMetric({
      metricName: metrics[0].metricName,
      metricValue: stats.avg,
      metricType: "gauge",
      aggregationPeriod: aggregationPeriod,
      min: stats.min,
      max: stats.max,
      avg: stats.avg,
      stdDev: stats.stdDev,
      count: metrics.length,
      unit: metrics[0].unit,
      source: "aggregation",
      context: {
        aggregatedFrom: metrics.length,
        startTime: metrics[0].timestamp,
        endTime: metrics[metrics.length - 1].timestamp,
      },
    });
  }

  /**
   * Aggregate counter metrics
   * @param {Array<SystemMetric>} metrics Array of counter metrics
   * @param {string} aggregationPeriod Period description
   * @returns {SystemMetric} Aggregated counter metric
   */
  static aggregateCounters(metrics, aggregationPeriod) {
    const sum = metrics.reduce((acc, m) => acc + (m.metricValue || 0), 0);

    return new SystemMetric({
      metricName: metrics[0].metricName,
      metricValue: sum,
      metricType: "counter",
      aggregationPeriod: aggregationPeriod,
      count: metrics.length,
      sum: sum,
      unit: metrics[0].unit,
      source: "aggregation",
      context: {
        aggregatedFrom: metrics.length,
        startTime: metrics[0].timestamp,
        endTime: metrics[metrics.length - 1].timestamp,
      },
    });
  }

  /**
   * Aggregate histogram metrics
   * @param {Array<SystemMetric>} metrics Array of histogram metrics
   * @param {string} aggregationPeriod Period description
   * @returns {SystemMetric} Aggregated histogram metric
   */
  static aggregateHistograms(metrics, aggregationPeriod) {
    // Collect all individual values (approximate by using avg * count)
    const totalCount = metrics.reduce((acc, m) => acc + (m.count || 0), 0);
    const totalSum = metrics.reduce((acc, m) => acc + (m.sum || 0), 0);
    const overallAvg = totalCount > 0 ? totalSum / totalCount : 0;

    // Find global min/max
    const globalMin = Math.min(
      ...metrics.filter((m) => m.min !== null).map((m) => m.min),
    );
    const globalMax = Math.max(
      ...metrics.filter((m) => m.max !== null).map((m) => m.max),
    );

    // Weighted average for percentiles
    const weightedPercentile = (percentileName) => {
      let weightedSum = 0;
      let totalWeight = 0;

      metrics.forEach((m) => {
        if (m[percentileName] !== null && m.count) {
          weightedSum += m[percentileName] * m.count;
          totalWeight += m.count;
        }
      });

      return totalWeight > 0 ? weightedSum / totalWeight : null;
    };

    return new SystemMetric({
      metricName: metrics[0].metricName,
      metricValue: overallAvg,
      metricType: "histogram",
      aggregationPeriod: aggregationPeriod,
      min: globalMin,
      max: globalMax,
      avg: overallAvg,
      count: totalCount,
      sum: totalSum,
      p50: weightedPercentile("p50"),
      p75: weightedPercentile("p75"),
      p90: weightedPercentile("p90"),
      p95: weightedPercentile("p95"),
      p99: weightedPercentile("p99"),
      unit: metrics[0].unit,
      source: "aggregation",
      context: {
        aggregatedFrom: metrics.length,
        startTime: metrics[0].timestamp,
        endTime: metrics[metrics.length - 1].timestamp,
      },
    });
  }

  /**
   * Check if metric is an anomaly compared to historical data
   * @param {Array<SystemMetric>} historicalMetrics Historical metrics for comparison
   * @returns {Object} Anomaly detection result
   */
  detectAnomaly(historicalMetrics) {
    if (!historicalMetrics || historicalMetrics.length < 10) {
      return { isAnomaly: false, reason: "insufficient_data" };
    }

    const historicalValues = historicalMetrics
      .map((m) => m.metricValue)
      .filter((v) => v !== null);
    const stats = SystemMetric.calculateStatistics(historicalValues);

    // Z-score based anomaly detection
    const zScore = Math.abs(this.metricValue - stats.avg) / (stats.stdDev || 1);

    if (zScore > 3) {
      return {
        isAnomaly: true,
        reason: "statistical_outlier",
        zScore: zScore,
        historicalAvg: stats.avg,
        historicalStdDev: stats.stdDev,
        currentValue: this.metricValue,
      };
    }

    // Threshold-based anomaly detection for specific metrics
    if (this.metricName.includes("error_rate") && this.metricValue > 0.1) {
      return {
        isAnomaly: true,
        reason: "threshold_exceeded",
        threshold: 0.1,
        currentValue: this.metricValue,
      };
    }

    if (
      this.metricName.includes("execution_time") &&
      this.metricValue > stats.p95 * 2
    ) {
      return {
        isAnomaly: true,
        reason: "performance_degradation",
        historical95th: stats.p95,
        currentValue: this.metricValue,
      };
    }

    return { isAnomaly: false };
  }

  /**
   * Format metric value for display
   * @returns {string} Formatted metric value
   */
  formatValue() {
    if (this.metricValue === null) return "N/A";

    let formatted = this.metricValue.toString();

    if (this.unit) {
      switch (this.unit) {
        case "ms":
          if (this.metricValue > 1000) {
            formatted = `${(this.metricValue / 1000).toFixed(2)}s`;
          } else {
            formatted = `${Math.round(this.metricValue)}ms`;
          }
          break;

        case "percentage":
          formatted = `${(this.metricValue * 100).toFixed(1)}%`;
          break;

        case "bytes":
          if (this.metricValue > 1024 * 1024 * 1024) {
            formatted = `${(this.metricValue / (1024 * 1024 * 1024)).toFixed(2)}GB`;
          } else if (this.metricValue > 1024 * 1024) {
            formatted = `${(this.metricValue / (1024 * 1024)).toFixed(2)}MB`;
          } else if (this.metricValue > 1024) {
            formatted = `${(this.metricValue / 1024).toFixed(2)}KB`;
          } else {
            formatted = `${Math.round(this.metricValue)}B`;
          }
          break;

        default:
          formatted = `${formatted} ${this.unit}`;
      }
    }

    return formatted;
  }

  /**
   * Get metric summary
   * @returns {Object} Metric summary
   */
  getSummary() {
    const summary = {
      name: this.metricName,
      value: this.formatValue(),
      type: this.metricType,
      timestamp: this.timestamp,
    };

    if (this.metricType === "histogram") {
      summary.statistics = {
        min: this.min,
        max: this.max,
        avg: this.avg,
        p50: this.p50,
        p95: this.p95,
        p99: this.p99,
      };
    }

    if (this.tags.length > 0) {
      summary.tags = this.tags;
    }

    if (Object.keys(this.dimensions).length > 0) {
      summary.dimensions = this.dimensions;
    }

    return summary;
  }

  /**
   * Create a lightweight version for caching
   * @returns {Object} Lightweight metric data
   */
  toLightweight() {
    return {
      name: this.metricName,
      value: this.metricValue,
      type: this.metricType,
      timestamp: this.timestamp,
      unit: this.unit,
    };
  }
}

module.exports = SystemMetric;
