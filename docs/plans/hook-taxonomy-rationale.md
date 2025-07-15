# Hook Taxonomy Design Rationale

## Key Distinction: Proactive vs Reactive

### ai-patterns/ (Proactive Prevention)

**Purpose**: Guide AI behavior before it makes mistakes
**Hook Event**: PreToolUse - intercepts before operations
**Philosophy**: "Prevent the mistake from happening"

Examples:

- `prevent-improved-files.js` - Stops AI from creating duplicate files
- `context-validator.js` - Ensures AI requests have sufficient context
- `streaming-pattern-enforcer.js` - Enforces proper streaming patterns

### cleanup/ (Reactive Correction)

**Purpose**: Fix common mistakes after they occur
**Hook Event**: PostToolUse - runs after operations complete
**Philosophy**: "Clean up the mess automatically"

Examples:

- `fix-console-logs.js` - Converts console.log to logger.info
- `import-janitor.js` - Removes unused imports
- `docs-enforcer.js` - Fixes documentation patterns

## Why This Separation Matters

1. **Clear Mental Model**: Developers immediately understand hook purpose
2. **Event Alignment**: PreToolUse hooks prevent, PostToolUse hooks correct
3. **Different Skills**: Prevention requires pattern recognition, cleanup requires transformation
4. **Performance**: Prevention hooks must be fast, cleanup hooks can be thorough
5. **Testing Strategy**: Prevention tests check blocking, cleanup tests check transformation

## Complete Taxonomy

### 8 Categories, 19 Hooks

1. **ai-patterns/** (3) - Proactive AI guidance
2. **cleanup/** (3) - Reactive fixes
3. **project-boundaries/** (3) - Structure protection
4. **local-dev/** (2) - Local-only enforcement
5. **validation/** (3) - Data validation
6. **architecture/** (2) - Pattern enforcement
7. **performance/** (2) - Performance monitoring
8. **security/** (2) - Security enforcement

This creates a balanced, discoverable structure where each category has a clear purpose and reasonable number of hooks.
