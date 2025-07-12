# Config Enforcer Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Core Architecture](#core-architecture)
5. [Configuration System](#configuration-system)
6. [Validator System](#validator-system)
7. [Usage Examples](#usage-examples)
8. [Cache and Performance](#cache-and-performance)
9. [Backup Management](#backup-management)
10. [Integration with Development Workflow](#integration-with-development-workflow)
11. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
12. [API and Programmatic Usage](#api-and-programmatic-usage)
13. [Development and Contributing](#development-and-contributing)

## Overview

Advanced configuration file validation and enforcement framework that ensures project configuration files follow
established patterns and optimal practices. Provides extensible validator system, intelligent caching, automatic backup
management, and comprehensive reporting.

**Tool Type**: Configuration Validation Framework  
**Language**: JavaScript (Node.js)  
**Dependencies**: `fs`, `path`, `glob`, `crypto`, `perf_hooks`  
**Location**: `tools/enforcement/config-enforcer/`

## Quick Start

```bash
# Validate all configuration files
node tools/enforcement/config-enforcer/index.js

# Apply automatic fixes with dry-run preview
node tools/enforcement/config-enforcer/index.js --fix --dry-run

# Clear validation cache
node tools/enforcement/config-enforcer/index.js --clear-cache
```

## Installation and Setup

### Prerequisites
- Node.js 16+ required
- ProjectTemplate configuration structure
- Write permissions for config files (if using auto-fix)
- Sufficient disk space for cache and backups

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # Installs glob and other dependencies
```

### Configuration Schema
The enforcer uses `config-schema.js` for configuration:
```javascript
const { defaultConfig } = require('./config-schema');
```

## Core Architecture

### Base Validator Interface
All file type validators extend `BaseValidator`:
```javascript
class BaseValidator {
  async validate(filePath) {
    // Returns: {isValid: boolean, violations: Array, fixes: Array}
  }
  
  async applyFixes(filePath, fixes, dryRun = false) {
    // Returns: {success: boolean, changes: Array, errors: Array}
  }
  
  getFileType() {
    // Returns: string identifier for file type
  }
}
```

### Main Enforcer Class
```javascript
class ConfigEnforcer {
  constructor(options = {})
  registerValidator(fileType, validator)
  findConfigFiles()
  async validateFile(fileInfo)
  async validateAll()
  async applyFixes(dryRun = false)
  getReport()
}
```

### Core Components
- **Validator Registry**: Manages file type validators
- **Cache System**: Performance optimization for repeated validations
- **Backup Manager**: Automatic backups before applying fixes
- **Configuration Schema**: Defines validation rules and settings

## Configuration System

### File Type Configuration
```javascript
const config = {
  enabled: true,
  enforcementLevel: 'FULL', // 'FULL', 'PARTIAL', 'WARNING'
  fileTypes: {
    packageJson: {
      enabled: true,
      files: ['**/package.json'],
      excludePatterns: ['node_modules/**'],
      autoFix: true
    },
    tsconfig: {
      enabled: true,
      files: ['**/tsconfig*.json'],
      excludePatterns: [],
      autoFix: false
    }
  }
};
```

### Performance Configuration
```javascript
const performanceConfig = {
  cacheEnabled: true,
  cacheDirectory: '.cache/config-enforcer',
  maxCacheAge: 3600, // seconds
  parallelValidation: false
};
```

### Backup Configuration
```javascript
const backupConfig = {
  enabled: true,
  directory: '.backups/config-enforcer',
  retentionDays: 7
};
```

## Validator System

### Built-in Validator Types
- **Package.json Validator**: Dependencies, scripts, metadata
- **TypeScript Config Validator**: Compiler options, paths
- **ESLint Config Validator**: Rules, extends, environment
- **Prettier Config Validator**: Formatting rules
- **Git Config Validator**: Hooks, ignore patterns

### Custom Validator Example
```javascript
class CustomValidator extends BaseValidator {
  constructor(config) {
    highly(config);
  }

  async validate(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    const fixes = [];

    // Custom validation logic
    if (this.hasViolation(content)) {
      violations.push({
        type: 'custom_rule',
        message: 'Custom rule violation',
        severity: 'error',
        line: 1
      });
      
      fixes.push({
        type: 'replace',
        target: 'old_value',
        replacement: 'new_value'
      });
    }

    return {
      isValid: violations.length === 0,
      violations,
      fixes
    };
  }

  async applyFixes(filePath, fixes, dryRun = false) {
    const changes = [];
    
    for (const fix of fixes) {
      if (!dryRun) {
        // Apply actual fix
        this.applyFix(filePath, fix);
      }
      changes.push({
        type: fix.type,
        description: `Applied ${fix.type} fix`
      });
    }

    return {
      success: true,
      changes,
      errors: []
    };
  }

  getFileType() {
    return 'custom_config';
  }
}
```

## Usage Examples

### Example 1: Basic Validation
```bash
node tools/enforcement/config-enforcer/index.js

# Output:
🔍 Config Enforcer - Validating configuration files...

📁 Found 15 configuration files to validate

✅ package.json - Valid
⚠️  tsconfig.json - 2 warnings
  └─ Missing compilerOptions.strict
  └─ Outdated target version
❌ .eslintrc.json - 1 error
  └─ Invalid extends configuration

📊 Validation Summary:
  Files analyzed: 15
  Valid: 12
  Warnings: 2  
  Errors: 1
  Time: 1.2s

⚠️ Configuration issues found but not blocking
```

### Example 2: Auto-fix with Dry Run
```bash
node tools/enforcement/config-enforcer/index.js --fix --dry-run

# Output:
🔧 Config Enforcer - Dry run fixes preview...

📁 Found 3 files with fixable violations

📄 package.json:
  ✓ Would add missing scripts.test
  ✓ Would update outdated dependencies
  
📄 tsconfig.json:
  ✓ Would enable strict mode
  ✓ Would update target to ES2020

📄 .eslintrc.json:
  ✓ Would fix extends configuration

📊 Fix Summary (DRY RUN):
  Files to modify: 3
  Total changes: 5
  Backups would be created: 3

💡 Run without --dry-run to apply changes
```

### Example 3: Apply Fixes with Backup
```bash
node tools/enforcement/config-enforcer/index.js --fix

# Output:
🔧 Config Enforcer - Applying fixes...

💾 Creating backups...
  ✓ package.json → .backups/package.json_2025-07-12T10-30-45-123Z.backup
  ✓ tsconfig.json → .backups/tsconfig.json_2025-07-12T10-30-45-456Z.backup

📄 Fixing package.json:
  ✓ Added missing scripts.test
  ✓ Updated 3 outdated dependencies

📄 Fixing tsconfig.json:
  ✓ Enabled strict mode
  ✓ Updated target to ES2020

📊 Fix Summary:
  Files modified: 2
  Total changes: 5
  Backups created: 2
  Time: 0.8s

✅ All fixes applied successfully!
```

## Cache and Performance

### Cache Management
```javascript
class ValidationCache {
  constructor(cacheConfig)
  getCacheKey(filePath, configHash)
  getCachedResult(cacheKey)
  setCachedResult(cacheKey, result)
  clearCache()
}
```

### Cache Features
- **MD5 Hash Keys**: Based on file content + config + file path
- **TTL Management**: Configurable cache expiration (default 1 hour)
- **Automatic Invalidation**: Cache cleared when files change
- **Size Management**: Old cache entries automatically cleaned

### Performance Optimization
```bash
# Clear cache for fresh validation
node tools/enforcement/config-enforcer/index.js --clear-cache

# Disable cache for one-time run
node tools/enforcement/config-enforcer/index.js --no-cache

# Performance statistics
node tools/enforcement/config-enforcer/index.js --stats
```

## Backup Management

### Backup Features
- **Automatic Creation**: Before any file modifications
- **Timestamp Naming**: Unique backup names with ISO timestamps  
- **Retention Policy**: Configurable retention (default 7 days)
- **Restore Capability**: Programmatic backup restoration

### Backup Operations
```javascript
const backupManager = new BackupManager(backupConfig);

// Create backup before changes
const backupPath = backupManager.createBackup('package.json');

// Restore from backup if needed
const restored = backupManager.restoreBackup(backupPath, 'package.json');

// Cleanup old backups
backupManager.cleanupOldBackups();
```

### Manual Backup Management
```bash
# List all backups
ls .backups/config-enforcer/

# Restore specific backup
cp .backups/config-enforcer/package.json_2025-07-12T10-30-45-123Z.backup package.json

# Clean old backups
find .backups/config-enforcer -name "*.backup" -mtime +7 -delete
```

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "config:validate": "node tools/enforcement/config-enforcer/index.js",
    "config:fix": "node tools/enforcement/config-enforcer/index.js --fix",
    "config:fix-dry": "node tools/enforcement/config-enforcer/index.js --fix --dry-run",
    "config:clear-cache": "node tools/enforcement/config-enforcer/index.js --clear-cache"
  }
}
```

### Pre-commit Hook Integration
```bash
# In .husky/pre-commit
node tools/enforcement/config-enforcer/index.js

# Exit with error code if violations found
if [ $? -ne 0 ]; then
  echo "Config validation failed"
  exit 1
fi
```

### CI/CD Integration
```yaml
# GitHub Actions workflow
- name: Validate Configuration Files
  run: |
    node tools/enforcement/config-enforcer/index.js
    
- name: Check Configuration Consistency
  run: |
    npm run config:validate
```

### IDE Integration
```json
// VS Code tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Validate Config Files",
      "type": "shell",
      "command": "npm run config:validate",
      "group": "build",
      "problemMatcher": []
    }
  ]
}
```

## Error Handling and Troubleshooting

### Common Issues

#### Cache Directory Permissions
```text
Error: EACCES: permission denied, mkdir '.cache/config-enforcer'
```
**Solutions**:
```bash
# Fix directory permissions
chmod 755 .cache
mkdir -p .cache/config-enforcer

# Or disable cache temporarily
node tools/enforcement/config-enforcer/index.js --no-cache
```

#### Invalid Configuration Schema
```text
Error: Configuration validation failed: Unknown file type 'invalid_type'
```
**Solutions**:
```bash
# Check config-schema.js for valid file types
cat tools/enforcement/config-enforcer/config-schema.js

# Validate configuration
node -e "console.log(require('./tools/enforcement/config-enforcer/config-schema.js'))"
```

#### File Lock Conflicts
```text
Error: EBUSY: resource busy or locked
```
**Solutions**:
```bash
# Close editors/IDEs that might lock files
# Wait for other processes to finish
# Run with dry-run first
node tools/enforcement/config-enforcer/index.js --fix --dry-run
```

### Debug Mode
Enable verbose logging:
```javascript
// Add to beginning of main function
process.env.DEBUG = 'config-enforcer:*';

// Or set environment variable
DEBUG=config-enforcer:* node tools/enforcement/config-enforcer/index.js
```

### Validator-Specific Debugging
```javascript
// Add debug output to custom validators
class DebugValidator extends BaseValidator {
  async validate(filePath) {
    console.log(`[DEBUG] Validating ${filePath}`);
    console.log(`[DEBUG] Config:`, this.config);
    
    const result = await highly.validate(filePath);
    console.log(`[DEBUG] Result:`, result);
    
    return result;
  }
}
```

## API and Programmatic Usage

### Basic Usage
```javascript
const { ConfigEnforcer } = require('./tools/enforcement/config-enforcer');

// Create enforcer instance
const enforcer = new ConfigEnforcer({
  config: customConfig
});

// Register custom validators
enforcer.registerValidator('custom', new CustomValidator(config));

// Run validation
const results = await enforcer.validateAll();

if (!results.success) {
  console.log('Violations found:', results.violations);
  
  // Apply fixes
  const fixResults = await enforcer.applyFixes(false); // false = not dry run
  console.log('Fixes applied:', fixResults.totalChanges);
}
```

### Advanced Integration
```javascript
const enforcer = new ConfigEnforcer();

// Custom configuration
enforcer.config.fileTypes.customConfig = {
  enabled: true,
  files: ['**/*.custom.json'],
  excludePatterns: ['test/**'],
  autoFix: true
};

// Validate specific files
const fileResults = await enforcer.validateFile({
  path: 'src/config.json',
  type: 'customConfig'
});

// Get detailed report
const report = enforcer.getReport();
console.log('Enforcement level:', report.enforcementLevel);
console.log('Should block:', report.shouldBlock);
```

### Batch Processing
```javascript
const fs = require('fs');
const path = require('path');

// Process multiple projects
const projects = ['./project1', './project2', './project3'];

for (const projectPath of projects) {
  console.log(`Validating ${projectPath}...`);
  
  // Change to project directory
  const originalCwd = process.cwd();
  process.chdir(projectPath);
  
  try {
    const enforcer = new ConfigEnforcer();
    const results = await enforcer.validateAll();
    
    console.log(`${projectPath}: ${results.success ? 'PASS' : 'FAIL'}`);
    
    if (!results.success) {
      await enforcer.applyFixes(true); // dry run first
    }
  } finally {
    process.chdir(originalCwd);
  }
}
```

## Development and Contributing

### Project Structure
```text
tools/enforcement/config-enforcer/
├── index.js              # Main ConfigEnforcer class
├── config-schema.js      # Configuration schema and defaults
├── validators/           # Built-in file type validators
│   ├── package-json.js   # Package.json validator
│   ├── tsconfig.js       # TypeScript config validator
│   └── eslint.js         # ESLint config validator
├── utils/                # Utility functions
└── tests/                # Test files
```

### Adding New File Type Validators
1. **Create validator class**:
```javascript
// validators/new-config.js
const { BaseValidator } = require('../index');

class NewConfigValidator extends BaseValidator {
  constructor(config) {
    highly(config);
  }

  async validate(filePath) {
    // Implementation
  }

  async applyFixes(filePath, fixes, dryRun = false) {
    // Implementation
  }

  getFileType() {
    return 'newConfig';
  }
}

module.exports = NewConfigValidator;
```

2. **Update config schema**:
```javascript
// config-schema.js
const defaultConfig = {
  fileTypes: {
    newConfig: {
      enabled: true,
      files: ['**/*.new.json'],
      excludePatterns: [],
      autoFix: true
    }
  }
};
```

3. **Register validator**:
```javascript
// In main usage
const NewConfigValidator = require('./validators/new-config');
enforcer.registerValidator('newConfig', new NewConfigValidator(config));
```

### Testing Guidelines
```bash
# Test specific validator
npm test -- --grep "NewConfigValidator"

# Test with sample files
mkdir test-configs
echo '{}' > test-configs/sample.new.json
node tools/enforcement/config-enforcer/index.js

# Test performance
time node tools/enforcement/config-enforcer/index.js
```

### Performance Optimal Practices
- Use caching for expensive validations
- Implement async validation for large files
- Use streaming for very large configuration files
- Batch file operations when possible
- Profile validator performance regularly

## Related Tools and Documentation

- **enforcement-config.js**: Main enforcement configuration system
- **check-imports.js**: Import statement validation
- **documentation-style.js**: Documentation style enforcement
- **Configuration Guide**: docs/guides/enforcement/configuration.md
- **Validation Patterns**: docs/guides/enforcement/validation-patterns.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines