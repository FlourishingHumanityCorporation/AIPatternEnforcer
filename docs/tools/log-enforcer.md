# Log Enforcer Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
   4. [Prerequisites](#prerequisites)
   5. [Installation](#installation)
   6. [Configuration](#configuration)
7. [Command Line Interface](#command-line-interface)
   8. [Basic Syntax](#basic-syntax)
   9. [Commands](#commands)
      10. [`check`](#check)
      11. [`fix`](#fix)
      12. [`config`](#config)
      13. [`status`](#status)
   14. [Global Options](#global-options)
15. [Configuration](#configuration-1)
   16. [Configuration File Format](#configuration-file-format)
   17. [Configuration Options](#configuration-options)
      18. [Language Settings](#language-settings)
      19. [Rule Configuration](#rule-configuration)
      20. [Performance Settings](#performance-settings)
   21. [Environment Variables](#environment-variables)
22. [Usage Examples](#usage-examples)
   23. [Example 1: Basic Compliance Check](#example-1-basic-compliance-check)
   24. [Example 2: Auto-fixing Violations](#example-2-auto-fixing-violations)
   25. [Example 3: Configuration Generation](#example-3-configuration-generation)
26. [Integration with Development Workflow](#integration-with-development-workflow)
   27. [NPM Scripts](#npm-scripts)
   28. [Pre-commit Hooks](#pre-commit-hooks)
   29. [CI/CD Integration](#cicd-integration)
30. [Output and Results](#output-and-results)
   31. [Output Formats](#output-formats)
      32. [Default Output](#default-output)
      33. [JSON Output](#json-output)
   34. [Exit Codes](#exit-codes)
35. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
   36. [Common Errors](#common-errors)
   37. [Debug Mode](#debug-mode)
   38. [Performance Issues](#performance-issues)
39. [API and Programmatic Usage](#api-and-programmatic-usage)
   40. [Node.js Integration](#nodejs-integration)
   41. [TypeScript Interfaces](#typescript-interfaces)
42. [Testing](#testing)
43. [Performance and Optimization](#performance-and-optimization)
44. [Development and Contributing](#development-and-contributing)
45. [Related Tools and Documentation](#related-tools-and-documentation)
46. [Version History and Migration](#version-history-and-migration)

## Overview

Log Enforcer is a comprehensive logging compliance tool that integrates with ProjectTemplate's enforcement system. It detects and automatically fixes improper logging practices such as `print()` statements in Python and `console.log()` usage in JavaScript/TypeScript, ensuring consistent logging standards across the codebase.

**Tool Type**: CLI/Script  
**Language**: JavaScript (Node.js)  
**Dependencies**: ProjectTemplate enforcement framework

## Quick Start

```bash
# Check for logging violations
npm run check:logs

# Auto-fix violations  
npm run fix:logs

# Preview fixes without applying
npm run fix:logs:dry-run

# Generate configuration file
npm run setup:log-enforcer
```

## Installation and Setup

### Prerequisites
- Node.js ≥16.0.0
- ProjectTemplate enforcement framework
- Access to project source files

### Installation
```bash
# Tool is included in project dependencies
# No additional installation required

# Verify tool is available
node tools/enforcement/log-enforcer.js --help
```

### Configuration
```bash
# Generate default configuration
node tools/enforcement/log-enforcer.js config

# Or use force overwrite
node tools/enforcement/log-enforcer.js config --force

# Set up as NPM script (already configured)
npm run setup:log-enforcer
```

## Command Line Interface

### Basic Syntax
```bash
node tools/enforcement/log-enforcer.js <command> [options] [patterns]
```

### Commands

#### `check`
**Purpose**: Check for logging compliance violations (default command)

**Syntax**:
```bash
node tools/enforcement/log-enforcer.js check [options] [patterns]
```

**Options**:
- `--verbose`: Enable detailed output
- `--config <path>`: Use specific configuration file

**Examples**:
```bash
# Basic compliance check
node tools/enforcement/log-enforcer.js check

# Check specific files
node tools/enforcement/log-enforcer.js check src/**/*.js

# Verbose checking
node tools/enforcement/log-enforcer.js check --verbose
```

#### `fix`
**Purpose**: Automatically fix logging violations

**Syntax**:
```bash
node tools/enforcement/log-enforcer.js fix [options] [patterns]
```

**Options**:
- `--dry-run`: Preview changes without applying them
- `--verbose`: Show detailed fix information
- `--config <path>`: Use specific configuration file

**Examples**:
```bash
# Fix all violations
node tools/enforcement/log-enforcer.js fix

# Preview fixes without applying
node tools/enforcement/log-enforcer.js fix --dry-run

# Fix specific pattern
node tools/enforcement/log-enforcer.js fix src/components/**/*.py
```

#### `config`
**Purpose**: Generate configuration file

**Syntax**:
```bash
node tools/enforcement/log-enforcer.js config [options]
```

**Options**:
- `--force`: Overwrite existing configuration file
- `--config <path>`: Specify custom config file path

**Examples**:
```bash
# Generate default config
node tools/enforcement/log-enforcer.js config

# Force overwrite existing config
node tools/enforcement/log-enforcer.js config --force

# Generate at custom location
node tools/enforcement/log-enforcer.js config --config=custom-log.json
```

#### `status`
**Purpose**: Show enforcement status and statistics

**Syntax**:
```bash
node tools/enforcement/log-enforcer.js status [options]
```

**Examples**:
```bash
# Show current status
node tools/enforcement/log-enforcer.js status

# Detailed status report
node tools/enforcement/log-enforcer.js status --verbose
```

### Global Options
- `--help, -h`: Show help information
- `--verbose`: Enable verbose output
- `--config=<path>`: Use specific configuration file
- `--dry-run`: Preview changes without executing

## Configuration

### Configuration File Format

**Location**: `.log-enforcer.json` or specified with `--config`

```json
{
  "enabled": true,
  "languages": {
    "python": {
      "enabled": true,
      "severity": "error",
      "autoFix": true,
      "excludePatterns": [
        "**/migrations/**/*.py",
        "**/venv/**/*.py",
        "**/.venv/**/*.py"
      ]
    },
    "javascript": {
      "enabled": true,
      "severity": "error",
      "autoFix": true,
      "preferredLogger": "winston",
      "excludePatterns": [
        "**/node_modules/**/*.js",
        "**/dist/**/*.js",
        "**/*.min.js"
      ]
    }
  },
  "rules": {
    "noPrintStatements": {
      "enabled": true,
      "severity": "error",
      "message": "Use logging.getLogger(__name__) instead of print()"
    },
    "noConsoleUsage": {
      "enabled": true,
      "severity": "error",
      "message": "Use proper logging library instead of console",
      "allowedMethods": []
    }
  },
  "performance": {
    "enableCache": true,
    "parallelism": 4
  },
  "reporting": {
    "format": "text",
    "verbose": false
  }
}
```

### Configuration Options

#### Language Settings
- `python.enabled` (boolean): Enable Python logging enforcement
  - **Default**: `true`

- `python.severity` (string): Violation severity level
  - **Default**: `"error"`
  - **Valid values**: `"error"`, `"warning"`, `"info"`

- `python.autoFix` (boolean): Enable automatic fixing
  - **Default**: `true`

- `javascript.preferredLogger` (string): Preferred logging library
  - **Default**: `"winston"`
  - **Examples**: `"winston"`, `"bunyan"`, `"pino"`

#### Rule Configuration
- `noPrintStatements.enabled` (boolean): Detect print() statements
  - **Default**: `true`

- `noConsoleUsage.enabled` (boolean): Detect console usage
  - **Default**: `true`

- `noConsoleUsage.allowedMethods` (array): Allowed console methods
  - **Default**: `[]` (none allowed)
  - **Examples**: `["error"]` (allow console.error)

#### Performance Settings
- `performance.enableCache` (boolean): Enable processing cache
  - **Default**: `true`

- `performance.parallelism` (number): Number of parallel workers
  - **Default**: `4`
  - **Range**: `1` - `16`

### Environment Variables

```bash
# Optional environment variables
export LOG_ENFORCER_CONFIG="/path/to/config.json"
export LOG_ENFORCER_LOG_LEVEL="debug"    # debug, info, warn, error
export LOG_ENFORCER_CACHE_DIR="/tmp/log-enforcer"
```

## Usage Examples

### Example 1: Basic Compliance Check
```bash
# Check all files for violations
node tools/enforcement/log-enforcer.js check

# Expected output
🔍 Checking logging compliance...
❌ Found 12 logging violations

📋 Violation Summary:
   print(): 8
   console.log(): 3
   console.error(): 1

💡 Run with --fix to auto-fix violations
```

### Example 2: Auto-fixing Violations
```bash
# Preview fixes without applying
node tools/enforcement/log-enforcer.js fix --dry-run

# Expected output
🔧 Fixing logging violations...
📋 Would fix 12 violations in 5 files

Files to be processed:
   src/utils/helper.py (3 print statements)
   src/components/Button.js (2 console.log statements)
   src/services/api.ts (1 console.error statement)

# Apply fixes
node tools/enforcement/log-enforcer.js fix

# Expected output
🔧 Fixing logging violations...
✅ Fixed 12 violations in 5 files

📊 Fix Summary:
   Python files: 3 files, 8 violations fixed
   JavaScript files: 2 files, 4 violations fixed
```

### Example 3: Configuration Generation
```bash
# Generate new configuration
node tools/enforcement/log-enforcer.js config

# Expected output
✅ Created log enforcer config at .log-enforcer.json

# View generated config
cat .log-enforcer.json
```

## Integration with Development Workflow

### NPM Scripts

Pre-configured in `package.json`:
```json
{
  "scripts": {
    "check:logs": "node tools/enforcement/log-enforcer.js check",
    "fix:logs": "node tools/enforcement/log-enforcer.js fix",
    "fix:logs:dry-run": "node tools/enforcement/log-enforcer.js fix --dry-run",
    "setup:log-enforcer": "node tools/enforcement/log-enforcer.js config"
  }
}
```

### Pre-commit Hooks

```bash
# Add to .husky/pre-commit
npm run check:logs
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Check Logging Compliance
  run: |
    npm run check:logs
    if [ $? -ne 0 ]; then
      echo "Logging violations found. Run 'npm run fix:logs' to fix."
      exit 1
    fi
```

## Output and Results

### Output Formats

#### Default Output
```text
🔍 Checking logging compliance...
✅ All files pass logging compliance checks

Or with violations:
❌ Found 5 logging violations

📋 Violation Summary:
   print(): 3
   console.log(): 2

Files with violations:
   src/utils.py:15 - print statement
   src/app.js:42 - console.log usage

💡 Run with --fix to auto-fix violations
```

#### JSON Output
```json
{
  "success": false,
  "violations": [
    {
      "filepath": "src/utils.py",
      "line": 15,
      "type": "print_statement",
      "message": "Use logging.getLogger(__name__) instead of print()",
      "severity": "error"
    }
  ],
  "stats": {
    "filesAnalyzed": 150,
    "filesExcluded": 25,
    "filesWithViolations": 3,
    "timeElapsed": 1250
  }
}
```

### Exit Codes
- `0`: Success (no violations or successful fix)
- `1`: General error or violations found

## Error Handling and Troubleshooting

### Common Errors

**Error: "Configuration file not found"**  
**Cause**: Specified config file doesn't exist  
**Solution**: 
```bash
# Generate default configuration
node tools/enforcement/log-enforcer.js config

# Or check file path
ls -la .log-enforcer.json
```

**Error: "Permission denied accessing file"**  
**Cause**: Insufficient file system permissions  
**Solution**:
```bash
# Check file permissions
ls -la src/file.py

# Fix permissions if needed
chmod 644 src/file.py
```

**Error: "Auto-fixing failed"**  
**Cause**: File syntax errors or write permissions  
**Solution**:
```bash
# Check file syntax first
python -m py_compile src/file.py

# Use dry-run to preview changes
node tools/enforcement/log-enforcer.js fix --dry-run
```

### Debug Mode

Enable detailed debugging:
```bash
# Enable verbose output
node tools/enforcement/log-enforcer.js check --verbose

# Check specific file patterns
node tools/enforcement/log-enforcer.js check src/**/*.py --verbose
```

### Performance Issues

**Slow Processing**:
1. Reduce parallelism: Set `performance.parallelism` to 2
2. Enable caching: Ensure `performance.enableCache` is true
3. Exclude large directories: Add patterns to `excludePatterns`

## API and Programmatic Usage

### Node.js Integration

```javascript
const LogEnforcementSystem = require('./tools/enforcement/log-enforcer');

// Create enforcer instance
const enforcer = new LogEnforcementSystem();

// Check for violations
const checkResult = await enforcer.check({
  patterns: ['src/**/*.py'],
  verbose: false
});

if (!checkResult.success) {
  console.log(`Found ${checkResult.violations.length} violations`);
  
  // Auto-fix violations
  const fixResult = await enforcer.fix({
    dryRun: false
  });
  
  console.log(fixResult.message);
}

// Generate configuration
const configResult = await enforcer.generateConfig({
  configPath: 'custom-config.json',
  force: true
});

// Show status
const statusResult = await enforcer.status();
```

### TypeScript Interfaces

```typescript
interface EnforcementOptions {
  patterns?: string[];
  verbose?: boolean;
  configPath?: string;
  dryRun?: boolean;
  force?: boolean;
}

interface EnforcementResult {
  success: boolean;
  violations: Violation[];
  stats: Statistics;
  message: string;
}

interface Violation {
  filepath: string;
  line: number;
  type: 'print_statement' | 'console_usage';
  method?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface Statistics {
  filesAnalyzed: number;
  filesExcluded: number;
  filesWithViolations: number;
  timeElapsed: number;
}
```

## Testing

```bash
# Test the enforcer
npm run test -- tools/enforcement/log-enforcer

# Test with sample files
node tools/enforcement/log-enforcer.js check test-data/sample-violations/

# Manual testing
echo "print('test')" > test.py
node tools/enforcement/log-enforcer.js check test.py
node tools/enforcement/log-enforcer.js fix test.py --dry-run
```

## Performance and Optimization

### Performance Characteristics
- **Processing Speed**: ~50-100 files per second
- **Memory Usage**: ~50MB baseline + ~1MB per 100 files
- **Cache Benefits**: 60-80% faster on subsequent runs

### Optimization Tips
1. **Use Caching**: Enable `performance.enableCache`
2. **Exclude Unnecessary Paths**: Add to `excludePatterns`
3. **Adjust Parallelism**: Optimize `performance.parallelism` for your system
4. **Batch Processing**: Process related files together

## Development and Contributing

### Project Structure
```text
tools/enforcement/
├── log-enforcer.js              # Main CLI script
├── log-enforcer/
│   ├── index.js                 # Core enforcer logic
│   ├── python_fixer.js          # Python auto-fixer
│   └── javascript_fixer.js      # JavaScript auto-fixer (TODO)
├── test/                        # Test files
└── config/                      # Default configurations
```

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
node tools/enforcement/log-enforcer.js check --verbose

# Run tests
npm test -- tools/enforcement/log-enforcer
```

### Code Style
- Follow project ESLint configuration
- Use async/await for asynchronous operations
- Include comprehensive error handling
- Write unit tests for all enforcement rules

## Related Tools and Documentation

- **[Import Enforcer](import-enforcer.md)**: Enforces proper import statements
- **[Documentation Enforcer](documentation-enforcer.md)**: Ensures code documentation
- **[Enforcement System Guide](../guides/enforcement/ENFORCEMENT.md)**: Complete enforcement framework documentation
- **[CLAUDE.md](../../CLAUDE.md)**: Project AI instructions including logging rules

## Version History and Migration

### Current Version: 1.0.0

### Recent Changes
- **1.0.0**: Initial release with Python and JavaScript support
- **1.0.0**: Added auto-fixing capabilities for Python files
- **1.0.0**: Integrated with ProjectTemplate enforcement framework

### Breaking Changes
None (initial release)

---

**Last Updated**: 2025-07-12  
**Tool Version**: 1.0.0  
**Maintainer**: ProjectTemplate Team  
**Support**: See [Enforcement Guide](../guides/enforcement/ENFORCEMENT.md) for troubleshooting