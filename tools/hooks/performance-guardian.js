#!/usr/bin/env node

/**
 * Claude Code Hook: Performance Guardian (Consolidated)
 * 
 * Comprehensive performance monitoring and optimization. Consolidates 5 previous hooks:
 * - performance-checker.js - Algorithm complexity analysis
 * - performance-budget-keeper.js - Bundle size monitoring
 * - context-economy-guardian.js - Context window optimization
 * - token-economics-guardian.js - AI token usage monitoring  
 * - code-bloat-detector.js - Code bloat prevention
 */

const HookRunner = require("./lib/HookRunner");
const path = require("path");

// Performance thresholds
const PERFORMANCE_LIMITS = {
  maxNestedLoops: 3,
  maxComplexityScore: 15,
  maxFileSize: 1000, // lines
  maxImportCount: 20,
  maxFunctionLength: 50, // lines
};

// Code bloat patterns
const BLOAT_PATTERNS = {
  redundantImports: /import.*from ['"].*['"];?\s*import.*from ['"].*['"];/g,
  longFunctions: /function\s+\w+[^{]*{[^}]{2000,}}/g,
  deepNesting: /{\s*{\s*{\s*{\s*{/g,
  duplicateLogic: /(if\s*\([^)]+\)\s*{[^}]+})\s*\1/g,
};

// Algorithm complexity patterns
const COMPLEXITY_PATTERNS = {
  nestedLoops: /for\s*\([^)]*\)\s*{[^{}]*for\s*\([^)]*\)/g,
  tripleNested: /for\s*\([^)]*\)\s*{[^{}]*for\s*\([^)]*\)\s*{[^{}]*for\s*\([^)]*\)/g,
  recursiveWithLoop: /(function\s+\w+[^{]*{[^}]*for\s*\([^)]*\)[^}]*\w+\s*\([^)]*\))/g,
  arrayMethods: /\.(map|filter|reduce|forEach|find|some|every)\s*\([^)]*\)\s*\.\s*(map|filter|reduce)/g,
};

