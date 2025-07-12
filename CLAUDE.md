# 🚨 PROJECT AI INSTRUCTIONS 🚨

**Essential rules for AI assistants working on ProjectTemplate.**

> 📋 **First time here?** Start with [QUICK-START.md](QUICK-START.md) (2-minute orientation)
> 📋 **Ready for AI setup?** See [AI Assistant Setup](docs/guides/ai-development/ai-assistant-setup.md) (5-minute setup)
> 📋 **Need comprehensive guidance?** See [Documentation Index](./DOCS_INDEX.md) (complete methodology)  
> 📋 **User journey guidance?** Check [Documentation Hub](docs/README.md) (role-based paths)

---

## Table of Contents

1. [🎯 QUICK REFERENCE](#-quick-reference)
  2. [Daily Commands](#daily-commands)
  3. [Key Files](#key-files)
4. [🛑 CRITICAL RULES](#-critical-rules)
  5. [NEVER DO THESE (WILL BREAK THE PROJECT)](#never-do-these-will-break-the-project)
  6. [ALWAYS DO THESE](#always-do-these)
7. [📁 ROOT DIRECTORY ALLOWLIST](#-root-directory-allowlist)
  8. [Allowed Root Files:](#allowed-root-files)
  9. [Everything Else Goes in Subdirectories:](#everything-else-goes-in-subdirectories)
10. [📁 PROJECT OVERVIEW](#-project-overview)
  11. [Core Features:](#core-features)
  12. [File Organization:](#file-organization)
13. [🚀 QUICK START COMMANDS](#-quick-start-commands)
14. [🧪 TESTING REQUIREMENTS](#-testing-requirements)
  15. [MANDATORY Before ANY Commit:](#mandatory-before-any-commit)
  16. [Test Coverage:](#test-coverage)
17. [📚 DOCUMENTATION STANDARDS](#-documentation-standards)
  18. [Writing Rules:](#writing-rules)
  19. [Documentation Cleanup:](#documentation-cleanup)
20. [🔨 GENERATOR USAGE](#-generator-usage)
  21. [Available Generators:](#available-generators)
  22. [Generator Creates:](#generator-creates)
23. [🐛 DEBUGGING METHODOLOGY](#-debugging-methodology)
  24. [Always Use Arrow-Chain RCA:](#always-use-arrow-chain-rca)
  25. [Debug Context:](#debug-context)
26. [🤖 AI ASSISTANT INTEGRATION](#-ai-assistant-integration)
  27. [Context Loading:](#context-loading)
  28. [AI Tool Configuration:](#ai-tool-configuration)
  29. [Working with AI:](#working-with-ai)
30. [⚠️ COMMON ISSUES](#-common-issues)
  31. [Quick Fixes:](#quick-fixes)
32. [📖 NAVIGATION](#-navigation)
  33. [For Different Users:](#for-different-users)
  34. [For Specific Tasks:](#for-specific-tasks)
  35. [For Complete Information:](#for-complete-information)

## 🎯 QUICK REFERENCE

### Daily Commands

```bash
# Development
npm run dev                    # Start development server
npm test                      # Run all tests
npm run lint                  # Run linting
npm run typecheck            # Check types

# Code Generation
npm run g:c ComponentName     # Enhanced component generator (interactive)
npm run g:component Name      # Basic component generator

# Setup
npm run setup:quick           # 2-minute basic setup
npm run setup:guided          # Interactive setup wizard

# Debugging
npm run debug:snapshot       # Capture debug context
npm run context             # Load AI context

# Template Validation
npm run validate            # Comprehensive validation
npm run test:template       # Run all validation tests

# Progress Tracking  
npm run check:progress      # Check learning path progress
npm run setup:verify-ai     # Verify AI setup is working

# Enforcement
npm run check:all           # Check all enforcement rules
npm run fix:docs            # Fix documentation violations
npm run fix:docs:dry-run    # Preview documentation fixes
npm run enforcement:status  # Show current settings
```

### Key Files
- **Essential Rules**: `CLAUDE.md` (this file)
- **Documentation Index**: `DOCS_INDEX.md` - Complete navigation hub
- **Quick Setup**: `docs/guides/ai-development/ai-assistant-setup.md` - 5-minute onboarding
- **Documentation Index**: `DOCS_INDEX.md` - Navigation hub
- **AI Config**: `ai/config/.cursorrules`
- **Claude Code Hooks**: `.claude/settings.json` - Real-time enforcement
- **Enforcement Guide**: `docs/guides/enforcement/ENFORCEMENT.md`
- **Context Control**: `.aiignore`

---

## 🛑 CRITICAL RULES

### NEVER DO THESE (WILL BREAK THE PROJECT)

1. **NEVER create `*_improved.py`, `*_enhanced.py`, `*_v2.py`** - ALWAYS edit the original file
2. **NEVER create files in root directory** - Use proper subdirectories (see allowlist below)
3. **NEVER use bare except clauses** - Always specify exception types
4. **NEVER use `print()` in production** - Use `logging.getLogger(__name__)`
5. **NEVER create announcement-style docs** - No "We're excited to announce!"
6. **NEVER implement poor workarounds** - Use Arrow-Chain RCA methodology (see FULL-GUIDE.md)

### ALWAYS DO THESE

1. **ALWAYS check existing code first** - Don't create duplicate functionality
2. **ALWAYS use specific imports** - `from module import SpecificClass`
3. **ALWAYS use generators** - `npm run g:c ComponentName` for new components
4. **ALWAYS write tests first** - No exceptions, see Test-First Development in FULL-GUIDE.md
5. **ALWAYS run enforcement checks** - `npm run check:all` before commits
6. **ALWAYS use measured, technical language** - Avoid superlatives in technical contexts

---

## 📁 ROOT DIRECTORY ALLOWLIST

**NEVER create files in root directory unless explicitly allowed below.**

### Allowed Root Files:
- **Documentation**: `README.md`, `LICENSE`, `CLAUDE.md`, `CONTRIBUTING.md`, `SETUP.md`, `FRICTION-MAPPING.md`, `QUICK-START.md`, `USER-JOURNEY.md`, `FULL-GUIDE.md`, `DOCS_INDEX.md`
- **Configuration**: `package.json`, `package-lock.json`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc`, `.env.example`, `vite.config.js`, etc.

### Everything Else Goes in Subdirectories:
- Reports/Summaries → `docs/reports/`
- Plans/Proposals → `docs/plans/`  
- Architecture docs → `docs/architecture/`
- Scripts → `scripts/`
- Tests → `tests/`
- Source code → `src/`

**Enforcement**: Pre-commit hooks automatically check this. Run `npm run check:root` manually.

---

## 📁 PROJECT OVERVIEW

**ProjectTemplate** is a meta-project creating reusable project template structures that solve AI development friction.

### Core Features:
- **AI Configurations**: Centralized in `ai/config/`
- **Code Generators**: `npm run g:c ComponentName` creates complete components with tests
- **Context Management**: `npm run context` optimizes AI context windows
- **Automated Enforcement**: Prevents anti-patterns automatically
- **Progressive Documentation**: Role-based guidance for different user types

### File Organization:
```text
project-root/
├── src/                    # Source code
├── tests/                  # Test files
├── scripts/               # Development scripts
├── docs/                  # Documentation
├── ai/                    # AI configurations
├── tools/                 # Development utilities
└── templates/             # Code generation templates
```

---

## 🚀 QUICK START COMMANDS

```bash
# Install and setup
npm install
npm run setup:hooks        # One-command setup

# Generate your first component
npm run g:c TestComponent

# Verify setup works
npm test
npm run lint
npm run validate
```

---

## 🧪 TESTING REQUIREMENTS

### MANDATORY Before ANY Commit:
```bash
npm test                   # All tests must pass
npm run lint              # No linting errors
npm run typecheck         # No type errors
npm run check:all         # All enforcement checks
```

### Test Coverage:
- **Minimum**: 80% overall coverage
- **Critical paths**: 100% coverage required
- **New features**: 90% coverage before merge

**Details**: See [Test-First Development](docs/guides/testing/comprehensive-testing-guide.md) for complete methodology

---

## 📚 DOCUMENTATION STANDARDS

### Writing Rules:
- ❌ NO: "We're excited to announce...", "Successfully implemented!", superlatives
- ✅ YES: Professional, timeless, measured language
- ✅ YES: Link to source files with line numbers
- ✅ YES: Technical descriptions without overconfidence

### Documentation Cleanup:
**DELETE completion docs immediately** - Never create "COMPLETE.md", "FINAL.md", "SUMMARY.md"

---

## 🔨 GENERATOR USAGE

**ALWAYS use generators for new code.**

### Available Generators:
```bash
npm run g:c ComponentName          # Interactive component generator
npm run g:component ComponentName  # Basic component generator
```

### Generator Creates:
- Component file with TypeScript
- Test file with comprehensive tests
- Stories file for Storybook
- CSS module for styles
- Index file for exports

**Details**: See [Generator Usage Guide](docs/guides/generators/using-generators.md) for complete information

---

## 🐛 DEBUGGING METHODOLOGY

### Always Use Arrow-Chain RCA:
1. **Symptom** - What user sees
2. **Trace** - Follow data flow
3. **Arrow chain** - Map transformations
4. **Hypothesis** - Root cause theory
5. **Validate** - Reproduce and test fix
6. **Patch** - Implement at root cause

### Debug Context:
```bash
npm run debug:snapshot     # Capture full debugging context
```

**Full methodology**: See [Arrow-Chain Root-Cause Analysis](docs/guides/debugging/systematic-debugging.md)

---

## 🤖 AI ASSISTANT INTEGRATION

### Context Loading:
```bash
npm run context           # Load optimized context for AI tools
npm run context -- src/file.ts  # Context for specific file
```

### AI Tool Configuration:
- **Cursor**: `.cursorrules` file ready to use
- **Claude**: Context commands provide optimized prompts
- **Copilot**: Configurations in `ai/config/`

### Working with AI:
- **ALWAYS provide file paths** in requests
- **ALWAYS paste current code** - don't rely on AI file reading
- **ALWAYS include test requirements**
- **ALWAYS specify coding standards**

**Complete guidelines**: See [AI Assistant Setup Guide](docs/guides/ai-development/ai-assistant-setup.md)

---

## ⚠️ COMMON ISSUES

### Quick Fixes:
```bash
# Module not found
npm install

# Port already in use
lsof -ti:3000 | xargs kill -9

# Generator not working
npm run setup:hooks

# Tests failing
npm run validate
```

**Complete troubleshooting**: See [Documentation Index](./DOCS_INDEX.md) for specific guides

---

## 📖 NAVIGATION

### For Different Users:
- **🟢 New Users**: [AI Assistant Setup](docs/guides/ai-development/ai-assistant-setup.md) → [Documentation Hub](docs/README.md)
- **🟡 Existing Users**: Use commands above + [Generator demos](docs/guides/generators/)
- **🔴 Expert Users**: [Documentation Index](./DOCS_INDEX.md) + [Architecture docs](docs/architecture/)

### For Specific Tasks:
- **Setup Project**: [AI Assistant Setup](docs/guides/ai-development/ai-assistant-setup.md)
- **Generate Code**: `npm run g:c ComponentName`
- **Debug Issues**: `npm run debug:snapshot` + Arrow-Chain RCA
- **Test Code**: Test-First Development methodology
- **Configure AI**: AI configurations in `ai/config/`

### For Complete Information:
- **Full Methodology**: [Documentation Index](./DOCS_INDEX.md)
- **Technical Architecture**: [Architecture Documentation](docs/architecture/)
- **Frontend Rules**: [Documentation Index](./DOCS_INDEX.md) > Development Workflows
- **Performance Standards**: [Performance Guide](docs/guides/performance/optimization-playbook.md)
- **IDE Setup**: [AI Assistant Setup](docs/guides/ai-development/ai-assistant-setup.md)

---

**🎯 REMEMBER**: This is a condensed reference. For comprehensive guidance, workflows, and detailed methodologies,
always refer to [Documentation Index](./DOCS_INDEX.md).

---

END OF CRITICAL INSTRUCTIONS