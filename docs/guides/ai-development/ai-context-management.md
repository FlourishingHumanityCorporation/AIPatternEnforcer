# AI Context Management Guide

This guide explains how to use the advanced AI context management features in ProjectTemplate to solve common problems
when developing with AI assistants.

## Table of Contents

1. [🎯 The Problems These Tools Solve](#-the-problems-these-tools-solve)
  2. [1. Context Window Overflow](#1-context-window-overflow)
  3. [2. Documentation Duplication](#2-documentation-duplication)
  4. [3. Lost Context Between Sessions](#3-lost-context-between-sessions)
5. [🛠️ The Solutions](#-the-solutions)
  6. [1. AI Focus Mode (`npm run ai:focus`)](#1-ai-focus-mode-npm-run-aifocus)
    7. [Basic Usage](#basic-usage)
    8. [How It Works](#how-it-works)
    9. [Example Workflow](#example-workflow)
10. [2. Unified Documentation Compiler (`npm run docs:compile`)](#2-unified-documentation-compiler-npm-run-docscompile)
    11. [Setup](#setup)
  12. [Error Response Format](#error-response-format)
  13. [Success Response](#success-response)
  14. [3. AI Context Annotations (`npm run ai:parse`)](#3-ai-context-annotations-npm-run-aiparse)
    15. [Available Annotations](#available-annotations)
    16. [Parse and Generate Context Files](#parse-and-generate-context-files)
    17. [Using Generated Contexts](#using-generated-contexts)
18. [📋 Complete Workflow Example](#-complete-workflow-example)
  19. [1. Starting a New Feature](#1-starting-a-new-feature)
  20. [2. Add Context Annotations While Coding](#2-add-context-annotations-while-coding)
  21. [3. Document Patterns for AI and Humans](#3-document-patterns-for-ai-and-humans)
  22. [Notification Interface](#notification-interface)
  23. [4. Compile and Parse](#4-compile-and-parse)
24. [🚀 Optimal Practices](#-optimal-practices)
  25. [1. Branch-Based Context Switching](#1-branch-based-context-switching)
  26. [2. Regular Context Updates](#2-regular-context-updates)
  27. [3. Context Naming Conventions](#3-context-naming-conventions)
  28. [4. Annotation Guidelines](#4-annotation-guidelines)
29. [🔍 Troubleshooting](#-troubleshooting)
  30. [AI Still Seeing Too Many Files](#ai-still-seeing-too-many-files)
  31. [Context Not Found](#context-not-found)
  32. [Documentation Not Compiling](#documentation-not-compiling)
33. [📚 Next Steps](#-next-steps)

## 🎯 The Problems These Tools Solve

### 1. Context Window Overflow

As projects grow, AI assistants can't see all your code at once. This leads to:

- Inconsistent suggestions
- Missing important context
- Repeated explanations
- Lower quality AI assistance

### 2. Documentation Duplication

Maintaining separate docs for humans and AI tools creates:

- Sync issues
- Outdated AI rules
- Maintenance burden
- Inconsistent information

### 3. Lost Context Between Sessions

Having to re-explain your project context repeatedly causes:

- Time waste
- Inconsistent AI responses
- Frustration
- Lower productivity

## 🛠️ The Solutions

### 1. AI Focus Mode (`npm run ai:focus`)

Dynamically manage what files AI can see based on your current task.

#### Basic Usage

```bash
# Focus on a specific feature
npm run ai:focus payment-integration

# Auto-detect from git branch
npm run ai:focus --auto

# Show current focus status
npm run ai:focus --show

# List available contexts
npm run ai:focus --list

# Clear focus (restore original .aiignore)
npm run ai:focus --clear
```

#### How It Works

1. **Analyzes your codebase** to find files related to the feature
2. **Creates a focused .aiignore** that excludes unrelated files
3. **Tracks what AI has seen** in `.ai-context/.focus-cache`
4. **Preserves your original .aiignore** as backup

#### Example Workflow

```bash
# Working on user authentication
git checkout -b feature/auth-system
npm run ai:focus --auto  # Auto-detects 'auth-system'

# AI now only sees auth-related files
# Work with your AI assistant...

# Switch to payment feature
git checkout -b feature/payment-flow
npm run ai:focus --auto  # Switches context to 'payment-flow'

# Done for the day
npm run ai:focus --clear  # Restore original context
```

### 2. Unified Documentation Compiler (`npm run docs:compile`)

Write documentation once, compile it for humans, AI assistants, and IDEs.

#### Setup

1. Create unified docs in `docs/unified/`:

````markdown
---meta: title = API Documentation---
---

meta: description = Our API patterns and rules---

---human---

# API Documentation

This describes our REST API design patterns.

---ai-rule---
Always use RESTful naming: GET /users, POST /users

---ai-pattern---

### Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}
```text
````

---ai-example---

### Success Response

```json
{
  "success": true,
  "data": {...}
}
```

---ai-context: http-methods---
Use proper HTTP verbs for each operation

````

2. Compile documentation:

```bash
npm run docs:compile     # One-time compilation
npm run docs:watch      # Watch mode for development
````

3. Outputs generated:
   - `.cursorrules` - Cursor IDE rules
   - `CLAUDE.md` sections - Appended AI rules
   - `docs/compiled/` - Human-readable docs
   - `.vscode/project.code-snippets` - IDE snippets

### 3. AI Context Annotations (`npm run ai:parse`)

Add context directly in your code that AI assistants can understand.

#### Available Annotations

```javascript
// @ai-context: payment-processing
// This entire section handles payment processing logic

// @ai-previous: docs/decisions/payment-provider.md
// We chose Stripe based on the decision documented above

// @ai-pattern: repository-pattern
class PaymentRepository {
  // Implementation following repository pattern
}

// @ai-important
// Critical: This must run before processing payments
validatePaymentMethod();

// @ai-ignore
// Legacy code - AI should not suggest changes here
function oldPaymentHandler() {
  // ...
}
// @ai-ignore-end
```

#### Parse and Generate Context Files

```bash
npm run ai:parse
```

This will:

- Scan all source files for annotations
- Generate context files in `.ai-context/parsed/`
- Create VS Code snippets for annotations
- Produce a summary report

#### Using Generated Contexts

After parsing, focus on discovered contexts:

```bash
# See what contexts were found
npm run ai:focus --list

# Focus on payment processing context
npm run ai:focus payment-processing
```

## 📋 Complete Workflow Example

Here's how to use all three tools together:

### 1. Starting a New Feature

```bash
# Create feature branch
git checkout -b feature/user-notifications

# Auto-focus AI context
npm run ai:focus --auto
```

### 2. Add Context Annotations While Coding

```typescript
// @ai-context: user-notifications
// @ai-previous: docs/decisions/notification-architecture.md

// @ai-pattern: observer-pattern
export class NotificationService {
  // @ai-important
  // Must handle both email and push notifications
  async send(notification: Notification) {
    // Implementation
  }
}
```

### 3. Document Patterns for AI and Humans

Create `docs/unified/notification-patterns.md`:

````markdown
---meta: title = Notification Patterns---

---

human---

# Notification System

How we handle user notifications...

---ai-rule---
Always use the NotificationService for sending notifications

---ai-pattern---

### Notification Interface

```typescript
interface Notification {
  type: "email" | "push" | "sms";
  recipient: string;
  content: NotificationContent;
}
```text
````

````

### 4. Compile and Parse

```bash
# Compile documentation
npm run docs:compile

# Parse code annotations
npm run ai:parse

# Update focus with new context
npm run ai:focus user-notifications
````

## 🚀 Optimal Practices

### 1. Branch-Based Context Switching

```bash
# In your git hooks or shell config
alias gco='git checkout $1 && npm run ai:focus --auto'
```

### 2. Regular Context Updates

```bash
# Weekly or after major changes
npm run ai:parse
npm run docs:compile
```

### 3. Context Naming Conventions

- Use kebab-case: `payment-integration`, `user-auth`
- Match feature branch names when possible
- Be specific but not too granular

### 4. Annotation Guidelines

- Add `@ai-context` at the start of major features
- Use `@ai-previous` to reference decisions
- Mark critical sections with `@ai-important`
- Hide legacy code with `@ai-ignore` blocks

## 🔍 Troubleshooting

### AI Still Seeing Too Many Files

1. Check current focus: `npm run ai:focus --show`
2. Review `.aiignore` contents
3. Run with more specific context name
4. Check relevance scoring in `.ai-context/[feature].context`

### Context Not Found

1. Ensure annotations are in supported file types
2. Check for typos in context names
3. Run `npm run ai:parse` to update
4. Look in `.ai-context/summary.md` for discovered contexts

### Documentation Not Compiling

1. Check syntax in `docs/unified/` files
2. Ensure section markers are on their own lines
3. Look for unclosed code blocks
4. Check console output for specific errors

## 📚 Next Steps

1. Start with `npm run ai:focus --auto` on your current branch
2. Add a few `@ai-context` annotations to your code
3. Create one unified doc for your main patterns
4. Gradually expand usage as you see benefits

These tools fundamentally change how AI assistants understand your codebase, making them exponentially more effective as
your project grows.
