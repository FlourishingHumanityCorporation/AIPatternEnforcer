# AIPatternEnforcer: Copy-Paste Template for Local AI Apps

**Build personal AI apps without enterprise complexity.**

A simple, copy-pastable template for local one-person AI projects. Built for super lazy developers who want AI tools (Cursor, Claude) to work perfectly without configuration.

```bash
# Copy template and start building immediately
git clone [this-repo] my-ai-app
npm run onboard              # 5-minute setup + validation
npm run g:c AIChat           # Generate AI components instantly

# Perfect for: AI dating assistants, document processors, personal VLM apps
```

> **⚡ Quick Start:** `npm run onboard` - Complete setup + first component in <5 minutes
> **📖 Experienced Developer?** [Quick Reference](docs/quick-reference.md) - Commands & troubleshooting |
> [CLAUDE.md](CLAUDE.md) - Implementation rules
> **🚀 New to AIPatternEnforcer?** [QUICK-START.md](QUICK-START.md) - Detailed orientation | **🎮 Try generators:** `npm
run demo:generators`

## Table of Contents

1. [⚡ 5-Minute Setup](#-5-minute-setup)
2. [🔧 Code Generators](#-code-generators)
3. [🎮 Component Generation Demo](#-component-generation-demo)
4. [📦 What's Included](#-whats-included)
5. [🚀 Advanced Setup](#-advanced-setup)
6. [🤖 AI Tool Integration](#-ai-tool-integration)
7. [📚 Full Documentation](#-full-documentation)

## ⚡ 5-Minute Setup

```bash
# 1. Clone and install
git clone [this-repo] my-project
cd my-project
npm install

# 2. Run unified onboarding (recommended)
npm run onboard
# - Installs dependencies
# - Sets up git hooks
# - Generates your first component
# - Validates everything works

# Alternative: Manual setup
npm run setup:guided  # Interactive setup wizard
npm run g:c MyButton  # Generate first component
```

**Generate production-ready code in seconds. Each generator creates comprehensive files with tests, documentation, and
optimal practices built-in.**

### 🎨 Component Generator

```bash
npm run g:c UserProfile
```

**Creates in 30 seconds what takes 15-20 minutes manually:**

- ✅ TypeScript React component with props interface
- ✅ Comprehensive Jest + Testing Library tests
- ✅ Storybook stories with interactive controls
- ✅ CSS modules with responsive design
- ✅ Accessibility attributes and ARIA labels
- ✅ JSDoc documentation

### 🔧 Additional Generators

```bash
npm run g:api users        # API generator (in development)
npm run g:feature Dashboard # Feature generator (in development)
```

**Component generator is production-ready. Additional generators are being refined.**

Current focus: Perfect component generation with full TypeScript, testing, and accessibility support.

### 🪝 Hook Generator

```bash
npm run g:hook useUserData  # (in development)
```

**Custom React hooks with patterns (coming soon):**

- 🔄 TypeScript hook with proper typing
- 🔄 React Testing Library hook tests
- 🔄 Error handling and loading states
- 🔄 Memoization and performance optimization
- 🔄 JSDoc with usage examples

## 🎮 Component Generation Demo

**Working generator demonstration:**

```bash
npm run g:c TestComponent  # Creates complete component with tests
```

**What gets created:**

- TypeScript React component with props interface
- Comprehensive Jest + Testing Library tests
- CSS modules with responsive design
- Accessibility attributes and ARIA labels
- Index file for clean exports

**Demo mode coming soon** - Interactive showcase of all generators once development is complete.

## 📦 What's Included

### 🧠 AI Development Methodology

- **CLAUDE.md** - 1,287 lines of battle-tested AI development rules
- **FRICTION-MAPPING.md** - Maps 40+ common AI dev problems to solutions
- **Arrow-Chain RCA** - Systematic debugging methodology
- **Test-First Workflow** - Ensure AI-generated code quality

### 🔧 Code Generation Tools

```bash
npm run g:c Button           # Generate component with tests (✅ working)
npm run g:api users          # Generate REST API (🔄 in development)
npm run g:feature auth       # Generate feature module (🔄 in development)
npm run g:hook useUser       # Generate custom hook (🔄 in development)
```

### 🤖 AI Tool Configurations

- **`.cursorrules`** - Comprehensive Cursor IDE configuration
- **`.aiignore`** - Optimize AI context windows
- **AI Config Files** - Claude, Copilot, and local model setups
- **Prompt Library** - 9 tested prompt templates for common tasks

### 📚 Decision Frameworks

- Backend runtime selection (Node.js vs Python vs Go vs Rust)
- API architecture patterns (REST vs GraphQL vs gRPC)
- Database selection matrix (PostgreSQL vs SQLite vs MongoDB)
- Frontend framework comparison (React vs Vue vs Svelte)

### 🛠️ Development Scripts

- **Debug Snapshot** - Capture comprehensive debugging context
- **Context Optimizer** - Manage AI context windows effectively
- **Stack Wizard** - Interactive technology selection
- **Testing Suite** - Automated quality checks

### 🚨 Limited AI Pattern Prevention (Zero Config)

- **File Pattern Hooks** - Blocks AI from creating `_improved`, `_v2`, `_final` files automatically
- **Basic Static Prevention** - Simple hooks that catch common file organization mistakes:
  - `prevent-improved-files.js` - Blocks \_improved, \_v2, \_enhanced files
  - `block-root-mess.js` - Prevents app files in root directory
  - Removed: prevent-dev-artifacts.js - Based on contaminated test data
  - Removed: prevent-component-naming-mistakes.js - Based on contaminated test data
- **Limited Scope** - Only addresses file patterns (~31% of AI development friction)
- **Still Need**: Context management, manual code review, prompt engineering skills

### 📖 Documentation Templates

- Architecture Decision Records (ADRs)
- API documentation standards
- Security optimal practices
- Performance optimization guides

## 🏠 TARGET: Local Personal AI Apps Only

**Perfect for building:**

- 🤖 AI dating assistants (writing messages, understanding user background)
- 📄 AI document processors with OCR and VLM capabilities
- 🎯 Personal AI assistants with vision and language models
- 🔍 AI-powered search and analysis tools for personal use

**NOT for:**

- ❌ Enterprise apps, multi-user systems, authentication
- ❌ Production deployment, scaling, monitoring
- ❌ Team collaboration, complex CI/CD pipelines
- ❌ Anything beyond local one-person development

## 🎯 Core Value: Zero-Config AI Development

This template solves friction for super lazy developers:

1. **AI Tool Mistakes** → Static prevention hooks block bad patterns automatically
2. **Copy-Paste Complexity** → Template works in 5 minutes, no configuration needed
3. **Context Loss** → Built-in context management and rule persistence
4. **Mock Data Hassle** → Simple mockUser auth, no real authentication needed
5. **Local Development** → PostgreSQL + Prisma + Next.js, optimized for AI integration

## 🚀 How to Use This Kit

### 1. Set Up Your Project for AI Success

```bash
# Copy essential AI configurations
cp ai/config/.cursorrules your-project/
cp .aiignore your-project/
cp CLAUDE.md your-project/  # Customize for your project

# Install generators globally
npm install -g ai-dev-methodology
```

### 2. Use the Generators

```bash
# Generate consistent, tested code
ai-gen component UserProfile
ai-gen api /api/users
ai-gen feature authentication
```

### 3. Apply the Methodologies

- **Planning**: Use `ai/prompts/feature/planning.md` before coding
- **Debugging**: Follow Arrow-Chain RCA in `CLAUDE.md`
- **Testing**: Apply test-first patterns from examples
- **Context**: Run `npm run debug:snapshot` when stuck

### 4. Make Decisions with Confidence

- Check `docs/newproject_decisions/` for stack selection
- Use decision matrices for technical choices
- Apply security patterns from `ai/examples/good-patterns/`

## 🚨 Automated Enforcement Setup

The template includes powerful enforcement tools that prevent common AI development anti-patterns automatically.

### One-Command Setup

```bash
npm run setup:hooks
```

This command:

- ✅ Installs git hooks via Husky
- ✅ Configures pre-commit enforcement
- ✅ Sets up lint-staged for targeted checks
- ✅ Validates your environment

### What Gets Enforced

#### 1. File Naming Rules

```bash
# These will be blocked automatically:
❌ component_improved.js
❌ utils_v2.ts
❌ service_final_FIXED.js

# Run manual check:
npm run check:no-improved-files
```

#### 2. Import Standards

```bash
# Detects and reports:
❌ import _ from 'lodash'  # Use specific imports
❌ console.log()  # Use proper logging
❌ require() in ES6  # Use imports

# Run manual check:
npm run check:imports
```

#### 3. Documentation Quality

```bash
# Blocks these patterns:
❌ "This document describes..."
❌ "Implemented!"
❌ "As of December 2024..."

# Run manual check:
npm run check:documentation-style
```

### VS Code Extension

Install the AIPatternEnforcer Assistant extension for real-time enforcement:

```bash
# Install from the extensions directory
cd extensions/projecttemplate-assistant
npm install
npm run compile
# Then install in VS Code via "Install from VSIX"
```

Features:

- 🔴 Real-time file naming validation
- 📋 Smart context loading for AI tools
- 📊 Project health dashboard
- ⚡ One-click fixes for violations

### Context Loading for AI

Load optimized context for Claude/Cursor:

```bash
# Load general project context
npm run context

# Load context for specific file
npm run context -- src/index.js

# Save context to file
npm run context -- -o context.md
```

The context loader intelligently combines:

- Project rules from CLAUDE.md
- Recent file changes
- Git status and history
- Architecture documentation
- Current file analysis

## Customization

### For Your Stack

1. Update `config/` files with your standards
2. Modify `.cursorrules` for your conventions
3. Add stack-specific templates
4. Update example projects

### For Your Team

1. Fork this repository
2. Customize for team standards
3. Add team-specific documentation
4. Share improved patterns back

## Project Structure

```text
.
├── .github/          # GitHub configurations
├── ai/               # AI tool configs
├── config/           # Reusable configs
├── docs/             # Documentation
├── examples/         # Example projects
├── scripts/          # Automation
├── templates/        # Code templates
└── tools/            # Dev utilities
```

## Contributing

1. Identify repeated pain points
2. Design reusable solutions
3. Test in real projects
4. Submit PR with documentation

**Note**: All contributions are automatically checked by our enforcement system. Make sure to:

- Run `npm run check:all` before committing
- Follow file naming conventions (no `_improved`, `_v2` files)
- Use proper import patterns
- Maintain documentation quality standards

## 📚 Essential Reading

### Understanding the Methodology

- **[CLAUDE.md](CLAUDE.md)** - The complete AI development playbook (1,287 lines of wisdom)
- **[FRICTION-MAPPING.md](FRICTION-MAPPING.md)** - Real problems → Practical solutions
- **[Arrow-Chain RCA](CLAUDE.md#arrow-chain-root-cause-analysis)** - Systematic debugging that works

### Navigating Documentation

- **[Documentation Hub](docs/README.md)** - Central navigation for all documentation
- **[By Role](docs/README.md#documentation-by-role)** - Find docs for your specific needs
- **[Quick Navigation](docs/README.md#common-tasks)** - Jump to common tasks

### Making Technical Decisions

- **[Stack Selection Guide](docs/newproject_decisions/)** - Choose with confidence
- **[API Design Standards](docs/architecture/patterns/api-design-standards.md)** - Build better APIs
- **[Security Optimal Practices](docs/guides/security/security-optimal-practices.md)** - Secure by default

### Using the Tools

- **[Code Generators](tools/generators/)** - Create consistent code
- **[AI Prompt Library](ai/prompts/)** - Tested prompts that work
- **[Debug Tools](scripts/dev/)** - Capture context effectively
- **[Enforcement System](tests/enforcement-examples/examples.md)** - Automated quality checks
- **[VS Code Extension](extensions/projecttemplate-assistant/README.md)** - Real-time validation

## 🎓 Who This Is For

- **Developers using AI tools** - Make Cursor, Claude, and Copilot actually helpful
- **Team leads** - Standardize AI-assisted development practices
- **Solo developers** - Level up your AI development workflow
- **Anyone frustrated** - With inconsistent AI suggestions and context loss

## License

MIT - Use freely in your projects
