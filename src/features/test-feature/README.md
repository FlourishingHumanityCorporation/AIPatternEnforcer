# Testfeature Feature

This feature provides functionality for managing TestFeature.

## Table of Contents

1. [Structure](#structure)
2. [Usage](#usage)
  3. [Basic Usage](#basic-usage)
  4. [With Provider](#with-provider)
5. [API](#api)
  6. [Hooks](#hooks)
  7. [API Service](#api-service)
8. [Development](#development)

## Structure

- `api/` - API service layer
- `components/` - React components
- `hooks/` - Custom React hooks
- `store/` - State management
- `types/` - TypeScript type definitions
- `utils/` - Utility functions
- `__tests__/` - Test files

## Usage

### Basic Usage

```tsx
import { TestfeatureView } from '@/features/test-feature';

function App() {
  return <TestfeatureView id="123" />;
}
```

### With Provider

```tsx
import { TestfeatureProvider, useTestfeature } from '@/features/test-feature';

function MyComponent() {
  const { data, loading, createTestfeature } = useTestfeature();
  
  // Use the hook functions
}

function App() {
  return (
    <TestfeatureProvider>
      <MyComponent />
    </TestfeatureProvider>
  );
}
```

## API

### Hooks

- `useTestfeature()` - Main hook for CRUD operations
- `useTestfeatureList()` - Hook for list operations

### API Service

- `TestfeatureApi.getAll()` - Fetch all items
- `TestfeatureApi.getById(id)` - Fetch single item
- `TestfeatureApi.create(data)` - Create new item
- `TestfeatureApi.update(id, data)` - Update existing item
- `TestfeatureApi.delete(id)` - Delete item

## Development

To extend this feature:

1. Add new types in `types/`
2. Extend API methods in `api/`
3. Add new components in `components/`
4. Create custom hooks in `hooks/`
5. Add tests in `__tests__/`
