```markdown
# Claude Code Hooks Reference

**Last Updated**: 2025-07-14
**System Version**: 3.0 (Consolidated Architecture)
**Total Active Hooks**: 19 configured in `.claude/settings.json`

## Overview

This reference provides complete documentation for all 19 active Claude Code hooks in the AIPatternEnforcer system. Each hook includes purpose, configuration, input/output schemas, and practical examples.

## Table of Contents

### PreToolUse Hooks (14 total)
- [context-validator.js](#context-validator)
- [prevent-improved-files.js](#prevent-improved-files)
- [scope-limiter.js](#scope-limiter)
- [security-scan.js](#security-scan)
- [test-location-enforcer.js](#test-location-enforcer)
- [enterprise-antibody.js](#enterprise-antibody)
- [architecture-validator.js](#architecture-validator) *(Consolidated)*
- [mock-data-enforcer.js](#mock-data-enforcer)
- [localhost-enforcer.js](#localhost-enforcer)
- [vector-db-hygiene.js](#vector-db-hygiene)
- [performance-guardian.js](#performance-guardian) *(Consolidated)*
- [streaming-pattern-enforcer.js](#streaming-pattern-enforcer)
- [docs-enforcer.js](#docs-enforcer) *(Consolidated)*
- [block-root-mess.js](#block-root-mess) *(Write Only)*

### PostToolUse Hooks (5 total)
- [fix-console-logs.js](#fix-console-logs)
- [validate-prisma.js](#validate-prisma)
- [api-validator.js](#api-validator-post)
- [template-integrity-validator.js](#template-integrity-validator)
- [import-janitor.js](#import-janitor)

---

## PreToolUse Hooks

### context-validator

**File**: `tools/hooks/context-validator.js`
**Family**: validation
**Timeout**: 3s
**Priority**: high
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Validates tool parameters for quality and appropriateness to ensure high-quality AI operations.

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
  architectureContext: 3,    // References to existing patterns (@file)
  dependencyContext: 2,      // Import/package information
  problemContext: 3,         // Clear requirements
  fileReferences: 2,         // Links to related files
  integrationContext: 2      // How component fits in system
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
  "command": "node tools/hooks/context-validator.js",
  "timeout": 3,
  "family": "validation",
  "priority": "high"
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

### prevent-improved-files

**File**: `tools/hooks/prevent-improved-files.js`
**Family**: file_hygiene
**Timeout**: 1s
**Priority**: critical
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Prevents creation of duplicate files with version suffixes to maintain clean codebase organization.

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
  /_corrected\./
];
```

**Configuration**:
```json
{
  "type": "command",
  "command": "node tools/hooks/prevent-improved-files.js",
  "timeout": 1,
  "family": "file_hygiene",
  "priority": "critical"
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

---

### scope-limiter

**File**: `tools/hooks/scope-limiter.js`
**Family**: security
**Timeout**: 4s
**Priority**: high
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Limits AI operations to appropriate scope and complexity to prevent excessive requests.

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
  maxSystemConcerns: 3
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

### security-scan

**File**: `tools/hooks/security-scan.js`
**Family**: security
**Timeout**: 4s
**Priority**: high
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
  unsafeUrls: /window\.open\s*\(\s*[^'"`]/gi
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

### test-location-enforcer

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
    testLocation: 'co-located', // Component.test.tsx next to Component.tsx
  },
  apiRoutes: {
    pattern: /^(pages\/api|app\/api)/,
    testLocation: 'co-located', // [route].test.ts next to [route].ts
  },
  utilities: {
    pattern: /^(lib|utils|src\/lib)/,
    testLocation: 'co-located', // util.test.ts next to util.ts
  },
  hooks: {
    pattern: /^(hooks|src\/hooks)/,
    testLocation: 'co-located', // useHook.test.ts next to useHook.ts
  },
  integration: {
    pattern: /^tests\//,
    testLocation: 'centralized', // Top-level tests/ directory
  }
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

### enterprise-antibody

