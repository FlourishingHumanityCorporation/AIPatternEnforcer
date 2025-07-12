# Documentation Style Enforcer Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Style Rules and Standards](#style-rules-and-standards)
5. [Content Validation System](#content-validation-system)
6. [Usage Examples](#usage-examples)
7. [Output and Results](#output-and-results)
8. [Integration with Development Workflow](#integration-with-development-workflow)
9. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
10. [API and Programmatic Usage](#api-and-programmatic-usage)
11. [Development and Contributing](#development-and-contributing)

## Overview

Comprehensive documentation style validator that enforces professional, consistent, and timeless documentation standards
across all Markdown files. Prevents announcement-style language, enforces technical writing optimal practices, and
maintains high-quality documentation that ages well.

**Tool Type**: Documentation Style Validator  
**Language**: JavaScript (Node.js)  
**Dependencies**: `fs`, `path`, `chalk`, `glob`, `enforcement-config`  
**Location**: `tools/enforcement/documentation-style.js`

## Quick Start

```bash
# Check all Markdown files for style violations
node tools/enforcement/documentation-style.js

# Check specific documentation files
node tools/enforcement/documentation-style.js docs/README.md docs/guides/setup.md

# Integration with enforcement system
npm run check:docs-style
```

## Installation and Setup

### Prerequisites
- Node.js 16+ required
- ProjectTemplate enforcement system
- Chalk for colorized output
- Glob for file pattern matching

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # Installs chalk, glob, and other dependencies
```

### Configuration Integration
Works with enforcement-config.js:
```javascript
const config = {
  checks: {
    documentation: {
      enabled: true,
      enforcementLevel: 'FULL', // 'FULL', 'WARNING', 'DISABLED'
      ignorePatterns: [
        'node_modules/**',
        'examples/**',
        'CHANGELOG.md', // Allow temporal references in changelogs
        'HISTORY.md'
      ]
    }
  }
};
```

## Style Rules and Standards

### Banned Phrases
**Purpose**: Eliminate subjective and temporal language

#### Announcement Language
```markdown
<!-- ❌ Problematic -->
This document describes our new feature!
We Implemented the authentication system.

<!-- ✅ Correct -->
The authentication system provides secure user access.
Version 2.0 includes enhanced security features.
```

#### Subjective Qualifiers
```markdown
<!-- ❌ Problematic -->
This complete solution handles all edge cases.
The functional new API is incredibly fast.
Our robust documentation covers everything.

<!-- ✅ Correct -->
This solution handles common edge cases.
The new API provides improved performance.
The documentation covers core functionality.
```

#### Temporal References
```markdown
<!-- ❌ Problematic -->
As of March 2024, this feature is available.
This was recently updated to support...

<!-- ✅ Correct -->
This feature is available in version 2.1+.
Version 2.1 added support for...
```

### Status Announcements
**Purpose**: Prevent status-based documentation that becomes outdated

#### Forbidden Status Words
- COMPLETE, FIXED, DONE, FINISHED
- FINAL, RESOLVED, SHIPPED, DELIVERED
- RELEASED, READY

```markdown
<!-- ❌ Problematic -->
# Authentication System - COMPLETE
The login feature is FIXED and READY for production.

<!-- ✅ Correct -->
# Authentication System
The login feature provides secure user authentication.
```

### Content Structure Rules

#### Line Length Limits
**Rule**: Maximum 120 characters per line (excluding code blocks)
**Purpose**: Maintain readability across different viewing environments

```markdown
<!-- ❌ Too long -->
This is an extremely long line that exceeds the recommended maximum line length and should be broken into multiple lines
for better readability.

<!-- ✅ Correct -->
This is a properly formatted line that respects the maximum length limit
and improves readability across different viewing environments.
```

#### File Length Limits
**Rule**: Maximum 500 lines per file
**Purpose**: Encourage modular documentation structure

```markdown
<!-- ❌ Too long -->
<!-- Single file with 800+ lines covering everything -->

<!-- ✅ Correct -->
<!-- Split into focused files: -->
- README.md (overview)
- docs/setup/installation.md
- docs/guides/usage.md
- docs/api/reference.md
```

#### Code Block Standards
**Rules**: 
- Specify language for syntax highlighting
- Maximum 20 lines per code block
- Link to source files for longer examples

```markdown
<!-- ❌ Missing language -->
```
function example() {
  return 'hello';
}
```

<!-- ✅ Correct -->
```javascript
function example() {
  return 'hello';
}
```

<!-- ❌ Too long -->
```javascript
// 30+ lines of code inline
```

<!-- ✅ Correct -->
```javascript
// Short example (under 20 lines)
```

For complete implementation, see [source file](src/auth/login.js).
```

## Content Validation System

### Pattern Detection Engine
```javascript
const bannedPhrases = [
  {
    pattern: /we'?re\s+excited\s+to/gi,
    suggestion: "Use neutral announcement language"
  },
  {
    pattern: /successfully\s+implemented/gi,
    suggestion: "State what was implemented without qualifier"
  },
  {
    pattern: /as\s+of\s+\w+\s+\d{4}/gi,
    suggestion: "Remove temporal references"
  },
  {
    pattern: /\b(complete|functional|robust|effective)\b/gi,
    suggestion: "Use objective technical terms"
  }
];
```

### Structure Analysis
```javascript
function analyzeStructure(content) {
  return {
    hasTitle: lines.some(line => /^#\s+[^#]/.test(line)),
    hasTableOfContents: content.includes('table of contents'),
    headingLevels: extractHeadingLevels(lines),
    codeBlocks: extractCodeBlocks(content)
  };
}
```

### Context-Aware Rules
Different rules apply based on file type and location:

#### Documentation Files (`docs/`)
- Full style enforcement
- Structure requirements (TOC for long files)
- Professional language mandatory

#### README Files
- Title requirement enforced
- Clear structure expected
- Status announcements prohibited

#### Example Files (`examples/`)
- Relaxed enforcement (educational content)
- Some promotional language allowed
- Focus on clarity over formality

#### Changelog Files
- Temporal references allowed
- Status updates permitted
- Date-based organization accepted

## Usage Examples

### Example 1: Clean Documentation
```bash
node tools/enforcement/documentation-style.js

# Output:
✅ All documentation follows style guidelines!

# Silent success - no violations found
```

### Example 2: Style Violations Found
```bash
node tools/enforcement/documentation-style.js

# Output:
❌ Found documentation style violations:

docs/README.md:
  Line 5: Banned Phrase
    Issue: "We're excited to"
    Context: This document describes our new authentication system...
    Fix: Use neutral announcement language

  Line 12: Status Announcement
    Issue: "COMPLETE"
    Context: # User Management - COMPLETE
    Fix: Remove status announcements, use git commits for status

  Line 23: Line Too Long
    Context: Line has 145 characters
    Issue: This extremely long line that goes on and on...
    Fix: Keep lines under 120 characters

docs/guides/setup.md:
  Line 1: Missing Title
    Context: No H1 heading found
    Issue: Missing main title
    Fix: Add a title with # at the beginning

  Line 45: Missing Language Specification
    Context: Code block without language
    Issue: ```
    Fix: Add language after ``` (e.g., ```javascript)

📚 Documentation Optimal Practices:
  - Use neutral, professional language
  - Avoid temporal references and status announcements
  - Keep lines under 120 characters
  - Include language specifiers in code blocks
  - Add table of contents for long documents

🚫 Commit blocked due to documentation violations.
💡 To change enforcement level: npm run enforcement:config set-level WARNING
```

### Example 3: Warning Mode (Non-blocking)
```bash
# With enforcement level set to WARNING
node tools/enforcement/documentation-style.js

# Output:
⚠️  Documentation style warnings:

docs/api/reference.md:
  Line 8: Banned Phrase
    Issue: "robust"
    Context: This robust API provides robust functionality...
    Fix: Use "effective" or "robust"

⏩ Commit proceeding with warnings.
💡 To fix issues: Follow suggestions above
💡 To block on violations: npm run enforcement:config set-level FULL
```

### Example 4: Specific File Validation
```bash
node tools/enforcement/documentation-style.js docs/README.md

# Output:
❌ Found documentation style violations:

docs/README.md:
  Line 3: Banned Phrase
    Issue: "functional"
    Context: Our functional new framework simplifies development...
    Fix: Use descriptive technical terms
```

### Example 5: Long Document Structure Check
```bash
# For a 150+ line document without table of contents
node tools/enforcement/documentation-style.js docs/comprehensive-guide.md

# Output:
❌ Found documentation style violations:

docs/comprehensive-guide.md:
  Line 1: Missing Table of Contents
    Context: Long document (180 lines) without TOC
    Issue: No table of contents
    Fix: Add ## Table of Contents section for long documents
```

## Output and Results

### Success Cases
- **Silent Success**: No violations found, minimal output
- **Clean Status**: Green checkmark with validation summary

### Violation Reports
- **Grouped by File**: Violations organized by file path
- **Line Context**: Exact line number and surrounding content
- **Issue Classification**: Clear categorization of problem type
- **Actionable Fixes**: Specific suggestions for improvement

### Violation Types
- **Banned Phrase**: Subjective or promotional language
- **Status Announcement**: Temporal status indicators
- **Line Too Long**: Exceeds 120 character limit
- **File Too Long**: Exceeds 500 line limit
- **Missing Title**: No H1 heading found
- **Missing Table of Contents**: Long files without navigation
- **Code Block Too Long**: Exceeds 20 line limit
- **Missing Language Specification**: Code blocks without syntax highlighting

### Enforcement Levels
- **FULL**: Blocks commits on any violations
- **WARNING**: Allows commits with warnings
- **DISABLED**: Validation skipped entirely

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "check:docs-style": "node tools/enforcement/documentation-style.js",
    "lint:docs": "node tools/enforcement/documentation-style.js",
    "validate:docs": "node tools/enforcement/documentation-style.js"
  }
}
```

### Pre-commit Hook Integration
```bash
# In .husky/pre-commit
npm run check:docs-style

# Or direct execution
node tools/enforcement/documentation-style.js

# With file filtering for only staged docs
git diff --cached --name-only --diff-filter=ACM | grep '\.md$' | xargs node tools/enforcement/documentation-style.js
```

### CI/CD Integration
```yaml
# GitHub Actions workflow
- name: Validate Documentation Style
  run: |
    node tools/enforcement/documentation-style.js
    
- name: Documentation Quality Check
  run: |
    npm run check:docs-style
```

### Documentation Review Process
```bash
# Before creating pull request
npm run check:docs-style

# Fix any violations
# Edit files based on suggestions

# Verify fixes
npm run check:docs-style

# Should show clean validation
```

### IDE Integration
```json
// VS Code tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Check Documentation Style",
      "type": "shell",
      "command": "npm run check:docs-style",
      "group": "build",
      "problemMatcher": {
        "pattern": {
          "regexp": "^\\s*(.*?):\\s*Line\\s+(\\d+):",
          "file": 1,
          "line": 2
        }
      }
    }
  ]
}
```

### Markdownlint Integration
Use alongside markdownlint for comprehensive checking:
```json
// .markdownlint.json
{
  "line-length": {
    "line_length": 120,
    "code_blocks": false
  },
  "no-trailing-punctuation": {
    "punctuation": ".,;:!"
  }
}
```

## Error Handling and Troubleshooting

### Common Issues

#### False Positives in Examples
```text
Banned Phrase:
  examples/tutorial.md:10
    Issue: "robust"
    Context: This is an robust example of...
```
**Cause**: Example files may use promotional language for educational purposes  
**Solution**: Add `examples/**` to ignorePatterns in config

#### Legitimate Temporal References
```text
Banned Phrase:
  CHANGELOG.md:5
    Issue: "as of March 2024"
    Context: As of March 2024, the API supports...
```
**Cause**: Changelogs legitimately contain temporal references  
**Solution**: Add `CHANGELOG.md` to ignorePatterns

#### Code Blocks with No Language
```text
Missing Language Specification:
  docs/setup.md:15
    Issue: ```
    Context: Code block without language
```
**Cause**: Generic code blocks or non-code content  
**Solution**: Use appropriate language (`bash`, `text`, `yaml`) or `text` for generic content

### Debug Mode
Enable detailed analysis:
```bash
# Add debug output (modify script temporarily)
console.log('Analyzing file:', filePath);
console.log('Line count:', lines.length);
console.log('Code blocks found:', codeBlocks.length);

# Test specific patterns
const pattern = /we'?re\s+excited\s+to/gi;
const testText = "This document describes...";
console.log('Pattern match:', testText.match(pattern));
```

### Pattern Testing
Test style rules:
```javascript
// Test banned phrase detection
const bannedPhrases = require('./tools/enforcement/documentation-style.js');
const testContent = `
This document describes our new feature!
This functional solution is complete for all use cases.
`;

// Analyze content
const violations = checkMarkdownFile('test.md', testContent);
console.log('Violations found:', violations.length);
```

## API and Programmatic Usage

### Basic Usage
```javascript
const { checkDocumentationStyle } = require('./tools/enforcement/documentation-style');

// Check all markdown files
await checkDocumentationStyle();

// Check specific files
await checkDocumentationStyle(['docs/README.md', 'docs/guide.md']);
```

### Custom Integration
```javascript
const fs = require('fs');
const { checkDocumentationStyle } = require('./tools/enforcement/documentation-style');

// Pre-commit hook for documentation
async function validateDocumentationChanges() {
  const { execSync } = require('child_process');
  
  // Get staged markdown files
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM')
    .toString()
    .split('\n')
    .filter(file => file.endsWith('.md'));
  
  if (stagedFiles.length > 0) {
    try {
      await checkDocumentationStyle(stagedFiles);
      console.log('✅ Documentation style validation passed');
      return true;
    } catch (error) {
      console.error('❌ Documentation style validation failed');
      return false;
    }
  }
  
  return true;
}

// Usage in git hook
validateDocumentationChanges().then(success => {
  if (!success) {
    process.exit(1);
  }
});
```

### Batch Documentation Audit
```javascript
const glob = require('glob');
const path = require('path');

// Audit multiple documentation directories
async function auditDocumentation(directories) {
  const results = {};
  
  for (const directory of directories) {
    console.log(`Auditing documentation in ${directory}...`);
    
    const markdownFiles = glob.sync(`${directory}/**/*.md`);
    
    try {
      await checkDocumentationStyle(markdownFiles);
      results[directory] = { 
        status: 'pass', 
        filesChecked: markdownFiles.length 
      };
    } catch (error) {
      results[directory] = { 
        status: 'fail', 
        filesChecked: markdownFiles.length,
        error: error.message 
      };
    }
  }
  
  return results;
}

// Usage
const docDirectories = ['docs/', 'guides/', 'tutorials/'];
const auditResults = await auditDocumentation(docDirectories);
console.log('Documentation audit results:', auditResults);
```

### Custom Rule Extension
```javascript
// Add custom banned phrases
const customBannedPhrases = [
  {
    pattern: /\bvery\s+(good|bad|important)\b/gi,
    suggestion: "Use specific descriptive terms instead of 'very'"
  },
  {
    pattern: /\bstuff\b/gi,
    suggestion: "Use specific technical terms instead of 'stuff'"
  }
];

// Extend the existing patterns
const originalPatterns = require('./tools/enforcement/documentation-style.js');
// Modify bannedPhrases array in your fork
```

## Development and Contributing

### Project Structure
```text
tools/enforcement/documentation-style.js
├── Banned phrase definitions (bannedPhrases array)
├── Status announcement patterns (statusAnnouncements array)
├── Configuration settings (line length, file length limits)
├── File analysis functions (checkMarkdownFile)
├── Structure analysis (analyzeStructure, extractCodeBlocks)
├── CLI interface and argument handling
└── Integration with enforcement-config
```

### Adding New Style Rules

1. **Banned Phrase Rules**:
```javascript
const newBannedPhrase = {
  pattern: /your-regex-pattern/gi,
  suggestion: "Your helpful suggestion for improvement"
};

// Add to bannedPhrases array
bannedPhrases.push(newBannedPhrase);
```

2. **Status Announcement Rules**:
```javascript
// Add to statusAnnouncements array
statusAnnouncements.push("NEW_STATUS");
```

3. **Structural Rules**:
```javascript
// In checkMarkdownFile function
if (customCondition) {
  violations.push({
    type: "Custom Rule Type",
    file: filePath,
    line: lineNumber,
    context: "Context information",
    issue: "What's wrong",
    suggestion: "How to fix it"
  });
}
```

### Testing Guidelines
```bash
# Test with sample content
mkdir test-docs
echo "This document describes our functional new feature!" > test-docs/test.md
node tools/enforcement/documentation-style.js test-docs/test.md

# Test pattern matching
node -e "
const pattern = /we'?re\s+excited\s+to/gi;
console.log('Match:', 'We are excited to announce'.match(pattern));
"

# Test structure analysis
echo -e '# Title\n\nContent...' > test-structure.md
node tools/enforcement/documentation-style.js test-structure.md
```

### Performance Considerations
- File-by-file processing (sequential, could be parallelized)
- Full content regex matching (could be line-by-line for memory efficiency)
- No result caching (could cache for unchanged files)
- Pattern compilation on each run (could pre-compile patterns)

### Style Guide Maintenance
- **Regular Review**: Patterns should be reviewed quarterly
- **Community Input**: Style rules should reflect team consensus
- **Documentation**: All rules should have clear rationale
- **Examples**: Provide both wrong and correct examples

## Related Tools and Documentation

- **enforcement-config.js**: Central enforcement configuration system
- **check-imports.js**: Import statement validation
- **config-enforcer**: Configuration file validation
- **Markdownlint**: Compatible markdown linting tool
- **Writing Style Guide**: docs/guides/documentation/writing-style.md
- **Documentation Standards**: docs/guides/documentation/standards.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines