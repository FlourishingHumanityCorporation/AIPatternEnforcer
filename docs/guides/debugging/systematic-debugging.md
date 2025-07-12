# Systematic Debugging Guide

This guide implements the Arrow-Chain Root Cause Analysis (RCA) methodology required by ProjectTemplate. Use this
systematic approach for all bug fixes and debugging tasks.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Step-by-Step Process](#step-by-step-process)
  3. [1. Symptom Documentation](#1-symptom-documentation)
  4. [2. Data Flow Tracing](#2-data-flow-tracing)
  5. [3. Arrow Chain Diagram](#3-arrow-chain-diagram)
  6. [4. Hypothesis Formation](#4-hypothesis-formation)
  7. [5. Validation Testing](#5-validation-testing)
  8. [6. Root Cause Fix](#6-root-cause-fix)
9. [ProjectTemplate-Specific Examples](#projecttemplate-specific-examples)
  10. [Frontend Component Issues](#frontend-component-issues)
  11. [API Integration Problems](#api-integration-problems)
  12. [State Management Issues](#state-management-issues)
13. [Debugging Tools](#debugging-tools)
  14. [Context Capture](#context-capture)
  15. [Network Analysis](#network-analysis)
  16. [Database Investigation](#database-investigation)
17. [Documentation Template](#documentation-template)
18. [Root Cause Analysis](#root-cause-analysis)
19. [Common Patterns](#common-patterns)
  20. [Database Connection Issues](#database-connection-issues)
  21. [Authentication Failures  ](#authentication-failures-)
  22. [Build/Deployment Problems](#builddeployment-problems)
23. [Prevention Strategies](#prevention-strategies)
24. [Next Steps](#next-steps)
25. [Related Resources](#related-resources)

## Quick Reference

**S-T-A-H-V-P Framework**: Symptom → Trace → Arrow chain → Hypothesis → Validate → Patch

| Phase | Action | Output |
|-------|--------|---------|
| **S**ymptom | Document visible defects | Bug report, screenshots, logs |
| **T**race | Map data flow paths | Call graph, API logs |
| **A**rrow chain | Draw step-by-step flow | ASCII diagram |
| **H**ypothesis | Identify root cause | One-sentence statement |
| **V**alidate | Reproduce and test fix | Unit test, log snippet |
| **P**atch | Implement and prevent | PR, regression tests |

## Step-by-Step Process

### 1. Symptom Documentation

Record every visible issue:

```markdown
**Symptom Report**:
- UI displays "No data available" 
- Expected: User data table with 5 rows
- Environment: Chrome 118, macOS, localhost:3000
- Timestamp: 2024-01-15 14:30:22
- User action: Clicked "Load Profile" button
- Error console: No JavaScript errors visible
```

**Capture artifacts**:
- Screenshots of the error state
- Browser console logs
- Network tab showing API calls
- User steps to reproduce

### 2. Data Flow Tracing

Map how data moves through your system:

```bash
# Find all files related to the feature
grep -r "loadProfile" src/
grep -r "user.*data" src/

# Check API endpoints
grep -r "/api/users" src/
curl -X GET http://localhost:8000/api/users/123

# Check database queries
grep -r "SELECT.*users" src/
```

**Questions to answer**:
- Where is data first requested?
- What transforms the data?
- Where might data be lost or corrupted?
- What external dependencies are involved?

### 3. Arrow Chain Diagram

Draw the complete data flow with ASCII:

```text
User clicks "Load Profile" button
     ↓ (onClick handler)
ProfileComponent.handleLoadProfile()
     ↓ (dispatches action)
userStore.loadUserData(userId)
     ↓ (API call)
apiClient.get('/api/users/123')
     ↓ (Express route)
app.get('/api/users/:id', userController.getUser)
     ↓ (database query)
userService.findById(123)
     ↓ (SQL execution)
SELECT * FROM users WHERE id = 123
     ↓ (returns empty result)    ← FIRST DIVERGENCE POINT
userController returns {}
     ↓ (empty response)
userStore receives empty object
     ↓ (state update)
ProfileComponent renders "No data available"
```

**Identify the first divergence**: Where does actual behavior differ from expected?

### 4. Hypothesis Formation

State your root cause hypothesis clearly:

```markdown
**Root Cause Hypothesis**: 
The database query returns empty results because the user ID 123 
does not exist in the users table, but the frontend assumes the 
API will always return user data and doesn't handle the empty 
response case.

**Evidence**:
- Database query: `SELECT * FROM users WHERE id = 123` returns 0 rows
- API response: `{}` (empty object)
- Frontend expects: `{ id, name, email }` structure
```

### 5. Validation Testing

Create a minimal test that reproduces the issue:

```typescript
// Test to reproduce the bug
describe('User Profile Loading', () => {
  it('should handle missing user gracefully', async () => {
    // Arrange: Set up scenario where user doesn't exist
    const nonExistentUserId = 999;
    
    // Act: Attempt to load profile
    const result = await userService.findById(nonExistentUserId);
    
    // Assert: Should get specific error, not empty object
    expect(result).toEqual({ error: 'User not found' });
    expect(result).not.toEqual({});
  });
});
```

### 6. Root Cause Fix

Implement fix at the root cause level:

```typescript
// ❌ Bad: Fix symptom only
if (!userData || Object.keys(userData).length === 0) {
  return <div>No data available</div>;
}

// ✅ Good: Fix root cause
export const userController = {
  async getUser(req, res) {
    const user = await userService.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      });
    }
    
    res.json(user);
  }
};
```

Add regression test:
```typescript
describe('User API', () => {
  it('returns 404 for non-existent users', async () => {
    const response = await request(app)
      .get('/api/users/999')
      .expect(404);
      
    expect(response.body).toEqual({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  });
});
```

## ProjectTemplate-Specific Examples

### Frontend Component Issues

**Symptom**: Button not responding to clicks
**Arrow Chain**:
```text
User clicks submit button
     ↓ (onClick event)
handleSubmit function called
     ↓ (validation check)
if (isValid) { ... }              ← Check this condition
     ↓ (validation fails silently)
Function returns early
     ↓
No API call made
     ↓
UI stays in loading state
```

### API Integration Problems

**Symptom**: API returns 500 error
**Arrow Chain**:
```text
Client POST /api/auth/login
     ↓ (Express middleware)
authController.login(req, res)
     ↓ (request parsing)
const { email, password } = req.body
     ↓ (database query)
user = await User.findByEmail(email)
     ↓ (comparison)
bcrypt.compare(password, user.password)  ← Check if user is null
     ↓ (throws error on null.password)
500 Internal Server Error
```

### State Management Issues

**Symptom**: Data disappears after page refresh
**Arrow Chain**:
```text
User loads page
     ↓ (React component mount)
useEffect(() => { ... }, [])
     ↓ (checks localStorage)
const saved = localStorage.getItem('userData')
     ↓ (parsing)
JSON.parse(saved)                 ← Check if saved is null
     ↓ (throws on JSON.parse(null))
Component crashes silently
     ↓
Fallback to empty state
```

## Debugging Tools

### Context Capture

```bash
# Get full debugging context
npm run debug:snapshot

# Check recent changes
git log --oneline -10
git diff HEAD~3

# Monitor real-time logs
tail -f logs/app.log | grep ERROR
```

### Network Analysis

```bash
# Test API endpoints directly
curl -v http://localhost:8000/api/users/123
curl -X POST -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}' \
     http://localhost:8000/api/auth/login
```

### Database Investigation

```sql
-- Check data existence
SELECT COUNT(*) FROM users WHERE id = 123;

-- Check recent changes
SELECT * FROM users ORDER BY updated_at DESC LIMIT 5;

-- Check constraints
SHOW CREATE TABLE users;
```

## Documentation Template

When fixing bugs, document your analysis:

```markdown
## Root Cause Analysis

**Symptom**: [What user sees]
**Root Cause**: [First divergence point in arrow chain]

**Arrow Chain**:
```
[Step-by-step data flow showing the problem]
```

**Fix**: [What was changed and why]
**Test**: [How to verify the fix works]
**Prevention**: [How to avoid this in the future]
```

## Common Patterns

### Database Connection Issues
- **Symptom**: "Connection refused" errors
- **Common causes**: Service not running, wrong credentials, network issues
- **Arrow chain**: App → DB connection pool → network → database server

### Authentication Failures  
- **Symptom**: 401 Unauthorized responses
- **Common causes**: Expired tokens, missing headers, wrong endpoints
- **Arrow chain**: Client → auth middleware → token validation → user lookup

### Build/Deployment Problems
- **Symptom**: "Module not found" in production
- **Common causes**: Missing dependencies, wrong build config, environment differences
- **Arrow chain**: Build process → bundler → dependency resolution → module loading

## Prevention Strategies

1. **Add monitoring at key checkpoints**
2. **Include error logging at each arrow step**
3. **Write tests for each major transformation**
4. **Document expected data shapes**
5. **Use TypeScript for compile-time catching**

## Next Steps

After fixing a bug:
1. Add the arrow chain to code comments
2. Create regression test
3. Update error handling at divergence point
4. Document in architecture decisions if significant

## Related Resources

- [Debug Context Capture](../../../CLAUDE.md#debug-context-capture) - Comprehensive debugging tools
- [Testing Guide](../testing/comprehensive-testing-guide.md) - How to write regression tests  
- [Performance Guide](../performance/optimization-playbook.md) - Performance-related debugging