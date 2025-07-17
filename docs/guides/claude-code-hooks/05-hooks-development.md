```markdown
# Claude Code Hooks Development Guide

**Last Updated**: 2025-07-14
**System Version**: 3.0 (Consolidated Architecture)
**Framework**: HookRunner Base Class + Shared Utilities

## Overview

This guide covers developing custom Claude Code hooks using the v3.0
consolidated architecture. The system provides a HookRunner base class
and shared utilities library that eliminates boilerplate and ensures
consistent behavior across all hooks.

## Table of Contents

**Foundation:**

- [Development Environment Setup](#development-environment-setup)
- [Environment Configuration System](#environment-configuration-system)
- [HookRunner Architecture](#hookrunner-architecture)
- [Creating Your First Hook](#creating-your-first-hook)

**Core Development:**

- [Hook Categories & Patterns](#hook-categories--patterns)
- [Shared Utilities Library](#shared-utilities-library)
- [Advanced Configuration](#advanced-configuration)
- [Parallel Execution System](#parallel-execution-system)

**Testing & Debugging:**

- [Comprehensive Testing Framework](#comprehensive-testing-framework)
- [Advanced Debugging & Troubleshooting](#advanced-debugging--troubleshooting)
- [Performance Optimization](#performance-optimization)

**Deployment & Lifecycle:**

- [Deployment and Configuration](#deployment-and-configuration)
- [Hook Lifecycle Management](#hook-lifecycle-management)
- [Production Considerations](#production-considerations)

## Development Environment Setup

### Prerequisites

- Node.js v20+
- npm v10+
- Claude Code CLI installed

### Project Structure
```

tools/hooks/
├── lib/ # Shared utilities library
│ ├── HookRunner.js # Base class for all hooks
│ ├── FileAnalyzer.js # File type detection and analysis
│ ├── PatternLibrary.js # Centralized regex patterns
│ ├── ErrorFormatter.js # Consistent error messaging
│ ├── PerformanceAnalyzer.js # Performance monitoring
│ └── index.js # Barrel export
├── **tests**/ # Test files
├── prevent-improved-files.js # Example hook
└── [your-hook].js # Your custom hook

````
### Setup Commands
```bash
# Navigate to the hooks directory
cd tools/hooks

# Install dependencies
npm install

# Run existing tests to verify setup
npm test __tests__/

# List available hooks for reference
ls -la *.js
````

## Environment Configuration System

The hook system uses a sophisticated environment-based configuration system for fine-grained control over hook execution.

**For comprehensive configuration management patterns and project-wide configuration standards, see [Configuration Directory](../../../config/)** - provides detailed configuration categories and management strategies.

### Global Controls

**Master switches that override all other settings:**

```bash
# .env file configuration
HOOKS_DISABLED=false    # Turn on hooks (enable protection)
HOOK_VERBOSE=true        # Enable detailed execution logging
```

### Granular Folder Control

**Category-specific controls (only apply when global controls are `false`):**

```bash
# Individual hook category controls
HOOK_AI_PATTERNS=true/false        # AI pattern enforcement
HOOK_ARCHITECTURE=true/false       # Architecture validation
HOOK_CLEANUP=true/false           # Code cleanup & auto-fixing
HOOK_LOCAL_DEV=true/false         # Local development patterns
HOOK_PERFORMANCE=true/false       # Performance monitoring
HOOK_PROJECT_BOUNDARIES=true/false # Project structure protection
HOOK_SECURITY=true/false          # Security scanning
HOOK_VALIDATION=true/false        # Template & API validation
```

### Control Priority

```
1. HOOKS_DISABLED=true → All hooks bypassed
3. HOOK_[CATEGORY]=false → Only that category bypassed
4. Default → All hooks run
```

### Common Usage Examples

```bash
# Development: Only critical protection
HOOKS_DISABLED=false
HOOK_PROJECT_BOUNDARIES=true  # Keep structure protection
HOOK_SECURITY=true           # Keep security scanning
HOOK_AI_PATTERNS=false       # Disable pattern enforcement
HOOK_CLEANUP=false           # Disable auto-cleanup

# Production: Full enforcement except performance monitoring
HOOKS_DISABLED=false
HOOK_PERFORMANCE=false       # Disable performance hooks

# Testing: Minimal interference
HOOKS_DISABLED=false
HOOK_PROJECT_BOUNDARIES=true
HOOK_SECURITY=true
# All others disabled
```

### Environment Variable Loading

The system automatically loads `.env` files from the project root:

```javascript
// HookRunner automatically handles .env loading
// No manual configuration required
const runner = new HookRunner("my-hook");
// Environment variables are available immediately
```

## HookRunner Architecture

The HookRunner base class standardizes hook creation and execution.

### Key Features

- **Standardized input/output processing**: JSON parsing and error handling
- **Timeout management**: Family-based timeout enforcement
- **Fail-open architecture**: Operations proceed if hooks error
- **Debug mode**: Enhanced logging for troubleshooting
- **Local development focus**: Built-in execution time tracking

### Usage

```javascript
// tools/hooks/your-hook.js
const { HookRunner } = require("./lib");

function myHookLogic(hookData, runner) {
  // Your validation logic here
  // ...
  if (problemDetected) {
    return runner.block("❌ Problem detected\n✅ Suggestion for fix");
  }
  return runner.allow();
}

HookRunner.create("your-hook-name", myHookLogic);
```

## Creating Your First Hook

### 1. Create the Hook File

Create `tools/hooks/my-new-hook.js`

### 2. Implement the Logic

```javascript
// tools/hooks/my-new-hook.js
const { HookRunner } = require("./lib");

function preventTODOs(hookData, runner) {
  const { content, new_string } = hookData.tool_input;
  const combinedContent = `${content || ""} ${new_string || ""}`;

  if (combinedContent.toLowerCase().includes("todo:")) {
    return runner.block(
      "❌ 'TODO:' comments are not allowed.\n✅ Create a ticket instead.",
    );
  }
  return runner.allow();
}

HookRunner.create("prevent-todos-hook", preventTODOs);
```

### 3. Add to Configuration

Update `.claude/settings.json`:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [
        // ... other hooks
        {
          "type": "command",
          "command": "node tools/hooks/my-new-hook.js",
          "timeout": 1,
          "family": "pattern_enforcement",
          "priority": "low"
        }
      ]
    }
  ]
}
```

## Hook Categories & Patterns

The hook system is organized into **9 specialized categories** with distinct patterns and use cases:

### 1. AI Patterns (`ai-patterns/`)

**Purpose**: AI-specific anti-patterns and behavior enforcement

```javascript
// Example: prevent-improved-files.js
function preventImprovedFiles(hookData, runner) {
  const BAD_PATTERNS = [/_improved\./i, /_enhanced\./i, /_v2\./i];

  if (runner.matchesPatterns(hookData.file_path, BAD_PATTERNS)) {
    return runner.block(
      "❌ Don't create versioned files\n✅ Edit original instead",
    );
  }
  return runner.allow();
}
```

