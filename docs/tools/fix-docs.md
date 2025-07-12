# Fix Docs Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Command Line Interface](#command-line-interface)
5. [Auto-Fix Features](#auto-fix-features)
6. [Superlative Replacements](#superlative-replacements)
7. [Code Block Detection](#code-block-detection)
8. [Usage Examples](#usage-examples)
9. [Implementation Details](#implementation-details)
10. [Integration Guide](#integration-guide)
11. [Troubleshooting](#troubleshooting)
12. [API Reference](#api-reference)
13. [Architecture](#architecture)
14. [FAQs](#faqs)

## Overview

The Fix Docs tool is an automated documentation style enforcer that ensures consistent, professional documentation
across your project. It automatically fixes common style violations and improves documentation quality.

### Key Features

- **Line Length Optimization**: Breaks long lines at logical points (120 character limit)
- **Superlative Replacement**: Converts marketing language to technical terms
- **Code Block Enhancement**: Adds language specifications to code blocks
- **Table of Contents Generation**: Adds TOC to long documents automatically
- **Dry Run Mode**: Preview changes without modifying files
- **Selective Processing**: Fix specific files or entire directories

### Purpose

This tool helps maintain professional documentation standards by:
- Enforcing consistent formatting rules
- Removing non-technical language
- Improving code block readability
- Ensuring proper document structure

### Integration

Integrates with:
- Pre-commit hooks for automatic documentation fixes
- CI/CD pipelines for documentation validation
- Documentation enforcement workflow

## Quick Start

```bash
# Fix all markdown files in project
node tools/enforcement/fix-docs.js

# Fix specific file
node tools/enforcement/fix-docs.js README.md

# Preview changes without modifying files
node tools/enforcement/fix-docs.js --dry-run

# Run quietly (no output except errors)
node tools/enforcement/fix-docs.js --quiet
```

## Installation and Setup

### Prerequisites

- Node.js 14.0.0 or higher
- Access to project documentation files
- Write permissions for documentation directories

### Installation

```bash
# Ensure tool is executable
chmod +x tools/enforcement/fix-docs.js

# Run directly with node
node tools/enforcement/fix-docs.js
```

### Configuration

The tool uses built-in configurations:
- Line length limit: 120 characters
- Superlative mappings: Predefined in tool
- Code patterns: Auto-detected from content

## Command Line Interface

### Basic Usage

```bash
node tools/enforcement/fix-docs.js [options] [file]
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--dry-run` | Preview changes without modifying files | `node fix-docs.js --dry-run` |
| `--quiet` | Suppress all output except errors | `node fix-docs.js --quiet` |
| `[file]` | Fix specific markdown file | `node fix-docs.js README.md` |

### Exit Codes

- `0`: Success - all files processed without errors
- `1`: Failure - one or more errors occurred

## Auto-Fix Features

### 1. Line Length Optimization

Breaks lines longer than 120 characters at logical word boundaries:

**Before:**
```markdown
This is an extremely long line that contains way too much information and definitely exceeds the 120 character limit
that we have established for readability purposes.
```

**After:**
```markdown
This is an extremely long line that contains way too much information and definitely exceeds the 120 character
limit that we have established for readability purposes.
```

### 2. Superlative Replacement

Converts marketing language to technical terms:

**Before:**
```markdown
This functional feature provides effective performance with complete reliability.
```

**After:**
```markdown
This functional feature provides effective performance with complete reliability.
```

### 3. Code Block Language Detection

Adds language specifications to unmarked code blocks:

**Before:**
````markdown
```
npm run test
npm install
```text
````

**After:**
````markdown
```bash
npm run test
npm install
```text
````

### 4. Table of Contents Generation

Automatically adds TOC to documents with 3+ headers and 50+ lines:

**Before:**
```markdown
# My Document

Introduction text...

## Section 1
Content...

## Section 2
Content...
```

**After:**
```markdown
# My Document

Introduction text...

## Table of Contents

1. [Section 1](#section-1)
2. [Section 2](#section-2)

## Section 1
Content...

## Section 2
Content...
```

## Superlative Replacements

The tool replaces the following superlatives with technical alternatives:

| Superlative | Replacement |
|-------------|-------------|
| functional | functional |
| effective | effective |
| complete | complete |
| optimal | optimal |
| robust | robust |
| reliable | reliable |
| comprehensive | comprehensive |
| well-designed | well-designed |
| well-structured | well-structured |
| efficient | efficient |

### Case Preservation

The tool preserves the original case of replaced words:
- `functional` → `functional`
- `Functional` → `Functional`
- `FUNCTIONAL` → `FUNCTIONAL`

## Code Block Detection

The tool automatically detects programming languages based on content patterns:

### Shell/Bash Detection
- `npm run` → bash
- `git ` → bash
- `cd ` → bash
- `mkdir` → bash

### JavaScript Detection
- `import ` → javascript
- `export ` → javascript
- `function ` → javascript
- `const ` → javascript

### TypeScript Detection
- `interface ` → typescript
- `type ` → typescript
- `class ` → typescript

### Python Detection
- `def ` → python
- `import ` → python
- `from ` → python

### Fallback
- Unrecognized patterns → text

## Usage Examples

### Example 1: Fix All Documentation

```bash
# Fix all markdown files in project
node tools/enforcement/fix-docs.js

# Output:
🔧 Fixing documentation style in 42 files...

✅ Fixed README.md
   - Line length optimized
   - Superlatives replaced with technical terms
   - Table of contents added (if needed)

✅ Fixed docs/guides/setup.md
   - Code blocks properly labeled
   - Superlatives replaced with technical terms

📊 Summary:
   Files processed: 42
   Files fixed: 12
   Errors: 0
```

### Example 2: Preview Changes

```bash
# Preview changes without modifying
node tools/enforcement/fix-docs.js --dry-run README.md

# Output:
🔧 Fixing documentation style in 1 files...

✅ Fixed README.md
   - Dry run - no changes made

📊 Summary:
   Files processed: 1
   Files fixed: 1
   Errors: 0

🚨 DRY RUN - No files were actually modified
```

### Example 3: Silent Mode

```bash
# Run quietly for scripts
node tools/enforcement/fix-docs.js --quiet

# No output unless errors occur
# Exit code indicates success/failure
```

## Implementation Details

### File Processing Flow

1. **Discovery Phase**
   - Scan directories for .md files
   - Skip node_modules, .git, dist, build
   - Build file list

2. **Analysis Phase**
   - Read file content
   - Detect violations
   - Plan fixes

3. **Fix Phase**
   - Apply line length fixes
   - Replace superlatives
   - Fix code blocks
   - Generate TOC if needed

4. **Write Phase**
   - Compare with original
   - Write only if changed
   - Report results

### Technical Architecture

```javascript
// Core fix functions
fixDocument(filePath) {
  content = readFile(filePath)
  content = fixLineLength(content)      // Break long lines
  content = fixSuperlatives(content)    // Replace marketing terms
  content = fixCodeBlocks(content)      // Add language specs
  content = generateTableOfContents(content)  // Add TOC if needed
  writeFile(filePath, content)
}
```

## Integration Guide

### Pre-commit Hook Integration

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "node tools/enforcement/fix-docs.js --quiet"
    }
  }
}
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Fix Documentation Style
  run: |
    node tools/enforcement/fix-docs.js
    git diff --exit-code || (git add -A && git commit -m "fix: auto-fix documentation style")
```

### npm Scripts Integration

```json
{
  "scripts": {
    "fix:docs": "node tools/enforcement/fix-docs.js",
    "fix:docs:dry-run": "node tools/enforcement/fix-docs.js --dry-run"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Permission Errors
```bash
❌ Error fixing README.md: EACCES: permission denied
```
**Solution**: Ensure write permissions for documentation files

#### 2. File Not Found
```bash
❌ Error fixing docs/missing.md: ENOENT: no such file or directory
```
**Solution**: Verify file path exists

#### 3. Long Processing Time
**Solution**: Use specific file argument instead of processing all files

### Debug Mode

For debugging, modify the tool to add verbose logging:
```javascript
// Add at top of file
const DEBUG = process.env.DEBUG === 'true';

// Add debug logging
if (DEBUG) console.log('Processing:', filePath);
```

## API Reference

### Exported Functions

#### fixDocument(filePath)
Fixes style violations in a single document.

**Parameters:**
- `filePath` (string): Path to markdown file

**Returns:**
- `{ fixed: boolean, changes?: string[], error?: string }`

#### findMarkdownFiles(dir)
Recursively finds all markdown files in directory.

**Parameters:**
- `dir` (string): Directory to scan (default: '.')

**Returns:**
- `string[]`: Array of file paths

### Module Usage

```javascript
const { fixDocument, findMarkdownFiles } = require('./fix-docs');

// Fix single file
const result = fixDocument('README.md');
if (result.fixed) {
  console.log('Fixed:', result.changes);
}

// Find all markdown files
const files = findMarkdownFiles('./docs');
console.log(`Found ${files.length} markdown files`);
```

## Architecture

### Component Structure

```text
fix-docs.js
├── Configuration
│   ├── SUPERLATIVE_REPLACEMENTS  # Word mappings
│   └── CODE_PATTERNS             # Language detection
├── Fix Functions
│   ├── fixLineLength()           # Line breaking
│   ├── fixSuperlatives()         # Word replacement
│   ├── fixCodeBlocks()           # Language addition
│   └── generateTableOfContents() # TOC generation
├── Utility Functions
│   ├── findMarkdownFiles()       # File discovery
│   └── fixDocument()             # Main processor
└── CLI Interface
    └── main()                    # Command handler
```

### Processing Pipeline

```text
Input Files → Discovery → Analysis → Fixes → Validation → Output
     ↓           ↓          ↓         ↓         ↓           ↓
   *.md      Find files  Detect   Apply    Compare    Write if
             in dirs     issues   fixes    changes    changed
```

## FAQs

### Why 120 character line limit?
This limit ensures readability across different screen sizes and follows common documentation standards.

### Can I customize superlative replacements?
Currently, replacements are hardcoded. Modify the `SUPERLATIVE_REPLACEMENTS` object in the source code.

### Does it fix grammar or spelling?
No, this tool focuses on style and formatting only. Use separate grammar checkers for content quality.

### Can it process other file types?
Currently supports only .md files. Extension requires modifying the file discovery logic.

### How does TOC generation work?
TOC is added to documents with:
- More than 50 lines
- At least 3 headers (##, ###, etc.)
- No existing "Table of Contents" section

### Is the tool idempotent?
Yes, running multiple times produces the same result. Files are only written if changes are detected.

---

**Source**: [fix-docs.js](/Users/paulrohde/CodeProjects/ProjectTemplate/tools/enforcement/fix-docs.js)