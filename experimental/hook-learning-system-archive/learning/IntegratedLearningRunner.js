#!/usr/bin/env node

/**
 * Integrated Learning Runner
 *
 * Bridges SimpleLearningRunner (Phase 1) with HookLearningInterface (Phase 2)
 * to create a unified learning system that:
 * - Records basic execution data (Phase 1)
 * - Performs pattern analysis and optimization (Phase 2)
 * - Tracks pattern effectiveness
 * - Provides adaptive parameters
 */

const SimpleLearningRunner = require("./SimpleLearningRunner");
const HookLearningInterface = require("./HookLearningInterface");
const AdaptiveParameterSystem = require("./AdaptiveParameterSystem");
const PatternEffectivenessTracker = require("./PatternEffectivenessTracker");
const { getConfig } = require("./config");

class IntegratedLearningRunner {
  constructor(hookName, options = {}) {
    this.hookName = hookName;
    this.options = options;

    // Phase 1 components
    this.simpleRunner = new SimpleLearningRunner(hookName, options);

    // Phase 2 components
    this.learningInterface = new HookLearningInterface(hookName, options);
    this.adaptiveParams = new AdaptiveParameterSystem(hookName, options);
    this.effectivenessTracker = new PatternEffectivenessTracker(hookName);

    // Configuration
    const config = getConfig();
    this.learningEnabled =
      config.learningEnabled && config.adaptiveLearningConfig.enabled;

    // State
    this.initialized = false;
    this.lastDecisionId = null;
  }

  /**
   * Initialize all components
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize all learning components
      await Promise.all([
        this.simpleRunner.initialize(),
        this.learningInterface.initialize(),
        this.adaptiveParams.initialize(),
        this.effectivenessTracker.initialize(),
      ]);

      this.initialized = true;
    } catch (error) {
      console.error(
        `Failed to initialize integrated learning: ${error.message}`,
      );
      this.learningEnabled = false;
    }
  }

  /**
   * Main execution method with full learning integration
   */
  async executeWithLearning(hookFunction, hookData) {
    await this.initialize();

    const startTime = Date.now();
    let result = null;

    try {
      // Get adaptive parameters for this execution
      const adaptiveContext = await this.prepareAdaptiveContext(hookData);

      // Execute with Phase 1 basic tracking
      result = await this.simpleRunner.executeWithLearning(async (data) => {
        // Execute with adaptive parameters
        return await this.executeWithAdaptiveParams(
          hookFunction,
          data,
          adaptiveContext,
        );
      }, hookData);

      // Phase 2 advanced learning
      if (this.learningEnabled && result) {
        const executionTime = Date.now() - startTime;

        // Extract patterns and learn
        const learningResult = await this.learningInterface.learnFromExecution(
          adaptiveContext,
          result,
          executionTime,
        );

        // Track pattern effectiveness if decision was made
        if (this.lastDecisionId) {
          await this.effectivenessTracker.validateDecision(
            this.lastDecisionId,
            { shouldBlock: result.blocked || false },
          );
          this.lastDecisionId = null;
        }

        // Update A/B test results if applicable
        if (adaptiveContext._parameterUsed) {
          await this.adaptiveParams.recordABTestResult(
            adaptiveContext._parameterUsed.parameter,
            adaptiveContext._parameterUsed.value,
            result,
          );
        }

        // Check for optimization opportunities periodically
        // Disabled - optimizations should be triggered explicitly, not randomly
        // if (Math.random() < 0.1) { // 10% chance to run optimizations
        //   await this.runOptimizations();
        // }
      }

      return result;
    } catch (error) {
      console.error(`Integrated learning error: ${error.message}`);

      // Fall back to basic execution
      if (!result) {
        result = await hookFunction(hookData);
      }

      return result;
    }
  }

  /**
   * Execute hook with adaptive parameters
   */
  async executeWithAdaptiveParams(hookFunction, data, context) {
    // Create adaptive hook wrapper
    const adaptiveHook = async (hookData) => {
      // Get current adaptive parameters
      const params = this.getAdaptiveParameters();

      // Apply parameters to context
      const enhancedData = {
        ...hookData,
        _adaptiveParams: params,
        _timeout: params.timeout || context.timeout || 3000,
      };

      // Record which parameters were used (for A/B testing)
      if (params._activeTest) {
        context._parameterUsed = {
          parameter: params._activeTest.parameter,
          value: params._activeTest.value,
        };
      }

      // Execute original hook with timeout
      return await this.executeWithTimeout(
        () => hookFunction(enhancedData),
        enhancedData._timeout,
      );
    };

    // Track decision for effectiveness
    if (this.effectivenessTracker) {
      const patterns = await this.learningInterface.extractPatterns(
        context,
        {},
      );
      const decision = { blocked: false }; // Will be updated by hook

      this.lastDecisionId = await this.effectivenessTracker.recordDecision(
        context,
        decision,
        patterns,
      );
    }

    return await adaptiveHook(data);
  }

