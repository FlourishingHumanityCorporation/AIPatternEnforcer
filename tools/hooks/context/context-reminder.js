#!/usr/bin/env node

/**
 * Context Reminder (Notification Hook)
 *
 * Simple idle reminder to refresh context after 30 minutes
 * Prevents stale context from degrading AI suggestions
 */

const { HookRunner } = require("../lib");
const { readState, getSessionDuration } = require("../lib/state-manager");
const { SESSION_LIMITS, MESSAGES } = require("../lib/constants");

function contextReminder(hookData, runner) {
  try {
    const startTime = Date.now();

    // Only run for significant operations
    if (!["Write", "Edit", "MultiEdit"].includes(hookData.tool_name)) {
      return runner.allow();
    }

    // Check session duration
    const sessionMinutes = getSessionDuration();
    const state = readState();

    // Check for idle time (30 minutes by default)
    const lastActivity = state.lastActivity || state.sessionStart || Date.now();
    const idleMinutes = Math.floor((Date.now() - lastActivity) / 60000);

    // Notification thresholds
    const shouldNotify =
      idleMinutes >= SESSION_LIMITS.IDLE_TIME_MINUTES ||
      sessionMinutes >= SESSION_LIMITS.MAX_SESSION_HOURS * 60 ||
      (state.messageCount || 0) >= SESSION_LIMITS.MAX_MESSAGE_COUNT;

    if (shouldNotify) {
      // Just log a reminder - don't block
      const reasons = [];

      if (idleMinutes >= SESSION_LIMITS.IDLE_TIME_MINUTES) {
        reasons.push(`idle for ${idleMinutes} minutes`);
      }

      if (sessionMinutes >= SESSION_LIMITS.MAX_SESSION_HOURS * 60) {
        reasons.push(
          `session running for ${Math.floor(sessionMinutes / 60)} hours`,
        );
      }

      if ((state.messageCount || 0) >= SESSION_LIMITS.MAX_MESSAGE_COUNT) {
        reasons.push(`${state.messageCount} messages in conversation`);
      }

      console.warn(
        [
          "",
          "🔔 Context Reminder",
          `⏰ You've been ${reasons.join(", ")}`,
          "💡 Consider refreshing context with: npm run context",
          "",
          "Fresh context = better AI suggestions!",
        ].join("\n"),
      );

      // Update last notification time to avoid spam
      state.lastContextReminder = Date.now();
      require("../lib/state-manager").writeState(state);
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Context reminder took ${executionTime}ms (target: <50ms)`);
    }

    // Always allow - this is just a notification
    return runner.allow();
  } catch (error) {
    console.error(`Context reminder failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("context-reminder", contextReminder, {
  timeout: 50,
  priority: "low", // Low priority since it's just a notification
  family: "context",
});
