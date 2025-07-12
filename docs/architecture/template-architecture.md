project-template/
├── .github/ # GitHub-specific configs
│ ├── ISSUE_TEMPLATE/
│ ├── PULL_REQUEST_TEMPLATE.md
│ └── workflows/
│
├── docs/ # ALL documentation
│ ├── architecture/
│ │ ├── decisions/ # ADRs
│ │ │ ├── template-adr.md
│ │ │ └── 000-core-principles.md
│ │ ├── patterns/ # Reusable patterns
│ │ │ ├── error-handling.md
│ │ │ ├── state-management.md
│ │ │ └── data-fetching.md
│ │ └── diagrams/ # Architecture diagrams
│ │
│ ├── guides/ # How-to documentation
│ │ ├── ai-development/
│ │ │ ├── working-with-cursor.md
│ │ │ ├── prompt-engineering.md
│ │ │ └── ai-debugging.md
│ │ ├── workflows/
│ │ │ ├── daily-development.md
│ │ │ ├── feature-lifecycle.md
│ │ │ └── deployment-process.md
│ │ └── onboarding/
│ │ ├── new-developer.md
│ │ └── project-setup.md
│ │
│ ├── references/ # Reference documentation
│ │ ├── api/
│ │ ├── database-schema/
│ │ └── dependencies/
│ │
│ ├── runbooks/ # Operational procedures
│ │ ├── deployment.md
│ │ ├── rollback.md
│ │ ├── incident-response.md
│ │ └── debugging-production.md
│ │
│ ├── decisions/ # Project decisions
│ │ ├── framework-selection.md
│ │ ├── tool-evaluation.md
│ │ └── decision-log.md
│ │
│ └── templates/ # Documentation templates
│ ├── README.template.md
│ ├── API.template.md
│ └── CONTRIBUTING.template.md
│
├── ai/ # AI-specific files (NOT docs)
│ ├── .cursorrules # Cursor config
│ ├── .copilot-instructions # Copilot config
│ ├── prompts/ # Reusable prompts
│ │ ├── feature/
│ │ ├── debugging/
│ │ ├── refactoring/
│ │ └── testing/
│ └── examples/ # Good/bad code examples
│ ├── good-patterns/
│ └── anti-patterns/
│
├── config/ # Configuration files
│ ├── eslint/
│ │ └── .eslintrc.base.js
│ ├── prettier/
│ │ └── .prettierrc.base
│ ├── typescript/
│ │ └── tsconfig.base.json
│ ├── husky/
│ │ └── pre-commit
│ └── security/
│ ├── headers.json
│ └── csp-policy.json
│
├── scripts/ # Executable scripts
│ ├── init/
│ │ └── create-project.sh
│ ├── dev/
│ │ ├── ai-context-dump.sh
│ │ └── check-security.sh
│ └── utils/
│ └── save-ai-conversation.sh
│
├── templates/ # Code generation templates
│ ├── component/
│ ├── feature/
│ ├── api/
│ └── hooks/
│
├── tools/ # Development tools
│ ├── generators/
│ │ └── project-init/
│ └── analyzers/
│ └── complexity-check/
│
├── examples/ # Full example projects
│ ├── nextjs-postgres/
│ ├── vite-fastify/
│ └── README.md
│
├── .aiignore.template
├── .gitignore
├── LICENSE
├── package.json # Meta-template package
├── README.md # Overview and quick start
├── FRICTION-MAPPING.md # This document
├── TEMPLATE-GUIDE.md # The detailed template guide
├── SETUP.md # First-time installation guide
├── CONTRIBUTING.md # How to improve the template
├── CHANGELOG.md # Template version history

# Meta Project Template Structure

## Table of Contents

