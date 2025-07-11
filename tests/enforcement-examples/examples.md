# Enforcement Examples

This directory contains examples of files that violate ProjectTemplate rules to demonstrate the enforcement system.

## Running the Test

```bash
cd tests/enforcement-examples
./test-enforcement.sh
```

## Manual Testing

### 1. Test File Naming Violations

Create files with bad names:

```bash
touch component_improved.js
touch utils_v2.ts
touch service_final_FIXED.js
```

Then run:

```bash
npm run check:no-improved-files
```

Expected: Should detect all violations and suggest better names.

### 2. Test Import Violations

Create a file with import issues:

```javascript
// bad-imports.js
import React from "react"; // Should be: import * as React from 'react'
import lodash from "lodash"; // Should import specific functions
console.log("Using console"); // Should use projectLogger
```

Then run:

```bash
npm run check:imports
```

Expected: Should detect all import and console usage violations.

### 3. Test Documentation Violations

Create a markdown file with issues:

```markdown
# We're Excited to Announce This Amazing Feature!

As of December 2024, we've successfully implemented the perfect solution!

## COMPLETE

This feature is DONE and READY!
```

Then run:

```bash
npm run check:documentation-style
```

Expected: Should detect banned phrases and status announcements.

## Pre-commit Hook Testing

With git hooks installed:

```bash
# Create a bad file
echo "console.log('test')" > test_improved.js

# Try to commit it
git add test_improved.js
git commit -m "test: checking hooks"
```

Expected: Pre-commit hook should block the commit.

## VS Code Extension Testing

1. Install the extension from `extensions/projecttemplate-assistant`
2. Create a file named `component_improved.tsx`
3. Expected: Should see a warning notification with rename option

## Context Loading Testing

```bash
# Load context for a specific file
npm run context -- src/index.js

# Load general project context
npm run context

# Save context to file
npm run context -- -o context.md
```

## Integration Testing

The complete workflow:

1. **Setup**: `npm run setup:hooks`
2. **Develop**: Create/edit files with VS Code extension active
3. **Check**: Files are validated in real-time
4. **Commit**: Pre-commit hooks enforce all rules
5. **Context**: Load intelligent context for AI assistance
