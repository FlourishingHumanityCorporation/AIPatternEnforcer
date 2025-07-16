#!/usr/bin/env node

/**
 * Learning Hook Runner
 * Extends HookRunner with learning capabilities while maintaining compatibility
 */

const HookRunner = require("../lib/HookRunner");
const LearningDatabase = require("./LearningDatabase");
const ExecutionContext = require("./ExecutionContext");

class LearningHookRunner extends HookRunner {
  constructor(name, options = {}) {
    super(name, options);

    // Learning configuration
    this.learningEnabled = options.learningEnabled !== false;
    this.learningMode = options.learningMode || "async"; // 'async', 'sync', 'disabled'
    this.learningDB = null;
    this.learningInitialized = false;

    // Learning state
    this.executionHistory = [];
    this.patternCache = new Map();
    this.lastLearningUpdate = 0;

    // Initialize learning database if enabled
    if (this.learningEnabled) {
      this.initializeLearning();
    }
  }

  /**
   * Initialize learning components
   */
  async initializeLearning() {
    if (this.learningInitialized) return;

    try {
      this.learningDB = new LearningDatabase();

      // Initialize database in background to avoid blocking hook execution
      if (this.learningMode === "async") {
        // Initialize asynchronously
        this.learningDB.initialize().catch((error) => {
          if (process.env.HOOK_VERBOSE === "true") {
            console.error(
              `Learning database initialization failed for ${this.name}:`,
              error.message,
            );
          }
        });
      } else {
        // Initialize synchronously
        await this.learningDB.initialize();
      }

      this.learningInitialized = true;

      if (process.env.HOOK_VERBOSE === "true") {
        console.log(`Learning enabled for hook: ${this.name}`);
      }
    } catch (error) {
      if (process.env.HOOK_VERBOSE === "true") {
        console.error(
          `Failed to initialize learning for ${this.name}:`,
          error.message,
        );
      }
      // Disable learning if initialization fails
      this.learningEnabled = false;
    }
  }

  /**
   * Enhanced run method with learning data collection
   */
  async run(hookFunction) {
    if (!this.learningEnabled) {
      return await super.run(hookFunction);
    }

    return await this.runWithLearning(hookFunction);
  }

  /**
   * Run hook with learning data collection
   */
  async runWithLearning(hookFunction) {
    const startTime = Date.now();
    let executionContext = null;
    let result = null;
    let error = null;

    try {
      // Early exit for testing/development mode
      if (this.shouldBypassHooks()) {
        if (process.env.HOOK_VERBOSE === "true") {
          process.stderr.write(
            `🔧 Hook ${this.name} bypassed: ${this.getBypassReason()}\n`,
          );
        }
        process.exit(0);
      }

      // Read input from stdin
      const input = await this.readStdin();
      let parsedInput;

      try {
        parsedInput = input ? JSON.parse(input) : {};
      } catch (e) {
        parsedInput = { raw: input };
      }

      // Enhance input with helper methods
      const enhancedInput = this.enhanceHookData(parsedInput);

      // Capture execution context for learning
      executionContext = new ExecutionContext(enhancedInput, this);

      // Load learned patterns and adapt behavior (if learning is ready)
      await this.applyLearningInsights(executionContext);

      // Execute the hook function with timeout
      result = await Promise.race([
        hookFunction(enhancedInput, this),
        this.timeoutPromise(),
      ]);

      // Record successful execution
      await this.recordExecutionData(
        executionContext,
        result,
        Date.now() - startTime,
      );

      // Update learning patterns asynchronously
      this.updateLearningPatterns(executionContext, result);

      // Add execution metadata
      const executionData = {
        ...result,
        executionTime: Date.now() - startTime,
        hookName: this.name,
        priority: this.priority,
        family: this.family,
        executionId: this.executionId,
        learningEnabled: this.learningEnabled,
      };

      // Notify parent executor if present
      if (this.parentExecutor && this.parentExecutor.onHookComplete) {
        this.parentExecutor.onHookComplete(executionData);
      }

      // Handle response
      if (result.block) {
        process.stderr.write(result.message || "Operation blocked by hook");
        process.exit(2);
      } else if (result.allow !== false) {
        process.exit(0);
      } else {
        process.exit(2);
      }
    } catch (err) {
      error = err;
      const executionTime = Date.now() - startTime;

      // Record error execution
      await this.recordExecutionError(executionContext, error, executionTime);

      // Notify parent executor of error
      if (this.parentExecutor && this.parentExecutor.onHookError) {
        this.parentExecutor.onHookError({
          hookName: this.name,
          priority: this.priority,
          family: this.family,
          executionId: this.executionId,
          error: error.message,
          executionTime,
          learningEnabled: this.learningEnabled,
        });
      }

      if (this.verbose) {
        process.stderr.write(`Hook ${this.name} error: ${error.message}\n`);
      }
      process.exit(0);
    }
  }

  /**
   * Apply learning insights to adapt behavior
   */
  async applyLearningInsights(executionContext) {
    if (
      !this.learningEnabled ||
      !this.learningDB ||
      !this.learningInitialized
    ) {
      return;
    }

    try {
      // Get execution context
      const context = await executionContext.capture();

      // Load patterns for this hook
      const patterns = await this.learningDB.getPatterns(this.name);

      // Apply pattern-based adaptations
      await this.applyPatternAdaptations(context, patterns);

      // Apply timeout optimizations
      await this.applyTimeoutOptimizations(context);
    } catch (error) {
      // Don't fail the hook if learning fails
      if (process.env.HOOK_VERBOSE === "true") {
        console.error(
          `Learning insights application failed for ${this.name}:`,
          error.message,
        );
      }
    }
  }

  /**
   * Apply pattern-based adaptations
   */
  async applyPatternAdaptations(context, patterns) {
    // Look for patterns that might affect this execution
    const relevantPatterns = patterns.filter((pattern) => {
      return pattern.confidence > 0.5 && pattern.total_count > 5;
    });

    // Apply adaptations based on patterns
    for (const pattern of relevantPatterns) {
      if (
        pattern.pattern_type === "file_pattern" &&
        pattern.success_rate < 0.3
      ) {
        // This file pattern has low success rate, maybe adjust sensitivity
        this.adjustSensitivity("reduced");
      }
    }
  }

  /**
   * Apply timeout optimizations
   */
  async applyTimeoutOptimizations(context) {
    try {
      // Get recent execution history
      const recentExecutions = await this.learningDB.getRecentExecutions(
        this.name,
        50,
      );

      if (recentExecutions.length > 10) {
        const avgExecutionTime =
          recentExecutions.reduce((sum, exec) => sum + exec.execution_time, 0) /
          recentExecutions.length;

        // If average execution time is much lower than timeout, we could potentially reduce it
        if (avgExecutionTime < this.timeout * 0.3) {
          // Don't actually change timeout yet, just log the opportunity
          if (process.env.HOOK_VERBOSE === "true") {
            console.log(
              `Timeout optimization opportunity for ${this.name}: avg=${avgExecutionTime}ms, timeout=${this.timeout}ms`,
            );
          }
        }
      }
    } catch (error) {
      // Ignore errors in timeout optimization
    }
  }

  /**
   * Adjust sensitivity based on learned patterns
   */
  adjustSensitivity(adjustment) {
    // This is a placeholder for sensitivity adjustment
    // In a real implementation, this would modify the hook's behavior
    if (process.env.HOOK_VERBOSE === "true") {
      console.log(`Sensitivity adjustment for ${this.name}: ${adjustment}`);
    }
  }

  /**
   * Record execution data for learning
   */
  async recordExecutionData(executionContext, result, executionTime) {
    if (!this.learningEnabled || !this.learningDB) return;

    try {
      const context = await executionContext.capture();

      const executionData = {
        family: this.family,
        priority: this.priority,
        executionTime: executionTime,
        success: !result.block && result.allow !== false,
        blocked: result.block || false,
        filePath: context.filePath,
        fileExtension: context.fileExtension,
        contentHash: context.contentHash,
        context: context,
        errorMessage: null,
      };

      // Record in database (async if mode is async)
      if (this.learningMode === "async") {
        this.learningDB
          .recordExecution(this.name, executionData)
          .catch((error) => {
            if (process.env.HOOK_VERBOSE === "true") {
              console.error(
                `Failed to record execution for ${this.name}:`,
                error.message,
              );
            }
          });
      } else {
        await this.learningDB.recordExecution(this.name, executionData);
      }

      // Update execution history
      this.executionHistory.push({
        timestamp: Date.now(),
        executionTime: executionTime,
        success: executionData.success,
        blocked: executionData.blocked,
      });

      // Keep only recent history
      if (this.executionHistory.length > 100) {
        this.executionHistory = this.executionHistory.slice(-50);
      }
    } catch (error) {
      if (process.env.HOOK_VERBOSE === "true") {
        console.error(
          `Failed to record execution data for ${this.name}:`,
          error.message,
        );
      }
    }
  }

