# Extract Common Code - DRY Refactoring Template

## Purpose

Use this template when you identify duplicate code that should be extracted into reusable utilities, hooks, or components.

## Analysis Phase

### Step 1: Identify Duplication

Look for these patterns:

- [ ] Same logic repeated in multiple files
- [ ] Similar functions with minor variations
- [ ] Copy-pasted code blocks
- [ ] Repeated type definitions
- [ ] Similar component structures

### Step 2: Current Code Inventory

```typescript
// File 1: [path/to/file1.ts]
[paste duplicated code block 1]

// File 2: [path/to/file2.ts]
[paste duplicated code block 2]

// File 3: [path/to/file3.ts]
[paste duplicated code block 3]
```

### Step 3: Identify Variations

List the differences between implementations:

1. [Difference 1]
2. [Difference 2]
3. [Difference 3]

## Refactoring Request

### Extract to:

- [ ] Utility function in `@lib/utils/`
- [ ] Custom hook in `@hooks/`
- [ ] Shared component in `@components/shared/`
- [ ] Type definition in `@types/`
- [ ] Service class in `@services/`

### Requirements:

1. **Maintain all existing functionality** - No behavior changes
2. **Handle all variations** - Use parameters/options for differences
3. **Preserve type safety** - Full TypeScript types
4. **Add comprehensive tests** - Cover all use cases
5. **Update all usages** - Replace duplicated code

### Proposed API:

```typescript
// Describe the new utility/hook/component API
export function extractedFunction(
  param1: Type1,
  param2: Type2,
  options?: {
    variation1?: boolean;
    variation2?: string;
  },
): ReturnType {
  // Implementation
}
```

## Implementation Checklist

### Phase 1: Create the Abstraction

- [ ] Create new file in appropriate location
- [ ] Implement with all variations handled
- [ ] Add comprehensive JSDoc comments
- [ ] Export from index file

### Phase 2: Add Tests

- [ ] Unit tests for all parameter combinations
- [ ] Edge case tests
- [ ] Error handling tests
- [ ] Type tests (if applicable)

### Phase 3: Replace Usages

- [ ] Update File 1 to use new abstraction
- [ ] Update File 2 to use new abstraction
- [ ] Update File 3 to use new abstraction
- [ ] Verify all tests still pass

### Phase 4: Cleanup

- [ ] Remove old duplicated code
- [ ] Update imports
- [ ] Run linter
- [ ] Update documentation

## Example Transformation

### Before:

```typescript
// auth/login.ts
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// user/profile.ts
const checkEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// admin/users.ts
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

### After:

```typescript
// lib/utils/validation.ts
/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns true if email format is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// All files now import:
import { isValidEmail } from "@lib/utils/validation";
```

## Quality Checks

- [ ] No code duplication remains
- [ ] New abstraction is well-named and discoverable
- [ ] All edge cases handled
- [ ] Performance not degraded
- [ ] Easy to understand and use
