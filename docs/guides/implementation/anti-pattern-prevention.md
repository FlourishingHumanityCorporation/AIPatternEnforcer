# Anti-Pattern Prevention Implementation Guide

**Stop AI hallucinations and "almost correct" code before they reach your codebase.**

## Overview

This guide implements concrete patterns to prevent AI-generated anti-patterns, hallucinations, and subtle bugs from
entering your codebase. Setup time: 10-15 minutes.

## Table of Contents

1. [Quick Setup](#quick-setup)
2. [Hallucination Prevention](#hallucination-prevention)
3. [Almost-Correct Code Detection](#almost-correct-code-detection)
4. [Validation Patterns](#validation-patterns)
5. [Integration Workflow](#integration-workflow)
6. [Troubleshooting](#troubleshooting)

## Quick Setup

```bash
# 1. Enable strict validation
npm run enforcement:config set-level STRICT

# 2. Configure AI context rules
cp ai/config/anti-patterns.rules .cursorrules.append

# 3. Set up validation hooks
npm run setup:validation-hooks

# 4. Test the setup
npm run validate:ai-patterns
```

## Hallucination Prevention

### Problem: AI Invents Non-Existent APIs

**Solution**: API existence validation in real-time.

```javascript
// ai/prompts/templates/api-validation.md
Before using ANY external API or library function:
1. VERIFY it exists in package.json dependencies
2. CHECK the actual import path in node_modules
3. REFERENCE the official documentation
4. USE ONLY documented methods

NEVER assume an API exists. Always verify first.
```

### Implementation in `.cursorrules`

```markdown
# API Hallucination Prevention

FORBIDDEN patterns that indicate hallucination:
- import { someMethod } from 'package/submodule' (without verification)
- Assuming methods exist on objects without checking types
- Creating "helper" functions that duplicate existing utilities

REQUIRED for every external API usage:
1. Show the import statement from an existing file, OR
2. Verify the method exists in @types/* definition, OR  
3. Reference official documentation with version number
```

### Enforcement Script

```javascript
// tools/enforcement/api-validator.js
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const path = require('path');

function validateImports(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  });

  const errors = [];
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      const packageName = source.split('/')[0];
      
      // Check if package exists
      if (!source.startsWith('.') && !source.startsWith('@types/')) {
        if (!allDeps[packageName]) {
          errors.push({
            line: path.node.loc.start.line,
            message: `Import from unknown package: ${packageName}`,
            fix: `Add ${packageName} to package.json or use correct package name`
          });
        }
      }
    }
  });

  return errors;
}

module.exports = { validateImports };
```

## Almost-Correct Code Detection

### Problem: Subtle Bugs in Generated Code

**Solution**: Pattern-based detection of common AI mistakes.

```javascript
// tools/enforcement/almost-correct-detector.js
const commonMistakes = [
  {
    pattern: /setState\([\s\S]*?\)[\s\S]*?state\./,
    message: 'Potential state mutation detected after setState',
    fix: 'Use functional setState: setState(prev => ({ ...prev, value }))'
  },
  {
    pattern: /\.map\([^)]+\)(?!\.filter|\.reduce|\.join|;|\))/,
    message: 'Array.map used without consuming the result',
    fix: 'Use forEach for side effects, or consume the map result'
  },
  {
    pattern: /async\s+\([^)]*\)\s*=>\s*{[^}]*}(?!.*await)/,
    message: 'Async function without await',
    fix: 'Remove async keyword or add await to async operations'
  },
  {
    pattern: /catch\s*\([^)]*\)\s*{\s*}/,
    message: 'Empty catch block swallows errors',
    fix: 'Log errors or handle them appropriately'
  }
];

function detectAlmostCorrect(code) {
  const issues = [];
  
  commonMistakes.forEach(({ pattern, message, fix }) => {
    const matches = code.matchAll(new RegExp(pattern, 'g'));
    for (const match of matches) {
      const lines = code.substring(0, match.index).split('\n');
      issues.push({
        line: lines.length,
        message,
        fix,
        severity: 'warning'
      });
    }
  });
  
  return issues;
}
```

## Validation Patterns

### Pre-Generation Validation

```typescript
// ai/validators/pre-generation.ts
interface ValidationRule {
  name: string;
  check: (context: GenerationContext) => ValidationResult;
}

const preGenerationRules: ValidationRule[] = [
  {
    name: 'import-exists',
    check: (context) => {
      // Verify all imports in context exist
      const imports = extractImports(context.existingCode);
      const missing = imports.filter(imp => !packageExists(imp));
      return {
        valid: missing.length === 0,
        errors: missing.map(imp => `Unknown import: ${imp}`)
      };
    }
  },
  {
    name: 'no-duplicate-functionality',
    check: (context) => {
      // Check if similar function already exists
      const similar = findSimilarFunctions(context.newFunction);
      return {
        valid: similar.length === 0,
        warnings: similar.map(fn => `Similar function exists: ${fn}`)
      };
    }
  }
];
```

### Post-Generation Validation

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run anti-pattern detection
npm run check:ai-patterns

# Check for hallucinated imports
npm run check:imports

# Validate almost-correct patterns
npm run check:almost-correct

# If any checks fail, block commit
if [ $? -ne 0 ]; then
  echo "❌ AI-generated anti-patterns detected. Please fix before committing."
  exit 1
fi
```

## Integration Workflow

### 1. IDE Integration

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.validateAIPatterns": true
  },
  "aiPatternValidation.enable": true,
  "aiPatternValidation.severity": "warning"
}
```

### 2. CI/CD Pipeline

```yaml
# .github/workflows/ai-validation.yml
name: AI Pattern Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run check:ai-patterns
      - run: npm run check:imports
      - run: npm run check:almost-correct
```

### 3. Real-time Feedback

```javascript
// tools/watchers/ai-pattern-watcher.js
const chokidar = require('chokidar');
const { validateImports } = require('../enforcement/api-validator');
const { detectAlmostCorrect } = require('../enforcement/almost-correct-detector');

const watcher = chokidar.watch('src/**/*.{js,jsx,ts,tsx}', {
  ignored: /node_modules/,
  persistent: true
});

watcher.on('change', async (path) => {
  console.log(`Checking ${path} for AI patterns...`);
  
  const importErrors = await validateImports(path);
  const patternIssues = await detectAlmostCorrect(path);
  
  if (importErrors.length || patternIssues.length) {
    console.log('\n⚠️  AI Pattern Issues Detected:');
    [...importErrors, ...patternIssues].forEach(issue => {
      console.log(`  Line ${issue.line}: ${issue.message}`);
      console.log(`  Fix: ${issue.fix}\n`);
    });
  }
});
```

## Troubleshooting

### Common Issues

**Issue**: Too many false positives  
**Solution**: Tune patterns in `almost-correct-detector.js`

```javascript
// Add exceptions for your codebase
const exceptions = {
  'setState-pattern': ['src/legacy/*'],
  'map-without-return': ['src/utils/logger.js']
};
```

**Issue**: Validation too slow  
**Solution**: Run in parallel with caching

```javascript
// tools/enforcement/cached-validator.js
const cache = new Map();

async function validateWithCache(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const hash = crypto.createHash('md5').update(content).digest('hex');
  
  if (cache.has(hash)) {
    return cache.get(hash);
  }
  
  const result = await validate(filePath);
  cache.set(hash, result);
  return result;
}
```

## Verification

Run these commands to verify your setup:

```bash
# Test hallucination prevention
npm run test:ai-hallucination

# Test almost-correct detection  
npm run test:almost-correct

# Run full validation suite
npm run validate:ai-patterns
```

Expected output:
```text
✅ API validation: No hallucinated imports found
✅ Pattern detection: 0 almost-correct patterns
✅ Pre-commit hooks: Configured and active
```

## Next Steps

1. Review detected patterns weekly: `npm run report:ai-patterns`
2. Add custom patterns: Edit `tools/enforcement/custom-patterns.js`
3. Share patterns with team: `npm run share:ai-patterns`

---

**Remember**: This system prevents bad AI code from entering your codebase, but it doesn't replace code review. Always
verify AI-generated code makes sense in your application context.