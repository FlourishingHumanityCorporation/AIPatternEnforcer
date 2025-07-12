#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { BaseValidator } = require('../index');

/**
 * JavaScript/TypeScript Configuration File Validator
 * Validates JS/TS config files like vite.config.js, webpack.config.js, jest.config.js
 */
class JsConfigValidator extends BaseValidator {
  constructor(config) {
    super(config);
    this.fileType = 'javascript';
  }

  getFileType() {
    return this.fileType;
  }

  /**
   * Validate a JavaScript configuration file
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

      // Basic syntax validation
      this.validateBasicSyntax(content, violations, fixes, filePath);

      // File-specific validations
      if (basename.startsWith('vite.config.')) {
        this.validateViteConfig(content, violations, fixes, filePath);
      } else if (basename.startsWith('webpack.config.')) {
        this.validateWebpackConfig(content, violations, fixes, filePath);
      } else if (basename.startsWith('jest.config.')) {
        this.validateJestConfig(content, violations, fixes, filePath);
      } else {
        this.validateGenericJsConfig(content, violations, fixes, filePath);
      }

      // Export pattern validation
      if (this.config.rules.standardizeExports) {
        this.validateExportPatterns(content, violations, fixes, filePath);
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
   * Validate basic JavaScript syntax and structure
   */
  validateBasicSyntax(content, violations, fixes, filePath) {
    // Check for common syntax issues
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      
      // Check for missing semicolons in key places
      if (trimmed.match(/^(import|export).*[^;]$/) && !trimmed.endsWith('{')) {
        violations.push({
          type: 'missing_semicolon',
          message: `Missing semicolon on line ${lineNum}`,
          severity: 'info',
          line: lineNum
        });
      }
      
      // Check for console.log in config files (usually debugging leftovers)
      if (trimmed.includes('console.log')) {
        violations.push({
          type: 'console_log_found',
          message: `console.log found on line ${lineNum} (possible debugging leftover)`,
          severity: 'warning',
          line: lineNum
        });
        
        fixes.push({
          type: 'remove_console_log',
          line: lineNum,
          description: `Remove console.log on line ${lineNum}`
        });
      }
    });

    // Check for proper imports/exports
    if (!content.includes('export') && !content.includes('module.exports')) {
      violations.push({
        type: 'no_export',
        message: 'Configuration file has no export statement',
        severity: 'error'
      });
    }
  }

  /**
   * Validate Vite configuration
   */
  validateViteConfig(content, violations, fixes, filePath) {
    // Check for essential Vite configuration elements
    const hasDefineConfig = content.includes('defineConfig');
    const hasPlugins = content.includes('plugins');
    const hasBuild = content.includes('build');

    if (!hasDefineConfig) {
      violations.push({
        type: 'missing_define_config',
        message: 'Vite config should use defineConfig for better TypeScript support',
        severity: 'info'
      });
      
      fixes.push({
        type: 'add_define_config',
        description: 'Wrap config with defineConfig()'
      });
    }

    // Check for common plugin patterns
    if (content.includes('react') && !content.includes('@vitejs/plugin-react')) {
      violations.push({
        type: 'missing_react_plugin',
        message: 'React project should include @vitejs/plugin-react',
        severity: 'warning'
      });
    }

    // Check for proper build configuration
    if (hasBuild) {
      if (!content.includes('outDir')) {
        violations.push({
          type: 'missing_build_outdir',
          message: 'Build configuration should specify outDir',
          severity: 'info'
        });
      }
    }

    // Check for development server configuration
    if (content.includes('server')) {
      if (!content.includes('port')) {
        violations.push({
          type: 'missing_dev_port',
          message: 'Server configuration should specify port',
          severity: 'info'
        });
      }
    }
  }

  /**
   * Validate Webpack configuration
   */
  validateWebpackConfig(content, violations, fixes, filePath) {
    // Check for essential Webpack configuration elements
    const hasEntry = content.includes('entry');
    const hasOutput = content.includes('output');
    const hasModule = content.includes('module');

    if (!hasEntry) {
      violations.push({
        type: 'missing_webpack_entry',
        message: 'Webpack config should specify entry point',
        severity: 'warning'
      });
    }

    if (!hasOutput) {
      violations.push({
        type: 'missing_webpack_output',
        message: 'Webpack config should specify output configuration',
        severity: 'warning'
      });
    }

    if (!hasModule) {
      violations.push({
        type: 'missing_webpack_module',
        message: 'Webpack config should specify module rules',
        severity: 'info'
      });
    }

    // Check for mode specification
    if (!content.includes('mode')) {
      violations.push({
        type: 'missing_webpack_mode',
        message: 'Webpack config should specify mode (development/production)',
        severity: 'warning'
      });
      
      fixes.push({
        type: 'add_webpack_mode',
        description: 'Add mode configuration'
      });
    }
  }

  /**
   * Validate Jest configuration
   */
  validateJestConfig(content, violations, fixes, filePath) {
    // Check for essential Jest configuration elements
    const hasTestEnvironment = content.includes('testEnvironment');
    const hasRoots = content.includes('roots') || content.includes('testMatch');
    
    if (!hasTestEnvironment) {
      violations.push({
        type: 'missing_jest_environment',
        message: 'Jest config should specify testEnvironment',
        severity: 'info'
      });
      
      fixes.push({
        type: 'add_jest_environment',
        description: 'Add testEnvironment configuration'
      });
    }

    if (!hasRoots) {
      violations.push({
        type: 'missing_jest_test_paths',
        message: 'Jest config should specify test file locations',
        severity: 'warning'
      });
    }

    // Check for coverage configuration
    if (content.includes('collectCoverage') && !content.includes('coverageDirectory')) {
      violations.push({
        type: 'missing_coverage_directory',
        message: 'Jest config with coverage should specify coverageDirectory',
        severity: 'info'
      });
    }

    // Check for TypeScript support if TypeScript files are present
    const projectRoot = process.cwd();
    const hasTsFiles = fs.existsSync(path.join(projectRoot, 'tsconfig.json'));
    
    if (hasTsFiles && !content.includes('ts-jest') && !content.includes('@babel/preset-typescript')) {
      violations.push({
        type: 'missing_typescript_support',
        message: 'TypeScript project should configure Jest for TypeScript support',
        severity: 'warning'
      });
    }
  }

  /**
   * Validate generic JavaScript configuration file
   */
  validateGenericJsConfig(content, violations, fixes, filePath) {
    // Basic validation for unknown JS config files
    if (content.length < 50) {
      violations.push({
        type: 'minimal_config',
        message: `Configuration file ${path.basename(filePath)} appears minimal`,
        severity: 'info'
      });
    }

    // Check for hardcoded values that should be environment variables
    const hardcodedPatterns = [
      /port\s*:\s*3000/i,
      /host\s*:\s*['"]localhost['"]/i,
      /database\s*:\s*['"].*['"]/i
    ];

    hardcodedPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        violations.push({
          type: 'hardcoded_value',
          message: 'Consider using environment variables for configuration values',
          severity: 'info'
        });
      }
    });
  }

  /**
   * Validate export patterns
   */
  validateExportPatterns(content, violations, fixes, filePath) {
    // Check for consistent export patterns
    const hasDefaultExport = content.includes('export default');
    const hasModuleExports = content.includes('module.exports');
    const hasNamedExports = content.includes('export {') || content.includes('export const');

    if (hasDefaultExport && hasModuleExports) {
      violations.push({
        type: 'mixed_export_patterns',
        message: 'File mixes ES6 and CommonJS export patterns',
        severity: 'warning'
      });
      
      fixes.push({
        type: 'standardize_exports',
        description: 'Standardize to ES6 export pattern'
      });
    }

    // Check for multiple default exports (syntax error)
    const defaultExportMatches = content.match(/export default/g);
    if (defaultExportMatches && defaultExportMatches.length > 1) {
      violations.push({
        type: 'multiple_default_exports',
        message: 'File has multiple default exports',
        severity: 'error'
      });
    }
  }

  /**
   * Apply fixes to the JavaScript configuration file
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
   * Apply a single fix to the JavaScript configuration file
   */
  applyFix(content, fix, filePath) {
    const basename = path.basename(filePath);
    
    switch (fix.type) {
      case 'remove_console_log':
        const lines = content.split('\n');
        lines[fix.line - 1] = lines[fix.line - 1].replace(/console\.log\([^)]*\);?/, '');
        return {
          newContent: lines.join('\n'),
          description: `Removed console.log on line ${fix.line}`
        };

      case 'add_define_config':
        if (basename.startsWith('vite.config.')) {
          const importMatch = content.match(/import.*from ['"]vite['"]/);
          if (importMatch) {
            const newImport = importMatch[0].replace('vite', 'vite').replace(/\{([^}]*)\}/, (match, imports) => {
              if (!imports.includes('defineConfig')) {
                return `{ ${imports.trim()}, defineConfig }`;
              }
              return match;
            });
            let newContent = content.replace(importMatch[0], newImport);
            newContent = newContent.replace(/export default\s*\{/, 'export default defineConfig({');
            return {
              newContent,
              description: 'Added defineConfig wrapper'
            };
          }
        }
        return { description: 'Could not apply defineConfig fix' };

      case 'add_webpack_mode':
        if (!content.includes('mode:')) {
          const configMatch = content.match(/module\.exports\s*=\s*\{|export default \{/);
          if (configMatch) {
            const insertIndex = content.indexOf('{', configMatch.index) + 1;
            const newContent = content.slice(0, insertIndex) + 
              '\n  mode: process.env.NODE_ENV || \'development\',' + 
              content.slice(insertIndex);
            return {
              newContent,
              description: 'Added mode configuration'
            };
          }
        }
        return { description: 'Could not apply webpack mode fix' };

      case 'add_jest_environment':
        if (!content.includes('testEnvironment:')) {
          const configMatch = content.match(/module\.exports\s*=\s*\{|export default \{/);
          if (configMatch) {
            const insertIndex = content.indexOf('{', configMatch.index) + 1;
            const newContent = content.slice(0, insertIndex) + 
              '\n  testEnvironment: \'node\',' + 
              content.slice(insertIndex);
            return {
              newContent,
              description: 'Added testEnvironment configuration'
            };
          }
        }
        return { description: 'Could not apply Jest environment fix' };

      case 'standardize_exports':
        // Convert module.exports to export default
        const newContent = content.replace(
          /module\.exports\s*=\s*/g,
          'export default '
        );
        return {
          newContent,
          description: 'Standardized to ES6 exports'
        };

      default:
        throw new Error(`Unknown fix type: ${fix.type}`);
    }
  }
}

module.exports = JsConfigValidator;