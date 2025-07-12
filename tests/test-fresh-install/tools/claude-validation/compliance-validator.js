#!/usr/bin/env node

/**
 * ProjectTemplate Behavioral Compliance Validator
 * Validates Claude Code responses against CLAUDE.md requirements
 */

const fs = require('fs');
const path = require('path');

class ComplianceValidator {
  constructor(configPath = null) {
    // Load configuration
    this.config = this.loadConfig(configPath);
    
    // Core compliance patterns from CLAUDE.md
    this.patterns = {
      promptImprovement: {
        pattern: /^\*\*Improved Prompt\*\*:/,
        description: 'Response must start with improved prompt for complex requests',
        severity: 'critical'
      },
      noImprovedFiles: {
        pattern: /_improved\.|_enhanced\.|_v2\.|_better\.|_new\./,
        description: 'Never create improved/enhanced/v2 versions of files',
        severity: 'critical',
        invertMatch: true // Should NOT match
      },
      generatorUsage: {
        pattern: /npm run g(:c|:component|enerate:component)/,
        description: 'Should recommend component generators',
        severity: 'warning',
        contextPattern: /creat(e|ing) .*(component|Component)/
      },
      todoWriteUsage: {
        pattern: /TodoWrite|todo\s*list/i,
        description: 'Should use TodoWrite for multi-step tasks',
        severity: 'warning',
        contextPattern: /(step|task|implement|build).*(multiple|several|list|series)/i
      },
      originalFileEditing: {
        pattern: /edit(ing|s)?\s*(the\s*)?(original|existing)\s*file/i,
        description: 'Should mention editing original files',
        severity: 'info',
        contextPattern: /improv|enhanc|fix|updat/i
      },
      conciseResponse: {
        pattern: /.*/,
        description: 'Keep responses concise (under 4 lines for simple queries)',
        severity: 'info',
        customValidator: (response, context) => {
          if (context.isSimpleQuery) {
            const lines = response.split('\n').filter(l => l.trim().length > 0);
            return lines.length <= 4;
          }
          return true;
        }
      }
    };

    this.stats = {
      totalValidations: 0,
      violations: {},
      passedValidations: 0
    };
    
    // Apply configuration to patterns
    this.applyConfiguration();
  }

  /**
   * Load configuration from file or use defaults
   */
  loadConfig(configPath) {
    const defaultConfigPath = path.join(__dirname, '.claude-validation-config.json');
    const targetPath = configPath || defaultConfigPath;
    
    try {
      if (fs.existsSync(targetPath)) {
        const configData = fs.readFileSync(targetPath, 'utf-8');
        return JSON.parse(configData);
      }
    } catch (error) {
      process.stderr.write(`Warning: Could not load config from ${targetPath}, using defaults\n`);
    }
    
    // Default configuration
    return {
      enabled: true,
      severityLevels: { global: "WARNING" },
      patterns: {},
      scoring: { critical: -25, warning: -10, info: -5 },
      output: { colorOutput: true, verboseMode: false }
    };
  }

  /**
   * Apply configuration settings to patterns
   */
  applyConfiguration() {
    if (!this.config.enabled) {
      // Disable all patterns if validation is disabled
      Object.keys(this.patterns).forEach(key => {
        this.patterns[key].enabled = false;
      });
      return;
    }

    // Apply pattern-specific configuration
    Object.keys(this.patterns).forEach(patternKey => {
      const pattern = this.patterns[patternKey];
      const configPattern = this.config.patterns[patternKey];
      
      if (configPattern) {
        // Apply enabled/disabled setting
        pattern.enabled = configPattern.enabled !== false;
        
        // Apply severity override
        if (configPattern.severity) {
          pattern.severity = configPattern.severity.toLowerCase();
        }
      }
    });

    // Apply global severity filter
    const globalSeverity = this.config.severityLevels?.global?.toLowerCase();
    if (globalSeverity === 'critical') {
      // Only show critical violations
      Object.keys(this.patterns).forEach(key => {
        if (this.patterns[key].severity !== 'critical') {
          this.patterns[key].enabled = false;
        }
      });
    } else if (globalSeverity === 'disabled') {
      // Disable all patterns
      Object.keys(this.patterns).forEach(key => {
        this.patterns[key].enabled = false;
      });
    }
  }

