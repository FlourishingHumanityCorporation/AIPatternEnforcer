# Friction Points Log

## Table of Contents

1. [Overview](#overview)
2. [Critical Friction Points](#critical-friction-points)
  3. [1. npm install Timeout (Severity: HIGH)](#1-npm-install-timeout-severity-high)
  4. [2. Project Copy Performance (Severity: MEDIUM)](#2-project-copy-performance-severity-medium)
5. [Potential Friction Points (To Validate)](#potential-friction-points-to-validate)
  6. [3. Generator Discovery](#3-generator-discovery)
  7. [4. Setup Wizard Input Format](#4-setup-wizard-input-format)
  8. [5. Error Recovery](#5-error-recovery)
9. [Wizard Resilience Issues (To Address)](#wizard-resilience-issues-to-address)
  10. [6. Missing Error Recovery Instructions](#6-missing-error-recovery-instructions)
  11. [7. No Pre-flight Validation](#7-no-pre-flight-validation)
  12. [8. Directory Creation Failures  ](#8-directory-creation-failures-)
13. [Fixed Issues](#fixed-issues)
  14. [1. npm install timeout (FIXED)](#1-npm-install-timeout-fixed)
15. [Testing Methodology](#testing-methodology)
16. [Next Actions](#next-actions)

## Overview
This document tracks identified friction points during user testing of ProjectTemplate, organized by severity and
journey phase.

## Critical Friction Points

### 1. npm install Timeout (Severity: HIGH)
**Phase**: Setup  
**Issue**: npm install hangs with husky module error during automated testing  
**Impact**: Blocks entire user journey  
**Error**:
```text
Error: Cannot find module './'
Require stack:
- /test-user-journey-*/node_modules/.bin/husky
```
**Fix**: Add error handling and timeout extension to setup process

### 2. Project Copy Performance (Severity: MEDIUM)
**Phase**: Setup  
**Issue**: Copying template files takes 38 seconds in test environment  
**Impact**: Adds significant time to setup process  
**Fix**: Investigate file copy optimization or provide progress indicator

## Potential Friction Points (To Validate)

### 3. Generator Discovery
**Phase**: Discovery  
**Issue**: Users may not find generator commands easily  
**Status**: Needs real user validation  
**Hypothesis**: README → QUICK-START flow may not highlight generators prominently

### 4. Setup Wizard Input Format
**Phase**: Setup  
**Issue**: Wizard may require specific input format not obvious to users  
**Status**: Needs testing with real users  
**Hypothesis**: Missing input examples or validation messages

### 5. Error Recovery
**Phase**: All phases  
**Issue**: Unclear how users recover from errors  
**Status**: Needs resilience testing  
**Hypothesis**: Error messages may not provide actionable next steps

## Wizard Resilience Issues (To Address)

### 6. Missing Error Recovery Instructions
**Phase**: Setup  
**Issue**: Wizard doesn't provide clear recovery steps when errors occur  
**Status**: Identified through resilience testing  
**Fix**: Add actionable error messages with recovery commands

### 7. No Pre-flight Validation
**Phase**: Setup  
**Issue**: Wizard doesn't check prerequisites before starting  
**Status**: Causes failures in broken environments  
**Fix**: Add validation step at wizard start

### 8. Directory Creation Failures  
**Phase**: Setup  
**Issue**: Wizard assumes directories exist rather than creating them  
**Status**: Fails when expected structure is missing  
**Fix**: Add automatic directory creation

## Fixed Issues

### 1. npm install timeout (FIXED)
**Solution**: Added `--legacy-peer-deps` flag and error handling to validator script  
**Result**: Install completes successfully in test environments

## Testing Methodology

Each friction point should be:
1. Identified with specific reproduction steps
2. Validated with at least 2 users
3. Prioritized by impact on success metrics
4. Fixed with minimal disruption
5. Re-tested to confirm resolution

## Next Actions

1. Fix npm install timeout issue
2. Add progress indicators for long operations
3. Enhance generator visibility in documentation
4. Add input examples to setup wizard
5. Implement comprehensive error handling