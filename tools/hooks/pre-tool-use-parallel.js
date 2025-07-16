#!/usr/bin/env node

/**
 * PreToolUse Parallel Hook Executor
 * Entry point for Claude Code PreToolUse hooks with parallel execution
 */

const ParallelHookExecutor = require("./parallel-hook-executor");

// Create executor for PreToolUse hooks
const executor = ParallelHookExecutor.createForHookType(
  "PreToolUse",
  "Write|Edit|MultiEdit",
);

// Execute and handle any errors
executor.execute().catch((error) => {
  if (process.env.HOOK_VERBOSE === "true") {
    process.stderr.write(
      `💥 PreToolUse parallel execution failed: ${error.message}\n`,
    );
  }
  process.exit(0); // Fail-safe: don't block operations
});
