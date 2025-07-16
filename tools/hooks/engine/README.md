# Hook Execution Engine

This directory contains the core execution engine for parallel hook processing in AIPatternEnforcer.

## Overview

The hook execution engine provides parallel execution capabilities to dramatically reduce hook execution time from 15-30 seconds to under 5 seconds, while maintaining the same reliability and error handling.

## Components

### ParallelExecutor (`parallel-executor.js`)

The main execution engine that manages parallel hook execution based on priority levels.

**Key Features:**

- Priority-based execution (critical → high → medium → low → background)
- Parallel execution within priority groups
- Graceful fallback to sequential execution
- Comprehensive error handling and timeout management
- Performance monitoring and statistics

**Usage:**

```javascript
const ParallelExecutor = require("./parallel-executor");

const executor = new ParallelExecutor({
  verbose: true,
  timeout: 30000,
  fallbackToSequential: true,
});

const result = await executor.runParallel(hooks, inputData);
```

### HookPriority (`hook-priority.js`)

Priority classification system that manages hook execution order and characteristics.

**Key Features:**

- 5 priority levels (critical, high, medium, low, background)
- 11 hook families with specific behaviors
- Automatic classification of existing hooks
- Performance targets and execution strategies
- Configuration generation and validation

**Usage:**

```javascript
const HookPriority = require("./hook-priority");

const priority = new HookPriority();
const hookPriority = priority.getHookPriority(
  "tools/hooks/security/security-scan.js",
);
const classified = priority.classifyHooksByPriority(hooks);
```

### Enhanced HookRunner (`../lib/HookRunner.js`)

Updated base class with parallel execution support.

**New Features:**

- Priority and family metadata
- Execution context awareness
- Parent executor communication
- Performance timing and monitoring
- Conditional execution based on context

## Priority System

### Priority Levels

| Priority       | Timeout | Strategy   | Description                                             |
| -------------- | ------- | ---------- | ------------------------------------------------------- |
| **critical**   | 2s      | sequential | Must complete successfully, blocks all subsequent hooks |
| **high**       | 4s      | parallel   | Important validations, can run in parallel within group |
| **medium**     | 3s      | parallel   | Standard validations, parallel execution                |
| **low**        | 2s      | parallel   | Nice-to-have validations, can be skipped under pressure |
| **background** | 5s      | async      | Non-blocking operations, run asynchronously             |

### Hook Families

| Family                        | Priority | Blocking   | Description                          |
| ----------------------------- | -------- | ---------- | ------------------------------------ |
| **file_hygiene**              | critical | hard-block | Prevents file system pollution       |
| **infrastructure_protection** | critical | hard-block | Protects meta-project infrastructure |
| **security**                  | high     | soft-block | Security and vulnerability scanning  |
| **validation**                | high     | soft-block | Data and context validation          |
| **architecture**              | high     | soft-block | Architectural pattern enforcement    |
| **pattern_enforcement**       | medium   | warning    | Development pattern enforcement      |
| **performance**               | medium   | warning    | Performance monitoring               |
| **testing**                   | medium   | warning    | Test-related validations             |
| **code_cleanup**              | low      | none       | Code cleanup and formatting          |
| **documentation**             | low      | none       | Documentation enforcement            |
| **data_hygiene**              | medium   | warning    | Database validation                  |

## Configuration

The priority system automatically updates `.claude/settings.json` with priority classifications:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "command": "node tools/hooks/ai-patterns/prevent-improved-files.js",
            "timeout": 1,
            "family": "file_hygiene",
            "priority": "critical",
            "blockingBehavior": "hard-block"
          }
        ]
      }
    ]
  }
}
```

## Performance Improvements

### Before (Sequential Execution)

- **Total Time**: 15-30 seconds
- **Bottlenecks**: Each hook waits for previous to complete
- **Parallelism**: 1 hook at a time
- **Efficiency**: Poor resource utilization

### After (Parallel Execution)

- **Total Time**: < 5 seconds
- **Bottlenecks**: Only critical hooks block others
- **Parallelism**: Up to 10 hooks simultaneously
- **Efficiency**: 85%+ resource utilization

### Performance Targets

| Priority   | Max Duration | Max Parallelism | Efficiency Target |
| ---------- | ------------ | --------------- | ----------------- |
| critical   | 2s           | 1               | 100%              |
| high       | 4s           | 3               | 80%               |
| medium     | 3s           | 5               | 70%               |
| low        | 2s           | 10              | 60%               |
| background | 5s           | 10              | 50%               |

## Testing

### Unit Tests

Run the test suites to verify functionality:

```bash
# Test parallel executor
node tools/hooks/engine/__tests__/parallel-executor.test.js

