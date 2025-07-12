# Claude Validation Quick Reference

## Essential Commands

```bash
# Setup (one-time)
bash scripts/setup-claude-validation.sh

# Daily usage
pbpaste | npm run claude:validate - --complex

# Configuration
npm run claude:config:status
npm run claude:config disable promptImprovement
npm run claude:config set-severity WARNING

# Troubleshooting
npm run claude:test
npm run claude:dashboard
npm run claude:stats
```

## Validation Flags

| Flag | When to Use | Example |
|------|-------------|---------|
| `--complex` | Implementation requests, multi-step tasks | Creating components, features |
| `--simple` | Quick questions, single concepts | "How to use useState?" |
| `--quiet` | Automation, scripts | CI/CD pipelines |
| `--stats` | View compliance metrics | Weekly team reviews |

## Key Patterns

### ✅ What Claude Should Do

**Complex Requests (promptImprovement + todoWriteUsage + generatorUsage):**
```
**Improved Prompt**: Create a login component with validation.

I'll create a secure login component. Using TodoWrite to track progress:
- [ ] Generate with npm run g:c LoginForm
- [ ] Add validation
- [ ] Connect to API

Let me edit the original LoginForm.tsx file...
```

**Simple Queries (conciseResponse):**
```
Use useState for local state:
const [count, setCount] = useState(0);
```

**File Editing (originalFileEditing):**
```
Let me edit the existing AuthService.ts file to add the new functionality...
```

### ❌ What Claude Should Avoid

**Never create improved files:**
```
❌ Let me create auth_improved.js
❌ I'll make a Component_v2.tsx
❌ Here's a better_login.tsx
```

**Missing prompt improvement for complex tasks:**
```
❌ I'll create a login component... (should start with **Improved Prompt**)
```

## Severity Levels

| Level | Behavior | Use When |
|-------|----------|----------|
| **CRITICAL** | Blocks workflow | Production, strict enforcement |
| **WARNING** | Shows warnings | Development, learning |
| **INFO** | Informational only | Loose monitoring |
| **DISABLED** | No checking | Temporarily disable pattern |

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| Too many false positives | `npm run claude:config set-severity INFO` |
| Missing violations | `npm run claude:config set-severity CRITICAL` |
| Pattern not working | `npm run claude:test` |
| Setup broken | `bash scripts/test-claude-validation-setup.sh` |

## Configuration Patterns

### Strict Mode (Production)
```bash
npm run claude:config set-severity CRITICAL
npm run claude:config enable promptImprovement
npm run claude:config enable noImprovedFiles
```

### Development Mode (Relaxed)
```bash
npm run claude:config set-severity WARNING
npm run claude:config disable promptImprovement
```

### Team Onboarding (Learning)
```bash
npm run claude:config set-severity INFO
npm run claude:config enable generatorUsage
npm run claude:config enable todoWriteUsage
```

## File Locations

| Component | Path |
|-----------|------|
| Main config | `tools/claude-validation/.claude-validation-config.json` |
| Setup script | `scripts/setup-claude-validation.sh` |
| Dashboard | `npm run claude:dashboard` |
| Stats | `tools/claude-validation/.compliance-stats.json` |
| Documentation | `docs/claude-validation/README.md` |

## Integration Examples

### VS Code Task
```json
{
  "label": "Validate Claude Response",
  "type": "shell",
  "command": "pbpaste | npm run claude:validate - --complex"
}
```

### Git Hook (Pre-commit)
```bash
# .git/hooks/pre-commit
if ! git diff --cached --quiet; then
  echo "Checking Claude-generated code..."
  # Add validation logic here
fi
```

### CI/CD Pipeline
```bash
# Validate responses in automated testing
echo "$CLAUDE_RESPONSE" | npm run claude:validate - --quiet
```

## Keyboard Shortcuts

When using the dashboard (`npm run claude:dashboard`):
- **R** - Refresh data
- Browser navigation for testing validation patterns

## Help Commands

```bash
# Detailed help
npm run claude:validate --help
npm run claude:config help

# List all patterns
npm run claude:config list

# Show current status
npm run claude:config:status
```