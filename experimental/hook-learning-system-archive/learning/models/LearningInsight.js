#!/usr/bin/env node

/**
 * LearningInsight Data Model
 * Represents insights derived from hook execution patterns and learning analysis
 */

class LearningInsight {
  constructor(data = {}) {
    this.id = data.id || null;
    this.insightType = data.insightType || data.insight_type;
    this.insightData = data.insightData || data.insight_data || {};
    this.confidence = data.confidence !== undefined ? data.confidence : 0;
    this.applied = data.applied !== undefined ? data.applied : false;
    this.timestamp = data.timestamp || new Date().toISOString();

    // Insight metadata
    this.hookName = data.hookName || data.hook_name || null;
    this.hookFamily = data.hookFamily || data.hook_family || null;
    this.source = data.source || "analysis"; // analysis, prediction, correlation, optimization
    this.priority = data.priority || "medium"; // low, medium, high, critical
    this.category = data.category || "general"; // performance, accuracy, pattern, optimization

    // Impact and effectiveness
    this.estimatedImpact = data.estimatedImpact || data.estimated_impact || 0;
    this.actualImpact = data.actualImpact || data.actual_impact || null;
    this.affectedHooks = data.affectedHooks || data.affected_hooks || [];
    this.relatedPatterns = data.relatedPatterns || data.related_patterns || [];

    // Application tracking
    this.appliedAt = data.appliedAt || data.applied_at || null;
    this.appliedBy = data.appliedBy || data.applied_by || null;
    this.rollbackAt = data.rollbackAt || data.rollback_at || null;
    this.rollbackReason = data.rollbackReason || data.rollback_reason || null;

    // Validation and feedback
    this.validationResults =
      data.validationResults || data.validation_results || [];
    this.userFeedback = data.userFeedback || data.user_feedback || [];
    this.automaticActions =
      data.automaticActions || data.automatic_actions || [];

    // Lifecycle
    this.expiresAt = data.expiresAt || data.expires_at || null;
    this.status = data.status || "pending"; // pending, applied, validated, rolled_back, expired
  }

