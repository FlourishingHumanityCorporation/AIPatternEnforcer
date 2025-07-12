# Validate Claude Onboarding Script Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
  4. [Prerequisites](#prerequisites)
  5. [Installation](#installation)
  6. [State Dependencies](#state-dependencies)
7. [Command Line Interface](#command-line-interface)
  8. [Basic Syntax](#basic-syntax)
  9. [Options](#options)
  10. [Examples](#examples)
11. [Validation Checks](#validation-checks)
  12. [Phase Completion Validation](#phase-completion-validation)
    13. [L - Load Phase](#l---load-phase)
    14. [E - Explore Phase  ](#e---explore-phase-)
    15. [A - Assess Phase](#a---assess-phase)
    16. [R - Reinforce Phase](#r---reinforce-phase)
    17. [N - Navigate Phase](#n---navigate-phase)
  18. [Behavioral Validation](#behavioral-validation)
19. [Output Formats](#output-formats)
  20. [Standard Output](#standard-output)
  21. [JSON Output Format](#json-output-format)
  22. [Report Generation](#report-generation)
23. [Integration with CI/CD](#integration-with-cicd)
  24. [GitHub Actions](#github-actions)
  25. [Pre-deployment Checks](#pre-deployment-checks)
26. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
  27. [Common Errors](#common-errors)
    28. [Error: "Onboarding state file not found"](#error-onboarding-state-file-not-found)
    29. [Error: "Invalid JSON in state file"](#error-invalid-json-in-state-file)
    30. [Warning: "Phase partially complete"](#warning-phase-partially-complete)
  31. [Debug Mode](#debug-mode)
32. [Validation Rules and Thresholds](#validation-rules-and-thresholds)
  33. [Pass Criteria](#pass-criteria)
  34. [Warning Conditions](#warning-conditions)
  35. [Failure Conditions](#failure-conditions)
36. [Performance Metrics](#performance-metrics)
  37. [Execution Time](#execution-time)
  38. [Resource Usage](#resource-usage)
39. [Related Tools and Documentation](#related-tools-and-documentation)

## Overview

A validation script that verifies successful completion of Claude Code onboarding process. It checks that all LEARN
Framework phases were completed, validates understanding through behavioral tests, and ensures the AI assistant is
properly configured for the ProjectTemplate environment.

**Tool Type**: Shell Script/Validator  
**Language**: Bash  
**Dependencies**: Node.js, jq (JSON processor), git

## Quick Start

```bash
# Validate onboarding completion
./scripts/onboarding/validate-claude-onboarding.sh

# Check specific phase
./scripts/onboarding/validate-claude-onboarding.sh --phase assess

# Generate validation report
./scripts/onboarding/validate-claude-onboarding.sh --report
```

## Installation and Setup

### Prerequisites
- Completed `claude-code-self-onboarding.sh` execution
- Node.js >=18.0.0
- jq installed for JSON parsing
- Valid onboarding state file at `tools/metrics/claude-onboarding-state.json`

### Installation
The script is included in ProjectTemplate. No additional installation required.

### State Dependencies
Reads from:
- `tools/metrics/claude-onboarding-state.json`
- `tools/metrics/pattern-quiz-results.json`
- `tools/claude-validation/.compliance-stats.json`

## Command Line Interface

### Basic Syntax
```bash
./scripts/onboarding/validate-claude-onboarding.sh [options]
```

### Options
- `--phase <phase>`: Validate specific LEARN phase (load|explore|assess|reinforce|navigate)
- `--report`: Generate detailed validation report
- `--quiet`: Suppress output, exit code only
- `--json`: Output results in JSON format
- `--strict`: Fail on any warnings (not just errors)

### Examples
```bash
# Basic validation
./scripts/onboarding/validate-claude-onboarding.sh

# Check only assessment phase
./scripts/onboarding/validate-claude-onboarding.sh --phase assess

# Generate JSON report for CI/CD
./scripts/onboarding/validate-claude-onboarding.sh --json > validation-report.json

# Strict mode for pre-deployment
./scripts/onboarding/validate-claude-onboarding.sh --strict
```

## Validation Checks

### Phase Completion Validation

#### L - Load Phase
- Verifies CLAUDE.md was read
- Checks AI configuration files loaded
- Validates context window optimization

#### E - Explore Phase  
- Confirms project structure mapped
- Verifies tool discovery completed
- Checks generator awareness

#### A - Assess Phase
- Validates pattern quiz completion
- Checks minimum score threshold (70%)
- Verifies anti-pattern recognition

#### R - Reinforce Phase
- Confirms practice exercises completed
- Validates generated components
- Checks enforcement rule application

#### N - Navigate Phase
- Verifies resource mapping
- Confirms documentation paths known
- Validates help command awareness

### Behavioral Validation

```bash
# Behavioral checks performed:
1. Pattern Recognition
   - Can identify anti-patterns
   - Knows enforcement rules
   - Understands project standards

2. Tool Usage
   - Can use generators correctly
   - Applies templates properly
   - Runs validation commands

3. Navigation Skills
   - Finds documentation efficiently
   - Knows command shortcuts
   - Accesses help resources
```

## Output Formats

### Standard Output
```text
🔍 Validating Claude Code Onboarding...

✅ Load Phase: Complete (45s)
✅ Explore Phase: Complete (120s)
✅ Assess Phase: Complete (180s, score: 85%)
⚠️  Reinforce Phase: Partially complete
❌ Navigate Phase: Not completed

📊 Overall Status: INCOMPLETE
- Completed: 3/5 phases
- Time Elapsed: 5m 45s
- Compliance Score: 82%

⚠️  Warnings:
- Component generation not verified
- Resource navigation incomplete

❌ Validation Failed: 2 phases incomplete
```

### JSON Output Format
```json
{
  "validation": {
    "timestamp": "2025-07-12T06:00:00Z",
    "overall_status": "incomplete",
    "phases": {
      "load": {
        "completed": true,
        "duration": 45,
        "status": "pass"
      },
      "explore": {
        "completed": true,
        "duration": 120,
        "status": "pass"
      },
      "assess": {
        "completed": true,
        "duration": 180,
        "score": 85,
        "status": "pass"
      },
      "reinforce": {
        "completed": false,
        "status": "partial",
        "missing": ["component_generation"]
      },
      "navigate": {
        "completed": false,
        "status": "fail"
      }
    },
    "metrics": {
      "phases_completed": 3,
      "total_phases": 5,
      "completion_percentage": 60,
      "total_duration": 345,
      "compliance_score": 82
    },
    "warnings": [
      "Component generation not verified",
      "Resource navigation incomplete"
    ],
    "errors": [
      "Navigate phase not completed"
    ]
  }
}
```

### Report Generation
```bash
# Generate comprehensive report
./scripts/onboarding/validate-claude-onboarding.sh --report > onboarding-validation-report.md

# Report includes:
- Phase-by-phase breakdown
- Performance metrics
- Compliance scoring
- Recommendations for completion
- Historical comparison
```

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Validate Claude Onboarding
  run: |
    ./scripts/onboarding/validate-claude-onboarding.sh --json > validation.json
    score=$(jq -r '.validation.metrics.compliance_score' validation.json)
    if [ "$score" -lt 80 ]; then
      echo "❌ Onboarding validation failed: score $score < 80"
      exit 1
    fi
```

### Pre-deployment Checks
```bash
#!/bin/bash
# pre-deploy-validation.sh

# Ensure Claude is properly onboarded
if ! ./scripts/onboarding/validate-claude-onboarding.sh --strict --quiet; then
  echo "Claude onboarding validation failed. Run onboarding first."
  exit 1
fi

echo "✅ Claude onboarding validated"
```

## Error Handling and Troubleshooting

### Common Errors

#### Error: "Onboarding state file not found"
**Cause**: Onboarding not run or state file deleted  
**Solution**:
```bash
# Run onboarding first
./scripts/onboarding/claude-code-self-onboarding.sh

# Or check file location
ls -la tools/metrics/claude-onboarding-state.json
```

#### Error: "Invalid JSON in state file"
**Cause**: Corrupted state file  
**Solution**:
```bash
# Validate JSON
jq . tools/metrics/claude-onboarding-state.json

# Reset if corrupted
rm tools/metrics/claude-onboarding-state.json
./scripts/onboarding/claude-code-self-onboarding.sh --reset
```

#### Warning: "Phase partially complete"
**Cause**: Some phase requirements not met  
**Solution**:
```bash
# Get detailed phase info
./scripts/onboarding/validate-claude-onboarding.sh --phase reinforce --report

# Resume onboarding from checkpoint
./scripts/onboarding/claude-code-self-onboarding.sh --resume
```

### Debug Mode
```bash
# Enable verbose debugging
DEBUG=validate:* ./scripts/onboarding/validate-claude-onboarding.sh

# Check specific validation logic
DEBUG=validate:assess ./scripts/onboarding/validate-claude-onboarding.sh --phase assess
```

## Validation Rules and Thresholds

### Pass Criteria
- All 5 LEARN phases completed
- Assessment score ≥ 70%
- Compliance score ≥ 80%
- No critical errors
- All required files accessible

### Warning Conditions
- Phase duration > expected
- Score between 70-79%
- Missing optional components
- Non-critical file access issues

### Failure Conditions
- Any phase not completed
- Assessment score < 70%
- State file corruption
- Critical tool missing

## Performance Metrics

### Execution Time
- **Quick Check**: <100ms
- **Full Validation**: <500ms
- **Report Generation**: <1s

### Resource Usage
- **Memory**: <20MB
- **CPU**: Minimal
- **Disk I/O**: Read-only operations

## Related Tools and Documentation

- **Onboarding Script**: `claude-code-self-onboarding.sh` - Main onboarding process
- **Pattern Quiz**: `tools/onboarding/pattern-quiz.js` - Assessment component
- **Capability Tracker**: `tools/onboarding/capability-tracker.js` - Progress tracking
- **Compliance Validator**: `tools/claude-validation/compliance-validator.js` - Compliance checks

---

**Last Updated**: 2025-07-12  
**Script Version**: 1.0.0  
**Maintainer**: ProjectTemplate Team  
**Support**: See [Claude Validation Guide](../guides/ai-development/claude-validation.md)