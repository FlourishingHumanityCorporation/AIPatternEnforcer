# Feature Planning Prompt Template

## Table of Contents

1. [Context Setup](#context-setup)
2. [Feature Requirements](#feature-requirements)
  3. [Functional Requirements](#functional-requirements)
  4. [Non-Functional Requirements](#non-functional-requirements)
5. [Existing Code Context](#existing-code-context)
6. [Constraints](#constraints)
7. [Expected Deliverables](#expected-deliverables)
8. [Additional Context](#additional-context)
9. [Questions to Address](#questions-to-address)

## Context Setup

I'm working on [PROJECT NAME] and need to implement [FEATURE NAME].

Current stack:

- [List relevant technologies]
- [List relevant patterns/frameworks]

## Feature Requirements

### Functional Requirements

1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

### Non-Functional Requirements

- Performance: [Specify any performance requirements]
- Security: [Specify security considerations]
- Accessibility: [Specify a11y requirements]
- Browser Support: [Specify browser requirements]

## Existing Code Context

- Related files: @[path/to/relevant/files]
- Similar features: @[path/to/similar/feature]
- Patterns to follow: @docs/architecture/patterns/

## Constraints

- Timeline: [Specify deadline if any]
- Dependencies: [List any blocking dependencies]
- Technical debt: [Note any tech debt to address]

## Expected Deliverables

Please provide:

1. **High-level architecture**
   - Component structure
   - Data flow
   - State management approach
   - API endpoints needed

2. **Implementation plan**
   - Ordered list of tasks
   - Estimated complexity for each
   - Potential risks/blockers

3. **File structure**

   ```
   feature-name/
   ├── components/
   ├── hooks/
   ├── services/
   ├── types/
   └── index.ts
   ```

4. **Key technical decisions**
   - Library choices with rationale
   - Pattern selections
   - Performance optimizations

5. **Test strategy**
   - Unit test approach
   - Integration test needs
   - E2E test scenarios

## Additional Context

[Any other relevant information, mockups, user stories, etc.]

## Questions to Address

1. What are the main technical challenges?
2. Are there any security concerns to address?
3. How will this integrate with existing features?
4. What monitoring/logging is needed?
5. How will we handle errors and edge cases?
