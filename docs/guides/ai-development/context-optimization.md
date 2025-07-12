# AI Context Optimization Guide

This guide shows how to optimize AI tool context for effective code generation and assistance. Proper context management
reduces AI confusion and improves code quality.

## Table of Contents

1. [Quick Start](#quick-start)
  2. [1. Check Current Context Size](#1-check-current-context-size)
  3. [2. Basic .aiignore Setup](#2-basic-aiignore-setup)
  4. [3. Test Context Quality](#3-test-context-quality)
5. [Understanding .aiignore](#understanding-aiignore)
  6. [File Priority (Exclude First)](#file-priority-exclude-first)
  7. [Template .aiignore](#template-aiignore)
8. [Advanced Context Strategies](#advanced-context-strategies)
  9. [1. Context Window Management](#1-context-window-management)
  10. [2. Smart File Selection](#2-smart-file-selection)
  11. [3. Context by Development Phase](#3-context-by-development-phase)
12. [Context Quality Checklist](#context-quality-checklist)
  13. [✅ Good Context Indicators](#-good-context-indicators)
  14. [❌ Poor Context Indicators](#-poor-context-indicators)
15. [ProjectTemplate-Specific Optimizations](#projecttemplate-specific-optimizations)
  16. [1. Documentation Focus](#1-documentation-focus)
  17. [2. Component Development](#2-component-development)
  18. [3. Enforcement System Work](#3-enforcement-system-work)
19. [Dynamic Context Loading](#dynamic-context-loading)
  20. [Script-Based Context Control](#script-based-context-control)
21. [Common Context Issues](#common-context-issues)
  22. [Issue: AI Creates Duplicate Files](#issue-ai-creates-duplicate-files)
  23. [Issue: AI Suggests Wrong Patterns](#issue-ai-suggests-wrong-patterns)
  24. [Issue: Context Too Large](#issue-context-too-large)
  25. [Issue: AI Doesn't Know Project Rules](#issue-ai-doesnt-know-project-rules)
26. [Monitoring Context Health](#monitoring-context-health)
  27. [Context Analysis Script](#context-analysis-script)
  28. [NPM Script Integration](#npm-script-integration)
29. [Optimal Practices Summary](#optimal-practices-summary)
30. [Related Resources](#related-resources)

## Quick Start

### 1. Check Current Context Size
```bash
# Analyze what AI tools can see
npm run context:analyze

# Check .aiignore effectiveness
find . -type f -name "*.ts" -o -name "*.js" | wc -l
find . -type f -name "*.ts" -o -name "*.js" | grep -v -f .aiignore | wc -l
```

### 2. Basic .aiignore Setup
```bash
# Copy the optimized .aiignore template
cp .aiignore.example .aiignore

# Or start with basics
cat > .aiignore << 'EOF'
node_modules/
dist/
build/
coverage/
*.log
.env*
!.env.example
EOF
```

### 3. Test Context Quality
```bash
# Load context and check for issues
npm run context:load

# Validate documentation links
npm run validate:docs
```

## Understanding .aiignore

The `.aiignore` file controls what files AI tools can see. Unlike `.gitignore`, this affects AI comprehension directly.

### File Priority (Exclude First)

1. **Large Binary Files** (waste context tokens)
2. **Generated Code** (confuses patterns)
3. **Dependencies** (not your code)
4. **Build Artifacts** (temporary)
5. **Logs & Cache** (not relevant for code)

### Template .aiignore

```bash
# === DEPENDENCIES ===
node_modules/
.pnp/
.pnp.js
vendor/
__pycache__/
*.pyc
.gradle/
target/

# === BUILD OUTPUTS ===
dist/
build/
out/
.next/
.nuxt/
*.tsbuildinfo

# === LOGS & CACHE ===
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm/
.yarn-integrity
.cache/

# === ENVIRONMENT & SECRETS ===
.env*
!.env.example
.envrc
*.pem
*.key
id_rsa*

# === TESTING & COVERAGE ===
coverage/
.nyc_output/
.coverage/
htmlcov/
.pytest_cache/
test-results/

# === LARGE ASSETS ===
*.mp4
*.mov
*.avi
*.zip
*.tar.gz
*.pdf
*.docx
*.xlsx

# === OS & EDITOR ===
.DS_Store
Thumbs.db
*.swp
*.swo
*~
.vscode/settings.json

# === GENERATED FILES ===
*.generated.ts
*.generated.js
*.d.ts.map
*.js.map

# === AI CONTEXT POLLUTION ===
# Files that confuse AI about your patterns
node_modules/@types/
*.min.js
*.bundle.js
dist/types/
```

## Advanced Context Strategies

### 1. Context Window Management

**Small Projects (< 50 files)**:
- Include most source files
- Exclude only dependencies and builds
- Focus on clear file organization

**Medium Projects (50-200 files)**:
- Use feature-based exclusions
- Include only relevant modules
- Exclude test files unless debugging tests

**Large Projects (200+ files)**:
- Include only current feature area
- Use strict exclusions
- Leverage AI tool's "focused context" modes

### 2. Smart File Selection

```bash
# Include patterns (in .aiignore, use ! prefix)
!src/components/**/*.tsx     # Keep React components
!src/hooks/**/*.ts          # Keep custom hooks  
!src/types/**/*.ts          # Keep type definitions
!*.config.js                # Keep config files
!docs/**/*.md               # Keep documentation

# Exclude anti-patterns
src/**/*.test.ts            # Exclude tests (unless needed)
src/**/*.stories.ts         # Exclude Storybook stories
src/**/*.spec.ts           # Exclude specs
```

### 3. Context by Development Phase

**Initial Setup**:
```bash
# Minimal context for project structure
src/
docs/
package.json
README.md
CLAUDE.md
```

**Feature Development**:
```bash
# Include related feature files only
src/features/auth/
src/components/forms/
src/types/api.ts
docs/api/auth.md
```

**Debugging**:
```bash
# Include error-related files
src/utils/error-handler.ts
src/services/api-client.ts
logs/error.log
src/**/*.test.ts  # Now include tests
```

**Refactoring**:
```bash
# Include architectural files
src/
docs/architecture/
*.config.js
package.json
```

## Context Quality Checklist

### Good Context Indicators

- AI suggests appropriate existing patterns
- Generated code follows project conventions
- AI references correct file paths
- Suggestions align with project architecture
- Import statements use existing utilities

### ❌ Poor Context Indicators

- AI creates duplicate functionality
- Generated code doesn't match style
- AI suggests wrong frameworks/libraries
- Imports reference non-existent modules
- Code doesn't follow established patterns

## ProjectTemplate-Specific Optimizations

### 1. Documentation Focus

```bash
# .aiignore for documentation work
# Exclude everything except docs
src/
tests/
tools/
scripts/
node_modules/

# Include only docs
!docs/
!CLAUDE.md
!README.md
!*.md
```

### 2. Component Development

```bash
# .aiignore for component work
tools/generators/
tests/enforcement/
docs/ClaudeCode_official/

# Keep component-related files
!src/components/
!templates/component/
!src/types/
!src/styles/
```

### 3. Enforcement System Work

```bash
# .aiignore for enforcement development
docs/
starters/
extensions/

# Keep enforcement files
!tools/enforcement/
!tests/enforcement/
!scripts/testing/
!.enforcement-config.json
```

## Dynamic Context Loading

### Script-Based Context Control

Create `scripts/dev/context-loader.js`:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load context based on current task
const task = process.argv[2];

const contextMaps = {
  'components': [
    'src/components/',
    'templates/component/',
    'src/types/',
    'src/styles/'
  ],
  'docs': [
    'docs/',
    '*.md',
    'CLAUDE.md'
  ],
  'testing': [
    'tests/',
    'src/**/*.test.ts',
    'docs/testing/',
    'scripts/testing/'
  ]
};

function updateAiIgnore(includePatterns) {
  const base = fs.readFileSync('.aiignore.base', 'utf8');
  const includes = includePatterns.map(p => `!${p}`).join('\n');
  
  fs.writeFileSync('.aiignore', `${base}\n\n# Dynamic includes\n${includes}`);
}

if (contextMaps[task]) {
  updateAiIgnore(contextMaps[task]);
  console.log(`Context loaded for: ${task}`);
} else {
  console.log('Available contexts:', Object.keys(contextMaps).join(', '));
}
```

Usage:
```bash
npm run context:load components  # Focus on component development
npm run context:load docs       # Focus on documentation
npm run context:load testing    # Focus on testing
```

## Common Context Issues

### Issue: AI Creates Duplicate Files

**Cause**: Existing files not visible to AI
**Solution**: Check .aiignore doesn't exclude relevant source files

```bash
# Debug: See what files AI can access
find . -type f -name "*.ts" | grep -v -f .aiignore
```

### Issue: AI Suggests Wrong Patterns

**Cause**: AI sees inconsistent or old code examples
**Solution**: Exclude outdated examples, include canonical patterns

```bash
# Add to .aiignore
src/legacy/
examples/old/
*.deprecated.*
```

### Issue: Context Too Large

**Cause**: Too many files included, hitting token limits
**Solution**: Use focused context for current task

```bash
# Temporary focused context
echo "src/" >> .aiignore.temp
echo "!src/features/current-feature/" >> .aiignore.temp
cp .aiignore.temp .aiignore
```

### Issue: AI Doesn't Know Project Rules

**Cause**: CLAUDE.md not accessible or too buried
**Solution**: Ensure AI instructions are always included

```bash
# Always include in .aiignore
!CLAUDE.md
!README.md
!docs/README.md
```

## Monitoring Context Health

### Context Analysis Script

```bash
#!/bin/bash
# scripts/dev/analyze-context.sh

echo "📊 AI Context Analysis"
echo "======================"

TOTAL_FILES=$(find . -type f -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" | wc -l)
VISIBLE_FILES=$(find . -type f -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" | grep -v -f .aiignore |
wc -l)
TOTAL_SIZE=$(find . -type f -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" -exec wc -c {} + | tail -1 |
awk '{print $1}')
VISIBLE_SIZE=$(find . -type f -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" | grep -v -f .aiignore |
xargs wc -c | tail -1 | awk '{print $1}')

echo "Total files: $TOTAL_FILES"
echo "Visible to AI: $VISIBLE_FILES"
echo "Reduction: $(((TOTAL_FILES - VISIBLE_FILES) * 100 / TOTAL_FILES))%"
echo ""
echo "Total size: $TOTAL_SIZE bytes"
echo "Visible size: $VISIBLE_SIZE bytes"
echo "Size reduction: $(((TOTAL_SIZE - VISIBLE_SIZE) * 100 / TOTAL_SIZE))%"

# Check for common issues
echo ""
echo "🔍 Checking for common issues:"

if grep -q "node_modules" .aiignore; then
  echo "✅ node_modules excluded"
else
  echo "❌ node_modules not excluded - add to .aiignore"
fi

if grep -q "dist/" .aiignore; then
  echo "✅ Build outputs excluded"
else
  echo "❌ Build outputs not excluded - add dist/, build/ to .aiignore"
fi

if [ -f "CLAUDE.md" ] && ! grep -q "CLAUDE.md" .aiignore; then
  echo "✅ CLAUDE.md visible to AI"
else
  echo "❌ CLAUDE.md not visible - ensure !CLAUDE.md in .aiignore"
fi
```

### NPM Script Integration

Add to package.json:
```json
{
  "scripts": {
    "context:analyze": "./scripts/dev/analyze-context.sh",
    "context:load": "node scripts/dev/context-loader.js",
    "context:optimize": "./scripts/dev/context-optimizer.sh"
  }
}
```

## Optimal Practices Summary

1. **Start Restrictive**: Exclude everything, then include needed files
2. **Task-Focused**: Different .aiignore for different development phases  
3. **Monitor Size**: Keep visible files under 100-200 for optimal AI performance
4. **Include Docs**: Always ensure CLAUDE.md and key docs are visible
5. **Exclude Generated**: Never include auto-generated or compiled files
6. **Test Impact**: Verify AI suggestions improve after context changes

## Related Resources

- [AI Assistant Setup Guide](ai-assistant-setup.md) - Initial AI tool configuration
- [CLAUDE.md](../../../CLAUDE.md) - Complete project rules for AI
- [DOCS_INDEX.md](../../../DOCS_INDEX.md) - All available documentation