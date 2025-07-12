# AI Assistant Setup Guide

This guide helps you configure AI development tools (Cursor, Claude, GitHub Copilot) for optimal use with
ProjectTemplate. Following these steps eliminates common friction points and ensures AI tools understand your project
structure.

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start-5-minutes)
  2. [1. Install ProjectTemplate VS Code Extension](#1-install-projecttemplate-vs-code-extension)
  3. [2. Copy AI Configuration Files](#2-copy-ai-configuration-files)
  4. [3. Configure Context Window](#3-configure-context-window)
5. [Tool-Specific Setup](#tool-specific-setup)
  6. [Cursor Setup](#cursor-setup)
  7. [Claude Code (CLI) Setup](#claude-code-cli-setup)
  8. [GitHub Copilot Setup](#github-copilot-setup)
9. [Context Optimization](#context-optimization)
  10. [Understanding .aiignore](#understanding-aiignore)
  11. [Context Window Optimal Practices](#context-window-optimal-practices)
12. [Keyboard Shortcuts](#keyboard-shortcuts)
  13. [Essential AI Shortcuts](#essential-ai-shortcuts)
14. [Common Setup Issues](#common-setup-issues)
  15. [Issue: AI Creates Duplicate Files](#issue-ai-creates-duplicate-files)
  16. [Issue: AI Ignores Project Rules](#issue-ai-ignores-project-rules)
  17. [Issue: Context Window Too Large](#issue-context-window-too-large)
  18. [Issue: AI Suggests Bad Patterns](#issue-ai-suggests-bad-patterns)
19. [Optimal Prompting Strategies](#optimal-prompting-strategies)
  20. [1. Include File Paths](#1-include-file-paths)
  21. [2. Reference Patterns](#2-reference-patterns)
  22. [3. Specify Constraints](#3-specify-constraints)
23. [Verification Checklist](#verification-checklist)
24. [Next Steps](#next-steps)
25. [Troubleshooting](#troubleshooting)

## Quick Start (5 minutes)

### 1. Install ProjectTemplate VS Code Extension

```bash
# From project root
code --install-extension extensions/projecttemplate-assistant/projecttemplate-assistant-0.1.0.vsix
```

### 2. Copy AI Configuration Files

```bash
# Ensure you have the required AI config files
cp ai/config/.cursorrules .cursorrules
cp .vscode/settings.json.example .vscode/settings.json
```

### 3. Configure Context Window

Add to `.vscode/settings.json`:
```json
{
  "aiAssistant.contextWindow": "focused",
  "aiAssistant.maxTokens": 4000,
  "aiAssistant.includeComments": false
}
```

## Tool-Specific Setup

### Cursor Setup

1. **Enable CLAUDE.md Auto-Loading**
   - Settings → Features → Chat
   - Enable "Include .cursorrules file in each chat"
   - This ensures Cursor always knows your project rules

2. **Configure Indexing**
   ```bash
   # Create .cursorignore (if not exists)
   cp .aiignore .cursorignore
   ```

3. **Set Context Preferences**
   - Cmd+K → Settings → Context
   - Set "Default Context Range" to "Focused"
   - Enable "Auto-include related files"

4. **Install Recommended Extensions**
   - Open Command Palette (Cmd+Shift+P)
   - Run "Cursor: Install Recommended Extensions"

### Claude Code (CLI) Setup

1. **Initial Configuration**
   ```bash
   # Install Claude Code CLI (if not installed)
   npm install -g @anthropic/claude-code
   
   # Configure project context
   claude-code init
   ```

2. **Set Project Rules**
   - Claude Code automatically reads `CLAUDE.md`
   - No additional configuration needed

3. **Optimize Context**
   ```bash
   # Run context optimizer
   npm run context:optimize
   ```

### GitHub Copilot Setup

1. **Configure Workspace**
   ```json
   // Add to .vscode/settings.json
   {
     "github.copilot.enable": {
       "*": true,
       "yaml": false,
       "markdown": true
     }
   }
   ```

2. **Set Include/Exclude Patterns**
   - Copilot reads `.aiignore` automatically
   - Additional excludes in VS Code settings

## Context Optimization

### Understanding .aiignore

The `.aiignore` file controls what AI tools can see:

```bash
# Always exclude these
node_modules/
dist/
build/
coverage/
*.log
.env*
!.env.example

# Large files that waste context
*.mp4
*.zip
*.pdf
```

### Context Window Optimal Practices

1. **Keep Context Focused**
   - Only include files relevant to current task
   - Use keyboard shortcuts to add/remove files
   - Clear context between different features

2. **Use Documentation Index**
   - Reference `DOCS_INDEX.md` for quick navigation
   - AI tools can parse this to find relevant docs

3. **Leverage Project Rules**
   - `CLAUDE.md` is your source of truth
   - Reference it when AI behavior seems incorrect

## Keyboard Shortcuts

### Essential AI Shortcuts

```json
// Add to keybindings.json
[
  {
    "key": "cmd+shift+c",
    "command": "projectTemplate.loadContext",
    "when": "editorTextFocus"
  },
  {
    "key": "cmd+shift+r", 
    "command": "projectTemplate.refreshContext",
    "when": "editorTextFocus"
  },
  {
    "key": "cmd+shift+a",
    "command": "aiAssistant.explainCode",
    "when": "editorTextFocus"
  },
  {
    "key": "cmd+shift+t",
    "command": "aiAssistant.generateTests",
    "when": "editorTextFocus"
  }
]
```

## Common Setup Issues

### Issue: AI Creates Duplicate Files

**Solution**: Ensure enforcement is active
```bash
npm run enforcement:status
# Should show: "File naming enforcement: ACTIVE"
```

### Issue: AI Ignores Project Rules

**Solution**: Verify CLAUDE.md is loaded
- Cursor: Check .cursorrules exists
- Claude Code: Run `claude-code context`
- Copilot: Restart VS Code

### Issue: Context Window Too Large

**Solution**: Optimize with .aiignore
```bash
# Check what's included
npm run context:analyze

# Add large files to .aiignore
echo "*.generated.ts" >> .aiignore
```

### Issue: AI Suggests Bad Patterns

**Solution**: Reference existing code
- Always paste examples of good patterns
- Use component generators: `npm run g:c`
- Point to similar files in prompts

## Optimal Prompting Strategies

### 1. Include File Paths
```text
Bad: "Update the login function"
Good: "Update login function in src/auth/login.ts:45-67"
```

### 2. Reference Patterns
```text
Bad: "Create a new component"
Good: "Create component following pattern in src/components/Button/"
```

### 3. Specify Constraints
```text
Bad: "Add error handling"
Good: "Add error handling using pattern from src/utils/error-handler.ts"
```

## Verification Checklist

**Quick verification** (30 seconds):
```bash
npm run setup:verify-ai
```

**Manual verification** after setup:

- [ ] `npm run setup:verify-ai` passes all checks
- [ ] `.cursorrules` or AI config exists in project root
- [ ] `.aiignore` excludes large/irrelevant files
- [ ] VS Code shows ProjectTemplate extension active
- [ ] Test: `npm run g:c TestComponent` generates files successfully
- [ ] Test: Ask AI about project rules (should reference CLAUDE.md)

**Success checkpoint**: ✅ Verification script shows "AI setup verification PASSED!"

## Next Steps

1. Read `CLAUDE.md` for complete project rules
2. Try component generator: `npm run g:c TestComponent`
3. Use `npm run validate:docs` to check documentation
4. Explore `DOCS_INDEX.md` for all available documentation

## Troubleshooting

For additional help:
- Check `docs/guides/ai-development/` for more guides
- Run `npm run debug:snapshot` for diagnostic info
- See `FRICTION-MAPPING.md` for common issues