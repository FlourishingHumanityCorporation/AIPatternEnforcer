# AIPatternEnforcer Hook System

A taxonomic system for organizing Claude Code hooks that enforce development patterns and prevent common AI development mistakes.

## ⚠️ Honest Assessment: Scope and Limitations

**What hooks DO**: File-level pattern enforcement (31% of AI development friction)
**What hooks DON'T**: Address fundamental AI model limitations, UI friction, workflow issues (69% of friction)

### Key Limitations

1. **Reactive Nature**: Hooks catch problems AFTER AI generates code, not during interaction
2. **Narrow Scope**: Only address file organization patterns, not AI behavior or workflow friction
3. **Performance Impact**: 21 hooks on every file operation creates measurable latency
4. **Environmental Fragility**: Can be completely disabled via environment variables
5. **False Security**: May create illusion of comprehensive protection

### What You Still Need Beyond Hooks

- **Context management strategies** (CLAUDE.md, .cursorrules)
- **Human-in-the-loop workflows** (plan-first, test-driven development)
- **Manual code review practices** (especially for AI-generated code)
- **IDE configuration optimization** (AI tool settings, keybindings)
- **Prompt engineering skills** (to prevent issues at generation time)

Hooks are **one tool among many**, not a complete solution to AI development friction.

## 📋 MECE Hook Taxonomy

The hooks are organized into **7 mutually exclusive, collectively exhaustive categories**:

### 1. **AI Patterns** (`ai-patterns/`)

**Purpose**: Prevent AI-specific development anti-patterns  
**Criteria**: Hooks that address AI tool behavior and patterns

- `prevent-improved-files.js` - Blocks creation of \_improved, \_v2, \_enhanced files (original proven patterns)
- Removed: `prevent-dev-artifacts.js` - Based on contaminated test data (not real AI patterns)
- Removed: `prevent-component-naming-mistakes.js` - Based on contaminated test data (not real AI patterns)
- `context-validator.js` - Validates context efficiency and prevents pollution
- `streaming-pattern-enforcer.js` - Enforces proper streaming patterns

**Priority**: Critical to High

### 2. **Project Boundaries** (`project-boundaries/`)

**Purpose**: Enforce project scope and structure boundaries  
**Criteria**: Hooks that protect project structure and prevent scope violations

- `block-root-mess.js` - Prevents root directory pollution
- `enterprise-antibody.js` - Blocks enterprise feature patterns
- `meta-project-guardian.js` - Protects meta-project infrastructure

**Priority**: Critical to High

### 3. **Security** (`security/`)

**Purpose**: Enforce security patterns and prevent vulnerabilities  
**Criteria**: Hooks that address security, access control, and vulnerability prevention

- `scope-limiter.js` - Enforces project scope boundaries
- `security-scan.js` - Scans for security vulnerabilities

**Priority**: High

### 4. **Validation** (`validation/`)

**Purpose**: Validate code correctness and schema integrity  
**Criteria**: Hooks that validate data structures, APIs, and configurations

- `api-validator.js` - Validates API patterns and structure
- `validate-prisma.js` - Validates Prisma schema changes
- `template-integrity-validator.js` - Validates template integrity

**Priority**: Medium to High

### 5. **Architecture** (`architecture/`)

**Purpose**: Enforce architectural patterns and code organization  
**Criteria**: Hooks that validate system architecture and component placement

- `architecture-validator.js` - Validates architectural patterns and AI integration
- `test-location-enforcer.js` - Enforces proper test file placement

**Priority**: Medium to High

### 6. **Performance** (`performance/`)

**Purpose**: Monitor and optimize performance  
**Criteria**: Hooks that address performance, resource usage, and optimization

- `performance-guardian.js` - Comprehensive performance monitoring and optimization
- `vector-db-hygiene.js` - Maintains vector database hygiene

**Priority**: Medium to High

### 7. **Cleanup** (`cleanup/`)

**Purpose**: Clean up and standardize code formatting  
**Criteria**: Hooks that fix code style, imports, and logging

- `fix-console-logs.js` - Fixes console.log statements
- `import-janitor.js` - Cleans up unused imports
- `docs-enforcer.js` - Enforces documentation standards

**Priority**: Low to Medium

### 8. **Local Development** (`local-dev/`)

**Purpose**: Enforce local development patterns  
**Criteria**: Hooks that ensure local-only development practices

- `localhost-enforcer.js` - Enforces local development patterns
- `mock-data-enforcer.js` - Enforces mock data usage patterns

**Priority**: Medium

## 🏗️ Hook Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/ai-patterns/prevent-improved-files.js",
            "family": "file_hygiene",
            "priority": "critical"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/cleanup/fix-console-logs.js",
            "family": "code_cleanup",
            "priority": "medium"
          }
        ]
      }
    ]
  }
}
```

## 📁 Directory Structure

```
tools/hooks/
├── README.md                    # This file
├── lib/                         # Shared utilities
│   ├── HookRunner.js           # Base class for all hooks
│   ├── FileAnalyzer.js         # File analysis utilities
│   ├── PatternLibrary.js       # Shared patterns
│   ├── ErrorFormatter.js       # Error message formatting
│   └── PerformanceAnalyzer.js  # Performance analysis
├── ai-patterns/                 # AI-specific patterns
│   ├── README.md
│   ├── prevent-improved-files.js
│   ├── context-validator.js
│   └── streaming-pattern-enforcer.js
├── project-boundaries/          # Project structure enforcement
│   ├── README.md
│   ├── block-root-mess.js
│   ├── enterprise-antibody.js
│   └── meta-project-guardian.js
├── security/                    # Security enforcement
│   ├── README.md
│   ├── scope-limiter.js
│   └── security-scan.js
├── validation/                  # Data validation
│   ├── README.md
│   ├── api-validator.js
│   ├── validate-prisma.js
│   └── template-integrity-validator.js
├── architecture/                # Architecture validation
│   ├── README.md
│   ├── architecture-validator.js
│   └── test-location-enforcer.js
├── performance/                 # Performance monitoring
│   ├── README.md
│   ├── performance-guardian.js
│   └── vector-db-hygiene.js
├── cleanup/                     # Code cleanup
│   ├── README.md
│   ├── fix-console-logs.js
│   ├── import-janitor.js
│   └── docs-enforcer.js
├── context/                     # Context management
│   ├── README.md
│   ├── context-completeness-enforcer.js
│   ├── context-drift-detector.js
│   └── claude-md-injector.js
├── ide/                         # IDE integration
│   ├── README.md
│   ├── ide-config-checker.js
│   ├── performance-guardian.js
│   └── shortcut-protector.js
├── ui/                          # UI framework validation
│   ├── README.md
│   └── tailwind-pattern-enforcer.js
├── state/                       # State management
│   ├── README.md
│   ├── zustand-pattern-enforcer.js
│   └── tanstack-query-validator.js
├── ai/                          # AI integration
│   ├── README.md
│   └── ai-integration-validator.js
├── database/                    # Database patterns
│   ├── README.md
│   └── prisma-pattern-enforcer.js
├── engine/                      # Hook processing engine
│   ├── README.md
│   └── hook-engine-validator.js
├── learning/                    # Adaptive learning
│   ├── README.md
│   └── learning-system-validator.js
├── local-dev/                   # Local development
│   ├── README.md
│   ├── localhost-enforcer.js
│   └── mock-data-enforcer.js
├── logs/                        # Logging and monitoring
│   ├── README.md
│   └── log-pattern-enforcer.js
├── prompt/                      # Prompt intelligence
│   ├── README.md
│   ├── prompt-quality-checker.js
│   ├── prompt-improver.js
│   └── few-shot-injector.js
├── tools/                       # Development tools
│   ├── README.md
│   └── tool-integration-validator.js
├── ui-framework/                # UI framework specific
│   ├── README.md
│   └── framework-validator.js
└── workflow/                    # Workflow enforcement
    ├── README.md
    ├── plan-first-enforcer.js
    ├── test-first-enforcer.js
    └── pr-scope-guardian.js
```

## 🔧 Adding New Hooks

**📚 Comprehensive Development Guide**: [docs/guides/claude-code-hooks/05-hooks-development.md](../../docs/guides/claude-code-hooks/05-hooks-development.md)

The guide above provides complete documentation for hook development including:

- HookRunner base class usage (85% code reduction)
- Shared utilities library integration
- Parallel execution system
- Testing framework with custom Jest matchers
- Production deployment patterns

### 1. Determine Category

Use this decision tree to categorize new hooks:

```
Is it about AI tool behavior? → ai-patterns/
Is it about project structure? → project-boundaries/
Is it about security? → security/
Is it about data validation? → validation/
Is it about architecture? → architecture/
Is it about performance? → performance/
Is it about code cleanup? → cleanup/
Is it about local development? → local-dev/
```

### 2. Create Hook File

```javascript
#!/usr/bin/env node

const HookRunner = require("../lib/HookRunner");

function myHookLogic(hookData, runner) {
  // Your hook logic here
  if (shouldBlock) {
    return {
      block: true,
      message: runner.formatError("Problem", "Solution"),
    };
  }
  return { allow: true };
}

HookRunner.create("my-hook-name", myHookLogic, {
  timeout: 2000,
});

