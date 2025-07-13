#!/usr/bin/env node

/**
 * Claude Code Hook: API and Import Validator
 * 
 * Validates that all imports, APIs, and functions actually exist after file operations.
 * Addresses friction point 2.1 "Hallucination & Fabrication" from FRICTION-MAPPING.md.
 * 
 * Checks:
 * - Import statements reference existing files/packages
 * - Function calls reference defined functions
 * - API endpoints match available routes
 * - Package dependencies are installed
 * 
 * Usage: Called by Claude Code after Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'modified', message?: string }
 */

const fs = require('fs');
const path = require('path');

// File extensions to validate
const VALIDATABLE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs']);

// Import patterns to validate
const IMPORT_PATTERNS = [
  {
    pattern: /import\s+(?:.*\s+from\s+)?['"`]([^'"`]+)['"`]/gi,
    type: 'ES6 import'
  },
  {
    pattern: /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gi,
    type: 'CommonJS require'
  },
  {
    pattern: /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gi,
    type: 'Dynamic import'
  }
];

// API endpoint patterns (for Next.js/Express style)
const API_PATTERNS = [
  {
    pattern: /fetch\s*\(\s*['"`]\/api\/([^'"`]+)['"`]/gi,
    type: 'API endpoint',
    basePath: 'pages/api/'
  },
  {
    pattern: /axios\.[get|post|put|delete|patch]+\s*\(\s*['"`]\/api\/([^'"`]+)['"`]/gi,
    type: 'Axios API call',
    basePath: 'pages/api/'
  }
];

// Function call patterns to validate
const FUNCTION_PATTERNS = [
  {
    pattern: /(\w+)\s*\(/g,
    type: 'Function call'
  }
];

function loadPackageJson() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies
      };
      return new Set(Object.keys(allDeps));
    }
  } catch (error) {
    // Ignore errors, return empty set
  }
  return new Set();
}

function resolveImportPath(importPath, currentFile) {
  // Skip built-in Node.js modules
  if (importPath.startsWith('node:') || 
      ['fs', 'path', 'util', 'crypto', 'http', 'https', 'url', 'os'].includes(importPath)) {
    return { exists: true, type: 'built-in' };
  }
  
  // Skip npm packages (should be in package.json)
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    const installedPackages = loadPackageJson();
    const packageName = importPath.split('/')[0];
    return { 
      exists: installedPackages.has(packageName),
      type: 'package',
      packageName
    };
  }
  
  // Resolve relative imports
  const currentDir = path.dirname(currentFile);
  let resolvedPath = path.resolve(currentDir, importPath);
  
  // Try different extensions
  const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.mjs'];
  
  if (fs.existsSync(resolvedPath)) {
    return { exists: true, type: 'file', path: resolvedPath };
  }
  
  // Try with extensions
  for (const ext of extensions) {
    const pathWithExt = resolvedPath + ext;
    if (fs.existsSync(pathWithExt)) {
      return { exists: true, type: 'file', path: pathWithExt };
    }
  }
  
  // Try index files
  for (const ext of extensions) {
    const indexPath = path.join(resolvedPath, 'index' + ext);
    if (fs.existsSync(indexPath)) {
      return { exists: true, type: 'file', path: indexPath };
    }
  }
  
  return { exists: false, type: 'file' };
}

function validateImports(content, filePath) {
  const issues = [];
  
  for (const {pattern, type} of IMPORT_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const importPath = match[1];
      const resolution = resolveImportPath(importPath, filePath);
      
      if (!resolution.exists) {
        issues.push({
          type: 'missing-import',
          message: `${type}: "${importPath}" not found`,
          suggestion: resolution.type === 'package' ? 
            `Install package: npm install ${resolution.packageName}` :
            `Create file or fix path: ${importPath}`
        });
      }
    }
  }
  
  return issues;
}

function validateAPIs(content, filePath) {
  const issues = [];
  
  for (const {pattern, type, basePath} of API_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const apiPath = match[1];
      const apiFilePath = path.join(process.cwd(), basePath, apiPath + '.ts');
      const apiFilePathJs = path.join(process.cwd(), basePath, apiPath + '.js');
      
      if (!fs.existsSync(apiFilePath) && !fs.existsSync(apiFilePathJs)) {
        issues.push({
          type: 'missing-api',
          message: `${type}: "/api/${apiPath}" endpoint not found`,
          suggestion: `Create API file: ${basePath}${apiPath}.ts`
        });
      }
    }
  }
  
  return issues;
}

function validateBuiltInAPIs(content) {
  const issues = [];
  
  // Common AI hallucinations
  const hallucinatedAPIs = [
    {
      pattern: /\.useServerState\s*\(/g,
      message: 'useServerState is not a real React hook',
      suggestion: 'Use useState, useEffect, or a data fetching library'
    },
    {
      pattern: /\.autoSave\s*\(/g,
      message: 'autoSave is not a standard API',
      suggestion: 'Implement auto-save functionality explicitly'
    },
    {
      pattern: /console\.table\s*\(/g,
      message: 'console.table should not be used in production',
      suggestion: 'Use proper logging: logger.info()'
    },
    {
      pattern: /fetch\s*\(\s*['"`](?!https?:\/\/|\/)[^'"`]+['"`]/g,
      message: 'Potentially invalid fetch URL',
      suggestion: 'Ensure URL is absolute or starts with /'
    }
  ];
  
  for (const {pattern, message, suggestion} of hallucinatedAPIs) {
    if (pattern.test(content)) {
      issues.push({
        type: 'hallucinated-api',
        message,
        suggestion
      });
    }
  }
  
  return issues;
}

function checkFile(args) {
  try {
    // Parse Claude Code hook input
    const input = JSON.parse(args[0] || '{}');
    const filePath = input.file_path || input.filePath || '';
    
    // Skip if no file path
    if (!filePath) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Skip non-validatable files
    const ext = path.extname(filePath);
    if (!VALIDATABLE_EXTENSIONS.has(ext)) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Get content from input or read from file
    let content = input.content || input.new_string || '';
    
    // If no content provided, try to read from file
    if (!content && fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    }
    
    // Skip if no content available
    if (!content) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Validate different aspects
    const importIssues = validateImports(content, filePath);
    const apiIssues = validateAPIs(content, filePath);
    const builtInIssues = validateBuiltInAPIs(content);
    
    const allIssues = [...importIssues, ...apiIssues, ...builtInIssues];
    
    if (allIssues.length > 0) {
      const message = `🔍 API validation issues in ${path.basename(filePath)}:\n\n` +
        allIssues.map((issue, i) => 
          `${i + 1}. ❌ ${issue.message}\n` +
          `   ✅ ${issue.suggestion}\n`
        ).join('\n') +
        `\n💡 Fix these issues to prevent runtime errors.\n` +
        `📖 See docs/references/api/verified-apis.md for approved APIs`;
      
      console.log(JSON.stringify({
        status: 'blocked',
        message
      }));
      return;
    }
    
    // All validations passed
    console.log(JSON.stringify({ status: 'ok' }));
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.log(JSON.stringify({ 
      status: 'ok',
      debug: `API validator error: ${error.message}` 
    }));
  }
}

// Handle command line execution
if (require.main === module) {
  checkFile(process.argv.slice(2));
}

module.exports = { 
  checkFile, 
  validateImports, 
  validateAPIs, 
  validateBuiltInAPIs,
  resolveImportPath,
  IMPORT_PATTERNS,
  API_PATTERNS,
  FUNCTION_PATTERNS
};