  /**
   * Record execution error
   */
  async recordExecutionError(executionContext, error, executionTime) {
    if (!this.learningEnabled || !this.learningDB) return;

    try {
      const context = executionContext ? await executionContext.capture() : {};

      const executionData = {
        family: this.family,
        priority: this.priority,
        executionTime: executionTime,
        success: false,
        blocked: false,
        filePath: context.filePath || null,
        fileExtension: context.fileExtension || null,
        contentHash: context.contentHash || null,
        context: context,
        errorMessage: error.message,
      };

      // Record in database (async if mode is async)
      if (this.learningMode === "async") {
        this.learningDB
          .recordExecution(this.name, executionData)
          .catch((recordError) => {
            if (process.env.HOOK_VERBOSE === "true") {
              console.error(
                `Failed to record error execution for ${this.name}:`,
                recordError.message,
              );
            }
          });
      } else {
        await this.learningDB.recordExecution(this.name, executionData);
      }
    } catch (recordError) {
      if (process.env.HOOK_VERBOSE === "true") {
        console.error(
          `Failed to record execution error for ${this.name}:`,
          recordError.message,
        );
      }
    }
  }

  /**
   * Update learning patterns (asynchronous)
   */
  async updateLearningPatterns(executionContext, result) {
    if (!this.learningEnabled || !this.learningDB) return;

    // Run this asynchronously to avoid blocking hook execution
    setImmediate(async () => {
      try {
        const context = await executionContext.capture();
        const success = !result.block && result.allow !== false;

        // Update file patterns
        if (context.filePath) {
          await this.learningDB.updatePattern(
            this.name,
            "file_pattern",
            context.filePath,
            success,
            result.block || false,
          );
        }

        // Update content patterns
        if (context.contentHash) {
          await this.learningDB.updatePattern(
            this.name,
            "content_pattern",
            context.contentHash,
            success,
            result.block || false,
          );
        }

        // Update architectural patterns
        if (
          context.architecturalPatterns &&
          context.architecturalPatterns.length > 0
        ) {
          for (const pattern of context.architecturalPatterns) {
            await this.learningDB.updatePattern(
              this.name,
              "architectural_pattern",
              pattern,
              success,
              result.block || false,
            );
          }
        }

        // Update time patterns
        await this.learningDB.updatePattern(
          this.name,
          "time_pattern",
          {
            hourOfDay: context.timeOfDay,
            dayOfWeek: context.dayOfWeek,
            isWeekend: context.isWeekend,
          },
          success,
          result.block || false,
        );
      } catch (error) {
        if (process.env.HOOK_VERBOSE === "true") {
          console.error(
            `Failed to update learning patterns for ${this.name}:`,
            error.message,
          );
        }
      }
    });
  }

  /**
   * Get learning statistics
   */
  async getLearningStatistics() {
    if (!this.learningEnabled || !this.learningDB) {
      return { learningEnabled: false };
    }

    try {
      const history = await this.learningDB.getExecutionHistory(this.name, 100);
      const patterns = await this.learningDB.getPatterns(this.name);

      return {
        learningEnabled: true,
        totalExecutions: history.length,
        successRate:
          history.length > 0
            ? history.filter((h) => h.success).length / history.length
            : 0,
        blockRate:
          history.length > 0
            ? history.filter((h) => h.blocked).length / history.length
            : 0,
        averageExecutionTime:
          history.length > 0
            ? history.reduce((sum, h) => sum + h.execution_time, 0) /
              history.length
            : 0,
        patternCount: patterns.length,
        highConfidencePatterns: patterns.filter((p) => p.confidence > 0.7)
          .length,
        lastUpdate: this.lastLearningUpdate,
      };
    } catch (error) {
      return { learningEnabled: true, error: error.message };
    }
  }

  /**
   * Check if hooks should be bypassed
   */
  shouldBypassHooks() {
    // Check various bypass conditions
    if (process.env.HOOK_BYPASS === "true") return true;
    if (process.env.NODE_ENV === "test") return true;
    if (process.env.CI === "true" && process.env.HOOK_CI_BYPASS === "true")
      return true;

    return false;
  }

  /**
   * Get bypass reason
   */
  getBypassReason() {
    if (process.env.HOOK_BYPASS === "true") return "HOOK_BYPASS=true";
    if (process.env.NODE_ENV === "test") return "NODE_ENV=test";
    if (process.env.CI === "true" && process.env.HOOK_CI_BYPASS === "true")
      return "CI bypass enabled";

    return "unknown";
  }

  /**
   * Static factory method for learning hooks
   */
  static createLearning(name, hookFunction, options = {}) {
    const runner = new LearningHookRunner(name, options);
    runner.run(hookFunction);
    return runner;
  }
}

module.exports = LearningHookRunner;
