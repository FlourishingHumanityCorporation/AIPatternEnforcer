#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

/**
 * Import Path Updater for AIPatternEnforcer Migration (MIGRATION-STRATEGY.md Phase 2.3)
 * 
 * This implements the import update functionality described in CLAUDE.md migration strategy.
 * When components are migrated from root/components/ to starters/[name]/components/,
 * all import paths need to be updated to maintain functionality.
 * 
 * Part of completing the "tool vs output separation" goal from CLAUDE.md.
 */
class ImportUpdater {
  constructor(targetStarter) {
    this.targetStarter = targetStarter;
    this.projectRoot = process.cwd();
    this.targetPath = path.join(this.projectRoot, targetStarter);
  }

  async updateAllImports() {
    console.log(chalk.blue('🔧 Updating import paths per MIGRATION-STRATEGY.md...\n'));

    try {
      await this.updateImportsInDirectory(this.targetPath);
      console.log(chalk.green('✅ Import paths updated successfully!\n'));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to update imports: ${error.message}`));
      throw error;
    }
  }

  async updateImportsInDirectory(dir) {
    const files = glob.sync(`${dir}/**/*.{js,jsx,ts,tsx}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
    });

    console.log(chalk.white(`• Found ${files.length} files to check...`));
    let updatedCount = 0;

    for (const file of files) {
      const wasUpdated = await this.updateFileImports(file);
      if (wasUpdated) updatedCount++;
    }

    console.log(chalk.green(`• Updated import paths in ${updatedCount} files`));
  }

  async updateFileImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Update relative imports as per MIGRATION-STRATEGY.md Phase 2.3
    content = content.replace(/from ['"]\.\.\/components\//g, "from './components/");
    content = content.replace(/from ['"]@\/components\//g, "from '@/components/");
    content = content.replace(/require\(['"]\.\.\/components\//g, "require('./components/");

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      const relativePath = path.relative(this.projectRoot, filePath);
      console.log(chalk.gray(`  ✓ Updated ${relativePath}`));
      return true;
    }
    return false;
  }
}

module.exports = { ImportUpdater };

if (require.main === module) {
  const targetStarter = process.argv[2] || 'starters/minimal-ai-app';
  const updater = new ImportUpdater(targetStarter);
  updater.updateAllImports().then(() => {
    console.log(chalk.cyan('🎯 Import updates complete per migration strategy!'));
    process.exit(0);
  }).catch(error => {
    console.error(chalk.red('\n💥 Import update failed!'));
    console.error(chalk.red(error.message));
    process.exit(1);
  });
}