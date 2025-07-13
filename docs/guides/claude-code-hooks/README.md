# Claude Code Hooks System

This comprehensive guide covers the Claude Code hooks system implemented in AIPatternEnforcer. These hooks prevent common AI development friction by intercepting file operations and providing real-time feedback.

## Overview

The hook system consists of 6 specialized hooks that address different aspects of AI-assisted development:

| Hook | Purpose | Triggers On | Performance |
|------|---------|-------------|-------------|
| [security-scan.js](#security-scan) | Prevents security vulnerabilities | XSS, injection, exposed credentials | ~37ms |
| [scope-limiter.js](#scope-limiter) | Prevents scope creep | Complex/unfocused prompts | ~38ms |  
| [context-validator.js](#context-validator) | Ensures sufficient context | Low-quality AI requests | ~54ms |
| [api-validator.js](#api-validator) | Validates imports and APIs | Missing dependencies, hallucinated APIs | ~35ms |
| [performance-checker.js](#performance-checker) | Prevents performance issues | O(n²) algorithms, memory leaks | ~40ms |
| [test-first-enforcer.js](#test-first-enforcer) | Enforces test-driven development | Missing tests for new code | ~35ms |

**Total execution time: ~175ms** (well under 500ms requirement)

## Installation and Configuration

The hooks are automatically configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "preToolUse": [
      "./tools/hooks/security-scan.js",
      "./tools/hooks/scope-limiter.js",
      "./tools/hooks/context-validator.js"
    ],
    "postToolUse": [
      "./tools/hooks/api-validator.js", 
      "./tools/hooks/performance-checker.js",
      "./tools/hooks/test-first-enforcer.js"
    ]
  }
}
```

## Hook Details

### security-scan.js

**Purpose**: Prevents common security vulnerabilities in generated code.

**Detection Patterns**:
- XSS vulnerabilities (`innerHTML`, `outerHTML` with user data)
- Code injection (`eval`, `Function` constructor)
- SQL injection patterns
- Hardcoded API keys and secrets
- Unsafe URL handling

**Example - Blocked Operation**:
```javascript
// ❌ This will be blocked
document.getElementById('output').innerHTML = userInput;

// ✅ Suggested fix
document.getElementById('output').textContent = userInput;
```

**Configuration**: No configuration required. Patterns are built-in and tested.

**Performance**: Averages 37ms per file scan.

---

### scope-limiter.js

**Purpose**: Prevents AI requests that are too broad or complex, encouraging focused development.

**Detection Criteria**:
- Prompts mentioning >5 features
- Complex system descriptions
- Multiple unrelated concerns
- Enterprise-scale requests

**Example - Blocked Operation**:
```javascript
// ❌ Prompt too broad
"Create a comprehensive user management system with authentication, 
authorization, database integration, email notifications, file upload 
handling, caching, logging, monitoring, and error handling"

// ✅ Focused request  
"Create a user authentication component with login/logout functionality"
```

**Thresholds**:
- Maximum features: 5
- Complexity score threshold: 7
- File count limit: 10

**Performance**: Averages 38ms per analysis.

---

### context-validator.js

**Purpose**: Ensures AI requests have sufficient context for high-quality code generation.

**Context Scoring** (out of 25 points):
- **Architecture context** (0-5): References to existing patterns
- **Dependency context** (0-5): Import/package information  
- **Problem context** (0-5): Clear requirements
- **File references** (0-5): Links to related files (@filename)
- **Integration context** (0-5): How component fits in system

**Minimum Scores**:
- New files: 15/25 points
- Edits: 10/25 points  
- Complex operations: 20/25 points

**Example - Insufficient Context**:
```javascript
// ❌ Context score: 4/25 (blocked)
{
  "tool": "Write",
  "file_path": "Button.tsx", 
  "content": "function Button() { return <button>Click</button>; }"
}

// ✅ Context score: 18/25 (allowed)
{
  "tool": "Write",
  "file_path": "components/ui/Button.tsx",
  "prompt": "Create Button component following @components/ui/Card.tsx patterns with TypeScript props interface",
  "content": "/* Rich component with proper types */"
}
```

**Performance**: Averages 54ms per validation.

---

### api-validator.js

**Purpose**: Validates that imports, APIs, and function calls actually exist.

**Validation Types**:
- **Import resolution**: Checks if imported files/packages exist
- **Package dependencies**: Validates against package.json
- **API endpoints**: Ensures API routes exist (Next.js/Express)
- **Hallucination detection**: Catches common AI-fabricated APIs

**Example - Missing Import**:
```javascript
// ❌ Will be blocked if package not installed
import { nonExistentFunction } from 'fake-package';

// ✅ Validates against package.json
import { useState } from 'react';
```

**Built-in Node.js modules** are automatically allowed:
- `fs`, `path`, `util`, `crypto`, `http`, `https`, `url`, `os`

**Performance**: Averages 35ms per file validation.

---

### performance-checker.js

**Purpose**: Prevents performance issues in generated code.

**Detection Patterns**:
- **O(n²) algorithms**: Nested loops, inefficient searches
- **Array chain operations**: Multiple `.map().filter().map()` calls
- **React anti-patterns**: Missing dependencies, inline functions
- **Memory leaks**: Timer leaks, event listener leaks
- **Bundle impact**: Large dependencies, inefficient imports

**Example - Performance Issue**:
```javascript
// ❌ O(n²) complexity detected
for (let i = 0; i < items.length; i++) {
  for (let j = 0; j < items.length; j++) {
    if (items[i].id === items[j].parentId) {
      items[i].children.push(items[j]);
    }
  }
}

// ✅ O(n) solution suggested
const itemMap = new Map(items.map(item => [item.id, item]));
items.forEach(item => {
  const parent = itemMap.get(item.parentId);
  if (parent) parent.children.push(item);
});
```

**Severity Levels**:
- **High**: Blocks operation (O(n²), critical performance issues)
- **Medium**: Warns but allows (inefficient patterns)
- **Low**: Silent suggestions (minor optimizations)

**Performance**: Averages 40ms per analysis.

---

### test-first-enforcer.js

**Purpose**: Enforces test-driven development by requiring tests for new code.

**Requirements**:
- Test file must exist for new components
- Test coverage for new functions  
- Integration tests for API routes
- Component tests for React components

**Example - Missing Tests**:
```javascript
// ❌ Will be blocked without corresponding test
// File: components/UserCard.tsx
export function UserCard({ user }) { /* ... */ }

// ✅ Required test file
// File: components/__tests__/UserCard.test.tsx  
import { UserCard } from '../UserCard';
test('renders user information', () => { /* ... */ });
```

**Test Patterns Detected**:
- Jest/Vitest: `*.test.js`, `*.spec.js`
- React Testing Library: Component tests
- Integration: API route tests

**Performance**: Averages 35ms per validation.

## Error Messages

All hooks provide consistent, actionable error messages:

```
🔒 Security issues detected in component.js:

🔴 Critical Issues:
1. ❌ XSS vulnerability: innerHTML with user data
   ✅ Use textContent or sanitize with DOMPurify

2. ❌ Hardcoded API key detected
   ✅ Move to environment variables: process.env.API_KEY

💡 Fix critical issues before proceeding.
📖 See docs/guides/security/ for security guidelines
```

## Development Workflow Integration

### Real-time Prevention
Hooks run automatically during Claude Code interactions:
- **PreToolUse**: Analyze before file operations
- **PostToolUse**: Validate after changes
- **Fail-open**: Allow operations if hooks error

### Performance Impact
- Individual hooks: <100ms each
- Total chain: <500ms
- Concurrent execution supported
- No degradation with repeated calls

### IDE Integration
Works seamlessly with:
- Claude Code CLI
- VS Code with Claude extensions
- Cursor IDE with Claude integration
- Direct API usage

## Troubleshooting

### Common Issues

**Hook blocking legitimate code**:
```bash
# Check specific hook behavior
echo '{"file_path": "test.js", "content": "code"}' | node tools/hooks/security-scan.js
```

**Performance concerns**:
```bash
# Run performance benchmarks
npm test tools/hooks/__tests__/performance-benchmark.test.js
```

**Context validation failing**:
- Add more architectural context
- Reference existing patterns with @filename
- Include integration requirements
- Specify exact constraints

### Debugging

Enable debug output:
```bash
DEBUG=claude-hooks node tools/hooks/security-scan.js
```

View hook execution logs:
```bash
tail -f .claude/logs/hooks.log
```

## Advanced Configuration

### Custom Patterns

Add security patterns to `security-scan.js`:
```javascript
const CUSTOM_PATTERNS = [
  {
    pattern: /myCustomVulnerabilityPattern/gi,
    severity: 'high',
    issue: 'Custom security issue detected',
    suggestion: 'Use secure alternative'
  }
];
```

### Performance Thresholds

Adjust performance limits in `performance-checker.js`:
```javascript
const PERFORMANCE_THRESHOLDS = {
  maxBundleSize: 50, // KB
  maxComplexity: 10,
  maxNestingLevel: 3
};
```

### Context Requirements

Modify context scoring in `context-validator.js`:
```javascript
const CONTEXT_REQUIREMENTS = {
  newFile: 15,    // Minimum score for new files
  editFile: 10,   // Minimum score for edits  
  complex: 20     // Minimum for complex operations
};
```

## Testing

### Unit Tests
```bash
npm test tools/hooks/__tests__/security-scan.test.js
npm test tools/hooks/__tests__/scope-limiter.test.js
npm test tools/hooks/__tests__/context-validator.test.js
npm test tools/hooks/__tests__/api-validator.test.js
npm test tools/hooks/__tests__/performance-checker.test.js
```

### Integration Tests  
```bash
npm test tools/hooks/__tests__/integration.test.js
```

### Performance Benchmarks
```bash
npm test tools/hooks/__tests__/performance-benchmark.test.js
```

### User Experience Validation
```bash
npm test tools/hooks/__tests__/user-experience.test.js
```

## Best Practices

### For AI Assistants

1. **Provide Rich Context**:
   - Reference existing patterns: `@components/ui/Button.tsx`
   - Include architectural context
   - Specify integration requirements

2. **Write Focused Requests**:
   - Single responsibility per request
   - Clear, specific requirements
   - Avoid scope creep

3. **Security First**:
   - Never bypass security warnings
   - Use suggested secure alternatives
   - Validate user inputs

4. **Performance Awareness**:
   - Consider algorithm complexity
   - Optimize for bundle size
   - Follow React best practices

### For Developers

1. **Understand Hook Purpose**:
   - Context-validator blocks low-quality requests (intended)
   - Security-scan prevents vulnerabilities (critical)
   - Performance-checker optimizes code (helpful)

2. **Customize for Project**:
   - Add project-specific patterns
   - Adjust thresholds for team
   - Monitor false positive rates

3. **Maintain Test Coverage**:
   - Write tests for custom patterns
   - Validate hook performance
   - Monitor user experience metrics

## Monitoring and Metrics

### Success Metrics
- **False positive rate**: <5% for safety hooks
- **Performance**: <500ms total execution
- **Coverage**: >90% pattern detection
- **Developer satisfaction**: Positive feedback on friction reduction

### Analytics
Hook execution analytics are collected in:
- `.claude/logs/hook-metrics.json`
- Performance benchmarks
- False positive tracking
- Pattern effectiveness scores

## Support and Resources

- **Documentation**: `docs/guides/claude-code-hooks/`
- **Examples**: `ai/examples/claude-code-hooks/`
- **Issues**: Report at GitHub repository
- **Performance**: Monitor with `npm run hook:analyze`

The Claude Code hooks system represents a sophisticated approach to preventing AI development friction through real-time, intelligent validation that maintains developer productivity while ensuring code quality and security.