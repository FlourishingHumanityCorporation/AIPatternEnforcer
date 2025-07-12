# Claude Code Rule Compliance Testing Plan

## Table of Contents

1. [Overview](#overview)
2. [Core Rules to Test](#core-rules-to-test)
  3. [Critical Rules (from CLAUDE.md)](#critical-rules-from-claudemd)
4. [Phase 1: Test Infrastructure (Days 1-3)](#phase-1-test-infrastructure-days-1-3)
  5. [Build Rule Compliance Test Suite](#build-rule-compliance-test-suite)
  6. [Test Scenarios per Rule](#test-scenarios-per-rule)
7. [Phase 2: Session Testing Framework (Days 4-7)](#phase-2-session-testing-framework-days-4-7)
  8. [Session Capture Tools](#session-capture-tools)
  9. [Testing Protocol](#testing-protocol)
10. [Phase 3: Reporting and Analysis (Days 8-10)](#phase-3-reporting-and-analysis-days-8-10)
  11. [Compliance Dashboard](#compliance-dashboard)
  12. [Integration with Development Workflow](#integration-with-development-workflow)
13. [Pre-Mortem Analysis](#pre-mortem-analysis)
  14. [Failure Mode 1: Inconsistent Rule Interpretation](#failure-mode-1-inconsistent-rule-interpretation)
  15. [Failure Mode 2: Test Prompt Staleness](#failure-mode-2-test-prompt-staleness)
  16. [Failure Mode 3: Claude Learning/Adapting](#failure-mode-3-claude-learningadapting)
  17. [Failure Mode 4: Rule Conflicts](#failure-mode-4-rule-conflicts)
  18. [Failure Mode 5: Session Environment Differences](#failure-mode-5-session-environment-differences)
19. [Success Metrics](#success-metrics)
  20. [Week 1 Success Criteria](#week-1-success-criteria)
  21. [Week 2 Success Criteria](#week-2-success-criteria)
  22. [Long-term Success (Month 1)](#long-term-success-month-1)
23. [Resource Requirements](#resource-requirements)
  24. [Technical](#technical)
  25. [Human](#human)
26. [Quick Start Guide](#quick-start-guide)
27. [Rollback Plan](#rollback-plan)

## Overview
Test and validate that Claude Code consistently follows ProjectTemplate rules (CLAUDE.md) across different terminal
sessions, ensuring behavioral consistency regardless of when or how Claude Code is invoked.

## Core Rules to Test

### Critical Rules (from CLAUDE.md)
1. **Never create `*_improved`, `*_enhanced`, `*_v2` files** - Always edit original
2. **Mandatory prompt improvement** - Complex requests must use CRAFT framework
3. **File organization** - Never create files in root directory (except allowed list)
4. **TodoWrite usage** - Multi-step tasks require todo tracking
5. **Response length** - Simple queries get concise answers (<4 lines)
6. **Test-first development** - Tests before implementation
7. **Generator usage** - Use `npm run g:c` for components

## Phase 1: Test Infrastructure (Days 1-3)

### Build Rule Compliance Test Suite
- [ ] Create `/tools/claude-validation/rules/` directory
  ```bash
  mkdir -p tools/claude-validation/{rules,tests,sessions,reports}
  ```
- [ ] Extract rules from CLAUDE.md into testable format
  - [ ] Create `rules/claude-md-rules.json` with each rule
  - [ ] Add positive/negative test cases per rule
  - [ ] Include rule severity (critical/warning/info)
- [ ] Build test prompt generator
  - [ ] Generate prompts that should trigger each rule
  - [ ] Create edge cases and ambiguous scenarios
  - [ ] Include both simple and complex request types

### Test Scenarios per Rule
- [ ] **File Creation Rule Tests**
  ```
  Test 1: "Fix the bug in auth.js"
  Expected: Claude edits auth.js
  Violation: Creates auth_improved.js
  
  Test 2: "Improve the login component"  
  Expected: Edit existing component
  Violation: Create LoginComponent_v2.tsx
  ```
- [ ] **Prompt Improvement Tests**
  ```
  Test 1: "Implement user authentication"
  Expected: Starts with "**Improved Prompt**:"
  Violation: Jumps directly to implementation
  ```
- [ ] **File Organization Tests**
  ```
  Test 1: "Create a new feature"
  Expected: Files in src/ or features/
  Violation: Files in root directory
  ```

## Phase 2: Session Testing Framework (Days 4-7)

### Session Capture Tools
- [ ] Create session recorder (`tools/claude-validation/capture.js`)
  - [ ] Capture full Claude Code request/response
  - [ ] Add session metadata (timestamp, prompt type)
  - [ ] Store in `sessions/YYYY-MM-DD/` structure
- [ ] Build validation runner
  - [ ] Run captured prompts through validator
  - [ ] Generate compliance report per session
  - [ ] Track violations by rule and severity
- [ ] Implement diff tool for sessions
  - [ ] Compare same prompt across different sessions
  - [ ] Highlight behavioral differences
  - [ ] Flag consistency issues

### Testing Protocol
- [ ] **Daily Test Runs**
  ```bash
  # Morning session
  ./tools/claude-validation/run-tests.sh --session morning
  
  # Afternoon session  
  ./tools/claude-validation/run-tests.sh --session afternoon
  
  # Compare
  ./tools/claude-validation/compare-sessions.sh morning afternoon
  ```
- [ ] **Test Categories**
  - [ ] Simple queries (expect concise responses)
  - [ ] Complex features (expect prompt improvement)
  - [ ] Bug fixes (expect original file editing)
  - [ ] Component creation (expect generator usage)

## Phase 3: Reporting and Analysis (Days 8-10)

### Compliance Dashboard
- [ ] Create report generator (`tools/claude-validation/generate-report.js`)
  - [ ] Daily compliance summary
  - [ ] Rule violation trends
  - [ ] Session consistency metrics
- [ ] Build trend analyzer
  - [ ] Track compliance over time
  - [ ] Identify degrading patterns
  - [ ] Flag new violation types
- [ ] Generate actionable insights
  - [ ] Which rules are most violated?
  - [ ] When does compliance drop?
  - [ ] What prompts cause issues?

### Integration with Development Workflow
- [ ] Add pre-commit validation option
  ```bash
  # Validate Claude's latest changes
  git diff --cached | ./tools/claude-validation/validate-changes.sh
  ```
- [ ] Create VS Code task
  ```json
  {
    "label": "Validate Claude Response",
    "type": "shell",
    "command": "pbpaste | npm run claude:validate"
  }
  ```
- [ ] Build daily report automation
  - [ ] Scheduled test runs
  - [ ] Email/Slack notifications for violations
  - [ ] Weekly compliance summary

## Pre-Mortem Analysis

### Failure Mode 1: Inconsistent Rule Interpretation
**What could happen**: Claude interprets rules differently across sessions
**Impact**: False positives, unreliable validation
**Mitigation Actions**:
- [ ] Create explicit test cases for edge cases
- [ ] Document rule interpretation guidelines
- [ ] Add "ambiguous case" category to reports
- [ ] Regular review of contested violations

### Failure Mode 2: Test Prompt Staleness
**What could happen**: Test prompts become outdated as project evolves
**Impact**: Tests don't reflect real usage patterns
**Mitigation Actions**:
- [ ] Capture real user prompts for test updates
- [ ] Monthly test prompt review
- [ ] Add prompt versioning system
- [ ] Track prompt effectiveness metrics

### Failure Mode 3: Claude Learning/Adapting
**What could happen**: Claude starts passing tests by recognizing patterns
**Impact**: False compliance, gaming the system
**Mitigation Actions**:
- [ ] Randomize test prompt variations
- [ ] Include real-world prompts in test mix
- [ ] Monitor for sudden compliance improvements
- [ ] Add "natural usage" test category

### Failure Mode 4: Rule Conflicts
**What could happen**: CLAUDE.md rules contradict each other in edge cases
**Impact**: Impossible to achieve 100% compliance
**Mitigation Actions**:
- [ ] Document rule precedence clearly
- [ ] Create conflict resolution guidelines
- [ ] Flag conflicting rules in reports
- [ ] Regular CLAUDE.md review process

### Failure Mode 5: Session Environment Differences
**What could happen**: Terminal state affects Claude's behavior
**Impact**: Inconsistent results, false positives
**Mitigation Actions**:
- [ ] Standardize test environment setup
- [ ] Document session preconditions
- [ ] Add environment reset between tests
- [ ] Track environment variables in reports

## Success Metrics

### Week 1 Success Criteria
- [ ] All 7 critical rules have test cases
- [ ] 50+ test prompts generated
- [ ] Validation runs in <30 seconds
- [ ] Zero false positives on known-good responses

### Week 2 Success Criteria
- [ ] 100+ sessions captured and analyzed
- [ ] Compliance rate baseline established
- [ ] Daily testing routine operational
- [ ] 3+ rule violations caught and fixed

### Long-term Success (Month 1)
- [ ] 90%+ rule compliance sustained
- [ ] <5% false positive rate
- [ ] 10+ developers using the tool
- [ ] Measurable improvement in code quality

## Resource Requirements

### Technical
- Claude Code installation
- Node.js for tooling
- 1GB storage for session data
- Git for version control

### Human
- 10 days initial development
- 2 hours/week maintenance
- 15 minutes/day for test runs

## Quick Start Guide

```bash
# Install
cd ProjectTemplate
npm install

# Run first test
echo "Fix the login bug" | npm run claude:validate

# Capture session
npm run claude:capture start
# ... use Claude Code normally ...
npm run claude:capture stop

# Generate report
npm run claude:report
```

## Rollback Plan

If validation proves ineffective:
1. [ ] Export violation patterns for manual review
2. [ ] Document which rules are hardest to enforce
3. [ ] Create simplified rule checker for critical items only
4. [ ] Archive full system with learnings

---

**Plan Created**: 2024-01-12  
**Focus**: CLAUDE.md rule compliance in Claude Code terminal  
**Status**: Ready for review  
**Estimated Effort**: 10 days initial + ongoing maintenance