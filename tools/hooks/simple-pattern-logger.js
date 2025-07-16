#!/usr/bin/env node

/**
 * Simple Pattern Logger
 *
 * Minimal replacement for complex learning system.
 * Just logs patterns for template maintainer review - no adaptive behavior.
 *
 * Designed for:
 * - Template maintainers to discover new AI mistake patterns
 * - Zero configuration for end users
 * - Sustainable hook improvement without complexity
 *
 * NOT designed for:
 * - Real-time adaptation or A/B testing
 * - Statistical analysis or machine learning
 * - Automatic parameter adjustment
 * - Enterprise monitoring or alerting
 */

const fs = require("fs");
const path = require("path");

class SimplePatternLogger {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(__dirname, "logs");
    this.enabled =
      options.enabled !== false && process.env.SIMPLE_LOGGING !== "false";
    this.maxLogSize = options.maxLogSize || 1024 * 1024; // 1MB

    // Ensure log directory exists
    if (this.enabled && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log a hook execution pattern
   * Simple format: timestamp|hook|pattern|blocked
   */
  logPattern(hookName, pattern, blocked = false, metadata = {}) {
    if (!this.enabled) return;

    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        hook: hookName,
        pattern,
        blocked: blocked ? 1 : 0,
        metadata: this.sanitizeMetadata(metadata),
      };

      const logLine = this.formatLogEntry(logEntry);
      const logFile = path.join(this.logDir, `${hookName}.log`);

      // Rotate log if too large
      this.rotateLogIfNeeded(logFile);

      // Append to log file
      fs.appendFileSync(logFile, logLine + "\n");
    } catch (error) {
      // Silent failure - logging shouldn't break hooks
      console.error("SimplePatternLogger error:", error.message);
    }
  }

  /**
   * Format log entry as simple pipe-separated line
   */
  formatLogEntry(entry) {
    return [
      entry.timestamp,
      entry.hook,
      entry.pattern,
      entry.blocked,
      JSON.stringify(entry.metadata),
    ].join("|");
  }

  /**
   * Keep only essential metadata to avoid log bloat
   */
  sanitizeMetadata(metadata) {
    return {
      fileExt: metadata.fileExtension,
      success: metadata.success ? 1 : 0,
      execTime: metadata.executionTime,
    };
  }

  /**
   * Rotate log file if it gets too large
   */
  rotateLogIfNeeded(logFile) {
    try {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > this.maxLogSize) {
          const backupFile = logFile + ".old";
          if (fs.existsSync(backupFile)) {
            fs.unlinkSync(backupFile); // Delete old backup
          }
          fs.renameSync(logFile, backupFile);
        }
      }
    } catch (error) {
      // Silent failure
    }
  }

  /**
   * Generate simple weekly report for template maintainers
   */
  generateWeeklyReport(hookName = null) {
    if (!this.enabled) return null;

    try {
      const report = {
        generatedAt: new Date().toISOString(),
        period: "Last 7 days",
        summary: {},
        topBlockedPatterns: [],
        recommendations: [],
      };

      const logFiles = this.getLogFiles(hookName);
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      for (const logFile of logFiles) {
        const hookName = path.basename(logFile, ".log");
        const entries = this.parseLogFile(logFile, oneWeekAgo);

        const hookSummary = this.summarizeHookEntries(entries);
        report.summary[hookName] = hookSummary;

        // Collect blocked patterns
        const blockedPatterns = entries
          .filter((e) => e.blocked)
          .reduce((acc, e) => {
            acc[e.pattern] = (acc[e.pattern] || 0) + 1;
            return acc;
          }, {});

        Object.entries(blockedPatterns).forEach(([pattern, count]) => {
          report.topBlockedPatterns.push({ hookName, pattern, count });
        });
      }

      // Sort and limit top patterns
      report.topBlockedPatterns.sort((a, b) => b.count - a.count);
      report.topBlockedPatterns = report.topBlockedPatterns.slice(0, 10);

      // Generate simple recommendations
      report.recommendations = this.generateRecommendations(report);

      return report;
    } catch (error) {
      console.error("Report generation error:", error.message);
      return null;
    }
  }

  /**
   * Get list of log files to process
   */
  getLogFiles(hookName = null) {
    try {
      const files = fs
        .readdirSync(this.logDir)
        .filter((f) => f.endsWith(".log"))
        .map((f) => path.join(this.logDir, f));

      if (hookName) {
        return files.filter((f) => path.basename(f, ".log") === hookName);
      }

      return files;
    } catch (error) {
      return [];
    }
  }

  /**
   * Parse log file entries since cutoff date
   */
  parseLogFile(logFile, cutoffDate) {
    try {
      const content = fs.readFileSync(logFile, "utf8");
      return content
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [timestamp, hook, pattern, blocked, metadata] = line.split("|");
          return {
            timestamp: new Date(timestamp),
            hook,
            pattern,
            blocked: parseInt(blocked),
            metadata: JSON.parse(metadata || "{}"),
          };
        })
        .filter((entry) => entry.timestamp.getTime() > cutoffDate);
    } catch (error) {
      return [];
    }
  }

  /**
   * Summarize hook entries
   */
  summarizeHookEntries(entries) {
    const summary = {
      totalExecutions: entries.length,
      blockedCount: entries.filter((e) => e.blocked).length,
      blockRate: 0,
      avgExecutionTime: 0,
      topPatterns: {},
    };

    if (entries.length > 0) {
      summary.blockRate = (
        (summary.blockedCount / summary.totalExecutions) *
        100
      ).toFixed(1);

      const execTimes = entries
        .map((e) => e.metadata.execTime)
        .filter((t) => typeof t === "number");

      if (execTimes.length > 0) {
        summary.avgExecutionTime = (
          execTimes.reduce((a, b) => a + b, 0) / execTimes.length
        ).toFixed(1);
      }

      // Count pattern occurrences
      entries.forEach((entry) => {
        summary.topPatterns[entry.pattern] =
          (summary.topPatterns[entry.pattern] || 0) + 1;
      });
    }

    return summary;
  }

  /**
   * Generate simple recommendations based on patterns
   */
  generateRecommendations(report) {
    const recommendations = [];

    // High block rate hooks
    Object.entries(report.summary).forEach(([hookName, summary]) => {
      if (summary.blockRate > 20) {
        recommendations.push({
          type: "high_block_rate",
          hook: hookName,
          message: `${hookName} blocks ${summary.blockRate}% of attempts - consider if patterns are too strict`,
        });
      }
    });

    // Frequently blocked patterns
    const topPatterns = report.topBlockedPatterns.slice(0, 3);
    topPatterns.forEach(({ pattern, count }) => {
      if (count > 5) {
        recommendations.push({
          type: "frequent_pattern",
          pattern,
          message: `Pattern "${pattern}" blocked ${count} times - consider adding to static prevention rules`,
        });
      }
    });

    return recommendations;
  }

  /**
   * Save weekly report to file
   */
  saveWeeklyReport() {
    const report = this.generateWeeklyReport();
    if (!report) return null;

    try {
      const reportFile = path.join(this.logDir, "weekly-report.json");
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      // Also create human-readable summary
      const summaryFile = path.join(this.logDir, "weekly-summary.txt");
      const summary = this.formatReportSummary(report);
      fs.writeFileSync(summaryFile, summary);

      return { reportFile, summaryFile, report };
    } catch (error) {
      console.error("Report save error:", error.message);
      return null;
    }
  }

  /**
   * Format report as human-readable summary
   */
  formatReportSummary(report) {
    let summary = `Hook Pattern Summary - ${report.generatedAt}\n`;
    summary += `Period: ${report.period}\n\n`;

    summary += `Hook Performance:\n`;
    Object.entries(report.summary).forEach(([hook, stats]) => {
      summary += `  ${hook}: ${stats.totalExecutions} executions, ${stats.blockRate}% blocked\n`;
    });

    summary += `\nTop Blocked Patterns:\n`;
    report.topBlockedPatterns
      .slice(0, 5)
      .forEach(({ hookName, pattern, count }) => {
        summary += `  ${pattern} (${hookName}): ${count} times\n`;
      });

    if (report.recommendations.length > 0) {
      summary += `\nRecommendations:\n`;
      report.recommendations.forEach((rec) => {
        summary += `  - ${rec.message}\n`;
      });
    }

    return summary;
  }
}

