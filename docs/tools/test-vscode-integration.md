# Test VSCode Integration Script Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
  4. [Prerequisites](#prerequisites)
  5. [Installation](#installation)
  6. [Configuration](#configuration)
7. [Command Line Interface](#command-line-interface)
  8. [Basic Syntax](#basic-syntax)
  9. [Options](#options)
  10. [Examples](#examples)
11. [Test Categories](#test-categories)
  12. [1. Extension Installation](#1-extension-installation)
  13. [2. Command Registration](#2-command-registration)
  14. [3. Claude Validation Integration](#3-claude-validation-integration)
  15. [4. Documentation Features](#4-documentation-features)
  16. [5. Code Generation](#5-code-generation)
17. [Test Implementation](#test-implementation)
  18. [Extension Detection](#extension-detection)
  19. [Feature Testing](#feature-testing)
  20. [Configuration Validation](#configuration-validation)
21. [Output and Results](#output-and-results)
  22. [Success Output](#success-output)
  23. [Failure Output](#failure-output)
24. [Troubleshooting](#troubleshooting)
  25. [Common Issues](#common-issues)
    26. [Issue: "code: command not found"](#issue-code-command-not-found)
    27. [Issue: "Extension not loading"](#issue-extension-not-loading)
    28. [Issue: "Commands not available"](#issue-commands-not-available)
  29. [Debug Mode](#debug-mode)
30. [Performance Benchmarks](#performance-benchmarks)
  31. [Test Execution Times](#test-execution-times)
  32. [Resource Impact](#resource-impact)
33. [Integration with CI/CD](#integration-with-cicd)
  34. [GitHub Actions](#github-actions)
  35. [Local Development](#local-development)
36. [Extension Features Tested](#extension-features-tested)
  37. [1. Real-time Validation](#1-real-time-validation)
  38. [2. Code Generation](#2-code-generation)
  39. [3. Documentation Integration](#3-documentation-integration)
  40. [4. Enforcement Features](#4-enforcement-features)
41. [Optimal Practices](#optimal-practices)
  42. [Testing Guidelines](#testing-guidelines)
  43. [Extension Development](#extension-development)
44. [Related Documentation](#related-documentation)

## Overview

A comprehensive testing script that validates the ProjectTemplate VSCode extension integration. This script ensures that
the extension is properly installed, configured, and functioning correctly with all its features including Claude
validation, documentation enforcement, and code generation shortcuts.

**Tool Type**: Test Script  
**Language**: Shell/Bash  
**Dependencies**: VSCode CLI (`code`), Node.js, jq

## Quick Start

```bash
# Run all integration tests
./scripts/test-vscode-integration.sh

# Test specific feature
./scripts/test-vscode-integration.sh --feature validation

# Skip extension installation check
./scripts/test-vscode-integration.sh --skip-install-check
```

## Installation and Setup

### Prerequisites
- VSCode installed with `code` CLI available in PATH
- ProjectTemplate VSCode extension installed
- Node.js >=18.0.0
- jq for JSON parsing

### Installation
```bash
# Ensure VSCode CLI is available
code --version

# Install ProjectTemplate extension
code --install-extension ./extensions/projecttemplate-assistant/projecttemplate-assistant-0.0.1.vsix
```

### Configuration
The script checks for:
- Extension manifest at `extensions/projecttemplate-assistant/package.json`
- VSCode settings in `.vscode/settings.json`
- Extension configuration in user settings

## Command Line Interface

### Basic Syntax
```bash
./scripts/test-vscode-integration.sh [options]
```

### Options
- `--feature <name>`: Test specific feature (validation|generation|enforcement|commands)
- `--skip-install-check`: Skip extension installation verification
- `--verbose`: Enable detailed output
- `--report`: Generate test report
- `--fix`: Attempt to fix common issues

### Examples
```bash
# Full integration test
./scripts/test-vscode-integration.sh

# Test only validation features
./scripts/test-vscode-integration.sh --feature validation

# Generate detailed report
./scripts/test-vscode-integration.sh --report > vscode-integration-report.md

# Run with auto-fix
./scripts/test-vscode-integration.sh --fix
```

## Test Categories

### 1. Extension Installation
```bash
✓ Extension installed
✓ Extension activated
✓ Dependencies resolved
✓ Configuration loaded
```

### 2. Command Registration
Tests all extension commands:
- `projecttemplate.validateClaude`
- `projecttemplate.generateComponent`
- `projecttemplate.runEnforcement`
- `projecttemplate.showDocumentation`

### 3. Claude Validation Integration
```bash
✓ Claude validator accessible
✓ Real-time validation working
✓ Error highlighting functional
✓ Quick fixes available
```

### 4. Documentation Features
```bash
✓ Documentation lens providers
✓ Hover documentation
✓ Template suggestions
✓ Enforcement warnings
```

### 5. Code Generation
```bash
✓ Component generator command
✓ Template selection
✓ File creation
✓ Import management
```

## Test Implementation

### Extension Detection
```bash
# Check if extension is installed
if code --list-extensions | grep -q "projecttemplate-assistant"; then
  echo "✅ Extension installed"
else
  echo "❌ Extension not found"
fi
```

### Feature Testing
```javascript
// Test command execution
const result = await vscode.commands.executeCommand('projecttemplate.validateClaude');
assert(result.success, 'Claude validation should succeed');
```

### Configuration Validation
```bash
# Verify settings.json
if jq -e '.["projecttemplate.enableValidation"] == true' .vscode/settings.json > /dev/null; then
  echo "✅ Validation enabled"
fi
```

## Output and Results

### Success Output
```text
🔧 Testing VSCode Integration...

📦 Extension Status:
✅ ProjectTemplate Assistant installed (v0.0.1)
✅ Extension activated successfully
✅ All dependencies resolved

📝 Command Registration:
✅ projecttemplate.validateClaude
✅ projecttemplate.generateComponent
✅ projecttemplate.runEnforcement
✅ projecttemplate.showDocumentation

🔍 Feature Tests:
✅ Claude validation: Working
✅ Real-time linting: Active
✅ Documentation hover: Functional
✅ Code generation: Available

📊 Test Summary:
- Total Tests: 15
- Passed: 15
- Failed: 0
- Warnings: 0

✅ All integration tests passed!
```

### Failure Output
```text
❌ Integration Test Failures:

Extension Issues:
❌ Extension not installed
  Fix: code --install-extension ./extensions/projecttemplate-assistant/projecttemplate-assistant-0.0.1.vsix

Feature Failures:
❌ Claude validation not responding
  - Check: Extension logs in Output panel
  - Fix: Reload VSCode window

❌ Commands not registered
  - Check: Command palette (Cmd+Shift+P)
  - Fix: Reinstall extension

Run with --fix to attempt automatic fixes
```

## Troubleshooting

### Common Issues

#### Issue: "code: command not found"
**Solution**:
```bash
# macOS: Install code CLI from VSCode
# Open VSCode > Cmd+Shift+P > "Shell Command: Install 'code' command in PATH"

# Linux: Add to PATH
export PATH="$PATH:/usr/share/code/bin"

# Windows: Usually added automatically during install
```

#### Issue: "Extension not loading"
**Solution**:
```bash
# Check extension logs
code --verbose

# Reinstall extension
code --uninstall-extension projecttemplate-assistant
code --install-extension ./extensions/projecttemplate-assistant/projecttemplate-assistant-0.0.1.vsix

# Clear extension cache
rm -rf ~/.vscode/extensions/projecttemplate-assistant*
```

#### Issue: "Commands not available"
**Solution**:
1. Reload VSCode window: `Cmd+R` / `Ctrl+R`
2. Check Output panel for errors
3. Verify extension is enabled in Extensions view
4. Check for conflicting extensions

### Debug Mode
```bash
# Run with verbose output
DEBUG=vscode:* ./scripts/test-vscode-integration.sh --verbose

# Check extension logs
code --log-level debug

# Test specific command
./scripts/test-vscode-integration.sh --feature commands --verbose
```

## Performance Benchmarks

### Test Execution Times
- **Full Suite**: ~5-10 seconds
- **Single Feature**: ~1-2 seconds
- **Command Tests**: <500ms each
- **Validation Tests**: ~2-3 seconds

### Resource Impact
- **CPU**: Minimal during tests
- **Memory**: ~50MB for test process
- **VSCode Impact**: No noticeable slowdown

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Test VSCode Integration
  run: |
    # Install VSCode
    brew install --cask visual-studio-code
    
    # Install extension
    code --install-extension ./extensions/projecttemplate-assistant/*.vsix
    
    # Run tests
    ./scripts/test-vscode-integration.sh --report
```

### Local Development
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Test Extension Integration",
      "type": "shell",
      "command": "./scripts/test-vscode-integration.sh",
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

## Extension Features Tested

### 1. Real-time Validation
- Pattern detection in open files
- Error squiggles for violations
- Quick fix suggestions

### 2. Code Generation
- Component generator command
- Template selection UI
- File creation and formatting

### 3. Documentation Integration
- Hover providers for docs
- Code lens for missing docs
- Template suggestions

### 4. Enforcement Features
- Pre-save validation
- Commit hook integration
- Enforcement status bar

## Optimal Practices

### Testing Guidelines
1. Run tests after extension updates
2. Test in clean VSCode instance
3. Verify all features before release
4. Document any new test requirements

### Extension Development
1. Update tests when adding features
2. Test on multiple platforms
3. Verify backward compatibility
4. Check performance impact

## Related Documentation

- **Extension README**: `extensions/projecttemplate-assistant/README.md`
- **Extension Development**: `docs/guides/vscode-extension-development.md`
- **Integration Guide**: `docs/guides/ide-integration.md`
- **Testing Strategy**: `docs/testing/integration-testing.md`

---

**Last Updated**: 2025-07-12  
**Script Version**: 1.0.0  
**Maintainer**: ProjectTemplate Team  
**Extension Version**: 0.0.1