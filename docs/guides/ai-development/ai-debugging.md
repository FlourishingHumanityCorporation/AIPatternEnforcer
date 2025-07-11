# AI-Assisted Debugging Guide

## Overview

AI tools can significantly accelerate debugging, but they need the right context and approach. This guide covers effective strategies for using AI to debug issues.

## Pre-Debugging Checklist

Before engaging AI for debugging:

- [ ] Reproduce the issue consistently
- [ ] Gather error messages/stack traces
- [ ] Identify when the issue started
- [ ] Check recent code changes
- [ ] Run `npm run ai:context` for environment info

## Debugging Workflow

### 1. Context Gathering

```bash
# Capture comprehensive debug context
./scripts/dev/debug-snapshot.sh

# Gather feature-specific context
./scripts/dev/gather-feature-context.sh [feature-name]

# Check recent changes
git log --oneline -20
git diff HEAD~5
```

### 2. Problem Statement Template

```markdown
## Issue Description

[One sentence summary]

## Error Details
```

[Full error message/stack trace]

```

## Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Result]

## Expected vs Actual
- Expected: [behavior]
- Actual: [behavior]

## Environment
[Paste debug snapshot relevant sections]

## Recent Changes
[What changed recently]
```

### 3. Systematic Debugging Prompts

#### Root Cause Analysis

```markdown
Using the Arrow-Chain methodology, trace this error:
Error: [error message]
File: @[file:line]

Create an arrow chain showing:

- Where error originates
- How data flows to error point
- Where data becomes invalid
```

#### State Debugging

```markdown
Debug state issue:
Component: @[component-path]
Problem: [State not updating/wrong value/etc]

Analyze:

1. Initial state
2. State updates
3. Re-render triggers
4. Stale closure issues
```

#### Performance Debugging

```markdown
Performance issue in @[file]:
Symptom: [Slow render/API/etc]
Metrics: [Current timing]

Find:

1. Expensive operations
2. Unnecessary re-computations
3. Memory leaks
4. N+1 queries
```

## AI Debugging Strategies

### 1. Hypothesis-Driven Debugging

```markdown
Given this error: [error]
Generate 3 hypotheses for the cause:

1. Most likely: [hypothesis]
2. Alternative: [hypothesis]
3. Edge case: [hypothesis]

For each, provide:

- How to test
- What to look for
- Quick fix to verify
```

### 2. Divide and Conquer

```markdown
This feature @[feature] is broken.
Break down into components:

1. Input validation
2. Business logic
3. Data persistence
4. Response formatting

Test each independently with:
[Provide test approach for each]
```

### 3. Time Travel Debugging

```markdown
Feature worked in commit: [hash]
Broken in commit: [hash]

Analyze changes between:
`git diff [good-hash] [bad-hash] -- [relevant-files]`

Identify:

1. What changed
2. Why it might break
3. Minimal fix
```

## Common Debugging Scenarios

### Async/Promise Issues

````markdown
Debug async issue:

```javascript
[problematic async code]
```
````

Check for:

1. Missing await
2. Promise rejection handling
3. Race conditions
4. Callback hell

````

### Type Errors
```markdown
TypeScript error:
````

[TS error message]

```
File: @[file:line]

Resolve by:
1. Understanding expected types
2. Tracing type inference
3. Fixing without using 'any'
```

### State Management

```markdown
State bug in [Redux/Zustand/Context]:

- State shape: [current state]
- Action: [action dispatched]
- Expected result: [what should happen]
- Actual result: [what happens]

Debug:

1. Action dispatch
2. Reducer logic
3. Selector memoization
4. Component subscription
```

### API Integration

```markdown
API error:

- Endpoint: [URL]
- Method: [GET/POST/etc]
- Status: [status code]
- Response: [error response]

Debug:

1. Request formation
2. Auth headers
3. CORS issues
4. Response parsing
```

## Advanced Debugging Techniques

### 1. Minimal Reproduction

```markdown
Create minimal reproduction for:
[Complex bug description]

Requirements:

- Smallest code that shows issue
- No external dependencies
- Single file if possible
- Clear success/failure criteria
```

### 2. Binary Search Debugging

```markdown
Feature breaks somewhere in @[large-file].
Use binary search:

1. Comment out half the code
2. Test if issue persists
3. Narrow down to problematic section
4. Repeat until found
```

### 3. Debugging by Proxy

```markdown
Can't reproduce [production issue] locally.

Create proxy debugging:

1. Add logging at key points
2. Deploy to staging
3. Analyze logs
4. Form hypothesis
5. Test fix
```

## Post-Debugging Actions

### 1. Root Cause Documentation

```markdown
Document the fix:

- What was broken
- Why it broke
- How you fixed it
- How to prevent recurrence
```

### 2. Test Creation

```markdown
Create test to prevent regression:

- Test name describes the bug
- Reproduces original issue
- Verifies the fix
- Covers edge cases
```

### 3. Pattern Recognition

```markdown
Similar bugs might exist in:

- Similar components
- Same pattern usage
- Related features

Search for: [pattern]
Fix proactively
```

## Debugging Toolbox

### Essential Commands

```bash
# Search for pattern across codebase
./scripts/dev/search-pattern.sh "problematic pattern"

# Find all usages of a function
./scripts/quality/find-usages.sh functionName

# Check for common issues
./scripts/quality/verify-imports.sh
./scripts/dev/check-security.sh

# Time travel through git
git bisect start
git bisect bad HEAD
git bisect good [last-known-good]
```

### Debug Logging Strategy

```typescript
// Temporary debug logging
const DEBUG = process.env.DEBUG_FEATURE === "true";

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG ${new Date().toISOString()}] ${message}`, data);
  }
}

// Usage
debugLog("State before update", { currentState });
```

### Browser Debugging

```javascript
// Conditional breakpoint
if (user.id === problematicUserId) {
  debugger;
}

// Trace function calls
console.trace("How did we get here?");

// Performance marking
performance.mark("operation-start");
// ... operation ...
performance.mark("operation-end");
performance.measure("operation", "operation-start", "operation-end");
```

## When AI Debugging Fails

If AI can't help resolve the issue:

1. **Simplify Further**: Break down into smaller pieces
2. **Add More Context**: Include more code, logs, examples
3. **Try Different Angles**: Rephrase the problem
4. **Manual Debugging**: Use traditional debugger tools
5. **Ask Colleagues**: Sometimes human insight is needed

Remember: AI is a debugging assistant, not a replacement for understanding your code. Use it to accelerate investigation, but verify all suggestions.
