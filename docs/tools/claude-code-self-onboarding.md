# Claude Code Self-Onboarding Script Documentation

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
10. [LEARN Framework Implementation](#learn-framework-implementation)
  11. [L - Load Context Files](#l---load-context-files)
  12. [E - Explore Project Structure](#e---explore-project-structure)
  13. [A - Assess Through Testing](#a---assess-through-testing)
  14. [R - Reinforce With Practice](#r---reinforce-with-practice)
  15. [N - Navigate to Resources](#n---navigate-to-resources)
16. [Output and Results](#output-and-results)
  17. [Progress Tracking](#progress-tracking)
  18. [Console Output](#console-output)
  19. [Exit Codes](#exit-codes)
20. [Integration with Development Workflow](#integration-with-development-workflow)
  21. [NPM Scripts](#npm-scripts)
  22. [CI/CD Integration](#cicd-integration)
  23. [IDE Integration](#ide-integration)
24. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
  25. [Common Errors](#common-errors)
    26. [Error: "CLAUDE.md not found"](#error-claudemd-not-found)
    27. [Error: "State file corrupted"](#error-state-file-corrupted)
    28. [Error: "Pattern quiz failed"](#error-pattern-quiz-failed)
  29. [Debug Mode](#debug-mode)
30. [Performance and Optimization](#performance-and-optimization)
  31. [Performance Characteristics](#performance-characteristics)
  32. [Optimization Tips](#optimization-tips)
33. [Related Tools and Documentation](#related-tools-and-documentation)
34. [Version History and Migration](#version-history-and-migration)
  35. [Current Version: 1.0.0](#current-version-100)
  36. [Recent Changes](#recent-changes)
  37. [Future Enhancements](#future-enhancements)

## Overview

A comprehensive onboarding script that implements the LEARN Framework to automatically onboard fresh Claude Code
instances to the ProjectTemplate codebase. This script ensures consistent, thorough familiarization with project
patterns, standards, and workflows.

**Tool Type**: Shell Script  
**Language**: Bash  
**Dependencies**: Node.js, npm, git, standard Unix utilities

## Quick Start

```bash
# Basic usage
./scripts/onboarding/claude-code-self-onboarding.sh

# Or via npm (if configured)
npm run onboard:claude-code
```

## Installation and Setup

### Prerequisites
- Node.js >=18.0.0
- npm >=9.0.0
- Bash shell
- Git repository initialized
- ProjectTemplate dependencies installed

### Installation
The script is included in the ProjectTemplate repository. No additional installation required.

### Configuration
The script automatically creates and manages its state in:
```bash
tools/metrics/claude-onboarding-state.json
```

## Command Line Interface

### Basic Syntax
```bash
./scripts/onboarding/claude-code-self-onboarding.sh [options]
```

### Options
- `--help, -h`: Show help information
- `--skip-tests`: Skip test execution during onboarding
- `--verbose`: Enable detailed output
- `--reset`: Reset onboarding state and start fresh

## LEARN Framework Implementation

### L - Load Context Files
**Purpose**: Load essential project files into Claude's context

The script automatically:
- Reads `CLAUDE.md` for AI-specific instructions
- Loads `QUICK-START.md` for project overview
- Ingests `.cursorrules` and AI configurations
- Presents project structure and key patterns

### E - Explore Project Structure
**Purpose**: Navigate and understand the codebase organization

Activities:
- Analyzes directory structure
- Maps tool locations and purposes
- Identifies generator scripts
- Catalogs enforcement mechanisms

### A - Assess Through Testing
**Purpose**: Validate understanding through practical tests

Tests include:
- Pattern recognition quiz
- Anti-pattern identification
- Documentation standard checks
- Code generation practice

### R - Reinforce With Practice
**Purpose**: Apply knowledge through hands-on tasks

Practice exercises:
- Generate a component using enhanced generator
- Run enforcement checks
- Create documentation following templates
- Fix identified anti-patterns

### N - Navigate to Resources
**Purpose**: Establish reference pathways for ongoing work

Resources mapped:
- Documentation index locations
- Generator command references
- Enforcement rule documentation
- Troubleshooting guides

## Output and Results

### Progress Tracking
The script maintains detailed progress in JSON format:

```json
{
  "sessionId": "1736654400",
  "startTime": "2025-07-12T05:00:00Z",
  "phases": {
    "load": {"completed": true, "duration": 45},
    "explore": {"completed": true, "duration": 120},
    "assess": {"completed": true, "duration": 180},
    "reinforce": {"completed": false, "duration": null},
    "navigate": {"completed": false, "duration": null}
  },
  "level": 2,
  "score": 85,
  "completedAt": null
}
```

### Console Output
```text
[Claude Code Onboarding] Starting LEARN Framework onboarding...
✅ CLAUDE.md loaded successfully
✅ Project structure analyzed
⚠️ Pattern quiz: 8/10 correct
✅ Component generation successful
✅ Navigation paths established

📊 Onboarding Summary:
- Completion: 100%
- Score: 85/100
- Time: 8m 30s
- Level: Advanced
```

### Exit Codes
- `0`: Successful onboarding completion
- `1`: Critical file missing
- `2`: Test failures below threshold
- `3`: State file corruption
- `4`: Dependency check failed

## Integration with Development Workflow

### NPM Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "onboard:claude-code": "./scripts/onboarding/claude-code-self-onboarding.sh",
    "onboard:reset": "./scripts/onboarding/claude-code-self-onboarding.sh --reset"
  }
}
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Validate Claude Code Onboarding
  run: |
    ./scripts/onboarding/validate-claude-onboarding.sh
    npm run check:claude-patterns
```

### IDE Integration
The script creates IDE-specific configuration awareness:
- Updates `.claude/settings.json` with project rules
- Validates `.cursorrules` compliance
- Ensures AI context optimization

## Error Handling and Troubleshooting

### Common Errors

#### Error: "CLAUDE.md not found"
**Cause**: Essential instruction file missing  
**Solution**: 
```bash
# Ensure you're in project root
pwd
# Should show /path/to/ProjectTemplate

# Check file exists
ls -la CLAUDE.md
```

#### Error: "State file corrupted"
**Cause**: Interrupted onboarding session  
**Solution**:
```bash
# Reset onboarding state
./scripts/onboarding/claude-code-self-onboarding.sh --reset

# Or manually remove state
rm tools/metrics/claude-onboarding-state.json
```

#### Error: "Pattern quiz failed"
**Cause**: Score below 70% threshold  
**Solution**:
- Review anti-patterns in `ai/examples/anti-patterns/`
- Study `CLAUDE.md` critical rules section
- Re-run specific phase: `--phase assess`

### Debug Mode
```bash
# Enable verbose debugging
DEBUG=claude:onboarding:* ./scripts/onboarding/claude-code-self-onboarding.sh --verbose

# Check state at any time
cat tools/metrics/claude-onboarding-state.json | jq '.'
```

## Performance and Optimization

### Performance Characteristics
- **Full Run**: ~5-10 minutes
- **Memory Usage**: <50MB
- **Disk I/O**: Minimal (reads project files)

### Optimization Tips
1. **Skip Tests**: Use `--skip-tests` for faster runs
2. **Partial Runs**: Resume from saved state automatically
3. **Cached Results**: Previous quiz results are preserved

## Related Tools and Documentation

- **Validation Script**: `validate-claude-onboarding.sh` - Verify onboarding completion
- **Pattern Quiz**: `tools/onboarding/pattern-quiz.js` - Interactive pattern testing
- **Capability Tracker**: `tools/onboarding/capability-tracker.js` - Track AI understanding
- **CLAUDE.md**: Primary AI instruction reference

## Version History and Migration

### Current Version: 1.0.0

### Recent Changes
- **1.0.0**: Initial LEARN Framework implementation
- **0.9.0**: Beta testing with pattern recognition
- **0.8.0**: State tracking added

### Future Enhancements
- Adaptive difficulty based on performance
- Integration with more AI platforms
- Custom onboarding paths per role

---

**Last Updated**: 2025-07-12  
**Script Version**: 1.0.0  
**Maintainer**: ProjectTemplate Team  
**Support**: See [AI Development Guide](../guides/ai-development/ai-assistant-setup.md)