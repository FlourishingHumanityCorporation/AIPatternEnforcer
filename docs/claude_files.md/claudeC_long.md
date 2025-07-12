REMINDER
1. We are working on ProjectTemplate which is a meta project that has the goal to create a reusable project template
structure that solves common friction points when developing software with AI tools like Cursor and Claude by default
design. It should be copy and pastable. Below are general instructions.
2. We are mostly building local web applications with this Template. No need for all the enterprisey stuff and
complexity.


# 🚨 PROJECT Name INSTRUCTIONS 🚨

This file contains MANDATORY instructions for AI assistants working on ProjectName.
Read this ENTIRE file before making ANY changes to the codebase.

> 📋 **For initial setup and customization, see [SETUP.md](../../SETUP.md)**

---

## Table of Contents

1. [📋 TABLE OF CONTENTS](#-table-of-contents)
2. [🎯 QUICK REFERENCE](#-quick-reference)
  3. [Daily Commands](#daily-commands)
  4. [Key Files](#key-files)
  5. [Essential Shortcuts](#essential-shortcuts)
  6. [Quick Checks Before Commit](#quick-checks-before-commit)
7. [🔧 TROUBLESHOOTING INDEX](#-troubleshooting-index)
  8. [By Error Type](#by-error-type)
  9. [By Development Phase](#by-development-phase)
  10. [Common Scenarios](#common-scenarios)
11. [🛑 CRITICAL RULES](#-critical-rules)
12. [NEVER DO THESE (WILL BREAK THE PROJECT): ☐ Must all remain unchecked before
commit](#never-do-these-will-break-the-project-must-all-remain-unchecked-before-commit)
  13. [ALWAYS DO THESE: ☐ All boxes must be ticked](#always-do-these-all-boxes-must-be-ticked)
  14. [📁 ROOT DIRECTORY ALLOWLIST](#-root-directory-allowlist)
    15. [Allowed Root Files:](#allowed-root-files)
16. [📁 PROJECT OVERVIEW](#-project-overview)
  17. [Template Features:](#template-features)
  18. [Core Features:](#core-features)
19. [🏗️ TECHNICAL ARCHITECTURE](#-technical-architecture)
  20. [File Organization](#file-organization)
  21. [Key Technologies:](#key-technologies)
  22. [Port Allocation:](#port-allocation)
  23. [Database Architecture:](#database-architecture)
  24. [Database Configuration:](#database-configuration)
25. [Technical Stack Decision Resources (Local Development
Optimized):](#technical-stack-decision-resources-local-development-optimized)
  26. [Development Documentation (New):](#development-documentation-new)
  27. [⚖️ ARCHITECTURAL DECISION FRAMEWORK](#-architectural-decision-framework)
28. [🎨 FRONTEND DEVELOPMENT RULES](#-frontend-development-rules)
  29. [Component Architecture](#component-architecture)
  30. [Styling Rules](#styling-rules)
  31. [State Management Hierarchy](#state-management-hierarchy)
  32. [Form Handling Requirements](#form-handling-requirements)
  33. [Accessibility Requirements](#accessibility-requirements)
  34. [Performance Standards](#performance-standards)
  35. [Testing Requirements](#testing-requirements)
  36. [Common Component Patterns](#common-component-patterns)
  37. [AI-Specific Frontend Rules](#ai-specific-frontend-rules)
  38. [Frontend File Organization](#frontend-file-organization)
39. [🚀 QUICK START COMMANDS](#-quick-start-commands)
40. [🧪 TESTING REQUIREMENTS](#-testing-requirements)
  41. [MANDATORY Before ANY Commit:](#mandatory-before-any-commit)
  42. [What Tests Check:](#what-tests-check)
  43. [Template Validation Tests:](#template-validation-tests)
44. [📚 DOCUMENTATION STANDARDS](#-documentation-standards)
  45. [Documentation Structure](#documentation-structure)
  46. [Writing Rules:](#writing-rules)
  47. [Documentation Cleanup Rule:](#documentation-cleanup-rule)
  48. [Root Cause Prevention:](#root-cause-prevention)
  49. [Key Documents:](#key-documents)
50. [📐 ARROW-CHAIN ROOT-CAUSE ANALYSIS](#-arrow-chain-root-cause-analysis)
  51. [Framework Overview](#framework-overview)
  52. [S-T-A-H-V-P Methodology](#s-t-a-h-v-p-methodology)
  53. [ProjectName-Specific RCA Examples](#projectname-specific-rca-examples)
    54. [Example 1: Data Processing Failure](#example-1-data-processing-failure)
  55. [Implementation Checklist](#implementation-checklist)
  56. [Common Checkpoints](#common-checkpoints)
  57. [Root Cause Documentation Template](#root-cause-documentation-template)
58. [Root Cause Analysis](#root-cause-analysis)
59. [🎯 MANDATORY PROMPT IMPROVEMENT PROTOCOL](#-mandatory-prompt-improvement-protocol)
  60. [REQUIRED Response Format:](#required-response-format)
  61. [CRAFT Framework (MUST USE):](#craft-framework-must-use)
  62. [Prompt Enhancement Rules (MANDATORY):](#prompt-enhancement-rules-mandatory)
  63. [Example Transformation:](#example-transformation)
  64. [ENFORCEMENT CHECKLIST:](#enforcement-checklist)
65. [📋 MANUAL CONTEXT REQUIREMENTS](#-manual-context-requirements)
  66. [Required Context for Code Changes](#required-context-for-code-changes)
  67. [Context Template](#context-template)
68. [Current Implementation](#current-implementation)
69. [Task](#task)
70. [Related Context](#related-context)
  71. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
72. [⚡ PERFORMANCE REQUIREMENTS](#-performance-requirements)
  73. [Bundle Size Limits](#bundle-size-limits)
  74. [Response Time Standards](#response-time-standards)
  75. [Code Performance Rules](#code-performance-rules)
  76. [Performance Monitoring](#performance-monitoring)
77. [🛠️ IDE SETUP FOR AI DEVELOPMENT](#-ide-setup-for-ai-development)
  78. [ProjectTemplate VS Code Extension](#projecttemplate-vs-code-extension)
  79. [Required VS Code/Cursor Settings](#required-vs-codecursor-settings)
  80. [AI Context Control](#ai-context-control)
  81. [Keyboard Shortcuts for AI Workflow](#keyboard-shortcuts-for-ai-workflow)
  82. [Workspace Extensions](#workspace-extensions)
83. [🧪 TEST-FIRST DEVELOPMENT](#-test-first-development)
  84. [Test-First Workflow](#test-first-workflow)
  85. [Required Test Categories](#required-test-categories)
  86. [Test Coverage Requirements](#test-coverage-requirements)
  87. [AI Test Generation Rules](#ai-test-generation-rules)
  88. [Example Test-First Prompt](#example-test-first-prompt)
89. [🐛 DEBUG CONTEXT CAPTURE](#-debug-context-capture)
  90. [Debug Snapshot Command](#debug-snapshot-command)
  91. [Debug Context Template](#debug-context-template)
92. [Bug Report](#bug-report)
  93. [Error Message](#error-message)
  94. [Debug Snapshot](#debug-snapshot)
  95. [Steps to Reproduce](#steps-to-reproduce)
  96. [Expected vs Actual](#expected-vs-actual)
  97. [Recent Changes](#recent-changes)
  98. [Related Files](#related-files)
  99. [Debugging Checklist](#debugging-checklist)
100. [🔨 GENERATOR TOOLS](#-generator-tools)
  101. [Available Generators](#available-generators)
  102. [Generator Configuration](#generator-configuration)
  103. [Creating Custom Generators](#creating-custom-generators)
  104. [Generator Optimal Practices](#generator-optimal-practices)
105. [📚 REUSABLE RESOURCES](#-reusable-resources)
  106. [Prompt Library](#prompt-library)
  107. [Code Examples](#code-examples)
  108. [Architecture References](#architecture-references)
  109. [How to Use Resources](#how-to-use-resources)
  110. [Contributing to Resources](#contributing-to-resources)
111. [💡 LESSONS LEARNED](#-lessons-learned)
  112. [Module Organization](#module-organization)
  113. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
  114. [🚨 CONFIGURATION - NO CONFUSION RULE](#-configuration---no-confusion-rule)
115. [⚠️ COMMON ISSUES](#-common-issues)
  116. [Module Not Found Errors](#module-not-found-errors)
  117. [Type Errors (TypeScript/Python)](#type-errors-typescriptpython)
  118. [Test Failures](#test-failures)
  119. [Port Already in Use](#port-already-in-use)
  120. [Database Connection Errors](#database-connection-errors)
121. [🤖 AI ASSISTANT GUIDELINES](#-ai-assistant-guidelines)
  122. [Claude Code + Enforcement Integration](#claude-code-enforcement-integration)
  123. [Working with AI Tools (Cursor/Claude)](#working-with-ai-tools-cursorclaude)
    124. [Context Management](#context-management)
    125. [Common AI Tool Friction Points](#common-ai-tool-friction-points)
    126. [Prompt Templates for Common Tasks](#prompt-templates-for-common-tasks)
    127. [AI Tool Optimal Practices](#ai-tool-optimal-practices)
128. [🌐 BROWSER AUDIT WORKFLOW](#-browser-audit-workflow)
  129. [Required Command Chain (Non-Blocking):](#required-command-chain-non-blocking)
  130. [Troubleshooting Common Issues:](#troubleshooting-common-issues)
  131. [Screenshot Analysis Process:](#screenshot-analysis-process)
  132. [Critical Command Patterns:](#critical-command-patterns)
133. [AI-Compiled Documentation](#ai-compiled-documentation)
134. [api-patterns](#api-patterns)
  135. [Rules](#rules)
  136. [Patterns](#patterns)
  137. [Error Response Format](#error-response-format)
  138. [Context](#context)

## 📋 TABLE OF CONTENTS

1. [🛑 Critical Rules](#-critical-rules)
2. [📁 Project Overview](#-project-overview)
3. [🏗️ Technical Architecture](#-technical-architecture)
4. [🚀 Quick Start Commands](#-quick-start-commands)
5. [🧪 Testing Requirements](#-testing-requirements)
6. [📚 Documentation Standards](#-documentation-standards)
7. [📐 Arrow-Chain Root-Cause Analysis](#-arrow-chain-root-cause-analysis)
8. [🎯 Mandatory Prompt Improvement Protocol](#-mandatory-prompt-improvement-protocol)
9. [📋 Manual Context Requirements](#-manual-context-requirements)
10. [⚡ Performance Requirements](#-performance-requirements)
11. [🛠️ IDE Setup for AI Development](#-ide-setup-for-ai-development)
12. [🧪 Test-First Development](#-test-first-development)
13. [🐛 Debug Context Capture](#-debug-context-capture)
14. [🔨 Generator Tools](#-generator-tools)
15. [📚 Reusable Resources](#-reusable-resources)
16. [💡 Lessons Learned](#-lessons-learned)
17. [⚠️ Common Issues](#-common-issues)
18. [🤖 AI Assistant Guidelines](#-ai-assistant-guidelines)
19. [🌐 Browser Audit Workflow](#-browser-audit-workflow)
20. [🎯 Quick Reference](#-quick-reference)
21. [🔧 Troubleshooting Index](#-troubleshooting-index)

---

## 🎯 QUICK REFERENCE

### Daily Commands

```bash
# Development
npm run dev                    # Start development server
npm test                      # Run all tests
npm run lint                  # Run linting
npm run typecheck            # Check types

# Stack Decision
npm run choose-stack          # Interactive technology stack wizard
npm run stack-wizard          # Alternative command for stack wizard

# Debugging
npm run debug:snapshot       # Capture debug context
npm run analyze:bundle       # Check bundle size

# Code Generation
npm run generate:component   # Create new component (basic)
npm run g:component         # Short alias for component generation
npm run g:c                 # Enhanced component generator (interactive, requires terminal input)

# Template Setup
npm run cleanup:template    # Remove template files after project creation

# Template Validation
npm run test:template       # Run all validation tests
npm run test:functional     # Test template functionality
npm run test:ai            # Test AI integration effectiveness
npm run test:ux            # Test user experience
npm run test:pilot         # Validate pilot testing readiness
npm run validate           # Comprehensive validation with verbose output

# Enforcement Configuration
npm run enforcement:status  # Show current enforcement settings
npm run enforcement:config set-level WARNING  # Set enforcement level
npm run enforcement:metrics # Show violation metrics

# Fix Commands
npm run fix:docs            # Fix documentation style violations automatically
npm run fix:docs:dry-run    # Preview documentation fixes without applying them
```

### Key Files

- **AI Rules**: `CLAUDE.md` (this file) and `ai/config/.cursorrules`
- **Enforcement Guide**: `docs/guides/enforcement/ENFORCEMENT.md` - Complete enforcement system documentation
- **Context Control**: `.aiignore`
- **IDE Config**: `.vscode/settings.json`
- **Environment**: `.env` (never commit!) - see `.env.example`
- **Dependencies**: `package.json` or `requirements.txt`

### Essential Shortcuts

- Fix imports: `Cmd+Shift+O` (VS Code)
- Run tests: `Cmd+Shift+T` (custom)
- Debug current: `F5`
- Format document: `Shift+Alt+F`

### Quick Checks Before Commit

- [ ] Tests pass: `npm test`
- [ ] Linting clean: `npm run lint`
- [ ] Types valid: `npm run typecheck`
- [ ] No `console.log` statements
- [ ] No hardcoded secrets
- [ ] Documentation updated

---

## 🔧 TROUBLESHOOTING INDEX

### By Error Type

- **Module not found** → [Common Issues](#common-issues)
- **Type errors** → [Common Issues](#common-issues)
- **Test failures** → [Testing Requirements](#testing-requirements)
- **Performance issues** → [Performance Requirements](#performance-requirements)
- **AI ignoring instructions** → [AI Assistant Guidelines](#ai-assistant-guidelines)

### By Development Phase

- **Setup problems** → [Quick Start Commands](#quick-start-commands)
- **Coding standards** → [Critical Rules](#critical-rules)
- **Debugging issues** → [Arrow-Chain Root-Cause Analysis](#arrow-chain-root-cause-analysis)
- **Documentation needs** → [Documentation Standards](#documentation-standards)
- **Testing guidance** → [Test-First Development](#test-first-development)

### Common Scenarios

- **"AI created duplicate file"** → See rule #1 in [Critical Rules](#critical-rules)
- **"Can't import module"** → Check [File Organization](#file-organization)
- **"Tests won't run"** → Check environment in [Quick Start Commands](#quick-start-commands)
- **"Port already in use"** → See [Common Issues](#common-issues)
- **"AI missing context"** → Read [Manual Context Requirements](#manual-context-requirements)

---

## 🛑 CRITICAL RULES

### NEVER DO THESE (WILL BREAK THE PROJECT): ☐ Must all remain unchecked before commit

1. **NEVER create `*_improved.py`, `*_enhanced.py`, `*_v2.py`** - ALWAYS edit the original file
2. **NEVER create files in root directory** - Use proper subdirectories
3. **NEVER use bare except clauses** - Always specify exception types
4. **NEVER use `sys.path.append()`** - Use proper package imports
5. **NEVER use `print()` in production** - Use `logging.getLogger(__name__)`
6. **NEVER create announcement-style docs** - No "This document describes!"
7. **NEVER implement poor workarounds** - Fix the root causes of issues. Use Arrow-Chain RCA methodology (see [Root
Cause Analysis](#-arrow-chain-root-cause-analysis))

### ALWAYS DO THESE: ☐ All boxes must be ticked

1. **ALWAYS check existing code first**: Don't create duplicate functionality
2. **ALWAYS use specific imports**: `from module import SpecificClass`
3. **ALWAYS update CLAUDE.md**: Document significant changes here
4. **ALWAYS follow file organization**: See [File Organization](#file-organization)
5. **ALWAYS delete completion docs immediately**: Never create status/summary/complete files
6. **ALWAYS use measured, technical language**: Avoid superlatives like "complete", "flawless", "optimal","functional",
"robust" in technical contexts
7. **ALWAYS use Arrow-Chain RCA for debugging**: Follow S-T-A-H-V-P methodology for all bug fixes

### 📁 ROOT DIRECTORY ALLOWLIST

**NEVER create files in root directory unless explicitly allowed below. This is enforced by
`tools/enforcement/root-file-enforcement.js`**

#### Allowed Root Files:

**Documentation (exactly these files):**
- `README.md` - Project overview
- `LICENSE` - Legal license
- `CLAUDE.md` - AI instructions (this file)
- `CONTRIBUTING.md` - Contribution guide
- `SETUP.md` - Setup instructions
- `FRICTION-MAPPING.md` - Template friction mapping

**Configuration Files:**
- Package managers: `package.json`, `package-lock.json`, `requirements.txt`, `go.mod`, etc.
- Build tools: `vite.config.js`, `webpack.config.js`, `tsconfig.json`, etc.
- Linting: `.eslintrc.json`, `.prettierrc`, etc.
- Environment: `.env.example` (NEVER commit `.env`)
- CI/CD: `Dockerfile`, `docker-compose.yml`, etc.

**Everything else MUST go in subdirectories:**
- Reports/Summaries → `docs/reports/`
- Plans/Proposals → `docs/plans/`
- Architecture docs → `docs/architecture/`
- Scripts → `scripts/`
- Tests → `tests/`
- Source code → `src/`
- Debug/temp files → Delete or add to `.gitignore`

**Enforcement:**
```bash
npm run check:root     # Check for violations
npm run check:all      # Run all enforcement checks
git commit             # Pre-commit hook runs automatically
```

Files violating these rules will block commits. See full allowlist in `tools/enforcement/root-file-enforcement.js`.

---

## 📁 PROJECT OVERVIEW

This template now includes comprehensive technical documentation to accelerate development:

- **Technical Stack Decisions**: Backend runtime, API patterns, database selection matrices optimized for local development
- **Development Standards**: API design, data modeling, security practices, and performance optimization guides
- **Testing & Quality**: Comprehensive testing patterns with AI-assisted test generation
- **Local-First Focus**: All documentation prioritizes developer experience and rapid iteration
- **AI Tool Integration**: Standardized configurations for Claude, Cursor, and Copilot with local model support
- **Code Generation**: Working component generators with comprehensive templates
- **Context Management**: Intelligent context optimization for AI development

See the Technical Stack Decision Resources and Development Documentation sections for detailed guidance.

### Template Features:

- **AI Configurations**: Centralized in `ai/config/` - see [AI Configuration README](../../ai/config/README.md)
- **Component Generator**: Run `npm run g:component MyComponent` - see [Generator Tools](#generator-tools)
- **Context Optimizer**: Run `npm run context:optimize` - see [Context Management](../../scripts/dev/context-optimizer.sh)
- **Local AI Models**: Complete setup guide in [Local Model Setup](../guides/ai-development/local-model-setup.md)
- **Friction Mapping**: Solutions to common AI dev problems in [FRICTION-MAPPING.md](../../FRICTION-MAPPING.md)

### Core Features:

- [Feature 1: e.g., User authentication and authorization]
- [Feature 2: e.g., Real-time data synchronization]
- [Feature 3: e.g., RESTful API with OpenAPI documentation]
- [Feature 4: e.g., Automated testing and CI/CD pipeline]
- [Feature 5: e.g., Comprehensive logging and monitoring]

---

## 🏗️ TECHNICAL ARCHITECTURE

### File Organization

```text
project-root/
├── src/                    # Source code
│   ├── api/               # API routes/controllers
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   └── utils/             # Shared utilities
├── tests/                  # Test files mirroring src structure
├── scripts/               # Development & deployment scripts
├── docs/                  # Documentation
│   ├── architecture/      # Technical decisions
│   ├── guides/           # How-to guides
│   └── api/              # API documentation
├── client/                # Frontend (if applicable)
└── config/               # Configuration files
```

### Key Technologies:

- **Backend**: [Node.js/Express | Python/FastAPI | Go/Gin | Rust/Actix]
- **Frontend**: [React/Next.js | Vue/Nuxt | Angular | Svelte/SvelteKit]
- **Database**: [PostgreSQL | SQLite | MongoDB | Redis]

### Port Allocation:

- Frontend: 3000 (Vite/Next.js default)
- Backend API: 8000 (FastAPI/Django default) or 3001 (Express)
- Database: 5432 (PostgreSQL) or 3306 (MySQL)
- Redis/Cache: 6379
- Documentation: 3003

### Database Architecture:

- **Primary Database**: [PostgreSQL/SQLite/MongoDB]
- **Schema Migration Tool**: [Drizzle/Prisma/Alembic/migrate]
- **Connection Pooling**: Enabled with max connections = 20
- **Backup Strategy**: Daily automated backups

### Database Configuration:

```javascript
// Example for Node.js/PostgreSQL
DB_HOST = localhost;
DB_PORT = 5432;
DB_NAME = projectname_dev;
DB_USER = developer;
DB_PASSWORD = use_env_variable;
DB_POOL_SIZE = 20;
```

### Technical Stack Decision Resources (Local Development Optimized):

- **Local Dev Stack Guide**: See `docs/newproject_decisions/local-development-stack-guide.md` for complete local-first development recommendations
- **Backend Runtime**: See `docs/newproject_decisions/decision-matrix-backend-runtime.md` for Node.js vs Python vs Go vs Rust (updated for local dev priorities)
- **API Architecture**: See `docs/newproject_decisions/decision-matrix-api-architecture.md` for REST vs GraphQL vs gRPC vs tRPC patterns
- **Database Selection**: See `docs/newproject_decisions/decision-matrix-database.md` for PostgreSQL vs SQLite vs NoSQL options
- **Frontend Framework**: See `docs/newproject_decisions/decision-matrix-frontend.md` for React vs Vue vs Angular vs Svelte
- **Full Gap Analysis**: See `docs/newproject_decisions/TECHNICAL_STACK_GAPS_ANALYSIS.md` for comprehensive technical decision documentation needs (local focus)

### Development Documentation (New):

- **Testing Guide**: See `docs/guides/testing/comprehensive-testing-guide.md` for unit, integration, and E2E testing patterns
- **API Standards**: See `docs/architecture/patterns/api-design-standards.md` for RESTful design, error handling, and pagination
- **Data Modeling**: See `docs/architecture/patterns/data-modeling-guide.md` for schema design, relationships, and migrations
- **Security Practices**: See `docs/guides/security/security-optimal-practices.md` for authentication, authorization, and input validation
- **Performance Guide**: See `docs/guides/performance/optimization-playbook.md` for frontend and backend optimization techniques
- **Documentation Roadmap**: See `docs/DOCUMENTATION_ROADMAP.md` for complete list of planned documentation

---

### ⚖️ ARCHITECTURAL DECISION FRAMEWORK

**When to Use Standard Solutions:**

- Authentication: Use established libraries (NextAuth, Django-Auth, etc.)
- Database ORM: Use mature solutions (Prisma, SQLAlchemy, GORM)
- API Framework: Use well-documented frameworks
- Testing: Use standard tools (Jest, Pytest, Go testing)

**When Custom Implementation is Justified:**

- Core business logic unique to your domain
- Performance-critical paths with specific requirements
- Integration with proprietary systems
- Specific security requirements not met by standard tools

**Documentation Required for Custom Implementation:**

- Architecture Decision Record (ADR) in `docs/architecture/decisions/`
- Performance benchmarks comparing with standard solution
- Security review documentation
- Maintenance plan and knowledge transfer guide

---

## 🎨 FRONTEND DEVELOPMENT RULES

### Component Architecture

- **ALWAYS use functional components with TypeScript** - No class components
- **ALWAYS include loading, error, and empty states** - Use enhanced component generator
- **ALWAYS implement keyboard navigation** - All interactive elements must be keyboard accessible
- **NEVER use `any` type** - Define proper interfaces for all props and state
- **ALWAYS use the enhanced component generator** - `npm run g:c ComponentName`

### Styling Rules

- **USE design tokens for all values** - Colors, spacing, typography from tokens
- **USE CSS modules for component styles** - One `.module.css` per component
- **USE Tailwind for layout and utilities** - When adopted by project
- **NEVER use inline styles** - Except for truly dynamic values (e.g., transform)
- **ALWAYS support dark mode** - Use CSS variables for theme switching
- **ALWAYS include responsive design** - Mobile-first approach

### State Management Hierarchy

Follow this decision tree for state management:

1. **Local state (`useState`)** - Component-specific UI state
2. **Derived state** - Compute from existing state, don't duplicate
3. **Context API** - Shared between 3-5 components
4. **Zustand/Redux Toolkit** - App-wide client state
5. **React Query/SWR** - Server state (API data)
6. **URL state** - Filters, pagination, navigation state

### Form Handling Requirements

- **USE controlled components** - Value and onChange for all inputs
- **USE proper validation** - Client-side with server-side fallback
- **ALWAYS show validation errors** - Below fields with proper ARIA
- **ALWAYS disable submit during submission** - Prevent double submits
- **USE the form component template** - `npm run g:c FormName --template form`

### Accessibility Requirements

Every component MUST include:

- **Semantic HTML** - Use proper elements (button, nav, main, etc.)
- **Keyboard support** - Tab navigation, Enter/Space activation
- **ARIA labels** - For icon-only buttons and complex widgets
- **Focus indicators** - Visible and high contrast
- **Screen reader announcements** - For dynamic content changes
- **Skip links** - For main navigation
- **Alt text** - For all informative images

### Performance Standards

- **React.memo() for lists** - Any list with >10 items
- **Virtualization for long lists** - >100 items or infinite scroll
- **Lazy load routes** - Use React.lazy() for code splitting
- **Optimize images** - WebP format, responsive sizes, lazy loading
- **Debounce user input** - Search fields, auto-save, API calls
- **Bundle size limits** - Monitor with webpack-bundle-analyzer

### Testing Requirements

- **Test user interactions** - Click, keyboard, focus behavior
- **Test all states** - Loading, error, empty, success
- **Test accessibility** - Use @testing-library/jest-dom matchers
- **Test responsive behavior** - Different viewport sizes
- **Visual regression tests** - For critical UI components
- **E2E for critical paths** - User signup, checkout, core features

### Common Component Patterns

```typescript
// ✅ CORRECT: Enhanced component with all states
export const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  error,
  onUserClick
}) => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (users.length === 0) return <EmptyState message="No users found" />;

  return (
    <ul role="list">
      {users.map(user => (
        <UserItem key={user.id} user={user} onClick={onUserClick} />
      ))}
    </ul>
  );
};

// ❌ WRONG: Missing states and accessibility
export const UserList = ({ users }) => {
  return users.map(user => <div onClick={() => {}}>{user.name}</div>);
};
```

### AI-Specific Frontend Rules

When generating frontend code with AI:

1. **ALWAYS request the template type** - Interactive, display, form, data, or overlay
2. **SPECIFY the styling approach** - CSS modules, Tailwind, or styled-components
3. **INCLUDE sample data structures** - Show the shape of props
4. **REQUIRE accessibility** - Ask for ARIA labels and keyboard support
5. **CHECK bundle impact** - For new dependencies

### Frontend File Organization

```text
src/
├── components/          # Shared components (generated)
│   ├── Button/
│   ├── Card/
│   └── Form/
├── features/           # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── dashboard/
├── hooks/              # Shared custom hooks
├── styles/             # Global styles and tokens
│   ├── tokens.css
│   ├── globals.css
│   └── themes/
├── lib/                # External integrations
└── types/              # Shared TypeScript types
```

---

## 🚀 QUICK START COMMANDS

```bash
# Install dependencies
npm install || pip install -r requirements.txt || go mod download || cargo build

# Setup development environment
cp .env.example .env
# Edit .env with your local settings

# Run database migrations
npm run db:migrate || python manage.py migrate || go run migrations/*.go

# Start development server
npm run dev || python manage.py runserver || go run . || cargo run

# Run tests
npm test || pytest || go test ./... || cargo test

# Build for production
npm run build || python setup.py build || go build || cargo build --release

# Generate component
npm run generate:component MyComponent
npm run g:component MyComponent  # Short alias

# Optimize AI context
npm run context:optimize

# Capture debug snapshot
npm run debug:snapshot

# Clean up template files (run once after creating new project)
npm run cleanup:template
```

> 📖 **See also**: [Generator Tools](#generator-tools) for all available generators

---

## 🧪 TESTING REQUIREMENTS

### MANDATORY Before ANY Commit:

```bash
# Run all tests (adapts to detected test runner)
npm test || pytest || go test ./... || cargo test

# Run linting
npm run lint || ruff check . || golangci-lint run || cargo clippy

# Run type checking (if applicable)
npm run typecheck || mypy . || tsc --noEmit

# Check formatting
npm run format:check || black --check . || gofmt -l . || cargo fmt -- --check
```

### What Tests Check:

- **Unit tests**: Business logic in isolation (minimum 70% coverage)
- **Integration tests**: Component interactions and API endpoints
- **E2E tests**: Critical user flows and happy paths
- **Performance tests**: Response times under expected load
- **Security tests**: Input validation and authentication

### Template Validation Tests:

- **Functional tests**: Template structure, scripts, and configurations
- **AI integration tests**: AI tool effectiveness and context management
- **User experience tests**: Usability, documentation, and developer experience

Run template validation with:

```bash
npm run test:template    # Run all validation tests
npm run validate        # Verbose validation with detailed output
```

> 📖 **See also**: [Test-First Development](#test-first-development) for mandatory test-writing workflow and [Template
Validation Framework](../testing/TEMPLATE_VALIDATION_FRAMEWORK.md) for comprehensive testing methodology

---

## 📚 DOCUMENTATION STANDARDS

### Documentation Structure

```text
docs/
├── architecture/
│   ├── decisions/          # ADRs (Architecture Decision Records)
│   ├── diagrams/          # System architecture diagrams
│   └── patterns/          # Design patterns used
├── guides/
│   ├── development/       # Dev environment setup
│   ├── deployment/        # Production deployment
│   └── troubleshooting/   # Common issues and solutions
├── api/
│   ├── endpoints/         # REST API documentation
│   └── schemas/           # Data models and validation
└── meeting-notes/         # Team decisions and discussions
```

### Writing Rules:

- ❌ NO: "This document describes..."
- ❌ NO: "Implemented!"
- ❌ NO: "As of December 2024..."
- ❌ NO: Code blocks > 20 lines
- ❌ NO: Completion/status announcements ("FIXED", "COMPLETE")
- ❌ NO: Process documentation (cleanup notes, migration guides)
- ❌ NO: Superlatives in technical contexts ("complete", "functional", "robust")
- ✅ YES: Professional, timeless language
- ✅ YES: Link to source files
- ✅ YES: Measured, descriptive language ("functional", "working", "operational")
- ✅ YES: Matter-of-fact summaries focused on next steps (not overconfident progress claims)

### Documentation Cleanup Rule:

**DELETE, don't archive!** Remove irrelevant docs completely:

- Status announcements ("Everything Fixed", "Complete")
- Process documentation (migration guides, refactoring notes)
- Outdated planning documents
- Duplicate content

### Root Cause Prevention:

**Why completion docs get created and how to prevent:**

- ❌ **Symptom**: Creating "COMPLETE.md", "FINAL.md", "SUMMARY.md" files
- ✅ **Root Cause**: Lack of process enforcement and automated checks
- ✅ **Prevention**: Never create status/completion documents
- ✅ **Alternative**: Update existing docs or use git commit messages for status

### Key Documents:

- **CLAUDE.md**: AI assistant instructions (this file)
- **README.md**: Project setup and overview
- **docs/**: All documentation

---

## 📐 ARROW-CHAIN ROOT-CAUSE ANALYSIS

**MANDATORY for all bug fixes and debugging in ProjectName**

### Framework Overview

The Arrow-Chain RCA methodology ensures systematic problem-solving by tracing data flow from symptoms to root causes:

```text
symptom₀
     ↓ (observation / log / metric)
checkpoint₁
     ↓ (data transformation, API, queue, …)
checkpoint₂
     ↓
⋯
checkpointₙ
     ↓ (fault)
root-cause
```

### S-T-A-H-V-P Methodology

**Mnemonic**: Symptom → Trace → Arrow chain → Hypothesis → Validate → Patch

| Phase              | What to do                                                       | Typical artifacts
|
| ------------------ | ---------------------------------------------------------------- |
---------------------------------- |
| 1. **S**ymptom     | List every visible defect (UI glitch, wrong value, crash)        | Bug ticket, screenshot, user
log   |
| 2. **T**race       | Walk downstream (where consumed?) and upstream (where produced?) | Source map, call graph, API
logs   |
| 3. **A**rrow chain | Write one line per hop: A → B → C until first divergence         | ASCII diagram in PR/comment
|
| 4. **H**ypothesis  | Articulate what should have happened vs. what did happen         | One-sentence root-cause
statement  |
| 5. **V**alidate    | Reproduce with controlled test; confirm fix resolves symptom     | Unit/integration test, log
snippet |
| 6. **P**atch       | Implement fix, add regression tests, update docs/monitoring      | PR diff, CI job, updated docs
|

### ProjectName-Specific RCA Examples

#### Example 1: Data Processing Failure

**Symptom**: Dashboard shows "No data available" despite data being uploaded successfully

**Arrow Chain**:

```text
User uploads CSV file
     ↓ (saved to uploads/)
file-upload-service.ts writes to uploads/temp/
     ↓ (background job queued)
data-processor worker picks up job
     ↓ (parsing stage)
CSV parsing fails silently        ← root cause: unhandled Unicode BOM
     ↓ (database write skipped)
processed_data table remains empty
     ↓ (API query)
dashboard-service.ts returns empty array
     ↓
UI shows "No data available"
```

**Fix**: Add BOM detection and removal in CSV parser, implement error logging for failed parsing

### Implementation Checklist

When debugging ANY issue:

- [ ] Document the visible symptom(s) with screenshots/logs
- [ ] Trace data flow through the system (use grep/search tools)
- [ ] Draw arrow chain showing each transformation point
- [ ] Identify the FIRST point where data diverges from expected
- [ ] Form hypothesis about root cause (not just proximate cause)
- [ ] Create minimal test case that reproduces the issue
- [ ] Implement fix at the root cause level
- [ ] Add regression test to prevent recurrence
- [ ] Update documentation if needed

> 📖 **See also**: [Debug Context Capture](#debug-context-capture) for comprehensive debugging tools

### Common Checkpoints

1. **File Upload Pipeline**:
   - `upload-handler.ts` → `temp/` → background worker → `processed_data` table
2. **Authentication Flow**:
   - `login-controller.ts` → `auth-service.ts` → JWT generation → `sessions` table

3. **API Request Pipeline**:
   - Client request → API gateway → rate limiter → route handler → database → response

4. **Background Job Processing**:
   - Job creation → queue → worker pickup → processing → status update → completion

### Root Cause Documentation Template

When fixing bugs, document in PR/commit message:

```markdown
## Root Cause Analysis

**Symptom**: [What user sees]
**Root Cause**: [First divergence point]
**Arrow Chain**:
```

[step by step data flow]

```text
**Fix**: [What was changed and why]
**Test**: [How to verify fix works]
```

---

## 🎯 MANDATORY PROMPT IMPROVEMENT PROTOCOL

**🚨 CRITICAL: Claude MUST ALWAYS start responses by improving the user prompt using CRAFT framework. This is
NON-NEGOTIABLE. 🚨**

### REQUIRED Response Format:

```text
**Improved Prompt**: [Enhanced version using CRAFT framework]

**Implementation Plan**:
1. [Specific step]
2. [Specific step]
3. [Specific step]

[Then proceed with actual work]
```

### CRAFT Framework (MUST USE):

- **C**ontext & Constraints: Add missing technical context, deadlines, audience
- **R**ole & Audience: Define perspective ("You are a RoleName...")
- **A**sk: Break compound tasks into numbered steps, request step-by-step reasoning
- **F**ormat: Specify output format (Markdown, JSON, code blocks, bullet lists)
- **T**one & Temperature: Set voice (technical, concise) and length constraints

### Prompt Enhancement Rules (MANDATORY):

1. **Anchor in clarity**: Transform vague requests ("fix this") into specific goals ("Fix TypeScript compilation errors
in server/index.ts")
2. **Structure for reasoning**: Break multi-step tasks into numbered steps with explicit reasoning requests
3. **Add examples**: Include input/output patterns when helpful for complex formatting
4. **Specify constraints**: Add technical context (file paths, dependencies, coding standards)
5. **Define success criteria**: What constitutes completion of the task

### Example Transformation:

```text
❌ User: "Fix the database connection"
✅ Improved: "You are a TypeScript developer working on ProjectName. Fix PostgreSQL connection errors in server/db.ts by:
1. Analyzing current connection code and error logs
2. Checking DATABASE_URL environment variable configuration
3. Testing connection with proper error handling
4. Ensuring compatibility with Drizzle ORM schema
Output: Code changes in diff format + explanation of fixes"
```

### ENFORCEMENT CHECKLIST:

- [ ] Every response starts with "**Improved Prompt**:"
- [ ] CRAFT framework applied to user request
- [ ] Project-specific context added
- [ ] Multi-step tasks broken down with TodoWrite
- [ ] Success criteria defined
- [ ] Technical constraints specified

**VIOLATION CONSEQUENCES**: Any response that doesn't start with prompt improvement will be considered non-compliant
with project standards.

> 📖 **See also**: [Manual Context Requirements](#manual-context-requirements) for providing context effectively

---

## 📋 MANUAL CONTEXT REQUIREMENTS

**🚨 CRITICAL: Never rely on AI's file reading or RAG retrieval. Always provide explicit context. 🚨**

### Required Context for Code Changes

When requesting code modifications:

1. **ALWAYS paste current code** - Do not rely on file reading capabilities
2. **Include explicit file paths** - Use format: `src/components/Button.tsx:45-67`
3. **Provide working examples** - Show what currently works before changes
4. **Include relevant imports** - Show all imports at the top of the file

### Context Template

````markdown
## Current Implementation

File: src/auth/login.ts (lines 45-67)

```typescript
// Current imports
import { useState } from "react";
import { apiClient } from "@/lib/api";

// Current code that needs modification
export async function login(credentials: LoginCredentials) {
  // ... paste exact current implementation ...
}
```text
````

## Task

[Specific change needed with clear success criteria]

## Related Context

- Using pattern from: src/auth/register.ts
- Must integrate with: src/store/authStore.ts
- API endpoint: POST /api/auth/login

````

### Anti-Patterns to Avoid
- ❌ "Update the login function" (no context provided)
- ❌ "Fix the bug in auth.ts" (vague, no specifics)
- ❌ "Make it like the other components" (no example shown)
- ✅ "Update login function in src/auth/login.ts:45-67 [paste current code] to add rate limiting"

> 📖 **See also**: [AI Assistant Guidelines](#ai-assistant-guidelines) for more prompt optimal practices

---

## ⚡ PERFORMANCE REQUIREMENTS

**All code must meet these performance standards:**

### Bundle Size Limits
- **Initial Load**: Maximum 200KB (gzipped)
- **Lazy Loaded Chunks**: Maximum 100KB each
- **Total Application**: Maximum 1MB (all chunks)

### Response Time Standards
- **API Queries**: < 200ms (p95)
- **API Mutations**: < 500ms (p95)
- **Page Load**: < 3s on 3G network
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s

### Code Performance Rules
1. **React Components**:
   - Use `React.memo()` for lists with >10 items
   - Implement virtualization for lists >100 items
   - Avoid inline function definitions in render

2. **State Management**:
   - Normalize data structures (no nested objects >2 levels)
   - Use selectors for computed values
   - Implement debouncing for rapid state changes

3. **Database Queries**:
   - ALWAYS use indexes for WHERE clauses
   - Include EXPLAIN ANALYZE for complex queries
   - Limit default query results to 50 items
   - Use pagination, never return unlimited results

4. **Import Optimization**:
   ```typescript
   // ❌ NEVER import entire libraries
   import _ from 'lodash';

   // ✅ ALWAYS use tree-shaking imports
   import debounce from 'lodash/debounce';
````

### Performance Monitoring

- Run `npm run analyze:bundle` before each commit
- Check lighthouse scores: `npm run lighthouse`
- Profile React components: `npm run profile`

> 📖 **See also**: [Testing Requirements](#testing-requirements) for performance test standards

---

## 🛠️ IDE SETUP FOR AI DEVELOPMENT

### ProjectTemplate VS Code Extension

**Install the ProjectTemplate Assistant extension for enhanced AI development:**

```bash
# From project directory
code --install-extension extensions/projecttemplate-assistant/projecttemplate-assistant-0.1.0.vsix
```

**Available Commands:**
- **Load AI Context**: `Cmd+Shift+C` / `Ctrl+Shift+C` - Optimizes context for AI tools
- **Refresh AI Context**: `Cmd+Shift+R` / `Ctrl+Shift+R` - Updates context after changes
- **Show Dashboard**: View project structure and enforcement status
- **Check File Naming**: Real-time validation of naming conventions

**Key Features:**
- Automatic AI context optimization from CLAUDE.md and .cursorrules
- Real-time file naming enforcement with warnings
- Project dashboard with enforcement metrics
- Integration with ProjectTemplate patterns

> 📖 **See**: `extensions/projecttemplate-assistant/INSTALLATION.md` for complete setup guide

### Required VS Code/Cursor Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact"
  ],

  // AI-specific settings
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "markdown": true
  },
  "aiAssistant.contextWindow": "focused",
  "aiAssistant.includeComments": false,
  "aiAssistant.maxTokens": 4000
}
```

### AI Context Control

Create `.aiignore` in project root:

```text
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.next/
out/

# Logs and temp files
*.log
*.tmp
.DS_Store

# Environment files
.env*
!.env.example

# Test coverage
coverage/
.nyc_output/

# Large assets
*.mp4
*.mov
*.zip
*.tar.gz

# Generated files
*.generated.ts
*.generated.js
```

### Keyboard Shortcuts for AI Workflow

Add to `keybindings.json`:

```json
[
  {
    "key": "cmd+shift+a",
    "command": "aiAssistant.explainCode",
    "when": "editorTextFocus"
  },
  {
    "key": "cmd+shift+t",
    "command": "aiAssistant.generateTests",
    "when": "editorTextFocus"
  },
  {
    "key": "cmd+shift+r",
    "command": "aiAssistant.refactor",
    "when": "editorTextFocus"
  }
]
```

### Workspace Extensions

Required extensions (`.vscode/extensions.json`):

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "GitHub.copilot",
    "GitHub.copilot-chat",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

> 📖 **See also**: [AI Assistant Guidelines](#ai-assistant-guidelines) for comprehensive AI tool setup

---

## 🧪 TEST-FIRST DEVELOPMENT

**MANDATORY: Always write tests BEFORE implementation. No exceptions.**

### Test-First Workflow

1. **FIRST: Write Comprehensive Tests**

   ```typescript
   describe("calculateDiscount", () => {
     // Edge cases MUST be included
     it("returns 0 for null input", () => {
       expect(calculateDiscount(null)).toBe(0);
     });

     it("returns 0 for negative prices", () => {
       expect(calculateDiscount(-100, 0.1)).toBe(0);
     });

     it("caps discount at 100%", () => {
       expect(calculateDiscount(100, 1.5)).toBe(100);
     });

     it("handles floating point precision", () => {
       expect(calculateDiscount(19.99, 0.1)).toBe(2.0);
     });

     it("applies standard discount correctly", () => {
       expect(calculateDiscount(100, 0.2)).toBe(20);
     });
   });
   ```

2. **THEN: Implement to Pass Tests**
   - Only write code that makes tests pass
   - No additional functionality beyond test requirements
   - Refactor only after all tests are green

### Required Test Categories

Every feature MUST include:

1. **Happy Path Tests** - Normal expected usage
2. **Edge Cases**:
   - Null/undefined inputs
   - Empty arrays/objects
   - Zero/negative numbers
   - Maximum values/boundaries
3. **Error Cases** - Invalid inputs, exceptions
4. **Integration Tests** - Component interactions
5. **Performance Tests** - For critical paths

### Test Coverage Requirements

- **Minimum Coverage**: 80% overall
- **Critical Paths**: 100% coverage required
- **New Features**: 90% coverage before merge
- **Bug Fixes**: Must include regression test

### AI Test Generation Rules

When AI generates code without tests:

1. **REJECT the implementation**
2. **REQUEST**: "Generate comprehensive tests first, including edge cases"
3. **REVIEW** test completeness before accepting implementation
4. **VERIFY** all test categories are covered

### Example Test-First Prompt

```markdown
Generate comprehensive tests for a user authentication function with these requirements:

- Validates email format
- Checks password strength (min 8 chars, 1 uppercase, 1 number)
- Returns success with token or specific error messages
- Rate limits to 5 attempts per hour

Include: happy path, validation failures, rate limiting, edge cases, and error scenarios.
Generate ONLY tests first, no implementation.
```

> 📖 **See also**: [Testing Requirements](#testing-requirements) and [Generator Tools](#generator-tools)

---

## 🐛 DEBUG CONTEXT CAPTURE

**Never debug with partial information. Always capture full context.**

### Debug Snapshot Command

Create and use `scripts/dev/debug-snapshot.sh`:

```bash
#!/bin/bash
# Captures comprehensive debugging context

echo "=== Debug Snapshot: $(date) ==="

echo -e "\n=== Environment Info ==="
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "OS: $(uname -a)"

echo -e "\n=== Git Status ==="
git status --short
git log --oneline -5

echo -e "\n=== Running Processes ==="
ps aux | grep -E "(node|npm|webpack|vite)" | grep -v grep

echo -e "\n=== Port Status ==="
lsof -i :3000 -i :8000 -i :5432 2>/dev/null || echo "No services on standard ports"

echo -e "\n=== Recent Errors ==="
find . -name "*.log" -mtime -1 -exec echo "--- {} ---" \; -exec tail -20 {} \;

echo -e "\n=== Memory Usage ==="
node -e "console.log(process.memoryUsage())"

echo -e "\n=== Environment Variables ==="
env | grep -E "^(NODE_|VITE_|REACT_|NEXT_|API_|DATABASE_)" | sort

echo -e "\n=== Package Versions ==="
npm list --depth=0 2>/dev/null | head -20

echo -e "\n=== TypeScript Errors ==="
npx tsc --noEmit 2>&1 | head -20 || echo "No TypeScript errors"
```

### Debug Context Template

When reporting bugs or requesting debugging help:

```markdown
## Bug Report

### Error Message
```

[Paste complete error with stack trace]

```

### Debug Snapshot
```

[Run: npm run debug:snapshot or ./scripts/dev/debug-snapshot.sh]
[Paste output]

```

### Steps to Reproduce
1. [Specific action]
2. [Specific action]
3. [Error occurs]

### Expected vs Actual
- Expected: [What should happen]
- Actual: [What actually happened]

### Recent Changes
```

[git diff or description of recent changes]

```

### Related Files
- [List files that might be involved]
```

### Debugging Checklist

Before requesting help:

- [ ] Captured full debug snapshot
- [ ] Included complete error message with stack trace
- [ ] Checked recent git changes
- [ ] Verified environment variables
- [ ] Tested in fresh environment
- [ ] Checked for running processes on expected ports
- [ ] Reviewed recent logs

> 📖 **See also**: [Arrow-Chain Root-Cause Analysis](#arrow-chain-root-cause-analysis) for systematic debugging

---

## 🔨 GENERATOR TOOLS

**Use generators for consistency. Never manually create boilerplate.**

### Available Generators

```bash
# Enhanced Component Generator (Interactive)
npm run g:c MyButton          # Requires terminal interaction - select template type
# Creates complete component structure with tests and stories

# Basic Component Generator
npm run generate:component MyButton
npm run g:component MyButton  # Short alias
# Creates:
# - src/components/MyButton/index.ts
# - src/components/MyButton/MyButton.tsx
# - src/components/MyButton/MyButton.test.tsx
# - src/components/MyButton/MyButton.stories.tsx
# - src/components/MyButton/MyButton.module.css

# Note: Enhanced generator (g:c) provides interactive template selection.
# Feature, API, and hook generators are planned for future releases.
# To create these structures manually, copy from existing examples
# or use the component generator as a starting point.
```

### Generator Configuration

Customize templates in `templates/`:

```text
templates/
├── component/
│   ├── {{name}}.tsx.hbs
│   ├── {{name}}.test.tsx.hbs
│   └── {{name}}.module.css.hbs
├── feature/
│   └── structure.json
└── api/
    └── {{endpoint}}.ts.hbs
```

### Creating Custom Generators

1. Add template to `templates/[type]/`
2. Create generator script in `tools/generators/`
3. Add npm script to package.json
4. Document usage in README

### Generator Optimal Practices

- **ALWAYS use generators** for new components/features
- **NEVER copy-paste** existing code as starting point
- **Customize templates** to match your patterns
- **Include tests** in all generated code
- **Update generators** when patterns evolve

> 📖 **See also**: [Reusable Resources](#reusable-resources) for templates and patterns

---

## 📚 REUSABLE RESOURCES

**Before creating anything new, check these resources:**

### Prompt Library

```text
ai/prompts/
├── feature/
│   ├── planning.md          # Feature planning template
│   ├── implementation.md    # Implementation guide
│   └── review.md           # Self-review checklist
├── debugging/
│   ├── error-analysis.md   # Systematic debugging
│   ├── performance.md      # Performance investigation
│   └── memory-leaks.md     # Memory debugging
├── refactoring/
│   ├── extract-component.md # Component extraction
│   ├── optimize-renders.md  # React optimization
│   └── reduce-complexity.md # Simplification guide
└── testing/
    ├── unit-tests.md       # Unit test templates
    ├── integration.md      # Integration patterns
    └── e2e.md             # E2E test scenarios
```

### Code Examples

```text
ai/examples/
├── good-patterns/
│   ├── error-handling/     # How to handle errors
│   ├── data-fetching/      # API integration patterns
│   ├── state-management/   # Store patterns
│   └── authentication/     # Auth flow examples
└── anti-patterns/
    ├── security/           # Common vulnerabilities
    ├── performance/        # Performance mistakes
    └── maintenance/        # Hard-to-maintain code
```

### Architecture References

- **Patterns**: `docs/architecture/patterns/`
- **Decisions**: `docs/architecture/decisions/`
- **Diagrams**: `docs/architecture/diagrams/`

### How to Use Resources

1. **Before implementing**: Check `ai/examples/good-patterns/`
2. **Before debugging**: Use `ai/prompts/debugging/`
3. **Before refactoring**: Review `ai/prompts/refactoring/`
4. **For AI prompts**: Start with `ai/prompts/` templates

### Contributing to Resources

When you solve a tricky problem:

1. Add example to `ai/examples/good-patterns/`
2. Create prompt template if reusable
3. Document decision in `docs/architecture/decisions/`
4. Share with team in next review

> 📖 **See also**: [Documentation Standards](#documentation-standards) and [Generator Tools](#generator-tools)

---

## 💡 LESSONS LEARNED

### Module Organization

- Check existing structure before creating files
- Use proper imports: `from project.module import Class`
- Consolidate related functionality
- Update all references when moving files

### Common Mistakes to Avoid

1. Creating duplicate functionality (check first!)
2. Putting scripts in root (use scripts/)
3. Forgetting to update imports after moving files
4. Not testing commands in documentation
5. Creating "improved" versions instead of editing

### 🚨 CONFIGURATION - NO CONFUSION RULE

All configuration lives in THREE places only:

1. **Environment Variables**: `.env` file (never commit!)
2. **Config Module**: `src/config/index.ts` or `config.py`
3. **Build Config**: `vite.config.ts`, `webpack.config.js`, etc.

NEVER scatter config across random files. ALWAYS use the config module.

Example config module structure:

```typescript
// src/config/index.ts
export const config = {
  app: {
    name: process.env.APP_NAME || "ProjectName",
    port: parseInt(process.env.PORT || "3000"),
    env: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DB_POOL_SIZE || "20"),
  },
  // ... other config sections
};
```

---

## ⚠️ COMMON ISSUES

### Module Not Found Errors

- **Check**: Is file in correct directory per file organization?
- **Check**: Using relative imports (`./module`) not absolute?
- **Fix**: `npm install` or equivalent for your package manager

### Type Errors (TypeScript/Python)

- **Check**: All imports include type definitions
- **Check**: tsconfig.json or mypy.ini properly configured
- **Fix**: Add type stubs or @types packages

### Test Failures

- **Check**: Database migrations run? Test DB clean?
- **Check**: Environment variables set correctly?
- **Fix**: Run setup script or check .env.example

### Port Already in Use

- **Check**: `lsof -ti:3000` (or relevant port)
- **Fix**: Kill process or change port in .env

### Database Connection Errors

- **Check**: Database service running?
- **Check**: Credentials in .env correct?
- **Fix**: Start database service, verify connection string

---

## 🤖 AI ASSISTANT GUIDELINES

### Claude Code + Enforcement Integration

**When Claude Code suggests problematic patterns, enforcement provides automatic course correction:**

```markdown
❌ Claude Code suggests: "Create user_service_improved.py with enhanced features"
✅ Enforcement blocks: Git commit fails with clear message about file naming rules
✅ Claude Code should suggest: "Edit existing user_service.py to add enhanced features"

❌ Claude Code suggests: "Let me create a duplicate AuthComponent_v2.tsx"
✅ Enforcement blocks: Pre-commit hook prevents file creation
✅ Claude Code should suggest: "Let me improve the existing AuthComponent.tsx"

❌ Claude Code generates: "This document describes this new feature!"
✅ Enforcement warns: Documentation style checker flags announcement language
✅ Claude Code should write: "This feature provides [technical description]"
```

**Enforcement-Aware Prompting:**

When requesting code from Claude Code, include enforcement context:
```markdown
"Create a user authentication component following ProjectTemplate patterns.
Note: Use the component generator (npm run g:c AuthComponent) and avoid
creating improved/enhanced file versions."
```

**How Claude Code Should Respond to Violations:**

1. **File Naming Violations**: Immediately suggest using original files or generators
2. **Import Issues**: Reference enforcement whitelist and suggest proper patterns
3. **Documentation Style**: Use technical, measured language per CLAUDE.md standards
4. **Component Creation**: Always recommend generators over manual creation

### Working with AI Tools (Cursor/Claude)

#### Context Management

- **ALWAYS include in prompt**: Current file path, technology stack, error messages
- **Use relative imports**: AI tools handle these better than absolute paths
- **Chunk large changes**: Break into 3-5 file edits max per interaction

#### Common AI Tool Friction Points

1. **Import Resolution**: Always show example imports at file top
2. **Type Definitions**: Include interface/type definitions in same file initially
3. **Test Data**: Provide sample data structures in comments
4. **API Endpoints**: Document request/response format inline

#### Prompt Templates for Common Tasks

```text
# For debugging
"Debug [error message] in [file:line]. Stack uses [tech]. Previous working state: [description]"

# For new features
"Add [feature] to [component]. Follows pattern in [similar_file]. Must integrate with [existing_system]"

# For refactoring
"Refactor [file] to [goal]. Preserve: [list]. Can modify: [list]. See [example] for pattern"
```

#### AI Tool Optimal Practices

- ✅ Provide explicit file paths
- ✅ Include 2-3 lines of context around changes
- ✅ Reference existing patterns in codebase
- ❌ Don't ask for entire file rewrites
- ❌ Don't assume AI knows your custom utilities
- ❌ Don't skip error messages or logs

---

## 🌐 BROWSER AUDIT WORKFLOW

**When requested to "run frontend in browser and audit with screenshot":**

### Required Command Chain (Non-Blocking):

1. **Start Backend Server (Non-Blocking)**:

```bash
# Start backend in background to avoid blocking
npm run dev:backend > /dev/null 2>&1 & || python manage.py runserver > /dev/null 2>&1 &
sleep 3  # Allow server startup time
```

2. **Start Frontend Server (Non-Blocking)**:

```bash
# Start frontend in background FROM PROJECT ROOT
npm run dev:frontend > /dev/null 2>&1 & || cd client && npm run dev > /dev/null 2>&1 &
sleep 2  # Allow Vite startup time

# IMPORTANT: Never use 'cd client && npx vite' - this breaks path resolution
```

3. **Verify Services Running**:

```bash
# Check backend (should return server info)
curl -s http://localhost:8000/health || echo "Backend not ready"

# Check frontend (should return HTML)
curl -s http://localhost:3000 | head -1 || echo "Frontend not ready"
```

4. **Open Browser and Capture**:

```bash
# Open in new Chrome tab (non-blocking)
osascript -e 'tell application "Google Chrome" to open location "http://localhost:3000"'

# Wait for page load, then capture
sleep 3
screencapture -x /tmp/ProjectName_audit.png
```

### Troubleshooting Common Issues:

**Port Conflicts:**

```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
```

### Screenshot Analysis Process:

1. **Capture Application Screenshot**: Use non-blocking screenshot commands
2. **Visual Audit Checklist**:
   - ✅ UI components render correctly
   - ✅ Data loads from API (no loading states stuck)
   - ✅ Navigation works between tabs
   - ✅ Task cards display properly
   - ✅ Time tracking controls functional
   - ✅ Stats display real data
   - ✅ Responsive design on different screen sizes

3. **Document Findings**: Record specific issues with file references (e.g.,
`client/src/components/dashboard/task-board.tsx:45`)

### Critical Command Patterns:

**✅ CORRECT - Non-Blocking Background Processes:**

```bash
command > /dev/null 2>&1 &    # Run in background
sleep N                       # Allow startup time
```

**❌ WRONG - Blocking Commands:**

```bash
npm run dev                   # Blocks terminal indefinitely
npx vite                      # Blocks until killed
```

**✅ CORRECT - Process Management:**

```bash
# Start with cleanup
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
npm run dev > /dev/null 2>&1 &
```

---

END OF INSTRUCTIONS - Now you can work on ProjectName!

## AI-Compiled Documentation

## api-patterns

### Rules

- Always use RESTful naming conventions: GET /users, POST /users, GET /users/:id
- Return consistent error responses with code, message, and details fields

### Patterns

### Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}
```

### Context

**endpoint-naming**: Use plural nouns for collections (users, not user)

**http-methods**: GET for reading, POST for creating, PUT for full updates, PATCH for partial updates, DELETE for
removal
