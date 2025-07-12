# Batch Validate Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
  4. [Prerequisites](#prerequisites)
  5. [Installation](#installation)
6. [Command Line Interface](#command-line-interface)
  7. [Basic Syntax](#basic-syntax)
  8. [Options](#options)
  9. [Arguments](#arguments)
10. [Usage Examples](#usage-examples)
  11. [Basic Batch Validation](#basic-batch-validation)
  12. [Parallel Processing](#parallel-processing)
  13. [File List Input](#file-list-input)
  14. [CI/CD Integration](#cicd-integration)
15. [Output Formats](#output-formats)
  16. [Summary Format (Default)](#summary-format-default)
  17. [JSON Format](#json-format)
  18. [Detailed Format](#detailed-format)
19. [Performance Optimization](#performance-optimization)
  20. [Parallel Execution](#parallel-execution)
  21. [Caching](#caching)
  22. [Memory Management](#memory-management)
23. [Integration Examples](#integration-examples)
  24. [Pre-commit Hook](#pre-commit-hook)
  25. [GitHub Actions](#github-actions)
  26. [NPM Scripts](#npm-scripts)
27. [Error Handling](#error-handling)
  28. [Common Issues](#common-issues)
    29. [Issue: "Pattern matched no files"](#issue-pattern-matched-no-files)
    30. [Issue: "Too many open files"](#issue-too-many-open-files)
    31. [Issue: "Memory overflow"](#issue-memory-overflow)
32. [Configuration](#configuration)
  33. [Batch Configuration](#batch-configuration)
  34. [Pattern Presets](#pattern-presets)
35. [Performance Benchmarks](#performance-benchmarks)
  36. [Typical Performance](#typical-performance)
  37. [Optimization Tips](#optimization-tips)
38. [Related Tools](#related-tools)

## Overview

A batch validation tool for processing multiple files through the Claude validation system. This tool enables efficient
validation of entire directories, file patterns, or lists of files against ProjectTemplate's AI compliance standards.

**Tool Type**: CLI/Batch Processor  
**Language**: JavaScript  
**Dependencies**: validate-claude.js, fs, path, glob

## Quick Start

```bash
# Validate all JavaScript files in src/
node tools/claude-validation/batch-validate.js "src/**/*.js"

# Validate multiple patterns
node tools/claude-validation/batch-validate.js "src/**/*.js" "tools/**/*.js" --parallel

# Validate from file list
node tools/claude-validation/batch-validate.js --file-list=files-to-validate.txt
```

## Installation and Setup

### Prerequisites
- Node.js >=18.0.0
- Claude validation system configured
- Valid patterns configuration

### Installation
Included in ProjectTemplate. Ensure claude-validation tools are installed:
```bash
npm install
```

## Command Line Interface

### Basic Syntax
```bash
node tools/claude-validation/batch-validate.js [patterns...] [options]
```

### Options
- `--parallel`: Run validations in parallel (default: sequential)
- `--max-parallel <n>`: Maximum parallel validations (default: 5)
- `--file-list <path>`: Read files from a text file
- `--output <format>`: Output format: json|summary|detailed (default: summary)
- `--fail-fast`: Stop on first validation failure
- `--quiet`: Suppress progress output
- `--report <path>`: Save report to file

### Arguments
- `patterns`: Glob patterns for files to validate (e.g., "src/**/*.js")

## Usage Examples

### Basic Batch Validation
```bash
# Validate all TypeScript files
node tools/claude-validation/batch-validate.js "**/*.ts"

# Output:
# 🔍 Batch Validation Starting...
# src/App.tsx - PASSED
# ❌ src/utils/helper.ts - FAILED (3 violations)
# src/components/Button.tsx - PASSED
# 
# 📊 Summary: 2/3 passed (66.7%)
```

### Parallel Processing
```bash
# Process files in parallel for faster validation
node tools/claude-validation/batch-validate.js "**/*.{js,ts}" --parallel --max-parallel 10

# Useful for large codebases
# Automatically manages resource usage
```

### File List Input
```bash
# Create file list
find . -name "*.js" -mtime -7 > recent-files.txt

# Validate from list
node tools/claude-validation/batch-validate.js --file-list=recent-files.txt
```

### CI/CD Integration
```bash
# Generate JSON report for CI parsing
node tools/claude-validation/batch-validate.js \
  "src/**/*.{js,ts,jsx,tsx}" \
  --output=json \
  --report=validation-report.json \
  --fail-fast

# Exit code: 0 if all pass, 1 if any fail
```

## Output Formats

### Summary Format (Default)
```text
📊 Batch Validation Summary
Files Validated: 45
Passed: 42 (93.3%)
Failed: 3 (6.7%)
Total Violations: 7
Execution Time: 12.3s

Failed Files:
- src/legacy/oldCode.js (3 violations)
- tools/deprecated.js (2 violations)
- scripts/temp.js (2 violations)
```

### JSON Format
```json
{
  "summary": {
    "totalFiles": 45,
    "passed": 42,
    "failed": 3,
    "violations": 7,
    "executionTime": 12300
  },
  "results": [
    {
      "file": "src/App.tsx",
      "status": "passed",
      "violations": []
    },
    {
      "file": "src/legacy/oldCode.js",
      "status": "failed",
      "violations": [
        {
          "rule": "no-improved-files",
          "line": 1,
          "severity": "error"
        }
      ]
    }
  ],
  "timestamp": "2025-07-12T06:00:00Z"
}
```

### Detailed Format
Includes full validation output for each file, useful for debugging.

## Performance Optimization

### Parallel Execution
```javascript
// Automatic parallelization based on CPU cores
const maxParallel = os.cpus().length;

// Or manual control
--parallel --max-parallel 8
```

### Caching
- Results cached for unchanged files
- Cache invalidated on rule changes
- Use `--no-cache` to force revalidation

### Memory Management
- Streams large files
- Batches results to prevent memory overflow
- Configurable batch size with `--batch-size`

## Integration Examples

### Pre-commit Hook
```bash
#!/bin/bash
# .husky/pre-commit

# Validate only staged files
git diff --cached --name-only --diff-filter=ACM | \
  grep -E '\.(js|ts|jsx|tsx)$' | \
  xargs node tools/claude-validation/batch-validate.js --fail-fast

if [ $? -ne 0 ]; then
  echo "❌ Validation failed. Please fix violations before committing."
  exit 1
fi
```

### GitHub Actions
```yaml
- name: Batch Validate Code
  run: |
    node tools/claude-validation/batch-validate.js \
      "src/**/*.{js,ts,jsx,tsx}" \
      "tools/**/*.js" \
      --output=json \
      --report=${{ runner.temp }}/validation.json
    
- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: validation-report
    path: ${{ runner.temp }}/validation.json
```

### NPM Scripts
```json
{
  "scripts": {
    "validate:all": "node tools/claude-validation/batch-validate.js '**/*.{js,ts}'",
    "validate:src": "node tools/claude-validation/batch-validate.js 'src/**/*'",
    "validate:changed": "git diff --name-only | xargs node tools/claude-validation/batch-validate.js"
  }
}
```

## Error Handling

### Common Issues

#### Issue: "Pattern matched no files"
**Solution**:
```bash
# Check pattern with glob test
node -e "console.log(require('glob').sync('your-pattern'))"

# Use quotes to prevent shell expansion
node tools/claude-validation/batch-validate.js "src/**/*.js"
```

#### Issue: "Too many open files"
**Solution**:
```bash
# Reduce parallelism
--max-parallel 3

# Or increase system limit
ulimit -n 4096
```

#### Issue: "Memory overflow"
**Solution**:
```bash
# Process in smaller batches
--batch-size 50

# Or increase Node memory
node --max-old-space-size=4096 tools/claude-validation/batch-validate.js
```

## Configuration

### Batch Configuration
Create `.batch-validate.json`:
```json
{
  "parallel": true,
  "maxParallel": 10,
  "failFast": false,
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.min.js"
  ],
  "cacheDir": ".validation-cache",
  "reportFormat": "summary"
}
```

### Pattern Presets
```javascript
// Common validation patterns
const presets = {
  "source": "src/**/*.{js,ts,jsx,tsx}",
  "tests": "**/*.{test,spec}.{js,ts}",
  "tools": "tools/**/*.js",
  "all": "**/*.{js,ts,jsx,tsx}"
};

// Usage
node tools/claude-validation/batch-validate.js --preset=source
```

## Performance Benchmarks

### Typical Performance
- **Sequential**: ~100 files/minute
- **Parallel (8 cores)**: ~500 files/minute
- **With cache**: ~2000 files/minute

### Optimization Tips
1. Use parallel mode for >50 files
2. Enable caching for repeated runs
3. Exclude vendor/generated files
4. Run on specific directories when possible

## Related Tools

- **validate-claude.js**: Single-file validation engine
- **analytics-tracker.js**: Tracks validation metrics
- **pre-commit-hook.sh**: Git integration
- **compliance-validator.js**: Full compliance checking

---

**Last Updated**: 2025-07-12  
**Version**: 1.0.0  
**Maintainer**: ProjectTemplate Claude Validation Team