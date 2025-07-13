# Claude Code Validation Patterns

Detailed rule definitions and examples for consistent Claude Code behavior.

## Table of Contents

1. [Pattern Categories](#pattern-categories)
  2. [1. File Creation Rules](#1-file-creation-rules)
    3. [No Improved Files (CRITICAL)](#no-improved-files-critical)
    4. [File Organization (CRITICAL)](#file-organization-critical)
  5. [2. Response Format Rules](#2-response-format-rules)
    6. [Prompt Improvement (WARNING)](#prompt-improvement-warning)
    7. [Response Length (INFO)](#response-length-info)
  8. [3. Development Workflow Rules](#3-development-workflow-rules)
    9. [Generator Usage (WARNING)](#generator-usage-warning)
    10. [TodoWrite Usage (INFO)](#todowrite-usage-info)
  11. [4. Code Quality Rules](#4-code-quality-rules)
    12. [Test-First Development (WARNING)](#test-first-development-warning)
    13. [Original File Editing (CRITICAL)](#original-file-editing-critical)
14. [Pattern Implementation](#pattern-implementation)
  15. [Regex Patterns](#regex-patterns)
  16. [Context Detection](#context-detection)
  17. [Severity Levels](#severity-levels)
18. [Validation Examples](#validation-examples)
  19. [Example 1: File Creation Violation](#example-1-file-creation-violation)
  20. [Example 2: Missing Prompt Improvement](#example-2-missing-prompt-improvement)
  21. [Example 3: Correct Response](#example-3-correct-response)
22. [Pattern Testing](#pattern-testing)

## Pattern Categories

### 1. File Creation Rules

#### No Improved Files (CRITICAL)
**Rule**: Never create files with `_improved`, `_enhanced`, `_v2`, or similar suffixes.

**Good**:
```bash
User: "Fix the auth bug"
Claude: [edits existing auth.js file]
```

**Bad**:
```bash
User: "Fix the auth bug" 
Claude: [creates auth_improved.js]
```

**Pattern**: `/(^|\/)[\w-]+_(improved|enhanced|v2|new|fixed|better)\.(js|ts|tsx|py|go)$/`

#### File Organization (CRITICAL)
**Rule**: Never create files in project root except allowed list.

**Allowed in root**:
- README.md, LICENSE, CONTRIBUTING.md
- package.json, tsconfig.json, .gitignore
- Configuration files (.env.example, etc.)

**Good**:
```bash
User: "Create a new component"
Claude: [creates src/components/Button/Button.tsx]
```

**Bad**:
```bash
User: "Create a new component"
Claude: [creates Button.tsx in project root]
```

### 2. Response Format Rules

#### Prompt Improvement (WARNING)
**Rule**: Complex requests must start with "**Improved Prompt**:" using CRAFT framework.

**Good**:
```text
User: "Implement user authentication"
Claude: **Improved Prompt**: You are a TypeScript developer...
```

**Bad**:
```text
User: "Implement user authentication"
Claude: I'll help you implement authentication...
```

**Pattern**: Complex requests without `**Improved Prompt**:` at start.

#### Response Length (INFO)
**Rule**: Simple queries should get concise responses (<4 lines).

**Good**:
```text
User: "What does npm test do?"
Claude: Runs the test suite using Jest.
```

**Bad**:
```text
User: "What does npm test do?"
Claude: The npm test command is a powerful tool that executes your project's test suite. It typically runs Jest or
another testing framework, providing comprehensive feedback about your code's functionality and helping ensure your
application works as expected...
```

### 3. Development Workflow Rules

#### Generator Usage (WARNING)
**Rule**: Encourage component generators over manual creation.

**Good**:
```text
User: "Create a Button component"
Claude: I'll use the component generator:
npm run g:c Button
```

**Bad**:
```text
User: "Create a Button component"
Claude: [manually creates component files without mentioning generator]
```

**Pattern**: Component creation without mentioning `npm run g:c` or generators.

#### TodoWrite Usage (INFO)
**Rule**: Multi-step tasks should use TodoWrite for tracking.

**Good**:
```text
User: "Implement user dashboard with charts and data"
Claude: I'll create a todo list for this multi-step task:
[Uses TodoWrite tool]
```

**Bad**:
```text
User: "Implement user dashboard with charts and data"
Claude: [starts implementation without using TodoWrite]
```

### 4. Code Quality Rules

#### Test-First Development (WARNING)
**Rule**: Implementation should follow test writing.

**Good**:
```text
User: "Add user validation"
Claude: I'll write tests first, then implement:
[Creates tests, then implementation]
```

**Bad**:
```text
User: "Add user validation"
Claude: [writes implementation without tests]
```

#### Original File Editing (CRITICAL)
**Rule**: Always edit existing files instead of creating new versions.

**Good**:
```text
User: "Improve the login component"
Claude: [edits existing LoginComponent.tsx]
```

**Bad**:
```text
User: "Improve the login component"
Claude: [creates LoginComponentImproved.tsx]
```

## Pattern Implementation

### Regex Patterns
```javascript
const patterns = {
  improvedFiles: /(^|\/)[\w-]+_(improved|enhanced|v2|new|fixed|better)\.(js|ts|tsx|py|go)$/,
  promptImprovement: /^\*\*Improved Prompt\*\*:/,
  responseLength: /^.{1,200}$/s, // Simple responses should be short
  generatorUsage: /(npm run g:c|component generator)/,
  rootFiles: /^[^\/]+\.(js|ts|tsx|py|md|txt)$/
};
```

### Context Detection
```javascript
const isComplexRequest = (input) => {
  const complexKeywords = ['implement', 'create', 'build', 'add feature'];
  const hasMultipleSteps = input.split(/[.!?]/).length > 2;
  return complexKeywords.some(k => input.toLowerCase().includes(k)) || hasMultipleSteps;
};
```

### Severity Levels
- **CRITICAL**: Blocks or strongly warns (file naming, organization)
- **WARNING**: Important but not blocking (prompt improvement, generators) 
- **INFO**: Nice to have (response length, todo usage)

## Validation Examples

### Example 1: File Creation Violation
```text
Input: "Fix the authentication bug"
Response: "I'll create auth_improved.js with the fixes..."

Validation Result:
❌ CRITICAL: File naming violation
   Pattern: No files with _improved suffix
   Suggestion: Edit existing auth.js instead
```

### Example 2: Missing Prompt Improvement
```text
Input: "Implement a complete user dashboard with authentication, data visualization, and settings"
Response: "I'll start by creating the components..."

Validation Result:
⚠️ WARNING: Missing prompt improvement
   Pattern: Complex requests need CRAFT framework
   Suggestion: Start with "**Improved Prompt**:"
```

### Example 3: Correct Response
```text
Input: "What port does the dev server use?"
Response: "Port 3000"

Validation Result:
✅ All patterns pass
   - Concise response ✓
   - Appropriate for simple query ✓
```

## Pattern Testing

Run pattern tests:
```bash
npm run claude:test-patterns
```

Add new patterns:
```bash
# Edit tools/claude-validation/compliance-validator.js
# Add to patterns array with name, regex, severity
```

---

**Last Updated**: Implementation plan phase  
**Pattern Count**: 7 core patterns  
**Coverage**: Critical ProjectTemplate rules