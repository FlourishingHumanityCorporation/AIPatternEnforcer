#!/usr/bin/env node

/**
 * Claude Code Hook: Context Validation (Tool Parameter Based)
 *
 * Validates tool parameters for quality and appropriateness.
 * Designed for actual Claude Code hook data (tool parameters only).
 *
 * Validates:
 * - Edit operations: old_string specificity and new_string quality
 * - Write operations: content quality and file path appropriateness
 * - File path follows project structure
 * - Prevents obviously bad operations
 *
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: exit code 0 (allow) or 2 (block)
 */

const fs = require("fs");
const HookRunner = require("../lib/HookRunner");
const { FileAnalyzer, PatternLibrary, ErrorFormatter } = require("../lib");

// Scoring thresholds (strict to prevent bad operations)
const OPERATION_THRESHOLDS = {
  Write: {
    minScore: 6,
    description: "creating new files",
  },
  Edit: {
    minScore: 10, // High threshold - edits need very specific parameters
    description: "modifying existing files",
  },
  MultiEdit: {
    minScore: 12, // Even higher for multiple edits
    description: "multi-file changes",
  },
};

// File path validation patterns
const FILE_PATH_RULES = {
  documentation: {
    patterns: [/\.md$/, /\/docs\//, /README/, /GUIDE/],
    minScore: 2, // Very permissive for docs
  },
  tests: {
    patterns: [/\.test\.(js|ts|tsx)$/, /\.spec\.(js|ts|tsx)$/, /\/tests?\//],
    minScore: 3,
  },
  components: {
    patterns: [/\/components\//, /\.tsx$/, /\.jsx$/],
    minScore: 4,
  },
  hooks: {
    patterns: [/\/tools\/hooks\//, /\.hook\.(js|ts)$/],
    minScore: 4,
  },
  config: {
    patterns: [/config/, /\.json$/, /\.env/],
    minScore: 2,
  },
  root_violations: {
    patterns: [
      /^[^\/]*\.(js|ts|tsx|jsx)$/,
      /^app\//,
      /^components\//,
      /^lib\//,
    ],
    penalty: -10, // Heavy penalty for root directory violations
  },
};

// Tool parameter quality indicators (based on actual available data)
const PARAMETER_QUALITY_INDICATORS = {
  edit: [
    {
      test: (params) => params.old_string && params.old_string.length > 20,
      weight: 8,
      description: "Very specific old_string provided (>20 chars)",
    },
    {
      test: (params) => params.old_string && params.old_string.length > 10,
      weight: 4,
      description: "Specific old_string provided (>10 chars)",
    },
    {
      test: (params) =>
        params.old_string &&
        !["a", "b", "test", "TODO", "console.log", "t", "x", "y", "z"].includes(
          params.old_string.trim(),
        ),
      weight: 2,
      description: "old_string is not generic placeholder",
    },
    {
      test: (params) => params.new_string && params.new_string.length > 5,
      weight: 3,
      description: "Meaningful new_string provided",
    },
    {
      test: (params) =>
        params.new_string &&
        params.old_string &&
        params.new_string !== params.old_string,
      weight: 1,
      description: "new_string differs from old_string",
    },
    {
      test: (params) =>
        params.file_path &&
        !params.file_path.includes("undefined") &&
        !params.file_path.includes("null"),
      weight: 1,
      description: "Valid file path provided",
    },
  ],
  write: [
    {
      test: (params) => params.content && params.content.length > 50,
      weight: 5,
      description: "Substantial content provided (>50 chars)",
    },
    {
      test: (params) => params.content && params.content.length > 200,
      weight: 3,
      description: "Detailed content provided (>200 chars)",
    },
    {
      test: (params) => params.file_path && params.file_path.includes("/"),
      weight: 4,
      description: "File path includes proper directory structure",
    },
    {
      test: (params) =>
        params.file_path &&
        !params.file_path.match(/^[^\/]*\.(js|ts|tsx|jsx)$/),
      weight: 4,
      description: "Not creating code files in root directory",
    },
    {
      test: (params) =>
        params.content && !params.content.includes("TODO: implement"),
      weight: 2,
      description: "Content is not just placeholder",
    },
  ],
  multiedit: [
    {
      test: (params) =>
        params.edits && Array.isArray(params.edits) && params.edits.length > 0,
      weight: 5,
      description: "Valid edits array provided",
    },
    {
      test: (params) =>
        params.edits &&
        params.edits.every(
          (edit) => edit.old_string && edit.old_string.length > 5,
        ),
      weight: 4,
      description: "All edits have meaningful old_string",
    },
    {
      test: (params) =>
        params.edits &&
        params.edits.every(
          (edit) => edit.new_string && edit.new_string !== edit.old_string,
        ),
      weight: 3,
      description: "All edits have different new_string",
    },
    {
      test: (params) => params.file_path && params.file_path.includes("/"),
      weight: 3,
      description: "File path includes proper directory structure",
    },
  ],
};

// Patterns that indicate risky operations (based on tool parameters)
const RISKY_OPERATION_PATTERNS = {
  edit: [
    {
      test: (params) => params.old_string && params.old_string.length < 5,
      warning: "Very short old_string - risk of matching unintended text",
      penalty: -8, // Heavy penalty for short strings
    },
    {
      test: (params) => params.old_string && params.old_string.length <= 2,
      warning:
        "Extremely short old_string - almost certain to match wrong text",
      penalty: -15, // Severe penalty for 1-2 char strings
    },
    {
      test: (params) => params.old_string === params.new_string,
      warning: "old_string identical to new_string - no change will occur",
      penalty: -20, // Block no-op edits
    },
    {
      test: (params) =>
        params.file_path && params.file_path.match(/^[^\/]*\.(js|ts|tsx|jsx)$/),
      warning:
        "Editing code file in root directory (violates project structure)",
      penalty: -10,
    },
  ],
  write: [
    {
      test: (params) =>
        params.file_path && params.file_path.match(/^[^\/]*\.(js|ts|tsx|jsx)$/),
      warning:
        "Creating code file in root directory (violates project structure)",
      penalty: -10, // Already handled by root violations, but reinforce
    },
    {
      test: (params) => params.content && params.content.length < 20,
      warning: "Very short content - may be incomplete",
      penalty: -3,
    },
    {
      test: (params) =>
        (params.file_path && params.file_path.includes("_improved")) ||
        (params.file_path && params.file_path.includes("_v2")),
      warning: "File name suggests duplication instead of editing original",
      penalty: -10,
    },
  ],
};

function getFileType(filePath) {
  if (!filePath) return null;

  for (const [type, rules] of Object.entries(FILE_PATH_RULES)) {
    if (type === "root_violations") continue; // Skip penalty patterns
    if (rules.patterns.some((pattern) => pattern.test(filePath))) {
      return type;
    }
  }
  return "general";
}

function analyzeParameterQuality(params, operationType, filePath) {
  let score = 0;
  const foundIndicators = [];
  const warnings = [];

  // Get appropriate quality indicators for this operation type
  const opType = operationType.toLowerCase();
  const indicators =
    PARAMETER_QUALITY_INDICATORS[opType] || PARAMETER_QUALITY_INDICATORS.write;

  // Score based on tool parameter quality
  for (const indicator of indicators) {
    if (indicator.test(params)) {
      score += indicator.weight;
      foundIndicators.push(indicator.description);
    }
  }

  // Check for file path issues
  if (filePath) {
    const fileType = getFileType(filePath);
    const fileRules = FILE_PATH_RULES[fileType];
    if (fileRules && fileRules.minScore) {
      score += fileRules.minScore;
      foundIndicators.push(`Appropriate file type: ${fileType}`);
    }

    // Check for root directory violations
    const rootViolations = FILE_PATH_RULES.root_violations;
    if (rootViolations.patterns.some((pattern) => pattern.test(filePath))) {
      score += rootViolations.penalty;
      warnings.push("Root directory violation detected");
    }
  }

  // Check for risky operation patterns and apply penalties
  const riskPatterns = RISKY_OPERATION_PATTERNS[opType] || [];
  for (const pattern of riskPatterns) {
    if (pattern.test(params)) {
      warnings.push(pattern.warning);
      if (pattern.penalty) {
        score += pattern.penalty; // Apply penalty (negative value)
      }
    }
  }

  return {
    score,
    indicators: foundIndicators,
    warnings,
    parameterCount: Object.keys(params).length,
  };
}

function getOperationThreshold(operationType, filePath) {
  const baseThreshold =
    OPERATION_THRESHOLDS[operationType] || OPERATION_THRESHOLDS["Write"];
  const fileType = getFileType(filePath);
  const fileTypeRules = FILE_PATH_RULES[fileType];

  // Use file-specific threshold if available, otherwise use operation default
  let minScore = baseThreshold.minScore;
  if (fileTypeRules && fileTypeRules.minScore !== undefined) {
    // For file types with specific rules, use the higher of operation or file type threshold
    minScore = Math.max(minScore, fileTypeRules.minScore);
  }

  return {
    ...baseThreshold,
    minScore,
  };
}

function validateFilePathStructure(filePath) {
  if (!filePath) return { isValid: true, message: "" };

  const issues = [];

  // Check for root directory violations (critical issue)
  if (filePath.match(/^[^\/]*\.(js|ts|tsx|jsx)$/)) {
    issues.push("Code files must not be in root directory");
  }

  if (filePath.match(/^(app|components|lib|pages)\//)) {
    issues.push(
      "Application code directories must be inside templates/[framework]/",
    );
  }

  // Check for forbidden file name patterns
  if (
    filePath.includes("_improved") ||
    filePath.includes("_enhanced") ||
    filePath.includes("_v2")
  ) {
    issues.push("Avoid creating duplicate files - edit originals instead");
  }

  return {
    isValid: issues.length === 0,
    message: issues.join("; "),
  };
}

function getImprovementSuggestions(operationType, analysis, filePath) {
  const suggestions = [];

  switch (operationType.toLowerCase()) {
    case "edit":
      if (analysis.score < 3) {
        suggestions.push(
          "🎯 Provide more specific old_string (>10 characters)",
        );
        suggestions.push("✨ Ensure new_string contains meaningful change");
      }
      if (
        analysis.warnings.includes(
          "Very short old_string - risk of matching unintended text",
        )
      ) {
        suggestions.push(
          "🔍 Use longer, more specific old_string to avoid unintended matches",
        );
      }
      break;

    case "write":
      if (analysis.score < 6) {
        suggestions.push(
          "📝 Provide more substantial content (>50 characters)",
        );
        suggestions.push(
          "📁 Use proper directory structure (avoid root directory)",
        );
      }
      if (
        analysis.warnings.includes(
          "Creating code file in root directory (violates project structure)",
        )
      ) {
        suggestions.push(
          "🏗️ Move code files to templates/[framework]/ directory",
        );
      }
      break;

    case "multiedit":
      if (analysis.score < 8) {
        suggestions.push(
          "📋 Ensure all edit operations have specific parameters",
        );
        suggestions.push("🔗 Verify file paths follow project structure");
      }
      break;
  }

  // General suggestions based on file path issues
  const pathValidation = validateFilePathStructure(filePath);
  if (!pathValidation.isValid) {
    suggestions.push(`🚫 Fix file path issue: ${pathValidation.message}`);
  }

  return suggestions;
}

// Hook logic
async function contextValidator(input) {
  // Extract actual tool parameters from the hook data structure
  const params = input.tool_input || {
    file_path: input.file_path,
    old_string: input.old_string,
    new_string: input.new_string,
    content: input.content,
    edits: input.edits,
  };
  const operationType = input.tool_name || "Write";

  // If no meaningful parameters provided, fail open (allow operation)
  if (Object.keys(params).length === 0 || !params.file_path) {
    return { allow: true };
  }

  const filePath = params.file_path || "";

  // Get operation threshold based on operation type and file type
  const threshold = getOperationThreshold(operationType, filePath);

  // Analyze parameter quality (what we actually have access to)
  const analysis = analyzeParameterQuality(params, operationType, filePath);

  // Validate file path structure (critical violations)
  const pathValidation = validateFilePathStructure(filePath);

  // Determine if operation should be blocked
  const hasMinimumQuality = analysis.score >= threshold.minScore;
  const hasValidPath = pathValidation.isValid;

  // Block only for serious issues:
  // 1. Very low parameter quality (indicates likely mistakes)
  // 2. Critical path violations (root directory code files)
  if (!hasMinimumQuality || !hasValidPath) {
    const suggestions = getImprovementSuggestions(
      operationType,
      analysis,
      filePath,
    );

    let message = `⚠️ Tool parameter validation failed for ${threshold.description}\n\n`;

    if (!hasMinimumQuality) {
      message += `❌ Parameter quality score: ${analysis.score}/${threshold.minScore}\n`;
      message += `   Available parameters: ${Object.keys(params).join(", ")}\n`;
    }

    if (!hasValidPath) {
      message += `❌ File path violation: ${pathValidation.message}\n`;
    }

    // Show specific warnings from parameter analysis
    if (analysis.warnings.length > 0) {
      message += `\n⚠️ Parameter warnings:\n`;
      analysis.warnings.forEach((warning) => {
        message += `   • ${warning}\n`;
      });
    }

    message += `\n✅ To fix:\n`;
    suggestions.forEach((suggestion) => {
      message += `   ${suggestion}\n`;
    });

    if (analysis.indicators.length > 0) {
      message += `\n✅ Good parameters detected: ${analysis.indicators.join(", ")}`;
    }

    return {
      block: true,
      message: message,
    };
  }

  return { allow: true };
}

// Create and run the hook
HookRunner.create("context-validator", contextValidator, {
  timeout: 1500,
});

module.exports = {
  analyzeParameterQuality,
  validateFilePathStructure,
  OPERATION_THRESHOLDS,
  PARAMETER_QUALITY_INDICATORS,
  getFileType,
  getOperationThreshold,
  contextValidator,
};
