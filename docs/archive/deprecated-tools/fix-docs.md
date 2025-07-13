# Fix Docs - DEPRECATED

## ⚠️ Tool Deprecated

**Status**: This tool has been **DEPRECATED** and removed as part of the enforcement system migration.

**Migration Date**: 2025-07-12

## Replacement

Documentation quality is now maintained through **modern approaches**:

### New Approach: Template-Based + Real-time Prevention

**Templates**: `templates/documentation/` (active)
- **Location**: `templates/documentation/`
- **Function**: Consistent documentation structure from the start
- **Command**: `npm run doc:create` for new docs

**Hooks**: Real-time validation during AI interactions
- **Prevention**: Claude Code hooks ensure good patterns during creation
- **No post-hoc fixes needed** - quality built in from start

### Usage

**Before** (deprecated):
```bash
npm run fix:docs         # ❌ NO LONGER EXISTS
npm run fix:docs:dry-run # ❌ NO LONGER EXISTS
```

**Now** (template-based):
```bash
npm run doc:create              # Interactive template selection
npm run doc:create:readme       # README template
npm run doc:create:feature      # Feature specification
npm run doc:create:api          # API reference
npm run doc:create:guide        # Step-by-step guide
```

### Example Workflow

**Old approach** (reactive):
1. Write documentation manually
2. Run `fix:docs` to clean up issues
3. Fix remaining problems manually

**New approach** (proactive):
1. `npm run doc:create:feature` → Start with proper template
2. Fill in template sections → Structure already correct
3. Claude Code hooks → Prevent common mistakes during AI assistance

## Migration Information

**Why was this deprecated?**
- Manual fixing creates friction and inconsistency
- Template-based approach prevents issues from occurring
- Aligns with "prevention over correction" philosophy

**What happened to the tool?**
- `tools/enforcement/fix-docs.js` → Deleted
- NPM scripts `fix:docs`, `fix:docs:dry-run` → Removed
- Functionality replaced by documentation templates and real-time prevention

**What about existing documentation quality issues?**
- Use templates for new documentation
- Gradually migrate existing docs to template format
- Focus on prevention for new content

## Related Documentation

- [Documentation Templates](../guides/documentation/template-usage.md)
- [Modern Enforcement System](../guides/enforcement/comprehensive-enforcement-system-documentation.md)
- [CLAUDE.md](../../CLAUDE.md) - Documentation standards

---

**Historical Note**: This file documents a deprecated tool. Documentation quality is now maintained through templates and real-time prevention rather than post-hoc correction.