module.exports = SimplePatternLogger;

// CLI usage
if (require.main === module) {
  const logger = new SimplePatternLogger();

  if (process.argv[2] === "report") {
    const result = logger.saveWeeklyReport();
    if (result) {
      console.log("Weekly report generated:");
      console.log("JSON:", result.reportFile);
      console.log("Summary:", result.summaryFile);
      console.log("\nTop patterns this week:");
      result.report.topBlockedPatterns.slice(0, 5).forEach((p) => {
        console.log(`  ${p.pattern}: ${p.count} blocks`);
      });
    } else {
      console.log("No data to report or logging disabled");
    }
  } else if (process.argv[2] === "test") {
    // Test logging
    logger.logPattern("test-hook", "/src/component_improved.tsx", true, {
      fileExtension: ".tsx",
      success: false,
      executionTime: 45,
    });
    console.log("Test pattern logged");
  } else {
    console.log(`
Simple Pattern Logger - Usage:

  node simple-pattern-logger.js report  # Generate weekly report
  node simple-pattern-logger.js test    # Test logging

Environment Variables:
  SIMPLE_LOGGING=false                   # Disable logging

For hook integration:
  const logger = new SimplePatternLogger();
  logger.logPattern(hookName, pattern, blocked, metadata);
`);
  }
}