**File**: `tools/hooks/enterprise-antibody.js`
**Family**: pattern_enforcement
**Timeout**: 2s
**Priority**: medium
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Blocks enterprise features to keep projects simple and focused on local development.

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
  authentication: ['complex auth', 'multi-factor', 'session management'],
  infrastructure: ['containerization', 'multi-environment', 'staging'],
  monitoring: ['application monitoring', 'log aggregation', 'metrics'],
  security: ['compliance features', 'audit logging', 'security headers'],
  business: ['payments', 'billing', 'subscriptions', 'admin features'],
  team: ['code review', 'feature flags', 'testing frameworks']
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

---

### architecture-validator

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

### mock-data-enforcer

**File**: `tools/hooks/mock-data-enforcer.js`
**Family**: pattern_enforcement
**Timeout**: 2s
**Priority**: medium
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Enforces mock data over real authentication for local development patterns.

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

### localhost-enforcer

**File**: `tools/hooks/localhost-enforcer.js`
**Family**: pattern_enforcement
**Timeout**: 2s
**Priority**: medium
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Ensures localhost-only development patterns, blocking production URLs.

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

### vector-db-hygiene

**File**: `tools/hooks/vector-db-hygiene.js`
**Family**: data_hygiene
**Timeout**: 2s
**Priority**: medium
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Maintains vector database hygiene and performance for AI embeddings.

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

### performance-guardian

**File**: `tools/hooks/performance-guardian.js`
**Family**: performance
**Timeout**: 3s
**Priority**: high
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

### streaming-pattern-enforcer

**File**: `tools/hooks/streaming-pattern-enforcer.js`
**Family**: pattern_enforcement
**Timeout**: 2s
**Priority**: medium
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
  "command": "node tools/hooks/streaming-pattern-enforcer.js",
  "timeout": 2,
  "family": "pattern_enforcement",
  "priority": "medium"
}
```

---

### docs-enforcer

**File**: `tools/hooks/docs-enforcer.js`
**Family**: documentation
**Timeout**: 2s
**Priority**: medium
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

**Configuration**:
```json
{
  "type": "command",
  "command": "node tools/hooks/docs-enforcer.js",
  "timeout": 2,
  "family": "documentation",
  "priority": "medium"
}
```

---

### block-root-mess

**File**: `tools/hooks/block-root-mess.js`
**Family**: file_hygiene
**Timeout**: 2s
**Priority**: critical
**Triggers**: Write only

**Purpose**: Prevents application files in root directory (Write operations only).

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
  'README.md', 'LICENSE', 'CLAUDE.md', 'CONTRIBUTING.md',
  // Meta-project configuration
  'package.json', 'tsconfig.json', '.eslintrc.json',
  // CI/CD files
  '.github/', '.husky/', '.vscode/settings.json'
];

const BLOCKED_PATTERNS = [
  'app/', 'components/', 'lib/', 'pages/', 'src/',
  'next.config.js', 'tailwind.config.js'
];
```

**Configuration**:
```json
{
  "matcher": "Write",
  "hooks": [
    {
      "type": "command",
      "command": "node tools/hooks/block-root-mess.js",
      "timeout": 2,
      "family": "file_hygiene",
      "priority": "critical"
    }
  ]
}
```

---

## PostToolUse Hooks

### fix-console-logs

**File**: `tools/hooks/fix-console-logs.js`
**Family**: code_cleanup
**Timeout**: 3s
**Priority**: medium
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
  'console.log': 'logger.info',
  'console.error': 'logger.error',
  'console.warn': 'logger.warn',
  'console.debug': 'logger.debug',
  'console.info': 'logger.info'
};
```

**Auto-Adds Import**:
```javascript
// Automatically adds if not present
import { logger } from '@/lib/logger';
```

**Configuration**:
```json
{
  "type": "command",
  "command": "node tools/hooks/fix-console-logs.js",
  "timeout": 3,
  "family": "code_cleanup",
  "priority": "medium"
}
```

---

### validate-prisma

**File**: `tools/hooks/validate-prisma.js`
**Family**: validation
**Timeout**: 2s
**Priority**: medium
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Validates Prisma schema and operations for database integrity.

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
  "command": "node tools/hooks/validate-prisma.js",
  "timeout": 2,
  "family": "validation",
  "priority": "medium"
}
```

