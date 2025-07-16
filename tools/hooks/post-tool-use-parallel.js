#!/usr/bin/env node

/**
 * PostToolUse Parallel Hook Executor
 * Entry point for Claude Code PostToolUse hooks with parallel execution
 */

const ParallelHookExecutor = require("./parallel-hook-executor");

// Create executor for PostToolUse hooks
const executor = ParallelHookExecutor.createForHookType(
  "PostToolUse",
  "Write|Edit|MultiEdit",
);

// Execute and handle any errors
executor.execute().catch((error) => {
  if (process.env.HOOK_VERBOSE === "true") {
    process.stderr.write(
      `💥 PostToolUse parallel execution failed: ${error.message}\n`,
    );
  }
  process.exit(0); // Fail-safe: don't block operations
});
