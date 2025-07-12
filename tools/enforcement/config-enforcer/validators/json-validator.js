#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { BaseValidator } = require('../index');

/**
 * JSON Configuration Validator
 * Validates and fixes JSON configuration files like package.json, tsconfig.json, etc.
 */
class JsonValidator extends BaseValidator {
  constructor(config) {
    super(config);
    this.fileType = 'json';
  }

  getFileType() {
    return this.fileType;
  }

  /**
   * Validate a JSON configuration file
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
            severity: 'error'
          }],
          fixes: []
        };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      let jsonData;

      // Parse JSON
      try {
        jsonData = JSON.parse(content);
      } catch (parseError) {
        violations.push({
          type: 'json_parse_error',
          message: `Invalid JSON in ${filePath}: ${parseError.message}`,
          severity: 'error',
          line: this.getErrorLine(content, parseError)
        });
        return { isValid: false, violations, fixes };
      }

      // File-specific validations
      const basename = path.basename(filePath);
      switch (basename) {
        case 'package.json':
          this.validatePackageJson(jsonData, violations, fixes, filePath);
          break;
        case 'tsconfig.json':
        case 'tsconfig.base.json':
        case 'tsconfig.build.json':
          this.validateTsConfig(jsonData, violations, fixes, filePath);
          break;
        case '.eslintrc.json':
          this.validateEslintConfig(jsonData, violations, fixes, filePath);
          break;
        default:
          this.validateGenericJson(jsonData, violations, fixes, filePath);
      }

      // Format validation
      if (this.config.rules.formatJson) {
        this.validateJsonFormatting(content, jsonData, violations, fixes, filePath);
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
   * Validate package.json specific requirements
   */
  validatePackageJson(data, violations, fixes, filePath) {
    // Required fields
    const requiredFields = ['name', 'version', 'description'];
    requiredFields.forEach(field => {
      if (!data[field]) {
        violations.push({
          type: 'missing_required_field',
          message: `package.json missing required field: ${field}`,
          severity: 'warning',
          field
        });
        
        fixes.push({
          type: 'add_field',
          field,
          value: this.getDefaultValue(field),
          description: `Add missing ${field} field`
        });
      }
    });

    // Validate scripts if rule is enabled
    if (this.config.rules.requireScripts) {
      this.validatePackageScripts(data, violations, fixes);
    }

    // Check for deprecated fields
    const deprecatedFields = ['preferGlobal', 'analyze'];
    deprecatedFields.forEach(field => {
      if (data[field]) {
        violations.push({
          type: 'deprecated_field',
          message: `package.json contains deprecated field: ${field}`,
          severity: 'info',
          field
        });
        
        fixes.push({
          type: 'remove_field',
          field,
          description: `Remove deprecated ${field} field`
        });
      }
    });

    // Validate dependencies structure
    this.validateDependencies(data, violations, fixes);
  }

  /**
   * Validate package.json scripts section
   */
  validatePackageScripts(data, violations, fixes) {
    if (!data.scripts) {
      violations.push({
        type: 'missing_scripts',
        message: 'package.json missing scripts section',
        severity: 'warning'
      });
      
      fixes.push({
        type: 'add_scripts_section',
        description: 'Add basic scripts section'
      });
      return;
    }

    // Expected scripts for ProjectTemplate
    const expectedScripts = {
      'test': 'Test command',
      'lint': 'Linting command',
      'build': 'Build command (if applicable)'
    };

    Object.entries(expectedScripts).forEach(([script, description]) => {
      if (!data.scripts[script]) {
        violations.push({
          type: 'missing_script',
          message: `package.json missing recommended script: ${script}`,
          severity: 'info',
          script
        });
      }
    });

    // Check for common anti-patterns in scripts
    Object.entries(data.scripts).forEach(([name, command]) => {
      if (typeof command !== 'string') {
        violations.push({
          type: 'invalid_script_type',
          message: `Script "${name}" must be a string`,
          severity: 'error',
          script: name
        });
      }

      // Check for potentially dangerous commands
      if (command.includes('rm -rf /') || command.includes('del /f /s /q')) {
        violations.push({
          type: 'dangerous_script',
          message: `Script "${name}" contains potentially dangerous command`,
          severity: 'error',
          script: name
        });
      }
    });
  }

  /**
   * Validate dependencies section
   */
  validateDependencies(data, violations, fixes) {
    const depSections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
    
    depSections.forEach(section => {
      if (data[section] && typeof data[section] !== 'object') {
        violations.push({
          type: 'invalid_dependencies_type',
          message: `${section} must be an object`,
          severity: 'error',
          section
        });
      }
    });

    // Check for duplicate dependencies
    const allDeps = new Map();
    depSections.forEach(section => {
      if (data[section]) {
        Object.keys(data[section]).forEach(dep => {
          if (allDeps.has(dep)) {
            violations.push({
              type: 'duplicate_dependency',
              message: `Dependency "${dep}" appears in multiple sections: ${allDeps.get(dep)} and ${section}`,
              severity: 'warning',
              dependency: dep
            });
          } else {
            allDeps.set(dep, section);
          }
        });
      }
    });
  }

