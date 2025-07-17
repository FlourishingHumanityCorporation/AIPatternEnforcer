# Claude Code Hooks Configuration Guide

**Last Updated**: 2025-07-15
**System Version**: 3.0
**Configuration File**: `.claude/settings.json`

## Overview

This guide covers how to configure Claude Code hooks for the AI Pattern Enforcer custom validation system. Learn how to set up hooks, manage families, handle sessions, and customize behavior.

## Table of Contents

1. [Basic Configuration](#basic-configuration)
2. [Hook Families](#hook-families)
3. [Session Management](#session-management)
4. [Timeout Configuration](#timeout-configuration)
5. [Testing Mode](#testing-mode)
6. [Advanced Configuration](#advanced-configuration)
7. [Troubleshooting](#troubleshooting)

## Basic Configuration

### Configuration File Location

Claude Code hooks are configured in `.claude/settings.json` at the project root:

```json
{
  "hooks": {
    "PreToolUse": [],
    "PostToolUse": []
  }
}
```

### Basic Hook Structure

Each hook entry requires:

```json
{
  "type": "command",
  "command": "node tools/hooks/[hook-name].js",
  "timeout": 2,
  "family": "category_name",
  "priority": "critical|high|medium|low",
  "description": "What this hook does"
}
```

### Matcher Configuration

Hooks can be scoped to specific tools using matchers:

```json
{
  "matcher": "Write|Edit|MultiEdit",
  "hooks": [
    // Hooks that only run for these tools
  ]
}
```

## Hook Families

Hooks are organized into families for better management:

| Family                        | Purpose                    | Example Hooks                           | Priority | Timeout |
| ----------------------------- | -------------------------- | --------------------------------------- | -------- | ------- |
| **infrastructure_protection** | Protect meta-project files | meta-project-guardian                   | critical | 2s      |
| **file_hygiene**              | Prevent file pollution     | prevent-improved-files, block-root-mess | critical | 1-2s    |
| **security**                  | Security validation        | security-scan, scope-limiter            | high     | 4s      |
| **validation**                | Content validation         | context-validator, api-validator        | high     | 3-4s    |
| **pattern_enforcement**       | Enforce patterns           | enterprise-antibody, mock-data-enforcer | medium   | 2s      |
| **architecture**              | Architecture validation    | architecture-validator                  | high     | 3s      |
| **performance**               | Performance monitoring     | performance-guardian                    | high     | 3s      |
| **testing**                   | Test organization          | test-location-enforcer                  | medium   | 3s      |
| **code_cleanup**              | Auto-fix issues            | fix-console-logs, import-janitor        | low      | 3s      |
| **documentation**             | Doc standards              | docs-enforcer                           | medium   | 2s      |
| **data_hygiene**              | Data quality               | vector-db-hygiene                       | medium   | 2s      |

## Session Management

### ⚠️ Critical: Configuration Changes Require New Session

**Hook configuration changes in `.claude/settings.json` are only refreshed when starting a new Claude Code instance.**

- Hooks are loaded **once** when Claude Code session starts
- Changes to `.claude/settings.json` do **not** take effect in current session
- **To apply changes**: Exit Claude Code completely and restart
- Use `/hooks` command to view currently active configuration (from session start)
- Configuration file changes while session is running are ignored

### Session Lifecycle

1. **Session Start**: Claude Code reads `.claude/settings.json` once
2. **During Session**: Configuration is cached and unchangeable
3. **File Changes**: Modifications to `.claude/settings.json` are ignored
4. **Session End**: Configuration cache is cleared
5. **New Session**: Fresh configuration is loaded from `.claude/settings.json`

### Viewing Active Configuration

To see the hooks loaded for the current session:

```bash
# In Claude Code
/hooks
```

This shows:

- Currently active hooks
- Their configuration at session start
- Any differences from current file

## Timeout Configuration

### Recommended Timeouts by Family

```json
{
  "infrastructure_protection": 2,
  "file_hygiene": 1-2,
  "security": 4,
  "validation": 3-4,
  "pattern_enforcement": 2,
  "architecture": 3,
  "performance": 3,
  "testing": 3,
  "code_cleanup": 3,
  "documentation": 2,
  "data_hygiene": 2
}
```

### Performance Budget

- **Target**: < 500ms total execution for all hooks
- **Critical path**: PreToolUse hooks on Write operations
- **Optimization**: Use shortest timeouts that allow completion

## Testing Mode

### Bypass Hooks for Testing

When developing or testing hooks themselves:

```bash
# Set environment variable
export HOOKS_DISABLED=true

# Or in .env
HOOKS_DISABLED=true
```

This bypasses:

- meta-project-guardian.js (allows hook file edits)
- Other infrastructure protection

### Testing Individual Hooks

```bash
# Test a specific hook
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js

# Test with debug output
DEBUG=claude-hooks node tools/hooks/security-scan.js < test-input.json
```

## Advanced Configuration

### Conditional Hook Execution

Use different matchers for different scenarios:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          // Write-only hooks like block-root-mess
        ]
      },
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          // All file modification hooks
        ]
      }
    ]
  }
}
```

### Hook Priorities

Priorities affect execution order and error handling:

- **critical**: Must succeed, failures block operations
- **high**: Important validation, logged failures
- **medium**: Standard checks, silent failures
- **low**: Nice-to-have, always fail-open

### Custom Hook Parameters

While not officially supported, hooks can read environment variables:

```bash
# Custom configuration
export ENFORCE_STRICT_MODE=true
export MAX_FILE_SIZE=100000
```

## Complete Example Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/meta-project-guardian.js",
            "timeout": 2,
            "family": "infrastructure_protection",
            "priority": "critical",
            "description": "Protects meta-project infrastructure from AI modifications"
          },
          {
            "type": "command",
            "command": "node tools/hooks/context-validator.js",
            "timeout": 3,
            "family": "validation",
            "priority": "high",
            "description": "Validates context efficiency and prevents pollution"
          },
          {
            "type": "command",
            "command": "node tools/hooks/prevent-improved-files.js",
            "timeout": 1,
            "family": "file_hygiene",
            "priority": "critical",
            "description": "Prevents duplicate file creation patterns"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/block-root-mess.js",
            "timeout": 2,
            "family": "file_hygiene",
            "priority": "critical",
            "description": "Prevents root directory pollution"
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
            "timeout": 3,
            "family": "code_cleanup",
            "priority": "medium",
            "description": "Auto-fixes console.log statements"
          },
          {
            "type": "command",
            "command": "node tools/hooks/import-janitor.js",
            "timeout": 3,
            "family": "code_cleanup",
            "priority": "low",
            "description": "Cleans up unused imports"
          }
        ]
      }
    ]
  }
}
```

