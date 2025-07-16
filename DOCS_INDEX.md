# Documentation Index for AI Tools

This index provides AI assistants with quick access to all ProjectTemplate documentation.
Each entry includes the file path and a concise description to help AI tools understand and
navigate the documentation structure.

**Last Updated**: 2025-07-12 (Post-archive cleanup)

## Table of Contents

1. [🚀 Quick Start](#-quick-start)
2. [📖 Core Documentation](#-core-documentation)
3. [AI Development Guides](#ai-development-guides)
4. [Architecture & Patterns](#architecture-patterns)
5. [Development Workflows](#development-workflows)
6. [Technical Stack Decisions](#technical-stack-decisions)
7. [Security & Performance](#security-performance)
8. [Tools & Generators](#tools-generators)
9. [Testing & Validation](#testing-validation)
10. [Code Quality & Enforcement](#code-quality-enforcement)
11. [Templates](#templates)
12. [VS Code Extension](#vs-code-extension)
13. [🔧 Configuration Files](#-configuration-files)
14. [📚 Reference Documentation](#-reference-documentation)
15. [🎯 Key NPM Scripts](#-key-npm-scripts)
16. [📝 Notes for AI Assistants](#-notes-for-ai-assistants)

## 🚀 Quick Start

- `docs/quick-reference.md` - **Experienced developers** - Commands, configs, troubleshooting
- `QUICK-START.md` - **New users** - 2-minute orientation and path selection
- `CLAUDE.md` - **AI assistants** - Primary AI instructions and project rules
- `README.md` - **Project overview** - Setup instructions and feature showcase

## 📖 Core Documentation

### AI Development Guides

- `docs/guides/ai-development/ai-assistant-setup.md` - Complete AI tool setup (Cursor, Claude Code, Copilot)
- `docs/guides/ai-development/context-optimization.md` - .aiignore patterns and context management
- `docs/guides/ai-development/local-model-setup.md` - Configure local AI models (Ollama, LM Studio)
- `docs/guides/ai-development/prompt-engineering.md` - Effective prompting strategies for code generation
- `ai/config/README.md` - Centralized AI tool configurations

### Architecture & Patterns

- `docs/architecture/architecture.md` - System design and component relationships
- `docs/architecture/patterns/api-design-standards.md` - RESTful API design patterns
- `docs/architecture/patterns/data-modeling-guide.md` - Database schema design patterns
- `docs/architecture/decisions/template-adr.md` - Architecture Decision Record template

### Development Workflows

- `docs/guides/workflows/daily-development.md` - Standard development practices
- `docs/guides/debugging/systematic-debugging.md` - Arrow-Chain Root Cause Analysis methodology
- `docs/guides/onboarding/new-developer.md` - Getting started guide for new developers
- `docs/guides/testing/comprehensive-testing-guide.md` - Unit, integration, and E2E testing

### Technical Stack Decisions

- `docs/newproject_decisions/local-development-stack-guide.md` - Local-first development recommendations
- `docs/newproject_decisions/decision-matrix-backend-runtime.md` - Node.js vs Python vs Go vs Rust
- `docs/newproject_decisions/decision-matrix-api-architecture.md` - REST vs GraphQL vs gRPC
- `docs/newproject_decisions/decision-matrix-database.md` - PostgreSQL vs SQLite vs NoSQL
- `docs/newproject_decisions/decision-matrix-frontend.md` - React vs Vue vs Angular vs Svelte

### Security & Performance

- `docs/guides/security/security-best-practices.md` - Local development security standards
- `docs/guides/performance/optimization-playbook.md` - Frontend and backend optimization

### Tools & Generators

- `docs/guides/generators/using-generators.md` - Complete guide to code generators
- `tools/generators/enhanced-component-generator.js` - Interactive component creation tool
- `scripts/dev/context-optimizer.sh` - AI context optimization script
- `scripts/validate-docs.sh` - Documentation link validation with auto-fix capabilities

### Testing & Validation

- `docs/testing/README.md` - Testing documentation overview
- `docs/testing/TEMPLATE_VALIDATION_FRAMEWORK.md` - Comprehensive validation methodology
- `docs/testing/VSCODE_EXTENSION_TEST_CHECKLIST.md` - Extension testing guide

### Code Quality & Enforcement

- `docs/systems/COMPREHENSIVE-HOOKS-OVERVIEW.md` - **Master Hook Reference** - Complete inventory of all 29 implemented hooks for expansion planning
- `docs/systems/hook-system-limitations.md` - **Hook System Reality Check** - Honest 31% vs 95% coverage analysis and what developers actually need
- `docs/guides/claude-code-hooks/README.md` - **Claude Code Hooks System** - File-level pattern enforcement documentation
- `docs/guides/claude-code-hooks/01-hooks-overview.md` - System architecture and hook inventory
- `docs/guides/claude-code-hooks/02-hooks-configuration.md` - Configuration and setup guide
- `docs/guides/claude-code-hooks/03-hooks-troubleshooting.md` - Troubleshooting and debugging guide
- `docs/guides/claude-code-hooks/04-hooks-reference.md` - Complete documentation for all 20 hooks
- `docs/guides/claude-code-hooks/05-hooks-development.md` - Creating custom hooks
- `docs/guides/claude-code-hooks/06-hooks-examples.md` - Real-world usage examples
- `docs/guides/claude-code-hooks/07-hooks-testing.md` - Testing and validation guide
- `docs/guides/claude-code-hooks/08-hooks-performance.md` - Performance analysis guide
- `docs/guides/enforcement/README.md` - Legacy enforcement system documentation
- `docs/guides/enforcement/config-enforcement.md` - Configuration validation and auto-fixing

### Templates

- `docs/templates/README.template.md` - Project README template
- `templates/component/` - Component generation templates

### VS Code Extension

- `extensions/projecttemplate-assistant/README.md` - ProjectTemplate VS Code extension
- `extensions/projecttemplate-assistant/INSTALLATION.md` - Extension setup guide

## 🔧 Configuration Files

- `.aiignore` - AI context control (exclude files from AI tools)
- `.vscode/settings.json` - VS Code/Cursor AI-optimized settings
- `.enforcement-config.json` - Code quality enforcement rules
- `package.json` - NPM scripts and dependencies

## 📚 Reference Documentation

- `FRICTION-MAPPING.md` - Common AI development friction points and solutions
- `CONTRIBUTING.md` - Contribution guidelines
- `docs/archive/README.md` - Archived documentation (deprecated tools, historical reports)

## 🎯 Key NPM Scripts

```bash
# Development
npm run dev                    # Start development server
npm run test                   # Run all tests
npm run lint                   # Run linting
npm run typecheck             # Check types

# Code Generation
npm run g:c                    # Enhanced component generator (interactive)
npm run generate:component     # Basic component generator

# Documentation
npm run validate:docs          # Check for broken documentation links (ignores external)
npm run validate:docs:all      # Check all links including external
npm run validate:docs:fix      # Attempt to fix broken links automatically

# Enforcement
npm run enforcement:status     # Show current enforcement settings
npm run check:all             # Run all enforcement checks
npm run check:config          # Validate configuration files
npm run fix:config            # Auto-fix configuration issues
npm run fix:config:dry-run    # Preview configuration fixes
```

## 📝 Notes for AI Assistants

- Always check `CLAUDE.md` for project-specific rules before making changes
- Use generators instead of creating files manually
- Follow the file organization structure defined in `CLAUDE.md`
- Reference existing patterns in the codebase before implementing new features
- Validate changes with enforcement tools before suggesting commits
