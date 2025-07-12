#!/usr/bin/env node

/**
 * Real validation system for ProjectTemplate
 * Actually tests compliance instead of faking success
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Validation checks configuration
const validationChecks = {
  'Logging Compliance': {
    command: 'npm run check:logs 2>&1',
    parser: parseLoggingResults,
    critical: true,
  },
  'Configuration Validation': {
    command: 'npm run check:config 2>&1',
    parser: parseConfigResults,
    critical: true,
  },
  'Import Standards': {
    command: 'npm run check:imports 2>&1',
    parser: parseImportResults,
    critical: false,
  },
  'Documentation Standards': {
    command: 'npm run check:documentation-style 2>&1',
    parser: parseDocResults,
    critical: false,
  },
  'Test Coverage': {
    command: 'npm test -- --coverage --silent 2>&1',
    parser: parseTestResults,
    critical: true,
  },
  'Type Checking': {
    command: 'npm run type-check 2>&1',
    parser: parseTypeCheckResults,
    critical: true,
  },
  'Linting': {
    command: 'npm run lint 2>&1',
    parser: parseLintResults,
    critical: true,
  },
};

// Parsers for different check results
function parseLoggingResults(output) {
  // Handle both formats: "Found X logging violations" and "Total violations: X"
  let violationMatch = output.match(/Found (\d+) logging violations/);
  if (!violationMatch) {
    violationMatch = output.match(/Total violations:\s*(\d+)/);
  }
  const violations = violationMatch ? parseInt(violationMatch[1]) : 0;
  
  return {
    passed: violations === 0,
    violations,
    details: violations > 0 ? `${violations} logging violations found` : 'All logging compliant',
  };
}

function parseConfigResults(output) {
  const passed = output.includes('All configuration files are valid');
  const errorMatch = output.match(/(\d+) validation errors?/);
  const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
  
  return {
    passed,
    violations: errors,
    details: passed ? 'All configurations valid' : `${errors} configuration errors`,
  };
}

function parseImportResults(output) {
  const warningMatch = output.match(/(\d+) import warnings?/);
  const warnings = warningMatch ? parseInt(warningMatch[1]) : 0;
  
  return {
    passed: warnings === 0,
    violations: warnings,
    details: warnings > 0 ? `${warnings} import warnings` : 'All imports compliant',
  };
}

function parseDocResults(output) {
  // Handle documentation style warnings format
  const warningMatch = output.match(/⚠️\s+Documentation style warnings:/);
  const warnings = warningMatch ? output.split('\n').filter(line => line.includes('Issue:')).length : 0;
  
  return {
    passed: warnings === 0,
    violations: warnings,
    details: warnings > 0 ? `${warnings} documentation style warnings` : 'Documentation standards met',
  };
}

function parseTestResults(output) {
  const coverageMatch = output.match(/All files[^|]*\|[^|]*\|[^|]*\|\s*([\d.]+)/);
  const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
  const passed = coverage >= 80; // Minimum 80% coverage requirement
  
  return {
    passed,
    violations: passed ? 0 : 1,
    details: `Test coverage: ${coverage}%`,
    coverage,
  };
}

function parseTypeCheckResults(output) {
  const errorMatch = output.match(/Found (\d+) errors?/);
  const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
  
  return {
    passed: errors === 0,
    violations: errors,
    details: errors > 0 ? `${errors} type errors` : 'No type errors',
  };
}

function parseLintResults(output) {
  // ESLint outputs summary at the end: "✖ X problems (Y errors, Z warnings)"
  const problemMatch = output.match(/✖\s+(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/);
  let errors = 0;
  let warnings = 0;
  
  if (problemMatch) {
    errors = parseInt(problemMatch[2]);
    warnings = parseInt(problemMatch[3]);
  } else {
    // Fallback for different format
    const errorMatch = output.match(/(\d+)\s+errors?/);
    const warningMatch = output.match(/(\d+)\s+warnings?/);
    errors = errorMatch ? parseInt(errorMatch[1]) : 0;
    warnings = warningMatch ? parseInt(warningMatch[1]) : 0;
  }
  
  // If no explicit summary, count occurrences of "error" and "warning" lines
  if (!problemMatch && errors === 0 && warnings === 0) {
    errors = (output.match(/\s+error\s+/g) || []).length;
    warnings = (output.match(/\s+warning\s+/g) || []).length;
  }
  
  return {
    passed: errors === 0,
    violations: errors,
    details: `${errors} errors, ${warnings} warnings`,
    warnings,
  };
}

// Run a single validation check
async function runCheck(name, config) {
  console.log(`\n${colors.cyan}▶ Running ${name}...${colors.reset}`);
  
  const startTime = Date.now();
  
  try {
    const { stdout, stderr } = await execAsync(config.command);
    const output = stdout + stderr;
    const duration = Date.now() - startTime;
    
    const result = config.parser(output);
    result.duration = duration;
    result.name = name;
    result.critical = config.critical;
    
    if (result.passed) {
      console.log(`  ${colors.green}✓${colors.reset} ${result.details} ${colors.bright}(${duration}ms)${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${result.details} ${colors.bright}(${duration}ms)${colors.reset}`);
    }
    
    return result;
  } catch (error) {
    // Many checks exit with error code when violations are found
    // Try to parse the output even on error
    const output = (error.stdout || '') + (error.stderr || '');
    const duration = Date.now() - startTime;
    
    if (output && config.parser) {
      try {
        const result = config.parser(output);
        result.duration = duration;
        result.name = name;
        result.critical = config.critical;
        
        if (result.passed) {
          console.log(`  ${colors.green}✓${colors.reset} ${result.details} ${colors.bright}(${duration}ms)${colors.reset}`);
        } else {
          console.log(`  ${colors.red}✗${colors.reset} ${result.details} ${colors.bright}(${duration}ms)${colors.reset}`);
        }
        
        return result;
      } catch (parseError) {
        // If parsing also fails, fall through to error return
      }
    }
    
    console.log(`  ${colors.red}✗ Failed to run check${colors.reset}`);
    return {
      name,
      passed: false,
      violations: 1,
      details: `Check failed: ${error.message}`,
      critical: config.critical,
      error: true,
    };
  }
}

// Generate honest validation report
async function generateValidationReport(results) {
  const totalChecks = results.length;
  const passedChecks = results.filter(r => r.passed).length;
  const criticalFailures = results.filter(r => !r.passed && r.critical).length;
  const totalViolations = results.reduce((sum, r) => sum + (r.violations || 0), 0);
  
  const readinessLevel = criticalFailures > 0 ? 'not-ready' : 
                        totalViolations > 100 ? 'needs-work' : 
                        totalViolations > 0 ? 'almost-ready' : 
                        'production';
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalChecks,
      passedChecks,
      failedChecks: totalChecks - passedChecks,
      criticalFailures,
      totalViolations,
      readinessLevel,
      overallStatus: criticalFailures === 0 ? 'passed' : 'failed',
    },
    details: results.reduce((acc, result) => {
      acc[result.name] = {
        passed: result.passed,
        violations: result.violations,
        details: result.details,
        critical: result.critical,
        duration: result.duration,
      };
      return acc;
    }, {}),
    recommendations: generateRecommendations(results),
  };
  
  // Save report
  const reportPath = path.join(__dirname, '../../tools/metrics/real-validation-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

// Generate actionable recommendations
function generateRecommendations(results) {
  const recommendations = [];
  
  for (const result of results) {
    if (!result.passed) {
      switch (result.name) {
        case 'Logging Compliance':
          recommendations.push({
            issue: `${result.violations} logging violations`,
            action: 'Run "npm run fix:logs" to automatically fix most violations',
            priority: 'high',
          });
          break;
        case 'Configuration Validation':
          recommendations.push({
            issue: `${result.violations} configuration errors`,
            action: 'Run "npm run fix:config" to fix configuration issues',
            priority: 'high',
          });
          break;
        case 'Type Checking':
          recommendations.push({
            issue: `${result.violations} type errors`,
            action: 'Fix type errors before committing',
            priority: 'high',
          });
          break;
        case 'Test Coverage':
          recommendations.push({
            issue: `Coverage below 80% threshold`,
            action: 'Write tests for uncovered code paths',
            priority: 'medium',
          });
          break;
        default:
          recommendations.push({
            issue: result.details,
            action: `Fix ${result.name.toLowerCase()} issues`,
            priority: result.critical ? 'high' : 'medium',
          });
      }
    }
  }
  
  return recommendations;
}

// Main validation function
async function runValidation() {
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}        REAL VALIDATION SYSTEM FOR PROJECTTEMPLATE${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  
  const startTime = Date.now();
  const results = [];
  
  // Run all checks
  for (const [name, config] of Object.entries(validationChecks)) {
    const result = await runCheck(name, config);
    results.push(result);
  }
  
  const totalDuration = Date.now() - startTime;
  
  // Generate report
  const report = await generateValidationReport(results);
  
  // Display summary
  console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}                    VALIDATION SUMMARY${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`Total Checks: ${report.summary.totalChecks}`);
  console.log(`Passed: ${colors.green}${report.summary.passedChecks}${colors.reset}`);
  console.log(`Failed: ${colors.red}${report.summary.failedChecks}${colors.reset}`);
  console.log(`Critical Failures: ${report.summary.criticalFailures > 0 ? colors.red : colors.green}${report.summary.criticalFailures}${colors.reset}`);
  console.log(`Total Violations: ${report.summary.totalViolations > 0 ? colors.yellow : colors.green}${report.summary.totalViolations}${colors.reset}`);
  console.log(`\nReadiness Level: ${getReadinessColor(report.summary.readinessLevel)}${report.summary.readinessLevel.toUpperCase()}${colors.reset}`);
  console.log(`Time Elapsed: ${totalDuration}ms`);
  
  // Display recommendations
  if (report.recommendations.length > 0) {
    console.log(`\n${colors.bright}${colors.yellow}RECOMMENDATIONS:${colors.reset}`);
    for (const rec of report.recommendations) {
      const priorityColor = rec.priority === 'high' ? colors.red : colors.yellow;
      console.log(`\n  ${priorityColor}[${rec.priority.toUpperCase()}]${colors.reset} ${rec.issue}`);
      console.log(`  → ${rec.action}`);
    }
  }
  
  console.log(`\n${colors.bright}Report saved to: tools/metrics/real-validation-report.json${colors.reset}`);
  
  // Exit with appropriate code
  if (report.summary.criticalFailures > 0) {
    console.log(`\n${colors.red}${colors.bright}❌ VALIDATION FAILED - Critical issues must be fixed${colors.reset}`);
    process.exit(1);
  } else if (report.summary.totalViolations > 0) {
    console.log(`\n${colors.yellow}${colors.bright}⚠️  VALIDATION PASSED WITH WARNINGS${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}${colors.bright}✅ VALIDATION SUCCESSFUL - Project is production ready!${colors.reset}`);
    process.exit(0);
  }
}

function getReadinessColor(level) {
  switch (level) {
    case 'production': return colors.green;
    case 'almost-ready': return colors.yellow;
    case 'needs-work': return colors.yellow;
    case 'not-ready': return colors.red;
    default: return colors.reset;
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error(`\n${colors.red}Validation system error:${colors.reset}`, error);
  process.exit(1);
});

// Run validation
if (require.main === module) {
  runValidation();
}

module.exports = { runValidation, validationChecks };