#!/usr/bin/env node
/**
 * Documentation Enforcement Rule Engine
 * 
 * Core enforcement system that applies documentation rules and
 * validates compliance before commits and merges.
 */

const fs = require('fs');
const path = require('path');
const ChangeAnalyzer = require('./change-analyzer');
const GitDiffAnalyzer = require('./git-diff-analyzer');

class DocumentationRuleEngine {
  constructor(options = {}) {
    this.projectRoot = process.cwd();
    this.configPath = options.configPath || 
      path.join(this.projectRoot, 'docs/standards/documentation-rules.json');
    this.changeAnalyzer = new ChangeAnalyzer();
    this.diffAnalyzer = new GitDiffAnalyzer();
    
    // Load configuration
    this.config = this.loadConfiguration();
    this.rules = this.initializeRules();
  }

  /**
   * Load rule configuration
   */
  loadConfiguration() {
    const defaultConfig = {
      enabled: true,
      strictMode: false,
      excludePatterns: [
        'node_modules/**',
        '.git/**',
        'coverage/**',
        'dist/**',
        'build/**',
        '*.log',
        '*.tmp'
      ],
      rules: {
        // File-based rules
        newFileRequiresDocumentation: {
          enabled: true,
          severity: 'error',
          exceptions: ['test/**', '*.test.*', '*.spec.*']
        },
        modifiedFileRequiresDocumentationUpdate: {
          enabled: true,
          severity: 'warning',
          threshold: 'significant' // minor, significant, major
        },
        
        // Content-based rules
        publicApiRequiresDocumentation: {
          enabled: true,
          severity: 'error',
          patterns: [
            'export function',
            'export class',
            'export interface',
            'export type'
          ]
        },
        
        // Quality rules
        documentationQualityStandards: {
          enabled: true,
          severity: 'warning',
          minLength: 50,
          requiresExamples: true,
          requiresParameters: true
        },
        
        // Consistency rules
        followsTemplateStructure: {
          enabled: true,
          severity: 'warning'
        },
        
        // Coverage rules
        minimumCoverageThreshold: {
          enabled: true,
          severity: 'error',
          threshold: 80 // percentage
        }
      },
      
      // Enforcement levels
      enforcement: {
        preCommit: true,
        preMerge: true,
        ci: true,
        allowOverride: true,
        overrideRequiresJustification: true
      },
      
      // Output configuration
      output: {
        format: 'detailed', // minimal, detailed, json
        showSuggestions: true,
        showExamples: true
      }
    };

    if (fs.existsSync(this.configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        return this.mergeDeep(defaultConfig, userConfig);
      } catch (error) {
        console.warn(`Warning: Could not load config from ${this.configPath}, using defaults`);
        return defaultConfig;
      }
    }

    return defaultConfig;
  }

  /**
   * Initialize rule implementations
   */
  initializeRules() {
    return {
      newFileRequiresDocumentation: this.checkNewFileDocumentation.bind(this),
      modifiedFileRequiresDocumentationUpdate: this.checkModifiedFileDocumentation.bind(this),
      publicApiRequiresDocumentation: this.checkPublicApiDocumentation.bind(this),
      documentationQualityStandards: this.checkDocumentationQuality.bind(this),
      followsTemplateStructure: this.checkTemplateCompliance.bind(this),
      minimumCoverageThreshold: this.checkCoverageThreshold.bind(this)
    };
  }

  /**
   * Run all enforcement rules
   */
  async enforce(options = {}) {
    const context = await this.gatherContext(options);
    const results = {
      timestamp: new Date().toISOString(),
      context,
      violations: [],
      warnings: [],
      passed: [],
      summary: {
        total: 0,
        errors: 0,
        warnings: 0,
        passed: 0
      },
      enforcement: {
        shouldBlock: false,
        canOverride: this.config.enforcement.allowOverride,
        requiresJustification: this.config.enforcement.overrideRequiresJustification
      }
    };

    // Skip if disabled
    if (!this.config.enabled) {
      results.skipped = true;
      results.reason = 'Documentation enforcement is disabled';
      return results;
    }

    // Run each enabled rule
    for (const [ruleName, ruleConfig] of Object.entries(this.config.rules)) {
      if (!ruleConfig.enabled) continue;

      const ruleImplementation = this.rules[ruleName];
      if (!ruleImplementation) {
        console.warn(`Warning: Rule implementation not found for ${ruleName}`);
        continue;
      }

      try {
        const ruleResults = await ruleImplementation(context, ruleConfig);
        this.processRuleResults(results, ruleName, ruleResults, ruleConfig);
      } catch (error) {
        console.error(`Error executing rule ${ruleName}:`, error.message);
        results.violations.push({
          rule: ruleName,
          severity: 'error',
          message: `Rule execution failed: ${error.message}`,
          type: 'system_error'
        });
      }
    }

    // Calculate summary
    results.summary.total = results.violations.length + results.warnings.length + results.passed.length;
    results.summary.errors = results.violations.length;
    results.summary.warnings = results.warnings.length;
    results.summary.passed = results.passed.length;

    // Determine enforcement action
    results.enforcement.shouldBlock = results.violations.length > 0 || 
      (this.config.strictMode && results.warnings.length > 0);

    return results;
  }

