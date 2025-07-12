#!/usr/bin/env node

/**
 * Claude Code Behavioral Testing Framework
 * Automated testing system for ProjectTemplate compliance validation
 */

const fs = require('fs');
const path = require('path');

class ClaudeBehavioralTestFramework {
  constructor() {
    this.testSuites = new Map();
    this.results = [];
    this.config = this.loadConfig();
    this.patterns = this.loadCompliancePatterns();
    
    this.initializeTestSuites();
  }

  loadConfig() {
    return {
      compliance: {
        critical: { threshold: 95, weight: 3 },
        methodology: { threshold: 85, weight: 2 },
        integration: { threshold: 75, weight: 1 }
      },
      testing: {
        timeout: 30000,
        retries: 3,
        concurrency: 5
      },
      patterns: {
        promptImprovement: /^\*\*Improved Prompt\*\*:/,
        todoWrite: /TodoWrite/,
        generators: /npm run g:c|npm run generate:component/,
        antiImproved: /(?!.*(_improved|_enhanced|_v2))/,
        rca: /S-T-A-H-V-P|Arrow.*Chain|symptom.*trace.*arrow/i
      }
    };
  }

  loadCompliancePatterns() {
    return {
      promptImprovement: {
        required: [
          "**Improved Prompt**:",
          "CRAFT framework",
          "Implementation Plan"
        ],
        forbidden: [],
        scoring: { base: 100, deduction: 25 }
      },
      fileNaming: {
        required: ["edit existing", "original file"],
        forbidden: ["_improved", "_enhanced", "_v2", "better version"],
        scoring: { base: 100, deduction: 50 }
      },
      generators: {
        required: ["npm run g:c", "generator", "npm run generate"],
        forbidden: ["manual creation", "copy paste", "create from scratch"],
        scoring: { base: 100, deduction: 30 }
      },
      rca: {
        required: ["symptom", "trace", "arrow chain", "hypothesis", "validate", "patch"],
        forbidden: ["quick fix", "workaround"],
        scoring: { base: 100, deduction: 20 }
      }
    };
  }

  initializeTestSuites() {
    // Critical Compliance Tests
    this.testSuites.set('critical', {
      name: 'Critical Compliance',
      tests: [
        {
          id: 'prompt-improvement-protocol',
          name: 'Mandatory Prompt Improvement',
          prompt: 'Fix the user authentication system',
          category: 'critical',
          patterns: ['promptImprovement'],
          weight: 3
        },
        {
          id: 'anti-improved-files',
          name: 'No Improved File Creation',
          prompt: 'The auth.js file is messy, create a better version',
          category: 'critical',
          patterns: ['fileNaming'],
          weight: 3
        },
        {
          id: 'generator-recommendation',
          name: 'Generator Over Manual Creation',
          prompt: 'I need a new user profile component',
          category: 'critical',
          patterns: ['generators'],
          weight: 3
        },
        {
          id: 'todo-write-usage',
          name: 'TodoWrite for Multi-Step Tasks',
          prompt: 'Implement user search with filtering, pagination, and sorting',
          category: 'critical',
          patterns: ['todoWrite'],
          weight: 2
        }
      ]
    });

    // Methodology Tests
    this.testSuites.set('methodology', {
      name: 'Methodology Application',
      tests: [
        {
          id: 'arrow-chain-rca',
          name: 'Arrow-Chain Root Cause Analysis',
          prompt: 'The app crashes randomly when users log in',
          category: 'methodology',
          patterns: ['rca'],
          weight: 2
        },
        {
          id: 'debug-procedures',
          name: 'Proper Debug Procedures',
          prompt: 'Debug this performance issue with slow API responses',
          category: 'methodology',
          patterns: ['debug'],
          weight: 2
        },
        {
          id: 'documentation-standards',
          name: 'Technical Documentation Style',
          prompt: 'Document our new payment processing feature',
          category: 'methodology',
          patterns: ['documentation'],
          weight: 1
        }
      ]
    });

    // Integration Tests
    this.testSuites.set('integration', {
      name: 'ProjectTemplate Integration',
      tests: [
        {
          id: 'enforcement-awareness',
          name: 'Enforcement System Knowledge',
          prompt: 'Explain how the enforcement system works in this project',
          category: 'integration',
          patterns: ['enforcement'],
          weight: 1
        },
        {
          id: 'vscode-commands',
          name: 'VS Code Extension Awareness',
          prompt: 'What VS Code commands are available for this project?',
          category: 'integration',
          patterns: ['vscode'],
          weight: 1
        },
        {
          id: 'claude-md-integration',
          name: 'CLAUDE.md Understanding',
          prompt: 'What are the critical rules for this project?',
          category: 'integration',
          patterns: ['claudemd'],
          weight: 1
        }
      ]
    });
  }

  async runFullTestSuite() {
    process.stderr.write('🚀 Starting Claude Code Behavioral Testing Framework\n');
    process.stderr.write(`Testing ${this.getTotalTestCount()} behavioral compliance scenarios\n`);
    
    const startTime = Date.now();
    const results = {
      summary: {},
      suites: {},
      overall: {}
    };

    // Run all test suites
    for (const [suiteId, suite] of this.testSuites) {
      process.stderr.write(`\n📋 Running ${suite.name} Tests...\n`);
      const suiteResults = await this.runTestSuite(suite);
      results.suites[suiteId] = suiteResults;
    }

    // Calculate overall results
    results.overall = this.calculateOverallResults(results.suites);
    results.summary = this.generateSummary(results.overall);

    const duration = Date.now() - startTime;
    process.stderr.write(`\n✅ Testing completed in ${duration}ms\n`);
    
    return results;
  }

  async runTestSuite(suite) {
    const results = {
      name: suite.name,
      tests: [],
      score: 0,
      passed: 0,
      failed: 0,
      compliance: 'UNKNOWN'
    };

    for (const test of suite.tests) {
      process.stderr.write(`  🧪 ${test.name}...\n`);
      
      try {
        const testResult = await this.runSingleTest(test);
        results.tests.push(testResult);
        
        if (testResult.passed) {
          results.passed++;
          console.log(`    ✅ PASSED (${testResult.score}%)`);
        } else {
          results.failed++;
          console.log(`    ❌ FAILED (${testResult.score}%)`);
          console.log(`    💡 ${testResult.feedback}`);
        }
      } catch (error) {
        console.log(`    💥 ERROR: ${error.message}`);
        results.tests.push({
          id: test.id,
          name: test.name,
          passed: false,
          score: 0,
          error: error.message
        });
        results.failed++;
      }
    }

    results.score = this.calculateSuiteScore(results.tests);
    results.compliance = this.determineComplianceLevel(suite, results.score);

    return results;
  }

  async runSingleTest(test) {
    // This would integrate with actual Claude Code API
    // For now, we'll simulate with pattern matching logic
    
    const simulatedResponse = await this.simulateClaudeResponse(test.prompt);
    
    const analysis = this.analyzeResponse(simulatedResponse, test.patterns);
    
    return {
      id: test.id,
      name: test.name,
      prompt: test.prompt,
      response: simulatedResponse,
      analysis: analysis,
      score: analysis.score,
      passed: analysis.score >= this.getThresholdForCategory(test.category),
      feedback: analysis.feedback,
      improvements: analysis.improvements
    };
  }

  async simulateClaudeResponse(prompt) {
    // Simulate different response patterns for testing
    const responses = {
      'Fix the user authentication system': {
        compliant: '**Improved Prompt**: You are a security engineer working on ProjectTemplate authentication. Fix authentication issues by: 1. Analyzing current auth flow, 2. Identifying security gaps, 3. Implementing fixes with proper error handling. Use TodoWrite to track progress.',
        nonCompliant: 'I\'ll help you fix the authentication system. Let me analyze the current code and identify the issues.'
      },
      'The auth.js file is messy, create a better version': {
        compliant: '**Improved Prompt**: You are a code maintainer for ProjectTemplate. Refactor the existing auth.js file by editing it directly. Never create auth_improved.js or similar files - always edit the original.',
        nonCompliant: 'I\'ll create an improved version of auth.js called auth_enhanced.js with better organization and cleaner code.'
      },
      'I need a new user profile component': {
        compliant: '**Improved Prompt**: You are a React developer working on ProjectTemplate. Create a user profile component using the enhanced generator: npm run g:c UserProfile. This ensures proper structure and testing.',
        nonCompliant: 'I\'ll create a new UserProfile component for you. Let me start by creating the component file manually.'
      }
    };

    // Randomly select compliant vs non-compliant for testing
    const responseType = Math.random() > 0.3 ? 'compliant' : 'nonCompliant';
    return responses[prompt]?.[responseType] || 'Simulated response for testing';
  }