  /**
   * Validate the insight data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!this.insightType) {
      errors.push("insightType is required");
    }

    if (!this.insightData || Object.keys(this.insightData).length === 0) {
      errors.push("insightData must contain insight information");
    }

    if (this.confidence < 0 || this.confidence > 1) {
      errors.push("confidence must be between 0 and 1");
    }

    // Type-specific validation
    const typeValidation = this.validateInsightType();
    errors.push(...typeValidation.errors);
    warnings.push(...typeValidation.warnings);

    // Priority validation
    if (!["low", "medium", "high", "critical"].includes(this.priority)) {
      errors.push("priority must be one of: low, medium, high, critical");
    }

    // Status validation
    const validStatuses = [
      "pending",
      "applied",
      "validated",
      "rolled_back",
      "expired",
    ];
    if (!validStatuses.includes(this.status)) {
      errors.push(`status must be one of: ${validStatuses.join(", ")}`);
    }

    // Impact validation
    if (this.estimatedImpact < -1 || this.estimatedImpact > 1) {
      warnings.push("estimatedImpact should be between -1 and 1");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate insight type specific data
   * @returns {Object} Validation result
   */
  validateInsightType() {
    const errors = [];
    const warnings = [];

    switch (this.insightType) {
      case "timeout_optimization":
        if (
          !this.insightData.currentTimeout ||
          !this.insightData.recommendedTimeout
        ) {
          errors.push(
            "timeout_optimization requires currentTimeout and recommendedTimeout",
          );
        }
        break;

      case "pattern_refinement":
        if (!this.insightData.patternId && !this.insightData.patternType) {
          errors.push("pattern_refinement requires patternId or patternType");
        }
        break;

      case "performance_degradation":
        if (!this.insightData.metric || !this.insightData.degradation) {
          errors.push(
            "performance_degradation requires metric and degradation",
          );
        }
        break;

      case "cross_hook_correlation":
        if (
          !this.insightData.correlatedHooks ||
          this.insightData.correlatedHooks.length < 2
        ) {
          errors.push(
            "cross_hook_correlation requires at least 2 correlated hooks",
          );
        }
        break;

      case "predictive_alert":
        if (!this.insightData.prediction || !this.insightData.timeframe) {
          errors.push("predictive_alert requires prediction and timeframe");
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
      insight_type: this.insightType,
      insight_data:
        typeof this.insightData === "string"
          ? this.insightData
          : JSON.stringify(this.insightData),
      confidence: this.confidence,
      applied: this.applied ? 1 : 0,
      timestamp: this.timestamp,
      hook_name: this.hookName,
      hook_family: this.hookFamily,
      source: this.source,
      priority: this.priority,
      category: this.category,
      estimated_impact: this.estimatedImpact,
      actual_impact: this.actualImpact,
      affected_hooks:
        typeof this.affectedHooks === "string"
          ? this.affectedHooks
          : JSON.stringify(this.affectedHooks),
      related_patterns:
        typeof this.relatedPatterns === "string"
          ? this.relatedPatterns
          : JSON.stringify(this.relatedPatterns),
      applied_at: this.appliedAt,
      applied_by: this.appliedBy,
      rollback_at: this.rollbackAt,
      rollback_reason: this.rollbackReason,
      validation_results:
        typeof this.validationResults === "string"
          ? this.validationResults
          : JSON.stringify(this.validationResults),
      user_feedback:
        typeof this.userFeedback === "string"
          ? this.userFeedback
          : JSON.stringify(this.userFeedback),
      automatic_actions:
        typeof this.automaticActions === "string"
          ? this.automaticActions
          : JSON.stringify(this.automaticActions),
      expires_at: this.expiresAt,
      status: this.status,
    };
  }

  /**
   * Create from database row
   * @param {Object} row Database row
   * @returns {LearningInsight} LearningInsight instance
   */
  static fromDbRow(row) {
    const data = {
      id: row.id,
      insightType: row.insight_type,
      insightData: row.insight_data ? JSON.parse(row.insight_data) : {},
      confidence: row.confidence,
      applied: row.applied === 1,
      timestamp: row.timestamp,
      hookName: row.hook_name,
      hookFamily: row.hook_family,
      source: row.source,
      priority: row.priority,
      category: row.category,
      estimatedImpact: row.estimated_impact,
      actualImpact: row.actual_impact,
      affectedHooks: row.affected_hooks ? JSON.parse(row.affected_hooks) : [],
      relatedPatterns: row.related_patterns
        ? JSON.parse(row.related_patterns)
        : [],
      appliedAt: row.applied_at,
      appliedBy: row.applied_by,
      rollbackAt: row.rollback_at,
      rollbackReason: row.rollback_reason,
      validationResults: row.validation_results
        ? JSON.parse(row.validation_results)
        : [],
      userFeedback: row.user_feedback ? JSON.parse(row.user_feedback) : [],
      automaticActions: row.automatic_actions
        ? JSON.parse(row.automatic_actions)
        : [],
      expiresAt: row.expires_at,
      status: row.status,
    };

    return new LearningInsight(data);
  }

  /**
   * Create a timeout optimization insight
   * @param {string} hookName Hook name
   * @param {number} currentTimeout Current timeout value
   * @param {number} recommendedTimeout Recommended timeout value
   * @param {Object} options Additional options
   * @returns {LearningInsight} LearningInsight instance
   */
  static createTimeoutOptimization(
    hookName,
    currentTimeout,
    recommendedTimeout,
    options = {},
  ) {
    const reduction =
      ((currentTimeout - recommendedTimeout) / currentTimeout) * 100;

    return new LearningInsight({
      insightType: "timeout_optimization",
      insightData: {
        currentTimeout,
        recommendedTimeout,
        reductionPercentage: reduction,
        reason: options.reason || "execution_time_analysis",
      },
      hookName,
      confidence: options.confidence || 0.8,
      priority: reduction > 30 ? "high" : "medium",
      category: "performance",
      estimatedImpact: reduction / 100,
      source: "analysis",
      ...options,
    });
  }

  /**
   * Create a pattern refinement insight
   * @param {string} hookName Hook name
   * @param {Object} pattern Pattern to refine
   * @param {Object} refinement Refinement details
   * @param {Object} options Additional options
   * @returns {LearningInsight} LearningInsight instance
   */
  static createPatternRefinement(hookName, pattern, refinement, options = {}) {
    return new LearningInsight({
      insightType: "pattern_refinement",
      insightData: {
        patternId: pattern.id,
        patternType: pattern.type,
        currentPattern: pattern.data,
        refinement: refinement,
        falsePositiveRate: pattern.falsePositiveRate || 0,
        reason: options.reason || "pattern_analysis",
      },
      hookName,
      confidence: options.confidence || 0.7,
      priority: pattern.falsePositiveRate > 0.2 ? "high" : "medium",
      category: "accuracy",
      estimatedImpact: pattern.falsePositiveRate * 0.5,
      source: "analysis",
      relatedPatterns: [pattern.id],
      ...options,
    });
  }

  /**
   * Create a performance degradation insight
   * @param {string} hookName Hook name
   * @param {string} metric Metric name
   * @param {number} degradation Degradation percentage
   * @param {Object} options Additional options
   * @returns {LearningInsight} LearningInsight instance
   */
  static createPerformanceDegradation(
    hookName,
    metric,
    degradation,
    options = {},
  ) {
    return new LearningInsight({
      insightType: "performance_degradation",
      insightData: {
        metric,
        degradation,
        baseline: options.baseline || null,
        current: options.current || null,
        trend: options.trend || "increasing",
        timeframe: options.timeframe || "24h",
      },
      hookName,
      confidence: options.confidence || 0.9,
      priority:
        degradation > 50 ? "critical" : degradation > 25 ? "high" : "medium",
      category: "performance",
      estimatedImpact: -degradation / 100,
      source: "analysis",
      ...options,
    });
  }

  /**
   * Create a cross-hook correlation insight
   * @param {Array<string>} correlatedHooks Correlated hook names
   * @param {Object} correlation Correlation details
   * @param {Object} options Additional options
   * @returns {LearningInsight} LearningInsight instance
   */
  static createCrossHookCorrelation(
    correlatedHooks,
    correlation,
    options = {},
  ) {
    return new LearningInsight({
      insightType: "cross_hook_correlation",
      insightData: {
        correlatedHooks,
        correlationType: correlation.type,
        correlationStrength: correlation.strength,
        sharedPatterns: correlation.sharedPatterns || [],
        recommendation: correlation.recommendation,
      },
      confidence: correlation.strength,
      priority: correlation.strength > 0.8 ? "high" : "medium",
      category: "optimization",
      estimatedImpact: correlation.strength * 0.3,
      source: "correlation",
      affectedHooks: correlatedHooks,
      ...options,
    });
  }

  /**
   * Create a predictive alert insight
   * @param {string} hookName Hook name
   * @param {Object} prediction Prediction details
   * @param {Object} options Additional options
   * @returns {LearningInsight} LearningInsight instance
   */
  static createPredictiveAlert(hookName, prediction, options = {}) {
    return new LearningInsight({
      insightType: "predictive_alert",
      insightData: {
        prediction: prediction.type,
        probability: prediction.probability,
        timeframe: prediction.timeframe,
        factors: prediction.factors || [],
        preventiveAction: prediction.preventiveAction,
      },
      hookName,
      confidence: prediction.confidence || prediction.probability,
      priority:
        prediction.probability > 0.8
          ? "critical"
          : prediction.probability > 0.6
            ? "high"
            : "medium",
      category: "prediction",
      estimatedImpact: -prediction.probability,
      source: "prediction",
      ...options,
    });
  }

  /**
   * Apply the insight
   * @param {string} appliedBy Who applied the insight
   * @returns {Object} Application result
   */
  apply(appliedBy = "system") {
    if (this.applied) {
      return {
        success: false,
        error: "Insight already applied",
      };
    }

    if (this.status === "expired") {
      return {
        success: false,
        error: "Insight has expired",
      };
    }

    this.applied = true;
    this.appliedAt = new Date().toISOString();
    this.appliedBy = appliedBy;
    this.status = "applied";

    // Record automatic actions based on insight type
    this.automaticActions = this.generateAutomaticActions();

    return {
      success: true,
      actions: this.automaticActions,
    };
  }

  /**
   * Generate automatic actions based on insight type
   * @returns {Array} Array of automatic actions
   */
  generateAutomaticActions() {
    const actions = [];

    switch (this.insightType) {
      case "timeout_optimization":
        actions.push({
          type: "update_parameter",
          parameter: "timeout",
          oldValue: this.insightData.currentTimeout,
          newValue: this.insightData.recommendedTimeout,
          timestamp: new Date().toISOString(),
        });
        break;

      case "pattern_refinement":
        actions.push({
          type: "refine_pattern",
          patternId: this.insightData.patternId,
          refinement: this.insightData.refinement,
          timestamp: new Date().toISOString(),
        });
        break;

      case "performance_degradation":
        actions.push({
          type: "alert",
          severity: this.priority,
          message: `Performance degradation detected: ${this.insightData.metric} degraded by ${this.insightData.degradation}%`,
          timestamp: new Date().toISOString(),
        });
        break;

      case "cross_hook_correlation":
        actions.push({
          type: "enable_collaboration",
          hooks: this.insightData.correlatedHooks,
          collaborationType: this.insightData.correlationType,
          timestamp: new Date().toISOString(),
        });
        break;

      case "predictive_alert":
        actions.push({
          type: "preventive_action",
          action: this.insightData.preventiveAction,
          reason: this.insightData.prediction,
          timestamp: new Date().toISOString(),
        });
        break;
    }

    return actions;
  }

  /**
   * Rollback the applied insight
   * @param {string} reason Rollback reason
   * @returns {Object} Rollback result
   */
  rollback(reason) {
    if (!this.applied) {
      return {
        success: false,
        error: "Insight not applied",
      };
    }

    if (this.status === "rolled_back") {
      return {
        success: false,
        error: "Insight already rolled back",
      };
    }

    this.rollbackAt = new Date().toISOString();
    this.rollbackReason = reason;
    this.status = "rolled_back";

    return {
      success: true,
      rollbackActions: this.generateRollbackActions(),
    };
  }

  /**
   * Generate rollback actions
   * @returns {Array} Array of rollback actions
   */
  generateRollbackActions() {
    return this.automaticActions.map((action) => ({
      ...action,
      type: `rollback_${action.type}`,
      rollbackTimestamp: new Date().toISOString(),
    }));
  }

  /**
   * Add validation result
   * @param {Object} validation Validation result
   */
  addValidationResult(validation) {
    this.validationResults.push({
      timestamp: new Date().toISOString(),
      type: validation.type,
      result: validation.result,
      metrics: validation.metrics || {},
      notes: validation.notes || "",
    });

    // Update actual impact if provided
    if (validation.actualImpact !== undefined) {
      this.actualImpact = validation.actualImpact;
    }

    // Update status if fully validated
    if (this.applied && this.validationResults.length > 0) {
      this.status = "validated";
    }
  }

  /**
   * Add user feedback
   * @param {Object} feedback User feedback
   */
  addUserFeedback(feedback) {
    this.userFeedback.push({
      timestamp: new Date().toISOString(),
      rating: feedback.rating,
      comment: feedback.comment || "",
      userId: feedback.userId || "anonymous",
    });
  }

  /**
   * Check if insight should expire
   * @returns {boolean} True if insight should expire
   */
  shouldExpire() {
    if (this.status === "expired" || this.status === "rolled_back") {
      return false; // Already expired or rolled back
    }

    // Check explicit expiration
    if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
      return true;
    }

    // Check age-based expiration (30 days for unapplied insights)
    if (!this.applied) {
      const ageInDays =
        (Date.now() - new Date(this.timestamp).getTime()) /
        (1000 * 60 * 60 * 24);
      if (ageInDays > 30) {
        return true;
      }
    }

    // Check confidence decay
    if (this.confidence < 0.1) {
      return true;
    }

    return false;
  }

