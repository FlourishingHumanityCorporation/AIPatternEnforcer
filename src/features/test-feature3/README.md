# Testfeature3 Feature

This feature provides functionality for managing TestFeature3.

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
import { Testfeature3View } from '@/features/test-feature3';

function App() {
  return <Testfeature3View id="123" />;
}
```

### With Provider

```tsx
import { Testfeature3Provider, useTestfeature3 } from '@/features/test-feature3';

function MyComponent() {
  const { data, loading, createTestfeature3 } = useTestfeature3();
  
  // Use the hook functions
}

function App() {
  return (
    <Testfeature3Provider>
      <MyComponent />
    </Testfeature3Provider>
  );
}
```

## API

### Hooks

- `useTestfeature3()` - Main hook for CRUD operations
- `useTestfeature3List()` - Hook for list operations

### API Service

- `Testfeature3Api.getAll()` - Fetch all items
- `Testfeature3Api.getById(id)` - Fetch single item
- `Testfeature3Api.create(data)` - Create new item
- `Testfeature3Api.update(id, data)` - Update existing item
- `Testfeature3Api.delete(id)` - Delete item

## Development

To extend this feature:

1. Add new types in `types/`
2. Extend API methods in `api/`
3. Add new components in `components/`
4. Create custom hooks in `hooks/`
5. Add tests in `__tests__/`
