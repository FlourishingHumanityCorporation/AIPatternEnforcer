#!/usr/bin/env node

/**
 * Learning System Configuration
 * Central configuration for all learning components
 */

const path = require("path");
const fs = require("fs");

class LearningConfig {
  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from environment and defaults
   */
  loadConfig() {
    const config = {
      // Database configuration
      database: {
        path:
          process.env.LEARNING_DB_PATH ||
          path.join(__dirname, "../data/learning.db"),
        timeout: parseInt(process.env.LEARNING_DB_TIMEOUT) || 5000,
        busyTimeout: parseInt(process.env.LEARNING_DB_BUSY_TIMEOUT) || 10000,
        maxRetries: parseInt(process.env.LEARNING_DB_RETRIES) || 3,
      },

      // Learning configuration
      learning: {
        enabled: process.env.LEARNING_ENABLED !== "false",
        minExecutionsForPatterns:
          parseInt(process.env.LEARNING_MIN_EXECUTIONS) || 10,
        minConfidenceForInsights:
          parseFloat(process.env.LEARNING_MIN_CONFIDENCE) || 0.7,
        maxPatternsPerHook: parseInt(process.env.LEARNING_MAX_PATTERNS) || 100,
        patternExpirationDays:
          parseInt(process.env.LEARNING_PATTERN_EXPIRATION) || 30,
      },

      // Performance configuration
      performance: {
        maxExecutionTime: parseInt(process.env.LEARNING_MAX_EXEC_TIME) || 200,
        asyncOperations: process.env.LEARNING_ASYNC !== "false",
        batchSize: parseInt(process.env.LEARNING_BATCH_SIZE) || 100,
      },

      // Insight generation
      insights: {
        enabled: process.env.LEARNING_INSIGHTS_ENABLED !== "false",
        generationInterval:
          parseInt(process.env.LEARNING_INSIGHTS_INTERVAL) || 300000, // 5 minutes
        maxInsightsPerHook: parseInt(process.env.LEARNING_MAX_INSIGHTS) || 50,
        autoApply: process.env.LEARNING_AUTO_APPLY === "true",
      },

      // Logging configuration
      logging: {
        level: process.env.LEARNING_LOG_LEVEL || "error",
        file: process.env.LEARNING_LOG_FILE || null,
        console: process.env.LEARNING_LOG_CONSOLE !== "false",
      },

      // Phase 2: Adaptive learning settings
      adaptiveLearning: {
        enabled: process.env.ADAPTIVE_LEARNING_ENABLED !== "false",
        maxParameterChangeRate:
          parseFloat(process.env.MAX_PARAMETER_CHANGE_RATE) || 0.2, // 20% max change
        optimizationCooldown:
          parseInt(process.env.OPTIMIZATION_COOLDOWN) || 3600000, // 1 hour
        minExecutionsForOptimization:
          parseInt(process.env.MIN_EXECUTIONS_FOR_OPTIMIZATION) || 50,
        rollbackThreshold: parseFloat(process.env.ROLLBACK_THRESHOLD) || 0.15, // 15% performance drop triggers rollback
        patternEffectivenessThreshold:
          parseFloat(process.env.PATTERN_EFFECTIVENESS_THRESHOLD) || 0.7,
      },

      // Per-hook configuration overrides
      hookOverrides: {},
    };

    // Ensure database directory exists
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return config;
  }

  /**
   * Get database path
   */
  get dbPath() {
    return this.config.database.path;
  }

  /**
   * Check if learning is enabled
   */
  get learningEnabled() {
    return this.config.learning.enabled;
  }

  /**
   * Get minimum executions for pattern generation
   */
  get minExecutionsForPatterns() {
    return this.config.learning.minExecutionsForPatterns;
  }

  /**
   * Get minimum confidence for insights
   */
  get minConfidenceForInsights() {
    return this.config.learning.minConfidenceForInsights;
  }

  /**
   * Get performance constraints
   */
  get performanceConstraints() {
    return this.config.performance;
  }

  /**
   * Get insight configuration
   */
  get insightConfig() {
    return this.config.insights;
  }

  /**
   * Get logging configuration
   */
  get loggingConfig() {
    return this.config.logging;
  }