// Heavy imports that affect bundle size
const HEAVY_IMPORTS = {
  lodash: /import.*from ['"]lodash['"];?/,
  momentjs: /import.*from ['"]moment['"];?/,
  entireReact: /import \* as React from ['"]react['"];?/,
  entireNext: /import \* as Next from ['"]next['"];?/,
  heavyLibs: /import.*from ['"](@ant-design|@material-ui|react-bootstrap)['"];?/,
};

/**
 * Hook logic function - monitors performance and optimizations
 * @param {Object} hookData - Parsed and standardized hook data
 * @param {HookRunner} runner - Hook runner instance for utilities
 * @returns {Object} Hook result
 */
function guardPerformance(hookData, runner) {
  // Allow operations without content
  const content = hookData.content || hookData.new_string || '';
  if (!content) {
    return { allow: true };
  }

  const filePath = hookData.filePath || hookData.file_path || '';
  const fileName = path.basename(filePath);

  // Calculate performance metrics
  const metrics = calculatePerformanceMetrics(content, filePath);

  // Check for critical performance issues
  const criticalIssues = findCriticalIssues(metrics, content, runner);
  if (criticalIssues.length > 0) {
    const message = runner.formatError(
      `Performance issues detected`,
      ...criticalIssues,
      `Consider optimizing before proceeding`
    );

    return {
      block: true,
      message,
    };
  }

  // Log warnings for optimization opportunities
  const warnings = findOptimizationOpportunities(metrics, content);
  if (warnings.length > 0) {
    warnings.forEach(warning => console.warn(`⚠️  ${warning}`));
  }

  return { allow: true };
}

/**
 * Calculate comprehensive performance metrics
 */
function calculatePerformanceMetrics(content, filePath) {
  const lines = content.split('\n');
  
  return {
    fileSize: lines.length,
    complexityScore: calculateComplexityScore(content),
    importCount: countImports(content),
    nestedLoopCount: countNestedLoops(content),
    functionLengths: analyzeFunctionLengths(content),
    bundleImpact: analyzeBundleImpact(content),
    bloatIndicators: detectCodeBloat(content),
  };
}

/**
 * Calculate algorithmic complexity score
 */
function calculateComplexityScore(content) {
  let score = 0;
  
  // Nested loops add significant complexity
  const nestedLoops = (content.match(COMPLEXITY_PATTERNS.nestedLoops) || []).length;
  const tripleNested = (content.match(COMPLEXITY_PATTERNS.tripleNested) || []).length;
  
  score += nestedLoops * 3;
  score += tripleNested * 8;
  
  // Recursive functions with loops
  score += (content.match(COMPLEXITY_PATTERNS.recursiveWithLoop) || []).length * 5;
  
  // Chained array methods
  score += (content.match(COMPLEXITY_PATTERNS.arrayMethods) || []).length * 2;
  
  // Function count and branching
  const functions = (content.match(/function\s+\w+|=>\s*{|\w+\s*\(/g) || []).length;
  const ifStatements = (content.match(/if\s*\(/g) || []).length;
  
  score += Math.floor(functions * 0.5);
  score += Math.floor(ifStatements * 0.3);
  
  return score;
}

/**
 * Count imports in the file
 */
function countImports(content) {
  const importLines = content.match(/import.*from.*['"];?/g) || [];
  return importLines.length;
}

/**
 * Count nested loops
 */
function countNestedLoops(content) {
  let maxNesting = 0;
  let currentNesting = 0;
  
  // Simple heuristic for nested loops
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('for (') || line.includes('while (') || line.includes('.forEach(')) {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    }
    if (line.includes('}') && currentNesting > 0) {
      currentNesting = Math.max(0, currentNesting - 1);
    }
  }
  
  return maxNesting;
}

/**
 * Analyze function lengths
 */
function analyzeFunctionLengths(content) {
  const functions = content.match(/function\s+\w+[^{]*{[^}]*}/g) || [];
  return functions.map(func => func.split('\n').length);
}

/**
 * Analyze bundle size impact
 */
function analyzeBundleImpact(content) {
  let impact = 0;
  
  // Check for heavy imports
  Object.entries(HEAVY_IMPORTS).forEach(([name, pattern]) => {
    if (pattern.test(content)) {
      impact += getLibraryWeight(name);
    }
  });
  
  return impact;
}

/**
 * Get estimated library weight impact
 */
function getLibraryWeight(libraryName) {
  const weights = {
    lodash: 50, // KB estimate
    momentjs: 67,
    entireReact: 40,
    entireNext: 100,
    heavyLibs: 200,
  };
  
  return weights[libraryName] || 10;
}

/**
 * Detect code bloat patterns
 */
function detectCodeBloat(content) {
  const indicators = [];
  
  Object.entries(BLOAT_PATTERNS).forEach(([name, pattern]) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      indicators.push({ type: name, count: matches.length });
    }
  });
  
  return indicators;
}

/**
 * Find critical performance issues that should block
 */
function findCriticalIssues(metrics, content, runner) {
  const issues = [];
  
  // Critical: Too many nested loops
  if (metrics.nestedLoopCount > PERFORMANCE_LIMITS.maxNestedLoops) {
    issues.push(`🔴 ${metrics.nestedLoopCount} levels of nested loops (max: ${PERFORMANCE_LIMITS.maxNestedLoops})`);
  }
  
  // Critical: Extremely high complexity
  if (metrics.complexityScore > PERFORMANCE_LIMITS.maxComplexityScore) {
    issues.push(`🔴 Complexity score ${metrics.complexityScore} (max: ${PERFORMANCE_LIMITS.maxComplexityScore})`);
  }
  
  // Critical: File too large
  if (metrics.fileSize > PERFORMANCE_LIMITS.maxFileSize) {
    issues.push(`🔴 File has ${metrics.fileSize} lines (max: ${PERFORMANCE_LIMITS.maxFileSize})`);
  }
  
  return issues;
}

/**
 * Find optimization opportunities (warnings only)
 */
function findOptimizationOpportunities(metrics, content) {
  const warnings = [];
  
  // Heavy bundle impact
  if (metrics.bundleImpact > 100) {
    warnings.push(`Bundle impact: ${metrics.bundleImpact}KB - consider tree shaking`);
  }
  
  // Too many imports
  if (metrics.importCount > PERFORMANCE_LIMITS.maxImportCount) {
    warnings.push(`${metrics.importCount} imports - consider consolidation`);
  }
  
  // Long functions
  const longFunctions = metrics.functionLengths.filter(len => len > PERFORMANCE_LIMITS.maxFunctionLength);
  if (longFunctions.length > 0) {
    warnings.push(`${longFunctions.length} functions exceed ${PERFORMANCE_LIMITS.maxFunctionLength} lines`);
  }
  
  // Code bloat indicators
  metrics.bloatIndicators.forEach(indicator => {
    warnings.push(`Code bloat: ${indicator.count} instances of ${indicator.type}`);
  });
  
  return warnings;
}

// Create and run the hook
HookRunner.create("performance-guardian", guardPerformance, {
  timeout: 3000,
});

module.exports = { 
  PERFORMANCE_LIMITS,
  BLOAT_PATTERNS, 
  COMPLEXITY_PATTERNS,
  HEAVY_IMPORTS,
  guardPerformance,
  calculatePerformanceMetrics,
  calculateComplexityScore
};