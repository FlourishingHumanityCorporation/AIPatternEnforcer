# Pilotready Feature

This feature provides functionality for managing PilotReady.

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
import { PilotreadyView } from '@/features/pilot-ready';

function App() {
  return <PilotreadyView id="123" />;
}
```

### With Provider

```tsx
import { PilotreadyProvider, usePilotready } from '@/features/pilot-ready';

function MyComponent() {
  const { data, loading, createPilotready } = usePilotready();
  
  // Use the hook functions
}

function App() {
  return (
    <PilotreadyProvider>
      <MyComponent />
    </PilotreadyProvider>
  );
}
```

## API

### Hooks

- `usePilotready()` - Main hook for CRUD operations
- `usePilotreadyList()` - Hook for list operations

### API Service

- `PilotreadyApi.getAll()` - Fetch all items
- `PilotreadyApi.getById(id)` - Fetch single item
- `PilotreadyApi.create(data)` - Create new item
- `PilotreadyApi.update(id, data)` - Update existing item
- `PilotreadyApi.delete(id)` - Delete item

## Development

To extend this feature:

1. Add new types in `types/`
2. Extend API methods in `api/`
3. Add new components in `components/`
4. Create custom hooks in `hooks/`
5. Add tests in `__tests__/`
