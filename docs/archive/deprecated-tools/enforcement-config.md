# Enforcement Config Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Enforcement Levels](#enforcement-levels)
5. [Configuration System](#configuration-system)
6. [Check Categories](#check-categories)
7. [Usage Examples](#usage-examples)
8. [Output and Results](#output-and-results)
9. [Integration with Development Workflow](#integration-with-development-workflow)
10. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
11. [API and Programmatic Usage](#api-and-programmatic-usage)
12. [Development and Contributing](#development-and-contributing)

## Overview

Central enforcement configuration system that manages validation rules, enforcement levels, and blocking behavior across
all ProjectTemplate enforcement tools. Provides graduated enforcement levels from silent monitoring to full blocking,
with granular control over individual check categories.

**Tool Type**: Configuration Management System  
**Language**: JavaScript (Node.js)  
**Dependencies**: `fs`, `path`  
**Location**: `tools/enforcement/enforcement-config.js`

## Quick Start

```bash
# Check current enforcement configuration
node tools/enforcement/enforcement-config.js status

# Set enforcement level
node tools/enforcement/enforcement-config.js set-level FULL

# Enable specific check category
node tools/enforcement/enforcement-config.js enable imports

# Show configuration help
node tools/enforcement/enforcement-config.js help
```

## Installation and Setup

### Prerequisites
- Node.js 16+ required
- ProjectTemplate enforcement system
- Write permissions for config files

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # No external dependencies needed
```

### Configuration File Location
```text
.enforcement-config.json  # Main config file (created automatically)
```

## Enforcement Levels

### Level Hierarchy
```javascript
const ENFORCEMENT_LEVELS = {
  SILENT: 0,    // No enforcement, just collect metrics
  WARNING: 1,   // Show violations but don't block commits
  PARTIAL: 2,   // Block file naming only (proven reliable)
  FULL: 3       // Block all violations
};
```

### Level Descriptions

#### SILENT (Level 0)
**Purpose**: Monitoring and metrics collection only  
**Behavior**: 
- All checks run but violations don't block commits
- Metrics collected for analysis
- No visible output to users
- Used for baseline establishment

```bash
# Enable silent mode
node tools/enforcement/enforcement-config.js set-level SILENT

# All tools run but don't block or warn
npm run check:imports  # Runs but doesn't output violations
npm run check:docs     # Collects metrics silently
```

#### WARNING (Level 1) 
**Purpose**: Educational mode with visible feedback  
**Behavior**:
- All checks run and display violations
- Yellow/orange warning messages shown
- Commits proceed regardless of violations
- Helpful for team onboarding

```bash
# Enable warning mode
node tools/enforcement/enforcement-config.js set-level WARNING

# Tools show warnings but don't block
# Example output:
⚠️  Import warnings:
  src/component.tsx:5 - Use relative imports
⏩ Commit proceeding with warnings.
```

#### PARTIAL (Level 2)
**Purpose**: Proven reliable checks only  
**Behavior**:
- Only file naming violations block commits
- Other checks show warnings
- Gradual enforcement adoption
- Recommended for teams new to enforcement

```bash
# Enable partial mode (default)
node tools/enforcement/enforcement-config.js set-level PARTIAL

# File naming blocks, others warn
🚫 Commit blocked due to file naming violations.
⚠️  Import warnings (not blocking).
```

#### FULL (Level 3)
**Purpose**: Complete enforcement of all rules  
**Behavior**:
- All violations block commits
- Strict code quality enforcement
- Red error messages for all violations
- For teams with established enforcement culture

```bash
# Enable full enforcement
node tools/enforcement/enforcement-config.js set-level FULL

# All violations block commits
❌ Found import violations:
🚫 Commit blocked due to import violations.
```

## Configuration System

### Default Configuration
```javascript
const DEFAULT_CONFIG = {
  level: ENFORCEMENT_LEVELS.PARTIAL,
  checks: {
    fileNaming: {
      enabled: true,
      blockOnFailure: true,
      level: ENFORCEMENT_LEVELS.PARTIAL
    },
    imports: {
      enabled: true,
      blockOnFailure: false,
      level: ENFORCEMENT_LEVELS.WARNING
    },
    documentation: {
      enabled: true,
      blockOnFailure: false,
      level: ENFORCEMENT_LEVELS.WARNING,
      ignorePatterns: ['CHANGELOG.md', 'examples/**']
    },
    logging: {
      enabled: true,
      blockOnFailure: false,
      level: ENFORCEMENT_LEVELS.WARNING
    }
  },
  metrics: {
    enabled: true,
    trackTrends: true,
    reportingLevel: 'summary'
  },
  git: {
    respectGitignore: true,
    includeUntracked: false
  }
};
```

### Configuration Inheritance
- **Global Level**: Applies to all checks unless overridden
- **Check Level**: Individual check can have its own enforcement level
- **Dynamic Override**: Can be temporarily overridden via CLI

### Configuration Persistence
```javascript
// Configuration automatically saved to .enforcement-config.json
{
  "level": 2,
  "lastModified": "2025-07-12T10:30:00.000Z",
  "checks": {
    "fileNaming": {
      "enabled": true,
      "blockOnFailure": true
    }
  }
}
```

## Check Categories

### File Naming (fileNaming)
**Purpose**: Prevent problematic file naming patterns  
**Default Level**: PARTIAL (blocks by default)  
**Checks**: `*_improved.*`, `*_enhanced.*`, `*_v2.*`, etc.

```javascript
checks: {
  fileNaming: {
    enabled: true,
    blockOnFailure: true,
    level: ENFORCEMENT_LEVELS.PARTIAL,
    patterns: [
      "**/*_improved.*",
      "**/*_enhanced.*", 
      "**/*_v2.*"
    ]
  }
}
```

### Import Validation (imports)
**Purpose**: Enforce consistent import patterns  
**Default Level**: WARNING  
**Checks**: Relative imports, wildcard usage, circular dependencies

```javascript
checks: {
  imports: {
    enabled: true,
    blockOnFailure: false,
    level: ENFORCEMENT_LEVELS.WARNING,
    ignorePatterns: [
      'tools/**',
      'scripts/**',
      'examples/**'
    ]
  }
}
```

### Documentation Style (documentation)
**Purpose**: Maintain professional documentation standards  
**Default Level**: WARNING  
**Checks**: Banned phrases, line length, structure

```javascript
checks: {
  documentation: {
    enabled: true,
    blockOnFailure: false,
    level: ENFORCEMENT_LEVELS.WARNING,
    ignorePatterns: [
      'CHANGELOG.md',
      'examples/**',
      'node_modules/**'
    ]
  }
}
```

### Logging Compliance (logging)
**Purpose**: Enforce proper logging practices  
**Default Level**: WARNING  
**Checks**: Console usage, logging library usage

```javascript
checks: {
  logging: {
    enabled: true,
    blockOnFailure: false,
    level: ENFORCEMENT_LEVELS.WARNING,
    allowConsole: ['tools/', 'scripts/', 'test/']
  }
}
```

## Usage Examples

### Example 1: Check Current Status
```bash
node tools/enforcement/enforcement-config.js status

# Output:
📋 Enforcement Configuration Status

Global Level: PARTIAL (2)
├─ File naming: PARTIAL (blocking)
├─ Imports: WARNING (not blocking)  
├─ Documentation: WARNING (not blocking)
└─ Logging: WARNING (not blocking)

Metrics: Enabled
Git integration: Enabled
Last modified: 2025-07-12T10:30:00.000Z
```

### Example 2: Change Enforcement Level
```bash
node tools/enforcement/enforcement-config.js set-level FULL

# Output:
🔧 Setting enforcement level to FULL

✅ Configuration updated successfully
📝 All checks will now block commits on violations
💡 Team members should be notified of this change

New configuration:
├─ File naming: FULL (blocking)
├─ Imports: FULL (blocking)
├─ Documentation: FULL (blocking)
└─ Logging: FULL (blocking)
```

### Example 3: Enable/Disable Specific Checks
```bash
# Disable documentation checking temporarily
node tools/enforcement/enforcement-config.js disable documentation

# Output:
🔧 Disabling documentation checks

✅ Documentation enforcement disabled
📝 Documentation violations will not be checked
💡 Re-enable with: npm run enforcement:config enable documentation

# Re-enable with custom level
node tools/enforcement/enforcement-config.js enable documentation --level WARNING
```

### Example 4: Customize Ignore Patterns
```bash
node tools/enforcement/enforcement-config.js add-ignore documentation "docs/legacy/**"

# Output:
🔧 Adding ignore pattern to documentation checks

✅ Pattern added: docs/legacy/**
📝 Files matching this pattern will be skipped
💡 Current ignore patterns:
  - CHANGELOG.md
  - examples/**
  - docs/legacy/**
```

### Example 5: Reset to Defaults
```bash
node tools/enforcement/enforcement-config.js reset

# Output:
🔧 Resetting enforcement configuration to defaults

✅ Configuration reset successfully
📝 Enforcement level: PARTIAL
💡 All checks restored to default settings
⚠️  Custom settings have been lost
```

## Output and Results

### Status Display
```text
📋 Enforcement Configuration Status

Global Level: PARTIAL (2)
├─ File naming: PARTIAL (blocking) ✅
├─ Imports: WARNING (not blocking) ⚠️
├─ Documentation: WARNING (not blocking) ⚠️
└─ Logging: WARNING (not blocking) ⚠️

Configuration Health: ✅ Good
Last Check: 2 minutes ago
Metrics Collection: ✅ Active
```

### Level Change Confirmation
```text
🔧 Setting enforcement level to FULL

Before: PARTIAL (2) → After: FULL (3)

Changes:
  ✓ File naming: PARTIAL → FULL (was already blocking)
  ⬆ Imports: WARNING → FULL (now blocking)
  ⬆ Documentation: WARNING → FULL (now blocking)
  ⬆ Logging: WARNING → FULL (now blocking)

✅ Configuration updated successfully
⚠️  Team notification recommended
```

### Configuration Validation
```text
🔍 Validating configuration...

✅ All check categories valid
✅ Enforcement levels consistent
✅ Ignore patterns valid
⚠️  Large number of ignore patterns (5) - review recommended

Configuration Score: 8/10
```

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "enforcement:status": "node tools/enforcement/enforcement-config.js status",
    "enforcement:set-level": "node tools/enforcement/enforcement-config.js set-level",
    "enforcement:enable": "node tools/enforcement/enforcement-config.js enable",
    "enforcement:disable": "node tools/enforcement/enforcement-config.js disable",
    "enforcement:reset": "node tools/enforcement/enforcement-config.js reset"
  }
}
```

### Team Onboarding Workflow
```bash
# New team setup - start with warnings
npm run enforcement:set-level WARNING

# After team is comfortable (1-2 weeks)
npm run enforcement:set-level PARTIAL

# For mature teams with good practices
npm run enforcement:set-level FULL
```

### CI/CD Integration
```yaml
# GitHub Actions workflow
- name: Check Enforcement Configuration
  run: |
    node tools/enforcement/enforcement-config.js status
    
- name: Set Production Enforcement Level
  if: github.ref == 'refs/heads/main'
  run: |
    npm run enforcement:set-level FULL
```

### Pre-commit Hook Integration
```bash
# In .husky/pre-commit
# Load configuration for all enforcement tools
source <(node tools/enforcement/enforcement-config.js export-env)

# Run enforcement based on configuration
npm run check:all
```

### Development Environment Setup
```bash
# Local development - more lenient
npm run enforcement:set-level WARNING

# CI environment - strict
if [ "$CI" = "true" ]; then
  npm run enforcement:set-level FULL
fi
```

## Error Handling and Troubleshooting

### Common Issues

#### Configuration File Corruption
```text
Error: Invalid configuration file format
```
**Solutions**:
```bash
# Backup existing config
mv .enforcement-config.json .enforcement-config.json.backup

# Reset to defaults
npm run enforcement:reset

# Or manually fix JSON syntax
jsonlint .enforcement-config.json
```

#### Permission Errors
```text
Error: EACCES: permission denied, open '.enforcement-config.json'
```
**Solutions**:
```bash
# Fix file permissions
chmod 644 .enforcement-config.json

# Check directory permissions
ls -la .enforcement-config.json
```

#### Unknown Check Category
```text
Error: Unknown check category 'invalidCheck'
```
**Solutions**:
```bash
# List valid check categories
npm run enforcement:status

# Valid categories: fileNaming, imports, documentation, logging
npm run enforcement:enable fileNaming
```

### Debug Mode
Enable detailed logging:
```bash
# Set debug environment variable
DEBUG=enforcement-config npm run enforcement:status

# Or modify the tool temporarily
console.log('Config loaded:', config);
console.log('Check categories:', Object.keys(config.checks));
```

### Configuration Validation
```bash
# Validate current configuration
node tools/enforcement/enforcement-config.js validate

# Output:
🔍 Validating configuration...

✅ Configuration file exists
✅ Valid JSON format
✅ All required fields present
✅ Enforcement levels valid
⚠️  Custom ignore patterns detected - review recommended

Overall: Valid ✅
```

## API and Programmatic Usage

### Basic Usage
```javascript
const { loadConfig, shouldBlock, logMetrics } = require('./tools/enforcement/enforcement-config');

// Load current configuration
const config = loadConfig();
console.log('Current level:', config.level);

// Check if a category should block
const shouldBlockImports = shouldBlock('imports', config);
if (shouldBlockImports) {
  console.log('Import violations will block commits');
}

// Log metrics for a check
logMetrics('imports', violations, config);
```

### Configuration Management
```javascript
const EnforcementConfig = require('./tools/enforcement/enforcement-config');

// Create config manager
const configManager = new EnforcementConfig();

// Change enforcement level
await configManager.setLevel('FULL');

// Enable/disable checks
await configManager.enableCheck('documentation');
await configManager.disableCheck('logging');

// Add ignore patterns
await configManager.addIgnorePattern('documentation', 'legacy/**');

// Get current status
const status = configManager.getStatus();
console.log('Current configuration:', status);
```

### Custom Integration
```javascript
// Custom enforcement tool integration
function runCustomCheck(violations) {
  const config = loadConfig();
  
  // Check if this category should block
  const shouldBlockCustom = shouldBlock('custom', config);
  
  if (violations.length > 0) {
    if (shouldBlockCustom) {
      console.error('❌ Custom violations found - blocking');
      process.exit(1);
    } else {
      console.warn('⚠️  Custom violations found - warning only');
    }
  }
  
  // Log metrics
  logMetrics('custom', violations, config);
}
```

### Batch Configuration Management
```javascript
// Configure multiple projects
const projects = ['./frontend', './backend', './shared'];

for (const projectPath of projects) {
  const originalCwd = process.cwd();
  process.chdir(projectPath);
  
  try {
    const configManager = new EnforcementConfig();
    
    // Set consistent enforcement across projects
    await configManager.setLevel('PARTIAL');
    await configManager.enableCheck('fileNaming');
    await configManager.enableCheck('imports');
    
    console.log(`✅ ${projectPath} configured`);
  } finally {
    process.chdir(originalCwd);
  }
}
```

## Development and Contributing

### Project Structure
```text
tools/enforcement/enforcement-config.js
├── ENFORCEMENT_LEVELS constant definitions
├── DEFAULT_CONFIG configuration template
├── loadConfig() - Load and merge configuration
├── saveConfig() - Persist configuration changes
├── shouldBlock() - Determine blocking behavior
├── logMetrics() - Metrics collection
├── CLI interface (set-level, enable, disable, etc.)
└── Configuration validation logic
```

### Adding New Check Categories
1. **Update DEFAULT_CONFIG**:
```javascript
const DEFAULT_CONFIG = {
  checks: {
    // ... existing checks
    newCheck: {
      enabled: true,
      blockOnFailure: false,
      level: ENFORCEMENT_LEVELS.WARNING,
      customOption: 'default_value'
    }
  }
};
```

2. **Update CLI interface**:
```javascript
// Add to valid check categories
const validChecks = ['fileNaming', 'imports', 'documentation', 'logging', 'newCheck'];
```

3. **Create enforcement tool**:
```javascript
// In your new enforcement tool
const { shouldBlock, logMetrics } = require('./enforcement-config');

const config = loadConfig();
const shouldBlockNewCheck = shouldBlock('newCheck', config);
// Use shouldBlockNewCheck to determine behavior
```

### Testing Configuration Changes
```bash
# Test configuration changes
cp .enforcement-config.json .enforcement-config.json.backup

# Make changes
npm run enforcement:set-level FULL

# Test enforcement behavior
npm run check:all

# Restore if needed
mv .enforcement-config.json.backup .enforcement-config.json
```

### Optimal Practices for New Features
- **Backward Compatibility**: New features should not break existing configurations
- **Gradual Rollout**: New checks should default to WARNING level
- **Clear Documentation**: All configuration options should be documented
- **Validation**: New options should be validated on load

## Related Tools and Documentation

- **check-imports.js**: Uses enforcement-config for blocking behavior
- **documentation-style.js**: Integrates with enforcement-config
- **config-enforcer**: Configuration file validation
- **no-improved-files.js**: File naming enforcement
- **Enforcement Guide**: docs/guides/enforcement/ENFORCEMENT.md
- **Team Onboarding**: docs/guides/team/enforcement-adoption.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines