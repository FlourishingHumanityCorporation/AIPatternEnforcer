#!/usr/bin/env node

/**
 * CLI tool to validate Claude Code responses
 * Usage: validate-claude [response-file] [options]
 */

const fs = require('fs');
const path = require('path');
const ComplianceValidator = require('./compliance-validator');
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

function printHelp() {
  console.log(`
${colorize('🤖 ProjectTemplate Claude Code Validator', 'cyan')}

${colorize('DESCRIPTION:', 'bright')}
  Validates Claude Code responses against ProjectTemplate rules to ensure
  consistent behavior across development sessions.

${colorize('USAGE:', 'bright')}
  validate-claude [response-file] [options]
  
${colorize('OPTIONS:', 'bright')}
  --complex       Mark as complex request (expects prompt improvement)
  --simple        Mark as simple query (expects concise response)
  --stats         Show compliance statistics summary
  --quiet         Only show pass/fail result (for scripting)
  --help          Show this help message

${colorize('TYPICAL WORKFLOW:', 'bright')}
  1. Copy Claude Code response to clipboard
  2. Validate: ${colorize('pbpaste | npm run claude:validate', 'blue')}
  3. Review results and adjust prompt if needed

${colorize('EXAMPLES:', 'bright')}
  ${colorize('# Validate a complex implementation request', 'cyan')}
  validate-claude response.txt --complex
  
  ${colorize('# Validate piped input (common workflow)', 'cyan')}
  pbpaste | validate-claude - --complex
  
  ${colorize('# Quick validation of simple response', 'cyan')}
  echo "Use useState hook" | validate-claude - --simple
  
  ${colorize('# Check compliance statistics', 'cyan')}
  validate-claude --stats
  
  ${colorize('# Silent validation for automation', 'cyan')}
  validate-claude response.txt --quiet && echo "Passed"

${colorize('KEY PATTERNS CHECKED:', 'bright')}
  • Prompt improvement for complex requests
  • No _improved.js or _v2.js file creation
  • Generator usage for new components
  • TodoWrite for multi-step tasks
  • Concise responses for simple queries

${colorize('EXIT CODES:', 'bright')}
  0 - Validation passed
  1 - Validation failed (rule violations)
  2 - Error occurred (invalid input/config)

${colorize('MORE INFO:', 'bright')}
  Config: tools/claude-validation/.claude-validation-config.json
  Dashboard: npm run claude:dashboard
  Test Suite: npm run claude:test
  `);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(0);
  }
  
  const validator = new ComplianceValidator();
  
  // Show stats
  if (args.includes('--stats')) {
    const statsFile = path.join(__dirname, '.compliance-stats.json');
    if (fs.existsSync(statsFile)) {
      const stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
      process.stderr.write(colorize('\n📊 Compliance Statistics:', 'bright') + '\n');
      process.stderr.write(`Total Validations: ${stats.totalValidations || 0}\n`);
      process.stderr.write(`Passed: ${stats.passedValidations || 0}\n`);
      process.stderr.write(`Compliance Rate: ${((stats.passedValidations / stats.totalValidations) * 100 || 0).toFixed(1)}%\n`);
      
      if (stats.violations && Object.keys(stats.violations).length > 0) {
        process.stderr.write(colorize('\nTop Violations:', 'yellow') + '\n');
        Object.entries(stats.violations)
          .sort((a, b) => b[1] - a[1])
          .forEach(([rule, count]) => {
            process.stderr.write(`  ${rule}: ${count} times\n`);
          });
      }
    } else {
      process.stderr.write(colorize('No statistics available yet.', 'yellow') + '\n');
    }
    process.exit(0);
  }
  
  // Read response text
  const inputFile = args[0];
  let responseText;
  
  try {
    if (inputFile === '-') {
      // Read from stdin
      responseText = fs.readFileSync(0, 'utf-8');
    } else {
      // Read from file
      responseText = fs.readFileSync(inputFile, 'utf-8');
    }
  } catch (error) {
    console.error(colorize(`Error reading input: ${error.message}`, 'red'));
    process.exit(2);
  }
  
  // Set context
  const context = {
    isComplexRequest: args.includes('--complex'),
    isSimpleQuery: args.includes('--simple')
  };
  
  // Track validation start time
  const startTime = process.hrtime.bigint();
  
  // Validate
  const results = validator.validate(responseText, context);
  
  // Calculate processing time
  const endTime = process.hrtime.bigint();
  const processingTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
  
  // Save legacy stats
  const statsFile = path.join(__dirname, '.compliance-stats.json');
  try {
    let stats = {};
    if (fs.existsSync(statsFile)) {
      stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
    }
    fs.writeFileSync(statsFile, JSON.stringify(validator.stats, null, 2));
  } catch (error) {
    // Ignore stats errors for now
    console.error(colorize(`Warning: Could not save stats: ${error.message}`, 'yellow'));
  }
  
  // Track analytics
  try {
    const analytics = new AnalyticsTracker();
    analytics.trackValidation({
      passed: results.passed,
      score: results.score,
      violations: results.violations,
      isComplex: context.isComplexRequest,
      processingTime: processingTime,
      responseLength: responseText.length
    });
  } catch (error) {
    // Analytics failures should not break validation
    console.error(colorize(`Warning: Analytics tracking failed: ${error.message}`, 'yellow'));
  }
  
  // Output results
  if (!args.includes('--quiet')) {
    console.log(colorize('\n🔍 Validation Results:', 'bright'));
    console.log(`Score: ${results.score}%`);
    
    if (results.passed) {
      console.log(colorize('✅ PASSED', 'green'));
    } else {
      console.log(colorize('❌ FAILED', 'red'));
    }
    
    if (results.violations.length > 0) {
      console.log(colorize('\nViolations:', 'red'));
      results.violations.forEach(v => {
        console.log(`  • ${v.description} (${v.severity})`);
      });
    }
    
    if (results.warnings.length > 0) {
      console.log(colorize('\nWarnings:', 'yellow'));
      results.warnings.forEach(w => {
        console.log(`  • ${w.description}`);
      });
    }
    
    // Show actionable tips
    const tips = [];
    
    if (!context.isComplexRequest && !context.isSimpleQuery) {
      tips.push('Use --complex for implementation requests or --simple for quick questions');
    }
    
    if (results.violations.some(v => v.rule === 'noImprovedFiles')) {
      tips.push('Edit original files instead of creating new versions (e.g., edit auth.js, not auth_improved.js)');
    }
    
    if (results.violations.some(v => v.rule === 'promptImprovement')) {
      tips.push('Start complex requests with "**Improved Prompt**: [clear description of task]"');
    }
    
    if (results.violations.some(v => v.rule === 'generatorUsage')) {
      tips.push('Use component generators: npm run g:c ComponentName');
    }
    
    if (results.violations.some(v => v.rule === 'todoWriteUsage')) {
      tips.push('Use TodoWrite tool for multi-step tasks to track progress');
    }
    
    if (results.score < 70) {
      tips.push('Review CLAUDE.md for detailed rules and patterns');
      tips.push('Run "npm run claude:dashboard" to see compliance patterns');
    }
    
    if (tips.length > 0) {
      console.log(colorize('\n💡 How to Fix:', 'cyan'));
      tips.forEach(tip => console.log(`  • ${tip}`));
    }
    
    // Show additional resources if needed
    if (!results.passed) {
      console.log(colorize('\n📚 Resources:', 'blue'));
      console.log('  • Config: npm run claude:config:status');
      console.log('  • Dashboard: npm run claude:dashboard');
      console.log('  • Test patterns: npm run claude:test');
    }
  } else {
    // Quiet mode - just show pass/fail
    console.log(results.passed ? colorize('PASSED', 'green') : colorize('FAILED', 'red'));
  }
  
  process.exit(results.passed ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(colorize(`Error: ${error.message}`, 'red'));
    process.exit(2);
  });
}

module.exports = { main };