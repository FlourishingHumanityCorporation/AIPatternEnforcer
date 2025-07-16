````markdown
# AI Development Enforcement System

**Last Updated**: 2025-07-14
**System Type**: Custom validation scripts called via Claude Code hooks
**Active Scripts**: 20 validation scripts in `tools/hooks/`

This guide covers the **custom AI development enforcement system** implemented in AIPatternEnforcer. This system uses **legitimate Claude Code hooks** to call custom validation scripts that provide **limited file-level pattern enforcement** (addresses ~31% of AI development friction) by intercepting file operations and providing real-time feedback.

**⚠️ Important**: This system only addresses file organization patterns. It cannot prevent AI model limitations, workflow friction, or interaction issues.

## ⚠️ Important Distinction

This is **NOT** the official Claude Code hooks system. This is a **custom enforcement system** that:

- Uses legitimate Claude Code hooks (configured in `.claude/settings.json`)
- Calls custom validation scripts (`tools/hooks/*.js`)
- Implements project-specific patterns and validations
- Runs within the official Claude Code hooks framework

**For official Claude Code hooks documentation, see**: [00-hooks-official-documentation.md](./00-hooks-official-documentation.md)

## 📚 Complete Documentation Guide

### Core Documentation

- **[00-hooks-official-documentation.md](./00-hooks-official-documentation.md)** - Official Claude Code hooks documentation
- **[01-hooks-overview.md](./01-hooks-overview.md)** - Custom enforcement system architecture
- **[02-hooks-configuration.md](./02-hooks-configuration.md)** - Claude Code hooks + custom scripts setup
- **[03-hooks-troubleshooting.md](./03-hooks-troubleshooting.md)** - Debug and resolve issues
- **[04-hooks-reference.md](./04-hooks-reference.md)** - Complete reference for all 20 validation scripts
- **[05-hooks-development.md](./05-hooks-development.md)** - Developing custom validation scripts
- **[06-hooks-examples.md](./06-hooks-examples.md)** - Real-world Claude Code hook configurations
- **[07-hooks-testing.md](./07-hooks-testing.md)** - Testing validation scripts and hook configs
- **[08-hooks-performance.md](./08-hooks-performance.md)** - Optimizing validation script performance

### Quick Start

1. **New to system?** → Start with [00-hooks-official-documentation.md](./00-hooks-official-documentation.md) (official docs)
2. **Custom system overview?** → Read [01-hooks-overview.md](./01-hooks-overview.md)
3. **Setup needed?** → Follow [02-hooks-configuration.md](./02-hooks-configuration.md)
4. **Issues?** → Check [03-hooks-troubleshooting.md](./03-hooks-troubleshooting.md)
5. **Script reference?** → Use [04-hooks-reference.md](./04-hooks-reference.md)

## System Overview

This custom enforcement system uses **official Claude Code hooks** to call **20 custom validation scripts** that provide **limited file-level pattern enforcement** for a subset of AI development friction.

### How It Works

1. **Claude Code Hook Triggers**: Configured in `.claude/settings.json` using official Claude Code hooks API
2. **Custom Script Execution**: Hooks call validation scripts in `tools/hooks/` directory
3. **Standard Input/Output**: Scripts receive official Claude Code hook input format
4. **Validation Logic**: Each script implements specific validation rules
5. **Response Handling**: Scripts return standard exit codes (0=allow, 2=block)

### Validation Script Categories

| Category            | Scripts | Purpose                | Examples                                            |
| ------------------- | ------- | ---------------------- | --------------------------------------------------- |
| **File Hygiene**    | 2       | Prevent file pollution | `prevent-improved-files.js`, `block-root-mess.js`   |
| **Security**        | 2       | Security validation    | `security-scan.js`, `scope-limiter.js`              |
| **Context Quality** | 1       | AI request validation  | `context-validator.js`                              |
| **Architecture**    | 1       | Pattern compliance     | `architecture-validator.js` (consolidated)          |
| **Enforcement**     | 6       | Development patterns   | `enterprise-antibody.js`, `mock-data-enforcer.js`   |
| **Auto-Cleanup**    | 5       | Post-processing        | `fix-console-logs.js`, `import-janitor.js`          |
| **Other**           | 2       | Specialized validation | `vector-db-hygiene.js`, `test-location-enforcer.js` |

