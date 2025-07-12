#!/usr/bin/env node

/**
 * Batch validation tool for multiple Claude Code responses
 * Usage: batch-validate [directory] [options]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function printHelp() {
  console.log(`
${colorize('📦 Claude Code Batch Validator', 'cyan')}

${colorize('DESCRIPTION:', 'bright')}
  Validates multiple Claude Code responses at once from a directory

${colorize('USAGE:', 'bright')}
  batch-validate [directory] [options]
  
${colorize('OPTIONS:', 'bright')}
  --pattern       File pattern to match (default: *.txt)
  --complex       Mark all as complex requests
  --simple        Mark all as simple queries
  --output        Output format: summary|detailed|json (default: summary)
  --help          Show this help message

${colorize('EXAMPLES:', 'bright')}
  ${colorize('# Validate all .txt files in responses/', 'cyan')}
  batch-validate responses/
  
  ${colorize('# Validate specific pattern', 'cyan')}
  batch-validate responses/ --pattern "claude-*.md"
  
  ${colorize('# Complex requests with detailed output', 'cyan')}
  batch-validate responses/ --complex --output detailed
  
  ${colorize('# JSON output for CI/CD', 'cyan')}
  batch-validate responses/ --output json > results.json

${colorize('EXIT CODES:', 'bright')}
  0 - All validations passed
  1 - One or more validations failed
  2 - Error occurred
  `);
}

function validateFile(filePath, options) {
  try {
    const validatorPath = path.join(__dirname, 'validate-claude.js');
    const args = [filePath];
    
    if (options.complex) args.push('--complex');
    if (options.simple) args.push('--simple');
    args.push('--quiet');
    
    execSync(`node "${validatorPath}" ${args.join(' ')}`, { encoding: 'utf8' });
    return { file: filePath, passed: true, score: 100 };
  } catch (error) {
    // Parse validation results from error output
    const output = error.stdout || '';
    const scoreMatch = output.match(/Score: (\d+)%/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    
    return {
      file: filePath,
      passed: false,
      score,
      violations: parseViolations(output)
    };
  }
}

function parseViolations(output) {
  const violations = [];
  const lines = output.split('\n');
  let inViolations = false;
  
  for (const line of lines) {
    if (line.includes('Violations:')) {
      inViolations = true;
      continue;
    }
    if (line.includes('Warnings:') || line.includes('How to Fix:')) {
      inViolations = false;
    }
    if (inViolations && line.trim().startsWith('•')) {
      violations.push(line.trim().substring(2));
    }
  }
  
  return violations;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(0);
  }
  
  // Parse arguments
  const directory = args[0];
  const options = {
    pattern: '*.txt',
    complex: args.includes('--complex'),
    simple: args.includes('--simple'),
    output: 'summary'
  };
  
  // Parse pattern
  const patternIndex = args.indexOf('--pattern');
  if (patternIndex !== -1 && args[patternIndex + 1]) {
    options.pattern = args[patternIndex + 1];
  }
  
  // Parse output format
  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    options.output = args[outputIndex + 1];
  }
  
  // Validate directory
  if (!fs.existsSync(directory)) {
    console.error(colorize(`Error: Directory "${directory}" not found`, 'red'));
    process.exit(2);
  }
  
  // Find files matching pattern
  const files = fs.readdirSync(directory)
    .filter(file => {
      // Simple glob matching
      const regex = new RegExp('^' + options.pattern.replace(/\*/g, '.*') + '$');
      return regex.test(file);
    })
    .map(file => path.join(directory, file))
    .filter(file => fs.statSync(file).isFile());
  
  if (files.length === 0) {
    console.error(colorize(`No files matching pattern "${options.pattern}" in ${directory}`, 'yellow'));
    process.exit(0);
  }
  
  console.log(colorize(`\n🔍 Validating ${files.length} files...`, 'cyan'));
  
  // Validate all files
  const results = files.map(file => validateFile(file, options));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  // Output results based on format
  if (options.output === 'json') {
    console.log(JSON.stringify({
      summary: { total: files.length, passed, failed, avgScore },
      results
    }, null, 2));
  } else if (options.output === 'detailed') {
    console.log(colorize('\n📊 Detailed Results:', 'bright'));
    results.forEach(result => {
      const status = result.passed ? colorize('✅ PASSED', 'green') : colorize('❌ FAILED', 'red');
      console.log(`\n${path.basename(result.file)}: ${status} (Score: ${result.score}%)`);
      if (result.violations && result.violations.length > 0) {
        console.log(colorize('  Violations:', 'yellow'));
        result.violations.forEach(v => console.log(`    • ${v}`));
      }
    });
    console.log('\n' + colorize('Summary:', 'bright'));
    console.log(`  Total Files: ${files.length}`);
    console.log(`  Passed: ${colorize(passed.toString(), 'green')}`);
    console.log(`  Failed: ${colorize(failed.toString(), 'red')}`);
    console.log(`  Average Score: ${avgScore.toFixed(1)}%`);
  } else {
    // Summary output
    console.log(colorize('\n📊 Validation Summary:', 'bright'));
    console.log(`  Total Files: ${files.length}`);
    console.log(`  Passed: ${colorize(passed.toString(), 'green')}`);
    console.log(`  Failed: ${colorize(failed.toString(), 'red')}`);
    console.log(`  Average Score: ${avgScore.toFixed(1)}%`);
    
    if (failed > 0) {
      console.log(colorize('\n❌ Failed Files:', 'red'));
      results.filter(r => !r.passed).forEach(r => {
        console.log(`  • ${path.basename(r.file)} (Score: ${r.score}%)`);
      });
    }
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}