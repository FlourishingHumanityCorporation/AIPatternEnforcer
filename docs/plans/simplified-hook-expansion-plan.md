# Simplified Hook System Expansion: Pattern Prevention for the Super Lazy Developer

**Version**: 2.0 (Updated with implementation details from hooks development guide)
**Date**: 2025-07-16

## Project Overview

Transform AIPatternEnforcer hooks from reactive file validation to proactive AI development automation, expanding from 31% to 80%+ friction coverage through intelligent but simple hook orchestration.

**Core Philosophy**: KISS principle - Simple JSON state, no databases, no ML, just effective pattern prevention.

**Target Developer**: The "super lazy developer" who can't detect bad AI patterns and needs automatic correction.

**Implementation Timeline**: 2-3 weeks (not 8 weeks)

## Simplified Goals

### Primary Objectives

1. **Coverage Expansion**: 31% → 80%+ friction coverage
   - Add ~20 new hooks across 4 categories
   - Focus on immediate pattern prevention
   - Zero configuration required

2. **Context Management** (4 hooks, +15% coverage)
   - Auto-detect insufficient context
   - Inject relevant CLAUDE.md sections
   - Simple drift detection based on time/changes

3. **Workflow Enforcement** (5 hooks, +25% coverage)
   - Enforce plan-first development
   - Ensure tests exist before code
   - Prevent oversized PRs

4. **IDE Integration** (4 hooks, +15% coverage)
   - Auto-configure AI tools settings
   - Clean up workspace on session end
   - Prevent conflicting shortcuts

5. **Prompt Intelligence** (4 hooks, +14% coverage)
   - Detect vague prompts
   - Auto-inject few-shot examples
   - Suggest better prompts

### What We're NOT Building

- ❌ Machine learning or adaptive systems
- ❌ SQLite databases or complex state management
- ❌ Analytics, monitoring, or tracking
- ❌ Session management or project tracking
- ❌ Multi-user or team features
- ❌ Backup/recovery systems
- ❌ Training materials or certification

## Technical Architecture (Simplified)

### State Management

```javascript
// Simple JSON file state - no databases!
const hookState = {
  contextScore: 0,
  lastContextUpdate: Date.now(),
  recentFiles: [],
  sessionStart: Date.now(),
};

// Save to .aipattern/state.json
fs.writeFileSync(".aipattern/state.json", JSON.stringify(hookState));
```

### Hook Communication

- Hooks read/write shared JSON files in `.aipattern/` directory
- No complex protocols or state synchronization
- Each hook is independent and self-contained

### Performance

- Individual hooks: <50ms
- Total execution: <300ms
- Simple caching in memory during session

## Implementation Plan (2-3 Weeks)

### Week 1: Core Infrastructure & Context Management

#### Day 1-2: Simple State System

```bash
# Create state directory structure
.aipattern/
├── state.json          # Current session state
├── context-cache.json  # Context scoring cache
└── preferences.json    # User preferences (auto-detected)
```

**Deliverables:**

- Simple JSON state reader/writer utility
- Basic file-based caching (5-minute TTL)
- Shared constants and utilities

#### Day 3-5: Context Management Hooks

**1. context-completeness-enforcer.js**

```javascript
// Simple scoring: Check if CLAUDE.md is referenced
// Block operations if context score < 60
if (!hasClaudeMdInContext() || conversationTooLong()) {
  return {
    block: true,
    message: "Add context: Run 'npm run context' first",
  };
}
```

**2. context-drift-detector.js**

```javascript
// Simple drift: Time since last context + file changes
const drift = calculateSimpleDrift(lastUpdate, changedFiles);
if (drift > 0.7) {
  return {
    block: true,
    message: "Context stale. Refresh with 'npm run context'",
  };
}
```

**3. claude-md-injector.js**

```javascript
// Auto-inject relevant CLAUDE.md sections based on file path
const relevantSections = findRelevantSections(filePath);
// Prepend to prompt automatically
```

**4. context-reminder.js (Notification hook)**

```javascript
// Simple idle reminder after 30 minutes
if (idleTime > 30 * 60 * 1000) {
  notify("Time to refresh context?");
}
```

### Week 2: Workflow & IDE Integration

#### Day 1-3: Workflow Enforcement

**1. plan-first-enforcer.js**

```javascript
// Check for PLAN.md or TODO.md before major changes
if (isNewFeature && !hasPlanFile()) {
  return {
    block: true,
    message: "Create PLAN.md first with your approach",
  };
}
```

**2. test-first-enforcer.js**

```javascript
// Ensure test file exists before implementation
if (isNewComponent && !hasTestFile(componentName)) {
  return {
    block: true,
    message: `Create ${componentName}.test.js first`,
  };
}
```

**3. pr-scope-guardian.js**

```javascript
// Simple check: Count changed files
if (changedFiles.length > 15) {
  return {
    warning: "PR getting large. Consider splitting.",
  };
}
```

**4. architecture-checker.js**

```javascript
// Detect if creating files in wrong directories
if (isAppCode && inRootDirectory()) {
  return {
    block: true,
    message: "Move to proper subdirectory per project structure",
  };
}
```

**5. session-cleanup.js (Stop hook)**

```javascript
// Clean up on session end
removeEmptyDirectories();
formatModifiedFiles();
updateGitignore();
```

#### Day 4-5: IDE Integration

**1. ide-config-checker.js**

```javascript
// Ensure .cursorrules and .vscode/settings.json exist
if (!hasAIConfigs()) {
  createDefaultConfigs();
}
```

**2. shortcut-protector.js**

```javascript
// Prevent AI tools from overriding important shortcuts
if (modifyingShortcuts && hasConflict()) {
  return {
    block: true,
    message: "Shortcut conflict detected",
  };
}
```

**3. workspace-cleaner.js**

```javascript
// Remove common AI-generated junk
cleanupPatterns(["*_improved.*", "*_backup.*", "*.tmp"]);
```

**4. performance-guardian.js**

```javascript
// Simple check for obviously bad patterns
if (hasNestedLoops(depth > 3) || hasLargeInlineData()) {
  return {
    warning: "Performance issue detected",
  };
}
```

### Week 3: Prompt Intelligence & Polish

#### Day 1-2: Prompt Intelligence

**1. prompt-quality-checker.js**

```javascript
// Detect vague prompts
if (promptLength < 50 || missingContext()) {
  return {
    warning: "Add more context for better results",
  };
}
```

**2. few-shot-injector.js**

```javascript
// Auto-add examples based on operation type
if (isComponentCreation && !hasExample()) {
  injectExample(componentExamples[projectType]);
}
```

**3. prompt-improver.js**

```javascript
// Suggest improvements for common vague requests
if (vagueRequest.test(prompt)) {
  suggest(promptTemplates[operationType]);
}
```

**4. operation-validator.js**

```javascript
// Ensure prompt matches intended operation
if (isDestructive && !hasConfirmation()) {
  return {
    block: true,
    message: "Destructive operation needs explicit confirmation",
  };
}
```

#### Day 3-5: Testing & Integration

- Test all hooks with real scenarios
- Ensure <300ms total execution time
- Create simple setup script
- Document usage patterns

## Success Criteria (Simplified)

### Must Have

- ✅ 80%+ friction coverage with ~20 hooks
- ✅ <300ms total execution time
- ✅ Zero configuration required
- ✅ Works with existing file structure
- ✅ No external dependencies beyond Node.js

### Nice to Have

- ✅ Helpful error messages with clear actions
- ✅ Auto-fix common issues where possible
- ✅ Smart defaults that work for most projects

### Won't Have

- ❌ Complex state management
- ❌ Machine learning
- ❌ Analytics or monitoring
- ❌ Multi-user features
- ❌ Enterprise integration

## File Structure

```
tools/hooks/
├── context/
│   ├── context-completeness-enforcer.js
│   ├── context-drift-detector.js
│   ├── claude-md-injector.js
│   └── context-reminder.js
├── workflow/
│   ├── plan-first-enforcer.js
│   ├── test-first-enforcer.js
│   ├── pr-scope-guardian.js
│   ├── architecture-checker.js
│   └── session-cleanup.js
├── ide/
│   ├── ide-config-checker.js
│   ├── shortcut-protector.js
│   ├── workspace-cleaner.js
│   └── performance-guardian.js
├── prompt/
│   ├── prompt-quality-checker.js
│   ├── few-shot-injector.js
│   ├── prompt-improver.js
│   └── operation-validator.js
└── lib/
    ├── state-manager.js      # Simple JSON state
    ├── shared-utils.js       # Common utilities
    └── constants.js          # Shared constants
```

## Implementation Details

### Using the HookRunner Base Class

Based on the proven HookRunner architecture from the existing system:

```javascript
// tools/hooks/context/context-completeness-enforcer.js
const { HookRunner } = require("../lib");

function contextCompletenessEnforcer(hookData, runner) {
  // Simple context scoring
  const score = calculateContextScore(hookData);

  // Cache the score in simple JSON state
  const state = readJsonState();
  state.contextScore = score;
  state.lastContextCheck = Date.now();
  writeJsonState(state);

  // Simple threshold check
  const threshold =
    {
      Write: 60,
      Edit: 50,
      MultiEdit: 70,
    }[hookData.tool_name] || 50;

  if (score < threshold) {
    return runner.block(
      [
        `❌ Insufficient context (score: ${score}/${threshold})`,
        "",
        "💡 Quick fixes:",
        "  1. Run: npm run context",
        "  2. Reference CLAUDE.md in your prompt",
        "  3. Include relevant file paths",
        "",
        "This prevents AI from making assumptions that create messy code.",
      ].join("\n"),
    );
  }

  return runner.allow();
}

// Simple scoring function
function calculateContextScore(hookData) {
  let score = 0;

  // Check 1: CLAUDE.md mentioned (40 points)
  const input = JSON.stringify(hookData).toLowerCase();
  if (input.includes("claude.md") || input.includes("@claude")) {
    score += 40;
  }

  // Check 2: File paths provided (30 points)
  if (
    hookData.tool_input?.file_path ||
    hookData.tool_input?.content?.includes("/")
  ) {
    score += 30;
  }

  // Check 3: Not too deep in conversation (30 points)
  const state = readJsonState();
  const messageCount = state.messageCount || 0;
  if (messageCount < 50) {
    score += 30 - (messageCount / 50) * 20;
  }

  return Math.round(score);
}

// Create the hook using HookRunner
HookRunner.create("context-completeness-enforcer", contextCompletenessEnforcer);
```

### Simple State Management

Replace complex database with simple JSON files:

```javascript
// tools/hooks/lib/state-manager.js
const fs = require("fs");
const path = require("path");

const STATE_DIR = path.join(process.cwd(), ".aipattern");
const STATE_FILE = path.join(STATE_DIR, "state.json");

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

function readJsonState() {
  ensureStateDir();
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    }
  } catch (error) {
    // Return empty state on any error
  }
  return {
    sessionStart: Date.now(),
    contextScore: 0,
    messageCount: 0,
    recentFiles: [],
  };
}

function writeJsonState(state) {
  ensureStateDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

module.exports = { readJsonState, writeJsonState };
```

### Leveraging Existing Utilities

Use the shared utilities library for consistency:

