#!/usr/bin/env node

/**
 * Claude Code Hook: Template Integrity Validator
 * 
 * Ensures template files remain valid and functional by validating:
 * - Handlebars syntax integrity
 * - Placeholder consistency across templates
 * - Template configuration structure
 * - Cross-template compatibility
 * 
 * This is critical because corrupted templates break the entire
 * project generation system that AIPatternEnforcer provides.
 * 
 * Usage: Called by Claude Code after Write/Edit/MultiEdit operations on template files
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const fs = require('fs');
const path = require('path');

// Template file patterns to validate
const TEMPLATE_PATTERNS = [
  /\.hbs$/,                    // Handlebars templates
  /template\.json$/,           // Template configurations
  /structure\.json$/,          // Structure definitions
  /variants\.json$/,           // Variant configurations
  /prompts\.json$/            // AI prompt templates
];

// Common Handlebars placeholders used across templates
const STANDARD_PLACEHOLDERS = [
  '{{name}}',                  // Component/feature name
  '{{Name}}',                  // Capitalized name
  '{{description}}',           // Description text
  '{{author}}',               // Author name
  '{{date}}',                 // Creation date
  '{{projectName}}',          // Project name
  '{{namespace}}'             // Namespace/package
];

// Required fields in template.json
const REQUIRED_TEMPLATE_FIELDS = {
  'name': 'string',
  'description': 'string',
  'version': 'string',
  'type': 'string',
  'files': 'object'
};

// Handlebars syntax patterns
const HANDLEBARS_PATTERNS = {
  // Valid patterns
  valid: {
    placeholder: /\{\{[^}]+\}\}/g,
    block: /\{\{#[^}]+\}\}[\s\S]*?\{\{\/[^}]+\}\}/g,
    partial: /\{\{>[^}]+\}\}/g,
    helper: /\{\{[^}]+\s+[^}]+\}\}/g
  },
  
  // Invalid patterns that AI often creates
  invalid: {
    unclosedBlock: /\{\{#[^}]+\}\}(?![\s\S]*\{\{\/[^}]+\}\})/,
    mismatchedBlock: /\{\{#(\w+)[^}]*\}\}[\s\S]*?\{\{\/(?!\1)[^}]+\}\}/,
    tripleStash: /\{\{\{[^}]+\}\}\}/g,  // Often confused with {{{}}}
    malformedPlaceholder: /\{[^{]|[^}]\}/g,
    nestedPlaceholder: /\{\{[^}]*\{\{[^}]*\}\}[^}]*\}\}/g
  }
};

function validateHandlebarsSyntax(content, filePath) {
  const issues = [];
  
  // Check for invalid patterns
  for (const [patternName, pattern] of Object.entries(HANDLEBARS_PATTERNS.invalid)) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'syntax',
        severity: 'high',
        issue: `Invalid Handlebars ${patternName}`,
        matches: matches.slice(0, 3),
        suggestion: getSyntaxSuggestion(patternName)
      });
    }
  }
  
  // Validate block pairs
  const blocks = content.match(/\{\{#(\w+)[^}]*\}\}/g) || [];
  const endBlocks = content.match(/\{\{\/(\w+)\}\}/g) || [];
  
  const blockNames = blocks.map(b => b.match(/\{\{#(\w+)/)[1]);
  const endBlockNames = endBlocks.map(b => b.match(/\{\{\/(\w+)/)[1]);
  
  // Check for unclosed blocks
  blockNames.forEach(name => {
    if (!endBlockNames.includes(name)) {
      issues.push({
        type: 'structure',
        severity: 'high',
        issue: `Unclosed Handlebars block: {{#${name}}}`,
        suggestion: `Add closing block: {{/${name}}}`
      });
    }
  });
  
  // Check for orphaned end blocks
  endBlockNames.forEach(name => {
    if (!blockNames.includes(name)) {
      issues.push({
        type: 'structure',
        severity: 'high',
        issue: `Orphaned closing block: {{/${name}}}`,
        suggestion: `Remove or add opening block: {{#${name}}}`
      });
    }
  });
  
  return issues;
}

function validateTemplatePlaceholders(content, filePath) {
  const issues = [];
  const placeholders = content.match(HANDLEBARS_PATTERNS.valid.placeholder) || [];
  
  // Extract unique placeholders
  const uniquePlaceholders = [...new Set(placeholders)];
  
  // Check for typos in standard placeholders
  uniquePlaceholders.forEach(placeholder => {
    const cleaned = placeholder.replace(/[{}]/g, '').trim();
    
    // Check if it's close to a standard placeholder (typo detection)
    STANDARD_PLACEHOLDERS.forEach(standard => {
      const standardCleaned = standard.replace(/[{}]/g, '').trim();
      if (cleaned !== standardCleaned && 
          cleaned.toLowerCase() === standardCleaned.toLowerCase()) {
        issues.push({
          type: 'placeholder',
          severity: 'medium',
          issue: `Inconsistent placeholder case: ${placeholder}`,
          suggestion: `Use standard form: ${standard}`
        });
      }
    });
  });
  
  // Check for suspicious placeholder names that might be errors
  const suspiciousPatterns = [
    /\{\{undefined\}\}/i,
    /\{\{null\}\}/i,
    /\{\{TODO[^}]*\}\}/i,
    /\{\{FIXME[^}]*\}\}/i,
    /\{\{\[object[^}]*\}\}/i
  ];
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push({
        type: 'placeholder',
        severity: 'high',
        issue: `Suspicious placeholder detected`,
        matches: content.match(pattern),
        suggestion: 'Replace with meaningful placeholder name'
      });
    }
  });
  
  return issues;
}

function validateTemplateJSON(content, filePath) {
  const issues = [];
  
  try {
    const config = JSON.parse(content);
    
    // Check required fields
    for (const [field, expectedType] of Object.entries(REQUIRED_TEMPLATE_FIELDS)) {
      if (!(field in config)) {
        issues.push({
          type: 'config',
          severity: 'high',
          issue: `Missing required field: ${field}`,
          suggestion: `Add "${field}" field of type ${expectedType}`
        });
      } else if (typeof config[field] !== expectedType) {
        issues.push({
          type: 'config',
          severity: 'high',
          issue: `Invalid type for ${field}: expected ${expectedType}`,
          suggestion: `Change ${field} to type ${expectedType}`
        });
      }
    }
    
    // Validate template type
    if (config.type && !['component', 'feature', 'hook', 'api', 'page'].includes(config.type)) {
      issues.push({
        type: 'config',
        severity: 'medium',
        issue: `Unknown template type: ${config.type}`,
        suggestion: 'Use one of: component, feature, hook, api, page'
      });
    }
    
    // Validate files mapping
    if (config.files && typeof config.files === 'object') {
      Object.entries(config.files).forEach(([dest, src]) => {
        if (!src || typeof src !== 'string') {
          issues.push({
            type: 'config',
            severity: 'high',
            issue: `Invalid file mapping for ${dest}`,
            suggestion: 'Provide valid source template path'
          });
        }
      });
    }
    
  } catch (error) {
    issues.push({
      type: 'json',
      severity: 'critical',
      issue: 'Invalid JSON syntax',
      suggestion: `Fix JSON syntax: ${error.message}`
    });
  }
  
  return issues;
}

function getSyntaxSuggestion(patternName) {
  const suggestions = {
    unclosedBlock: 'Close all {{#block}} with {{/block}}',
    mismatchedBlock: 'Ensure block names match: {{#if}}...{{/if}}',
    tripleStash: 'Use {{}} for escaped or {{{}}} for unescaped',
    malformedPlaceholder: 'Use proper syntax: {{placeholder}}',
    nestedPlaceholder: 'Placeholders cannot be nested'
  };
  
  return suggestions[patternName] || 'Fix Handlebars syntax';
}

function isTemplateFile(filePath) {
  return TEMPLATE_PATTERNS.some(pattern => pattern.test(filePath));
}

// Read from stdin
let inputData = '';
process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(inputData);
    const toolInput = input.tool_input || {};
    const toolResponse = input.tool_response || {};
    
    // Get file path from input or response
    const filePath = toolInput.file_path || toolInput.filePath || 
                    toolResponse.filePath || toolResponse.file_path || '';
    
    // Skip if not a template file
    if (!isTemplateFile(filePath)) {
      process.exit(0);
    }
    
    // Get content - try multiple sources
    let content = toolInput.content || toolInput.new_string || 
                  toolResponse.content || '';
    
    // If no content provided, try to read from file
    if (!content && fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    }
    
    // Skip if no content available
    if (!content) {
      process.exit(0);
    }
    
    // Perform validations based on file type
    let issues = [];
    
    if (filePath.endsWith('.hbs')) {
      issues.push(...validateHandlebarsSyntax(content, filePath));
      issues.push(...validateTemplatePlaceholders(content, filePath));
    } else if (filePath.endsWith('template.json')) {
      issues.push(...validateTemplateJSON(content, filePath));
    }
    
    // Filter critical issues that should block
    const criticalIssues = issues.filter(i => 
      i.severity === 'critical' || i.severity === 'high'
    );
    
    if (criticalIssues.length > 0) {
      let message = `🔧 Template Integrity Issues Detected\n\n`;
      message += `File: ${path.basename(filePath)}\n\n`;
      
      criticalIssues.forEach((issue, i) => {
        message += `${i + 1}. ❌ ${issue.issue}\n`;
        message += `   Severity: ${issue.severity}\n`;
        message += `   ✅ ${issue.suggestion}\n`;
        if (issue.matches) {
          message += `   Found: ${issue.matches.join(', ')}\n`;
        }
        message += '\n';
      });
      
      if (issues.length > criticalIssues.length) {
        message += `ℹ️ Plus ${issues.length - criticalIssues.length} minor issues\n\n`;
      }
      
      message += `💡 Templates must be valid to generate projects correctly.\n`;
      message += `📖 See templates/documentation/TEMPLATE-GUIDE.md for syntax`;
      
      // Log for pattern analysis
      console.log(JSON.stringify({
        status: 'blocked',
        message,
        issues: issues
      }));
      
    } else if (issues.length > 0) {
      // Only warnings - allow but notify
      console.log(JSON.stringify({
        status: 'ok',
        message: `⚠️ ${issues.length} template warnings in ${path.basename(filePath)}`
      }));
    } else {
      // All good
      console.log(JSON.stringify({ status: 'ok' }));
    }
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.log(JSON.stringify({ 
      status: 'ok',
      debug: `Template validator error: ${error.message}` 
    }));
  }
});

// Handle timeout
setTimeout(() => {
  console.log(JSON.stringify({ 
    status: 'ok',
    debug: 'Template validator timeout' 
  }));
  process.exit(0);
}, 2000);

module.exports = { 
  TEMPLATE_PATTERNS,
  HANDLEBARS_PATTERNS,
  validateHandlebarsSyntax,
  validateTemplatePlaceholders,
  validateTemplateJSON
};