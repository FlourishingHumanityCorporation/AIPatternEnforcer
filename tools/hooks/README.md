# AIPatternEnforcer Hook System

A taxonomic system for organizing Claude Code hooks that enforce development patterns and prevent common AI development mistakes.

## 📋 MECE Hook Taxonomy

The hooks are organized into **7 mutually exclusive, collectively exhaustive categories**:

### 1. **AI Patterns** (`ai-patterns/`)

**Purpose**: Prevent AI-specific development anti-patterns  
**Criteria**: Hooks that address AI tool behavior and patterns

- `prevent-improved-files.js` - Blocks creation of \_improved, \_v2, \_enhanced files
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
└── local-dev/                   # Local development
    ├── README.md
    ├── localhost-enforcer.js
    └── mock-data-enforcer.js
```

## 🔧 Adding New Hooks

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

## 📖 Documentation

- **Category READMEs**: Each category has detailed documentation
- **Hook Comments**: Individual hooks have inline documentation
- **Configuration**: See `.claude/settings.json` for active hooks
- **Testing**: See `__tests__/` directories for test examples

## 🏆 Benefits

- **MECE Organization**: Clear, non-overlapping categories
- **Shared Libraries**: 85% code reduction through `HookRunner`
- **Real-time Prevention**: Stops problems before they occur
- **Zero Friction**: Legitimate development flows unimpeded
- **Comprehensive Coverage**: All major development patterns covered

---

**Need help?** Check category READMEs or individual hook documentation for specific guidance.