  /**
   * Execute function with timeout
   */
  async executeWithTimeout(fn, timeout) {
    return Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Execution timeout")), timeout),
      ),
    ]);
  }

  /**
   * Prepare adaptive context with all parameters
   */
  async prepareAdaptiveContext(hookData) {
    const context = {
      filePath: hookData.filePath || hookData.file_path,
      fileExtension: hookData.filePath
        ? require("path").extname(hookData.filePath)
        : null,
      content: hookData.content,
      timestamp: Date.now(),
    };

    // Add adaptive parameters
    const adaptiveParams = this.getAdaptiveParameters();
    context.timeout = adaptiveParams.timeout || 3000;
    context.sensitivity = adaptiveParams.sensitivity || "standard";
    context.strictness = adaptiveParams.enforcement_strictness || "standard";

    return context;
  }

  /**
   * Get current adaptive parameters
   */
  getAdaptiveParameters() {
    const params = {};

    // Get all parameters from adaptive system
    const allParams = this.adaptiveParams.getAllParameters();

    // Check for active A/B tests
    for (const [param, value] of Object.entries(allParams)) {
      const testValue = this.adaptiveParams.getParameter(param);
      params[param] = testValue;

      // Track if this is from an A/B test
      if (testValue !== value) {
        params._activeTest = { parameter: param, value: testValue };
      }
    }

    return params;
  }

  /**
   * Run periodic optimizations
   */
  async runOptimizations() {
    try {
      // Run timeout optimization
      const timeoutOpt = await this.adaptiveParams.optimizeTimeout();

      // Run pattern refinement
      const patternRefinements = await this.adaptiveParams.refinePatterns();

      // Check pattern effectiveness
      const problematicPatterns =
        await this.effectivenessTracker.getProblematicPatterns();

      // Generate insights for problematic patterns
      for (const pattern of problematicPatterns) {
        await this.learningInterface.learningDB.recordLearningInsight(
          this.hookName,
          "problematic_pattern",
          {
            pattern: pattern,
            recommendation: `Pattern ${pattern.pattern_key} has low effectiveness`,
            metrics: {
              precision: pattern.precision,
              recall: pattern.recall,
              fpr: pattern.false_positive_rate,
            },
          },
          0.8,
        );
      }
    } catch (error) {
      console.error(`Optimization error: ${error.message}`);
    }
  }

  /**
   * Get comprehensive statistics
   */
  async getStatistics() {
    const [simpleStats, learningStats, adaptiveParams, patternStats] =
      await Promise.all([
        this.simpleRunner.getLearningStats(),
        this.learningInterface.getLearningStatistics(),
        this.adaptiveParams.getAllParameters(),
        this.effectivenessTracker.getPatternStats(),
      ]);

    return {
      basic: simpleStats,
      advanced: learningStats,
      parameters: adaptiveParams,
      patterns: patternStats,
      integration: {
        phase1Active: !!simpleStats,
        phase2Active: this.learningEnabled,
        adaptiveParamsCount: Object.keys(adaptiveParams).length,
        patternCount: patternStats.length,
      },
    };
  }

  /**
   * Start an A/B test
   */
  async startABTest(parameter, variantValue, options) {
    return await this.adaptiveParams.startABTest(
      parameter,
      variantValue,
      options,
    );
  }

  /**
   * Force optimization run
   */
  async forceOptimization() {
    await this.runOptimizations();
  }
}

module.exports = IntegratedLearningRunner;

// Example usage
if (require.main === module) {
  (async () => {
    console.log("Integrated Learning Runner Demo\n");

    const runner = new IntegratedLearningRunner("demo-hook", {
      family: "validation",
      priority: "high",
    });

    // Example hook function
    const demoHook = async (data) => {
      const params = data._adaptiveParams || {};

      // Simulate using adaptive parameters
      console.log(`Executing with timeout: ${data._timeout}ms`);
      console.log(`Sensitivity: ${params.sensitivity || "standard"}`);

      // Simulate some processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      return {
        success: true,
        blocked: data.filePath && data.filePath.includes("_improved"),
        message: "Demo execution complete",
      };
    };

    // Run several executions
    const testCases = [
      { filePath: "/src/component.js" },
      { filePath: "/src/component_improved.js" },
      { filePath: "/test/spec.js" },
      { filePath: "/src/utils_v2.js" },
    ];

    for (const testCase of testCases) {
      const result = await runner.executeWithLearning(demoHook, testCase);
      console.log(
        `\n${testCase.filePath}: ${result.blocked ? "❌ Blocked" : "✅ Allowed"}`,
      );
    }

    // Show statistics
    console.log("\n--- Integrated Statistics ---");
    const stats = await runner.getStatistics();
    console.log(JSON.stringify(stats, null, 2));

    // Run optimizations
    console.log("\n--- Running Optimizations ---");
    await runner.forceOptimization();

    console.log("\nDemo complete!");
  })();
}
