# Config Enforcer - DEPRECATED

## ⚠️ Tool Deprecated

**Status**: This tool has been **DEPRECATED** and removed as part of the enforcement system migration.

**Migration Date**: 2025-07-12

## Replacement

Configuration validation is now handled through **modern approaches**:

### New Approach: Real-time Prevention + Template-based Configs

**Current validation**: Standard tooling
- **ESLint**: `npm run lint` - validates JavaScript/TypeScript config files
- **TypeScript**: `npm run type-check` - validates tsconfig.json 
- **Package.json**: Built-in npm validation
- **All checks**: `npm run check:all` - runs all validations

**Templates**: Proper configuration from start
- **Location**: `templates/[framework]/` 
- **Function**: Framework-specific config templates with best practices built in
- **No post-hoc validation needed** - start with correct configuration

### Usage

**Before** (deprecated):
```bash
npm run check:config         # ❌ NO LONGER EXISTS
npm run fix:config           # ❌ NO LONGER EXISTS  
npm run fix:config:dry-run   # ❌ NO LONGER EXISTS
```

**Now** (standard tooling):
```bash
npm run check:all            # Validates all configs via standard tools
npm run lint                 # ESLint validation
npm run type-check           # TypeScript config validation
```

**For new projects**:
```bash
npm run create-ai-app        # Creates project with proper configs
npm run template:nextjs      # Next.js template with validated configs
npm run template:react       # React template with validated configs
```

### Example

**Old approach** (complex custom validation):
1. Custom config enforcer with hundreds of rules
2. Complex caching and backup systems
3. Manual fixing of configuration issues

**New approach** (standard tooling):
1. Use framework templates with correct configs
2. Standard linting catches config issues
3. TypeScript validates type-related configs
4. No custom enforcement needed

## Migration Information

**Why was this deprecated?**
- Custom config validation added complexity without clear benefit
- Standard tooling (ESLint, TypeScript) already validates configurations
- Template-based approach prevents config issues from start
- Reduced maintenance burden

**What happened to the tool?**
- `tools/enforcement/config-enforcer/` → Deleted entirely
- NPM scripts `check:config`, `fix:config` → Removed
- `.config-enforcer-cache/` → Deleted (no longer needed)
- Functionality replaced by standard tooling and templates

**What about config validation?**
- Framework configs: Handled by framework tooling (Next.js, React, etc.)
- JavaScript/TypeScript: ESLint + TypeScript compiler
- Package.json: npm built-in validation
- Custom configs: Case-by-case evaluation, prefer standard approaches

## Related Documentation

- [Project Templates](../guides/templates/)
- [Standard Validation](../../CLAUDE.md#testing-requirements)
- [Modern Enforcement System](../guides/enforcement/comprehensive-enforcement-system-documentation.md)

---

**Historical Note**: This file documents a deprecated tool. Configuration validation is now handled by standard tooling and prevented through proper templates rather than custom enforcement frameworks.