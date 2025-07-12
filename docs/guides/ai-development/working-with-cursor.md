# Working with Cursor IDE

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Key Features](#key-features)
  4. [1. Context Awareness](#1-context-awareness)
  5. [2. AI Commands](#2-ai-commands)
  6. [3. Optimal Practices](#3-optimal-practices)
7. [Common Workflows](#common-workflows)
  8. [Creating New Features](#creating-new-features)
  9. [Debugging](#debugging)
  10. [Refactoring](#refactoring)
11. [Tips and Tricks](#tips-and-tricks)

## Overview

Cursor is an AI-first IDE that enhances development productivity. This guide covers optimal practices for using Cursor
effectively in this project.

## Setup

1. **Install Cursor**: Download from [cursor.sh](https://cursor.sh)
2. **Open Project**: `cursor .` from project root
3. **Verify .cursorrules**: Check that `.cursorrules` is loaded (visible in file tree)

## Key Features

### 1. Context Awareness

Cursor uses `.cursorrules` to understand project conventions:

```bash
# Reference specific files
@docs/architecture/patterns/error-handling.md

# Reference directories
@src/features/

# Reference multiple files
@{config/typescript/tsconfig.json,package.json}
```

### 2. AI Commands

- **Ctrl+K**: Quick edits in current file
- **Ctrl+L**: Chat with full codebase context
- **Ctrl+Shift+L**: Generate from description

### 3. Optimal Practices

1. **Use Specific References**

   ```
   "Update the user service following @docs/architecture/patterns/data-fetching.md"
   ```

2. **Provide Examples**

   ```
   "Create a new component like @src/components/Button/Button.tsx"
   ```

3. **Be Explicit About Requirements**
   ```
   "Add error handling that logs to projectLogger and returns AppError"
   ```

## Common Workflows

### Creating New Features

1. Reference feature template: `@templates/feature/`
2. Specify patterns to follow: `@docs/architecture/patterns/`
3. Include test requirements: "with tests following @examples/good-patterns/testing/"

### Debugging

1. Paste error message
2. Reference relevant files with @
3. Ask for analysis following `@ai/prompts/debugging/error-analysis.md`

### Refactoring

1. Select code to refactor
2. Reference target pattern: `@docs/architecture/patterns/`
3. Request incremental changes

## Tips and Tricks

- Use `.cursorrules` to set project-wide AI behavior
- Keep chat sessions focused on single topics
- Save useful prompts to `@ai/prompts/`
- Review AI suggestions against `@ai/examples/anti-patterns/`