# Test priority system
node tools/hooks/engine/__tests__/hook-priority.test.js
```

### Integration Testing

Test with actual hook configurations:

```bash
# Update settings with priorities
node tools/hooks/engine/hook-priority.js update-settings

# Get hook statistics
node tools/hooks/engine/hook-priority.js stats

# Classify hooks from file
node tools/hooks/engine/hook-priority.js classify hooks.json
```

## CLI Usage

### ParallelExecutor

```bash
# Execute hooks from JSON file
node tools/hooks/engine/parallel-executor.js hooks-config.json

# Execute hooks from stdin
echo '{"hooks": [...], "data": {...}}' | node tools/hooks/engine/parallel-executor.js
```

### HookPriority

```bash
# Show hook statistics
node tools/hooks/engine/hook-priority.js stats

# Update settings.json with priorities
node tools/hooks/engine/hook-priority.js update-settings

# Classify hooks from file
node tools/hooks/engine/hook-priority.js classify hooks.json
```

## Error Handling

The engine provides comprehensive error handling:

1. **Timeout Management**: Individual hook timeouts with graceful degradation
2. **Fallback Strategy**: Automatic fallback to sequential execution on failure
3. **Fail-Safe Design**: Hooks fail open - errors don't block operations
4. **Detailed Logging**: Comprehensive error reporting and debugging info
5. **Partial Failure**: Some hooks can fail while others continue

## Monitoring and Analytics

### Performance Metrics

- **Execution Time**: Total and per-hook timing
- **Parallel Efficiency**: Resource utilization ratio
- **Success Rate**: Percentage of hooks completing successfully
- **Error Rate**: Failure and timeout statistics
- **Blocking Rate**: How often hooks block operations

### Example Performance Report

```javascript
{
  "totalHooks": 17,
  "totalDuration": 4200,
  "maxDuration": 2100,
  "parallelEfficiency": "2.0",
  "successRate": "94.1%",
  "blocks": 0,
  "errors": 1,
  "successful": 16,
  "byPriority": {
    "critical": { "count": 3, "duration": 1800, "success": 3 },
    "high": { "count": 6, "duration": 2100, "success": 6 },
    "medium": { "count": 6, "duration": 2400, "success": 5 },
    "low": { "count": 2, "duration": 400, "success": 2 }
  }
}
```

## Future Enhancements

### Planned Features

1. **Dynamic Priority Adjustment**: Adjust priorities based on execution patterns
2. **Resource-Aware Scheduling**: Consider system resources for parallelism
3. **Hook Dependencies**: Support for hook dependency chains
4. **Caching**: Cache hook results for repeated operations
5. **Metrics Dashboard**: Real-time performance monitoring
6. **Machine Learning**: Optimize execution based on historical performance

### Integration Points

- **IDE Integration**: Real-time hook status in development environment
- **CI/CD Integration**: Automated performance monitoring
- **Analytics Platform**: Centralized performance tracking
- **Community Sharing**: Share hook performance optimizations

## Migration Guide

### From Sequential to Parallel

1. **Update HookRunner**: Use new parallel-aware HookRunner
2. **Add Priority Metadata**: Classify hooks by priority and family
3. **Update Settings**: Run priority update command
4. **Test Configuration**: Verify parallel execution works correctly
5. **Monitor Performance**: Track improvements and adjust as needed

### Backward Compatibility

The engine maintains full backward compatibility:

- Existing hooks work without modification
- Sequential execution available as fallback
- All existing configuration options supported
- Gradual migration path available

## Troubleshooting

### Common Issues

1. **High Parallelism Overhead**: Reduce parallelism for small hook sets
2. **Timeout Failures**: Increase timeouts for slow hooks
3. **Memory Usage**: Monitor memory consumption with many parallel hooks
4. **Resource Contention**: Adjust priority groups to reduce contention

### Debug Mode

Enable verbose logging for troubleshooting:

```javascript
const executor = new ParallelExecutor({ verbose: true });
```

### Performance Debugging

Use performance monitoring to identify bottlenecks:

```javascript
const result = await executor.runParallel(hooks, input);
const stats = executor.getPerformanceStats(result);
console.log(stats);
```

---

This execution engine represents a significant advancement in hook processing performance while maintaining the reliability and comprehensive validation that makes AIPatternEnforcer effective for preventing AI coding anti-patterns.
