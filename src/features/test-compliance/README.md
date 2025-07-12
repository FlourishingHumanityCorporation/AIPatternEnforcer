# Testcompliance Feature

This feature provides functionality for managing TestCompliance.

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
import { TestcomplianceView } from '@/features/test-compliance';

function App() {
  return <TestcomplianceView id="123" />;
}
```

### With Provider

```tsx
import { TestcomplianceProvider, useTestcompliance } from '@/features/test-compliance';

function MyComponent() {
  const { data, loading, createTestcompliance } = useTestcompliance();
  
  // Use the hook functions
}

function App() {
  return (
    <TestcomplianceProvider>
      <MyComponent />
    </TestcomplianceProvider>
  );
}
```

## API

### Hooks

- `useTestcompliance()` - Main hook for CRUD operations
- `useTestcomplianceList()` - Hook for list operations

### API Service

- `TestcomplianceApi.getAll()` - Fetch all items
- `TestcomplianceApi.getById(id)` - Fetch single item
- `TestcomplianceApi.create(data)` - Create new item
- `TestcomplianceApi.update(id, data)` - Update existing item
- `TestcomplianceApi.delete(id)` - Delete item

## Development

To extend this feature:

1. Add new types in `types/`
2. Extend API methods in `api/`
3. Add new components in `components/`
4. Create custom hooks in `hooks/`
5. Add tests in `__tests__/`
