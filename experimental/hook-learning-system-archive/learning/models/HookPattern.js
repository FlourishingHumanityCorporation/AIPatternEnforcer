#!/usr/bin/env node

/**
 * HookPattern Data Model
 * Represents learned patterns from hook executions
 */

class HookPattern {
  constructor(data = {}) {
    this.id = data.id || null;
    this.hookName = data.hookName || data.hook_name;
    this.patternType = data.patternType || data.pattern_type;
    this.patternData = data.patternData || data.pattern_data || {};
    this.successRate =
      data.successRate !== undefined
        ? data.successRate
        : data.success_rate !== undefined
          ? data.success_rate
          : 0;
    this.confidence = data.confidence !== undefined ? data.confidence : 0;
    this.totalCount = data.totalCount || data.total_count || 0;
    this.successCount = data.successCount || data.success_count || 0;
    this.failureCount = data.failureCount || data.failure_count || 0;
    this.blockCount = data.blockCount || data.block_count || 0;
    this.lastSeen = data.lastSeen || data.last_seen || new Date().toISOString();
    this.firstSeen =
      data.firstSeen || data.first_seen || new Date().toISOString();
    this.lastUpdated =
      data.lastUpdated || data.last_updated || new Date().toISOString();

    // Advanced pattern metrics
    this.falsePositiveCount =
      data.falsePositiveCount || data.false_positive_count || 0;
    this.falseNegativeCount =
      data.falseNegativeCount || data.false_negative_count || 0;
    this.avgExecutionTime =
      data.avgExecutionTime || data.avg_execution_time || 0;
    this.stdDevExecutionTime =
      data.stdDevExecutionTime || data.std_dev_execution_time || 0;
    this.adaptationHistory =
      data.adaptationHistory || data.adaptation_history || [];
    this.relatedPatterns = data.relatedPatterns || data.related_patterns || [];
    this.metadata = data.metadata || {};
  }

