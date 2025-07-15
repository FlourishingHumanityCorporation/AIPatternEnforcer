# AI Development Enforcement System Overview

**Last Updated**: 2025-07-14
**System Type**: Custom validation scripts called via Claude Code hooks
**Active Scripts**: 20 validation scripts in `tools/hooks/`

## What Is This System?

This is a **custom AI development enforcement system** that uses **official Claude Code hooks** to call validation scripts that prevent common AI development mistakes and enforce project standards.

### Key Distinction

- **Claude Code Hooks**: Official shell command execution system built into Claude Code
- **This System**: Custom validation scripts (20 Node.js files) called BY Claude Code hooks
- **Integration**: Official hooks → Custom scripts → Validation logic → Block/Allow decisions

The scripts in `tools/hooks/` are **NOT** Claude Code hooks themselves - they are custom validation scripts that receive the official Claude Code hook input format and return standard exit codes.

## System Architecture

### Execution Flow

```
AI Tool Request → Claude Code Hook Triggers → Custom Script Execution → Validation Logic → Block/Allow Decision
```

**Detailed Flow:**

1. **Claude Code detects tool usage** (Write/Edit/MultiEdit/etc.)
2. **Official Claude Code hooks trigger** (configured in `.claude/settings.json`)
3. **Custom validation scripts execute** (receive official hook input format)
4. **Scripts perform validation logic** (security, patterns, context, etc.)
5. **Scripts return exit codes** (0=allow, 2=block with feedback to Claude)
6. **Claude Code processes response** (continues or shows error to Claude)

### Custom Script Architecture

The 20 validation scripts implement a project-specific architecture:

- **Input Processing**: Parse official Claude Code hook JSON input
- **Validation Logic**: Implement specific rules (security, patterns, context)
- **Response Format**: Return standard exit codes and stderr messages
- **Shared Utilities**: Common libraries in `tools/hooks/lib/` for consistency

### Validation Script Categories (20 Active)

| Category                | Count | Purpose                         | Hook Event  |
| ----------------------- | ----- | ------------------------------- | ----------- |
| **File Hygiene**        | 2     | Prevent file pollution          | PreToolUse  |
| **Security**            | 2     | Security and scope validation   | PreToolUse  |
| **Context Quality**     | 1     | AI request validation           | PreToolUse  |
| **Pattern Enforcement** | 6     | Enforce development patterns    | PreToolUse  |
| **Architecture**        | 1     | Architecture pattern validation | PreToolUse  |
| **Performance**         | 1     | Performance monitoring          | PreToolUse  |
| **Testing**             | 1     | Test organization               | PreToolUse  |
| **Code Cleanup**        | 2     | Auto-fix common issues          | PostToolUse |
| **Validation**          | 3     | Post-operation validation       | PostToolUse |

**Note**: These are custom validation scripts, not Claude Code hooks. Each is called by legitimate Claude Code hooks configured in `.claude/settings.json`.

### Performance Characteristics

- **Total execution**: < 500ms for full hook chain
- **Architecture**: Fail-open (operations proceed if hooks error)
- **Family-based timeouts**: Optimized by hook category (1-4s)
- **Exit codes**: 0=allow, 2=block (not the typical 0/1 pattern)

### Shared Utilities Library (`tools/hooks/lib/`)

**HookRunner.js**: Base class providing:

- Standardized input/output processing
- Timeout management
- Error handling with fail-open architecture
- Debug mode support
- Performance monitoring

**FileAnalyzer.js**: File operations including:

- File type detection
- Path processing
- Content analysis

**PatternLibrary.js**: Centralized regex patterns for:

- Anti-patterns detection
- Security vulnerabilities
- Code quality issues

**ErrorFormatter.js**: Consistent error messaging with:

- Problem description
- Solution guidance
- Best practices tips
- Target outcomes

**PerformanceAnalyzer.js**: Performance monitoring including:

- Bundle size analysis
- Complexity metrics
- AI token usage estimation

## PreToolUse Hooks (Write|Edit|MultiEdit)

### 1. context-validator.js

**Purpose**: Validates tool parameters for quality and appropriateness
**Family**: validation (timeout: 3s)

**Scoring System**:

- **Write**: 6 points minimum
- **Edit**: 10 points minimum (strict threshold)
- **MultiEdit**: 12 points minimum (highest threshold)

**Common Blocks**:

- Single character edits (-21/10 score)
- Root directory files (-18/6 score)
- Generic placeholder content

### 2. prevent-improved-files.js

**Purpose**: Prevents creation of duplicate files with version suffixes
**Family**: file_hygiene (timeout: 1s)

**Blocked Patterns**:

- `*_improved.*`, `*_enhanced.*`, `*_v2.*`
- `*_fixed.*`, `*_updated.*`, `*_new.*`
- `*_final.*`, `*_refactored.*`, `*_better.*`

### 3. scope-limiter.js

**Purpose**: Limits AI operations to appropriate scope and complexity
**Family**: security (timeout: 4s)

**Blocks**: Overly broad operations that could affect multiple systems

### 4. security-scan.js

**Purpose**: Scans for security vulnerabilities and anti-patterns
**Family**: security (timeout: 4s)

**Detects**: Potential security issues in code changes

### 5. test-location-enforcer.js

**Purpose**: Enforces proper test file organization and placement
**Family**: testing (timeout: 3s)

**Test Organization Rules**:

- **Components**: Co-located tests (Component.test.tsx next to Component.tsx)
- **API Routes**: Co-located with route files
- **Meta-hooks**: Centralized in tools/hooks/**tests**/
- **Integration**: Top-level tests/ directory

### 6. enterprise-antibody.js

**Purpose**: Blocks enterprise features to keep projects simple
**Family**: pattern_enforcement (timeout: 2s)

**Blocked Categories**:

- Complex authentication systems
- Multi-environment deployments
- Production monitoring tools
- Payment processing
- Team collaboration features

### 7. architecture-validator.js (Consolidated Hook)

**Purpose**: Validates architectural patterns and AI integration
**Family**: architecture (timeout: 3s)

**Consolidates 3 previous hooks**:

- ai-integration-validator.js
- architecture-drift-detector.js
- enforce-nextjs-structure.js

**Validates**:

- Proper AI API usage patterns
- Framework-specific conventions
- Architectural consistency
- Directory structure compliance

### 8. mock-data-enforcer.js

**Purpose**: Enforces mock data over real authentication
**Family**: pattern_enforcement (timeout: 2s)

**Enforces**: Local development patterns with mockUser from lib/auth.ts

### 9. localhost-enforcer.js

**Purpose**: Ensures localhost-only development patterns
**Family**: pattern_enforcement (timeout: 2s)

**Blocks**: Production URLs, external service integrations

### 10. vector-db-hygiene.js

**Purpose**: Maintains vector database hygiene and performance
**Family**: data_hygiene (timeout: 2s)

**Validates**: Vector database operations and schema integrity

### 11. performance-guardian.js (Consolidated Hook)

**Purpose**: Comprehensive performance monitoring and optimization
**Family**: performance (timeout: 3s)

**Consolidates 5 previous hooks**:

- performance-checker.js
- performance-budget-keeper.js
- context-economy-guardian.js
- token-economics-guardian.js
- code-bloat-detector.js

**Monitors**:

- Bundle sizes and import costs
- Code complexity metrics
- AI token usage and costs
- Performance budgets
- Context window optimization

### 12. streaming-pattern-enforcer.js

**Purpose**: Enforces proper streaming patterns for AI responses
**Family**: pattern_enforcement (timeout: 2s)

**Validates**: Streaming implementation and error handling

### 13. docs-enforcer.js (Consolidated Hook)

**Purpose**: Enforces documentation standards and organization
**Family**: documentation (timeout: 2s)

**Consolidates 2 previous hooks**:

- docs-lifecycle-enforcer.js
- docs-organization-enforcer.js

**Enforces**:

- Single source of truth for documentation
- Proper document placement
- Blocks completion/announcement patterns
- Maintains clean documentation structure

## PreToolUse Hooks (Write Only)

### 14. block-root-mess.js

**Purpose**: Prevents application files in root directory (Write operations only)
**Family**: file_hygiene (timeout: 2s)

**Allowed**: Config files, documentation, CI/CD files
**Blocked**: Components, app code, framework configs

## PostToolUse Hooks (Write|Edit|MultiEdit)

### 15. fix-console-logs.js

**Purpose**: Auto-converts console.log to proper logger calls
**Family**: code_cleanup (timeout: 3s)

**Conversions**:

- `console.log` → `logger.info`
- `console.error` → `logger.error`
- `console.warn` → `logger.warn`

### 16. validate-prisma.js

**Purpose**: Validates Prisma schema and operations
**Family**: validation (timeout: 2s)

**Checks**: Schema integrity, migration consistency, query optimization

### 17. api-validator.js

**Purpose**: Validates API routes and endpoints
**Family**: validation (timeout: 4s)

**Ensures**: Proper API structure, error handling, and security

### 18. template-integrity-validator.js

**Purpose**: Validates template integrity and consistency
**Family**: validation (timeout: 2s)

**Ensures**: Template structure and content validity

### 19. import-janitor.js

**Purpose**: Cleans up unused imports
**Family**: code_cleanup (timeout: 3s)

**Features**:

- Removes unused imports
- Sorts import statements
- Optimizes import paths

## Additional Hook Events

Beyond the core PreToolUse and PostToolUse events, Claude Code supports several additional hook events:

### Notification Hooks

**Purpose**: Execute when Claude Code sends notifications
**Triggers**:

