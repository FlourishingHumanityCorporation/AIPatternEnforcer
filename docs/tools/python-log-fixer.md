# Python Log Fixer Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [API Reference](#api-reference)
5. [AST Transformation System](#ast-transformation-system)
6. [Fix Types and Patterns](#fix-types-and-patterns)
7. [Usage Examples](#usage-examples)
8. [Implementation Details](#implementation-details)
9. [Integration Guide](#integration-guide)
10. [Troubleshooting](#troubleshooting)
11. [Architecture](#architecture)
12. [FAQs](#faqs)

## Overview

The Python Log Fixer is an automated tool that transforms Python print statements into proper logging calls using
Abstract Syntax Tree (AST) manipulation. It ensures consistent logging practices across Python codebases.

### Key Features

- **AST-Based Transformation**: Safe, accurate code modification
- **Automatic Import Management**: Adds logging imports when needed
- **Logger Instance Creation**: Creates logger instances automatically
- **Fallback Mode**: Regex-based fixing when AST tools unavailable
- **Dry Run Support**: Preview changes without modifying files
- **Batch Processing**: Fix multiple files simultaneously

### Purpose

This tool enforces proper logging practices by:
- Converting `print()` calls to `logger.info()`
- Adding necessary logging imports
- Creating logger instances with `__name__`
- Maintaining code functionality while improving observability

### Technical Approach

Uses Python's `ast` module for safe, semantic-preserving transformations rather than simple text replacement.

## Quick Start

```javascript
const PythonLogFixer = require('./python_fixer');

// Create fixer instance
const fixer = new PythonLogFixer();

// Fix single file
const result = await fixer.fixFile('src/utils.py');

// Fix with dry run
const preview = await fixer.fixFile('src/utils.py', { dryRun: true });

// Fix multiple files
const results = await fixer.fixFiles(['src/api.py', 'src/db.py']);
```

## Installation and Setup

### Prerequisites

- Node.js 14.0.0 or higher
- Python 3.6 or higher
- Python packages (optional but recommended):
  - `astor` for AST to source conversion

### Installation

```bash
# Install Python dependencies for full AST support
pip install astor

# Ensure Python is available
python --version
```

### Basic Setup

```javascript
// Import the fixer
const PythonLogFixer = require('./tools/enforcement/log-enforcer/python_fixer');

// Create instance
const fixer = new PythonLogFixer();
```

## API Reference

### Class: PythonLogFixer

Main class for fixing Python logging violations.

#### Constructor

```javascript
new PythonLogFixer(options)
```

**Parameters:**
- `options` (Object): Configuration options (currently reserved for future use)

#### Methods

##### fixFile(filepath, options)

Fixes logging violations in a single Python file.

**Parameters:**
- `filepath` (string): Path to Python file
- `options` (Object):
  - `dryRun` (boolean): Preview changes without modifying file

**Returns:**
```javascript
{
  success: boolean,
  changes: Array<{
    line: number,
    column: number,
    old: string,
    new: string,
    type: string
  }>,
  imports_added: string[],
  original_content: string,
  fixed_content: string,
  filepath: string,
  error?: string
}
```

##### fixFiles(filepaths, options)

Fixes logging violations in multiple Python files.

**Parameters:**
- `filepaths` (string[]): Array of file paths
- `options` (Object): Same as fixFile options

**Returns:**
```javascript
{
  files: Array<FixResult>,
  summary: {
    totalFiles: number,
    successfulFixes: number,
    failedFixes: number,
    totalChanges: number,
    changesByType: Object
  }
}
```

##### generatePreview(results)

Generates human-readable preview of changes.

**Parameters:**
- `results` (Array): Results from fixFiles

**Returns:**
- `string`: Formatted preview text

##### generateFixSummary(results)

Generates summary statistics from fix results.

**Parameters:**
- `results` (Array): Results from fixFiles

**Returns:**
- `Object`: Summary statistics

## AST Transformation System

### How It Works

1. **Parse Python Code**: Convert source to AST
2. **Analyze Imports**: Check existing logging setup
3. **Transform Nodes**: Replace print calls with logger calls
4. **Add Imports**: Insert missing imports and logger setup
5. **Generate Code**: Convert AST back to source

### AST Visitor Pattern

```python
class LoggingFixer(ast.NodeTransformer):
    def visit_Call(self, node):
        if hasattr(node.func, 'id') and node.func.id == 'print':
            # Transform to logger.info()
            return ast.Call(
                func=ast.Attribute(
                    value=ast.Name(id='logger'),
                    attr='info'
                ),
                args=node.args,
                keywords=[]
            )
```

### Import Management

The fixer intelligently manages imports:

1. **Checks Existing Imports**: Avoids duplicates
2. **Adds at Correct Position**: After shebang, before code
3. **Creates Logger Instance**: After imports, before usage

## Fix Types and Patterns

### Print to Logger Transformation

**Before:**
```python
print("Processing user data")
print(f"User {user_id} logged in")
print("Error:", error_msg)
```

**After:**
```python
import logging
logger = logging.getLogger(__name__)

logger.info("Processing user data")
logger.info(f"User {user_id} logged in")
logger.info("Error:", error_msg)
```

### Import Addition

**Conditions for adding imports:**
- No existing `import logging` statement
- Print statements found in file
- File successfully parsed as Python

**Import placement:**
- After shebang line (if present)
- After existing imports
- Before first code statement

### Logger Instance Creation

**Pattern:**
```python
logger = logging.getLogger(__name__)
```

**Placement:**
- After all imports
- Before first function/class definition
- Uses consistent variable name: `logger`

## Usage Examples

### Example 1: Single File Fix

```javascript
const fixer = new PythonLogFixer();

// Fix a single file
const result = await fixer.fixFile('src/api.py');

if (result.success) {
  console.log(`Fixed ${result.changes.length} violations`);
  console.log('Changes:', result.changes);
} else {
  console.error('Fix failed:', result.error);
}
```

### Example 2: Dry Run Preview

```javascript
// Preview changes without modifying file
const result = await fixer.fixFile('src/utils.py', { dryRun: true });

if (result.success) {
  console.log('Preview of changes:');
  result.changes.forEach(change => {
    console.log(`Line ${change.line}: ${change.old} → ${change.new}`);
  });
  
  console.log('\nWould add imports:', result.imports_added);
}
```

### Example 3: Batch Processing

```javascript
const pythonFiles = [
  'src/api.py',
  'src/database.py',
  'src/utils.py',
  'tests/test_api.py'
];

const results = await fixer.fixFiles(pythonFiles);

console.log('Fix Summary:');
console.log(`Total files: ${results.summary.totalFiles}`);
console.log(`Successful: ${results.summary.successfulFixes}`);
console.log(`Failed: ${results.summary.failedFixes}`);
console.log(`Total changes: ${results.summary.totalChanges}`);

// Show preview
console.log('\nChanges preview:');
console.log(fixer.generatePreview(results.files));
```

### Example 4: Integration with Log Enforcer

```javascript
// Used within log enforcer workflow
const violations = findPythonViolations();
const filesToFix = violations.map(v => v.file);

const fixer = new PythonLogFixer();
const results = await fixer.fixFiles(filesToFix, { dryRun: false });

// Report results
results.files.forEach(result => {
  if (result.success) {
    console.log(`✅ Fixed ${result.filepath}`);
  } else {
    console.log(`❌ Failed to fix ${result.filepath}: ${result.error}`);
  }
});
```

## Implementation Details

### Python Script Generation

The fixer generates a temporary Python script that:
1. Uses AST module for parsing
2. Implements NodeTransformer for modifications
3. Falls back to regex if AST tools unavailable
4. Returns JSON-formatted results

### Fallback Mode

When AST tools aren't available:
```python
# Simple regex-based fixing
print_pattern = r'\bprint\s*\('
new_line = re.sub(r'\bprint\s*\(', 'logger.info(', line)
```

### Error Handling

- **Parse Errors**: Reported with line numbers
- **Import Errors**: Falls back to regex mode
- **File Access**: Clear error messages
- **Python Not Found**: Node.js error with guidance

### Performance Considerations

- **Temporary Files**: Cleaned up after each operation
- **Batch Processing**: Parallel execution for multiple files
- **Memory**: AST held in memory during transformation
- **Large Files**: May use significant memory for AST

## Integration Guide

### With Log Enforcer

```javascript
// In log enforcer auto-fix command
const PythonLogFixer = require('./python_fixer');

async function fixPythonViolations(violations) {
  const fixer = new PythonLogFixer();
  const pythonFiles = violations
    .filter(v => v.file.endsWith('.py'))
    .map(v => v.file);
    
  return await fixer.fixFiles(pythonFiles);
}
```

### Command Line Wrapper

```javascript
#!/usr/bin/env node
// fix-python-logs.js

const PythonLogFixer = require('./python_fixer');
const fixer = new PythonLogFixer();

const files = process.argv.slice(2);
const dryRun = files.includes('--dry-run');
const filesToFix = files.filter(f => !f.startsWith('--'));

fixer.fixFiles(filesToFix, { dryRun })
  .then(results => {
    console.log(fixer.generatePreview(results.files));
    process.exit(results.summary.failedFixes > 0 ? 1 : 0);
  });
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Fix Python Logging
  run: |
    node tools/enforcement/log-enforcer/fix-python-logs.js src/**/*.py
    git diff --exit-code || echo "::warning::Python files were auto-fixed"
```

## Troubleshooting

### Common Issues

#### 1. Python Not Found
```text
Error: Command failed: python
```
**Solution:**
```bash
# Ensure Python is in PATH
which python
# Or use python3
alias python=python3
```

#### 2. AST Module Import Error
```text
ImportError: No module named astor
```
**Solution:**
```bash
pip install astor
# Or use fallback mode (automatic)
```

#### 3. Parse Errors
```text
SyntaxError: invalid syntax
```
**Solution:**
- Ensure file is valid Python
- Check Python version compatibility
- File may have syntax errors to fix first

#### 4. Permission Denied
```text
Error: EACCES: permission denied
```
**Solution:**
```bash
chmod +w file.py
# Or run with appropriate permissions
```

### Debug Mode

Enable verbose logging:
```javascript
// Set environment variable
process.env.DEBUG = 'python-fixer';

// Or modify options
const fixer = new PythonLogFixer({ debug: true });
```

## Architecture

### Component Overview

```text
PythonLogFixer
├── Script Generation
│   ├── AST Transformer Class
│   ├── Fallback Regex Fixer
│   └── JSON Result Formatter
├── Node.js Interface
│   ├── fixFile()
│   ├── fixFiles()
│   └── Result Processing
├── Integration Layer
│   ├── Temp File Management
│   ├── Process Execution
│   └── Error Handling
└── Utilities
    ├── generatePreview()
    └── generateFixSummary()
```

### Data Flow

```text
Python File → Parse AST → Transform → Generate Code → Write File
     ↓            ↓          ↓            ↓              ↓
   Input     Validate   Find prints   Add imports   Save/Preview
             & analyze  Replace calls logger setup    changes
```

### Python Script Architecture

```python
# Main components
LoggingFixer(ast.NodeTransformer)  # AST transformer
fix_file(filepath)                  # Main entry point
fix_file_simple(filepath)           # Regex fallback
```

## FAQs

### Why use AST instead of regex?
AST transformation:
- Preserves code semantics
- Handles complex expressions
- Avoids false positives
- Maintains proper formatting

### Can it handle complex print statements?
Yes, it preserves all arguments:
```python
# Before
print("User:", user, "Score:", score, sep=" | ")

# After
logger.info("User:", user, "Score:", score, sep=" | ")
```

### What about print to stderr?
Currently converts all prints to logger.info(). Future versions may use logger.error() for stderr prints.

### Does it work with Python 2?
Designed for Python 3. Python 2 may work with the regex fallback mode.

### Can I customize the logger name?
Currently uses standard pattern:
```python
logger = logging.getLogger(__name__)
```
Customization would require modifying the source.

### What about existing logger variables?
The fixer detects existing logger instances and uses the same variable name.

### Performance impact?
- AST parsing: ~10-50ms per file
- Regex mode: ~5-20ms per file
- Scales linearly with file size

---

**Source**:
[python_fixer.js](/Users/paulrohde/CodeProjects/ProjectTemplate/tools/enforcement/log-enforcer/python_fixer.js)