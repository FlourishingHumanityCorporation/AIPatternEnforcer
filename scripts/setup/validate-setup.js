#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

/**
 * Setup Validation System
 * Checks project health and provides actionable feedback
 */

class SetupValidator {
  constructor() {
    this.checks = [];
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
  }

  // Add a validation check
  addCheck(name, fn, options = {}) {
    this.checks.push({
      name,
      fn,
      critical: options.critical || false,
      category: options.category || 'general'
    });
  }

  // Run all checks
  async validate() {
    logger.info(chalk.blue.bold('\n🔍 ProjectTemplate Setup Validator\n'));

    const categories = [...new Set(this.checks.map((c) => c.category))];

    for (const category of categories) {
      logger.info(chalk.yellow(`\n${category.toUpperCase()}`));
      logger.info(chalk.gray('─'.repeat(40)));

      const categoryChecks = this.checks.filter((c) => c.category === category);

      for (const check of categoryChecks) {
        process.stdout.write(`  ${check.name}...`);

        try {
          const result = await check.fn();

          if (result.status === 'pass') {
            logger.info(chalk.green(' ✓'));
            this.results.passed++;
            if (result.info) {
              logger.info(chalk.gray(`    └─ ${result.info}`));
            }
          } else if (result.status === 'warning') {
            logger.info(chalk.yellow(' ⚠'));
            this.results.warnings++;
            logger.info(chalk.yellow(`    └─ ${result.message}`));
            if (result.fix) {
              logger.info(chalk.blue(`    └─ Fix: ${result.fix}`));
            }
          } else {
            logger.info(chalk.red(' ✗'));
            this.results.failed++;
            this.results.errors.push({
              check: check.name,
              message: result.message,
              fix: result.fix,
              critical: check.critical
            });
            logger.info(chalk.red(`    └─ ${result.message}`));
            if (result.fix) {
              logger.info(chalk.blue(`    └─ Fix: ${result.fix}`));
            }
          }
        } catch (error) {
          logger.info(chalk.red(' ✗'));
          this.results.failed++;
          this.results.errors.push({
            check: check.name,
            message: error.message,
            critical: check.critical
          });
          logger.info(chalk.red(`    └─ Error: ${error.message}`));
        }
      }
    }

    this.printSummary();
  }

  // Print validation summary
  printSummary() {
    logger.info(chalk.blue('\n\nSUMMARY'));
    logger.info(chalk.gray('─'.repeat(40)));

    logger.info(`  ${chalk.green('Passed:')} ${this.results.passed}`);
    logger.info(`  ${chalk.yellow('Warnings:')} ${this.results.warnings}`);
    logger.info(`  ${chalk.red('Failed:')} ${this.results.failed}`);

    if (this.results.errors.length > 0) {
      logger.info(chalk.red('\n\nCRITICAL ISSUES:'));

      const criticalErrors = this.results.errors.filter((e) => e.critical);
      if (criticalErrors.length > 0) {
        criticalErrors.forEach((error) => {
          logger.info(`  ${chalk.red('●')} ${error.check}: ${error.message}`);
          if (error.fix) {
            logger.info(`    ${chalk.blue('→')} ${error.fix}`);
          }
        });
      }

      logger.info(chalk.yellow('\n\nOTHER ISSUES:'));
      const nonCriticalErrors = this.results.errors.filter((e) => !e.critical);
      nonCriticalErrors.forEach((error) => {
        logger.info(`  ${chalk.yellow('●')} ${error.check}: ${error.message}`);
        if (error.fix) {
          logger.info(`    ${chalk.blue('→')} ${error.fix}`);
        }
      });
    }

    // Overall status
    logger.info('\n');
    if (this.results.failed === 0) {
      logger.info(chalk.green.bold('✅ Setup validation passed! Your project is ready to use.'));
    } else if (this.results.errors.some((e) => e.critical)) {
      logger.info(chalk.red.bold('❌ Setup validation failed! Critical issues must be fixed.'));
      process.exit(1);
    } else {
      logger.info(chalk.yellow.bold('⚠️  Setup has minor issues but is usable.'));
    }
  }
}

// Initialize validator
const validator = new SetupValidator();

// DEPENDENCY CHECKS
validator.addCheck('Node.js version', () => {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.split('.')[0].substring(1));

  if (major >= 16) {
    return { status: 'pass', info: nodeVersion };
  } else {
    return {
      status: 'fail',
      message: `Node.js ${nodeVersion} is too old (need v16+)`,
      fix: 'Install Node.js v16 or higher'
    };
  }
}, { category: 'dependencies', critical: true });

validator.addCheck('npm version', () => {
  try {
    const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
    const major = parseInt(npmVersion.split('.')[0]);

    if (major >= 7) {
      return { status: 'pass', info: `v${npmVersion}` };
    } else {
      return {
        status: 'warning',
        message: `npm v${npmVersion} is old (recommend v7+)`,
        fix: 'Run: npm install -g npm@latest'
      };
    }
  } catch {
    return {
      status: 'fail',
      message: 'npm not found',
      fix: 'Install npm'
    };
  }
}, { category: 'dependencies' });

validator.addCheck('node_modules exists', () => {
  if (fs.existsSync('node_modules')) {
    const count = fs.readdirSync('node_modules').length;
    return { status: 'pass', info: `${count} packages installed` };
  } else {
    return {
      status: 'fail',
      message: 'Dependencies not installed',
      fix: 'Run: npm install'
    };
  }
}, { category: 'dependencies', critical: true });

// PROJECT STRUCTURE CHECKS
validator.addCheck('package.json exists', () => {
  if (fs.existsSync('package.json')) {
    return { status: 'pass' };
  } else {
    return {
      status: 'fail',
      message: 'package.json not found',
      fix: 'Ensure you are in the project root directory'
    };
  }
}, { category: 'project structure', critical: true });

validator.addCheck('Source directories', () => {
  const requiredDirs = ['src', 'scripts', 'tools', 'templates'];
  const missing = requiredDirs.filter((dir) => !fs.existsSync(dir));

  if (missing.length === 0) {
    return { status: 'pass' };
  } else {
    return {
      status: 'fail',
      message: `Missing directories: ${missing.join(', ')}`,
      fix: 'Run setup wizard or create directories manually'
    };
  }
}, { category: 'project structure' });

validator.addCheck('Generator templates', () => {
  const templateDirs = ['templates/component', 'templates/api', 'templates/feature'];
  const missing = templateDirs.filter((dir) => !fs.existsSync(dir));

  if (missing.length === 0) {
    return { status: 'pass' };
  } else {
    return {
      status: 'warning',
      message: `Missing template directories: ${missing.join(', ')}`,
      fix: 'Generators may not work properly'
    };
  }
}, { category: 'project structure' });

// CONFIGURATION CHECKS
validator.addCheck('AI configuration', () => {
  const aiConfigs = [
  'ai/config/.cursorrules',
  '.ai-enforcement.json',
  'ai/config/context-rules.json'];


  const existing = aiConfigs.filter((f) => fs.existsSync(f));

  if (existing.length > 0) {
    return { status: 'pass', info: `${existing.length} AI configs found` };
  } else {
    return {
      status: 'warning',
      message: 'No AI configuration found',
      fix: 'Run: npm run setup:guided'
    };
  }
}, { category: 'configuration' });

validator.addCheck('Git hooks', () => {
  if (fs.existsSync('.husky')) {
    return { status: 'pass' };
  } else {
    return {
      status: 'warning',
      message: 'Git hooks not installed',
      fix: 'Run: npm run setup:hooks'
    };
  }
}, { category: 'configuration' });

validator.addCheck('TypeScript config', () => {
  if (fs.existsSync('tsconfig.json')) {
    try {
      JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      return { status: 'pass' };
    } catch {
      return {
        status: 'fail',
        message: 'tsconfig.json is invalid',
        fix: 'Check JSON syntax in tsconfig.json'
      };
    }
  } else {
    return {
      status: 'warning',
      message: 'TypeScript not configured',
      fix: 'Add tsconfig.json for TypeScript support'
    };
  }
}, { category: 'configuration' });

// GENERATOR CHECKS
validator.addCheck('Component generator', () => {
  const generatorPath = 'tools/generators/enhanced-component-generator.js';
  if (fs.existsSync(generatorPath)) {
    return { status: 'pass' };
  } else {
    return {
      status: 'fail',
      message: 'Component generator not found',
      fix: 'Ensure tools/generators directory is complete'
    };
  }
}, { category: 'generators' });

validator.addCheck('Generator commands', () => {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const generatorScripts = ['g:c', 'g:api', 'g:feature', 'g:hook'];
    const missing = generatorScripts.filter((s) => !pkg.scripts[s]);

    if (missing.length === 0) {
      return { status: 'pass' };
    } else {
      return {
        status: 'warning',
        message: `Missing generator scripts: ${missing.join(', ')}`,
        fix: 'Check package.json scripts section'
      };
    }
  } catch {
    return {
      status: 'fail',
      message: 'Cannot read package.json',
      fix: 'Ensure package.json is valid JSON'
    };
  }
}, { category: 'generators' });

// AI CONNECTIVITY CHECKS
validator.addCheck('Claude context command', () => {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.scripts['context'] || pkg.scripts['ai:context']) {
      return { status: 'pass' };
    } else {
      return {
        status: 'warning',
        message: 'AI context command not configured',
        fix: 'Add context command to package.json'
      };
    }
  } catch {
    return { status: 'fail', message: 'Cannot check AI commands' };
  }
}, { category: 'ai connectivity' });

validator.addCheck('AI ignore file', () => {
  if (fs.existsSync('.aiignore')) {
    const lines = fs.readFileSync('.aiignore', 'utf8').split('\n').filter((l) => l.trim());
    return { status: 'pass', info: `${lines.length} ignore patterns` };
  } else {
    return {
      status: 'warning',
      message: '.aiignore file not found',
      fix: 'Create .aiignore to optimize AI context'
    };
  }
}, { category: 'ai connectivity' });

// Run validation
validator.validate().catch((error) => {
  logger.error(chalk.red('Validation error:'), error);
  process.exit(1);
});