  /**
   * Validate TypeScript configuration
   */
  validateTsConfig(data, violations, fixes, filePath) {
    // Basic structure validation
    if (!data.compilerOptions) {
      violations.push({
        type: 'missing_compiler_options',
        message: 'tsconfig.json missing compilerOptions',
        severity: 'error'
      });
      
      fixes.push({
        type: 'add_compiler_options',
        description: 'Add basic compilerOptions section'
      });
      return;
    }

    const compilerOptions = data.compilerOptions;

    // Recommended compiler options for ProjectTemplate
    const recommendedOptions = {
      'strict': true,
      'noImplicitReturns': true,
      'noFallthroughCasesInSwitch': true,
      'moduleResolution': 'node'
    };

    Object.entries(recommendedOptions).forEach(([option, expectedValue]) => {
      if (compilerOptions[option] !== expectedValue) {
        violations.push({
          type: 'suboptimal_compiler_option',
          message: `tsconfig.json: recommend setting ${option} to ${expectedValue}`,
          severity: 'info',
          option,
          expectedValue,
          currentValue: compilerOptions[option]
        });
        
        fixes.push({
          type: 'update_compiler_option',
          option,
          value: expectedValue,
          description: `Set ${option} to ${expectedValue}`
        });
      }
    });

    // Check for deprecated options
    const deprecatedOptions = ['experimentalDecorators', 'emitDecoratorMetadata'];
    deprecatedOptions.forEach(option => {
      if (compilerOptions[option]) {
        violations.push({
          type: 'deprecated_compiler_option',
          message: `tsconfig.json uses deprecated option: ${option}`,
          severity: 'info',
          option
        });
      }
    });
  }

  /**
   * Validate ESLint configuration
   */
  validateEslintConfig(data, violations, fixes, filePath) {
    // Basic structure checks
    if (!data.extends && !data.rules) {
      violations.push({
        type: 'empty_eslint_config',
        message: '.eslintrc.json appears empty (no extends or rules)',
        severity: 'warning'
      });
    }

    // Check for common configuration issues
    if (data.extends && !Array.isArray(data.extends) && typeof data.extends !== 'string') {
      violations.push({
        type: 'invalid_extends_type',
        message: 'ESLint extends must be string or array',
        severity: 'error'
      });
    }
  }

  /**
   * Validate generic JSON formatting
   */
  validateGenericJson(data, violations, fixes, filePath) {
    // Basic structural validation
    if (typeof data !== 'object' || data === null) {
      violations.push({
        type: 'invalid_json_structure',
        message: 'JSON file must contain an object at root level',
        severity: 'warning'
      });
    }
  }

  /**
   * Validate JSON formatting (indentation, spacing, etc.)
   */
  validateJsonFormatting(content, data, violations, fixes, filePath) {
    const standardFormat = JSON.stringify(data, null, 2);
    
    if (content.trim() !== standardFormat) {
      violations.push({
        type: 'json_formatting',
        message: 'JSON file formatting is inconsistent',
        severity: 'info'
      });
      
      fixes.push({
        type: 'format_json',
        content: standardFormat,
        description: 'Format JSON with consistent 2-space indentation'
      });
    }
  }

  /**
   * Apply fixes to the JSON file
   */
  async applyFixes(filePath, fixes, dryRun = false) {
    if (fixes.length === 0) {
      return { success: true, changes: [], errors: [] };
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let data;

      try {
        data = JSON.parse(content);
      } catch (parseError) {
        return {
          success: false,
          changes: [],
          errors: [`Cannot fix file with JSON parse errors: ${parseError.message}`]
        };
      }

      const changes = [];
      const errors = [];

      // Apply fixes in order
      for (const fix of fixes) {
        try {
          const change = this.applyFix(data, fix);
          if (change) {
            changes.push(change);
          }
        } catch (error) {
          errors.push(`Failed to apply fix ${fix.type}: ${error.message}`);
        }
      }

      // Format the final JSON
      const newContent = JSON.stringify(data, null, 2) + '\n';

      if (!dryRun && newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
      }

      return {
        success: errors.length === 0,
        changes,
        errors,
        newContent: dryRun ? newContent : undefined
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
   * Apply a single fix to the JSON data
   */
  applyFix(data, fix) {
    switch (fix.type) {
      case 'add_field':
        data[fix.field] = fix.value;
        return `Added field: ${fix.field}`;

      case 'remove_field':
        delete data[fix.field];
        return `Removed field: ${fix.field}`;

      case 'add_scripts_section':
        data.scripts = {
          'test': 'echo "No tests specified" && exit 1',
          'lint': 'echo "No linting specified"',
          'build': 'echo "No build specified"'
        };
        return 'Added scripts section';

      case 'add_compiler_options':
        data.compilerOptions = {
          'target': 'ES2020',
          'module': 'commonjs',
          'strict': true,
          'esModuleInterop': true,
          'skipLibCheck': true,
          'forceConsistentCasingInFileNames': true
        };
        return 'Added compilerOptions section';

      case 'update_compiler_option':
        data.compilerOptions[fix.option] = fix.value;
        return `Updated compiler option: ${fix.option} = ${fix.value}`;

      case 'format_json':
        // Formatting is handled in applyFixes
        return 'Formatted JSON';

      default:
        throw new Error(`Unknown fix type: ${fix.type}`);
    }
  }

  /**
   * Get default value for a missing field
   */
  getDefaultValue(field) {
    const defaults = {
      'name': 'my-project',
      'version': '1.0.0',
      'description': 'A ProjectTemplate project'
    };
    return defaults[field] || '';
  }

  /**
   * Get line number for JSON parse error
   */
  getErrorLine(content, error) {
    if (!error.message) return undefined;
    
    const match = error.message.match(/at position (\d+)/);
    if (match) {
      const position = parseInt(match[1]);
      const lines = content.substring(0, position).split('\n');
      return lines.length;
    }
    return undefined;
  }
}

module.exports = JsonValidator;