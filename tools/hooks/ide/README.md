# IDE Integration Hooks

This directory contains hooks that integrate with and optimize IDE environments for AI-assisted development, ensuring proper configurations and preventing common IDE-related issues.

## Hooks in this Category

### 1. ide-config-checker.js

- **Purpose**: Ensures AI tool configurations exist
- **Blocking**: None (auto-creates configs)
- **Priority**: Low
- **Key Features**:
  - Creates .cursorrules automatically
  - Sets up .vscode/settings.json
  - Adds extension recommendations
  - Runs every 10 minutes

### 2. shortcut-protector.js

- **Purpose**: Prevents overriding critical shortcuts
- **Blocking**: Hard-block for protected shortcuts
- **Priority**: High
- **Key Features**:
  - Protects system shortcuts (Cmd+S, Cmd+Z, etc.)
  - Detects keybinding modifications
  - Suggests safe alternatives
  - Cross-platform support

### 3. workspace-cleaner.js

- **Purpose**: Blocks creation of junk files
- **Blocking**: Hard-block for junk patterns
- **Priority**: Medium
- **Key Features**:
  - Prevents \_improved, \_backup files
  - Blocks temp file creation
  - Warns about generic names
  - Cleanup reminders

### 4. performance-guardian.js

- **Purpose**: Detects performance anti-patterns
- **Blocking**: Hard-block for severe issues
- **Priority**: Medium
- **Key Features**:
  - Detects triple nested loops
  - Finds DOM queries in loops
  - Catches async/sync issues
  - Suggests optimizations

## Protected Resources

### Protected Shortcuts

```javascript
// System essentials
'cmd+s' / 'ctrl+s' - Save
'cmd+z' / 'ctrl+z' - Undo
'cmd+c' / 'ctrl+c' - Copy
'cmd+v' / 'ctrl+v' - Paste

// IDE navigation
'f12' - Go to definition
'cmd+p' / 'ctrl+p' - Quick open
'cmd+shift+p' - Command palette
```

### Junk File Patterns

- `*_improved.*`
- `*_enhanced.*`
- `*_v2.*`
- `*_backup.*`
- `*.tmp`
- `untitled*`

### Performance Anti-Patterns

- Triple nested loops
- JSON.parse(JSON.stringify())
- DOM queries inside loops
- Multiple setState calls
- Await inside forEach
- Large inline data

## Default Configurations

### .cursorrules

```markdown
# Cursor AI Rules

- Reference CLAUDE.md for project rules
- Never create \_improved files
- Use generators for components
- Write tests first
```

### .vscode/settings.json

```json
{
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/*_improved.*": true,
    "**/*_enhanced.*": true
  }
}
```

## Testing

```bash
# Test IDE hooks
npm test -- tools/hooks/ide/__tests__/

# Test individual hooks
echo '{"file_path": ".vscode/keybindings.json", "content": "cmd+s"}' | node shortcut-protector.js
echo '{"tool_name": "Write", "file_path": "test_improved.js"}' | node workspace-cleaner.js
```