  /**
   * Calculate insight effectiveness
   * @returns {number} Effectiveness score (0-1)
   */
  calculateEffectiveness() {
    if (!this.applied) {
      return 0;
    }

    let effectiveness = 0;

    // Actual vs estimated impact (max 0.5)
    if (this.actualImpact !== null) {
      const impactAccuracy =
        1 - Math.abs(this.actualImpact - this.estimatedImpact);
      effectiveness += impactAccuracy * 0.5;
    } else {
      // Use estimated impact if actual not available
      effectiveness += Math.abs(this.estimatedImpact) * 0.3;
    }

    // User feedback component (max 0.3)
    if (this.userFeedback.length > 0) {
      const avgRating =
        this.userFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) /
        this.userFeedback.length;
      effectiveness += (avgRating / 5) * 0.3;
    }

    // Validation success (max 0.2)
    if (this.validationResults.length > 0) {
      const successfulValidations = this.validationResults.filter(
        (v) => v.result === "success",
      ).length;
      effectiveness +=
        (successfulValidations / this.validationResults.length) * 0.2;
    }

    return Math.max(0, Math.min(1, effectiveness));
  }

  /**
   * Get insight summary
   * @returns {Object} Insight summary
   */
  getSummary() {
    return {
      type: this.insightType,
      hook: this.hookName,
      priority: this.priority,
      confidence: Math.round(this.confidence * 100) + "%",
      status: this.status,
      applied: this.applied,
      estimatedImpact:
        this.estimatedImpact > 0
          ? `+${Math.round(this.estimatedImpact * 100)}%`
          : `${Math.round(this.estimatedImpact * 100)}%`,
      actualImpact:
        this.actualImpact !== null
          ? this.actualImpact > 0
            ? `+${Math.round(this.actualImpact * 100)}%`
            : `${Math.round(this.actualImpact * 100)}%`
          : "Not measured",
      effectiveness: this.applied
        ? Math.round(this.calculateEffectiveness() * 100) + "%"
        : "N/A",
      timestamp: this.timestamp,
    };
  }

  /**
   * Create a lightweight version for caching
   * @returns {Object} Lightweight insight data
   */
  toLightweight() {
    return {
      type: this.insightType,
      hook: this.hookName,
      priority: this.priority,
      confidence: this.confidence,
      status: this.status,
      estimatedImpact: this.estimatedImpact,
      timestamp: this.timestamp,
    };
  }
}

module.exports = LearningInsight;
