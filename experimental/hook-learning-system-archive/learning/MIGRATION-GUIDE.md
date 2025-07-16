# Migration Guide: From SimpleLearningRunner to Integrated Learning

This guide explains how to migrate existing hooks from the basic SimpleLearningRunner (Phase 1) to the full IntegratedLearningRunner (Phase 1 + 2).

## Quick Migration (5 minutes)

### Before (SimpleLearningRunner only):

```javascript
const SimpleLearningRunner = require("./learning/SimpleLearningRunner");

class MyHook {
  constructor() {
    this.runner = new SimpleLearningRunner("my-hook", {
      family: "validation",
      priority: "high",
    });
  }

  async run(hookData) {
    return await this.runner.executeWithLearning(async (data) => {
      // Hook logic here
      return { success: true, blocked: false };
    }, hookData);
  }
}
```

### After (Integrated Learning):

```javascript
const IntegratedLearningRunner = require("./learning/IntegratedLearningRunner");

class MyHook {
  constructor() {
    this.runner = new IntegratedLearningRunner("my-hook", {
      family: "validation",
      priority: "high",
    });
  }

  async run(hookData) {
    return await this.runner.executeWithLearning(async (data) => {
      // Use adaptive parameters
      const timeout = data._timeout || 3000;
      const sensitivity = data._adaptiveParams?.sensitivity || "standard";

      // Hook logic here (unchanged)
      return { success: true, blocked: false };
    }, hookData);
  }
}
```

## What You Get

### 🚀 Automatic Benefits (No Code Changes):

1. **Adaptive Timeout Optimization** - Timeout automatically adjusts based on execution patterns
2. **Pattern Learning** - System learns which patterns are effective
3. **A/B Testing** - Parameter changes are tested before full adoption
4. **Performance Monitoring** - Automatic rollback if performance degrades
5. **Learning Insights** - System generates optimization recommendations

### 📊 With Minor Changes:

1. **Use Adaptive Parameters**:

   ```javascript
   const sensitivity = data._adaptiveParams?.sensitivity || "standard";
   if (sensitivity === "reduced") {
     // Be less strict
   }
   ```

2. **Access Statistics**:

   ```javascript
   const stats = await this.runner.getStatistics();
   console.log(`Patterns learned: ${stats.advanced.patternsLearned}`);
   ```

3. **Start A/B Tests**:
   ```javascript
   await this.runner.startABTest("enforcement_level", "strict", {
     duration: 3600000, // 1 hour
     sampleSize: 0.5, // 50% of executions
   });
   ```

## Step-by-Step Migration

### Step 1: Update Import

```javascript
// Old
const SimpleLearningRunner = require("./learning/SimpleLearningRunner");

// New
const IntegratedLearningRunner = require("./learning/IntegratedLearningRunner");
```

### Step 2: Update Constructor

```javascript
// Old
this.runner = new SimpleLearningRunner("my-hook", options);

// New
this.runner = new IntegratedLearningRunner("my-hook", options);
```

### Step 3: (Optional) Use Adaptive Parameters

```javascript
async executeHook(data) {
  // Access adaptive parameters
  const params = data._adaptiveParams || {};

  // Use adaptive timeout
  const timeout = data._timeout || this.defaultTimeout;

  // Use other parameters
  const strictness = params.enforcement_strictness || 'standard';

  // Your existing logic...
}
```

### Step 4: (Optional) Add Pattern Context

```javascript
// Help the system learn better patterns
const result = {
  success: true,
  blocked: false,
  // Add context for pattern learning
  _context: {
    reason: "file_type_allowed",
    confidence: 0.9,
  },
};
```

## Advanced Migration

### For Complex Hooks

If your hook needs fine control over learning:

```javascript
class AdvancedHook {
  constructor() {
    // Use individual components
    this.learningInterface = new HookLearningInterface("my-hook");
    this.adaptiveParams = new AdaptiveParameterSystem("my-hook");
    this.patternTracker = new PatternEffectivenessTracker("my-hook");
  }

  async run(hookData) {
    // Extract patterns
    const patterns = await this.extractPatterns(hookData);

    // Get adaptive parameters
    const timeout = this.adaptiveParams.getParameter("timeout") || 3000;

    // Make decision
    const decision = await this.makeDecision(patterns);

    // Track effectiveness
    const decisionId = await this.patternTracker.recordDecision(
      hookData,
      decision,
      patterns,
    );

    // Execute with timeout
    const result = await this.executeWithTimeout(hookData, timeout);

    // Validate decision
    await this.patternTracker.validateDecision(decisionId, {
      shouldBlock: result.actuallyMalicious,
    });

    return result;
  }
}
```

## Configuration

### Environment Variables

```bash
# Enable/disable adaptive learning
export ADAPTIVE_LEARNING_ENABLED=true

# Configure optimization behavior
export MAX_PARAMETER_CHANGE_RATE=0.2     # 20% max change
export OPTIMIZATION_COOLDOWN=3600000      # 1 hour
export ROLLBACK_THRESHOLD=0.15           # 15% degradation triggers rollback
```

### Per-Hook Configuration

```javascript
const runner = new IntegratedLearningRunner("my-hook", {
  family: "validation",
  priority: "high",
  // Custom configuration
  minExecutions: 20, // Start optimizing after 20 executions
  minConfidence: 0.7, // Require 70% confidence
  maxChangeRate: 0.1, // More conservative 10% changes
});
```

## Testing Your Migration

### 1. Verify Basic Functionality

```javascript
// Should work exactly as before
const result = await hook.run({ filePath: "/test/file.js" });
assert(result.success);
```

### 2. Check Learning is Active

```javascript
const stats = await hook.runner.getStatistics();
console.log(stats.integration); // Should show phase2Active: true
```

### 3. Monitor Optimizations

```javascript
// Force optimization run
await hook.runner.forceOptimization();

// Check parameters changed
const params = hook.runner.adaptiveParams.getAllParameters();
console.log(params); // Should show optimized values
```

## Rollback Plan

If you need to rollback to SimpleLearningRunner:

1. **Keep imports flexible**:

   ```javascript
   const Runner = process.env.USE_SIMPLE_RUNNER
     ? require("./SimpleLearningRunner")
     : require("./IntegratedLearningRunner");
   ```

2. **Disable adaptive features**:

   ```bash
   export ADAPTIVE_LEARNING_ENABLED=false
   ```

3. **Revert imports** (if needed):
   ```javascript
   // Change back to SimpleLearningRunner
   ```

## Common Issues

### 1. "Cannot find module IntegratedLearningRunner"

- Ensure you've copied all Phase 2 files
- Check the path is correct

### 2. Performance seems slower

- First few executions are learning
- Check `LEARNING_MAX_EXEC_TIME` isn't too high
- Optimizations are async and shouldn't block

### 3. Parameters not changing

- Need minimum executions (default: 50)
- Check `OPTIMIZATION_COOLDOWN` period
- Verify learning is enabled

## Benefits You'll See

### Week 1:

- Basic execution tracking (same as before)
- Pattern collection begins

### Week 2:

- First timeout optimizations
- A/B tests start running

### Month 1:

- Refined patterns reduce false positives
- Timeout optimized to actual needs
- Performance insights available

### Ongoing:

- Continuous optimization
- Automatic adaptation to changes
- Self-improving accuracy

## Need Help?

1. Check statistics: `await runner.getStatistics()`
2. View optimization history: `await runner.adaptiveParams.getOptimizationHistory()`
3. Check pattern effectiveness: `await runner.effectivenessTracker.getPatternStats()`
4. Enable debug logging: `export LEARNING_LOG_LEVEL=debug`
