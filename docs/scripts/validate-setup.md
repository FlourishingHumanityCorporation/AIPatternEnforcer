# Setup Validator Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Validation Categories](#validation-categories)
5. [Check Types and Criteria](#check-types-and-criteria)
6. [Usage Examples](#usage-examples)
7. [Output and Results](#output-and-results)
8. [Integration with Development Workflow](#integration-with-development-workflow)
9. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
10. [API and Programmatic Usage](#api-and-programmatic-usage)
11. [Development and Contributing](#development-and-contributing)

## Overview

Comprehensive project health checker that validates ProjectTemplate setup across dependencies, project structure,
configuration, generators, and AI connectivity. Provides actionable feedback and categorized results with color-coded
output.

**Tool Type**: Project Health Validator  
**Language**: JavaScript (Node.js)  
**Dependencies**: `fs`, `path`, `child_process`, `chalk`  
**Location**: `scripts/setup/validate-setup.js`

## Quick Start

```bash
# Run complete setup validation
node scripts/setup/validate-setup.js

# Validates all categories:
# - Dependencies (Node.js, npm, packages)
# - Project structure (directories, files)
# - Configuration (TypeScript, git hooks, AI)
# - Generators (component, API tools)
# - AI connectivity (context commands, ignore files)
```

## Installation and Setup

### Prerequisites
- Node.js 16+ required (validated by tool)
- ProjectTemplate project structure
- Package.json with proper configuration
- Git installation (optional but recommended)

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # Installs chalk and other dependencies
```

### Setup Integration
```bash
# Run as part of project setup
npm run setup:validate

# Or integrate into onboarding
npm run setup:guided && npm run setup:validate
```

## Validation Categories

### Dependencies
**Purpose**: Validate runtime and build environment  
**Checks**: Node.js version, npm version, installed packages  
**Critical**: Node.js version, package installation

### Project Structure  
**Purpose**: Ensure required directories and files exist  
**Checks**: Core directories, package.json, template structure  
**Critical**: package.json existence, core directories

### Configuration
**Purpose**: Validate development tool configuration  
**Checks**: TypeScript, git hooks, AI configuration  
**Critical**: None (configuration issues are warnings)

### Generators
**Purpose**: Ensure code generation tools work  
**Checks**: Generator scripts, npm script commands  
**Critical**: Component generator availability

### AI Connectivity
**Purpose**: Validate AI assistant integration  
**Checks**: Context commands, ignore files, AI configurations  
**Critical**: None (AI features are optional)

## Check Types and Criteria

### Dependencies Category

#### Node.js Version Check
**Requirement**: Node.js v16 or higher  
**Critical**: Yes  
**Pass Criteria**: `process.version` >= 16.0.0  
**Failure Action**: Install Node.js v16+

#### npm Version Check  
**Requirement**: npm v7 or higher (recommended)  
**Critical**: No  
**Pass Criteria**: `npm -v` >= 7.0.0  
**Warning Action**: Update npm with `npm install -g npm@latest`

#### node_modules Check
**Requirement**: Dependencies installed  
**Critical**: Yes  
**Pass Criteria**: `node_modules/` directory exists with packages  
**Failure Action**: Run `npm install`

### Project Structure Category

#### package.json Check
**Requirement**: Valid package.json in root  
**Critical**: Yes  
**Pass Criteria**: File exists and is valid JSON  
**Failure Action**: Create or fix package.json

#### Source Directories Check
**Requirement**: Core directories present  
**Critical**: No  
**Directories**: `src/`, `scripts/`, `tools/`, `templates/`  
**Failure Action**: Run setup wizard or create manually

#### Generator Templates Check
**Requirement**: Template directories for generators  
**Critical**: No  
**Directories**: `templates/component/`, `templates/api/`, `templates/feature/`  
**Warning Action**: Generators may not work properly

### Configuration Category

#### AI Configuration Check
**Requirement**: AI integration setup  
**Critical**: No  
**Files**: `ai/config/.cursorrules`, `.ai-enforcement.json`, `ai/config/context-rules.json`  
**Warning Action**: Run `npm run setup:guided`

#### Git Hooks Check
**Requirement**: Pre-commit hooks installed  
**Critical**: No  
**Check**: `.husky/` directory exists  
**Warning Action**: Run `npm run setup:hooks`

#### TypeScript Configuration Check
**Requirement**: TypeScript properly configured  
**Critical**: No  
**Check**: `tsconfig.json` exists and is valid JSON  
**Warning Action**: Add tsconfig.json for TypeScript support

### Generators Category

#### Component Generator Check
**Requirement**: Enhanced component generator available  
**Critical**: No  
**Check**: `tools/generators/enhanced-component-generator.js` exists  
**Failure Action**: Ensure tools/generators directory is complete

#### Generator Commands Check
**Requirement**: npm scripts for generators configured  
**Critical**: No  
**Scripts**: `g:c`, `g:api`, `g:feature`, `g:hook`  
**Warning Action**: Check package.json scripts section

### AI Connectivity Category

#### Claude Context Command Check
**Requirement**: AI context command configured  
**Critical**: No  
**Scripts**: `context` or `ai:context` in package.json  
**Warning Action**: Add context command to package.json

#### AI Ignore File Check
**Requirement**: .aiignore file for optimized AI context  
**Critical**: No  
**Check**: `.aiignore` file exists with ignore patterns  
**Warning Action**: Create .aiignore to optimize AI context

## Usage Examples

### Example 1: Successful Complete Validation
```bash
node scripts/setup/validate-setup.js

# Output:
🔍 ProjectTemplate Setup Validator

DEPENDENCIES
────────────────────────────────────────
  Node.js version... ✓
    └─ v18.17.0
  npm version... ✓
    └─ v9.6.7
  node_modules exists... ✓
    └─ 245 packages installed

PROJECT STRUCTURE
────────────────────────────────────────
  package.json exists... ✓
  Source directories... ✓
  Generator templates... ⚠
    └─ Missing template directories: templates/api, templates/feature
    └─ Fix: Generators may not work properly

CONFIGURATION
────────────────────────────────────────
  AI configuration... ✓
    └─ 2 AI configs found
  Git hooks... ✓
  TypeScript config... ✓

GENERATORS
────────────────────────────────────────
  Component generator... ✓
  Generator commands... ✓

AI CONNECTIVITY
────────────────────────────────────────
  Claude context command... ✓
  AI ignore file... ✓
    └─ 15 ignore patterns

SUMMARY
────────────────────────────────────────
  Passed: 11
  Warnings: 1
  Failed: 0

✅ Setup validation passed! Your project is ready to use.
```

### Example 2: Validation with Critical Issues
```bash
node scripts/setup/validate-setup.js

# Output:
🔍 ProjectTemplate Setup Validator

DEPENDENCIES
────────────────────────────────────────
  Node.js version... ✗
    └─ Node.js v14.20.0 is too old (need v16+)
    └─ Fix: Install Node.js v16 or higher
  npm version... ✓
  node_modules exists... ✗
    └─ Dependencies not installed
    └─ Fix: Run: npm install

PROJECT STRUCTURE
────────────────────────────────────────
  package.json exists... ✓
  Source directories... ✗
    └─ Missing directories: tools, templates
    └─ Fix: Run setup wizard or create directories manually

# ... other categories

SUMMARY
────────────────────────────────────────
  Passed: 8
  Warnings: 2
  Failed: 3

CRITICAL ISSUES:
  ● Node.js version: Node.js v14.20.0 is too old (need v16+)
    → Install Node.js v16 or higher
  ● node_modules exists: Dependencies not installed
    → Run: npm install

OTHER ISSUES:
  ● Source directories: Missing directories: tools, templates
    → Run setup wizard or create directories manually

❌ Setup validation failed! Critical issues must be fixed.
# Exit code: 1
```

### Example 3: Validation with Warnings Only
```bash
node scripts/setup/validate-setup.js

# Output:
# ... validation checks

SUMMARY
────────────────────────────────────────
  Passed: 12
  Warnings: 3
  Failed: 0

OTHER ISSUES:
  ● AI configuration: No AI configuration found
    → Run: npm run setup:guided
  ● Git hooks: Git hooks not installed
    → Run: npm run setup:hooks
  ● Generator templates: Missing template directories: templates/api
    → Generators may not work properly

⚠️  Setup has minor issues but is usable.
```

## Output and Results

### Result Categories
- **✓ Pass**: Check completed successfully (green)
- **⚠ Warning**: Non-critical issue found (yellow)  
- **✗ Fail**: Critical issue that needs fixing (red)

### Exit Codes
- `0`: All checks passed or only warnings
- `1`: Critical issues found that must be fixed

### Color Coding
- **Green (✓)**: Successful checks and pass messages
- **Yellow (⚠)**: Warnings and recommended fixes
- **Red (✗)**: Failed checks and critical issues
- **Blue**: Fix instructions and actionable advice
- **Gray**: Additional information and context

### Summary Information
- **Passed Count**: Number of successful checks
- **Warnings Count**: Number of non-critical issues
- **Failed Count**: Number of critical failures
- **Critical Issues**: Must be fixed for proper functionality
- **Other Issues**: Recommended improvements

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "setup:validate": "node scripts/setup/validate-setup.js",
    "health-check": "node scripts/setup/validate-setup.js",
    "verify": "node scripts/setup/validate-setup.js"
  }
}
```

### Onboarding Workflow
```bash
# New developer setup
git clone project-repo
cd project-repo
npm install
npm run setup:validate

# Fix any critical issues
npm run setup:guided  # If AI configuration missing
npm run setup:hooks   # If git hooks missing

# Verify setup
npm run setup:validate
```

### CI/CD Integration
```yaml
# GitHub Actions workflow
- name: Validate Project Setup
  run: |
    node scripts/setup/validate-setup.js
    
- name: Setup Health Check
  run: |
    npm run setup:validate
```

### Pre-development Checks
```bash
# Before starting development
npm run setup:validate

# Ensure environment is ready
# Fix any issues before coding
```

### Team Health Monitoring
```bash
# Regular team health checks
npm run setup:validate > setup-health.log

# Monitor setup consistency across team
# Identify common setup issues
```

## Error Handling and Troubleshooting

### Common Issues

#### Node.js Version Too Old
```text
✗ Node.js version
  └─ Node.js v14.20.0 is too old (need v16+)
```
**Solutions**:
```bash
# Install Node.js v16+
# macOS: brew install node
# Windows: Download from nodejs.org
# Ubuntu: sudo snap install node --classic

# Verify installation
node --version
```

#### Missing Dependencies
```text
✗ node_modules exists
  └─ Dependencies not installed
```
**Solutions**:
```bash
# Install dependencies
npm install

# If npm install fails
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Invalid TypeScript Configuration
```text
✗ TypeScript config
  └─ tsconfig.json is invalid
```
**Solutions**:
```bash
# Validate JSON syntax
npx jsonlint tsconfig.json

# Check for common issues
cat tsconfig.json | grep -n ",$"  # Trailing commas

# Regenerate if needed
npx tsc --init
```

#### Missing Project Directories
```text
✗ Source directories
  └─ Missing directories: tools, templates
```
**Solutions**:
```bash
# Create missing directories
mkdir -p tools/generators tools/metrics tools/enforcement
mkdir -p templates/component templates/api templates/feature

# Or run guided setup
npm run setup:guided
```

### Debug Mode
Add debug logging by modifying the script:
```javascript
// Add before validation starts
console.log('Debug: Current directory:', process.cwd());
console.log('Debug: Node.js version:', process.version);
console.log('Debug: Available scripts:', Object.keys(pkg.scripts || {}));
```

## API and Programmatic Usage

### Node.js Integration
```javascript
const { spawn } = require('child_process');

// Run setup validation programmatically
function validateSetup() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/setup/validate-setup.js'], {
      stdio: 'pipe'
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      const results = parseValidationResults(output);
      if (code === 0) {
        resolve(results);
      } else {
        reject(new Error(`Validation failed with ${results.failed} issues`));
      }
    });
  });
}

function parseValidationResults(output) {
  // Parse summary section
  const summaryMatch = output.match(/Passed: (\d+).*Warnings: (\d+).*Failed: (\d+)/s);
  
  return {
    passed: parseInt(summaryMatch?.[1] || '0'),
    warnings: parseInt(summaryMatch?.[2] || '0'),
    failed: parseInt(summaryMatch?.[3] || '0'),
    success: !output.includes('❌ Setup validation failed')
  };
}

// Usage
try {
  const results = await validateSetup();
  console.log('Setup validation results:', results);
} catch (error) {
  console.error('Setup validation failed:', error.message);
}
```

### Custom Validation Checks
```javascript
// Extend SetupValidator with custom checks
const validator = new SetupValidator();

// Add custom check
validator.addCheck('Custom tool check', () => {
  if (fs.existsSync('tools/custom/my-tool.js')) {
    return { status: 'pass' };
  } else {
    return {
      status: 'warning',
      message: 'Custom tool not found',
      fix: 'Install custom tool: npm run install:custom'
    };
  }
}, { category: 'custom tools' });

// Run validation with custom checks
await validator.validate();
```

### Batch Project Validation
```javascript
const fs = require('fs');
const path = require('path');

// Validate multiple projects
const projects = ['./project1', './project2', './project3'];
const results = {};

for (const projectPath of projects) {
  console.log(`Validating ${projectPath}...`);
  
  const originalCwd = process.cwd();
  process.chdir(projectPath);
  
  try {
    const result = await validateSetup();
    results[projectPath] = result;
    console.log(`✅ ${projectPath}: ${result.passed} passed, ${result.failed} failed`);
  } catch (error) {
    results[projectPath] = { error: error.message };
    console.log(`❌ ${projectPath}: ${error.message}`);
  } finally {
    process.chdir(originalCwd);
  }
}

console.log('Batch validation results:', results);
```

## Development and Contributing

### Project Structure
```text
scripts/setup/validate-setup.js
├── SetupValidator class
├── Category-based check organization
├── Check definitions with criteria
├── Result collection and reporting
├── Color-coded output formatting
└── Summary generation
```

### Adding New Validation Checks
1. **Choose appropriate category**:
```javascript
// Add to existing category
validator.addCheck('New dependency check', checkFunction, { 
  category: 'dependencies', 
  critical: true 
});

// Or create new category
validator.addCheck('Security check', checkFunction, { 
  category: 'security', 
  critical: false 
});
```

2. **Implement check function**:
```javascript
function checkFunction() {
  // Perform validation logic
  if (validationPassed) {
    return { 
      status: 'pass', 
      info: 'Additional info about success' 
    };
  } else if (minorIssue) {
    return { 
      status: 'warning', 
      message: 'Warning description',
      fix: 'How to fix the warning' 
    };
  } else {
    return { 
      status: 'fail', 
      message: 'Error description',
      fix: 'How to fix the error' 
    };
  }
}
```

### Testing New Checks
```bash
# Test with different project states
# Remove dependencies
rm -rf node_modules

# Run validation
node scripts/setup/validate-setup.js

# Should show missing dependencies error

# Restore and test again
npm install
node scripts/setup/validate-setup.js

# Should pass dependencies check
```

### Optimal Practices for Checks
- **Clear messaging**: Provide specific, actionable error messages
- **Appropriate severity**: Use critical only for essential requirements
- **Helpful fixes**: Include specific commands or steps to resolve issues
- **Fast execution**: Keep checks lightweight and quick
- **Platform compatibility**: Ensure checks work on Windows, macOS, Linux

## Related Tools and Documentation

- **guided-setup.js**: Interactive setup wizard
- **ensure-claude-scripts.js**: Claude validation script installer
- **Setup Guides**: docs/guides/setup/ - Complete setup documentation
- **Onboarding Guide**: docs/guides/onboarding/new-developer.md
- **Project Health Monitoring**: docs/guides/maintenance/health-monitoring.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines