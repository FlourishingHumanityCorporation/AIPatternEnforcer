#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");

// Simple logger
const logger = console;

// User states
const UserState = {
  CLEAN_CLONE: "clean_clone",
  COMPONENTS_IN_ROOT: "components_in_root",
  MODIFIED_META_PROJECT: "modified_meta_project",
  ALREADY_MIGRATED: "already_migrated",
  STARTER_PROJECT: "starter_project",
  UNKNOWN: "unknown",
};

class MigrationDetector {
  constructor() {
    this.projectRoot = process.cwd();
    this.state = UserState.UNKNOWN;
    this.details = {
      hasComponentsInRoot: false,
      hasStartersDir: false,
      hasAppDir: false,
      hasModifications: false,
      componentCount: 0,
      gitStatus: "clean",
      recommendation: "",
    };
  }

  async detect() {
    logger.info(chalk.blue("\n🔍 Detecting your project state...\n"));

    // Check various indicators
    await this.checkDirectories();
    await this.checkGitStatus();
    await this.checkComponents();

    // Determine state
    this.determineState();

    // Show results
    this.displayResults();

    return this.state;
  }

  async checkDirectories() {
    // Check for key directories
    this.details.hasComponentsInRoot = fs.existsSync(
      path.join(this.projectRoot, "components"),
    );
    this.details.hasStartersDir = fs.existsSync(
      path.join(this.projectRoot, "starters"),
    );
    this.details.hasAppDir = fs.existsSync(path.join(this.projectRoot, "app"));
    this.details.hasMetaDir = fs.existsSync(
      path.join(this.projectRoot, "meta"),
    );
    this.details.hasToolsHooks = fs.existsSync(
      path.join(this.projectRoot, "tools/hooks"),
    );
  }

  async checkGitStatus() {
    try {
      const status = execSync("git status --porcelain", { encoding: "utf8" });
      this.details.gitStatus = status.trim() ? "modified" : "clean";
      this.details.hasModifications = status.trim().length > 0;

      // Check for untracked files
      const untracked = status
        .split("\n")
        .filter((line) => line.startsWith("??")).length;
      this.details.untrackedFiles = untracked;
    } catch (error) {
      this.details.gitStatus = "no-git";
    }
  }

  async checkComponents() {
    const componentsPath = path.join(this.projectRoot, "components");
    if (fs.existsSync(componentsPath)) {
      try {
        const items = fs.readdirSync(componentsPath);
        this.details.componentCount = items.filter((item) => {
          const itemPath = path.join(componentsPath, item);
          return fs.statSync(itemPath).isDirectory() && !item.startsWith(".");
        }).length;
      } catch (error) {
        this.details.componentCount = 0;
      }
    }
  }

  determineState() {
    // Already in a starter project
    if (this.details.hasAppDir && !this.details.hasToolsHooks) {
      this.state = UserState.STARTER_PROJECT;
      this.details.recommendation =
        "You are already in a starter project. No migration needed!";
      return;
    }

    // Already migrated
    if (this.details.hasStartersDir && !this.details.hasComponentsInRoot) {
      this.state = UserState.ALREADY_MIGRATED;
      this.details.recommendation =
        "Your project is already migrated to the new structure.";
      return;
    }

    // Has components in root - needs migration
    if (this.details.hasComponentsInRoot && this.details.componentCount > 0) {
      this.state = UserState.COMPONENTS_IN_ROOT;
      this.details.recommendation =
        "You have components in root that should be migrated to a starter.";
      return;
    }

    // Modified meta-project
    if (this.details.hasModifications && this.details.hasToolsHooks) {
      this.state = UserState.MODIFIED_META_PROJECT;
      this.details.recommendation =
        "You have modifications in the meta-project. Review before migration.";
      return;
    }

    // Clean clone
    if (this.details.gitStatus === "clean" && this.details.hasToolsHooks) {
      this.state = UserState.CLEAN_CLONE;
      this.details.recommendation =
        "Clean installation. Ready to create your first project!";
      return;
    }
  }

