#!/usr/bin/env node
/**
 * Claude Code Hook Validator
 * 
 * Validates Claude Code tool calls against ProjectTemplate enforcement rules.
 * Used as a PreToolUse hook to block problematic file operations before they execute.
 */

const fs = require('fs');
const path = require('path');

// Import our existing enforcement logic
const { findBannedDocuments } = require('./banned-document-types.js');

function validateFilePath(filePath) {
  const fileName = path.basename(filePath);
  const violations = [];

  // Check for banned filename patterns  
  const bannedPatterns = [
    /_improved\./,
    /_enhanced\./,
    /_v\d+\./,
    /_updated\./,
    /_new\./,
    /_refactored\./,
    /_final\./,
    /_copy\./,
    /_backup\./,
    /_old\./,
    /_temp\./,
    /_tmp\./,
    /_FIXED\./,
    /_COMPLETE\./,
  ];

  for (const pattern of bannedPatterns) {
    if (pattern.test(fileName)) {
      violations.push({
        type: 'filename',
        reason: `Filename matches banned pattern: ${pattern.source}`,
        suggestion: 'Edit the original file instead of creating duplicates'
      });
    }
  }

  // Check for banned document types
  if (fileName.endsWith('.md')) {
    const bannedEndings = [
      'SUMMARY.md', 'REPORT.md', 'COMPLETE.md', 'COMPLETION.md',
      'FIXED.md', 'DONE.md', 'FINISHED.md', 'STATUS.md', 'FINAL.md'
    ];
    
    for (const ending of bannedEndings) {
      if (fileName.toUpperCase().endsWith(ending.toUpperCase())) {
        violations.push({
          type: 'document-type',
          reason: `Banned document type: ${ending}`,
          suggestion: 'Create technical documentation without status markers'
        });
      }
    }
  }

  // Check for root directory violations
  const allowedRootFiles = [
    'README.md', 'LICENSE', 'CLAUDE.md', 'CONTRIBUTING.md', 'SETUP.md', 'FRICTION-MAPPING.md',
    'QUICK-START.md', 'USER-JOURNEY.md', 'FULL-GUIDE.md', 'DOCS_INDEX.md', // Progressive documentation
    'package.json', 'package-lock.json', 'requirements.txt', 'go.mod', 'cargo.toml',
    'tsconfig.json', 'vite.config.js', 'webpack.config.js', '.eslintrc.json', '.prettierrc',
    '.env.example', 'Dockerfile', 'docker-compose.yml'
  ];

  const relativePath = path.relative(process.cwd(), filePath);
  const isInRoot = !relativePath.includes('/') && !relativePath.startsWith('..');
  
  if (isInRoot && !allowedRootFiles.includes(fileName)) {
    violations.push({
      type: 'root-directory',
      reason: `File "${fileName}" not allowed in root directory`,
      suggestion: `Move to appropriate subdirectory (docs/, scripts/, src/, etc.)`
    });
  }

  return violations;
}

function validateFileContent(content, filePath) {
  const violations = [];
  
  if (!content || typeof content !== 'string') {
    return violations;
  }

  // Check for banned content patterns in markdown files
  if (filePath.endsWith('.md')) {
    const lines = content.split('\n').slice(0, 10);
    const bannedContentPatterns = [
      /^#\s*✅.*Complete/i,
      /^#.*Implementation Complete/i,
      /^#.*Audit Complete/i,
      /^#.*Final Report/i,
      /^##\s*✅\s*Completed Tasks/i,
      /^##\s*What Was Accomplished/i,
    ];

    for (const line of lines) {
      for (const pattern of bannedContentPatterns) {
        if (pattern.test(line)) {
          violations.push({
            type: 'content',
            reason: 'Content indicates completion/status document',
            suggestion: 'Convert to technical documentation without status markers',
            line: line.trim()
          });
        }
      }
    }
  }

  return violations;
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
        const { tool_name, tool_input } = hookData;
        
        // Only validate file operations
        if (!['Write', 'Edit', 'MultiEdit'].includes(tool_name)) {
          process.exit(0);
        }

        const filePath = tool_input.file_path;
        if (!filePath) {
          process.exit(0);
        }

        // Validate file path
        const pathViolations = validateFilePath(filePath);
        
        // Validate content for Write operations
        let contentViolations = [];
        if (tool_name === 'Write' && tool_input.content) {
          contentViolations = validateFileContent(tool_input.content, filePath);
        }

        const allViolations = [...pathViolations, ...contentViolations];

        if (allViolations.length > 0) {
          // Output violations to stderr (will be shown to Claude)
          console.error('🚫 ProjectTemplate Enforcement Violations:');
          console.error('');
          
          allViolations.forEach((violation, index) => {
            console.error(`${index + 1}. ${violation.reason}`);
            console.error(`   💡 ${violation.suggestion}`);
            if (violation.line) {
              console.error(`   📍 "${violation.line}"`);
            }
            console.error('');
          });

          console.error('See docs/guides/enforcement/ENFORCEMENT.md for detailed guidance.');
          
          // Exit code 2 blocks the tool call and shows stderr to Claude
          process.exit(2);
        }

        // No violations found
        process.exit(0);
        
      } catch (error) {
        console.error('Error parsing hook input:', error.message);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Hook execution error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateFilePath, validateFileContent };