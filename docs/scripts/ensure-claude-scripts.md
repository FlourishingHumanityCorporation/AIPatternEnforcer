# Ensure Claude Scripts Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Command Line Interface](#command-line-interface)
5. [Script Management Features](#script-management-features)
6. [Required Scripts](#required-scripts)
7. [Usage Examples](#usage-examples)
8. [Output and Results](#output-and-results)
9. [Integration with Development Workflow](#integration-with-development-workflow)
10. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
11. [API and Programmatic Usage](#api-and-programmatic-usage)
12. [Development and Contributing](#development-and-contributing)

## Overview

Package.json script manager that ensures all required Claude validation npm scripts are properly installed and
configured. Automatically detects missing or incorrect scripts and provides fixes with colorized output and validation.

**Tool Type**: Package.json Script Manager  
**Language**: JavaScript (Node.js)  
**Dependencies**: `fs`, `path` (no external dependencies)  
**Location**: `scripts/ensure-claude-scripts.js`

## Quick Start

```bash
# Check and install missing Claude validation scripts
node scripts/ensure-claude-scripts.js install

# Validate current installation
node scripts/ensure-claude-scripts.js validate

# List all required scripts
node scripts/ensure-claude-scripts.js list
```

## Installation and Setup

### Prerequisites
- Node.js 18+ required
- Valid package.json in project root
- Write permissions to package.json
- Claude validation tools installed

### Installation
Tool is included with ProjectTemplate:
```bash
# No additional installation needed
# Script is self-contained with no external dependencies
```

### Required Files
- `package.json` in project root (modified by tool)
- Claude validation tools in `tools/claude-validation/`

## Command Line Interface

### Basic Syntax
```bash
node scripts/ensure-claude-scripts.js <command>
```

### Available Commands
- `install`: Install/update all required npm scripts
- `check`: Check which scripts are missing or incorrect
- `list`: List all required scripts and their commands
- `validate`: Validate current installation (exit 1 if issues)
- `help`: Show help message (default)

### Command Details

#### install
**Purpose**: Automatically add missing scripts and fix incorrect ones  
**Usage**: `node scripts/ensure-claude-scripts.js install`  
**Actions**: Modifies package.json, adds/updates scripts, saves changes

#### check  
**Purpose**: Report status without making changes  
**Usage**: `node scripts/ensure-claude-scripts.js check`  
**Actions**: Read-only analysis, no file modifications

#### validate
**Purpose**: Validation for CI/CD or automation  
**Usage**: `node scripts/ensure-claude-scripts.js validate`  
**Actions**: Exit 0 if valid, exit 1 if issues found

#### list
**Purpose**: Show all required scripts for reference  
**Usage**: `node scripts/ensure-claude-scripts.js list`  
**Actions**: Display script names and commands

## Script Management Features

### Automatic Detection
- **Missing Scripts**: Detects scripts not present in package.json
- **Incorrect Scripts**: Identifies scripts with wrong commands
- **Version Validation**: Ensures scripts point to correct tool paths
- **Dependency Checking**: Validates required tools exist

### Smart Updates
- **Preserves Existing**: Only modifies Claude validation scripts
- **Non-Destructive**: Leaves other package.json content unchanged
- **Backup-Safe**: Creates valid JSON with proper formatting
- **Atomic Operations**: All changes applied together or not at all

### Colorized Output
- **Green**: Success messages and confirmations
- **Yellow**: Warnings and script changes
- **Red**: Errors and failures
- **Blue**: Information and help text
- **Cyan**: Headers and section titles

## Required Scripts

### Script Definitions
```javascript
const requiredScripts = {
  'claude:validate': 'node tools/claude-validation/validate-claude.js',
  'claude:test': 'node tools/claude-validation/test-compliance.js', 
  'claude:stats': 'node tools/claude-validation/validate-claude.js --stats',
  'claude:dashboard': 'open tools/claude-validation/dashboard.html',
  'claude:config': 'node tools/claude-validation/config-manager.js',
  'claude:config:status': 'node tools/claude-validation/config-manager.js status'
};
```

### Script Purposes

#### claude:validate
**Purpose**: Validate Claude Code responses against ProjectTemplate rules  
**Usage**: `npm run claude:validate`  
**Input**: Accepts piped input or file paths

#### claude:test
**Purpose**: Run compliance test suite  
**Usage**: `npm run claude:test`  
**Function**: Validates rule engine and test patterns

#### claude:stats
**Purpose**: Show compliance statistics  
**Usage**: `npm run claude:stats`  
**Output**: Usage metrics, success rates, violation patterns

#### claude:dashboard
**Purpose**: Open visual compliance dashboard  
**Usage**: `npm run claude:dashboard`  
**Platform**: Opens HTML dashboard in default browser

#### claude:config
**Purpose**: Manage Claude validation configuration  
**Usage**: `npm run claude:config`  
**Function**: Interactive configuration management

#### claude:config:status
**Purpose**: Show current configuration status  
**Usage**: `npm run claude:config:status`  
**Output**: Current settings and validation rules

## Usage Examples

### Example 1: First-Time Setup
```bash
node scripts/ensure-claude-scripts.js install

# Output:
🔧 Checking claude-validation npm scripts...

📝 Installing missing/incorrect scripts:
  + Added: claude:validate
  + Added: claude:test
  + Added: claude:stats
  + Added: claude:dashboard
  + Added: claude:config
  + Added: claude:config:status

✅ package.json updated successfully

✅ Installed 6 scripts
```

### Example 2: Validation Check
```bash
node scripts/ensure-claude-scripts.js validate

# Output (if valid):
✅ All scripts are properly installed

# Output (if issues):
❌ Installation validation failed

Missing scripts:
  - claude:validate
  - claude:stats

Run: node scripts/ensure-claude-scripts.js install
# Exit code: 1
```

### Example 3: Script Listing
```bash
node scripts/ensure-claude-scripts.js list

# Output:
📋 Required claude-validation scripts:

  claude:validate:
    node tools/claude-validation/validate-claude.js
  claude:test:
    node tools/claude-validation/test-compliance.js
  claude:stats:
    node tools/claude-validation/validate-claude.js --stats
  claude:dashboard:
    open tools/claude-validation/dashboard.html
  claude:config:
    node tools/claude-validation/config-manager.js
  claude:config:status:
    node tools/claude-validation/config-manager.js status
```

### Example 4: Check Without Installing
```bash
node scripts/ensure-claude-scripts.js check

# Output (if updates needed):
Scripts need updates:
  Missing: claude:validate
  Missing: claude:dashboard
  Incorrect: claude:stats

# Output (if up to date):
All scripts are up to date
```

### Example 5: Fixing Incorrect Scripts
```bash
node scripts/ensure-claude-scripts.js install

# Output when fixing incorrect scripts:
🔧 Checking claude-validation npm scripts...

📝 Installing missing/incorrect scripts:
  * Fixed: claude:validate
    Was: node tools/claude-validation/old-validate.js
    Now: node tools/claude-validation/validate-claude.js
  + Added: claude:dashboard

✅ package.json updated successfully

✅ Installed 2 scripts
```

## Output and Results

### Successful Installation
```text
🔧 Checking claude-validation npm scripts...

📝 Installing missing/incorrect scripts:
  + Added: claude:validate
  + Added: claude:test
  + Added: claude:stats
  + Added: claude:dashboard
  + Added: claude:config
  + Added: claude:config:status

✅ package.json updated successfully

✅ Installed 6 scripts
```

### No Changes Needed
```text
🔧 Checking claude-validation npm scripts...

✅ All claude-validation scripts are properly installed
```

### Package.json Modifications
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "claude:validate": "node tools/claude-validation/validate-claude.js",
    "claude:test": "node tools/claude-validation/test-compliance.js",
    "claude:stats": "node tools/claude-validation/validate-claude.js --stats",
    "claude:dashboard": "open tools/claude-validation/dashboard.html",
    "claude:config": "node tools/claude-validation/config-manager.js",
    "claude:config:status": "node tools/claude-validation/config-manager.js status"
  }
}
```

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "setup:claude": "node scripts/ensure-claude-scripts.js install",
    "verify:claude": "node scripts/ensure-claude-scripts.js validate"
  }
}
```

### Setup Workflows
```bash
# Initial project setup
npm install
npm run setup:claude

# Verify Claude tools are ready
npm run verify:claude

# Start using Claude validation
npm run claude:validate
```

### Team Onboarding
```bash
# New team member setup
git clone project-repo
cd project-repo
npm install
node scripts/ensure-claude-scripts.js install

# Verify setup
npm run claude:config:status
npm run claude:test
```

### CI/CD Integration
```yaml
# GitHub Actions workflow
- name: Setup Claude Scripts
  run: node scripts/ensure-claude-scripts.js install
  
- name: Validate Claude Setup
  run: node scripts/ensure-claude-scripts.js validate
  
- name: Run Claude Tests
  run: npm run claude:test
```

### Pre-commit Hooks
```bash
# In .husky/pre-commit
node scripts/ensure-claude-scripts.js validate
npm run claude:test
```

## Error Handling and Troubleshooting

### Common Issues

#### Package.json Not Found
```text
Error loading package.json: package.json not found. Run this from project root.
```
**Solution**: Run from project root directory containing package.json

#### Permission Errors
```text
Error saving package.json: EACCES: permission denied
```
**Solutions**:
```bash
# Check file permissions
ls -la package.json

# Fix permissions
chmod 644 package.json

# Check directory permissions
ls -la ./
```

#### Invalid JSON
```text
Error loading package.json: Unexpected token } in JSON
```
**Solutions**:
```bash
# Validate JSON syntax
npx jsonlint package.json

# Check for common issues
cat package.json | grep -n ",$"  # Trailing commas
```

#### Tool Files Missing
```text
Scripts installed but claude validation tools not found
```
**Solutions**:
```bash
# Check tool files exist
ls tools/claude-validation/validate-claude.js
ls tools/claude-validation/config-manager.js

# Install missing tools
npm run setup:claude-validation
```

### Debug Mode
Add debug logging by modifying the script:
```javascript
// Add at beginning of methods
console.log('Debug: Current directory:', process.cwd());
console.log('Debug: Package.json path:', this.packageJsonPath);

// Check file operations
console.log('Debug: Loading package.json...');
const content = fs.readFileSync(this.packageJsonPath, 'utf-8');
console.log('Debug: File size:', content.length);
```

## API and Programmatic Usage

### Node.js Integration
```javascript
const ScriptManager = require('./scripts/ensure-claude-scripts');

// Programmatic usage
const manager = new ScriptManager();

// Check script status
const status = manager.checkScripts();
console.log('Scripts need update:', status.needsUpdate);
console.log('Missing scripts:', status.missingScripts);

// Install scripts programmatically
if (status.needsUpdate) {
  manager.installScripts();
  console.log('Scripts updated successfully');
}

// Validate installation
try {
  manager.validateInstallation();
  console.log('Installation is valid');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### Custom Script Management
```javascript
const ScriptManager = require('./scripts/ensure-claude-scripts');

// Extend for custom scripts
class CustomScriptManager extends ScriptManager {
  constructor() {
    highly();
    
    // Add custom scripts
    this.requiredScripts = {
      ...this.requiredScripts,
      'custom:tool': 'node tools/custom/my-tool.js',
      'custom:test': 'node tools/custom/test-tool.js'
    };
  }
}

const customManager = new CustomScriptManager();
customManager.installScripts();
```

### Batch Operations
```javascript
const fs = require('fs');
const path = require('path');
const ScriptManager = require('./scripts/ensure-claude-scripts');

// Update multiple projects
const projects = ['./project1', './project2', './project3'];

for (const projectPath of projects) {
  console.log(`Updating ${projectPath}...`);
  
  // Change to project directory
  const originalCwd = process.cwd();
  process.chdir(projectPath);
  
  try {
    const manager = new ScriptManager();
    manager.installScripts();
    console.log(`✅ ${projectPath} updated`);
  } catch (error) {
    console.error(`❌ ${projectPath} failed:`, error.message);
  } finally {
    process.chdir(originalCwd);
  }
}
```

## Development and Contributing

### Project Structure
```text
scripts/ensure-claude-scripts.js
├── ScriptManager class
├── Script definitions (requiredScripts)
├── Package.json operations (load/save)
├── Script checking logic (checkScripts)
├── Installation logic (installScripts)
├── Validation logic (validateInstallation)
├── CLI interface
└── Colorized output utilities
```

### Adding New Required Scripts
1. **Update script definitions**:
```javascript
const requiredScripts = {
  // ... existing scripts
  'claude:new-tool': 'node tools/claude-validation/new-tool.js',
  'claude:analysis': 'node tools/claude-validation/analyze.js --detailed'
};
```

2. **Test the changes**:
```bash
node scripts/ensure-claude-scripts.js check  # Should show new scripts as missing
node scripts/ensure-claude-scripts.js install  # Should add new scripts
```

### Extending Functionality
```javascript
// Add new validation methods
validateToolFiles() {
  const tools = Object.values(this.requiredScripts)
    .map(cmd => cmd.split(' ')[1])  // Extract file path
    .filter(path => path.startsWith('tools/'));
    
  const missing = tools.filter(tool => !fs.existsSync(tool));
  
  if (missing.length > 0) {
    throw new Error(`Missing tool files: ${missing.join(', ')}`);
  }
}
```

### Testing Guidelines
```bash
# Test with clean package.json
cp package.json package.json.backup
# Remove claude scripts manually
node scripts/ensure-claude-scripts.js install
# Verify scripts added correctly

# Test with incorrect scripts
# Modify existing claude scripts manually
node scripts/ensure-claude-scripts.js install
# Verify scripts fixed correctly

# Restore backup
mv package.json.backup package.json
```

### Error Handling Optimal Practices
- Always validate JSON before parsing
- Check file permissions before writing
- Provide clear error messages with solutions
- Use appropriate exit codes for automation
- Log sufficient detail for debugging

## Related Tools and Documentation

- **validate-claude.js**: Main validation tool that scripts point to
- **config-manager.js**: Configuration management tool
- **test-compliance.js**: Compliance testing tool
- **Claude Validation Guide**: docs/guides/ai-development/claude-validation.md
- **Package.json Scripts Guide**: docs/guides/setup/npm-scripts.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines