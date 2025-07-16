#!/usr/bin/env node

/**
 * HookExecution Data Model
 * Represents a single hook execution with comprehensive metadata
 */

class HookExecution {
  constructor(data = {}) {
    this.id = data.id || null;
    this.hookName = data.hookName || data.hook_name;
    this.hookFamily = data.hookFamily || data.hook_family || "unknown";
    this.hookPriority = data.hookPriority || data.hook_priority || "medium";
    this.executionTime = data.executionTime || data.execution_time || 0;
    this.success = data.success !== undefined ? data.success : true;
    this.blocked = data.blocked !== undefined ? data.blocked : false;
    this.filePath = data.filePath || data.file_path || null;
    this.fileExtension = data.fileExtension || data.file_extension || null;
    this.contentHash = data.contentHash || data.content_hash || null;
    this.contextData = data.contextData || data.context_data || {};
    this.timestamp = data.timestamp || new Date().toISOString();

    // Additional metadata
    this.exitCode = data.exitCode || data.exit_code || null;
    this.stdout = data.stdout || "";
    this.stderr = data.stderr || "";
    this.errorMessage = data.errorMessage || data.error_message || null;
    this.systemLoad = data.systemLoad || data.system_load || null;
    this.parallelExecution =
      data.parallelExecution || data.parallel_execution || false;
    this.executionContext =
      data.executionContext || data.execution_context || {};
  }

  /**
   * Validate the execution data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!this.hookName) {
      errors.push("hookName is required");
    }

    if (typeof this.executionTime !== "number" || this.executionTime < 0) {
      errors.push("executionTime must be a non-negative number");
    }

    if (typeof this.success !== "boolean") {
      errors.push("success must be a boolean");
    }

    if (typeof this.blocked !== "boolean") {
      errors.push("blocked must be a boolean");
    }

    // Warnings for missing optional data
    if (!this.hookFamily || this.hookFamily === "unknown") {
      warnings.push("hookFamily should be specified for better categorization");
    }

    if (this.executionTime > 30000) {
      warnings.push(
        "executionTime is unusually high (>30s), consider timeout optimization",
      );
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
      hook_name: this.hookName,
      hook_family: this.hookFamily,
      hook_priority: this.hookPriority,
      execution_time: this.executionTime,
      success: this.success ? 1 : 0,
      blocked: this.blocked ? 1 : 0,
      file_path: this.filePath,
      file_extension: this.fileExtension,
      content_hash: this.contentHash,
      context_data:
        typeof this.contextData === "string"
          ? this.contextData
          : JSON.stringify(this.contextData),
      timestamp: this.timestamp,
      exit_code: this.exitCode,
      stdout: this.stdout,
      stderr: this.stderr,
      error_message: this.errorMessage,
      system_load:
        typeof this.systemLoad === "string"
          ? this.systemLoad
          : JSON.stringify(this.systemLoad),
      parallel_execution: this.parallelExecution ? 1 : 0,
      execution_context:
        typeof this.executionContext === "string"
          ? this.executionContext
          : JSON.stringify(this.executionContext),
    };
  }

  /**
   * Create from database row
   * @param {Object} row Database row
   * @returns {HookExecution} HookExecution instance
   */
  static fromDbRow(row) {
    const data = {
      id: row.id,
      hookName: row.hook_name,
      hookFamily: row.hook_family,
      hookPriority: row.hook_priority,
      executionTime: row.execution_time,
      success: row.success === 1,
      blocked: row.blocked === 1,
      filePath: row.file_path,
      fileExtension: row.file_extension,
      contentHash: row.content_hash,
      contextData: row.context_data ? JSON.parse(row.context_data) : {},
      timestamp: row.timestamp,
      exitCode: row.exit_code,
      stdout: row.stdout,
      stderr: row.stderr,
      errorMessage: row.error_message,
      systemLoad: row.system_load ? JSON.parse(row.system_load) : null,
      parallelExecution: row.parallel_execution === 1,
      executionContext: row.execution_context
        ? JSON.parse(row.execution_context)
        : {},
    };

    return new HookExecution(data);
  }

  /**
   * Extract patterns from this execution
   * @returns {Array} Array of patterns found
   */
  extractPatterns() {
    const patterns = [];

    // File-based patterns
    if (this.filePath) {
      patterns.push({
        type: "file_path",
        pattern: this.filePath,
        success: this.success,
        blocked: this.blocked,
      });

      if (this.fileExtension) {
        patterns.push({
          type: "file_extension",
          pattern: this.fileExtension,
          success: this.success,
          blocked: this.blocked,
        });
      }
    }

    // Content-based patterns
    if (this.contentHash) {
      patterns.push({
        type: "content_hash",
        pattern: this.contentHash,
        success: this.success,
        blocked: this.blocked,
      });
    }

    // Execution-based patterns
    patterns.push({
      type: "execution_time_range",
      pattern: this.getExecutionTimeRange(),
      success: this.success,
      blocked: this.blocked,
    });

    patterns.push({
      type: "hook_family",
      pattern: this.hookFamily,
      success: this.success,
      blocked: this.blocked,
    });

    patterns.push({
      type: "hook_priority",
      pattern: this.hookPriority,
      success: this.success,
      blocked: this.blocked,
    });

    // Time-based patterns
    const date = new Date(this.timestamp);
    patterns.push({
      type: "hour_of_day",
      pattern: date.getHours(),
      success: this.success,
      blocked: this.blocked,
    });

    patterns.push({
      type: "day_of_week",
      pattern: date.getDay(),
      success: this.success,
      blocked: this.blocked,
    });

    return patterns;
  }

  /**
   * Get execution time range for pattern analysis
   * @returns {string} Time range category
   */
  getExecutionTimeRange() {
    if (this.executionTime < 100) return "very_fast";
    if (this.executionTime < 500) return "fast";
    if (this.executionTime < 1000) return "normal";
    if (this.executionTime < 3000) return "slow";
    if (this.executionTime < 10000) return "very_slow";
    return "extremely_slow";
  }

  /**
   * Calculate complexity score based on execution data
   * @returns {number} Complexity score (0-1)
   */
  calculateComplexity() {
    let complexity = 0;

    // Base complexity from execution time
    complexity += Math.min(this.executionTime / 10000, 0.3);

    // Content complexity
    if (this.contextData && this.contextData.codeComplexity) {
      const codeComplexity = this.contextData.codeComplexity;
      if (codeComplexity.lineCount) {
        complexity += Math.min(codeComplexity.lineCount / 1000, 0.2);
      }
      if (codeComplexity.functionCount) {
        complexity += Math.min(codeComplexity.functionCount / 50, 0.2);
      }
      if (codeComplexity.classCount) {
        complexity += Math.min(codeComplexity.classCount / 10, 0.1);
      }
    }

    // Error complexity
    if (!this.success || this.blocked) {
      complexity += 0.2;
    }

    return Math.min(complexity, 1);
  }

  /**
   * Generate execution summary
   * @returns {Object} Summary object
   */
  getSummary() {
    return {
      hookName: this.hookName,
      family: this.hookFamily,
      priority: this.hookPriority,
      duration: this.executionTime,
      result: this.success ? (this.blocked ? "blocked" : "success") : "failed",
      file: this.filePath ? this.filePath.split("/").pop() : null,
      complexity: this.calculateComplexity(),
      timestamp: this.timestamp,
    };
  }

  /**
   * Check if execution is an outlier
   * @param {Array} recentExecutions Array of recent executions for comparison
   * @returns {Object} Outlier analysis
   */
  isOutlier(recentExecutions = []) {
    if (recentExecutions.length < 5) {
      return { isOutlier: false, reason: "insufficient_data" };
    }

    const executionTimes = recentExecutions.map((e) => e.executionTime);
    const avg =
      executionTimes.reduce((sum, time) => sum + time, 0) /
      executionTimes.length;
    const stdDev = Math.sqrt(
      executionTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) /
        executionTimes.length,
    );

    const zScore = Math.abs(this.executionTime - avg) / stdDev;

    if (zScore > 2.5) {
      return {
        isOutlier: true,
        reason: "execution_time",
        zScore: zScore,
        avgTime: avg,
        thisTime: this.executionTime,
      };
    }

    // Check success rate patterns
    const recentSuccess =
      recentExecutions.filter((e) => e.success).length /
      recentExecutions.length;
    if (!this.success && recentSuccess > 0.9) {
      return {
        isOutlier: true,
        reason: "success_pattern",
        recentSuccessRate: recentSuccess,
      };
    }

    return { isOutlier: false };
  }

  /**
   * Create a lightweight version for caching
   * @returns {Object} Lightweight execution data
   */
  toLightweight() {
    return {
      hookName: this.hookName,
      family: this.hookFamily,
      priority: this.hookPriority,
      executionTime: this.executionTime,
      success: this.success,
      blocked: this.blocked,
      timestamp: this.timestamp,
      complexity: this.calculateComplexity(),
    };
  }
}

module.exports = HookExecution;
