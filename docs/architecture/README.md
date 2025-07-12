[← Back to Documentation](../README.md)

---

# Architecture Documentation

Technical architecture decisions and design patterns for ProjectTemplate.

## Table of Contents

1. [Categories](#categories)
  2. [📐 Architecture Decisions](#-architecture-decisions)
  3. [🎨 Design Patterns](#-design-patterns)
4. [Quick Reference](#quick-reference)
  5. [By Component](#by-component)
  6. [By Use Case](#by-use-case)
7. [Pattern Relationships](#pattern-relationships)
8. [Contributing](#contributing)
9. [See Also](#see-also)

## Categories

### 📐 Architecture Decisions

Core architectural decisions and principles:

- **[Core Principles](decisions/000-core-principles.md)** - Fundamental architectural guidelines
- **[Architecture Decision Record Template](decisions/template-adr.md)** - Template for documenting decisions

### 🎨 Design Patterns

Proven design patterns for common scenarios:

- **[API Design Standards](patterns/api-design-standards.md)** - RESTful API optimal practices
- **[Data Fetching](patterns/data-fetching.md)** - Client-side data fetching patterns
- **[Data Modeling Guide](patterns/data-modeling-guide.md)** - Database schema design
- **[Error Handling](patterns/error-handling.md)** - Consistent error handling across the stack
- **[State Management](patterns/state-management.md)** - Frontend and backend state patterns

## Quick Reference

### By Component

**Backend Development:**
- [API Design Standards](patterns/api-design-standards.md)
- [Data Modeling Guide](patterns/data-modeling-guide.md)
- [Error Handling](patterns/error-handling.md)

**Frontend Development:**
- [Data Fetching](patterns/data-fetching.md)
- [State Management](patterns/state-management.md)
- [Error Handling](patterns/error-handling.md)

**Full Stack:**
- [Core Principles](decisions/000-core-principles.md)
- All patterns apply across the stack

### By Use Case

**"I need to design an API"**
→ Start with [API Design Standards](patterns/api-design-standards.md)

**"I need to structure my database"**
→ Read [Data Modeling Guide](patterns/data-modeling-guide.md)

**"I need to handle errors properly"**
→ Check [Error Handling](patterns/error-handling.md)

**"I need to manage application state"**
→ Review [State Management](patterns/state-management.md)

**"I need to fetch data efficiently"**
→ See [Data Fetching](patterns/data-fetching.md)

## Pattern Relationships

```text
API Design Standards
    ├── Data Modeling Guide (schema for APIs)
    ├── Error Handling (error responses)
    └── Data Fetching (client integration)

State Management
    ├── Data Fetching (cache management)
    └── Error Handling (error state)

Core Principles
    └── Influences all patterns
```

## Contributing

When adding new patterns or decisions:

1. Use the [ADR template](decisions/template-adr.md) for decisions
2. Follow existing pattern structure
3. Add cross-references to related patterns
4. Update this index

## See Also

- [Comprehensive Testing Guide](../guides/testing/comprehensive-testing-guide.md) - Testing these patterns
- [Security Optimal Practices](../guides/security/security-optimal-practices.md) - Security considerations
- [Performance Optimization](../guides/performance/optimization-playbook.md) - Performance patterns
- [CLAUDE.md](../../CLAUDE.md) - Overall development standards