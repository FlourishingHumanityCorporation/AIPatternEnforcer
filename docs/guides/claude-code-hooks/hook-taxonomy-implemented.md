# Hook Taxonomy Implementation Guide

## Current Status: Documentation Phase

Due to meta-project guardian protections, the hook taxonomy has been implemented as a **logical organization** rather than a physical file reorganization. This provides the benefits of categorization while maintaining system stability.

## New Logical Organization

### ai-patterns/ (3 hooks)
**Purpose**: Proactive AI behavior guidance
- `prevent-improved-files.js` - Prevents duplicate file creation
- `context-validator.js` - Validates AI request quality
- `streaming-pattern-enforcer.js` - Enforces streaming patterns

### cleanup/ (3 hooks)
**Purpose**: Reactive fixes for common mistakes
- `fix-console-logs.js` - Auto-converts console.log to logger
- `import-janitor.js` - Cleans unused imports
- `docs-enforcer.js` - Enforces documentation standards

### project-boundaries/ (3 hooks)
**Purpose**: Protecting project structure
- `block-root-mess.js` - Prevents root directory pollution
- `enterprise-antibody.js` - Blocks enterprise patterns
- `meta-project-guardian.js` - Protects template infrastructure

### local-dev/ (2 hooks)
**Purpose**: Local-only development enforcement
- `localhost-enforcer.js` - Ensures localhost patterns
- `mock-data-enforcer.js` - Enforces mock data usage

### validation/ (3 hooks)
**Purpose**: Input/output validation
- `validate-prisma.js` - Prisma schema validation
- `api-validator.js` - API structure validation
- `template-integrity-validator.js` - Template validation

### architecture/ (2 hooks)
**Purpose**: Architectural pattern enforcement
- `architecture-validator.js` - Framework conventions
- `test-location-enforcer.js` - Test organization

### performance/ (2 hooks)
**Purpose**: Performance optimization
- `performance-guardian.js` - Performance monitoring
- `vector-db-hygiene.js` - Vector DB operations

### security/ (2 hooks)
**Purpose**: Security enforcement
- `security-scan.js` - Security vulnerability detection
- `scope-limiter.js` - Operation scope limits

## Implementation Strategy

### Phase 1: Documentation (Completed)
- ✅ Logical categorization documented
- ✅ Hook purposes clarified
- ✅ Migration plan created

### Phase 2: Future Implementation (When Constraints Allow)
1. **Disable meta-project guardian temporarily**
2. **Create physical folder structure**
3. **Update import paths in hooks**
4. **Update .claude/settings.json paths**
5. **Test and validate**
6. **Re-enable protections**

### Phase 3: Benefits Achieved
- **Clear organization** - Developers know where to find hooks
- **Purposeful grouping** - Related hooks are logically grouped
- **Friction alignment** - Categories map to friction points
- **Maintainability** - Easier to understand and extend

## Current Usage

All hooks remain in their original locations:
```
tools/hooks/[hook-name].js
```

But are now conceptually organized into the taxonomy above for better understanding and future development.

## Next Steps

1. **Use this taxonomy** when discussing hooks
2. **Reference categories** in documentation
3. **Plan new hooks** according to categories
4. **Implement physical structure** when meta-project constraints allow