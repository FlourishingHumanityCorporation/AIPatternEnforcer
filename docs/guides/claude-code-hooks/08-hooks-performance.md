```markdown
# Claude Code Hooks Performance Guide
**Last Updated**: 2025-07-14
**System Version**: 3.0 (Consolidated Architecture)
**Performance Target**: <500ms total hook chain execution
## Overview
This guide covers performance optimization strategies for Claude Code
hooks, focusing on achieving sub-500ms execution times while
maintaining comprehensive validation capabilities. The v3.0
architecture's family-based timeout management and consolidated hooks
provide significant performance improvements.
## Table of Contents
- [Performance Architecture](#performance-architecture)
- [Performance Budgets](#performance-budgets)
- [Code Optimization Techniques](#code-optimization-techniques)
- [Performance Monitoring and Analysis](#performance-monitoring-and-analysis)
- [Case Study: `performance-guardian.js`](#case-study-performance-guardianjs)
## Performance Architecture
### Family-Based Timeouts
Hooks are grouped into families with specific timeouts to prevent any single hook from blocking the chain.
| Family | Timeout | Priority | Purpose |
|---|---|---|---|
| `file_hygiene` | 1-2s | critical | Lightweight file pattern validation |
| `security` | 4s | high | Deeper security analysis |
| `validation` | 3s | high | Content validation |
| `performance` | 3s | high | Performance checks |
| `pattern_enforcement` | 2s | medium | Local dev pattern enforcement |
| `code_cleanup` | 3s | low | Post-operation cleanup |
### Consolidated Hooks
The v3.0 architecture consolidates related hooks to reduce overhead:
- **`architecture-validator.js`**: Combines 3 hooks
- **`performance-guardian.js`**: Combines 5 hooks
- **`docs-enforcer.js`**: Combines 2 hooks
This reduces file I/O and process startup costs, improving performance by ~30%.
## Performance Budgets
### Total Execution Budget: <500ms
- **PreToolUse Chain**: Target < 300ms
- **PostToolUse Chain**: Target < 200ms
### Individual Hook Budget: <50ms
- Most hooks should execute in under 50ms on typical inputs.
- Hooks requiring deeper analysis (e.g., `security-scan`) have higher timeouts.
## Code Optimization Techniques
### 1. Use Efficient Data Structures
- **Use `Map` or `Set` for lookups**: O(1) complexity vs. O(n) for array `find`/`includes`.
```javascript
// Bad: O(n)
const isAllowed = allowedArray.includes(item);

// Good: O(1)
const allowedSet = new Set(allowedArray);
const isAllowed = allowedSet.has(item);
```
### 2. Lazy Loading and Caching
- **Load patterns on demand**: Use the `PatternLibrary` to lazy-load regex patterns.
- **Cache results**: Cache expensive computations within a single hook run.
### 3. Avoid Unnecessary Work
- **Early exits**: Check for simple conditions first to exit early.
```javascript
function myHook(hookData) {
  // Exit early if content is empty
  if (!hookData.tool_input.content) {
    return runner.allow();
  }
  // ... perform expensive analysis
}
```
### 4. Asynchronous Operations
- Use `async/await` for I/O operations but be mindful of timeouts.
- All hooks are wrapped in a promise with a timeout race.
### 5. Regex Optimization
- **Be specific**: Avoid overly broad patterns.
- **Avoid catastrophic backtracking**: Use non-backtracking patterns where possible.
- **Compile once**: The `PatternLibrary` ensures regexes are compiled only once.
## Performance Monitoring and Analysis
### `PerformanceAnalyzer` Utility
The `tools/hooks/lib/PerformanceAnalyzer.js` utility provides simple performance tracking.
```javascript
const { PerformanceAnalyzer } = require("./lib");
const analyzer = new PerformanceAnalyzer();

analyzer.start();
// ... code to benchmark ...
const duration = analyzer.end();
console.log(`Execution time: ${duration}ms`);
```
### Performance Test Suite
Located in `tools/hooks/__tests__/performance/`, these tests run automatically in CI.
```bash
# Run all performance tests
npm test tools/hooks/__tests__/performance/
```
### Debug Mode
Enable detailed performance logging:
```bash
DEBUG=claude-hooks:performance node tools/hooks/your-hook.js
```
## Case Study: `performance-guardian.js`
This consolidated hook analyzes performance without degrading it.
- **Algorithm Complexity**: Uses AST analysis to find nested loops rather than full code execution.
- **Bundle Size**: Estimates impact by analyzing import statements, not by running a bundler.
- **Token Economics**: Uses simple token counting heuristics, not full tokenization.
This approach provides "good enough" performance feedback within the sub-50ms budget.
```
