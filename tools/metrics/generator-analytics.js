#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Generator Analytics System
 * Tracks generator usage, performance, and success rates
 */

class GeneratorAnalytics {
  constructor() {
    this.analyticsDir = path.join(os.homedir(), '.projecttemplate', 'analytics');
    this.analyticsFile = path.join(this.analyticsDir, 'generator-metrics.json');
    this.sessionFile = path.join(this.analyticsDir, 'current-session.json');
  }

  async init() {
    // Ensure analytics directory exists
    await fs.mkdir(this.analyticsDir, { recursive: true });
    
    // Load existing metrics
    try {
      const data = await fs.readFile(this.analyticsFile, 'utf8');
      this.metrics = JSON.parse(data);
    } catch {
      this.metrics = {
        totalSessions: 0,
        generators: {},
        averageTimeToFirstSuccess: null,
        successRate: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Track generator start
  async trackStart(generatorType, componentName) {
    const session = {
      id: Date.now().toString(),
      generator: generatorType,
      componentName,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      success: null,
      filesCreated: 0,
      error: null
    };
    
    await fs.writeFile(this.sessionFile, JSON.stringify(session, null, 2));
    return session.id;
  }

  // Track generator completion
  async trackComplete(sessionId, options = {}) {
    try {
      const sessionData = await fs.readFile(this.sessionFile, 'utf8');
      const session = JSON.parse(sessionData);
      
      if (session.id !== sessionId) {
        throw new Error('Session ID mismatch');
      }
      
      // Update session
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      session.success = options.success !== false;
      session.filesCreated = options.filesCreated || 0;
      session.error = options.error || null;
      
      // Update metrics
      await this.updateMetrics(session);
      
      // Clean up session file
      await fs.unlink(this.sessionFile).catch(() => {});
      
      return session;
    } catch (error) {
      console.error('Failed to track completion:', error);
      return null;
    }
  }

  // Update aggregate metrics
  async updateMetrics(session) {
    // Initialize generator metrics if needed
    if (!this.metrics.generators[session.generator]) {
      this.metrics.generators[session.generator] = {
        uses: 0,
        successes: 0,
        failures: 0,
        totalDuration: 0,
        averageDuration: 0,
        filesCreated: 0,
        errors: []
      };
    }
    
    const genMetrics = this.metrics.generators[session.generator];
    
    // Update counts
    genMetrics.uses++;
    if (session.success) {
      genMetrics.successes++;
    } else {
      genMetrics.failures++;
      if (session.error) {
        genMetrics.errors.push({
          timestamp: new Date().toISOString(),
          error: session.error
        });
      }
    }
    
    // Update performance metrics
    genMetrics.totalDuration += session.duration;
    genMetrics.averageDuration = Math.round(genMetrics.totalDuration / genMetrics.uses);
    genMetrics.filesCreated += session.filesCreated;
    
    // Update global metrics
    this.metrics.totalSessions++;
    this.calculateGlobalMetrics();
    
    // Save metrics
    await this.save();
  }

  // Calculate global metrics
  calculateGlobalMetrics() {
    let totalSuccesses = 0;
    let totalUses = 0;
    let totalDuration = 0;
    
    for (const gen of Object.values(this.metrics.generators)) {
      totalSuccesses += gen.successes;
      totalUses += gen.uses;
      totalDuration += gen.totalDuration;
    }
    
    this.metrics.successRate = totalUses > 0 
      ? Math.round((totalSuccesses / totalUses) * 100) 
      : 0;
      
    this.metrics.averageGenerationTime = totalUses > 0
      ? Math.round(totalDuration / totalUses)
      : 0;
      
    this.metrics.lastUpdated = new Date().toISOString();
  }

  // Save metrics to file
  async save() {
    await fs.writeFile(
      this.analyticsFile, 
      JSON.stringify(this.metrics, null, 2)
    );
  }

  // Get performance report
  async getReport() {
    await this.init();
    
    const report = {
      summary: {
        totalGenerations: this.metrics.totalSessions,
        overallSuccessRate: `${this.metrics.successRate}%`,
        averageGenerationTime: `${(this.metrics.averageGenerationTime / 1000).toFixed(1)}s`,
        lastUpdated: this.metrics.lastUpdated
      },
      generators: {}
    };
    
    // Add generator-specific metrics
    for (const [name, metrics] of Object.entries(this.metrics.generators)) {
      report.generators[name] = {
        uses: metrics.uses,
        successRate: `${Math.round((metrics.successes / metrics.uses) * 100)}%`,
        averageDuration: `${(metrics.averageDuration / 1000).toFixed(1)}s`,
        filesPerGeneration: (metrics.filesCreated / metrics.uses).toFixed(1),
        recentErrors: metrics.errors.slice(-5)
      };
    }
    
    return report;
  }

  // Export raw data
  async exportData() {
    await this.init();
    return this.metrics;
  }

  // Reset metrics
  async reset() {
    this.metrics = {
      totalSessions: 0,
      generators: {},
      averageTimeToFirstSuccess: null,
      successRate: 0,
      lastUpdated: new Date().toISOString()
    };
    await this.save();
  }
}

// CLI interface
if (require.main === module) {
  const analytics = new GeneratorAnalytics();
  const command = process.argv[2];
  
  (async () => {
    switch (command) {
      case 'report':
        await analytics.init();
        const report = await analytics.getReport();
        console.log('\n📊 Generator Analytics Report');
        console.log('============================\n');
        console.log('Summary:');
        console.log(`  Total Generations: ${report.summary.totalGenerations}`);
        console.log(`  Success Rate: ${report.summary.overallSuccessRate}`);
        console.log(`  Average Time: ${report.summary.averageGenerationTime}`);
        console.log('\nBy Generator:');
        for (const [name, data] of Object.entries(report.generators)) {
          console.log(`\n  ${name}:`);
          console.log(`    Uses: ${data.uses}`);
          console.log(`    Success Rate: ${data.successRate}`);
          console.log(`    Avg Duration: ${data.averageDuration}`);
          console.log(`    Files/Generation: ${data.filesPerGeneration}`);
        }
        break;
        
      case 'export':
        const data = await analytics.exportData();
        console.log(JSON.stringify(data, null, 2));
        break;
        
      case 'reset':
        await analytics.reset();
        console.log('Analytics data reset');
        break;
        
      default:
        console.log('Usage: generator-analytics.js [report|export|reset]');
    }
  })().catch(console.error);
}

module.exports = GeneratorAnalytics;