# Claude Code Validator Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Command Line Interface](#command-line-interface)
5. [Validation Rules and Patterns](#validation-rules-and-patterns)
6. [Usage Examples](#usage-examples)
7. [Output and Results](#output-and-results)
8. [Integration with Development Workflow](#integration-with-development-workflow)
9. [Configuration](#configuration)
10. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
11. [API and Programmatic Usage](#api-and-programmatic-usage)
12. [Development and Contributing](#development-and-contributing)

## Overview

CLI tool that validates Claude Code responses against ProjectTemplate rules to ensure consistent behavior across
development sessions. Helps maintain quality standards and catches common violations before they impact development
workflow.

**Tool Type**: CLI Validation Tool  
**Language**: JavaScript (Node.js)  
**Dependencies**: `ComplianceValidator`, `AnalyticsTracker`, `fs`, `path`  
**Location**: `tools/claude-validation/validate-claude.js`

## Quick Start

```bash
# Validate response from clipboard (most common workflow)
pbpaste | npm run claude:validate

# Validate a complex implementation request
validate-claude response.txt --complex

# Validate simple query
echo "Use useState hook" | validate-claude - --simple

# Show compliance statistics
validate-claude --stats

# Silent validation for automation
validate-claude response.txt --quiet && echo "Passed"
```

## Installation and Setup

### Prerequisites
- Node.js 18+ required
- ProjectTemplate base installation
- Claude Code validation configuration
- Access to clipboard tools (pbpaste on macOS)

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # Installs all dependencies including validation tools
```

### Configuration
The tool reads from `.claude-validation-config.json`:
```bash
# Check configuration status
npm run claude:config:status

# Edit configuration if needed
nano tools/claude-validation/.claude-validation-config.json
```

## Command Line Interface

### Basic Syntax
```bash
validate-claude [response-file] [options]
```

### Options
- `--complex`: Mark as complex request (expects prompt improvement)
- `--simple`: Mark as simple query (expects concise response)
- `--stats`: Show compliance statistics summary
- `--quiet`: Only show pass/fail result (for scripting)
- `--help`: Show detailed help message

### Input Methods
```bash
# Read from file
validate-claude response.txt

# Read from stdin (pipe input)
pbpaste | validate-claude -
echo "response text" | validate-claude -

# Read from standard input (interactive)
validate-claude  # then type/paste response
```

## Validation Rules and Patterns

### Key Patterns Checked

#### 1. Prompt Improvement (Complex Requests)
**Rule**: Complex implementation requests should start with prompt improvement  
**Expected**: `**Improved Prompt**: [clear description of task]`  
**Violation**: Starting implementation immediately without clarifying requirements

#### 2. No Version Files
**Rule**: Never create versioned files with suffixes  
**Expected**: Edit original files directly  
**Violation**: Creating new file versions instead of editing originals

#### 3. Generator Usage
**Rule**: Use generators for new components  
**Expected**: `npm run g:c ComponentName`  
**Violation**: Manually creating component files without generators

#### 4. TodoWrite Usage
**Rule**: Use TodoWrite tool for multi-step tasks  
**Expected**: Task planning and progress tracking  
**Violation**: Starting complex tasks without breaking them down

#### 5. Concise Responses
**Rule**: Simple queries should get concise responses  
**Expected**: Direct answers without unnecessary elaboration  
**Violation**: Verbose explanations for simple questions

### Severity Levels
- **CRITICAL**: Must be fixed (blocks development)
- **HIGH**: Should be fixed (impacts quality)
- **MEDIUM**: Good to fix (improves consistency)
- **LOW**: Consider fixing (minor improvements)

## Usage Examples

### Example 1: Typical Development Workflow
```bash
# 1. Ask Claude Code a question
# 2. Copy response to clipboard
# 3. Validate the response
pbpaste | validate-claude - --complex

# Expected output:
🔍 Validation Results:
Score: 85%
✅ PASSED

Warnings:
  • Consider using TodoWrite for multi-step tasks

💡 How to Fix:
  • Use TodoWrite tool for multi-step tasks to track progress
```

### Example 2: Failed Validation Example
```bash
echo "I'll create auth-backup.js with better error handling" | validate-claude - --complex

# Output:
🔍 Validation Results:
Score: 45%
❌ FAILED

Violations:
  • Creating versioned files with suffixes is prohibited (CRITICAL)
  • Complex request should start with prompt improvement (HIGH)

💡 How to Fix:
  • Edit original files instead of creating new versions (edit auth.js directly)
  • Start complex requests with "**Improved Prompt**: [clear description of task]"

📚 Resources:
  • Config: npm run claude:config:status
  • Dashboard: npm run claude:dashboard
  • Test patterns: npm run claude:test
```

### Example 3: Statistics and Analytics
```bash
validate-claude --stats

# Output:
📊 Compliance Statistics:
Total Validations: 47
Passed: 38
Compliance Rate: 80.9%

Top Violations:
  promptImprovement: 12 times
  noImprovedFiles: 8 times
  todoWriteUsage: 5 times
  generatorUsage: 3 times
```

### Example 4: Automated Validation
```bash
# In a script or CI/CD pipeline
if validate-claude response.txt --quiet; then
    echo "Response follows ProjectTemplate standards"
    # Proceed with implementation
else
    echo "Response needs adjustment"
    exit 1
fi
```

## Output and Results

### Successful Validation
```text
🔍 Validation Results:
Score: 92%
✅ PASSED

Warnings:
  • Consider adding more specific error messages

💡 How to Fix:
  • Use --complex for implementation requests or --simple for quick questions
```

### Failed Validation
```text
🔍 Validation Results:
Score: 35%
❌ FAILED

Violations:
  • Creating versioned files with suffixes is prohibited (CRITICAL)
  • Complex request should start with prompt improvement (HIGH)
  • Missing TodoWrite usage for multi-step task (MEDIUM)

Warnings:
  • Response could be more concise for simple query

💡 How to Fix:
  • Edit original files instead of creating new versions
  • Start complex requests with "**Improved Prompt**: [clear description]"
  • Use TodoWrite tool for multi-step tasks to track progress
  • Review CLAUDE.md for detailed rules and patterns

📚 Resources:
  • Config: npm run claude:config:status
  • Dashboard: npm run claude:dashboard
  • Test patterns: npm run claude:test
```

### Exit Codes
- `0`: Validation passed
- `1`: Validation failed (rule violations)
- `2`: Error occurred (invalid input/configuration)

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "claude:validate": "validate-claude -",
    "claude:validate:complex": "validate-claude - --complex",
    "claude:validate:simple": "validate-claude - --simple",
    "claude:stats": "validate-claude --stats",
    "claude:dashboard": "open tools/claude-validation/dashboard.html"
  }
}
```

### Typical Workflow
```bash
# 1. Ask Claude Code to implement a feature
# 2. Copy the response
# 3. Validate before implementing
pbpaste | npm run claude:validate:complex

# 4. If passed, proceed with implementation
# 5. If failed, adjust prompt and try again
```

### Pre-Implementation Hook
```bash
# Create a pre-implementation check
#!/bin/bash
# pre-implement.sh

echo "Validating Claude Code response..."
if pbpaste | validate-claude - --complex; then
    echo "✅ Response validated. Proceeding with implementation."
else
    echo "❌ Response needs adjustment. Please refine your prompt."
    exit 1
fi
```

### IDE Integration
```bash
# For VS Code, add as task in .vscode/tasks.json
{
  "label": "Validate Claude Response",
  "type": "shell",
  "command": "pbpaste | validate-claude - --complex",
  "group": "test",
  "presentation": {
    "echo": true,
    "reveal": "always",
    "focus": false,
    "panel": "shared"
  }
}
```

## Configuration

### Configuration File Location
```text
tools/claude-validation/.claude-validation-config.json
```

### Configuration Options
```json
{
  "rules": {
    "promptImprovement": {
      "enabled": true,
      "severity": "HIGH",
      "complexRequestsOnly": true
    },
    "noImprovedFiles": {
      "enabled": true,
      "severity": "CRITICAL",
      "patterns": ["*-backup.*", "*-copy.*", "*-temp.*"]
    },
    "generatorUsage": {
      "enabled": true,
      "severity": "MEDIUM",
      "componentPatterns": ["component", "page", "hook"]
    },
    "todoWriteUsage": {
      "enabled": true,
      "severity": "MEDIUM",
      "multiStepThreshold": 3
    },
    "conciseResponses": {
      "enabled": true,
      "severity": "LOW",
      "simpleQueriesOnly": true
    }
  },
  "scoring": {
    "passingScore": 70,
    "weights": {
      "CRITICAL": 40,
      "HIGH": 25,
      "MEDIUM": 15,
      "LOW": 5
    }
  },
  "analytics": {
    "enabled": true,
    "trackTiming": true,
    "saveHistory": true
  }
}
```

### Custom Rules
```json
{
  "customRules": [
    {
      "name": "requireDocumentation",
      "pattern": "new (component|function|class)",
      "severity": "MEDIUM",
      "message": "New code should include documentation"
    }
  ]
}
```

## Error Handling and Troubleshooting

### Common Issues

#### Configuration Not Found
```text
Error: Configuration file not found
```
**Solution**:
```bash
# Check if config exists
ls tools/claude-validation/.claude-validation-config.json

# Create default config if missing
npm run claude:config:init
```

#### Input Reading Errors
```text
Error reading input: ENOENT: no such file or directory
```
**Solutions**:
```bash
# Check file exists
ls response.txt

# Use correct input method
pbpaste | validate-claude -  # For clipboard
cat response.txt | validate-claude -  # For file
```

#### Permission Errors
```text
Error: EACCES: permission denied
```
**Solutions**:
```bash
# Fix script permissions
chmod +x tools/claude-validation/validate-claude.js

# Check file access
ls -la tools/claude-validation/
```

### Debug Mode
Enable verbose logging:
```bash
# Set debug environment variable
DEBUG=claude-validation validate-claude response.txt --complex

# Or modify script temporarily to add logging
```

## API and Programmatic Usage

### Node.js Integration
```javascript
const validator = require('./tools/claude-validation/validate-claude');

// Basic validation
const results = await validator.main();

// Programmatic validation
const ComplianceValidator = require('./tools/claude-validation/compliance-validator');
const validator = new ComplianceValidator();

const results = validator.validate(responseText, {
  isComplexRequest: true,
  isSimpleQuery: false
});

console.log('Validation passed:', results.passed);
console.log('Score:', results.score);
console.log('Violations:', results.violations);
```

### Batch Validation
```javascript
const fs = require('fs');
const path = require('path');
const { main } = require('./tools/claude-validation/validate-claude');

// Validate multiple responses
const responses = fs.readdirSync('./responses/');
const results = [];

for (const responseFile of responses) {
  process.argv = ['node', 'validate-claude', path.join('./responses/', responseFile), '--complex'];
  
  try {
    const result = await main();
    results.push({ file: responseFile, passed: result.passed });
  } catch (error) {
    results.push({ file: responseFile, error: error.message });
  }
}

console.log('Batch validation results:', results);
```

### Custom Validation Rules
```javascript
const ComplianceValidator = require('./tools/claude-validation/compliance-validator');

class CustomValidator extends ComplianceValidator {
  validateCustomRule(responseText, context) {
    // Add your custom validation logic
    const violations = [];
    
    if (responseText.includes('TODO: implement later')) {
      violations.push({
        rule: 'noPlaceholderComments',
        severity: 'MEDIUM',
        description: 'Avoid placeholder TODO comments in responses'
      });
    }
    
    return violations;
  }
}

const validator = new CustomValidator();
const results = validator.validate(responseText, context);
```

## Development and Contributing

### Project Structure
```text
tools/claude-validation/
├── validate-claude.js          # Main CLI tool
├── compliance-validator.js     # Core validation logic
├── analytics-tracker.js        # Usage analytics
├── .claude-validation-config.json  # Configuration
├── .compliance-stats.json      # Statistics storage
└── dashboard.html              # Visual dashboard
```

### Adding New Validation Rules
1. **Define Rule in Configuration**:
```json
{
  "newRule": {
    "enabled": true,
    "severity": "MEDIUM",
    "description": "Description of what this rule checks"
  }
}
```

2. **Implement Rule Logic**:
```javascript
// In compliance-validator.js
validateNewRule(responseText, context) {
  const violations = [];
  
  // Your validation logic here
  if (ruleViolated) {
    violations.push({
      rule: 'newRule',
      severity: 'MEDIUM',
      description: 'Specific violation message'
    });
  }
  
  return violations;
}
```

3. **Add Tests**:
```javascript
// In test files
test('newRule validation', () => {
  const validator = new ComplianceValidator();
  const result = validator.validate('violating response', {});
  
  expect(result.violations).toContain(
    expect.objectContaining({ rule: 'newRule' })
  );
});
```

### Testing Guidelines
```bash
# Run validation tests
npm run test:claude-validation

# Test with sample responses
npm run claude:test

# Validate against test patterns
ls test-responses/ | xargs -I {} validate-claude test-responses/{} --complex
```

## Related Tools and Documentation

- **compliance-validator.js**: Core validation logic implementation
- **analytics-tracker.js**: Usage analytics and tracking
- **dashboard.html**: Visual compliance dashboard
- **CLAUDE.md**: Complete ProjectTemplate rules and guidelines
- **Claude Code Setup Guide**: docs/guides/ai-development/claude-validation.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines