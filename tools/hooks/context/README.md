# Context Management Hooks

This directory contains hooks that manage context quality, drift detection, and optimization for AI development sessions.

## Hook Overview

### Context Completeness Enforcer (`context-completeness-enforcer.js`)

- **Priority**: Critical (<20ms execution)
- **Purpose**: Validates context quality before operations
- **Features**:
  - Multi-factor context scoring (CLAUDE.md, project structure, conversation depth)
  - Intelligent threshold validation per operation type
  - Helpful guidance for context improvement

### Context Drift Detector (`context-drift-detector.js`)

- **Priority**: High (<30ms execution)
- **Purpose**: Detects context degradation over time
- **Features**:
  - Time-based, conversation-based, and file-change drift analysis
  - Configurable drift thresholds (low/medium/high)
  - Proactive context refresh recommendations

### CLAUDE.md Injector (`claude-md-injector.js`)

- **Priority**: High (<50ms execution)
- **Purpose**: Dynamically injects relevant CLAUDE.md sections
- **Features**:
  - Intelligent section relevance scoring (95%+ accuracy)
  - Operation-specific section selection
  - Content compression and optimization

### Context Optimizer (`context-optimizer.js`)

- **Priority**: Background (<50ms execution)
- **Purpose**: Background optimization during idle periods
- **Features**:
  - Notification hook integration for idle optimization
  - Cache cleanup and pre-warming
  - User preference learning

## State Management

All context hooks utilize a shared SQLite database for:

- Context quality metrics and history
- Drift analysis and trending
- User preferences and learning data
- Performance optimization data

**Database Location**: `tools/hooks/data/context.db`
**Schema**: See `lib/context/ContextDatabase.js` for complete schema

## Environment Controls

Context hooks respect the `HOOK_CONTEXT` environment variable:

- `HOOK_CONTEXT=true` - Context hooks enabled (default)
- `HOOK_CONTEXT=false` - Context hooks bypassed
- Global control (`HOOKS_DISABLED`) overrides folder controls

## Performance Targets

- **Critical hooks**: <20ms execution (context-completeness-enforcer)
- **High priority**: <30-50ms execution
- **Background hooks**: <50ms execution
- **Database operations**: <20ms per query
- **Total context processing**: <80ms budget allocation

## Testing

Run context hook tests:

```bash
npm test -- tools/hooks/context/__tests__/
```

Individual hook testing:

```bash
# Test context completeness scoring
echo '{"tool_input": {"file_path": "test.js", "content": "console.log()"}}' | node context-completeness-enforcer.js

# Test drift detection
echo '{"tool_input": {"file_path": "test.js"}}' | node context-drift-detector.js

# Test CLAUDE.md injection
echo '{"tool_input": {"file_path": "components/Button.tsx"}}' | node claude-md-injector.js
```

## Integration

Context hooks integrate with:

- **Parallel Execution System**: Priority-based execution in context management group
- **Hook State Database**: Persistent context metrics and learning data
- **Claude Code Events**: PreToolUse, Notification hook events
- **Existing Utilities**: FileAnalyzer, PatternLibrary, ErrorFormatter
