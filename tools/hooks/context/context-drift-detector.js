#!/usr/bin/env node

/**
 * Context Drift Detector
 *
 * Simple drift detection based on time and file changes
 * Prevents stale context from causing bad AI suggestions
 */

const { HookRunner } = require("../lib");
const {
  readState,
  getRecentFileChanges,
  trackFileChange,
} = require("../lib/state-manager");
const { DRIFT_THRESHOLDS, MESSAGES } = require("../lib/constants");

function contextDriftDetector(hookData, runner) {
  try {
    const startTime = Date.now();

    // Track this file change
    if (hookData.file_path) {
      trackFileChange(hookData.file_path);
    }

    // Calculate simple drift
    const drift = calculateSimpleDrift();

    // Check drift thresholds
    if (drift >= DRIFT_THRESHOLDS.HIGH) {
      return runner.block(
        [
          `❌ Context critically stale (drift: ${Math.round(drift * 100)}%)`,
          "",
          "🔄 Your context is too old and many files have changed.",
          "⚡ Quick fix: Run 'npm run context' to refresh",
          "",
          "This prevents AI from using outdated information.",
        ].join("\n"),
      );
    }

    if (drift >= DRIFT_THRESHOLDS.MEDIUM) {
      // Just warn, don't block
      console.warn(
        `⚠️  Context getting stale (drift: ${Math.round(drift * 100)}%)`,
      );
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Drift detection took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`Drift detection failed: ${error.message}`);
    return runner.allow();
  }
}

function calculateSimpleDrift() {
  const state = readState();

  // Factor 1: Time since last context update (40% weight)
  const lastUpdate =
    state.lastContextUpdate || state.sessionStart || Date.now();
  const hoursSinceUpdate = (Date.now() - lastUpdate) / (60 * 60 * 1000);
  const timeDrift = Math.min(hoursSinceUpdate / 2, 1); // Max out at 2 hours

  // Factor 2: Number of file changes (40% weight)
  const recentChanges = getRecentFileChanges(30); // Last 30 minutes
  const fileChangeDrift = Math.min(recentChanges.length / 20, 1); // Max out at 20 files

  // Factor 3: Message count (20% weight)
  const messageCount = state.messageCount || 0;
  const conversationDrift = Math.min(messageCount / 100, 1); // Max out at 100 messages

  // Simple weighted average
  const totalDrift =
    timeDrift * 0.4 + fileChangeDrift * 0.4 + conversationDrift * 0.2;

  return totalDrift;
}

// Create and run the hook
HookRunner.create("context-drift-detector", contextDriftDetector, {
  timeout: 50,
  priority: "high",
  family: "context",
});
