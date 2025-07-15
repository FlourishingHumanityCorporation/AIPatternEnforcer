#!/usr/bin/env node

/**
 * Claude Code Hook: Architecture Validator (Consolidated)
 *
 * Validates architectural patterns and AI integration. Consolidates 3 previous hooks:
 * - ai-integration-validator.js - AI API usage patterns
 * - architecture-drift-detector.js - Architectural consistency
 * - enforce-nextjs-structure.js - Next.js App Router structure
 */

const HookRunner = require("./lib/HookRunner");
const path = require("path");

// Next.js App Router structure patterns
const NEXTJS_PATTERNS = {
  appRouter: /^app\//,
  pagesRouter: /^pages\//,
  components: /^components\//,
  lib: /^lib\//,
  api: /^(app\/api|pages\/api)\//,
};

// AI integration patterns
const AI_PATTERNS = {
  openai: /openai|gpt-|chat|completion/i,
  anthropic: /anthropic|claude/i,
  streaming: /stream|chunk|delta/i,
  embedding: /embed|vector|similarity/i,
};

// Architecture anti-patterns
const ANTI_PATTERNS = {
  mixedRouters: {
    pattern: /(app\/.*page\.(js|ts|jsx|tsx))|(pages\/.*\.(js|ts|jsx|tsx))/,
    description: "Don't mix App Router and Pages Router",
  },
  badApiStructure: {
    pattern: /api.*\.(jsx|tsx)$/,
    description: "API routes should use .js or .ts extensions",
  },
  componentInPages: {
    pattern: /pages\/.*component/i,
    description: "Components should be in components/ directory",
  },
};

/**
 * Hook logic function - validates architectural patterns
 * @param {Object} hookData - Parsed and standardized hook data
 * @param {HookRunner} runner - Hook runner instance for utilities
 * @returns {Object} Hook result
 */
function validateArchitecture(hookData, runner) {
  // Allow operations without file paths
  if (!hookData.hasFilePath()) {
    return { allow: true };
  }

  const filePath = hookData.filePath || hookData.file_path;
  const content = hookData.content || hookData.new_string || "";
  const fileName = path.basename(filePath);

  // 1. Validate Next.js App Router structure
  const nextjsValidation = validateNextjsStructure(filePath, fileName, runner);
  if (nextjsValidation.block) {
    return nextjsValidation;
  }

  // 2. Validate AI integration patterns
  const aiValidation = validateAiIntegration(content, filePath, runner);
  if (aiValidation.block) {
    return aiValidation;
  }

  // 3. Validate general architecture patterns
  const architectureValidation = validateGeneralArchitecture(
    filePath,
    content,
    runner,
  );
  if (architectureValidation.block) {
    return architectureValidation;
  }

  return { allow: true };
}

/**
 * Validate Next.js App Router structure
 */
function validateNextjsStructure(filePath, fileName, runner) {
  // Check for mixed router usage
  if (ANTI_PATTERNS.mixedRouters.pattern.test(filePath)) {
    const isAppRouter = filePath.startsWith("app/");
    const isPagesRouter = filePath.startsWith("pages/");

    // Don't enforce this strictly, just warn for now
    if (isAppRouter && fileName.includes("page.")) {
      // This is correct App Router usage
      return { allow: true };
    }
  }

  // Check for bad API structure
  if (ANTI_PATTERNS.badApiStructure.pattern.test(filePath)) {
    const message = runner.formatError(
      `API routes should use .js or .ts extensions`,
      `❌ ${fileName} uses React component extension`,
      `✅ Rename to ${fileName.replace(/\.jsx?|\.tsx?/, ".ts")}`,
      `API routes return JSON, not JSX components`,
    );

    return {
      block: true,
      message,
    };
  }

  // Check for components in wrong directories
  if (ANTI_PATTERNS.componentInPages.pattern.test(filePath)) {
    const message = runner.formatError(
      `Components should be in components/ directory`,
      `❌ ${fileName} appears to be a component in pages/`,
      `✅ Move to components/ directory`,
      `Maintain clear separation between pages and reusable components`,
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Validate AI integration patterns
 */
function validateAiIntegration(content, filePath, runner) {
  if (!content) return { allow: true };

  // Only validate AI patterns in code files, not documentation
  const codeFileExtensions = [".js", ".ts", ".jsx", ".tsx"];
  const isCodeFile = codeFileExtensions.some((ext) => filePath.endsWith(ext));

  if (!isCodeFile) {
    // Skip AI validation for documentation, config, and other non-code files
    return { allow: true };
  }

  // Check for proper AI API usage in code files
  if (AI_PATTERNS.openai.test(content) || AI_PATTERNS.anthropic.test(content)) {
    // Check for missing error handling
    if (!content.includes("try") && !content.includes("catch")) {
      const message = runner.formatError(
        `AI API calls should include error handling`,
        `❌ Missing try/catch blocks for AI operations`,
        `✅ Add proper error handling for API failures`,
        `AI APIs can fail - always handle errors gracefully`,
      );

      return {
        block: true,
        message,
      };
    }

    // Check for streaming without proper cleanup
    if (AI_PATTERNS.streaming.test(content) && !content.includes("finally")) {
      console.warn(
        `⚠️  Streaming AI operations should include cleanup in finally block`,
      );
    }
  }

  return { allow: true };
}

/**
 * Validate general architecture patterns
 */
function validateGeneralArchitecture(filePath, content, runner) {
  // Check for barrel exports (index.js files) in wrong places
  if (
    path.basename(filePath) === "index.js" ||
    path.basename(filePath) === "index.ts"
  ) {
    const dir = path.dirname(filePath);

    // Barrel exports are fine in lib/, components/, hooks/
    if (!dir.match(/\b(lib|components|hooks|utils)\b/)) {
      console.warn(`⚠️  Consider if barrel export is needed in ${dir}/`);
    }
  }

  // Check for proper TypeScript usage
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    if (content && content.includes("any")) {
      console.warn(
        `⚠️  Avoid 'any' type for better type safety in ${path.basename(filePath)}`,
      );
    }
  }

  return { allow: true };
}

// Create and run the hook
HookRunner.create("architecture-validator", validateArchitecture, {
  timeout: 3000,
});

module.exports = {
  NEXTJS_PATTERNS,
  AI_PATTERNS,
  ANTI_PATTERNS,
  validateArchitecture,
  validateNextjsStructure,
  validateAiIntegration,
  validateGeneralArchitecture,
};
