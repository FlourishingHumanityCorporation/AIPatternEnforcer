# Feature Review Checklist

## Self-Review Prompt Template

Use this template to conduct a thorough review of your feature implementation before requesting code review:

```
I have implemented [FEATURE_NAME] and need to conduct a self-review. Please help me review the implementation against the following criteria:

## Code Quality Review:
- [ ] TypeScript types are properly defined
- [ ] Error handling is comprehensive
- [ ] Code follows project conventions
- [ ] Performance optimizations are in place
- [ ] Security considerations are addressed

## Testing Review:
- [ ] Unit tests cover all functions
- [ ] Integration tests verify component interactions
- [ ] Edge cases are tested
- [ ] Error scenarios are tested
- [ ] Test coverage is adequate (>80%)

## Documentation Review:
- [ ] Code is properly documented
- [ ] API documentation is updated
- [ ] User documentation is complete
- [ ] README is updated if needed

## Feature Completeness:
- [ ] All requirements are implemented
- [ ] Acceptance criteria are met
- [ ] Edge cases are handled
- [ ] User experience is polished

Please analyze the implementation and provide feedback on areas for improvement.
```

## Detailed Review Categories

### 1. Code Quality Assessment

#### TypeScript Quality

- [ ] All types are properly defined (no `any` types)
- [ ] Interfaces are well-structured and documented
- [ ] Generic types are used appropriately
- [ ] Type assertions are justified and safe
- [ ] Strict mode compilation passes without errors

#### Code Structure

- [ ] Functions are single-purpose and well-named
- [ ] Components have clear responsibilities
- [ ] Utility functions are properly abstracted
- [ ] Constants are defined and used appropriately
- [ ] Code is organized logically

#### Error Handling

- [ ] All async operations have error handling
- [ ] User-facing errors provide helpful messages
- [ ] Logging includes appropriate context
- [ ] Fallback behavior is implemented
- [ ] Error boundaries are used where appropriate

### 2. React-Specific Review

#### Component Design

- [ ] Components are properly typed
- [ ] Props are validated and documented
- [ ] State management is appropriate
- [ ] Side effects are handled correctly
- [ ] Component lifecycle is managed properly

#### Performance

- [ ] Re-renders are minimized
- [ ] Expensive operations are memoized
- [ ] Event handlers are optimized
- [ ] Large lists are virtualized if needed
- [ ] Bundle size impact is considered

#### Accessibility

- [ ] ARIA labels are provided
- [ ] Keyboard navigation works
- [ ] Focus management is proper
- [ ] Screen reader compatibility
- [ ] Color contrast is sufficient

### 3. Testing Quality

#### Unit Tests

- [ ] All functions have unit tests
- [ ] Test cases cover happy paths
- [ ] Edge cases are tested
- [ ] Error scenarios are covered
- [ ] Tests are readable and maintainable

#### Integration Tests

- [ ] Component interactions are tested
- [ ] API integrations are verified
- [ ] State changes are validated
- [ ] User workflows are tested
- [ ] Cross-browser compatibility

#### Test Quality

- [ ] Tests are deterministic
- [ ] Test data is realistic
- [ ] Mocks are used appropriately
- [ ] Test setup is minimal
- [ ] Test descriptions are clear

### 4. API and Data

#### API Design

- [ ] Endpoints follow RESTful conventions
- [ ] Request/response types are documented
- [ ] Error responses are standardized
- [ ] Rate limiting is considered
- [ ] Security headers are included

#### Data Management

- [ ] Data validation is comprehensive
- [ ] Database queries are optimized
- [ ] Caching strategy is implemented
- [ ] Data migration is handled
- [ ] Backup/recovery is considered

### 5. Security Review

#### Input Validation

- [ ] All user inputs are validated
- [ ] SQL injection prevention
- [ ] XSS prevention measures
- [ ] File upload security
- [ ] Rate limiting on sensitive endpoints

#### Authentication & Authorization

- [ ] Authentication is properly implemented
- [ ] Authorization checks are in place
- [ ] Session management is secure
- [ ] Password handling is secure
- [ ] API keys are protected

### 6. Performance Review

#### Frontend Performance

- [ ] Initial load time is optimized
- [ ] Bundle size is reasonable
- [ ] Images are optimized
- [ ] Caching strategies are implemented
- [ ] Network requests are minimized

#### Backend Performance

- [ ] Database queries are optimized
- [ ] Response times are acceptable
- [ ] Memory usage is efficient
- [ ] Concurrent request handling
- [ ] Resource cleanup is proper

### 7. User Experience

#### Functionality

- [ ] All features work as specified
- [ ] User flows are intuitive
- [ ] Error messages are helpful
- [ ] Loading states are informative
- [ ] Success feedback is provided

#### Design Consistency

- [ ] UI follows design system
- [ ] Responsive design works
- [ ] Animations are smooth
- [ ] Typography is consistent
- [ ] Color scheme is appropriate

## Review Questions

### Technical Questions

1. Are there any code smells or anti-patterns?
2. Could any part be simplified or optimized?
3. Are there potential edge cases not covered?
4. Is the error handling robust enough?
5. Are there any security vulnerabilities?

### User Experience Questions

1. Is the feature intuitive to use?
2. Are error messages helpful?
3. Is the performance acceptable?
4. Are loading states clear?
5. Is the feature accessible?

### Maintenance Questions

1. Is the code easy to understand?
2. Are the tests maintainable?
3. Is the documentation complete?
4. Can the feature be extended easily?
5. Are there any breaking changes?

## Common Issues to Look For

### Code Issues

- Unused imports or variables
- Console.log statements left in code
- Hardcoded values that should be configurable
- Missing error handling in async operations
- Inefficient algorithms or data structures

### React Issues

- Missing keys in lists
- Unused useEffect dependencies
- Memory leaks from unsubscribed events
- Incorrect state updates
- Missing cleanup in useEffect

### Testing Issues

- Tests that don't actually test the functionality
- Flaky or unreliable tests
- Missing test coverage for edge cases
- Overly complex test setup
- Tests that are too tightly coupled to implementation

## Review Completion Checklist

- [ ] All code has been reviewed for quality
- [ ] All tests pass and provide good coverage
- [ ] Documentation is complete and accurate
- [ ] Performance is acceptable
- [ ] Security considerations are addressed
- [ ] Accessibility requirements are met
- [ ] User experience is polished
- [ ] Breaking changes are documented
- [ ] Migration guide is provided (if needed)
- [ ] Feature is ready for code review

## Post-Review Actions

1. **Address Issues**: Fix any problems identified during review
2. **Update Documentation**: Ensure all documentation is current
3. **Run Final Tests**: Execute full test suite one more time
4. **Check Dependencies**: Verify all dependencies are properly listed
5. **Create PR**: Submit for team code review with detailed description

## Review Prompt for AI Assistant

```
Please review my implementation of [FEATURE_NAME] against the following criteria:

1. **Code Quality**: Are there any code smells, anti-patterns, or areas for improvement?
2. **Testing**: Are the tests comprehensive and well-written?
3. **Performance**: Are there any performance issues or optimization opportunities?
4. **Security**: Are there any security vulnerabilities or concerns?
5. **Accessibility**: Does the implementation meet accessibility standards?
6. **Documentation**: Is the code and feature properly documented?

Here's the implementation:
[PASTE YOUR CODE HERE]

Please provide specific feedback and suggestions for improvement.
```