  /**
   * Update configuration
   */
  update(updates) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }

  /**
   * Get full configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Get adaptive learning configuration
   */
  get adaptiveLearningConfig() {
    return this.config.adaptiveLearning;
  }

  /**
   * Get hook-specific override configuration
   */
  getHookConfig(hookName) {
    const baseConfig = this.getConfig();
    const overrides = this.config.hookOverrides[hookName] || {};

    return {
      ...baseConfig,
      learning: {
        ...baseConfig.learning,
        ...overrides,
      },
    };
  }

  /**
   * Validate configuration
   */
  validate() {
    const errors = [];

    // Validate database path
    const dbDir = path.dirname(this.config.database.path);
    if (!fs.existsSync(dbDir)) {
      errors.push(`Database directory does not exist: ${dbDir}`);
    }

    // Validate numeric values
    if (
      this.config.learning.minConfidenceForInsights < 0 ||
      this.config.learning.minConfidenceForInsights > 1
    ) {
      errors.push("minConfidenceForInsights must be between 0 and 1");
    }

    if (this.config.performance.maxExecutionTime < 10) {
      errors.push("maxExecutionTime must be at least 10ms");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get environment variable documentation
   */
  static getEnvironmentDocs() {
    return `
Learning System Environment Variables:

Database Configuration:
  LEARNING_DB_PATH              - Path to SQLite database (default: tools/hooks/data/learning.db)
  LEARNING_DB_TIMEOUT           - Database timeout in ms (default: 5000)
  LEARNING_DB_BUSY_TIMEOUT      - Busy timeout in ms (default: 10000)
  LEARNING_DB_RETRIES           - Max retry attempts (default: 3)

Learning Configuration:
  LEARNING_ENABLED              - Enable/disable learning (default: true)
  LEARNING_MIN_EXECUTIONS       - Min executions for patterns (default: 10)
  LEARNING_MIN_CONFIDENCE       - Min confidence for insights (default: 0.7)
  LEARNING_MAX_PATTERNS         - Max patterns per hook (default: 100)
  LEARNING_PATTERN_EXPIRATION   - Pattern expiration in days (default: 30)

Performance Configuration:
  LEARNING_MAX_EXEC_TIME        - Max execution time in ms (default: 200)
  LEARNING_ASYNC                - Enable async operations (default: true)
  LEARNING_BATCH_SIZE           - Batch size for operations (default: 100)

Insight Configuration:
  LEARNING_INSIGHTS_ENABLED     - Enable insight generation (default: true)
  LEARNING_INSIGHTS_INTERVAL    - Generation interval in ms (default: 300000)
  LEARNING_MAX_INSIGHTS         - Max insights per hook (default: 50)
  LEARNING_AUTO_APPLY           - Auto-apply insights (default: false)

Logging Configuration:
  LEARNING_LOG_LEVEL            - Log level (default: error)
  LEARNING_LOG_FILE             - Log file path (default: none)
  LEARNING_LOG_CONSOLE          - Console logging (default: true)

Adaptive Learning Configuration (Phase 2):
  ADAPTIVE_LEARNING_ENABLED     - Enable adaptive learning (default: true)
  MAX_PARAMETER_CHANGE_RATE     - Max parameter change rate (default: 0.2)
  OPTIMIZATION_COOLDOWN         - Cooldown between optimizations in ms (default: 3600000)
  MIN_EXECUTIONS_FOR_OPTIMIZATION - Min executions before optimization (default: 50)
  ROLLBACK_THRESHOLD            - Performance drop threshold for rollback (default: 0.15)
  PATTERN_EFFECTIVENESS_THRESHOLD - Min effectiveness for patterns (default: 0.7)
`;
  }
}

// Singleton instance
let instance = null;

/**
 * Get configuration instance
 */
function getConfig() {
  if (!instance) {
    instance = new LearningConfig();
  }
  return instance;
}

// Export both the class and singleton getter
module.exports = {
  LearningConfig,
  getConfig,
};

// If run directly, show configuration
if (require.main === module) {
  const config = getConfig();
  console.log("Current Learning Configuration:");
  console.log(JSON.stringify(config.getConfig(), null, 2));

  const validation = config.validate();
  if (!validation.valid) {
    console.error("\nConfiguration errors:");
    validation.errors.forEach((err) => console.error(`- ${err}`));
  } else {
    console.log("\n✓ Configuration is valid");
  }

  if (process.argv.includes("--env")) {
    console.log(LearningConfig.getEnvironmentDocs());
  }
}
