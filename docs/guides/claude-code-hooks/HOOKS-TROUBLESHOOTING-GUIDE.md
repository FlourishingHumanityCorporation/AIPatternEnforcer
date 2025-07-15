# Hooks Troubleshooting Guide - When Operations Get Blocked

**Last Updated**: 2025-07-15  
**Purpose**: Practical solutions for hook-related issues  
**Target**: Developers encountering blocked operations

## 🚨 Quick Diagnostic Commands

```bash
# Test if hooks are working at all
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js

# Check configuration syntax
cat .claude/settings.json | jq .

# Test specific hook manually
echo '{"tool_name": "Write", "tool_input": {"file_path": "test_improved.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js
```

## 🔍 Common Hook Blocking Scenarios

### 1. File Naming Issues (`prevent-improved-files.js`)

**Symptom**: "❌ Don't create component_improved.tsx ✅ Edit the original file instead"

**Why Blocked**: Hook prevents `_improved`, `_enhanced`, `_v2` suffixes

**Solutions**:

```bash
# ❌ Blocked - Creates duplicate
touch component_improved.tsx

# ✅ Allowed - Edits original
# Use Edit tool on existing component.tsx
```

**Quick Fix**: Remove suffix from filename, edit original file instead

### 2. Root Directory Violations (`block-root-mess.js`)

**Symptom**: Operations blocked when creating files in project root

**Why Blocked**: Prevents application files cluttering root directory

**Solutions**:

```bash
# ❌ Blocked - App files in root
app/
components/
lib/

# ✅ Allowed - Proper structure
templates/nextjs-app-router/app/
templates/nextjs-app-router/components/
templates/shared/lib/
```

**Quick Fix**: Move files to appropriate template subdirectories

### 3. Enterprise Feature Detection (`enterprise-antibody.js`)

**Symptom**: "❌ Enterprise feature detected" when using certain keywords

**Blocked Keywords**: `RBAC`, `OAuth`, `production`, `scaling`, `deployment`, `monitoring`

**Solutions**:

```javascript
// ❌ Blocked - Enterprise terms
const userRoles = new RBACManager();
const oauth = new OAuthProvider();

// ✅ Allowed - Local development terms
const mockUser = { id: 1, name: "Test User" };
const localAuth = mockAuthProvider();
```

**Quick Fix**: Replace enterprise terms with mock/local equivalents

### 4. Context Inefficiency (`context-validator.js`)

**Symptom**: Single-character edits or trivial changes blocked

**Why Blocked**: Prevents wasteful AI context usage

**Solutions**:

```bash
# ❌ Blocked - Single character edit
old_string: "a"
new_string: "b"

# ✅ Allowed - Meaningful change
old_string: "const oldFunction = () => {"
new_string: "const newFunction = () => {"
```

**Quick Fix**: Make more substantial, meaningful edits

### 5. Security Issues (`security-scan.js`)

**Symptom**: Operations blocked due to security concerns

**Common Triggers**:

- Hardcoded secrets: `API_KEY = "sk-..."`
- SQL injection patterns: Direct string concatenation
- Exposed credentials

**Solutions**:

```javascript
// ❌ Blocked - Hardcoded secret
const apiKey = "sk-1234567890abcdef";

// ✅ Allowed - Environment variable
const apiKey = process.env.API_KEY;
```

### 6. External URLs (`localhost-enforcer.js`)

**Symptom**: Configuration pointing to external services blocked

**Why Blocked**: Enforces local development environment

**Solutions**:

```javascript
// ❌ Blocked - External URL
const dbUrl = "postgresql://prod.database.com/db";

// ✅ Allowed - Local URL
const dbUrl = "postgresql://localhost:5432/localdb";
```

## 🛠️ Hook-Specific Troubleshooting

### `api-validator.js` Issues

**Common Problems**:

- Invalid Next.js API route structure
- Missing export default handler
- Wrong HTTP method patterns

**Solutions**:

```javascript
// ❌ Blocked - Invalid structure
function handler() {}

// ✅ Allowed - Proper Next.js API
export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ message: "Success" });
  }
}
```

### `mock-data-enforcer.js` Issues

**Common Problems**:

- Real authentication systems
- Payment processing code
- User management systems

**Solutions**:

```javascript
// ❌ Blocked - Real auth
import { ClerkProvider } from "@clerk/nextjs";

// ✅ Allowed - Mock auth
const mockUser = { id: 1, email: "test@local.dev" };
```

### `template-integrity-validator.js` Issues

**Common Problems**:

- Modifying core template structure
- Breaking template inheritance
- Removing required template sections

**Solutions**: Don't modify files in `templates/` directory structure

## 🔧 Configuration Solutions

### Temporarily Disable Specific Hook

Edit `.claude/settings.json`:

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

**Note**: Add `"_disabled": true` to temporarily disable

### Increase Hook Timeout

If hooks are timing out:

```json
{
  "timeout": 5000
}
```

### Debug Hook Execution

```bash
# Enable verbose output
DEBUG=1 echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js"}}' | node tools/hooks/context-validator.js

# Check hook exit codes
echo $?  # Should be 0 (allow) or 2 (block)
```

## 🚑 Emergency Bypasses

### Complete Hook Bypass (Emergency Only)

**Backup configuration**:

```bash
cp .claude/settings.json .claude/settings.json.backup
```

**Minimal configuration**:

```json
{
  "hooks": {
    "PreToolUse": [],
    "PostToolUse": []
  }
}
```

**Restore after emergency**:

```bash
mv .claude/settings.json.backup .claude/settings.json
```

### Session Reset

Many hook issues resolve with a fresh Claude Code session:

1. Close Claude Code completely
2. Wait 5 seconds
3. Restart Claude Code
4. Configuration reloads automatically

## 📋 Troubleshooting Checklist

When hooks block operations:

- [ ] Identify which hook is blocking (check error message)
- [ ] Understand why it's blocking (see hook purpose above)
- [ ] Apply appropriate solution from this guide
- [ ] Test the fix manually if possible
- [ ] If still blocked, check session configuration loading
- [ ] As last resort, temporarily disable specific hook

## 🎯 Prevention Strategies

### Write Hook-Friendly Code

1. **Use local development patterns**: localhost URLs, mock data
2. **Avoid enterprise terminology**: Use simple, local terms
3. **Edit existing files**: Don't create duplicates with suffixes
4. **Keep files organized**: Use proper subdirectory structure
5. **Make meaningful changes**: Avoid trivial single-character edits

### Configuration Maintenance

1. **Test configuration changes**: Use manual hook testing
2. **Keep timeouts reasonable**: 2-5 seconds per hook
3. **Monitor hook performance**: Use `time` command for testing
4. **Document custom hooks**: Clear purpose and usage

## 🔄 Recovery Procedures

### Hook System Completely Broken

1. **Backup current config**: `cp .claude/settings.json backup.json`
2. **Use minimal config**: Empty hooks arrays
3. **Test basic operations**: Verify Claude Code works
4. **Gradually re-enable hooks**: One at a time
5. **Identify problematic hook**: Through elimination

### Performance Issues

1. **Profile individual hooks**: Use `time` command
2. **Increase timeouts**: If hooks are timing out
3. **Simplify hook logic**: Remove unnecessary processing
4. **Consider hook consolidation**: Combine similar validation logic

---

**Remember**: Hooks are designed to help, not hinder. If you're frequently fighting hooks, the code patterns might need adjustment rather than the hooks needing bypass.
