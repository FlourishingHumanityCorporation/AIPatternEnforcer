#!/usr/bin/env node
const glob = require("glob");
const path = require("path");
const chalk = require("chalk");
const { loadConfig, shouldBlock, logMetrics } = require('./enforcement-config');

// Define patterns that violate naming rules
const improvedPatterns = [
"**/*_improved.*",
"**/*_enhanced.*",
"**/*_v2.*",
"**/*_v[0-9]+.*",
"**/*_updated.*",
"**/*_new.*",
"**/*_refactored.*",
"**/*_final.*",
"**/*_copy.*",
"**/*_backup.*",
"**/*_old.*",
"**/*_temp.*",
"**/*_tmp.*",
"**/*_test_v[0-9]+.*",
"**/*_FIXED.*",
"**/*_COMPLETE.*"];


// Directories to ignore
const ignorePatterns = [
"node_modules/**",
"dist/**",
"build/**",
".git/**",
"coverage/**",
".next/**",
"out/**"];


// Function to suggest better name
function suggestBetterName(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  // Remove common suffixes
  let suggested = base.
  replace(
    /_(?:improved|enhanced|v\d+|updated|new|refactored|final|copy|backup|old|temp|tmp|test_v\d+|FIXED|COMPLETE)$/i,
    ""
  ).
  replace(/\s*\(\d+\)$/, ""); // Remove (1), (2), etc.

  // If the suggested name is empty or just underscores, use a generic name
  if (!suggested || suggested.match(/^_+$/)) {
    suggested = "renamed-file";
  }

  return path.join(dir, suggested + ext);
}

// Main function
async function checkForImprovedFiles(specificFiles = []) {
  const filesToCheck = specificFiles.length > 0 ? specificFiles : null;
  let violations = [];

  if (filesToCheck) {
    // Check only specific files (from lint-staged)
    for (const file of filesToCheck) {
      for (const pattern of improvedPatterns) {
        const regex = new RegExp(
          pattern.replace(/\*/g, ".*").replace(/\./g, "\\.")
        );
        if (regex.test(file)) {
          violations.push(file);
          break;
        }
      }
    }
  } else {
    // Check all files
    violations = improvedPatterns.flatMap((pattern) =>
    glob.sync(pattern, {
      ignore: ignorePatterns,
      nodir: true
    })
    );
  }

  // Remove duplicates
  violations = [...new Set(violations)];

  // Log metrics and check if we should block
  const config = loadConfig();
  logMetrics('fileNaming', violations, config);

  const shouldBlockCommit = shouldBlock('fileNaming', config);

  if (violations.length > 0) {
    const messageType = shouldBlockCommit ? "❌ Found files violating naming rules:" : "⚠️  File naming warnings:";
    logger.error(chalk.red.bold(`\n${messageType}\n`));

    violations.forEach((file, index) => {
      const suggested = suggestBetterName(file);
      logger.error(chalk.yellow(`  ${index + 1}. ${file}`));
      logger.error(chalk.green(`     → Suggested: ${suggested}`));
      logger.error("");
    });

    logger.error(chalk.cyan.bold("💡 How to fix:"));
    logger.error(chalk.cyan("   Use git mv to rename files:"));
    logger.error(chalk.cyan("   git mv <old-name> <new-name>\n"));

    logger.error(chalk.red.bold("📚 Why this matters:"));
    logger.error(chalk.white("   - Prevents file proliferation"));
    logger.error(chalk.white("   - Maintains clean git history"));
    logger.error(chalk.white("   - Reduces confusion in codebase"));
    logger.error(chalk.white("   - Follows ProjectTemplate standards\n"));

    if (shouldBlockCommit) {
      logger.error(chalk.red.bold("🚫 Commit blocked due to naming violations."));
      logger.error(chalk.yellow("💡 File naming is always enforced at PARTIAL level and above"));
      process.exit(1);
    } else {
      logger.error(chalk.yellow.bold("⏩ Commit proceeding with warnings."));
      logger.error(chalk.cyan("💡 To fix issues: Follow suggestions above"));
      logger.error(chalk.cyan("💡 File naming will block at PARTIAL level"));
    }
  } else {
    if (!filesToCheck || filesToCheck.length === 0) {
      logger.info(chalk.green("✅ No naming violations found!"));
    }
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);

  // Handle different invocation patterns
  let files = [];

  // Check if we have file arguments
  if (args.length > 0) {
    // Filter out any flags
    files = args.filter((arg) => !arg.startsWith("-"));
  }

  checkForImprovedFiles(files).catch((error) => {
    logger.error(chalk.red("Error checking files:"), error);
    process.exit(1);
  });
}

module.exports = { checkForImprovedFiles, suggestBetterName };