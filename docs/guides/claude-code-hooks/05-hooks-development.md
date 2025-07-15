```markdown
# Claude Code Hooks Development Guide
**Last Updated**: 2025-07-14
**System Version**: 3.0 (Consolidated Architecture)
**Framework**: HookRunner Base Class + Shared Utilities
## Overview
This guide covers developing custom Claude Code hooks using the v3.0
consolidated architecture. The system provides a HookRunner base class
and shared utilities library that eliminates boilerplate and ensures
consistent behavior across all hooks.
## Table of Contents
- [Development Environment Setup](#development-environment-setup)
- [HookRunner Architecture](#hookrunner-architecture)
- [Creating Your First Hook](#creating-your-first-hook)
- [Hook Development Patterns](#hook-development-patterns)
- [Shared Utilities Library](#shared-utilities-library)
- [Testing Custom Hooks](#testing-custom-hooks)
- [Performance Optimization](#performance-optimization)
- [Deployment and Configuration](#deployment-and-configuration)
## Development Environment Setup
### Prerequisites
- Node.js v20+
- npm v10+
- Claude Code CLI installed
### Project Structure
```
tools/hooks/
├── lib/                    # Shared utilities library
│   ├── HookRunner.js      # Base class for all hooks
│   ├── FileAnalyzer.js    # File type detection and analysis
│   ├── PatternLibrary.js  # Centralized regex patterns
│   ├── ErrorFormatter.js # Consistent error messaging
│   ├── PerformanceAnalyzer.js # Performance monitoring
│   └── index.js           # Barrel export
├── __tests__/             # Test files
├── prevent-improved-files.js  # Example hook
└── [your-hook].js         # Your custom hook
```
### Setup Commands
```bash
# Navigate to the hooks directory
cd tools/hooks

# Install dependencies
npm install

# Run existing tests to verify setup
npm test __tests__/

# List available hooks for reference
ls -la *.js
```
## HookRunner Architecture
The HookRunner base class standardizes hook creation and execution.
### Key Features
- **Standardized input/output processing**: JSON parsing and error handling
- **Timeout management**: Family-based timeout enforcement
- **Fail-open architecture**: Operations proceed if hooks error
- **Debug mode**: Enhanced logging for troubleshooting
- **Local development focus**: Built-in execution time tracking
### Usage
```javascript
// tools/hooks/your-hook.js
const { HookRunner } = require("./lib");

function myHookLogic(hookData, runner) {
  // Your validation logic here
  // ...
  if (problemDetected) {
    return runner.block("❌ Problem detected\n✅ Suggestion for fix");
  }
  return runner.allow();
}

HookRunner.create("your-hook-name", myHookLogic);
```
## Creating Your First Hook
### 1. Create the Hook File
Create `tools/hooks/my-new-hook.js`
### 2. Implement the Logic
```javascript
// tools/hooks/my-new-hook.js
const { HookRunner } = require("./lib");

function preventTODOs(hookData, runner) {
  const { content, new_string } = hookData.tool_input;
  const combinedContent = `${content || ''} ${new_string || ''}`;

  if (combinedContent.toLowerCase().includes('todo:')) {
    return runner.block("❌ 'TODO:' comments are not allowed.\n✅ Create a ticket instead.");
  }
  return runner.allow();
}

HookRunner.create("prevent-todos-hook", preventTODOs);
```
### 3. Add to Configuration
Update `.claude/settings.json`:
```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [
        // ... other hooks
        {
          "type": "command",
          "command": "node tools/hooks/my-new-hook.js",
          "timeout": 1,
          "family": "pattern_enforcement",
          "priority": "low"
        }
      ]
    }
  ]
}
```
## Hook Development Patterns
### PreToolUse Hooks (Block/Allow)
- Analyze `hookData.tool_input` before execution
- Return `runner.block(message)` or `runner.allow()`
- Focus on validation and prevention
- Examples: `security-scan.js`, `scope-limiter.js`
### PostToolUse Hooks (Modify/Validate)
- Analyze `hookData.tool_output` or resulting files
- Can modify content with `runner.modify(modifications)`
- Can validate post-operation state
- Examples: `fix-console-logs.js`, `import-janitor.js`
## Shared Utilities Library
Located in `tools/hooks/lib/`, these utilities prevent code duplication.
- **FileAnalyzer**: Detect file types, parse content, analyze AST.
- **PatternLibrary**: Centralized repository for regex patterns.
- **ErrorFormatter**: Standardized error and feedback messages.
- **PerformanceAnalyzer**: Track execution time and memory usage.
### Example: Using PatternLibrary
```javascript
const { PatternLibrary } = require("./lib");

// ...
if (PatternLibrary.enterprise.test(content)) {
  return runner.block("🚫 Enterprise pattern detected");
}
```
## Testing Custom Hooks
### Unit Testing
Create `tools/hooks/__tests__/unit/my-new-hook.test.js`:
```javascript
const { runHook } = require('../test-utils');

describe('prevent-todos-hook', () => {
  it('should block content with "TODO:"', async () => {
    const input = { tool_input: { content: 'function() { // TODO: fix this }' } };
    const { exitCode, stderr } = await runHook('my-new-hook.js', input);
    expect(exitCode).toBe(2);
    expect(stderr).toContain("❌ 'TODO:' comments are not allowed.");
  });

  it('should allow content without "TODO:"', async () => {
    const input = { tool_input: { content: 'function() { /* all good */ }' } };
    const { exitCode } = await runHook('my-new-hook.js', input);
    expect(exitCode).toBe(0);
  });
});
```
### Integration Testing
Add cases to `tools/hooks/__tests__/integration/hook-chain.test.js` to verify interaction with other hooks.
## Performance Optimization
- **Use Shared Utilities**: Optimized for performance.
- **Avoid Heavy Computations**: Offload to asynchronous tasks if possible.
- **Cache Results**: Use in-memory caching for repeated lookups within a single run.
- **Benchmark Your Hook**: Use `PerformanceAnalyzer` to measure execution time.
## Deployment and Configuration
1. Ensure the hook script is in `tools/hooks/`.
2. Add the hook to the appropriate section in `.claude/settings.json`.
3. Set a reasonable `timeout` based on benchmarking.
4. Assign a `family` for group timeout management.
5. Set a `priority` to control execution order.
6. Restart the Claude Code session to load the new configuration.
```