  /**
   * Gather enforcement context
   */
  async gatherContext(options = {}) {
    const context = {
      mode: options.mode || 'pre-commit', // pre-commit, pre-merge, ci, manual
      target: options.target || 'HEAD',
      files: {
        changed: [],
        new: [],
        modified: [],
        excluded: []
      },
      analysis: {
        current: null,
        diff: null
      }
    };

    // Get current state analysis
    context.analysis.current = this.changeAnalyzer.analyzeCurrentState();
    
    // Get diff analysis if target specified
    if (context.target !== 'HEAD') {
      context.analysis.diff = this.diffAnalyzer.analyzeDiff(context.target);
    }

    // Categorize files
    context.files.changed = context.analysis.current.categories.needsDocumentation
      .concat(context.analysis.current.categories.hasDocumentation)
      .map(item => item.file);
    
    context.files.new = context.analysis.current.categories.needsDocumentation
      .filter(item => item.status === '??')
      .map(item => item.file);
    
    context.files.modified = context.analysis.current.categories.needsDocumentation
      .filter(item => item.status !== '??')
      .map(item => item.file);

    // Apply exclusion patterns
    context.files.excluded = context.files.changed.filter(file => 
      this.isFileExcluded(file)
    );

    // Remove excluded files from analysis
    ['changed', 'new', 'modified'].forEach(category => {
      context.files[category] = context.files[category].filter(file => 
        !this.isFileExcluded(file)
      );
    });

    return context;
  }

  /**
   * Check if file should be excluded from enforcement
   */
  isFileExcluded(filePath) {
    return this.config.excludePatterns.some(pattern => {
      // Convert glob pattern to regex
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.');
      
      return new RegExp(regexPattern).test(filePath);
    });
  }

  /**
   * Process results from a rule execution
   */
  processRuleResults(results, ruleName, ruleResults, ruleConfig) {
    if (!ruleResults || typeof ruleResults !== 'object') return;

    // Handle different result formats
    if (Array.isArray(ruleResults)) {
      // Array of violations
      ruleResults.forEach(violation => {
        this.addViolation(results, ruleName, violation, ruleConfig);
      });
    } else if (ruleResults.violations) {
      // Object with violations array
      ruleResults.violations.forEach(violation => {
        this.addViolation(results, ruleName, violation, ruleConfig);
      });
    } else if (ruleResults.passed === false) {
      // Simple pass/fail result
      this.addViolation(results, ruleName, {
        message: ruleResults.message || 'Rule validation failed',
        files: ruleResults.files || []
      }, ruleConfig);
    } else if (ruleResults.passed === true) {
      // Rule passed
      results.passed.push({
        rule: ruleName,
        message: ruleResults.message || 'Rule validation passed'
      });
    }
  }

  /**
   * Add violation to results with proper categorization
   */
  addViolation(results, ruleName, violation, ruleConfig) {
    const enhancedViolation = {
      rule: ruleName,
      severity: ruleConfig.severity || 'warning',
      message: violation.message,
      files: violation.files || [],
      suggestions: violation.suggestions || [],
      type: violation.type || 'documentation',
      ...violation
    };

    if (enhancedViolation.severity === 'error') {
      results.violations.push(enhancedViolation);
    } else {
      results.warnings.push(enhancedViolation);
    }
  }