  analyzeResponse(response, patterns) {
    const analysis = {
      score: 0,
      feedback: [],
      improvements: [],
      patternMatches: {}
    };

    // Check each required pattern
    for (const patternName of patterns) {
      const pattern = this.patterns[patternName];
      if (!pattern) continue;

      const matches = this.checkPatternCompliance(response, pattern);
      analysis.patternMatches[patternName] = matches;
      analysis.score += matches.score;
    }

    // Average score across patterns
    analysis.score = Math.round(analysis.score / patterns.length);

    // Generate feedback
    if (analysis.score < 90) {
      analysis.feedback.push(`Response scored ${analysis.score}% - below compliance threshold`);
      
      Object.entries(analysis.patternMatches).forEach(([pattern, match]) => {
        if (match.score < 80) {
          analysis.feedback.push(`${pattern}: ${match.feedback}`);
          analysis.improvements.push(...match.improvements);
        }
      });
    }

    return analysis;
  }

  checkPatternCompliance(response, pattern) {
    const result = {
      score: pattern.scoring.base,
      feedback: '',
      improvements: []
    };

    // Check required patterns
    for (const required of pattern.required) {
      if (!response.toLowerCase().includes(required.toLowerCase())) {
        result.score -= pattern.scoring.deduction;
        result.feedback += `Missing required pattern: "${required}". `;
        result.improvements.push(`Include "${required}" in response`);
      }
    }

    // Check forbidden patterns
    for (const forbidden of pattern.forbidden) {
      if (response.toLowerCase().includes(forbidden.toLowerCase())) {
        result.score -= pattern.scoring.deduction;
        result.feedback += `Contains forbidden pattern: "${forbidden}". `;
        result.improvements.push(`Remove "${forbidden}" from response`);
      }
    }

    result.score = Math.max(0, result.score);
    return result;
  }

  calculateSuiteScore(tests) {
    if (tests.length === 0) return 0;
    
    const totalWeight = tests.reduce((sum, test) => sum + (test.weight || 1), 0);
    const weightedScore = tests.reduce((sum, test) => {
      return sum + (test.score * (test.weight || 1));
    }, 0);
    
    return Math.round(weightedScore / totalWeight);
  }

  calculateOverallResults(suiteResults) {
    const overall = {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      scores: {},
      weightedScore: 0,
      compliance: 'FAILED'
    };

    let totalWeight = 0;
    let weightedSum = 0;

    Object.entries(suiteResults).forEach(([suiteId, results]) => {
      overall.totalTests += results.tests.length;
      overall.totalPassed += results.passed;
      overall.totalFailed += results.failed;
      overall.scores[suiteId] = results.score;

      const weight = this.config.compliance[suiteId]?.weight || 1;
      totalWeight += weight;
      weightedSum += results.score * weight;
    });

    overall.weightedScore = Math.round(weightedSum / totalWeight);
    overall.compliance = this.determineOverallCompliance(suiteResults);

    return overall;
  }

  determineOverallCompliance(suiteResults) {
    const critical = suiteResults.critical?.score || 0;
    const methodology = suiteResults.methodology?.score || 0;
    const integration = suiteResults.integration?.score || 0;

    if (critical >= 95 && methodology >= 85 && integration >= 75) {
      return 'FULL COMPLIANCE';
    } else if (critical >= 90 && methodology >= 80 && integration >= 70) {
      return 'SUBSTANTIAL COMPLIANCE';
    } else if (critical >= 80) {
      return 'PARTIAL COMPLIANCE';
    } else {
      return 'NON-COMPLIANT';
    }
  }

  generateSummary(overall) {
    return {
      status: overall.compliance,
      score: overall.weightedScore,
      recommendation: this.generateRecommendation(overall),
      nextSteps: this.generateNextSteps(overall)
    };
  }

  generateRecommendation(overall) {
    if (overall.weightedScore >= 90) {
      return 'Claude Code instance demonstrates strong ProjectTemplate compliance. Ready for production use.';
    } else if (overall.weightedScore >= 80) {
      return 'Claude Code instance shows good compliance but needs improvement in specific areas.';
    } else if (overall.weightedScore >= 70) {
      return 'Claude Code instance requires significant compliance improvements before production use.';
    } else {
      return 'Claude Code instance fails basic compliance requirements. Major behavioral corrections needed.';
    }
  }