  displayResults() {
    logger.info(chalk.cyan("📊 Project State Analysis:\n"));

    // State badge
    const stateBadge = this.getStateBadge();
    logger.info(`State: ${stateBadge}\n`);

    // Details
    logger.info(chalk.white("Details:"));
    logger.info(
      chalk.gray(
        `  • Components in root: ${this.details.hasComponentsInRoot ? `Yes (${this.details.componentCount} found)` : "No"}`,
      ),
    );
    logger.info(
      chalk.gray(
        `  • Starters directory: ${this.details.hasStartersDir ? "Yes" : "No"}`,
      ),
    );
    logger.info(chalk.gray(`  • Git status: ${this.details.gitStatus}`));
    logger.info(
      chalk.gray(
        `  • Project type: ${this.details.hasToolsHooks ? "Meta-project" : "User project"}\n`,
      ),
    );

    // Recommendation
    logger.info(chalk.yellow("💡 Recommendation:"));
    logger.info(chalk.white(`  ${this.details.recommendation}\n`));

    // Next steps
    this.showNextSteps();
  }

  getStateBadge() {
    switch (this.state) {
      case UserState.CLEAN_CLONE:
        return chalk.green("✅ CLEAN INSTALLATION");
      case UserState.COMPONENTS_IN_ROOT:
        return chalk.yellow("⚠️  NEEDS MIGRATION");
      case UserState.MODIFIED_META_PROJECT:
        return chalk.orange("🔧 MODIFIED META-PROJECT");
      case UserState.ALREADY_MIGRATED:
        return chalk.green("✅ ALREADY MIGRATED");
      case UserState.STARTER_PROJECT:
        return chalk.blue("📦 STARTER PROJECT");
      default:
        return chalk.red("❓ UNKNOWN");
    }
  }

  showNextSteps() {
    logger.info(chalk.cyan("🚀 Next Steps:\n"));

    switch (this.state) {
      case UserState.CLEAN_CLONE:
        logger.info(chalk.white("1. Create a new project:"));
        logger.info(chalk.gray("   npx create-ai-app my-project\n"));
        logger.info(chalk.white("2. Or work in a starter:"));
        logger.info(chalk.gray("   cd starters/minimal-ai-app"));
        logger.info(chalk.gray("   npm install"));
        logger.info(chalk.gray("   npm run dev"));
        break;

      case UserState.COMPONENTS_IN_ROOT:
        logger.info(chalk.white("1. Run automated migration:"));
        logger.info(chalk.gray("   npm run migrate:run\n"));
        logger.info(chalk.white("2. Or migrate manually:"));
        logger.info(chalk.gray("   cp -r components starters/minimal-ai-app/"));
        logger.info(chalk.gray("   cd starters/minimal-ai-app"));
        logger.info(chalk.gray("   npm install"));
        break;

      case UserState.ALREADY_MIGRATED:
        logger.info(chalk.white("1. Create a new project:"));
        logger.info(chalk.gray("   npx create-ai-app my-project\n"));
        logger.info(chalk.white("2. Or update the meta-project:"));
        logger.info(chalk.gray("   git pull origin main"));
        break;

      case UserState.STARTER_PROJECT:
        logger.info(chalk.white("You're all set! Continue developing:"));
        logger.info(chalk.gray("   npm run dev"));
        logger.info(chalk.gray("   npm run g:c ComponentName"));
        break;

      default:
        logger.info(chalk.white("Need help? Check the migration guide:"));
        logger.info(chalk.gray("   cat MIGRATION-STRATEGY.md"));
    }

    logger.info("");
  }
}

// Run detection if called directly
if (require.main === module) {
  const detector = new MigrationDetector();
  detector.detect().then((state) => {
    // Exit with different codes based on state
    const exitCodes = {
      [UserState.CLEAN_CLONE]: 0,
      [UserState.ALREADY_MIGRATED]: 0,
      [UserState.STARTER_PROJECT]: 0,
      [UserState.COMPONENTS_IN_ROOT]: 1,
      [UserState.MODIFIED_META_PROJECT]: 2,
      [UserState.UNKNOWN]: 3,
    };
    process.exit(exitCodes[state] || 3);
  });
}

module.exports = { MigrationDetector, UserState };
