#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const PythonLogDetector = require('./python_detector');
const JavaScriptLogDetector = require('./javascript_detector');
const { loadConfig } = require('./config-schema');
const { performance } = require('perf_hooks');

/**
 * Main Log Enforcer class
 */
class LogEnforcer {
  constructor(options = {}) {
    this.config = loadConfig(options.configPath);
    this.pythonDetector = new PythonLogDetector(this.config.languages.python);
    this.jsDetector = new JavaScriptLogDetector(this.config.languages.javascript);
    this.violations = [];
    this.stats = {
      filesAnalyzed: 0,
      violations: 0,
      timeElapsed: 0,
      filesExcluded: 0
    };
  }

  /**
   * Find all files to analyze
   */
  findFiles(patterns = ['**/*.py', '**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']) {
    const files = new Set();
    
    patterns.forEach(pattern => {
      const matches = glob.sync(pattern, {
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.cache/**',
          '**/coverage/**',
          '**/*.min.js',
          '**/*.bundle.js'
        ]
      });
      
      matches.forEach(file => files.add(file));
    });
    
    return Array.from(files);
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(filepath) {
    const ext = path.extname(filepath);
    
    if (ext === '.py' && this.config.languages.python.enabled) {
      return await this.pythonDetector.analyzeFile(filepath);
    } else if (['.js', '.jsx', '.ts', '.tsx'].includes(ext) && this.config.languages.javascript.enabled) {
      return await this.jsDetector.analyzeFile(filepath);
    }
    
    return null;
  }

  /**
   * Run enforcement on all files
   */
  async enforce(options = {}) {
    const startTime = performance.now();
    
    // Find files
    const patterns = options.patterns || undefined;
    const files = options.files || this.findFiles(patterns);
    
    console.log(`\n🔍 Log Enforcer: Analyzing ${files.length} files...\n`);
    
    // Process files in batches for performance
    const batchSize = this.config.performance.parallelism || 4;
    const results = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(file => this.analyzeFile(file))
      );
      results.push(...batchResults.filter(Boolean));
    }
    
    // Collect all violations
    this.violations = [];
    results.forEach(result => {
      if (result.violations && result.violations.length > 0) {
        this.violations.push(...result.violations);
      }
    });
    
    // Update stats
    this.stats = {
      filesAnalyzed: results.filter(r => !r.excluded).length,
      filesExcluded: results.filter(r => r.excluded).length,
      filesWithViolations: results.filter(r => !r.excluded && r.violations.length > 0).length,
      totalViolations: this.violations.length,
      timeElapsed: Math.round(performance.now() - startTime),
      results: results
    };
    
    // Generate report
    this.generateReport(options);
    
    return {
      success: this.violations.length === 0,
      violations: this.violations,
      stats: this.stats
    };
  }

  /**
   * Generate report based on configuration
   */
  generateReport(options = {}) {
    const format = options.format || this.config.reporting.format;
    
    switch (format) {
      case 'json':
        this.generateJsonReport(options);
        break;
      case 'markdown':
        this.generateMarkdownReport(options);
        break;
      case 'text':
      default:
        this.generateTextReport(options);
        break;
    }
  }

  /**
   * Generate text report
   */
  generateTextReport(options = {}) {
    const verbose = options.verbose || this.config.reporting.verbose;
    
    console.log('═'.repeat(80));
    console.log('  LOG ENFORCEMENT REPORT');
    console.log('═'.repeat(80));
    console.log();
    
    // Summary
    console.log('📊 Summary:');
    console.log(`   Files analyzed: ${this.stats.filesAnalyzed}`);
    console.log(`   Files excluded: ${this.stats.filesExcluded}`);
    console.log(`   Files with violations: ${this.stats.filesWithViolations}`);
    console.log(`   Total violations: ${this.stats.totalViolations}`);
    console.log(`   Time elapsed: ${this.stats.timeElapsed}ms`);
    console.log();
    
    if (this.violations.length === 0) {
      console.log('✅ No violations found!');
      return;
    }
    
    // Group violations by file
    const violationsByFile = {};
    this.violations.forEach(violation => {
      const file = violation.filepath;
      if (!violationsByFile[file]) {
        violationsByFile[file] = [];
      }
      violationsByFile[file].push(violation);
    });
    
    // Display violations
    console.log('❌ Violations found:\n');
    
    Object.entries(violationsByFile).forEach(([file, violations]) => {
      console.log(`📄 ${file}`);
      violations.forEach(v => {
        const location = `${v.line}:${v.column}`;
        const type = v.type === 'print_statement' ? 'print()' : `console.${v.method}()`;
        console.log(`   Line ${location}: ${type} - ${v.message}`);
      });
      console.log();
    });
    
    // Suggestions
    console.log('💡 Fix suggestions:');
    console.log('   - Run with --fix to automatically fix violations');
    console.log('   - Add "# log-enforcer-disable-next-line" to disable specific lines');
    console.log('   - Configure exceptions in .log-enforcer.json');
  }

  /**
   * Generate JSON report
   */
  generateJsonReport(options = {}) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesAnalyzed: this.stats.filesAnalyzed,
        filesExcluded: this.stats.filesExcluded,
        filesWithViolations: this.stats.filesWithViolations,
        totalViolations: this.stats.totalViolations,
        timeElapsed: this.stats.timeElapsed
      },
      violations: this.violations,
      config: this.config
    };
    
    const output = JSON.stringify(report, null, 2);
    
    if (options.outputFile || this.config.reporting.outputFile) {
      const outputPath = options.outputFile || this.config.reporting.outputFile;
      fs.writeFileSync(outputPath, output);
      console.log(`Report written to: ${outputPath}`);
    } else {
      console.log(output);
    }
  }

  /**
   * Generate Markdown report
   */
  generateMarkdownReport(options = {}) {
    let markdown = `# Log Enforcement Report\n\n`;
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    
    // Summary
    markdown += `## Summary\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Files analyzed | ${this.stats.filesAnalyzed} |\n`;
    markdown += `| Files excluded | ${this.stats.filesExcluded} |\n`;
    markdown += `| Files with violations | ${this.stats.filesWithViolations} |\n`;
    markdown += `| Total violations | ${this.stats.totalViolations} |\n`;
    markdown += `| Time elapsed | ${this.stats.timeElapsed}ms |\n\n`;
    
    if (this.violations.length === 0) {
      markdown += `✅ **No violations found!**\n`;
    } else {
      markdown += `## Violations\n\n`;
      
      // Group by file
      const violationsByFile = {};
      this.violations.forEach(violation => {
        const file = violation.filepath;
        if (!violationsByFile[file]) {
          violationsByFile[file] = [];
        }
        violationsByFile[file].push(violation);
      });
      
      Object.entries(violationsByFile).forEach(([file, violations]) => {
        markdown += `### ${file}\n\n`;
        violations.forEach(v => {
          const type = v.type === 'print_statement' ? 'print()' : `console.${v.method}()`;
          markdown += `- **Line ${v.line}:${v.column}** - ${type}: ${v.message}\n`;
        });
        markdown += `\n`;
      });
    }
    
    if (options.outputFile || this.config.reporting.outputFile) {
      const outputPath = options.outputFile || this.config.reporting.outputFile;
      fs.writeFileSync(outputPath, markdown);
      console.log(`Report written to: ${outputPath}`);
    } else {
      console.log(markdown);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    format: args.find(arg => arg.startsWith('--format='))?.split('=')[1],
    outputFile: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    patterns: args.filter(arg => !arg.startsWith('--'))
  };
  
  const enforcer = new LogEnforcer();
  
  enforcer.enforce(options).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = LogEnforcer;