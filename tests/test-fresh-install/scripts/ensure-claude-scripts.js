#!/usr/bin/env node

/**
 * Ensures claude-validation npm scripts are installed in package.json
 * Automatically adds missing scripts with proper configuration
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

class ScriptManager {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.requiredScripts = {
      'claude:validate': 'node tools/claude-validation/validate-claude.js',
      'claude:test': 'node tools/claude-validation/test-compliance.js',
      'claude:stats': 'node tools/claude-validation/validate-claude.js --stats',
      'claude:dashboard': 'open tools/claude-validation/dashboard.html',
      'claude:config': 'node tools/claude-validation/config-manager.js',
      'claude:config:status': 'node tools/claude-validation/config-manager.js status'
    };
  }

  loadPackageJson() {
    try {
      if (!fs.existsSync(this.packageJsonPath)) {
        throw new Error('package.json not found. Run this from project root.');
      }

      const content = fs.readFileSync(this.packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      logger.error(colorize(`Error loading package.json: ${error.message}`, 'red'));
      process.exit(1);
    }
  }

  savePackageJson(packageData) {
    try {
      const content = JSON.stringify(packageData, null, 2) + '\n';
      fs.writeFileSync(this.packageJsonPath, content);
      logger.info(colorize('✅ package.json updated successfully', 'green'));
    } catch (error) {
      logger.error(colorize(`Error saving package.json: ${error.message}`, 'red'));
      process.exit(1);
    }
  }

  checkScripts() {
    const packageData = this.loadPackageJson();

    if (!packageData.scripts) {
      packageData.scripts = {};
    }

    const missingScripts = [];
    const incorrectScripts = [];

    Object.entries(this.requiredScripts).forEach(([name, command]) => {
      if (!packageData.scripts[name]) {
        missingScripts.push({ name, command });
      } else if (packageData.scripts[name] !== command) {
        incorrectScripts.push({
          name,
          expected: command,
          actual: packageData.scripts[name]
        });
      }
    });

    return {
      packageData,
      missingScripts,
      incorrectScripts,
      needsUpdate: missingScripts.length > 0 || incorrectScripts.length > 0
    };
  }

  installScripts() {
    logger.info(colorize('\n🔧 Checking claude-validation npm scripts...', 'cyan'));

    const { packageData, missingScripts, incorrectScripts, needsUpdate } = this.checkScripts();

    if (!needsUpdate) {
      logger.info(colorize('✅ All claude-validation scripts are properly installed', 'green'));
      return;
    }

    logger.info(colorize('\n📝 Installing missing/incorrect scripts:', 'blue'));

    // Add missing scripts
    missingScripts.forEach(({ name, command }) => {
      packageData.scripts[name] = command;
      logger.info(colorize(`  + Added: ${name}`, 'green'));
    });

    // Fix incorrect scripts
    incorrectScripts.forEach(({ name, expected, actual }) => {
      packageData.scripts[name] = expected;
      logger.info(colorize(`  * Fixed: ${name}`, 'yellow'));
      logger.info(colorize(`    Was: ${actual}`, 'red'));
      logger.info(colorize(`    Now: ${expected}`, 'green'));
    });

    this.savePackageJson(packageData);

    logger.info(colorize(`\n✅ Installed ${missingScripts.length + incorrectScripts.length} scripts`, 'green'));
  }

  listScripts() {
    logger.info(colorize('\n📋 Required claude-validation scripts:', 'cyan'));

    Object.entries(this.requiredScripts).forEach(([name, command]) => {
      logger.info(colorize(`  ${name}:`, 'blue'));
      logger.info(`    ${command}`);
    });
  }

  validateInstallation() {
    const { needsUpdate, missingScripts, incorrectScripts } = this.checkScripts();

    if (needsUpdate) {
      logger.info(colorize('❌ Installation validation failed', 'red'));

      if (missingScripts.length > 0) {
        logger.info(colorize('\nMissing scripts:', 'yellow'));
        missingScripts.forEach(({ name }) => {
          logger.info(`  - ${name}`);
        });
      }

      if (incorrectScripts.length > 0) {
        logger.info(colorize('\nIncorrect scripts:', 'yellow'));
        incorrectScripts.forEach(({ name }) => {
          logger.info(`  - ${name}`);
        });
      }

      logger.info(colorize('\nRun: node scripts/ensure-claude-scripts.js install', 'blue'));
      process.exit(1);
    } else {
      logger.info(colorize('✅ All scripts are properly installed', 'green'));
    }
  }

  printHelp() {
    logger.info(`
${colorize('Claude Validation Script Manager', 'cyan')}

${colorize('Usage:', 'bright')}
  ensure-claude-scripts <command>

${colorize('Commands:', 'bright')}
  install     Install/update all required npm scripts
  check       Check which scripts are missing or incorrect
  list        List all required scripts
  validate    Validate current installation
  help        Show this help message

${colorize('Examples:', 'bright')}
  node scripts/ensure-claude-scripts.js install
  node scripts/ensure-claude-scripts.js check
  node scripts/ensure-claude-scripts.js validate
    `);
  }
}

// CLI handling
if (require.main === module) {
  const manager = new ScriptManager();
  const command = process.argv[2];

  switch (command) {
    case 'install':
      manager.installScripts();
      break;
    case 'check':
      const result = manager.checkScripts();
      if (result.needsUpdate) {
        logger.info(colorize('Scripts need updates:', 'yellow'));
        result.missingScripts.forEach((s) => logger.info(`  Missing: ${s.name}`));
        result.incorrectScripts.forEach((s) => logger.info(`  Incorrect: ${s.name}`));
      } else {
        logger.info(colorize('All scripts are up to date', 'green'));
      }
      break;
    case 'list':
      manager.listScripts();
      break;
    case 'validate':
      manager.validateInstallation();
      break;
    case 'help':
    default:
      manager.printHelp();
      break;
  }
}

module.exports = ScriptManager;