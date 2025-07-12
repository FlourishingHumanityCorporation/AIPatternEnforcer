# Check Imports Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Import Validation Rules](#import-validation-rules)
5. [Pattern Detection System](#pattern-detection-system)
6. [Usage Examples](#usage-examples)
7. [Output and Results](#output-and-results)
8. [Integration with Development Workflow](#integration-with-development-workflow)
9. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
10. [API and Programmatic Usage](#api-and-programmatic-usage)
11. [Development and Contributing](#development-and-contributing)

## Overview

Advanced import statement validator that enforces consistent import patterns across JavaScript/TypeScript projects.
Detects problematic imports, prevents circular dependencies, enforces relative import usage, and maintains clean import
hygiene according to ProjectTemplate standards.

**Tool Type**: Import Statement Validator  
**Language**: JavaScript (Node.js)  
**Dependencies**: `fs`, `path`, `chalk`, `glob`, `enforcement-config`  
**Location**: `tools/enforcement/check-imports.js`

## Quick Start

```bash
# Check all project files for import violations
node tools/enforcement/check-imports.js

# Check specific files
node tools/enforcement/check-imports.js src/components/App.tsx src/utils/helpers.js

# Integration with enforcement system
npm run check:imports
```

## Installation and Setup

### Prerequisites
- Node.js 16+ required
- ProjectTemplate enforcement system
- Chalk for colorized output
- Glob for file pattern matching

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # Installs chalk, glob, and other dependencies
```

### Configuration Integration
Works with enforcement-config.js:
```javascript
const config = {
  checks: {
    imports: {
      enabled: true,
      enforcementLevel: 'FULL', // 'FULL', 'WARNING', 'DISABLED'
      ignorePatterns: [
        'node_modules/**',
        'examples/**',
        'tools/generators/**'
      ]
    }
  }
};
```

## Import Validation Rules

### Absolute Import Detection
**Purpose**: Enforce relative imports for project files  
**Rule**: Project files should use relative imports (`./`, `../`)  
**Allowed**: Library imports (`react`, `lodash`, `@types/node`)

```javascript
// ❌ Problematic
import { Component } from 'src/components/Component';

// ✅ Correct
import { Component } from '../components/Component';
import React from 'react'; // Library imports allowed
```

### Wildcard Import Control
**Purpose**: Prevent unclear wildcard imports  
**Rule**: Import specific items instead of `import * as`  
**Exceptions**: Allowed for specific libraries and file types

```javascript
// ❌ Problematic (in most cases)
import * as utils from './utils';

// ✅ Correct
import { formatDate, parseData } from './utils';

// ✅ Allowed exceptions
import * as React from 'react';
import * as path from 'path';
import * as vscode from 'vscode'; // VS Code extensions
```

### Problematic Default Imports
**Purpose**: Catch incorrect default import usage  
**Libraries checked**: React, Lodash, others

```javascript
// ❌ Problematic
import React from 'react'; // React doesn't have default export

// ✅ Correct
import * as React from 'react';

// ❌ Problematic
import lodash from 'lodash';

// ✅ Correct
import * as _ from 'lodash';
import { map, filter } from 'lodash';
```

### Banned Imports and Patterns
**Purpose**: Prevent usage of discouraged APIs  
**Categories**: Sync APIs, console usage, unsafe patterns

```javascript
// ❌ Banned
import fs from 'fs';
console.log('debug info');

// ✅ Correct
import { promises as fs } from 'fs';
import { projectLogger } from './utils/logger';
projectLogger.info('debug info');
```

### Circular Dependency Prevention
**Purpose**: Detect potential circular dependencies  
**Rule**: Limit parent directory traversals (`../`)

```javascript
// ❌ Potential circular dependency
import { utils } from '../../../shared/utils';

// ✅ Better structure
import { utils } from '@/shared/utils'; // Path alias
import { utils } from './local-utils'; // Local utility
```

## Pattern Detection System

### Import Pattern Definitions
```javascript
const importPatterns = {
  // Absolute imports (non-library)
  absoluteImports: /from\s+['"](?![@./])[^'"]+['"]/g,
  
  // Wildcard imports
  wildcardImports: /import\s+\*\s+as\s+\w+\s+from/g,
  
  // Problematic defaults
  problematicDefaults: [
    {
      pattern: /import\s+React\s+from\s+['"]react['"]/,
      correct: "import * as React from 'react'"
    }
  ],
  
  // Banned patterns
  bannedImports: [
    {
      pattern: /import.*from\s+['"]fs['"]/,
      message: "Use fs/promises instead of fs"
    }
  ],
  
  // Deep parent imports
  parentImports: /from\s+['"]\.\.[\/\.].*['"]/g
};
```

### Context-Aware Validation
The tool applies different rules based on file location:

#### Source Files (`/src/`, `/components/`)
- Strict relative import enforcement
- Absolute imports flagged as violations
- Library imports allowed

#### Tool Files (`/tools/`, `/scripts/`)
- Relaxed wildcard import rules
- Console usage allowed for dev tools
- Direct fs access permitted

#### Test Files (`/test/`, `/__tests__/`)
- Testing framework patterns allowed
- Console usage permitted for test output

#### Extension Files (`/extensions/`)
- VS Code specific patterns allowed
- Platform API wildcards permitted

## Usage Examples

### Example 1: Clean Project Validation
```bash
node tools/enforcement/check-imports.js

# Output:
✅ All imports are valid!

# Silent success - no violations found
```

### Example 2: Import Violations Found
```bash
node tools/enforcement/check-imports.js

# Output:
❌ Found import violations:

Absolute Import:
  src/components/App.tsx:5
    Issue: from 'src/utils/helpers'
    Fix: Use relative imports for project files

Wildcard Import:
  src/services/api.ts:12
    Issue: import * as utils from './utils'
    Fix: Import specific items instead of using wildcard

Problematic Default Import:
  src/components/Header.tsx:1
    Issue: import React from 'react'
    Fix: import * as React from 'react'

Banned Import/Usage:
  src/utils/fileHandler.ts:3
    Issue: import fs from 'fs'
    Fix: Use fs/promises instead of fs for async operations

📚 Import Optimal Practices:
  - Use relative imports for project files
  - Import specific functions/components
  - Use path aliases (@/) for deep imports
  - Avoid circular dependencies

🚫 Commit blocked due to import violations.
💡 To change enforcement level: npm run enforcement:config set-level WARNING
```

### Example 3: Warning Mode (Non-blocking)
```bash
# With enforcement level set to WARNING
node tools/enforcement/check-imports.js

# Output:
⚠️  Import warnings:

Wildcard Import:
  src/components/Dashboard.tsx:8
    Issue: import * as Icons from './icons'
    Fix: Import specific items instead of using wildcard

⏩ Commit proceeding with warnings.
💡 To fix issues: Follow suggestions above
💡 To block on violations: npm run enforcement:config set-level FULL
```

### Example 4: Specific File Validation
```bash
node tools/enforcement/check-imports.js src/components/App.tsx

# Output:
❌ Found import violations:

Absolute Import:
  src/components/App.tsx:5
    Issue: from 'src/utils/helpers'
    Fix: Use relative imports for project files
```

### Example 5: Tool Files (Allowed Patterns)
```bash
node tools/enforcement/check-imports.js tools/generators/component-generator.js

# Output:
✅ All imports are valid!

# Tool files have relaxed rules:
# - Wildcard imports allowed
# - Console usage permitted
# - Direct fs access allowed
```

## Output and Results

### Success Cases
- **Silent Success**: No violations found, minimal output
- **Clean Status**: Green checkmark with validation summary

### Violation Reports
- **Grouped by Type**: Violations organized by category
- **File Context**: Exact file and line number
- **Clear Fixes**: Specific suggestions for each violation
- **Optimal Practices**: Educational guidance included

### Enforcement Levels
- **FULL**: Blocks commits on any violations
- **WARNING**: Allows commits with warnings
- **DISABLED**: Validation skipped entirely

### Exit Codes
- `0`: All imports valid or warnings only
- `1`: Violations found and enforcement level blocks

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "check:imports": "node tools/enforcement/check-imports.js",
    "lint:imports": "node tools/enforcement/check-imports.js",
    "validate:imports": "node tools/enforcement/check-imports.js"
  }
}
```

### Pre-commit Hook Integration
```bash
# In .husky/pre-commit
npm run check:imports

# Or direct execution
node tools/enforcement/check-imports.js

# With file filtering
git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$' | xargs node
tools/enforcement/check-imports.js
```

### CI/CD Integration
```yaml
# GitHub Actions workflow
- name: Validate Import Statements
  run: |
    node tools/enforcement/check-imports.js
    
- name: Import Hygiene Check
  run: |
    npm run check:imports
```

### IDE Integration
```json
// VS Code tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Check Imports",
      "type": "shell",
      "command": "npm run check:imports",
      "group": "build",
      "problemMatcher": {
        "pattern": {
          "regexp": "^\\s*(.*?):(\\d+)$",
          "file": 1,
          "line": 2
        }
      }
    }
  ]
}
```

### ESLint Integration
Use alongside ESLint for comprehensive import checking:
```json
// .eslintrc.json
{
  "rules": {
    "import/no-relative-parent-imports": "error",
    "import/no-unresolved": "error"
  },
  "overrides": [
    {
      "files": ["tools/**", "scripts/**"],
      "rules": {
        "import/no-nodejs-modules": "off"
      }
    }
  ]
}
```

## Error Handling and Troubleshooting

### Common Issues

#### False Positives in Tool Files
```text
Banned Import/Usage:
  tools/generator.js:5
    Issue: console.log('Generating...')
```
**Cause**: Tool files legitimately use console for output  
**Solution**: Tool files are automatically exempted from console rules

#### Path Alias Confusion
```text
Absolute Import:
  src/components/App.tsx:3
    Issue: from '@/utils/helpers'
```
**Cause**: Path alias (`@/`) detected as absolute import  
**Solution**: Path aliases starting with `@/` are automatically allowed

#### Library vs Project Import Confusion
```text
Absolute Import:
  src/utils/api.ts:1
    Issue: from 'axios'
```
**Cause**: Library imports incorrectly flagged  
**Solution**: Library imports (no slashes, no dots) are automatically allowed

### Debug Mode
Enable detailed logging:
```bash
# Add debug output
DEBUG=check-imports node tools/enforcement/check-imports.js

# Or modify the script temporarily
console.log('Checking file:', filePath);
console.log('Content preview:', content.substring(0, 200));
```

### Pattern Testing
Test specific patterns:
```javascript
// Test pattern matching
const pattern = /from\s+['"](?![@./])[^'"]+['"]/g;
const testString = `import { Component } from 'src/components/Component'`;
console.log('Matches:', testString.match(pattern));
```

## API and Programmatic Usage

### Basic Usage
```javascript
const { checkImports } = require('./tools/enforcement/check-imports');

// Check all files
await checkImports();

// Check specific files
await checkImports(['src/components/App.tsx', 'src/utils/helpers.js']);
```

### Custom Integration
```javascript
const fs = require('fs');
const { checkImports } = require('./tools/enforcement/check-imports');

// Pre-commit hook integration
async function validateStagedFiles() {
  const { execSync } = require('child_process');
  
  // Get staged files
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM')
    .toString()
    .split('\n')
    .filter(file => file.endsWith('.js') || file.endsWith('.ts'));
  
  if (stagedFiles.length > 0) {
    try {
      await checkImports(stagedFiles);
      console.log('✅ Import validation passed');
      return true;
    } catch (error) {
      console.error('❌ Import validation failed');
      return false;
    }
  }
  
  return true;
}

// Usage in git hook
validateStagedFiles().then(success => {
  if (!success) {
    process.exit(1);
  }
});
```

### Batch Project Validation
```javascript
const path = require('path');

// Validate multiple projects
async function validateProjects(projectPaths) {
  const results = {};
  
  for (const projectPath of projectPaths) {
    console.log(`Validating imports in ${projectPath}...`);
    
    const originalCwd = process.cwd();
    process.chdir(projectPath);
    
    try {
      await checkImports();
      results[projectPath] = { status: 'pass' };
    } catch (error) {
      results[projectPath] = { 
        status: 'fail', 
        error: error.message 
      };
    } finally {
      process.chdir(originalCwd);
    }
  }
  
  return results;
}

// Usage
const projects = ['./frontend', './backend', './shared'];
const results = await validateProjects(projects);
console.log('Validation results:', results);
```

### Custom Pattern Extension
```javascript
// Extend with custom patterns
const customPatterns = {
  // Custom banned imports
  customBanned: [
    {
      pattern: /import.*from\s+['"]moment['"]/,
      message: "Use date-fns instead of moment.js"
    }
  ],
  
  // Custom allowed wildcards
  customWildcards: ['customLibrary', 'internalFramework']
};

// Modify the patterns in your fork
const originalPatterns = require('./tools/enforcement/check-imports.js');
// Add custom validation logic
```

## Development and Contributing

### Project Structure
```text
tools/enforcement/check-imports.js
├── Import pattern definitions
├── File checking logic (checkFile function)
├── Context-aware rule application
├── Violation reporting and formatting
├── CLI interface and argument handling
└── Integration with enforcement-config
```

### Adding New Import Rules
1. **Define the pattern**:
```javascript
const newPattern = {
  pattern: /your-regex-here/g,
  message: "Your helpful error message",
  suggestion: "How to fix this issue"
};
```

2. **Add to pattern collection**:
```javascript
const importPatterns = {
  // ... existing patterns
  newPatternType: [newPattern]
};
```

3. **Implement checking logic**:
```javascript
// In checkFile function
content.match(importPatterns.newPatternType).forEach(match => {
  violations.push({
    type: "New Pattern Type",
    file: filePath,
    line: lineNum,
    issue: match,
    suggestion: newPattern.suggestion
  });
});
```

### Testing Guidelines
```bash
# Test with sample files
mkdir test-imports
echo "import React from 'react'" > test-imports/test.js
node tools/enforcement/check-imports.js test-imports/test.js

# Test pattern matching
node -e "
const pattern = /import\s+React\s+from\s+['\"']react['\"']/;
console.log('Match:', 'import React from \"react\"'.match(pattern));
"

# Test enforcement levels
npm run enforcement:config set-level WARNING
node tools/enforcement/check-imports.js
```

### Performance Considerations
- Uses `glob.sync()` for file discovery (could be async for large projects)
- Processes files sequentially (could be parallelized)
- Regex matching on full file content (could be line-by-line for memory efficiency)
- No caching (could cache results for unchanged files)

### Optimal Practices for Extensions
- **Context Awareness**: Consider file location when applying rules
- **Performance**: Minimize regex complexity for large codebases
- **Clarity**: Provide specific, actionable error messages
- **Flexibility**: Allow exemptions for legitimate use cases

## Related Tools and Documentation

- **enforcement-config.js**: Central enforcement configuration system
- **documentation-style.js**: Documentation style validation
- **config-enforcer**: Configuration file validation
- **ESLint Integration**: Use with import/export plugins
- **Import Guidelines**: docs/guides/development/import-patterns.md
- **Code Style Guide**: docs/guides/development/style-guide.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines