# Prompt Intelligence Hooks

This directory contains hooks that analyze and improve AI prompts, helping users write more effective instructions that lead to better AI-generated code.

## Hooks in this Category

### 1. prompt-quality-checker.js

- **Purpose**: Detects and blocks vague prompts
- **Blocking**: Soft-block for very vague prompts
- **Priority**: Medium
- **Key Features**:
  - Minimum length validation
  - Context keyword detection
  - Quality scoring (0-100)
  - Prompt history tracking

### 2. few-shot-injector.js

- **Purpose**: Auto-adds examples for common operations
- **Blocking**: None (enhancement only)
- **Priority**: Low
- **Key Features**:
  - Pattern-based example selection
  - Component/API/Hook templates
  - Injection history tracking
  - Smart example detection

### 3. prompt-improver.js

- **Purpose**: Suggests improvements for vague requests
- **Blocking**: Soft-block with improvement suggestions
- **Priority**: Medium
- **Key Features**:
  - Vague pattern detection
  - Operation-specific templates
  - Missing information detection
  - Concrete examples

### 4. operation-validator.js

- **Purpose**: Validates operation safety and correctness
- **Blocking**: Hard-block for destructive operations
- **Priority**: High
- **Key Features**:
  - Tool/operation matching
  - Destructive operation detection
  - Confirmation requirements
  - Scope validation

## Prompt Quality Metrics

### Quality Scoring Factors

- **Length**: 25 points for minimum, 25 for good length
- **Context**: 25 points for context keywords
- **Specificity**: 25 points for action keywords
- **File Paths**: 10 bonus points

### Vague Patterns Detected

```javascript
// Single word commands
("fix", "update", "improve", "optimize");

// Generic requests
("make it work", "debug it", "refactor");

// Missing context
("add feature", "fix bug");
```

## Example Templates

### Component Creation

```
Create a [ComponentName] component that:
- Accepts props: [list key props]
- Displays: [what it shows]
- Handles: [user interactions]
- Uses: [styling approach]
```

### Bug Fix

```
Fix the [error type] in [file/component]:
- Error occurs when: [condition]
- Expected behavior: [what should happen]
- Current behavior: [what happens now]
- Error message: [paste if available]
```

### API Endpoint

```
Create API endpoint for [resource]:
- Method: [GET/POST/PUT/DELETE]
- Path: /api/[path]
- Input: [request schema]
- Output: [response schema]
```

## Destructive Operations

Requires explicit confirmation:

- "delete all"
- "remove everything"
- "clear all"
- "drop table"
- "truncate"
- "rm -rf"

## Configuration

Prompt quality thresholds in `lib/constants.js`:

```javascript
PROMPT_QUALITY = {
  MIN_LENGTH: 50,
  GOOD_LENGTH: 200,
  CONTEXT_KEYWORDS: ["based on", "according to", "following"],
  SPECIFICITY_KEYWORDS: ["create", "implement", "fix", "update"],
};
```

## Testing

```bash
# Test prompt hooks
npm test -- tools/hooks/prompt/__tests__/

# Test individual hooks
echo '{"prompt": "fix"}' | node prompt-quality-checker.js
echo '{"file_path": "Component.tsx"}' | node few-shot-injector.js
echo '{"prompt": "update it"}' | node prompt-improver.js
echo '{"content": "delete all users"}' | node operation-validator.js
```

## Best Practices for Prompts

1. **Be Specific**
   - Include file paths
   - Describe exact behavior
   - Provide error messages

2. **Add Context**
   - Reference existing patterns
   - Mention constraints
   - Include examples

3. **Clear Actions**
   - Use action verbs
   - Specify outcomes
   - Define success criteria

4. **Safety First**
   - Confirm destructive ops
   - Validate scope
   - Check operation type
