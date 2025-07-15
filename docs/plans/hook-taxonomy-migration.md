# Hook Taxonomy Migration Plan

## Overview

Reorganize hooks from flat structure to folder-based taxonomy aligned with friction points from FRICTION-MAPPING.md.

## New Folder Structure

```
tools/hooks/
├── ai-patterns/
│   ├── prevent-improved-files.js
│   ├── context-validator.js
│   └── streaming-pattern-enforcer.js
├── cleanup/
│   ├── fix-console-logs.js
│   ├── import-janitor.js
│   └── docs-enforcer.js
├── project-boundaries/
│   ├── block-root-mess.js
│   ├── enterprise-antibody.js
│   └── meta-project-guardian.js
├── local-dev/
│   ├── localhost-enforcer.js
│   └── mock-data-enforcer.js
├── validation/
│   ├── validate-prisma.js
│   ├── api-validator.js
│   └── template-integrity-validator.js
├── architecture/
│   ├── architecture-validator.js
│   └── test-location-enforcer.js
├── performance/
│   ├── performance-guardian.js
│   └── vector-db-hygiene.js
├── security/
│   ├── security-scan.js
│   └── scope-limiter.js
├── lib/
│   └── [shared utilities remain here]
└── __tests__/
    └── [tests organized by category]
```

## Rationale

### Alignment with Friction Points

- **ai-patterns** → Proactive AI behavior guidance
  - Prevents AI-specific anti-patterns (improved files, poor context, streaming issues)
- **cleanup** → Reactive fixes for common mistakes
  - Automatically corrects issues after they occur
- **project-boundaries** → Meta-project protection & architectural drift
- **local-dev** → New category: Local-only development enforcement
- **validation** → Friction 2: Generation Inaccuracy & Unreliability
- **architecture** → Friction 3.1: Architectural Drift
- **performance** → Friction 3.4: Performance Blindness
- **security** → Friction 4: Security & Compliance Vulnerabilities

### Family Mapping

| Old Family          | New Folder                                         | Rationale                                        |
| ------------------- | -------------------------------------------------- | ------------------------------------------------ |
| file_hygiene        | ai-patterns                                        | AI-specific file creation patterns               |
| pattern_enforcement | Split across local-dev, architecture, ai-patterns  | Better specificity                               |
| validation          | Split between ai-patterns (context) and validation | Context validation is AI-specific                |
| security            | security                                           | Direct mapping                                   |
| performance         | performance                                        | Direct mapping                                   |
| code_cleanup        | cleanup                                            | Reactive fixes, separate from proactive patterns |
| documentation       | cleanup                                            | Documentation cleanup is reactive                |
| testing             | architecture                                       | Test organization is architectural               |
| architecture        | architecture                                       | Direct mapping                                   |
| data_hygiene        | performance                                        | Vector DB performance focus                      |

## Migration Steps

### Phase 1: Preparation (Day 1)

1. Create new folder structure
2. Update shared library imports to support both paths
3. Create category README files explaining purpose

### Phase 2: File Movement (Day 2)

1. Copy (not move) hooks to new locations
2. Update import paths in copied hooks
3. Run parallel testing

### Phase 3: Configuration Updates (Day 3)

1. Update `.claude/settings.json` incrementally
2. Test each hook after path update
3. Update documentation references

### Phase 4: Cleanup (Day 4)

1. Remove old hook files
2. Update all tests
3. Performance validation

## Configuration Changes

### Example Update

```json
// Before
{
  "command": "node tools/hooks/prevent-improved-files.js",
  "timeout": 2
}

// After
{
  "command": "node tools/hooks/code-quality/prevent-improved-files.js",
  "timeout": 2
}
```

## Testing Strategy

### Unit Tests

- Update test imports
- Verify all hooks still function
- Check timeout configurations

### Integration Tests

- Full Claude Code session test
- Verify all hooks trigger correctly
- Performance benchmarks

### Rollback Plan

1. Git branch: `feature/hook-taxonomy-refactor`
2. Keep original structure until validated
3. One-command rollback via git

## Success Criteria

- All 20 hooks function identically
- No performance degradation
- Clear improvement in code organization
- Documentation updated
