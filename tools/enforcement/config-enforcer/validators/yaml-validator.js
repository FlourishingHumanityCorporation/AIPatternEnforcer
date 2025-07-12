#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { BaseValidator } = require('../index');

/**
 * YAML Configuration File Validator
 * Validates YAML config files like GitHub Actions workflows, docker-compose.yml
 */
class YamlValidator extends BaseValidator {
  constructor(config) {
    super(config);
    this.fileType = 'yaml';
  }

  getFileType() {
    return this.fileType;
  }

  /**
   * Validate a YAML configuration file
   */
  async validate(filePath) {
    const violations = [];
    const fixes = [];

    try {
      if (!fs.existsSync(filePath)) {
        return {
          isValid: false,
          violations: [{
            type: 'file_missing',
            message: `File ${filePath} does not exist`,
            severity: 'warning'
          }],
          fixes: []
        };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);

      // Basic YAML structure validation
      this.validateYamlStructure(content, violations, fixes, filePath);

      // File-specific validations
      if (fileName.includes('workflow') || filePath.includes('.github/workflows/')) {
        this.validateGitHubWorkflow(content, violations, fixes, filePath);
      } else if (fileName.startsWith('docker-compose')) {
        this.validateDockerCompose(content, violations, fixes, filePath);
      } else {
        this.validateGenericYaml(content, violations, fixes, filePath);
      }

      // Format validation
      if (this.config.rules.formatYaml) {
        this.validateYamlFormatting(content, violations, fixes, filePath);
      }

      // Only consider error and warning level violations as making file invalid
      const criticalViolations = violations.filter(v => v.severity === 'error' || v.severity === 'warning');
      
      return {
        isValid: criticalViolations.length === 0,
        violations,
        fixes
      };
    } catch (error) {
      return {
        isValid: false,
        violations: [{
          type: 'validation_error',
          message: `Validation failed: ${error.message}`,
          severity: 'error'
        }],
        fixes: []
      };
    }
  }

  /**
   * Validate basic YAML structure
   */
  validateYamlStructure(content, violations, fixes, filePath) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for common YAML issues
      
      // Inconsistent indentation (should be 2 spaces)
      if (line.match(/^  [^ ]/) && line.match(/^ {3}[^ ]/)) {
        violations.push({
          type: 'yaml_indentation',
          message: `Inconsistent indentation on line ${lineNum}`,
          severity: 'info',
          line: lineNum,
          suggestion: 'Use consistent 2-space indentation'
        });
      }
      
      // Tabs instead of spaces
      if (line.includes('\t')) {
        violations.push({
          type: 'yaml_tabs',
          message: `Line ${lineNum} uses tabs instead of spaces`,
          severity: 'warning',
          line: lineNum,
          suggestion: 'Use spaces instead of tabs in YAML files'
        });
        
        fixes.push({
          type: 'replace_tabs',
          line: lineNum,
          description: `Replace tabs with spaces on line ${lineNum}`
        });
      }
      
