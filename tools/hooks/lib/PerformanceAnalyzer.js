/**
 * Performance analysis utilities for hooks
 * Provides bundle size analysis, complexity metrics, and AI token usage estimation
 */
class PerformanceAnalyzer {
  /**
   * Analyze bundle size impact of imports and code
   */
  static analyzeBundleImpact(content, filePath) {
    const imports = this.extractImports(content);
    const bundleImpact = {
      heavyImports: [],
      importCount: imports.length,
      estimatedSize: 0,
      suggestions: [],
    };

    // Heavy library detection
    const heavyLibraries = {
      lodash: { size: 70, suggestion: "Use lodash-es or individual functions" },
      moment: { size: 290, suggestion: "Use date-fns or dayjs instead" },
      "@material-ui/core": {
        size: 350,
        suggestion: "Import individual components",
      },
      antd: {
        size: 280,
        suggestion: "Use tree shaking or import individual components",
      },
      rxjs: { size: 150, suggestion: "Import only needed operators" },
      three: { size: 600, suggestion: "Consider lighter alternatives" },
    };

    imports.forEach((imp) => {
      const moduleName = imp.replace(/^@/, "").split("/")[0];
      if (heavyLibraries[moduleName]) {
        bundleImpact.heavyImports.push({
          import: imp,
          estimatedSize: heavyLibraries[moduleName].size,
          suggestion: heavyLibraries[moduleName].suggestion,
        });
        bundleImpact.estimatedSize += heavyLibraries[moduleName].size;
      }
    });

    // Generate suggestions
    if (bundleImpact.heavyImports.length > 0) {
      bundleImpact.suggestions.push("Consider tree shaking for heavy imports");
    }
    if (bundleImpact.importCount > 15) {
      bundleImpact.suggestions.push("High import count may impact bundle size");
    }

    return bundleImpact;
  }

