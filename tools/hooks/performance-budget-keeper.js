#!/usr/bin/env node

/**
 * Claude Code Hook: Performance Budget Keeper
 * 
 * Maintains performance budgets for AI operations and application components.
 * Prevents performance degradation in AI applications.
 */

const path = require('path');

// Performance budgets
const PERFORMANCE_BUDGETS = {
  ai_response_time: 3000,    // 3s max for AI operations
  bundle_size_kb: 200,       // 200KB max for AI components
  memory_usage_mb: 100,      // 100MB max for embeddings
  api_calls_per_minute: 60   // Rate limiting
};

// Patterns that indicate performance-heavy operations
const HEAVY_OPERATION_PATTERNS = [
  // Large data processing
  /\.map\(.*\)\.filter\(.*\)\.reduce\(/i,
  /for.*\(.*10000|100000.*\)/i,
  /while.*large|big|huge/i,
  
  // Memory-intensive operations
  /new Array\(\d{4,}\)/i,
  /Buffer\.alloc\(\d{6,}\)/i,
  /JSON\.parse.*large|big/i,
  
  // Expensive AI operations
  /embedding.*batch.*\d{3,}/i,
  /vector.*search.*\d{3,}/i,
  /ai.*request.*loop|while/i
];

// Performance optimization patterns (good practices)
const OPTIMIZATION_PATTERNS = [
  /useMemo|useCallback|memo/i,
  /lazy|Suspense/i,
  /debounce|throttle/i,
  /cache|memoize/i,
  /pagination|virtual/i
];

function detectHeavyOperations(content) {
  return HEAVY_OPERATION_PATTERNS.filter(pattern => pattern.test(content));
}

function detectOptimizations(content) {
  return OPTIMIZATION_PATTERNS.filter(pattern => pattern.test(content));
}

function estimatePerformanceImpact(content, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isCodeFile = ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
  
  if (!isCodeFile) {
    return { hasIssues: false };
  }
  
  const heavyOps = detectHeavyOperations(content);
  const optimizations = detectOptimizations(content);
  const lineCount = content.split('\n').length;
  
  const issues = [];
  
  // Check for performance issues
  if (heavyOps.length > 0) {
    issues.push({
      type: 'heavy_operations',
      severity: 'warning',
      message: `${heavyOps.length} potentially expensive operations detected`
    });
  }
  
  if (lineCount > 300 && optimizations.length === 0) {
    issues.push({
      type: 'missing_optimizations',
      severity: 'info',
      message: 'Large component without performance optimizations'
    });
  }
  
  // AI-specific checks
  if (/embedding|vector/.test(content) && !/batch|cache/.test(content)) {
    issues.push({
      type: 'ai_performance',
      severity: 'warning',
      message: 'AI operations without batching or caching'
    });
  }
  
  return {
    hasIssues: issues.some(issue => issue.severity === 'warning'),
    heavyOps,
    optimizations,
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
    
    if (!filePath || !content) {
      process.exit(0);
    }
    
    const analysis = estimatePerformanceImpact(content, filePath);
    
    if (analysis.hasIssues) {
      let errorMessage = '⚡ Performance Budget Alert\n\n';
      
      analysis.issues.forEach(issue => {
        const icon = issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        errorMessage += `${icon} ${issue.message}\n`;
      });
      
      errorMessage += '\n✅ Performance optimization suggestions:\n';
      
      if (analysis.heavyOps.length > 0) {
        errorMessage += '• Consider lazy loading for heavy operations\n';
        errorMessage += '• Implement pagination for large datasets\n';
        errorMessage += '• Use web workers for intensive computations\n';
      }
      
      if (/ai|embedding|vector/.test(content)) {
        errorMessage += '• Batch AI operations to reduce API calls\n';
        errorMessage += '• Cache embeddings to avoid recomputation\n';
        errorMessage += '• Use streaming for long AI responses\n';
      }
      
      errorMessage += '• Add React.memo() for expensive components\n';
      errorMessage += '• Use useMemo() for expensive calculations\n\n';
      errorMessage += '📖 Guide: docs/guides/performance/optimization-playbook.md';
      
      console.error(errorMessage);
      // Using exit code 0 for warnings to not block development
      process.exit(0);
    }
    
    // Log good performance practices
    if (analysis.optimizations.length > 0) {
      console.error(`⚡ Performance: Good optimizations detected - ${analysis.optimizations.length} patterns`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error(`Performance Budget Keeper error: ${error.message}`);
    process.exit(0);
  }
});

setTimeout(() => {
  process.exit(0);
}, 2000);

module.exports = { PERFORMANCE_BUDGETS, HEAVY_OPERATION_PATTERNS, estimatePerformanceImpact };