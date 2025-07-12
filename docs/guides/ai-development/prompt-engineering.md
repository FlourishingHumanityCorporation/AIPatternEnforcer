[← Back to Documentation](../../README.md) | [↑ Up to AI Development](../README.md)

---

# Prompt Engineering Guide

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
  3. [1. Be Specific and Explicit](#1-be-specific-and-explicit)
  4. [2. Provide Context](#2-provide-context)
  5. [3. Set Constraints](#3-set-constraints)
6. [Prompt Templates](#prompt-templates)
  7. [Feature Implementation](#feature-implementation)
  8. [Bug Fixing](#bug-fixing)
  9. [Code Review](#code-review)
10. [Advanced Techniques](#advanced-techniques)
  11. [1. Chain of Thought](#1-chain-of-thought)
  12. [2. Few-Shot Examples](#2-few-shot-examples)
  13. [3. Negative Examples](#3-negative-examples)
  14. [4. Role Assignment](#4-role-assignment)
15. [Common Patterns](#common-patterns)
  16. [API Endpoint Creation](#api-endpoint-creation)
  17. [Component Generation](#component-generation)
  18. [Database Migration](#database-migration)
19. [Debugging Prompts](#debugging-prompts)
  20. [Performance Investigation](#performance-investigation)
  21. [Error Analysis](#error-analysis)
22. [Tips for Better Results](#tips-for-better-results)
  23. [DO:](#do)
  24. [DON'T:](#dont)
25. [Prompt Iteration](#prompt-iteration)
26. [Saving Effective Prompts](#saving-effective-prompts)
27. [Measuring Prompt Effectiveness](#measuring-prompt-effectiveness)

## Overview

Effective prompt engineering is crucial for getting high-quality, consistent outputs from AI tools. This guide covers
optimal practices for crafting prompts that produce reliable results.

## Core Principles

### 1. Be Specific and Explicit

```text
❌ Bad: "Fix the bug"
✅ Good: "Fix the null pointer exception in UserService.getProfile() when user.email is undefined"
```

### 2. Provide Context

```javascript
❌ Bad: "Write a function to validate email"
✅ Good: "Write a TypeScript function to validate email addresses following RFC 5322 spec, returning {valid: boolean,
error?: string}"
```

### 3. Set Constraints

```text
❌ Bad: "Optimize this code"
✅ Good: "Optimize this code for readability while maintaining O(n) time complexity. Use existing lodash utilities where
appropriate."
```

## Prompt Templates

### Feature Implementation

```markdown
Context: Working on [PROJECT] using [TECH STACK]
Task: Implement [FEATURE NAME]
Requirements:

- [Requirement 1]
- [Requirement 2]
  Constraints:
- Follow patterns in @[file/path]
- Use existing utilities from @lib/
- Include comprehensive error handling
- Add TypeScript types
```

### Bug Fixing

```markdown
Bug: [Description]
File: @[path/to/file]
Error: [Error message/stack trace]
Expected: [What should happen]
Context: [Recent changes or related info]
Fix requirements:

- Minimal changes
- Preserve existing functionality
- Add test to prevent regression
```

### Code Review

```markdown
Review this code for:

1. Security vulnerabilities
2. Performance issues
3. Code style violations per @.eslintrc
4. Missing error handling
5. Incomplete TypeScript types

File: @[path/to/file]
Focus area: [Specific concerns]
```

## Advanced Techniques

### 1. Chain of Thought

Encourage step-by-step reasoning:

```text
"Let's approach this step-by-step:
1. First, analyze the current implementation
2. Identify the root cause
3. Design the solution
4. Implement with tests"
```

### 2. Few-Shot Examples

Provide examples of desired output:

```text
"Create a React component following this pattern:
Example: @components/Button/Button.tsx
Requirements: [specific requirements]"
```

### 3. Negative Examples

Show what NOT to do:

```text
"Refactor this code.
DO NOT:
- Use any or unknown types
- Remove existing error handling
- Change the public API"
```

### 4. Role Assignment

Set a specific perspective:

```typescript
"You are a senior TypeScript developer focused on type safety and performance. Review this code and suggest
improvements."
```

## Common Patterns

### API Endpoint Creation

```markdown
Create a REST endpoint:

- Method: POST
- Path: /api/users/:id/profile
- Body: UpdateProfileDto
- Response: UserProfile
- Auth: Required (JWT)
- Validation: Use class-validator
- Error handling: Follow @lib/errors/AppError
```

### Component Generation

```markdown
Create a React component:

- Name: UserProfileCard
- Props: {user: User, onEdit?: () => void}
- Features: Loading state, error boundary
- Styling: CSS modules
- Tests: Unit tests with RTL
- Story: Storybook story with variants
```

### Database Migration

```markdown
Create a migration to:

- Add table: user_preferences
- Columns: id (uuid), user_id (fk), theme, notifications_enabled
- Indexes: user_id (unique)
- Use: Knex.js migration format
```

## Debugging Prompts

### Performance Investigation

```markdown
Analyze performance issue:

- Symptom: [What's slow]
- Metrics: [Current timing]
- Context: @[relevant files]
  Find:

1. Bottlenecks
2. N+1 queries
3. Unnecessary re-renders
4. Memory leaks
```

### Error Analysis

```markdown
Debug this error:
```

[Full error stack]

```text
Environment: [Dev/Prod]
Recent changes: [What changed]
Analyze:
1. Root cause
2. Why it happens now
3. Fix approach
4. Prevention strategy
```

## Tips for Better Results

### DO:

- ✅ Include file paths with @ notation
- ✅ Specify exact line numbers when relevant
- ✅ Mention coding standards to follow
- ✅ Request tests with implementation
- ✅ Set clear success criteria

### DON'T:

- ❌ Use vague terms like "improve" or "fix"
- ❌ Assume AI knows your conventions
- ❌ Request multiple unrelated tasks
- ❌ Forget to specify language/framework versions
- ❌ Omit error handling requirements

## Prompt Iteration

When results aren't ideal:

1. **Add Constraints**: "Also ensure the solution handles edge case X"
2. **Provide Examples**: "Similar to how @existing/file handles this"
3. **Clarify Requirements**: "By 'optimize' I mean reduce bundle size, not runtime"
4. **Break Down Tasks**: Split complex prompts into smaller, focused ones

## Saving Effective Prompts

When you find a prompt that works well:

1. Save it to `ai/prompts/library/`
2. Document what makes it effective
3. Share with team
4. Use as template for similar tasks

## Measuring Prompt Effectiveness

Track these metrics:

- First-try success rate
- Number of iterations needed
- Code review changes required
- Time saved vs manual coding

Remember: Good prompts are an investment. Time spent crafting clear prompts pays off in better outputs and fewer
iterations.