- Claude needs permission to use a tool
- Prompt input has been idle for 60+ seconds
  **Use Cases**: Custom notification systems, logging, awareness alerts

### Stop Hooks

**Purpose**: Execute when the main Claude Code agent finishes responding
**Triggers**: Agent completion (not user interruption)
**Use Cases**: Session logging, cleanup tasks, final validations
**Special**: Can block stoppage and force continuation

### SubagentStop Hooks

**Purpose**: Execute when a subagent (Task tool call) finishes responding
**Triggers**: Task tool completion
**Use Cases**: Subagent result processing, chaining operations
**Special**: Can block stoppage and force continuation

### PreCompact Hooks

**Purpose**: Execute before Claude Code runs a compact operation
**Triggers**:

- Manual compact (`/compact` command)
- Auto-compact (full context window)
  **Use Cases**: Context preparation, state saving, optimization

## Configuration

All hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/prevent-improved-files.js",
            "timeout": 2
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/fix-console-logs.js",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

## Testing Hooks

### Manual Testing

```bash
# Test prevent-improved-files
echo '{"tool_name": "Write", "tool_input": {"file_path": "test_improved.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js

# Test context-validator
echo '{"tool_name": "Edit", "tool_input": {"file_path": "/test.js", "old_string": "a", "new_string": "b"}}' | node tools/hooks/context-validator.js
```

### Automated Testing

```bash
# Run all hook tests
find tools/hooks -name "*.test.js" | grep -v jest | xargs -I{} node {}

# Performance testing
time echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/meta-project-guardian.js
```

## Key Benefits

1. **Prevents Common Mistakes**: Blocks duplicate files, enterprise complexity
2. **Maintains Code Quality**: Enforces tests, proper logging, security
3. **Optimizes AI Interactions**: Validates parameters, prevents low-quality edits
4. **Auto-Fixes Issues**: Cleans up imports, converts console.log, validates schemas
5. **Preserves Project Structure**: Keeps files organized, prevents root directory mess

## Important Notes

- **Session Loading**: Hooks are loaded once at Claude Code session start
- **Configuration Changes**: Require new session to take effect
- **Fail-Open Architecture**: Operations proceed if hooks error
- **Performance**: All hooks combined execute in < 500ms

## Security Considerations

### ⚠️ Critical Security Warning

**USE AT YOUR OWN RISK**: Claude Code hooks execute arbitrary shell commands on your system automatically. By using hooks, you acknowledge that:

- You are solely responsible for the commands you configure
- Hooks can modify, delete, or access any files your user account can access
- Malicious or poorly written hooks can cause data loss or system damage
- Anthropic provides no warranty and assumes no liability for any damages resulting from hook usage
- You should thoroughly test hooks in a safe environment before production use

Always review and understand any hook commands before adding them to your configuration.

### Security Best Practices

1. **Validate and sanitize inputs** - Never trust input data blindly
2. **Always quote shell variables** - Use `"$VAR"` not `$VAR`
3. **Block path traversal** - Check for `..` in file paths
4. **Use absolute paths** - Specify full paths for scripts
5. **Skip sensitive files** - Avoid `.env`, `.git/`, keys, etc.
6. **Test thoroughly** - Test hooks in isolated environments first
7. **Principle of least privilege** - Only grant necessary permissions

### Configuration Safety

Claude Code provides protection against malicious hook modifications:

1. Captures a snapshot of hooks at startup
2. Uses this snapshot throughout the session
3. Warns if hooks are modified externally
4. Requires review in `/hooks` menu for changes to apply

This prevents malicious hook modifications from affecting your current session.

## Next Steps

- **[Configuration Guide](./02-hooks-configuration.md)** - Setup and customization
- **[Hook Reference](./04-hooks-reference.md)** - Complete documentation for all 20 hooks
- **[Development Guide](./05-hooks-development.md)** - Creating custom hooks
- **[Usage Examples](./06-hooks-examples.md)** - Real-world scenarios
- **[Testing Guide](./07-hooks-testing.md)** - Testing procedures
- **[Performance Guide](./08-hooks-performance.md)** - Performance optimization
- **[Troubleshooting Guide](./03-hooks-troubleshooting.md)** - Debug and resolve issues
- **[Official Documentation](./00-hooks-official-documentation.md)** - Complete reference from Anthropic
- **[Main Documentation Index](./README.md)** - Complete hooks system documentation

## Additional Resources

For the complete official Claude Code hooks reference, see the [Official Documentation](./00-hooks-official-documentation.md) which provides:

- Full coverage of all 6 hook events (including Notification, Stop, SubagentStop, PreCompact not covered in this overview)
- Complete JSON input/output schemas with all field descriptions
- Advanced JSON output control options (decision, continue, stopReason)
- Comprehensive security warnings and best practices
- MCP (Model Context Protocol) integration patterns
- Complete configuration examples and debugging guidance
