# ProjectTemplate Enforcement System

## Table of Contents

1. [Overview](#overview)
2. [Why Enforcement Exists](#why-enforcement-exists)
3. [Enforcement Rules](#enforcement-rules)
4. [Configuration Validation](#configuration-validation)
5. [Working with Enforcement](#working-with-enforcement)
6. [Common Scenarios](#common-scenarios)
7. [Fixing Violations](#fixing-violations)
8. [Enforcement Configuration](#enforcement-configuration)
9. [Claude Code Hooks Integration](#claude-code-hooks-integration)
10. [AI Integration](#ai-integration)

## Overview

The ProjectTemplate enforcement system automatically maintains code quality and project standards through:

- **Pre-commit hooks** that block non-compliant commits
- **VS Code extension** providing real-time warnings
- **Fix commands** that automatically resolve common issues
- **Documentation validation** ensuring consistent style
- **Configuration validation** maintaining correct project settings

This system supports AI-assisted development by maintaining clean, predictable project structures.

## Why Enforcement Exists

### The Problem: AI-Generated Chaos

When using AI tools like Claude or Cursor without guardrails:

```bash
# This chaos happens quickly
src/
├── UserService.ts
├── UserService_improved.ts      # AI creates duplicates
├── UserService_v2.ts           # Version proliferation  
├── UserService_enhanced.ts     # More duplicates
├── user-service-fixed.ts       # Case inconsistency
└── UserServiceFinal.ts         # Status indicators
```

### The Solution: Proactive Prevention

Enforcement prevents these issues **before** they pollute your codebase:

- **File naming rules** stop `*_improved`, `*_v2`, `*_enhanced` files
- **Root directory control** keeps structure clean
- **Documentation standards** prevent outdated status files
- **Import enforcement** maintains consistent patterns

## Enforcement Rules

### 1. File Naming Standards

**Rule**: No status suffixes in filenames

```bash
❌ BLOCKED FILES:
user-service_improved.ts
component_enhanced.tsx  
api_v2.js
auth_fixed.ts
login_final.tsx

✅ CORRECT APPROACH:
# Edit the original file
user-service.ts    # Enhanced with new features
component.tsx      # Improved implementation
api.js            # Updated functionality
```

**Rationale**: Status suffixes create file proliferation and confusion about which version is current.

### 2. Root Directory Control

**Rule**: Only specific files allowed in project root

```bash
✅ ALLOWED ROOT FILES:
README.md, LICENSE, CLAUDE.md, CONTRIBUTING.md
package.json, tsconfig.json, .env.example
vite.config.js, webpack.config.js

❌ BLOCKED ROOT FILES:
SUMMARY.md, COMPLETE.md, STATUS.md
debug-notes.txt, temp-fix.js
project-update.md, final-report.md

✅ CORRECT LOCATIONS:
docs/reports/quarterly-summary.md
docs/plans/feature-roadmap.md
scripts/debug/debug-helper.js
```

**Rationale**: Clean root directory makes projects more navigable and professional.

### 3. Documentation Standards

**Rule**: No status/completion documents

```bash
❌ BANNED DOCUMENT TYPES:
COMPLETE.md, SUMMARY.md, FINAL.md
DONE.md, FIXED.md, STATUS.md
✅-AUDIT-COMPLETE.md

✅ ACCEPTABLE ALTERNATIVES:
docs/architecture/api-patterns.md
docs/guides/testing/test-strategy.md  
docs/reports/performance-analysis.md
```

**Rationale**: Status documents become outdated quickly and don't provide ongoing value.

### 4. Code Style Consistency

**Rule**: Technical language, no superlatives

```markdown
❌ AVOID:
"This functional feature perfectly handles all cases"
"The optimal solution for optimal performance"

✅ USE:
"This feature handles edge cases through validation"
"Optimized solution providing 40% faster response times"
```

**Rationale**: Technical documentation should be measurable and timeless.

## Configuration Validation

**Configuration validation ensures project settings remain consistent and correct as development progresses.**

### Overview

The config enforcer validates:
- **JSON configurations**: `package.json`, `tsconfig.json`, `.eslintrc.json`
- **Environment files**: `.env`, `.env.example`, environment variable usage
- **JavaScript configs**: `vite.config.js`, `webpack.config.js`, build configurations  
- **YAML files**: GitHub Actions workflows, Docker Compose, CI/CD configs

### Quick Commands

```bash
# Check all configuration files
npm run check:config

# Auto-fix configuration issues  
npm run fix:config

# Preview fixes without applying
npm run fix:config:dry-run

# Check specific config type
npm run check:config -- --type=json
npm run check:config -- --type=env
```

### Validation Rules

**1. JSON Schema Validation**
```bash
✅ Valid: Proper JSON syntax, required fields present
❌ Invalid: Missing dependencies, malformed JSON, incorrect field types
```

**2. Environment Variable Consistency**  
```bash
✅ Valid: All process.env usage documented in .env.example
❌ Invalid: Undocumented environment variables in code
```

**3. Build Configuration Alignment**
```bash
✅ Valid: Vite config matches package.json scripts
❌ Invalid: TypeScript paths mismatch between tsconfig and build config
```

**4. Cross-File Dependencies**
```bash
✅ Valid: package.json dependencies align with imports
❌ Invalid: Missing dependencies for used packages
```

### Common Issues Fixed

The config enforcer automatically resolves:

- **Missing package.json fields**: Adds required metadata
- **Outdated dependencies**: Flags version mismatches  
- **Inconsistent TypeScript paths**: Aligns tsconfig with actual structure
- **Environment variable gaps**: Ensures .env.example completeness
- **Workflow file errors**: Validates GitHub Actions syntax

### Integration with Development

Configuration validation runs:
- **During Claude Code hooks**: Prevents bad configs before file operations
- **Pre-commit**: Blocks commits with configuration errors
- **CI/CD pipelines**: Validates configs in automated builds
- **Manual checks**: On-demand validation during development

### Configuration Health Dashboard

View current config status:
```bash
npm run check:config --report
```

Output includes:
- Configuration file inventory (11 files validated)
- Health scores by file type
- Performance metrics (validation time ~12ms)
- Specific violations with fix suggestions

For detailed configuration validation usage, see: [Config Enforcer Guide](./config-enforcement.md)

## Working with Enforcement

### IDE Integration (VS Code)

The ProjectTemplate VS Code extension provides real-time feedback:

1. **Install Extension**:
   ```bash
   code --install-extension extensions/projecttemplate-assistant/projecttemplate-assistant-0.1.0.vsix
   ```

2. **Real-time Warnings**: See violations as you type
3. **Quick Fixes**: Rename files with suggested alternatives
4. **Dashboard**: View project compliance status

### Pre-commit Hooks

Enforcement runs automatically on every commit:

```bash
git commit -m "Add user authentication"
# Automatically runs:
# Check for improved files
# Validate root directory
# Check banned documents
# Validate documentation style
```

### Manual Checks

Run enforcement checks anytime:

```bash
# Check all enforcement rules
npm run check:all

# Check specific rules  
npm run check:root
npm run check:banned-docs
npm run check:documentation-style
npm run check:config

# Configuration-specific checks
npm run check:config -- --type=json
npm run check:config -- --type=env
npm run fix:config
npm run fix:config:dry-run
```

## Common Scenarios

### Scenario 1: AI Creates Duplicate Files

**Problem**: Claude suggests creating `UserService_improved.ts`

**Enforcement Response**:
```bash
❌ Commit blocked: File UserService_improved.ts violates naming rules
💡 Suggestion: Edit the original UserService.ts instead
```

**Solution**:
```bash
# Don't create new file, edit existing:
# UserService_improved.ts → Edit UserService.ts directly
git rm UserService_improved.ts
# Apply changes to UserService.ts
git add UserService.ts
git commit -m "Enhance user service validation"
```

### Scenario 2: Documentation Proliferation  

**Problem**: Team creates status documents after sprints

**Enforcement Response**:
```bash
❌ Commit blocked: File SPRINT-COMPLETE.md is a banned document type
💡 Suggestion: Update README.md or create technical documentation
```

**Solution**:
```bash
# Instead of SPRINT-COMPLETE.md, update:
docs/guides/feature-implementation.md  # Technical details
README.md                             # Project overview
# Or create architectural documentation:
docs/architecture/decisions/auth-pattern.md
```

### Scenario 3: Root Directory Clutter

**Problem**: Scripts and debug files in root

**Enforcement Response**:
```bash
❌ Commit blocked: Files in root directory violate organization rules
  debug-script.js → scripts/debug/
  temp-notes.md → Delete or move to docs/notes/
```

**Solution**:
```bash
# Organize files properly:
mkdir -p scripts/debug docs/notes
mv debug-script.js scripts/debug/
mv temp-notes.md docs/notes/
git add scripts/ docs/
```

### Scenario 4: Import Inconsistencies

**Problem**: Mixed import styles across codebase

**Enforcement Response**:
```bash
❌ Import violations found:
  src/components/Button.tsx: Uses relative import '../utils' 
  Expected: '@/utils' (absolute import)
```

**Solution**:
```bash
# Fix imports consistently:
import { formatDate } from '@/utils/date';  ✅
import { formatDate } from '../utils/date'; ❌
```

## Fixing Violations

### Automated Fixes

Use fix commands for common issues:

```bash
# Fix documentation style automatically
npm run fix:docs

# Preview changes without applying
npm run fix:docs:dry-run

# Fix specific file
npm run fix:docs -- CONTRIBUTING.md
```

### Manual Fixes

For complex violations:

1. **Understand the rule**: Check this document or CLAUDE.md
2. **Apply the fix**: Follow suggested alternatives
3. **Verify compliance**: Run checks before committing

```bash
# Fix and verify workflow:
# 1. Make changes
nano src/components/UserList.tsx

# 2. Check compliance  
npm run check:all

# 3. Apply fixes if needed
npm run fix:docs

# 4. Commit when clean
git add .
git commit -m "Implement user list with filtering"
```

### Override Emergency Situations

For legitimate exceptions (rare):

```bash
# Temporarily disable enforcement (use sparingly)
git commit --no-verify -m "Emergency fix for production"

# Then fix properly in next commit:
npm run fix:docs
git add .
git commit -m "Apply proper formatting and structure"
```

## Enforcement Configuration

### Enforcement Levels

Configure enforcement strictness:

```bash
# View current settings
npm run enforcement:status

# Set enforcement level  
npm run enforcement:config set-level WARNING  # vs ERROR
npm run enforcement:config set-level STRICT   # Block everything
npm run enforcement:config set-level RELAXED  # Warnings only
```

### Custom Rules

Add project-specific rules in `.enforcement-config.json`:

```json
{
  "enforcementLevel": "ERROR",
  "customRules": {
    "bannedFilePatterns": [
      "_test_copy\\.",
      "_backup\\."
    ],
    "allowedRootFiles": [
      "CUSTOM-README.md"
    ]
  },
  "ignorePatterns": [
    "legacy/**",
    "external/**"
  ]
}
```

### Disable for Specific Paths

Ignore enforcement for specific directories:

```json
{
  "ignorePatterns": [
    "third-party/**",
    "generated/**",
    "legacy/old-code/**"
  ]
}
```

## Claude Code Hooks Integration

The ProjectTemplate enforcement system integrates directly with Claude Code through real-time hooks configured in
`.claude/settings.json`:

### Active Hooks

1. **PreToolUse Hook** - Blocks problematic file operations before they execute
2. **PostToolUse Hook** - Auto-formats files after Claude edits them  
3. **Stop Hook** - Validates project state before task completion

### What This Provides

- **Real-time prevention**: Stop bad patterns before files are created
- **Automatic cleanup**: Fix documentation style after every edit
- **Completion validation**: Ensure all changes meet standards before task ends
- **Immediate feedback**: Claude gets specific guidance when violations occur

### Hook Configuration

The `.claude/settings.json` file contains:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/enforcement/claude-hook-validator.js",
            "timeout": 10
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
            "command": "node tools/enforcement/claude-post-edit-formatter.js",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/enforcement/claude-completion-validator.js",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### How It Works

1. **Before File Operations**: `claude-hook-validator.js` checks for banned patterns
2. **After File Operations**: `claude-post-edit-formatter.js` auto-fixes style issues
3. **Before Task Completion**: `claude-completion-validator.js` runs full enforcement checks

### Example Enforcement in Action

```text
Claude: I'll create a file called UserService_improved.ts...

🚫 PreToolUse Hook: Blocks the operation
   Feedback to Claude: "Filename matches banned pattern: _improved
   Edit the original UserService.ts instead of creating duplicates"

Claude: I'll edit the existing UserService.ts file instead...

✅ PostToolUse Hook: Auto-formats the file after edit
   - Applied documentation style fixes
   - Fixed line length violations

Claude: Task complete!

🚫 Stop Hook: Blocks completion
   Feedback: "Cannot complete - 2 files need to be committed
   Review changes and commit if appropriate"
```

## AI Integration

### AI-Aware Prompting

Include enforcement context in AI prompts:

```markdown
"Create a user authentication component following ProjectTemplate patterns.
Use the component generator (npm run g:c AuthComponent) and avoid creating 
improved/enhanced file versions. Edit existing files directly."
```

### AI Tool Configuration

Configure AI tools to respect enforcement:

```json
// .vscode/settings.json
{
  "aiAssistant.contextFiles": [
    "CLAUDE.md",
    "docs/guides/enforcement/ENFORCEMENT.md"
  ],
  "aiAssistant.enforcementAware": true
}
```

### Working with AI Violations

When AI tools suggest non-compliant patterns:

1. **Recognize the pattern**: File names with status suffixes
2. **Redirect to compliance**: "Edit the original file instead"
3. **Use generators**: `npm run g:c` for new components
4. **Apply standards**: Technical language, proper structure

### Training AI Tools

Provide context about enforcement in every session:

```markdown
"Before implementing, note that this project enforces:
- No duplicate files (_improved, _v2, _enhanced suffixes)
- Clean root directory (use subdirectories)
- Technical documentation (no status/completion docs)
- Consistent imports and naming patterns"
```

## Benefits

### For Developers

- **Consistent codebase**: Every file follows the same patterns
- **Reduced cognitive load**: No guessing about naming conventions
- **Faster navigation**: Clean, predictable structure
- **Quality assurance**: Automatic prevention of common mistakes

### For Teams

- **Onboarding efficiency**: New developers understand structure immediately
- **Code review focus**: Time spent on logic, not formatting
- **Maintainability**: Long-term project health
- **AI effectiveness**: Cleaner context for better AI assistance

### For Projects

- **Professional appearance**: Clean, organized structure
- **Scalability**: Standards that work for small and large projects
- **Tool compatibility**: Better integration with IDEs and AI tools
- **Documentation quality**: Timeless, technical content

## Troubleshooting

### Common Issues

**Enforcement too strict for my project**:
```bash
npm run enforcement:config set-level WARNING
```

**Need to bypass for external dependencies**:
```json
// .enforcement-config.json
{
  "ignorePatterns": ["vendor/**", "node_modules/**"]
}
```

**VS Code extension not working**:
```bash
# Reinstall extension
code --uninstall-extension projecttemplate-assistant
code --install-extension extensions/projecttemplate-assistant/projecttemplate-assistant-0.1.0.vsix
```

**Pre-commit hooks not running**:
```bash
# Reinstall hooks
npm run setup:hooks
```

### Getting Help

- Check `npm run enforcement:status` for current configuration
- Review violation messages for specific guidance
- Refer to CLAUDE.md for comprehensive rules
- Use `npm run fix:docs:dry-run` to preview automated fixes

## Contributing to Enforcement

To improve the enforcement system:

1. **Identify gaps**: What violations are not caught?
2. **Propose rules**: Suggest new enforcement patterns
3. **Test thoroughly**: Ensure rules don't break legitimate use cases
4. **Document clearly**: Update this guide with new rules
5. **Consider automation**: Can fixes be automated?

Remember: The goal is to enable better development, not to create obstacles.
Good enforcement rules feel natural and helpful, not restrictive.