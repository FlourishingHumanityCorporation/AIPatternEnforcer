# AI Patterns Hooks

**Purpose**: Proactive AI behavior guidance - prevents AI-specific anti-patterns before they occur.

**Hook Event**: PreToolUse (prevents issues before they happen)

**Philosophy**: "Guide the AI to make better decisions upfront"

## Hooks in this category:

### prevent-improved-files.js

**Purpose**: Prevents AI from creating duplicate files with version suffixes
**Common blocks**: `*_improved.*`, `*_enhanced.*`, `*_v2.*`, `*_final.*`

### context-validator.js

**Purpose**: Validates AI request quality and context efficiency
**Scoring**: Minimum thresholds for Write (6), Edit (10), MultiEdit (12)

### streaming-pattern-enforcer.js

**Purpose**: Enforces proper streaming patterns for AI responses
**Validates**: Streaming implementation and error handling

## Design Principles:

- **Proactive**: Catch issues before they happen
- **Fast**: Must execute quickly to avoid interrupting flow
- **Clear**: Provide helpful guidance when blocking
- **Targeted**: Focus on AI-specific patterns, not general code quality
