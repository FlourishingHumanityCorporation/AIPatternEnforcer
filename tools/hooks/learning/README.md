# Simplified Hook Pattern Learning

**Status**: Minimal system for template improvement  
**Complexity**: <200 lines of code total  
**User Impact**: Zero configuration required

## What This Is

This directory contains the minimal pattern logging system that replaced the complex adaptive learning system. It's designed to help template maintainers discover new AI mistake patterns without adding complexity for end users.

## Simple Pattern Logger

**File**: `../simple-pattern-logger.js`

**Purpose**: Basic pattern logging for template maintainer review

- Logs hook execution patterns to simple files
- Generates weekly reports for pattern discovery
- Zero configuration for template users
- No adaptive behavior or real-time changes

**Usage**:

```javascript
const SimplePatternLogger = require("../simple-pattern-logger");
const logger = new SimplePatternLogger();

// In hook: just log what happened
logger.logPattern(hookName, pattern, blocked, metadata);

// Weekly: generate report
const report = logger.saveWeeklyReport();
```

## For Template Users (Copy-Paste)

**You don't need to do anything.** The system works automatically:

1. Copy the template
2. Hooks prevent AI mistakes automatically
3. No configuration, no complexity
4. Just works

## For Template Maintainers

**Simple workflow to improve hooks**:

1. **Weekly Review**: Run `node simple-pattern-logger.js report`
2. **Pattern Discovery**: Review blocked patterns for new AI mistakes
3. **Static Updates**: Add new patterns to existing hook files
4. **Template Release**: Users get improved prevention automatically

**Example workflow**:

```bash
# Generate weekly report
node tools/hooks/simple-pattern-logger.js report

# Review: "component_improved.tsx blocked 15 times"
# Action: Add /_improved/ pattern to prevent-improved-files.js
# Result: Next template version prevents this mistake
```

## What We DON'T Have (By Design)

- ❌ Real-time adaptive behavior
- ❌ Statistical analysis engines
- ❌ A/B testing frameworks
- ❌ Complex database systems
- ❌ Enterprise monitoring
- ❌ Automatic parameter adjustment

## Files in This Directory

Currently minimal - just this README. The complex learning system has been archived to `/experimental/hook-learning-system-archive/` for reference.

## Migration from Complex System

If you were using the complex learning system:

**Before**:

```javascript
const SimpleLearningRunner = require("./learning/SimpleLearningRunner");
const runner = new SimpleLearningRunner("my-hook", options);
await runner.executeWithLearning(hookFunction, data);
```

**After**:

```javascript
// Just use regular hooks - they work without learning complexity
// Optional: Add minimal logging for maintainer review
const logger = new SimplePatternLogger();
logger.logPattern("my-hook", pattern, blocked);
```

## Integration with Existing Hooks

**For hook developers** who want to add pattern logging:

```javascript
// At top of hook file
const SimplePatternLogger = require("../simple-pattern-logger");
const logger = new SimplePatternLogger();

// In hook logic
if (shouldBlock) {
  logger.logPattern(hookName, filePath, true);
  return { blocked: true, message: "..." };
} else {
  logger.logPattern(hookName, filePath, false);
  return { blocked: false };
}
```

**Optional**: Logging is completely optional. Hooks work perfectly without it.

---

**Philosophy**: Keep template simple, improve through insights, not complexity.
