# ProjectTemplate Quick Reference

**For experienced developers who need immediate access to commands and configurations.**

## Table of Contents

1. [Essential Commands](#essential-commands)
2. [Critical Configurations](#critical-configurations)
3. [AI Tools](#ai-tools)
4. [Enforcement Levels](#enforcement-levels)
5. [Rapid Troubleshooting](#rapid-troubleshooting)
6. [File Locations](#file-locations)
7. [Common Patterns](#common-patterns)
8. [Component Generation](#component-generation)
9. [Validation Workflow](#validation-workflow)
10. [AI Context Loading](#ai-context-loading)
11. [Implementation Guides (10-20 min each)](#implementation-guides-10-20-min-each)
12. [Navigation Shortcuts](#navigation-shortcuts)

## Essential Commands

```bash
# Daily Workflow
npm run g:c ComponentName    # Generate component
npm run doc:create           # Create documentation from template
npm test                     # Run tests
npm run check:all           # Validate everything
git add . && git commit     # Commit (auto-validated)

# Setup & Verification
npm run onboard             # Complete onboarding (<5 min) - RECOMMENDED
npm run setup:guided        # Interactive setup wizard
npm run setup:verify-ai     # Verify AI tools working
npm run check:progress      # Check completion status

# Context & Debugging
npm run context             # Load AI context
npm run debug:snapshot      # Capture debug state
npm run enforcement:status  # Check enforcement config

# Hook Debugging System (NEW)
npm run debug:hooks                    # Show all debug commands
npm run debug:hooks diagnose          # Full system health check
npm run debug:hooks test <hook-name>  # Test specific hook
npm run debug:hooks env               # Check environment settings
npm run debug:hooks:monitor:enhanced  # Real-time monitoring
npm run debug:hooks:chain             # Hook chain analysis
npm run debug:hooks:shell             # Interactive debugging

# Hook Development & Customization
npm test -- tools/hooks/__tests__/  # Test all hooks
npm run validate:hooks              # Validate hook configuration
HOOK_VERBOSE=true [command]         # Debug hook execution
# Documentation: docs/guides/claude-code-hooks/05-hooks-development.md
```

## Critical Configurations

### AI Tools

```bash
# Cursor: .cursorrules exists and configured
# Claude Code: Reads CLAUDE.md automatically
# Copilot: .copilot configuration in ai/config/
```

### Enforcement Levels

```bash
npm run enforcement:config set-level BASIC      # Core only
npm run enforcement:config set-level STANDARD   # Recommended
npm run enforcement:config set-level STRICT     # All patterns
npm run enforcement:config set-level FULL       # Pre-commit blocking
```

## Rapid Troubleshooting

| Issue                  | Quick Fix                                                   |
| ---------------------- | ----------------------------------------------------------- |
| AI ignores patterns    | `cp ai/config/.cursorrules .cursorrules`                    |
| Tests failing          | `npm run validate`                                          |
| Context too large      | Add patterns to `.aiignore`                                 |
| Generator not working  | `npm run setup:hooks`                                       |
| Hooks not executing    | Check `.env`: `HOOKS_DISABLED=false`                      |
| Hook development setup | See `docs/guides/claude-code-hooks/05-hooks-development.md` |
| Enforcement blocking   | `npm run enforcement:config set-level BASIC`                |
| Port in use            | `lsof -ti:3000 \| xargs kill -9`                            |

## File Locations

| Need                  | File Location                                           |
| --------------------- | ------------------------------------------------------- |
| AI Rules              | `CLAUDE.md`                                             |
| All Commands          | `DOCS_INDEX.md#key-npm-scripts`                         |
| Implementation Guides | `docs/guides/implementation/`                           |
| Generator Templates   | `templates/component/`                                  |
| Enforcement Config    | `.enforcement-config.json`                              |
| Hook Development      | `docs/guides/claude-code-hooks/05-hooks-development.md` |
| Hook Configuration    | `tools/hooks/hooks-config.json`                         |
| Hook Environment      | `.env` (HOOKS_DISABLED, HOOK_[CATEGORY], etc.)           |
| Context Control       | `.aiignore`                                             |

## Common Patterns

### Component Generation

```bash
npm run g:c UserProfile      # Interactive mode
# Creates: .tsx, .test.tsx, .stories.tsx, .module.css, index.ts
```

### Validation Workflow

```bash
npm test && npm run lint && npm run type-check && npm run check:all
# Or use: npm run validate (combines all)
```

### Documentation Templates

```bash
npm run doc:create               # Interactive template selection
npm run doc:create:readme        # Create README documentation
npm run doc:create:feature       # Create feature specification
npm run doc:create:api           # Create API reference
npm run doc:create:guide         # Create step-by-step guide
npm run doc:validate filename.md # Validate against templates
npm run doc:templates            # View available templates
```

### AI Context Loading

```bash
npm run context                    # General context
npm run context -- app/components # Specific directory
npm run debug:snapshot            # Full debug context
```

## Implementation Guides (10-20 min each)

- [Workflow Integration](guides/workflow-integration.md) - **Complete system integration** - AI tools + generators + enforcement
- [Context Window Optimization](guides/implementation/context-window-optimization.md) - Fix AI memory issues
- [Code Generation Quality](guides/implementation/code-generation-quality.md) - Improve AI output consistency
- [Security Vulnerability Prevention](guides/implementation/security-vulnerability-prevention.md) - Secure AI code generation

## Navigation Shortcuts

| For                    | Go To                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| Daily commands         | [CLAUDE.md#daily-commands](../CLAUDE.md#daily-commands)           |
| All npm scripts        | [DOCS_INDEX.md#key-npm-scripts](DOCS_INDEX.md#key-npm-scripts)    |
| Setup guide            | [AI Assistant Setup](guides/ai-development/ai-assistant-setup.md) |
| Problem solutions      | [FRICTION-MAPPING.md](../FRICTION-MAPPING.md)                     |
| Architecture decisions | [docs/architecture/](architecture/)                               |

---

**◀ Back to**: [README](../README.md) | [CLAUDE.md](../CLAUDE.md) | [Full Documentation](DOCS_INDEX.md)
