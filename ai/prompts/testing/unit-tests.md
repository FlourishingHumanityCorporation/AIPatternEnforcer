# Unit Test Generation Prompt Template

## Context

I need unit tests for [COMPONENT/FUNCTION NAME] in [PROJECT NAME].

## Code to Test

```typescript
[Paste the code that needs testing]
```

File location: @[path/to/file]

## Test Requirements

### Coverage Goals

- [ ] All public methods/functions
- [ ] Edge cases and error conditions
- [ ] Integration points
- [ ] State changes (if applicable)

### Specific Scenarios to Test

1. [Scenario 1]
2. [Scenario 2]
3. [Scenario 3]

## Testing Framework

- Framework: [Jest/Vitest/Mocha]
- Assertion library: [built-in/chai/expect]
- Mocking approach: [jest.mock/sinon/vitest]

## Dependencies to Mock

- External services: [list services]
- Database calls: [list models/repositories]
- File system operations: [if any]
- Network requests: [if any]

## Existing Test Patterns

Reference existing tests: @[path/to/similar/tests]

## Output Requirements

Please generate:

1. **Complete test file** following project conventions
2. **Test cases covering**:
   - Happy path scenarios
   - Error conditions
   - Edge cases
   - Boundary conditions
3. **Mock implementations** for dependencies
4. **Setup and teardown** if needed
5. **Descriptive test names** that explain what's being tested

## Test Structure Template

```typescript
describe("[Component/Function Name]", () => {
  // Setup
  beforeEach(() => {
    // Test setup
  });

  describe("[Method/Behavior]", () => {
    it("should [expected behavior] when [condition]", () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe("error handling", () => {
    it("should [error behavior] when [error condition]", () => {
      // Test error scenarios
    });
  });
});
```

## Additional Considerations

- Performance constraints: [if any]
- Async behavior: [if applicable]
- State management: [if applicable]
- Side effects to verify: [list any]
