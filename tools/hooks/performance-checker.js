#!/usr/bin/env node

/**
 * Claude Code Hook: Performance Impact Checker
 * 
 * Validates that code changes don't introduce performance issues.
 * Addresses friction point 3.4 "Performance Blindness" from FRICTION-MAPPING.md.
 * 
 * Checks:
 * - Bundle size impact
 * - Inefficient algorithms (O(n²) patterns)
 * - Memory leak patterns
 * - Excessive re-renders (React)
 * - Large dependency additions
 * 
 * Usage: Called by Claude Code after Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const fs = require('fs');
const path = require('path');

// File extensions to check for performance
const PERFORMANCE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs']);

// Performance anti-patterns
const PERFORMANCE_PATTERNS = [
  {
    pattern: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/gi,
    severity: 'high',
    issue: 'Nested loops detected - O(n²) complexity',
    suggestion: 'Consider using Map/Set, or single-pass algorithms'
  },
  {
    pattern: /\.map\s*\([^}]*\}\s*\)\s*\.filter\s*\(|\.filter\s*\([^)]*\)\s*\.map\s*\([^}]*\}\s*\)|\.map\s*\([^)]*\)\s*\.filter\s*\(|\.filter\s*\([^)]*\)\s*\.map\s*\(/gi,
    severity: 'medium',
    issue: 'Chained array operations - multiple iterations',
    suggestion: 'Combine into single reduce() for better performance'
  },
  {
    pattern: /useEffect\s*\(\s*[^,]*,\s*\[\s*\]\s*\)[^}]*setState|useState.*useEffect\s*\(\s*[^,]*,\s*\[\s*\]\s*\)/gi,
    severity: 'medium',
    issue: 'Potential infinite re-render loop',
    suggestion: 'Check useEffect dependencies and state updates'
  },
  {
    pattern: /JSON\.parse\s*\(\s*JSON\.stringify\s*\(/gi,
    severity: 'medium',
    issue: 'Inefficient deep cloning',
    suggestion: 'Use structured cloning or a dedicated library'
  },
  {
    pattern: /document\.getElementById|document\.querySelector/gi,
    severity: 'low',
    issue: 'Direct DOM manipulation in React/modern frameworks',
    suggestion: 'Use refs or framework-specific methods'
  },
  {
    pattern: /setInterval\s*\(|setTimeout\s*\([^)]*,\s*[0-9]+\s*\)/gi,
    severity: 'medium',
    issue: 'Timer usage detected - potential memory leaks',
    suggestion: 'Ensure proper cleanup in useEffect return or componentWillUnmount'
  },
  {
    pattern: /new\s+Array\s*\(\s*\d+\s*\)\.fill\s*\(/gi,
    severity: 'low',
    issue: 'Inefficient array initialization',
    suggestion: 'Use Array.from() for better performance'
  },
  {
    pattern: /\.indexOf\s*\([^)]*\)\s*>\s*-1/gi,
    severity: 'low',
    issue: 'Inefficient array search',
    suggestion: 'Use .includes() for better readability and slight performance gain'
  }
];

// Large dependency patterns (known heavy packages)
const HEAVY_DEPENDENCIES = [
  {
    pattern: /import.*['"`]moment['"`]|require\s*\(\s*['"`]moment['"`]/gi,
    issue: 'Moment.js is very large (67kb)',
    suggestion: 'Use date-fns or native Date methods instead'
  },
  {
    pattern: /import.*['"`]lodash['"`]|require\s*\(\s*['"`]lodash['"`]/gi,
    issue: 'Full Lodash import (24kb)',
    suggestion: 'Import specific functions: import { debounce } from "lodash/debounce"'
  },
  {
    pattern: /import.*['"`]@emotion\/styled['"`]|import.*['"`]styled-components['"`]/gi,
    issue: 'CSS-in-JS adds runtime overhead',
    suggestion: 'Consider CSS modules or Tailwind for better performance'
  },
  {
    pattern: /import.*['"`]axios['"`]|require\s*\(\s*['"`]axios['"`]/gi,
    issue: 'Axios adds 4kb - native fetch might be sufficient',
    suggestion: 'Use native fetch API for simple requests'
  }
];

// React-specific performance patterns
const REACT_PERFORMANCE_PATTERNS = [
  {
    pattern: /useEffect\s*\(\s*[^,]*\s*\)/gi, // useEffect without deps
    severity: 'medium',
    issue: 'useEffect without dependency array - runs on every render',
    suggestion: 'Add dependency array to useEffect'
  },
  {
    pattern: /\{\s*.*\.map\s*\([^}]*\)\s*\}/gi,
    severity: 'low',
    issue: 'Inline array mapping in JSX',
    suggestion: 'Extract to useMemo() for complex operations'
  },
  {
    pattern: /onClick\s*=\s*\{\s*\(\s*\)\s*=>/gi,
    severity: 'low',
    issue: 'Inline arrow function in event handler',
    suggestion: 'Extract to useCallback() to prevent unnecessary re-renders'
  },
  {
    pattern: /style\s*=\s*\{\{/gi,
    severity: 'low',
    issue: 'Inline styles create new objects on each render',
    suggestion: 'Move styles outside component or use CSS classes'
  }
];

function analyzePerformance(content, filePath) {
  const issues = [];
  
  // Check general performance patterns
  for (const {pattern, severity, issue, suggestion} of PERFORMANCE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        severity,
        issue,
        suggestion,
        count: matches.length,
        type: 'performance'
      });
    }
  }
  
  // Check heavy dependencies
  for (const {pattern, issue, suggestion} of HEAVY_DEPENDENCIES) {
    if (pattern.test(content)) {
      issues.push({
        severity: 'medium',
        issue,
        suggestion,
        type: 'dependency'
      });
    }
  }
  
  // Check React-specific patterns if it's a React file
  if (content.includes('import React') || content.includes('from "react"') || 
      filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
    
    for (const {pattern, severity, issue, suggestion} of REACT_PERFORMANCE_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          severity,
          issue,
          suggestion,
          count: matches.length,
          type: 'react'
        });
      }
    }
  }
  
  return issues;
}

function estimateBundleImpact(content, filePath) {
  // Simple heuristic for bundle size impact
  const codeSize = content.length;
  const importCount = (content.match(/import|require/g) || []).length;
  const functionCount = (content.match(/function|const.*=.*=>/g) || []).length;
  
  // Rough estimate: base size + imports + functions
  const estimatedImpact = Math.round((codeSize / 1000) + (importCount * 0.5) + (functionCount * 0.1));
  
  return {
    sizeKb: estimatedImpact,
    isLarge: estimatedImpact > 10, // Flag files over 10kb estimated
    breakdown: {
      code: Math.round(codeSize / 1000),
      imports: importCount,
      functions: functionCount
    }
  };
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
    
    // Skip non-performance-checkable files
    const ext = path.extname(filePath);
    if (!PERFORMANCE_EXTENSIONS.has(ext)) {
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
    
    // Analyze performance issues
    const performanceIssues = analyzePerformance(content, filePath);
    const bundleImpact = estimateBundleImpact(content, filePath);
    
    
    // Filter issues by severity
    const highSeverityIssues = performanceIssues.filter(issue => issue.severity === 'high');
    const mediumSeverityIssues = performanceIssues.filter(issue => issue.severity === 'medium');
    const lowSeverityIssues = performanceIssues.filter(issue => issue.severity === 'low');
    
    // Block if there are high severity issues or very large bundle impact
    if (highSeverityIssues.length > 0 || bundleImpact.isLarge) {
      let message = `⚡ Performance issues detected in ${path.basename(filePath)}:\n\n`;
      
      if (highSeverityIssues.length > 0) {
        message += `🔴 Critical Issues:\n`;
        highSeverityIssues.forEach((issue, i) => {
          message += `${i + 1}. ❌ ${issue.issue}\n`;
          message += `   ✅ ${issue.suggestion}\n`;
          if (issue.count > 1) {
            message += `   📍 Found ${issue.count} instances\n`;
          }
          message += `\n`;
        });
      }
      
      if (bundleImpact.isLarge) {
        message += `📦 Large Bundle Impact: ~${bundleImpact.sizeKb}kb estimated\n`;
        message += `   • Code: ${bundleImpact.breakdown.code}kb\n`;
        message += `   • Imports: ${bundleImpact.breakdown.imports} dependencies\n`;
        message += `   • Functions: ${bundleImpact.breakdown.functions} functions\n\n`;
      }
      
      if (mediumSeverityIssues.length > 0) {
        message += `🟡 Consider Optimizing:\n`;
        mediumSeverityIssues.slice(0, 3).forEach((issue, i) => {
          message += `${i + 1}. ${issue.issue}\n`;
        });
        if (mediumSeverityIssues.length > 3) {
          message += `... and ${mediumSeverityIssues.length - 3} more\n`;
        }
      }
      
      message += `\n💡 Fix critical issues before proceeding.\n`;
      message += `📖 See docs/guides/performance/ for optimization guides`;
      
      console.log(JSON.stringify({
        status: 'blocked',
        message
      }));
      return;
    }
    
    // Warn about medium or low issues but allow
    if (mediumSeverityIssues.length > 0 || lowSeverityIssues.length > 0) {
      const totalSuggestions = mediumSeverityIssues.length + lowSeverityIssues.length;
      console.log(JSON.stringify({
        status: 'ok',
        message: `⚡ Performance suggestions available for ${path.basename(filePath)} (${totalSuggestions} items)`
      }));
      return;
    }
    
    // No significant performance issues
    console.log(JSON.stringify({ status: 'ok' }));
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.log(JSON.stringify({ 
      status: 'ok',
      debug: `Performance checker error: ${error.message}` 
    }));
  }
}

// Handle command line execution
if (require.main === module) {
  checkFile(process.argv.slice(2));
}

module.exports = { 
  checkFile, 
  analyzePerformance, 
  estimateBundleImpact,
  PERFORMANCE_PATTERNS,
  HEAVY_DEPENDENCIES
};