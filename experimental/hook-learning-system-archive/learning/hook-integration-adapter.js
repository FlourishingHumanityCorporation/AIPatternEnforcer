#!/usr/bin/env node

/**
 * Hook Integration Adapter
 * Bridges the existing hook system with the learning infrastructure
 */

const SimpleLearningRunner = require("./SimpleLearningRunner");
const path = require("path");
const fs = require("fs");

/**
 * Wrap an existing hook with learning capabilities
 * This is designed to work with the current hook system architecture
 */
function withLearning(hookPath, options = {}) {
  // Load the original hook
  const originalHook = require(hookPath);
  const hookName = path.basename(hookPath, ".js");

  // Create learning runner
  const runner = new SimpleLearningRunner(hookName, {
    family: options.family || detectHookFamily(hookPath),
    priority: options.priority || originalHook.priority || "medium",
    learningEnabled: process.env.LEARNING_ENABLED !== "false",
  });

  // Return a wrapped version that includes learning
  return {
    ...originalHook,
    name: hookName,

    // Wrap the main run function
    run: async function (hookData) {
      // If learning is disabled, run original
      if (!runner.learningEnabled) {
        return await originalHook.run.call(this, hookData);
      }

      // Execute with learning
      return await runner.executeWithLearning(
        originalHook.run.bind(this),
        hookData,
      );
    },

    // Expose learning stats
    getLearningStats: async function () {
      return await runner.getLearningStats();
    },

    // Expose the runner for advanced usage
    _learningRunner: runner,
  };
}

/**
 * Convert existing hooks to use learning
 * This updates the actual hook files to import learning
 */
async function convertHookToLearning(hookPath, options = {}) {
  const hookContent = fs.readFileSync(hookPath, "utf8");
  const hookName = path.basename(hookPath, ".js");

  // Check if already converted
  if (hookContent.includes("withLearning")) {
    console.log(`Hook ${hookName} already uses learning`);
    return false;
  }

  // Create backup
  const backupPath = hookPath + ".backup";
  fs.writeFileSync(backupPath, hookContent);

  // Generate new content with learning
  const newContent = `#!/usr/bin/env node

/**
 * ${hookName} - Enhanced with learning capabilities
 * Original backed up to ${path.basename(backupPath)}
 */

const { withLearning } = require('../learning/hook-integration-adapter');
const path = require('path');

// Wrap original hook with learning
module.exports = withLearning(path.join(__dirname, '${path.basename(backupPath)}'), {
  family: '${options.family || detectHookFamily(hookPath)}',
  priority: '${options.priority || "medium"}'
});

// For direct execution
if (require.main === module) {
  const hook = module.exports;
  hook.run(JSON.parse(process.argv[2] || '{}')).then(result => {
    console.log(JSON.stringify(result));
    process.exit(result.exitCode || 0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
`;

  fs.writeFileSync(hookPath, newContent);
  console.log(`✅ Converted ${hookName} to use learning`);
  return true;
}

/**
 * Detect hook family from path and content
 */
function detectHookFamily(hookPath) {
  const content = fs.readFileSync(hookPath, "utf8").toLowerCase();
  const fileName = path.basename(hookPath);

  if (fileName.includes("prevent") || content.includes("block")) {
    return "enforcement";
  }
  if (fileName.includes("validate") || fileName.includes("check")) {
    return "validation";
  }
  if (fileName.includes("format") || fileName.includes("fix")) {
    return "formatting";
  }
  if (content.includes("performance") || content.includes("timeout")) {
    return "performance";
  }

  return "general";
}

/**
 * Batch convert all hooks in a directory
 */
async function convertAllHooks(hooksDir = path.join(__dirname, "../../")) {
  const results = {
    converted: [],
    skipped: [],
    failed: [],
  };

  const hookFiles = fs
    .readdirSync(hooksDir)
    .filter(
      (f) => f.endsWith(".js") && !f.includes("test") && !f.includes("lib"),
    );

  for (const hookFile of hookFiles) {
    const hookPath = path.join(hooksDir, hookFile);

    try {
      const converted = await convertHookToLearning(hookPath);
      if (converted) {
        results.converted.push(hookFile);
      } else {
        results.skipped.push(hookFile);
      }
    } catch (error) {
      results.failed.push({ file: hookFile, error: error.message });
    }
  }

  return results;
}

/**
 * Learning-aware hook runner for production use
 */
class LearningAwareHookRunner {
  constructor() {
    this.hooks = new Map();
  }

  /**
   * Register a hook with learning
   */
  register(hookPath, options = {}) {
    const hook = withLearning(hookPath, options);
    this.hooks.set(hook.name, hook);
    return hook;
  }

  /**
   * Run a hook by name
   */
  async run(hookName, hookData) {
    const hook = this.hooks.get(hookName);
    if (!hook) {
      throw new Error(`Hook not found: ${hookName}`);
    }
    return await hook.run(hookData);
  }

  /**
   * Get all learning stats
   */
  async getAllStats() {
    const stats = {};
    for (const [name, hook] of this.hooks) {
      if (hook.getLearningStats) {
        stats[name] = await hook.getLearningStats();
      }
    }
    return stats;
  }
}

module.exports = {
  withLearning,
  convertHookToLearning,
  convertAllHooks,
  detectHookFamily,
  LearningAwareHookRunner,
};

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case "convert":
      const hookPath = process.argv[3];
      if (!hookPath) {
        console.error(
          "Usage: node hook-integration-adapter.js convert <hook-path>",
        );
        process.exit(1);
      }
      convertHookToLearning(hookPath)
        .then(() => console.log("Conversion complete"))
        .catch((err) => {
          console.error("Conversion failed:", err);
          process.exit(1);
        });
      break;

    case "convert-all":
      const dir = process.argv[3] || path.join(__dirname, "../../");
      convertAllHooks(dir)
        .then((results) => {
          console.log("\nConversion Results:");
          console.log(`✅ Converted: ${results.converted.length}`);
          console.log(`⏭️  Skipped: ${results.skipped.length}`);
          console.log(`❌ Failed: ${results.failed.length}`);

          if (results.failed.length > 0) {
            console.log("\nFailed conversions:");
            results.failed.forEach((f) =>
              console.log(`  ${f.file}: ${f.error}`),
            );
          }
        })
        .catch((err) => {
          console.error("Batch conversion failed:", err);
          process.exit(1);
        });
      break;

    default:
      console.log("Hook Integration Adapter");
      console.log("\nCommands:");
      console.log(
        "  convert <hook-path>     Convert a single hook to use learning",
      );
      console.log("  convert-all [dir]       Convert all hooks in directory");
      console.log("\nExample:");
      console.log(
        "  node hook-integration-adapter.js convert ../prevent-improved-files.js",
      );
  }
}
