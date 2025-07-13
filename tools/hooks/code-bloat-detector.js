#!/usr/bin/env node

/**
 * Claude Code Hook: Code Bloat Detector
 * 
 * Prevents accumulation of bloated code files that become hard to maintain.
 * Essential for "super lazy coder" workflow - automatic code hygiene.
 */

const path = require('path');

// Thresholds for different types of bloat
const BLOAT_THRESHOLDS = {
  file_lines: 500,        // Files over 500 lines
  function_lines: 50,     // Functions over 50 lines  
  duplicate_blocks: 3,    // 3+ similar code blocks
  complexity_score: 10    // Cyclomatic complexity
};

function countLines(content) {
  return content.split('\n').length;
}

function analyzeCodeComplexity(content) {
  // Simple complexity analysis based on control flow keywords
  const complexityKeywords = [
    /\bif\s*\(/g,
    /\belse\s*\{/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bswitch\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /\b&&\b/g,
    /\b\|\|\b/g,
    /\?\s*.*:\s*/g  // ternary operators
  ];
  
  let complexity = 1; // Base complexity
  complexityKeywords.forEach(keyword => {
    const matches = content.match(keyword);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  return complexity;
}

function findLargeFunctions(content) {
  const largeFunctions = [];
  
  // Simple function detection (works for JS/TS)
  const functionRegex = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)\s*=>|\(.*\)\s*=>\s*\{)|class\s+\w+)/g;
  const lines = content.split('\n');
  
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    const startLine = content.substring(0, match.index).split('\n').length;
    
    // Find function end by tracking braces
    let braceCount = 0;
    let endLine = startLine;
    let inFunction = false;
    
    for (let i = startLine - 1; i < lines.length; i++) {
      const line = lines[i];
      
      for (let char of line) {
        if (char === '{') {
          braceCount++;
          inFunction = true;
        } else if (char === '}') {
          braceCount--;
          if (inFunction && braceCount === 0) {
            endLine = i + 1;
            break;
          }
        }
      }
      
      if (inFunction && braceCount === 0) {
        break;
      }
    }
    
    const functionLength = endLine - startLine + 1;
    if (functionLength > BLOAT_THRESHOLDS.function_lines) {
      largeFunctions.push({
        name: match[0].substring(0, 30) + '...',
        startLine,
        endLine,
        length: functionLength
      });
    }
  }
  
  return largeFunctions;
}

function detectDuplicateBlocks(content) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const duplicates = [];
  
  // Look for repeated sequences of 3+ lines
  for (let i = 0; i < lines.length - 3; i++) {
    const block = lines.slice(i, i + 3).join('\n');
    let duplicateCount = 0;
    
    for (let j = i + 3; j < lines.length - 2; j++) {
      const compareBlock = lines.slice(j, j + 3).join('\n');
      if (block === compareBlock) {
        duplicateCount++;
      }
    }
    
    if (duplicateCount >= BLOAT_THRESHOLDS.duplicate_blocks - 1) {
      duplicates.push({
        startLine: i + 1,
        block: block.substring(0, 50) + '...',
        duplicateCount: duplicateCount + 1
      });
    }
  }
  
  return duplicates;
}

function analyzeCodeBloat(content, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isCodeFile = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c'].includes(ext);
  
  if (\!isCodeFile) {
    return { hasBloat: false };
  }
  
  const lineCount = countLines(content);
  const complexity = analyzeCodeComplexity(content);
  const largeFunctions = findLargeFunctions(content);
  const duplicates = detectDuplicateBlocks(content);
  
  const issues = [];
  
  if (lineCount > BLOAT_THRESHOLDS.file_lines) {
    issues.push({
      type: 'large_file',
      severity: 'warning',
      message: `File has ${lineCount} lines (threshold: ${BLOAT_THRESHOLDS.file_lines})`
    });
  }
  
  if (complexity > BLOAT_THRESHOLDS.complexity_score) {
    issues.push({
      type: 'high_complexity',
      severity: 'warning', 
      message: `High cyclomatic complexity: ${complexity} (threshold: ${BLOAT_THRESHOLDS.complexity_score})`
    });
  }
  
  if (largeFunctions.length > 0) {
    issues.push({
      type: 'large_functions',
      severity: 'info',
      message: `${largeFunctions.length} functions exceed ${BLOAT_THRESHOLDS.function_lines} lines`,
      details: largeFunctions
    });
  }
  
  if (duplicates.length > 0) {
    issues.push({
      type: 'duplicate_code',
      severity: 'warning',
      message: `${duplicates.length} duplicate code blocks detected`,
      details: duplicates
    });
  }
  
  return {
    hasBloat: issues.some(issue => issue.severity === 'warning'),
    lineCount,
    complexity,
    issues
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
    const filePath = toolInput.file_path || toolInput.filePath || '';
    const content = toolInput.content || toolInput.new_string || '';
    
    if (\!filePath || \!content) {
      process.exit(0);
    }
    
    const analysis = analyzeCodeBloat(content, filePath);
    
    if (analysis.hasBloat) {
      let errorMessage = '🧹 Code Bloat Detected\n\n';
      
      errorMessage += `📊 File analysis: ${analysis.lineCount} lines, complexity ${analysis.complexity}\n\n`;
      
      analysis.issues.forEach(issue => {
        const icon = issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        errorMessage += `${icon} ${issue.message}\n`;
        
        if (issue.details && issue.details.length > 0) {
          issue.details.slice(0, 3).forEach(detail => {
            if (detail.name) {
              errorMessage += `   - ${detail.name} (${detail.length} lines)\n`;
            } else if (detail.block) {
              errorMessage += `   - Line ${detail.startLine}: ${detail.block}\n`;
            }
          });
        }
      });
      
      errorMessage += '\n✅ Refactoring suggestions:\n';
      errorMessage += '• Break large functions into smaller ones\n';
      errorMessage += '• Extract common code into utilities\n';
      errorMessage += '• Consider splitting large files by feature\n';
      errorMessage += '• Simplify complex conditional logic\n\n';
      errorMessage += '📖 Guide: docs/guides/code-quality/refactoring-best-practices.md';
      
      console.error(errorMessage);
      // Note: Using exit code 0 for warnings, 2 would block the operation
      process.exit(0);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error(`Code Bloat Detector error: ${error.message}`);
    process.exit(0);
  }
});

setTimeout(() => {
  process.exit(0);
}, 2000);

module.exports = { BLOAT_THRESHOLDS, analyzeCodeBloat, countLines };
EOF < /dev/null