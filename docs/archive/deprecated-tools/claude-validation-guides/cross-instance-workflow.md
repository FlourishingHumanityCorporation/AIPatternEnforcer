# Cross-Instance Claude Code Validation Workflow

## Table of Contents

1. [Quick Start (No VS Code Required)](#quick-start-no-vs-code-required)
  2. [1. Direct Clipboard Validation (macOS)](#1-direct-clipboard-validation-macos)
  3. [2. File-Based Validation (Cross-Platform)](#2-file-based-validation-cross-platform)
  4. [3. Direct Input Validation](#3-direct-input-validation)
  5. [4. Automated Validation in Scripts](#4-automated-validation-in-scripts)
6. [Cross-Session Features](#cross-session-features)
7. [VS Code Integration (Optional)](#vs-code-integration-optional)
8. [Key Benefits](#key-benefits)

## Quick Start (No VS Code Required)

The validation system works independently across any terminal session. Here are the primary workflows:

### 1. Direct Clipboard Validation (macOS)
```bash
# Copy Claude's response, then:
pbpaste | npm run claude:validate

# For complex requests (expecting improved prompt):
pbpaste | node tools/claude-validation/validate-claude.js - --complex

# For simple queries (expecting concise response):
pbpaste | node tools/claude-validation/validate-claude.js - --simple
```

### 2. File-Based Validation (Cross-Platform)
```bash
# Save Claude's response to a file
# Then validate from any terminal:
npm run claude:validate response.txt

# Or directly:
node tools/claude-validation/validate-claude.js response.txt --complex
```

### 3. Direct Input Validation
```bash
# Type or paste response, then Ctrl+D to end input
npm run claude:validate
```

### 4. Automated Validation in Scripts
```bash
# Silent mode for automation
echo "$CLAUDE_RESPONSE" | node tools/claude-validation/validate-claude.js - --quiet
# Returns exit code 0 for pass, 1 for fail
```

## Cross-Session Features

- **Statistics Tracking**: All validations are tracked in `.compliance-stats.json`
- **Session Independence**: Works from any terminal, no IDE required
- **Analytics Dashboard**: `npm run claude:dashboard` shows trends across all sessions

## VS Code Integration (Optional)

While the core validation works without VS Code, the extension provides:
- Keyboard shortcut (Cmd+Shift+V) for quick validation
- Rich HTML results panel
- Integrated tasks

To use VS Code features, install the extension:
```bash
code --install-extension extensions/projecttemplate-assistant/projecttemplate-assistant-0.1.0.vsix
```

## Key Benefits

1. **Terminal-First**: Works in any terminal environment
2. **CI/CD Ready**: Can be integrated into automated workflows
3. **Cross-Platform**: Works on macOS, Linux, Windows (with appropriate clipboard tools)
4. **Session Tracking**: Maintains compliance statistics across all validations