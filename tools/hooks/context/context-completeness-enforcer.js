#!/usr/bin/env node

/**
 * Context Completeness Enforcer
 *
 * Simple context scoring to prevent AI from making assumptions
 * For the "super lazy developer" who forgets to provide context
 */

const { HookRunner } = require("../lib");
const {
  readState,
  writeState,
  incrementMessageCount,
} = require("../lib/state-manager");
const { hasClaudeMdReference } = require("../lib/shared-utils");
const { CONTEXT_THRESHOLDS } = require("../lib/constants");

function contextCompletenessEnforcer(hookData, runner) {
  try {
    const startTime = Date.now();

    // Increment message count
    incrementMessageCount();

    // Simple context scoring
    const score = calculateContextScore(hookData);

    // Cache the score
    const state = readState();
    state.contextScore = score;
    state.lastContextCheck = Date.now();
    writeState(state);

    // Simple threshold check
    const threshold =
      CONTEXT_THRESHOLDS[hookData.tool_name] || CONTEXT_THRESHOLDS.Default;

    if (score < threshold) {
      return runner.block(
        [
          `❌ Insufficient context (score: ${score}/${threshold})`,
          "",
          "💡 Quick fixes:",
          "  1. Run: npm run context",
          "  2. Reference CLAUDE.md in your prompt",
          "  3. Include relevant file paths",
          "",
          "This prevents AI from making assumptions that create messy code.",
        ].join("\n"),
      );
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Context check took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    // Always fail open - don't block on errors
    console.error(`Context check failed: ${error.message}`);
    return runner.allow();
  }
}

function calculateContextScore(hookData) {
  let score = 0;

  // Check 1: CLAUDE.md mentioned (40 points)
  if (hasClaudeMdReference(hookData)) {
    score += 40;
  }

  // Check 2: File paths provided (30 points)
  if (
    hookData.file_path ||
    (hookData.content && hookData.content.includes("/"))
  ) {
    score += 30;
  }

  // Check 3: Not too deep in conversation (30 points)
  const state = readState();
  const messageCount = state.messageCount || 0;
  if (messageCount < 50) {
    score += 30 - (messageCount / 50) * 20;
  }

  return Math.round(score);
}

// Create and run the hook
HookRunner.create(
  "context-completeness-enforcer",
  contextCompletenessEnforcer,
  {
    timeout: 50, // 50ms max
    priority: "critical",
    family: "context",
  },
);
