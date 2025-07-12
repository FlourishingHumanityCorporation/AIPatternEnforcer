# Claude Code Specific Anti-Patterns

This directory contains real examples of mistakes that Claude Code instances commonly make when working with
ProjectTemplate. Each anti-pattern is documented with severity levels, explanations, and correct approaches.

## Table of Contents

1. [📁 Anti-Pattern Categories](#-anti-pattern-categories)
  2. [1. [File Naming Violations](./file-naming-violations.ts)](#1-file-naming-violationsfile-naming-violationsts)
3. [2. [Code Generation
Mistakes](./code-generation-mistakes.tsx)](#2-code-generation-mistakescode-generation-mistakestsx)
4. [3. [Validation Compliance
Failures](./validation-compliance-failures.md)](#3-validation-compliance-failuresvalidation-compliance-failuresmd)
5. [🎯 How to Use These Anti-Patterns](#-how-to-use-these-anti-patterns)
  6. [For Fresh Claude Code Instances](#for-fresh-claude-code-instances)
  7. [For Capability Progression](#for-capability-progression)
  8. [For Validation System Integration](#for-validation-system-integration)
9. [📊 Learning Effectiveness Metrics](#-learning-effectiveness-metrics)
  10. [Anti-Pattern Recognition Success](#anti-pattern-recognition-success)
  11. [Violation Reduction](#violation-reduction)
  12. [Pattern Application](#pattern-application)
13. [🔄 Continuous Improvement](#-continuous-improvement)
  14. [Adding New Anti-Patterns](#adding-new-anti-patterns)
  15. [Pattern Validation](#pattern-validation)
16. [🎓 Study Recommendations](#-study-recommendations)
  17. [Daily Practice (5 minutes)](#daily-practice-5-minutes)
  18. [Weekly Review (15 minutes)](#weekly-review-15-minutes)
  19. [Monthly Assessment (30 minutes)](#monthly-assessment-30-minutes)
20. [🔗 Related Resources](#-related-resources)

## 📁 Anti-Pattern Categories

### 1. [File Naming Violations](./file-naming-violations.ts)
**Severity: CRITICAL**  
Common mistakes in file naming and organization that break project structure.

**Key Anti-Patterns:**
- Creating `*_improved.js`, `*_enhanced.tsx`, `*_v2.py` files
- Placing files in root directory outside allowlist
- Using non-descriptive or inconsistent naming patterns

**Learning Focus:** Always edit existing files, never create versions

### 2. [Code Generation Mistakes](./code-generation-mistakes.tsx)
**Severity: HIGH**  
Errors in code quality, standards, and optimal practices during generation.

**Key Anti-Patterns:**
- Using `console.log` instead of proper logging
- Bare except clauses without specific exception types
- Not using generators for component creation
- Ignoring TypeScript safety and security considerations

**Learning Focus:** Follow established patterns, use proper tooling

### 3. [Validation Compliance Failures](./validation-compliance-failures.md)
**Severity: CRITICAL**  
Patterns of ignoring or misunderstanding the validation system feedback.

**Key Anti-Patterns:**
- Dismissing real-time validation feedback
- Repeated violations of the same rules
- Not running validation commands proactively
- Misunderstanding severity levels

**Learning Focus:** Learn from validation feedback, maintain high compliance

## 🎯 How to Use These Anti-Patterns

### For Fresh Claude Code Instances

1. **Read all anti-pattern files** during onboarding Phase 3 (ASSESS)
2. **Understand the severity levels** and impact of each violation
3. **Practice pattern recognition** by identifying issues in example code
4. **Reference during development** when uncertain about approaches

### For Capability Progression

- **Level 1 (Basic)**: Focus on file naming and basic code generation
- **Level 2 (Project-Aware)**: Master validation compliance and security patterns
- **Level 3 (Advanced)**: Contribute to anti-pattern identification
- **Level 4 (Expert)**: Mentor other instances on avoiding these mistakes

### For Validation System Integration

Each anti-pattern corresponds to enforcement rules that catch violations in real-time:

- **File naming violations** → Root file enforcement, improved file detection
- **Code generation mistakes** → Import checking, documentation style
- **Validation compliance** → Capability tracking, compliance metrics

## 📊 Learning Effectiveness Metrics

### Anti-Pattern Recognition Success
- **Target**: 95% correct identification of anti-patterns in code review
- **Measurement**: Pattern quiz scores, real-world violation rates

### Violation Reduction
- **Target**: <5% repeat violations of same anti-pattern
- **Measurement**: Compliance metrics over time

### Pattern Application
- **Target**: Proactive application of correct patterns
- **Measurement**: Code quality scores, peer review feedback

## 🔄 Continuous Improvement

### Adding New Anti-Patterns

When new violation patterns are identified:

1. Document in appropriate category file
2. Include severity level and impact explanation
3. Provide correct approach examples
4. Cross-reference with FRICTION-MAPPING.md
5. Update enforcement rules if needed

### Pattern Validation

Each anti-pattern should be:
- **Real**: Based on actual Claude Code mistakes
- **Specific**: Clear examples with explanations
- **Actionable**: Include correct alternatives
- **Categorized**: Proper severity and learning level
- **Measurable**: Connected to validation metrics

## 🎓 Study Recommendations

### Daily Practice (5 minutes)
- Review one anti-pattern file
- Practice identification in current work
- Check compliance status

### Weekly Review (15 minutes)
- Assess personal violation patterns
- Focus study on problem areas
- Update learning approach

### Monthly Assessment (30 minutes)
- Comprehensive anti-pattern quiz
- Compliance trend analysis
- Capability level evaluation

## 🔗 Related Resources

- [CLAUDE.md](../../../CLAUDE.md) - Core project rules
- [FRICTION-MAPPING.md](../../../FRICTION-MAPPING.md) - Systematic problem mapping
- [Good Patterns](../good-patterns/) - Correct implementation examples
- [Capability Tracker](../../../tools/onboarding/capability-tracker.js) - Progress monitoring

---

**Remember**: Anti-patterns are learning opportunities. The goal is not to avoid all mistakes, but to learn from them
quickly and not repeat them. The validation system and these examples work together to accelerate learning and improve
consistency.