#!/usr/bin/env node

/**
 * Performance benchmark comparing sequential vs parallel hook execution
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

class PerformanceBenchmark {
  constructor() {
    this.results = {
      sequential: [],
      parallel: [],
    };
  }

  /**
   * Run a single hook sequentially
   */
  async runHookSequential(hookCommand, input) {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const child = spawn("node", [hookCommand], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
        env: { ...process.env, HOOK_VERBOSE: "false" },
      });

      child.stdin.write(JSON.stringify(input));
      child.stdin.end();

      let stderr = "";
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        const duration = Date.now() - startTime;
        resolve({
          command: hookCommand,
          duration,
          exitCode: code,
          stderr: stderr.trim(),
        });
      });

      child.on("error", (error) => {
        const duration = Date.now() - startTime;
        resolve({
          command: hookCommand,
          duration,
          error: error.message,
        });
      });
    });
  }

  /**
   * Run all hooks sequentially (old way)
   */
  async runSequentialExecution(input) {
    const startTime = Date.now();

    // Get hooks from the backup configuration
    const backupPath = path.join(
      process.cwd(),
      ".claude",
      "settings.json.backup",
    );
    const config = JSON.parse(fs.readFileSync(backupPath, "utf8"));

    const preToolUseHooks = [];
    const postToolUseHooks = [];

    // Extract PreToolUse hooks
    if (config.hooks.PreToolUse) {
      for (const group of config.hooks.PreToolUse) {
        if (group.hooks) {
          preToolUseHooks.push(...group.hooks);
        }
      }
    }

    // Extract PostToolUse hooks
    if (config.hooks.PostToolUse) {
      for (const group of config.hooks.PostToolUse) {
        if (group.hooks) {
          postToolUseHooks.push(...group.hooks);
        }
      }
    }

    const allHooks = [...preToolUseHooks, ...postToolUseHooks];
    const results = [];

    console.log(`🐌 Running ${allHooks.length} hooks sequentially...`);

    for (const hook of allHooks) {
      const result = await this.runHookSequential(hook.command, input);
      results.push(result);

      if (result.exitCode === 2) {
        console.log(`🚫 Hook blocked: ${hook.command}`);
        break;
      }
    }

    const totalDuration = Date.now() - startTime;

    return {
      totalDuration,
      hookCount: results.length,
      results,
      blocked: results.some((r) => r.exitCode === 2),
      errors: results.filter((r) => r.error).length,
    };
  }

  /**
   * Run parallel execution (new way)
   */
  async runParallelExecution(input) {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const child = spawn("node", ["tools/hooks/pre-tool-use-parallel.js"], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
        env: { ...process.env, HOOK_VERBOSE: "true" },
      });

      child.stdin.write(JSON.stringify(input));
      child.stdin.end();

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        const totalDuration = Date.now() - startTime;

        // Parse hook count from stderr
        const hookCountMatch = stderr.match(
          /Starting parallel execution of (\d+) hooks/,
        );
        const hookCount = hookCountMatch ? parseInt(hookCountMatch[1]) : 0;

        resolve({
          totalDuration,
          hookCount,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          blocked: code === 2,
          errors: (stderr.match(/❌/g) || []).length,
        });
      });

      child.on("error", (error) => {
        const totalDuration = Date.now() - startTime;
        resolve({
          totalDuration,
          error: error.message,
        });
      });
    });
  }

  /**
   * Run benchmark comparison
   */
  async runBenchmark() {
    console.log("🏁 Starting Performance Benchmark");
    console.log("==================================");

    const testInput = {
      tool_name: "Write",
      tool_input: {
        file_path: "/test/benchmark.js",
        content: 'console.log("Performance test");',
      },
    };

    // Run multiple iterations for accurate results
    const iterations = 3;
    const sequentialResults = [];
    const parallelResults = [];

    console.log(`📊 Running ${iterations} iterations of each test...\n`);

    // Sequential execution benchmark
    console.log("🐌 Benchmarking Sequential Execution:");
    for (let i = 0; i < iterations; i++) {
      console.log(`  Iteration ${i + 1}/${iterations}...`);
      const result = await this.runSequentialExecution(testInput);
      sequentialResults.push(result);
      console.log(
        `    Duration: ${result.totalDuration}ms, Hooks: ${result.hookCount}`,
      );
    }

    // Parallel execution benchmark
    console.log("\n🚀 Benchmarking Parallel Execution:");
    for (let i = 0; i < iterations; i++) {
      console.log(`  Iteration ${i + 1}/${iterations}...`);
      const result = await this.runParallelExecution(testInput);
      parallelResults.push(result);
      console.log(
        `    Duration: ${result.totalDuration}ms, Hooks: ${result.hookCount}`,
      );
    }

    // Calculate statistics
    const sequentialStats = this.calculateStats(sequentialResults);
    const parallelStats = this.calculateStats(parallelResults);

    return {
      sequential: sequentialStats,
      parallel: parallelStats,
      iterations,
    };
  }

  /**
   * Calculate statistics from results
   */
  calculateStats(results) {
    const durations = results.map((r) => r.totalDuration);
    const hookCounts = results.map((r) => r.hookCount);

    return {
      avgDuration: Math.round(
        durations.reduce((a, b) => a + b) / durations.length,
      ),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      avgHookCount: Math.round(
        hookCounts.reduce((a, b) => a + b) / hookCounts.length,
      ),
      totalRuns: results.length,
      successRate: (
        (results.filter((r) => !r.error).length / results.length) *
        100
      ).toFixed(1),
    };
  }

  /**
   * Display benchmark results
   */
  displayResults(benchmark) {
    console.log("\n📈 Benchmark Results");
    console.log("===================");

    const { sequential, parallel } = benchmark;

    console.log(`\n🐌 Sequential Execution (Old Way):`);
    console.log(`   Average Duration: ${sequential.avgDuration}ms`);
    console.log(
      `   Range: ${sequential.minDuration}ms - ${sequential.maxDuration}ms`,
    );
    console.log(`   Average Hooks: ${sequential.avgHookCount}`);
    console.log(`   Success Rate: ${sequential.successRate}%`);

    console.log(`\n🚀 Parallel Execution (New Way):`);
    console.log(`   Average Duration: ${parallel.avgDuration}ms`);
    console.log(
      `   Range: ${parallel.minDuration}ms - ${parallel.maxDuration}ms`,
    );
    console.log(`   Average Hooks: ${parallel.avgHookCount}`);
    console.log(`   Success Rate: ${parallel.successRate}%`);

    // Calculate improvement
    const improvement = (
      ((sequential.avgDuration - parallel.avgDuration) /
        sequential.avgDuration) *
      100
    ).toFixed(1);
    const speedup = (sequential.avgDuration / parallel.avgDuration).toFixed(2);

    console.log(`\n⚡ Performance Improvement:`);
    console.log(`   Speed Improvement: ${improvement}%`);
    console.log(`   Speedup Factor: ${speedup}x`);
    console.log(
      `   Time Saved: ${sequential.avgDuration - parallel.avgDuration}ms`,
    );

    // Performance targets
    const targetMet = parallel.avgDuration < 5000; // 5 second target
    const majorImprovement = improvement > 50; // 50% improvement target

    console.log(`\n🎯 Performance Targets:`);
    console.log(
      `   < 5 seconds: ${targetMet ? "✅ PASSED" : "❌ FAILED"} (${parallel.avgDuration}ms)`,
    );
    console.log(
      `   > 50% improvement: ${majorImprovement ? "✅ PASSED" : "❌ FAILED"} (${improvement}%)`,
    );

    // Efficiency analysis
    console.log(`\n📊 Efficiency Analysis:`);
    console.log(
      `   Sequential throughput: ${((sequential.avgHookCount / sequential.avgDuration) * 1000).toFixed(2)} hooks/second`,
    );
    console.log(
      `   Parallel throughput: ${((parallel.avgHookCount / parallel.avgDuration) * 1000).toFixed(2)} hooks/second`,
    );

    return {
      improvement: parseFloat(improvement),
      speedup: parseFloat(speedup),
      targetMet,
      majorImprovement,
    };
  }
}

// Run benchmark
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();

  benchmark
    .runBenchmark()
    .then((results) => {
      const analysis = benchmark.displayResults(results);

      console.log("\n🏁 Benchmark Complete!");

      if (analysis.targetMet && analysis.majorImprovement) {
        console.log("✅ All performance targets met!");
        process.exit(0);
      } else {
        console.log("❌ Performance targets not met");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("💥 Benchmark failed:", error);
      process.exit(1);
    });
}

module.exports = PerformanceBenchmark;
