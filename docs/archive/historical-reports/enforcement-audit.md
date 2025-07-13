# Enforcement System Audit for Next.js Migration

**Date**: 2025-07-12
**Phase**: Pre-Migration Assessment

## Files Requiring Updates

### 🔧 Enforcement Scripts with Hardcoded Paths
- `tools/enforcement/documentation/git-diff-analyzer.js`
  - ❌ Hardcoded: `src/components/`
  - ❌ Hardcoded: `src/api/`
  - ✅ Action: Update to `app/components/` and `app/api/`

- `tools/enforcement/documentation/rule-engine.js`
  - ❌ Hardcoded: `src/components/` (multiple references)
  - ✅ Action: Update to `app/components/`

- `tools/enforcement/production-validation.js`
  - ❌ Hardcoded: `grep -r "console\\." src/`
  - ❌ Hardcoded: `--include="src/**/*"`
  - ✅ Action: Update to Next.js app structure

### 🎯 Generators with Vite Dependencies
- `tools/generators/component-generator.js`
  - ❌ Import: `import { vi } from 'vitest';`
  - ✅ Action: Update test imports for Next.js

- `tools/generators/template-customizer.js`
  - ❌ Multiple Vite references in package.json generation
  - ❌ Vite config template generation
  - ✅ Action: Add Next.js templates alongside Vite

### 🏗️ Infrastructure Files
- `.claude/settings.json`
  - ✅ Status: No hardcoded src paths found
  - ✅ Action: Validation hooks should work with any file structure

## Assessment Summary

### ✅ Low Risk Areas
- Claude Code hooks: Generic file validation, no path dependencies
- Core enforcement logic: Mostly pattern-based, not path-dependent
- Test framework: Can work with Next.js structure

### ⚠️ Medium Risk Areas  
- Documentation analyzers: Need path updates for Next.js
- Generator templates: Need Next.js versions added
- Production validation: Grep commands need path updates

### 🚨 High Risk Areas
- Component generators: Heavy Vite assumptions
- Template customizer: Vite-specific code generation

## Migration Strategy
1. **Phase 2**: Update hardcoded paths during stack migration
2. **Phase 3**: Add Next.js support to generators while preserving Vite
3. **Phase 4**: Test all enforcement with Next.js structure

## Files Inventory
**Total files needing updates**: 5
**Critical path updates**: 3
**Generator updates**: 2

This audit confirms the migration is feasible with targeted updates.