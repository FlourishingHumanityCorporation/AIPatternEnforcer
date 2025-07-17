# 🚨 PROJECT AI INSTRUCTIONS 🚨

## GOAL

AIPatternEnforcer is a mature meta-project that creates production-ready starter templates for AI applications. 
It provides a CLI tool (`npx create-ai-app`) that generates complete project structures in under 2 minutes, 
solving common friction points when developing software with AI tools like Cursor and Claude by default design.

**✅ ACHIEVED**: Sub-2-minute setup via CLI tool with 83% dependency reduction and comprehensive template ecosystem.

**🏠 TARGET USE CASE: LOCAL ONE-PERSON AI APPS ONLY**

- This template is for LOCAL development of personal AI projects
- NO enterprise features, authentication, user management, or multi-tenant systems
- Think: AI dating assistant (writing messages, swiping, understanding user background), AI document processor with OCR, personal AI assistant with VLM capabilities
- Uses mock/simplified auth for development convenience only
- Leverages AI capabilities: OCR, VLM (Vision Language Models), LLMs, vector search

## 🏗️ RECOMMENDED TECH STACK

**Frontend**: Next.js (App Router) + React
**UI**: Tailwind CSS + shadcn/ui + Radix UI
**State**: Zustand + TanStack Query
**Backend**: Next.js API Routes + Serverless Functions
**Database**: PostgreSQL (Neon) + Prisma + pgvector
**AI Integration**: OpenAI API, Anthropic Claude, vector embeddings

**Essential rules for AI assistants working on AIPatternEnforcer.**

Ultrathink = think really hard and deep

## ⚡ IMMEDIATE ACTION COMMANDS

```bash
# 🚀 NEW PROJECT (< 2 minutes):
npx create-ai-app my-ai-project    # Create new AI app with CLI
cd my-ai-project                   # Enter your new project
npm run dev                        # Start development

# 🔧 WORKING IN EXISTING STARTER:
cd starters/minimal-ai-app         # Work in included starter template
npm install                        # Install dependencies
npm run dev                        # Start development

# 🛡️ HOOKS ARE ENABLED BY DEFAULT in generated projects
# In starters: HOOKS_DISABLED=true (meta-project development)
# In generated projects: HOOKS_DISABLED=false (full protection)

# Daily workflow (in generated project):
npm run g:c ComponentName          # Generate component
npm test                          # Run tests
npm run check:all                # Protection validation + lint + type + test
git add . && git commit          # Commit (auto-validated)
```

## 🛑 CRITICAL RULES (READ FIRST)

### NEVER DO THESE (WILL BREAK PROJECT)

1. **NEVER create `*_improved.*`, `*_enhanced.*`, `*_v2.*`** - ALWAYS edit original files
2. **NEVER create files in root directory** - Use subdirectories only
3. **NEVER use `print()` or `console.log()` in production** - Use proper logging
4. **NEVER add enterprise features** - See comprehensive exclusion list below
5. **NEVER add complex authentication** - Use simple mock auth for local development only

### 🚫 COMPREHENSIVE ENTERPRISE FEATURE EXCLUSIONS

**Authentication & User Management**

- ❌ User sign-up/login systems (Clerk, Auth.js, Supabase Auth)
- ❌ Role-based access control (RBAC)
- ❌ User profiles and settings
- ❌ Password reset flows
- ❌ Multi-factor authentication
- ❌ Session management
- ❌ API key management for external users

**Infrastructure & DevOps**

- ❌ CI/CD pipelines (GitHub Actions beyond basic linting)
- ❌ Docker/Kubernetes configs
- ❌ Multi-environment deployments (staging, production)
- ❌ Load balancers and auto-scaling
- ❌ CDN configuration
- ❌ Database migrations and rollbacks
- ❌ Backup and disaster recovery
- ❌ Health check endpoints
- ❌ Graceful shutdown handlers

**Monitoring & Observability**

- ❌ Application Performance Monitoring (APM)
- ❌ Distributed tracing (OpenTelemetry)
- ❌ Log aggregation (DataDog, Splunk)
- ❌ Custom metrics and dashboards
- ❌ Error tracking services (Sentry)
- ❌ Uptime monitoring
- ❌ Real user monitoring (RUM)

**Security & Compliance**

- ❌ SOC2/HIPAA/GDPR compliance features
- ❌ Audit logging
- ❌ Data encryption at rest
- ❌ IP whitelisting
- ❌ DDoS protection
- ❌ Web Application Firewall (WAF)
- ❌ Security headers beyond basics
- ❌ Penetration testing tools

