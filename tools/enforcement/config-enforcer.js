#!/usr/bin/env node

const path = require('path');
const { ConfigEnforcer } = require('./config-enforcer/index');
const JsonValidator = require('./config-enforcer/validators/json-validator');
const EnvValidator = require('./config-enforcer/validators/env-validator');
const JsConfigValidator = require('./config-enforcer/validators/js-config-validator');
const YamlValidator = require('./config-enforcer/validators/yaml-validator');
const { shouldBlock, logMetrics } = require('./enforcement-config');

/**
 * Config Enforcer CLI
 * Validates and fixes configuration files across the project
 */

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  const isDryRun = args.includes('--dry-run');
  const isQuiet = args.includes('--quiet');

  try {
    const enforcer = new ConfigEnforcer();
    
    // Register validators
    enforcer.registerValidator('json', new JsonValidator(enforcer.config.fileTypes.json));
    enforcer.registerValidator('environment', new EnvValidator(enforcer.config.fileTypes.environment));
    enforcer.registerValidator('javascript', new JsConfigValidator(enforcer.config.fileTypes.javascript));
    enforcer.registerValidator('yaml', new YamlValidator(enforcer.config.fileTypes.yaml));

    switch (command) {
      case 'check':
        await runCheck(enforcer, isQuiet);
        break;
        
      case 'fix':
        await runFix(enforcer, isDryRun, isQuiet);
        break;
        
      case 'status':
        showStatus(enforcer);
        break;
        
      case 'clear-cache':
        clearCache(enforcer);
        break;
        
      case 'config':
        showConfigHelp();
        break;
        
      default:
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Config Enforcer Error:', error.message);
    if (!isQuiet) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Run configuration validation
 */
async function runCheck(enforcer, isQuiet) {
  if (!isQuiet) {
    console.log('🔍 Checking configuration files...');
  }

  const result = await enforcer.validateAll();
  
  // Log metrics for enforcement system
  logMetrics('configFiles', result.violations || []);

  if (!isQuiet) {
    displayResults(result);
  }

  // Check if violations should block (based on enforcement config)
  const hasViolations = result.violations && result.violations.length > 0;
  const shouldBlockCommit = hasViolations && shouldBlock('configFiles');

  if (shouldBlockCommit) {
    console.error('\n❌ Config validation failed with blocking violations');
    console.error('Run `npm run fix:config` to automatically fix issues, or');
    console.error('Run `npm run fix:config:dry-run` to preview fixes');
    process.exit(1);
  } else if (hasViolations && !isQuiet) {
    console.warn('\n⚠️  Config validation found issues (warnings only)');
    console.warn('Consider running `npm run fix:config` to fix them');
  } else if (!isQuiet) {
    console.log('\n✅ All configuration files are valid');
  }

  process.exit(hasViolations ? 1 : 0);
}

/**
 * Run configuration fixes
 */
async function runFix(enforcer, isDryRun, isQuiet) {
  if (!isQuiet) {
    console.log(isDryRun ? '🔍 Previewing configuration fixes...' : '🔧 Fixing configuration files...');
  }

  // First validate to find issues
  const validationResult = await enforcer.validateAll();
  
  if (!validationResult.violations || validationResult.violations.length === 0) {
    if (!isQuiet) {
      console.log('✅ No configuration issues found to fix');
    }
    return;
  }

  // Apply fixes
  const fixResult = await enforcer.applyFixes(isDryRun);
  
  if (!isQuiet) {
    displayFixResults(fixResult, isDryRun);
  }

  if (fixResult.totalChanges > 0 && !isDryRun) {
    console.log(`\n✅ Applied ${fixResult.totalChanges} fixes to configuration files`);
    if (enforcer.stats.backupsCreated > 0) {
      console.log(`📦 Created ${enforcer.stats.backupsCreated} backup files in ${enforcer.config.backup.directory}`);
    }
  } else if (isDryRun && fixResult.totalChanges > 0) {
    console.log(`\n📋 Would apply ${fixResult.totalChanges} fixes (dry run mode)`);
    console.log('Run without --dry-run to apply these changes');
  }
}

/**
 * Show enforcer status
 */
function showStatus(enforcer) {
  console.log('🔧 Config Enforcer Status:');
  console.log(`Enabled: ${enforcer.config.enabled}`);
  console.log(`Enforcement Level: ${enforcer.config.enforcementLevel}`);
  console.log(`Cache Enabled: ${enforcer.config.performance.cacheEnabled}`);
  console.log(`Backup Enabled: ${enforcer.config.backup.enabled}`);
  
  console.log('\nFile Type Configuration:');
  Object.entries(enforcer.config.fileTypes).forEach(([type, config]) => {
    const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
    console.log(`  ${type}: ${status} (severity: ${config.severity}, autoFix: ${config.autoFix})`);
  });
}

/**
 * Clear validation cache
 */
function clearCache(enforcer) {
  enforcer.cache.clearCache();
  console.log('🗑️  Cleared config enforcer cache');
}

/**
 * Display validation results
 */
function displayResults(result) {
  console.log(`\n📊 Validation Results:`);
  console.log(`Files analyzed: ${result.stats.filesAnalyzed}`);
  console.log(`Files skipped: ${result.stats.filesSkipped}`);
  console.log(`Cache hits: ${result.stats.cacheHits}`);
  console.log(`Time elapsed: ${Math.round(result.stats.timeElapsed)}ms`);

  if (result.violations && result.violations.length > 0) {
    console.log(`\n❌ Found ${result.violations.length} files with violations:`);
    
    result.violations.forEach(violation => {
      console.log(`\n📄 ${violation.filePath} (${violation.fileType}):`);
      violation.violations.forEach(v => {
        const icon = v.severity === 'error' ? '🔴' : v.severity === 'warning' ? '🟡' : 'ℹ️';
        console.log(`  ${icon} ${v.message}`);
      });
    });
  }
}

/**
 * Display fix results
 */
function displayFixResults(fixResult, isDryRun) {
  if (!fixResult.results || fixResult.results.length === 0) return;

  console.log(`\n🔧 Fix Results${isDryRun ? ' (Preview)' : ''}:`);
  
  fixResult.results.forEach(result => {
    if (result.success && result.changes.length > 0) {
      console.log(`\n✅ ${result.filePath}:`);
      result.changes.forEach(change => {
        console.log(`  • ${change}`);
      });
      if (result.backupPath && !isDryRun) {
        console.log(`  📦 Backup: ${result.backupPath}`);
      }
    } else if (!result.success) {
      console.log(`\n❌ ${result.filePath}:`);
      result.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }
  });
}

/**
 * Show configuration help
 */
function showConfigHelp() {
  console.log('⚙️  Config Enforcer Configuration:');
  console.log('');
  console.log('The config enforcer uses the standard enforcement configuration system.');
  console.log('');
  console.log('Configuration commands:');
  console.log('  npm run enforcement:status           Show current enforcement settings');
  console.log('  npm run enforcement:config enable configFiles    Enable config enforcement');
  console.log('  npm run enforcement:config disable configFiles   Disable config enforcement');
  console.log('');
  console.log('To customize config enforcer settings, create or edit:');
  console.log('  .config-enforcer.json');
  console.log('');
  console.log('Example configuration:');
  console.log(JSON.stringify({
    enabled: true,
    enforcementLevel: "WARNING",
    fileTypes: {
      json: {
        enabled: true,
        autoFix: true,
        rules: {
          requireScripts: true,
          formatJson: true
        }
      }
    }
  }, null, 2));
}

/**
 * Show help information
 */
function showHelp() {
  console.log('📋 Config Enforcer - Configuration File Validation');
  console.log('');
  console.log('Usage: node config-enforcer.js <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  check                    Validate configuration files (default)');
  console.log('  fix                     Apply automatic fixes to configuration files');
  console.log('  status                  Show enforcer configuration and status');
  console.log('  clear-cache             Clear validation cache');
  console.log('  config                  Show configuration help');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run               Preview fixes without applying them');
  console.log('  --quiet                 Suppress output (for scripts)');
  console.log('');
  console.log('Examples:');
  console.log('  npm run check:config');
  console.log('  npm run fix:config');
  console.log('  npm run fix:config:dry-run');
  console.log('');
  console.log('Integration:');
  console.log('  The config enforcer integrates with the ProjectTemplate enforcement system.');
  console.log('  Use npm run enforcement:status to see overall enforcement configuration.');
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  main,
  runCheck,
  runFix
};