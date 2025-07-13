#!/usr/bin/env node

/**
 * Pattern Update Mechanisms and Monitoring System
 * Phase 7: Maintains and evolves hook patterns based on real-world usage
 * 
 * Features:
 * - Pattern effectiveness tracking
 * - Automatic pattern optimization suggestions
 * - False positive/negative analysis
 * - Pattern versioning and rollback
 * - Community pattern integration
 */

const fs = require('fs');
const path = require('path');

class PatternUpdater {
  constructor() {
    this.metricsFile = path.join(__dirname, '../../.claude/hook-metrics.json');
    this.patternsDir = path.join(__dirname, 'patterns');
    this.backupDir = path.join(__dirname, 'pattern-backups');
    
    this.ensureDirectories();
    this.loadMetrics();
  }

  ensureDirectories() {
    [this.patternsDir, this.backupDir, path.dirname(this.metricsFile)].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadMetrics() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        this.metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
      } else {
        this.metrics = this.createDefaultMetrics();
      }
    } catch (error) {
      console.error('Error loading metrics:', error.message);
      this.metrics = this.createDefaultMetrics();
    }
  }

  createDefaultMetrics() {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      hooks: {
        'security-scan.js': {
          patterns: {},
          falsePositives: 0,
          falseNegatives: 0,
          totalExecutions: 0,
          averageExecutionTime: 0,
          effectiveness: 0.95
        },
        'scope-limiter.js': {
          patterns: {},
          falsePositives: 0,
          falseNegatives: 0,
          totalExecutions: 0,
          averageExecutionTime: 0,
          effectiveness: 0.92
        },
        'context-validator.js': {
          patterns: {},
          falsePositives: 0,
          falseNegatives: 0,
          totalExecutions: 0,
          averageExecutionTime: 0,
          effectiveness: 0.88
        },
        'api-validator.js': {
          patterns: {},
          falsePositives: 0,
          falseNegatives: 0,
          totalExecutions: 0,
          averageExecutionTime: 0,
          effectiveness: 0.94
        },
        'performance-checker.js': {
          patterns: {},
          falsePositives: 0,
          falseNegatives: 0,
          totalExecutions: 0,
          averageExecutionTime: 0,
          effectiveness: 0.91
        }
      },
      patterns: {
        trending: [],
        deprecated: [],
        community: []
      }
    };
  }

  saveMetrics() {
    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.error('Error saving metrics:', error.message);
    }
  }

  recordExecution(hookName, patternMatches, executionTime, wasBlocked, wasFalsePositive = false) {
    if (!this.metrics.hooks[hookName]) {
      this.metrics.hooks[hookName] = {
        patterns: {},
        falsePositives: 0,
        falseNegatives: 0,
        totalExecutions: 0,
        averageExecutionTime: 0,
        effectiveness: 0.5
      };
    }

    const hookMetrics = this.metrics.hooks[hookName];
    
    // Update execution metrics
    hookMetrics.totalExecutions++;
    hookMetrics.averageExecutionTime = 
      (hookMetrics.averageExecutionTime * (hookMetrics.totalExecutions - 1) + executionTime) / 
      hookMetrics.totalExecutions;

    // Record pattern usage
    patternMatches.forEach(pattern => {
      if (!hookMetrics.patterns[pattern]) {
        hookMetrics.patterns[pattern] = {
          matches: 0,
          falsePositives: 0,
          effectiveness: 0.5,
          lastSeen: new Date().toISOString()
        };
      }
      
      hookMetrics.patterns[pattern].matches++;
      hookMetrics.patterns[pattern].lastSeen = new Date().toISOString();
      
      if (wasFalsePositive) {
        hookMetrics.patterns[pattern].falsePositives++;
        hookMetrics.falsePositives++;
      }
    });

    // Update effectiveness score
    if (wasFalsePositive) {
      hookMetrics.effectiveness = Math.max(0, hookMetrics.effectiveness - 0.01);
    } else if (wasBlocked) {
      hookMetrics.effectiveness = Math.min(1, hookMetrics.effectiveness + 0.001);
    }

    this.saveMetrics();
  }

  analyzePatternEffectiveness() {
    const analysis = {
      mostEffective: [],
      leastEffective: [],
      trending: [],
      recommendations: []
    };

    Object.entries(this.metrics.hooks).forEach(([hookName, hookData]) => {
      Object.entries(hookData.patterns).forEach(([pattern, patternData]) => {
        const effectiveness = patternData.falsePositives === 0 ? 1 : 
          Math.max(0, 1 - (patternData.falsePositives / patternData.matches));
        
        const item = {
          hook: hookName,
          pattern,
          effectiveness,
          matches: patternData.matches,
          falsePositives: patternData.falsePositives,
          lastSeen: patternData.lastSeen
        };

        if (effectiveness > 0.9 && patternData.matches > 10) {
          analysis.mostEffective.push(item);
        } else if (effectiveness < 0.6 && patternData.matches > 5) {
          analysis.leastEffective.push(item);
        }

        // Check if pattern is trending (recent activity)
        const daysSinceLastSeen = (Date.now() - new Date(patternData.lastSeen)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastSeen < 7 && patternData.matches > 3) {
          analysis.trending.push(item);
        }
      });
    });

    // Generate recommendations
    analysis.leastEffective.forEach(item => {
      analysis.recommendations.push({
        type: 'pattern-optimization',
        hook: item.hook,
        pattern: item.pattern,
        issue: `Low effectiveness (${(item.effectiveness * 100).toFixed(1)}%)`,
        suggestion: 'Consider refining pattern or adding context-aware logic'
      });
    });

    // Find hooks with high false positive rates
    Object.entries(this.metrics.hooks).forEach(([hookName, hookData]) => {
      const falsePositiveRate = hookData.totalExecutions > 0 ? 
        hookData.falsePositives / hookData.totalExecutions : 0;
      
      if (falsePositiveRate > 0.05) { // >5% false positive rate
        analysis.recommendations.push({
          type: 'hook-tuning',
          hook: hookName,
          issue: `High false positive rate (${(falsePositiveRate * 100).toFixed(1)}%)`,
          suggestion: 'Review and refine detection logic'
        });
      }
    });

    return analysis;
  }

  generatePatternUpdateReport() {
    const analysis = this.analyzePatternEffectiveness();
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalHooks: Object.keys(this.metrics.hooks).length,
        totalPatterns: Object.values(this.metrics.hooks)
          .reduce((sum, hook) => sum + Object.keys(hook.patterns).length, 0),
        averageEffectiveness: Object.values(this.metrics.hooks)
          .reduce((sum, hook) => sum + hook.effectiveness, 0) / Object.keys(this.metrics.hooks).length,
        totalExecutions: Object.values(this.metrics.hooks)
          .reduce((sum, hook) => sum + hook.totalExecutions, 0)
      },
      analysis,
      recommendations: analysis.recommendations
    };

    return report;
  }

  suggestNewPatterns(codebaseAnalysis) {
    const suggestions = [];

    // Analyze common patterns in codebase that aren't covered
    if (codebaseAnalysis.commonVulnerabilities) {
      codebaseAnalysis.commonVulnerabilities.forEach(vuln => {
        if (!this.isPatternCovered('security-scan.js', vuln.pattern)) {
          suggestions.push({
            type: 'security-pattern',
            pattern: vuln.pattern,
            severity: vuln.severity,
            description: vuln.description,
            suggestion: `Add pattern to security-scan.js: ${vuln.pattern}`
          });
        }
      });
    }

    // Suggest performance patterns based on codebase analysis
    if (codebaseAnalysis.performanceIssues) {
      codebaseAnalysis.performanceIssues.forEach(issue => {
        if (!this.isPatternCovered('performance-checker.js', issue.pattern)) {
          suggestions.push({
            type: 'performance-pattern',
            pattern: issue.pattern,
            impact: issue.impact,
            description: issue.description,
            suggestion: `Add pattern to performance-checker.js: ${issue.pattern}`
          });
        }
      });
    }

    return suggestions;
  }

  isPatternCovered(hookName, pattern) {
    const hookMetrics = this.metrics.hooks[hookName];
    if (!hookMetrics) return false;
    
    return Object.keys(hookMetrics.patterns).some(existingPattern => 
      existingPattern.includes(pattern) || pattern.includes(existingPattern)
    );
  }

  backupPatterns(hookName) {
    const hookFile = path.join(__dirname, hookName);
    if (!fs.existsSync(hookFile)) return null;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `${hookName}_${timestamp}.backup`);
    
    try {
      fs.copyFileSync(hookFile, backupFile);
      return backupFile;
    } catch (error) {
      console.error(`Error backing up ${hookName}:`, error.message);
      return null;
    }
  }

  updateHookPatterns(hookName, newPatterns) {
    const backupFile = this.backupPatterns(hookName);
    if (!backupFile) {
      throw new Error(`Failed to backup ${hookName} before update`);
    }

    const hookFile = path.join(__dirname, hookName);
    let hookContent = fs.readFileSync(hookFile, 'utf8');

    // Update patterns in the hook file
    // This is a simplified approach - in practice, you'd need more sophisticated AST manipulation
    newPatterns.forEach(pattern => {
      if (pattern.type === 'security') {
        hookContent = this.insertSecurityPattern(hookContent, pattern);
      } else if (pattern.type === 'performance') {
        hookContent = this.insertPerformancePattern(hookContent, pattern);
      }
    });

    fs.writeFileSync(hookFile, hookContent);
    
    // Record the update
    this.metrics.lastUpdated = new Date().toISOString();
    this.saveMetrics();

    return {
      updated: true,
      backup: backupFile,
      patternsAdded: newPatterns.length
    };
  }

  insertSecurityPattern(content, pattern) {
    // Find the SECURITY_PATTERNS array and insert new pattern
    const insertPoint = content.indexOf('const SECURITY_PATTERNS = [');
    if (insertPoint === -1) return content;

    const newPatternCode = `
  {
    pattern: ${pattern.regex},
    severity: '${pattern.severity}',
    issue: '${pattern.issue}',
    suggestion: '${pattern.suggestion}'
  },`;

    const insertIndex = content.indexOf('];', insertPoint);
    return content.slice(0, insertIndex) + newPatternCode + content.slice(insertIndex);
  }

  insertPerformancePattern(content, pattern) {
    // Find the PERFORMANCE_PATTERNS array and insert new pattern
    const insertPoint = content.indexOf('const PERFORMANCE_PATTERNS = [');
    if (insertPoint === -1) return content;

    const newPatternCode = `
  {
    pattern: ${pattern.regex},
    severity: '${pattern.severity}',
    issue: '${pattern.issue}',
    suggestion: '${pattern.suggestion}'
  },`;

    const insertIndex = content.indexOf('];', insertPoint);
    return content.slice(0, insertIndex) + newPatternCode + content.slice(insertIndex);
  }

  rollbackPatterns(hookName, backupFile) {
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    const hookFile = path.join(__dirname, hookName);
    fs.copyFileSync(backupFile, hookFile);
    
    return {
      rolledBack: true,
      restoredFrom: backupFile
    };
  }

  getPatternStatistics() {
    const stats = {};
    
    Object.entries(this.metrics.hooks).forEach(([hookName, hookData]) => {
      stats[hookName] = {
        totalPatterns: Object.keys(hookData.patterns).length,
        activePatterns: Object.values(hookData.patterns)
          .filter(p => (Date.now() - new Date(p.lastSeen)) < (30 * 24 * 60 * 60 * 1000)).length, // Active in last 30 days
        effectivePatterns: Object.values(hookData.patterns)
          .filter(p => p.falsePositives === 0 && p.matches > 5).length,
        problematicPatterns: Object.values(hookData.patterns)
          .filter(p => p.falsePositives > p.matches * 0.1).length, // >10% false positive rate
        averageExecutionTime: hookData.averageExecutionTime,
        totalExecutions: hookData.totalExecutions,
        effectiveness: hookData.effectiveness
      };
    });

    return stats;
  }

  monitorSystemHealth() {
    const health = {
      status: 'healthy',
      issues: [],
      recommendations: []
    };

    // Check hook performance
    Object.entries(this.metrics.hooks).forEach(([hookName, hookData]) => {
      if (hookData.averageExecutionTime > 100) { // >100ms
        health.issues.push({
          type: 'performance',
          hook: hookName,
          issue: `Slow execution time: ${hookData.averageExecutionTime.toFixed(2)}ms`,
          severity: 'medium'
        });
      }

      if (hookData.effectiveness < 0.8) {
        health.issues.push({
          type: 'effectiveness',
          hook: hookName,
          issue: `Low effectiveness: ${(hookData.effectiveness * 100).toFixed(1)}%`,
          severity: 'high'
        });
      }

      const falsePositiveRate = hookData.totalExecutions > 0 ? 
        hookData.falsePositives / hookData.totalExecutions : 0;
      
      if (falsePositiveRate > 0.05) {
        health.issues.push({
          type: 'false-positives',
          hook: hookName,
          issue: `High false positive rate: ${(falsePositiveRate * 100).toFixed(1)}%`,
          severity: 'medium'
        });
      }
    });

    if (health.issues.length > 0) {
      health.status = health.issues.some(i => i.severity === 'high') ? 'unhealthy' : 'degraded';
    }

    // Generate recommendations
    health.issues.forEach(issue => {
      if (issue.type === 'performance') {
        health.recommendations.push(`Optimize ${issue.hook} patterns for better performance`);
      } else if (issue.type === 'effectiveness') {
        health.recommendations.push(`Review and update patterns in ${issue.hook}`);
      } else if (issue.type === 'false-positives') {
        health.recommendations.push(`Refine detection logic in ${issue.hook} to reduce false positives`);
      }
    });

    return health;
  }
}