```javascript
// Example hook using shared utilities
const { HookRunner, FileAnalyzer, PatternLibrary } = require("../lib");

function architectureChecker(hookData, runner) {
  const filePath = hookData.tool_input?.file_path;

  // Skip non-code files using FileAnalyzer
  if (!FileAnalyzer.isCode(filePath)) {
    return runner.allow();
  }

  // Check if creating app code in root
  if (
    FileAnalyzer.isRootLevel(filePath) &&
    !FileAnalyzer.isConfiguration(filePath)
  ) {
    return runner.block(
      "🚫 Keep root directory clean\n" +
        "✅ Move application code to proper subdirectories",
    );
  }

  return runner.allow();
}

HookRunner.create("architecture-checker", architectureChecker);
```

## Testing Strategy

### Simple Test Framework

Each hook should have basic tests using the existing test utilities:

```javascript
// tools/hooks/__tests__/context-completeness-enforcer.test.js
const { runHook, ClaudeCodeMocks } = require("../test-utils");

describe("context-completeness-enforcer", () => {
  it("should block operations without CLAUDE.md reference", async () => {
    const input = ClaudeCodeMocks.createWriteOperation({
      filePath: "components/Button.tsx",
      content: "export function Button() { return <button>Click</button> }",
    });

    const result = await runHook(
      "context/context-completeness-enforcer.js",
      input,
    );

    expect(result.exitCode).toBe(2); // Blocked
    expect(result.stderr).toContain("Insufficient context");
  });

  it("should allow operations with good context", async () => {
    const input = ClaudeCodeMocks.createWriteOperation({
      filePath: "components/Button.tsx",
      content: "// Based on CLAUDE.md patterns\nexport function Button() {...}",
    });

    const result = await runHook(
      "context/context-completeness-enforcer.js",
      input,
    );

    expect(result.exitCode).toBe(0); // Allowed
  });
});
```

### Performance Testing

Ensure hooks meet performance targets:

```javascript
it("should complete within 50ms", async () => {
  const startTime = Date.now();

  await runHook("context/context-completeness-enforcer.js", testInput);

  const executionTime = Date.now() - startTime;
  expect(executionTime).toBeLessThan(50);
});
```

## Hook Configuration

### Environment Variables

Simple environment-based control:

```bash
# .env file
HOOKS_DISABLED=false    # Enable hooks
HOOK_CONTEXT=true        # Enable context category
HOOK_WORKFLOW=true       # Enable workflow category
HOOK_IDE=true           # Enable IDE category
HOOK_PROMPT=true        # Enable prompt category
```

### Claude Code Settings

Add hooks to `.claude/settings.json`:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [
        {
          "type": "command",
          "command": "node tools/hooks/context/context-completeness-enforcer.js",
          "timeout": 1,
          "family": "context",
          "priority": "critical",
          "folder": "context"
        }
      ]
    }
  ]
}
```

## Debugging Hooks

### Simple Debug Output

Enable verbose logging for troubleshooting:

```javascript
const DEBUG = process.env.HOOK_DEBUG === "true";

function debug(...args) {
  if (DEBUG) {
    console.error(`[${new Date().toISOString()}] ${hookName}:`, ...args);
  }
}

// In your hook
debug("Input:", JSON.stringify(hookData, null, 2));
debug("Score:", score, "Threshold:", threshold);
```

### Common Issues

1. **Hooks not running**: Check `HOOKS_DISABLED=false` in .env
2. **Performance issues**: Use `HOOK_VERBOSE=true` to see timing
3. **State not persisting**: Check `.aipattern/` directory permissions

## Migration Path

1. **Keep existing hooks** - They already handle file patterns well
2. **Add new categories** - One category at a time
3. **Test incrementally** - Each hook should work independently
4. **No breaking changes** - New hooks complement existing ones

## Summary

This simplified plan:

- Maintains 80%+ friction coverage goal
- Uses simple JSON files instead of databases
- Implements in 2-3 weeks instead of 8
- Follows KISS principle throughout
- Focuses on immediate value for lazy developers
- Avoids all enterprise/team/monitoring features
- Requires zero configuration to start using

The key insight: **Lazy developers need automatic correction, not complex learning systems.**
