# Documentation Commands - Quick Reference

## Daily Commands

### Create Documentation

```bash
# Interactive template creation (recommended)
npm run doc:create

# Specific templates
npm run doc:create:readme     # Project README
npm run doc:create:feature    # Feature specification
npm run doc:create:api        # API documentation
npm run doc:create:guide      # Step-by-step guide
npm run doc:create:report     # Technical analysis/report
npm run doc:create:plan       # Project plan
```

### Validate Documentation

```bash
# Comprehensive validation (all files)
npm run validate:docs

# Single file validation
npm run doc:validate path/to/file.md

# All documentation files
npm run doc:validate:all

# Strict validation mode
npm run doc:validate:strict
```

### Template Management

```bash
# List available templates
npm run doc:list

# View template index
npm run doc:templates

# Test template system
npm run doc:test-templates
```

## Template Quick Guide

### README Template

- **Purpose**: Project documentation
- **Required**: Installation, Usage, Features, Development, Testing
- **Min Length**: 300 words
- **Requirements**: Code examples, setup instructions

### Feature Template

- **Purpose**: Feature specifications
- **Required**: Description, Implementation, Testing, Usage, API Reference
- **Min Length**: 600 words
- **Requirements**: Technical details, code examples

### API Template

- **Purpose**: API documentation
- **Required**: Authentication, Endpoints, Data Models, Error Codes
- **Min Length**: 400 words
- **Requirements**: JSON examples, endpoint descriptions

### Guide Template

- **Purpose**: Step-by-step instructions
- **Required**: Prerequisites, Step-by-Step Instructions, Examples, Troubleshooting
- **Min Length**: 500 words
- **Requirements**: Code examples, practical steps

### Report Template

- **Purpose**: Technical analysis
- **Required**: Executive Summary, Analysis, Findings, Recommendations
- **Min Length**: 800 words
- **Requirements**: Professional analysis, data

### Plan Template

- **Purpose**: Project planning
- **Required**: Timeline, Resources, Risk Management, Implementation
- **Min Length**: 1000 words
- **Requirements**: Detailed planning, timelines

## Common Issues & Solutions

### "Document missing required headers"

**Solution**: Use templates via `npm run doc:create`

### "Content too minimal"

**Solution**: Add comprehensive content meeting minimum requirements

### "Template placeholders must be replaced"

**Solution**: Replace all `{PLACEHOLDER}` and `[Variable]` with actual content

### "Unprofessional content patterns"

**Solution**: Avoid "This document describes", TODO comments, announcements

### "Unknown document type"

**Solution**: Place in appropriate docs/ subdirectory or use conventional naming

## File Organization

```
docs/
├── guides/           # Step-by-step guides
├── api/             # API documentation
├── features/        # Feature specifications
├── reports/         # Technical analysis
├── plans/           # Project plans
└── systems/         # System documentation
```

## Quality Checklist

Before committing documentation:

- [ ] Used template via `npm run doc:create`
- [ ] All required headers present
- [ ] Minimum word count met
- [ ] All placeholders replaced
- [ ] Code examples added
- [ ] Professional language used
- [ ] Validation passes: `npm run validate:docs`

## Hook Integration

**🔧 Production Mode Activation:**

```bash
# Enable real-time enforcement (update .env)
HOOKS_DISABLED=false
```

The system automatically:

- ✅ Blocks creation of inadequate documentation
- ✅ Prevents announcement-style writing
- ✅ Validates template compliance
- ✅ Checks for unreplaced placeholders
- ✅ Enforces professional standards

## Debug Mode

For detailed validation information:

```bash
export HOOK_VERBOSE=true
npm run validate:docs
```

---

## Custom Hook Development

For advanced documentation enforcement patterns:

```bash
# Create custom validation hooks
# See comprehensive development guide:
```

**📚 Resources:**

- **Hook Development**: [05-hooks-development.md](../guides/claude-code-hooks/05-hooks-development.md)
- **Hook Testing**: [07-hooks-testing.md](../guides/claude-code-hooks/07-hooks-testing.md)
- **Hook Configuration**: [02-hooks-configuration.md](../guides/claude-code-hooks/02-hooks-configuration.md)

---

**Quick Help**: `npm run doc:create --help`  
**Full Documentation**: [Documentation Enforcement System](../systems/documentation-enforcement.md)
