#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { BaseValidator } = require('../index');

/**
 * Environment File Validator
 * Validates environment and dot-files like .env.example, .gitignore, .aiignore
 */
class EnvValidator extends BaseValidator {
  constructor(config) {
    super(config);
    this.fileType = 'environment';
  }

  getFileType() {
    return this.fileType;
  }

  /**
   * Validate an environment file
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
      const basename = path.basename(filePath);

      // File-specific validations
      switch (basename) {
        case '.env.example':
          this.validateEnvExample(content, violations, fixes, filePath);
          break;
        case '.gitignore':
          this.validateGitignore(content, violations, fixes, filePath);
          break;
        case '.aiignore':
          this.validateAiignore(content, violations, fixes, filePath);
          break;
        default:
          this.validateGenericEnvFile(content, violations, fixes, filePath);
      }

      // Common line ending validation
      if (this.config.rules.fixLineEndings) {
        this.validateLineEndings(content, violations, fixes, filePath);
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
   * Validate .env.example file
   */
  validateEnvExample(content, violations, fixes, filePath) {
    const lines = content.split('\n');
    
    // Check for actual secrets (common patterns)
    const secretPatterns = [
      /^[A-Z_]+=(.*[a-f0-9]{20,}.*)/,  // Long hex strings
      /^[A-Z_]+=(.*sk_live_.*)/,       // Stripe live keys
      /^[A-Z_]+=(.*pk_live_.*)/,       // Public live keys
      /^[A-Z_]+=(.*AIza.*)/,           // Google API keys
      /^[A-Z_]+=(.*xoxb-.*)/,          // Slack tokens
      /^[A-Z_]+=(.*ghp_.*)/,           // GitHub tokens
      /^[A-Z_]+=(.*[A-Za-z0-9]{40,}.*)/  // Long tokens
    ];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) return;

      // Check for potential secrets
      secretPatterns.forEach(pattern => {
        if (pattern.test(trimmed)) {
          violations.push({
            type: 'potential_secret',
            message: `.env.example may contain real secret on line ${lineNum}`,
            severity: 'error',
            line: lineNum,
            suggestion: 'Replace with placeholder value (e.g., "your_api_key_here")'
          });
        }
      });

