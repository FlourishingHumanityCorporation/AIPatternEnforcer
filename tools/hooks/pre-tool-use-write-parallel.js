#!/usr/bin/env node

/**
 * PreToolUse Write-Only Parallel Hook Executor
 * Entry point for Claude Code PreToolUse hooks that only apply to Write operations
 */

const ParallelHookExecutor = require("./parallel-hook-executor");

// Create executor for PreToolUse Write-only hooks
const executor = ParallelHookExecutor.createForHookType("PreToolUse", "Write");

// Execute and handle any errors
executor.execute().catch((error) => {
  if (process.env.HOOK_VERBOSE === "true") {
    process.stderr.write(
      `💥 PreToolUse Write parallel execution failed: ${error.message}\n`,
    );
  }
  process.exit(0); // Fail-safe: don't block operations
});
