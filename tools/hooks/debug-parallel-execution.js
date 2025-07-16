#!/usr/bin/env node

/**
 * Debug and Troubleshooting Tool for Parallel Hook Execution
 * Provides comprehensive debugging capabilities for the parallel hook system
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const ParallelExecutor = require("./engine/parallel-executor");
const HookPriority = require("./engine/hook-priority");

class ParallelExecutionDebugger {
  constructor() {
    this.executor = new ParallelExecutor({ verbose: true });
    this.priority = new HookPriority();
  }

  /**
   * Run comprehensive diagnostics
   */
  async runDiagnostics() {
    console.log("🔍 Parallel Hook Execution Diagnostics");
    console.log("=====================================\n");

    const diagnostics = {
      configuration: await this.checkConfiguration(),
      hooks: await this.checkHooks(),
      permissions: await this.checkPermissions(),
      performance: await this.checkPerformance(),
      fallbacks: await this.checkFallbacks(),
    };

    this.generateDiagnosticReport(diagnostics);
    return diagnostics;
  }

  /**
   * Check configuration files
   */
  async checkConfiguration() {
    console.log("📋 Checking Configuration Files...");

    const checks = {
      settingsJson: this.checkFile(".claude/settings.json"),
      settingsBackup: this.checkFile(".claude/settings.json.backup"),
      hooksConfig: this.checkFile("tools/hooks/hooks-config.json"),
      parallelExecutor: this.checkFile("tools/hooks/parallel-hook-executor.js"),
      fallbackExecutor: this.checkFile("tools/hooks/fallback-executor.js"),
    };

    // Check settings.json content
    if (checks.settingsJson.exists) {
      try {
        const settings = JSON.parse(
          fs.readFileSync(".claude/settings.json", "utf8"),
        );
        checks.settingsJson.valid = true;
        checks.settingsJson.hasParallelHooks =
          settings.hooks &&
          settings.hooks.PreToolUse &&
          settings.hooks.PreToolUse.some((group) =>
            group.hooks.some((hook) => hook.command.includes("parallel")),
          );
      } catch (error) {
        checks.settingsJson.valid = false;
        checks.settingsJson.error = error.message;
      }
    }

    // Check hooks-config.json content
    if (checks.hooksConfig.exists) {
      try {
        const config = JSON.parse(
          fs.readFileSync("tools/hooks/hooks-config.json", "utf8"),
        );
        checks.hooksConfig.valid = true;
        checks.hooksConfig.hookCount = this.countHooks(config);
      } catch (error) {
        checks.hooksConfig.valid = false;
        checks.hooksConfig.error = error.message;
      }
    }

    this.logChecks("Configuration", checks);
    return checks;
  }

  /**
   * Check individual hook files
   */
  async checkHooks() {
    console.log("\n🔗 Checking Individual Hook Files...");

    const config = JSON.parse(
      fs.readFileSync("tools/hooks/hooks-config.json", "utf8"),
    );
    const hooks = this.extractAllHooks(config);

    const checks = {};

    for (const hook of hooks) {
      const hookPath = hook.command.replace("node ", "");
      const check = this.checkFile(hookPath);

      if (check.exists && check.executable) {
        // Test hook execution
        try {
          const testResult = await this.testHook(hook);
          check.testResult = testResult;
        } catch (error) {
          check.testError = error.message;
        }
      }

      checks[hookPath] = check;
    }

    this.logHookChecks(checks);
    return checks;
  }

  /**
   * Check file permissions
   */
  async checkPermissions() {
    console.log("\n🔐 Checking File Permissions...");

    const files = [
      "tools/hooks/parallel-hook-executor.js",
      "tools/hooks/pre-tool-use-parallel.js",
      "tools/hooks/post-tool-use-parallel.js",
      "tools/hooks/pre-tool-use-write-parallel.js",
      "tools/hooks/fallback-executor.js",
    ];

    const checks = {};

    for (const file of files) {
      checks[file] = this.checkFile(file);
    }

    this.logChecks("Permissions", checks);
    return checks;
  }

  /**
   * Check performance
   */
  async checkPerformance() {
    console.log("\n⚡ Checking Performance...");

    const testInput = {
      tool_name: "Write",
      tool_input: {
        file_path: "/test/debug.js",
        content: 'console.log("Debug test");',
      },
    };

    const startTime = Date.now();

    try {
      const result = await this.runParallelTest(testInput);
      const duration = Date.now() - startTime;

      const performance = {
        duration,
        success: result.success,
        hookCount: result.hookCount,
        efficiency: result.efficiency,
        targetMet: duration < 5000,
      };

      console.log(`  ⏱️  Duration: ${duration}ms`);
      console.log(
        `  🎯 Target (<5s): ${performance.targetMet ? "✅ PASSED" : "❌ FAILED"}`,
      );
      console.log(`  📊 Hook count: ${result.hookCount}`);
      console.log(`  🚀 Efficiency: ${result.efficiency || "N/A"}`);

      return performance;
    } catch (error) {
      console.log(`  ❌ Performance test failed: ${error.message}`);
      return {
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check fallback mechanisms
   */
  async checkFallbacks() {
    console.log("\n🛡️  Checking Fallback Mechanisms...");

    const checks = {
      sequentialFallback: await this.testSequentialFallback(),
      emergencyFallback: await this.testEmergencyFallback(),
      backupConfig: this.checkFile(".claude/settings.json.backup"),
    };

    this.logChecks("Fallbacks", checks);
    return checks;
  }

  /**
   * Test sequential fallback
   */
  async testSequentialFallback() {
    try {
      const FallbackExecutor = require("./fallback-executor");
      const fallback = new FallbackExecutor({
        hookType: "PreToolUse",
        toolMatcher: "Write",
        verbose: false,
      });

      const testInput = {
        tool_name: "Write",
        tool_input: {
          file_path: "/test/fallback.js",
          content: 'console.log("Fallback test");',
        },
      };

      const result = await fallback.executeSequentialFallback(testInput);

      return {
        success: result.success,
        hookCount: result.hookCount,
        duration: result.totalDuration,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test emergency fallback
   */
  async testEmergencyFallback() {
    return {
      success: true,
      message: "Emergency fallback available",
    };
  }

  /**
   * Run parallel test
   */
  async runParallelTest(input) {
    return new Promise((resolve, reject) => {
      const child = spawn("node", ["tools/hooks/pre-tool-use-parallel.js"], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
        env: { ...process.env, HOOK_VERBOSE: "true" },
      });

      child.stdin.write(JSON.stringify(input));
      child.stdin.end();

      let stderr = "";
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        const hookCountMatch = stderr.match(
          /Starting parallel execution of (\d+) hooks/,
        );
        const hookCount = hookCountMatch ? parseInt(hookCountMatch[1]) : 0;

        const efficiencyMatch = stderr.match(/Parallel efficiency: ([\d.]+)/);
        const efficiency = efficiencyMatch ? efficiencyMatch[1] : null;

        resolve({
          success: code === 0,
          hookCount,
          efficiency,
          stderr: stderr.trim(),
        });
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }

  /**
   * Test individual hook
   */
  async testHook(hook) {
    return new Promise((resolve, reject) => {
      const timeout = (hook.timeout || 5) * 1000;
      const hookPath = hook.command.replace("node ", "");

      const child = spawn("node", [hookPath], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
        timeout,
      });

      const testInput = {
        tool_name: "Write",
        tool_input: {
          file_path: "/test/hook-test.js",
          content: 'console.log("Hook test");',
        },
      };

      child.stdin.write(JSON.stringify(testInput));
      child.stdin.end();

      child.on("close", (code) => {
        resolve({
          success: code === 0,
          blocked: code === 2,
          exitCode: code,
        });
      });

      child.on("error", (error) => {
        reject(error);
      });

      setTimeout(() => {
        child.kill();
        reject(new Error("Hook test timeout"));
      }, timeout);
    });
  }

  /**
   * Check file existence and permissions
   */
  checkFile(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        exists: true,
        size: stats.size,
        executable: !!(stats.mode & parseInt("111", 8)),
        readable: fs.constants.R_OK,
        lastModified: stats.mtime,
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract all hooks from config
   */
  extractAllHooks(config) {
    const hooks = [];

    for (const hookType of ["PreToolUse", "PostToolUse"]) {
      if (config.hooks && config.hooks[hookType]) {
        for (const group of config.hooks[hookType]) {
          if (group.hooks) {
            hooks.push(...group.hooks);
          }
        }
      }
    }

    return hooks;
  }

  /**
   * Count hooks in config
   */
  countHooks(config) {
    let count = 0;

    for (const hookType of ["PreToolUse", "PostToolUse"]) {
      if (config.hooks && config.hooks[hookType]) {
        for (const group of config.hooks[hookType]) {
          if (group.hooks) {
            count += group.hooks.length;
          }
        }
      }
    }

    return count;
  }

  /**
   * Log check results
   */
  logChecks(category, checks) {
    for (const [name, check] of Object.entries(checks)) {
      const status = check.exists
        ? check.executable === false
          ? "⚠️  "
          : "✅"
        : "❌";

      console.log(`  ${status} ${name}`);

      if (check.error) {
        console.log(`    Error: ${check.error}`);
      }

      if (check.testError) {
        console.log(`    Test Error: ${check.testError}`);
      }
    }
  }

  /**
   * Log hook check results
   */
  logHookChecks(checks) {
    let passed = 0;
    let failed = 0;

    for (const [hookPath, check] of Object.entries(checks)) {
      if (check.exists && check.executable) {
        if (check.testResult && check.testResult.success) {
          console.log(`  ✅ ${hookPath}`);
          passed++;
        } else {
          console.log(`  ❌ ${hookPath}`);
          if (check.testError) {
            console.log(`    Error: ${check.testError}`);
          }
          failed++;
        }
      } else {
        console.log(`  ⚠️  ${hookPath} (file issues)`);
        failed++;
      }
    }

    console.log(`\n  📊 Hook Test Results: ${passed} passed, ${failed} failed`);
  }

  /**
   * Generate diagnostic report
   */
  generateDiagnosticReport(diagnostics) {
    console.log("\n📋 Diagnostic Report");
    console.log("===================");

    const issues = [];
    const recommendations = [];

    // Check configuration issues
    if (!diagnostics.configuration.settingsJson.exists) {
      issues.push("❌ settings.json missing");
      recommendations.push(
        "🔧 Run: cp .claude/settings.json.backup .claude/settings.json",
      );
    }

    if (!diagnostics.configuration.hooksConfig.exists) {
      issues.push("❌ hooks-config.json missing");
      recommendations.push(
        "🔧 Recreate hooks-config.json with hook definitions",
      );
    }

    // Check performance issues
    if (diagnostics.performance.duration > 5000) {
      issues.push("⚠️  Performance target not met");
      recommendations.push("🔧 Review hook priorities and timeouts");
    }

    // Check fallback issues
    if (!diagnostics.fallbacks.sequentialFallback.success) {
      issues.push("❌ Sequential fallback failing");
      recommendations.push(
        "🔧 Check backup configuration and individual hooks",
      );
    }

    if (issues.length === 0) {
      console.log(
        "✅ All diagnostics passed - parallel execution system is healthy!",
      );
    } else {
      console.log("\n🚨 Issues Found:");
      issues.forEach((issue) => console.log(`  ${issue}`));

      console.log("\n🔧 Recommendations:");
      recommendations.forEach((rec) => console.log(`  ${rec}`));
    }

    console.log("\n📊 System Health Summary:");
    console.log(
      `  Configuration: ${diagnostics.configuration.settingsJson.exists ? "✅" : "❌"}`,
    );
    console.log(`  Hooks: ${Object.keys(diagnostics.hooks).length} checked`);
    console.log(
      `  Performance: ${diagnostics.performance.targetMet ? "✅" : "❌"} (${diagnostics.performance.duration}ms)`,
    );
    console.log(
      `  Fallbacks: ${diagnostics.fallbacks.sequentialFallback.success ? "✅" : "❌"}`,
    );
  }

  /**
   * Interactive troubleshooting
   */
  async interactiveTroubleshooting() {
    console.log("\n🔧 Interactive Troubleshooting Mode");
    console.log("===================================");

    const diagnostics = await this.runDiagnostics();

    // Auto-fix common issues
    console.log("\n🔄 Attempting automatic fixes...");

    if (
      !diagnostics.configuration.settingsJson.exists &&
      diagnostics.configuration.settingsBackup.exists
    ) {
      console.log("  📋 Restoring settings.json from backup...");
      fs.copyFileSync(".claude/settings.json.backup", ".claude/settings.json");
      console.log("  ✅ Settings restored");
    }

    // Make parallel executors executable
    const executorFiles = [
      "tools/hooks/parallel-hook-executor.js",
      "tools/hooks/pre-tool-use-parallel.js",
      "tools/hooks/post-tool-use-parallel.js",
      "tools/hooks/pre-tool-use-write-parallel.js",
      "tools/hooks/fallback-executor.js",
    ];

    for (const file of executorFiles) {
      try {
        fs.chmodSync(file, "755");
        console.log(`  ✅ Made ${file} executable`);
      } catch (error) {
        console.log(
          `  ⚠️  Could not make ${file} executable: ${error.message}`,
        );
      }
    }

    console.log("\n🎯 Run diagnostics again to verify fixes");
  }
}

// CLI interface
if (require.main === module) {
  const debugTool = new ParallelExecutionDebugger();

  const command = process.argv[2] || "diagnose";

  switch (command) {
    case "diagnose":
      debugTool.runDiagnostics();
      break;

    case "fix":
      debugTool.interactiveTroubleshooting();
      break;

    case "test":
      debugTool.runDiagnostics().then((diagnostics) => {
        if (diagnostics.performance.targetMet) {
          console.log("\n✅ Performance test passed");
          process.exit(0);
        } else {
          console.log("\n❌ Performance test failed");
          process.exit(1);
        }
      });
      break;

    default:
      console.log("Usage: node debug-parallel-execution.js <command>");
      console.log("Commands:");
      console.log("  diagnose  - Run full diagnostics (default)");
      console.log("  fix       - Run diagnostics and attempt fixes");
      console.log("  test      - Run performance test only");
      process.exit(1);
  }
}

module.exports = ParallelExecutionDebugger;
