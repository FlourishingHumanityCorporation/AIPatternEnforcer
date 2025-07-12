#!/usr/bin/env node

/**
 * Analytics tracker for Claude validation system
 * Tracks usage patterns while respecting privacy
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AnalyticsTracker {
  constructor() {
    this.analyticsDir = path.join(__dirname, '.analytics');
    this.statsFile = path.join(this.analyticsDir, 'usage-stats.json');
    this.sessionsFile = path.join(this.analyticsDir, 'sessions.json');
    
    // Ensure analytics directory exists
    if (!fs.existsSync(this.analyticsDir)) {
      fs.mkdirSync(this.analyticsDir, { recursive: true });
    }
    
    this.ensureStatsFile();
  }

  ensureStatsFile() {
    if (!fs.existsSync(this.statsFile)) {
      const initialStats = {
        version: '1.0.0',
        created: new Date().toISOString(),
        totalValidations: 0,
        totalSessions: 0,
        patterns: {},
        daily: {},
        performance: {
          averageResponseTime: 0,
          totalProcessingTime: 0
        },
        userBehavior: {
          retryAfterFailure: 0,
          configurationChanges: 0,
          helpViewCount: 0
        },
        systemHealth: {
          errors: 0,
          lastError: null
        }
      };
      fs.writeFileSync(this.statsFile, JSON.stringify(initialStats, null, 2));
    }
  }

  loadStats() {
    try {
      return JSON.parse(fs.readFileSync(this.statsFile, 'utf-8'));
    } catch (error) {
      console.warn('Analytics: Could not load stats, using defaults');
      this.ensureStatsFile();
      return this.loadStats();
    }
  }

  saveStats(stats) {
    try {
      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch (error) {
      console.warn('Analytics: Could not save stats:', error.message);
    }
  }

  // Generate anonymous session ID (hash of timestamp + random)
  generateSessionId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    return crypto.createHash('sha256').update(timestamp + random).digest('hex').substring(0, 16);
  }

  // Track validation attempt
  trackValidation(options = {}) {
    const stats = this.loadStats();
    const today = new Date().toISOString().split('T')[0];
    
    // Update totals
    stats.totalValidations++;
    
    // Track daily usage
    if (!stats.daily[today]) {
      stats.daily[today] = {
        validations: 0,
        passed: 0,
        failed: 0,
        patterns: {},
        avgScore: 0,
        scoreSum: 0
      };
    }
    
    stats.daily[today].validations++;
    
    // Track validation result
    if (options.passed === true) {
      stats.daily[today].passed++;
    } else if (options.passed === false) {
      stats.daily[today].failed++;
    }
    
    // Track score
    if (options.score !== undefined) {
      stats.daily[today].scoreSum += options.score;
      stats.daily[today].avgScore = stats.daily[today].scoreSum / stats.daily[today].validations;
    }
    
    // Track patterns
    if (options.violations && Array.isArray(options.violations)) {
      options.violations.forEach(violation => {
        if (!stats.patterns[violation.rule]) {
          stats.patterns[violation.rule] = { violations: 0, severity: violation.severity };
        }
        stats.patterns[violation.rule].violations++;
        
        if (!stats.daily[today].patterns[violation.rule]) {
          stats.daily[today].patterns[violation.rule] = 0;
        }
        stats.daily[today].patterns[violation.rule]++;
      });
    }
    
    // Track context flags
    if (options.isComplex !== undefined) {
      if (!stats.daily[today].context) stats.daily[today].context = {};
      stats.daily[today].context.complex = (stats.daily[today].context.complex || 0) + (options.isComplex ? 1 : 0);
      stats.daily[today].context.simple = (stats.daily[today].context.simple || 0) + (options.isComplex ? 0 : 1);
    }
    
    // Track performance
    if (options.processingTime !== undefined) {
      stats.performance.totalProcessingTime += options.processingTime;
      stats.performance.averageResponseTime = stats.performance.totalProcessingTime / stats.totalValidations;
    }
    
    this.saveStats(stats);
  }

  // Track configuration changes
  trackConfigChange(changeType, pattern = null, value = null) {
    const stats = this.loadStats();
    stats.userBehavior.configurationChanges++;
    
    const today = new Date().toISOString().split('T')[0];
    if (!stats.daily[today]) {
      stats.daily[today] = { validations: 0, passed: 0, failed: 0, patterns: {} };
    }
    
    if (!stats.daily[today].configChanges) {
      stats.daily[today].configChanges = [];
    }
    
    stats.daily[today].configChanges.push({
      type: changeType,
      pattern,
      value,
      timestamp: new Date().toISOString()
    });
    
    this.saveStats(stats);
  }

  // Track help usage
  trackHelpUsage(helpType = 'general') {
    const stats = this.loadStats();
    stats.userBehavior.helpViewCount++;
    
    const today = new Date().toISOString().split('T')[0];
    if (!stats.daily[today]) {
      stats.daily[today] = { validations: 0, passed: 0, failed: 0, patterns: {} };
    }
    
    if (!stats.daily[today].helpViews) {
      stats.daily[today].helpViews = {};
    }
    
    stats.daily[today].helpViews[helpType] = (stats.daily[today].helpViews[helpType] || 0) + 1;
    
    this.saveStats(stats);
  }

  // Track errors
  trackError(errorType, errorMessage, context = {}) {
    const stats = this.loadStats();
    stats.systemHealth.errors++;
    stats.systemHealth.lastError = {
      type: errorType,
      message: errorMessage.substring(0, 200), // Limit error message length
      timestamp: new Date().toISOString(),
      context: JSON.stringify(context).substring(0, 500)
    };
    
    this.saveStats(stats);
  }

  // Get analytics summary
  getAnalyticsSummary(days = 7) {
    const stats = this.loadStats();
    const today = new Date();
    const summary = {
      totalValidations: stats.totalValidations,
      averageResponseTime: Math.round(stats.performance.averageResponseTime || 0),
      overallComplianceRate: 0,
      topViolations: [],
      dailyTrends: {},
      configurationActivity: stats.userBehavior.configurationChanges,
      systemHealth: {
        errorRate: stats.systemHealth.errors / Math.max(stats.totalValidations, 1),
        lastError: stats.systemHealth.lastError
      }
    };
    
    // Calculate compliance rate
    let totalPassed = 0;
    let totalFailed = 0;
    
    // Get last N days of data
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (stats.daily[dateStr]) {
        const dayData = stats.daily[dateStr];
        totalPassed += dayData.passed || 0;
        totalFailed += dayData.failed || 0;
        
        summary.dailyTrends[dateStr] = {
          validations: dayData.validations || 0,
          passed: dayData.passed || 0,
          failed: dayData.failed || 0,
          avgScore: Math.round(dayData.avgScore || 0),
          complianceRate: dayData.validations > 0 
            ? Math.round(((dayData.passed || 0) / dayData.validations) * 100)
            : 0
        };
      }
    }
    
    summary.overallComplianceRate = totalPassed + totalFailed > 0 
      ? Math.round((totalPassed / (totalPassed + totalFailed)) * 100)
      : 0;
    
    // Top violations
    summary.topViolations = Object.entries(stats.patterns)
      .sort((a, b) => b[1].violations - a[1].violations)
      .slice(0, 5)
      .map(([rule, data]) => ({
        rule,
        violations: data.violations,
        severity: data.severity
      }));
    
    return summary;
  }

  // Export data for analysis (anonymized)
  exportAnalytics() {
    const stats = this.loadStats();
    const summary = this.getAnalyticsSummary(30); // 30 days
    
    return {
      exportDate: new Date().toISOString(),
      summary,
      rawData: {
        // Remove any potentially identifying information
        totalValidations: stats.totalValidations,
        patterns: stats.patterns,
        performance: stats.performance,
        userBehavior: {
          configurationChanges: stats.userBehavior.configurationChanges,
          helpViewCount: stats.userBehavior.helpViewCount
        },
        // Last 30 days only
        dailyStats: Object.fromEntries(
          Object.entries(stats.daily)
            .filter(([date]) => {
              const daysDiff = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
              return daysDiff <= 30;
            })
        )
      }
    };
  }

  // Clean old data (keep last 90 days)
  cleanOldData() {
    const stats = this.loadStats();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    const newDaily = {};
    Object.entries(stats.daily).forEach(([date, data]) => {
      if (date >= cutoffStr) {
        newDaily[date] = data;
      }
    });
    
    stats.daily = newDaily;
    this.saveStats(stats);
  }
}

// CLI interface
if (require.main === module) {
  const tracker = new AnalyticsTracker();
  const command = process.argv[2];

  switch (command) {
    case 'summary':
      console.log(JSON.stringify(tracker.getAnalyticsSummary(), null, 2));
      break;
    case 'export':
      console.log(JSON.stringify(tracker.exportAnalytics(), null, 2));
      break;
    case 'clean':
      tracker.cleanOldData();
      console.log('Old analytics data cleaned');
      break;
    case 'track':
      // Manual tracking for testing
      tracker.trackValidation({
        passed: process.argv[3] === 'true',
        score: parseInt(process.argv[4]) || 100,
        processingTime: 50
      });
      console.log('Test validation tracked');
      break;
    default:
      console.log(`
Analytics Tracker Commands:
  summary    Show usage summary
  export     Export anonymized data  
  clean      Clean old data (>90 days)
  track      Track test validation
      `);
  }
}

module.exports = AnalyticsTracker;