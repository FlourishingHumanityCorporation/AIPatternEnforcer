#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");

class UserWorkBackup {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, "migration", "backup");
    this.timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")[0];
  }

  async backup() {
    console.log(chalk.blue("\n📦 Creating backup of your work...\n"));

    try {
      // Create backup directory
      await this.ensureBackupDir();

      // Backup components if they exist
      await this.backupComponents();

      // Backup any modified files
      await this.backupModifiedFiles();

      // Create backup manifest
      await this.createManifest();

      console.log(chalk.green(`✅ Backup completed successfully!`));
      console.log(chalk.gray(`   Location: ${this.backupDir}\n`));

      return this.backupDir;
    } catch (error) {
      console.error(chalk.red(`❌ Backup failed: ${error.message}`));
      throw error;
    }
  }

  async ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async backupComponents() {
    const componentsPath = path.join(this.projectRoot, "components");
    if (!fs.existsSync(componentsPath)) {
      console.log(chalk.gray("• No components directory found, skipping..."));
      return;
    }

    const backupComponentsPath = path.join(this.backupDir, "components");
    console.log(chalk.white("• Backing up components directory..."));

    // Copy entire components directory
    execSync(`cp -r "${componentsPath}" "${backupComponentsPath}"`, {
      encoding: "utf8",
    });
    console.log(
      chalk.green(`  ✓ Components backed up to ${backupComponentsPath}`),
    );
  }

  async backupModifiedFiles() {
    try {
      // Get list of modified files from git
      const gitStatus = execSync("git status --porcelain", {
        encoding: "utf8",
      });
      const modifiedFiles = gitStatus
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.substring(3).trim()) // Remove git status prefix
        .filter(
          (file) => file && fs.existsSync(path.join(this.projectRoot, file)),
        );

      if (modifiedFiles.length === 0) {
        console.log(chalk.gray("• No modified files found, skipping..."));
        return;
      }

      console.log(
        chalk.white(`• Backing up ${modifiedFiles.length} modified files...`),
      );

      const modifiedBackupDir = path.join(this.backupDir, "modified-files");
      fs.mkdirSync(modifiedBackupDir, { recursive: true });

      for (const file of modifiedFiles) {
        const sourcePath = path.join(this.projectRoot, file);
        const targetPath = path.join(modifiedBackupDir, file);

        // Ensure target directory exists
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Copy file
        fs.copyFileSync(sourcePath, targetPath);
      }

      console.log(
        chalk.green(`  ✓ Modified files backed up to ${modifiedBackupDir}`),
      );
    } catch (error) {
      if (error.message.includes("not a git repository")) {
        console.log(
          chalk.gray("• Not a git repository, backing up all files..."),
        );
        await this.backupAllFiles();
      } else {
        throw error;
      }
    }
  }

  async backupAllFiles() {
    // Backup important directories that might contain user work
    const importantDirs = ["app", "lib", "pages", "src", "styles", "public"];

    for (const dir of importantDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        const backupPath = path.join(this.backupDir, dir);
        console.log(chalk.white(`• Backing up ${dir}/...`));
        execSync(`cp -r "${dirPath}" "${backupPath}"`, { encoding: "utf8" });
        console.log(chalk.green(`  ✓ ${dir}/ backed up`));
      }
    }
  }

  async createManifest() {
    const manifest = {
      timestamp: new Date().toISOString(),
      backupLocation: this.backupDir,
      projectRoot: this.projectRoot,
      files: this.getBackupContents(),
      gitCommit: this.getCurrentGitCommit(),
      instructions: {
        restore: "To restore: cp -r migration/backup/* .",
        location: "Backup stored in migration/backup/",
        support: "If issues occur, check MIGRATION-GUIDE.md",
      },
    };

    const manifestPath = path.join(this.backupDir, "backup-manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(chalk.green(`  ✓ Backup manifest created: ${manifestPath}`));
  }

  getBackupContents() {
    if (!fs.existsSync(this.backupDir)) return [];

    const getFilesRecursively = (dir) => {
      const files = [];
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          files.push(...getFilesRecursively(itemPath));
        } else {
          files.push(path.relative(this.backupDir, itemPath));
        }
      }

      return files;
    };

    return getFilesRecursively(this.backupDir);
  }

  getCurrentGitCommit() {
    try {
      return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    } catch (error) {
      return "not-a-git-repository";
    }
  }
}

// Export for use by other scripts
module.exports = { UserWorkBackup };

// Run backup if called directly
if (require.main === module) {
  const backup = new UserWorkBackup();
  backup
    .backup()
    .then((backupDir) => {
      console.log(chalk.cyan("\n🎯 Next Steps:"));
      console.log(chalk.white("1. Your work is safely backed up"));
      console.log(chalk.white("2. You can now run: npm run migrate:run"));
      console.log(chalk.white("3. If anything goes wrong, restore with:"));
      console.log(chalk.gray(`   cp -r "${backupDir}"/* .`));
      console.log("");
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red("\n💥 Backup failed!"));
      console.error(chalk.red(error.message));
      process.exit(1);
    });
}
