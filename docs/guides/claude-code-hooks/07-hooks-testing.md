```markdown
# Claude Code Hooks Testing Guide
**Last Updated**: 2025-07-14
**System Version**: 3.0 (Consolidated Architecture)
**Framework**: HookRunner Base Class + Jest Test Suite
## Overview
This guide covers comprehensive testing strategies for Claude Code
hooks, including unit testing, integration testing, performance
benchmarking, and automated validation. The v3.0 architecture provides
a standardized testing framework built on HookRunner base class
patterns.
## Table of Contents
- [Testing Architecture](#testing-architecture)
- [Core Testing Principles](#core-testing-principles)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Performance Benchmarking](#performance-benchmarking)
- [End-to-End (E2E) Testing](#end-to-end-e2e-testing)
- [Test-Driven Development (TDD)](#test-driven-development-tdd)
- [Continuous Integration (CI)](#continuous-integration-ci)
## Testing Architecture
### Test Types
| Test Type | Directory | Purpose |
|-----------|-----------|---------|
| **Unit** | `__tests__/unit/` | Test individual hooks in isolation |
| **Integration** | `__tests__/integration/` | Test hook chains and family interactions |
| **Performance** | `__tests__/performance/` | Benchmark execution speed and memory |
| **E2E** | `__tests__/e2e/` | Validate real-world AI scenarios |
### Testing Framework Structure
The hooks testing system is organized around the v3.0 consolidated architecture:
```
tools/hooks/__tests__/
├── unit/                    # Individual hook tests
│   ├── prevent-improved-files.test.js
│   ├── context-validator.test.js
│   ├── security-scan.test.js
│   └── [each-hook].test.js
├── integration/             # Cross-hook testing
│   ├── hook-chain.test.js
│   ├── family-timeout.test.js
│   └── consolidated-hooks.test.js
├── performance/             # Performance benchmarks
│   ├── execution-speed.test.js
│   ├── memory-usage.test.js
│   └── consolidated-hook-performance.test.js
├── e2e/                     # End-to-end scenario tests
│   ├── common-ai-mistakes.test.js
│   └── enterprise-pattern-blocking.test.js
└── test-utils.js          # Shared testing utilities
```
### Test Utilities (`test-utils.js`)
Provides `runHook` helper function to simulate hook execution:
```javascript
const { exec } = require('child_process');

function runHook(hookFile, inputJson) {
  return new Promise((resolve) => {
    const child = exec(`node ${hookFile}`, (error, stdout, stderr) => {
      resolve({
        exitCode: error ? error.code : 0,
        stdout,
        stderr,
      });
    });
    child.stdin.write(JSON.stringify(inputJson));
    child.stdin.end();
  });
}
```
## Core Testing Principles
All tests follow these standards:
1. **Fail-Open Testing**: Verify hooks allow operations when they error
2. **Performance Requirements**: Tests must verify <500ms total execution
3. **Input Validation**: Test malformed JSON handling
4. **Exit Code Compliance**: Verify 0=allow, 2=block pattern
5. **Family-Based Testing**: Test timeout management by hook family
---
## Unit Testing
### Purpose
Verify a single hook's logic in isolation.
### Example: `security-scan.test.js`
```javascript
const { runHook } = require('../test-utils');

describe('security-scan.js', () => {
  it('should block content with XSS vulnerability', async () => {
    const input = { tool_input: { content: "el.innerHTML = userData;" } };
    const { exitCode, stderr } = await runHook('security-scan.js', input);
    expect(exitCode).toBe(2);
    expect(stderr).toContain("XSS vulnerability");
  });

  it('should allow sanitized content', async () => {
    const input = { tool_input: { content: "el.textContent = userData;" } };
    const { exitCode } = await runHook('security-scan.js', input);
    expect(exitCode).toBe(0);
  });
});
```
---
## Integration Testing
### Purpose
Verify that hooks work correctly together in a chain.
### Example: `hook-chain.test.js`
```javascript
it('should block enterprise patterns before security scan runs', async () => {
  // Simulate a PreToolUse chain
  const input = { tool_input: { content: "const key = '...' // also setup Kubernetes" } };

  // First, enterprise-antibody should run
  const enterpriseResult = await runHook('enterprise-antibody.js', input);
  expect(enterpriseResult.exitCode).toBe(2);
  expect(enterpriseResult.stderr).toContain("Enterprise Pattern Blocked");

  // If it passed (which it shouldn't), security-scan would run
  // This verifies priority and chaining logic
});
```
---
## Performance Benchmarking
### Purpose
Ensure hooks meet performance targets (<50ms individual, <500ms chain).
### Example: `execution-speed.test.js`
```javascript
const { PerformanceAnalyzer } = require('../../lib');

it('context-validator should execute under 50ms', async () => {
  const analyzer = new PerformanceAnalyzer();
  const input = { tool_input: { content: "test" } };

  analyzer.start();
  await runHook('context-validator.js', input);
  const duration = analyzer.end();

  expect(duration).toBeLessThan(50);
});
```
---
## End-to-End (E2E) Testing
### Purpose
Simulate real-world developer scenarios to validate overall system effectiveness.
### Example: `common-ai-mistakes.test.js`
```javascript
it('should prevent AI from creating a _v2 file with security issues', async () => {
  const scenarioInput = {
    tool_name: 'Write',
    tool_input: {
      file_path: 'component_v2.js',
      content: 'el.innerHTML = userData;'
    }
  };

  // Test prevent-improved-files hook
  const improvedFileResult = await runHook('prevent-improved-files.js', scenarioInput);
  expect(improvedFileResult.exitCode).toBe(2);
  // ... also test security-scan behavior if needed
});
```
## Test-Driven Development (TDD)
When creating a new hook:
1. **Write a failing test**: Define the desired behavior in a test file.
2. **Write the hook code**: Implement the simplest code to make the test pass.
3. **Refactor**: Clean up the code while ensuring tests still pass.
## Continuous Integration (CI)
All tests are run automatically on every commit using GitHub Actions:
```yaml
# .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm test tools/hooks/__tests__/
```