## Troubleshooting

### Hooks Not Running

1. **Check session**: Did you restart Claude Code after changes?
2. **Verify syntax**: Is `.claude/settings.json` valid JSON?
3. **Check paths**: Are hook commands using correct paths?
4. **Test manually**: Run hook command directly in terminal

### Performance Issues

1. **Check timeouts**: Are they appropriate for hook complexity?
2. **Monitor execution**: Use `time` command to measure
3. **Debug mode**: Enable `DEBUG=claude-hooks` for timing info
4. **Reduce scope**: Use specific matchers to limit execution

### Configuration Not Loading

1. **Verify location**: Must be `.claude/settings.json` in project root
2. **Check permissions**: File must be readable
3. **Validate JSON**: Use `jq` or online validator
4. **Start fresh**: Close all Claude Code instances and restart

## Best Practices

1. **Start minimal**: Add hooks incrementally
2. **Test thoroughly**: Verify each hook works before adding more
3. **Monitor performance**: Keep total execution under 500ms
4. **Document changes**: Note why each hook was added
5. **Regular review**: Remove hooks no longer needed

## Next Steps

- [Hooks Overview](./01-hooks-overview.md) - System architecture
- [Hooks Reference](./04-hooks-reference.md) - Individual hook documentation
- [Hooks Development](./05-hooks-development.md) - Creating custom hooks
- [Hooks Testing](./07-hooks-testing.md) - Testing procedures
- [Troubleshooting](./03-hooks-troubleshooting.md) - Common issues
