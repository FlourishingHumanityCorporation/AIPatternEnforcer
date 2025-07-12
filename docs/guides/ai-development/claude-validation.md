# Claude Code Validation Guide

**Purpose**: Comprehensive guide to validating Claude Code behavior and ensuring compliance with ProjectTemplate standards.

## Table of Contents

1. [Overview](#overview)
2. [Validation System Components](#validation-system-components)
3. [Running Validation](#running-validation)
4. [Understanding Results](#understanding-results)
5. [Common Issues and Solutions](#common-issues-and-solutions)
6. [Advanced Configuration](#advanced-configuration)
7. [Integration with Development Workflow](#integration-with-development-workflow)

## Overview

The Claude validation system ensures that Claude Code instances:
- Follow ProjectTemplate patterns and conventions
- Maintain consistent behavior across sessions
- Comply with security and quality standards
- Integrate properly with development tools

### Key Benefits

- **Consistency**: Ensures all Claude instances behave uniformly
- **Quality**: Validates adherence to coding standards
- **Security**: Checks for security pattern compliance
- **Integration**: Verifies tool and workflow integration

## Validation System Components

### Core Validation Tools

```bash
# Main validation commands
npm run claude:validate              # Run all validations
npm run claude:validate:batch        # Batch validation mode
npm run claude:test                  # Run compliance tests
npm run claude:validate-onboarding   # Validate onboarding completion
```

### Validation Categories

1. **Pattern Recognition**: Checks understanding of good/bad patterns
2. **Tool Integration**: Validates generator and workflow usage
3. **Security Compliance**: Ensures security-first development
4. **Code Quality**: Verifies coding standards adherence
5. **Documentation**: Checks documentation pattern compliance

## Running Validation

### Quick Validation

```bash
# Basic validation check
npm run claude:validate

# Check specific capabilities
npm run claude:capability:status

# Validate onboarding completion
npm run claude:validate-onboarding
```

### Comprehensive Validation

```bash
# Full system validation
npm run test:template
npm run validate
npm run check:all

# Claude-specific comprehensive check
npm run claude:validate && npm run claude:test && npm run claude:stats
```

### Interactive Validation

```bash
# Run pattern recognition quiz
npm run claude:quiz

# Test specific pattern areas
npm run claude:quiz:file-naming
npm run claude:quiz:code-gen
npm run claude:quiz:validation
npm run claude:quiz:security
```

## Understanding Results

### Validation Output Structure

```bash
✅ PASSED: Pattern Recognition (Score: 95/100)
✅ PASSED: Tool Integration (5/5 tools working)
⚠️  WARNING: Security Patterns (Score: 78/100)
❌ FAILED: Documentation Compliance (3 violations found)

Overall Score: 83/100 (Good)
Recommendation: Address documentation issues before production use
```

### Score Interpretation

- **90-100**: Excellent - Ready for production use
- **75-89**: Good - Minor improvements needed
- **60-74**: Fair - Significant improvements required
- **Below 60**: Poor - Major issues need resolution

### Common Warning Types

```bash
# Pattern Recognition Warnings
⚠️  Inconsistent generator usage detected
⚠️  Anti-pattern risk in file naming

# Security Warnings  
⚠️  Security consideration missing in authentication code
⚠️  Input validation pattern not applied

# Documentation Warnings
⚠️  Documentation style not following project standards
⚠️  Missing technical context in code explanations
```

## Common Issues and Solutions

### Tool Integration Failures

**Issue**: `Tool integration check failed`
```bash
# Symptoms
❌ Generator commands not recognized
❌ npm run g:c command failing
❌ Validation scripts not found
```

**Solutions**:
```bash
# 1. Verify npm scripts are available
npm run | grep -E "(g:c|validate|check)"

# 2. Reinstall dependencies
npm install

# 3. Reset and re-run onboarding
npm run claude:onboard --force
```

### Pattern Recognition Issues

**Issue**: `Low pattern recognition score`
```bash
# Symptoms
⚠️  Pattern Recognition (Score: 65/100)
❌ Anti-pattern detection failing
❌ Good pattern identification inconsistent
```

**Solutions**:
```bash
# 1. Review pattern library
cat ai/examples/anti-patterns/claude-code-specific/README.md

# 2. Run targeted training
npm run claude:quiz:validation
npm run claude:quiz:security

# 3. Study project patterns
npm run context -- docs/architecture/patterns/
```

### Security Compliance Problems

**Issue**: `Security pattern compliance low`
```bash
# Symptoms
❌ Security considerations missing
❌ Input validation not implemented
❌ Authentication patterns ignored
```

**Solutions**:
```bash
# 1. Review security guidelines
cat docs/guides/security/security-optimal-practices.md

# 2. Practice security patterns
npm run claude:quiz:security

# 3. Study security examples
cat ai/examples/good-patterns/security/
```

### Documentation Standards Issues

**Issue**: `Documentation style violations`
```bash
# Symptoms
❌ Announcement-style language detected
❌ Superlatives in technical descriptions
❌ Missing technical context
```

**Solutions**:
```bash
# 1. Review documentation standards
cat docs/guides/documentation/writing-standards.md

# 2. Check enforcement rules
npm run check:documentation-style

# 3. Practice technical writing
# - Use measured, factual language
# - Include technical context
# - Avoid marketing language
```

## Advanced Configuration

### Custom Validation Rules

```javascript
// tools/claude-validation/custom-rules.js
const customRules = {
  // Project-specific pattern validation
  projectPatterns: {
    weight: 0.3,
    rules: [
      'must use generators for component creation',
      'must include security considerations',
      'must follow TypeScript patterns'
    ]
  },
  
  // Custom security checks
  securityPatterns: {
    weight: 0.4,
    rules: [
      'input validation required',
      'authentication patterns enforced',
      'error handling secure'
    ]
  }
};

module.exports = customRules;
```

### Validation Thresholds

```json
// .claude/validation-config.json
{
  "thresholds": {
    "minimum_score": 75,
    "pattern_recognition": 80,
    "security_compliance": 90,
    "tool_integration": 100
  },
  "strict_mode": false,
  "auto_retry": true,
  "fail_fast": false
}
```

### Team Configuration

```bash
# Team-wide validation settings
npm run claude:config set validation.team_mode true
npm run claude:config set validation.shared_patterns true
npm run claude:config set validation.collective_learning true

# Export team configuration
npm run claude:config export > team-claude-config.json
```

## Integration with Development Workflow

### Pre-commit Validation

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run Claude validation before commits
npm run claude:validate --quiet || {
  echo "❌ Claude validation failed"
  echo "Run 'npm run claude:validate' to see details"
  exit 1
}
```

### CI/CD Integration

```yaml
# .github/workflows/claude-validation.yml
name: Claude Code Validation

on: [push, pull_request]

jobs:
  validate-claude:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run claude:validate
      - run: npm run claude:test
      
      - name: Upload validation report
        uses: actions/upload-artifact@v3
        with:
          name: claude-validation-report
          path: tools/claude-validation/.analytics/
```

### Development Integration

```typescript
// VSCode tasks.json - Add validation tasks
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Claude: Validate",
      "type": "shell",
      "command": "npm run claude:validate",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    },
    {
      "label": "Claude: Quick Check",
      "type": "shell", 
      "command": "npm run claude:capability:status",
      "group": "test"
    }
  ]
}
```

## Validation Best Practices

### Regular Validation Schedule

```bash
# Daily validation check
npm run claude:validate

# Weekly comprehensive validation
npm run claude:test && npm run claude:stats

# Before major changes
npm run test:template && npm run claude:validate:batch
```

### Troubleshooting Workflow

1. **Check System Status**
   ```bash
   npm run claude:config:status
   npm run claude:capability:status
   ```

2. **Run Diagnostics**
   ```bash
   npm run claude:validate --verbose
   npm run claude:test --debug
   ```

3. **Reset if Needed**
   ```bash
   npm run claude:onboard --force
   npm run setup:verify-ai
   ```

4. **Verify Resolution**
   ```bash
   npm run claude:validate
   npm run test:validation-suite
   ```

### Performance Optimization

```bash
# Quick validation for rapid feedback
npm run claude:validate --quick

# Parallel validation for speed
npm run claude:validate:batch --parallel

# Cached results for repeated checks
npm run claude:validate --use-cache
```

## Monitoring and Analytics

### Validation Metrics

```bash
# View validation history
npm run claude:analytics

# Export detailed metrics
npm run claude:analytics:export

# Generate validation dashboard
npm run claude:dashboard
```

### Performance Tracking

```bash
# Track validation performance over time
npm run claude:stats

# Compare validation results
npm run claude:validate --compare-previous

# Generate improvement recommendations
npm run claude:analytics summary
```

## Related Documentation

- [AI Assistant Setup](ai-assistant-setup.md) - Initial Claude Code setup
- [Claude Code Onboarding](../../onboarding/claude-code-level-1.md) - Level progression system
- [Enforcement System](../enforcement/ENFORCEMENT.md) - Overall enforcement framework
- [Security Optimal Practices](../security/security-optimal-practices.md) - Security validation details

---

**Validation Note**: Regular validation ensures Claude Code instances maintain high quality and consistency. Make validation part of your development routine for optimal results.