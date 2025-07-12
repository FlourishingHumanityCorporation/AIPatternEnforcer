# Context Reinforcement Template

## Table of Contents

1. [Purpose](#purpose)
2. [Reinforcement Structure](#reinforcement-structure)
  3. [Project Context Reminder](#project-context-reminder)
  4. [Architecture Patterns (MANDATORY)](#architecture-patterns-mandatory)
  5. [Code Style Rules (NON-NEGOTIABLE)](#code-style-rules-non-negotiable)
  6. [Current Task Context](#current-task-context)
  7. [Examples to Follow](#examples-to-follow)
  8. [Verification Checklist](#verification-checklist)
9. [Usage Instructions](#usage-instructions)

## Purpose

Use this template when AI starts forgetting project conventions or generating inconsistent code.

## Reinforcement Structure

### Project Context Reminder

I'm working on [PROJECT NAME]. Here are the CRITICAL conventions you must follow:

### Architecture Patterns (MANDATORY)

- State Management: We use [Zustand/Redux/Context] - NEVER use [alternatives]
- API Layer: All API calls go through `@services/api/` - NO direct fetch()
- Component Structure: Follow @docs/architecture/patterns/component-structure.md
- Error Handling: Use AppError from @lib/errors - NO generic Error

### Code Style Rules (NON-NEGOTIABLE)

```typescript
// ALWAYS use:
import { projectLogger } from "@/lib/logger";
projectLogger.info("message", { context });

// NEVER use:
console.log("message");
```

### Current Task Context

Working on: [FEATURE/FILE]
Related files:

- @[path/to/current/file]
- @[path/to/related/files]

### Examples to Follow

Good pattern example: @ai/examples/good-patterns/[relevant-pattern]/
What NOT to do: @ai/examples/anti-patterns/[relevant-antipattern]/

### Verification Checklist

Before generating code, confirm you will:

- [ ] Use projectLogger instead of console.log
- [ ] Follow the established state management pattern
- [ ] Use existing utilities from @lib/
- [ ] Match the code style in surrounding files
- [ ] Include proper TypeScript types
- [ ] Handle errors with AppError

## Usage Instructions

1. Fill in the bracketed sections with your project specifics
2. Paste this before your actual request
3. Reference specific files with @ notation
4. Include recent code that shows the correct patterns
