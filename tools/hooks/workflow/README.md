# Workflow Enforcement Hooks

This directory contains hooks that enforce best practices for development workflows, encouraging plan-first development, test-driven development, and manageable pull requests.

## Hooks in this Category

### 1. plan-first-enforcer.js

- **Purpose**: Ensures developers create a plan before implementing features
- **Blocking**: Soft-block for new features without plan
- **Priority**: High
- **Key Features**:
  - Detects new feature creation
  - Checks for PLAN.md or TODO.md
  - Provides planning guidance
  - Skips when creating plan files

### 2. test-first-enforcer.js

- **Purpose**: Enforces test-first development for components
- **Blocking**: Soft-block for components without tests
- **Priority**: High
- **Key Features**:
  - Detects component/service creation
  - Checks for existing test files
  - Suggests test file locations
  - Smart pattern detection

### 3. pr-scope-guardian.js

- **Purpose**: Prevents oversized pull requests
- **Blocking**: Hard-block at 1.5x limit, warning at limit
- **Priority**: Medium
- **Key Features**:
  - Tracks file changes per session
  - Configurable PR size limits
  - Shows changed file list
  - Progressive warnings

### 4. architecture-checker.js

- **Purpose**: Enforces proper project structure
- **Blocking**: Hard-block for root directory violations
- **Priority**: High
- **Key Features**:
  - Prevents app code in root
  - Suggests proper locations
  - Detects misplaced files
  - Architecture validation

### 5. session-cleanup.js

- **Purpose**: Periodic workspace cleanup
- **Blocking**: None (maintenance only)
- **Priority**: Low
- **Key Features**:
  - Removes junk files
  - Cleans empty directories
  - Updates .gitignore
  - Runs every 30 minutes

## Configuration

Workflow limits are defined in `lib/constants.js`:

```javascript
SESSION_LIMITS = {
  MAX_MESSAGE_COUNT: 50,
  MAX_SESSION_HOURS: 4,
  IDLE_TIME_MINUTES: 30,
  MAX_PR_FILES: 15,
  MAX_PR_LINES: 500,
};
```

## Best Practices Enforced

1. **Plan-First Development**
   - Think before coding
   - Document approach
   - Consider edge cases

2. **Test-First Development**
   - Write tests before implementation
   - Clear behavior specification
   - Better API design

3. **Small PRs**
   - Easier to review
   - Less merge conflicts
   - Faster iterations

4. **Clean Architecture**
   - Organized file structure
   - No root pollution
   - Consistent patterns

## Testing

```bash
# Test workflow enforcement
npm test -- tools/hooks/workflow/__tests__/

# Test individual hooks
echo '{"tool_name": "Write", "file_path": "components/NewFeature.tsx"}' | node plan-first-enforcer.js
echo '{"tool_name": "Write", "file_path": "components/Button.tsx"}' | node test-first-enforcer.js
```
