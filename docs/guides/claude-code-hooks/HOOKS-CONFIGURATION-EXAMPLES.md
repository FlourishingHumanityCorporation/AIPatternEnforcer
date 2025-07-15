# Hooks Configuration Examples - Disable & Customize

**Last Updated**: 2025-07-15  
**Purpose**: Practical configuration examples for hook management  
**Target**: Developers needing to customize hook behavior

## 🔧 Basic Disable Methods

### Method 1: Temporary Disable with \_disabled Flag

Add `"_disabled": true` to any hook configuration:

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
            "timeout": 2,
            "_disabled": true
          }
        ]
      }
    ]
  }
}
```

### Method 2: Remove Hook from Array

Simply delete the hook object from the array:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          // Removed prevent-improved-files.js hook entirely
          {
            "type": "command",
            "command": "node tools/hooks/block-root-mess.js",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

### Method 3: Comment Out (JSON5 Style - Not Recommended)

Standard JSON doesn't support comments, but some tools allow:

```json5
{
  hooks: {
    PreToolUse: [
      {
        matcher: "Write|Edit|MultiEdit",
        hooks: [
          // {
          //   "type": "command",
          //   "command": "node tools/hooks/prevent-improved-files.js",
          //   "timeout": 2
          // },
          {
            type: "command",
            command: "node tools/hooks/block-root-mess.js",
            timeout: 2,
          },
        ],
      },
    ],
  },
}
```

## 🎯 Selective Hook Disabling

### Disable Only File Naming Enforcement

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          // ❌ Disabled - Allow _improved files temporarily
          // {
          //   "type": "command",
          //   "command": "node tools/hooks/prevent-improved-files.js",
          //   "timeout": 2
          // },
          {
            "type": "command",
            "command": "node tools/hooks/block-root-mess.js",
            "timeout": 2
          },
          {
            "type": "command",
            "command": "node tools/hooks/enterprise-antibody.js",
            "timeout": 3
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

### Disable Enterprise Enforcement Only

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
          },
          {
            "type": "command",
            "command": "node tools/hooks/block-root-mess.js",
            "timeout": 2
          }
          // ❌ Disabled enterprise-antibody.js and mock-data-enforcer.js
          // to allow enterprise features temporarily
        ]
      }
    ]
  }
}
```

### Disable Auto-Fix Hooks Only

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
          },
          {
            "type": "command",
            "command": "node tools/hooks/enterprise-antibody.js",
            "timeout": 3
          }
        ]
      }
    ]
    // ❌ Disabled all PostToolUse hooks - no auto-fixing
    // "PostToolUse": []
  }
}
```

## 🚨 Emergency Configurations

### Complete Hook Bypass (Emergency Only)

```json
{
  "hooks": {
    "PreToolUse": [],
    "PostToolUse": []
  }
}
```

**Use Case**: When all hooks are malfunctioning and you need immediate access

**Warning**: No protection or auto-fixing - use temporarily only

### Core Protection Only

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
          },
          {
            "type": "command",
            "command": "node tools/hooks/block-root-mess.js",
            "timeout": 2
          }
        ]
      }
    ],
    "PostToolUse": []
  }
}
```

**Use Case**: Keep essential protections, disable everything else

### Validation Only (No Blocking)

```json
{
  "hooks": {
    "PreToolUse": [],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/validate-prisma.js",
            "timeout": 3
          },
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

**Use Case**: Get feedback without blocking operations

## 🔧 Performance Optimization

### Increase Timeouts for Slow Systems

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
            "timeout": 5
          },
          {
            "type": "command",
            "command": "node tools/hooks/enterprise-antibody.js",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Reduce Hook Load

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          // Keep only most critical hooks
          {
            "type": "command",
            "command": "node tools/hooks/prevent-improved-files.js",
            "timeout": 2
          },
          {
            "type": "command",
            "command": "node tools/hooks/security-scan.js",
            "timeout": 3
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          // Single auto-fix hook
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

## 🎯 Specific Workflow Configurations

### Development Mode (Permissive)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          // Only critical protection
          {
            "type": "command",
            "command": "node tools/hooks/security-scan.js",
            "timeout": 3
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          // Auto-fix everything
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

### Production Preparation (Strict)

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
          },
          {
            "type": "command",
            "command": "node tools/hooks/block-root-mess.js",
            "timeout": 2
          },
          {
            "type": "command",
            "command": "node tools/hooks/enterprise-antibody.js",
            "timeout": 3
          },
          {
            "type": "command",
            "command": "node tools/hooks/security-scan.js",
            "timeout": 3
          },
          {
            "type": "command",
            "command": "node tools/hooks/context-validator.js",
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
          },
          {
            "type": "command",
            "command": "node tools/hooks/validate-prisma.js",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

### Template Development (Protected)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/template-integrity-validator.js",
            "timeout": 3
          },
          {
            "type": "command",
            "command": "node tools/hooks/block-root-mess.js",
            "timeout": 2
          }
        ]
      }
    ],
    "PostToolUse": []
  }
}
```

## 📋 Configuration Management

### Backup Current Configuration

```bash
# Create backup before changes
cp .claude/settings.json .claude/settings.json.backup

# Restore if needed
mv .claude/settings.json.backup .claude/settings.json
```

### Test Configuration Changes

```bash
# Validate JSON syntax
cat .claude/settings.json | jq .

# Test specific hook manually
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js
```

### Version Control Configuration Changes

```bash
# Track configuration changes
git add .claude/settings.json
git commit -m "Update hooks: disable enterprise enforcement for feature development"

# Create branches for different configurations
git checkout -b development-config
# Edit .claude/settings.json for development
git add .claude/settings.json
git commit -m "Development configuration: permissive hooks"
```

## 🔄 Session Management

### Apply Configuration Changes

1. **Edit configuration**: Modify `.claude/settings.json`
2. **Close Claude Code**: Complete shutdown required
3. **Wait 5 seconds**: Ensure clean shutdown
4. **Restart Claude Code**: Configuration loads automatically
5. **Test changes**: Verify hooks behave as expected

### Verify Configuration Loading

```bash
# Check if hooks are active after restart
echo '{"tool_name": "Write", "tool_input": {"file_path": "test_improved.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js

# Should return appropriate response based on configuration
```

---

**Warning**: Always backup your configuration before making changes. Some modifications may require careful testing to ensure the system remains functional.
