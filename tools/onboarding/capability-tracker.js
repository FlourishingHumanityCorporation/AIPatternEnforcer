#!/usr/bin/env node
/**
 * Claude Code Capability Tracker
 * Tracks and manages progressive capability unlocking for Claude Code instances
 */

const fs = require('fs');
const path = require('path');

// Simple logging utility for capability tracker
const logger = {
  error: (message, error = null) => {
    logger.error(`[CapabilityTracker] ERROR: ${message}`, error || '');
  },
  info: (message) => {
    logger.info(`[CapabilityTracker] ${message}`);
  },
  warn: (message) => {
    logger.warn(`[CapabilityTracker] WARN: ${message}`);
  }
};

class CapabilityTracker {
  constructor() {
    this.stateFile = 'tools/metrics/claude-onboarding-state.json';
    this.metricsFile = 'tools/metrics/claude-capability-metrics.json';

    // Capability level definitions
    this.levels = {
      0: {
        name: 'Uninitialized',
        description: 'Fresh Claude Code instance, no onboarding',
        capabilities: []
      },
      1: {
        name: 'Basic Assistant',
        description: 'File operations, simple generation, basic rule following',
        capabilities: [
        'fileAccess',
        'basicGeneration',
        'ruleAwareness'],

        requirements: {
          onboardingCompleted: true,
          successfulInteractions: 1
        }
      },
      2: {
        name: 'Project-Aware',
        description: 'Generators, patterns, security considerations',
        capabilities: [
        'generatorUsage',
        'patternRecognition',
        'securityAwareness',
        'validationIntegration'],

        requirements: {
          level1Achieved: true,
          successfulGenerations: 2,
          validationCompliance: 0.8
        }
      },
      3: {
        name: 'Advanced Assistant',
        description: 'Refactoring, optimization, complex problem solving',
        capabilities: [
        'complexRefactoring',
        'performanceOptimization',
        'architecturalThinking',
        'debuggingMastery'],

        requirements: {
          level2Achieved: true,
          successfulRefactorings: 3,
          debuggingSuccess: 0.9
        }
      },
      4: {
        name: 'Expert Assistant',
        description: 'Architecture decisions, pattern contributions, mentoring',
        capabilities: [
        'architecturalDesign',
        'patternContribution',
        'teamMentoring',
        'systemImprovement'],

        requirements: {
          level3Achieved: true,
          architecturalContributions: 1,
          peerReviews: 5
        }
      }
    };

    this.initializeMetrics();
  }