**Hooks**: `prevent-improved-files.js`, `context-validator.js`, `streaming-pattern-enforcer.js`

### 2. Project Boundaries (`project-boundaries/`)

**Purpose**: Meta-project structure protection

```javascript
// Example: block-root-mess.js
function blockRootMess(hookData, runner) {
  if (
    isRootDirectory(hookData.file_path) &&
    isApplicationCode(hookData.content)
  ) {
    return runner.block(
      "🚫 Keep root clean\n✅ Use subdirectories for app code",
    );
  }
  return runner.allow();
}
```

**Hooks**: `block-root-mess.js`, `enterprise-antibody.js`, `meta-project-guardian.js`

### 3. Security (`security/`)

**Purpose**: Security vulnerability detection and prevention

**For comprehensive security patterns and vulnerability examples, see [Security Anti-patterns](../../../ai/examples/anti-patterns/security/)** - provides detailed coverage of security vulnerabilities and mitigation strategies.

```javascript
// Example: security-scan.js
function securityScan(hookData, runner) {
  const vulnerabilities = PatternLibrary.findSecurityIssues(hookData.content);

  if (vulnerabilities.length > 0) {
    const report = vulnerabilities
      .map((v) => `🔴 ${v.type}\n✅ ${v.fix}`)
      .join("\n");
    return runner.block(`🔒 Security issues:\n${report}`);
  }
  return runner.allow();
}
```

**Hooks**: `security-scan.js`, `scope-limiter.js`

### 4. Architecture (`architecture/`)

**Purpose**: Architectural pattern validation

```javascript
// Example: architecture-validator.js
function validateArchitecture(hookData, runner) {
  if (FileAnalyzer.isApiRoute(hookData.file_path)) {
    return validateApiStructure(hookData, runner);
  }
  if (FileAnalyzer.isComponent(hookData.file_path)) {
    return validateComponentStructure(hookData, runner);
  }
  return runner.allow();
}
```

**Hooks**: `architecture-validator.js`, `test-location-enforcer.js`

### 5. Validation (`validation/`)

**Purpose**: Template and content validation

**For comprehensive documentation standards and template usage, see [Documentation Enforcement System](../../systems/documentation-enforcement.md)** - covers the complete template validation framework and documentation standards.

```javascript
// Example: template-integrity-validator.js
function validateTemplateIntegrity(hookData, runner) {
  if (FileAnalyzer.isTemplate(hookData.file_path)) {
    const violations = TemplateValidator.validate(hookData.content);
    if (violations.length > 0) {
      return runner.block(`📋 Template violations:\n${violations.join("\n")}`);
    }
  }
  return runner.allow();
}
```

**Hooks**: `template-integrity-validator.js`, `api-validator.js`, `validate-prisma.js`, `doc-template-enforcer.js`

### 6. Performance (`performance/`)

**Purpose**: Performance monitoring and optimization

**For detailed performance analysis and AI-assisted debugging, see [Performance Debug Prompts](../../../ai/prompts/debugging/performance.md)** - provides comprehensive performance debugging methodology and optimization strategies.

```javascript
// Example: performance-guardian.js
function performanceGuardian(hookData, runner) {
  const analysis = PerformanceAnalyzer.analyze(hookData.content);

  if (analysis.hasPerformanceIssues()) {
    const suggestions = analysis.getOptimizationSuggestions();
    return runner.block(`⚡ Performance issues:\n${suggestions.join("\n")}`);
  }
  return runner.allow();
}
```

**Hooks**: `performance-guardian.js`, `vector-db-hygiene.js`

### 7. Cleanup (`cleanup/`)

**Purpose**: Post-processing code cleanup and auto-fixing

```javascript
// Example: fix-console-logs.js (PostToolUse)
function fixConsoleLogs(hookData, runner) {
  let content = fs.readFileSync(hookData.file_path, "utf8");
  let modified = false;

  for (const [old, new_] of Object.entries(
    PatternLibrary.CONSOLE_REPLACEMENTS,
  )) {
    if (content.includes(old)) {
      content = content.replace(new RegExp(old, "g"), new_);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(hookData.file_path, content, "utf8");
    process.stdout.write(`✨ Auto-fixed console.* calls\n`);
  }
  return runner.allow();
}
```

**Hooks**: `fix-console-logs.js`, `import-janitor.js`, `docs-enforcer.js`

### 8. Local Development (`local-dev/`)

**Purpose**: Local development pattern enforcement

```javascript
// Example: mock-data-enforcer.js
function mockDataEnforcer(hookData, runner) {
  if (PatternLibrary.hasRealUserPatterns(hookData.content)) {
    return runner.block(
      "🏠 Use mock data only\n✅ Import mockUser from lib/auth.ts",
    );
  }
  return runner.allow();
}
```

**Hooks**: `mock-data-enforcer.js`, `localhost-enforcer.js`

### Hook Development Patterns

### PreToolUse Hooks (Block/Allow)

- Analyze `hookData.tool_input` before execution
- Return `runner.block(message)` or `runner.allow()`
- Focus on validation and prevention
- **15 active hooks** in production

### PostToolUse Hooks (Modify/Validate)

- Analyze `hookData.tool_output` or resulting files
- Can modify content with `runner.modify(modifications)`
- Can validate post-operation state
- **5 active hooks** for cleanup and validation

## Shared Utilities Library

Located in `tools/hooks/lib/`, these utilities achieve **85% code reduction** and provide sophisticated functionality.

### FileAnalyzer

**Purpose**: Intelligent file type detection and analysis

```javascript
const { FileAnalyzer } = require("./lib");

// File type detection
FileAnalyzer.isCode(filePath); // True for .js, .ts, .jsx, .tsx, .py, etc.
FileAnalyzer.isConfiguration(filePath); // True for .json, .yaml, .env, etc.
FileAnalyzer.isDocumentation(filePath); // True for .md, .txt, .rst, etc.
FileAnalyzer.isTemplate(filePath); // True for template files

// Directory classification
FileAnalyzer.isInTools(filePath); // True if in tools/ directory
FileAnalyzer.isInTests(filePath); // True if in __tests__/ or *.test.*
FileAnalyzer.isRootLevel(filePath); // True if in project root

// Content analysis
const analysis = FileAnalyzer.analyze(content, filePath);
// Returns: { fileType, language, complexity, imports, exports }
```

### PatternLibrary

**Purpose**: Centralized pattern repository with **700+ lines** of consolidated patterns

