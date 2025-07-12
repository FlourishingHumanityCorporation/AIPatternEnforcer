# Proper Logging Practices

This guide outlines the logging standards enforced by ProjectTemplate's log enforcer system.

## Overview

Proper logging is essential for debugging, monitoring, and maintaining applications. The log enforcer automatically prevents common logging anti-patterns and ensures consistent logging practices across the codebase.

## Rules

### 1. No Print Statements in Production Code

**Rule**: Never use `print()` statements in production Python code.

❌ **Incorrect**:
```python
def process_data(data):
    print("Processing data")  # Violation
    result = data.transform()
    print(f"Result: {result}")  # Violation
    return result
```

✅ **Correct**:
```python
import logging

logger = logging.getLogger(__name__)

def process_data(data):
    logger.info("Processing data")
    result = data.transform()
    logger.info("Result: %s", result)
    return result
```

### 2. No Console Usage in Production JavaScript/TypeScript

**Rule**: Never use `console.log()`, `console.error()`, etc. in production JavaScript/TypeScript code.

❌ **Incorrect**:
```javascript
function processData(data) {
    console.log("Processing data");  // Violation
    const result = data.transform();
    console.error("Result:", result);  // Violation
    return result;
}
```

✅ **Correct**:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

function processData(data) {
    logger.info('Processing data');
    const result = data.transform();
    logger.info('Result: %s', result);
    return result;
}
```

### 3. Required Logger Instance

**Rule**: Files that import logging libraries must create a logger instance.

❌ **Incorrect**:
```python
import logging

def some_function():
    # No logger instance created
    pass
```

✅ **Correct**:
```python
import logging

logger = logging.getLogger(__name__)  # Logger instance required

def some_function():
    logger.info("Function called")
```

## Allowed Exceptions

### Test Files

Logging violations are allowed in test files:

✅ **Allowed in tests**:
```python
# test_example.py
def test_feature():
    print("Test output is allowed")  # OK in test files
    assert True
```

✅ **Allowed in JavaScript tests**:
```javascript
// example.test.js
describe('Feature', () => {
    it('should work', () => {
        console.log("Test output is allowed");  // OK in test files
        expect(true).toBe(true);
    });
});
```

### CLI Scripts

Logging violations are allowed in CLI entry points:

✅ **Allowed in CLI scripts**:
```python
#!/usr/bin/env python3
# cli.py or scripts/

def main():
    print("Usage: script.py [options]")  # OK in CLI scripts
    print("Output to user")

if __name__ == "__main__":
    main()
```

### Inline Disables

Use disable comments for specific cases:

✅ **Inline disable**:
```python
def debug_function():
    # log-enforcer-disable-next-line
    print("Debug output for development")  # Explicitly disabled
    
    logger.info("Regular logging continues")
```

## Configuration

### Setting Up Log Enforcer

Generate a configuration file:

```bash
npm run setup:log-enforcer
```

This creates `.log-enforcer.json` with default settings:

```json
{
  "enabled": true,
  "languages": {
    "python": {
      "enabled": true,
      "severity": "error",
      "autoFix": true
    },
    "javascript": {
      "enabled": true,
      "severity": "error",
      "autoFix": true,
      "preferredLogger": "winston"
    }
  },
  "rules": {
    "noPrintStatements": {
      "enabled": true,
      "severity": "error"
    },
    "noConsoleUsage": {
      "enabled": true,
      "severity": "error"
    }
  }
}
```

### Customizing File Patterns

Exclude additional files or directories:

```json
{
  "languages": {
    "python": {
      "excludePatterns": [
        "**/migrations/**/*.py",
        "**/legacy/**/*.py"
      ]
    },
    "javascript": {
      "excludePatterns": [
        "**/build/**/*.js",
        "**/vendor/**/*.js"
      ]
    }
  }
}
```

## Commands

### Check for Violations

```bash
npm run check:logs          # Check all files
npm run check:logs:status   # Show detailed status
```

### Auto-fix Violations

```bash
npm run fix:logs:dry-run    # Preview fixes
npm run fix:logs            # Apply fixes
```

### Integration with Existing Workflows

```bash
npm run check:all           # Includes log checking
```

## Supported Logging Libraries

### Python

- **Standard Library**: `logging` module (recommended)
- **Pattern**: `logger = logging.getLogger(__name__)`

### JavaScript/TypeScript

- **Winston** (default): Feature-rich logging library
- **Pino**: High-performance JSON logger
- **Bunyan**: Structured logging
- **Log4js**: Port of log4j

Example Winston setup:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});
```

## Integration with Development Tools

### Pre-commit Hooks

Log enforcer automatically runs on pre-commit:

```bash
# In .husky/pre-commit
npm run check:logs
```

### VS Code Integration

The ProjectTemplate VS Code extension provides:

- Real-time violation highlighting
- Quick-fix suggestions
- Status bar enforcement indicator

### CI/CD Pipeline

Add to GitHub Actions:

```yaml
- name: Check logging compliance
  run: npm run check:logs
```

## Troubleshooting

### Common Issues

**Issue**: "Python AST tools not available"
**Solution**: Install required dependencies or use simple regex mode

**Issue**: "False positives in legacy code"
**Solution**: Add exclude patterns or use disable comments

**Issue**: "Performance slow on large codebases"
**Solution**: Enable incremental mode in configuration

### Getting Help

- Check configuration: `npm run check:logs:status`
- Review exclude patterns in `.log-enforcer.json`
- Use `--verbose` flag for detailed output

## Migration Guide

### From Print Statements

1. Run `npm run fix:logs:dry-run` to preview changes
2. Review the proposed fixes
3. Run `npm run fix:logs` to apply automatic fixes
4. Test your application thoroughly

### From Console Usage

JavaScript auto-fixing is planned for a future release. Currently:

1. Choose a logging library (Winston recommended)
2. Install and configure the logger
3. Manually replace console statements
4. Run `npm run check:logs` to verify compliance

## Best Practices

1. **Use structured logging**: Include relevant context in log messages
2. **Choose appropriate log levels**: DEBUG, INFO, WARN, ERROR
3. **Avoid logging sensitive data**: Never log passwords, tokens, or PII
4. **Include correlation IDs**: Help trace requests across services
5. **Log exceptions properly**: Include stack traces and context

## Performance Considerations

- Log enforcer uses file-level caching for unchanged files
- Incremental mode only checks modified files
- Parallel processing handles multiple files efficiently
- Average overhead: < 100ms for pre-commit hooks

## Security Notes

- Never log authentication credentials
- Be careful with user input in log messages
- Consider log aggregation and retention policies
- Sanitize log output in production environments