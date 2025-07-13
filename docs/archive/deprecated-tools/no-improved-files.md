# No Improved Files Enforcer Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Command Line Interface](#command-line-interface)
5. [Naming Violations](#naming-violations)
6. [Enforcement Levels](#enforcement-levels)
7. [Usage Examples](#usage-examples)
8. [Integration Guide](#integration-guide)
9. [Implementation Details](#implementation-details)
10. [Troubleshooting](#troubleshooting)
11. [API Reference](#api-reference)
12. [Architecture](#architecture)
13. [FAQs](#faqs)

## Overview

The No Improved Files enforcer is a critical tool that prevents file proliferation by blocking commits containing files
with version-indicating suffixes. It enforces the ProjectTemplate principle of editing files in-place rather than
creating new versions.

### Key Features

- **Pattern Detection**: Identifies files with versioning suffixes
- **Smart Suggestions**: Provides better naming alternatives
- **Selective Checking**: Can check specific files or entire project
- **Enforcement Integration**: Works with enforcement level system
- **Git Integration**: Designed for pre-commit hooks
- **Clear Guidance**: Provides actionable fix instructions

### Purpose

This tool enforces clean file naming by:
- Preventing `*_improved.py`, `*_v2.js`, `*_final.md` patterns
- Maintaining single source of truth for each file
- Reducing codebase confusion
- Ensuring clean git history

### Philosophy

The tool embodies the principle: "Edit files in place, don't create new versions"

## Quick Start

```bash
# Check all files in project
node tools/enforcement/no-improved-files.js

# Check specific staged files (used by git hooks)
node tools/enforcement/no-improved-files.js file1.js file2.py

# With lint-staged integration
npx lint-staged
```

## Installation and Setup

### Prerequisites

- Node.js 14.0.0 or higher
- Git repository
- npm dependencies installed

### Installation

```bash
# Install dependencies
npm install

# Ensure script is executable
chmod +x tools/enforcement/no-improved-files.js
```

### Git Hook Setup

```bash
# Install husky
npm install --save-dev husky

# Add to pre-commit hook
npx husky add .husky/pre-commit "node tools/enforcement/no-improved-files.js"
```

## Command Line Interface

### Basic Usage

```bash
node tools/enforcement/no-improved-files.js [files...]
```

### Arguments

- `[files...]`: Optional list of specific files to check
- No arguments: Checks entire project

### Exit Codes

- `0`: Success - no violations found
- `1`: Failure - violations found and enforcement blocks commit

## Naming Violations

### Prohibited Patterns

The tool blocks files matching these patterns:

| Pattern | Example | Why Blocked |
|---------|---------|-------------|
| `*_improved.*` | `utils_improved.js` | Implies original wasn't good enough |
| `*_enhanced.*` | `api_enhanced.py` | Creates version confusion |
| `*_v2.*` | `config_v2.json` | Explicit versioning in filename |
| `*_v[0-9]+.*` | `schema_v3.sql` | Numeric versions |
| `*_updated.*` | `readme_updated.md` | Temporal versioning |
| `*_new.*` | `parser_new.ts` | Implies old version exists |
| `*_refactored.*` | `auth_refactored.js` | Process artifacts |
| `*_final.*` | `report_final.md` | False finality |
| `*_copy.*` | `test_copy.py` | Duplicate indicators |
| `*_backup.*` | `data_backup.json` | Backup files |
| `*_old.*` | `styles_old.css` | Deprecated versions |
| `*_temp.*` | `cache_temp.txt` | Temporary files |
| `*_tmp.*` | `build_tmp.js` | Temporary files |
| `*_FIXED.*` | `bug_FIXED.py` | Fix indicators |
| `*_COMPLETE.*` | `task_COMPLETE.md` | Completion markers |

### Ignored Directories

The following directories are automatically excluded:
- `node_modules/`
- `dist/`
- `build/`
- `.git/`
- `coverage/`
- `.next/`
- `out/`

## Enforcement Levels

The tool integrates with the enforcement configuration system:

### Enforcement Behavior

- **OFF**: No checks performed
- **WARN**: Shows warnings but allows commit
- **PARTIAL**: **Blocks commits** (file naming always enforced)
- **STRICT**: Blocks commits
- **FULL**: Blocks commits

**Important**: File naming is enforced at PARTIAL level and above, making it one of the earliest enforced rules.

### Configuration

Enforcement level is controlled by `tools/enforcement/.enforcement-level`:
```text
PARTIAL
```

## Usage Examples

### Example 1: Clean Project

```bash
node tools/enforcement/no-improved-files.js

# Output:
✅ No naming violations found!
```

### Example 2: Violations Found

```bash
node tools/enforcement/no-improved-files.js

# Output:
❌ Found files violating naming rules:

  1. src/utils_improved.js
     → Suggested: src/utils.js

  2. docs/api_v2.md
     → Suggested: docs/api.md

💡 How to fix:
   Use git mv to rename files:
   git mv <old-name> <new-name>

📚 Why this matters:
   - Prevents file proliferation
   - Maintains clean git history
   - Reduces confusion in codebase
   - Follows ProjectTemplate standards

🚫 Commit blocked due to naming violations.
💡 File naming is always enforced at PARTIAL level and above
```

### Example 3: Specific File Check

```bash
# Check only staged files
node tools/enforcement/no-improved-files.js src/auth_new.js

# Output:
❌ Found files violating naming rules:

  1. src/auth_new.js
     → Suggested: src/auth.js

💡 How to fix:
   Use git mv to rename files:
   git mv <old-name> <new-name>
```

### Example 4: Warning Mode (OFF level)

```bash
# When enforcement is OFF
node tools/enforcement/no-improved-files.js

# Output:
⚠️  File naming warnings:

  1. test_v3.py
     → Suggested: test.py

⏩ Commit proceeding with warnings.
💡 To fix issues: Follow suggestions above
💡 File naming will block at PARTIAL level
```

## Integration Guide

### Pre-commit Hook Integration

```bash
#!/bin/sh
# .husky/pre-commit

# Check for improved files
node tools/enforcement/no-improved-files.js

# Check staged files only
git diff --cached --name-only | xargs node tools/enforcement/no-improved-files.js
```

### Lint-staged Integration

```json
{
  "lint-staged": {
    "*": [
      "node tools/enforcement/no-improved-files.js"
    ]
  }
}
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Check File Naming
  run: node tools/enforcement/no-improved-files.js
```

### npm Scripts

```json
{
  "scripts": {
    "check:naming": "node tools/enforcement/no-improved-files.js",
    "precommit": "npm run check:naming"
  }
}
```

## Implementation Details

### Pattern Matching

The tool uses glob patterns to find violations:
```javascript
const improvedPatterns = [
  "**/*_improved.*",
  "**/*_enhanced.*",
  "**/*_v2.*",
  "**/*_v[0-9]+.*",
  // ... more patterns
];
```

### Name Suggestion Algorithm

1. Extract base filename without extension
2. Remove known suffixes using regex
3. Handle edge cases (empty names, numbers)
4. Reconstruct with original path and extension

```javascript
function suggestBetterName(filePath) {
  // Remove version suffixes
  let suggested = base.replace(
    /_(?:improved|enhanced|v\d+|...)$/i,
    ""
  );
  
  // Handle empty results
  if (!suggested) {
    suggested = "renamed-file";
  }
  
  return path.join(dir, suggested + ext);
}
```

### Enforcement Integration

```javascript
// Check enforcement level
const shouldBlockCommit = shouldBlock('fileNaming', config);

// Log metrics
logMetrics('fileNaming', violations, config);

// Exit with appropriate code
process.exit(shouldBlockCommit ? 1 : 0);
```

## Troubleshooting

### Common Issues

#### 1. False Positives
**Problem**: Legitimate files flagged as violations
```bash
❌ Found files violating naming rules:
  1. improved_algorithm_paper.pdf
```
**Solution**: Move to appropriate directory or rename without prefix

#### 2. Git Hook Not Running
**Problem**: Commits succeed despite violations
**Solution**: 
```bash
# Reinstall hooks
npm run setup:hooks

# Verify hook exists
cat .git/hooks/pre-commit
```

#### 3. Performance on Large Projects
**Problem**: Slow checking on large codebases
**Solution**: Use staged file checking:
```bash
git diff --cached --name-only | xargs node tools/enforcement/no-improved-files.js
```

### Debug Mode

Enable debug output:
```bash
DEBUG=* node tools/enforcement/no-improved-files.js
```

## API Reference

### Exported Functions

#### checkForImprovedFiles(specificFiles)

Main function that checks for naming violations.

**Parameters:**
- `specificFiles` (string[]): Optional array of specific files to check

**Returns:**
- Promise<void>

**Throws:**
- Error if file checking fails

#### suggestBetterName(filePath)

Generates improved name suggestion for a file.

**Parameters:**
- `filePath` (string): Path to file with naming violation

**Returns:**
- `string`: Suggested better filename with path

### Module Usage

```javascript
const { 
  checkForImprovedFiles, 
  suggestBetterName 
} = require('./no-improved-files');

// Check specific files
await checkForImprovedFiles(['src/utils_v2.js']);

// Get name suggestion
const better = suggestBetterName('api_improved.py');
console.log(better); // 'api.py'
```

## Architecture

### Component Structure

```text
no-improved-files.js
├── Configuration
│   ├── improvedPatterns[]     # Violation patterns
│   └── ignorePatterns[]       # Excluded directories
├── Core Functions
│   ├── checkForImprovedFiles() # Main checker
│   └── suggestBetterName()     # Name suggester
├── Integration
│   ├── loadConfig()            # Enforcement config
│   ├── shouldBlock()           # Block decision
│   └── logMetrics()            # Metrics tracking
└── CLI Interface
    └── Main execution          # Argument handling
```

### Execution Flow

```text
Input → Pattern Matching → Violation Detection → Enforcement Check → Output
  ↓           ↓                    ↓                    ↓              ↓
Files    Glob scan           Found matches      Check level      Block/Warn
         or specific         with patterns      and metrics      + suggest
```

## FAQs

### Why block these patterns?
These patterns lead to:
- Multiple versions of the same file
- Confusion about which version is current
- Bloated repositories
- Difficult merge conflicts

### What if I need to keep old versions?
Use version control (git) for history. For major rewrites, use branches.

### Can I customize the patterns?
Yes, modify the `improvedPatterns` array in the source code.

### How do I rename files correctly?
```bash
# Use git mv to maintain history
git mv old_name_v2.js new_name.js
```

### What about backup files?
Use `.gitignore` for local backups. Never commit backup files.

### Does this check file contents?
No, only filenames are checked. Content validation is separate.

### Can I disable for specific files?
No, but you can:
- Use proper naming from the start
- Move files to ignored directories (not recommended)
- Temporarily lower enforcement level (not recommended)

---

**Source**: [no-improved-files.js](/Users/paulrohde/CodeProjects/ProjectTemplate/tools/enforcement/no-improved-files.js)