```javascript
const { PatternLibrary } = require("./lib");

// Security patterns
PatternLibrary.findSecurityIssues(content); // Returns array of vulnerabilities
PatternLibrary.hasXSSVulnerability(content); // Boolean check
PatternLibrary.hasSQLInjection(content); // Boolean check

// Enterprise patterns (8 categories)
PatternLibrary.hasEnterprisePattern(content); // Boolean check
PatternLibrary.getEnterpriseViolations(content); // Detailed analysis

// Console replacement patterns
PatternLibrary.CONSOLE_REPLACEMENTS = {
  "console.log": "logger.info",
  "console.error": "logger.error",
  "console.warn": "logger.warn",
};

// File naming patterns
PatternLibrary.IMPROVED_FILE_PATTERNS = [
  /_improved\./i,
  /_enhanced\./i,
  /_v2\./i,
  /_fixed\./i,
];

// Dynamic pattern testing
PatternLibrary.testCategory(content, "security"); // Test security patterns
PatternLibrary.testCategory(content, "enterprise"); // Test enterprise patterns
```

### ErrorFormatter

**Purpose**: Consistent, user-friendly error messaging

```javascript
const { ErrorFormatter } = require("./lib");

// Standard error format
const error = ErrorFormatter.create({
  title: "Security Vulnerability Detected",
  problem: "SQL injection risk in query builder",
  location: "line 42: db.query(`SELECT * FROM users WHERE id = ${userId}`)",
  suggestion:
    "Use parameterized queries: db.query('SELECT * FROM users WHERE id = ?', [userId])",
  context:
    "Raw string concatenation in SQL queries creates injection vulnerabilities",
});

// Returns formatted message:
// 🚫 Security Vulnerability Detected
//
// 📍 Found at: line 42: db.query(`SELECT * FROM users WHERE id = ${userId}`)
// 🔍 Details: Raw string concatenation in SQL queries creates injection vulnerabilities
//
// 💡 Context: Use secure database practices
// ✅ Use parameterized queries: db.query('SELECT * FROM users WHERE id = ?', [userId])
```

### PerformanceAnalyzer

**Purpose**: Execution time tracking and performance optimization

```javascript
const { PerformanceAnalyzer } = require("./lib");

// Hook performance tracking
function myHook(hookData, runner) {
  const analyzer = new PerformanceAnalyzer("my-hook");

  analyzer.start("validation");
  // ... validation logic
  analyzer.end("validation");

  analyzer.start("pattern-matching");
  // ... pattern matching
  analyzer.end("pattern-matching");

  const report = analyzer.getReport();
  // { totalTime: 45, phases: { validation: 12, 'pattern-matching': 33 } }

  return runner.allow();
}
```

### PathResolver

**Purpose**: Intelligent path resolution and normalization

```javascript
const { PathResolver } = require("./lib");

// Safe path resolution
PathResolver.resolve(filePath); // Normalized absolute path
PathResolver.isWithinProject(filePath); // Security check
PathResolver.getRelativeToProject(filePath); // Project-relative path

// Directory classification
PathResolver.getDirectoryType(filePath); // 'source' | 'test' | 'config' | 'docs'
PathResolver.getCategory(filePath); // Hook category based on path
```

### HookEnvUtils

**Purpose**: Environment variable management and bypass logic

```javascript
const { HookEnvUtils } = require("./lib");

// Environment checks
HookEnvUtils.shouldBypassHooks(); // Global bypass check
HookEnvUtils.shouldBypassHook(hookCommand); // Individual hook bypass
HookEnvUtils.getBypassReason(); // Why hooks are bypassed

// Category-specific checks
HookEnvUtils.isCategoryEnabled("ai-patterns"); // Check HOOK_AI_PATTERNS
HookEnvUtils.isCategoryEnabled("security"); // Check HOOK_SECURITY
```

### Integration Examples

**Using multiple utilities together:**

```javascript
const {
  FileAnalyzer,
  PatternLibrary,
  ErrorFormatter,
  PerformanceAnalyzer,
} = require("./lib");

function comprehensiveValidator(hookData, runner) {
  const analyzer = new PerformanceAnalyzer("comprehensive-validator");
  analyzer.start("total");

  // Quick file type check
  if (!FileAnalyzer.isCode(hookData.file_path)) {
    analyzer.end("total");
    return runner.allow();
  }

  // Security analysis
  analyzer.start("security");
  const securityIssues = PatternLibrary.findSecurityIssues(hookData.content);
  analyzer.end("security");

  if (securityIssues.length > 0) {
    const error = ErrorFormatter.create({
      title: "Security Issues Detected",
      problem: `Found ${securityIssues.length} security vulnerabilities`,
      suggestion: securityIssues
        .map((issue) => `Fix ${issue.type}: ${issue.suggestion}`)
        .join("\n"),
    });

    analyzer.end("total");
    return runner.block(error);
  }

  analyzer.end("total");
  return runner.allow();
}
```

## Advanced Configuration

### Hook Metadata & Properties

Every hook can be configured with sophisticated metadata in `hooks-config.json`:

```json
{
  "type": "command",
  "command": "node tools/hooks/security/security-scan.js",
  "timeout": 4,
  "family": "security",
  "priority": "high",
  "blockingBehavior": "soft-block",
  "description": "Scans for security vulnerabilities",
  "folder": "security"
}
```

**Configuration Properties:**

- **timeout**: Individual hook timeout (1-4 seconds recommended)
- **family**: Grouping for timeout management (`security`, `validation`, etc.)
- **priority**: Execution priority (`critical` > `high` > `medium` > `low` > `background`)
- **blockingBehavior**: Response to violations
  - `hard-block`: Immediately stop operation
  - `soft-block`: Block with detailed message
  - `warning`: Show warning but continue
  - `none`: Log only, no blocking
- **folder**: Hook category for environment controls

### Priority System

**Execution Order:**

```
1. critical (infrastructure protection)
2. high (security, validation)
3. medium (architecture, documentation)
4. low (cleanup, optimization)
5. background (metrics, logging)
```

**Priority-based Filtering:**

```javascript
// Hooks can be skipped based on context
function shouldRun(context = {}) {
  // Skip background hooks under time pressure
  if (context.timeConstraint && this.priority === "background") {
    return false;
  }

  // Skip low priority hooks if many hooks are queued
  if (context.queueSize > 10 && this.priority === "low") {
    return false;
  }

  return true;
}
```

### Family-based Timeout Management

**Timeout Families:**

- `infrastructure_protection`: 2s (critical path protection)
- `security`: 4s (comprehensive security scanning)
- `validation`: 3s (template and API validation)
- `file_hygiene`: 1s (quick file checks)
- `code_cleanup`: 3s (auto-fixing operations)
- `performance`: 2s (performance monitoring)

**Family Timeout Logic:**

```javascript
// If ANY hook in a family times out, the entire family is skipped
// This prevents cascading timeout failures
const familyTimeouts = {
  security: 8000, // Total time for all security hooks
  validation: 6000, // Total time for all validation hooks
  file_hygiene: 2000, // Total time for all file hygiene hooks
};
```

### Dynamic Configuration

**Context-aware Configuration:**

**For advanced AI development workflow integration, see [AI Configuration](../../../ai/config/README.md)** - covers AI tool configuration and context management strategies.