**Execution**: Each script runs when triggered by Claude Code hooks (<500ms total)

## Actual Claude Code Hook Configuration

This system is implemented using **legitimate Claude Code hooks** that call custom validation scripts:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/context-validator.js",
            "timeout": 3
          },
          {
            "type": "command",
            "command": "node tools/hooks/prevent-improved-files.js",
            "timeout": 1
          },
          {
            "type": "command",
            "command": "node tools/hooks/security-scan.js",
            "timeout": 4
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
          },
          {
            "type": "command",
            "command": "node tools/hooks/import-janitor.js",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```
````

### Script Input Format (Official Claude Code Schema)

Scripts receive the **official Claude Code hook input format**:

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../transcript.jsonl",
  "hook_event_name": "PreToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  }
}
```

## Example Error Messages

The v3.0 system provides consistent, actionable error messages with clear guidance:

```
❌ Don't create component_improved.tsx
✅ Edit the original file instead

🔒 Security issues detected:
🔴 XSS vulnerability: innerHTML with user data
✅ Use textContent or sanitize with DOMPurify

🎯 Scope too broad for focused development
❌ 6 features detected (limit: 5)
✅ Break into focused tasks
```

## Quick Commands

### Testing Hooks

```bash
# Test individual hook
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js

# Run all hook tests
npm test tools/hooks/__tests__/

# Performance benchmarks
npm test tools/hooks/__tests__/performance/
```

### Debugging

```bash
# Enable debug mode
DEBUG=claude-hooks node tools/hooks/security-scan.js

# Check hook configuration
cat .claude/settings.json | jq .
```

## Key Benefits

### For AI Development

- **Prevents Common Mistakes**: Blocks duplicate files, enterprise complexity
- **Maintains Code Quality**: Enforces tests, proper logging, security
- **Optimizes AI Interactions**: Validates parameters, prevents low-quality edits
- **Auto-Fixes Issues**: Cleans up imports, converts console.log, validates schemas

### Performance Characteristics

- **Total execution**: <500ms for full hook chain (target: 380ms)
- **Architecture**: Fail-open (operations proceed if hooks error)
- **Family-based timeouts**: Optimized by hook category (1-4s)
- **Concurrent execution**: Hooks run in parallel where possible

## 🚀 Getting Started

1. **Learn the System**: Read [01-hooks-overview.md](./01-hooks-overview.md)
2. **Setup Configuration**: Follow [02-hooks-configuration.md](./02-hooks-configuration.md)
3. **Understand Each Hook**: Reference [04-hooks-reference.md](./04-hooks-reference.md)
4. **Troubleshoot Issues**: Use [03-hooks-troubleshooting.md](./03-hooks-troubleshooting.md)
5. **Create Custom Hooks**: Study [05-hooks-development.md](./05-hooks-development.md)
6. **Test Your Hooks**: Apply [07-hooks-testing.md](./07-hooks-testing.md)
7. **Optimize Performance**: Follow [08-hooks-performance.md](./08-hooks-performance.md)

## 📖 Documentation Navigation

| Topic               | File                                                         | Purpose                                            |
| ------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| **Overview**        | [01-hooks-overview.md](./01-hooks-overview.md)               | System architecture, categories, benefits          |
| **Setup**           | [02-hooks-configuration.md](./02-hooks-configuration.md)     | Configuration, family management, session handling |
| **Troubleshooting** | [03-hooks-troubleshooting.md](./03-hooks-troubleshooting.md) | Common issues, debugging, solutions                |
| **Reference**       | [04-hooks-reference.md](./04-hooks-reference.md)             | Complete reference for all 20 hooks                |
| **Development**     | [05-hooks-development.md](./05-hooks-development.md)         | Creating custom hooks with HookRunner              |
| **Examples**        | [06-hooks-examples.md](./06-hooks-examples.md)               | Real-world usage scenarios                         |
| **Testing**         | [07-hooks-testing.md](./07-hooks-testing.md)                 | Testing methodology and procedures                 |
| **Performance**     | [08-hooks-performance.md](./08-hooks-performance.md)         | Optimization and monitoring                        |

---

The Claude Code hooks system (v3.0) provides limited file-level pattern enforcement through real-time validation. While useful for file organization and basic patterns, it addresses only ~31% of AI development friction and cannot prevent model limitations, workflow issues, or interaction problems.

```

```