  /**
   * Calculate code complexity metrics
   */
  static calculateComplexity(content) {
    const lines = content.split("\n");
    const complexity = {
      cyclomaticComplexity: 1, // Base complexity
      nestingDepth: 0,
      functionCount: 0,
      lineCount: lines.length,
      cognitiveComplexity: 0,
      maintainabilityIndex: 100,
    };

    // Complexity patterns
    const complexityPatterns = {
      ifStatement: /\bif\s*\(/g,
      forLoop: /\bfor\s*\(/g,
      whileLoop: /\bwhile\s*\(/g,
      switchCase: /\bcase\s+/g,
      ternary: /\?.*:/g,
      logicalOperators: /(\&\&|\|\|)/g,
      functions: /function\s+\w+|=>\s*{|=\s*function/g,
    };

    let maxNesting = 0;
    let currentNesting = 0;

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Count nesting
      const openBraces = (trimmed.match(/{/g) || []).length;
      const closeBraces = (trimmed.match(/}/g) || []).length;
      currentNesting += openBraces - closeBraces;
      maxNesting = Math.max(maxNesting, currentNesting);

      // Count complexity indicators
      Object.entries(complexityPatterns).forEach(([type, pattern]) => {
        const matches = (line.match(pattern) || []).length;
        if (type === "functions") {
          complexity.functionCount += matches;
        } else {
          complexity.cyclomaticComplexity += matches;
          complexity.cognitiveComplexity += matches * (currentNesting + 1);
        }
      });
    });

    complexity.nestingDepth = maxNesting;

    // Calculate maintainability index (simplified)
    const halsteadVolume = Math.max(
      1,
      Math.log2(complexity.lineCount + complexity.cyclomaticComplexity),
    );
    complexity.maintainabilityIndex = Math.max(
      0,
      171 -
        5.2 * Math.log(halsteadVolume) -
        0.23 * complexity.cyclomaticComplexity -
        16.2 * Math.log(complexity.lineCount),
    );

    return complexity;
  }

  /**
   * Estimate AI token usage for content
   */
  static estimateTokenUsage(content, modelType = "gpt-4") {
    // Rough token estimation (1 token ≈ 4 characters for English)
    const characterCount = content.length;
    const estimatedTokens = Math.ceil(characterCount / 4);

    // Model-specific pricing (per 1K tokens)
    const pricing = {
      "gpt-4": { input: 0.03, output: 0.06 },
      "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
      "claude-3-sonnet": { input: 0.003, output: 0.015 },
      "claude-3-haiku": { input: 0.00025, output: 0.00125 },
    };

    const model = pricing[modelType] || pricing["gpt-4"];

    return {
      estimatedTokens,
      characterCount,
      costPer1K: model.input,
      estimatedInputCost: (estimatedTokens / 1000) * model.input,
      modelType,
      efficiency: characterCount / estimatedTokens, // chars per token
    };
  }

  /**
   * Extract import statements from content
   */
  static extractImports(content) {
    const imports = [];
    const importPatterns = [
      /import\s+(?:.*\s+from\s+)?['"`]([^'"`]+)['"`]/gi,
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gi,
    ];

    importPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1]);
      }
    });

    return [...new Set(imports)]; // Remove duplicates
  }

  /**
   * Analyze performance budget for a file
   */
  static analyzePerformanceBudget(content, filePath, budgets = {}) {
    const defaultBudgets = {
      maxLines: 500,
      maxComplexity: 15,
      maxImports: 20,
      maxBundleSize: 100, // KB
      maxNestingDepth: 4,
    };

    const activeBudgets = { ...defaultBudgets, ...budgets };
    const complexity = this.calculateComplexity(content);
    const bundleImpact = this.analyzeBundleImpact(content, filePath);

    const violations = [];
    const warnings = [];

    // Check budget violations
    if (complexity.lineCount > activeBudgets.maxLines) {
      violations.push(
        `File too large: ${complexity.lineCount} lines (max: ${activeBudgets.maxLines})`,
      );
    }

    if (complexity.cyclomaticComplexity > activeBudgets.maxComplexity) {
      violations.push(
        `Complexity too high: ${complexity.cyclomaticComplexity} (max: ${activeBudgets.maxComplexity})`,
      );
    }

    if (bundleImpact.importCount > activeBudgets.maxImports) {
      warnings.push(
        `Many imports: ${bundleImpact.importCount} (max: ${activeBudgets.maxImports})`,
      );
    }

    if (bundleImpact.estimatedSize > activeBudgets.maxBundleSize) {
      violations.push(
        `Bundle size impact: ${bundleImpact.estimatedSize}KB (max: ${activeBudgets.maxBundleSize}KB)`,
      );
    }

    if (complexity.nestingDepth > activeBudgets.maxNestingDepth) {
      violations.push(
        `Nesting too deep: ${complexity.nestingDepth} levels (max: ${activeBudgets.maxNestingDepth})`,
      );
    }

    return {
      violations,
      warnings,
      budgets: activeBudgets,
      metrics: {
        complexity,
        bundleImpact,
      },
      score: Math.max(0, 100 - violations.length * 20 - warnings.length * 10),
    };
  }

  /**
   * Generate optimization suggestions
   */
  static generateOptimizationSuggestions(content, filePath) {
    const complexity = this.calculateComplexity(content);
    const bundleImpact = this.analyzeBundleImpact(content, filePath);
    const suggestions = [];

    // Complexity suggestions
    if (complexity.cyclomaticComplexity > 10) {
      suggestions.push({
        type: "complexity",
        priority: "high",
        message: "Consider breaking down complex functions",
        action: "Extract smaller functions or use early returns",
      });
    }

    if (complexity.nestingDepth > 3) {
      suggestions.push({
        type: "nesting",
        priority: "medium",
        message: "Reduce nesting depth",
        action: "Use guard clauses or extract nested logic",
      });
    }

    // Bundle size suggestions
    bundleImpact.heavyImports.forEach((imp) => {
      suggestions.push({
        type: "bundle",
        priority: "medium",
        message: `Heavy import detected: ${imp.import}`,
        action: imp.suggestion,
      });
    });

    // Performance suggestions
    if (complexity.lineCount > 300) {
      suggestions.push({
        type: "size",
        priority: "low",
        message: "Large file detected",
        action: "Consider splitting into smaller modules",
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Comprehensive performance analysis
   */
  static analyzePerformance(content, filePath, options = {}) {
    const analysis = {
      timestamp: new Date().toISOString(),
      filePath,
      fileSize: content.length,
      complexity: this.calculateComplexity(content),
      bundleImpact: this.analyzeBundleImpact(content, filePath),
      tokenUsage: this.estimateTokenUsage(content, options.modelType),
      budget: this.analyzePerformanceBudget(content, filePath, options.budgets),
      suggestions: this.generateOptimizationSuggestions(content, filePath),
    };

    // Overall score calculation
    const scores = {
      complexity: Math.max(
        0,
        100 - analysis.complexity.cyclomaticComplexity * 5,
      ),
      maintainability: analysis.complexity.maintainabilityIndex,
      bundle: Math.max(0, 100 - analysis.bundleImpact.estimatedSize),
      budget: analysis.budget.score,
    };

    analysis.overallScore = Math.round(
      (scores.complexity +
        scores.maintainability +
        scores.bundle +
        scores.budget) /
        4,
    );

    analysis.grade =
      analysis.overallScore >= 90
        ? "A"
        : analysis.overallScore >= 80
          ? "B"
          : analysis.overallScore >= 70
            ? "C"
            : analysis.overallScore >= 60
              ? "D"
              : "F";

    return analysis;
  }
}

module.exports = PerformanceAnalyzer;
