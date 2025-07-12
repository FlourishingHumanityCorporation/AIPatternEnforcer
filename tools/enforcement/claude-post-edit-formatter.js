#!/usr/bin/env node
/**
 * Claude Code Post-Edit Formatter
 * 
 * Automatically formats and fixes style violations after Claude edits files.
 * Used as a PostToolUse hook to ensure all generated content is compliant.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function isMarkdownFile(filePath) {
  return filePath && filePath.endsWith('.md');
}

function isConfigFile(filePath) {
  if (!filePath) return false;
  
  const fileName = path.basename(filePath);
  const configFiles = [
    'package.json',
    'tsconfig.json',
    '.eslintrc.json',
    '.env.example',
    '.gitignore',
    '.aiignore'
  ];
  
  return configFiles.includes(fileName) || 
         fileName.endsWith('.config.js') || 
         fileName.endsWith('.config.ts');
}

function shouldProcess(filePath) {
  // Skip node_modules, .git, and other ignored directories
  const skipPatterns = [
    'node_modules/',
    '.git/',
    'dist/',
    'build/',
    '.next/',
    'coverage/'
  ];

  return !skipPatterns.some(pattern => filePath.includes(pattern));
}

function runFixDocs(filePath) {
  try {
    // Run our fix-docs command on the specific file
    execSync(`node tools/enforcement/fix-docs.js "${filePath}"`, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch (error) {
    // Don't fail the hook if fix-docs fails
    return false;
  }
}

function runConfigEnforcer(filePath) {
  try {
    // Run config enforcer fix on the specific file if it's a config file
    execSync(`node tools/enforcement/config-enforcer.js fix --quiet`, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch (error) {
    // Don't fail the hook if config enforcer fails
    return false;
  }
}

function formatJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    const formatted = JSON.stringify(parsed, null, 2) + '\n';
    
    if (content !== formatted) {
      fs.writeFileSync(filePath, formatted, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    // Don't fail if we can't format
    return false;
  }
}

function runEnforcementCheck(filePath) {
  try {
    // Run a quick enforcement check on the file
    execSync(`node tools/enforcement/documentation-style.js "${filePath}" --quiet`, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch (error) {
    // File has violations, but we'll let it pass (this is post-edit)
    return false;
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
        const { tool_name, tool_input, tool_response } = hookData;
        
        // Only process successful file operations
        if (!['Write', 'Edit', 'MultiEdit'].includes(tool_name)) {
          process.exit(0);
        }

        if (!tool_response || !tool_response.success) {
          process.exit(0);
        }

        const filePath = tool_input.file_path || tool_response.filePath;
        if (!filePath || !shouldProcess(filePath)) {
          process.exit(0);
        }

        let processedActions = [];

        // Auto-fix markdown files
        if (isMarkdownFile(filePath)) {
          if (runFixDocs(filePath)) {
            processedActions.push('Applied documentation style fixes');
          }
        }

        // Auto-fix config files
        if (isConfigFile(filePath)) {
          const fileName = path.basename(filePath);
          
          // Format JSON config files
          if (fileName.endsWith('.json')) {
            if (formatJsonFile(filePath)) {
              processedActions.push('Formatted JSON configuration');
            }
          }
          
          // Run config enforcer fixes
          if (runConfigEnforcer(filePath)) {
            processedActions.push('Applied configuration fixes');
          }
        }

        // Run enforcement check (non-blocking)
        runEnforcementCheck(filePath);

        // Output success message to stdout (shown in transcript mode)
        if (processedActions.length > 0) {
          console.log(`📝 Auto-formatted: ${path.basename(filePath)}`);
          processedActions.forEach(action => {
            console.log(`   ✓ ${action}`);
          });
        }

        process.exit(0);
        
      } catch (error) {
        // Don't fail the hook on parsing errors
        process.exit(0);
      }
    });

  } catch (error) {
    // Don't fail the hook on execution errors
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { isMarkdownFile, shouldProcess };