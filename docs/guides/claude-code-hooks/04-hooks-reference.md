````markdown
# Claude Code Hooks Reference

**Last Updated**: 2025-07-16
**System Version**: 4.0 (Categorized Parallel Architecture)
**Total Active Hooks**: 41 configured in `tools/hooks/hooks-config.json`

## Overview

This reference provides complete documentation for all active Claude Code hooks in the AIPatternEnforcer system. The hook system uses parallel execution for optimal performance, with hooks organized into 9 functional categories. Each hook includes purpose, configuration, input/output schemas, and practical examples.

## Architecture Overview

### Parallel Execution System

The hook system uses parallel executors defined in `.claude/settings.json`:

- **PreToolUse**: `pre-tool-use-parallel.js` (Write|Edit|MultiEdit)
- **PreToolUse Write-only**: `pre-tool-use-write-parallel.js` (Write operations)
- **PostToolUse**: `post-tool-use-parallel.js` (Write|Edit|MultiEdit)

### Hook Categories

| Category           | Folder                | Hook Count | Purpose                                           |
| ------------------ | --------------------- | ---------- | ------------------------------------------------- |
| AI Patterns        | `ai-patterns/`        | 3          | AI development patterns and context validation    |
| Architecture       | `architecture/`       | 2          | Architectural patterns and structure validation   |
| Cleanup            | `cleanup/`            | 3          | Code cleanup and documentation standards          |
| Context            | `context/`            | 4          | Context management and validation                 |
| IDE                | `ide/`                | 4          | IDE integration and configuration                 |
| Local Dev          | `local-dev/`          | 2          | Local development patterns                        |
| Performance        | `performance/`        | 2          | Performance monitoring and optimization           |
| Project Boundaries | `project-boundaries/` | 3          | Project structure and enterprise pattern blocking |
| Prompt             | `prompt/`             | 4          | Prompt quality and validation                     |
| Security           | `security/`           | 2          | Security scanning and scope limiting              |
| Validation         | `validation/`         | 4          | Schema and template validation                    |
| Workflow           | `workflow/`           | 5          | Development workflow enforcement                  |

### Blocking Behaviors

- **hard-block**: Completely blocks the operation (exit code 2)
- **soft-block**: Blocks with warning, may allow override
- **warning**: Warns but allows operation to proceed
- **none**: Informational only, no blocking

### Write-Only Hooks

Certain hooks have additional Write-only configurations:

1. **block-root-mess.js** - Only runs on Write operations (prevents creating new files in root)
2. **test-first-enforcer.js** - Runs on all operations but has special Write handling
3. **workspace-cleaner.js** - Runs on all operations but has special Write handling

These Write operations use a separate parallel executor (`pre-tool-use-write-parallel.js`) for optimized performance when creating new files.

## Table of Contents

### PreToolUse Hooks (35 total for Write|Edit|MultiEdit)

#### AI Patterns (3)

