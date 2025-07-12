#!/usr/bin/env node
/**
 * Documentation Change Analyzer
 * 
 * Analyzes git changes to identify files that require documentation updates.
 * Part of the ProjectTemplate documentation enforcement system.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ChangeAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.documentationPatterns = {
      // File patterns that typically require documentation
      requiresDocs: [
        /^src\/.*\.(ts|tsx|js|jsx)$/,     // Source code files
        /^tools\/.*\.js$/,                // Tool scripts
        /^scripts\/.*\.(js|sh)$/,         // Scripts
        /^config\/.*\.(json|js|ts)$/,     // Configuration files
        /^api\/.*\.(ts|js)$/,             // API files
        /\.config\.(js|ts|json)$/,        // Config files
        /package\.json$/,                 // Package files (if significant changes)
      ],
      
      // File patterns that are documentation
      isDocumentation: [
        /^docs\/.*\.md$/,
        /^README.*\.md$/,
        /^CHANGELOG.*\.md$/,
        /^CONTRIBUTING\.md$/,
        /^.*\.md$/,                       // Other markdown files
      ],
      
      // File patterns that typically don't need docs
      excludeFromDocs: [
        /^node_modules\//,
        /^\.git\//,
        /^coverage\//,
        /^dist\//,
        /^build\//,
        /^out\//,
        /\.test\.(ts|tsx|js|jsx)$/,       // Test files
        /\.spec\.(ts|tsx|js|jsx)$/,       // Spec files
        /\.stories\.(ts|tsx|js|jsx)$/,    // Storybook files
        /\.(log|tmp|cache)$/,             // Temporary files
        /\.(lock|lockb)$/,                // Lock files
        /^package-lock\.json$/,           // Auto-generated lockfiles
        /\.(metrics|stats|enforcement)\.json$/, // Metrics/data files
        /^\.gitignore$/,                  // Simple git config
        /^\..*\.(json|yaml|yml)$/,        // Hidden config files
        /^\..*$/,                         // Hidden files (most)
      ]
    };
  }

  /**
   * Analyze current git status for documentation gaps
   */
  analyzeCurrentState() {
    const gitStatus = this.getGitStatus();
    const analysis = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: 0,
        modifiedFiles: 0,
        newFiles: 0,
        needsDocumentation: 0,
        hasDocumentation: 0,
        documentationDebt: 0
      },
      categories: {
        needsDocumentation: [],
        hasDocumentation: [],
        excluded: [],
        uncertain: []
      },
      recommendations: []
    };

    // Parse git status output
    gitStatus.forEach(item => {
      analysis.summary.totalFiles++;
      
      const category = this.categorizeFile(item.file, item.status);
      analysis.categories[category.type].push({
        file: item.file,
        status: item.status,
        reason: category.reason,
        priority: category.priority,
        suggestedDocs: category.suggestedDocs
      });

      // Update summary counts
      if (category.type === 'needsDocumentation') {
        analysis.summary.needsDocumentation++;
        if (item.status === '??') analysis.summary.newFiles++;
        else analysis.summary.modifiedFiles++;
      } else if (category.type === 'hasDocumentation') {
        analysis.summary.hasDocumentation++;
      }
    });

    // Calculate documentation debt
    analysis.summary.documentationDebt = analysis.summary.needsDocumentation;

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Get current git status
   */
  getGitStatus() {
    try {
      const output = execSync('git status --porcelain', { 
        encoding: 'utf-8',
        cwd: this.projectRoot 
      });
      
      return output.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const status = line.substring(0, 2).trim();
          const file = line.substring(3);
          return { status, file };
        });
    } catch (error) {
      console.error('Error getting git status:', error.message);
      return [];
    }
  }

  /**
   * Categorize a file for documentation requirements
   */
  categorizeFile(filePath, gitStatus) {
    const fileName = path.basename(filePath);
    const isNewFile = gitStatus === '??';
    
    // Check if file is excluded from documentation requirements
    if (this.matchesPattern(filePath, this.documentationPatterns.excludeFromDocs)) {
      return {
        type: 'excluded',
        reason: 'File type typically excluded from documentation requirements',
        priority: 'none'
      };
    }
    
    // Check if file is documentation itself
    if (this.matchesPattern(filePath, this.documentationPatterns.isDocumentation)) {
      return {
        type: 'hasDocumentation',
        reason: 'File is documentation',
        priority: 'none'
      };
    }
    
    // Check if file requires documentation
    if (this.matchesPattern(filePath, this.documentationPatterns.requiresDocs)) {
      const priority = this.determineDocumentationPriority(filePath, gitStatus);
      
      // Skip files with 'skip' priority
      if (priority === 'skip') {
        return {
          type: 'excluded',
          reason: 'File type does not require documentation',
          priority: 'none'
        };
      }
      
      const suggestedDocs = this.suggestDocumentationLocations(filePath);
      
      return {
        type: 'needsDocumentation',
        reason: 'File type requires documentation',
        priority,
        suggestedDocs
      };
    }
    
    // Uncertain cases
    return {
      type: 'uncertain',
      reason: 'File type requires manual review for documentation needs',
      priority: 'review'
    };
  }

  /**
   * Check if file matches any pattern in a pattern array
   */
  matchesPattern(filePath, patterns) {
    return patterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Determine documentation priority based on file type and change type
   */
  determineDocumentationPriority(filePath, gitStatus) {
    const isNewFile = gitStatus === '??';
    const isSourceCode = /^src\//.test(filePath);
    const isPublicAPI = /^(api|src\/api|src\/components)\//.test(filePath);
    const isTooling = /^(tools|scripts)\//.test(filePath);
    const isConfig = /\.(json|yaml|yml|config\.(js|ts))$/.test(filePath);
    const isVSCodeExtension = /^extensions\//.test(filePath);
    const isTestUtility = /\/(test-utils|testing|__tests__|tests)\//i.test(filePath);
    
    // Skip priority - files that shouldn't require documentation
    if (isConfig && !isNewFile) return 'skip';
    if (isTestUtility) return 'skip';
    
    // Critical priority
    if (isNewFile && isPublicAPI) return 'critical';
    if (isVSCodeExtension && isNewFile) return 'critical';
    
    // High priority
    if (isNewFile && isSourceCode) return 'high';
    if (isPublicAPI) return 'high';
    
    // Medium priority
    if (isNewFile && isTooling) return 'medium';
    if (isSourceCode) return 'medium';
    if (isVSCodeExtension) return 'medium';
    
    // Low priority
    if (isTooling) return 'low';
    if (isConfig && isNewFile) return 'low';
    
    return 'low';
  }

  /**
   * Suggest documentation locations for a file
   */
  suggestDocumentationLocations(filePath) {
    const suggestions = [];
    
    // Component documentation
    if (/^src\/components\//.test(filePath)) {
      const componentName = filePath.split('/')[2];
      suggestions.push({
        type: 'component',
        location: `docs/components/${componentName.toLowerCase()}.md`,
        description: 'Component documentation with usage examples',
        template: 'docs/templates/component-documentation.md'
      });
    }
    
    // API documentation
    if (/^(api|src\/api)\//.test(filePath)) {
      suggestions.push({
        type: 'api',
        location: 'docs/api/',
        description: 'API endpoint documentation',
        template: 'docs/templates/api-documentation.md'
      });
    }
    
    // Tool documentation
    if (/^tools\//.test(filePath)) {
      const toolName = path.basename(filePath, path.extname(filePath));
      suggestions.push({
        type: 'tool',
        location: `docs/tools/${toolName}.md`,
        description: 'Tool usage and configuration documentation',
        template: 'docs/templates/tool-documentation.md'
      });
    }
    
    // Script documentation
    if (/^scripts\//.test(filePath)) {
      suggestions.push({
        type: 'script',
        location: 'docs/scripts/README.md',
        description: 'Script documentation in scripts section',
        template: 'docs/templates/tool-documentation.md'
      });
    }
    
    // Configuration documentation
    if (/config/.test(filePath) || /\.config\./.test(filePath)) {
      suggestions.push({
        type: 'config',
        location: 'docs/configuration/',
        description: 'Configuration documentation',
        template: 'docs/templates/configuration-documentation.md'
      });
    }
    
    // Analysis reports
    if (filePath.includes('analysis') || filePath.includes('report') || filePath.includes('audit')) {
      suggestions.push({
        type: 'report',
        location: 'docs/reports/',
        description: 'Analysis report with findings and recommendations',
        template: 'docs/templates/analysis-report-template.md'
      });
    }
    
    // Default documentation location
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'general',
        location: 'docs/',
        description: 'General documentation location'
      });
    }
    
    return suggestions;
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // High priority items
    const criticalItems = analysis.categories.needsDocumentation
      .filter(item => item.priority === 'critical');
    
    if (criticalItems.length > 0) {
      recommendations.push({
        type: 'immediate_action',
        priority: 'critical',
        title: `${criticalItems.length} critical files need immediate documentation`,
        description: 'These files are public APIs or core components requiring documentation before merge',
        files: criticalItems.map(item => item.file),
        action: 'Create documentation before committing'
      });
    }
    
    // New files without documentation
    const newFiles = analysis.categories.needsDocumentation
      .filter(item => item.status === '??');
    
    if (newFiles.length > 0) {
      recommendations.push({
        type: 'new_files',
        priority: 'high',
        title: `${newFiles.length} new files lack documentation`,
        description: 'New files should include documentation explaining their purpose and usage',
        files: newFiles.map(item => item.file),
        action: 'Add documentation for new files'
      });
    }
    
    // Documentation debt threshold
    if (analysis.summary.documentationDebt > 10) {
      recommendations.push({
        type: 'debt_threshold',
        priority: 'medium',
        title: 'High documentation debt detected',
        description: `${analysis.summary.documentationDebt} files need documentation updates`,
        action: 'Plan documentation sprint to reduce debt'
      });
    }
    
    // Documentation enforcement suggestion
    if (analysis.summary.needsDocumentation > 5) {
      recommendations.push({
        type: 'enforcement',
        priority: 'medium',
        title: 'Consider enabling documentation enforcement',
        description: 'High number of undocumented changes suggests need for automated enforcement',
        action: 'Implement pre-commit documentation checks'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate detailed report
   */
  generateReport(analysis) {
    const report = [];
    
    report.push('# Documentation Analysis Report');
    report.push('');
    report.push(`**Generated**: ${analysis.timestamp}`);
    report.push('');
    
    // Summary
    report.push('## Summary');
    report.push('');
    report.push(`- **Total Files Analyzed**: ${analysis.summary.totalFiles}`);
    report.push(`- **Files Needing Documentation**: ${analysis.summary.needsDocumentation}`);
    report.push(`- **Documentation Debt**: ${analysis.summary.documentationDebt} files`);
    report.push(`- **New Files**: ${analysis.summary.newFiles}`);
    report.push(`- **Modified Files**: ${analysis.summary.modifiedFiles}`);
    report.push('');
    
    // Recommendations
    if (analysis.recommendations.length > 0) {
      report.push('## Immediate Actions Required');
      report.push('');
      
      analysis.recommendations.forEach(rec => {
        report.push(`### ${rec.title}`);
        report.push(`**Priority**: ${rec.priority.toUpperCase()}`);
        report.push(`**Description**: ${rec.description}`);
        report.push(`**Action**: ${rec.action}`);
        
        if (rec.files && rec.files.length > 0) {
          report.push('**Files**:');
          rec.files.forEach(file => report.push(`- ${file}`));
        }
        report.push('');
      });
    }
    
    // Detailed breakdown
    report.push('## Detailed Analysis');
    report.push('');
    
    // Files needing documentation
    if (analysis.categories.needsDocumentation.length > 0) {
      report.push('### Files Requiring Documentation');
      report.push('');
      
      analysis.categories.needsDocumentation
        .sort((a, b) => this.priorityWeight(b.priority) - this.priorityWeight(a.priority))
        .forEach(item => {
          report.push(`#### ${item.file}`);
          report.push(`- **Status**: ${item.status}`);
          report.push(`- **Priority**: ${item.priority}`);
          report.push(`- **Reason**: ${item.reason}`);
          
          if (item.suggestedDocs && item.suggestedDocs.length > 0) {
            report.push('- **Suggested Documentation**:');
            item.suggestedDocs.forEach(suggestion => {
              report.push(`  - **${suggestion.type}**: ${suggestion.location} - ${suggestion.description}`);
            });
          }
          report.push('');
        });
    }
    
    // Files requiring review
    if (analysis.categories.uncertain.length > 0) {
      report.push('### Files Requiring Manual Review');
      report.push('');
      analysis.categories.uncertain.forEach(item => {
        report.push(`- **${item.file}** (${item.status}) - ${item.reason}`);
      });
      report.push('');
    }
    
    return report.join('\n');
  }

  /**
   * Get priority weight for sorting
   */
  priorityWeight(priority) {
    const weights = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
    return weights[priority] || 0;
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
  const analyzer = new ChangeAnalyzer();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 
                    'docs/reports/documentation-analysis.md';
  const jsonOutput = args.includes('--json');
  const quiet = args.includes('--quiet');
  
  try {
    const analysis = analyzer.analyzeCurrentState();
    
    if (jsonOutput) {
      console.log(JSON.stringify(analysis, null, 2));
    } else if (!quiet) {
      console.log(analyzer.generateReport(analysis));
    }
    
    // Save to file if output specified
    if (!jsonOutput) {
      const savedPath = analyzer.saveAnalysis(analysis, outputFile);
      if (!quiet) {
        console.log(`\n📄 Analysis saved to: ${savedPath}`);
      }
    }
    
    // Exit with error code if there are critical issues
    const criticalIssues = analysis.recommendations
      .filter(rec => rec.priority === 'critical').length;
    
    if (criticalIssues > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error analyzing documentation:', error.message);
    process.exit(1);
  }
}

module.exports = ChangeAnalyzer;