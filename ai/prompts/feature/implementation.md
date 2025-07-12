# Feature Implementation Guide

## Table of Contents

1. [Pre-Implementation Checklist](#pre-implementation-checklist)
2. [Implementation Prompt Template](#implementation-prompt-template)
3. [Feature: [FEATURE_NAME]](#feature-feature_name)
  4. [Requirements:](#requirements)
  5. [Technical Context:](#technical-context)
  6. [Implementation Steps:](#implementation-steps)
  7. [Success Criteria:](#success-criteria)
  8. [Code Quality Requirements:](#code-quality-requirements)
9. [Step-by-Step Implementation Process](#step-by-step-implementation-process)
  10. [1. Analysis Phase](#1-analysis-phase)
  11. [2. Test-First Implementation](#2-test-first-implementation)
  12. [3. Core Implementation](#3-core-implementation)
  13. [4. Integration & Polish](#4-integration-polish)
  14. [5. Review & Refinement](#5-review-refinement)
15. [Common Implementation Patterns](#common-implementation-patterns)
  16. [React Component Implementation](#react-component-implementation)
  17. [API Implementation](#api-implementation)
18. [Error Handling Optimal Practices](#error-handling-optimal-practices)
  19. [Component Error Boundaries](#component-error-boundaries)
  20. [API Error Handling](#api-error-handling)
21. [Performance Considerations](#performance-considerations)
  22. [React Performance](#react-performance)
  23. [API Performance](#api-performance)
  24. [Bundle Size](#bundle-size)
25. [Testing Requirements](#testing-requirements)
  26. [Unit Tests](#unit-tests)
  27. [Integration Tests](#integration-tests)
28. [Documentation Requirements](#documentation-requirements)
  29. [Code Documentation](#code-documentation)
  30. [User Documentation](#user-documentation)
31. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
32. [Implementation Checklist](#implementation-checklist)

## Pre-Implementation Checklist

Before implementing any feature, ensure you have:

- [ ] **Clear Requirements**: Feature specification is well-defined
- [ ] **Architecture Decision**: Technical approach has been decided
- [ ] **Test Strategy**: Testing approach is planned
- [ ] **Dependencies**: Required libraries/tools are identified
- [ ] **Breaking Changes**: Impact on existing code is assessed

## Implementation Prompt Template

```text
You are a TypeScript developer working on ProjectTemplate. Implement the following feature:

## Feature: [FEATURE_NAME]

### Requirements:
- [List specific requirements]
- [Include acceptance criteria]
- [Mention edge cases]

### Technical Context:
- Current tech stack: [List relevant technologies]
- Related files: [List files that will be modified]
- Patterns to follow: [Reference existing patterns]

### Implementation Steps:
1. [Break down into specific steps]
2. [Include test writing requirements]
3. [Mention documentation needs]

### Success Criteria:
- [ ] Feature works as specified
- [ ] Tests pass (unit + integration)
- [ ] No breaking changes to existing functionality
- [ ] Code follows project conventions
- [ ] Documentation is updated

### Code Quality Requirements:
- Use TypeScript with strict mode
- Follow existing patterns in the codebase
- Include comprehensive error handling
- Add logging where appropriate
- Optimize for performance
- Ensure accessibility compliance

Please implement this feature step by step, starting with tests.
```

## Step-by-Step Implementation Process

### 1. Analysis Phase

- Review existing codebase for similar patterns
- Identify integration points
- Plan data flow and state management
- Consider performance implications

### 2. Test-First Implementation

- Write unit tests for core functionality
- Create integration tests for component interactions
- Add E2E tests for critical user flows
- Ensure edge cases are covered

### 3. Core Implementation

- Implement the main feature logic
- Add proper error handling
- Include performance optimizations
- Follow accessibility optimal practices

### 4. Integration & Polish

- Integrate with existing systems
- Add proper logging and monitoring
- Update documentation
- Perform manual testing

### 5. Review & Refinement

- Code review with team members
- Performance testing
- Security review
- User experience validation

## Common Implementation Patterns

### React Component Implementation

```typescript
// 1. Define interfaces first
interface FeatureProps {
  // Define props
}

// 2. Create component with proper typing
export const Feature: React.FC<FeatureProps> = ({ ...props }) => {
  // 3. State management
  const [state, setState] = useState<StateType>(initialState);

  // 4. Event handlers
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies]);

  // 5. Side effects
  useEffect(() => {
    // Side effect logic
  }, [dependencies]);

  // 6. Render with accessibility
  return (
    <div role="..." aria-label="...">
      {/* Content */}
    </div>
  );
};
```

### API Implementation

```typescript
// 1. Define types
interface ApiRequest {
  // Request structure
}

interface ApiResponse {
  // Response structure
}

// 2. Create service function
export async function apiService(request: ApiRequest): Promise<ApiResponse> {
  try {
    // Implementation with error handling
  } catch (error) {
    // Proper error handling
  }
}

// 3. Add validation
const validateRequest = (request: ApiRequest): boolean => {
  // Validation logic
};
```

## Error Handling Optimal Practices

### Component Error Boundaries

```typescript
class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Feature error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
try {
  const response = await apiCall();
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication error
  } else if (error.response?.status >= 500) {
    // Handle server error
  } else {
    // Handle other errors
  }
  throw error;
}
```

## Performance Considerations

### React Performance

- Use `React.memo()` for components that re-render frequently
- Implement `useMemo()` for expensive calculations
- Use `useCallback()` for event handlers in child components
- Consider lazy loading for large components

### API Performance

- Implement request caching where appropriate
- Add request debouncing for user input
- Use pagination for large data sets
- Implement optimistic updates for better UX

### Bundle Size

- Import only needed functions from libraries
- Use dynamic imports for code splitting
- Optimize images and assets
- Remove unused code

## Testing Requirements

### Unit Tests

```typescript
describe("Feature", () => {
  it("should handle valid input", () => {
    // Test implementation
  });

  it("should handle edge cases", () => {
    // Test edge cases
  });

  it("should handle errors gracefully", () => {
    // Test error scenarios
  });
});
```

### Integration Tests

```typescript
describe("Feature Integration", () => {
  it("should work with existing components", () => {
    // Test component integration
  });

  it("should handle API interactions", () => {
    // Test API integration
  });
});
```

## Documentation Requirements

### Code Documentation

- JSDoc comments for all public functions
- Type definitions for all interfaces
- Usage examples in comments
- Performance notes where relevant

### User Documentation

- Feature overview and benefits
- Step-by-step usage guide
- Configuration options
- Troubleshooting guide

## Common Pitfalls to Avoid

1. **Insufficient Error Handling**: Always handle edge cases
2. **Performance Issues**: Test with realistic data sizes
3. **Accessibility Oversights**: Include ARIA labels and keyboard navigation
4. **State Management Complexity**: Keep state as simple as possible
5. **Testing Gaps**: Ensure all code paths are tested
6. **Documentation Lag**: Update docs as you implement

## Implementation Checklist

- [ ] Feature requirements are clear and testable
- [ ] Tests are written before implementation
- [ ] Core functionality is implemented
- [ ] Error handling is comprehensive
- [ ] Performance is optimized
- [ ] Accessibility is ensured
- [ ] Documentation is complete
- [ ] Code review is conducted
- [ ] Manual testing is performed
- [ ] Integration testing is successful
