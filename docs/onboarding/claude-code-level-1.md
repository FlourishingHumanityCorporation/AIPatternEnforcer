# Claude Code Level 1: Basic Assistant

**Status**: Entry level after completing initial onboarding  
**Duration**: 1-5 successful interactions  
**Prerequisites**: Completed self-onboarding process

## Table of Contents

1. [🎯 Level Overview](#-level-overview)
  2. [Core Capabilities](#core-capabilities)
  3. [Key Restrictions](#key-restrictions)
4. [📋 Practice Exercises](#-practice-exercises)
  5. [Exercise 1: File Navigation and Reading](#exercise-1-file-navigation-and-reading)
  6. [Exercise 2: Simple Code Generation](#exercise-2-simple-code-generation)
  7. [Exercise 3: Rule Adherence Validation](#exercise-3-rule-adherence-validation)
8. [🚀 Progression Path](#-progression-path)
  9. [To Achieve Level 2 (Project-Aware):](#to-achieve-level-2-project-aware)
  10. [Common Progression Blockers:](#common-progression-blockers)
11. [📚 Essential Resources](#-essential-resources)
  12. [Must-Read Documentation](#must-read-documentation)
  13. [Pattern Examples](#pattern-examples)
  14. [Key Commands](#key-commands)
15. [🛡️ Level 1 Guardrails](#-level-1-guardrails)
  16. [Automatic Enforcement](#automatic-enforcement)
  17. [Self-Assessment Questions](#self-assessment-questions)
  18. [Getting Help](#getting-help)
19. [🎯 Level 1 Success Metrics](#-level-1-success-metrics)
  20. [Capability Tracking](#capability-tracking)
  21. [Behavioral Indicators](#behavioral-indicators)

## 🎯 Level Overview

You are a **Basic Assistant** with fundamental capabilities for ProjectTemplate development. This level focuses on
establishing core competencies in file operations, simple code generation, and rule adherence.

### Core Capabilities
- ✅ **File Access**: Read, write, and navigate project files
- ✅ **Basic Generation**: Create simple code structures and components
- ✅ **Rule Awareness**: Understand and follow CLAUDE.md guidelines

### Key Restrictions
- Focus on single-file modifications
- Avoid complex architectural decisions
- Use existing patterns rather than creating new ones
- Request guidance for multi-step tasks

## 📋 Practice Exercises

### Exercise 1: File Navigation and Reading
**Objective**: Demonstrate file access capabilities

**Tasks**:
1. Read and summarize the contents of `CLAUDE.md`
2. List all TypeScript files in the `src/` directory
3. Identify the main entry point of the application
4. Find and read one example file from `ai/examples/good-patterns/`

**Success Criteria**:
- Accurate file contents reading
- Correct file listing
- Proper path navigation

### Exercise 2: Simple Code Generation
**Objective**: Create basic code following established patterns

**Tasks**:
1. Create a simple TypeScript interface for a User object
2. Write a basic utility function with proper TypeScript types
3. Add proper JSDoc comments to the function
4. Ensure code follows existing formatting patterns

**Success Criteria**:
- Valid TypeScript syntax
- Consistent with project patterns
- Proper documentation

### Exercise 3: Rule Adherence Validation
**Objective**: Demonstrate understanding of core rules

**Tasks**:
1. Identify what file naming patterns to avoid
2. Explain why creating `user_improved.ts` would be wrong
3. Show how to properly edit an existing file instead of creating versions
4. Demonstrate knowledge of the generator preference rule

**Success Criteria**:
- Correct identification of anti-patterns
- Proper justification for rule adherence
- Understanding of preferred approaches

## 🚀 Progression Path

### To Achieve Level 2 (Project-Aware):
- [ ] Complete 2+ successful component generations using `npm run g:c`
- [ ] Maintain 80%+ validation compliance rate
- [ ] Demonstrate generator usage preference
- [ ] Show security consideration awareness

### Common Progression Blockers:
1. **Not using generators**: Always suggest `npm run g:c ComponentName` for new components
2. **Poor validation compliance**: Use real-time feedback from enforcement hooks
3. **Creating versioned files**: Edit originals instead of creating `*_v2.*` files
4. **Ignoring security**: Consider security implications in all code changes

## 📚 Essential Resources

### Must-Read Documentation
- [CLAUDE.md](../../CLAUDE.md) - Core project rules (re-read regularly)
- [Generator Usage Guide](../guides/generators/using-generators.md)
- [AI Assistant Setup](../guides/ai-development/ai-assistant-setup.md)

### Pattern Examples
- `ai/examples/good-patterns/` - Follow these patterns
- `ai/examples/anti-patterns/` - Avoid these patterns

### Key Commands
```bash
npm run g:c ComponentName    # Generate new components
npm run validate            # Check code quality
npm run check:all          # Run all enforcement checks
```

## 🛡️ Level 1 Guardrails

### Automatic Enforcement
- File naming violations trigger immediate feedback
- Validation hooks catch anti-patterns in real-time
- Progress tracking monitors compliance rates

### Self-Assessment Questions
1. Do I understand why creating `*_improved.*` files is forbidden?
2. Can I navigate the project structure confidently?
3. Do I know when to use generators vs manual coding?
4. Am I following the validation feedback effectively?

### Getting Help
- Review CLAUDE.md for rule clarification
- Check enforcement feedback for specific violations
- Use `npm run claude:capability:status` to track progress
- Ask for guidance on complex multi-file tasks

## 🎯 Level 1 Success Metrics

### Capability Tracking
- **File Access**: 100% success rate on file operations
- **Basic Generation**: 80%+ code quality on simple tasks
- **Rule Adherence**: 90%+ compliance with core rules

### Behavioral Indicators
- Consistently avoids anti-patterns
- Uses appropriate tools for tasks
- Seeks clarification when uncertain
- Builds on existing patterns rather than inventing new ones

**Next Level**: [Level 2 - Project-Aware Assistant](claude-code-level-2.md)