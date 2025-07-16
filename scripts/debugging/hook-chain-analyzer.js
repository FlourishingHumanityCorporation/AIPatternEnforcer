#!/usr/bin/env node

/**
 * Hook Chain Analysis Tool
 *
 * Provides text-based visualization of hook execution flow,
 * dependencies, and chain analysis for debugging
 */

const fs = require("fs");
const path = require("path");

class HookChainAnalyzer {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.hooksDir = path.join(this.projectRoot, "tools", "hooks");
    this.hookConfig = this.loadHookConfig();
    this.hooks = this.discoverHooks();
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
   * Load hook configuration from hooks-config.json
   */
  loadHookConfig() {
    const configPath = path.join(this.hooksDir, "hooks-config.json");

    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
      }
    } catch (error) {
      console.warn("⚠️  Could not load hooks-config.json:", error.message);
    }

    return { hooks: {} };
  }

  /**
   * Discover all hooks in the project
   */
  discoverHooks() {
    const hooks = {
      PreToolUse: [],
      PostToolUse: [],
      Write: [],
    };

    try {
      const categories = fs
        .readdirSync(this.hooksDir, { withFileTypes: true })
        .filter(
          (dirent) => dirent.isDirectory() && !dirent.name.startsWith("."),
        )
        .map((dirent) => dirent.name);

      categories.forEach((category) => {
        if (
          ["logs", "lib", "engine", "__tests__", "data", "tools"].includes(
            category,
          )
        )
          return;

        const categoryPath = path.join(this.hooksDir, category);
        const hookFiles = fs
          .readdirSync(categoryPath)
          .filter((file) => file.endsWith(".js") && !file.includes("test"))
          .map((file) => ({
            name: file.replace(".js", ""),
            file: file,
            category: category,
            path: path.join(categoryPath, file),
            priority: this.getHookPriority(category, file),
          }));

        // Categorize hooks by their likely execution stage
        hookFiles.forEach((hook) => {
          if (hook.name.includes("post") || hook.name.includes("after")) {
            hooks.PostToolUse.push(hook);
          } else if (
            hook.name.includes("write") ||
            hook.name.includes("create")
          ) {
            hooks.Write.push(hook);
          } else {
            hooks.PreToolUse.push(hook);
          }
        });
      });

      // Sort hooks by priority within each stage
      Object.keys(hooks).forEach((stage) => {
        hooks[stage].sort((a, b) => a.priority - b.priority);
      });
    } catch (error) {
      console.error("Error discovering hooks:", error.message);
    }

    return hooks;
  }

  /**
   * Get hook priority based on category and name
   */
  getHookPriority(category, filename) {
    const priorityMap = {
      security: 1,
      validation: 2,
      context: 3,
      "ai-patterns": 4,
      "project-boundaries": 5,
      workflow: 6,
      architecture: 7,
      cleanup: 8,
      performance: 9,
      prompt: 10,
      ide: 11,
      "local-dev": 12,
    };

    return priorityMap[category] || 13;
  }

  /**
   * Analyze hook execution chain for a specific tool
   */
  analyzeToolChain(toolName = "Write") {
    console.log(`🔗 Hook Chain Analysis for ${toolName} Tool`);
    console.log("=".repeat(50));

    const preHooks = this.hooks.PreToolUse;
    const postHooks = this.hooks.PostToolUse;
    const writeHooks = this.hooks.Write;

    // Pre-tool hooks
    if (preHooks.length > 0) {
      console.log("\n📥 Pre-Tool Hooks (Before file operation):");
      this.displayHookChain(preHooks, "  ");
    }

    // Tool-specific hooks
    if (toolName === "Write" && writeHooks.length > 0) {
      console.log("\n✍️  Write-Specific Hooks:");
      this.displayHookChain(writeHooks, "  ");
    }

    // Post-tool hooks
    if (postHooks.length > 0) {
      console.log("\n📤 Post-Tool Hooks (After file operation):");
      this.displayHookChain(postHooks, "  ");
    }

    // Display execution flow
    console.log("\n🔄 Execution Flow:");
    this.displayExecutionFlow(preHooks, writeHooks, postHooks);
  }

  /**
   * Display hook chain with visual formatting
   */
  displayHookChain(hooks, indent = "") {
    hooks.forEach((hook, index) => {
      const isLast = index === hooks.length - 1;
      const connector = isLast ? "└─" : "├─";
      const categoryColor = this.getCategoryColor(hook.category);

      console.log(
        `${indent}${connector} ${categoryColor}${hook.name}${this.resetColor()}`,
      );
      console.log(`${indent}${isLast ? "  " : "│ "} 📁 ${hook.category}`);
      console.log(
        `${indent}${isLast ? "  " : "│ "} 🔢 Priority: ${hook.priority}`,
      );

      // Show hook description if available
      const description = this.getHookDescription(hook);
      if (description) {
        console.log(`${indent}${isLast ? "  " : "│ "} 💡 ${description}`);
      }

      if (!isLast) {
        console.log(`${indent}│`);
      }
    });
  }

  /**
   * Display execution flow diagram
   */
  displayExecutionFlow(preHooks, writeHooks, postHooks) {
    const totalSteps =
      preHooks.length + writeHooks.length + postHooks.length + 1;
    let currentStep = 0;

    console.log("┌─── Tool Execution Flow ───┐");
    console.log("│                           │");

    // Pre-tool hooks
    if (preHooks.length > 0) {
      console.log("│ 📥 Pre-Tool Validation    │");
      preHooks.forEach((hook, index) => {
        currentStep++;
        const progress = Math.round((currentStep / totalSteps) * 100);
        console.log(
          `│ ${currentStep.toString().padStart(2)}) ${hook.name.padEnd(18)} │ ${progress}%`,
        );
      });
      console.log("│           ↓               │");
    }

    // Main tool operation
    console.log("│ 🛠️  Tool Operation         │");
    console.log("│    (Write/Edit/etc.)      │");
    console.log("│           ↓               │");

    // Write-specific hooks
    if (writeHooks.length > 0) {
      console.log("│ ✍️  Write-Specific Hooks   │");
      writeHooks.forEach((hook, index) => {
        currentStep++;
        const progress = Math.round((currentStep / totalSteps) * 100);
        console.log(
          `│ ${currentStep.toString().padStart(2)}) ${hook.name.padEnd(18)} │ ${progress}%`,
        );
      });
      console.log("│           ↓               │");
    }

    // Post-tool hooks
    if (postHooks.length > 0) {
      console.log("│ 📤 Post-Tool Processing   │");
      postHooks.forEach((hook, index) => {
        currentStep++;
        const progress = Math.round((currentStep / totalSteps) * 100);
        console.log(
          `│ ${currentStep.toString().padStart(2)}) ${hook.name.padEnd(18)} │ ${progress}%`,
        );
      });
    }

    console.log("│                           │");
    console.log("└─── Operation Complete ───┘");
  }

  /**
   * Get category color for terminal output
   */
  getCategoryColor(category) {
    const colors = {
      security: "\x1b[31m", // Red
      validation: "\x1b[33m", // Yellow
      context: "\x1b[95m", // Bright Magenta
      "ai-patterns": "\x1b[35m", // Magenta
      "project-boundaries": "\x1b[34m", // Blue
      workflow: "\x1b[94m", // Bright Blue
      architecture: "\x1b[36m", // Cyan
      cleanup: "\x1b[32m", // Green
      performance: "\x1b[37m", // White
      prompt: "\x1b[93m", // Bright Yellow
      ide: "\x1b[96m", // Bright Cyan
      "local-dev": "\x1b[90m", // Gray
    };

    return colors[category] || "\x1b[37m";
  }

  /**
   * Reset terminal color
   */
  resetColor() {
    return "\x1b[0m";
  }

  /**
   * Get hook description from file comments
   */
  getHookDescription(hook) {
    try {
      const content = fs.readFileSync(hook.path, "utf8");
      const lines = content.split("\n");

      // Look for description in first few lines
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        if (line.startsWith("* ") && !line.includes("Claude Code Hook")) {
          return line.substring(2).trim();
        }
      }
    } catch (error) {
      // Ignore read errors
    }

    return null;
  }

  /**
   * Analyze hook dependencies
   */
  analyzeDependencies() {
    console.log("\n🔍 Hook Dependency Analysis");
    console.log("===========================\n");

    const dependencies = new Map();
    const sharedModules = new Set();

    // Analyze each hook for dependencies
    Object.values(this.hooks)
      .flat()
      .forEach((hook) => {
        const deps = this.extractDependencies(hook);
        dependencies.set(hook.name, deps);

        // Track shared modules
        deps.forEach((dep) => {
          if (dep.startsWith("./") || dep.startsWith("../")) {
            sharedModules.add(dep);
          }
        });
      });

    // Display shared modules
    if (sharedModules.size > 0) {
      console.log("📦 Shared Modules:");
      Array.from(sharedModules)
        .sort()
        .forEach((module) => {
          const users = [];
          dependencies.forEach((deps, hookName) => {
            if (deps.includes(module)) {
              users.push(hookName);
            }
          });
          console.log(`  ${module} (used by: ${users.join(", ")})`);
        });
    }

    // Display hook-specific dependencies
    console.log("\n🔗 Hook Dependencies:");
    dependencies.forEach((deps, hookName) => {
      if (deps.length > 0) {
        console.log(`\n  ${hookName}:`);
        deps.forEach((dep) => {
          const type = dep.startsWith("./") ? "local" : "external";
          const icon = type === "local" ? "📁" : "📦";
          console.log(`    ${icon} ${dep}`);
        });
      }
    });
  }

  /**
   * Extract dependencies from hook file
   */
  extractDependencies(hook) {
    const dependencies = [];

    try {
      const content = fs.readFileSync(hook.path, "utf8");

      // Match require statements
      const requirePattern = /require\(['"]([^'"]+)['"]\)/g;
      let match;

      while ((match = requirePattern.exec(content)) !== null) {
        dependencies.push(match[1]);
      }

      // Match import statements
      const importPattern = /import.*from\s+['"]([^'"]+)['"]/g;
      while ((match = importPattern.exec(content)) !== null) {
        dependencies.push(match[1]);
      }
    } catch (error) {
      // Ignore read errors
    }

    return [...new Set(dependencies)]; // Remove duplicates
  }

  /**
   * Display hook statistics
   */
  displayStatistics() {
    console.log("\n📊 Hook System Statistics");
    console.log("=========================\n");

    const totalHooks = Object.values(this.hooks).flat().length;
    const categoryStats = {};

    // Count hooks by category
    Object.values(this.hooks)
      .flat()
      .forEach((hook) => {
        categoryStats[hook.category] = (categoryStats[hook.category] || 0) + 1;
      });

    console.log(`📈 Total Hooks: ${totalHooks}`);
    console.log(`📥 Pre-Tool Hooks: ${this.hooks.PreToolUse.length}`);
    console.log(`📤 Post-Tool Hooks: ${this.hooks.PostToolUse.length}`);
    console.log(`✍️  Write Hooks: ${this.hooks.Write.length}`);

    console.log("\n📋 Hooks by Category:");
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        const percentage = ((count / totalHooks) * 100).toFixed(1);
        console.log(
          `  ${category.padEnd(20)} ${count.toString().padStart(2)} (${percentage}%)`,
        );
      });

    console.log("\n🎯 Priority Distribution:");
    const priorityStats = {};
    Object.values(this.hooks)
      .flat()
      .forEach((hook) => {
        priorityStats[hook.priority] = (priorityStats[hook.priority] || 0) + 1;
      });

    Object.entries(priorityStats)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .forEach(([priority, count]) => {
        const bar = "█".repeat(Math.round((count / totalHooks) * 20));
        console.log(`  Priority ${priority}: ${bar} ${count}`);
      });
  }

  /**
   * Run complete analysis
   */
  runCompleteAnalysis() {
    console.log("🔍 Complete Hook Chain Analysis");
    console.log("===============================\n");

    this.analyzeToolChain("Write");
    this.analyzeDependencies();
    this.displayStatistics();

    console.log("\n💡 Analysis Complete!");
    console.log("   Use this information to understand hook execution order,");
    console.log("   identify potential bottlenecks, and optimize hook chains.");
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new HookChainAnalyzer();

  const command = process.argv[2] || "complete";

  switch (command) {
    case "chain":
      const toolName = process.argv[3] || "Write";
      analyzer.analyzeToolChain(toolName);
      break;

    case "deps":
    case "dependencies":
      analyzer.analyzeDependencies();
      break;

    case "stats":
    case "statistics":
      analyzer.displayStatistics();
      break;

    case "complete":
    default:
      analyzer.runCompleteAnalysis();
      break;

    case "help":
      console.log(`
Hook Chain Analysis Tool

Usage: node hook-chain-analyzer.js [command] [options]

Commands:
  complete      Run complete analysis (default)
  chain [tool]  Analyze hook chain for specific tool
  deps          Show hook dependencies
  stats         Display hook statistics
  help          Show this help message

Examples:
  node hook-chain-analyzer.js
  node hook-chain-analyzer.js chain Write
  node hook-chain-analyzer.js deps
  node hook-chain-analyzer.js stats
`);
      break;
  }
}

module.exports = HookChainAnalyzer;
