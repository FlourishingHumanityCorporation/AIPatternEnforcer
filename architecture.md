## AI-Assisted Development Workflow

### Starting a New Feature

1. Run `npm run ai:context` to capture current state
2. Use @prompts/feature-planning.md template
3. Save AI's architectural plan to docs/decisions/
4. Generate tests FIRST using the plan
5. Implement feature with AI assistance
6. Run security and type checks before committing

### Debugging Sessions

1. Capture full context with ai:context script
2. Use @prompts/debugging.md template
3. Save solution to docs/ai-conversations/ if novel

### Before Each Commit

- [ ] Run `npm run ai:check`
- [ ] Review diff for unwanted changes
- [ ] Ensure no console.log statements
- [ ] Verify no hardcoded secrets
