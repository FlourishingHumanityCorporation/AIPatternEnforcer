#!/usr/bin/env node
/**
 * User Feedback and Analytics System
 * 
 * Collects anonymized usage data and user feedback to validate 
 * the friction reduction hypothesis and improve the system.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chalk = require('chalk');

class UserFeedbackSystem {
  constructor() {
    this.projectRoot = process.cwd();
    this.metricsFile = path.join(this.projectRoot, '.user-metrics.json');
    this.feedbackFile = path.join(this.projectRoot, '.user-feedback.json');
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return crypto.randomBytes(8).toString('hex');
  }

  getUserId() {
    const userFile = path.join(this.projectRoot, '.user-id');

    if (fs.existsSync(userFile)) {
      return fs.readFileSync(userFile, 'utf8').trim();
    }

    // Generate anonymous user ID
    const userId = crypto.randomBytes(16).toString('hex');
    fs.writeFileSync(userFile, userId);

    // Add to .gitignore to keep it local
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignore.includes('.user-id')) {
        fs.appendFileSync(gitignorePath, '\n# User analytics (local only)\n.user-id\n.user-metrics.json\n.user-feedback.json\n');
      }
    }

    return userId;
  }

  loadMetrics() {
    if (fs.existsSync(this.metricsFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
      } catch (error) {
        return this.createEmptyMetrics();
      }
    }
    return this.createEmptyMetrics();
  }

  createEmptyMetrics() {
    return {
      userId: this.getUserId(),
      createdAt: new Date().toISOString(),
      generators: {
        component: { usage: 0, timeSaved: 0, lastUsed: null },
        api: { usage: 0, timeSaved: 0, lastUsed: null },
        hook: { usage: 0, timeSaved: 0, lastUsed: null },
        feature: { usage: 0, timeSaved: 0, lastUsed: null }
      },
      enforcement: {
        violations: { total: 0, resolved: 0 },
        rulesTriggered: {},
        userOverrides: 0
      },
      productivity: {
        sessionsCount: 0,
        totalTimeSaved: 0,
        averageSessionLength: 0
      },
      experience: {
        setupCompletionTime: null,
        firstGeneratorUsed: null,
        learningCurve: []
      }
    };
  }

  trackGeneratorUsage(generatorType, timeSaved = 0) {
    const metrics = this.loadMetrics();
    const generator = metrics.generators[generatorType];

    if (generator) {
      generator.usage++;
      generator.timeSaved += timeSaved;
      generator.lastUsed = new Date().toISOString();

      metrics.productivity.totalTimeSaved += timeSaved;

      if (!metrics.experience.firstGeneratorUsed) {
        metrics.experience.firstGeneratorUsed = {
          type: generatorType,
          timestamp: new Date().toISOString()
        };
      }
    }

    this.saveMetrics(metrics);
    logger.info(chalk.gray(`📊 Tracked: ${generatorType} generator used (+${timeSaved}min saved)`));
  }

  trackEnforcementViolation(ruleType, resolved = false) {
    const metrics = this.loadMetrics();

    metrics.enforcement.violations.total++;
    if (resolved) metrics.enforcement.violations.resolved++;

    if (!metrics.enforcement.rulesTriggered[ruleType]) {
      metrics.enforcement.rulesTriggered[ruleType] = 0;
    }
    metrics.enforcement.rulesTriggered[ruleType]++;

    this.saveMetrics(metrics);
  }

  trackUserOverride() {
    const metrics = this.loadMetrics();
    metrics.enforcement.userOverrides++;
    this.saveMetrics(metrics);
  }

  startSession() {
    const metrics = this.loadMetrics();
    metrics.productivity.sessionsCount++;
    metrics.currentSession = {
      id: this.sessionId,
      startTime: Date.now(),
      actions: []
    };
    this.saveMetrics(metrics);
  }

  endSession() {
    const metrics = this.loadMetrics();
    if (metrics.currentSession) {
      const duration = Date.now() - metrics.currentSession.startTime;
      const durationMinutes = Math.round(duration / (1000 * 60));

      // Update average session length
      const totalSessions = metrics.productivity.sessionsCount;
      const currentAvg = metrics.productivity.averageSessionLength || 0;
      metrics.productivity.averageSessionLength =
      Math.round((currentAvg * (totalSessions - 1) + durationMinutes) / totalSessions);

      delete metrics.currentSession;
      this.saveMetrics(metrics);
    }
  }

  collectFeedback(type, data) {
    const feedback = this.loadFeedback();

    feedback.entries.push({
      id: crypto.randomBytes(8).toString('hex'),
      type,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.getUserId()
    });

    this.saveFeedback(feedback);
  }

  loadFeedback() {
    if (fs.existsSync(this.feedbackFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.feedbackFile, 'utf8'));
      } catch (error) {
        return { entries: [] };
      }
    }
    return { entries: [] };
  }

  saveMetrics(metrics) {
    fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
  }

  saveFeedback(feedback) {
    fs.writeFileSync(this.feedbackFile, JSON.stringify(feedback, null, 2));
  }

  showProductivityReport() {
    const metrics = this.loadMetrics();

    logger.info(chalk.cyan.bold('\n📊 Your ProjectTemplate Productivity Report\n'));

    // Generator usage
    logger.info(chalk.blue('🔧 Generator Usage:'));
    Object.entries(metrics.generators).forEach(([type, data]) => {
      if (data.usage > 0) {
        logger.info(`   ${type.padEnd(12)} | ${data.usage.toString().padEnd(8)} uses | ${data.timeSaved}min saved`);
      }
    });

    // Overall productivity
    logger.info(chalk.green(`\n💡 Total Time Saved: ${metrics.productivity.totalTimeSaved} minutes`));
    logger.info(chalk.green(`📈 Sessions: ${metrics.productivity.sessionsCount}`));
    logger.info(chalk.green(`⏱️  Avg Session: ${metrics.productivity.averageSessionLength}min`));

    // Enforcement effectiveness
    const enforcement = metrics.enforcement;
    if (enforcement.violations.total > 0) {
      const resolutionRate = Math.round(enforcement.resolved / enforcement.total * 100);
      logger.info(chalk.yellow(`\n🛡️  Enforcement: ${enforcement.violations.resolved}/${enforcement.violations.total} violations resolved (${resolutionRate}%)`));
    }

    // Weekly projection
    const weeksUsed = Math.max(1, Math.ceil(metrics.productivity.sessionsCount / 5));
    const weeklyTimeSaved = Math.round(metrics.productivity.totalTimeSaved / weeksUsed);
    logger.info(chalk.cyan(`\n🚀 Weekly Average: ~${weeklyTimeSaved} minutes saved per week`));

    if (weeklyTimeSaved > 60) {
      const hours = Math.floor(weeklyTimeSaved / 60);
      const minutes = weeklyTimeSaved % 60;
      logger.info(chalk.green(`   That's ${hours}h ${minutes}m returned to your week! 🎯`));
    }
  }

  // Friction point detection
  detectFrictionPoints() {
    const metrics = this.loadMetrics();
    const frictionPoints = [];

    // Low generator adoption
    Object.entries(metrics.generators).forEach(([type, data]) => {
      if (data.usage === 0 && metrics.productivity.sessionsCount > 3) {
        frictionPoints.push({
          type: 'low_adoption',
          generator: type,
          severity: 'medium',
          suggestion: `Consider trying the ${type} generator - it could save significant time`
        });
      }
    });

    // High enforcement overrides
    const overrideRate = metrics.enforcement.userOverrides / Math.max(1, metrics.enforcement.violations.total);
    if (overrideRate > 0.3) {
      frictionPoints.push({
        type: 'high_overrides',
        rate: overrideRate,
        severity: 'high',
        suggestion: 'Consider adjusting enforcement level - rules may be too strict'
      });
    }

    // Short sessions (indicating frustration)
    if (metrics.productivity.averageSessionLength < 5 && metrics.productivity.sessionsCount > 5) {
      frictionPoints.push({
        type: 'short_sessions',
        averageLength: metrics.productivity.averageSessionLength,
        severity: 'high',
        suggestion: 'Sessions are very short - are there blocking issues preventing productive work?'
      });
    }

    return frictionPoints;
  }

  exportAnonymizedData() {
    const metrics = this.loadMetrics();
    const feedback = this.loadFeedback();

    // Remove identifying information
    const anonymized = {
      metrics: {
        ...metrics,
        userId: 'anonymized',
        createdAt: null
      },
      feedback: feedback.entries.map((entry) => ({
        ...entry,
        userId: 'anonymized'
      })),
      exportedAt: new Date().toISOString()
    };

    const exportFile = path.join(this.projectRoot, '.anonymous-usage-data.json');
    fs.writeFileSync(exportFile, JSON.stringify(anonymized, null, 2));

    logger.info(chalk.green(`📤 Anonymous usage data exported to: ${exportFile}`));
    logger.info(chalk.gray('This data helps improve ProjectTemplate for everyone!'));

    return exportFile;
  }
}

// CLI commands
if (require.main === module) {
  const feedback = new UserFeedbackSystem();
  const command = process.argv[2];

  switch (command) {
    case 'track-generator':
      const [,,, generatorType, timeSaved] = process.argv;
      feedback.trackGeneratorUsage(generatorType, parseInt(timeSaved) || 0);
      break;

    case 'track-violation':
      const [,,, ruleType, resolved] = process.argv;
      feedback.trackEnforcementViolation(ruleType, resolved === 'true');
      break;

    case 'start-session':
      feedback.startSession();
      break;

    case 'end-session':
      feedback.endSession();
      break;

    case 'report':
      feedback.showProductivityReport();
      break;

    case 'friction':
      const frictionPoints = feedback.detectFrictionPoints();
      if (frictionPoints.length > 0) {
        logger.info(chalk.yellow.bold('\n⚠️  Potential Friction Points Detected:\n'));
        frictionPoints.forEach((point, i) => {
          logger.info(`${i + 1}. ${point.suggestion}`);
        });
      } else {
        logger.info(chalk.green('\n✅ No significant friction points detected!'));
      }
      break;

    case 'export':
      feedback.exportAnonymizedData();
      break;

    default:
      logger.info(chalk.cyan.bold('ProjectTemplate User Feedback System\n'));
      logger.info('Commands:');
      logger.info('  track-generator <type> [timeSaved]  - Track generator usage');
      logger.info('  track-violation <rule> [resolved]   - Track enforcement violations');
      logger.info('  start-session                      - Start tracking session');
      logger.info('  end-session                        - End tracking session');
      logger.info('  report                             - Show productivity report');
      logger.info('  friction                           - Detect friction points');
      logger.info('  export                             - Export anonymous data');
  }
}

module.exports = UserFeedbackSystem;