**Team & Collaboration**

- ❌ Code review workflows
- ❌ Team documentation wikis
- ❌ Shared development environments
- ❌ Feature flags systems
- ❌ A/B testing frameworks
- ❌ Multi-developer git workflows
- ❌ Project management integrations

**Business Features**

- ❌ Payment processing (Stripe, PayPal)
- ❌ Subscription management
- ❌ Usage-based billing
- ❌ Invoice generation
- ❌ Admin dashboards
- ❌ Customer support tools
- ❌ Email notification systems
- ❌ Marketing analytics
- ❌ Referral systems

**API & Integration**

- ❌ GraphQL layers
- ❌ REST API versioning
- ❌ API documentation (Swagger/OpenAPI)
- ❌ Webhook systems
- ❌ Rate limiting for external APIs
- ❌ API gateway patterns
- ❌ Third-party OAuth integrations
- ❌ Event-driven architectures

**Data & Analytics**

- ❌ Data warehousing
- ❌ ETL pipelines
- ❌ Business intelligence tools
- ❌ Complex caching strategies (Redis clusters)
- ❌ Read replicas
- ❌ Database sharding
- ❌ Change data capture (CDC)

**ANYTHING THAT'S ABOUT TEAMS**

### ALWAYS DO THESE

1. **ALWAYS use generators** - `npm run g:c ComponentName` for new components
2. **ALWAYS write tests first** - No exceptions
3. **ALWAYS run `npm run check:all` before commits**
4. **ALWAYS keep it simple** - This is for local personal projects, not production systems
5. **ALWAYS use mock data** - No real user accounts, use mockUser from lib/auth.ts

