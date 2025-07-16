#!/usr/bin/env node

/**
 * Real-time Hook Monitoring System
 *
 * Provides live monitoring of hook execution during AI development
 * with filtering, statistics, and performance tracking
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

class RealTimeHookMonitor {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.hooksDir = path.join(this.projectRoot, "tools", "hooks");
    this.logsDir = path.join(this.hooksDir, "logs");
    this.isMonitoring = false;
    this.stats = {
      totalExecutions: 0,
      blockedOperations: 0,
      allowedOperations: 0,
      avgExecutionTime: 0,
      hookExecutions: {},
    };
    this.watchers = [];
    this.startTime = Date.now();
  }

  findProjectRoot() {
    let current = process.cwd();
    while (current !== path.dirname(current)) {
      if (fs.existsSync(path.join(current, "package.json"))) {
        return current;
      }
      current = path.dirname(current);
    }
    return process.cwd();
  }

  /**
   * Start real-time monitoring
   */
  async start(options = {}) {
    const {
      filter = "",
      showStats = true,
      verboseMode = false,
      clearScreen = true,
    } = options;

    if (clearScreen) {
      console.clear();
    }

    console.log("🔍 Real-time Hook Monitoring System");
    console.log("==================================");
    console.log(`📊 Started at: ${new Date().toLocaleString()}`);
    console.log(`📁 Project: ${path.basename(this.projectRoot)}`);
    console.log(`🎯 Filter: ${filter || "None - showing all hooks"}`);
    console.log(`🔧 Verbose: ${verboseMode ? "Enabled" : "Disabled"}`);
    console.log("");
    console.log(
      "💡 Run Claude Code operations in another terminal to see hooks in action",
    );
    console.log("📋 Press Ctrl+C to stop monitoring");
    console.log("");

    this.isMonitoring = true;
    this.filter = filter;
    this.verboseMode = verboseMode;
    this.showStats = showStats;

    // Set up monitoring
    this.setupEnvironment();
    this.watchLogDirectory();
    this.watchClaudeSettings();
    this.startStatsUpdater();

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      this.stop();
    });

    // Keep process alive
    await new Promise(() => {});
  }

  /**
   * Set up monitoring environment
   */
  setupEnvironment() {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    // Create a monitoring log file
    const monitorLogPath = path.join(this.logsDir, "monitor-session.log");
    const sessionStart = `SESSION_START: ${new Date().toISOString()}\n`;
    fs.writeFileSync(monitorLogPath, sessionStart);

    console.log("✅ Monitoring environment set up");
    console.log(`📝 Session log: ${monitorLogPath}`);
    console.log("");
  }

  /**
   * Watch log directory for changes
   */
  watchLogDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      console.log(
        "⚠️  Logs directory not found - hooks may not be generating logs",
      );
      return;
    }

    let lastSeen = {};

    const checkForChanges = () => {
      if (!this.isMonitoring) return;

      try {
        const files = fs.readdirSync(this.logsDir);

        files.forEach((file) => {
          if (file === "monitor-session.log") return;

          const filePath = path.join(this.logsDir, file);
          const stats = fs.statSync(filePath);
          const mtime = stats.mtime.getTime();

          if (!lastSeen[file] || lastSeen[file] < mtime) {
            if (lastSeen[file]) {
              // Not first time seeing this file
              this.handleLogUpdate(file, filePath);
            }
            lastSeen[file] = mtime;
          }
        });
      } catch (error) {
        // Ignore errors
      }
    };

    // Check every second
    const interval = setInterval(checkForChanges, 1000);
    this.watchers.push(interval);

    checkForChanges(); // Initial check
  }

  /**
   * Watch Claude settings for changes
   */
  watchClaudeSettings() {
    const settingsPath = path.join(
      this.projectRoot,
      ".claude",
      "settings.json",
    );

    if (!fs.existsSync(settingsPath)) {
      return;
    }

    try {
      fs.watchFile(settingsPath, { interval: 2000 }, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
          this.logEvent(
            "⚙️  Claude settings.json updated - hooks may have changed",
          );
        }
      });
    } catch (error) {
      // Ignore watch errors
    }
  }

  /**
   * Handle log file updates
   */
  handleLogUpdate(filename, filePath) {
    const hookName = path.basename(filename, ".log");

    // Apply filter if specified
    if (this.filter && !hookName.includes(this.filter)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n").filter((line) => line.trim());

      if (lines.length === 0) return;

      // Parse the last few entries
      const recentEntries = lines.slice(-3);

      recentEntries.forEach((line) => {
        this.parseLogEntry(line, hookName);
      });
    } catch (error) {
      // Ignore read errors
    }
  }

  /**
   * Parse log entry and extract information
   */
  parseLogEntry(line, hookName) {
    try {
      // Expected format: timestamp|hook|pattern|blocked|metadata
      const parts = line.split("|");
      if (parts.length >= 4) {
        const [timestamp, hook, pattern, blocked, metadata] = parts;
        const isBlocked = blocked === "1";

        // Update statistics
        this.updateStats(hookName, isBlocked);

        // Display the event
        this.displayHookEvent({
          timestamp: new Date(timestamp),
          hookName: hook,
          pattern,
          blocked: isBlocked,
          metadata: metadata ? JSON.parse(metadata) : {},
        });
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  /**
   * Update monitoring statistics
   */
  updateStats(hookName, isBlocked) {
    this.stats.totalExecutions++;

    if (isBlocked) {
      this.stats.blockedOperations++;
    } else {
      this.stats.allowedOperations++;
    }

    // Track per-hook statistics
    if (!this.stats.hookExecutions[hookName]) {
      this.stats.hookExecutions[hookName] = {
        total: 0,
        blocked: 0,
        allowed: 0,
      };
    }

    this.stats.hookExecutions[hookName].total++;
    if (isBlocked) {
      this.stats.hookExecutions[hookName].blocked++;
    } else {
      this.stats.hookExecutions[hookName].allowed++;
    }
  }

  /**
   * Display hook execution event
   */
  displayHookEvent(event) {
    const timestamp = event.timestamp.toLocaleTimeString();
    const status = event.blocked ? "🚫 BLOCKED" : "✅ ALLOWED";
    const hook = event.hookName.padEnd(20);
    const pattern = event.pattern.substring(0, 30);

    console.log(`${timestamp} │ ${status} │ ${hook} │ ${pattern}`);

    if (this.verboseMode && event.metadata.fileExt) {
      console.log(
        `         │         │ ${" ".repeat(20)} │ File: ${event.metadata.fileExt}`,
      );
    }
  }

  /**
   * Log general events
   */
  logEvent(message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${timestamp} │ ${message}`);
  }

  /**
   * Start periodic statistics updates
   */
  startStatsUpdater() {
    if (!this.showStats) return;

    const updateStats = () => {
      if (!this.isMonitoring) return;

      // Clear previous stats display (simple approach)
      this.displayStats();
    };

    // Update stats every 10 seconds
    const interval = setInterval(updateStats, 10000);
    this.watchers.push(interval);
  }

  /**
   * Display current statistics
   */
  displayStats() {
    const runtime = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(runtime / 60);
    const seconds = runtime % 60;

    console.log("");
    console.log("📊 Session Statistics");
    console.log(`⏱️  Runtime: ${minutes}m ${seconds}s`);
    console.log(`🔄 Total Executions: ${this.stats.totalExecutions}`);
    console.log(`✅ Allowed: ${this.stats.allowedOperations}`);
    console.log(`🚫 Blocked: ${this.stats.blockedOperations}`);

    if (this.stats.totalExecutions > 0) {
      const blockRate = (
        (this.stats.blockedOperations / this.stats.totalExecutions) *
        100
      ).toFixed(1);
      console.log(`📈 Block Rate: ${blockRate}%`);
    }

    // Show top active hooks
    const topHooks = Object.entries(this.stats.hookExecutions)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    if (topHooks.length > 0) {
      console.log("\n🏆 Most Active Hooks:");
      topHooks.forEach(([hook, stats]) => {
        const blockRate =
          stats.total > 0
            ? ((stats.blocked / stats.total) * 100).toFixed(1)
            : "0";
        console.log(
          `   ${hook}: ${stats.total} executions (${blockRate}% blocked)`,
        );
      });
    }

    console.log("");
  }

  /**
   * Stop monitoring
   */
  stop() {
    console.log("\n🛑 Stopping hook monitoring...");

    this.isMonitoring = false;

    // Clear all watchers
    this.watchers.forEach((watcher) => {
      if (typeof watcher === "number") {
        clearInterval(watcher);
      }
    });

    // Stop file watchers
    fs.unwatchFile(path.join(this.projectRoot, ".claude", "settings.json"));

    // Display final statistics
    this.displayFinalStats();

    console.log("👋 Monitoring stopped");
    process.exit(0);
  }

  /**
   * Display final session statistics
   */
  displayFinalStats() {
    console.log("\n📊 Final Session Statistics");
    console.log("============================");
    this.displayStats();

    // Save session summary
    const sessionSummary = {
      endTime: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      stats: this.stats,
    };

    const summaryPath = path.join(this.logsDir, "last-session-summary.json");
    try {
      fs.writeFileSync(summaryPath, JSON.stringify(sessionSummary, null, 2));
      console.log(`💾 Session summary saved to: ${summaryPath}`);
    } catch (error) {
      // Ignore save errors
    }
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new RealTimeHookMonitor();

  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  args.forEach((arg) => {
    if (arg.startsWith("--filter=")) {
      options.filter = arg.split("=")[1];
    } else if (arg === "--verbose" || arg === "-v") {
      options.verboseMode = true;
    } else if (arg === "--no-stats") {
      options.showStats = false;
    } else if (arg === "--no-clear") {
      options.clearScreen = false;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Real-time Hook Monitoring System

Usage: node real-time-monitor.js [options]

Options:
  --filter=<pattern>   Filter hooks by name pattern
  --verbose, -v        Show detailed hook information
  --no-stats          Disable periodic statistics updates
  --no-clear          Don't clear screen on start
  --help, -h          Show this help message

Examples:
  node real-time-monitor.js
  node real-time-monitor.js --filter=security
  node real-time-monitor.js --verbose --filter=prevent
`);
      process.exit(0);
    }
  });

  monitor.start(options).catch((error) => {
    console.error("❌ Monitor failed:", error.message);
    process.exit(1);
  });
}

module.exports = RealTimeHookMonitor;
