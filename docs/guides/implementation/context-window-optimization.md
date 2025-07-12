# Context Window Optimization Implementation Guide

**Friction Point**: AI forgets project conventions, context window fills with irrelevant information  
**Solution**: Persistent system prompts, contextual re-injection, focused context curation  
**Implementation Time**: 10-15 minutes

## Table of Contents

1. [Quick Implementation](#quick-implementation)
2. [Step-by-Step Implementation](#step-by-step-implementation)
  3. [1. Set Up Persistent Rules (5 min)](#1-set-up-persistent-rules-5-min)
  4. [2. Configure Context Filtering (3 min)](#2-configure-context-filtering-3-min)
  5. [3. Implement Context Re-injection (5 min)](#3-implement-context-re-injection-5-min)
  6. [4. Verify Implementation (2 min)](#4-verify-implementation-2-min)
7. [Advanced Optimization](#advanced-optimization)
  8. [Custom Context Rules](#custom-context-rules)
  9. [Session-Specific Context](#session-specific-context)
10. [Troubleshooting](#troubleshooting)
11. [Integration with Existing Projects](#integration-with-existing-projects)
  12. [Minimal Integration](#minimal-integration)
  13. [Full Integration](#full-integration)
14. [Related Solutions](#related-solutions)
15. [Performance Impact](#performance-impact)

## Quick Implementation

```bash
# 1. Copy AI configurations
cp ai/config/.cursorrules .cursorrules
cp .aiignore.example .aiignore

# 2. Test context optimization
npm run context

# 3. Verify setup
npm run setup:verify-ai
```

## Step-by-Step Implementation

### 1. Set Up Persistent Rules (5 min)

**For Cursor Users:**
```bash
# Copy persistent rules to project root
cp ai/config/.cursorrules .cursorrules

# Verify Cursor loads rules automatically
# Settings → Features → Chat → "Include .cursorrules file in each chat" ✓
```

**For Claude Code Users:**
```bash
# Claude Code automatically reads CLAUDE.md
# Verify with context command
npm run context
```

**For GitHub Copilot Users:**
```bash
# Copy Copilot configuration
cp ai/config/.copilot .copilot

# Restart VS Code to load configuration
```

### 2. Configure Context Filtering (3 min)

**Edit .aiignore to exclude irrelevant files:**
```bash
# Large generated files
node_modules/
dist/
coverage/
*.generated.*

# Documentation not needed for coding
docs/plans/
docs/reports/
*.md

# Test files when focusing on implementation
**/*.test.*
**/*.spec.*
```

**Test context optimization:**
```bash
# Before optimization - see current context size
npm run context -- --analyze

# After optimization - verify reduction
npm run context -- --analyze
```

### 3. Implement Context Re-injection (5 min)

**Create context reinforcement prompts:**
```bash
# Use existing reinforcement templates
ls ai/prompts/context-reinforcement.md

# Or create custom reinforcement
echo "Project uses: TypeScript, React, Vite, Testing Library" > .ai-context
```

**Set up intelligent context management:**
```bash
# Use context optimizer script
npm run context:optimize

# Capture debug context when needed
npm run debug:snapshot
```

### 4. Verify Implementation (2 min)

**Test context persistence:**
```bash
# 1. Run context command
npm run context

# 2. Generate component to test AI memory
npm run g:c TestContextComponent

# 3. Verify AI follows project patterns
npm run validate
```

**Success indicators:**
- ✅ AI generates code matching project patterns
- ✅ Context window stays under token limits
- ✅ AI remembers coding standards across sessions

## Advanced Optimization

### Custom Context Rules

**Edit ai/config/context-rules.json:**
```json
{
  "maxTokens": 4000,
  "priorityFiles": [
    "CLAUDE.md",
    "package.json",
    "tsconfig.json"
  ],
  "excludePatterns": [
    "*.log",
    "*.cache",
    "node_modules/**"
  ]
}
```

### Session-Specific Context

**Load context for specific work:**
```bash
# Focus on specific component
npm run context -- src/components/UserProfile/

# Load debugging context
npm run debug:snapshot

# Export context for sharing
npm run context -- --export context.md
```

## Troubleshooting

**Issue**: AI still forgets project rules  
**Solution**: Verify .cursorrules is in project root and Cursor setting is enabled

**Issue**: Context window still too large  
**Solution**: Add more exclusions to .aiignore, focus on specific directories

**Issue**: Context optimization script fails  
**Solution**: Check node version >= 18, npm install, verify file permissions

## Integration with Existing Projects

### Minimal Integration
```bash
# Just copy essential files
cp ai/config/.cursorrules .cursorrules
cp .aiignore.example .aiignore
```

### Full Integration
```bash
# Copy complete context management system
cp -r ai/config/ .
cp -r scripts/dev/ scripts/
npm install # for context management dependencies
```

## Related Solutions

- [Code Generation Quality Issues](code-generation-quality.md) - Improve AI output consistency
- [Debugging AI Code](debugging-ai-code.md) - Systematic debugging when context fails
- [Security Vulnerability Prevention](security-vulnerability-prevention.md) - Context patterns for secure code

## Performance Impact

**Before optimization:**
- Context window: 8000+ tokens
- AI accuracy: ~60% project pattern compliance
- Setup time per session: 5-10 minutes

**After optimization:**
- Context window: 3000-4000 tokens  
- AI accuracy: ~90% project pattern compliance
- Setup time per session: 0 minutes (automatic)