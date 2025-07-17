#!/usr/bin/env node

/**
 * Unified Hook Debugging System
 *
 * Provides simplified access to the sophisticated hook debugging infrastructure
 * while maintaining the project's focus on local AI development friction reduction.
 *
 * Built on top of existing tools:
 * - debug-parallel-execution.js
 * - simple-pattern-logger.js
 * - hook testing framework
 * - environment controls
 */

const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

class UnifiedHookDebugger {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.hooksDir = path.join(this.projectRoot, "tools", "hooks");
    this.debugTool = path.join(this.hooksDir, "debug-parallel-execution.js");
    this.patternLogger = path.join(this.hooksDir, "simple-pattern-logger.js");
    this.loadEnvFile();
  }

  /**
   * Find project root by looking for package.json
   */
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
   * Load environment variables from .env file
   */
  loadEnvFile() {
    try {
      const envPath = path.join(this.projectRoot, ".env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const lines = envContent.split("\n");

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith("#")) {
            const [key, ...valueParts] = trimmedLine.split("=");
            if (key && valueParts.length > 0) {
              const value = valueParts.join("=").trim();
              process.env[key.trim()] = value;
            }
          }
        }
      }
    } catch (error) {
      // Fail silently if .env file cannot be read
    }
  }

  /**
   * Main command dispatcher
   */
  async run() {
    const command = process.argv[2] || "help";
    const args = process.argv.slice(3);

    try {
      switch (command) {
        case "diagnose":
        case "diag":
          await this.runDiagnostics();
          break;

        case "test":
          await this.testHook(args[0], args[1]);
          break;

        case "monitor":
          await this.monitorHooks();
          break;

        case "performance":
        case "perf":
          await this.checkPerformance();
          break;

        case "logs":
          await this.viewLogs(args[0]);
          break;

        case "env":
          await this.checkEnvironment();
          break;

        case "fix":
          await this.autoFix();
          break;

        case "report":
          await this.generateReport(args[0]);
          break;

        case "interactive":
        case "shell":
          await this.interactiveShell();
          break;

        case "chain":
          await this.analyzeHookChain(args[0]);
          break;

        case "help":
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error("❌ Debug command failed:", error.message);
      console.error('💡 Run "npm run debug:hooks help" for usage information');
      process.exit(1);
    }
  }

  /**
   * Run comprehensive diagnostics using existing debug tool
   */
  async runDiagnostics() {
    console.log("🔍 Running Hook System Diagnostics...\n");

    if (!fs.existsSync(this.debugTool)) {
      console.error("❌ Debug tool not found:", this.debugTool);
      return;
    }

    return new Promise((resolve, reject) => {
      const child = spawn("node", [this.debugTool, "diagnose"], {
        stdio: "inherit",
        cwd: this.projectRoot,
      });

      child.on("close", (code) => {
        if (code === 0) {
          console.log("\n✅ Diagnostics completed successfully");
          resolve();
        } else {
          console.log("\n⚠️  Diagnostics completed with issues");
          resolve(); // Don't reject - issues are expected sometimes
        }
      });

      child.on("error", reject);
    });
  }

  /**
   * Test a specific hook with custom input
   */
  async testHook(hookName, testCase = "basic") {
    if (!hookName) {
      console.log("❌ Please specify a hook name");
      console.log("💡 Usage: npm run debug:hooks test prevent-improved-files");
      console.log("💡 Available hooks:");
      this.listAvailableHooks();
      return;
    }

    console.log(`🧪 Testing hook: ${hookName}`);
    console.log(`📋 Test case: ${testCase}\n`);

    const testCases = this.getTestCases(testCase);
    const hookPath = this.findHookFile(hookName);

    if (!hookPath) {
      console.error(`❌ Hook not found: ${hookName}`);
      return;
    }

    for (const testCase of testCases) {
      await this.runSingleHookTest(hookPath, testCase);
    }
  }

  /**
   * Monitor hooks in real-time (enhanced version)
   */
  async monitorHooks() {
    const RealTimeHookMonitor = require("./real-time-monitor");

    const monitor = new RealTimeHookMonitor();

    // Parse additional arguments for monitoring
    const args = process.argv.slice(4); // Skip node, script, and 'monitor'
    const options = {};

    args.forEach((arg) => {
      if (arg.startsWith("--filter=")) {
        options.filter = arg.split("=")[1];
      } else if (arg === "--verbose" || arg === "-v") {
        options.verboseMode = true;
      } else if (arg === "--no-stats") {
        options.showStats = false;
      }
    });

    await monitor.start(options);
  }

  /**
   * Check hook performance using existing tool
   */
  async checkPerformance() {
    console.log("⚡ Checking Hook Performance...\n");

    return new Promise((resolve, reject) => {
      const child = spawn("node", [this.debugTool, "test"], {
        stdio: "inherit",
        cwd: this.projectRoot,
      });

      child.on("close", (code) => {
        resolve();
      });

      child.on("error", reject);
    });
  }

  /**
   * View hook logs with filtering
   */
  async viewLogs(filter = "") {
    const logsDir = path.join(this.hooksDir, "logs");

    if (!fs.existsSync(logsDir)) {
      console.log("📁 No logs directory found");
      console.log(
        "💡 Logs are created when hooks execute with HOOK_VERBOSE=true",
      );
      return;
    }

    console.log("📋 Hook Logs:\n");

    const logFiles = fs
      .readdirSync(logsDir)
      .filter(
        (file) =>
          file.endsWith(".log") ||
          file.endsWith(".json") ||
          file.endsWith(".txt"),
      )
      .filter((file) => (filter ? file.includes(filter) : true));

    if (logFiles.length === 0) {
      console.log("📝 No log files found");
      return;
    }

    for (const logFile of logFiles) {
      const filePath = path.join(logsDir, logFile);
      const stats = fs.statSync(filePath);

      console.log(`📄 ${logFile}`);
      console.log(`   Size: ${(stats.size / 1024).toFixed(1)}KB`);
      console.log(`   Modified: ${stats.mtime.toLocaleString()}`);

      // Show last few lines for .log files
      if (logFile.endsWith(".log")) {
        try {
          const content = fs.readFileSync(filePath, "utf8");
          const lines = content.split("\n").filter((line) => line.trim());
          const lastLines = lines.slice(-3);

          if (lastLines.length > 0) {
            console.log("   Recent entries:");
            lastLines.forEach((line) => {
              console.log(
                `     ${line.substring(0, 80)}${line.length > 80 ? "..." : ""}`,
              );
            });
          }
        } catch (error) {
          console.log("   (Could not read file)");
        }
      }
      console.log("");
    }

    console.log('💡 Use "npm run debug:hooks logs [filter]" to filter logs');
    console.log('💡 Example: "npm run debug:hooks logs security"');
  }

  /**
   * Check environment configuration
   */
  async checkEnvironment() {
    // Load .env file manually
    this.loadEnvFile();

    console.log("🌍 Hook Environment Configuration:\n");

    const envVars = [
      "HOOKS_DISABLED",
      "HOOK_VERBOSE",
      "HOOK_AI_PATTERNS",
      "HOOK_ARCHITECTURE",
      "HOOK_CLEANUP",
      "HOOK_CONTEXT",
      "HOOK_IDE",
      "HOOK_LOCAL_DEV",
      "HOOK_PERFORMANCE",
      "HOOK_PROMPT",
      "HOOK_PROJECT_BOUNDARIES",
      "HOOK_SECURITY",
      "HOOK_VALIDATION",
      "HOOK_WORKFLOW",
    ];

    console.log("📊 Environment Variables:");
    envVars.forEach((varName) => {
      const value = process.env[varName] || "undefined";
      const status = value === "true" ? "✅" : value === "false" ? "❌" : "⚪";
      console.log(`${status} ${varName}=${value}`);
    });

    console.log("\n🔧 Configuration Files:");
    const configFiles = [
      ".env",
      ".claude/settings.json",
      "tools/hooks/hooks-config.json",
    ];

    configFiles.forEach((file) => {
      const filePath = path.join(this.projectRoot, file);
      const exists = fs.existsSync(filePath);
      console.log(
        `${exists ? "✅" : "❌"} ${file} ${exists ? "(exists)" : "(missing)"}`,
      );
    });

    console.log("\n💡 To modify environment:");
    console.log("   Edit .env file in project root");
    console.log("   Set HOOKS_DISABLED=true to disable all hooks");
    console.log("   Set specific HOOK_[CATEGORY]=false to disable category");
  }

  /**
   * Auto-fix common issues using existing tool
   */
  async autoFix() {
    console.log("🔧 Running Auto-Fix...\n");

    return new Promise((resolve, reject) => {
      const child = spawn("node", [this.debugTool, "fix"], {
        stdio: "inherit",
        cwd: this.projectRoot,
      });

      child.on("close", (code) => {
        resolve();
      });

      child.on("error", reject);
    });
  }

  /**
   * Generate reports using pattern logger
   */
  async generateReport(type = "weekly") {
    console.log(`📊 Generating ${type} report...\n`);

    if (!fs.existsSync(this.patternLogger)) {
      console.error("❌ Pattern logger not found:", this.patternLogger);
      return;
    }

    return new Promise((resolve, reject) => {
      const child = spawn("node", [this.patternLogger, "report"], {
        stdio: "inherit",
        cwd: this.projectRoot,
      });

      child.on("close", (code) => {
        console.log("\n📋 Report generation completed");
        resolve();
      });

      child.on("error", reject);
    });
  }

  /**
   * Analyze hook chain using the chain analyzer
   */
  async analyzeHookChain(analysisType = "complete") {
    console.log("🔗 Analyzing Hook Chain...\n");

    const HookChainAnalyzer = require("./hook-chain-analyzer");
    const analyzer = new HookChainAnalyzer();

    switch (analysisType) {
      case "stats":
        analyzer.displayStatistics();
        break;
      case "deps":
        analyzer.analyzeDependencies();
        break;
      case "complete":
      default:
        analyzer.runCompleteAnalysis();
        break;
    }
  }

  /**
   * Interactive debugging shell
   */
  async interactiveShell() {
    console.log("🖥️  Interactive Hook Debugging Shell");
    console.log('Type "help" for commands, "exit" to quit\n');

    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "hooks-debug> ",
    });

    rl.prompt();

    rl.on("line", async (input) => {
      const [command, ...args] = input.trim().split(" ");

      switch (command) {
        case "help":
          console.log("Available commands:");
          console.log("  test <hook-name> - Test a specific hook");
          console.log("  list - List available hooks");
          console.log("  env - Show environment");
          console.log("  logs - Show recent logs");
          console.log(
            "  chain [type] - Analyze hook chain (stats, deps, complete)",
          );
          console.log("  clear - Clear screen");
          console.log("  exit - Exit shell");
          break;

        case "test":
          if (args[0]) {
            await this.testHook(args[0], "basic");
          } else {
            console.log("Usage: test <hook-name>");
          }
          break;

        case "list":
          this.listAvailableHooks();
          break;

        case "env":
          await this.checkEnvironment();
          break;

        case "logs":
          await this.viewLogs(args[0]);
          break;

        case "chain":
          await this.analyzeHookChain(args[0] || "complete");
          break;

        case "clear":
          console.clear();
          break;

        case "exit":
          console.log("👋 Goodbye!");
          rl.close();
          return;

        case "":
          break;

        default:
          console.log(`Unknown command: ${command}`);
          console.log('Type "help" for available commands');
      }

      rl.prompt();
    });

    rl.on("close", () => {
      process.exit(0);
    });
  }

  /**
   * Helper: List available hooks
   */
  listAvailableHooks() {
    const categories = fs
      .readdirSync(this.hooksDir, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isDirectory() &&
          !dirent.name.startsWith(".") &&
          !dirent.name.startsWith("_"),
      )
      .map((dirent) => dirent.name);

    console.log("📚 Available Hook Categories:");
    categories.forEach((category) => {
      if (
        ["logs", "lib", "engine", "__tests__", "data", "tools"].includes(
          category,
        )
      )
        return;

      const categoryPath = path.join(this.hooksDir, category);
      if (!fs.existsSync(categoryPath)) return;

      const hooks = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith(".js") && !file.includes("test"))
        .map((file) => file.replace(".js", ""));

      console.log(`  📁 ${category}:`);
      hooks.forEach((hook) => {
        console.log(`    🔗 ${hook}`);
      });
    });
  }

  /**
   * Helper: Find hook file path
   */
  findHookFile(hookName) {
    const categories = fs
      .readdirSync(this.hooksDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith("."))
      .map((dirent) => dirent.name);

    for (const category of categories) {
      if (
        ["logs", "lib", "engine", "__tests__", "data", "tools"].includes(
          category,
        )
      )
        continue;

      const hookPath = path.join(this.hooksDir, category, `${hookName}.js`);
      if (fs.existsSync(hookPath)) {
        return hookPath;
      }
    }
    return null;
  }

  /**
   * Helper: Get test cases for hook testing
   */
  getTestCases(testType) {
    const testCases = {
      basic: [
        {
          name: "Basic Test",
          input: {
            tool_name: "Write",
            tool_input: {
              file_path: "/test/example.js",
              content: 'console.log("test");',
            },
          },
        },
      ],

      security: [
        {
          name: "XSS Vulnerability",
          input: {
            tool_name: "Write",
            tool_input: {
              file_path: "/test/vuln.js",
              content: "element.innerHTML = userInput;",
            },
          },
        },
      ],

      patterns: [
        {
          name: "Improved File Pattern",
          input: {
            tool_name: "Write",
            tool_input: {
              file_path: "/test/component_improved.tsx",
              content: "export default function Component() { return null; }",
            },
          },
        },
      ],
    };

    return testCases[testType] || testCases.basic;
  }

  /**
   * Helper: Run single hook test
   */
  async runSingleHookTest(hookPath, testCase) {
    console.log(`🧪 Running: ${testCase.name}`);

    return new Promise((resolve) => {
      const child = spawn("node", [hookPath], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: this.projectRoot,
      });

      child.stdin.write(JSON.stringify(testCase.input));
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
        const result =
          code === 0 ? "✅ ALLOWED" : code === 2 ? "🚫 BLOCKED" : "⚠️  WARNING";
        console.log(`   Result: ${result} (exit code: ${code})`);

        if (stderr) {
          console.log(`   Message: ${stderr.trim()}`);
        }

        if (stdout) {
          try {
            const output = JSON.parse(stdout);
            if (output.debug) {
              console.log(`   Debug: ${output.debug}`);
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }

        console.log("");
        resolve();
      });
    });
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`🛠️  AIPatternEnforcer Hook Debugging System

🎯 Purpose: Simplified access to sophisticated hook debugging infrastructure
   Designed for LOCAL one-person AI projects - no enterprise complexity

📋 Commands:
   diagnose, diag     Run comprehensive hook system diagnostics
   test <hook-name>   Test specific hook with sample inputs
   monitor            Monitor hooks in real-time during development
   performance, perf  Check hook execution performance
   logs [filter]      View hook execution logs
   env                Show environment configuration
   fix                Auto-fix common hook issues
   report [type]      Generate pattern analysis reports
   chain [type]       Analyze hook execution chains and dependencies
   interactive        Enter interactive debugging shell
   help               Show this help

💡 Examples:
   npm run debug:hooks diagnose
   npm run debug:hooks test prevent-improved-files
   npm run debug:hooks logs security
   npm run debug:hooks env
   npm run debug:hooks chain
   npm run debug:hooks interactive
   
🔍 Enhanced Monitoring:
   npm run debug:hooks:monitor:enhanced     - Full real-time monitoring
   npm run debug:hooks:monitor:verbose      - Verbose monitoring with details
   npm run debug:hooks:monitor:security     - Monitor only security hooks
   npm run debug:hooks:monitor:patterns     - Monitor only pattern hooks
   
🔗 Chain Analysis:
   npm run debug:hooks:chain                - Complete hook chain analysis
   npm run debug:hooks:chain:stats          - Hook statistics and distribution
   npm run debug:hooks:chain:deps           - Hook dependency analysis

🔧 Quick Fixes:
   - Hook not working? → npm run debug:hooks diagnose
   - Slow performance? → npm run debug:hooks perf
   - Need to test? → npm run debug:hooks test <hook-name>
   - Want monitoring? → npm run debug:hooks monitor

📚 For detailed troubleshooting: docs/guides/claude-code-hooks/03-hooks-troubleshooting.md

✨ Built on existing tools: debug-parallel-execution.js, simple-pattern-logger.js
`);
  }
}

// CLI execution
if (require.main === module) {
  const hookDebugger = new UnifiedHookDebugger();
  hookDebugger.run().catch((error) => {
    console.error("❌ Debugger failed:", error.message);
    process.exit(1);
  });
}

module.exports = UnifiedHookDebugger;
