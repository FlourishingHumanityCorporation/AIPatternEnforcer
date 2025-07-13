# Documentation Structure Overview

This document provides a complete overview of all markdown documentation in the ProjectTemplate docs/ directory.

## Table of Contents

1. [Complete Documentation Tree](#complete-documentation-tree)
  2. [📐 Architecture Documentation](#-architecture-documentation)
  3. [📚 Optimal Practices](#-optimal-practices)
  4. [🤖 Claude/AI Instructions](#-claudeai-instructions)
  5. [🎯 Decision Records](#-decision-records)
  6. [📖 Guides](#-guides)
    7. [AI Development](#ai-development)
    8. [Onboarding](#onboarding)
    9. [Performance](#performance)
    10. [Security](#security)
    11. [Testing](#testing)
    12. [Workflows](#workflows)
  13. [🚀 New Project Decisions](#-new-project-decisions)
  14. [💬 Prompts](#-prompts)
  15. [🔧 Runbooks](#-runbooks)
  16. [📝 Templates](#-templates)
  17. [📋 Root Documentation](#-root-documentation)
18. [Documentation Categories Summary](#documentation-categories-summary)
19. [Quick Navigation](#quick-navigation)
  20. [For New Developers](#for-new-developers)
  21. [For Technical Decisions](#for-technical-decisions)
  22. [For Daily Development](#for-daily-development)
  23. [For Production Support](#for-production-support)

## Complete Documentation Tree

### 📐 Architecture Documentation

- **decisions/**
  - `000-core-principles.md` - Core architectural principles and guidelines
  - `template-adr.md` - Template for Architecture Decision Records
- **patterns/**
  - `api-design-standards.md` - RESTful API design patterns and standards
  - `data-fetching.md` - Data fetching strategies and optimal practices
  - `data-modeling-guide.md` - Database schema design and relationships
  - `error-handling.md` - Error handling patterns across the stack
  - `state-management.md` - Frontend and backend state management

### 📚 Optimal Practices

- `bestpractices/Claude.md_bespractices.md` - AI assistant optimal practices

### 🤖 Claude/AI Instructions

- `claude.md/claudeA.md` - Primary AI assistant instructions
- `claude.md/claudeB.md` - Secondary AI assistant instructions

### 🎯 Decision Records

- `decisions/decision-log.md` - Log of all project decisions
- `decisions/framework-selection.md` - Framework selection criteria
- `decisions/tool-evaluation.md` - Tool evaluation methodology

### 📖 Guides

#### AI Development

- `guides/ai-development/ai-debugging.md` - Debugging with AI assistants
- `guides/ai-development/local-model-setup.md` - Setting up local AI models
- `guides/ai-development/prompt-engineering.md` - Effective prompt writing
- `guides/ai-development/working-with-cursor.md` - Cursor IDE integration

#### Onboarding

- `guides/onboarding/new-developer.md` - New developer onboarding guide
- `guides/onboarding/project-setup.md` - Initial project setup steps

#### Performance

- `guides/performance/optimization-playbook.md` - Performance optimization techniques

#### Security

- `guides/security/security-optimal-practices.md` - Security implementation guide

#### Testing

- `guides/testing/comprehensive-testing-guide.md` - Complete testing strategy

#### Workflows

- `guides/workflows/daily-development.md` - Daily development workflow
- `guides/workflows/deployment-process.md` - Deployment procedures
- `guides/workflows/feature-lifecycle.md` - Feature development lifecycle

### 🚀 New Project Decisions

- `newproject_decisions/ai-integration-patterns.md` - AI integration strategies
- `newproject_decisions/decision-matrix-api-architecture.md` - API architecture comparison
- `newproject_decisions/decision-matrix-backend-runtime.md` - Backend runtime selection
- `newproject_decisions/decision-matrix-build-tools.md` - Build tool comparison
- `newproject_decisions/decision-matrix-database.md` - Database selection guide
- `newproject_decisions/decision-matrix-frontend.md` - Frontend framework selection
- `newproject_decisions/decision-matrix-monorepo.md` - Monorepo vs polyrepo
- `newproject_decisions/desktop-app-patterns.md` - Desktop application patterns
- `newproject_decisions/local-development-stack-guide.md` - Local dev environment setup
- `newproject_decisions/local-error-handling.md` - Local development error handling
- `newproject_decisions/project-requirements.md` - Project requirements template
- `newproject_decisions/TECHNICAL_STACK_GAPS_ANALYSIS.md` - Technical stack analysis

### 💬 Prompts

- `prompts/architecture-prompt.md` - Architecture design prompts
- `prompts/debugging.md` - Debugging assistance prompts
- `prompts/feature-planning.md` - Feature planning prompts

### 🔧 Runbooks

- `runbooks/debugging-production.md` - Production debugging procedures
- `runbooks/deployment.md` - Deployment runbook
- `runbooks/incident-response.md` - Incident response procedures
- `runbooks/rollback.md` - Rollback procedures

### 📝 Templates

- `templates/API.template.md` - API documentation template
- `templates/component.template.md` - Component documentation template
- `templates/feature.template.md` - Feature documentation template

### 📋 Root Documentation

- `DOCUMENTATION_ROADMAP.md` - Documentation development roadmap

## Documentation Categories Summary

1. **Architecture & Design** (12 files)
   - Core principles, patterns, and architectural decisions
2. **Development Guides** (13 files)
   - AI development, onboarding, testing, and workflows
3. **Technical Decisions** (13 files)
   - Framework comparisons and technology selection matrices
4. **Operational Docs** (7 files)
   - Runbooks, prompts, and templates
5. **Optimal Practices & Standards** (3 files)
   - AI assistant guidelines and project standards

**Total: 48 markdown documentation files**

## Quick Navigation

### For New Developers

Start with:

1. `guides/onboarding/new-developer.md`
2. `guides/onboarding/project-setup.md`
3. `architecture/decisions/000-core-principles.md`

### For Technical Decisions

Review:

1. `newproject_decisions/TECHNICAL_STACK_GAPS_ANALYSIS.md`
2. `newproject_decisions/local-development-stack-guide.md`
3. Relevant decision matrices in `newproject_decisions/`

### For Daily Development

Reference:

1. `guides/workflows/daily-development.md`
2. `guides/testing/comprehensive-testing-guide.md`
3. `architecture/patterns/` for specific patterns

### For Production Support

Use:

1. `runbooks/` directory for operational procedures
2. `guides/security/security-optimal-practices.md`
3. `guides/performance/optimization-playbook.md`