module.exports = { myHookLogic };
```

### 3. Add to Configuration

Update `.claude/settings.json` to include your hook in the appropriate phase (PreToolUse or PostToolUse).

### 4. Update Category README

Add your hook to the appropriate category's README.md file.

## 🧪 Testing Hooks

Each category has its own test directory:

```bash
# Run all hook tests
npm test -- --testPathPattern="tools/hooks"

# Run specific category tests
npm test -- --testPathPattern="tools/hooks/ai-patterns"

# Test individual hook
node tools/hooks/ai-patterns/prevent-improved-files.js
```

## 📊 Hook Families

Hooks are grouped by family in configuration:

- **infrastructure_protection**: Meta-project protection
- **file_hygiene**: File naming and organization
- **validation**: Data and schema validation
- **security**: Security enforcement
- **testing**: Test-related enforcement
- **pattern_enforcement**: Pattern compliance
- **architecture**: Architectural validation
- **performance**: Performance monitoring
- **data_hygiene**: Data cleanliness
- **code_cleanup**: Code formatting and cleanup
- **documentation**: Documentation standards

## 🚀 Hook Execution Flow

1. **PreToolUse**: Prevent bad operations before they happen
2. **PostToolUse**: Clean up and validate after operations
3. **Priority**: Critical → High → Medium → Low
4. **Timeout**: Each hook has configurable timeout (1-4 seconds)

## 🔍 Hook Debugging System

**Comprehensive debugging capabilities for the hook system with enhanced error formatting and real-time monitoring.**

### Quick Debug Commands

```bash
# Run system diagnostics
npm run debug:hooks diagnose

# Test specific hook
npm run debug:hooks test prevent-improved-files

# Real-time monitoring
npm run debug:hooks:monitor:enhanced

# Interactive debugging shell
npm run debug:hooks:shell

# Hook chain analysis
npm run debug:hooks:chain
```

### Environment Controls

```bash
# Enable/disable hooks globally
HOOKS_DISABLED=false  # Enable hooks (false=enabled, true=disabled)
HOOK_VERBOSE=true     # Enable verbose output

# Category-specific controls
HOOK_AI_PATTERNS=true   # Enable AI pattern hooks
HOOK_ARCHITECTURE=true  # Enable architecture hooks
HOOK_CLEANUP=true       # Enable cleanup hooks
HOOK_CONTEXT=true       # Enable context hooks
HOOK_IDE=true           # Enable IDE hooks
HOOK_UI=true            # Enable UI hooks
HOOK_STATE=true         # Enable state hooks
HOOK_AI=true            # Enable AI hooks
HOOK_DATABASE=true      # Enable database hooks
HOOK_ENGINE=true        # Enable engine hooks
HOOK_LEARNING=true      # Enable learning hooks
HOOK_LOCAL_DEV=true     # Enable local-dev hooks
HOOK_LOGS=true          # Enable logs hooks
HOOK_PERFORMANCE=true   # Enable performance hooks
HOOK_PROMPT=true        # Enable prompt hooks
HOOK_PROJECT_BOUNDARIES=true  # Enable project-boundaries hooks
HOOK_SECURITY=true      # Enable security hooks
HOOK_TOOLS=true         # Enable tools hooks
HOOK_UI_FRAMEWORK=true  # Enable ui-framework hooks
HOOK_VALIDATION=true    # Enable validation hooks
HOOK_WORKFLOW=true      # Enable workflow hooks
```

**📚 Complete Guide**: [Hook Debugging System Guide](../../docs/guides/claude-code-hooks/hook-debugging-guide.md)

## 📖 Documentation

- **Category READMEs**: Each category has detailed documentation
- **Hook Comments**: Individual hooks have inline documentation
- **Configuration**: See `.claude/settings.json` for active hooks
- **Testing**: See `__tests__/` directories for test examples
- **Debugging**: See debugging guide for comprehensive troubleshooting

## ⚖️ Benefits and Trade-offs

### ✅ What Hooks Do Well

- **MECE Organization**: Clear, non-overlapping categories
- **Shared Libraries**: 85% code reduction through `HookRunner`
- **File Pattern Prevention**: Catches common file naming anti-patterns
- **Basic Structure Enforcement**: Maintains project organization

### ⚠️ Performance Considerations

- **21 hooks per file operation**: Adds 100-500ms latency depending on system
- **Timeout risks**: Hooks may be skipped under load (1-4 second timeouts)
- **Memory usage**: Parallel execution spawns multiple Node.js processes
- **Environment dependency**: `HOOKS_DISABLED=true` completely disables protection

### 🚫 What Hooks Cannot Fix

- **AI model limitations**: Context decay, hallucinations, knowledge gaps
- **Workflow friction**: Prompt engineering, UI issues, cognitive load
- **Team collaboration**: Code review overload, communication problems
- **Development environment**: IDE performance, configuration issues

---

**Need help?** Check category READMEs or individual hook documentation for specific guidance.