---

### api-validator-post

**File**: `tools/hooks/api-validator.js`
**Family**: validation
**Timeout**: 4s
**Priority**: high
**Triggers**: Write|Edit|MultiEdit (PostToolUse)

**Purpose**: Validates API routes and endpoints after file operations.

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
  "command": "node tools/hooks/api-validator.js",
  "timeout": 4,
  "family": "validation",
  "priority": "high"
}
```

---

### template-integrity-validator

**File**: `tools/hooks/template-integrity-validator.js`
**Family**: validation
**Timeout**: 2s
**Priority**: medium
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Validates template integrity and consistency for code generation.

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
  "command": "node tools/hooks/template-integrity-validator.js",
  "timeout": 2,
  "family": "validation",
  "priority": "medium"
}
```

---

### import-janitor

**File**: `tools/hooks/import-janitor.js`
**Family**: code_cleanup
**Timeout**: 3s
**Priority**: low
**Triggers**: Write|Edit|MultiEdit

**Purpose**: Cleans up unused imports and optimizes import statements.

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
  "command": "node tools/hooks/import-janitor.js",
  "timeout": 3,
  "family": "code_cleanup",
  "priority": "low"
}
```

---

## Hook Families and Performance

### Family-Based Timeout Management

| Family | Hooks | Timeout Range | Purpose |
|--------|-------|---------------|---------|
| `file_hygiene` | 3 | 1-2s | Critical file pattern validation |
| `security` | 2 | 4s | Security and scope checks |
| `validation` | 5 | 2-4s | Parameter and content validation |
| `architecture` | 1 | 3s | Architecture pattern validation |
| `performance` | 1 | 3s | Performance monitoring |
| `pattern_enforcement` | 4 | 2s | Development pattern enforcement |
| `documentation` | 1 | 2s | Documentation standards |
| `data_hygiene` | 1 | 2s | Database hygiene |
| `testing` | 1 | 3s | Test-related validation |
| `code_cleanup` | 2 | 3s | Post-operation cleanup |

### Performance Characteristics

- **Total execution time**: < 500ms for full hook chain
- **Concurrent execution**: Hooks run in parallel where possible
- **Fail-open architecture**: Operations proceed if hooks error
- **Family-based optimization**: Related hooks grouped for efficiency

### Exit Code Standardization

All hooks use consistent exit patterns:
- **Exit 0**: Allow operation (success)
- **Exit 2**: Block operation (failure)

Note: Uses exit code 2 instead of 1 to avoid conflicts with Claude Code's error handling.

## Testing and Validation

### Manual Testing

```bash
# Test individual hook
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/[hook-name].js

# Test with specific scenarios
echo '{"tool_name": "Edit", "tool_input": {"file_path": "/test.js", "old_string": "a", "new_string": "b"}}' | node tools/hooks/context-validator.js
```

### Automated Testing

```bash
# Run all hook tests
npm test tools/hooks/__tests__/

# Performance benchmarks
npm test tools/hooks/__tests__/performance-benchmark.test.js

# Integration tests
npm test tools/hooks/__tests__/integration.test.js
```

## Configuration Management

### Session Management

- Claude Code loads configuration once at session start
- Configuration changes require new Claude Code terminal session
- Hook modifications are not picked up in existing sessions

### Best Practices

1. **Test hooks individually** before adding to configuration
2. **Use family timeouts** rather than arbitrary values
3. **Enable debug mode** for development: `DEBUG=claude-hooks`
4. **Monitor performance** - total execution should be < 500ms
5. **Document consolidated hooks** with clear descriptions

---

For complete implementation details, see individual hook files in `tools/hooks/` and the shared utilities library in `tools/hooks/lib/`.
```
