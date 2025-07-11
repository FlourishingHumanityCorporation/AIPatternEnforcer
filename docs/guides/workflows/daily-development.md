# Daily Development Workflow

## Overview

This guide outlines the recommended daily development workflow for maximum productivity with AI assistance.

## Morning Startup Routine

### 1. Environment Check (5 min)

```bash
# Pull latest changes
git pull origin main

# Check for dependency updates
npm outdated

# Verify environment
npm run ai:context

# Check for any overnight CI failures
gh run list --limit 5
```

### 2. Context Loading (5 min)

- Open project in Cursor/VS Code
- Verify `.cursorrules` is loaded
- Open key files for current work
- Review yesterday's TODO comments

### 3. Plan the Day

```bash
# Review current tasks
gh issue list --assignee @me

# Check PR reviews needed
gh pr list --reviewer @me

# Update local todo
vim TODO.md
```

## Development Flow

### Starting a New Feature

#### 1. Create Feature Branch

```bash
# Create branch from main
git checkout main
git pull
git checkout -b feature/[ticket-number]-[brief-description]
```

#### 2. Gather Context

```bash
# Capture feature context
./scripts/dev/gather-feature-context.sh [feature-name]

# Review related code
./scripts/quality/find-usages.sh [RelatedComponent]
```

#### 3. AI Planning Session

Use the feature planning prompt:

```markdown
@ai/prompts/feature/planning.md
[Fill in template]
[Get implementation plan from AI]
[Save plan to docs/decisions/]
```

#### 4. Test-First Development

1. Write tests based on requirements
2. Use AI to generate test cases
3. Implement feature to pass tests
4. Refactor with AI assistance

### During Development

#### Code-Review-As-You-Go

Every 30-45 minutes:

```bash
# Review your changes
git diff

# Run quality checks
npm run lint
npm run type-check

# Verify imports
./scripts/quality/verify-imports.sh
```

#### AI Interaction Pattern

1. **Write code block** (15-20 min)
2. **AI review** for improvements
3. **Run tests** to verify
4. **Commit** if tests pass

#### Commit Strategy

```bash
# Atomic commits
git add -p  # Stage selectively
git commit -m "feat: implement user avatar upload

- Add avatar field to user model
- Create upload endpoint
- Add file validation"

# Every 2-3 commits
git push origin feature/branch
```

## Debugging Workflow

When encountering issues:

### 1. Quick Debug

```bash
# Capture debug context
./scripts/dev/debug-snapshot.sh

# Use debugging prompt
@ai/prompts/debugging/error-analysis.md
```

### 2. Systematic Debug

- Use Arrow-Chain methodology
- Create minimal reproduction
- Document in PR/issue

## Code Review Process

### Preparing PR

```bash
# Ensure all tests pass
npm test

# Run security checks
./scripts/dev/check-security.sh

# Create PR
gh pr create --fill
```

### PR Template Usage

- Declare AI usage
- Link to planning docs
- Include test evidence
- Add screenshots if UI

## End of Day Routine

### 1. Clean Up (10 min)

```bash
# Commit or stash work
git status
git stash save "WIP: [what you were doing]"

# Push all commits
git push

# Update PR if exists
gh pr edit --body "Updated with today's progress"
```

### 2. Document Progress

```bash
# Save useful AI conversations
./scripts/utils/save-ai-conversation.sh "Feature X implementation"

# Update team on blockers
gh issue comment [issue-number] --body "Progress update..."
```

### 3. Prepare Tomorrow

- Leave TODO comments in code
- Update task tracking
- Note any blockers
- Clear browser tabs

## Weekly Maintenance

### Monday - Planning

- Review week's tasks
- Update documentation
- Plan AI prompt improvements

### Wednesday - Quality

- Run full test suite
- Check code coverage
- Review security alerts

### Friday - Cleanup

- Archive old branches
- Update dependencies
- Refactor technical debt
- Update team knowledge base

## Best Practices

### DO:

- ✅ Commit early and often
- ✅ Use AI for repetitive tasks
- ✅ Keep PRs small (< 400 lines)
- ✅ Write tests first
- ✅ Document decisions

### DON'T:

- ❌ Work on main branch
- ❌ Commit sensitive data
- ❌ Skip tests "just this once"
- ❌ Merge without review
- ❌ Leave TODOs without tickets

## Productivity Tips

### Time Boxing

- Feature work: 2-hour blocks
- Bug fixes: 1-hour blocks
- Reviews: 30-min blocks
- Meetings: Batch together

### Context Switching

When switching tasks:

```bash
# Save current context
git stash save "Context: [what you were doing]"
./scripts/utils/save-work-context.sh

# Load new context
git checkout [other-branch]
./scripts/dev/gather-feature-context.sh [feature]
```

### AI Effectiveness

- Prime AI with context at start
- Use consistent terminology
- Reference existing patterns
- Save effective prompts

## Troubleshooting Daily Issues

### "AI gives inconsistent answers"

- Check `.cursorrules` is loaded
- Provide more context
- Reference specific files

### "Tests failing in CI but not locally"

```bash
# Match CI environment
docker-compose run --rm test
# or
npm run test:ci
```

### "Merge conflicts"

```bash
# Update from main frequently
git fetch origin
git rebase origin/main
# Fix conflicts with AI help
```

Remember: The goal is sustainable productivity. Take breaks, document well, and use AI as an accelerator, not a replacement for thinking.
