#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Enforcement levels
const ENFORCEMENT_LEVELS = {
  SILENT: 0,    // No enforcement, just collect metrics
  WARNING: 1,   // Show violations but don't block commits
  PARTIAL: 2,   // Block file naming only (proven reliable)
  FULL: 3       // Block all violations
};

// Default configuration
const DEFAULT_CONFIG = {
  level: ENFORCEMENT_LEVELS.PARTIAL,
  checks: {
    fileNaming: {
      enabled: true,
      blockOnFailure: true,
      level: ENFORCEMENT_LEVELS.PARTIAL
    },
    imports: {
      enabled: true,
      blockOnFailure: false, // Start with warnings
      level: ENFORCEMENT_LEVELS.WARNING
    },
    documentation: {
      enabled: true,
      blockOnFailure: false, // Start with warnings
      level: ENFORCEMENT_LEVELS.WARNING,
      ignorePatterns: [
        'node_modules/**',
        'examples/**',
        'ai/examples/**',
        'ai/prompts/**',        // AI prompt templates have different standards
        'templates/**',
        'extensions/*/node_modules/**',
        'docs/testing/**',       // Test documentation can be informal
        'scripts/**',            // Script documentation can be brief
        '**/README.md',          // READMEs often have informal language
        '**/*_TEMPLATE.md',      // Template files are examples
        'docs/pilot-testing/**', // Pilot docs can be informal for usability
        'CLAUDE.md',             // Project instructions file has different standards
      ]
    },
    bannedDocs: {
      enabled: true,
      blockOnFailure: true,    // Always block these
      level: ENFORCEMENT_LEVELS.FULL,
      description: 'Prevents creation of status/completion/summary documents'
    },
    configFiles: {
      enabled: true,
      blockOnFailure: false,   // Start with warnings
      level: ENFORCEMENT_LEVELS.WARNING,
      description: 'Validates configuration file consistency and standards'
    }
  },
  metrics: {
    enabled: true,
    logPath: '.enforcement-metrics.json'
  }
};

// Load configuration from project
function loadConfig() {
  const configPath = path.join(process.cwd(), '.enforcement-config.json');
  
  if (fs.existsSync(configPath)) {
    try {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...DEFAULT_CONFIG, ...userConfig };
    } catch (error) {
      console.warn('Warning: Invalid .enforcement-config.json, using defaults');
      return DEFAULT_CONFIG;
    }
  }
  
  return DEFAULT_CONFIG;
}

