# Samplefeature Feature

This feature provides functionality for managing SampleFeature.

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
import { SamplefeatureView } from '@/features/sample-feature';

function App() {
  return <SamplefeatureView id="123" />;
}
```

### With Provider

```tsx
import { SamplefeatureProvider, useSamplefeature } from '@/features/sample-feature';

function MyComponent() {
  const { data, loading, createSamplefeature } = useSamplefeature();
  
  // Use the hook functions
}

function App() {
  return (
    <SamplefeatureProvider>
      <MyComponent />
    </SamplefeatureProvider>
  );
}
```

## API

### Hooks

- `useSamplefeature()` - Main hook for CRUD operations
- `useSamplefeatureList()` - Hook for list operations

### API Service

- `SamplefeatureApi.getAll()` - Fetch all items
- `SamplefeatureApi.getById(id)` - Fetch single item
- `SamplefeatureApi.create(data)` - Create new item
- `SamplefeatureApi.update(id, data)` - Update existing item
- `SamplefeatureApi.delete(id)` - Delete item

## Development

To extend this feature:

1. Add new types in `types/`
2. Extend API methods in `api/`
3. Add new components in `components/`
4. Create custom hooks in `hooks/`
5. Add tests in `__tests__/`
