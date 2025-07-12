# Documentation Standards

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
  3. [1. **Clarity over Cleverness**](#1-clarity-over-cleverness)
  4. [2. **Completeness without Redundancy**](#2-completeness-without-redundancy)
  5. [3. **Consistency in Structure**](#3-consistency-in-structure)
  6. [4. **Timeless Language**](#4-timeless-language)
7. [Documentation Types and Requirements](#documentation-types-and-requirements)
  8. [1. **API Documentation**](#1-api-documentation)
  9. [2. **Component Documentation**](#2-component-documentation)
  10. [3. **Tool and Script Documentation**](#3-tool-and-script-documentation)
  11. [4. **Configuration Documentation**](#4-configuration-documentation)
  12. [5. **Feature Documentation**](#5-feature-documentation)
  13. [6. **Analysis Reports**](#6-analysis-reports)
14. [Documentation Structure Standards](#documentation-structure-standards)
  15. [File Organization](#file-organization)
  16. [File Naming Conventions](#file-naming-conventions)
  17. [Document Structure Template](#document-structure-template)
18. [Overview](#overview)
19. [[Main Content Sections]](#main-content-sections)
20. [Examples](#examples)
21. [Related Documentation](#related-documentation)
22. [Troubleshooting](#troubleshooting)
23. [Writing Style Guide](#writing-style-guide)
  24. [Language and Tone](#language-and-tone)
  25. [Technical Writing Rules](#technical-writing-rules)
  26. [Forbidden Patterns](#forbidden-patterns)
  27. [Code Examples Standards](#code-examples-standards)
28. [Quality Assurance](#quality-assurance)
  29. [Documentation Review Checklist](#documentation-review-checklist)
  30. [Documentation Maintenance](#documentation-maintenance)
31. [Enforcement and Automation](#enforcement-and-automation)
  32. [Automated Checks](#automated-checks)
  33. [Pre-commit Hooks](#pre-commit-hooks)
  34. [Documentation Debt Tracking](#documentation-debt-tracking)
35. [Templates and Tools](#templates-and-tools)
  36. [Available Templates](#available-templates)
  37. [Documentation Tools](#documentation-tools)
  38. [Integration with Development Workflow](#integration-with-development-workflow)

## Overview

This document defines the documentation standards for ProjectTemplate to ensure consistency, completeness, and
maintainability across all project documentation.

## Core Principles

### 1. **Clarity over Cleverness**
- Write for your future self and other developers
- Use simple, direct language
- Avoid jargon without explanation
- Include context and reasoning

### 2. **Completeness without Redundancy**
- Document the "why" not just the "what"
- Include examples and usage patterns
- Avoid duplicating information that exists elsewhere
- Link to related documentation

### 3. **Consistency in Structure**
- Follow established templates and patterns
- Use consistent naming conventions
- Maintain uniform formatting and style
- Apply consistent terminology

### 4. **Timeless Language**
- Avoid announcement-style language ("This document describes...")
- Use present tense for current functionality
- Focus on technical facts over marketing
- Write documentation that won't become stale

## Documentation Types and Requirements

### 1. **API Documentation**
**Required for**: All public APIs, endpoints, and interfaces

**Must Include**:
- Function/method signature
- Parameter descriptions with types
- Return value description
- Error conditions and error codes
- Usage examples
- Authentication requirements (if applicable)

**Template**: Use `docs/templates/api-documentation.md`

**Example**:
```typescript
/**
 * Creates a new user account
 * 
 * @param userData - User registration data
 * @param userData.email - Valid email address
 * @param userData.password - Password (8+ characters)
 * @returns Promise<User> - Created user object
 * @throws {ValidationError} - Invalid input data
 * @throws {ConflictError} - Email already exists
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * });
 * ```
 */
```

### 2. **Component Documentation**
**Required for**: All React components, UI components, and reusable elements

**Must Include**:
- Component purpose and use cases
- Props interface with types and descriptions
- Usage examples with code
- Styling and theming information
- Accessibility considerations
- Common patterns and optimal practices

**Template**: Use `docs/templates/component-documentation.md`

### 3. **Tool and Script Documentation**
**Required for**: All scripts in `scripts/`, tools in `tools/`, generators, and utilities

**Must Include**:
- Purpose and use cases
- Command-line interface (if applicable)
- Configuration options
- Input/output formats
- Dependencies and prerequisites
- Examples and common workflows

**Template**: Use `docs/templates/tool-documentation.md`

### 4. **Configuration Documentation**
**Required for**: Config files, environment variables, setup procedures

**Must Include**:
- All configuration options and their effects
- Default values and valid ranges
- Environment-specific considerations
- Security implications
- Migration guides for configuration changes

**Template**: Use `docs/templates/configuration-documentation.md`

### 5. **Feature Documentation**
**Required for**: New features, significant functionality changes, user-facing changes

**Must Include**:
- Feature overview and benefits
- User journey and workflows
- Technical implementation details
- Integration points
- Testing and validation approach
- Rollback procedures

**Template**: Use `docs/templates/feature-documentation.md`

### 6. **Analysis Reports**
**Required for**: System analysis, audits, assessments, performance reports

**Must Include**:
- Executive summary with key findings
- Methodology and data sources
- Detailed findings with evidence
- Risk assessment and impact analysis
- Specific recommendations with timelines
- Implementation plan and success metrics

**Template**: Use `docs/templates/analysis-report-template.md`

**Quality Standards**:
- Data-driven conclusions with supporting evidence
- Clear distinction between facts and recommendations
- Actionable recommendations with owners and timelines
- Risk assessment with mitigation strategies

## Documentation Structure Standards

### File Organization
```text
docs/
├── README.md                 # Documentation hub and navigation
├── standards/               # This directory
│   ├── documentation-standards.md
│   ├── writing-style-guide.md
│   └── review-checklist.md
├── templates/               # Documentation templates
│   ├── api-documentation.md
│   ├── component-documentation.md
│   ├── tool-documentation.md
│   ├── configuration-documentation.md
│   └── feature-documentation.md
├── guides/                  # Step-by-step guides
│   ├── getting-started.md
│   ├── development/
│   ├── deployment/
│   └── troubleshooting/
├── api/                     # API documentation
├── components/              # Component documentation
├── tools/                   # Tool documentation
├── architecture/            # Architecture decisions and diagrams
├── decisions/               # ADRs (Architecture Decision Records)
└── reports/                 # Analysis and metrics reports
```

### File Naming Conventions
- Use lowercase with hyphens: `user-authentication.md`
- Be descriptive: `payment-processing-api.md` not `payment.md`
- Include versioning when needed: `api-v2-migration.md`
- Use consistent suffixes:
  - `-guide.md` for step-by-step instructions
  - `-reference.md` for complete option lists
  - `-examples.md` for example collections
  - `-troubleshooting.md` for problem-solving

### Document Structure Template
Every documentation file should follow this structure:

```markdown
# [Document Title]

## Overview
Brief description of what this document covers and its purpose.

## [Main Content Sections]
Organize content logically with clear headings.

## Examples
Practical examples showing usage patterns.

## Related Documentation
Links to related docs, with context for when to use them.

## Troubleshooting
Common issues and solutions (if applicable).

---
**Last Updated**: [Date]  
**Maintainer**: [Team/Person]  
**Version**: [Version Number]
```

## Writing Style Guide

### Language and Tone
- **Professional and Direct**: Avoid casual language in technical documentation
- **Active Voice**: "Configure the database" not "The database should be configured"
- **Present Tense**: "The function returns" not "The function will return"
- **Specific and Concrete**: "Set timeout to 30 seconds" not "Set a reasonable timeout"

### Technical Writing Rules
- **Code Formatting**: Use `backticks` for inline code, triple backticks for code blocks
- **Links**: Use descriptive link text, not "click here" or raw URLs
- **Lists**: Use bullet points for unordered items, numbers for sequences
- **Emphasis**: Use **bold** for important concepts, *italics* for emphasis

### Forbidden Patterns
❌ **Never Use**:
- "This document describes..."
- "Implemented..."
- "This functional feature..."
- "Simply" or "just" (minimizes complexity)
- "Obviously" or "clearly" (excludes readers)

✅ **Use Instead**:
- "This feature provides..."
- "The implementation includes..."
- "This feature enables..."
- Direct descriptions without qualifiers
- Assume readers need context

### Code Examples Standards
- **Complete Examples**: Show full working examples, not fragments
- **Realistic Data**: Use meaningful example data, not "foo" and "bar"
- **Error Handling**: Include error handling in examples
- **Comments**: Explain non-obvious parts of code examples

```typescript
// ✅ Good Example
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  try {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  } catch (error) {
    if (error.status === 404) {
      throw new UserNotFoundError(`User ${userId} not found`);
    }
    throw error;
  }
}

// ❌ Avoid
function getUser(id) {
  return api.get('/users/' + id);
}
```

## Quality Assurance

### Documentation Review Checklist
Before publishing documentation, verify:

**Content Quality**:
- [ ] Accurate and up-to-date information
- [ ] Complete coverage of the topic
- [ ] Clear examples and use cases
- [ ] Proper error handling and edge cases

**Structure and Style**:
- [ ] Follows template structure
- [ ] Uses consistent formatting
- [ ] Clear headings and navigation
- [ ] Proper grammar and spelling

**Technical Accuracy**:
- [ ] Code examples are tested and working
- [ ] Links are valid and working
- [ ] Screenshots are current (if used)
- [ ] Version information is accurate

**Usability**:
- [ ] Can be understood by target audience
- [ ] Includes necessary context
- [ ] Has clear next steps or conclusions
- [ ] Cross-references related documentation

### Documentation Maintenance

**Regular Reviews**:
- Monthly review of high-traffic documentation
- Quarterly review of all technical documentation
- Immediate updates when code changes affect documentation

**Version Control**:
- Include documentation changes in pull requests
- Link documentation updates to code changes
- Maintain changelog for major documentation updates

**Metrics and Feedback**:
- Track documentation usage and effectiveness
- Collect feedback from users and developers
- Monitor for outdated or problematic documentation

## Enforcement and Automation

### Automated Checks
The following checks are enforced automatically:

1. **Documentation Coverage**: Ensure new files have corresponding documentation
2. **Link Validation**: Verify all internal and external links work
3. **Style Compliance**: Check for forbidden patterns and style violations
4. **Template Compliance**: Verify documents follow required templates
5. **Example Validation**: Test code examples for correctness

### Pre-commit Hooks
Documentation enforcement is integrated into pre-commit hooks:
- `npm run docs:check` - Run all documentation checks
- `npm run docs:analyze` - Analyze documentation coverage
- `npm run docs:metrics` - Generate documentation quality metrics

### Documentation Debt Tracking
- Regular analysis of documentation gaps
- Prioritization of documentation updates
- Integration with development planning

## Templates and Tools

### Available Templates
- **API Documentation**: `docs/templates/api-documentation.md`
- **Component Documentation**: `docs/templates/component-documentation.md`
- **Tool Documentation**: `docs/templates/tool-documentation.md`
- **Analysis Reports**: `docs/templates/analysis-report-template.md`
- **Configuration Documentation**: `docs/templates/configuration-documentation.md`
- **Feature Documentation**: `docs/templates/feature-documentation.md`

### Documentation Tools
- **Generators**: Automatic documentation generation for components and APIs
- **Validators**: Automated checking for style and completeness
- **Metrics**: Documentation coverage and quality tracking
- **Templates**: Standardized starting points for different document types

### Integration with Development Workflow
1. **Planning Phase**: Identify documentation requirements
2. **Development Phase**: Write documentation alongside code
3. **Review Phase**: Include documentation in code reviews
4. **Release Phase**: Verify documentation is complete and accurate
5. **Maintenance Phase**: Keep documentation updated with changes

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-12  
**Maintainer**: Development Team  
**Next Review**: 2025-08-12