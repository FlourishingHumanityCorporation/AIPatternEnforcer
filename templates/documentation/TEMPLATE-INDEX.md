# Documentation Templates

**Standard templates for consistent ProjectTemplate documentation.**

## Table of Contents

1. [Available Templates](#available-templates)
  2. [Project Documentation](#project-documentation)
  3. [Feature Documentation  ](#feature-documentation-)
  4. [API Documentation](#api-documentation)
  5. [Guide Documentation](#guide-documentation)
  6. [Report Documentation](#report-documentation)
7. [Template Usage](#template-usage)
  8. [Quick Start](#quick-start)
  9. [Template Requirements](#template-requirements)
  10. [Validation](#validation)
11. [Creating New Documentation](#creating-new-documentation)
  12. [Step 1: Select Template](#step-1-select-template)
  13. [Step 2: Copy Template](#step-2-copy-template)
  14. [Step 3: Customize Content](#step-3-customize-content)
  15. [Step 4: Validate](#step-4-validate)
16. [Template Maintenance](#template-maintenance)
  17. [Adding Templates](#adding-templates)
  18. [Updating Templates](#updating-templates)
19. [Optimal Practices](#optimal-practices)
  20. [DO:](#do)
  21. [DON'T:](#dont)

## Available Templates

### Project Documentation
- **[README Template](project/README.md)** - Main project documentation
  - Use for: Repository root README files
  - Sections: Overview, Installation, Usage, API, Contributing
  - Focus: Technical accuracy, comprehensive coverage

### Feature Documentation  
- **[Feature Template](feature/FEATURE.md)** - Feature specifications
  - Use for: New features, major enhancements
  - Sections: Requirements, Design, Implementation, Testing
  - Focus: Technical design decisions, implementation details

### API Documentation
- **[API Template](api/API.md)** - API reference documentation
  - Use for: REST APIs, GraphQL schemas, SDK references
  - Sections: Endpoints, Authentication, Examples, Types
  - Focus: Complete technical reference, usage examples

### Guide Documentation
- **[Guide Template](guide/GUIDE.md)** - Step-by-step guides
  - Use for: How-to guides, tutorials, walkthroughs
  - Sections: Prerequisites, Steps, Examples, Troubleshooting
  - Focus: Clear instructions, practical examples

### Report Documentation
- **[Analysis Template](report/ANALYSIS-TEMPLATE.md)** - Technical reports
  - Use for: Performance analysis, security audits, assessments
  - Sections: Findings, Metrics, Recommendations, Action Items
  - Focus: Data-driven analysis, actionable recommendations

## Template Usage

### Quick Start
1. Choose appropriate template based on documentation type
2. Copy template to destination: `cp templates/documentation/[type]/[template].md docs/[your-file].md`
3. Replace placeholder content with actual information
4. Maintain structure and technical focus

### Template Requirements
- Keep all major sections from template
- Use technical, measured language
- Include code examples where applicable
- Link to source files with line numbers
- Avoid superlatives and announcement-style language

### Validation
Templates are enforced by:
- Pre-commit hooks validate structure
- Claude Code hooks check compliance
- Documentation style checker ensures consistency

## Creating New Documentation

### Step 1: Select Template
```bash
# List available templates
ls templates/documentation/*/

# View template
cat templates/documentation/project/README.md
```

### Step 2: Copy Template
```bash
# Copy to destination
cp templates/documentation/feature/FEATURE.md docs/features/new-feature.md
```

### Step 3: Customize Content
- Replace all placeholder text in square brackets
- Add specific technical details
- Include relevant code examples
- Update table of contents

### Step 4: Validate
```bash
# Check documentation style
npm run check:docs

# Run all checks
npm run check:all
```

## Template Maintenance

### Adding Templates
1. Create new template in appropriate category
2. Follow existing template patterns
3. Update this index file
4. Test with enforcement tools

### Updating Templates
1. Make changes to template files
2. Document changes in git commit
3. Update existing docs if needed
4. Communicate changes to team

## Optimal Practices

### DO:
- ✅ Use templates for all new documentation
- ✅ Maintain template structure
- ✅ Keep technical focus
- ✅ Include practical examples
- ✅ Link to implementation code

### DON'T:
- ❌ Skip template sections
- ❌ Use announcement language
- ❌ Include status indicators
- ❌ Use superlatives
- ❌ Create completion documents

---

**Note**: These templates enforce ProjectTemplate documentation standards.
Always use appropriate template for consistency.