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
const { PerformanceAnalyzer } = require("./lib");
const path = require("path");

// Performance thresholds
const PERFORMANCE_LIMITS = {
  maxNestedLoops: 4,
  maxComplexityScore: 80, // Raised from 15 to realistic level
  maxFileSize: 2000, // lines - infrastructure files can be larger
  maxImportCount: 30,
  maxFunctionLength: 100, // lines - infrastructure functions can be longer
};

// Infrastructure files that can have higher complexity
const INFRASTRUCTURE_PATHS = [
  "tools/hooks/",
  "tools/generators/",
  "scripts/",
  "tools/enforcement/",
  "tools/monitoring/",
];

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
  tripleNested:
    /for\s*\([^)]*\)\s*{[^{}]*for\s*\([^)]*\)\s*{[^{}]*for\s*\([^)]*\)/g,
  recursiveWithLoop:
    /(function\s+\w+[^{]*{[^}]*for\s*\([^)]*\)[^}]*\w+\s*\([^)]*\))/g,
  arrayMethods:
    /\.(map|filter|reduce|forEach|find|some|every)\s*\([^)]*\)\s*\.\s*(map|filter|reduce)/g,
};

// Heavy imports that affect bundle size
const HEAVY_IMPORTS = {
  lodash: /import.*from ['"]lodash['"];?/,
  momentjs: /import.*from ['"]moment['"];?/,
  entireReact: /import \* as React from ['"]react['"];?/,
  entireNext: /import \* as Next from ['"]next['"];?/,
  heavyLibs:
    /import.*from ['"](@ant-design|@material-ui|react-bootstrap)['"];?/,
};

/**
 * Hook logic function - monitors performance and optimizations
 * @param {Object} hookData - Parsed and standardized hook data
 * @param {HookRunner} runner - Hook runner instance for utilities
 * @returns {Object} Hook result
 */
function guardPerformance(hookData, runner) {
  // Allow operations without content
  const content = hookData.content || hookData.new_string || "";
  if (!content) {
    return { allow: true };
  }

  const filePath = hookData.filePath || hookData.file_path || "";
  const fileName = path.basename(filePath);

  // Check if this is an infrastructure file (exempt from strict limits)
  const isInfrastructure = INFRASTRUCTURE_PATHS.some((infraPath) =>
    filePath.includes(infraPath),
  );

  // Calculate performance metrics
  const metrics = calculatePerformanceMetrics(content, filePath);

  // Check for critical performance issues (with exemptions for infrastructure)
  const criticalIssues = findCriticalIssues(
    metrics,
    content,
    runner,
    isInfrastructure,
  );
  if (criticalIssues.length > 0) {
    const message = runner.formatError(
      `Performance issues detected`,
      ...criticalIssues,
      `Consider optimizing before proceeding`,
    );

    return {
      block: true,
      message,
    };
  }

  // Log warnings for optimization opportunities
  const warnings = findOptimizationOpportunities(metrics, content);
  if (warnings.length > 0) {
    warnings.forEach((warning) => console.warn(`⚠️  ${warning}`));
  }

  return { allow: true };
}

/**
 * Calculate comprehensive performance metrics
 */
function calculatePerformanceMetrics(content, filePath) {
  const lines = content.split("\n");

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
 * Calculate algorithmic complexity score - focuses on actual performance problems
 */
function calculateComplexityScore(content) {
  let score = 0;

  // High impact complexity patterns
  const nestedLoops = (content.match(COMPLEXITY_PATTERNS.nestedLoops) || [])
    .length;
  const tripleNested = (content.match(COMPLEXITY_PATTERNS.tripleNested) || [])
    .length;

  score += nestedLoops * 8; // Nested loops are serious performance issues
  score += tripleNested * 20; // Triple nested loops are extremely problematic

  // Recursive functions with loops - moderate impact
  score +=
    (content.match(COMPLEXITY_PATTERNS.recursiveWithLoop) || []).length * 10;

  // Chained array methods - mild performance impact
  score += (content.match(COMPLEXITY_PATTERNS.arrayMethods) || []).length * 3;

  // Remove function and if statement counting - these are normal code patterns
  // Focus only on actual algorithmic complexity issues

  // Large file size bonus (only for extremely large files)
  const lines = content.split("\n").length;
  if (lines > 1500) {
    score += Math.floor((lines - 1500) / 100); // 1 point per 100 lines over 1500
  }

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
 * Count nested loops by analyzing the structure
 */
function countNestedLoops(content) {
  let maxNesting = 0;
  let currentNesting = 0;

  // Track character by character to handle any formatting
  for (let i = 0; i < content.length; i++) {
    const remaining = content.substring(i);

    // Check for loop patterns
    if (
      remaining.startsWith("for(") ||
      remaining.startsWith("for ") ||
      remaining.startsWith("while(") ||
      remaining.startsWith("while ")
    ) {
      // Look ahead to find the opening brace for this loop
      let braceIndex = i;
      while (braceIndex < content.length && content[braceIndex] !== "{") {
        braceIndex++;
      }
      if (braceIndex < content.length) {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      }
    }

    // Track closing braces
    if (content[i] === "}") {
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
  return functions.map((func) => func.split("\n").length);
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
function findCriticalIssues(
  metrics,
  content,
  runner,
  isInfrastructure = false,
) {
  const issues = [];

  // Apply different thresholds for infrastructure vs application code
  const limits = isInfrastructure
    ? {
        maxNestedLoops: PERFORMANCE_LIMITS.maxNestedLoops + 2, // Allow more nesting for infrastructure
        maxComplexityScore: PERFORMANCE_LIMITS.maxComplexityScore * 2, // Allow 2x complexity for infrastructure
        maxFileSize: PERFORMANCE_LIMITS.maxFileSize * 2, // Allow 2x file size for infrastructure
      }
    : PERFORMANCE_LIMITS;

  // Critical: Too many nested loops
  if (metrics.nestedLoopCount > limits.maxNestedLoops) {
    issues.push(
      `🔴 ${metrics.nestedLoopCount} levels of nested loops (max: ${limits.maxNestedLoops})`,
    );
  }

  // Critical: Extremely high complexity (only for truly extreme cases)
  if (metrics.complexityScore > limits.maxComplexityScore) {
    issues.push(
      `🔴 Complexity score ${metrics.complexityScore} (max: ${limits.maxComplexityScore})`,
    );
  }

  // Critical: File too large
  if (metrics.fileSize > limits.maxFileSize) {
    issues.push(
      `🔴 File has ${metrics.fileSize} lines (max: ${limits.maxFileSize})`,
    );
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
    warnings.push(
      `Bundle impact: ${metrics.bundleImpact}KB - consider tree shaking`,
    );
  }

  // Too many imports
  if (metrics.importCount > PERFORMANCE_LIMITS.maxImportCount) {
    warnings.push(`${metrics.importCount} imports - consider consolidation`);
  }

  // Long functions
  const longFunctions = metrics.functionLengths.filter(
    (len) => len > PERFORMANCE_LIMITS.maxFunctionLength,
  );
  if (longFunctions.length > 0) {
    warnings.push(
      `${longFunctions.length} functions exceed ${PERFORMANCE_LIMITS.maxFunctionLength} lines`,
    );
  }

  // Code bloat indicators
  metrics.bloatIndicators.forEach((indicator) => {
    warnings.push(
      `Code bloat: ${indicator.count} instances of ${indicator.type}`,
    );
  });

  return warnings;
}

// Create and run the hook
HookRunner.create("performance-guardian", guardPerformance, {
  timeout: 3000,
});

module.exports = {
  PERFORMANCE_LIMITS,
  INFRASTRUCTURE_PATHS,
  BLOAT_PATTERNS,
  COMPLEXITY_PATTERNS,
  HEAVY_IMPORTS,
  guardPerformance,
  calculatePerformanceMetrics,
  calculateComplexityScore,
};
