#!/usr/bin/env node
/**
 * Documentation Metrics Tracker
 * 
 * Tracks documentation coverage, debt, and trends over time.
 * Provides baseline metrics and progress monitoring.
 */

const fs = require('fs');
const path = require('path');
const ChangeAnalyzer = require('./change-analyzer');
const GitDiffAnalyzer = require('./git-diff-analyzer');

class DocumentationMetricsTracker {
  constructor() {
    this.projectRoot = process.cwd();
    this.metricsPath = path.join(this.projectRoot, 'tools/metrics/documentation-metrics.json');
    this.historyPath = path.join(this.projectRoot, 'tools/metrics/documentation-history.json');
    this.changeAnalyzer = new ChangeAnalyzer();
    this.diffAnalyzer = new GitDiffAnalyzer();
    
    // Ensure metrics directory exists
    const metricsDir = path.dirname(this.metricsPath);
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }
  }

  /**
   * Generate comprehensive documentation metrics
   */
  generateMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      project: {
        name: this.getProjectName(),
        lastCommit: this.getLastCommit(),
        branch: this.getCurrentBranch()
      },
      coverage: {},
      debt: {},
      quality: {},
      trends: {},
      recommendations: []
    };

    // Get current state analysis
    const currentState = this.changeAnalyzer.analyzeCurrentState();
    const diffAnalysis = this.getDiffAnalysis();
    
    // Calculate coverage metrics
    metrics.coverage = this.calculateCoverage(currentState);
    
    // Calculate debt metrics
    metrics.debt = this.calculateDebt(currentState, diffAnalysis);
    
    // Calculate quality metrics
    metrics.quality = this.calculateQuality();
    
    // Calculate trends (if history exists)
    metrics.trends = this.calculateTrends();
    
    // Generate recommendations
    metrics.recommendations = this.generateMetricsRecommendations(metrics);

    return metrics;
  }

  /**
   * Calculate documentation coverage metrics
   */
  calculateCoverage(currentState) {
    const total = currentState.summary.totalFiles;
    const documented = currentState.summary.hasDocumentation;
    const needsDoc = currentState.summary.needsDocumentation;
    
    const coverage = {
      overall: {
        total: total,
        documented: documented,
        undocumented: needsDoc,
        percentage: total > 0 ? Math.round((documented / total) * 100) : 0
      },
      byType: this.calculateCoverageByType(currentState),
      byPriority: this.calculateCoverageByPriority(currentState),
      targets: {
        minimum: 80, // Project minimum
        target: 90,  // Target coverage
        excellent: 95 // Excellent coverage
      }
    };

    // Add coverage status
    coverage.status = this.getCoverageStatus(coverage.overall.percentage, coverage.targets);
    
    return coverage;
  }

  /**
   * Calculate coverage by file type
   */
  calculateCoverageByType(currentState) {
    const types = {
      components: { pattern: /^src\/components\//, total: 0, documented: 0 },
      api: { pattern: /^(api|src\/api)\//, total: 0, documented: 0 },
      tools: { pattern: /^tools\//, total: 0, documented: 0 },
      scripts: { pattern: /^scripts\//, total: 0, documented: 0 },
      configs: { pattern: /config|\.config\./, total: 0, documented: 0 },
      other: { pattern: /./, total: 0, documented: 0 }
    };

    // Count files by type
    [...currentState.categories.needsDocumentation, 
     ...currentState.categories.hasDocumentation,
     ...currentState.categories.excluded].forEach(item => {
      let classified = false;
      
      for (const [typeName, typeConfig] of Object.entries(types)) {
        if (typeConfig.pattern.test(item.file)) {
          typeConfig.total++;
          if (currentState.categories.hasDocumentation.includes(item)) {
            typeConfig.documented++;
          }
          classified = true;
          break;
        }
      }
      
      if (!classified) {
        types.other.total++;
        if (currentState.categories.hasDocumentation.includes(item)) {
          types.other.documented++;
        }
      }
    });

    // Calculate percentages
    Object.keys(types).forEach(type => {
      const config = types[type];
      config.percentage = config.total > 0 ? 
        Math.round((config.documented / config.total) * 100) : 0;
    });

    return types;
  }

  /**
   * Calculate coverage by priority
   */
  calculateCoverageByPriority(currentState) {
    const priorities = {
      critical: { total: 0, documented: 0 },
      high: { total: 0, documented: 0 },
      medium: { total: 0, documented: 0 },
      low: { total: 0, documented: 0 }
    };

    currentState.categories.needsDocumentation.forEach(item => {
      if (item.priority && priorities[item.priority]) {
        priorities[item.priority].total++;
      }
    });

    // Calculate percentages
    Object.keys(priorities).forEach(priority => {
      const config = priorities[priority];
      config.percentage = config.total > 0 ? 
        Math.round((config.documented / config.total) * 100) : 0;
    });

    return priorities;
  }

  /**
   * Calculate documentation debt metrics
   */
  calculateDebt(currentState, diffAnalysis) {
    const debt = {
      total: currentState.summary.documentationDebt,
      byPriority: {
        critical: currentState.categories.needsDocumentation.filter(i => i.priority === 'critical').length,
        high: currentState.categories.needsDocumentation.filter(i => i.priority === 'high').length,
        medium: currentState.categories.needsDocumentation.filter(i => i.priority === 'medium').length,
        low: currentState.categories.needsDocumentation.filter(i => i.priority === 'low').length
      },
      newFiles: currentState.summary.newFiles,
      modifiedFiles: currentState.summary.modifiedFiles,
      estimatedHours: this.calculateEstimatedEffort(currentState),
      trends: this.getDebtTrends()
    };

    // Add diff analysis if available
    if (diffAnalysis) {
      debt.changeAnalysis = {
        significantChanges: diffAnalysis.summary.significantChanges,
        breakingChanges: diffAnalysis.summary.breakingChanges,
        requiresImmediate: diffAnalysis.summary.documentationRequired
      };
    }

    return debt;
  }

  /**
   * Calculate estimated effort for documentation updates
   */
  calculateEstimatedEffort(currentState) {
    const effortMap = {
      critical: 2,  // 2 hours per critical item
      high: 1,      // 1 hour per high priority item
      medium: 0.5,  // 30 minutes per medium priority item
      low: 0.25     // 15 minutes per low priority item
    };

    let totalHours = 0;
    currentState.categories.needsDocumentation.forEach(item => {
      totalHours += effortMap[item.priority] || effortMap.medium;
    });

    return Math.round(totalHours * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate documentation quality metrics
   */
  calculateQuality() {
    const quality = {
      standards: {
        hasTemplates: this.checkForTemplates(),
        hasStyleGuide: this.checkForStyleGuide(),
        hasEnforcement: this.checkForEnforcement(),
        score: 0
      },
      consistency: {
        fileNaming: this.checkFileNamingConsistency(),
        structureConsistency: this.checkStructureConsistency(),
        score: 0
      },
      completeness: {
        hasExamples: this.checkForExamples(),
        hasAPIDoc: this.checkForAPIDocumentation(),
        hasSetupGuides: this.checkForSetupGuides(),
        score: 0
      }
    };

    // Calculate quality scores
    quality.standards.score = this.calculateQualityScore(quality.standards);
    quality.consistency.score = this.calculateQualityScore(quality.consistency);
    quality.completeness.score = this.calculateQualityScore(quality.completeness);
    
    quality.overall = Math.round(
      (quality.standards.score + quality.consistency.score + quality.completeness.score) / 3
    );

    return quality;
  }

  /**
   * Calculate quality score from boolean flags
   */
  calculateQualityScore(section) {
    const values = Object.values(section).filter(v => typeof v === 'boolean');
    const trueCount = values.filter(v => v).length;
    return values.length > 0 ? Math.round((trueCount / values.length) * 100) : 0;
  }

  /**
   * Check for documentation templates
   */
  checkForTemplates() {
    const templatePaths = [
      'docs/templates/',
      'templates/',
      '.github/ISSUE_TEMPLATE/',
      '.github/PULL_REQUEST_TEMPLATE/'
    ];
    
    return templatePaths.some(templatePath => 
      fs.existsSync(path.join(this.projectRoot, templatePath))
    );
  }

  /**
   * Check for style guide
   */
  checkForStyleGuide() {
    const styleGuides = [
      'docs/style-guide.md',
      'docs/writing-guide.md',
      'docs/documentation-standards.md',
      'CONTRIBUTING.md'
    ];
    
    return styleGuides.some(guide => 
      fs.existsSync(path.join(this.projectRoot, guide))
    );
  }

  /**
   * Check for enforcement tools
   */
  checkForEnforcement() {
    const enforcementFiles = [
      'tools/enforcement/',
      '.pre-commit-config.yaml',
      '.husky/pre-commit'
    ];
    
    return enforcementFiles.some(file => 
      fs.existsSync(path.join(this.projectRoot, file))
    );
  }

  /**
   * Check for examples in documentation
   */
  checkForExamples() {
    try {
      const docsPath = path.join(this.projectRoot, 'docs');
      if (!fs.existsSync(docsPath)) return false;
      
      const hasExamples = this.searchForExamples(docsPath);
      return hasExamples;
    } catch {
      return false;
    }
  }

  /**
   * Search for example content in docs
   */
  searchForExamples(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (this.searchForExamples(filePath)) return true;
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (/```|example|Example|EXAMPLE/.test(content)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Check for API documentation
   */
  checkForAPIDocumentation() {
    const apiDocPaths = [
      'docs/api/',
      'docs/API.md',
      'api-docs/',
      'swagger.json',
      'openapi.yaml'
    ];
    
    return apiDocPaths.some(docPath => 
      fs.existsSync(path.join(this.projectRoot, docPath))
    );
  }

  /**
   * Check for setup guides
   */
  checkForSetupGuides() {
    const setupFiles = [
      'README.md',
      'SETUP.md',
      'docs/setup.md',
      'docs/installation.md',
      'docs/getting-started.md'
    ];
    
    return setupFiles.some(file => 
      fs.existsSync(path.join(this.projectRoot, file))
    );
  }

  /**
   * Check file naming consistency
   */
  checkFileNamingConsistency() {
    // Simple heuristic: check if README files follow consistent naming
    const readmeVariants = ['README.md', 'readme.md', 'Readme.md'];
    const foundVariants = readmeVariants.filter(variant => 
      fs.existsSync(path.join(this.projectRoot, variant))
    );
    
    return foundVariants.length <= 1; // Consistent if only one variant found
  }

  /**
   * Check structure consistency
   */
  checkStructureConsistency() {
    // Check if docs follow a consistent structure
    const docsPath = path.join(this.projectRoot, 'docs');
    if (!fs.existsSync(docsPath)) return false;
    
    try {
      const entries = fs.readdirSync(docsPath);
      const hasGuides = entries.includes('guides');
      const hasAPI = entries.includes('api');
      const hasArchitecture = entries.includes('architecture');
      
      return hasGuides || hasAPI || hasArchitecture; // Has some structure
    } catch {
      return false;
    }
  }

  /**
   * Calculate trends from historical data
   */
  calculateTrends() {
    if (!fs.existsSync(this.historyPath)) {
      return { available: false, message: 'No historical data available' };
    }

    try {
      const history = JSON.parse(fs.readFileSync(this.historyPath, 'utf-8'));
      const recent = history.slice(-5); // Last 5 entries
      
      if (recent.length < 2) {
        return { available: false, message: 'Insufficient historical data' };
      }

      const trends = {
        available: true,
        coverage: this.calculateTrend(recent, 'coverage.overall.percentage'),
        debt: this.calculateTrend(recent, 'debt.total'),
        quality: this.calculateTrend(recent, 'quality.overall'),
        period: {
          from: recent[0].timestamp,
          to: recent[recent.length - 1].timestamp,
          entries: recent.length
        }
      };

      return trends;
    } catch (error) {
      return { available: false, message: 'Error reading historical data' };
    }
  }

  /**
   * Calculate trend for a specific metric
   */
  calculateTrend(data, metricPath) {
    const values = data.map(entry => this.getNestedValue(entry, metricPath)).filter(v => v !== null);
    
    if (values.length < 2) return { trend: 'unknown', change: 0 };
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const changePercent = Math.round((change / first) * 100);
    
    let trend = 'stable';
    if (change > 0) trend = 'improving';
    if (change < 0) trend = 'declining';
    
    return {
      trend,
      change: changePercent,
      current: last,
      previous: first,
      values
    };
  }

  /**
   * Get nested object value by path
   */
  getNestedValue(obj, path) {
    try {
      return path.split('.').reduce((current, key) => current[key], obj);
    } catch {
      return null;
    }
  }

  /**
   * Get debt trends from history
   */
  getDebtTrends() {
    // This would integrate with version control or historical tracking
    // For now, return placeholder data
    return {
      weekly: 0,
      monthly: 0,
      direction: 'stable'
    };
  }

  /**
   * Get diff analysis if available
   */
  getDiffAnalysis() {
    try {
      return this.diffAnalyzer.analyzeDiff('HEAD');
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate recommendations based on metrics
   */
  generateMetricsRecommendations(metrics) {
    const recommendations = [];

    // Coverage recommendations
    if (metrics.coverage.overall.percentage < metrics.coverage.targets.minimum) {
      recommendations.push({
        type: 'coverage_critical',
        priority: 'critical',
        title: 'Documentation coverage below minimum threshold',
        description: `Current coverage: ${metrics.coverage.overall.percentage}%, minimum: ${metrics.coverage.targets.minimum}%`,
        action: 'Immediate documentation effort required',
        impact: 'high'
      });
    }

    // Debt recommendations
    if (metrics.debt.byPriority.critical > 0) {
      recommendations.push({
        type: 'debt_critical',
        priority: 'critical',
        title: `${metrics.debt.byPriority.critical} critical documentation items`,
        description: 'Critical items block productivity and maintainability',
        action: 'Address critical documentation debt immediately',
        impact: 'high'
      });
    }

    // Quality recommendations
    if (metrics.quality.overall < 70) {
      recommendations.push({
        type: 'quality_improvement',
        priority: 'medium',
        title: 'Documentation quality needs improvement',
        description: `Quality score: ${metrics.quality.overall}%`,
        action: 'Implement documentation standards and templates',
        impact: 'medium'
      });
    }

    // Trend recommendations
    if (metrics.trends.available && metrics.trends.coverage.trend === 'declining') {
      recommendations.push({
        type: 'trend_warning',
        priority: 'high',
        title: 'Documentation coverage declining',
        description: `Coverage has decreased by ${Math.abs(metrics.trends.coverage.change)}% recently`,
        action: 'Review and strengthen documentation practices',
        impact: 'medium'
      });
    }

    // Effort recommendations
    if (metrics.debt.estimatedHours > 8) {
      recommendations.push({
        type: 'effort_planning',
        priority: 'medium',
        title: 'Significant documentation effort required',
        description: `Estimated ${metrics.debt.estimatedHours} hours of documentation work`,
        action: 'Plan dedicated documentation sprint',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Get coverage status
   */
  getCoverageStatus(percentage, targets) {
    if (percentage >= targets.excellent) return 'excellent';
    if (percentage >= targets.target) return 'good';
    if (percentage >= targets.minimum) return 'acceptable';
    return 'poor';
  }

  /**
   * Save metrics to file
   */
  saveMetrics(metrics) {
    // Save current metrics
    fs.writeFileSync(this.metricsPath, JSON.stringify(metrics, null, 2));
    
    // Append to history
    this.appendToHistory(metrics);
    
    return this.metricsPath;
  }

  /**
   * Append metrics to history
   */
  appendToHistory(metrics) {
    let history = [];
    
    if (fs.existsSync(this.historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(this.historyPath, 'utf-8'));
      } catch (error) {
        console.warn('Could not read metrics history, starting fresh');
      }
    }
    
    // Add current metrics (keep essential data only)
    history.push({
      timestamp: metrics.timestamp,
      coverage: metrics.coverage,
      debt: metrics.debt,
      quality: metrics.quality
    });
    
    // Keep only last 50 entries
    if (history.length > 50) {
      history = history.slice(-50);
    }
    
    fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2));
  }

  /**
   * Generate comprehensive report
   */
  generateReport(metrics) {
    const report = [];
    
    report.push('# Documentation Metrics Report');
    report.push('');
    report.push(`**Generated**: ${metrics.timestamp}`);
    report.push(`**Project**: ${metrics.project.name}`);
    report.push(`**Branch**: ${metrics.project.branch}`);
    report.push('');
    
    // Executive summary
    report.push('## Executive Summary');
    report.push('');
    report.push(`- **Overall Coverage**: ${metrics.coverage.overall.percentage}% (${metrics.coverage.status})`);
    report.push(`- **Documentation Debt**: ${metrics.debt.total} items`);
    report.push(`- **Quality Score**: ${metrics.quality.overall}%`);
    report.push(`- **Estimated Effort**: ${metrics.debt.estimatedHours} hours`);
    report.push('');

    // Coverage breakdown
    report.push('## Coverage Analysis');
    report.push('');
    report.push(`### Overall Coverage: ${metrics.coverage.overall.percentage}%`);
    report.push(`- **Target**: ${metrics.coverage.targets.target}%`);
    report.push(`- **Status**: ${metrics.coverage.status}`);
    report.push(`- **Files needing documentation**: ${metrics.coverage.overall.undocumented}`);
    report.push('');
    
    report.push('### Coverage by File Type');
    Object.entries(metrics.coverage.byType).forEach(([type, data]) => {
      if (data.total > 0) {
        report.push(`- **${type}**: ${data.percentage}% (${data.documented}/${data.total})`);
      }
    });
    report.push('');

    // Debt analysis
    report.push('## Documentation Debt');
    report.push('');
    report.push('### Priority Breakdown');
    Object.entries(metrics.debt.byPriority).forEach(([priority, count]) => {
      if (count > 0) {
        report.push(`- **${priority.toUpperCase()}**: ${count} items`);
      }
    });
    report.push('');
    
    if (metrics.debt.changeAnalysis) {
      report.push('### Recent Changes');
      report.push(`- **Significant Changes**: ${metrics.debt.changeAnalysis.significantChanges} files`);
      report.push(`- **Breaking Changes**: ${metrics.debt.changeAnalysis.breakingChanges} files`);
      report.push(`- **Requires Immediate Attention**: ${metrics.debt.changeAnalysis.requiresImmediate} files`);
      report.push('');
    }

    // Quality analysis
    report.push('## Quality Assessment');
    report.push('');
    report.push(`### Overall Quality: ${metrics.quality.overall}%`);
    report.push(`- **Standards**: ${metrics.quality.standards.score}%`);
    report.push(`- **Consistency**: ${metrics.quality.consistency.score}%`);
    report.push(`- **Completeness**: ${metrics.quality.completeness.score}%`);
    report.push('');

    // Trends
    if (metrics.trends.available) {
      report.push('## Trends');
      report.push('');
      report.push(`- **Coverage Trend**: ${metrics.trends.coverage.trend} (${metrics.trends.coverage.change > 0 ? '+' : ''}${metrics.trends.coverage.change}%)`);
      report.push(`- **Debt Trend**: ${metrics.trends.debt.trend} (${metrics.trends.debt.change > 0 ? '+' : ''}${metrics.trends.debt.change} items)`);
      report.push(`- **Quality Trend**: ${metrics.trends.quality.trend} (${metrics.trends.quality.change > 0 ? '+' : ''}${metrics.trends.quality.change}%)`);
      report.push('');
    }

    // Recommendations
    if (metrics.recommendations.length > 0) {
      report.push('## Recommendations');
      report.push('');
      
      metrics.recommendations
        .sort((a, b) => {
          const priorities = { critical: 3, high: 2, medium: 1, low: 0 };
          return priorities[b.priority] - priorities[a.priority];
        })
        .forEach(rec => {
          report.push(`### ${rec.title}`);
          report.push(`**Priority**: ${rec.priority.toUpperCase()}`);
          report.push(`**Description**: ${rec.description}`);
          report.push(`**Action**: ${rec.action}`);
          report.push(`**Impact**: ${rec.impact}`);
          report.push('');
        });
    }

    return report.join('\n');
  }

  /**
   * Utility methods
   */
  getProjectName() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf-8'));
      return packageJson.name || 'Unknown Project';
    } catch {
      return 'Unknown Project';
    }
  }

  getLastCommit() {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  getCurrentBranch() {
    try {
      const { execSync } = require('child_process');
      return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  }
}

// CLI interface
if (require.main === module) {
  const tracker = new DocumentationMetricsTracker();
  
  const args = process.argv.slice(2);
  const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 
                    'docs/reports/documentation-metrics-report.md';
  const jsonOutput = args.includes('--json');
  const quiet = args.includes('--quiet');
  const saveHistory = !args.includes('--no-history');
  
  try {
    const metrics = tracker.generateMetrics();
    
    if (jsonOutput) {
      console.log(JSON.stringify(metrics, null, 2));
    } else if (!quiet) {
      console.log(tracker.generateReport(metrics));
    }
    
    // Save metrics
    if (saveHistory) {
      const savedPath = tracker.saveMetrics(metrics);
      if (!quiet && !jsonOutput) {
        console.log(`\n📊 Metrics saved to: ${savedPath}`);
      }
    }
    
    // Save report
    if (!jsonOutput) {
      const report = tracker.generateReport(metrics);
      fs.writeFileSync(outputFile, report);
      if (!quiet) {
        console.log(`📄 Report saved to: ${outputFile}`);
      }
    }
    
    // Exit with error if critical issues
    const criticalIssues = metrics.recommendations
      .filter(rec => rec.priority === 'critical').length;
    
    if (criticalIssues > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error generating documentation metrics:', error.message);
    process.exit(1);
  }
}

module.exports = DocumentationMetricsTracker;