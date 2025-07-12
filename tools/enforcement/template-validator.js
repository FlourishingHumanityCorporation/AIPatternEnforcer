#!/usr/bin/env node
/**
 * Documentation Template Validator
 * 
 * Validates that documentation follows approved templates and structure.
 * Integrated with Claude Code hooks and git pre-commit hooks.
 */

const fs = require('fs');
const path = require('path');

// Template structure definitions
const TEMPLATE_STRUCTURES = {
  README: {
    requiredSections: [
      '# ', // Title
      '## Table of Contents',
      '## Overview',
      '## Installation',
      '## Usage',
      '## Development',
      '## Testing',
      '## Contributing'
    ],
    requiredPatterns: [
      /\*\*[^*]+\*\*/, // Bold description at top
      /```\w+/, // Code blocks with language
      /\| .+ \| .+ \|/ // Tables for configuration
    ],
    bannedPatterns: [
      /we're excited/i,
      /we're pleased/i,
      /successfully/i,
      /amazing|awesome|perfect|excellent/i,
      /✅|✓|COMPLETE|DONE|FINISHED/i
    ]
  },
  
  FEATURE: {
    requiredSections: [
      '# Feature:',
      '## Table of Contents',
      '## Overview',
      '## Technical Requirements',
      '## Design Decisions',
      '## Implementation',
      '## API Design',
      '## Testing Strategy'
    ],
    requiredPatterns: [
      /interface \w+/, // TypeScript interfaces
      /```typescript/, // TypeScript code blocks
      /\| .+ \| .+ \|/ // Decision tables
    ],
    bannedPatterns: [
      /announcement/i,
      /completion/i,
      /status report/i
    ]
  },
  
  API: {
    requiredSections: [
      '# API Documentation:',
      '## Table of Contents',
      '## Overview',
      '## Authentication',
      '## Base URL',
      '## Endpoints',
      '## Error Handling',
      '## Examples'
    ],
    requiredPatterns: [
      /```json/, // JSON examples
      /```bash/, // cURL examples
      /\| .+ \| .+ \|/, // Parameter tables
      /^(GET|POST|PUT|DELETE|PATCH) /m // HTTP methods
    ],
    bannedPatterns: [
      /coming soon/i,
      /to be documented/i,
      /TODO:/i // In production docs
    ]
  },
  
  GUIDE: {
    requiredSections: [
      '# Guide:',
      '## Table of Contents',
      '## Prerequisites',
      '## Overview',
      '## Step-by-Step Instructions',
      '## Code Examples',
      '## Common Issues',
      '## Best Practices'
    ],
    requiredPatterns: [
      /### Step \d+/, // Numbered steps
      /```\w+/, // Code examples
      /####? \d+\.\d+/ // Sub-steps
    ],
    bannedPatterns: [
      /let's explore/i,
      /let's dive/i,
      /journey/i
    ]
  },
  
  REPORT: {
    requiredSections: [
      '# Report:',
      '## Table of Contents', 
      '## Executive Summary',
      '## Methodology',
      '## Findings',
      '## Technical Analysis',
      '## Recommendations',
      '## Action Items'
    ],
    requiredPatterns: [
      /\| .+ \| .+ \|/, // Data tables
      /\d+%/, // Percentages
      /```/, // Code/data blocks
      /- \[ \]/ // Action item checkboxes
    ],
    bannedPatterns: [
      /successfully completed/i,
      /final report/i,
      /project complete/i
    ]
  }
};

/**
 * Detect template type based on file content and path
 */
function detectTemplateType(filePath, content) {
  const fileName = path.basename(filePath).toLowerCase();
  const firstLine = content.split('\n')[0].toLowerCase();
  
  // Check filename patterns
  if (fileName === 'readme.md') return 'README';
  if (fileName.includes('feature')) return 'FEATURE';
  if (fileName.includes('api')) return 'API';
  if (fileName.includes('guide') || fileName.includes('how-to')) return 'GUIDE';
  if (fileName.includes('report') || fileName.includes('analysis')) return 'REPORT';
  
  // Check content patterns
  if (firstLine.includes('# feature:')) return 'FEATURE';
  if (firstLine.includes('# api documentation:')) return 'API';
  if (firstLine.includes('# guide:')) return 'GUIDE';
  if (firstLine.includes('# report:')) return 'REPORT';
  
  // Default to README for generic markdown
  return 'README';
}

/**
 * Validate document against template structure
 */
