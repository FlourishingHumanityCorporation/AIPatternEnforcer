#!/usr/bin/env node

/**
 * Claude Code Hook: Import Janitor
 * 
 * Automatically cleans up imports after file edits to support the "super lazy coder"
 * workflow. Removes unused imports, consolidates duplicates, and orders imports
 * according to conventions.
 * 
 * Features:
 * - Removes unused ES6/CommonJS imports
 * - Consolidates duplicate imports
 * - Orders imports by type (external, internal, relative)
 * - Handles TypeScript import syntax
 * - Preserves side-effect imports
 * 
 * Usage: Called by Claude Code after Write/Edit/MultiEdit operations
 * Operates silently on success, logs actions when cleanup occurs
 */

const fs = require('fs');
const path = require('path');

// File extensions to process
const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

// Import patterns for different syntaxes
const IMPORT_PATTERNS = {
  es6: /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"`]([^'"`]+)['"`](?:\s*;)?$/gm,
  commonjs: /^(?:const|let|var)\s+(?:\{[^}]*\}|\w+)\s*=\s*require\(['"`]([^'"`]+)['"`]\)(?:\s*;)?$/gm,
  sideEffect: /^import\s+['"`]([^'"`]+)['"`](?:\s*;)?$/gm
};

// Keywords that indicate usage in different contexts
const USAGE_PATTERNS = [
  // Function calls and property access
  /\b(\w+)(?:\(|\.|=|\s)/g,
  // JSX components
  /<(\w+)[\s/>]/g,
  // Type annotations (TypeScript)
  /:\s*(\w+)(?:\s*[|&<>[\](),]|\s*$)/g,
  // Generic parameters
  /<(\w+)(?:\s*[,>])/g
];

function isJavaScriptFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

function extractImports(content) {
  const imports = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Skip comments and non-import lines
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || !trimmed) {
      return;
    }
    
    // ES6 imports
    const es6Match = trimmed.match(/^import\s+(.+?)\s+from\s+['"`]([^'"`]+)['"`](?:\s*;)?$/);
    if (es6Match) {
      const [, importClause, module] = es6Match;
      const namedImports = extractNamedImports(importClause);
      
      imports.push({
        type: 'es6',
        line: index,
        original: line,
        module,
        namedImports,
        defaultImport: extractDefaultImport(importClause),
        namespace: extractNamespaceImport(importClause)
      });
      return;
    }
    
    // Side-effect imports
    const sideEffectMatch = trimmed.match(/^import\s+['"`]([^'"`]+)['"`](?:\s*;)?$/);
    if (sideEffectMatch) {
      imports.push({
        type: 'sideEffect',
        line: index,
        original: line,
        module: sideEffectMatch[1],
        preserve: true // Always preserve side-effect imports
      });
      return;
    }
    
    // CommonJS requires
    const cjsMatch = trimmed.match(/^(?:const|let|var)\s+(.+?)\s*=\s*require\(['"`]([^'"`]+)['"`]\)(?:\s*;)?$/);
    if (cjsMatch) {
      const [, importClause, module] = cjsMatch;
      const namedImports = extractNamedImports(importClause);
      
      imports.push({
        type: 'commonjs',
        line: index,
        original: line,
        module,
        namedImports,
        defaultImport: extractDefaultImport(importClause)
      });
    }
  });
  
  return imports;
}

function extractNamedImports(importClause) {
  const namedMatch = importClause.match(/\{([^}]+)\}/);
  if (!namedMatch) return [];
  
  return namedMatch[1]
    .split(',')
    .map(item => item.trim().split(/\s+as\s+/)[0].trim())
    .filter(Boolean);
}

function extractDefaultImport(importClause) {
  // Remove named imports and namespace imports to find default
  const withoutNamed = importClause.replace(/\{[^}]+\}/g, '').trim();
  const withoutNamespace = withoutNamed.replace(/\*\s+as\s+\w+/g, '').trim();
  
  const parts = withoutNamespace.split(',').map(p => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts[0] : null;
}

function extractNamespaceImport(importClause) {
  const namespaceMatch = importClause.match(/\*\s+as\s+(\w+)/);
  return namespaceMatch ? namespaceMatch[1] : null;
}

function findUsedImports(content, imports) {
  const usedImports = new Set();
  
  // Remove import statements from content for usage analysis
  const contentWithoutImports = content
    .split('\n')
    .map((line, index) => {
      const isImportLine = imports.some(imp => imp.line === index);
      return isImportLine ? '' : line;
    })
    .join('\n');
  
  imports.forEach(imp => {
    // Always preserve side-effect imports
    if (imp.preserve) {
      usedImports.add(imp);
      return;
    }
    
    let isUsed = false;
    
    // Check default import usage
    if (imp.defaultImport && isIdentifierUsed(contentWithoutImports, imp.defaultImport)) {
      isUsed = true;
    }
    
    // Check namespace import usage
    if (imp.namespace && isIdentifierUsed(contentWithoutImports, imp.namespace)) {
      isUsed = true;
    }
    
    // Check named imports usage
    const usedNamedImports = imp.namedImports?.filter(name => 
      isIdentifierUsed(contentWithoutImports, name)
    ) || [];
    
    if (usedNamedImports.length > 0) {
      isUsed = true;
      // Update the import to only include used named imports
      imp.namedImports = usedNamedImports;
    } else {
      imp.namedImports = [];
    }
    
    if (isUsed) {
      usedImports.add(imp);
    }
  });
  
  return Array.from(usedImports);
}

function isIdentifierUsed(content, identifier) {
  // Create regex that matches the identifier as a complete word
  const identifierRegex = new RegExp(`\\b${escapeRegex(identifier)}\\b`, 'g');
  return identifierRegex.test(content);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function consolidateImports(imports) {
  const moduleMap = new Map();
  
  imports.forEach(imp => {
    const key = `${imp.type}:${imp.module}`;
    
    if (!moduleMap.has(key)) {
      moduleMap.set(key, { ...imp, namedImports: [...(imp.namedImports || [])] });
    } else {
      const existing = moduleMap.get(key);
      
      // Merge named imports
      if (imp.namedImports) {
        existing.namedImports = [...new Set([...existing.namedImports, ...imp.namedImports])];
      }
      
      // Keep first default import
      if (imp.defaultImport && !existing.defaultImport) {
        existing.defaultImport = imp.defaultImport;
      }
      
      // Keep first namespace import
      if (imp.namespace && !existing.namespace) {
        existing.namespace = imp.namespace;
      }
    }
  });
  
  return Array.from(moduleMap.values());
}

function sortImports(imports) {
  return imports.sort((a, b) => {
    // Side-effect imports first
    if (a.preserve && !b.preserve) return -1;
    if (!a.preserve && b.preserve) return 1;
    
    // External packages before internal modules
    const aIsExternal = !a.module.startsWith('.') && !a.module.startsWith('/');
    const bIsExternal = !b.module.startsWith('.') && !b.module.startsWith('/');
    
    if (aIsExternal && !bIsExternal) return -1;
    if (!aIsExternal && bIsExternal) return 1;
    
    // Alphabetical within categories
    return a.module.localeCompare(b.module);
  });
}

function generateImportStatement(imp) {
  if (imp.preserve) {
    // Side-effect import
    return `import '${imp.module}';`;
  }
  
  const parts = [];
  
  if (imp.defaultImport) {
    parts.push(imp.defaultImport);
  }
  
  if (imp.namespace) {
    parts.push(`* as ${imp.namespace}`);
  }
  
  if (imp.namedImports && imp.namedImports.length > 0) {
    const namedPart = `{ ${imp.namedImports.sort().join(', ')} }`;
    parts.push(namedPart);
  }
  
  if (parts.length === 0) {
    return null; // No imports to generate
  }
  
  const importClause = parts.join(', ');
  
  if (imp.type === 'commonjs') {
    return `const ${importClause} = require('${imp.module}');`;
  } else {
    return `import ${importClause} from '${imp.module}';`;
  }
}

function cleanupImports(content, filePath) {
  if (!isJavaScriptFile(filePath)) {
    return { content, cleaned: false };
  }
  
  const imports = extractImports(content);
  if (imports.length === 0) {
    return { content, cleaned: false };
  }
  
  const usedImports = findUsedImports(content, imports);
  const consolidatedImports = consolidateImports(usedImports);
  const sortedImports = sortImports(consolidatedImports);
  
  // Check if cleanup is needed
  const originalImportCount = imports.length;
  const cleanedImportCount = sortedImports.length;
  const needsCleanup = originalImportCount !== cleanedImportCount || 
                      imports.some(imp => !usedImports.includes(imp));
  
  if (!needsCleanup) {
    return { content, cleaned: false };
  }
  
  // Remove all import lines
  const lines = content.split('\n');
  const nonImportLines = lines.filter((_, index) => 
    !imports.some(imp => imp.line === index)
  );
  
  // Find where to insert new imports (after initial comments/directives)
  let insertIndex = 0;
  for (let i = 0; i < nonImportLines.length; i++) {
    const line = nonImportLines[i].trim();
    if (line.startsWith('//') || line.startsWith('/*') || 
        line.startsWith('\'use strict\'') || line.startsWith('"use strict"') ||
        line === '') {
      insertIndex = i + 1;
    } else {
      break;
    }
  }
  
  // Generate new import statements
  const newImportStatements = sortedImports
    .map(generateImportStatement)
    .filter(Boolean);
  
  // Insert new imports
  const resultLines = [
    ...nonImportLines.slice(0, insertIndex),
    ...newImportStatements,
    newImportStatements.length > 0 ? '' : '', // Empty line after imports
    ...nonImportLines.slice(insertIndex)
  ];
  
  const cleanedContent = resultLines.join('\n');
  
  return {
    content: cleanedContent,
    cleaned: true,
    removedCount: originalImportCount - cleanedImportCount,
    consolidatedCount: imports.length - sortedImports.length
  };
}

// Read from stdin
let inputData = '';
process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(inputData);
    const toolInput = input.tool_input || {};
    const toolResponse = input.tool_response || {};
    
    // Get file path from input or response (PostToolUse pattern)
    const filePath = toolInput.file_path || toolInput.filePath || 
                    toolResponse.filePath || toolResponse.file_path || '';
    
    // Skip if no file path
    if (!filePath) {
      process.exit(0);
    }
    
    // Skip if file is in hooks or scripts directory to prevent self-modification
    if (filePath.includes('/hooks/') || filePath.includes('\\hooks\\') ||
        filePath.includes('/scripts/') || filePath.includes('\\scripts\\')) {
      process.exit(0);
    }
    
    // Only process JavaScript/TypeScript files
    if (!isJavaScriptFile(filePath)) {
      process.exit(0);
    }
    
    // Skip if file doesn't exist (PostToolUse should only work on existing files)
    if (!fs.existsSync(filePath)) {
      process.exit(0);
    }
    
    // Read the actual file content from disk
    const content = fs.readFileSync(filePath, 'utf8');
    const result = cleanupImports(content, filePath);
    
    if (result.cleaned) {
      // Write cleaned content back to file
      try {
        fs.writeFileSync(filePath, result.content, 'utf8');
        
        // Log cleanup actions to stdout (PostToolUse pattern)
        const messages = [];
        if (result.removedCount > 0) {
          messages.push(`removed ${result.removedCount} unused imports`);
        }
        if (result.consolidatedCount > 0) {
          messages.push(`consolidated ${result.consolidatedCount} duplicate imports`);
        }
        
        const fileName = path.basename(filePath);
        process.stdout.write(`🧹 Import cleanup: ${messages.join(', ')} in ${fileName}\n`);
      } catch (writeError) {
        // Log error but don't fail the operation
        process.stderr.write(`Import Janitor warning: Could not write to ${filePath}: ${writeError.message}\n`);
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    process.stderr.write(`Import Janitor error: ${error.message}\n`);
    process.exit(0);
  }
});

// Handle timeout
setTimeout(() => {
  console.error('Import Janitor timeout - operation allowed');
  process.exit(0);
}, 2000);

module.exports = {
  extractImports,
  findUsedImports,
  consolidateImports,
  sortImports,
  cleanupImports
};