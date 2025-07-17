# State Management Hooks

This directory contains hooks for validating state management patterns in the recommended tech stack.

**Environment Variable**: `HOOK_STATE`

## Available Hooks

### 1. `zustand-pattern-enforcer.js`

**Purpose**: Validates Zustand state management best practices

**Validates**:

- ✅ Proper store creation patterns with `set` and `get` functions
- ✅ Immer middleware usage for state mutations
- ✅ Selector patterns for performance optimization
- ✅ TypeScript usage and type safety
- ✅ Async operation handling
- ✅ Middleware patterns (persist, devtools)
- ✅ Testing patterns

**Common Issues Detected**:

- 🚫 Direct state mutation without Immer
- 🚫 Using entire store without selectors (causes re-renders)
- 🚫 Creating objects in selectors (infinite re-renders)
- 🚫 Manual localStorage/logging instead of middleware
- 🚫 Async functions passed directly to `set`

### 2. `tanstack-query-validator.js`

**Purpose**: Validates TanStack Query (React Query) best practices

**Validates**:

- ✅ Query key patterns and consistency
- ✅ Query function error handling
- ✅ Mutation patterns with proper invalidation
- ✅ Optimistic updates with rollback
- ✅ Configuration patterns (staleTime, retry)
- ✅ TypeScript usage
- ✅ Error boundary and Suspense patterns

**Common Issues Detected**:

- 🚫 Legacy 'react-query' imports
- 🚫 String concatenation in query keys
- 🚫 String query keys instead of arrays
- 🚫 Invalidating all queries instead of specific ones
- 🚫 Missing error handling in mutations
- 🚫 Fetch without response validation
- 🚫 Optimistic updates without rollback

## Usage

### Basic Hook Configuration

```bash
# In .env file
HOOKS_DISABLED=false  # Enable hooks
HOOK_STATE=true       # Enable state management validation
```

### Testing Hook Functionality

```bash
# Test Zustand hook
echo '{"tool_name":"Write","tool_input":{"file_path":"store.ts","content":"const useStore = create(() => ({ count: 0 }))"}}' | node tools/hooks/state/zustand-pattern-enforcer.js

# Test TanStack Query hook
echo '{"tool_name":"Write","tool_input":{"file_path":"hooks/useUsers.ts","content":"useQuery(\"users\", fetchUsers)"}}' | node tools/hooks/state/tanstack-query-validator.js
```

### Integration with Claude Code

Add to `.claude/settings.json`:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [
        {
          "type": "command",
          "command": "node tools/hooks/state/zustand-pattern-enforcer.js",
          "timeout": 2,
          "family": "state_management",
          "priority": "high"
        },
        {
          "type": "command",
          "command": "node tools/hooks/state/tanstack-query-validator.js",
          "timeout": 2,
          "family": "state_management",
          "priority": "high"
        }
      ]
    }
  ]
}
```

## Best Practices

### Zustand Best Practices

- Use selectors to prevent unnecessary re-renders
- Leverage middleware for common patterns (persist, devtools)
- Keep stores focused and composable
- Use TypeScript for better type safety
- Handle async operations outside of set calls

### TanStack Query Best Practices

- Use array format for query keys
- Handle errors appropriately
- Invalidate queries specifically, not globally
- Configure staleTime and cacheTime thoughtfully
- Use TypeScript for better type safety
- Implement optimistic updates with proper rollback

## Configuration

### Environment Variables

- `HOOK_STATE=true` - Enable state management hooks
- `HOOK_VERBOSE=true` - Enable verbose output for debugging

### Folder Structure

```
state/
├── zustand-pattern-enforcer.js
├── tanstack-query-validator.js
├── __tests__/
│   ├── zustand-pattern-enforcer.test.js
│   └── tanstack-query-validator.test.js
└── README.md
```

## Testing

Run tests for state management hooks:

```bash
npm test -- tools/hooks/state/__tests__/
```

## Debugging

Enable verbose output to see hook execution details:

```bash
HOOK_VERBOSE=true echo '{"tool_input":{"file_path":"test.ts","content":"..."}}' | node tools/hooks/state/zustand-pattern-enforcer.js
```

## Integration

These hooks are designed to work with the recommended tech stack:

- **Next.js + React** - Component-based architecture
- **Zustand** - Client-side state management
- **TanStack Query** - Server state management
- **TypeScript** - Type safety throughout

The hooks ensure that state management follows best practices for performance, maintainability, and developer experience in local AI application development.
