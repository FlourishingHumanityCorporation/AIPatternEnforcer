# Error Analysis Prompt Template

## Context

I'm debugging an issue in [PROJECT/FEATURE NAME]. Here's the comprehensive context:

## Error Information

### Error Message

```
[Paste the complete error message/stack trace]
```

### When It Occurs

- [ ] On startup
- [ ] During specific user action: [describe]
- [ ] After certain time/condition: [describe]
- [ ] Intermittently
- [ ] In specific environment: [dev/staging/prod]

### Reproduction Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior

[What should happen instead]

## Environment Context

```
[Paste output from npm run ai:context]
```

## Code Context

### Relevant Files

- Main file where error occurs: @[path/to/file]
- Related files: @[path/to/related/files]
- Recent changes: @[path/to/recently/modified]

### Recent Changes

[Describe any recent changes that might be related]

## What I've Tried

1. [Attempted solution 1] - Result: [what happened]
2. [Attempted solution 2] - Result: [what happened]

## Analysis Request

Please help me:

1. **Root Cause Analysis**: Identify the root cause using the Arrow-Chain methodology
2. **Immediate Fix**: Provide a solution to resolve the error
3. **Prevention**: Suggest how to prevent similar issues
4. **Testing**: Recommend tests to add

## Additional Information

- Related issues: [link to any related issues]
- Similar errors: [any similar errors in logs]
- Dependencies involved: [list key dependencies]

## Output Format

Please provide:

1. Root cause explanation with Arrow-Chain diagram
2. Step-by-step fix implementation
3. Code changes in diff format
4. Test cases to add
5. Monitoring/logging improvements
