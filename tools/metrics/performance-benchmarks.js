#!/usr/bin/env node
/**
 * Performance Benchmarking System
 * 
 * Establishes baseline performance metrics for ProjectTemplate operations
 * to track system efficiency and identify optimization opportunities.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { performance } = require('perf_hooks');
const { execSync } = require('child_process');

class PerformanceBenchmarks {
  constructor() {
    this.projectRoot = process.cwd();
    this.benchmarkFile = path.join(this.projectRoot, '.performance-benchmarks.json');
    this.results = {};
  }

  async benchmark(name, fn, iterations = 3) {
    console.log(chalk.gray(`🔄 Benchmarking ${name}...`));
    
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    this.results[name] = {
      average: Math.round(avg),
      min: Math.round(min),
      max: Math.round(max),
      iterations,
      timestamp: new Date().toISOString()
    };
    
    console.log(chalk.green(`   ✓ ${name}: ${Math.round(avg)}ms avg`));
    return this.results[name];
  }

  async benchmarkGenerators() {
    console.log(chalk.cyan.bold('\n🔧 Generator Performance Benchmarks\n'));
    
    // Component Generator
    await this.benchmark('Component Generator', async () => {
      try {
        execSync('npm run g:component TestBenchmarkComponent', { 
          stdio: 'pipe',
          cwd: this.projectRoot
        });
        // Clean up
        execSync('rm -rf src/components/TestBenchmarkComponent', { stdio: 'pipe' });
      } catch (error) {
        // Expected if directory structure doesn't exist
      }
    });

    // API Generator
    await this.benchmark('API Generator', async () => {
      try {
        execSync('npm run g:api testbenchmark', { 
          stdio: 'pipe',
          cwd: this.projectRoot
        });
        // Clean up
        execSync('rm -rf src/api/testbenchmark', { stdio: 'pipe' });
      } catch (error) {
        // Expected if directory structure doesn't exist
      }
    });
  }

  async benchmarkEnforcement() {
    console.log(chalk.cyan.bold('\n🛡️  Enforcement Performance Benchmarks\n'));

    // Create temporary test files
    const testDir = path.join(this.projectRoot, '.temp-benchmark');
    const testFiles = [];
    
    try {
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
      }

      // Create test files with various violation patterns
      for (let i = 0; i < 10; i++) {
        const testFile = path.join(testDir, `test-file-${i}.js`);
        fs.writeFileSync(testFile, `
          // Test file ${i}
          import React from 'react';
          console.log('test');
          const component = () => <div>Test</div>;
          export default component;
        `);
        testFiles.push(testFile);
      }

      await this.benchmark('Import Check (10 files)', async () => {
        execSync('npm run check:imports', { stdio: 'pipe' });
      });

      await this.benchmark('Documentation Style Check', async () => {
        execSync('npm run check:documentation-style', { stdio: 'pipe' });
      });

      await this.benchmark('No Improved Files Check', async () => {
        execSync('npm run check:no-improved-files', { stdio: 'pipe' });
      });

    } catch (error) {
      console.log(chalk.yellow(`Warning: Enforcement benchmarks limited: ${error.message}`));
    } finally {
      // Clean up
      try {
        execSync(`rm -rf ${testDir}`, { stdio: 'pipe' });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  async benchmarkSetup() {
    console.log(chalk.cyan.bold('\n⚙️  Setup Performance Benchmarks\n'));

    // Git hooks setup
    await this.benchmark('Git Hooks Setup', async () => {
      try {
        execSync('npm run setup:hooks', { stdio: 'pipe' });
      } catch (error) {
        // May fail if already set up
      }
    });

    // Documentation validation
    await this.benchmark('Documentation Validation', async () => {
      execSync('npm run validate:docs', { stdio: 'pipe' });
    }, 1); // Only once since it's slow
  }

  saveBenchmarks() {
    const benchmarkData = {
      timestamp: new Date().toISOString(),
      system: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      results: this.results
    };

    fs.writeFileSync(this.benchmarkFile, JSON.stringify(benchmarkData, null, 2));
    console.log(chalk.green(`\n💾 Benchmarks saved to: ${this.benchmarkFile}`));
  }

  loadPreviousBenchmarks() {
    if (fs.existsSync(this.benchmarkFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.benchmarkFile, 'utf8'));
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  showComparison() {
    const previous = this.loadPreviousBenchmarks();
    if (!previous) {
      console.log(chalk.yellow('\n📊 No previous benchmarks for comparison'));
      return;
    }

    console.log(chalk.cyan.bold('\n📈 Performance Comparison\n'));
    
    Object.entries(this.results).forEach(([name, current]) => {
      const prev = previous.results[name];
      if (prev) {
        const diff = current.average - prev.average;
        const percentChange = ((diff / prev.average) * 100);
        const trend = diff > 0 ? '📈' : '📉';
        const color = diff > 0 ? 'red' : 'green';
        
        console.log(`${name.padEnd(30)} | ${current.average}ms | ${trend} ${Math.abs(Math.round(percentChange))}%`);
      } else {
        console.log(`${name.padEnd(30)} | ${current.average}ms | 🆕 New`);
      }
    });
  }

  showSummary() {
    console.log(chalk.cyan.bold('\n📊 Performance Summary\n'));
    
    const categories = {
      'Generator Performance': ['Component Generator', 'API Generator'],
      'Enforcement Performance': ['Import Check (10 files)', 'Documentation Style Check', 'No Improved Files Check'],
      'Setup Performance': ['Git Hooks Setup', 'Documentation Validation']
    };

    Object.entries(categories).forEach(([category, benchmarks]) => {
      console.log(chalk.blue.bold(category));
      benchmarks.forEach(benchmark => {
        const result = this.results[benchmark];
        if (result) {
          console.log(`   ${benchmark.padEnd(25)} | ${result.average}ms`);
        }
      });
      console.log('');
    });

    // Performance insights
    this.showPerformanceInsights();
  }

  showPerformanceInsights() {
    console.log(chalk.yellow.bold('🔍 Performance Insights\n'));
    
    const insights = [];
    
    // Generator performance analysis
    const componentTime = this.results['Component Generator']?.average;
    const apiTime = this.results['API Generator']?.average;
    
    if (componentTime && componentTime > 3000) {
      insights.push('Component generator is slower than expected (>3s). Consider optimizing template compilation.');
    }
    
    if (apiTime && apiTime > 5000) {
      insights.push('API generator is slower than expected (>5s). Consider caching template processing.');
    }
    
    // Enforcement performance analysis
    const importCheck = this.results['Import Check (10 files)']?.average;
    if (importCheck && importCheck > 2000) {
      insights.push('Import checking is slow for 10 files. Consider parallel processing or file filtering.');
    }
    
    // Setup performance
    const docsValidation = this.results['Documentation Validation']?.average;
    if (docsValidation && docsValidation > 30000) {
      insights.push('Documentation validation is very slow (>30s). Consider incremental validation.');
    }
    
    if (insights.length === 0) {
      console.log(chalk.green('✅ All performance metrics within expected ranges!'));
    } else {
      insights.forEach((insight, i) => {
        console.log(`${i + 1}. ${insight}`);
      });
    }
  }

  async runFullBenchmark() {
    console.log(chalk.cyan.bold('🚀 ProjectTemplate Performance Benchmark Suite\n'));
    console.log(chalk.gray('This will test performance of key operations...\n'));

    await this.benchmarkGenerators();
    await this.benchmarkEnforcement();
    await this.benchmarkSetup();
    
    this.saveBenchmarks();
    this.showComparison();
    this.showSummary();
  }
}

// CLI interface
if (require.main === module) {
  const benchmarks = new PerformanceBenchmarks();
  const command = process.argv[2];
  
  switch (command) {
    case 'generators':
      benchmarks.benchmarkGenerators().then(() => benchmarks.saveBenchmarks());
      break;
      
    case 'enforcement':
      benchmarks.benchmarkEnforcement().then(() => benchmarks.saveBenchmarks());
      break;
      
    case 'setup':
      benchmarks.benchmarkSetup().then(() => benchmarks.saveBenchmarks());
      break;
      
    case 'summary':
      const previous = benchmarks.loadPreviousBenchmarks();
      if (previous) {
        benchmarks.results = previous.results;
        benchmarks.showSummary();
      } else {
        console.log(chalk.yellow('No benchmark data found. Run benchmarks first.'));
      }
      break;
      
    case 'compare':
      benchmarks.showComparison();
      break;
      
    default:
      benchmarks.runFullBenchmark();
  }
}

module.exports = PerformanceBenchmarks;