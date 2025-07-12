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

function isJavaScriptFile(filePath) {
  return filePath && (
    filePath.endsWith('.js') || 
    filePath.endsWith('.jsx') || 
    filePath.endsWith('.ts') || 
    filePath.endsWith('.tsx')
  );
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

function runConsoleLogFix(filePath) {
  try {
    // Skip files that are allowed to use console.log
    const allowedPatterns = [
      'tools/enforcement/',
      'tools/generators/',
      'scripts/',
      'extensions/',
      'examples/',
      'test/',
      'spec/',
      '__tests__/'
    ];
    
    if (allowedPatterns.some(pattern => filePath.includes(pattern))) {
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has console.log statements
    if (!content.includes('console.')) {
      return false;
    }

    // Replace console.log with proper logging
    let modified = content;
    let hasChanges = false;

    // TypeScript/JavaScript specific replacements
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      // Check if logger is already imported
      if (!content.includes('import') || !content.includes('logger')) {
        // Add logger import at the top of the file
        const importStatement = "import { logger } from '@/utils/logger';\n";
        const firstImportMatch = content.match(/^import.*$/m);
        
        if (firstImportMatch) {
          modified = modified.replace(firstImportMatch[0], firstImportMatch[0] + '\n' + importStatement.trim());
        } else {
          // No imports yet, add at the beginning
          modified = importStatement + modified;
        }
      }
    } else {
      // JavaScript (CommonJS)
      if (!content.includes('require') || !content.includes('logger')) {
        const requireStatement = "const { logger } = require('../utils/logger');\n";
        const firstRequireMatch = content.match(/^const.*require.*$/m);
        
        if (firstRequireMatch) {
          modified = modified.replace(firstRequireMatch[0], firstRequireMatch[0] + '\n' + requireStatement.trim());
        } else {
          // No requires yet, add at the beginning
          modified = requireStatement + modified;
        }
      }
    }

    // Replace console methods with logger methods
    modified = modified.replace(/console\.log\(/g, 'logger.info(');
    modified = modified.replace(/console\.error\(/g, 'logger.error(');
    modified = modified.replace(/console\.warn\(/g, 'logger.warn(');
    modified = modified.replace(/console\.info\(/g, 'logger.info(');
    modified = modified.replace(/console\.debug\(/g, 'logger.debug(');

    hasChanges = modified !== content;

    if (hasChanges) {
      fs.writeFileSync(filePath, modified, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    // Don't fail if we can't fix console.log
    return false;
  }
}

function runImportFix(filePath) {
  try {
    // Skip non-source files
    const skipPatterns = [
      'tools/enforcement/',
      'tools/generators/',
      'scripts/',
      'extensions/',
      'node_modules/',
      'dist/',
      'build/'
    ];
    
    if (skipPatterns.some(pattern => filePath.includes(pattern))) {
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    let hasChanges = false;

    // Fix problematic default imports
    // React import fix
    modified = modified.replace(
      /import\s+React\s+from\s+['"]react['"]/g,
      "import * as React from 'react'"
    );

    // Fix lodash default import
    modified = modified.replace(
      /import\s+lodash\s+from\s+['"]lodash['"]/g,
      "import * as _ from 'lodash'"
    );

    // Fix wildcard imports for specific modules (convert to named imports)
    // This is a simplified version - in production you'd analyze what's actually used
    modified = modified.replace(
      /import\s+\*\s+as\s+(\w+)\s+from\s+['"](.+?)['"];?/g,
      (match, alias, module) => {
        // Keep wildcards for known patterns
        if (['React', '_', 'path', 'fs', 'vscode'].includes(alias)) {
          return match;
        }
        // For others, suggest specific imports
        return `// TODO: Replace with specific imports\n${match}`;
      }
    );

    // Add path aliases for deep imports (more than 2 parent levels)
    modified = modified.replace(
      /from\s+['"](\.\.[\/\\]){3,}(.+?)['"]/g,
      (match, dots, path) => {
        // Suggest using path alias
        return `from '@/${path}'`;
      }
    );

    hasChanges = modified !== content;

    if (hasChanges) {
      fs.writeFileSync(filePath, modified, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    // Don't fail if we can't fix imports
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

        // Auto-fix JavaScript/TypeScript files
        if (isJavaScriptFile(filePath)) {
          if (runConsoleLogFix(filePath)) {
            processedActions.push('Replaced console.log with proper logging');
          }
          if (runImportFix(filePath)) {
            processedActions.push('Fixed import violations');
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

module.exports = { isMarkdownFile, isJavaScriptFile, shouldProcess, runConsoleLogFix, runImportFix };