  initializeMetrics() {
    // Ensure directories exist
    const dir = path.dirname(this.metricsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Initialize metrics file if it doesn't exist
    if (!fs.existsSync(this.metricsFile)) {
      const initialMetrics = {
        sessionId: Date.now().toString(),
        createdAt: new Date().toISOString(),
        interactions: {
          total: 0,
          successful: 0,
          failed: 0
        },
        capabilities: {
          fileAccess: { attempts: 0, successes: 0 },
          basicGeneration: { attempts: 0, successes: 0 },
          generatorUsage: { attempts: 0, successes: 0 },
          patternRecognition: { attempts: 0, successes: 0 },
          validationCompliance: { attempts: 0, successes: 0 },
          refactoring: { attempts: 0, successes: 0 },
          debugging: { attempts: 0, successes: 0 },
          architectural: { attempts: 0, successes: 0 }
        },
        levelHistory: [
        { level: 0, achievedAt: new Date().toISOString() }],

        currentLevel: 0
      };

      fs.writeFileSync(this.metricsFile, JSON.stringify(initialMetrics, null, 2));
    }
  }

  getCurrentState() {
    if (!fs.existsSync(this.stateFile)) {
      return {
        level: 0,
        capabilities: {},
        completionStatus: 'not_started'
      };
    }

    try {
      return JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    } catch (error) {
      logger.error('Error reading onboarding state:', error);
      return { level: 0, capabilities: {}, completionStatus: 'error' };
    }
  }

  getMetrics() {
    try {
      return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
    } catch (error) {
      logger.error('Error reading capability metrics:', error);
      this.initializeMetrics();
      return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
    }
  }

  updateMetrics(updates) {
    const metrics = this.getMetrics();

    // Merge updates
    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        metrics[key] = { ...metrics[key], ...updates[key] };
      } else {
        metrics[key] = updates[key];
      }
    });

    metrics.lastUpdated = new Date().toISOString();

    fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
    return metrics;
  }

  recordInteraction(type, success, details = {}) {
    const metrics = this.getMetrics();

    // Update interaction counts
    metrics.interactions.total++;
    if (success) {
      metrics.interactions.successful++;
    } else {
      metrics.interactions.failed++;
    }

    // Update capability-specific metrics
    if (metrics.capabilities[type]) {
      metrics.capabilities[type].attempts++;
      if (success) {
        metrics.capabilities[type].successes++;
      }
    }

    // Add interaction details
    if (!metrics.interactionHistory) {
      metrics.interactionHistory = [];
    }

    metrics.interactionHistory.push({
      timestamp: new Date().toISOString(),
      type,
      success,
      details
    });

    // Keep only last 100 interactions
    if (metrics.interactionHistory.length > 100) {
      metrics.interactionHistory = metrics.interactionHistory.slice(-100);
    }

    this.updateMetrics(metrics);

    // Check for level progression
    this.checkLevelProgression();

    return metrics;
  }

  checkLevelProgression() {
    const state = this.getCurrentState();
    const metrics = this.getMetrics();
    const currentLevel = state.level || 0;

    // Check if eligible for next level
    for (let level = currentLevel + 1; level <= 4; level++) {
      if (this.isEligibleForLevel(level, state, metrics)) {
        this.promoteToLevel(level);
        return level;
      }
    }

    return currentLevel;
  }

  isEligibleForLevel(targetLevel, state, metrics) {
    const requirements = this.levels[targetLevel]?.requirements;
    if (!requirements) return false;

    // Check onboarding completion for Level 1
    if (targetLevel === 1) {
      return state.completionStatus === 'completed' &&
      metrics.interactions.successful >= 1;
    }

    // Check Level 2 requirements
    if (targetLevel === 2) {
      const generatorSuccess = metrics.capabilities.generatorUsage.successes >= 2;
      const complianceRate = metrics.capabilities.validationCompliance.successes /
      Math.max(metrics.capabilities.validationCompliance.attempts, 1);
      return state.level >= 1 && generatorSuccess && complianceRate >= 0.8;
    }

    // Check Level 3 requirements
    if (targetLevel === 3) {
      const refactoringSuccess = metrics.capabilities.refactoring.successes >= 3;
      const debuggingRate = metrics.capabilities.debugging.successes /
      Math.max(metrics.capabilities.debugging.attempts, 1);
      return state.level >= 2 && refactoringSuccess && debuggingRate >= 0.9;
    }

    // Check Level 4 requirements
    if (targetLevel === 4) {
      const architecturalContribs = metrics.capabilities.architectural.successes >= 1;
      const totalSuccessfulInteractions = metrics.interactions.successful >= 50;
      return state.level >= 3 && architecturalContribs && totalSuccessfulInteractions;
    }

    return false;
  }

  promoteToLevel(newLevel) {
    const state = this.getCurrentState();
    const metrics = this.getMetrics();

    // Update state
    state.level = newLevel;
    state.lastLevelUp = new Date().toISOString();

    // Update metrics
    metrics.currentLevel = newLevel;
    metrics.levelHistory.push({
      level: newLevel,
      achievedAt: new Date().toISOString()
    });

    // Save updates
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    this.updateMetrics(metrics);

    logger.info(`🎉 Level Up! Promoted to Level ${newLevel}: ${this.levels[newLevel].name}`);
    logger.info(`📋 New capabilities: ${this.levels[newLevel].capabilities.join(', ')}`);

    return newLevel;
  }

  getCapabilityStatus() {
    const state = this.getCurrentState();
    const metrics = this.getMetrics();
    const currentLevel = state.level || 0;

    return {
      currentLevel,
      levelName: this.levels[currentLevel]?.name || 'Unknown',
      capabilities: this.levels[currentLevel]?.capabilities || [],
      nextLevel: currentLevel < 4 ? currentLevel + 1 : null,
      nextLevelRequirements: this.levels[currentLevel + 1]?.requirements || null,
      progressToNext: this.calculateProgressToNextLevel(state, metrics),
      metrics: {
        totalInteractions: metrics.interactions.total,
        successRate: metrics.interactions.successful / Math.max(metrics.interactions.total, 1),
        capabilityBreakdown: metrics.capabilities
      }
    };
  }

  calculateProgressToNextLevel(state, metrics) {
    const currentLevel = state.level || 0;
    const nextLevel = currentLevel + 1;

    if (nextLevel > 4) return { complete: true, percentage: 100 };

    const requirements = this.levels[nextLevel]?.requirements;
    if (!requirements) return { complete: false, percentage: 0 };

    let progress = {};

    if (nextLevel === 1) {
      progress.onboardingCompleted = state.completionStatus === 'completed';
      progress.successfulInteractions = metrics.interactions.successful >= 1;
    } else if (nextLevel === 2) {
      progress.generatorUsage = metrics.capabilities.generatorUsage.successes >= 2;
      progress.validationCompliance =
      metrics.capabilities.validationCompliance.successes /
      Math.max(metrics.capabilities.validationCompliance.attempts, 1) >= 0.8;
    } else if (nextLevel === 3) {
      progress.refactoringSuccess = metrics.capabilities.refactoring.successes >= 3;
      progress.debuggingRate =
      metrics.capabilities.debugging.successes /
      Math.max(metrics.capabilities.debugging.attempts, 1) >= 0.9;
    } else if (nextLevel === 4) {
      progress.architecturalContribs = metrics.capabilities.architectural.successes >= 1;
      progress.totalInteractions = metrics.interactions.successful >= 50;
    }

    const completedRequirements = Object.values(progress).filter(Boolean).length;
    const totalRequirements = Object.keys(progress).length;
    const percentage = completedRequirements / totalRequirements * 100;

    return {
      complete: percentage === 100,
      percentage: Math.round(percentage),
      breakdown: progress
    };
  }

  generateProgressReport() {
    const status = this.getCapabilityStatus();

    logger.info('\n🤖 Claude Code Capability Status Report');
    logger.info('='.repeat(50));
    logger.info(`Current Level: ${status.currentLevel} - ${status.levelName}`);
    logger.info(`Capabilities: ${status.capabilities.join(', ')}`);
    logger.info(`Total Interactions: ${status.metrics.totalInteractions}`);
    logger.info(`Success Rate: ${(status.metrics.successRate * 100).toFixed(1)}%`);

    if (status.nextLevel) {
      logger.info(`\nProgress to Level ${status.nextLevel}:`);
      logger.info(`Overall: ${status.progressToNext.percentage}%`);

      if (status.progressToNext.breakdown) {
        logger.info('Requirements:');
        Object.entries(status.progressToNext.breakdown).forEach(([req, met]) => {
          logger.info(`  ${met ? '✅' : '❌'} ${req}`);
        });
      }
    }

    logger.info('\nCapability Breakdown:');
    Object.entries(status.metrics.capabilityBreakdown).forEach(([cap, data]) => {
      const rate = data.attempts > 0 ? (data.successes / data.attempts * 100).toFixed(1) : '0.0';
      logger.info(`  ${cap}: ${data.successes}/${data.attempts} (${rate}%)`);
    });

    return status;
  }
}

// CLI interface
if (require.main === module) {
  const tracker = new CapabilityTracker();
  const command = process.argv[2];

  switch (command) {
    case 'status':
      tracker.generateProgressReport();
      break;

    case 'record':
      const type = process.argv[3];
      const success = process.argv[4] === 'true';
      const details = process.argv[5] ? JSON.parse(process.argv[5]) : {};
      tracker.recordInteraction(type, success, details);
      logger.info(`Recorded ${type} interaction: ${success ? 'success' : 'failure'}`);
      break;

    case 'check-progression':
      const newLevel = tracker.checkLevelProgression();
      logger.info(`Current level: ${newLevel}`);
      break;

    default:
      logger.info('Usage:');
      logger.info('  node capability-tracker.js status');
      logger.info('  node capability-tracker.js record <type> <success> [details]');
      logger.info('  node capability-tracker.js check-progression');
  }
}

module.exports = CapabilityTracker;