#!/usr/bin/env node

const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

logger.info(chalk.blue.bold('\n🔍 ProjectTemplate Validation Suite\n'));
logger.info(chalk.gray('This will validate the complete template workflow...\n'));

const tests = [
{
  name: 'Project Creation',
  command: 'npm run test:template-creation',
  description: 'Tests if new projects can be created and run successfully',
  critical: true
},
{
  name: 'Framework Variants',
  command: 'npm run test:template-variants',
  description: 'Tests React, Next.js, and Express customizations',
  critical: true
},
{
  name: 'Component Generation',
  command: 'npm run g:component TestValidation && rm -rf src/components/TestValidation',
  description: 'Tests if component generator works',
  critical: false
},
{
  name: 'Enforcement Checks',
  command: 'npm run check:all',
  description: 'Runs all code quality enforcement checks',
  critical: false
},
{
  name: 'Documentation Validation',
  command: 'npm run validate:docs',
  description: 'Validates documentation links and structure',
  critical: false
}];


const results = [];
let criticalFailure = false;

for (const test of tests) {
  logger.info(chalk.blue(`\n▶ Running: ${test.name}`));
  logger.info(chalk.gray(`  ${test.description}`));

  try {
    const startTime = Date.now();
    execSync(test.command, { stdio: 'inherit' });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    logger.info(chalk.green(`✓ ${test.name} passed (${duration}s)`));
    results.push({ name: test.name, passed: true, duration });
  } catch (error) {
    logger.error(chalk.red(`✗ ${test.name} failed`));
    results.push({ name: test.name, passed: false });

    if (test.critical) {
      criticalFailure = true;
      logger.error(chalk.red('  This is a critical failure - stopping validation'));
      break;
    }
  }
}

// Summary
logger.info(chalk.blue.bold('\n📊 Validation Summary\n'));

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
const total = results.length;

results.forEach((result) => {
  const status = result.passed ? chalk.green('✓ PASS') : chalk.red('✗ FAIL');
  const duration = result.duration ? ` (${result.duration}s)` : '';
  logger.info(`  ${status} ${result.name}${duration}`);
});

logger.info(chalk.gray(`\n  Total: ${total} tests, ${passed} passed, ${failed} failed`));

// Overall result
if (criticalFailure) {
  logger.info(chalk.red.bold('\n❌ Validation FAILED - Critical issues found\n'));
  logger.info(chalk.yellow('Fix the critical issues before proceeding with template distribution.'));
  process.exit(1);
} else if (failed > 0) {
  logger.info(chalk.yellow.bold('\n⚠️  Validation completed with warnings\n'));
  logger.info(chalk.yellow('Some non-critical tests failed. Consider fixing these issues.'));
  process.exit(0);
} else {
  logger.info(chalk.green.bold('\n✅ All validations PASSED!\n'));
  logger.info(chalk.green('The template is ready for use and distribution.'));

  // Create validation report
  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: total,
      passed: passed,
      failed: failed
    },
    status: 'PASSED'
  };

  const reportPath = path.join(__dirname, '../../tools/metrics/template-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logger.info(chalk.gray(`\nValidation report saved to: ${reportPath}`));

  process.exit(0);
}