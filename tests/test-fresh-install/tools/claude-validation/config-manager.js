#!/usr/bin/env node

/**
 * Configuration management tool for Claude validation
 * Usage: node config-manager.js [command] [options]
 */

const fs = require('fs');
const path = require('path');
const AnalyticsTracker = require('./analytics-tracker');

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

class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, '.claude-validation-config.json');
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(configData);
      }
    } catch (error) {
      logger.error(colorize(`Error loading config: ${error.message}`, 'red'));
      process.exit(1);
    }
    return null;
  }

  saveConfig(config) {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      logger.info(colorize('✅ Configuration saved successfully', 'green'));
    } catch (error) {
      logger.error(colorize(`Error saving config: ${error.message}`, 'red'));
      process.exit(1);
    }
  }

  showStatus() {
    const config = this.loadConfig();
    if (!config) {
      logger.info(colorize('❌ No configuration file found', 'red'));
      return;
    }

    logger.info(colorize('\n📋 Claude Validation Configuration Status', 'bright'));
    logger.info(`Version: ${config.version}`);
    logger.info(`Enabled: ${config.enabled ? colorize('Yes', 'green') : colorize('No', 'red')}`);
    logger.info(`Global Severity: ${colorize(config.severityLevels?.global || 'WARNING', 'cyan')}`);

    logger.info(colorize('\n📊 Pattern Status:', 'bright'));
    Object.entries(config.patterns || {}).forEach(([name, pattern]) => {
      const status = pattern.enabled ? colorize('✓', 'green') : colorize('✗', 'red');
      const severity = colorize(pattern.severity, pattern.severity === 'CRITICAL' ? 'red' :
      pattern.severity === 'WARNING' ? 'yellow' : 'blue');
      logger.info(`  ${status} ${name}: ${severity}`);
    });
  }

  setSeverity(level) {
    const config = this.loadConfig();
    if (!config) {
      logger.error(colorize('❌ Configuration file not found', 'red'));
      return;
    }

    const validLevels = ['CRITICAL', 'WARNING', 'INFO', 'DISABLED'];
    const upperLevel = level.toUpperCase();

    if (!validLevels.includes(upperLevel)) {
      logger.error(colorize(`❌ Invalid severity level: ${level}`, 'red'));
      logger.info(`Valid levels: ${validLevels.join(', ')}`);
      process.exit(1);
    }

    config.severityLevels.global = upperLevel;
    this.saveConfig(config);
    logger.info(colorize(`✅ Global severity level set to ${upperLevel}`, 'green'));

    // Track configuration change
    try {
      const analytics = new AnalyticsTracker();
      analytics.trackConfigChange('setSeverity', null, upperLevel);
    } catch (error) {

      // Don't break config changes for analytics failures
    }}

  enablePattern(patternName) {
    const config = this.loadConfig();
    if (!config) return;

    if (!config.patterns[patternName]) {
      logger.error(colorize(`❌ Pattern '${patternName}' not found`, 'red'));
      logger.info('Available patterns:', Object.keys(config.patterns).join(', '));
      process.exit(1);
    }

    config.patterns[patternName].enabled = true;
    this.saveConfig(config);
    logger.info(colorize(`✅ Pattern '${patternName}' enabled`, 'green'));

    // Track configuration change
    try {
      const analytics = new AnalyticsTracker();
      analytics.trackConfigChange('enablePattern', patternName, true);
    } catch (error) {

      // Don't break config changes for analytics failures
    }}

  disablePattern(patternName) {
    const config = this.loadConfig();
    if (!config) return;

    if (!config.patterns[patternName]) {
      logger.error(colorize(`❌ Pattern '${patternName}' not found`, 'red'));
      logger.info('Available patterns:', Object.keys(config.patterns).join(', '));
      process.exit(1);
    }

    config.patterns[patternName].enabled = false;
    this.saveConfig(config);
    logger.info(colorize(`✅ Pattern '${patternName}' disabled`, 'green'));

    // Track configuration change
    try {
      const analytics = new AnalyticsTracker();
      analytics.trackConfigChange('disablePattern', patternName, false);
    } catch (error) {

      // Don't break config changes for analytics failures
    }}

  listPatterns() {
    const config = this.loadConfig();
    if (!config) return;

    logger.info(colorize('\n📋 Available Patterns:', 'bright'));
    Object.entries(config.patterns).forEach(([name, pattern]) => {
      logger.info(colorize(`\n${name}:`, 'cyan'));
      logger.info(`  Description: ${pattern.description}`);
      logger.info(`  Severity: ${pattern.severity}`);
      logger.info(`  Enabled: ${pattern.enabled ? 'Yes' : 'No'}`);
    });
  }

  printHelp() {
    logger.info(`
${colorize('⚙️  Claude Validation Configuration Manager', 'cyan')}

${colorize('DESCRIPTION:', 'bright')}
  Manage Claude Code validation patterns and severity levels.
  Configure which rules to enforce and at what level.

${colorize('USAGE:', 'bright')}
  npm run claude:config <command> [options]

${colorize('COMMANDS:', 'bright')}
  status                    Show current configuration status
  set-severity <level>      Set global severity level
  enable <pattern>          Enable a specific validation pattern
  disable <pattern>         Disable a specific validation pattern
  list                      List all available patterns with descriptions
  help                      Show this help message

${colorize('SEVERITY LEVELS:', 'bright')}
  CRITICAL    - Validation fails if violated (blocks workflow)
  WARNING     - Shows warnings but allows continuation  
  INFO        - Shows informational messages only
  DISABLED    - Completely disabled validation

${colorize('COMMON WORKFLOWS:', 'bright')}
  ${colorize('# Check current settings', 'cyan')}
  npm run claude:config:status
  
  ${colorize('# Disable strict prompt improvement during development', 'cyan')}
  npm run claude:config disable promptImprovement
  
  ${colorize('# Set to only show critical violations', 'cyan')}
  npm run claude:config set-severity CRITICAL
  
  ${colorize('# Re-enable all patterns for production', 'cyan')}
  npm run claude:config enable promptImprovement
  npm run claude:config enable generatorUsage

${colorize('EXAMPLES:', 'bright')}
  npm run claude:config status
  npm run claude:config set-severity WARNING
  npm run claude:config disable noImprovedFiles
  npm run claude:config enable generatorUsage
  npm run claude:config list

${colorize('CONFIGURATION FILE:', 'bright')}
  tools/claude-validation/.claude-validation-config.json
    `);
  }
}

// CLI handling
if (require.main === module) {
  const manager = new ConfigManager();
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'status':
      manager.showStatus();
      break;
    case 'set-severity':
      if (args[1]) {
        manager.setSeverity(args[1]);
      } else {
        logger.error(colorize('❌ Severity level required', 'red'));
        logger.info('Usage: config-manager set-severity <CRITICAL|WARNING|INFO|DISABLED>');
      }
      break;
    case 'enable':
      if (args[1]) {
        manager.enablePattern(args[1]);
      } else {
        logger.error(colorize('❌ Pattern name required', 'red'));
        logger.info('Usage: config-manager enable <pattern-name>');
      }
      break;
    case 'disable':
      if (args[1]) {
        manager.disablePattern(args[1]);
      } else {
        logger.error(colorize('❌ Pattern name required', 'red'));
        logger.info('Usage: config-manager disable <pattern-name>');
      }
      break;
    case 'list':
      manager.listPatterns();
      break;
    case 'help':
    default:
      manager.printHelp();
      break;
  }
}

module.exports = ConfigManager;