  /**
   * Validate the pattern data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!this.hookName) {
      errors.push("hookName is required");
    }

    if (!this.patternType) {
      errors.push("patternType is required");
    }

    if (!this.patternData || Object.keys(this.patternData).length === 0) {
      errors.push("patternData must contain pattern information");
    }

    // Data integrity checks
    if (this.successRate < 0 || this.successRate > 1) {
      errors.push("successRate must be between 0 and 1");
    }

    if (this.confidence < 0 || this.confidence > 1) {
      errors.push("confidence must be between 0 and 1");
    }

    if (this.totalCount !== this.successCount + this.failureCount) {
      warnings.push(
        "totalCount does not match sum of successCount and failureCount",
      );
    }

    // Pattern-specific validation
    const patternValidation = this.validatePatternData();
    errors.push(...patternValidation.errors);
    warnings.push(...patternValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate pattern-specific data
   * @returns {Object} Validation result
   */
  validatePatternData() {
    const errors = [];
    const warnings = [];

    switch (this.patternType) {
      case "file_extension":
        if (!this.patternData.extension) {
          errors.push("file_extension pattern requires extension field");
        }
        break;

      case "file_path":
        if (!this.patternData.path && !this.patternData.pattern) {
          errors.push("file_path pattern requires path or pattern field");
        }
        break;

      case "content_hash":
        if (!this.patternData.hash) {
          errors.push("content_hash pattern requires hash field");
        }
        break;

      case "execution_time_range":
        if (!this.patternData.range) {
          errors.push("execution_time_range pattern requires range field");
        }
        break;

      case "temporal":
        if (!this.patternData.hourOfDay && !this.patternData.dayOfWeek) {
          warnings.push("temporal pattern should include time-based fields");
        }
        break;
    }

    return { errors, warnings };
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDbFormat() {
    return {
      hook_name: this.hookName,
      pattern_type: this.patternType,
      pattern_data:
        typeof this.patternData === "string"
          ? this.patternData
          : JSON.stringify(this.patternData),
      success_rate: this.successRate,
      confidence: this.confidence,
      total_count: this.totalCount,
      success_count: this.successCount,
      failure_count: this.failureCount,
      block_count: this.blockCount,
      last_seen: this.lastSeen,
      first_seen: this.firstSeen,
      last_updated: this.lastUpdated,
      false_positive_count: this.falsePositiveCount,
      false_negative_count: this.falseNegativeCount,
      avg_execution_time: this.avgExecutionTime,
      std_dev_execution_time: this.stdDevExecutionTime,
      adaptation_history:
        typeof this.adaptationHistory === "string"
          ? this.adaptationHistory
          : JSON.stringify(this.adaptationHistory),
      related_patterns:
        typeof this.relatedPatterns === "string"
          ? this.relatedPatterns
          : JSON.stringify(this.relatedPatterns),
      metadata:
        typeof this.metadata === "string"
          ? this.metadata
          : JSON.stringify(this.metadata),
    };
  }

  /**
   * Create from database row
   * @param {Object} row Database row
   * @returns {HookPattern} HookPattern instance
   */
  static fromDbRow(row) {
    const data = {
      id: row.id,
      hookName: row.hook_name,
      patternType: row.pattern_type,
      patternData: row.pattern_data ? JSON.parse(row.pattern_data) : {},
      successRate: row.success_rate,
      confidence: row.confidence,
      totalCount: row.total_count,
      successCount: row.success_count,
      failureCount: row.failure_count,
      blockCount: row.block_count,
      lastSeen: row.last_seen,
      firstSeen: row.first_seen,
      lastUpdated: row.last_updated,
      falsePositiveCount: row.false_positive_count,
      falseNegativeCount: row.false_negative_count,
      avgExecutionTime: row.avg_execution_time,
      stdDevExecutionTime: row.std_dev_execution_time,
      adaptationHistory: row.adaptation_history
        ? JSON.parse(row.adaptation_history)
        : [],
      relatedPatterns: row.related_patterns
        ? JSON.parse(row.related_patterns)
        : [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };

    return new HookPattern(data);
  }

  /**
   * Update pattern statistics with new execution
   * @param {HookExecution} execution New execution data
   */
  updateWithExecution(execution) {
    this.totalCount++;

    if (execution.success) {
      this.successCount++;
    } else {
      this.failureCount++;
    }

    if (execution.blocked) {
      this.blockCount++;
    }

    // Update success rate
    this.successRate = this.successCount / this.totalCount;

    // Update execution time statistics
    const oldAvg = this.avgExecutionTime;
    const n = this.totalCount;
    this.avgExecutionTime = oldAvg + (execution.executionTime - oldAvg) / n;

    // Update standard deviation (using Welford's online algorithm)
    if (n > 1) {
      const oldStdDev = this.stdDevExecutionTime;
      const variance =
        ((n - 2) * oldStdDev * oldStdDev +
          (execution.executionTime - oldAvg) *
            (execution.executionTime - this.avgExecutionTime)) /
        (n - 1);
      this.stdDevExecutionTime = Math.sqrt(variance);
    }

    // Update timestamps
    this.lastSeen = execution.timestamp;
    this.lastUpdated = new Date().toISOString();

    // Update confidence based on sample size and consistency
    this.updateConfidence();
  }

  /**
   * Update confidence score based on pattern statistics
   */
  updateConfidence() {
    let confidence = 0;

    // Sample size component (max 0.4)
    if (this.totalCount >= 100) {
      confidence += 0.4;
    } else if (this.totalCount >= 50) {
      confidence += 0.3;
    } else if (this.totalCount >= 20) {
      confidence += 0.2;
    } else if (this.totalCount >= 10) {
      confidence += 0.1;
    }

    // Consistency component (max 0.3)
    if (this.successRate > 0.9 || this.successRate < 0.1) {
      confidence += 0.3;
    } else if (this.successRate > 0.8 || this.successRate < 0.2) {
      confidence += 0.2;
    } else if (this.successRate > 0.7 || this.successRate < 0.3) {
      confidence += 0.1;
    }

    // Recency component (max 0.2)
    const hoursSinceLastSeen =
      (Date.now() - new Date(this.lastSeen).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSeen < 24) {
      confidence += 0.2;
    } else if (hoursSinceLastSeen < 72) {
      confidence += 0.15;
    } else if (hoursSinceLastSeen < 168) {
      confidence += 0.1;
    } else if (hoursSinceLastSeen < 720) {
      confidence += 0.05;
    }

    // False positive/negative penalty (max -0.1)
    const errorRate =
      (this.falsePositiveCount + this.falseNegativeCount) /
      Math.max(this.totalCount, 1);
    if (errorRate > 0.1) {
      confidence -= 0.1;
    } else if (errorRate > 0.05) {
      confidence -= 0.05;
    }

    this.confidence = Math.max(0, Math.min(1, confidence));
  }

  /**
   * Check if pattern is stale and needs refresh
   * @returns {boolean} True if pattern needs refresh
   */
  isStale() {
    const daysSinceLastSeen =
      (Date.now() - new Date(this.lastSeen).getTime()) / (1000 * 60 * 60 * 24);

    // Pattern is stale if not seen in 30 days
    if (daysSinceLastSeen > 30) return true;

    // Pattern is stale if low confidence and not enough data
    if (this.confidence < 0.3 && this.totalCount < 10) return true;

    // Pattern is stale if high error rate
    const errorRate =
      (this.falsePositiveCount + this.falseNegativeCount) /
      Math.max(this.totalCount, 1);
    if (errorRate > 0.2) return true;

    return false;
  }

  /**
   * Calculate pattern effectiveness score
   * @returns {number} Effectiveness score (0-1)
   */
  calculateEffectiveness() {
    let effectiveness = 0;

    // Success rate component (max 0.4)
    effectiveness += this.successRate * 0.4;

    // Confidence component (max 0.3)
    effectiveness += this.confidence * 0.3;

    // Error rate penalty (max -0.2)
    const errorRate =
      (this.falsePositiveCount + this.falseNegativeCount) /
      Math.max(this.totalCount, 1);
    effectiveness -= errorRate * 0.2;

    // Recency bonus (max 0.1)
    const daysSinceLastSeen =
      (Date.now() - new Date(this.lastSeen).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastSeen < 7) {
      effectiveness += 0.1;
    } else if (daysSinceLastSeen < 14) {
      effectiveness += 0.05;
    }

    // Performance impact (max 0.2)
    if (this.avgExecutionTime < 1000) {
      effectiveness += 0.2;
    } else if (this.avgExecutionTime < 3000) {
      effectiveness += 0.1;
    }

    return Math.max(0, Math.min(1, effectiveness));
  }

  /**
   * Generate pattern similarity score with another pattern
   * @param {HookPattern} otherPattern Pattern to compare with
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(otherPattern) {
    if (!otherPattern || this.patternType !== otherPattern.patternType) {
      return 0;
    }

    let similarity = 0;

    // Pattern data similarity (max 0.5)
    const dataSimilarity = this.calculateDataSimilarity(otherPattern);
    similarity += dataSimilarity * 0.5;

    // Success rate similarity (max 0.2)
    const successDiff = Math.abs(this.successRate - otherPattern.successRate);
    similarity += (1 - successDiff) * 0.2;

    // Execution time similarity (max 0.2)
    const timeDiff =
      Math.abs(this.avgExecutionTime - otherPattern.avgExecutionTime) /
      Math.max(this.avgExecutionTime, otherPattern.avgExecutionTime, 1);
    similarity += (1 - Math.min(timeDiff, 1)) * 0.2;

    // Hook family similarity (max 0.1)
    if (this.hookName === otherPattern.hookName) {
      similarity += 0.1;
    }

    return similarity;
  }

  /**
   * Calculate pattern data similarity
   * @param {HookPattern} otherPattern Pattern to compare with
   * @returns {number} Data similarity score (0-1)
   */
  calculateDataSimilarity(otherPattern) {
    switch (this.patternType) {
      case "file_extension":
        return this.patternData.extension === otherPattern.patternData.extension
          ? 1
          : 0;

      case "file_path":
        if (this.patternData.path === otherPattern.patternData.path) return 1;
        // Calculate path similarity based on common segments
        const path1 = (this.patternData.path || "").split("/");
        const path2 = (otherPattern.patternData.path || "").split("/");
        const commonSegments = path1.filter((seg) =>
          path2.includes(seg),
        ).length;
        return commonSegments / Math.max(path1.length, path2.length, 1);

      case "content_hash":
        return this.patternData.hash === otherPattern.patternData.hash ? 1 : 0;

      case "execution_time_range":
        return this.patternData.range === otherPattern.patternData.range
          ? 1
          : 0;

      default:
        // Generic object comparison
        const keys1 = Object.keys(this.patternData);
        const keys2 = Object.keys(otherPattern.patternData);
        const commonKeys = keys1.filter((k) => keys2.includes(k));
        const matchingValues = commonKeys.filter(
          (k) => this.patternData[k] === otherPattern.patternData[k],
        ).length;
        return matchingValues / Math.max(keys1.length, keys2.length, 1);
    }
  }

  /**
   * Add adaptation to history
   * @param {Object} adaptation Adaptation details
   */
  addAdaptation(adaptation) {
    this.adaptationHistory.push({
      timestamp: new Date().toISOString(),
      type: adaptation.type,
      oldValue: adaptation.oldValue,
      newValue: adaptation.newValue,
      reason: adaptation.reason,
      confidence: adaptation.confidence,
    });

    // Keep only last 100 adaptations
    if (this.adaptationHistory.length > 100) {
      this.adaptationHistory = this.adaptationHistory.slice(-100);
    }

    this.lastUpdated = new Date().toISOString();
  }

  /**
   * Get pattern summary
   * @returns {Object} Pattern summary
   */
  getSummary() {
    return {
      hookName: this.hookName,
      type: this.patternType,
      data: this.patternData,
      successRate: Math.round(this.successRate * 100) + "%",
      confidence: Math.round(this.confidence * 100) + "%",
      effectiveness: Math.round(this.calculateEffectiveness() * 100) + "%",
      totalExecutions: this.totalCount,
      avgExecutionTime: Math.round(this.avgExecutionTime) + "ms",
      isStale: this.isStale(),
      lastSeen: this.lastSeen,
    };
  }

  /**
   * Create a lightweight version for caching
   * @returns {Object} Lightweight pattern data
   */
  toLightweight() {
    return {
      hookName: this.hookName,
      type: this.patternType,
      successRate: this.successRate,
      confidence: this.confidence,
      effectiveness: this.calculateEffectiveness(),
      totalCount: this.totalCount,
      lastSeen: this.lastSeen,
    };
  }
}

module.exports = HookPattern;