  /**
   * Rule: Check new files have documentation
   */
  async checkNewFileDocumentation(context, ruleConfig) {
    const violations = [];
    
    for (const file of context.files.new) {
      // Check if file type requires documentation
      if (!this.fileRequiresDocumentation(file)) continue;
      
      // Check for exceptions
      if (this.isRuleException(file, ruleConfig.exceptions)) continue;
      
      // Check if documentation exists
      const hasDocumentation = await this.checkFileHasDocumentation(file);
      
      if (!hasDocumentation) {
        violations.push({
          message: `New file requires documentation: ${file}`,
          files: [file],
          suggestions: this.generateDocumentationSuggestions(file),
          type: 'missing_documentation'
        });
      }
    }

    return { violations };
  }

  /**
   * Rule: Check modified files need documentation updates
   */
  async checkModifiedFileDocumentation(context, ruleConfig) {
    const violations = [];
    
    if (!context.analysis.diff) return { violations };

    for (const fileAnalysis of context.analysis.diff.files) {
      if (!context.files.modified.includes(fileAnalysis.file)) continue;
      
      // Determine if changes are significant enough to require docs
      const requiresUpdate = this.assessDocumentationUpdateNeed(
        fileAnalysis, 
        ruleConfig.threshold
      );
      
      if (requiresUpdate) {
        const hasRecentDocUpdate = await this.checkRecentDocumentationUpdate(
          fileAnalysis.file
        );
        
        if (!hasRecentDocUpdate) {
          violations.push({
            message: `Modified file with significant changes may need documentation update: ${fileAnalysis.file}`,
            files: [fileAnalysis.file],
            suggestions: this.generateUpdateSuggestions(fileAnalysis),
            type: 'outdated_documentation'
          });
        }
      }
    }

    return { violations };
  }

  /**
   * Rule: Check public APIs have documentation
   */
  async checkPublicApiDocumentation(context, ruleConfig) {
    const violations = [];
    
    for (const file of context.files.changed) {
      if (!file.match(/\.(ts|tsx|js|jsx)$/)) continue;
      
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf-8');
        const undocumentedExports = this.findUndocumentedPublicApi(content, ruleConfig.patterns);
        
        if (undocumentedExports.length > 0) {
          violations.push({
            message: `Public API exports require documentation in ${file}`,
            files: [file],
            details: undocumentedExports,
            suggestions: [{
              type: 'add_jsdoc',
              description: 'Add JSDoc comments to exported functions and classes',
              example: '/**\n * Function description\n * @param param Description\n * @returns Description\n */'
            }],
            type: 'missing_api_documentation'
          });
        }
      } catch (error) {
        // File might be binary or inaccessible, skip
      }
    }