      // Check for proper format
      if (trimmed.includes('=')) {
        const [key, value] = trimmed.split('=', 2);
        
        if (!key.match(/^[A-Z_][A-Z0-9_]*$/)) {
          violations.push({
            type: 'invalid_env_key',
            message: `Invalid environment variable name "${key}" on line ${lineNum}`,
            severity: 'warning',
            line: lineNum,
            suggestion: 'Use UPPER_CASE_WITH_UNDERSCORES format'
          });
        }

        // Check for empty values (should have placeholders)
        if (!value || value.trim() === '') {
          fixes.push({
            type: 'add_placeholder',
            line: lineNum,
            key,
            description: `Add placeholder for ${key}`
          });
        }
      }
    });

    // Ensure common environment variables are documented
    const commonEnvVars = [
      'NODE_ENV',
      'PORT',
      'DATABASE_URL'
    ];

    const presentVars = lines
      .map(line => line.split('=')[0])
      .filter(key => key && !key.startsWith('#'));

    commonEnvVars.forEach(envVar => {
      if (!presentVars.includes(envVar)) {
        violations.push({
          type: 'missing_common_env',
          message: `Consider documenting common environment variable: ${envVar}`,
          severity: 'info',
          envVar
        });
        
        fixes.push({
          type: 'add_common_env',
          envVar,
          description: `Add ${envVar} documentation`
        });
      }
    });
  }

  /**
   * Validate .gitignore file
   */
  validateGitignore(content, violations, fixes, filePath) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    // Essential gitignore patterns for JavaScript/Node.js projects
    const essentialPatterns = [
      'node_modules/',
      '.env',
      '.env.local',
      'dist/',
      'build/',
      '*.log',
      '.DS_Store',
      'Thumbs.db'
    ];

    // ProjectTemplate specific patterns
    const projectTemplatePatterns = [
      '.enforcement-metrics.json',
      '.config-enforcer-cache/',
      '.config-enforcer-backups/',
      '*.tmp',
      '.ai-context/',
      '.context-cache/'
    ];

    const missingEssential = essentialPatterns.filter(pattern => 
      !lines.some(line => line === pattern || line.endsWith(pattern.replace('/', '')))
    );

    const missingProjectTemplate = projectTemplatePatterns.filter(pattern => 
      !lines.some(line => line === pattern || line.endsWith(pattern.replace('/', '')))
    );

    if (missingEssential.length > 0) {
      violations.push({
        type: 'missing_essential_patterns',
        message: `Missing essential gitignore patterns: ${missingEssential.join(', ')}`,
        severity: 'warning',
        patterns: missingEssential
      });

      fixes.push({
        type: 'add_essential_patterns',
        patterns: missingEssential,
        description: 'Add essential gitignore patterns'
      });
    }

    if (missingProjectTemplate.length > 0) {
      violations.push({
        type: 'missing_project_patterns',
        message: `Missing ProjectTemplate-specific patterns: ${missingProjectTemplate.join(', ')}`,
        severity: 'info',
        patterns: missingProjectTemplate
      });

      fixes.push({
        type: 'add_project_patterns',
        patterns: missingProjectTemplate,
        description: 'Add ProjectTemplate-specific gitignore patterns'
      });
    }

    // Check for redundant patterns
    const duplicates = this.findDuplicatePatterns(lines);
    if (duplicates.length > 0) {
      violations.push({
        type: 'duplicate_patterns',
        message: `Duplicate gitignore patterns found: ${duplicates.join(', ')}`,
        severity: 'info',
        patterns: duplicates
      });

      fixes.push({
        type: 'remove_duplicates',
        patterns: duplicates,
        description: 'Remove duplicate gitignore patterns'
      });
    }
  }

  /**
   * Validate .aiignore file
   */
  validateAiignore(content, violations, fixes, filePath) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    // Essential AI ignore patterns
    const essentialAiPatterns = [
      'node_modules/',
      '.git/',
      'dist/',
      'build/',
      'coverage/',
      '*.log',
      '.env',
      '.env.*',
      'package-lock.json',
      'yarn.lock'
    ];

    // ProjectTemplate AI-specific patterns
    const aiSpecificPatterns = [
      '.config-enforcer-cache/',
      '.config-enforcer-backups/',
      '.enforcement-metrics.json',
      'docs/reports/',
      '*.tmp',
      '*.backup'
    ];

    const missingEssential = essentialAiPatterns.filter(pattern => 
      !lines.some(line => line === pattern || line.endsWith(pattern.replace('/', '')))
    );

    const missingAiSpecific = aiSpecificPatterns.filter(pattern => 
      !lines.some(line => line === pattern || line.endsWith(pattern.replace('/', '')))
    );

    if (missingEssential.length > 0) {
      violations.push({
        type: 'missing_ai_essential_patterns',
        message: `Missing essential AI ignore patterns: ${missingEssential.join(', ')}`,
        severity: 'warning',
        patterns: missingEssential
      });

      fixes.push({
        type: 'add_ai_essential_patterns',
        patterns: missingEssential,
        description: 'Add essential AI ignore patterns'
      });
    }

    if (missingAiSpecific.length > 0) {
      violations.push({
        type: 'missing_ai_specific_patterns',
        message: `Missing AI-specific patterns: ${missingAiSpecific.join(', ')}`,
        severity: 'info',
        patterns: missingAiSpecific
      });

      fixes.push({
        type: 'add_ai_specific_patterns',
        patterns: missingAiSpecific,
        description: 'Add AI-specific ignore patterns'
      });
    }
  }

  /**
   * Validate generic environment file
   */
  validateGenericEnvFile(content, violations, fixes, filePath) {
    // Basic validation for unknown env files
    if (content.length === 0) {
      violations.push({
        type: 'empty_file',
        message: `Environment file ${path.basename(filePath)} is empty`,
        severity: 'info'
      });
    }
  }

  /**
   * Validate line endings
   */
  validateLineEndings(content, violations, fixes, filePath) {
    const hasCarriageReturn = content.includes('\r\n');
    const hasMixedEndings = content.includes('\r\n') && content.includes('\n') && !content.includes('\r\n');
    
    if (hasMixedEndings) {
      violations.push({
        type: 'mixed_line_endings',
        message: `File has mixed line endings`,
        severity: 'info'
      });

      fixes.push({
        type: 'fix_line_endings',
        description: 'Standardize to LF line endings'
      });
    } else if (hasCarriageReturn) {
      violations.push({
        type: 'crlf_line_endings',
        message: `File uses CRLF line endings`,
        severity: 'info'
      });

      fixes.push({
        type: 'fix_line_endings',
        description: 'Convert to LF line endings'
      });
    }
  }

  /**
   * Find duplicate patterns in a list
   */
  findDuplicatePatterns(patterns) {
    const seen = new Set();
    const duplicates = new Set();
    
    patterns.forEach(pattern => {
      if (seen.has(pattern)) {
        duplicates.add(pattern);
      } else {
        seen.add(pattern);
      }
    });
    
    return Array.from(duplicates);
  }

  /**
   * Apply fixes to the environment file
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
          const change = this.applyFix(content, fix, filePath);
          if (change.newContent !== undefined) {
            content = change.newContent;
          }
          if (change.description) {
            changes.push(change.description);
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
   * Apply a single fix to the environment file content
   */
  applyFix(content, fix, filePath) {
    const basename = path.basename(filePath);
    
    switch (fix.type) {
      case 'add_placeholder':
        const lines = content.split('\n');
        lines[fix.line - 1] = lines[fix.line - 1].replace(
          new RegExp(`^(${fix.key}=)$`),
          `$1your_${fix.key.toLowerCase()}_here`
        );
        return {
          newContent: lines.join('\n'),
          description: `Added placeholder for ${fix.key}`
        };

      case 'add_common_env':
        const placeholder = this.getEnvPlaceholder(fix.envVar);
        return {
          newContent: content + `\n# ${fix.envVar}\n${fix.envVar}=${placeholder}\n`,
          description: `Added ${fix.envVar} documentation`
        };

      case 'add_essential_patterns':
      case 'add_project_patterns':
      case 'add_ai_essential_patterns':
      case 'add_ai_specific_patterns':
        const sectionComment = this.getSectionComment(fix.type, basename);
        const newPatterns = fix.patterns.map(p => p).join('\n');
        return {
          newContent: content + `\n${sectionComment}\n${newPatterns}\n`,
          description: `Added ${fix.patterns.length} ignore patterns`
        };

      case 'remove_duplicates':
        const uniqueLines = this.removeDuplicateLines(content);
        return {
          newContent: uniqueLines,
          description: `Removed ${fix.patterns.length} duplicate patterns`
        };

      case 'fix_line_endings':
        return {
          newContent: content.replace(/\r\n/g, '\n').replace(/\r/g, '\n'),
          description: 'Fixed line endings to LF'
        };

      default:
        throw new Error(`Unknown fix type: ${fix.type}`);
    }
  }

  /**
   * Get placeholder value for environment variable
   */
  getEnvPlaceholder(envVar) {
    const placeholders = {
      'NODE_ENV': 'development',
      'PORT': '3000',
      'DATABASE_URL': 'postgresql://user:password@localhost:5432/dbname',
      'API_KEY': 'your_api_key_here',
      'JWT_SECRET': 'your_jwt_secret_here'
    };
    
    return placeholders[envVar] || `your_${envVar.toLowerCase()}_here`;
  }

  /**
   * Get section comment for ignore file additions
   */
  getSectionComment(fixType, basename) {
    if (basename === '.gitignore') {
      if (fixType.includes('essential')) {
        return '# Essential patterns';
      } else if (fixType.includes('project')) {
        return '# ProjectTemplate specific';
      }
    } else if (basename === '.aiignore') {
      if (fixType.includes('essential')) {
        return '# Essential AI ignore patterns';
      } else if (fixType.includes('specific')) {
        return '# ProjectTemplate AI-specific patterns';
      }
    }
    return '# Added patterns';
  }

  /**
   * Remove duplicate lines while preserving order
   */
  removeDuplicateLines(content) {
    const lines = content.split('\n');
    const seen = new Set();
    const uniqueLines = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!seen.has(trimmed) || trimmed === '' || trimmed.startsWith('#')) {
        seen.add(trimmed);
        uniqueLines.push(line);
      }
    });
    
    return uniqueLines.join('\n');
  }
}

module.exports = EnvValidator;