```javascript
// hooks-config-advanced.js
function getDynamicConfiguration(context) {
  const config = require("./hooks-config.json");

  // Adjust timeouts based on file size
  if (context.fileSize > 100000) {
    // 100KB+
    config.hooks.PreToolUse.forEach((hookGroup) => {
      hookGroup.hooks.forEach((hook) => {
        hook.timeout *= 1.5; // 50% more time for large files
      });
    });
  }

  // Skip performance hooks during CI
  if (context.isCI) {
    config.hooks.PreToolUse = config.hooks.PreToolUse.filter(
      (hookGroup) => !hookGroup.hooks.some((h) => h.family === "performance"),
    );
  }

  return config;
}
```

## Parallel Execution System

The hook system uses a sophisticated **parallel execution engine** that achieves **85% performance improvement** over sequential execution.

### Architecture Overview

```
Claude Code
    ↓
parallel-hook-executor.js (Entry Point)
    ↓
ParallelExecutor.runParallel()
    ↓
┌─────────────────────────────────────────┐
│ Priority Groups (Parallel within group) │
├─────────────────────────────────────────┤
│ 🔴 CRITICAL (2 hooks) → Block on first │
│ 🟠 HIGH     (8 hooks) → Parallel exec  │
│ 🟡 MEDIUM   (5 hooks) → Parallel exec  │
│ 🟢 LOW      (3 hooks) → Background     │
└─────────────────────────────────────────┘
    ↓
Results Aggregation & Reporting
    ↓
Claude Code Response (Block/Allow)
```

### Parallel Execution Benefits

**Performance Gains:**

- **Sequential**: 15-20 hooks × ~100ms = 1.5-2.0 seconds
- **Parallel**: 4 priority groups × ~300ms = ~1.2 seconds
- **Net improvement**: 40-50% faster execution

**Reliability Features:**

- **Fail-safe design**: Operations proceed even if hooks fail
- **Multiple fallbacks**: Parallel → Sequential → Emergency
- **Timeout management**: Per-hook and per-family timeouts
- **Priority filtering**: Skip low-priority hooks under load

### Parallel Execution Engine

**For detailed system architecture patterns, see [Architecture Documentation](../../architecture/README.md)** - covers parallel execution patterns and architectural decision-making principles.

```javascript
// ParallelExecutor core logic
class ParallelExecutor {
  async runParallel(hooks, input) {
    // Group hooks by priority
    const priorityGroups = this.groupByPriority(hooks);

    const results = [];

    // Execute each priority group in sequence
    for (const [priority, groupHooks] of priorityGroups) {
      // Execute hooks within group in parallel
      const groupResults = await Promise.allSettled(
        groupHooks.map((hook) => this.executeHook(hook, input)),
      );

      results.push(...groupResults);

      // Stop on first blocking result from critical/high priority
      const blockingResult = groupResults.find((r) => r.value?.blocked);
      if (blockingResult && ["critical", "high"].includes(priority)) {
        break;
      }
    }

    return this.mergeResults(results);
  }
}
```

### Fallback Mechanisms

**Three-tier fallback system:**

1. **Parallel Execution** (Primary)
   - All hooks run in priority groups
   - 85% performance improvement
   - Handles timeout gracefully

2. **Sequential Fallback** (Secondary)
   - Falls back if parallel execution fails
   - Runs hooks one by one
   - Still respects priority order

3. **Emergency Fallback** (Tertiary)
   - Ultimate safety net
   - Minimal hook subset (only critical)
   - Ensures system never fails completely

```javascript
try {
  // Primary: Parallel execution
  result = await this.runParallel(hooks, input);
} catch (error) {
  try {
    // Secondary: Sequential fallback
    result = await this.executeSequentialFallback(hooks, input);
  } catch (fallbackError) {
    try {
      // Tertiary: Emergency fallback
      result = await this.emergencyFallback(input);
    } catch (emergencyError) {
      // Ultimate fail-safe: Allow operation
      result = { allow: true, fallbackUsed: "emergency" };
    }
  }
}
```

### Performance Monitoring

**Built-in performance tracking:**

```javascript
// Real-time execution monitoring
const executionStats = {
  totalHooks: 15,
  successful: 13,
  blocked: 1,
  errors: 1,
  parallelEfficiency: "85%",
  byPriority: {
    critical: { count: 2, avgTime: 150, duration: 300 },
    high: { count: 8, avgTime: 180, duration: 450 },
    medium: { count: 5, avgTime: 120, duration: 200 },
  },
};
```

**Verbose execution logging:**

```bash
# Enable with HOOK_VERBOSE=true
📥 Received input: { tool_name: "Write", tool_input: {...} }
🚀 Starting parallel execution of 15 hooks
⚡ Priority group 'critical': 2 hooks, 300ms
⚡ Priority group 'high': 8 hooks, 450ms
⚡ Priority group 'medium': 5 hooks, 200ms
📊 Execution Results (950ms):
  Total hooks: 15
  Successful: 14
  Blocked: 1
  Parallel efficiency: 85%
```

## Comprehensive Testing Framework

The hook system includes a sophisticated testing infrastructure with **custom Jest matchers**, **fixture systems**, and **integration testing patterns**.

**For broader testing methodology and project-wide testing standards, see [Hook Testing Guide](07-hooks-testing.md)** - covers comprehensive testing patterns beyond individual hook development.

### Custom Jest Matchers

**Built-in matchers for hook testing:**

```javascript
const { setupHookMatchers } = require("./test-utils");

// Setup custom matchers
beforeAll(() => {
  setupHookMatchers();
});

describe("my-hook", () => {
  it("should block improved files", async () => {
    const input = { tool_input: { file_path: "test_improved.js" } };

    // Custom matchers for cleaner assertions
    await expect(input).toBeBlocked();
    await expect(input).toContainPattern("improved");
    await expect(input).toHaveExitCode(2);
  });

  it("should allow normal files", async () => {
    const input = { tool_input: { file_path: "test.js" } };

    await expect(input).toBeAllowed();
    await expect(input).toHaveExitCode(0);
  });
});
```

### Fixture Systems

**ClaudeCodeMocks for realistic testing:**

```javascript
const {
  ClaudeCodeMocks,
  PathFixtures,
  ContentFixtures,
} = require("./test-utils");

describe("security-scan hook", () => {
  it("should detect SQL injection", async () => {
    const input = ClaudeCodeMocks.createWriteOperation({
      filePath: PathFixtures.REACT_COMPONENT,
      content: ContentFixtures.SQL_INJECTION_SAMPLE,
    });

    const result = await runHook("security-scan.js", input);

    expect(result).toBeBlocked();
    expect(result.stderr).toContain("SQL injection");
  });

  it("should allow safe database queries", async () => {
    const input = ClaudeCodeMocks.createEditOperation({
      filePath: PathFixtures.API_ROUTE,
      oldString: ContentFixtures.UNSAFE_QUERY,
      newString: ContentFixtures.SAFE_PARAMETERIZED_QUERY,
    });

    await expect(input).toBeAllowed();
  });
});
```