// Save configuration
function saveConfig(config) {
  const configPath = path.join(process.cwd(), '.enforcement-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Check if a specific check should block commits
function shouldBlock(checkName, config = null) {
  const conf = config || loadConfig();
  const check = conf.checks[checkName];
  
  if (!check || !check.enabled) {
    return false;
  }
  
  // Global level override - below PARTIAL means no blocking
  if (conf.level < ENFORCEMENT_LEVELS.PARTIAL) {
    return false;
  }
  
  // At FULL level, all enabled checks block
  if (conf.level >= ENFORCEMENT_LEVELS.FULL) {
    return true;
  }
  
  // Otherwise, check-specific blocking based on level
  return check.blockOnFailure && conf.level >= check.level;
}

// Log metrics
function logMetrics(checkName, violations, config = null) {
  const conf = config || loadConfig();
  
  if (!conf.metrics.enabled) {
    return;
  }
  
  const metricsPath = path.join(process.cwd(), conf.metrics.logPath);
  let metrics = {};
  
  if (fs.existsSync(metricsPath)) {
    try {
      metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    } catch (error) {
      // Start fresh if corrupted
      metrics = {};
    }
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  if (!metrics[today]) {
    metrics[today] = {};
  }
  
  if (!metrics[today][checkName]) {
    metrics[today][checkName] = { runs: 0, violations: 0 };
  }
  
  metrics[today][checkName].runs++;
  metrics[today][checkName].violations += violations.length;
  
  // Keep only last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  Object.keys(metrics).forEach(date => {
    if (new Date(date) < thirtyDaysAgo) {
      delete metrics[date];
    }
  });
  
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
}

// Get enforcement level name
function getLevelName(level) {
  return Object.keys(ENFORCEMENT_LEVELS).find(key => ENFORCEMENT_LEVELS[key] === level) || 'UNKNOWN';
}

// CLI commands
function cli() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'status':
      const config = loadConfig();
      console.log('🔧 Enforcement Configuration:');
      console.log(`Global Level: ${getLevelName(config.level)}`);
      console.log('\nCheck Status:');
      Object.entries(config.checks).forEach(([name, check]) => {
        let status;
        if (!check.enabled) {
          status = '⚪ DISABLED';
        } else if (shouldBlock(name, config)) {
          status = '🔴 BLOCKING';
        } else {
          status = '🟡 WARNING';
        }
        console.log(`  ${name}: ${status} (level: ${getLevelName(check.level)})`);
      });
      break;
      
    case 'set-level':
      const level = args[1];
      if (!level || !ENFORCEMENT_LEVELS[level.toUpperCase()]) {
        console.error('Usage: node enforcement-config.js set-level <SILENT|WARNING|PARTIAL|FULL>');
        process.exit(1);
      }
      const newConfig = loadConfig();
      newConfig.level = ENFORCEMENT_LEVELS[level.toUpperCase()];
      saveConfig(newConfig);
      console.log(`✅ Set enforcement level to ${level.toUpperCase()}`);
      break;
      
    case 'enable':
      const checkToEnable = args[1];
      if (!checkToEnable) {
        console.error('Usage: node enforcement-config.js enable <fileNaming|imports|documentation|configFiles>');
        process.exit(1);
      }
      const enableConfig = loadConfig();
      if (enableConfig.checks[checkToEnable]) {
        enableConfig.checks[checkToEnable].enabled = true;
        saveConfig(enableConfig);
        console.log(`✅ Enabled ${checkToEnable} check`);
      } else {
        console.error(`Unknown check: ${checkToEnable}`);
        process.exit(1);
      }
      break;
      
    case 'disable':
      const checkToDisable = args[1];
      if (!checkToDisable) {
        console.error('Usage: node enforcement-config.js disable <fileNaming|imports|documentation|configFiles>');
        process.exit(1);
      }
      const disableConfig = loadConfig();
      if (disableConfig.checks[checkToDisable]) {
        disableConfig.checks[checkToDisable].enabled = false;
        saveConfig(disableConfig);
        console.log(`✅ Disabled ${checkToDisable} check`);
      } else {
        console.error(`Unknown check: ${checkToDisable}`);
        process.exit(1);
      }
      break;
      
    case 'metrics':
      const metricsPath = path.join(process.cwd(), loadConfig().metrics.logPath);
      if (fs.existsSync(metricsPath)) {
        const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
        console.log('📊 Enforcement Metrics (Last 30 Days):');
        Object.entries(metrics).forEach(([date, checks]) => {
          console.log(`\n${date}:`);
          Object.entries(checks).forEach(([check, data]) => {
            console.log(`  ${check}: ${data.runs} runs, ${data.violations} violations`);
          });
        });
      } else {
        console.log('No metrics collected yet');
      }
      break;
      
    default:
      console.log('Usage: node enforcement-config.js <status|set-level|enable|disable|metrics>');
      console.log('');
      console.log('Commands:');
      console.log('  status                    Show current configuration');
      console.log('  set-level <level>         Set global enforcement level');
      console.log('  enable <check>           Enable specific check');
      console.log('  disable <check>          Disable specific check');
      console.log('  metrics                  Show enforcement metrics');
      console.log('');
      console.log('Levels: SILENT, WARNING, PARTIAL, FULL');
      console.log('Checks: fileNaming, imports, documentation, configFiles');
  }
}

module.exports = {
  ENFORCEMENT_LEVELS,
  DEFAULT_CONFIG,
  loadConfig,
  saveConfig,
  shouldBlock,
  logMetrics,
  getLevelName
};

// CLI mode
if (require.main === module) {
  cli();
}