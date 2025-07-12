# Friction Point to Template Structure Mapping

## Overview

This document maps each friction point from AI-assisted development to specific solutions within the meta project
template structure. Each section shows:

- 🔴 **The Problem** - Specific friction point from experience
- 🟢 **The Solution** - Mitigation strategy
- 📁 **Template Implementation** - Exact files/folders that implement the solution

## Table of Contents

1. [Context Comprehension & Management](#1-context-comprehension--management)
2. [Generation Inaccuracy & Unreliability](#2-generation-inaccuracy--unreliability)
3. [Code Output & Quality Degradation](#3-code-output--quality-degradation)
4. [Security & Compliance Vulnerabilities](#4-security--compliance-vulnerabilities)
5. [Ineffective Debugging & Testing Support](#5-ineffective-debugging--testing-support)
6. [Workflow Integration & DevEx Friction](#6-workflow-integration--devex-friction)
7. [Process & Collaboration Disruption](#7-process--collaboration-disruption)
8. [Inefficient Human-AI Interaction Loop](#8-inefficient-human-ai-interaction-loop)

---

## 1. Context Comprehension & Management

### 1.1 "Goldfish Memory": Context Window Constraints

🔴 **Problem**: AI forgets project conventions, previous instructions decay, context window fills with irrelevant
information

🟢 **Solution**: Persistent system prompts, contextual re-injection, focused context curation

📁 **Template Implementation**:

```text
ai/
├── config/
│   ├── .cursorrules               # Persistent rules loaded every session
│   ├── .copilot                   # GitHub Copilot persistent context
│   └── context-rules.json         # Context optimization rules
└── prompts/
    └── context-reinforcement.md   # Re-injection templates

scripts/
└── dev/
    ├── ai-context-dump.sh         # Captures current context
    └── context-optimizer.sh       # Intelligent context management
```

> 📖 **See also**:
>
> - [Manual Context Requirements](CLAUDE.md#manual-context-requirements) for context provision optimal practices
> - [Local Model Setup](docs/guides/ai-development/local-model-setup.md) for offline AI integration
> - [AI Configuration](ai/config/README.md) for detailed config documentation

**How it works**:

- `.cursorrules` is automatically prepended to every AI request in Cursor
- `ai-context-dump.sh` creates a snapshot of current state for debugging
- Templates in `prompts/` include context reinforcement sections

**Example `.cursorrules`**:

```markdown
# ALWAYS active context

You are working on {{PROJECT_NAME}} with these immutable rules:

- TypeScript strict mode is mandatory
- All state management uses Zustand (never Redux)
- Follow patterns in @docs/architecture/patterns/
- Check @ai/examples/good-patterns/ before generating code
```

### 1.2 Flawed Retrieval: RAG Unreliability

🔴 **Problem**: AI retrieves wrong file versions, outdated documentation, or irrelevant code snippets

🟢 **Solution**: Manual context provision, explicit file referencing, RAG as first-draft only

📁 **Template Implementation**:

```text
ai/
└── prompts/
    ├── templates/
    │   └── explicit-context.md     # Templates requiring manual context
    └── feature/
        └── planning.md             # Includes "paste current code" sections

scripts/
└── dev/
    └── gather-feature-context.sh   # Collects specific feature files
```

**Example prompt template**:

```markdown
# Feature Implementation Request

## Current Code Context

<!-- PASTE EXACT CURRENT CODE - DO NOT RELY ON RAG -->

`{{paste current implementation}}`

## Specific Files to Modify

- @src/features/auth/login.ts (lines 45-67)
- @src/features/auth/types.ts (full file)

## Task

[Your specific task with explicit file references]
```

### 1.3 Architectural Blindness

🔴 **Problem**: AI doesn't understand high-level architecture, makes changes that break system design

🟢 **Solution**: Architecture documentation, visual diagrams, pattern examples

📁 **Template Implementation**:

```text
docs/
├── architecture/
│   ├── README.md                   # High-level architecture overview
│   ├── diagrams/
│   │   ├── system-overview.mmd     # Mermaid diagrams
│   │   ├── data-flow.mmd
│   │   └── component-hierarchy.svg
│   └── patterns/
│       ├── state-management.md     # Zustand patterns
│       ├── api-layer.md           # API design patterns
│       └── component-structure.md  # Component patterns

ai/
└── examples/
    └── good-patterns/
        └── feature-structure/      # Complete feature example
```

**Architecture overview template**:

````markdown
# System Architecture

## High-Level Design

Our system follows a feature-based architecture where each feature is self-contained...

## Data Flow

```mermaid
graph LR
    UI[UI Components] --> Store[Zustand Store]
    Store --> API[API Layer]
    API --> DB[Database]
```text
````

## Key Principles

1. Features are isolated and self-contained
2. State management is centralized per feature
3. API calls go through a typed service layer

```

### 1.4 Context-Awareness vs. Latency Tradeoff

🔴 **Problem**: Including enough context makes AI slow; limiting context makes it inaccurate

🟢 **Solution**: Selective context loading, model selection per task, pre-computed context

📁 **Template Implementation**:
```

config/
└── ai/
├── model-selection.json # Task-to-model mapping
└── context-rules.json # Context inclusion rules

scripts/
├── dev/
│ └── warm-context.sh # Pre-loads common files
└── init/
└── create-context-cache.sh # Builds initial context

````

**Model selection config**:
```json
{
  "tasks": {
    "simple_refactor": {
      "model": "claude-3-haiku",
      "maxContext": 4000,
      "includeFiles": ["current_file_only"]
    },
    "architecture_design": {
      "model": "claude-3-opus",
      "maxContext": 32000,
      "includeFiles": ["all_patterns", "architecture_docs"]
    }
  }
}
````

---

## 2. Generation Inaccuracy & Unreliability

### 2.1 Hallucination & Fabrication

🔴 **Problem**: AI invents APIs, functions, or "facts" that don't exist

🟢 **Solution**: Grounding with documentation, verification workflow, temperature adjustment

📁 **Template Implementation**:

```
docs/
└── references/
    ├── api/
    │   └── verified-apis.md        # List of real APIs
    └── dependencies/
        └── package-docs/           # Local copies of critical docs

ai/
├── prompts/
│   └── templates/
│       └── grounded-generation.md  # Includes "use ONLY these APIs"
└── examples/
    └── anti-patterns/
        └── hallucination-examples/ # Common hallucinations to avoid

scripts/
└── quality/
    └── verify-imports.sh          # Checks all imports exist
```

**Grounded generation prompt**:

```markdown
# API Implementation Task

## Available APIs Only

You may ONLY use these verified APIs:

- `projectLogger.info()` - NOT console.log
- `apiClient.get()` - NOT fetch
- `validateInput()` - from @lib/validation

## Package Versions

- react: 18.2.0 (NO useServerState hook)
- zustand: 4.4.0 (NO persist middleware)
```

### 2.2 "Almost Correct" Problem

🔴 **Problem**: Generated code is 90% correct but has subtle bugs

🟢 **Solution**: Test-first development, step-by-step debugging, adversarial prompting

📁 **Template Implementation**:

```text
ai/
└── prompts/
    ├── testing/
    │   ├── test-first.md          # Generate tests before code
    │   └── edge-cases.md          # Find edge cases
    └── debugging/
        └── line-by-line.md        # Step through logic

templates/
└── component/
    └── {{name}}.test.tsx.hbs      # Test template with edge cases
```

**Test-first prompt template**:

```markdown
# Test-First Development

## Step 1: Generate Comprehensive Tests

Before implementing, create tests for:

- Happy path
- Null/undefined inputs
- Empty arrays/objects
- Boundary conditions
- Error cases
- Race conditions

## Step 2: Implementation

Only after tests are complete, implement code that passes ALL tests
```

### 2.3 Outdated Knowledge Base

🔴 **Problem**: AI uses deprecated APIs or old patterns

🟢 **Solution**: Current documentation, version specifications, custom rules

📁 **Template Implementation**:

```text
docs/
├── references/
│   └── dependencies/
│       ├── current-versions.md     # Exact versions used
│       └── migration-guides/       # From old to new patterns
└── decisions/
    └── deprecated-patterns.md      # What NOT to use

ai/
├── .cursorrules
│   # Section: "NEVER use these deprecated patterns"
└── examples/
    └── anti-patterns/
        └── deprecated/             # Old patterns to avoid
```

### 2.4 Tacit Knowledge Gap

🔴 **Problem**: AI doesn't know unwritten team conventions

🟢 **Solution**: Explicit documentation, examples, iterative feedback

📁 **Template Implementation**:

```text
docs/
├── guides/
│   └── team/
│       ├── conventions.md          # Unwritten rules written down
│       └── naming-standards.md     # Naming conventions
└── architecture/
    └── patterns/
        └── logging-format.md       # How we log

ai/
├── CONTRIBUTING.md                 # AI-specific contribution rules
└── examples/
    └── good-patterns/
        └── conventions/            # Examples following conventions
```

---

## 3. Code Output & Quality Degradation

### 3.1 Architectural Drift

🔴 **Problem**: Each AI generation slightly violates architecture, leading to gradual decay

🟢 **Solution**: Exemplar files, architectural rules, linting

📁 **Template Implementation**:

```text
docs/
└── architecture/
    ├── patterns/
    │   └── feature-structure.md    # Canonical feature structure
    └── decisions/
        └── 001-core-patterns.md    # Why these patterns

ai/
└── examples/
    └── good-patterns/
        └── complete-feature/       # Full exemplar feature

config/
└── eslint/
    └── architecture-rules.js       # Custom ESLint rules

scripts/
└── quality/
    └── check-architecture.sh       # Validates structure
```

### 3.2 Proliferation of Boilerplate

🔴 **Problem**: AI generates duplicate code instead of extracting reusable utilities

🟢 **Solution**: DRY enforcement, abstraction-first prompting, utils library

📁 **Template Implementation**:

```text
templates/
├── utils/
│   └── create-utility.hbs          # Utility function template
└── hooks/
    └── use{{Name}}.ts.hbs         # Reusable hook template

docs/
└── architecture/
    └── patterns/
        └── shared-utilities.md     # When to extract utilities

ai/
└── prompts/
    └── refactoring/
        └── extract-common.md       # DRY refactoring prompt
```

### 3.3 Over-engineering

🔴 **Problem**: AI creates unnecessarily complex solutions

🟢 **Solution**: KISS principle, constraints, simplification prompts

📁 **Template Implementation**:

```text
ai/
├── .cursorrules
│   # Section: "Prefer simple solutions"
└── prompts/
    └── templates/
        └── simple-solution.md      # KISS-first prompts

docs/
└── architecture/
    └── principles/
        └── simplicity-first.md     # Why we prefer simple
```

### 3.4 Performance Blindness

🔴 **Problem**: AI generates inefficient code with poor performance

🟢 **Solution**: Performance constraints, analysis prompts, benchmarks

📁 **Template Implementation**:

```text
scripts/
├── analysis/
│   ├── bundle-analysis.sh         # Check bundle size
│   └── performance-test.sh        # Run perf benchmarks
└── dev/
    └── lighthouse-check.sh         # Web vitals check

ai/
└── prompts/
    └── performance/
        ├── optimization.md         # Performance-focused prompts
        └── complexity-analysis.md  # Big-O analysis
```

---

## 4. Security & Compliance Vulnerabilities

### 4.1 Insecure by Default

🔴 **Problem**: AI generates code with security vulnerabilities

🟢 **Solution**: Security-first prompting, SAST tools, secure examples

📁 **Template Implementation**:

```text
config/
└── security/
    ├── headers.json               # Security headers
    ├── csp-policy.json           # Content Security Policy
    └── api-rate-limits.json      # Rate limiting

.github/
└── workflows/
    └── security-audit.yml        # Automated scanning

ai/
├── .cursorrules
│   # Section: "Security Requirements"
└── examples/
    └── good-patterns/
        └── security/             # Secure code examples

scripts/
└── quality/
    └── security-scan.sh          # Run security checks
```

### 4.2 Supply Chain Vulnerabilities

🔴 **Problem**: AI suggests packages with known vulnerabilities

🟢 **Solution**: Dependency scanning, approved package list, health checks

📁 **Template Implementation**:

```text
docs/
└── references/
    └── dependencies/
        ├── approved-packages.md   # Vetted packages
        └── blocked-packages.md    # Never use these

scripts/
├── quality/
│   └── audit-deps.sh             # npm/yarn audit
└── init/
    └── check-package-health.sh   # Verify before adding

.github/
└── workflows/
    └── dependency-review.yml     # Auto-check PRs
```

---

## 5. Ineffective Debugging & Testing Support

### 5.1 Black-Box Debugging

🔴 **Problem**: AI can't see runtime state or understand dynamic behavior

🟢 **Solution**: Rich context provision, hypothesis testing, reproducible examples

📁 **Template Implementation**:

```text
scripts/
└── dev/
    ├── debug-snapshot.sh         # Capture full runtime state
    └── create-repro.sh           # Minimal reproduction

ai/
└── prompts/
    └── debugging/
        ├── hypothesis-driven.md   # Systematic debugging
        └── runtime-analysis.md    # Runtime state prompts
```

**Debug snapshot script**:

```bash
#!/bin/bash
# Captures everything needed for debugging

echo "=== Process State ==="
ps aux | grep node

echo "=== Memory Usage ==="
node -e "console.log(process.memoryUsage())"

echo "=== Open Files ==="
lsof -p $(pgrep node)

echo "=== Environment ==="
env | sort

echo "=== Recent Logs ==="
tail -n 100 combined.log

echo "=== Network Connections ==="
netstat -an | grep ESTABLISHED
```

### 5.2 Test Generation Fallibility

🔴 **Problem**: AI creates incomplete or incorrect tests

🟢 **Solution**: Test categories, coverage analysis, golden examples

📁 **Template Implementation**:

```text
templates/
└── tests/
    ├── unit.test.hbs             # Comprehensive unit test
    ├── integration.test.hbs      # Integration test template
    └── e2e.test.hbs              # E2E test template

ai/
└── prompts/
    └── testing/
        ├── comprehensive-tests.md # All test categories
        └── coverage-gaps.md       # Find missing tests

docs/
└── guides/
    └── testing/
        └── test-standards.md      # What good tests look like
```

### 5.3 Local vs. Global Coherence

🔴 **Problem**: AI refactors break code in other files

🟢 **Solution**: Global search before changes, TypeScript, comprehensive tests

📁 **Template Implementation**:

```text
config/
└── typescript/
    └── tsconfig.strict.json      # Strict type checking

scripts/
└── quality/
    ├── find-usages.sh            # Find all usages
    └── impact-analysis.sh        # What breaks if X changes

ai/
└── prompts/
    └── refactoring/
        └── safe-refactor.md      # Include impact analysis
```

---

## 6. Workflow Integration & DevEx Friction

### 6.1 Interface Clutter

🔴 **Problem**: AI UI elements disrupt coding flow

🟢 **Solution**: Customized UI, chat-centric workflow, zen mode

📁 **Template Implementation**:

```text
config/
└── ide/
    ├── vscode-settings.json      # Optimized settings
    ├── cursor-settings.json      # Cursor-specific
    └── keybindings.json          # Custom shortcuts

docs/
└── guides/
    └── ide-setup/
        └── ai-optimization.md     # How to configure
```

### 6.2 Keyboard Shortcut Conflicts

🔴 **Problem**: AI tools hijack important shortcuts

🟢 **Solution**: Remapping, namespace for AI shortcuts

📁 **Template Implementation**:

```text
config/
└── ide/
    └── keybindings.json          # AI shortcuts namespaced

docs/
└── guides/
    └── workflows/
        └── keyboard-shortcuts.md  # Complete shortcut map
```

### 6.3 Performance Bottlenecks

🔴 **Problem**: AI tools make IDE slow

🟢 **Solution**: Selective features, .aiignore, lighter models

📁 **Template Implementation**:

```python
.aiignore.template                # Exclude from indexing
├── # Large files
├── node_modules/
├── dist/
└── *.log

config/
└── ai/
    └── performance.json          # Performance settings

scripts/
└── dev/
    └── clean-ai-cache.sh         # Clear AI caches
```

### 6.4 Environment Context Gap

🔴 **Problem**: AI doesn't know about environment, configs, or terminal state

🟢 **Solution**: Environment dumps, explicit versioning, dynamic scripts

📁 **Template Implementation**:

```text
scripts/
└── dev/
    ├── env-dump.sh               # Full environment snapshot
    └── config-summary.sh         # Config overview

ai/
└── prompts/
    └── templates/
        └── with-environment.md    # Include env template
```

---

## 7. Process & Collaboration Disruption

### 7.1 Code Review Overload

🔴 **Problem**: Large AI-generated PRs are hard to review

🟢 **Solution**: Atomic PRs, AI usage declaration, walkthroughs

📁 **Template Implementation**:

```text
.github/
└── PULL_REQUEST_TEMPLATE.md      # Requires AI declaration

docs/
└── guides/
    └── team/
        ├── pr-guidelines.md       # Size limits
        └── ai-code-review.md      # How to review AI code

scripts/
└── quality/
    └── pr-size-check.sh          # Enforce size limits
```

### 7.2 Cognitive Load

🔴 **Problem**: Constant context switching between coding and prompting

🟢 **Solution**: Batch interactions, prompt libraries, two-hat method

📁 **Template Implementation**:

```text
ai/
└── prompts/
    └── snippets/                 # Quick-access prompts

docs/
└── guides/
    └── workflows/
        ├── focus-blocks.md        # Time-boxing guide
        └── prompt-planning.md     # Plan before prompting
```

### 7.3 Paradox of Choice

🔴 **Problem**: AI offers too many implementation options

🟢 **Solution**: Decision criteria, timeboxing, simplicity bias

📁 **Template Implementation**:

```text
docs/
└── decisions/
    └── templates/
        └── quick-decision.md      # Decision template

ai/
└── prompts/
    └── templates/
        └── single-solution.md     # Ask for one answer
```

---

## 8. Inefficient Human-AI Interaction Loop

### 8.1 High Cost of Prompt Engineering

🔴 **Problem**: Writing good prompts takes too long

🟢 **Solution**: Reusable prompt library, templates, AI-written prompts

📁 **Template Implementation**:

```text
ai/
└── prompts/
    ├── library/                   # Categorized prompts
    │   ├── crud/
    │   ├── auth/
    │   └── ui/
    └── generators/
        └── prompt-writer.md       # AI writes prompts

tools/
└── prompt-manager/               # CLI for prompts
    ├── search.js
    └── compose.js
```

### 8.2 Unsolicited Actions

🔴 **Problem**: AI changes more than requested

🟢 **Solution**: One-task rule, minimal context, negative constraints

📁 **Template Implementation**:

```text
ai/
├── .cursorrules
│   # Section: "Scope Limitations"
└── prompts/
    └── templates/
        └── focused-task.md        # Single responsibility

scripts/
└── quality/
    └── diff-validator.sh         # Check only expected changes
```

### 8.3 Operational Fragility

🔴 **Problem**: Dependence on AI availability

🟢 **Solution**: Offline workflows, local models, conversation saving

📁 **Template Implementation**:

```text
config/
└── ai/
    └── fallback-models.json      # Local model configs

scripts/
└── utils/
    ├── save-conversation.sh      # Archive important chats
    └── export-prompts.sh         # Backup prompts

tools/
└── offline-ai/                   # Local model setup
    └── setup-ollama.sh
```

---

## Quick Reference Matrix

| Friction Point      | Primary Solution    | Key Template Elements                                              |
| ------------------- | ------------------- | ------------------------------------------------------------------ |
| Context Decay       | Persistent rules    | `ai/.cursorrules`, `scripts/ai-context-dump.sh`                    |
| Hallucination       | Grounded examples   | `ai/examples/`, `docs/references/api/`                             |
| Architectural Drift | Pattern enforcement | `docs/architecture/patterns/`, `config/eslint/`                    |
| Security Gaps       | Built-in scanning   | `.github/workflows/security-audit.yml`, `scripts/security-scan.sh` |
| Debug Blindness     | Runtime capture     | `scripts/debug-snapshot.sh`, `ai/prompts/debugging/`               |
| Review Overload     | PR standards        | `.github/PULL_REQUEST_TEMPLATE.md`, `docs/guides/team/`            |
| Prompt Fatigue      | Reusable library    | `ai/prompts/library/`, `tools/prompt-manager/`                     |

## Implementation Priority

### Phase 1: Foundation (Week 1)

1. Set up `ai/.cursorrules`
2. Create basic `docs/architecture/`
3. Implement `scripts/ai-context-dump.sh`
4. Add security workflows

### Phase 2: Patterns (Week 2)

1. Document core patterns
2. Add good/bad examples
3. Create prompt templates
4. Set up testing templates

### Phase 3: Automation (Week 3)

1. Build generator tools
2. Add quality scripts
3. Implement PR checks
4. Create IDE configs

### Phase 4: Refinement (Ongoing)

1. Gather team feedback
2. Update based on failures
3. Add new patterns
4. Optimize workflows

---

_This mapping shows that every major friction point in AI development has a specific solution implemented in the
template structure. The key is not just having these files, but actively maintaining and evolving them based on real
project experience._