    return { violations };
  }

  /**
   * Rule: Check documentation quality standards
   */
  async checkDocumentationQuality(context, ruleConfig) {
    const violations = [];
    
    // Find documentation files that have been modified
    const docFiles = context.files.changed.filter(file => 
      file.endsWith('.md') && file.startsWith('docs/')
    );
    
    for (const docFile of docFiles) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, docFile), 'utf-8');
        const qualityIssues = this.assessDocumentationQuality(content, ruleConfig);
        
        if (qualityIssues.length > 0) {
          violations.push({
            message: `Documentation quality issues in ${docFile}`,
            files: [docFile],
            details: qualityIssues,
            suggestions: this.generateQualityImprovements(qualityIssues),
            type: 'quality_issues'
          });
        }
      } catch (error) {
        // Skip if file can't be read
      }
    }

    return { violations };
  }

  /**
   * Rule: Check template structure compliance
   */
  async checkTemplateCompliance(context, ruleConfig) {
    const violations = [];
    
    const docFiles = context.files.changed.filter(file => 
      file.endsWith('.md') && file.startsWith('docs/')
    );
    
    for (const docFile of docFiles) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, docFile), 'utf-8');
        const templateCompliance = this.checkTemplateStructure(content, docFile);
        
        if (!templateCompliance.compliant) {
          violations.push({
            message: `Documentation does not follow template structure: ${docFile}`,
            files: [docFile],
            details: templateCompliance.issues,
            suggestions: [{
              type: 'use_template',
              description: `Use the appropriate template from docs/templates/`,
              template: templateCompliance.suggestedTemplate
            }],
            type: 'template_violation'
          });
        }
      } catch (error) {
        // Skip if file can't be read
      }
    }

    return { violations };
  }

  /**
   * Rule: Check minimum coverage threshold
   */
  async checkCoverageThreshold(context, ruleConfig) {
    const currentCoverage = this.calculateCurrentCoverage(context);
    
    if (currentCoverage < ruleConfig.threshold) {
      return {
        violations: [{
          message: `Documentation coverage ${currentCoverage}% is below minimum threshold ${ruleConfig.threshold}%`,
          files: context.files.new.concat(context.files.modified),
          suggestions: [{
            type: 'improve_coverage',
            description: 'Add documentation for files requiring documentation',
            action: 'Run npm run docs:analyze to see specific files needing documentation'
          }],
          type: 'coverage_threshold'
        }]
      };
    }

    return { passed: true, message: `Documentation coverage ${currentCoverage}% meets threshold` };
  }

  /**
   * Utility methods
   */
  
  fileRequiresDocumentation(filePath) {
    const requiresDocsPaths = [
      /^src\/.*\.(ts|tsx|js|jsx)$/,
      /^api\/.*\.(ts|js)$/,
      /^tools\/.*\.js$/,
      /^scripts\/.*\.(js|sh)$/,
      /package\.json$/,
      /\.config\.(js|ts|json)$/
    ];

    return requiresDocsPaths.some(pattern => pattern.test(filePath));
  }

  isRuleException(filePath, exceptions = []) {
    return exceptions.some(exception => {
      const regexPattern = exception
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.');
      
      return new RegExp(regexPattern).test(filePath);
    });
  }

  async checkFileHasDocumentation(filePath) {
    // Check for related documentation files
    const possibleDocs = this.generatePossibleDocumentationPaths(filePath);
    
    return possibleDocs.some(docPath => 
      fs.existsSync(path.join(this.projectRoot, docPath))
    );
  }

  generatePossibleDocumentationPaths(filePath) {
    const paths = [];
    const basename = path.basename(filePath, path.extname(filePath));
    const dirname = path.dirname(filePath);
    
    // Same directory README
    paths.push(path.join(dirname, 'README.md'));
    
    // Component-specific documentation
    if (filePath.startsWith('src/components/')) {
      const componentName = filePath.split('/')[2];
      paths.push(`docs/components/${componentName.toLowerCase()}.md`);
    }
    
    // API documentation
    if (filePath.includes('api') || filePath.includes('routes')) {
      paths.push('docs/api/README.md');
      paths.push(`docs/api/${basename.toLowerCase()}.md`);
    }
    
    // Tool documentation
    if (filePath.startsWith('tools/')) {
      paths.push(`docs/tools/${basename.toLowerCase()}.md`);
    }
    
    return paths;
  }

  generateDocumentationSuggestions(filePath) {
    const suggestions = [];
    
    if (filePath.startsWith('src/components/')) {
      suggestions.push({
        type: 'create_component_doc',
        description: 'Create component documentation',
        template: 'docs/templates/component-documentation.md',
        location: `docs/components/${path.basename(filePath, path.extname(filePath)).toLowerCase()}.md`
      });
    } else if (filePath.startsWith('tools/')) {
      suggestions.push({
        type: 'create_tool_doc',
        description: 'Create tool documentation',
        template: 'docs/templates/tool-documentation.md',
        location: `docs/tools/${path.basename(filePath, path.extname(filePath)).toLowerCase()}.md`
      });
    } else {
      suggestions.push({
        type: 'create_general_doc',
        description: 'Add documentation for this file',
        location: 'docs/'
      });
    }
    
    return suggestions;
  }

  assessDocumentationUpdateNeed(fileAnalysis, threshold) {
    switch (threshold) {
      case 'minor':
        return fileAnalysis.changes.added > 5 || fileAnalysis.changes.removed > 5;
      case 'significant':
        return fileAnalysis.hasSignificantChanges || 
               fileAnalysis.changes.added > 20 || 
               fileAnalysis.changes.removed > 20;
      case 'major':
        return fileAnalysis.hasBreakingChanges || 
               fileAnalysis.changes.added > 50 || 
               fileAnalysis.changes.removed > 50;
      default:
        return fileAnalysis.hasSignificantChanges;
    }
  }

  async checkRecentDocumentationUpdate(filePath) {
    // This would check if documentation was updated recently
    // For now, return false to trigger documentation update reminders
    return false;
  }

  findUndocumentedPublicApi(content, patterns) {
    const undocumented = [];
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern + '\\s+(\\w+)', 'g');
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        const exportName = match[1];
        const lineIndex = content.substring(0, match.index).split('\n').length;
        
        // Check if there's JSDoc comment above
        const lines = content.split('\n');
        const exportLine = lineIndex - 1;
        const prevLine = exportLine > 0 ? lines[exportLine - 1].trim() : '';
        
        if (!prevLine.includes('/**') && !prevLine.includes('*')) {
          undocumented.push({
            name: exportName,
            line: lineIndex,
            type: pattern
          });
        }
      }
    });
    
    return undocumented;
  }

  assessDocumentationQuality(content, ruleConfig) {
    const issues = [];
    
    // Check minimum length
    if (content.length < ruleConfig.minLength) {
      issues.push({
        type: 'too_short',
        message: `Documentation is too short (${content.length} chars, minimum ${ruleConfig.minLength})`
      });
    }
    
    // Check for examples
    if (ruleConfig.requiresExamples && !content.includes('```')) {
      issues.push({
        type: 'missing_examples',
        message: 'Documentation should include code examples'
      });
    }
    
    // Check for parameter documentation (if applicable)
    if (ruleConfig.requiresParameters && content.includes('function') && !content.includes('@param')) {
      issues.push({
        type: 'missing_parameters',
        message: 'Function documentation should describe parameters'
      });
    }
    
    return issues;
  }

  checkTemplateStructure(content, filePath) {
    const issues = [];
    let suggestedTemplate = 'general-documentation.md';
    
    // Determine expected template based on file path and content
    if (filePath.includes('components/')) {
      suggestedTemplate = 'component-documentation.md';
      // Check for component-specific sections
      if (!content.includes('## Props Interface')) issues.push('Missing Props Interface section');
      if (!content.includes('## Usage Examples')) issues.push('Missing Usage Examples section');
    } else if (filePath.includes('api/')) {
      suggestedTemplate = 'api-documentation.md';
      // Check for API-specific sections
      if (!content.includes('## Endpoints')) issues.push('Missing Endpoints section');
      if (!content.includes('## Authentication')) issues.push('Missing Authentication section');
    } else if (filePath.includes('tools/')) {
      suggestedTemplate = 'tool-documentation.md';
      // Check for tool-specific sections
      if (!content.includes('## Command Line Interface')) issues.push('Missing CLI section');
      if (!content.includes('## Configuration')) issues.push('Missing Configuration section');
    } else if (filePath.includes('reports/') || filePath.includes('analysis')) {
      suggestedTemplate = 'analysis-report-template.md';
      // Check for report-specific sections
      if (!content.includes('## Executive Summary')) issues.push('Missing Executive Summary section');
      if (!content.includes('## Methodology')) issues.push('Missing Methodology section');
      if (!content.includes('## Detailed Findings')) issues.push('Missing Detailed Findings section');
      if (!content.includes('## Recommendations')) issues.push('Missing Recommendations section');
    }
    
    // Universal requirements
    const hasTitle = content.startsWith('#');
    const hasOverview = content.includes('## Overview') || content.includes('## Executive Summary');
    
    if (!hasTitle) issues.push('Missing main title');
    if (!hasOverview && !filePath.includes('reports/')) issues.push('Missing Overview section');
    
    // Check for minimum content quality
    if (content.length < 200) issues.push('Content too brief for meaningful documentation');
    
    return {
      compliant: issues.length === 0,
      issues,
      suggestedTemplate
    };
  }

  calculateCurrentCoverage(context) {
    const total = context.analysis.current.summary.totalFiles;
    const documented = context.analysis.current.summary.hasDocumentation;
    
    return total > 0 ? Math.round((documented / total) * 100) : 0;
  }

  generateQualityImprovements(qualityIssues) {
    return qualityIssues.map(issue => ({
      type: issue.type,
      description: issue.message,
      action: this.getQualityImprovementAction(issue.type)
    }));
  }

  getQualityImprovementAction(issueType) {
    const actions = {
      too_short: 'Expand documentation with more detailed explanations and context',
      missing_examples: 'Add code examples showing how to use the functionality',
      missing_parameters: 'Document all function parameters with types and descriptions'
    };
    
    return actions[issueType] || 'Review and improve documentation quality';
  }

  /**
   * Utility for deep merging configuration objects
   */
  mergeDeep(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Generate enforcement report
   */
  generateReport(results) {
    const report = [];
    
    report.push('# Documentation Enforcement Report');
    report.push('');
    report.push(`**Generated**: ${results.timestamp}`);
    report.push(`**Mode**: ${results.context?.mode || 'unknown'}`);
    report.push('');
    
    // Summary
    report.push('## Summary');
    report.push('');
    report.push(`- **Total Checks**: ${results.summary.total}`);
    report.push(`- **Violations**: ${results.summary.errors}`);
    report.push(`- **Warnings**: ${results.summary.warnings}`);
    report.push(`- **Passed**: ${results.summary.passed}`);
    report.push('');
    
    if (results.enforcement.shouldBlock) {
      report.push('🚫 **ENFORCEMENT ACTION**: Commit/merge should be blocked');
      if (results.enforcement.canOverride) {
        report.push('💡 **Override available** (requires justification)');
      }
    } else {
      report.push('✅ **ENFORCEMENT STATUS**: All checks passed');
    }
    report.push('');
    
    // Violations
    if (results.violations.length > 0) {
      report.push('## Violations (Must Fix)');
      report.push('');
      
      results.violations.forEach((violation, index) => {
        report.push(`### ${index + 1}. ${violation.message}`);
        report.push(`**Rule**: ${violation.rule}`);
        report.push(`**Severity**: ${violation.severity.toUpperCase()}`);
        
        if (violation.files && violation.files.length > 0) {
          report.push('**Files**:');
          violation.files.forEach(file => report.push(`- ${file}`));
        }
        
        if (violation.suggestions && violation.suggestions.length > 0) {
          report.push('**Suggested Actions**:');
          violation.suggestions.forEach(suggestion => {
            report.push(`- ${suggestion.description}`);
            if (suggestion.location) report.push(`  Location: ${suggestion.location}`);
            if (suggestion.template) report.push(`  Template: ${suggestion.template}`);
          });
        }
        
        report.push('');
      });
    }
    
    // Warnings
    if (results.warnings.length > 0) {
      report.push('## Warnings (Recommended)');
      report.push('');
      
      results.warnings.forEach((warning, index) => {
        report.push(`### ${index + 1}. ${warning.message}`);
        report.push(`**Rule**: ${warning.rule}`);
        
        if (warning.files && warning.files.length > 0) {
          report.push('**Files**: ' + warning.files.join(', '));
        }
        
        report.push('');
      });
    }
    
    return report.join('\n');
  }

  /**
   * Save configuration template
   */
  saveConfigurationTemplate(outputPath) {
    const template = {
      "$schema": "./docs/schemas/documentation-rules-schema.json",
      "enabled": true,
      "strictMode": false,
      "rules": this.config.rules,
      "enforcement": this.config.enforcement,
      "excludePatterns": this.config.excludePatterns,
      "output": this.config.output
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
    return outputPath;
  }
}

// CLI interface
if (require.main === module) {
  const ruleEngine = new DocumentationRuleEngine();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'enforce';
  const options = {
    mode: args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'manual',
    target: args.find(arg => arg.startsWith('--target='))?.split('=')[1] || 'HEAD',
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    json: args.includes('--json'),
    quiet: args.includes('--quiet'),
    configTemplate: args.includes('--save-config')
  };
  
  async function run() {
    try {
      if (command === 'enforce') {
        const results = await ruleEngine.enforce(options);
        
        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
        } else if (!options.quiet) {
          console.log(ruleEngine.generateReport(results));
        }
        
        // Save report if output specified
        if (options.output && !options.json) {
          const report = ruleEngine.generateReport(results);
          fs.writeFileSync(options.output, report);
          if (!options.quiet) {
            console.log(`\n📄 Report saved to: ${options.output}`);
          }
        }
        
        // Exit with error code if enforcement should block
        if (results.enforcement.shouldBlock) {
          process.exit(1);
        }
        
      } else if (command === 'config') {
        const configPath = options.output || '.documentation-rules.json';
        ruleEngine.saveConfigurationTemplate(configPath);
        console.log(`Configuration template saved to: ${configPath}`);
        
      } else {
        console.error(`Unknown command: ${command}`);
        console.error('Usage: node rule-engine.js [enforce|config] [options]');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('Error running documentation enforcement:', error.message);
      process.exit(1);
    }
  }
  
  run();
}

module.exports = DocumentationRuleEngine;