1. [Overview](#overview)
  2. [Core Philosophy](#core-philosophy)
  3. [Problems This Solves](#problems-this-solves)
4. [Directory Structure](#directory-structure)
5. [Detailed Structure Breakdown](#detailed-structure-breakdown)
  6. [📁 `.github/`](#-github)
  7. [📁 `docs/`](#-docs)
  8. [📁 `ai/`](#-ai)
9. [You MUST follow these rules:](#you-must-follow-these-rules)
10. [You must NEVER:](#you-must-never)
11. [When in doubt:](#when-in-doubt)
  12. [📁 `config/`](#-config)
  13. [📁 `scripts/`](#-scripts)
  14. [📁 `templates/`](#-templates)
  15. [📁 `tools/`](#-tools)
  16. [📁 `examples/`](#-examples)
17. [Usage Guide](#usage-guide)
  18. [Initial Setup](#initial-setup)
  19. [Daily Development Workflow](#daily-development-workflow)
    20. [Starting a New Feature](#starting-a-new-feature)
    21. [Debugging with AI](#debugging-with-ai)
    22. [Code Review Process](#code-review-process)
  23. [Customization Guide](#customization-guide)
    24. [Adding New Patterns](#adding-new-patterns)
    25. [Extending for Your Stack](#extending-for-your-stack)
    26. [Creating Team Standards](#creating-team-standards)
  27. [Optimal Practices](#optimal-practices)
    28. [For Maximum AI Effectiveness](#for-maximum-ai-effectiveness)
    29. [For Team Collaboration](#for-team-collaboration)
30. [Advanced Features](#advanced-features)
  31. [Multi-Project Synchronization](#multi-project-synchronization)
  32. [Metrics and Analysis](#metrics-and-analysis)
  33. [Custom Generators](#custom-generators)
34. [Measuring Success](#measuring-success)
  35. [Quantitative Metrics](#quantitative-metrics)
  36. [Qualitative Indicators](#qualitative-indicators)
37. [Contributing to the Template](#contributing-to-the-template)
  38. [Improvement Process](#improvement-process)
  39. [Quality Criteria](#quality-criteria)
40. [Troubleshooting](#troubleshooting)
  41. [Common Issues](#common-issues)
    42. ["AI ignores my patterns"](#ai-ignores-my-patterns)
    43. ["Too much boilerplate"](#too-much-boilerplate)
    44. ["Team resistance"](#team-resistance)
45. [Future Roadmap](#future-roadmap)
46. [License](#license)

## Overview

This meta project template is a battle-tested structure designed to solve the fundamental challenges of AI-assisted
software development. It's not just a boilerplate—it's a learning system that gets better with each project you build.

### Core Philosophy

1. **Documentation as Infrastructure** - Docs aren't an afterthought; they're the foundation
2. **AI as a Team Member** - Structure everything so AI tools can be maximally effective
3. **Decisions are Assets** - Every choice you make is documented and reusable
4. **Security by Default** - Security isn't added later; it's built-in from the start
5. **Learning System** - Each project contributes improvements back to the template

### Problems This Solves

- **AI Context Decay** - AI forgets your project conventions after a few messages
- **Architectural Drift** - AI generates inconsistent patterns without guidance
- **Security Vulnerabilities** - AI often generates insecure code by default
- **Debugging Blindness** - AI can't see runtime state or understand system-level issues
- **Decision Fatigue** - Recreating the same decisions for every new project
- **Knowledge Silos** - Important decisions trapped in one developer's head

## Directory Structure

```text
project-template/
├── .github/                 # GitHub-specific configurations
├── docs/                    # All human-readable documentation
├── ai/                      # AI tool configurations and prompts
├── config/                  # Reusable configuration files
├── scripts/                 # Executable automation scripts
├── templates/               # Code generation templates
├── tools/                   # Development utilities
├── examples/                # Reference implementations
├── .aiignore.template       # AI indexing exclusions
├── .gitignore              # Git exclusions
├── LICENSE                 # Template license
├── package.json            # Meta-template dependencies
└── README.md               # This file
```

## Detailed Structure Breakdown

### 📁 `.github/`

**Purpose**: GitHub-specific configurations that enhance collaboration and maintain quality

```text
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.md           # Structured bug reporting
│   ├── feature_request.md      # Feature proposal template
│   └── ai_generation_issue.md  # AI-specific problems
├── PULL_REQUEST_TEMPLATE.md    # PR checklist including AI usage
└── workflows/
    ├── security-audit.yml      # Automated security scanning
    ├── type-check.yml          # TypeScript validation
    └── ai-code-review.yml      # AI-generated code validation
```

**Key Features**:

- `ai_generation_issue.md` includes fields for prompt used, AI tool version, and unexpected output
- PR template requires declaration of AI usage
- Automated workflows catch common AI-generated code issues

### 📁 `docs/`

**Purpose**: Centralized, organized documentation that both humans and AI can reference

```text
docs/
├── architecture/
│   ├── decisions/              # Architecture Decision Records (ADRs)
│   │   ├── template-adr.md     # Standard ADR format
│   │   └── 000-core-principles.md
│   ├── patterns/               # Proven architectural patterns
│   │   ├── error-handling.md   # Standardized error approach
│   │   ├── state-management.md # State management patterns
│   │   └── data-fetching.md    # Data fetching strategies
│   └── diagrams/               # Visual architecture docs
│
├── guides/                     # Step-by-step instructions
│   ├── ai-development/         # AI-specific workflows
│   │   ├── working-with-cursor.md
│   │   ├── prompt-engineering.md
│   │   └── ai-debugging.md
│   ├── workflows/              # Development processes
│   │   ├── daily-development.md
│   │   ├── feature-lifecycle.md
│   │   └── deployment-process.md
│   └── onboarding/             # Getting started guides
│       ├── new-developer.md
│       └── project-setup.md
│
├── references/                 # Technical references
│   ├── api/                    # API documentation
│   ├── database-schema/        # Database structure
│   └── dependencies/           # Dependency decisions
│
├── runbooks/                   # Operational procedures
│   ├── deployment.md           # How to deploy
│   ├── rollback.md            # How to rollback
│   ├── incident-response.md    # When things go wrong
│   └── debugging-production.md # Production debugging
│
├── decisions/                  # Project-level decisions
│   ├── framework-selection.md  # Why we chose X
│   ├── tool-evaluation.md      # Tool comparison matrix
│   └── decision-log.md         # Chronological decisions
│
└── templates/                  # Documentation templates
    ├── README.template.md      # Project README starter
    ├── API.template.md         # API doc template
    └── CONTRIBUTING.template.md # Contribution guidelines
```

**Why This Organization Works**:

- Clear hierarchy: architecture → guides → references → runbooks
- Each document has one clear purpose
- AI can be directed to specific docs: "Follow patterns in @docs/architecture/patterns/error-handling.md"

### 📁 `ai/`

**Purpose**: Everything needed to make AI tools effective team members

```text
ai/
├── .cursorrules                # Cursor IDE persistent rules
├── .copilot-instructions       # GitHub Copilot configuration
├── prompts/                    # Battle-tested prompt templates
│   ├── feature/
│   │   ├── planning.md         # Feature planning prompt
│   │   ├── implementation.md   # Implementation prompt
│   │   └── review.md           # Self-review prompt
│   ├── debugging/
│   │   ├── error-analysis.md   # Systematic debugging
│   │   ├── performance.md      # Performance investigation
│   │   └── security-review.md  # Security audit prompt
│   ├── refactoring/
│   │   ├── code-cleanup.md     # Safe refactoring
│   │   ├── pattern-migration.md # Pattern updates
│   │   └── debt-reduction.md   # Tech debt removal
│   └── testing/
│       ├── unit-tests.md       # Unit test generation
│       ├── integration.md      # Integration test design
│       └── edge-cases.md       # Edge case identification
│
└── examples/                   # Concrete examples for AI
    ├── good-patterns/          # "Do this" examples
    │   ├── error-handling/
    │   ├── api-design/
    │   └── component-structure/
    └── anti-patterns/          # "Don't do this" examples
        ├── security-violations/
        ├── performance-issues/
        └── maintenance-problems/
```

**`.cursorrules` Example**:

```markdown
# Project Rules for AI Assistant

## You MUST follow these rules:

1. Always use TypeScript with strict mode
2. Use projectLogger instead of console.log
3. Include error handling in every async function
4. Follow patterns in @docs/architecture/patterns/

## You must NEVER:

1. Use var keyword
2. Generate code without tests
3. Use any deprecated APIs
4. Ignore null/undefined checks

## When in doubt:

Check @ai/examples/good-patterns/ for correct implementation
```

### 📁 `config/`

**Purpose**: Reusable, tested configuration files that enforce standards

```text
config/
├── eslint/
│   ├── .eslintrc.base.js       # Base ESLint rules
│   ├── .eslintrc.strict.js     # Stricter variant
│   └── plugins.md              # Why each plugin
├── prettier/
│   ├── .prettierrc.base        # Code formatting
│   └── .prettierignore         # Formatting exclusions
├── typescript/
│   ├── tsconfig.base.json      # Base TS config
│   ├── tsconfig.strict.json    # Strict config
│   └── path-aliases.json       # Import aliases
├── husky/
│   ├── pre-commit              # Pre-commit checks
│   ├── commit-msg              # Commit message format
│   └── pre-push                # Pre-push validation
└── security/
    ├── headers.json            # Security headers
    ├── csp-policy.json         # Content Security Policy
    └── api-rate-limits.json    # Rate limiting rules
```

**Why Separate Configs**:

- Easy to copy exactly what you need
- Version control friendly
- Can be validated independently
- AI can reference specific configs

### 📁 `scripts/`

**Purpose**: Automation that enforces good practices and saves time

```text
scripts/
├── init/
│   ├── create-project.sh       # Initialize new project
│   ├── setup-environment.sh    # Dev environment setup
│   └── first-time-setup.sh     # One-time configuration
├── dev/
│   ├── ai-context-dump.sh      # Gather context for AI
│   ├── check-security.sh       # Security validation
│   ├── analyze-bundle.sh       # Bundle size check
│   └── clean-branches.sh       # Git maintenance
├── quality/
│   ├── validate-deps.sh        # Dependency audit
│   ├── check-types.sh          # TypeScript check
│   └── test-coverage.sh        # Coverage report
└── utils/
    ├── save-ai-conversation.sh # Archive AI chats
    ├── update-dependencies.sh  # Safe dep updates
    └── generate-component.sh   # Component scaffolding
```

**`ai-context-dump.sh` Example**:

```bash
#!/bin/bash
# Gathers comprehensive context for AI debugging

echo "=== Environment Context ==="
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Current branch: $(git branch --show-current)"

echo -e "\n=== Recent Changes ==="
git log --oneline -10

echo -e "\n=== Modified Files ==="
git status --short

echo -e "\n=== Dependency Versions ==="
npm list --depth=0

echo -e "\n=== Recent Errors ==="
[ -f error.log ] && tail -50 error.log || echo "No error log found"

echo -e "\n=== Running Processes ==="
lsof -i :3000 2>/dev/null || echo "No process on port 3000"

echo -e "\n=== Environment Variables ==="
env | grep -E '^(NODE_|REACT_|NEXT_|API_)' | cut -d= -f1
```

### 📁 `templates/`

**Purpose**: Code generation templates that enforce consistent patterns

```text
templates/
├── component/
│   ├── index.ts.hbs            # Component barrel export
│   ├── {{name}}.tsx.hbs        # Component implementation
│   ├── {{name}}.test.tsx.hbs   # Component tests
│   ├── {{name}}.stories.tsx.hbs # Storybook stories
│   └── {{name}}.module.css.hbs # Component styles
├── feature/
│   ├── structure.json          # Feature file structure
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── types/
├── api/
│   ├── {{endpoint}}.ts.hbs     # API endpoint
│   ├── {{endpoint}}.test.ts.hbs # API tests
│   └── {{endpoint}}.schema.ts.hbs # Validation schema
└── hooks/
    ├── use{{Name}}.ts.hbs      # Custom hook
    └── use{{Name}}.test.ts.hbs # Hook tests
```

**Template Example** (`component/{{name}}.tsx.hbs`):

```typescript
import { FC } from 'react';
import { projectLogger } from '@/lib/logger';
import styles from './{{name}}.module.css';

export interface {{pascalCase name}}Props {
  // TODO: Define props
}

export const {{pascalCase name}}: FC<{{pascalCase name}}Props> = (props) => {
  projectLogger.debug('{{pascalCase name}} rendered', { props });

  return (
    <div className={styles.container}>
      {/* TODO: Implement component */}
    </div>
  );
};

{{pascalCase name}}.displayName = '{{pascalCase name}}';
```

### 📁 `tools/`

**Purpose**: Custom development tools that enhance productivity

```text
tools/
├── generators/
│   ├── project-init/           # New project wizard
│   │   ├── index.js            # Main generator
│   │   ├── questions.js        # Interactive prompts
│   │   └── templates.js        # Template selection
│   └── component/              # Component generator
│       ├── index.js
│       └── prompts.js
└── analyzers/
    ├── complexity/             # Code complexity analysis
    │   ├── index.js
    │   └── reporters/
    ├── ai-usage/               # AI usage tracking
    │   ├── index.js
    │   └── report-template.md
    └── security/               # Security scanning
        ├── index.js
        └── rules.json
```

### 📁 `examples/`

**Purpose**: Complete, working reference implementations

```text
examples/
├── nextjs-postgres/            # Next.js + PostgreSQL
│   ├── README.md               # Setup instructions
│   ├── docker-compose.yml      # Local dev setup
│   └── src/                    # Full implementation
├── vite-fastify/               # Vite + Fastify API
│   ├── README.md
│   └── src/
├── sveltekit-supabase/         # SvelteKit + Supabase
│   ├── README.md
│   └── src/
└── README.md                   # Example overview
```

## Usage Guide

### Initial Setup

1. **Clone the Template**

   ```bash
   git clone https://github.com/you/project-template.git meta-template
   cd meta-template
   npm install
   npm link  # Makes 'create-project' command available globally
   ```

2. **Create a New Project**

   ```bash
   create-project my-new-app

   # Interactive prompts:
   # ? Project type? (web-app, api, cli)
   # ? Primary language? (typescript, javascript)
   # ? AI usage level? (heavy, balanced, light)
   # ? Target deployment? (vercel, aws, self-hosted)
   ```

3. **Initial Configuration**

   ```bash
   cd my-new-app

   # Fill out project requirements
   code docs/decisions/001-requirements.md

   # Generate architecture with AI
   npm run ai:architecture

   # Review and commit
   git add .
   git commit -m "Initial architecture decisions"
   ```

### Daily Development Workflow

#### Starting a New Feature

```bash
# 1. Generate feature structure
npm run generate:feature user-authentication

# 2. Get AI context
npm run ai:context > context.md

# 3. Use feature planning prompt
code ai/prompts/feature/planning.md
# Copy prompt, fill in specifics, paste to AI

# 4. Implement with AI assistance
# AI knows your patterns from ai/.cursorrules
```

#### Debugging with AI

```bash
# 1. Capture full context
npm run ai:debug-context

# 2. Use debugging prompt template
code ai/prompts/debugging/error-analysis.md

# 3. Save useful solutions
npm run ai:save-conversation "Fixed null pointer in auth flow"
```

#### Code Review Process

```bash
# 1. Run automated checks
npm run quality:all

# 2. Generate AI review
npm run ai:review src/features/new-feature

# 3. Check against patterns
npm run check:patterns src/features/new-feature
```

### Customization Guide

#### Adding New Patterns

1. Document the pattern in `docs/architecture/patterns/new-pattern.md`
2. Add good example to `ai/examples/good-patterns/`
3. Add anti-pattern to `ai/examples/anti-patterns/`
4. Update `.cursorrules` to reference the new pattern

#### Extending for Your Stack

```bash
# Example: Adding GraphQL support
mkdir -p templates/graphql
mkdir -p docs/architecture/patterns/graphql
mkdir -p ai/prompts/graphql

# Add GraphQL-specific configurations
echo "GraphQL patterns" > docs/architecture/patterns/graphql/schema-design.md
```

#### Creating Team Standards

1. Fork the template repository
2. Modify `config/` files to match team standards
3. Update `ai/.cursorrules` with team conventions
4. Add team-specific guides to `docs/guides/team/`

### Optimal Practices

#### For Maximum AI Effectiveness

1. **Keep `.cursorrules` Updated**
   - Add new patterns as you discover them
   - Remove outdated rules
   - Be specific about what AI should never do

2. **Use Specific File References**

   ```
   # Good
   "Follow the error handling pattern in @docs/architecture/patterns/error-handling.md"

   # Bad
   "Handle errors properly"
   ```

3. **Document Decisions Immediately**
   - When you choose a library, document why
   - When you establish a pattern, add it to patterns/
   - When you find an anti-pattern, add it to examples/

#### For Team Collaboration

1. **Regular Template Reviews**
   - Monthly review of what's working/not working
   - Update templates based on team feedback
   - Share successful prompts

2. **Contribution Process**

   ```bash
   # Create branch for template improvement
   git checkout -b template/add-redis-pattern

   # Make changes
   # Update docs/
   # Add examples/

   # Submit PR with explanation
   ```

3. **Knowledge Sharing**
   - Save exceptional AI conversations
   - Document clever solutions
   - Share debugging victories

## Advanced Features

### Multi-Project Synchronization

```bash
# Update all projects using this template
./tools/sync/update-all-projects.sh

# Cherry-pick specific improvements
./tools/sync/copy-pattern.sh error-handling ~/projects/app1
```

### Metrics and Analysis

```bash
# Analyze AI usage across projects
npm run analyze:ai-usage

# Generate complexity report
npm run analyze:complexity

# Security audit all projects
npm run security:audit-all
```

### Custom Generators

```javascript
// tools/generators/custom/index.js
module.exports = {
  name: "custom-feature",
  prompts: [
    {
      type: "input",
      name: "name",
      message: "Feature name?",
    },
  ],
  actions: [
    {
      type: "addMany",
      destination: "src/features/{{name}}",
      templateFiles: "templates/feature/**/*",
    },
  ],
};
```

## Measuring Success

### Quantitative Metrics

- **Setup Time**: New project ready in < 30 minutes
- **Decision Time**: Architecture decisions in < 2 hours
- **Onboarding Time**: New developer productive in < 1 day
- **AI Accuracy**: 80%+ of AI suggestions follow patterns
- **Security Issues**: 0 vulnerabilities in committed code

### Qualitative Indicators

- Developers feel confident starting new features
- AI suggestions require minimal correction
- Code reviews focus on logic, not style
- Debugging is systematic, not chaotic
- Knowledge is preserved across projects

## Contributing to the Template

### Improvement Process

1. Identify repeated pain point across projects
2. Design solution that prevents the issue
3. Test solution in real project
4. Document solution with examples
5. Submit PR with:
   - Problem description
   - Solution explanation
   - Usage example
   - Update locations

### Quality Criteria

- **Universal**: Applies to most projects
- **Non-Invasive**: Easy to ignore if not needed
- **Well-Documented**: Clear when and why to use
- **AI-Friendly**: AI can understand and apply
- **Battle-Tested**: Used successfully in real project

## Troubleshooting

### Common Issues

#### "AI ignores my patterns"

- Check `.cursorrules` is in project root
- Verify file is referenced with @ symbol
- Ensure examples are clear and specific

#### "Too much boilerplate"

- Use `scripts/init/minimal-setup.sh` for lighter start
- Delete unused sections after initialization
- Customize generators for your needs

#### "Team resistance"

- Start with opt-in adoption
- Show metrics from successful projects
- Let early adopters evangelize

## Future Roadmap

- [ ] AI model-specific optimizations
- [ ] Cloud IDE integration (GitHub Codespaces)
- [ ] Multi-language support templates
- [ ] Automated pattern detection from codebases
- [ ] Integration with enterprise tools
- [ ] AI prompt marketplace

## License

This template is MIT licensed. Use it, modify it, share it. If you build something cool, let us know!

---

_Remember: This template is a living system. It gets better every time you use it. Treat it as a team member that's
constantly learning and improving._