### Test Fixtures

**PathFixtures - Comprehensive path scenarios:**

```javascript
const PathFixtures = {
  // File types
  REACT_COMPONENT: "components/Button/Button.tsx",
  API_ROUTE: "app/api/users/route.ts",
  TEST_FILE: "__tests__/Button.test.tsx",
  CONFIG_FILE: "next.config.js",

  // Problematic paths
  IMPROVED_FILE: "components/Button_improved.tsx",
  ROOT_LEVEL_COMPONENT: "Button.tsx", // Should be blocked

  // Directory patterns
  TOOLS_DIRECTORY: "tools/generator.js",
  HOOKS_DIRECTORY: "tools/hooks/my-hook.js",

  // Framework patterns
  NEXTJS_PAGE: "app/dashboard/page.tsx",
  PRISMA_SCHEMA: "prisma/schema.prisma",
};
```

**ContentFixtures - Real-world code samples:**

```javascript
const ContentFixtures = {
  // Security vulnerabilities
  SQL_INJECTION_SAMPLE: `
    const query = \`SELECT * FROM users WHERE id = \${userId}\`;
    return db.raw(query);
  `,

  XSS_VULNERABILITY: `
    element.innerHTML = userInput + '<span>welcome</span>';
  `,

  // Safe alternatives
  SAFE_PARAMETERIZED_QUERY: `
    return db.query('SELECT * FROM users WHERE id = ?', [userId]);
  `,

  // Enterprise patterns
  ENTERPRISE_AUTH: `
    import { Auth0Provider } from '@auth0/nextjs-auth0';
    // Multi-tenant authentication setup
  `,

  // AI anti-patterns
  IMPROVED_FILE_PATTERN: `
    // This is the improved version of the original component
    export default function ButtonImproved() { ... }
  `,
};
```

### Performance Testing

**Load testing hooks:**

```javascript
describe("hook performance", () => {
  it("should handle large files efficiently", async () => {
    const largeContent = "x".repeat(100000); // 100KB file
    const startTime = Date.now();

    const input = ClaudeCodeMocks.createWriteOperation({
      filePath: "large-file.js",
      content: largeContent,
    });

    await runHook("security-scan.js", input);

    const executionTime = Date.now() - startTime;
    expect(executionTime).toBeLessThan(4000); // 4 second timeout
  });

  it("should handle concurrent execution", async () => {
    const inputs = Array(10)
      .fill()
      .map((_, i) =>
        ClaudeCodeMocks.createWriteOperation({
          filePath: `test-${i}.js`,
          content: ContentFixtures.SIMPLE_COMPONENT,
        }),
      );

    const startTime = Date.now();
    const results = await Promise.all(
      inputs.map((input) => runHook("prevent-improved-files.js", input)),
    );
    const executionTime = Date.now() - startTime;

    // Parallel execution should be significantly faster than sequential
    expect(executionTime).toBeLessThan(1000); // Should complete in under 1s
    expect(results.every((r) => r.exitCode === 0)).toBe(true);
  });
});
```

### Integration Testing

**Hook chain testing:**

```javascript
describe("hook integration", () => {
  it("should execute hooks in correct priority order", async () => {
    const executionOrder = [];

    // Mock hooks to track execution order
    const mockHooks = [
      { priority: "low", name: "cleanup" },
      { priority: "critical", name: "infrastructure" },
      { priority: "high", name: "security" },
      { priority: "medium", name: "validation" },
    ];

    await runHookChain(mockHooks, testInput);

    expect(executionOrder).toEqual([
      "infrastructure",
      "security",
      "validation",
      "cleanup",
    ]);
  });

  it("should stop execution on critical hook block", async () => {
    const input = ClaudeCodeMocks.createWriteOperation({
      filePath: "src/App.tsx", // Root level file (should be blocked)
      content: ContentFixtures.REACT_COMPONENT,
    });

    const result = await runParallelExecutor(input);

    expect(result.blocked).toBe(true);
    expect(result.blockingHook).toBe("block-root-mess");
    expect(result.executedHooks).toContain("block-root-mess");
    expect(result.skippedHooks.length).toBeGreaterThan(0); // Should skip remaining hooks
  });
});
```

### Mock Scenarios

**Edge case testing:**

```javascript
describe("edge cases", () => {
  it("should handle malformed input gracefully", async () => {
    const malformedInputs = [
      {}, // Empty object
      { tool_input: {} }, // Missing required fields
      { tool_input: { file_path: null } }, // Null file path
      { malformed: "json input" }, // Wrong structure
    ];

    for (const input of malformedInputs) {
      const result = await runHook("prevent-improved-files.js", input);
      // Should not crash, should allow by default (fail-safe)
      expect(result.exitCode).toBe(0);
    }
  });

  it("should handle timeout scenarios", async () => {
    // Mock a slow hook that times out
    const slowHookResult = await runHookWithTimeout(
      "slow-mock-hook.js",
      testInput,
      1000,
    );

    expect(slowHookResult.timedOut).toBe(true);
    expect(slowHookResult.exitCode).toBe(0); // Fail-safe: allow operation
  });
});
```

### CI/CD Integration

**Continuous testing setup:**

```javascript
// jest.config.hooks.js
module.exports = {
  testMatch: ["**/tools/hooks/__tests__/**/*.test.js"],
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tools/hooks/__tests__/setup.js"],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
  testTimeout: 10000, // Allow hooks time to execute
};
```

**GitHub Actions integration:**

```yaml
# .github/workflows/hook-tests.yml
name: Hook System Tests
on: [push, pull_request]

jobs:
  test-hooks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install

      - name: Run hook unit tests
        run: npm test -- tools/hooks/__tests__/

      - name: Run hook integration tests
        run: npm run test:hooks:integration

      - name: Test parallel execution performance
        run: npm run test:hooks:performance
```

## Advanced Debugging & Troubleshooting

**For comprehensive debugging methodology and AI-assisted debugging techniques, see [AI Debug Prompts](../../../ai/prompts/debugging/)** - provides structured debugging approaches and prompt engineering for development issues.

### Multi-level Debugging System

**Environment-based Debug Controls:**

```bash
# .env configuration for debugging
HOOK_VERBOSE=true          # Detailed execution logs
HOOK_DEBUG=true           # Low-level debug output
HOOKS_DISABLED=false     # Ensure hooks are active
HOOK_PERFORMANCE_LOG=true # Performance tracking
```

**Debug Output Levels:**

```javascript
// Level 1: Basic execution tracking (HOOK_VERBOSE=true)
📥 Received input: { tool_name: "Write", tool_input: {...} }
🚀 Starting parallel execution of 15 hooks
⚡ Priority group 'critical': 2 hooks, 300ms
✅ All hooks passed successfully

// Level 2: Detailed hook execution (HOOK_DEBUG=true)
[2025-01-16T10:30:45.123Z] prevent-improved-files.js: Input: {"tool_input":{"file_path":"test.js"}}
[2025-01-16T10:30:45.125Z] prevent-improved-files.js: Decision: ALLOW, Reason: normal filename
[2025-01-16T10:30:45.127Z] security-scan.js: Input: {"tool_input":{"content":"console.log('test')"}}
[2025-01-16T10:30:45.130Z] security-scan.js: Decision: ALLOW, Reason: no vulnerabilities found

// Level 3: Performance profiling (HOOK_PERFORMANCE_LOG=true)
🔍 Hook Performance Analysis:
  prevent-improved-files.js: 2ms (pattern matching: 1ms, decision: 1ms)
  security-scan.js: 45ms (vulnerability scan: 40ms, report generation: 5ms)
  parallel-efficiency: 85% (12 hooks concurrent, 3 sequential)
```

### Troubleshooting Common Issues

**Issue 1: Hooks not executing**

```bash
# Diagnostic commands
echo '{"tool_input": {"file_path": "test_improved.js"}}' | node tools/hooks/ai-patterns/prevent-improved-files.js
# Expected: Error message if hooks are active, no output if bypassed

# Check environment status
node -e "console.log('HOOKS_DISABLED:', process.env.HOOKS_DISABLED)"
node -e "console.log('HOOK_AI_PATTERNS:', process.env.HOOK_AI_PATTERNS)"

# Solution checklist:
# 1. Check .env file exists and has correct values
# 2. Verify HOOKS_DISABLED=false (not true)
# 3. Check specific category settings (HOOK_AI_PATTERNS=true)
# 4. Restart Claude Code session to reload environment
```

**Issue 2: Parallel execution failures**

```bash
# Enable verbose logging for parallel executor
HOOK_VERBOSE=true echo '{"tool_input": {"file_path": "test.js"}}' | node tools/hooks/pre-tool-use-parallel.js

# Look for fallback indicators:
# "🔄 Attempting fallback to sequential execution..."
# "🛡️ Attempting emergency fallback executor..."

# Common causes:
# - Individual hook timeouts (increase timeout values)
# - Memory pressure (reduce concurrent hook count)
# - File system access conflicts (check file permissions)
```

**Issue 3: Hook performance degradation**

```javascript
// tools/hooks/debug/performance-profiler.js
const { PerformanceAnalyzer } = require("../lib");

function profileHookExecution() {
  const analyzer = new PerformanceAnalyzer("hook-profiler");

  analyzer.start("total-execution");

  // Profile each hook category
  const categories = ["ai-patterns", "security", "validation", "cleanup"];

  for (const category of categories) {
    analyzer.start(category);
    // ... execute hooks in category
    analyzer.end(category);
  }

  analyzer.end("total-execution");

  const report = analyzer.getDetailedReport();

  // Identify performance bottlenecks
  const slowHooks = report.phases.filter((phase) => phase.duration > 100);
  if (slowHooks.length > 0) {
    console.log("🐌 Slow hooks detected:");
    slowHooks.forEach((hook) => {
      console.log(`  ${hook.name}: ${hook.duration}ms`);
    });
  }

  return report;
}
```

### Error Tracking and Recovery

**Centralized error tracking:**

```javascript
// tools/hooks/lib/ErrorTracker.js
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.recoveryStrategies = new Map();
  }

  trackError(hookName, error, context) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      hookName,
      error: error.message,
      stack: error.stack,
      context,
      severity: this.classifyError(error),
    };

    this.errors.push(errorRecord);

    // Attempt recovery based on error type
    return this.attemptRecovery(errorRecord);
  }

  classifyError(error) {
    if (error.code === "TIMEOUT") return "low";
    if (error.message.includes("ENOENT")) return "medium";
    if (error.message.includes("Permission denied")) return "high";
    return "medium";
  }

  generateDiagnosticReport() {
    const report = {
      totalErrors: this.errors.length,
      errorsByHook: this.groupErrorsByHook(),
      errorsByType: this.groupErrorsByType(),
      trends: this.analyzeTrends(),
      recommendations: this.generateRecommendations(),
    };

    return report;
  }
}
```

## Hook Lifecycle Management

### Version Management

**Hook versioning strategy:**

```javascript
// tools/hooks/lib/HookVersion.js
const HOOK_VERSION = "3.0.0";
const SUPPORTED_VERSIONS = ["2.8.0", "2.9.0", "3.0.0"];

class HookVersionManager {
  static checkCompatibility(hookConfig) {
    const requiredVersion = hookConfig.minVersion || "2.8.0";

    if (!SUPPORTED_VERSIONS.includes(requiredVersion)) {
      throw new Error(`Hook requires unsupported version: ${requiredVersion}`);
    }

    return true;
  }

  static migrateHookConfig(oldConfig, targetVersion) {
    const migrations = {
      "2.8.0": this.migrateFrom28,
      "2.9.0": this.migrateFrom29,
      "3.0.0": this.migrateFrom30,
    };

    return migrations[targetVersion](oldConfig);
  }
}
```

**Hook configuration migration:**

```json
// hooks-config.v3.json (new format)
{
  "version": "3.0.0",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/ai-patterns/prevent-improved-files.js",
            "timeout": 1,
            "family": "file_hygiene",
            "priority": "critical",
            "blockingBehavior": "hard-block",
            "folder": "ai-patterns",
            "version": "3.0.0",
            "deprecatedIn": null,
            "replacedBy": null
          }
        ]
      }
    ]
  }
}
```

### Backward Compatibility

**Legacy hook support:**

```javascript
// tools/hooks/lib/LegacyAdapter.js
class LegacyHookAdapter {
  static adaptLegacyHook(legacyHookPath) {
    const legacyHook = require(legacyHookPath);

    // Wrap legacy hook in new HookRunner interface
    return function adaptedHook(hookData, runner) {
      try {
        // Convert new format to legacy format
        const legacyInput = this.convertToLegacyFormat(hookData);
        const legacyResult = legacyHook(legacyInput);

        // Convert legacy result to new format
        return this.convertFromLegacyFormat(legacyResult, runner);
      } catch (error) {
        runner.logWarning(
          `Legacy hook ${legacyHookPath} failed: ${error.message}`,
        );
        return runner.allow(); // Fail-safe for legacy hooks
      }
    };
  }
}
```

### Hook Deprecation Strategy

**Deprecation workflow:**

```javascript
// tools/hooks/lib/DeprecationManager.js
class DeprecationManager {
  static markDeprecated(hookName, deprecatedIn, replacedBy, removeIn) {
    const warning = [
      `⚠️  Hook '${hookName}' is deprecated as of version ${deprecatedIn}`,
      replacedBy ? `✅ Use '${replacedBy}' instead` : "",
      `🗑️  Will be removed in version ${removeIn}`,
      `📖 See migration guide: docs/hooks/migrations/${hookName}.md`,
    ]
      .filter(Boolean)
      .join("\n");

    return function deprecatedHookWrapper(originalHook) {
      return function (hookData, runner) {
        // Log deprecation warning (only once per session)
        if (!global.loggedDeprecations) global.loggedDeprecations = new Set();
        if (!global.loggedDeprecations.has(hookName)) {
          runner.logWarning(warning);
          global.loggedDeprecations.add(hookName);
        }

        // Execute original hook
        return originalHook(hookData, runner);
      };
    };
  }
}
```

### Migration Tools

**Automated migration helper:**

```javascript
// scripts/migrate-hooks.js
class HookMigrationTool {
  async migrateProject(targetVersion) {
    console.log(`🔄 Migrating hooks to version ${targetVersion}`);

    // 1. Backup current configuration
    await this.backupConfiguration();

    // 2. Analyze current hooks
    const analysis = await this.analyzeCurrentHooks();

    // 3. Generate migration plan
    const migrationPlan = this.generateMigrationPlan(analysis, targetVersion);

    // 4. Execute migration
    await this.executeMigration(migrationPlan);

    // 5. Validate migration
    const validation = await this.validateMigration();

    if (validation.success) {
      console.log("✅ Migration completed successfully");
    } else {
      console.log("❌ Migration failed:", validation.errors);
      await this.rollbackMigration();
    }
  }
}
```

## Production Considerations

**For comprehensive configuration management and deployment patterns, see [Configuration Management](../../../config/)** - covers production configuration strategies, security settings, and deployment best practices.

### Performance at Scale

**Production optimization checklist:**

```bash
# 1. Enable production mode
HOOKS_DISABLED=false
HOOKS_DISABLED=false
NODE_ENV=production

# 2. Optimize hook configuration for production
HOOK_PERFORMANCE=false      # Disable performance monitoring hooks
HOOK_VERBOSE=false         # Disable verbose logging
HOOK_DEBUG=false           # Disable debug output

# 3. Configure timeout optimization
# Reduce timeouts for production responsiveness
# Critical hooks: 1s, High: 2s, Medium: 1s, Low: 0.5s
```

**Production performance monitoring:**

```javascript
// tools/hooks/production/monitor.js
class ProductionMonitor {
  constructor() {
    this.metrics = {
      totalExecutions: 0,
      averageExecutionTime: 0,
      blockingEvents: 0,
      errorRate: 0,
      performanceThresholds: {
        warning: 2000, // 2 seconds
        critical: 5000, // 5 seconds
      },
    };
  }

  recordExecution(executionData) {
    this.metrics.totalExecutions++;
    this.updateAverageExecutionTime(executionData.duration);

    if (executionData.blocked) {
      this.metrics.blockingEvents++;
    }

    if (executionData.duration > this.metrics.performanceThresholds.critical) {
      this.alertCriticalPerformance(executionData);
    }

    // Send metrics to monitoring system
    this.sendMetrics();
  }
}
```

### Error Handling in Production

**Production error recovery:**

```javascript
// tools/hooks/production/error-handler.js
class ProductionErrorHandler {
  static handleHookError(error, hookName, context) {
    // 1. Log error for debugging
    this.logProductionError(error, hookName, context);

    // 2. Classify error severity
    const severity = this.classifyErrorSeverity(error);

    // 3. Execute recovery strategy
    switch (severity) {
      case "critical":
        // Allow operation but alert immediately
        this.sendAlert("critical", error, hookName);
        return { allow: true, error: true };

      case "high":
        // Retry once, then allow
        return this.retryWithFallback(error, hookName, context);

      case "low":
        // Silent fallback
        return { allow: true };
    }
  }
}
```

### Security Considerations

**Production security hardening:**

```bash
# 1. File system permissions
chmod 755 tools/hooks/                    # Read-execute for hooks directory
chmod 644 tools/hooks/*.js                # Read-only for hook files
chmod 600 tools/hooks/hooks-config.json   # Restricted access to configuration

# 2. Environment variable security
# Store sensitive configuration in secure environment management
# Never commit .env files with production secrets

# 3. Hook execution sandboxing
# Hooks run with limited permissions
# Cannot modify files outside project scope
# Cannot access network resources (except when explicitly allowed)
```

**Security audit checklist:**

```javascript
// tools/hooks/security/audit.js
class SecurityAuditor {
  auditHookSecurity() {
    const findings = [];

    // Check for dangerous patterns in hooks
    findings.push(...this.scanForDangerousPatterns());

    // Validate file permissions
    findings.push(...this.validateFilePermissions());

    // Check environment variable exposure
    findings.push(...this.checkEnvironmentSecurity());

    // Verify hook isolation
    findings.push(...this.verifyHookIsolation());

    return this.generateSecurityReport(findings);
  }
}
```

### Monitoring and Alerting

**Production monitoring setup:**

```javascript
// tools/hooks/production/telemetry.js
class HookTelemetry {
  static setupProductionMonitoring() {
    // 1. Performance metrics
    this.trackMetric("hook_execution_time", executionTime);
    this.trackMetric("hook_success_rate", successRate);
    this.trackMetric("hook_blocking_rate", blockingRate);

    // 2. Error tracking
    this.trackError("hook_error", error, { hookName, context });

    // 3. Business metrics
    this.trackMetric("ai_pattern_violations_prevented", count);
    this.trackMetric("security_issues_detected", count);

    // 4. System health
    this.trackMetric("parallel_executor_efficiency", efficiency);
    this.trackMetric("fallback_usage_rate", fallbackRate);
  }
}
```

## Performance Optimization

### Advanced Performance Techniques

**Pattern Compilation Optimization:**

```javascript
// Compile patterns once at module level for maximum efficiency
const COMPILED_PATTERNS = {
  security: [/pattern1/gi, /pattern2/gi, /pattern3/gi].map((p) => ({
    regex: p,
    source: p.source,
    flags: p.flags,
  })),

  enterprise: PatternLibrary.ENTERPRISE_PATTERNS.map((p) => ({
    compiled: new RegExp(p.source, p.flags),
    category: p.category,
  })),
};

// Use combined patterns for single-pass scanning
const COMBINED_SECURITY_PATTERN = new RegExp(
  COMPILED_PATTERNS.security.map((p) => `(${p.source})`).join("|"),
  "gi",
);
```

**Smart Hook Filtering:**

- **Avoid Heavy Computations**: Offload to asynchronous tasks if possible.
- **Cache Results**: Use in-memory caching for repeated lookups within a single run.
- **Benchmark Your Hook**: Use `PerformanceAnalyzer` to measure execution time.

## Additional Resources

### Related Documentation

- **[Hook Overview](01-hooks-overview.md)** - System architecture and hook inventory
- **[Hook Configuration](02-hooks-configuration.md)** - Setup and configuration guide
- **[Hook Testing](07-hooks-testing.md)** - Comprehensive testing methodology
- **[Hook Performance](08-hooks-performance.md)** - Performance analysis and optimization
- **[Architecture Documentation](../../architecture/README.md)** - System-wide architectural patterns
- **[Documentation Enforcement](../../systems/documentation-enforcement.md)** - Template and validation framework

### Development Resources

- **[AI Configuration](../../../ai/config/README.md)** - AI tool setup and integration
- **[AI Prompts Collection](../../../ai/prompts/)** - Debugging, development, and optimization prompts
- **[Security Anti-patterns](../../../ai/examples/anti-patterns/security/)** - Security vulnerability examples
- **[Configuration Management](../../../config/)** - Project-wide configuration patterns

### Quick Reference

- **[Quick Reference Guide](../../quick-reference.md)** - Essential commands and troubleshooting
- **[Documentation Commands](../../quick-reference/documentation-commands.md)** - Documentation workflow integration

## Deployment and Configuration

1. Ensure the hook script is in `tools/hooks/`.
2. Add the hook to the appropriate section in `.claude/settings.json`.
3. Set a reasonable `timeout` based on benchmarking.
4. Assign a `family` for group timeout management.
5. Set a `priority` to control execution order.
6. Restart the Claude Code session to load the new configuration.

## Implementation Patterns

### Early Exit Pattern

Exit quickly for non-applicable cases:

```javascript
function hookLogic(hookData, runner) {
  // Quick checks first
  if (!hookData.tool_input.content) {
    return runner.allow();
  }

  // Skip certain file types
  const { file_path } = hookData.tool_input;
  if (file_path.endsWith(".md") || file_path.endsWith(".json")) {
    return runner.allow();
  }

  // Then perform expensive operations
  // ...
}
```

### Pattern Detection

Using the PatternLibrary for consistent detection:

```javascript
const { PatternLibrary } = require("./lib");

function detectEnterprisePatterns(hookData, runner) {
  const { content } = hookData.tool_input;

  if (PatternLibrary.hasEnterprisePattern(content)) {
    const details = PatternLibrary.getMatchDetails(content);
    return runner.block(
      `🚫 Enterprise pattern detected: ${details.pattern}\n` +
        `✅ Use ${details.alternative} instead`,
    );
  }

  return runner.allow();
}
```

### File Type Analysis

Using FileAnalyzer for intelligent decisions:

```javascript
const { FileAnalyzer } = require("./lib");

function validateByFileType(hookData, runner) {
  const { file_path, content } = hookData.tool_input;

  // Skip non-code files
  if (!FileAnalyzer.isCode(file_path)) {
    return runner.allow();
  }

  // Apply relaxed rules for infrastructure
  if (FileAnalyzer.isInfrastructure(file_path)) {
    const threshold = NORMAL_THRESHOLD * 2;
    // Use relaxed threshold
  }

  // Normal validation for app code
  // ...
}
```

### Scoring System

For complex validation with multiple factors:

```javascript
function scoreBasedValidation(hookData, runner) {
  const { prompt, tool_input } = hookData;
  let score = 0;

  const SCORING_FACTORS = {
    hasContext: 3,
    hasRequirements: 2,
    hasReferences: 2,
    clearObjective: 3,
  };

  // Calculate score
  if (prompt.includes("@") || prompt.includes("based on")) {
    score += SCORING_FACTORS.hasContext;
  }

  // Check against threshold
  const threshold = tool_name === "Edit" ? 10 : 6;

  if (score < threshold) {
    return runner.block(
      `❌ Insufficient context (${score}/${threshold})\n` +
        `✅ Include architectural context and requirements`,
    );
  }

  return runner.allow();
}
```

### Security Scanning

Pattern-based security vulnerability detection:

```javascript
function securityScan(hookData, runner) {
  const { content = "", new_string = "" } = hookData.tool_input;
  const combinedContent = `${content} ${new_string}`;

  const issues = [];

  const SECURITY_PATTERNS = {
    xss: {
      pattern: /innerHTML\s*=.*[+`$]/gi,
      message: "XSS vulnerability",
      suggestion: "Use textContent or DOMPurify",
    },
    sqlInjection: {
      pattern: /query\s*\(\s*['"`].*\+/gi,
      message: "SQL injection risk",
      suggestion: "Use parameterized queries",
    },
  };

  for (const [type, config] of Object.entries(SECURITY_PATTERNS)) {
    if (config.pattern.test(combinedContent)) {
      issues.push({
        type,
        message: config.message,
        suggestion: config.suggestion,
      });
    }
  }

  if (issues.length > 0) {
    const report = issues
      .map((i) => `🔴 ${i.message}\n✅ ${i.suggestion}`)
      .join("\n\n");

    return runner.block(`🔒 Security issues detected:\n\n${report}`);
  }

  return runner.allow();
}
```

### PostToolUse Modification

Auto-fixing issues after operations:

```javascript
function autoFix(hookData, runner) {
  const output = hookData.tool_output;

  if (!output || !output.content) {
    return runner.allow();
  }

  let { content } = output;
  let modified = false;

  // Fix patterns
  const fixes = {
    "console.log": "logger.info",
    "console.error": "logger.error",
    "console.warn": "logger.warn",
  };

  for (const [pattern, replacement] of Object.entries(fixes)) {
    const regex = new RegExp(pattern.replace(".", "\\."), "g");
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  }

  if (modified) {
    // Add import if needed
    if (!content.includes("logger")) {
      content = `import { logger } from '@/lib/logger';\n\n${content}`;
    }

    return runner.modify({ content });
  }

  return runner.allow();
}
```

### Error Message Formatting

```javascript
function formatBlockMessage(issue) {
  return [
    `❌ ${issue.problem}`,
    "",
    issue.location && `📍 Found at: ${issue.location}`,
    issue.details && `🔍 Details: ${issue.details}`,
    "",
    `💡 ${issue.context}`,
    `✅ ${issue.suggestion}`,
  ]
    .filter(Boolean)
    .join("\n");
}
```

### Performance Patterns

```javascript
// Compile patterns once at module level
const COMPLEX_PATTERNS = [/pattern1/gi, /pattern2/gi, /pattern3/gi].map(
  (p) => ({ regex: p, source: p.source }),
);

// Combine for efficiency
const COMBINED_PATTERN = new RegExp(
  COMPLEX_PATTERNS.map((p) => p.source).join("|"),
  "gi",
);

function hookLogic(hookData, runner) {
  if (COMBINED_PATTERN.test(hookData.tool_input.content)) {
    // Detailed check to find which pattern matched
  }
}
```

### Debug Logging

```javascript
const DEBUG = process.env.HOOK_DEBUG === "true";

function debug(...args) {
  if (DEBUG) {
    console.error(
      `[${new Date().toISOString()}] ${path.basename(__filename)}:`,
      ...args,
    );
  }
}

function hookLogic(hookData, runner) {
  debug("Input:", JSON.stringify(hookData, null, 2));

  // Validation logic
  const decision = shouldBlock ? "BLOCK" : "ALLOW";
  debug("Decision:", decision, "Reason:", reason);

  return shouldBlock ? runner.block(message) : runner.allow();
}
```

```

```
