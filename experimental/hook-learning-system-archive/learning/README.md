# Hook Learning System

A self-improving learning infrastructure for the AIPatternEnforcer hook system that enables hooks to learn from execution patterns and optimize their behavior over time.

## Overview

The Hook Learning System transforms static rule-based hooks into intelligent, adaptive enforcement mechanisms by:

- 📊 **Recording** execution data and patterns
- 🧠 **Learning** from successes and failures
- 💡 **Generating** insights and optimizations
- ⚡ **Adapting** behavior for improved performance

## Quick Start

### Basic Usage

```javascript
const { SimpleLearningRunner } = require("./learning/SimpleLearningRunner");

// Create a learning-enabled hook
const runner = new SimpleLearningRunner("my-hook", {
  family: "code-quality",
  priority: "high",
});

// Execute with learning
const result = await runner.executeWithLearning(
  async (hookData) => {
    // Your hook logic here
    return { success: true, blocked: false };
  },
  { filePath: "/src/file.js", content: "..." },
);
```

### Convert Existing Hook

```javascript
// Before: Static hook
async function myHook(hookData) {
  if (hookData.filePath.includes("_improved")) {
    return { success: false, blocked: true };
  }
  return { success: true, blocked: false };
}

// After: Learning-enabled hook
const runner = new SimpleLearningRunner("my-hook", {
  family: "file-patterns",
  priority: "high",
});

const result = await runner.executeWithLearning(myHook, hookData);
```

## Architecture

### Core Components

1. **SimpleLearningRunner** - Main integration point for hooks
2. **LearningDatabase** - SQLite storage for learning data
3. **ExecutionContext** - Captures comprehensive execution context
4. **Data Models** - Structured models for executions, patterns, metrics, and insights

### Data Flow

```
Hook Execution → ExecutionContext → LearningDatabase
                                         ↓
                                   Pattern Analysis
                                         ↓
                                   Insight Generation
                                         ↓
                                   Adaptive Behavior
```

## Configuration

### Environment Variables

```bash
# Database
LEARNING_DB_PATH=/path/to/learning.db  # Default: tools/hooks/data/learning.db
LEARNING_DB_TIMEOUT=5000               # Database timeout (ms)

# Learning
LEARNING_ENABLED=true                  # Enable/disable learning
LEARNING_MIN_EXECUTIONS=10             # Min executions for patterns
LEARNING_MIN_CONFIDENCE=0.7            # Min confidence for insights

# Performance
LEARNING_MAX_EXEC_TIME=200             # Max execution overhead (ms)
LEARNING_ASYNC=true                    # Async operations

# Insights
LEARNING_INSIGHTS_ENABLED=true         # Enable insight generation
LEARNING_AUTO_APPLY=false              # Auto-apply insights
```

### Programmatic Configuration

```javascript
const { getConfig } = require("./learning/config");

const config = getConfig();
config.update({
  learning: {
    minExecutionsForPatterns: 20,
    minConfidenceForInsights: 0.8,
  },
});
```

## Features

### Pattern Recognition

The system automatically identifies and learns from:

- File extension patterns
- Execution time patterns
- Success/failure patterns
- Project-specific patterns

### Insight Generation

Automatic generation of:

- **Timeout Optimizations** - Adjusts timeouts based on actual execution times
- **Pattern Refinements** - Improves pattern matching accuracy
- **Performance Predictions** - Predicts execution times and resource usage
- **Cross-Hook Correlations** - Identifies relationships between hooks

### Adaptive Behavior

Hooks automatically adapt by:

- Optimizing execution timeouts
- Adjusting pattern sensitivity
- Learning from false positives/negatives
- Sharing insights between related hooks

## Database Schema

The learning system uses SQLite with the following tables:

- `hook_executions` - Detailed execution history
- `hook_patterns` - Learned patterns with confidence scores
- `system_metrics` - System-wide performance metrics
- `learning_insights` - Generated insights and recommendations
- `parameter_changes` - Parameter optimization history
- `context_profiles` - Project context learning

## Examples

### Complete Integration Example

```javascript
const { SimpleLearningRunner } = require("./learning/SimpleLearningRunner");

class SmartFileValidator {
  constructor() {
    this.runner = new SimpleLearningRunner("file-validator", {
      family: "validation",
      priority: "high",
    });
  }

  async validate(filePath, content) {
    return await this.runner.executeWithLearning(
      async (data) => {
        // Validation logic
        if (!data.filePath) {
          return { success: false, blocked: true, message: "No file path" };
        }

        if (
          data.filePath.endsWith(".test.js") &&
          !data.content?.includes("describe")
        ) {
          return {
            success: false,
            blocked: true,
            message: "Invalid test file",
          };
        }

        return { success: true, blocked: false };
      },
      { filePath, content },
    );
  }

  async getStats() {
    return await this.runner.getLearningStats();
  }
}
```

### Monitoring Learning Progress

```javascript
const stats = await runner.getLearningStats();
console.log(`
  Executions: ${stats.executions}
  Success Rate: ${stats.successRate}%
  Avg Time: ${stats.avgExecutionTime}ms
  Patterns: ${stats.patternsLearned}
  Insights: ${stats.insightsGenerated}
`);
```

## Performance

The learning system is designed for minimal overhead:

- **Execution overhead**: <200ms (configurable)
- **Async operations**: Pattern analysis and insight generation run asynchronously
- **Database optimized**: Indexes on all query fields
- **Batch operations**: Efficient bulk updates

## Migrations

The system includes automatic database migrations:

```bash
# Check migration status
node tools/hooks/learning/DatabaseMigration.js status

# Run migrations
node tools/hooks/learning/DatabaseMigration.js migrate

# Rollback to version
node tools/hooks/learning/DatabaseMigration.js rollback 2
```

## Testing

Run the comprehensive test suite:

```bash
# Integration tests
node tools/hooks/learning/integration-test.js

# Example scenarios
node tools/hooks/learning/example-integration.js
```

## API Reference

### SimpleLearningRunner

```javascript
constructor(hookName, options)
// hookName: string - Unique identifier for the hook
// options: {
//   family: string - Hook family (e.g., 'code-quality')
//   priority: string - Hook priority (low|medium|high)
//   learningEnabled: boolean - Enable/disable learning
//   dbPath: string - Custom database path
// }

async executeWithLearning(hookFunction, hookData)
// Executes hook with learning data collection
// Returns: Hook execution result

async getLearningStats()
// Returns: {
//   executions: number
//   avgExecutionTime: number
//   successRate: number
//   patternsLearned: number
//   insightsGenerated: number
// }
```

### LearningDatabase

```javascript
async recordExecution(hookName, executionData)
// Records hook execution data

async updatePattern(hookName, patternType, patternData, success, blocked)
// Updates pattern statistics

async recordLearningInsight(hookName, insightType, insightData, confidence)
// Records a learning insight

async getExecutionHistory(hookName, limit)
// Returns execution history for analysis
```

## Troubleshooting

### Database Issues

```bash
# Reset database
rm tools/hooks/data/learning.db
node tools/hooks/learning/DatabaseMigration.js migrate
```

### Performance Issues

```bash
# Check database size
ls -lh tools/hooks/data/learning.db

# Analyze slow queries
sqlite3 tools/hooks/data/learning.db "EXPLAIN QUERY PLAN SELECT ..."
```

### Debug Mode

```bash
# Enable verbose logging
export LEARNING_LOG_LEVEL=debug
export LEARNING_LOG_CONSOLE=true
```

## Future Enhancements

Phase 2-4 will add:

- Machine learning models for pattern recognition
- Predictive analytics for proactive enforcement
- Cross-hook collaboration and knowledge sharing
- Temporal learning for time-based patterns
- Context-aware adaptation to project types

## Contributing

When adding new hooks:

1. Use `SimpleLearningRunner` for learning capabilities
2. Define appropriate hook family and priority
3. Ensure hook returns standard result format
4. Test with various scenarios to train the system

## License

Part of AIPatternEnforcer - See main project license
