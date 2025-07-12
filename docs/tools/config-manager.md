# Config Manager Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Command Line Interface](#command-line-interface)
  4. [Basic Syntax](#basic-syntax)
  5. [Commands](#commands)
    6. [`status`](#status)
    7. [`get <key>`](#get-key)
    8. [`set <key> <value>`](#set-key-value)
    9. [`reset [key]`](#reset-key)
    10. [`validate`](#validate)
    11. [`export`](#export)
    12. [`import <file>`](#import-file)
13. [Configuration Structure](#configuration-structure)
  14. [Default Configuration](#default-configuration)
  15. [Configuration Hierarchy](#configuration-hierarchy)
16. [Programmatic API](#programmatic-api)
  17. [Loading Configuration](#loading-configuration)
  18. [Updating Configuration](#updating-configuration)
  19. [Validation](#validation)
  20. [Event Handling](#event-handling)
21. [Environment Variables](#environment-variables)
  22. [Supported Variables](#supported-variables)
  23. [Precedence](#precedence)
24. [Configuration Files](#configuration-files)
  25. [Project Configuration](#project-configuration)
  26. [User Configuration](#user-configuration)
27. [Advanced Features](#advanced-features)
  28. [Configuration Inheritance](#configuration-inheritance)
  29. [Dynamic Configuration](#dynamic-configuration)
  30. [Configuration Profiles](#configuration-profiles)
31. [Migration and Versioning](#migration-and-versioning)
  32. [Version Compatibility](#version-compatibility)
  33. [Backup and Restore](#backup-and-restore)
34. [Troubleshooting](#troubleshooting)
  35. [Common Issues](#common-issues)
    36. [Issue: "Configuration not loading"](#issue-configuration-not-loading)
    37. [Issue: "Invalid configuration"](#issue-invalid-configuration)
38. [Optimal Practices](#optimal-practices)
39. [Related Tools](#related-tools)

## Overview

A centralized configuration management tool for the Claude validation system. This tool handles loading, validating,
updating, and persisting configuration settings across the ProjectTemplate ecosystem, ensuring consistent behavior and
easy customization.

**Tool Type**: Configuration Management Library  
**Language**: JavaScript  
**Dependencies**: fs, path, joi (for validation)

## Quick Start

```bash
# View current configuration
node tools/claude-validation/config-manager.js status

# Update configuration
node tools/claude-validation/config-manager.js set validation.enabled true

# Reset to defaults
node tools/claude-validation/config-manager.js reset

# Export configuration
node tools/claude-validation/config-manager.js export > my-config.json
```

## Command Line Interface

### Basic Syntax
```bash
node tools/claude-validation/config-manager.js [command] [args] [options]
```

### Commands

#### `status`
Display current configuration status and values
```bash
node tools/claude-validation/config-manager.js status
```

#### `get <key>`
Retrieve specific configuration value
```bash
node tools/claude-validation/config-manager.js get validation.patterns.no-improved-files
```

#### `set <key> <value>`
Update configuration value
```bash
node tools/claude-validation/config-manager.js set validation.mode strict
node tools/claude-validation/config-manager.js set rules.maxViolations 5
```

#### `reset [key]`
Reset configuration to defaults
```bash
# Reset everything
node tools/claude-validation/config-manager.js reset

# Reset specific key
node tools/claude-validation/config-manager.js reset validation.patterns
```

#### `validate`
Validate current configuration
```bash
node tools/claude-validation/config-manager.js validate
```

#### `export`
Export configuration as JSON
```bash
node tools/claude-validation/config-manager.js export
node tools/claude-validation/config-manager.js export --format yaml
```

#### `import <file>`
Import configuration from file
```bash
node tools/claude-validation/config-manager.js import custom-config.json
```

## Configuration Structure

### Default Configuration
```javascript
{
  "version": "1.0.0",
  "validation": {
    "enabled": true,
    "mode": "warning", // warning | strict | off
    "patterns": {
      "no-improved-files": {
        "enabled": true,
        "severity": "error",
        "message": "Don't create *_improved files"
      },
      "specific-imports": {
        "enabled": true,
        "severity": "warning",
        "message": "Use specific imports"
      },
      // Additional patterns...
    },
    "thresholds": {
      "maxViolations": 10,
      "failOnError": true,
      "warnOnWarning": true
    }
  },
  "analytics": {
    "enabled": true,
    "trackPatterns": true,
    "trackCompliance": true,
    "reportingInterval": 86400000 // 24 hours
  },
  "integration": {
    "preCommitHook": true,
    "realTimeValidation": false,
    "cicdIntegration": true
  },
  "ui": {
    "showInlineHints": true,
    "colorOutput": true,
    "verboseLogging": false
  }
}
```

### Configuration Hierarchy
1. **Default Configuration** - Built-in defaults
2. **Global Configuration** - `~/.projecttemplate/config.json`
3. **Project Configuration** - `.projecttemplate/config.json`
4. **Environment Variables** - `PROJECTTEMPLATE_*`
5. **Runtime Overrides** - Command line arguments

## Programmatic API

### Loading Configuration
```javascript
const ConfigManager = require('./tools/claude-validation/config-manager');

// Get singleton instance
const config = ConfigManager.getInstance();

// Load configuration
await config.load();

// Access values
const isEnabled = config.get('validation.enabled');
const patterns = config.get('validation.patterns');
```

### Updating Configuration
```javascript
// Set single value
config.set('validation.mode', 'strict');

// Set nested value
config.set('validation.patterns.no-improved-files.severity', 'error');

// Batch update
config.update({
  'validation.mode': 'strict',
  'analytics.enabled': false,
  'ui.verboseLogging': true
});

// Save changes
await config.save();
```

### Validation
```javascript
// Validate entire config
const { valid, errors } = config.validate();
if (!valid) {
  console.error('Configuration errors:', errors);
}

// Validate specific section
const validationValid = config.validateSection('validation');
```

### Event Handling
```javascript
// Listen for configuration changes
config.on('change', (key, oldValue, newValue) => {
  console.log(`Config changed: ${key} from ${oldValue} to ${newValue}`);
});

// Listen for validation errors
config.on('validation-error', (errors) => {
  console.error('Invalid configuration:', errors);
});
```

## Environment Variables

### Supported Variables
```bash
# Enable/disable validation
export PROJECTTEMPLATE_VALIDATION_ENABLED=true

# Set validation mode
export PROJECTTEMPLATE_VALIDATION_MODE=strict

# Configure analytics
export PROJECTTEMPLATE_ANALYTICS_ENABLED=false

# Set config file path
export PROJECTTEMPLATE_CONFIG_PATH=/custom/path/config.json
```

### Precedence
Environment variables override file-based configuration but are overridden by runtime arguments.

## Configuration Files

### Project Configuration
`.projecttemplate/config.json`
```json
{
  "extends": "default",
  "validation": {
    "mode": "strict",
    "patterns": {
      "custom-pattern": {
        "enabled": true,
        "severity": "error",
        "regex": "TODO:\\s*FIXME",
        "message": "Don't mix TODO and FIXME"
      }
    }
  }
}
```

### User Configuration
`~/.projecttemplate/config.json`
```json
{
  "ui": {
    "colorOutput": false,
    "verboseLogging": true
  },
  "analytics": {
    "enabled": false
  }
}
```

## Advanced Features

### Configuration Inheritance
```json
{
  "extends": "enterprise",
  "validation": {
    "patterns": {
      "no-console": {
        "enabled": false
      }
    }
  }
}
```

### Dynamic Configuration
```javascript
// Register dynamic config provider
config.registerProvider('api', async () => {
  const response = await fetch('https://api.example.com/config');
  return response.json();
});

// Reload with providers
await config.reload();
```

### Configuration Profiles
```bash
# Use specific profile
node tools/claude-validation/config-manager.js --profile development

# Available profiles
# - development: Relaxed rules, verbose output
# - staging: Balanced rules, normal output  
# - production: Strict rules, minimal output
```

## Migration and Versioning

### Version Compatibility
The config manager handles version migrations automatically:
```javascript
// Migrations defined in migrations/
{
  "1.0.0": (config) => config,
  "1.1.0": (config) => {
    // Migrate old pattern format
    if (config.patterns) {
      config.validation = { patterns: config.patterns };
      delete config.patterns;
    }
    return config;
  }
}
```

### Backup and Restore
```bash
# Backup current config
node tools/claude-validation/config-manager.js backup

# List backups
node tools/claude-validation/config-manager.js backups

# Restore from backup
node tools/claude-validation/config-manager.js restore 2025-07-12-1400
```

## Troubleshooting

### Common Issues

#### Issue: "Configuration not loading"
**Solution**:
```bash
# Check file permissions
ls -la .projecttemplate/config.json

# Validate JSON syntax
jq . .projecttemplate/config.json

# Use debug mode
DEBUG=config:* node tools/claude-validation/config-manager.js status
```

#### Issue: "Invalid configuration"
**Solution**:
```bash
# Run validation
node tools/claude-validation/config-manager.js validate

# Check schema
node tools/claude-validation/config-manager.js schema

# Reset to defaults
node tools/claude-validation/config-manager.js reset
```

## Optimal Practices

1. **Version Control** - Commit project config files
2. **Environment Separation** - Use profiles for different environments
3. **Validation** - Always validate after manual edits
4. **Documentation** - Document custom patterns and rules
5. **Backup** - Backup before major changes

## Related Tools

- **validate-claude.js**: Uses configuration for validation rules
- **analytics-tracker.js**: Respects analytics configuration
- **enforcement-config.js**: General enforcement configuration
- **pattern-manager.js**: Pattern-specific configuration

---

**Last Updated**: 2025-07-12  
**Version**: 1.0.0  
**Maintainer**: ProjectTemplate Team