> 📖 **Need more details?** [Skip to full documentation](#-detailed-documentation) | [Quick
> Reference](docs/quick-reference.md)
> 🆘 **Having issues?** [Common fixes](#-common-issues) | [QUICK-START.md](QUICK-START.md)

---

# 📖 DETAILED DOCUMENTATION

_The sections below provide comprehensive guidance. Use the commands above for immediate action._

## Table of Contents

**Quick Reference:**

1. [Daily Commands](#daily-commands)
2. [Key Files](#key-files)
3. [Common Issues](#-common-issues)

**Complete Rules:** 4. [Root Directory Rules](#-root-directory-allowlist) 5. [Testing Requirements](#-testing-requirements) 6. [Documentation Standards](#-documentation-standards)

**Advanced Usage:** 7. [Generator Usage](#-generator-usage) 8. [Debugging Methodology](#-debugging-methodology) 9. [AI Assistant Integration](#-ai-assistant-integration) 10. [Project Overview](#-project-overview)

## 🎯 QUICK REFERENCE

### Daily Commands

```bash
# Development
npm run dev                   # Guides to starter directory
npm test                     # Run all tests
npm run lint                 # Run linting
npm run type-check          # Check types
npm run check:all           # All checks (lint + type + test)

# Code Generation
npm run g:c ComponentName    # Enhanced component generator (interactive)
npm run g:api ApiName        # API endpoint generator
npm run g:hook HookName      # Hook generator

# Documentation
npm run doc:create           # Create documentation from templates
npm run doc:validate         # Validate documentation against templates

# Project Creation
npx create-ai-app my-project # Create new AI project (<2 min) - RECOMMENDED
npm run create               # Run CLI tool locally
cd starters/minimal-ai-app   # Work in existing starter template

# Migration
npm run migrate:check        # Check if migration needed
npm run migrate:backup       # Backup existing work
npm run migrate:run          # Execute migration

# Debugging
npm run debug:snapshot       # Capture debug context
npm run context             # Load AI context

# Hook Protection System - AUTOMATIC VALIDATION
# ✅ AUTOMATIC: npm run check:all validates hook protection automatically
# ✅ AUTOMATIC: Blocks workflow if protection is disabled
# ✅ AUTOMATIC: No manual intervention needed for normal operation

# 🛡️ AUTOMATIC PROTECTION VALIDATION:
# npm run check:all now includes runtime protection validation
# It automatically checks that hooks are actually working, not just configured
# Perfect for "super lazy" coders - no manual debugging required!

# 🆘 EMERGENCY DEBUGGING (only if automatic validation fails):
npm run debug:hooks:monitor   # Real-time monitoring (manual)
npm run debug:hooks:validate  # Quick validation check
npm run debug:hooks:emergency # Emergency diagnostics only

# 🚨 FOR "SUPER LAZY" CODERS:
# Just run: npm run check:all
# It will automatically validate everything and tell you if something is wrong
# No need to remember debug commands - automation handles it!

# Template Validation
npm run validate            # Comprehensive validation
npm run test:template       # Run all validation tests

# Progress Tracking
npm run check:progress      # Check learning path progress
npm run setup:verify-ai     # Verify AI setup is working

# Enforcement (Modern Hook System) - AUTOMATED
npm run check:all           # AUTOMATIC runtime protection validation + lint + type + test
npm run test                # Run tests
npm run lint                # Run ESLint
npm run type-check          # TypeScript validation

# 🚨 AUTOMATIC PROTECTION VALIDATION:
# npm run check:all now AUTOMATICALLY validates that hooks are working
# It checks environment, configuration, and actual protection
# Blocks workflow if protection is disabled - no manual intervention needed!

# Real-time enforcement via Claude Code hooks (automatic):
# - Prevents _improved files during AI interactions
# - Blocks root directory violations
# - Auto-fixes console.log → logger
# - Enforces Next.js structure
# - Validates Prisma schemas
# See .claude/settings.json for active hooks
#
# 🎯 HOOK CONFIGURATION BY PROJECT TYPE:
# 
# META-PROJECT (AIPatternEnforcer): HOOKS_DISABLED=true
# - Hooks disabled during meta-project development
# - Allows experimental files and testing
#
# GENERATED PROJECTS (via CLI): HOOKS_DISABLED=false  
# - Hooks enabled by default for full protection
# - Prevents AI anti-patterns automatically
#
# VERIFY PROTECTION: Try creating "test_improved.js" - should be blocked in generated projects!
#
# 🔧 HOOK TROUBLESHOOTING FOR LAZY CODERS:
# • Hooks not blocking bad patterns? → Check .env file: HOOKS_DISABLED=false
# • Getting "undefined" in debug output? → Run: npm run debug:hooks:validate
# • Hooks running but not working? → Run: npm run debug:hooks:emergency
# • Want to see hooks in action? → Run: npm run debug:hooks:monitor
#
# Granular folder-level control (advanced - most users don't need this):
# export HOOK_AI_PATTERNS=true        # Controls ai-patterns/ hooks
# export HOOK_ARCHITECTURE=true       # Controls architecture/ hooks
# export HOOK_CLEANUP=true            # Controls cleanup/ hooks
# export HOOK_CONTEXT=true            # Controls context/ hooks
# export HOOK_IDE=true                # Controls ide/ hooks
# export HOOK_LOCAL_DEV=true          # Controls local-dev/ hooks
# export HOOK_PERFORMANCE=true        # Controls performance/ hooks
# export HOOK_PROMPT=true             # Controls prompt/ hooks
# export HOOK_PROJECT_BOUNDARIES=true # Controls project-boundaries/ hooks
# export HOOK_SECURITY=true           # Controls security/ hooks
# export HOOK_VALIDATION=true         # Controls validation/ hooks
# export HOOK_WORKFLOW=true           # Controls workflow/ hooks
```

### Key Files

- **Essential Rules**: `CLAUDE.md` (this file)
- **Quick Reference**: `docs/quick-reference.md` - Commands & troubleshooting
- **Workflow Integration**: `docs/guides/workflow-integration.md` - Complete system integration
- **Documentation Index**: `DOCS_INDEX.md` - Complete navigation hub
- **AI Config**: `ai/config/.cursorrules`
- **Claude Code Hooks**: `.claude/settings.json` - Real-time enforcement
- **Context Control**: `.aiignore`

---

## 🛑 CRITICAL RULES

### NEVER DO THESE (WILL BREAK THE PROJECT)

1. **NEVER create `*_improved.py`, `*_enhanced.py`, `*_v2.py`** - ALWAYS edit the original file
2. **NEVER create files in root directory** - Use proper subdirectories (see allowlist below)
3. **NEVER use bare except clauses** - Always specify exception types
4. **NEVER use `print()` in production** - Use `logging.getLogger(__name__)` (enforced automatically)
5. **NEVER use `console.log()` in production** - Use proper logging libraries (enforced automatically)
6. **NEVER create announcement-style docs** - No "This document describes!"
7. **NEVER implement workarounds** - ALWAYS fix root causes instead of symptoms
   - ❌ Don't change document structure to satisfy wrong template validation
   - ❌ Don't create special cases to bypass broken logic
   - ❌ Don't add flags or switches to work around design flaws
   - ✅ Fix the underlying system causing the problem
   - ✅ Use Arrow-Chain RCA methodology to find true root cause
   - ✅ Make systems more robust and extensible for future cases

### ALWAYS DO THESE

1. **ALWAYS check existing code first** - Don't create duplicate functionality
2. **ALWAYS use specific imports** - `from module import SpecificClass`
3. **ALWAYS use generators** - `npm run g:c ComponentName` for new components
4. **ALWAYS write tests first** - No exceptions, see [Test-First Development](docs/guides/testing/comprehensive-testing-guide.md)
5. **ALWAYS run enforcement checks** - `npm run check:all` before commits
6. **ALWAYS use measured, technical language** - Avoid superlatives in technical contexts

---

## 📁 ROOT DIRECTORY MANAGEMENT

**CRITICAL**: AIPatternEnforcer is a META-PROJECT for creating templates, NOT an application itself.

### 🚨 Root Directory Decision Checklist

When you encounter or want to create files in the root directory, follow this checklist:

#### 1. **STOP and IDENTIFY** - What type of file is this?

- [ ] Is it a meta-project configuration file? (package.json, tsconfig.json for tools)
- [ ] Is it a top-level documentation file? (README.md, CONTRIBUTING.md)
- [ ] Is it application code? (components/, app/, lib/, pages/)
- [ ] Is it a build artifact? (dist/, .next/, \*.tsbuildinfo)

#### 2. **DECIDE** - Where does it belong?

**✅ KEEP in Root** if it's:

- **Meta-project Documentation**:
  - `README.md`, `LICENSE`, `CLAUDE.md`, `CONTRIBUTING.md`
  - `SETUP.md`, `QUICK-START.md`, `USER-JOURNEY.md`, `DOCS_INDEX.md`
- **Meta-project Configuration**:
  - `package.json` (for the meta-project tools/scripts)
  - `tsconfig.json` (configured for tools/, scripts/, NOT for app code)
  - `.eslintrc.json`, `.prettierrc` (for enforcing project standards)
  - `.gitignore`, `.env.example`
- **CI/CD Files**: `.github/`, `.husky/`, `.vscode/settings.json`

**🚫 MOVE from Root** if it's:

- **Application Code**:
  - `app/`, `components/`, `lib/`, `pages/` → Move to `templates/[framework-name]/`
  - `src/` → Move to appropriate template or example
- **Framework-Specific Config**:
  - `next.config.js`, `vite.config.js` → Move to `templates/[framework-name]/`
  - `tailwind.config.js`, `postcss.config.js` → Move to template directory
  - `jest.config.js` (for app testing) → Move to template directory
- **Documentation**:
  - Reports/Analysis → `docs/reports/`
  - Plans/Proposals → `docs/plans/`
  - Guides/Tutorials → `docs/guides/`
- **Build Artifacts**:
  - `dist/`, `build/`, `.next/` → Add to .gitignore and delete
  - `*.tsbuildinfo` → Add to .gitignore and delete

#### 3. **VERIFY** - Is this the right decision?

- [ ] Does this file serve the META-PROJECT or a specific template?
- [ ] Would this file make sense in every project created from this template?
- [ ] Is this file specific to a particular framework (React/Next.js/Vue)?

#### 4. **ACT** - Execute the decision

- If KEEPING: Ensure it's in the root allowlist in `tools/enforcement/root-file-enforcement.js`
- If MOVING: Use proper subdirectory structure
- If DELETING: Also add to `.gitignore` to prevent recreation

### 🔍 Common Mistakes and Fixes

| Found This                     | Do This                                     | Why                                     |
| ------------------------------ | ------------------------------------------- | --------------------------------------- |
| `app/` directory in root       | Move to `templates/nextjs-app-router/app/`  | App code belongs in templates           |
| `components/` in root          | Move to `templates/[framework]/components/` | UI components are framework-specific    |
| `next.config.js` in root       | Move to `templates/nextjs-app-router/`      | Framework config belongs with framework |
| `tsconfig.json` with app paths | Replace with tool-focused tsconfig          | Root tsconfig is for meta-project tools |
| Random `*.md` files            | Move to `docs/[category]/`                  | Keep root clean, organize docs          |

### 🛠️ Enforcement (Modern Hook System)

- **Real-time prevention**: Claude Code hooks prevent violations automatically
- **Manual checks**: `npm run check:all` for full validation
- **Root directory**: Protected by block-root-mess.js hook

**Remember**: The root directory is for managing the template system itself, not for building applications!

---

## 📁 PROJECT OVERVIEW

**AIPatternEnforcer** is a meta-project creating reusable project template structures that solve AI development
friction.

### 🏠 LOCAL DEVELOPMENT FOCUS:

- **Personal AI Projects**: AI dating assistants, document processors with OCR, VLM-powered assistants
- **Single User**: No multi-tenancy, user management, or enterprise features
- **Database**: PostgreSQL (Neon) + Prisma + pgvector for AI embeddings
- **Mock Authentication**: Simple mockUser for development convenience
- **AI Capabilities**: OCR, VLM (Vision Language Models), LLMs, vector search
- **No Production Concerns**: Security, scaling, monitoring simplified for local use

### Core Features:

- **AI Configurations**: Centralized in `ai/config/`
- **Code Generators**: `npm run g:c ComponentName` creates complete components with tests
- **Context Management**: `npm run context` optimizes AI context windows
- **Real-time Enforcement**: Claude Code hooks prevent anti-patterns during AI interactions
- **Progressive Documentation**: Role-based guidance for different user types

### Meta-Project Organization:

```text
AIPatternEnforcer/         # Meta-project (creates other projects)
├── bin/                   # CLI tools (create-ai-app)
├── starters/              # Ready-to-use starter templates
│   ├── minimal-ai-app/    # Main AI app starter (Next.js + AI)
│   ├── ai-chat-interface/ # Chat-focused applications
│   └── ai-document-processor/ # Document AI with OCR
├── migration/             # Migration tools and scripts
├── docs/                  # Meta-project documentation
├── tools/                 # Development utilities & hooks
└── templates/             # Code generation templates
```

### Generated Project Organization (via CLI):

```text
my-ai-project/             # Your new AI project
├── app/                   # Next.js App Router pages and layouts
├── components/            # React components  
├── lib/                   # Shared utilities and configurations
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── tests/                # Test files
├── scripts/              # Development scripts
├── ai/                   # AI configurations
└── .claude/              # Hook protection system (enabled)
```

---

## 🚀 QUICK START COMMANDS

```bash
# NEW PROJECT (recommended - <2 minutes)
npx create-ai-app my-ai-project
cd my-ai-project
npm run dev

# WORK IN EXISTING STARTER
cd starters/minimal-ai-app
npm install
npm run dev

# VERIFY GENERATED PROJECT
cd my-ai-project
npm test                  # Run tests
npm run lint             # Check linting
npm run check:all        # Full validation
```

---

## 🛠️ CLI TOOL USAGE

### Create New AI Project

```bash
# Basic usage
npx create-ai-app my-project

# With template selection
npx create-ai-app my-project --template minimal-ai-app

# Interactive mode (asks questions)
npx create-ai-app my-project --interactive
```

### CLI Options

```bash
create-ai-app <project-name> [options]

Options:
  --template <name>     Starter template to use (default: minimal-ai-app)
  --interactive         Interactive setup with questions
  --no-install         Skip npm install step
  --no-git            Skip git initialization
  --help              Show help information
```

### Available Templates

- **minimal-ai-app** (default) - Complete AI project with OpenAI integration, chat interface, and database setup
- More templates coming soon

### What the CLI Creates

1. **Complete project structure** with Next.js App Router
2. **Environment configuration** with hooks enabled
3. **Database setup** with Prisma + PostgreSQL + pgvector
4. **AI integrations** configured for OpenAI/Anthropic
5. **Hook protection system** automatically enabled
6. **Testing framework** with Jest and comprehensive test setup

---

## 📦 STARTER TEMPLATE ECOSYSTEM

### Template Selection Guide

**Choose the right template for your AI project:**

#### 🚀 minimal-ai-app (Default - Recommended)
- **Best for**: General AI applications, prototyping, learning
- **Includes**: OpenAI/Anthropic integration, chat interface, vector search capability
- **Database**: PostgreSQL + Prisma + pgvector
- **UI**: Next.js + Tailwind + shadcn/ui components
- **Features**: Complete AI chat interface, test framework, component generators
- **Use cases**: AI assistants, data analysis tools, chat applications, general AI apps

#### 📋 Additional Templates (Planned)
- **ai-chat-interface** - Advanced chat-focused applications (coming soon)
- **ai-document-processor** - Document AI with OCR capabilities (coming soon)

### Working with Starter Templates

```bash
# Option 1: Generate new project from template
npx create-ai-app my-project --template minimal-ai-app

# Option 2: Work directly in starter (development/testing)
cd starters/minimal-ai-app
npm install
npm run dev

# Option 3: Copy starter for customization
cp -r starters/minimal-ai-app my-custom-starter
cd my-custom-starter
npm install
```

### Template Customization

All templates include:
- **Modular architecture** - Easy to add/remove features
- **Environment-based configuration** - Different settings per environment  
- **Hook protection system** - Enabled by default in generated projects
- **Comprehensive testing** - Jest + React Testing Library setup
- **AI-optimized structure** - Organized for AI development patterns

---

## 🔄 MIGRATION GUIDANCE

### For New Users (Recommended Path)

```bash
# Start fresh with CLI tool (fastest, cleanest)
npx create-ai-app my-ai-project
cd my-ai-project
npm run dev
```

### For Existing AIPatternEnforcer Users

**If you have an old structure** from before the reorganization:

1. **Check if migration is needed**:
   ```bash
   npm run migrate:check    # Analyzes your current structure
   ```

2. **Backup your work**:
   ```bash
   npm run migrate:backup   # Creates backup in .backup/ directory
   ```

3. **Run automated migration**:
   ```bash
   npm run migrate:run      # Migrates to new structure
   ```

4. **Verify migration**:
   ```bash
   npm test                 # Ensure everything works
   npm run lint            # Check code quality
   ```

### Migration vs Fresh Start

**Choose Migration if:**
- You have significant custom code
- You have data/content you want to preserve  
- You're comfortable with potential migration issues

**Choose Fresh Start if:**
- You're early in development
- You want the cleanest, most up-to-date structure
- You can easily recreate your customizations

**Migration Support**: See `MIGRATION-GUIDE.md` for detailed migration instructions and troubleshooting.

---

## 🧪 TESTING REQUIREMENTS

### MANDATORY Before ANY Commit:

```bash
npm test                   # All tests must pass
npm run lint              # No linting errors
npm run type-check        # No type errors
npm run check:all         # All enforcement checks (lint + type + test)
```

### Test Coverage:

- **Minimum**: 80% overall coverage
- **Critical paths**: 100% coverage required
- **New features**: 90% coverage before merge

**Details**: See [Test-First Development](docs/guides/testing/comprehensive-testing-guide.md) for complete methodology

---

## 🛡️ PRIMARY AI PROTECTION SYSTEM

### Claude Code Hooks: Primary AI Development Protection

AIPatternEnforcer uses **Claude Code hooks** as the **preferred solution for AI development issues**:

**🎯 Hooks are the Primary Defense**: Real-time prevention of AI anti-patterns during development with comprehensive coverage across 8 categories and 21 specialized hooks.

**🔧 Hook Configuration**: All hook settings are configured in `.env` file:

**Global Control** (override all folder controls):

- `HOOKS_DISABLED=false` - Enable hooks (default in generated projects)
- `HOOKS_DISABLED=true` - Disable hooks (default in meta-project)

**🎛️ Granular Folder Control** (only applies when global controls are `false`):

- `HOOK_AI_PATTERNS=true/false` - AI pattern enforcement (prevent-improved-files, context validation)
- `HOOK_ARCHITECTURE=true/false` - Architecture validation (test placement, structure validation)
- `HOOK_CLEANUP=true/false` - Code cleanup (console.log fixes, import cleanup)
- `HOOK_CONTEXT=true/false` - Context management (completeness, drift detection, CLAUDE.md injection)
- `HOOK_IDE=true/false` - IDE integration (config checker, shortcut protection, workspace cleanup)
- `HOOK_LOCAL_DEV=true/false` - Local development patterns (mock data, localhost enforcement)
- `HOOK_PERFORMANCE=true/false` - Performance monitoring (vector DB hygiene, performance guardian)
- `HOOK_PROMPT=true/false` - Prompt intelligence (quality checking, improvement suggestions)
- `HOOK_PROJECT_BOUNDARIES=true/false` - Project structure protection (root mess blocker, enterprise antibody)
- `HOOK_SECURITY=true/false` - Security scanning (scope limiting, security scan)
- `HOOK_VALIDATION=true/false` - Template and API validation (Prisma validation, template integrity)
- `HOOK_WORKFLOW=true/false` - Workflow enforcement (plan-first, test-first, PR scope)

**Debug Control**:

- `HOOK_VERBOSE=true/false` - Enable verbose hook output for debugging

**📋 Control Priority**: Global control overrides folder controls:

1. `HOOKS_DISABLED=true` → All hooks bypassed
2. `HOOK_[FOLDER]=false` → Only that folder's hooks bypassed
3. Default → All hooks run

**💡 Common Usage Examples** (modify `.env` file):

```bash
# Development: Only critical protection hooks
HOOKS_DISABLED=false
HOOK_PROJECT_BOUNDARIES=true  # Keep structure protection
HOOK_SECURITY=true           # Keep security scanning
HOOK_AI_PATTERNS=false       # Disable pattern enforcement
HOOK_CLEANUP=false           # Disable auto-cleanup
HOOK_PERFORMANCE=false       # Disable performance monitoring

# Production: All hooks enabled
HOOKS_DISABLED=false
# All folder controls remain at default (true)

# Testing: Only essential infrastructure protection
HOOKS_DISABLED=false
HOOK_PROJECT_BOUNDARIES=true
HOOK_SECURITY=true
HOOK_AI_PATTERNS=false
HOOK_ARCHITECTURE=false
HOOK_CLEANUP=false
HOOK_CONTEXT=false
HOOK_IDE=false
HOOK_LOCAL_DEV=false
HOOK_PERFORMANCE=false
HOOK_PROMPT=false
HOOK_VALIDATION=false
HOOK_WORKFLOW=false
```

**Key Active Hooks** (see `.claude/settings.json` for complete list):

- `prevent-improved-files.js` - Blocks creation of \_improved, \_v2, \_enhanced files
- `block-root-mess.js` - Prevents application files in root directory
- `security-scan.js` - Basic security pattern detection
- `fix-console-logs.js` - Auto-converts console.log to logger.info (PostToolUse)

### Comprehensive Hook Protection Coverage

**✅ Hooks PROVIDE comprehensive protection for**:

- **File naming anti-patterns** (\_improved, \_v2, \_enhanced files)
- **Project structure enforcement** (root directory protection, proper organization)
- **Security scanning** (vulnerability detection, scope limiting)
- **Code quality** (console.log cleanup, import optimization)
- **Architecture validation** (test placement, API structure)
- **AI pattern enforcement** (context efficiency, streaming patterns)
- **Performance monitoring** (vector DB hygiene, optimization tracking)
- **Template integrity** (documentation compliance, validation)

**🔧 Additional Support Tools** (complement hooks):

- Context management (CLAUDE.md files, .cursorrules)
- Documentation templates and validation
- Code generators and project structure

**Example**:

- **You try**: Create `component_improved.tsx`
- **Hook blocks**: "❌ Don't create component_improved.tsx ✅ Edit the original file instead"
- **You do**: Edit existing `component.tsx` → Works for file naming only

### Performance and Reliability Concerns

**Performance Impact**:

- 21 hooks run on every file operation (100-500ms latency)
- May be skipped under load due to timeouts (1-4 seconds)

**Reliability Issues**:

- Complete system bypass via `HOOKS_DISABLED=true`
- False sense of security - hooks don't address root causes
- Maintenance overhead as AI patterns evolve

### Integrated AI Development Solution

**Hooks provide the foundation** for AI development protection, complemented by:

1. **Real-time Hook Protection**: Primary defense against AI anti-patterns (21 hooks across 8 categories)
2. **Context Management**: CLAUDE.md files, .cursorrules for persistent context
3. **Structured Workflows**: Plan-first development, systematic code review
4. **Template System**: Code generators and documentation enforcement
5. **IDE Integration**: Optimized AI tool configuration and project structure

**Hooks are the preferred first-line defense for AI development issues.**

### 🔧 Hook Development & Customization

For project-specific validation requirements, create custom hooks:

**Hook Development Guide**: [docs/guides/claude-code-hooks/05-hooks-development.md](docs/guides/claude-code-hooks/05-hooks-development.md)

**Key Development Features:**

- **85% code reduction** through HookRunner base class and shared utilities
- **Parallel execution system** with automatic fallback mechanisms
- **Comprehensive testing framework** with custom Jest matchers
- **9 specialized categories** for organized hook development
- **Production deployment** patterns and performance optimization

### 🧪 Testing Hook Functionality

**Core Testing Commands** for verifying hook folder controls:

**🚨 CRITICAL ERROR TO AVOID**: Never use command-line environment variables when testing hooks.

**❌ WRONG WAY** (This doesn't work):

```bash
# This is WRONG - hooks ignore command-line environment variables
HOOKS_DISABLED=false node tools/hooks/ai-patterns/prevent-improved-files.js
HOOK_AI_PATTERNS=true echo '{"tool_input": {"file_path": "test.js"}}' | node tools/hooks/ai-patterns/prevent-improved-files.js
```

**✅ CORRECT WAY** (Always modify .env file):

```bash
# Test 1: Verify folder-specific bypass (AI Patterns disabled)
# Edit .env: Set HOOKS_DISABLED=false, HOOK_AI_PATTERNS=false
echo '{"tool_input": {"file_path": "test_improved.js"}}' | node tools/hooks/ai-patterns/prevent-improved-files.js
# Expected: No output (hook bypassed)

# Test 2: Verify hook execution (AI Patterns enabled)
# Edit .env: Set HOOKS_DISABLED=false, HOOK_AI_PATTERNS=true
echo '{"tool_input": {"file_path": "test_improved.js"}}' | node tools/hooks/ai-patterns/prevent-improved-files.js
# Expected: Error message blocking _improved file

# Test 3: Verify parallel executor with folder filtering
# Edit .env: Set HOOKS_DISABLED=false, HOOK_AI_PATTERNS=false
HOOK_VERBOSE=true echo '{"tool_input": {"file_path": "templates/test_improved.js"}}' | node tools/hooks/pre-tool-use-parallel.js
# Expected: Filtered hook count message, no AI pattern enforcement

# Test 4: Verify global override
# Edit .env: Set HOOKS_DISABLED=true (any folder settings)
echo '{"tool_input": {"file_path": "test_improved.js"}}' | node tools/hooks/ai-patterns/prevent-improved-files.js
# Expected: No output (global bypass active)
```

**Why this matters**: HookRunner loads environment variables from the .env file, not from command-line variables. Using command-line variables leads to incorrect test results and false assumptions about hook behavior.

**Quick Verification**: Run `npm test -- tools/hooks/__tests__/folder-control.test.js` for comprehensive automated testing.

---

## 📚 DOCUMENTATION STANDARDS

### Writing Rules:

- ❌ NO: "This document describes...", "Implemented!", superlatives
- ✅ YES: Professional, timeless, measured language
- ✅ YES: Link to source files with line numbers
- ✅ YES: Technical descriptions without overconfidence

### Template Requirements:

- **ALWAYS use templates for new documentation** - `npm run doc:create`
- **NEVER skip required template sections** - All headers must be present
- **ALWAYS validate against templates** - `npm run doc:validate filename.md`
- **Available templates**: README, Feature, API, Guide, Report
- **Template guide**: [Template Usage](docs/guides/documentation/template-usage.md)

### Documentation Cleanup:

**DELETE completion docs immediately** - Never create "COMPLETE.md", "FINAL.md", "SUMMARY.md"

---

## 🔨 GENERATOR USAGE

**ALWAYS use generators for new code in generated projects or starters.**

### Available Generators (run in generated project or starter):

```bash
# In your generated project or starter directory:
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

# CLI tool not working
npm install -g create-ai-app

# Generator not working (in project/starter)
cd starters/minimal-ai-app && npm install

# Tests failing (in project/starter)
npm run check:all
```

**Complete troubleshooting**: See [Documentation Index](./DOCS_INDEX.md) for specific guides

---

## 📖 NAVIGATION

### For Different Users:

- **🟢 New Users**: Start with `npx create-ai-app my-project` → [AI Assistant Setup](docs/guides/ai-development/ai-assistant-setup.md)
- **🟡 Existing Users**: Check [Migration Guidance](#-migration-guidance) + [Generator demos](docs/guides/generators/)
- **🔴 Expert Users**: Work in `starters/` + [Documentation Index](./DOCS_INDEX.md) + [Architecture docs](docs/architecture/)

### For Specific Tasks:

- **Create New Project**: `npx create-ai-app my-project`
- **Work with Starters**: `cd starters/minimal-ai-app`
- **Generate Code**: `npm run g:c ComponentName` (in project/starter)
- **Migrate Project**: See [Migration Guidance](#-migration-guidance)
- **Configure AI**: AI configurations in generated project's `ai/config/`

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