      // Trailing whitespace
      if (line.endsWith(' ') && line.trim() !== '') {
        violations.push({
          type: 'yaml_trailing_whitespace',
          message: `Line ${lineNum} has trailing whitespace`,
          severity: 'info',
          line: lineNum
        });
        
        fixes.push({
          type: 'remove_trailing_whitespace',
          line: lineNum,
          description: `Remove trailing whitespace on line ${lineNum}`
        });
      }
    });
  }

  /**
   * Validate GitHub Actions workflow
   */
  validateGitHubWorkflow(content, violations, fixes, filePath) {
    // Check for required workflow elements
    const hasName = content.includes('name:');
    const hasOn = content.includes('on:');
    const hasJobs = content.includes('jobs:');

    if (!hasName) {
      violations.push({
        type: 'missing_workflow_name',
        message: 'GitHub workflow missing name field',
        severity: 'warning'
      });
      
      fixes.push({
        type: 'add_workflow_name',
        description: 'Add workflow name'
      });
    }

    if (!hasOn) {
      violations.push({
        type: 'missing_workflow_trigger',
        message: 'GitHub workflow missing trigger (on:) field',
        severity: 'error'
      });
    }

    if (!hasJobs) {
      violations.push({
        type: 'missing_workflow_jobs',
        message: 'GitHub workflow missing jobs field',
        severity: 'error'
      });
    }

    // Check for security best practices
    if (content.includes('secrets.')) {
      // This is generally good, but check for hardcoded secrets
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('secrets.') && (line.includes('sk_live_') || line.includes('ghp_'))) {
          violations.push({
            type: 'workflow_hardcoded_secret',
            message: `Line ${index + 1} may contain hardcoded secret`,
            severity: 'error',
            line: index + 1
          });
        }
      });
    }

    // Check for common action versions
    if (content.includes('actions/checkout@v1') || content.includes('actions/setup-node@v1')) {
      violations.push({
        type: 'outdated_action_version',
        message: 'Workflow uses outdated action versions',
        severity: 'info',
        suggestion: 'Update to newer action versions for better security'
      });
    }
  }

  /**
   * Validate docker-compose file
   */
  validateDockerCompose(content, violations, fixes, filePath) {
    // Check for required docker-compose elements
    const hasVersion = content.includes('version:');
    const hasServices = content.includes('services:');

    if (!hasVersion) {
      violations.push({
        type: 'missing_compose_version',
        message: 'docker-compose.yml missing version field',
        severity: 'warning'
      });
      
      fixes.push({
        type: 'add_compose_version',
        description: 'Add docker-compose version'
      });
    }

    if (!hasServices) {
      violations.push({
        type: 'missing_compose_services',
        message: 'docker-compose.yml missing services field',
        severity: 'error'
      });
    }

    // Check for security issues
    if (content.includes('privileged: true')) {
      violations.push({
        type: 'compose_security_risk',
        message: 'docker-compose uses privileged mode',
        severity: 'warning',
        suggestion: 'Avoid privileged mode unless absolutely necessary'
      });
    }

    // Check for bind mounts to sensitive directories
    const sensitiveBinds = ['/:', '/etc:', '/var/run/docker.sock'];
    sensitiveBinds.forEach(bind => {
      if (content.includes(bind)) {
        violations.push({
          type: 'compose_sensitive_bind',
          message: `docker-compose binds sensitive directory: ${bind}`,
          severity: 'warning',
          suggestion: 'Be cautious with bind mounts to system directories'
        });
      }
    });
  }

  /**
   * Validate generic YAML file
   */
  validateGenericYaml(content, violations, fixes, filePath) {
    // Basic validation for unknown YAML files
    if (content.length === 0) {
      violations.push({
        type: 'empty_file',
        message: `YAML file ${path.basename(filePath)} is empty`,
        severity: 'info'
      });
    }
  }

  /**
   * Validate YAML formatting
   */
  validateYamlFormatting(content, violations, fixes, filePath) {
    // Check for consistent formatting
    const lines = content.split('\n');
    
    // Check for mixed indentation styles
    const indentationStyles = new Set();
    lines.forEach(line => {
      const match = line.match(/^(\s+)/);
      if (match) {
        const indent = match[1];
        if (indent.length % 2 === 0) {
          indentationStyles.add('2-space');
        } else {
          indentationStyles.add('other');
        }
      }
    });

    if (indentationStyles.size > 1) {
      violations.push({
        type: 'yaml_mixed_indentation',
        message: 'YAML file has mixed indentation styles',
        severity: 'info'
      });
      
      fixes.push({
        type: 'standardize_indentation',
        description: 'Standardize to 2-space indentation'
      });
    }
  }

  /**
   * Apply fixes to the YAML file
   */
  async applyFixes(filePath, fixes, dryRun = false) {
    if (fixes.length === 0) {
      return { success: true, changes: [], errors: [] };
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const changes = [];
      const errors = [];

      // Apply fixes in order
      for (const fix of fixes) {
        try {
          const result = this.applyFix(content, fix, filePath);
          if (result.newContent !== undefined) {
            content = result.newContent;
          }
          if (result.description) {
            changes.push(result.description);
          }
        } catch (error) {
          errors.push(`Failed to apply fix ${fix.type}: ${error.message}`);
        }
      }

      if (!dryRun && changes.length > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
      }

      return {
        success: errors.length === 0,
        changes,
        errors,
        newContent: dryRun ? content : undefined
      };
    } catch (error) {
      return {
        success: false,
        changes: [],
        errors: [error.message]
      };
    }
  }

  /**
   * Apply a single fix to the YAML file content
   */
  applyFix(content, fix, filePath) {
    const lines = content.split('\n');
    
    switch (fix.type) {
      case 'replace_tabs':
        lines[fix.line - 1] = lines[fix.line - 1].replace(/\t/g, '  ');
        return {
          newContent: lines.join('\n'),
          description: `Replaced tabs with spaces on line ${fix.line}`
        };

      case 'remove_trailing_whitespace':
        lines[fix.line - 1] = lines[fix.line - 1].trimEnd();
        return {
          newContent: lines.join('\n'),
          description: `Removed trailing whitespace on line ${fix.line}`
        };

      case 'add_workflow_name':
        const nameToAdd = 'name: CI/CD Pipeline';
        if (!content.includes('name:')) {
          return {
            newContent: `${nameToAdd}\n${content}`,
            description: 'Added workflow name'
          };
        }
        return { description: 'Workflow name already exists' };

      case 'add_compose_version':
        const versionToAdd = 'version: "3.8"';
        if (!content.includes('version:')) {
          return {
            newContent: `${versionToAdd}\n${content}`,
            description: 'Added docker-compose version'
          };
        }
        return { description: 'Compose version already exists' };

      case 'standardize_indentation':
        // Convert all indentation to 2 spaces
        const standardizedLines = lines.map(line => {
          const match = line.match(/^(\s*)(.*)/);
          if (match) {
            const [, indent, rest] = match;
            const spacesCount = indent.replace(/\t/g, '  ').length;
            const standardIndent = ' '.repeat(Math.floor(spacesCount / 2) * 2);
            return standardIndent + rest;
          }
          return line;
        });
        return {
          newContent: standardizedLines.join('\n'),
          description: 'Standardized indentation to 2 spaces'
        };

      default:
        throw new Error(`Unknown fix type: ${fix.type}`);
    }
  }
}

module.exports = YamlValidator;