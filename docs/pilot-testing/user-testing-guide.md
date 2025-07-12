# User Testing Guide

## Table of Contents

1. [Overview](#overview)
2. [Testing Commands](#testing-commands)
  3. [Automated Journey Validation](#automated-journey-validation)
  4. [Interactive User Testing](#interactive-user-testing)
5. [Testing Infrastructure](#testing-infrastructure)
  6. [1. Journey Validator Script](#1-journey-validator-script)
  7. [2. User Testing Program Script](#2-user-testing-program-script)
8. [Testing Protocol](#testing-protocol)
  9. [Session Setup](#session-setup)
  10. [Task Flow](#task-flow)
  11. [Data Collection](#data-collection)
12. [Metrics Framework](#metrics-framework)
  13. [Quantitative Metrics](#quantitative-metrics)
  14. [Qualitative Metrics](#qualitative-metrics)
15. [User Selection Criteria](#user-selection-criteria)
  16. [Target User Profiles](#target-user-profiles)
17. [Known Issues](#known-issues)
  18. [Current Friction Points](#current-friction-points)
  19. [Mitigation Strategies](#mitigation-strategies)
20. [Session Documentation](#session-documentation)
  21. [During Session](#during-session)
  22. [Post-Session](#post-session)
23. [Analysis Framework](#analysis-framework)
  24. [Success Indicators](#success-indicators)
  25. [Failure Indicators](#failure-indicators)
26. [Continuous Improvement](#continuous-improvement)
  27. [After Each Session](#after-each-session)
  28. [After 5 Sessions](#after-5-sessions)
29. [Testing Tools](#testing-tools)
  30. [Included Scripts](#included-scripts)
  31. [Output Locations](#output-locations)
32. [Next Steps](#next-steps)

## Overview

This guide provides infrastructure and methodology for validating ProjectTemplate's user journey optimization, focusing
on three key metrics:

- **Time to first success**: Target <5 minutes
- **Generator performance**: Target ~30 seconds  
- **Setup completion rate**: Target 85%

## Testing Commands

### Automated Journey Validation
```bash
npm run test:user-journey
```
Simulates a new user journey and automatically measures timing metrics.

### Interactive User Testing
```bash
npm run test:user-program
```
Facilitates real user testing sessions with guided tasks and feedback collection.

## Testing Infrastructure

### 1. Journey Validator Script

Located at: `scripts/testing/user-journey-validator.sh`

Features:
- Automated timing of each journey step
- JSON logging for metric analysis
- Performance validation against targets
- Friction point identification

### 2. User Testing Program Script

Located at: `scripts/testing/user-testing-program.sh`

Features:
- Guided task flow for consistency
- Real-time metric collection
- Step-by-step feedback capture
- Automatic session documentation

## Testing Protocol

### Session Setup
1. Ensure clean project state
2. Prepare screen recording (optional)
3. Have documentation URLs ready
4. Clear terminal for fresh start

### Task Flow
1. **Discovery Phase** (Target: 2 min)
   - Find getting started instructions in README
   - Navigate to QUICK-START guide
   - Identify setup commands

2. **Setup Phase** (Target: 2 min)
   - Run npm install
   - Execute setup wizard
   - Complete configuration

3. **Generation Phase** (Target: 1 min)
   - Discover generator commands
   - Create first component
   - Verify generated files

### Data Collection
- Task completion times
- Error occurrences
- Confusion points
- User feedback per step

## Metrics Framework

### Quantitative Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Time to first success | <5 minutes | Total session time |
| Generator performance | ~30 seconds | Component generation duration |
| Setup completion rate | >85% | Successful setups / Total attempts |
| Task success rate | >90% | Completed tasks / Total tasks |

### Qualitative Metrics
- Documentation clarity (1-10 scale)
- Command discoverability (1-10 scale)
- Overall satisfaction (1-10 scale)
- Likelihood to recommend (1-10 scale)

## User Selection Criteria

### Target User Profiles
1. **Beginners** (2 users)
   - New to ProjectTemplate
   - Basic npm/node knowledge
   - Testing initial experience

2. **Intermediate** (2 users)
   - Familiar with similar tools
   - Regular npm user
   - Testing efficiency

3. **Expert** (1 user)
   - Advanced developer
   - Multiple framework experience
   - Testing power user flow

## Known Issues

### Current Friction Points
1. npm install duration may exceed expectations
2. Setup wizard requires specific input format
3. Generator discovery depends on documentation navigation

### Mitigation Strategies
- Add timeout extensions for slow operations
- Provide input examples in wizard
- Enhance generator visibility in docs

## Session Documentation

### During Session
Track in real-time:
- Timestamp each task start/end
- Note any confusion or questions
- Record exact error messages
- Document workarounds used

### Post-Session
Generate summary including:
- Metric achievement vs targets
- Specific friction points
- User suggestions
- Priority improvements

## Analysis Framework

### Success Indicators
- Consistent <5 minute completion times
- High task completion rates
- Positive user feedback
- Minimal assistance required

### Failure Indicators
- Repeated confusion at same steps
- Consistent timeout issues
- Low satisfaction scores
- High abandonment rate

## Continuous Improvement

### After Each Session
1. Update friction point log
2. Prioritize quick fixes
3. Document pattern emergence
4. Share findings with team

### After 5 Sessions
1. Aggregate metrics analysis
2. Identify systemic issues
3. Plan improvement sprint
4. Update documentation

## Testing Tools

### Included Scripts
- `user-journey-validator.sh`: Automated testing
- `user-testing-program.sh`: Guided sessions
- `test-user-experience.sh`: UX scoring

### Output Locations
- Session data: `tests/user-testing-results/`
- Journey logs: `user-journey-log-*.json`
- Aggregate reports: Auto-generated after 5 sessions

## Next Steps

1. Validate automated journey script functionality
2. Schedule initial user testing sessions
3. Create tracking spreadsheet for metrics
4. Prepare session facilitation materials
5. Review and update based on initial findings