#!/usr/bin/env node
/**
 * Claude Code Completion Validator
 * 
 * Validates project state before Claude considers a task complete.
 * Used as a Stop hook to ensure all enforcement rules are satisfied.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runEnforcementChecks() {
  const results = {
    passed: [],
    warnings: [],
    errors: []
  };

  const checks = [
    {
      name: 'File Naming',
      command: 'npm run check:no-improved-files --quiet',
      required: true
    },
    {
      name: 'Root Directory',
      command: 'npm run check:root --quiet', 
      required: true
    },
    {
      name: 'Banned Documents',
      command: 'npm run check:banned-docs --quiet',
      required: true
    },
    {
      name: 'Import Standards',
      command: 'npm run check:imports --quiet',
      required: false
    },
    {
      name: 'Documentation Style',
      command: 'npm run check:documentation-style --quiet',
      required: false
    }
  ];

  for (const check of checks) {
    try {
      execSync(check.command, { 
        cwd: process.cwd(), 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      results.passed.push(check.name);
    } catch (error) {
      if (check.required) {
        results.errors.push({
          name: check.name,
          command: check.command.replace(' --quiet', ''),
          reason: 'Required enforcement check failed'
        });
      } else {
        results.warnings.push({
          name: check.name,
          command: check.command.replace(' --quiet', ''),
          reason: 'Style violations detected'
        });
      }
    }
  }

  return results;
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { 
      cwd: process.cwd(), 
      encoding: 'utf8' 
    });
    
    if (status.trim()) {
      const lines = status.trim().split('\n');
      return {
        hasChanges: true,
        changes: lines.map(line => {
          const status = line.substring(0, 2);
          const file = line.substring(3);
          return { status, file };
        })
      };
    }
    
    return { hasChanges: false, changes: [] };
  } catch (error) {
    return { hasChanges: false, changes: [], error: 'Git not available' };
  }
}

function main() {
  try {
    // Read JSON input from stdin
    let inputData = '';
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        inputData += chunk;
      }
    });

    process.stdin.on('end', () => {
      try {
        const hookData = JSON.parse(inputData);
        const { stop_hook_active } = hookData;
        
        // Prevent infinite loops
        if (stop_hook_active) {
          process.exit(0);
        }

        // Run enforcement checks
        const results = runEnforcementChecks();
        
        // Check git status
        const gitStatus = checkGitStatus();

        // Determine if we should block completion
        const hasErrors = results.errors.length > 0;
        const hasUncommittedChanges = gitStatus.hasChanges;

        if (hasErrors || (hasUncommittedChanges && results.warnings.length > 0)) {
          // Block completion and provide feedback to Claude
          let feedback = [];
          
          feedback.push('🚫 Cannot complete task - enforcement violations detected:');
          feedback.push('');

          if (hasErrors) {
            feedback.push('❌ REQUIRED FIXES:');
            results.errors.forEach(error => {
              feedback.push(`   • ${error.name}: ${error.reason}`);
              feedback.push(`     Fix with: ${error.command}`);
            });
            feedback.push('');
          }

          if (results.warnings.length > 0) {
            feedback.push('⚠️  STYLE WARNINGS:');
            results.warnings.forEach(warning => {
              feedback.push(`   • ${warning.name}: ${warning.reason}`);
              feedback.push(`     Fix with: ${warning.command}`);
            });
            feedback.push('');
          }

          if (hasUncommittedChanges) {
            feedback.push('📝 UNCOMMITTED CHANGES:');
            gitStatus.changes.forEach(change => {
              feedback.push(`   ${change.status} ${change.file}`);
            });
            feedback.push('');
            feedback.push('   Fix: Review changes and commit if appropriate');
            feedback.push('');
          }

          feedback.push('Next steps:');
          feedback.push('1. Run the suggested fix commands');
          feedback.push('2. Review and commit any changes');
          feedback.push('3. Re-run to complete the task');

          // Output JSON to block completion with feedback
          console.log(JSON.stringify({
            decision: 'block',
            reason: feedback.join('\n')
          }));
          
          process.exit(0);
        }

        // All checks passed - show success summary
        const summary = [
          '✅ Task completion validation passed:',
          '',
          `   ✓ ${results.passed.length} enforcement checks passed`,
        ];

        if (results.warnings.length > 0) {
          summary.push(`   ⚠️  ${results.warnings.length} style warnings (non-blocking)`);
        }

        if (!hasUncommittedChanges) {
          summary.push('   ✓ No uncommitted changes');
        }

        summary.push('');
        summary.push('🎉 Ready to complete!');

        console.log(summary.join('\n'));
        process.exit(0);
        
      } catch (error) {
        // Don't block on parsing errors
        process.exit(0);
      }
    });

  } catch (error) {
    // Don't block on execution errors
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runEnforcementChecks, checkGitStatus };