function validateTemplate(filePath, content) {
  const violations = [];
  const suggestions = [];
  
  // Detect template type
  const templateType = detectTemplateType(filePath, content);
  const template = TEMPLATE_STRUCTURES[templateType];
  
  if (!template) {
    return { violations, suggestions, templateType: 'UNKNOWN' };
  }
  
  // Check required sections
  const missingSections = [];
  for (const section of template.requiredSections) {
    if (!content.includes(section)) {
      missingSections.push(section);
    }
  }
  
  if (missingSections.length > 0) {
    violations.push({
      type: 'missing_sections',
      reason: `Missing required sections for ${templateType} template`,
      details: missingSections,
      suggestion: `Add missing sections: ${missingSections.join(', ')}`
    });
  }
  
  // Check required patterns
  const missingPatterns = [];
  for (const pattern of template.requiredPatterns) {
    if (!pattern.test(content)) {
      missingPatterns.push(pattern.source);
    }
  }
  
  if (missingPatterns.length > 0) {
    suggestions.push({
      type: 'missing_patterns',
      reason: `Missing recommended patterns for ${templateType} template`,
      details: missingPatterns,
      suggestion: 'Include code examples, tables, or required formatting'
    });
  }
  
  // Check banned patterns
  const foundBanned = [];
  for (const pattern of template.bannedPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      foundBanned.push({
        pattern: pattern.source,
        match: matches[0]
      });
    }
  }
  
  if (foundBanned.length > 0) {
    violations.push({
      type: 'banned_patterns',
      reason: 'Document contains banned language patterns',
      details: foundBanned,
      suggestion: 'Replace with technical, measured language'
    });
  }
  
  // Check structure order
  const sectionOrder = checkSectionOrder(content, template.requiredSections);
  if (!sectionOrder.correct) {
    suggestions.push({
      type: 'section_order',
      reason: 'Sections are not in recommended order',
      details: sectionOrder.found,
      suggestion: `Reorder sections to match template: ${template.requiredSections.join(' → ')}`
    });
  }
  
  return { violations, suggestions, templateType };
}

/**
 * Check if sections appear in correct order
 */
function checkSectionOrder(content, requiredSections) {
  const found = [];
  let lastIndex = -1;
  let correct = true;
  
  for (const section of requiredSections) {
    const index = content.indexOf(section);
    if (index !== -1) {
      found.push({ section, index });
      if (index < lastIndex) {
        correct = false;
      }
      lastIndex = index;
    }
  }
  
  return { correct, found };
}

/**
 * Main validation function for CLI usage
 */
async function validateDocumentation(filePaths) {
  const results = [];
  
  for (const filePath of filePaths) {
    if (!filePath.endsWith('.md')) continue;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const validation = validateTemplate(filePath, content);
      
      if (validation.violations.length > 0 || validation.suggestions.length > 0) {
        results.push({
          file: filePath,
          templateType: validation.templateType,
          violations: validation.violations,
          suggestions: validation.suggestions
        });
      }
    } catch (error) {
      console.error(`Error reading ${filePath}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Format validation results for display
 */
function displayResults(results, blocking = false) {
  if (results.length === 0) {
    console.log('✅ All documentation follows template standards!');
    return false;
  }
  
  let hasViolations = false;
  
  for (const result of results) {
    console.log(`\n📄 ${result.file} (${result.templateType} template)`);
    
    // Show violations (blocking)
    if (result.violations.length > 0) {
      hasViolations = true;
      console.log('  ❌ Violations:');
      for (const violation of result.violations) {
        console.log(`    - ${violation.reason}`);
        if (violation.details) {
          if (Array.isArray(violation.details)) {
            violation.details.forEach(detail => {
              console.log(`      • ${detail}`);
            });
          } else {
            console.log(`      • ${JSON.stringify(violation.details)}`);
          }
        }
        console.log(`      💡 ${violation.suggestion}`);
      }
    }
    
    // Show suggestions (non-blocking)
    if (result.suggestions.length > 0) {
      console.log('  ⚠️  Suggestions:');
      for (const suggestion of result.suggestions) {
        console.log(`    - ${suggestion.reason}`);
        console.log(`      💡 ${suggestion.suggestion}`);
      }
    }
  }
  
  if (hasViolations && blocking) {
    console.log('\n🚫 Documentation does not follow required templates.');
    console.log('📖 See templates/documentation/TEMPLATE-INDEX.md for guidelines.');
    return true;
  }
  
  return false;
}

// Export for use in other tools
module.exports = {
  detectTemplateType,
  validateTemplate,
  validateDocumentation,
  TEMPLATE_STRUCTURES
};

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const files = args.filter(arg => !arg.startsWith('-'));
  const blocking = args.includes('--block');
  
  if (files.length === 0) {
    console.log('Usage: node template-validator.js [files...] [--block]');
    process.exit(1);
  }
  
  validateDocumentation(files).then(results => {
    const shouldBlock = displayResults(results, blocking);
    process.exit(shouldBlock ? 1 : 0);
  });
}