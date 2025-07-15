# Actual Hooks Reference - What Each Hook Really Does

**Last Updated**: 2025-07-15  
**Hook Scripts Count**: 15 files in `tools/hooks/`  
**Active Configuration**: 19 hooks in `.claude/settings.json`

This document provides the actual functionality of each hook based on reading the source code directly.

## 🔍 Hook Scripts Analysis

### Core Protection Hooks

#### 1. `prevent-improved-files.js`

- **Purpose**: Blocks creation of files with `_improved`, `_enhanced`, `_v2` suffixes
- **Event**: PreToolUse (Write|Edit|MultiEdit)
- **Action**: BLOCKS operation with exit code 2
- **Key Feature**: Prevents AI from creating duplicate files instead of editing originals

#### 2. `block-root-mess.js`

- **Purpose**: Prevents application files from being created in root directory
- **Event**: PreToolUse
- **Action**: BLOCKS operations that would clutter root directory
- **Key Feature**: Maintains clean project structure by enforcing subdirectory usage

#### 3. `template-integrity-validator.js`

- **Purpose**: Validates that template files maintain required structure
- **Event**: PreToolUse on template modifications
- **Action**: BLOCKS if templates would be corrupted
- **Key Feature**: Protects meta-project template integrity

### Enterprise Prevention Hooks

#### 4. `enterprise-antibody.js`

- **Purpose**: Blocks code containing enterprise/production features
- **Event**: PreToolUse (Write|Edit|MultiEdit)
- **Action**: BLOCKS on keywords like "RBAC", "OAuth", "production scaling"
- **Key Feature**: Enforces local development focus, prevents feature creep

#### 5. `mock-data-enforcer.js`

- **Purpose**: Ensures only mock data is used, no real user systems
- **Event**: PreToolUse
- **Action**: BLOCKS real authentication, payment systems
- **Key Feature**: Maintains local development safety

### AI Quality Improvement Hooks

#### 6. `context-validator.js`

- **Purpose**: Validates context efficiency and blocks wasteful operations
- **Event**: PreToolUse
- **Action**: BLOCKS single-character edits, inefficient operations
- **Key Feature**: Improves AI context usage and operation quality

#### 7. `scope-limiter.js`

- **Purpose**: Prevents scope creep in AI tasks
- **Event**: PreToolUse
- **Action**: BLOCKS operations outside current task scope
- **Key Feature**: Keeps AI focused on immediate objectives

### Auto-Fix Hooks (PostToolUse)

#### 8. `fix-console-logs.js`

- **Purpose**: Automatically converts `console.log` to `logger.info`
- **Event**: PostToolUse (Write|Edit|MultiEdit)
- **Action**: AUTO-FIXES files after AI operations
- **Key Feature**: Maintains proper logging without blocking operations

#### 9. `import-janitor.js`

- **Purpose**: Cleans up unused imports and organizes import statements
- **Event**: PostToolUse
- **Action**: AUTO-FIXES import organization
- **Key Feature**: Maintains clean code structure automatically

### Validation Hooks

#### 10. `validate-prisma.js`

- **Purpose**: Validates Prisma schema files for common mistakes
- **Event**: PostToolUse on schema.prisma
- **Action**: WARNS about issues but allows operation
- **Key Feature**: Checks for required sections, syntax issues, best practices

#### 11. `api-validator.js`

- **Purpose**: Validates API route structure and patterns
- **Event**: PreToolUse on API files
- **Action**: BLOCKS invalid API patterns
- **Key Feature**: Enforces Next.js API route conventions

#### 12. `security-scan.js`

- **Purpose**: Scans for basic security issues
- **Event**: PreToolUse
- **Action**: BLOCKS obvious security vulnerabilities
- **Key Feature**: Prevents secrets, SQL injection patterns

### Specialized Enforcement Hooks

#### 13. `localhost-enforcer.js`

- **Purpose**: Ensures all configurations point to localhost
- **Event**: PreToolUse
- **Action**: BLOCKS production URLs, external endpoints
- **Key Feature**: Maintains local development environment

#### 14. `streaming-pattern-enforcer.js`

- **Purpose**: Enforces proper streaming patterns for AI features
- **Event**: PreToolUse
- **Action**: BLOCKS improper streaming implementations
- **Key Feature**: Ensures AI streaming follows best practices

#### 15. `vector-db-hygiene.js`

- **Purpose**: Maintains vector database hygiene for AI embeddings
- **Event**: PostToolUse
- **Action**: CLEANS UP vector operations, validates embeddings
- **Key Feature**: Keeps AI vector operations efficient

## 📊 Hook Distribution Analysis

| Category                    | Count | Purpose                      |
| --------------------------- | ----- | ---------------------------- |
| **Core Protection**         | 3     | Prevent system damage        |
| **Enterprise Prevention**   | 2     | Block enterprise features    |
| **AI Quality**              | 2     | Improve AI interactions      |
| **Auto-Fix**                | 2     | Clean up after operations    |
| **Validation**              | 3     | Check patterns and structure |
| **Specialized Enforcement** | 3     | Domain-specific rules        |

## 🔄 Hook Events Mapping

### PreToolUse Hooks (BLOCKING)

- `prevent-improved-files.js` - File naming enforcement
- `block-root-mess.js` - Directory structure enforcement
- `template-integrity-validator.js` - Template protection
- `enterprise-antibody.js` - Enterprise feature blocking
- `mock-data-enforcer.js` - Real data prevention
- `context-validator.js` - Context efficiency validation
- `scope-limiter.js` - Task scope enforcement
- `api-validator.js` - API pattern validation
- `security-scan.js` - Security vulnerability prevention
- `localhost-enforcer.js` - Local development enforcement
- `streaming-pattern-enforcer.js` - AI streaming patterns

### PostToolUse Hooks (AUTO-FIXING)

- `fix-console-logs.js` - Logging statement conversion
- `import-janitor.js` - Import statement cleanup
- `validate-prisma.js` - Prisma schema validation (warnings)
- `vector-db-hygiene.js` - Vector database cleanup

## 🎯 Key Insights

1. **Fail-Safe Architecture**: Most hooks are PreToolUse (blocking) for prevention
2. **Auto-Fix Philosophy**: PostToolUse hooks improve code without blocking
3. **Local Development Focus**: Multiple hooks enforce localhost-only development
4. **AI-Specific**: Several hooks specifically improve AI tool interactions
5. **Template Protection**: Meta-project integrity is actively protected

## 📝 Configuration Reality

The actual `.claude/settings.json` likely contains 19 hook configurations that reference these 15 script files, with some scripts being used in multiple configurations (different matchers, timeouts, or events).

## 🚨 Critical Finding

**Hook Script Files**: 15 actual JavaScript files  
**Hook Configurations**: 19 entries in `.claude/settings.json`  
**Architecture**: Official Claude Code hooks calling project-specific validation scripts

This clarifies the confusion - the system uses official Claude Code hooks (19 configurations) that execute custom validation scripts (15 files), with some scripts used in multiple hook configurations.
