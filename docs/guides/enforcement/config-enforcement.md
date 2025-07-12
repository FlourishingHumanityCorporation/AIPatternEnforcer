# Configuration File Enforcement

## Overview

The ProjectTemplate configuration enforcer automatically validates and fixes configuration files across your project. It ensures consistency, prevents common errors, and maintains security best practices for configuration files.

## Supported File Types

### JSON Configuration Files
- **package.json** - Node.js package configuration
- **tsconfig.json** - TypeScript configuration
- **.eslintrc.json** - ESLint configuration
- **Other .json files** - Generic JSON validation

### Environment Files
- **.env.example** - Environment variable documentation
- **.gitignore** - Git ignore patterns
- **.aiignore** - AI tool ignore patterns

### JavaScript/TypeScript Configuration
- **vite.config.js/ts** - Vite build tool configuration
- **webpack.config.js** - Webpack build tool configuration
- **jest.config.js/ts** - Jest testing framework configuration

### YAML Configuration Files
- **GitHub Actions workflows** (.github/workflows/*.yml)
- **docker-compose.yml** - Docker composition configuration
- **Other YAML files** - Generic YAML validation

## Basic Usage

### Validation Commands

```bash
# Check all configuration files
npm run check:config

# Check quietly (for scripts)
npm run check:config:quiet

# Check as part of all enforcement rules
npm run check:all
```

### Auto-Fix Commands

```bash
# Apply automatic fixes to configuration files
npm run fix:config

# Preview fixes without applying them
npm run fix:config:dry-run
```

### Enforcement Status

```bash
# View overall enforcement configuration
npm run enforcement:status

# Enable config enforcement
npm run enforcement:config enable configFiles

# Disable config enforcement  
npm run enforcement:config disable configFiles
```

## What It Validates

### Package.json Validation
- **Required fields**: name, version, description
- **Script consistency**: Recommends standard scripts (test, lint, build)
- **Dependency issues**: Detects duplicate dependencies
- **Security**: Checks for potential secrets
- **Deprecated fields**: Identifies outdated configuration

### TypeScript Configuration
- **Compiler options**: Recommends strict mode and best practices
- **Module resolution**: Ensures proper configuration
- **Deprecated options**: Identifies outdated settings

### Environment Files
- **.env.example**: Prevents real secrets, ensures placeholders
- **.gitignore**: Validates essential patterns, removes duplicates
- **.aiignore**: Ensures AI tools ignore appropriate files

### JavaScript Config Files
- **Export patterns**: Validates proper module exports
- **Console statements**: Removes debug console.log statements
- **Framework-specific**: Vite, Webpack, Jest configuration validation

### YAML Files
- **Syntax validation**: Proper YAML structure and indentation
- **GitHub Actions**: Security best practices, required fields
- **Docker Compose**: Security checks, version validation

## Integration Features

### Real-Time Claude Integration

The config enforcer integrates directly with Claude Code through hooks:

1. **Pre-operation validation**: Blocks problematic config changes before they're made
2. **Post-operation formatting**: Automatically formats config files after edits
3. **Completion validation**: Ensures all config files are valid before task completion

Example of real-time enforcement:
```text
Claude: I'll update your package.json to add a new dependency...

🚫 Pre-hook: Duplicate dependency detected
   Fix: Remove duplicate "react" from devDependencies

Claude: I'll fix the duplicate dependency first...

✅ Post-hook: Auto-formatted package.json with consistent spacing
```

### Automated Fixes

The enforcer can automatically fix many common issues:

```bash
# Example fixes applied automatically:
✓ Formatted JSON with consistent 2-space indentation
✓ Added missing required package.json fields
✓ Removed duplicate dependencies
✓ Fixed line endings in .gitignore
✓ Added essential ignore patterns
✓ Standardized YAML indentation
```

## Configuration

### Enforcement Levels

Config enforcement supports graduated enforcement levels:

- **SILENT**: Collect metrics only, no validation
- **WARNING**: Show violations but don't block operations
- **PARTIAL**: Block critical issues only
- **FULL**: Block all violations

### File-Type Configuration

Customize enforcement for each file type:

```json
{
  "fileTypes": {
    "json": {
      "enabled": true,
      "autoFix": true,
      "rules": {
        "requireScripts": true,
        "formatJson": true,
        "validatePackageFields": true
      }
    },
    "environment": {
      "enabled": true,
      "autoFix": true,
      "rules": {
        "standardizeGitignore": true,
        "fixLineEndings": true
      }
    }
  }
}
```

### Backup and Safety

All auto-fixes include safety features:

- **Automatic backups**: Files are backed up before modifications
- **Dry-run mode**: Preview changes before applying
- **Rollback capability**: Restore from backups if needed
- **Validation**: Changes are validated after application

## Common Workflows

### New Project Setup

```bash
# 1. Check initial configuration state
npm run check:config

# 2. Apply recommended fixes
npm run fix:config

# 3. Verify all configurations are valid
npm run check:all
```

### Before Committing Changes

```bash
# Check and fix any configuration issues
npm run fix:config

# Verify enforcement compliance
npm run check:all

# Commit with confidence
git add .
git commit -m "Updated project configuration"
```

### Debugging Configuration Issues

```bash
# Check configuration with detailed output
npm run check:config

# Preview what would be fixed
npm run fix:config:dry-run

# Apply fixes incrementally
npm run fix:config

# Verify the fixes worked
npm run check:config
```

## Examples

### Example Violations and Fixes

#### Package.json Issues
```json
// Before (violations)
{
  "name": "my-project",
  "dependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "react": "^18.0.0"  // Duplicate!
  }
}

// After (auto-fixed)
{
  "name": "my-project",
  "version": "1.0.0",        // Added
  "description": "...",      // Added
  "dependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    // Duplicate removed
  }
}
```

#### Gitignore Improvements
```bash
# Before (missing patterns)
node_modules/
.env

# After (auto-fixed)
node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
dist/
build/
*.log
.DS_Store
Thumbs.db

# ProjectTemplate specific
.enforcement-metrics.json
.config-enforcer-cache/
.config-enforcer-backups/
```

#### Environment File Security
```bash
# Before (security risk)
NODE_ENV=development
API_KEY=sk_live_1234567890abcdef  # Real secret!

# After (secure)
NODE_ENV=development
API_KEY=your_api_key_here  # Placeholder
```

## Performance and Caching

The config enforcer includes performance optimizations:

- **Intelligent caching**: Avoid re-validating unchanged files
- **Incremental validation**: Only check modified configurations
- **Fast execution**: Typical validation takes <50ms
- **Parallel processing**: Multiple files validated concurrently

### Cache Management

```bash
# Clear validation cache
node tools/enforcement/config-enforcer.js clear-cache

# View cache statistics (included in validation output)
npm run check:config
# Files analyzed: 8, Cache hits: 5, Time elapsed: 15ms
```

## Troubleshooting

### Common Issues

**Config enforcer not running**:
```bash
# Check if config enforcement is enabled
npm run enforcement:status

# Enable if disabled
npm run enforcement:config enable configFiles
```

**Validation errors on valid files**:
```bash
# Check enforcement level
npm run enforcement:status

# Reduce level if too strict
npm run enforcement:config set-level WARNING
```

**Auto-fix not working**:
```bash
# Check if auto-fix is enabled for the file type
npm run check:config

# Enable auto-fix in configuration
# (Edit .config-enforcer.json)
```

**Performance issues**:
```bash
# Clear cache if stale
node tools/enforcement/config-enforcer.js clear-cache

# Check cache directory size
ls -la .config-enforcer-cache/
```

### Getting Help

- **View current status**: `npm run enforcement:status`
- **Check enforcement logs**: `.enforcement-metrics.json`
- **Review configuration**: `.config-enforcer.json` (if exists)
- **Test specific file**: Create isolated test and run validator

## Advanced Usage

### Custom Configuration

Create `.config-enforcer.json` to customize behavior:

```json
{
  "enabled": true,
  "enforcementLevel": "WARNING",
  "fileTypes": {
    "json": {
      "enabled": true,
      "autoFix": true,
      "rules": {
        "requireScripts": false,  // Disable script requirements
        "formatJson": true,
        "validatePackageFields": true
      }
    }
  },
  "backup": {
    "enabled": true,
    "retentionDays": 7
  }
}
```

### Integration with CI/CD

```yaml
# .github/workflows/config-validation.yml
name: Config Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run check:config
```

### Custom Validators

The system is extensible. See existing validators in `tools/enforcement/config-enforcer/validators/` for examples of creating custom validation logic.

## Benefits

- **Consistency**: All configuration files follow the same standards
- **Security**: Prevents secrets in configuration files
- **Quality**: Catches common configuration errors early
- **Efficiency**: Automated fixes save manual work
- **Integration**: Works seamlessly with development workflows
- **Safety**: Backup and rollback capabilities prevent data loss

The configuration enforcer is designed to enhance development productivity while maintaining high standards for configuration management.