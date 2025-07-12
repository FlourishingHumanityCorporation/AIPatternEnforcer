#!/usr/bin/env node
/**
 * Git Diff Analyzer for Documentation Enforcement
 * 
 * Analyzes git diffs to determine the significance of changes and
 * documentation requirements based on change patterns.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitDiffAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.changePatterns = {
      // Patterns that indicate significant changes requiring documentation
      significantChanges: [
        // Function/method additions
        /^\+.*(?:function|const|let|var)\s+(\w+)/,
        /^\+.*(?:export\s+(?:default\s+)?(?:function|const|class))\s+(\w+)/,
        
        // Class additions
        /^\+.*class\s+(\w+)/,
        /^\+.*interface\s+(\w+)/,
        /^\+.*type\s+(\w+)/,
        
        // API endpoints
        /^\+.*(?:app|router|server)\.(?:get|post|put|delete|patch)\(/,
        /^\+.*(?:@Get|@Post|@Put|@Delete|@Patch)\(/,
        
        // Configuration changes
        /^\+.*(?:config|Config|configuration|settings)/,
        
        // Import/export changes
        /^\+.*(?:import|export).*from/,
        /^\+.*module\.exports/,
        
        // React components
        /^\+.*(?:export\s+(?:default\s+)?(?:function|const))\s+(\w+).*(?:JSX\.Element|React\.)/,
        
        // Hook definitions
        /^\+.*(?:export\s+(?:default\s+)?(?:function|const))\s+(use\w+)/,
        
        // Database schemas/models
        /^\+.*(?:schema|model|entity|table)/i,
        
        // Package.json changes (dependencies)
        /^\+.*"(?:dependencies|devDependencies|peerDependencies)"/,
      ],
      
      // Patterns for breaking changes
      breakingChanges: [
        // Function signature changes
        /^-.*function\s+(\w+)\s*\([^)]*\)\s*{/,
        /^\+.*function\s+(\w+)\s*\([^)]*\)\s*{/,
        
        // API endpoint changes
        /^-.*(?:app|router)\.(?:get|post|put|delete)\(/,
        
        // Export removals
        /^-.*export.*(?:function|const|class|interface|type)/,
        
        // Configuration removals
        /^-.*"[^"]+"\s*:/,
      ],
      
      // Minor changes that typically don't need documentation
      minorChanges: [
        // Comments
        /^\+\s*(?:\/\/|\/\*|\*)/,
        /^-\s*(?:\/\/|\/\*|\*)/,
        
        // Whitespace
        /^\+\s*$/,
        /^-\s*$/,
        
        // Console logs (temporary)
        /^\+.*console\.(log|debug|info|warn|error)/,
        
        // Test changes
        /^\+.*(?:test|it|describe|expect)\(/,
        /^\+.*\.(?:test|spec)\./,
        
        // Documentation changes
        /^\+.*\.md/,
        
        // Linting fixes
        /^\+.*(?:eslint-disable|prettier-ignore)/,
      ]
    };
  }

  /**
   * Analyze git diff for documentation requirements
   */
  analyzeDiff(target = 'HEAD') {
    const analysis = {
      timestamp: new Date().toISOString(),
      target,
      summary: {
        totalFiles: 0,
        significantChanges: 0,
        breakingChanges: 0,
        minorChanges: 0,
        documentationRequired: 0
      },
      files: [],
      recommendations: []
    };

    try {
      // Get list of changed files
      const changedFiles = this.getChangedFiles(target);
      analysis.summary.totalFiles = changedFiles.length;

      // Analyze each file
      changedFiles.forEach(file => {
        const fileAnalysis = this.analyzeFile(file, target);
        analysis.files.push(fileAnalysis);
        
        // Update summary
        if (fileAnalysis.hasSignificantChanges) analysis.summary.significantChanges++;
        if (fileAnalysis.hasBreakingChanges) analysis.summary.breakingChanges++;
        if (fileAnalysis.hasMinorChangesOnly) analysis.summary.minorChanges++;
        if (fileAnalysis.requiresDocumentation) analysis.summary.documentationRequired++;
      });

      // Generate recommendations
      analysis.recommendations = this.generateDiffRecommendations(analysis);

    } catch (error) {
      console.error('Error analyzing git diff:', error.message);
    }

    return analysis;
  }

  /**
   * Get list of changed files
   */
  getChangedFiles(target) {
    try {
      const output = execSync(`git diff --name-only ${target}`, {
        encoding: 'utf-8',
        cwd: this.projectRoot
      });
      
      return output.split('\n').filter(line => line.trim());
    } catch (error) {
      // Fallback to git status for untracked files
      const output = execSync('git status --porcelain', {
        encoding: 'utf-8',
        cwd: this.projectRoot
      });
      
      return output.split('\n')
        .filter(line => line.trim())
        .map(line => line.substring(3));
    }
  }

  /**
   * Analyze a specific file for documentation requirements
   */
  analyzeFile(filePath, target) {
    const analysis = {
      file: filePath,
      changes: {
        added: 0,
        removed: 0,
        modified: 0
      },
      significantChanges: [],
      breakingChanges: [],
      minorChanges: [],
      hasSignificantChanges: false,
      hasBreakingChanges: false,
      hasMinorChangesOnly: false,
      requiresDocumentation: false,
      documentationSuggestions: []
    };

    try {
      // Get diff for this file
      const diff = execSync(`git diff ${target} -- "${filePath}"`, {
        encoding: 'utf-8',
        cwd: this.projectRoot
      });

      // Analyze diff lines
      const lines = diff.split('\n');
      lines.forEach(line => {
        this.analyzeDiffLine(line, analysis);
      });

      // Determine documentation requirements
      analysis.hasSignificantChanges = analysis.significantChanges.length > 0;
      analysis.hasBreakingChanges = analysis.breakingChanges.length > 0;
      analysis.hasMinorChangesOnly = analysis.minorChanges.length > 0 && 
                                    !analysis.hasSignificantChanges && 
                                    !analysis.hasBreakingChanges;
      
      analysis.requiresDocumentation = analysis.hasSignificantChanges || 
                                     analysis.hasBreakingChanges ||
                                     this.fileRequiresDocumentation(filePath);

      // Generate documentation suggestions
      if (analysis.requiresDocumentation) {
        analysis.documentationSuggestions = this.generateDocumentationSuggestions(
          filePath, 
          analysis
        );
      }

    } catch (error) {
      // File might be new or binary
      analysis.changes.added = 1;
      analysis.requiresDocumentation = this.fileRequiresDocumentation(filePath);
    }

    return analysis;
  }

  /**
   * Analyze a single diff line
   */
  analyzeDiffLine(line, analysis) {
    // Count changes
    if (line.startsWith('+') && !line.startsWith('+++')) {
      analysis.changes.added++;
      
      // Check for significant patterns
      this.changePatterns.significantChanges.forEach(pattern => {
        const match = line.match(pattern);
        if (match) {
          analysis.significantChanges.push({
            type: 'addition',
            line: line.substring(1).trim(),
            pattern: pattern.source,
            extracted: match[1] || match[0]
          });
        }
      });

      // Check for minor changes
      this.changePatterns.minorChanges.forEach(pattern => {
        if (pattern.test(line)) {
          analysis.minorChanges.push({
            type: 'minor_addition',
            line: line.substring(1).trim()
          });
        }
      });
      
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      analysis.changes.removed++;
      
      // Check for breaking changes
      this.changePatterns.breakingChanges.forEach(pattern => {
        const match = line.match(pattern);
        if (match) {
          analysis.breakingChanges.push({
            type: 'removal',
            line: line.substring(1).trim(),
            pattern: pattern.source,
            extracted: match[1] || match[0]
          });
        }
      });
    }
  }

  /**
   * Check if file type requires documentation
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

  /**
   * Generate documentation suggestions based on file analysis
   */
  generateDocumentationSuggestions(filePath, analysis) {
    const suggestions = [];

    // API documentation for breaking changes
    if (analysis.hasBreakingChanges) {
      suggestions.push({
        type: 'breaking_changes',
        priority: 'critical',
        location: 'CHANGELOG.md',
        description: 'Document breaking changes and migration guide',
        changes: analysis.breakingChanges
      });
    }

    // Function/component documentation
    const newFunctions = analysis.significantChanges.filter(change => 
      change.pattern.includes('function') || change.pattern.includes('const')
    );
    
    if (newFunctions.length > 0) {
      suggestions.push({
        type: 'function_documentation',
        priority: 'high',
        location: this.suggestDocLocation(filePath),
        description: 'Document new functions and their usage',
        functions: newFunctions.map(f => f.extracted)
      });
    }

    // API endpoint documentation
    const newEndpoints = analysis.significantChanges.filter(change =>
      change.pattern.includes('get|post|put|delete')
    );
    
    if (newEndpoints.length > 0) {
      suggestions.push({
        type: 'api_documentation',
        priority: 'critical',
        location: 'docs/api/',
        description: 'Document new API endpoints with examples',
        endpoints: newEndpoints
      });
    }

    // Configuration documentation
    if (filePath.includes('config') || filePath.includes('package.json')) {
      suggestions.push({
        type: 'configuration',
        priority: 'medium',
        location: 'docs/configuration/',
        description: 'Update configuration documentation'
      });
    }

    return suggestions;
  }

  /**
   * Suggest documentation location for a file
   */
  suggestDocLocation(filePath) {
    if (filePath.startsWith('src/components/')) {
      const componentName = filePath.split('/')[2];
      return `docs/components/${componentName.toLowerCase()}.md`;
    }
    
    if (filePath.startsWith('src/api/') || filePath.startsWith('api/')) {
      return 'docs/api/';
    }
    
    if (filePath.startsWith('tools/')) {
      const toolName = path.basename(filePath, path.extname(filePath));
      return `docs/tools/${toolName}.md`;
    }
    
    if (filePath.startsWith('scripts/')) {
      return 'docs/scripts/README.md';
    }
    
    return 'docs/';
  }

  /**
   * Generate recommendations based on diff analysis
   */
  generateDiffRecommendations(analysis) {
    const recommendations = [];

    // Critical: Breaking changes
    if (analysis.summary.breakingChanges > 0) {
      recommendations.push({
        type: 'breaking_changes',
        priority: 'critical',
        title: `${analysis.summary.breakingChanges} files contain breaking changes`,
        description: 'Breaking changes require immediate documentation and migration guides',
        action: 'Update CHANGELOG.md and create migration documentation',
        files: analysis.files.filter(f => f.hasBreakingChanges).map(f => f.file)
      });
    }

    // High: Significant changes
    if (analysis.summary.significantChanges > 0) {
      recommendations.push({
        type: 'significant_changes',
        priority: 'high',
        title: `${analysis.summary.significantChanges} files have significant changes`,
        description: 'Significant changes should be documented before merge',
        action: 'Add documentation for new functions, components, and APIs',
        files: analysis.files.filter(f => f.hasSignificantChanges).map(f => f.file)
      });
    }

    // Medium: High documentation debt
    if (analysis.summary.documentationRequired > 5) {
      recommendations.push({
        type: 'documentation_debt',
        priority: 'medium',
        title: 'High documentation debt in this changeset',
        description: `${analysis.summary.documentationRequired} files require documentation updates`,
        action: 'Plan documentation update before merge'
      });
    }

    // Enforcement recommendation
    if (analysis.summary.documentationRequired > 3) {
      recommendations.push({
        type: 'enforcement_needed',
        priority: 'medium',
        title: 'Consider pre-commit documentation enforcement',
        description: 'Multiple files requiring documentation suggest need for automated checks',
        action: 'Enable pre-commit documentation validation'
      });
    }

    return recommendations;
  }

  /**
   * Generate comprehensive report
   */
  generateReport(analysis) {
    const report = [];
    
    report.push('# Git Diff Documentation Analysis');
    report.push('');
    report.push(`**Generated**: ${analysis.timestamp}`);
    report.push(`**Target**: ${analysis.target}`);
    report.push('');
    
    // Summary
    report.push('## Summary');
    report.push('');
    report.push(`- **Total Files Changed**: ${analysis.summary.totalFiles}`);
    report.push(`- **Files with Significant Changes**: ${analysis.summary.significantChanges}`);
    report.push(`- **Files with Breaking Changes**: ${analysis.summary.breakingChanges}`);
    report.push(`- **Files Requiring Documentation**: ${analysis.summary.documentationRequired}`);
    report.push('');

    // Recommendations
    if (analysis.recommendations.length > 0) {
      report.push('## Recommendations');
      report.push('');
      
      analysis.recommendations.forEach(rec => {
        report.push(`### ${rec.title}`);
        report.push(`**Priority**: ${rec.priority.toUpperCase()}`);
        report.push(`**Description**: ${rec.description}`);
        report.push(`**Action**: ${rec.action}`);
        
        if (rec.files && rec.files.length > 0) {
          report.push('**Affected Files**:');
          rec.files.forEach(file => report.push(`- ${file}`));
        }
        report.push('');
      });
    }

    // File analysis
    const requiresDoc = analysis.files.filter(f => f.requiresDocumentation);
    if (requiresDoc.length > 0) {
      report.push('## Files Requiring Documentation Updates');
      report.push('');
      
      requiresDoc.forEach(file => {
        report.push(`### ${file.file}`);
        
        if (file.hasBreakingChanges) {
          report.push('**⚠️ BREAKING CHANGES DETECTED**');
          file.breakingChanges.forEach(change => {
            report.push(`- ${change.line}`);
          });
        }
        
        if (file.hasSignificantChanges) {
          report.push('**Significant Changes**:');
          file.significantChanges.forEach(change => {
            report.push(`- ${change.type}: ${change.extracted || change.line}`);
          });
        }
        
        if (file.documentationSuggestions.length > 0) {
          report.push('**Documentation Suggestions**:');
          file.documentationSuggestions.forEach(suggestion => {
            report.push(`- **${suggestion.type}** (${suggestion.priority}): ${suggestion.description}`);
            report.push(`  Location: ${suggestion.location}`);
          });
        }
        
        report.push(`**Changes**: +${file.changes.added} -${file.changes.removed}`);
        report.push('');
      });
    }

    return report.join('\n');
  }

  /**
   * Save analysis to file
   */
  saveAnalysis(analysis, outputPath) {
    const report = this.generateReport(analysis);
    fs.writeFileSync(outputPath, report);
    return outputPath;
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new GitDiffAnalyzer();
  
  const args = process.argv.slice(2);
  const target = args.find(arg => !arg.startsWith('--')) || 'HEAD';
  const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 
                    'docs/reports/git-diff-analysis.md';
  const jsonOutput = args.includes('--json');
  const quiet = args.includes('--quiet');
  
  try {
    const analysis = analyzer.analyzeDiff(target);
    
    if (jsonOutput) {
      console.log(JSON.stringify(analysis, null, 2));
    } else if (!quiet) {
      console.log(analyzer.generateReport(analysis));
    }
    
    // Save to file
    if (!jsonOutput) {
      const savedPath = analyzer.saveAnalysis(analysis, outputFile);
      if (!quiet) {
        console.log(`\n📄 Analysis saved to: ${savedPath}`);
      }
    }
    
    // Exit with error if critical issues found
    const criticalIssues = analysis.recommendations
      .filter(rec => rec.priority === 'critical').length;
    
    if (criticalIssues > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error running git diff analysis:', error.message);
    process.exit(1);
  }
}

module.exports = GitDiffAnalyzer;