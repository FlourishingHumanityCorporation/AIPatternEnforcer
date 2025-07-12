#!/usr/bin/env node

/**
 * Log Enforcer - Main enforcement script
 * Integrates with ProjectTemplate's enforcement system
 */

const fs = require('fs');
const path = require('path');
const LogEnforcer = require('./log-enforcer/index');
const PythonLogFixer = require('./log-enforcer/python_fixer');
const JavaScriptLogFixer = require('./log-enforcer/javascript_fixer');
const AdvancedJavaScriptLogFixer = require('./log-enforcer/advanced_javascript_fixer');

class LogEnforcementSystem {
  constructor() {
    this.enforcer = new LogEnforcer();
    this.pythonFixer = new PythonLogFixer();
    this.jsFixer = new JavaScriptLogFixer();
  }

  /**
   * Check logging compliance
   */
  async check(options = {}) {
    console.log('🔍 Checking logging compliance...');
    
    const result = await this.enforcer.enforce({
      ...options,
      format: options.format || 'text'
    });
    
    return {
      success: result.success,
      violations: result.violations,
      stats: result.stats,
      message: result.success 
        ? '✅ All files pass logging compliance checks'
        : `❌ Found ${result.violations.length} logging violations`
    };
  }

  /**
   * Fix logging violations
   */
  async fix(options = {}) {
    console.log('🔧 Fixing logging violations...');
    
    // First, check for violations
    const checkResult = await this.enforcer.enforce({
      ...options,
      format: 'json'
    });
    
    if (checkResult.violations.length === 0) {
      return {
        success: true,
        message: '✅ No violations to fix',
        changes: []
      };
    }
    
    // Group violations by file and language
    const pythonFiles = new Set();
    const jsFiles = new Set();
    
    checkResult.violations.forEach(violation => {
      const ext = path.extname(violation.filepath);
      if (ext === '.py') {
        pythonFiles.add(violation.filepath);
      } else if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        jsFiles.add(violation.filepath);
      }
    });
    
    const results = [];
    
    // Fix Python files
    if (pythonFiles.size > 0) {
      const pythonResults = await this.pythonFixer.fixFiles(
        Array.from(pythonFiles),
        { dryRun: options.dryRun }
      );
      results.push(...pythonResults.files);
    }
    
    // Fix JavaScript/TypeScript files
    if (jsFiles.size > 0) {
      const jsResults = await this.jsFixer.fixFiles(
        Array.from(jsFiles),
        { dryRun: options.dryRun }
      );
      results.push(...jsResults.files);
    }
    
    const successfulFixes = results.filter(r => r.success && r.changes?.length > 0);
    const totalChanges = results.reduce((sum, r) => sum + (r.changes?.length || 0), 0);
    
    return {
      success: true,
      message: options.dryRun 
        ? `📋 Would fix ${totalChanges} violations in ${successfulFixes.length} files`
        : `✅ Fixed ${totalChanges} violations in ${successfulFixes.length} files`,
      changes: results,
      stats: {
        filesProcessed: results.length,
        filesFixed: successfulFixes.length,
        totalChanges
      }
    };
  }

  /**
   * Generate configuration file
   */
  async generateConfig(options = {}) {
    const configPath = options.configPath || '.log-enforcer.json';
    
    if (fs.existsSync(configPath) && !options.force) {
      return {
        success: false,
        message: `❌ Config file already exists at ${configPath}. Use --force to overwrite.`
      };
    }
    
    const defaultConfig = {
      enabled: true,
      languages: {
        python: {
          enabled: true,
          severity: 'error',
          autoFix: true,
          excludePatterns: [
            '**/migrations/**/*.py',
            '**/venv/**/*.py',
            '**/.venv/**/*.py'
          ]
        },
        javascript: {
          enabled: true,
          severity: 'error',
          autoFix: true,
          preferredLogger: 'winston',
          excludePatterns: [
            '**/node_modules/**/*.js',
            '**/dist/**/*.js',
            '**/*.min.js'
          ]
        }
      },
      rules: {
        noPrintStatements: {
          enabled: true,
          severity: 'error',
          message: 'Use logging.getLogger(__name__) instead of print()'
        },
        noConsoleUsage: {
          enabled: true,
          severity: 'error',
          message: 'Use proper logging library instead of console',
          allowedMethods: []
        }
      },
      performance: {
        enableCache: true,
        parallelism: 4
      },
      reporting: {
        format: 'text',
        verbose: false
      }
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    
    return {
      success: true,
      message: `✅ Created log enforcer config at ${configPath}`,
      configPath
    };
  }

  /**
   * Show status and statistics
   */
  async status(options = {}) {
    const result = await this.enforcer.enforce({
      ...options,
      format: 'json'
    });
    
    console.log('\n📊 Log Enforcer Status\n');
    console.log(`Files analyzed: ${result.stats.filesAnalyzed}`);
    console.log(`Files excluded: ${result.stats.filesExcluded}`);
    console.log(`Files with violations: ${result.stats.filesWithViolations || 0}`);
    console.log(`Total violations: ${result.violations.length}`);
    console.log(`Analysis time: ${result.stats.timeElapsed}ms`);
    
    if (result.violations.length > 0) {
      console.log('\n📋 Violation Summary:');
      
      // Group by type
      const byType = {};
      result.violations.forEach(v => {
        const type = v.type === 'print_statement' ? 'print()' : `console.${v.method}()`;
        byType[type] = (byType[type] || 0) + 1;
      });
      
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
      
      console.log('\n💡 Run with --fix to auto-fix violations');
    }
    
    return result;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  const patterns = args.filter(arg => !arg.startsWith('--') && arg !== command);
  
  const options = {
    fix: args.includes('--fix'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    verbose: args.includes('--verbose'),
    configPath: args.find(arg => arg.startsWith('--config='))?.split('=')[1],
    format: args.find(arg => arg.startsWith('--format='))?.split('=')[1],
    patterns: patterns.length > 0 ? patterns : undefined
  };
  
  const system = new LogEnforcementSystem();
  
  try {
    let result;
    
    switch (command) {
      case 'check':
        result = await system.check(options);
        break;
        
      case 'fix':
        result = await system.fix(options);
        break;
        
      case 'config':
        result = await system.generateConfig(options);
        break;
        
      case 'status':
        result = await system.status(options);
        break;
        
      default:
        console.log(`
Usage: node log-enforcer.js <command> [options]

Commands:
  check     Check for logging violations (default)
  fix       Auto-fix logging violations
  config    Generate configuration file
  status    Show enforcement status

Options:
  --fix         Auto-fix violations (with check command)
  --dry-run     Preview changes without applying them
  --force       Force overwrite existing config
  --verbose     Verbose output
  --config=PATH Use specific config file

Examples:
  node log-enforcer.js check
  node log-enforcer.js fix --dry-run
  node log-enforcer.js config --force
        `);
        process.exit(0);
    }
    
    if (result.message) {
      console.log('\\n' + result.message);
    }
    
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = LogEnforcementSystem;