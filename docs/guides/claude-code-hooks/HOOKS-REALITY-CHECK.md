```markdown
# 🔍 Claude Code Hooks System - Reality Check
**Created**: 2025-07-15
**Purpose**: Document the ACTUAL state of the hooks system after
documentation confusion

## The Actual System State

### Configuration Reality (.claude/settings.json)
- **Total Hooks**: 19 (14 PreToolUse + 5 PostToolUse)
- **Configuration Format**: Official Claude Code hooks with ADDITIONAL custom fields.
- **Custom Fields**: `family`, `priority`, and `description` are project-specific additions.
- **Hook Adapter**: `claude-hook-adapter.js` is used to pass these custom settings to the validation scripts.

### HookRunner Architecture
- **Base Class**: The custom architecture is built around `tools/hooks/lib/HookRunner.js`.
- **Functionality**:
  - Parses the official hook input from Claude Code.
  - Manages the custom `family` and `priority` logic.
  - Provides standardized `runner.block()` and `runner.allow()` methods.
  - Implements a fail-open architecture to avoid blocking development on script errors.

### The "Lost" Documentation Incident
- The 8 numbered documentation files (01-08) that were created accurately described the 19-hook system.
- They were likely lost due to a `git reset` or other version control operation that removed uncommitted files.
- The documentation that was "restored" is an older, incorrect version.

## Path Forward
1. **Restore Correct Documentation**: The 8 numbered markdown files need to be recreated as they accurately documented the 19-hook system.
2. **Clarify Customizations**: All documentation must clearly state that `family`, `priority`, and `HookRunner` are project-specific additions, NOT official Claude Code features.
3. **Fix Input/Output Schemas**: All documentation must use the official Claude Code hook input schema.
4. **Remove Misleading Docs**: The incorrect "5-hook" documentation should be removed to avoid confusion.
```
