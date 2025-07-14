#!/usr/bin/env node

/**
 * Claude Code Hook: Scope Limiter
 *
 * Prevents AI from making unsolicited changes beyond the requested scope.
 * Addresses friction point 8.2 "Unsolicited Actions" from FRICTION-MAPPING.md.
 *
 * Enforces:
 * - Single responsibility per request
 * - Minimal context principle
 * - No scope creep in changes
 * - Clear task boundaries
 *
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const {
  HookRunner,
  FileAnalyzer,
  PatternLibrary,
  ErrorFormatter,
} = require("./lib");

// Patterns that indicate scope creep
const SCOPE_CREEP_PATTERNS = [
  {
    pattern:
      /also.*(?:add|create|update|fix|refactor)|while.*(?:we're|you're).*at.*it/gi,
    issue: 'Scope creep: "Also" or "while we\'re at it" additions',
    suggestion: "Make separate requests for additional tasks",
  },
  {
    pattern: /(?:improve|optimize|enhance|refactor).*(?:entire|whole|all)/gi,
    issue: "Scope creep: Attempting to improve entire codebase",
    suggestion: "Focus on specific, targeted changes",
  },
  {
    pattern: /(?:migrate|convert|upgrade).*(?:all|entire|everything)/gi,
    issue: "Scope creep: Large-scale migration in single request",
    suggestion: "Break migration into smaller, focused steps",
  },
  {
    pattern:
      /(?:add|implement).*(?:authentication|database|api|routing).*(?:and|plus|also)/gi,
    issue: "Scope creep: Multiple major features in one request",
    suggestion: "Implement one major feature at a time",
  },
];

// Patterns that indicate good scope control
const GOOD_SCOPE_PATTERNS = [
  {
    pattern: /only.*(?:change|modify|update|fix)|just.*(?:add|create|update)/gi,
    description: "Explicit scope limitation",
  },
  {
    pattern: /single.*(?:function|component|file|change)/gi,
    description: "Single-item focus",
  },
  {
    pattern: /minimal.*change|smallest.*possible/gi,
    description: "Minimal change principle",
  },
  {
    pattern: /don't.*(?:change|modify|touch|update).*(?:other|existing)/gi,
    description: "Explicit preservation instruction",
  },
];

// File count limits for different operations
const FILE_LIMITS = {
  Write: 1, // Creating new files - one at a time
  Edit: 1, // Editing existing files - one at a time
  MultiEdit: 3, // Multiple edits - max 3 files
};

// Content size limits (rough heuristic for complexity)
const CONTENT_SIZE_LIMITS = {
  Write: 2000, // Lines for new files
  Edit: 1000, // Lines for modifications
  MultiEdit: 500, // Lines per file in multi-edit
};

function analyzeScope(input, operationType) {
  const content = input.content || input.new_string || "";
  const prompt = input.prompt || input.message || "";
  const combinedText = `${prompt} ${content}`;

  const scopeIssues = [];
  const goodScope = [];

  // Check for scope creep patterns
  for (const { pattern, issue, suggestion } of SCOPE_CREEP_PATTERNS) {
    const matches = combinedText.match(pattern);
    if (matches) {
      scopeIssues.push({
        issue,
        suggestion,
        matches: matches.slice(0, 2), // Show first 2 matches
      });
    }
  }

  // Check for good scope patterns
  for (const { pattern, description } of GOOD_SCOPE_PATTERNS) {
    if (pattern.test(combinedText)) {
      goodScope.push(description);
    }
  }

  return {
    hasIssues: scopeIssues.length > 0,
    issues: scopeIssues,
    goodPatterns: goodScope,
    contentSize: content.length,
  };
}

function checkFileCount(input, operationType) {
  const filePath = input.file_path || input.filePath || "";
  const files = input.files || (filePath ? [filePath] : []);

  const limit = FILE_LIMITS[operationType] || 1;

  if (files.length > limit) {
    return {
      exceeded: true,
      count: files.length,
      limit,
      suggestion: `Break into ${files.length} separate requests, one per file`,
    };
  }

  return { exceeded: false };
}

function checkContentComplexity(input, operationType) {
  const content = input.content || input.new_string || "";
  const limit = CONTENT_SIZE_LIMITS[operationType] || 1000;

  // Simple heuristic: lines + complexity indicators
  const lines = content.split("\n").length;
  const complexity = (
    content.match(/function|class|interface|type|const|let/g) || []
  ).length;
  const score = lines + complexity * 10;

  if (score > limit) {
    return {
      tooComplex: true,
      score,
      limit,
      suggestion: "Break into smaller, more focused changes",
    };
  }

  return { tooComplex: false };
}

function generateScopeGuidance(operationType) {
  const guidance = {
    Write: [
      "📝 Create one file at a time",
      "🎯 Focus on single component/utility/feature",
      "📋 Include only essential functionality",
      '🚫 Don\'t add "nice-to-have" features',
    ],
    Edit: [
      "✏️ Modify one specific aspect",
      "🎯 Target precise changes only",
      "📍 Don't refactor unrelated code",
      '🚫 Avoid "while we\'re here" improvements',
    ],
    MultiEdit: [
      "📝 Maximum 3 related files",
      "🔗 Changes must be tightly coupled",
      "📋 Each file should have minimal changes",
      "🚫 Don't mix unrelated improvements",
    ],
  };

  return guidance[operationType] || guidance["Write"];
}

// Hook logic
async function scopeLimiter(input) {
  const operationType = input.tool || "Write";
  const filePath = input.file_path || input.filePath || "";

  // Analyze request scope
  const scopeAnalysis = analyzeScope(input, operationType);
  const fileCheck = checkFileCount(input, operationType);
  const complexityCheck = checkContentComplexity(input, operationType);

  // Collect all scope issues
  const issues = [];

  if (scopeAnalysis.hasIssues) {
    issues.push(...scopeAnalysis.issues.map((i) => i.issue));
  }

  if (fileCheck.exceeded) {
    issues.push(`Too many files: ${fileCheck.count}/${fileCheck.limit}`);
  }

  if (complexityCheck.tooComplex) {
    issues.push(
      `Too complex: ${complexityCheck.score}/${complexityCheck.limit} complexity score`,
    );
  }

  // If there are scope issues, block the operation
  if (issues.length > 0) {
    const guidance = generateScopeGuidance(operationType);

    let message = `🎯 Scope too broad for ${operationType} operation\n\n`;

    message += `❌ Issues detected:\n`;
    issues.forEach((issue) => {
      message += `   • ${issue}\n`;
    });

    message += `\n✅ Please scope down your request:\n`;
    guidance.forEach((guide) => {
      message += `   ${guide}\n`;
    });

    // Add specific suggestions from scope analysis
    if (scopeAnalysis.hasIssues) {
      message += `\n💡 Specific suggestions:\n`;
      scopeAnalysis.issues.forEach(({ suggestion }) => {
        message += `   • ${suggestion}\n`;
      });
    }

    // Show good patterns if found
    if (scopeAnalysis.goodPatterns.length > 0) {
      message += `\n✨ Good scope patterns found: ${scopeAnalysis.goodPatterns.join(", ")}`;
    }

    message += `\n\n📖 See ai/prompts/templates/focused-task.md for examples`;

    return { block: true, message };
  }

  return { allow: true };
}

// Run the hook
const runner = new HookRunner("scope-limiter", { timeout: 2000 });
runner.run(scopeLimiter);

module.exports = {
  analyzeScope,
  checkFileCount,
  checkContentComplexity,
  SCOPE_CREEP_PATTERNS,
  FILE_LIMITS,
  scopeLimiter,
};
