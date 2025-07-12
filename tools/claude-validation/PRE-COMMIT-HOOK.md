# Claude Validation Pre-commit Hook

Automated git pre-commit hook that prevents Claude-generated anti-patterns from being committed.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
  4. [Automatic (Default)](#automatic-default)
  5. [Manual Check](#manual-check)
  6. [Testing the Hook](#testing-the-hook)
7. [Patterns Detected](#patterns-detected)
  8. [1. Anti-pattern Filenames](#1-anti-pattern-filenames)
  9. [2. Announcement-style Content](#2-announcement-style-content)
  10. [3. Imports of Anti-pattern Files](#3-imports-of-anti-pattern-files)
11. [Bypassing the Hook](#bypassing-the-hook)
12. [How It Works](#how-it-works)
13. [Integration](#integration)
14. [Performance](#performance)
15. [Troubleshooting](#troubleshooting)
  16. [Hook not running](#hook-not-running)
  17. [False positives](#false-positives)
  18. [Performance issues](#performance-issues)
19. [Related Commands](#related-commands)

## Overview

This hook runs automatically before each git commit to check staged files for common Claude AI anti-patterns like:
- Files with `_improved`, `_enhanced`, `_v2` naming patterns
- Announcement-style documentation ("We're excited to announce...")
- Imports/requires of anti-pattern files

## Installation

The hook is automatically integrated via Husky and runs as part of the standard pre-commit checks.

## Usage

### Automatic (Default)
The hook runs automatically when you commit:
```bash
git add .
git commit -m "Your commit message"
```

### Manual Check
Check staged files without committing:
```bash
npm run claude:check:staged
```

### Testing the Hook
Run the test suite to verify the hook works correctly:
```bash
npm run claude:test:hook
```

## Patterns Detected

### 1. Anti-pattern Filenames
Files ending with:
- `_improved.{js,py,ts,...}`
- `_enhanced.{js,py,ts,...}`
- `_v2.{js,py,ts,...}`
- `_better.{js,py,ts,...}`
- `_new.{js,py,ts,...}`
- `_updated.{js,py,ts,...}`
- `_fixed.{js,py,ts,...}`

**Fix**: Edit the original file instead of creating new versions.

### 2. Announcement-style Content
Content containing:
- "We're excited to announce..."
- "Successfully implemented..."
- "I've created..."
- "I've successfully..."

**Fix**: Use technical, timeless language without superlatives.

### 3. Imports of Anti-pattern Files
Code that imports/requires files with anti-patterns:
```javascript
import { auth } from './auth_improved.js';  // ❌
const utils = require('./utils_v2.js');     // ❌
```

**Fix**: Update imports to use original filenames.

## Bypassing the Hook

In rare cases where you need to bypass the hook:

```bash
SKIP_CLAUDE_CHECK=1 git commit -m "Your message"
```

⚠️ **Warning**: Only use this escape hatch when absolutely necessary. The patterns being checked are considered
anti-patterns in ProjectTemplate.

## How It Works

1. Gets list of staged files from git
2. Skips binary files automatically
3. Checks each file's name and content for anti-patterns
4. Reports violations with clear fix instructions
5. Exits with non-zero code to prevent commit if violations found

## Integration

The hook integrates cleanly with existing pre-commit checks:
1. Claude validation runs first
2. If it passes, standard enforcement checks run
3. Finally, lint-staged runs for formatting/linting

## Performance

- Fast: Only checks staged files
- Smart: Skips binary files automatically
- Lightweight: Uses basic shell commands for speed
- Non-blocking: Won't slow down normal development

## Troubleshooting

### Hook not running
Ensure Husky is installed:
```bash
npm run setup:hooks
```

### False positives
The hook is designed to be conservative. If you encounter false positives, please report them.

### Performance issues
The hook only checks staged files and skips binaries, so it should be fast. If you experience slowdowns with many files,
consider staging files in smaller batches.

## Related Commands

- `npm run claude:validate` - Validate Claude responses
- `npm run claude:stats` - View compliance statistics
- `npm run check:all` - Run all enforcement checks