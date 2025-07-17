#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { MigrationDetector, UserState } = require('./detect-state.js');
const { UserWorkBackup } = require('./backup-user-work.js');
const { ImportUpdater } = require('./update-imports.js');

/**
 * Component Migration Orchestrator (MIGRATION-STRATEGY.md Phase 2.2)
 * 
 * This implements the automated migration tool described in CLAUDE.md.
 * Goal: Transform AIPatternEnforcer from hybrid to pure meta-project
 * by moving user components from root to appropriate starter templates.
 * 
 * Follows CLAUDE.md principle: "Separate the tool from its output"
 */
class ComponentMigrator {
  constructor() {
    this.projectRoot = process.cwd();
    this.detector = new MigrationDetector();
    this.backup = new UserWorkBackup();
  }

  async migrate() {
    console.log(chalk.blue('\n🚀 AIPatternEnforcer Migration (per CLAUDE.md strategy)...\n'));

    try {
      const state = await this.detector.detect();
      
      switch (state) {
        case UserState.CLEAN_CLONE:
          return await this.handleCleanClone();
        case UserState.COMPONENTS_IN_ROOT:
          return await this.handleComponentsInRoot();
        case UserState.ALREADY_MIGRATED:
          return await this.handleAlreadyMigrated();
        case UserState.STARTER_PROJECT:
          return await this.handleStarterProject();
        default:
          throw new Error(`Unknown migration state: ${state}`);
      }
    } catch (error) {
      console.error(chalk.red(`❌ Migration failed: ${error.message}`));
      throw error;
    }
  }

  async handleCleanClone() {
    console.log(chalk.green('✅ Clean installation - migration complete!'));
    console.log(chalk.cyan('\n🎯 Next Steps:'));
    console.log(chalk.white('1. Create project: cd starters/minimal-ai-app && npm install'));
    console.log(chalk.white('2. Start coding: npm run dev'));
    return true;
  }

  async handleComponentsInRoot() {
    console.log(chalk.yellow('⚠️  Components in root - migrating per CLAUDE.md strategy...'));
    
    // Step 1: Backup user work
    console.log(chalk.blue('📦 Step 1: Creating backup...'));
    await this.backup.backup();

    // Step 2: Choose target (default to minimal-ai-app for simplicity)
    const targetStarter = 'starters/minimal-ai-app';
    console.log(chalk.blue(`📁 Step 2: Migrating to ${targetStarter}...`));
    
    // Step 3: Copy components
    await this.copyComponentsToStarter(targetStarter);
    
    // Step 4: Update imports
    console.log(chalk.blue('🔧 Step 3: Updating import paths...'));
    const updater = new ImportUpdater(targetStarter);
    await updater.updateAllImports();

    console.log(chalk.green('\n✅ Migration completed successfully!'));
    console.log(chalk.cyan('\n🎯 Next Steps:'));
    console.log(chalk.white(`1. cd ${targetStarter}`));
    console.log(chalk.white('2. npm install'));
    console.log(chalk.white('3. npm run dev'));
    return true;
  }

  async handleAlreadyMigrated() {
    console.log(chalk.green('✅ Already migrated per CLAUDE.md structure!'));
    console.log(chalk.cyan('\n🎯 Options:'));
    console.log(chalk.white('1. Create new: cd starters/minimal-ai-app'));
    console.log(chalk.white('2. Update meta-project: git pull'));
    return true;
  }

  async handleStarterProject() {
    console.log(chalk.blue('📦 You\'re in a starter project!'));
    console.log(chalk.white('✅ Continue developing: npm run g:c ComponentName'));
    return true;
  }

  async copyComponentsToStarter(targetStarter) {
    const sourceComponents = path.join(this.projectRoot, 'components');
    const targetComponents = path.join(this.projectRoot, targetStarter, 'components');

    if (!fs.existsSync(sourceComponents)) {
      console.log(chalk.gray('• No components to migrate'));
      return;
    }

    const components = fs.readdirSync(sourceComponents)
      .filter(item => {
        const itemPath = path.join(sourceComponents, item);
        return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
      });

    console.log(chalk.white(`• Migrating ${components.length} components...`));

    for (const component of components) {
      const sourcePath = path.join(sourceComponents, component);
      const targetPath = path.join(targetComponents, component);

      if (fs.existsSync(targetPath)) {
        console.log(chalk.yellow(`  ⚠️  ${component} exists, skipping...`));
        continue;
      }

      execSync(`cp -r "${sourcePath}" "${targetPath}"`, { encoding: 'utf8' });
      console.log(chalk.green(`  ✓ Migrated ${component}`));
    }
  }
}

module.exports = { ComponentMigrator };

if (require.main === module) {
  const migrator = new ComponentMigrator();
  migrator.migrate().then(() => {
    console.log(chalk.cyan('\n🎉 Migration complete per CLAUDE.md strategy!'));
    process.exit(0);
  }).catch(error => {
    console.error(chalk.red('\n💥 Migration failed!'));
    console.error(chalk.red(error.message));
    process.exit(1);
  });
}