  /**
   * Validate a Claude Code response
   * @param {string} response - The response text to validate
   * @param {Object} context - Context about the request
   * @returns {Object} Validation results
   */
  validate(response, context = {}) {
    const results = {
      timestamp: new Date().toISOString(),
      passed: true,
      violations: [],
      warnings: [],
      score: 100
    };

    // Check each pattern
    for (const [key, rule] of Object.entries(this.patterns)) {
      // Skip disabled patterns
      if (rule.enabled === false) {
        continue;
      }
      
      // Skip prompt improvement check for simple queries
      if (key === 'promptImprovement' && context.isSimpleQuery) {
        continue;
      }
      
      // Only check prompt improvement for complex requests
      if (key === 'promptImprovement' && !context.isComplexRequest) {
        continue;
      }
      
      const result = this.checkPattern(response, rule, context);
      
      if (!result.passed) {
        if (rule.severity === 'critical') {
          results.passed = false;
          results.violations.push({
            rule: key,
            description: rule.description,
            severity: rule.severity
          });
          results.score += this.config.scoring?.critical || -25;
        } else if (rule.severity === 'warning') {
          results.warnings.push({
            rule: key,
            description: rule.description,
            severity: rule.severity
          });
          results.score += this.config.scoring?.warning || -10;
        } else if (rule.severity === 'info') {
          // Info violations don't affect pass/fail but do affect score
          results.warnings.push({
            rule: key,
            description: rule.description,
            severity: rule.severity
          });
          results.score += this.config.scoring?.info || -5;
        }
      }
    }

    // Update stats
    this.stats.totalValidations++;
    if (results.passed) {
      this.stats.passedValidations++;
    }
    results.violations.forEach(v => {
      this.stats.violations[v.rule] = (this.stats.violations[v.rule] || 0) + 1;
    });

    results.score = Math.max(0, results.score);
    return results;
  }

  /**
   * Check a single pattern against the response
   */
  checkPattern(response, rule, context) {
    // Check if context pattern matches first (if specified)
    if (rule.contextPattern && !rule.contextPattern.test(response)) {
      return { passed: true, reason: 'Context pattern not matched' };
    }

    // Custom validator
    if (rule.customValidator) {
      const passed = rule.customValidator(response, context);
      return { passed, reason: passed ? 'Custom validation passed' : 'Custom validation failed' };
    }

    // Regular pattern matching
    const matches = rule.pattern.test(response);
    const passed = rule.invertMatch ? !matches : matches;
    
    return {
      passed,
      reason: passed ? 'Pattern check passed' : 'Pattern check failed'
    };
  }

  /**
   * Get current statistics
   */
  getStats() {
    const complianceRate = this.stats.totalValidations > 0
      ? (this.stats.passedValidations / this.stats.totalValidations * 100).toFixed(1)
      : 0;

    return {
      ...this.stats,
      complianceRate: `${complianceRate}%`
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalValidations: 0,
      violations: {},
      passedValidations: 0
    };
  }
}

// CLI usage
if (require.main === module) {
  const validator = new ComplianceValidator();
  
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'validate') {
    // Read from stdin or file
    const input = args[1] === '-' || !args[1]
      ? fs.readFileSync(0, 'utf-8')
      : fs.readFileSync(args[1], 'utf-8');

    const context = {
      isSimpleQuery: args.includes('--simple'),
      isComplexRequest: args.includes('--complex')
    };

    const results = validator.validate(input, context);
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
    
    process.exit(results.passed ? 0 : 1);
  } else if (command === 'stats') {
    // Load saved stats if available
    const statsFile = path.join(__dirname, '.compliance-stats.json');
    if (fs.existsSync(statsFile)) {
      const savedStats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
      Object.assign(validator.stats, savedStats);
    }
    
    process.stdout.write(JSON.stringify(validator.getStats(), null, 2) + '\n');
  } else {
    process.stderr.write(`
ProjectTemplate Compliance Validator

Usage:
  compliance-validator validate [file|-] [--simple|--complex]
    Validate a Claude Code response from file or stdin
    
  compliance-validator stats
    Show validation statistics
    
  compliance-validator test
    Run test validations

Examples:
  echo "response text" | compliance-validator validate -
  compliance-validator validate response.txt --complex
  compliance-validator stats
    `);
  }
}

module.exports = ComplianceValidator;