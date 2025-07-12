# Scripts Documentation

## Table of Contents

1. [Overview](#overview)
2. [Script Categories](#script-categories)
  3. [🚀 Onboarding Scripts](#-onboarding-scripts)
    4. [claude-code-self-onboarding.sh](#claude-code-self-onboardingsh)
    5. [validate-claude-onboarding.sh](#validate-claude-onboardingsh)
    6. [generator-demo.js](#generator-demojs)
    7. [generator-demo-simple.js](#generator-demo-simplejs)
    8. [guided-setup.js](#guided-setupjs)
  9. [🧪 Testing Scripts](#-testing-scripts)
    10. [test-vscode-integration.sh](#test-vscode-integrationsh)
    11. [check-progress.sh](#check-progresssh)
  12. [🤖 AI Development Scripts](#-ai-development-scripts)
    13. [claude-code-context.sh](#claude-code-contextsh)
  14. [🛠️ Development Scripts](#-development-scripts)
    15. [ai-context-dump.sh](#ai-context-dumpsh)
    16. [check-security.sh](#check-securitysh)
  17. [🔧 Setup Scripts](#-setup-scripts)
    18. [setup-simple-compliance.sh](#setup-simple-compliancesh)
  19. [📋 Validation Scripts](#-validation-scripts)
    20. [validate-docs.sh](#validate-docssh)
21. [Script Development Guidelines](#script-development-guidelines)
  22. [Creating New Scripts](#creating-new-scripts)
  23. [Optimal Practices](#optimal-practices)
24. [Common Script Patterns](#common-script-patterns)
  25. [Progress Tracking](#progress-tracking)
  26. [Configuration Loading](#configuration-loading)
  27. [Option Parsing](#option-parsing)
28. [Maintenance](#maintenance)
  29. [Regular Updates](#regular-updates)
  30. [Deprecation Process](#deprecation-process)

## Overview

This directory contains comprehensive documentation for all scripts in the ProjectTemplate. Scripts are organized by
category and purpose.

## Script Categories

### 🚀 Onboarding Scripts

#### claude-code-self-onboarding.sh
**Location**: `scripts/onboarding/claude-code-self-onboarding.sh`  
**Purpose**: Implements LEARN Framework for Claude Code AI onboarding  
**Documentation**: [Full Documentation](../tools/claude-code-self-onboarding.md)

```bash
./scripts/onboarding/claude-code-self-onboarding.sh
```

#### validate-claude-onboarding.sh
**Location**: `scripts/onboarding/validate-claude-onboarding.sh`  
**Purpose**: Validates successful Claude Code onboarding completion  
**Documentation**: [Full Documentation](../tools/validate-claude-onboarding.md)

```bash
./scripts/onboarding/validate-claude-onboarding.sh --report
```

#### generator-demo.js
**Location**: `scripts/onboarding/generator-demo.js`  
**Purpose**: Interactive demonstration of code generators  
**Usage**: 
```bash
node scripts/onboarding/generator-demo.js
```

#### generator-demo-simple.js
**Location**: `scripts/onboarding/generator-demo-simple.js`  
**Purpose**: Simplified generator demonstration for quick overview  
**Documentation**: [Full Documentation](../tools/generator-demo-simple.md)

```bash
node scripts/onboarding/generator-demo-simple.js
```

#### guided-setup.js
**Location**: `scripts/onboarding/guided-setup.js`  
**Purpose**: Interactive project setup wizard  
**Features**:
- Stack selection
- Configuration setup
- Dependency installation
- Initial file generation

```bash
node scripts/onboarding/guided-setup.js
```

### 🧪 Testing Scripts

#### test-vscode-integration.sh
**Location**: `scripts/test-vscode-integration.sh`  
**Purpose**: Validates VSCode extension integration  
**Documentation**: [Full Documentation](../tools/test-vscode-integration.md)

```bash
./scripts/test-vscode-integration.sh --feature validation
```

#### check-progress.sh
**Location**: `scripts/check-progress.sh`  
**Purpose**: Monitors learning path and onboarding progress  
**Features**:
- Progress tracking
- Milestone validation
- Completion reporting

```bash
./scripts/check-progress.sh
```

### 🤖 AI Development Scripts

#### claude-code-context.sh
**Location**: `scripts/ai/claude-code-context.sh`  
**Purpose**: Generates optimized context for Claude Code  
**Usage**:
```bash
# Full context
./scripts/ai/claude-code-context.sh

# Focused context
./scripts/ai/claude-code-context.sh --mode focused
```

### 🛠️ Development Scripts

#### ai-context-dump.sh
**Location**: `scripts/dev/ai-context-dump.sh`  
**Purpose**: Dumps current project context for AI assistants  
**Features**:
- File structure analysis
- Key file extraction
- Context optimization

```bash
./scripts/dev/ai-context-dump.sh
```

#### check-security.sh
**Location**: `scripts/dev/check-security.sh`  
**Purpose**: Security validation for dependencies and code  
**Checks**:
- Dependency vulnerabilities
- Security optimal practices
- Sensitive data exposure

```bash
./scripts/dev/check-security.sh
```

### 🔧 Setup Scripts

#### setup-simple-compliance.sh
**Location**: `scripts/setup-simple-compliance.sh`  
**Purpose**: Sets up basic compliance checking  
**Usage**:
```bash
bash scripts/setup-simple-compliance.sh
```

### 📋 Validation Scripts

#### validate-docs.sh
**Location**: `scripts/validate-docs.sh`  
**Purpose**: Validates documentation completeness and accuracy  
**Options**:
- `--ignore-external`: Skip external link validation
- `--fix`: Attempt to fix issues

```bash
# Validate all docs
./scripts/validate-docs.sh

# Fix issues
./scripts/validate-docs.sh --fix --ignore-external
```

## Script Development Guidelines

### Creating New Scripts

1. **Naming Convention**
   - Use kebab-case: `my-new-script.sh`
   - Be descriptive: `validate-component-structure.sh`
   - Include action verb: `check-`, `validate-`, `setup-`

2. **Script Structure**
   ```bash
   #!/bin/bash
   # Script: script-name.sh
   # Purpose: Brief description
   # Usage: ./script-name.sh [options]
   
   set -e  # Exit on error
   
   # Color definitions
   RED='\033[0;31m'
   GREEN='\033[0;32m'
   NC='\033[0m'
   
   # Functions
   log() { echo -e "${GREEN}[SCRIPT]${NC} $1"; }
   error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
   
   # Main logic
   ```

3. **Documentation Requirements**
   - Purpose statement
   - Usage examples
   - Options/arguments
   - Exit codes
   - Dependencies

### Optimal Practices

1. **Error Handling**
   - Use `set -e` for immediate exit on error
   - Provide clear error messages
   - Return meaningful exit codes

2. **Logging**
   - Use colored output for clarity
   - Log important steps
   - Provide progress indicators

3. **Portability**
   - Test on macOS and Linux
   - Avoid platform-specific commands
   - Document any requirements

4. **Testing**
   - Include `--dry-run` option when applicable
   - Validate inputs
   - Handle edge cases

## Common Script Patterns

### Progress Tracking
```bash
TOTAL_STEPS=5
CURRENT_STEP=0

step_complete() {
  ((CURRENT_STEP++))
  echo "Progress: $CURRENT_STEP/$TOTAL_STEPS"
}
```

### Configuration Loading
```bash
CONFIG_FILE="${CONFIG_FILE:-./config/default.conf}"
if [[ -f "$CONFIG_FILE" ]]; then
  source "$CONFIG_FILE"
fi
```

### Option Parsing
```bash
while [[ $# -gt 0 ]]; do
  case $1 in
    --verbose) VERBOSE=true; shift ;;
    --output=*) OUTPUT="${1#*=}"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done
```

## Maintenance

### Regular Updates
- Review scripts quarterly
- Update documentation with changes
- Test after dependency updates
- Maintain backward compatibility

### Deprecation Process
1. Add deprecation warning
2. Provide migration path
3. Support both versions temporarily
4. Remove after grace period

---

**Last Updated**: 2025-07-12  
**Maintainer**: ProjectTemplate Team  
**Contributing**: See [Contributing Guide](../../CONTRIBUTING.md)