- [context-validator.js](#context-validator)
- [prevent-improved-files.js](#prevent-improved-files)
- [streaming-pattern-enforcer.js](#streaming-pattern-enforcer)

#### Architecture (2)

- [architecture-validator.js](#architecture-validator)
- [test-location-enforcer.js](#test-location-enforcer)

#### Cleanup (1)

- [docs-enforcer.js](#docs-enforcer)

#### Context (4)

- [context-completeness-enforcer.js](#context-completeness-enforcer)
- [context-drift-detector.js](#context-drift-detector)
- [claude-md-injector.js](#claude-md-injector)
- [context-reminder.js](#context-reminder)

#### IDE (4)

- [ide-config-checker.js](#ide-config-checker)
- [shortcut-protector.js](#shortcut-protector)
- [workspace-cleaner.js](#workspace-cleaner)
- [performance-guardian.js](#ide-performance-guardian)

#### Local Dev (2)

- [mock-data-enforcer.js](#mock-data-enforcer)
- [localhost-enforcer.js](#localhost-enforcer)

#### Performance (2)

- [vector-db-hygiene.js](#vector-db-hygiene)
- [performance-guardian.js](#performance-guardian)

#### Project Boundaries (3)

- [meta-project-guardian.js](#meta-project-guardian)
- [enterprise-antibody.js](#enterprise-antibody)
- [block-root-mess.js](#block-root-mess)

#### Prompt (4)

- [prompt-quality-checker.js](#prompt-quality-checker)
- [few-shot-injector.js](#few-shot-injector)
- [prompt-improver.js](#prompt-improver)
- [operation-validator.js](#operation-validator)

#### Security (2)

- [scope-limiter.js](#scope-limiter)
- [security-scan.js](#security-scan)

#### Validation (1)

- [doc-template-enforcer.js](#doc-template-enforcer)

#### Workflow (5)

- [plan-first-enforcer.js](#plan-first-enforcer)
- [test-first-enforcer.js](#test-first-enforcer)
- [pr-scope-guardian.js](#pr-scope-guardian)
- [architecture-checker.js](#architecture-checker)
- [session-cleanup.js](#session-cleanup)

### PostToolUse Hooks (5 total)

- [fix-console-logs.js](#fix-console-logs)
- [validate-prisma.js](#validate-prisma)
- [api-validator.js](#api-validator-post)
- [template-integrity-validator.js](#template-integrity-validator)
- [import-janitor.js](#import-janitor)

---

## PreToolUse Hooks

### AI Patterns Category

#### context-validator

**File**: `tools/hooks/ai-patterns/context-validator.js`
**Family**: validation
**Timeout**: 3s
**Priority**: high
**Blocking**: soft-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Validates context efficiency and prevents pollution to ensure high-quality AI operations.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string",
    "content": "string (Write)",
    "old_string": "string (Edit)",
    "new_string": "string (Edit)",
    "edits": "array (MultiEdit)"
  },
  "prompt": "string (optional but scored)"
}
```
````

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "score": "number",
    "threshold": "number",
    "scoring_breakdown": "object"
  }
}
```

**Scoring System**:

- **Write operations**: 6 points minimum
- **Edit operations**: 10 points minimum (strict threshold)
- **MultiEdit operations**: 12 points minimum (highest threshold)

**Scoring Factors**:

```javascript
const SCORING_FACTORS = {
  architectureContext: 3, // References to existing patterns (@file)
  dependencyContext: 2, // Import/package information
  problemContext: 3, // Clear requirements
  fileReferences: 2, // Links to related files
  integrationContext: 2, // How component fits in system
};
```

**Common Blocks**:

- Single character edits (`"a"` → `"b"`)
- Root directory file operations
- Generic placeholder content
- Missing architectural context

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/ai-patterns/context-validator.js",
  "timeout": 3,
  "family": "validation",
  "priority": "high",
  "blockingBehavior": "soft-block"
}
```

**Example Block**:

```javascript
// Input with insufficient context
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/test.js",
    "old_string": "a",
    "new_string": "b"
  }
}

// Output: Blocked (-21/10 score)
{
  "status": "blocked",
  "message": "❌ Edit operation blocked: insufficient context\n✅ Provide architectural context with @file references"
}
```

---

#### prevent-improved-files

**File**: `tools/hooks/ai-patterns/prevent-improved-files.js`
**Family**: file_hygiene
**Timeout**: 1s
**Priority**: critical
**Blocking**: hard-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Prevents duplicate file creation patterns to maintain clean codebase organization.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)"
}
```

**Blocked Patterns**:

```javascript
const BLOCKED_PATTERNS = [
  /_improved\./,
  /_enhanced\./,
  /_v2\./,
  /_fixed\./,
  /_updated\./,
  /_new\./,
  /_final\./,
  /_refactored\./,
  /_better\./,
  /_optimized\./,
  /_clean\./,
  /_corrected\./,
];
```

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/ai-patterns/prevent-improved-files.js",
  "timeout": 1,
  "family": "file_hygiene",
  "priority": "critical",
  "blockingBehavior": "hard-block"
}
```

**Example Block**:

```javascript
// Input with version suffix
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "component_improved.tsx"
  }
}

// Output: Blocked
{
  "status": "blocked",
  "message": "❌ Don't create component_improved.tsx\n✅ Edit the original file instead"
}
```

#### streaming-pattern-enforcer

**File**: `tools/hooks/ai-patterns/streaming-pattern-enforcer.js`
**Family**: pattern_enforcement
**Timeout**: 2s
**Priority**: medium
**Blocking**: warning
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Enforces proper streaming patterns for AI responses and real-time data.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "content": "string (analyzed for streaming patterns)"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "streaming_patterns": "array",
    "implementation_issues": "array"
  }
}
```

**Enforced Patterns**:

- Proper streaming implementation
- Error handling for stream interruptions
- Backpressure management
- Resource cleanup

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/ai-patterns/streaming-pattern-enforcer.js",
  "timeout": 2,
  "family": "pattern_enforcement",
  "priority": "medium",
  "blockingBehavior": "warning"
}
```

---

### Architecture Category

#### architecture-validator

**File**: `tools/hooks/architecture/architecture-validator.js`
**Family**: architecture
**Timeout**: 3s
**Priority**: high
**Blocking**: soft-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Validates architectural patterns and AI integration. Consolidates 3 previous hooks.

**Consolidated Hooks**:

- `ai-integration-validator.js` - AI API usage patterns
- `architecture-drift-detector.js` - Architectural consistency
- `enforce-nextjs-structure.js` - Next.js App Router structure

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string",
    "content": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "validation_type": "ai_integration|architecture|nextjs_structure",
    "issues": "array"
  }
}
```

**Validation Categories**:

1. **AI Integration**: Proper API usage, streaming patterns, error handling
2. **Architecture**: Framework conventions, directory structure, file organization
3. **Next.js Structure**: App Router patterns, API routes, component organization

#### test-location-enforcer

**File**: `tools/hooks/architecture/test-location-enforcer.js`
**Family**: testing
**Timeout**: 3s
**Priority**: medium
**Blocking**: warning
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Enforces proper test file organization and placement according to testing conventions.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "file_type": "component|api|util|hook",
    "expected_test_location": "string",
    "test_exists": "boolean"
  }
}
```

**Test Organization Rules**:

```javascript
const TEST_PATTERNS = {
  components: {
    pattern: /^(components|src\/components)/,
    testLocation: "co-located", // Component.test.tsx next to Component.tsx
  },
  apiRoutes: {
    pattern: /^(pages\/api|app\/api)/,
    testLocation: "co-located", // [route].test.ts next to [route].ts
  },
  utilities: {
    pattern: /^(lib|utils|src\/lib)/,
    testLocation: "co-located", // util.test.ts next to util.ts
  },
  hooks: {
    pattern: /^(hooks|src\/hooks)/,
    testLocation: "co-located", // useHook.test.ts next to useHook.ts
  },
  integration: {
    pattern: /^tests\//,
    testLocation: "centralized", // Top-level tests/ directory
  },
};
```

---

### Cleanup Category

#### docs-enforcer

**File**: `tools/hooks/cleanup/docs-enforcer.js`
**Family**: documentation
**Timeout**: 2s
**Priority**: medium
**Blocking**: soft-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Enforces documentation standards and organization. Consolidates 2 previous hooks.

**Consolidated Hooks**:

- `docs-lifecycle-enforcer.js` - Documentation lifecycle management
- `docs-organization-enforcer.js` - Documentation structure enforcement

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string",
    "content": "string (if .md file)"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "doc_type": "readme|guide|api|feature",
    "organization_issues": "array",
    "lifecycle_violations": "array"
  }
}
```

**Enforcement Areas**:

1. **Single Source of Truth**: Prevents duplicate documentation
2. **Proper Placement**: Ensures docs are in correct directories
3. **Completion Pattern Blocking**: Prevents "COMPLETE.md", "FINAL.md"
4. **Structure Validation**: Template compliance checking

---

### Context Category

#### context-completeness-enforcer

**File**: `tools/hooks/context/context-completeness-enforcer.js`
**Family**: context
**Timeout**: 1s
**Priority**: critical
**Blocking**: hard-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Ensures sufficient context for AI operations.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": "object",
  "prompt": "string (analyzed for context completeness)"
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "missing_context": "array",
    "context_score": "number"
  }
}
```

#### context-drift-detector

**File**: `tools/hooks/context/context-drift-detector.js`
**Family**: context
**Timeout**: 1s
**Priority**: high
**Blocking**: soft-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Detects and blocks operations with stale context.

#### claude-md-injector

**File**: `tools/hooks/context/claude-md-injector.js`
**Family**: context
**Timeout**: 1s
**Priority**: medium
**Blocking**: none
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Auto-injects relevant CLAUDE.md sections.

#### context-reminder

**File**: `tools/hooks/context/context-reminder.js`
**Family**: context
**Timeout**: 1s
**Priority**: low
**Blocking**: none
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Reminds users to refresh context when idle.

---

### IDE Category

#### ide-config-checker

**File**: `tools/hooks/ide/ide-config-checker.js`
**Family**: ide
**Timeout**: 2s
**Priority**: low
**Blocking**: none
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Ensures AI tool configurations exist.

#### shortcut-protector

**File**: `tools/hooks/ide/shortcut-protector.js`
**Family**: ide
**Timeout**: 1s
**Priority**: high
**Blocking**: hard-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Prevents overriding critical shortcuts.

#### workspace-cleaner

**File**: `tools/hooks/ide/workspace-cleaner.js`
**Family**: ide
**Timeout**: 1s
**Priority**: medium
**Blocking**: hard-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Blocks creation of junk files.

#### ide-performance-guardian

**File**: `tools/hooks/ide/performance-guardian.js`
**Family**: ide
**Timeout**: 1s
**Priority**: medium
**Blocking**: soft-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Detects performance anti-patterns in code.

---

### Security Category

#### scope-limiter

**File**: `tools/hooks/security/scope-limiter.js`
**Family**: security
**Timeout**: 4s
**Priority**: high
**Blocking**: soft-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Enforces project scope boundaries to prevent excessive requests.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": "object",
  "prompt": "string (analyzed for scope)"
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "feature_count": "number",
    "complexity_score": "number",
    "concerns": "array"
  }
}
```

**Scope Thresholds**:

```javascript
const SCOPE_LIMITS = {
  maxFeatures: 5,
  maxComplexityScore: 7,
  maxFileCount: 10,
  maxSystemConcerns: 3,
};
```

**Detection Patterns**:

- Feature count analysis (>5 features = blocked)
- Complexity scoring based on technical terms
- Multiple unrelated system concerns
- Enterprise-scale request indicators

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/scope-limiter.js",
  "timeout": 4,
  "family": "security",
  "priority": "high"
}
```

**Example Block**:

```javascript
// Input with excessive scope
{
  "prompt": "Create comprehensive e-commerce platform with authentication, payments, analytics, notifications, admin dashboard, and mobile app"
}

// Output: Blocked
{
  "status": "blocked",
  "message": "🎯 Scope too broad for focused development\n❌ 6 features detected (limit: 5)\n✅ Break into focused tasks"
}
```

---

#### security-scan

**File**: `tools/hooks/security/security-scan.js`
**Family**: security
**Timeout**: 4s
**Priority**: high
**Blocking**: soft-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Scans for security vulnerabilities and anti-patterns in code changes.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string",
    "content": "string (Write)",
    "new_string": "string (Edit)"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (formatted security report)",
  "debug": {
    "issues_found": "array",
    "severity_counts": "object"
  }
}
```

**Security Patterns**:

```javascript
const SECURITY_PATTERNS = {
  xss: /innerHTML\s*=.*[+`$]|outerHTML\s*=.*[+`$]/gi,
  codeInjection: /eval\s*\(|Function\s*\(/gi,
  sqlInjection: /query\s*\(\s*['"`].*\+.*['"`]/gi,
  hardcodedSecrets: /api[_-]?key['"`\s]*[:=]['"`\s]*[a-zA-Z0-9]{10,}/gi,
  unsafeUrls: /window\.open\s*\(\s*[^'"`]/gi,
};
```

**Severity Levels**:

- **Critical**: Blocks operation (XSS, code injection, exposed secrets)
- **High**: Warns but allows (potential security issues)
- **Medium**: Silent logging (best practice violations)

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/security-scan.js",
  "timeout": 4,
  "family": "security",
  "priority": "high"
}
```

**Example Block**:

```javascript
// Input with XSS vulnerability
{
  "tool_input": {
    "content": "element.innerHTML = userInput;"
  }
}

// Output: Blocked
{
  "status": "blocked",
  "message": "🔒 Security issues detected:\n🔴 XSS vulnerability: innerHTML with user data\n✅ Use textContent or sanitize with DOMPurify"
}
```

---

### Project Boundaries Category

#### meta-project-guardian

**File**: `tools/hooks/project-boundaries/meta-project-guardian.js`
**Family**: infrastructure_protection
**Timeout**: 2s
**Priority**: critical
**Blocking**: hard-block
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Protects meta-project infrastructure from AI modifications.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "protected_file": "boolean",
    "protection_reason": "string"
  }
}
```

**Protected Patterns**:

- Hook system files (`tools/hooks/`)
- Core configuration files
- Critical infrastructure components

#### enterprise-antibody

**File**: `tools/hooks/test-location-enforcer.js`
**Family**: testing
**Timeout**: 3s
**Priority**: medium
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Enforces proper test file organization and placement according to testing conventions.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "file_type": "component|api|util|hook",
    "expected_test_location": "string",
    "test_exists": "boolean"
  }
}
```

**Test Organization Rules**:

```javascript
const TEST_PATTERNS = {
  components: {
    pattern: /^(components|src\/components)/,
    testLocation: "co-located", // Component.test.tsx next to Component.tsx
  },
  apiRoutes: {
    pattern: /^(pages\/api|app\/api)/,
    testLocation: "co-located", // [route].test.ts next to [route].ts
  },
  utilities: {
    pattern: /^(lib|utils|src\/lib)/,
    testLocation: "co-located", // util.test.ts next to util.ts
  },
  hooks: {
    pattern: /^(hooks|src\/hooks)/,
    testLocation: "co-located", // useHook.test.ts next to useHook.ts
  },
  integration: {
    pattern: /^tests\//,
    testLocation: "centralized", // Top-level tests/ directory
  },
};
```

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/test-location-enforcer.js",
  "timeout": 3,
  "family": "testing",
  "priority": "medium"
}
```

---

**File**: `tools/hooks/project-boundaries/enterprise-antibody.js`
**Family**: pattern_enforcement
**Timeout**: 2s
**Priority**: high
**Blocking**: warning
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Blocks enterprise feature patterns to keep projects simple and focused on local development.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "content": "string (analyzed for enterprise patterns)"
  },
  "prompt": "string (analyzed for enterprise intent)"
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "enterprise_patterns_found": "array",
    "category": "string"
  }
}
```

**Blocked Categories**:

```javascript
const ENTERPRISE_PATTERNS = {
  authentication: ["complex auth", "multi-factor", "session management"],
  infrastructure: ["containerization", "multi-environment", "staging"],
  monitoring: ["application monitoring", "log aggregation", "metrics"],
  security: ["compliance features", "audit logging", "security headers"],
  business: ["payments", "billing", "subscriptions", "admin features"],
  team: ["code review", "feature flags", "testing frameworks"],
};
```

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/enterprise-antibody.js",
  "timeout": 2,
  "family": "pattern_enforcement",
  "priority": "medium"
}
```

#### block-root-mess

**File**: `tools/hooks/project-boundaries/block-root-mess.js`
**Family**: file_hygiene
**Timeout**: 2s
**Priority**: critical
**Blocking**: hard-block
**Triggers**: Write only

**Purpose**: Prevents root directory pollution (Write operations only).

**Input Schema**:

```json
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "file_category": "allowed|blocked",
    "suggested_location": "string"
  }
}
```

**Root Directory Rules**:

```javascript
const ALLOWED_ROOT_FILES = [
  // Meta-project documentation
  "README.md",
  "LICENSE",
  "CLAUDE.md",
  "CONTRIBUTING.md",
  // Meta-project configuration
  "package.json",
  "tsconfig.json",
  ".eslintrc.json",
  // CI/CD files
  ".github/",
  ".husky/",
  ".vscode/settings.json",
];

const BLOCKED_PATTERNS = [
  "app/",
  "components/",
  "lib/",
  "pages/",
  "src/",
  "next.config.js",
  "tailwind.config.js",
];
```

---

### Local Dev Category

#### mock-data-enforcer

**File**: `tools/hooks/architecture-validator.js`
**Family**: architecture
**Timeout**: 3s
**Priority**: high
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Validates architectural patterns and AI integration. Consolidates 3 previous hooks.

**Consolidated Hooks**:

- `ai-integration-validator.js` - AI API usage patterns
- `architecture-drift-detector.js` - Architectural consistency
- `enforce-nextjs-structure.js` - Next.js App Router structure

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string",
    "content": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "validation_type": "ai_integration|architecture|nextjs_structure",
    "issues": "array"
  }
}
```

**Validation Categories**:

1. **AI Integration**: Proper API usage, streaming patterns, error handling
2. **Architecture**: Framework conventions, directory structure, file organization
3. **Next.js Structure**: App Router patterns, API routes, component organization

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/architecture-validator.js",
  "timeout": 3,
  "family": "architecture",
  "priority": "high"
}
```

---

**File**: `tools/hooks/local-dev/mock-data-enforcer.js`
**Family**: pattern_enforcement
**Timeout**: 2s
**Priority**: medium
**Blocking**: warning
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Enforces mock data usage patterns for local development.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "content": "string (analyzed for auth patterns)"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "auth_patterns_found": "array",
    "suggested_mock": "string"
  }
}
```

**Enforced Patterns**:

- Use `mockUser` from `lib/auth.ts`
- Avoid real authentication providers
- Use local development patterns only
- Prefer simplified auth flows

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/mock-data-enforcer.js",
  "timeout": 2,
  "family": "pattern_enforcement",
  "priority": "medium"
}
```

---

#### localhost-enforcer

**File**: `tools/hooks/local-dev/localhost-enforcer.js`
**Family**: pattern_enforcement
**Timeout**: 2s
**Priority**: medium
**Blocking**: warning
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Enforces local development patterns, blocking production URLs.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "content": "string (analyzed for URLs)"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "external_urls_found": "array",
    "localhost_alternatives": "array"
  }
}
```

**Blocked Patterns**:

- Production URLs in code
- External service integrations
- Non-localhost API endpoints
- Production deployment configurations

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/localhost-enforcer.js",
  "timeout": 2,
  "family": "pattern_enforcement",
  "priority": "medium"
}
```

---

### Performance Category

#### vector-db-hygiene

**File**: `tools/hooks/performance/vector-db-hygiene.js`
**Family**: data_hygiene
**Timeout**: 2s
**Priority**: medium
**Blocking**: warning
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Maintains vector database hygiene for AI embeddings.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "content": "string (analyzed for vector DB operations)"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "vector_operations": "array",
    "hygiene_issues": "array"
  }
}
```

**Validation Areas**:

- Vector database schema integrity
- Embedding dimension consistency
- Query optimization patterns
- Index management

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/vector-db-hygiene.js",
  "timeout": 2,
  "family": "data_hygiene",
  "priority": "medium"
}
```

---

#### performance-guardian

**File**: `tools/hooks/performance/performance-guardian.js`
**Family**: performance
**Timeout**: 3s
**Priority**: high
**Blocking**: warning
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Comprehensive performance monitoring and optimization. Consolidates 5 previous hooks.

**Consolidated Hooks**:

- `performance-checker.js` - Algorithm complexity analysis
- `performance-budget-keeper.js` - Bundle size monitoring
- `context-economy-guardian.js` - Context window optimization
- `token-economics-guardian.js` - AI token usage monitoring
- `code-bloat-detector.js` - Code bloat prevention

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string",
    "content": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "performance_metrics": {
      "complexity_score": "number",
      "bundle_impact": "number",
      "token_cost": "number",
      "bloat_indicators": "array"
    }
  }
}
```

**Monitoring Areas**:

1. **Algorithm Complexity**: O(n²) detection, nested loops
2. **Bundle Size**: Import costs, dependency analysis
3. **Context Economy**: AI context window optimization
4. **Token Economics**: AI token usage and costs
5. **Code Bloat**: Redundant code, over-engineering

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/performance-guardian.js",
  "timeout": 3,
  "family": "performance",
  "priority": "high"
}
```

---

## PostToolUse Hooks

### fix-console-logs

**File**: `tools/hooks/cleanup/fix-console-logs.js`
**Family**: code_cleanup
**Timeout**: 3s
**Priority**: low
**Blocking**: none
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Auto-converts console.log to proper logger calls for production readiness.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string",
    "content": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "modified|unchanged",
  "modifications": "array (if modified)",
  "debug": {
    "conversions_made": "number",
    "patterns_found": "array"
  }
}
```

**Conversion Patterns**:

```javascript
const CONVERSIONS = {
  "console.log": "logger.info",
  "console.error": "logger.error",
  "console.warn": "logger.warn",
  "console.debug": "logger.debug",
  "console.info": "logger.info",
};
```

**Auto-Adds Import**:

```javascript
// Automatically adds if not present
import { logger } from "@/lib/logger";
```

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/cleanup/fix-console-logs.js",
  "timeout": 3,
  "family": "code_cleanup",
  "priority": "low",
  "blockingBehavior": "none"
}
```

---

### validate-prisma

**File**: `tools/hooks/validation/validate-prisma.js`
**Family**: validation
**Timeout**: 2s
**Priority**: medium
**Blocking**: warning
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Validates Prisma schema changes.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string (if .prisma file)",
    "content": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "schema_issues": "array",
    "migration_needed": "boolean",
    "optimization_suggestions": "array"
  }
}
```

**Validation Areas**:

- Schema syntax and structure
- Migration consistency
- Query optimization opportunities
- Index recommendations

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/validation/validate-prisma.js",
  "timeout": 2,
  "family": "validation",
  "priority": "medium",
  "blockingBehavior": "warning"
}
```

---

### api-validator-post

**File**: `tools/hooks/validation/api-validator.js`
**Family**: validation
**Timeout**: 4s
**Priority**: high
**Blocking**: soft-block
**Triggers**: Write|Edit|MultiEdit (PostToolUse)

**Purpose**: Validates API patterns and structure after file operations.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string",
    "content": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "api_endpoints": "array",
    "validation_results": "object",
    "missing_handlers": "array"
  }
}
```

**Validation Areas**:

- API route structure and naming
- HTTP method handling
- Error response consistency
- Security header implementation

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/validation/api-validator.js",
  "timeout": 4,
  "family": "validation",
  "priority": "high",
  "blockingBehavior": "soft-block"
}
```

---

### template-integrity-validator

**File**: `tools/hooks/validation/template-integrity-validator.js`
**Family**: validation
**Timeout**: 2s
**Priority**: medium
**Blocking**: warning
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Validates template integrity for code generation.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string (if template file)",
    "content": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "ok|blocked",
  "message": "string (if blocked)",
  "debug": {
    "template_type": "component|page|api|hook",
    "integrity_issues": "array",
    "consistency_checks": "object"
  }
}
```

**Validation Areas**:

- Template structure and format
- Variable placeholder consistency
- Generator compatibility
- Template metadata validation

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/validation/template-integrity-validator.js",
  "timeout": 2,
  "family": "validation",
  "priority": "medium",
  "blockingBehavior": "warning"
}
```

---

### import-janitor

**File**: `tools/hooks/cleanup/import-janitor.js`
**Family**: code_cleanup
**Timeout**: 3s
**Priority**: low
**Blocking**: none
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Cleans up unused imports.

**Input Schema**:

```json
{
  "tool_name": "Write|Edit|MultiEdit",
  "tool_input": {
    "file_path": "string",
    "content": "string"
  }
}
```

**Output Schema**:

```json
{
  "status": "modified|unchanged",
  "modifications": "array (if modified)",
  "debug": {
    "removed_imports": "array",
    "sorted_imports": "boolean",
    "optimized_paths": "array"
  }
}
```

**Cleanup Operations**:

1. **Remove Unused Imports**: Analyzes code usage and removes unused imports
2. **Sort Import Statements**: Organizes imports by type and alphabetically
3. **Optimize Import Paths**: Converts relative to absolute paths where beneficial
4. **Consolidate Imports**: Combines multiple imports from same module

**Configuration**:

```json
{
  "type": "command",
  "command": "node tools/hooks/cleanup/import-janitor.js",
  "timeout": 3,
  "family": "code_cleanup",
  "priority": "low",
  "blockingBehavior": "none"
}
```

---

## Hook Families and Performance

### Category Distribution

| Category           | Folder                | PreToolUse | PostToolUse | Total  |
| ------------------ | --------------------- | ---------- | ----------- | ------ |
| AI Patterns        | `ai-patterns/`        | 3          | 0           | 3      |
| Architecture       | `architecture/`       | 2          | 0           | 2      |
| Cleanup            | `cleanup/`            | 1          | 2           | 3      |
| Context            | `context/`            | 4          | 0           | 4      |
| IDE                | `ide/`                | 4          | 0           | 4      |
| Local Dev          | `local-dev/`          | 2          | 0           | 2      |
| Performance        | `performance/`        | 2          | 0           | 2      |
| Project Boundaries | `project-boundaries/` | 3          | 0           | 3      |
| Prompt             | `prompt/`             | 4          | 0           | 4      |
| Security           | `security/`           | 2          | 0           | 2      |
| Validation         | `validation/`         | 1          | 3           | 4      |
| Workflow           | `workflow/`           | 5          | 0           | 5      |
| **TOTAL**          |                       | **35**     | **5**       | **40** |

_Note: Total unique hooks is 41 because block-root-mess.js is Write-only_

### Family-Based Timeout Management

| Family                      | Hooks | Timeout Range | Purpose                          |
| --------------------------- | ----- | ------------- | -------------------------------- |
| `file_hygiene`              | 2     | 1-2s          | Critical file pattern validation |
| `security`                  | 2     | 4s            | Security and scope checks        |
| `validation`                | 5     | 2-4s          | Parameter and content validation |
| `architecture`              | 2     | 3s            | Architecture pattern validation  |
| `performance`               | 2     | 1-3s          | Performance monitoring           |
| `pattern_enforcement`       | 6     | 1-2s          | Development pattern enforcement  |
| `documentation`             | 2     | 2-3s          | Documentation standards          |
| `data_hygiene`              | 1     | 2s            | Database hygiene                 |
| `testing`                   | 1     | 3s            | Test-related validation          |
| `code_cleanup`              | 2     | 3s            | Post-operation cleanup           |
| `context`                   | 4     | 1s            | Context management               |
| `workflow`                  | 5     | 1-2s          | Workflow enforcement             |
| `prompt`                    | 4     | 1s            | Prompt quality management        |
| `ide`                       | 4     | 1-2s          | IDE integration                  |
| `infrastructure_protection` | 1     | 2s            | Meta-project protection          |

### Performance Characteristics

- **Total execution time**: < 5s for full hook chain (parallel execution)
- **Concurrent execution**: All hooks run in parallel via three executors:
  - `pre-tool-use-parallel.js` - All PreToolUse hooks for Write|Edit|MultiEdit
  - `pre-tool-use-write-parallel.js` - Write-only PreToolUse hooks
  - `post-tool-use-parallel.js` - All PostToolUse hooks
- **Fail-open architecture**: Operations proceed if hooks error or timeout
- **Family-based optimization**: Related hooks grouped for efficiency
- **Folder-based control**: Granular enable/disable via environment variables
- **Parallel fallback**: Automatic sequential execution if parallel fails

### Exit Code Standardization

All hooks use consistent exit patterns:

- **Exit 0**: Allow operation (success)
- **Exit 2**: Block operation (failure)

Note: Uses exit code 2 instead of 1 to avoid conflicts with Claude Code's error handling.

## Testing and Validation

### Manual Testing

```bash
# Test individual hook
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/[category]/[hook-name].js

# Test with specific scenarios
echo '{"tool_name": "Edit", "tool_input": {"file_path": "/test.js", "old_string": "a", "new_string": "b"}}' | node tools/hooks/ai-patterns/context-validator.js

# Test parallel executor
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/pre-tool-use-parallel.js

# Test with verbose output
HOOK_VERBOSE=true echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js"}}' | node tools/hooks/pre-tool-use-parallel.js
```

### Automated Testing

```bash
# Run all hook tests
npm test tools/hooks/__tests__/

# Run tests for specific category
npm test tools/hooks/ai-patterns/__tests__/
npm test tools/hooks/security/__tests__/
npm test tools/hooks/project-boundaries/__tests__/

# Test folder control functionality
npm test tools/hooks/__tests__/folder-control.test.js

# Test parallel execution
npm test tools/hooks/engine/__tests__/parallel-executor.test.js
```

### Environment Variable Control

```bash
# Global controls (override all folder controls)
export HOOK_DEVELOPMENT=false  # Enable all hooks
export HOOK_TESTING=false      # Enable all hooks

# Folder-specific controls (only apply when global controls are false)
export HOOK_AI_PATTERNS=true/false       # ai-patterns/ hooks
export HOOK_ARCHITECTURE=true/false      # architecture/ hooks
export HOOK_CLEANUP=true/false           # cleanup/ hooks
export HOOK_CONTEXT=true/false           # context/ hooks
export HOOK_IDE=true/false               # ide/ hooks
export HOOK_LOCAL_DEV=true/false         # local-dev/ hooks
export HOOK_PERFORMANCE=true/false       # performance/ hooks
export HOOK_PROJECT_BOUNDARIES=true/false # project-boundaries/ hooks
export HOOK_PROMPT=true/false            # prompt/ hooks
export HOOK_SECURITY=true/false          # security/ hooks
export HOOK_VALIDATION=true/false        # validation/ hooks
export HOOK_WORKFLOW=true/false          # workflow/ hooks

# Debug output
export HOOK_VERBOSE=true  # Enable detailed debug logging
```

### Control Priority

1. **Global Override**: `HOOK_DEVELOPMENT=true` or `HOOK_TESTING=true` bypasses all hooks
2. **Folder Control**: `HOOK_[FOLDER]=false` bypasses only that folder's hooks
3. **Default**: All hooks run when controls are false/unset

## Configuration Management

### Hook Configuration Structure

1. **`.claude/settings.json`**: Defines parallel executors
2. **`tools/hooks/hooks-config.json`**: Complete hook definitions
3. **Environment Variables**: Runtime control via `.env` file

### Session Management

- Claude Code loads `.claude/settings.json` once at session start
- Hook configuration (`hooks-config.json`) is read dynamically
- Environment variable changes take effect immediately
- New hooks require Claude Code session restart

### Best Practices

1. **Test hooks individually** before adding to configuration
2. **Use category folders** for organization and control
3. **Set appropriate blocking behaviors**:
   - `hard-block`: Critical violations only
   - `soft-block`: Important but overridable
   - `warning`: Advisory only
   - `none`: Informational/cleanup
4. **Enable verbose mode** for debugging: `HOOK_VERBOSE=true`
5. **Monitor performance** - parallel execution target < 5s
6. **Document hook purpose** clearly in description field
7. **Use folder controls** for flexible development workflows

---

## Additional Resources

### Hook Development

- **Development Guide**: `docs/guides/claude-code-hooks/05-hooks-development.md`
- **Base Classes**: `tools/hooks/lib/HookRunner.js`
- **Shared Utilities**: `tools/hooks/lib/shared-utils.js`
- **Category READMEs**: `tools/hooks/[category]/README.md`

### System Components

- **Parallel Executor**: `tools/hooks/engine/parallel-executor.js`
- **Fallback System**: `tools/hooks/fallback-executor.js`
- **Configuration**: `tools/hooks/hooks-config.json`
- **Environment Utils**: `tools/hooks/lib/hook-env-utils.js`

### Testing Resources

- **Test Helpers**: `tools/hooks/[category]/__tests__/test-helpers.js`
- **Integration Tests**: `tools/hooks/__tests__/folder-control.test.js`
- **Performance Tests**: `tools/hooks/engine/__tests__/parallel-executor.test.js`

For complete implementation details, see individual hook files in their respective category folders.

```

```
