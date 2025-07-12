# What Should Be in `claude.md`

## Table of Contents

1. [Overview](#overview)
2. [Structure and Content](#structure-and-content)
3. [Critical Project Information](#critical-project-information)
4. [Absolute Rules (NEVER VIOLATE)](#absolute-rules-never-violate)
5. [Architecture Patterns](#architecture-patterns)
  6. [Feature Structure](#feature-structure)
  7. [Component Patterns](#component-patterns)
  8. [Error Handling Pattern](#error-handling-pattern)
  9. [State Management Pattern](#state-management-pattern)
10. [Code Style Guidelines](#code-style-guidelines)
  11. [Naming Conventions](#naming-conventions)
  12. [Import Order](#import-order)
13. [Testing Requirements](#testing-requirements)
  14. [Test Coverage Minimums](#test-coverage-minimums)
  15. [Test Pattern](#test-pattern)
16. [Performance Guidelines](#performance-guidelines)
17. [Security Checklist](#security-checklist)
18. [API Design Standards](#api-design-standards)
  19. [Endpoint Naming](#endpoint-naming)
  20. [Response Format](#response-format)
21. [Common Tasks](#common-tasks)
  22. [Adding a New Feature](#adding-a-new-feature)
  23. [Updating Dependencies](#updating-dependencies)
  24. [Debugging Production Issues](#debugging-production-issues)
25. [External Integrations](#external-integrations)
  26. [Stripe](#stripe)
  27. [SendGrid](#sendgrid)
  28. [PostgreSQL](#postgresql)
29. [Forbidden Patterns (NEVER USE)](#forbidden-patterns-never-use)
30. [Current Sprint Context](#current-sprint-context)
31. [Quick Reference](#quick-reference)
  32. [Key Files](#key-files)
  33. [Key Commands](#key-commands)
  34. [Team Conventions](#team-conventions)
35. [When You're Unsure](#when-youre-unsure)
36. [Optimal Practices for `claude.md`](#optimal-practices-for-claudemd)
  37. [1. **Keep It Updated**](#1-keep-it-updated)
  38. [2. **Be Specific**](#2-be-specific)
  39. [3. **Include Examples**](#3-include-examples)
  40. [4. **Prioritize Information**](#4-prioritize-information)
  41. [5. **Use Clear Sections**](#5-use-clear-sections)
  42. [6. **Make It Scannable**](#6-make-it-scannable)
  43. [7. **Test It**](#7-test-it)
44. [Version Control Tips](#version-control-tips)
  45. [Track Changes](#track-changes)
  46. [Team Contributions](#team-contributions)
47. [Recently Added Rules (2024-11-15)](#recently-added-rules-2024-11-15)
  48. [API Response Caching](#api-response-caching)
49. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
  50. [1. **Too Vague**](#1-too-vague)
  51. [2. **Too Long**](#2-too-long)
  52. [3. **Contradictory Rules**](#3-contradictory-rules)
  53. [4. **Outdated Information**](#4-outdated-information)
54. [Measuring Effectiveness](#measuring-effectiveness)
55. [Living Document Philosophy](#living-document-philosophy)
56. [Changelog](#changelog)
  57. [2024-11-15](#2024-11-15)
  58. [2024-11-01](#2024-11-01)

## Overview

The `claude.md` file (or `.cursorrules` for Cursor) is your **persistent AI context** - the critical information that
gets loaded into every AI conversation. Think of it as your AI team member's onboarding document that they read before
every single task.

## Structure and Content

Here's a comprehensive `claude.md` template with explanations:

```markdown
# Project Context for AI Assistant

You are working on [PROJECT_NAME], a [TYPE OF APPLICATION] built with [TECH STACK].

## Critical Project Information

- **Project Type**: [e.g., B2B SaaS, E-commerce, Internal Tool]
- **Primary Users**: [e.g., Software developers, Business analysts]
- **Performance Requirements**: [e.g., <100ms API response, <3s page load]
- **Scale**: [e.g., 10K daily active users, 1M records]
- **Environment**: [e.g., AWS, Vercel, Self-hosted]

## Absolute Rules (NEVER VIOLATE)

1. **TypeScript**: Use strict mode. No `any` types except in specific migration files
2. **Security**: All user input must be validated using `zod` schemas
3. **Logging**: Use `projectLogger`, NEVER use `console.log`
4. **State Management**: Use Zustand exclusively - no Redux, Context API, or MobX
5. **Async Operations**: Always include error handling and loading states
6. **API Calls**: Use the typed `apiClient` from `@/lib/api` - never use raw fetch
7. **Authentication**: All routes must check auth using `requireAuth()` middleware
8. **Database**: Only access through Prisma client, never raw SQL
9. **Secrets**: Never hardcode - use environment variables with `env.` prefix
10. **File Uploads**: Maximum 10MB, only through `uploadService`

## Architecture Patterns

### Feature Structure

Every feature MUST follow this structure:
```

src/features/[feature-name]/
├── api/ # API routes (if applicable)
├── components/ # Feature-specific components
├── hooks/ # Feature-specific hooks
├── stores/ # Zustand stores
├── types/ # TypeScript types
├── utils/ # Feature utilities
└── index.ts # Public exports

````

### Component Patterns
```typescript
// ALWAYS use this pattern for components
export const ComponentName: FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Hooks at the top
  // Early returns for edge cases
  // Event handlers as const functions
  // Single return statement
};
````

### Error Handling Pattern

```typescript
// ALWAYS wrap async operations like this
try {
  setLoading(true);
  const result = await apiCall();
  setData(result);
} catch (error) {
  projectLogger.error("Operation failed", { error, context });
  showToast({ type: "error", message: getUserMessage(error) });
} finally {
  setLoading(false);
}
```

### State Management Pattern

```typescript
// Zustand stores MUST follow this pattern
export const useFeatureStore = create<FeatureState>()((set, get) => ({
  // State
  data: null,
  loading: false,
  error: null,

  // Actions (always async)
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient.feature.getData();
      set({ data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));
```

## Code Style Guidelines

### Naming Conventions

- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useUserData`)
- **Types**: PascalCase with suffix (e.g., `UserProfileProps`, `ApiResponse`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`)
- **Functions**: camelCase, verb+noun (e.g., `fetchUserData`)

### Import Order

```typescript
// 1. React/Next
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. External libraries
import { z } from "zod";
import { format } from "date-fns";

// 3. Internal absolute imports
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks";

// 4. Relative imports
import { LocalComponent } from "./components";
import type { LocalType } from "./types";
```

## Testing Requirements

### Test Coverage Minimums

- **Components**: Render + user interaction tests
- **Hooks**: All state changes and edge cases
- **API Routes**: Success + all error cases
- **Utils**: All branches and edge cases

### Test Pattern

```typescript
describe("ComponentName", () => {
  it("should render with required props", () => {});
  it("should handle user interaction", () => {});
  it("should display loading state", () => {});
  it("should handle errors gracefully", () => {});
});
```

## Performance Guidelines

1. **Images**: Use Next.js Image component with proper sizing
2. **Bundle Size**: Keep chunks under 200KB
3. **Queries**: Include pagination for lists over 50 items
4. **Caching**: Use React Query with 5-minute stale time
5. **Renders**: Memoize expensive computations with useMemo

## Security Checklist

Before implementing any feature involving user data:

- [ ] Input validation with Zod schema
- [ ] Output encoding for XSS prevention
- [ ] CSRF protection on state-changing operations
- [ ] Rate limiting on API endpoints
- [ ] Authorization checks at every level
- [ ] Audit logging for sensitive operations

## API Design Standards

### Endpoint Naming

- RESTful conventions: `/api/[resource]/[id]/[action]`
- Plural resource names: `/api/users` not `/api/user`
- Nested resources when logical: `/api/users/[id]/posts`

### Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly message",
    "details": { ... }
  }
}
```

## Common Tasks

### Adding a New Feature

1. Run: `npm run generate:feature [feature-name]`
2. Follow the generated structure
3. Add feature to router
4. Add to main navigation if user-facing
5. Document in `/docs/features/[feature-name].md`

### Updating Dependencies

1. Never update React/Next major versions without discussion
2. Run security audit after any update
3. Test all critical paths after updating
4. Update `docs/references/dependencies/current-versions.md`

### Debugging Production Issues

1. Check logs in [LOGGING_PLATFORM]
2. Use correlation ID to trace requests
3. Check error tracking in [ERROR_TRACKING_TOOL]
4. Follow runbook in `/docs/runbooks/debugging-production.md`

## External Integrations

### Stripe

- Use SDK v14.x
- Always use idempotency keys
- Test mode in development
- Webhook signature verification required

### SendGrid

- Use templates, not inline HTML
- Rate limit: 100 emails/second
- Always include unsubscribe link

### PostgreSQL

- Connection pooling enabled
- Maximum 20 connections
- 30-second query timeout
- Use read replicas for reports

## Forbidden Patterns (NEVER USE)

1. **Direct DOM manipulation** - Use React state
2. **Inline styles** - Use CSS modules or Tailwind
3. **Hardcoded URLs** - Use environment variables
4. **Synchronous file operations** - Always async
5. **Unhandled promises** - Always catch errors
6. **Global variables** - Use stores or context
7. **document/window in SSR** - Check `typeof window`
8. **Race conditions** - Use proper state management
9. **SQL string concatenation** - Use parameterized queries
10. **Plain text passwords** - Always hash with bcrypt

## Current Sprint Context

[This section updated each sprint]

- **Sprint Goal**: Implement user authentication
- **Key Features**: Login, Register, Password Reset
- **Blocked By**: Waiting for email service setup
- **Tech Debt**: Refactor old auth system in `/legacy`

## Quick Reference

### Key Files

- Environment Config: `src/config/env.ts`
- API Client: `src/lib/api/client.ts`
- Auth Context: `src/contexts/auth.tsx`
- Global Types: `src/types/global.d.ts`
- Test Utils: `src/test/utils.tsx`

### Key Commands

- `npm run dev` - Start development
- `npm run test:watch` - Run tests in watch mode
- `npm run type-check` - TypeScript validation
- `npm run lint:fix` - Auto-fix linting issues
- `npm run build:analyze` - Bundle size analysis

### Team Conventions

- PR reviews required from 1 person
- Squash merge to main
- Deploy to staging first
- Feature flags for big changes
- Changelog updates required

## When You're Unsure

1. Check existing patterns in `src/features/` for examples
2. Refer to `docs/architecture/patterns/` for detailed guides
3. Look at `ai/examples/good-patterns/` for approved approaches
4. If still unsure, ask for clarification before implementing

Remember: It's better to ask for clarification than to introduce patterns that don't match the project's architecture.

````

## Optimal Practices for `claude.md`

### 1. **Keep It Updated**
- Review and update after each sprint
- Add new patterns as they're established
- Remove outdated information
- Update the "Current Sprint Context" section

### 2. **Be Specific**
```markdown
# Bad
Use proper error handling

# Good
Always wrap async operations in try/catch with loading states and user-friendly error messages using the pattern shown
in "Error Handling Pattern" section
````

### 3. **Include Examples**

```markdown
# Bad

Follow our component structure

# Good

Components must follow this exact structure:
export const ComponentName: FC<Props> = ({ prop1 }) => {
// hooks
// handlers
// return JSX
};
```

### 4. **Prioritize Information**

Put the most important rules at the top. AI attention can decay in very long documents.

### 5. **Use Clear Sections**

- Critical rules that should never be broken
- Common patterns for everyday tasks
- Reference information for occasional lookup
- Current context that changes frequently

### 6. **Make It Scannable**

Use headers, bullet points, and code blocks to make information easy to find.

### 7. **Test It**

Periodically test if the AI follows your rules:

```text
"Generate a new component for user settings"
```

Then check if it follows all your patterns.

## Version Control Tips

### Track Changes

```bash
# See how your AI rules evolved
git log -p ai/claude.md

# See who added specific rules
git blame ai/claude.md
```

### Team Contributions

Encourage team members to add rules when they notice AI mistakes:

```markdown
## Recently Added Rules (2024-11-15)

### API Response Caching

The AI was not adding cache headers. Now it must:

- Add `Cache-Control` headers to all GET endpoints
- Use 5-minute cache for list endpoints
- No cache for user-specific data
```

## Anti-Patterns to Avoid

### 1. **Too Vague**

```markdown
# Bad

Write good code

# Good

Follow TypeScript strict mode, use Zod for validation, handle all error cases
```

### 2. **Too Long**

If your `claude.md` is over 500 lines, consider:

- Moving detailed examples to separate files
- Creating category-specific rule files
- Keeping only the most critical rules

### 3. **Contradictory Rules**

Review regularly to ensure rules don't conflict with each other.

### 4. **Outdated Information**

```markdown
# Bad (if you've moved to React 18)

Use React 17 class components

# Good

Use React 18 functional components with hooks
```

## Measuring Effectiveness

Track if your `claude.md` is working:

1. **Rule Violations**: How often does AI break your rules?
2. **Clarification Requests**: How often do you need to correct the AI?
3. **Pattern Consistency**: Is generated code consistent?
4. **Team Satisfaction**: Do developers trust AI output?

## Living Document Philosophy

Your `claude.md` should evolve based on:

- Common AI mistakes
- New team decisions
- Architecture changes
- Lessons learned

Add a "changelog" section at the bottom:

```markdown
## Changelog

### 2024-11-15

- Added Stripe integration rules
- Updated React Query cache times
- Removed Redux patterns (migrated to Zustand)

### 2024-11-01

- Initial version
- Core architecture rules
- Basic patterns
```

The complete `claude.md` is one that makes your AI assistant feel like a team member who's been working on your project
for months, not minutes.
