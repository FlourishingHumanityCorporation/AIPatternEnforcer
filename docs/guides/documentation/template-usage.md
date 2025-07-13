# Documentation Template Usage Guide

**Comprehensive guide for using ProjectTemplate documentation templates.**

## Table of Contents

1. [Overview](#overview)
2. [Template Selection](#template-selection)
3. [Template Structure](#template-structure)
4. [Implementation Process](#implementation-process)
5. [Validation Process](#validation-process)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Usage](#advanced-usage)

## Overview

### Purpose
Documentation templates ensure consistency, quality, and technical accuracy across all ProjectTemplate documentation.

### Template Benefits
- **Consistency**: Standardized structure and format
- **Quality**: Technical focus with measured language
- **Efficiency**: Faster document creation
- **Compliance**: Automatic enforcement via Claude Code hooks

### Template Enforcement
Templates are enforced through:
- Claude Code PreToolUse hooks (real-time blocking)
- Git pre-commit hooks (validation before commit)
- Documentation style checker (comprehensive analysis)

## Template Selection

### Decision Matrix
| Document Type | Template | Use Cases |
|---------------|----------|-----------|
| **Project README** | `project/README.md` | Repository root, main project docs |
| **Feature Spec** | `feature/FEATURE.md` | New features, enhancements |
| **API Reference** | `api/API.md` | REST APIs, GraphQL, SDK docs |
| **How-to Guide** | `guide/GUIDE.md` | Tutorials, walkthroughs |
| **Technical Report** | `report/ANALYSIS-TEMPLATE.md` | Analysis, audits, assessments |

### Selection Criteria
```bash
# Ask these questions:
1. Is this the main project documentation? → README template
2. Does this describe a new feature? → Feature template  
3. Is this API documentation? → API template
4. Is this a step-by-step guide? → Guide template
5. Is this analysis or findings? → Report template
```

## Template Structure

### Required Sections
All templates include mandatory sections that must be present:

#### README Template Structure
```markdown
# Project Name
## Table of Contents
## Overview
## Architecture  
## Installation
## Usage
## Development
## Testing
## Contributing
```

#### Feature Template Structure
```markdown
# Feature: [Name]
## Table of Contents
## Overview
## Technical Requirements
## Design Decisions
## Implementation
## API Design
## Testing Strategy
```

### Template Validation Rules
Each template validates for:
- **Required sections**: Must include all mandatory headers
- **Content patterns**: Technical language, code examples
- **Banned patterns**: No superlatives, announcement language
- **Structure order**: Sections in correct sequence

## Implementation Process

### Step 1: Copy Template
```bash
# Navigate to templates directory
cd templates/documentation/

# List available templates
ls */

# Copy appropriate template
cp project/README.md /path/to/your/docs/
```

### Step 2: Customize Content
Replace all placeholder content:

#### Placeholder Patterns
```markdown
# Original template
[Project Name] → Your Actual Project Name
[e.g., TypeScript 5.0] → TypeScript 5.0
**[Brief description]** → **Authentication service for user management**
```

#### Content Guidelines
```markdown
# Effective: Technical and specific
**Authentication service providing JWT-based user management with role-based access control.**

# Ineffective: Announcement style
**This document describes our new authentication system!**
```

### Step 3: Add Technical Details

#### Code Examples
```typescript
// Always include working code examples
interface UserConfig {
  apiKey: string;
  timeout: number;
}

const client = new AuthClient({
  apiKey: process.env.API_KEY,
  timeout: 30000
});
```

#### Technical Tables
```markdown
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | string | Yes | Authentication token |
| `timeout` | number | No | Request timeout (ms) |
```

### Step 4: Link to Implementation
```markdown
# Link to actual code with line numbers
See implementation in [auth-service.ts:45](src/services/auth-service.ts#L45)

# Reference specific functions
The `validateToken` function in [validator.ts:23](src/utils/validator.ts#L23)
```

## Validation Process

### Automatic Validation
Templates are validated automatically:

#### Claude Code Hook Validation
```bash
# Triggered on file operations
echo '# Bad Title!' > docs/readme.md
# Results in: Template violation: Missing required sections
```

#### Pre-commit Hook Validation
```bash
# Triggered on git commit
git add docs/
git commit -m "Update docs"
# Results in: Template validation failed - see suggestions
```

### Manual Validation
```bash
# Validate specific file
node tools/enforcement/template-validator.js docs/feature/new-feature.md

# Validate all markdown files
node tools/enforcement/template-validator.js docs/**/*.md

# Check with blocking mode
node tools/enforcement/template-validator.js docs/readme.md --block
```

### Validation Output
```bash
📄 docs/feature/auth.md (FEATURE template)
  Violations:
    - Missing required sections for FEATURE template
      • ## Technical Requirements
      • ## Design Decisions
      Fix: Add missing sections: ## Technical Requirements, ## Design Decisions

  Suggestions:
    - Missing recommended patterns for FEATURE template
      Fix: Include code examples, tables, or required formatting
```

## Common Patterns

### Technical Descriptions
```markdown
# Effective patterns
- **Purpose**: Provides JWT authentication with 2FA support
- **Architecture**: Microservice using Express.js and Redis
- **Performance**: Handles 10,000 requests/second with <50ms latency

# Avoid these patterns  
- **Purpose**: Authentication that users will enjoy!
- **Architecture**: Design that works well
- **Performance**: Fast and reliable
```

### Code Documentation
```markdown
# Include working examples
```typescript
// Configure the service
const auth = new AuthService({
  secret: process.env.JWT_SECRET,
  expiry: '24h'
});

// Generate token
const token = await auth.generateToken(userId);
```

### API Documentation
```markdown
# Comprehensive endpoint documentation
```
POST /auth/login
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response** (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### Error Handling
```markdown
# Document error scenarios
**Error Response** (400 Bad Request)
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect"
}
```text
```

## Troubleshooting

### Common Validation Errors

#### Missing Required Sections
```bash
Error: Missing required sections for README template
Solution: Add all mandatory sections from template
```

#### Banned Language Patterns
```bash
Error: Document contains banned language patterns
Solution: Replace superlatives with technical descriptions
```

#### Incorrect Section Order
```bash
Warning: Sections are not in recommended order
Solution: Reorder sections to match template structure
```

### Template Not Detected
```bash
# Issue: Template type not recognized
# Solution: Ensure filename or content matches patterns

# Filename patterns
README.md → README template
*feature*.md → FEATURE template
*api*.md → API template
*guide*.md → GUIDE template
*report*.md → REPORT template

# Content patterns
# Feature: Name → FEATURE template
# API Documentation: Name → API template
# Guide: Name → GUIDE template
```

### Validation Failures
```bash
# Check template exists
ls templates/documentation/

# Verify template validator
node tools/enforcement/template-validator.js --help

# Test with simple file
echo "# Test" > test.md
node tools/enforcement/template-validator.js test.md
```

## Advanced Usage

### Custom Template Validation
```javascript
// Add custom validation rules
const { validateTemplate, TEMPLATE_STRUCTURES } = require('./template-validator');

// Extend template structure
TEMPLATE_STRUCTURES.CUSTOM = {
  requiredSections: ['# Custom', '## Overview'],
  requiredPatterns: [/```typescript/],
  bannedPatterns: [/todo:/i]
};
```

### Integration with CI/CD
```yaml
# .github/workflows/docs.yml
- name: Validate Documentation Templates
  run: |
    find docs -name "*.md" -exec \
      node tools/enforcement/template-validator.js {} --block \;
```

### Template Automation
```bash
# Create new document from template
npm run create:doc --template=feature --name=user-auth

# Auto-generate documentation
npm run docs:generate --from=src/api/
```

### Bulk Template Updates
```bash
# Update all documents to latest template
npm run templates:update

# Preview template changes
npm run templates:diff
```

---

**Note**: This guide follows ProjectTemplate documentation standards.
Always validate documentation against templates before committing.