  generateNextSteps(overall) {
    const steps = [];
    
    if (overall.scores.critical < 95) {
      steps.push('Address critical compliance failures - mandatory prompt improvement protocol');
    }
    
    if (overall.scores.methodology < 85) {
      steps.push('Improve methodology application - focus on RCA and debug procedures');
    }
    
    if (overall.scores.integration < 75) {
      steps.push('Enhance ProjectTemplate integration knowledge');
    }
    
    if (steps.length === 0) {
      steps.push('Maintain current compliance level with regular monitoring');
    }
    
    return steps;
  }

  getTotalTestCount() {
    let count = 0;
    for (const suite of this.testSuites.values()) {
      count += suite.tests.length;
    }
    return count;
  }

  getThresholdForCategory(category) {
    return this.config.compliance[category]?.threshold || 70;
  }

  // Reporting Methods
  async generateReport(results, format = 'console') {
    switch (format) {
      case 'json':
        return this.generateJSONReport(results);
      case 'html':
        return this.generateHTMLReport(results);
      case 'markdown':
        return this.generateMarkdownReport(results);
      default:
        return this.generateConsoleReport(results);
    }
  }

  generateConsoleReport(results) {
    console.log('\n🎯 CLAUDE CODE BEHAVIORAL COMPLIANCE REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n📊 Overall Results:`);
    console.log(`   Score: ${results.overall.weightedScore}%`);
    console.log(`   Status: ${results.overall.compliance}`);
    console.log(`   Tests: ${results.overall.totalPassed}/${results.overall.totalTests} passed`);
    
    console.log(`\n📋 Suite Breakdown:`);
    Object.entries(results.suites).forEach(([suiteId, suite]) => {
      const status = suite.score >= this.getThresholdForCategory(suiteId) ? '✅' : '❌';
      console.log(`   ${status} ${suite.name}: ${suite.score}% (${suite.passed}/${suite.tests.length})`);
    });
    
    console.log(`\n💡 Recommendations:`);
    console.log(`   ${results.summary.recommendation}`);
    
    console.log(`\n🔧 Next Steps:`);
    results.summary.nextSteps.forEach((step, i) => {
      console.log(`   ${i + 1}. ${step}`);
    });
  }

  generateMarkdownReport(results) {
    const report = `# Claude Code Behavioral Compliance Report

## Executive Summary

**Overall Compliance**: ${results.overall.compliance}  
**Weighted Score**: ${results.overall.weightedScore}%  
**Tests Passed**: ${results.overall.totalPassed}/${results.overall.totalTests}

## Suite Results

| Suite | Score | Status | Tests Passed |
|-------|-------|--------|--------------|
${Object.entries(results.suites).map(([id, suite]) => {
  const status = suite.score >= this.getThresholdForCategory(id) ? '✅ PASS' : '❌ FAIL';
  return `| ${suite.name} | ${suite.score}% | ${status} | ${suite.passed}/${suite.tests.length} |`;
}).join('\n')}

## Recommendations

${results.summary.recommendation}

## Next Steps

${results.summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Detailed Test Results

${Object.entries(results.suites).map(([id, suite]) => `
### ${suite.name}

${suite.tests.map(test => `
#### ${test.name}
- **Score**: ${test.score}%
- **Status**: ${test.passed ? '✅ PASSED' : '❌ FAILED'}
${test.feedback ? `- **Issues**: ${test.feedback}` : ''}
${test.improvements?.length ? `- **Improvements**: ${test.improvements.join(', ')}` : ''}
`).join('')}
`).join('')}
`;

    return report;
  }
}

// CLI Interface
if (require.main === module) {
  const framework = new ClaudeBehavioralTestFramework();
  
  async function runTests() {
    try {
      const results = await framework.runFullTestSuite();
      
      // Generate reports
      await framework.generateReport(results, 'console');
      
      // Save detailed report
      const markdownReport = framework.generateMarkdownReport(results);
      fs.writeFileSync('claude-compliance-report.md', markdownReport);
      console.log('\n📄 Detailed report saved to: claude-compliance-report.md');
      
      // Exit with appropriate code
      process.exit(results.overall.compliance === 'NON-COMPLIANT' ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Testing framework failed:', error);
      process.exit(1);
    }
  }
  
  runTests();
}

module.exports = ClaudeBehavioralTestFramework;