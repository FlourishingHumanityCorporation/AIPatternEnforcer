[← Back to Documentation](../README.md)

---

# Documentation Templates

Standardized templates for creating consistent, high-quality documentation across ProjectTemplate.

## Table of Contents

1. [Available Templates](#available-templates)
  2. [Core Templates (Enforced)](#core-templates-enforced)
  3. [Legacy Templates](#legacy-templates)
4. [Template Selection Guide](#template-selection-guide)
5. [Usage](#usage)
  6. [Quick Start](#quick-start)
  7. [Template Enforcement](#template-enforcement)
  8. [Quality Standards](#quality-standards)
9. [Template Guidelines](#template-guidelines)
  10. [Optimal Practices](#optimal-practices)
  11. [Customization Guidelines](#customization-guidelines)
12. [Getting Help](#getting-help)
  13. [Resources](#resources)
  14. [Support](#support)

## Available Templates

### Core Templates (Enforced)

- **[API Documentation](./api-documentation.md)** - REST APIs, GraphQL endpoints, service interfaces
- **[Component Documentation](./component-documentation.md)** - React components, UI components, reusable elements  
- **[Tool Documentation](./tool-documentation.md)** - CLI tools, scripts, utilities, generators
- **[Analysis Report Template](./analysis-report-template.md)** - System analysis, audits, assessments, performance reports

### Legacy Templates

- **[API Documentation Template](API.template.md)** - Legacy API documentation template
- **[Contributing Guide Template](CONTRIBUTING.template.md)** - Set up contribution guidelines
- **[README Template](README.template.md)** - Create comprehensive project documentation

## Template Selection Guide

| Content Type | Template | Enforcement |
|--------------|----------|-------------|
| REST/GraphQL API | `api-documentation.md` | ✅ Required |
| React Component | `component-documentation.md` | ✅ Required |
| CLI Tool/Script | `tool-documentation.md` | ✅ Required |
| Analysis/Report | `analysis-report-template.md` | ✅ Required |
| Configuration | `tool-documentation.md` | ⚠️ Recommended |
| Feature Guide | `component-documentation.md` | ⚠️ Recommended |

## Usage

### Quick Start

1. **Identify the type** of documentation you need
2. **Copy the appropriate template** to your target location:
   ```bash
   cp docs/templates/[template-name].md docs/[your-location]/[your-filename].md
   ```
3. **Replace all `[bracketed placeholders]`** with actual content
4. **Remove unused sections** that don't apply
5. **Run enforcement check**: `npm run docs:enforce`

### Template Enforcement

Our documentation system automatically validates template compliance:

- **Structure Validation**: Required sections must be present
- **Quality Checking**: Content must meet minimum standards
- **Example Requirements**: Working code examples required
- **Link Validation**: All links must be functional

### Quality Standards

**Required Elements**:
- Clear, descriptive title
- Complete information coverage
- Working examples users can copy
- Current, accurate information
- Consistent markdown formatting

**Enforcement Checks**:
- ✅ Required sections present
- ✅ Minimum content length met
- ✅ Examples included where needed
- ✅ Links functional
- ✅ Style consistency

## Template Guidelines

### Optimal Practices

- **Follow the structure** but adapt for your specific needs
- **Include comprehensive examples** that users can run
- **Keep information current** with code changes
- **Use consistent formatting** throughout
- **Link to related documentation** appropriately

### Customization Guidelines

**✅ Encouraged**:
- Add domain-specific sections
- Include additional relevant examples
- Adapt language for your audience
- Add visual elements (diagrams, charts)

**❌ Avoid**:
- Removing required sections
- Drastically changing structure
- Inconsistent formatting
- Omitting critical examples

## Getting Help

### Resources

- **[Documentation Standards](../standards/documentation-standards.md)** - Complete style guide
- **[Enforcement Guide](../guides/enforcement/ENFORCEMENT.md)** - How validation works
- **Existing Documentation** - Examples of good template usage

### Support

- **Template Questions**: Create an issue or ask in team chat
- **Enforcement Issues**: Report false positives or bugs
- **New Templates**: Suggest additional template needs
- **Quality Feedback**: Help improve template effectiveness

---

**Quick Reference**:
1. Choose template based on content type
2. Copy and customize with real content  
3. Follow required sections and quality standards
4. Run `npm run docs:enforce` to validate
5. Keep documentation updated with changes