// CLI Interface
if (require.main === module) {
  const updater = new PatternUpdater();
  const command = process.argv[2];

  switch (command) {
    case 'analyze':
      console.log(JSON.stringify(updater.analyzePatternEffectiveness(), null, 2));
      break;
      
    case 'report':
      console.log(JSON.stringify(updater.generatePatternUpdateReport(), null, 2));
      break;
      
    case 'stats':
      console.log(JSON.stringify(updater.getPatternStatistics(), null, 2));
      break;
      
    case 'health':
      console.log(JSON.stringify(updater.monitorSystemHealth(), null, 2));
      break;
      
    case 'record':
      // Example: node pattern-updater.js record security-scan.js '["xss-pattern"]' 45 true false
      const [, , , hookName, patternsJson, executionTime, wasBlocked, wasFalsePositive] = process.argv;
      const patterns = JSON.parse(patternsJson);
      updater.recordExecution(
        hookName, 
        patterns, 
        parseInt(executionTime), 
        wasBlocked === 'true', 
        wasFalsePositive === 'true'
      );
      console.log('Execution recorded');
      break;
      
    default:
      console.log(`
Claude Code Hooks Pattern Updater

Usage:
  node pattern-updater.js analyze    - Analyze pattern effectiveness
  node pattern-updater.js report     - Generate update report
  node pattern-updater.js stats      - Show pattern statistics
  node pattern-updater.js health     - Check system health
  node pattern-updater.js record <hook> <patterns> <time> <blocked> <falsePos>
      `);
  }
}

module.exports = PatternUpdater;