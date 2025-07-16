#!/usr/bin/env node

/**
 * Claude Code Hook: Documentation Template Enforcer
 *
 * Comprehensive markdown template validation that enforces:
 * - Template structure compliance
 * - Content quality standards
 * - Consistent documentation patterns
 * - Professional documentation standards
 *
 * This hook works alongside docs-enforcer.js to provide complete
 * documentation validation coverage.
 */

const HookRunner = require("../lib/HookRunner");
const path = require("path");
const fs = require("fs");

// Template validation patterns
const TEMPLATE_VALIDATION = {
  // Documentation quality standards
  minWordCount: {
    readme: 300,
    guide: 500,
    api: 400,
    feature: 600,
    report: 800,
    plan: 1000,
  },

  // Required content patterns
  requiredPatterns: {
    readme: [
      /## Installation/i,
      /## Usage/i,
      /## Features/i,
      /```/, // Must have code examples
    ],
    guide: [
      /## Step/i,
      /## Prerequisites/i,
      /```/, // Must have code examples
      /## Troubleshooting/i,
    ],
    api: [
      /## Authentication/i,
      /## Endpoints/i,
      /```json/i, // Must have JSON examples
      /## Error/i,
    ],
    feature: [
      /## Implementation/i,
      /## Testing/i,
      /## Usage/i,
      /```/, // Must have code examples
    ],
    report: [
      /## Executive Summary/i,
      /## Analysis/i,
      /## Recommendations/i,
      /## Implementation/i,
    ],
    plan: [/## Timeline/i, /## Resources/i, /## Risk/i, /## Implementation/i],
  },

  // Forbidden patterns in professional documentation
  forbiddenPatterns: [
    /TODO:/i,
    /FIXME:/i,
    /HACK:/i,
    /XXX:/i,
    /placeholder text/i,
    /lorem ipsum/i,
    /sample text/i,
    /test test/i,
    /asdf/i,
    /[Tt]his document describes/,
    /[Tt]his section provides/,
    /[Ii]mplemented!/,
    /[Ww]e are pleased to announce/,
  ],

  // Required link patterns
  requiredLinks: {
    readme: [
      /(docs\/|\.md)/i, // Must link to other documentation
    ],
    guide: [
      /(docs\/|\.md)/i, // Must link to related guides
    ],
    api: [
      /(example|demo|postman|swagger)/i, // Must link to examples
    ],
  },
};

// Professional writing standards
const WRITING_STANDARDS = {
  // Minimum section length (characters)
  minSectionLength: 100,

  // Maximum consecutive empty lines
  maxEmptyLines: 2,

  // Required punctuation
  requirePunctuation: true,

  // Consistent formatting
  consistentHeaders: true,

  // Code block requirements
  codeBlockLanguages: true,
};

/**
 * Main template enforcement function
 */
function enforceDocumentationTemplate(hookData, runner) {
  const filePath = hookData.filePath || hookData.file_path || "";

  // Only process markdown files
  if (!filePath.endsWith(".md")) {
    return { allow: true };
  }

  const content = hookData.content || hookData.new_string || "";
  if (!content) {
    return { allow: true };
  }

  const fileName = path.basename(filePath, ".md").toLowerCase();
  const docType = determineDocumentType(fileName, filePath);

  // Skip if not a templated document type
  if (!docType) {
    return { allow: true };
  }

  // Validate template structure
  const structureViolation = validateTemplateStructure(
    content,
    docType,
    filePath,
    runner,
  );
  if (structureViolation.block) {
    return structureViolation;
  }

  // Validate content quality
  const qualityViolation = validateContentQuality(
    content,
    docType,
    filePath,
    runner,
  );
  if (qualityViolation.block) {
    return qualityViolation;
  }

  // Validate writing standards
  const writingViolation = validateWritingStandards(content, filePath, runner);
  if (writingViolation.block) {
    return writingViolation;
  }

  // Validate professional standards
  const professionalViolation = validateProfessionalStandards(
    content,
    filePath,
    runner,
  );
  if (professionalViolation.block) {
    return professionalViolation;
  }

  return { allow: true };
}

/**
 * Determine document type from filename and path
 */
function determineDocumentType(fileName, filePath) {
  // Direct filename matches
  if (fileName.includes("readme")) return "readme";
  if (fileName.includes("guide")) return "guide";
  if (fileName.includes("api")) return "api";
  if (fileName.includes("feature")) return "feature";
  if (fileName.includes("analysis") || fileName.includes("report"))
    return "report";
  if (fileName.includes("plan")) return "plan";

  // Path-based detection
  if (filePath.includes("docs/guides/")) return "guide";
  if (filePath.includes("docs/api/")) return "api";
  if (filePath.includes("docs/features/")) return "feature";
  if (filePath.includes("docs/reports/")) return "report";
  if (filePath.includes("docs/plans/")) return "plan";

  return null;
}

/**
 * Validate template structure compliance
 */
function validateTemplateStructure(content, docType, filePath, runner) {
  const requiredPatterns = TEMPLATE_VALIDATION.requiredPatterns[docType] || [];
  const missingPatterns = [];

  requiredPatterns.forEach((pattern) => {
    if (!pattern.test(content)) {
      missingPatterns.push(pattern.toString());
    }
  });

  if (missingPatterns.length > 0) {
    const message = runner.formatError(
      `Template structure validation failed`,
      `❌ ${path.basename(filePath)} missing required ${docType} sections`,
      `✅ Add these required sections:`,
      `   ${missingPatterns.slice(0, 3).join(", ")}`,
      `📖 Use template: npm run doc:create:${docType}`,
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Validate content quality standards
 */
function validateContentQuality(content, docType, filePath, runner) {
  const minWords = TEMPLATE_VALIDATION.minWordCount[docType] || 200;
  const wordCount = content
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  if (wordCount < minWords) {
    const message = runner.formatError(
      `Documentation content insufficient`,
      `❌ ${path.basename(filePath)} has ${wordCount} words, needs ${minWords}`,
      `✅ Provide comprehensive documentation with substantial content`,
      `📖 Follow ${docType} template structure for guidance`,
      `Use template: npm run doc:create:${docType}`,
    );

    return {
      block: true,
      message,
    };
  }

  // Check for code examples in technical documentation
  const technicalDocs = ["readme", "guide", "api", "feature"];
  if (technicalDocs.includes(docType)) {
    const codeBlocks = content.match(/```/g);
    if (!codeBlocks || codeBlocks.length < 2) {
      const message = runner.formatError(
        `Technical documentation missing code examples`,
        `❌ ${path.basename(filePath)} needs code examples for ${docType}`,
        `✅ Add code blocks with examples: \`\`\`language\ncode\n\`\`\``,
        `📖 Technical docs must include practical examples`,
        `Use template: npm run doc:create:${docType}`,
      );

      return {
        block: true,
        message,
      };
    }
  }

  return { allow: true };
}

/**
 * Validate writing standards
 */
function validateWritingStandards(content, filePath, runner) {
  // Check for excessive empty lines
  const emptyLineMatches = content.match(/\n\s*\n\s*\n\s*\n/g);
  if (emptyLineMatches && emptyLineMatches.length > 0) {
    const message = runner.formatError(
      `Excessive empty lines in documentation`,
      `❌ ${path.basename(filePath)} has too many consecutive empty lines`,
      `✅ Use maximum 2 empty lines for section separation`,
      `📖 Maintain clean, readable formatting`,
      `Format consistently throughout document`,
    );

    return {
      block: true,
      message,
    };
  }

  // Check for code blocks without language specification
  const codeBlocksWithoutLang = content.match(/```\s*\n/g);
  if (codeBlocksWithoutLang && codeBlocksWithoutLang.length > 0) {
    const message = runner.formatError(
      `Code blocks missing language specification`,
      `❌ ${path.basename(filePath)} has ${codeBlocksWithoutLang.length} code blocks without language`,
      `✅ Specify language for syntax highlighting: \`\`\`javascript`,
      `📖 Improves readability and accessibility`,
      `Common languages: javascript, typescript, bash, json, markdown`,
    );

    return {
      block: true,
      message,
    };
  }

  // Check for inconsistent header formatting
  const headers = content.match(/^#+\s*.+$/gm);
  if (headers) {
    const inconsistentHeaders = headers.filter((header) => {
      // Check for missing space after #
      if (header.match(/^#+[^\s]/)) return true;
      // Check for trailing spaces
      if (header.match(/\s+$/)) return true;
      return false;
    });

    if (inconsistentHeaders.length > 0) {
      const message = runner.formatError(
        `Inconsistent header formatting`,
        `❌ ${path.basename(filePath)} has ${inconsistentHeaders.length} incorrectly formatted headers`,
        `✅ Use consistent format: # Header Title (space after #)`,
        `📖 Remove trailing spaces from headers`,
        `Examples: # Main Title, ## Section Title`,
      );

      return {
        block: true,
        message,
      };
    }
  }

  return { allow: true };
}

/**
 * Validate professional standards
 */
function validateProfessionalStandards(content, filePath, runner) {
  // Check for forbidden patterns
  const forbiddenPatterns = TEMPLATE_VALIDATION.forbiddenPatterns;
  const violations = [];

  forbiddenPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      violations.push(...matches.slice(0, 2)); // Limit to 2 examples
    }
  });

  if (violations.length > 0) {
    const message = runner.formatError(
      `Unprofessional content patterns detected`,
      `❌ ${path.basename(filePath)} contains unprofessional patterns`,
      `✅ Replace with professional, timeless language:`,
      `   ${violations.join(", ")}`,
      `📖 Use direct, technical language without announcements`,
    );

    return {
      block: true,
      message,
    };
  }

  // Check for very short sections
  const sections = content.split(/^#+\s/m);
  const shortSections = sections.filter((section) => {
    const trimmed = section.trim();
    return (
      trimmed.length > 0 && trimmed.length < WRITING_STANDARDS.minSectionLength
    );
  });

  if (shortSections.length > 2) {
    const message = runner.formatError(
      `Documentation sections too brief`,
      `❌ ${path.basename(filePath)} has ${shortSections.length} very short sections`,
      `✅ Provide substantial content for each section (min ${WRITING_STANDARDS.minSectionLength} chars)`,
      `📖 Comprehensive documentation requires detailed explanations`,
      `Use template: npm run doc:create for guidance`,
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Helper function to get template path for document type
 */
function getTemplatePath(docType) {
  const templatePaths = {
    readme: "templates/documentation/project/README.md",
    guide: "templates/documentation/guide/GUIDE.md",
    api: "templates/documentation/api/API.md",
    feature: "templates/documentation/feature/FEATURE.md",
    report: "templates/documentation/report/ANALYSIS-TEMPLATE.md",
    plan: "templates/documentation/plan/PLAN-TEMPLATE.md",
  };

  return templatePaths[docType] || null;
}

/**
 * Check if template file exists
 */
function templateExists(docType) {
  const templatePath = getTemplatePath(docType);
  return templatePath && fs.existsSync(templatePath);
}

// Create and run the hook only when executed directly (not when imported)
if (require.main === module) {
  HookRunner.create("doc-template-enforcer", enforceDocumentationTemplate, {
    timeout: 3000,
  });
}

module.exports = {
  TEMPLATE_VALIDATION,
  WRITING_STANDARDS,
  enforceDocumentationTemplate,
  determineDocumentType,
  validateTemplateStructure,
  validateContentQuality,
  validateWritingStandards,
  validateProfessionalStandards,
  getTemplatePath,
  templateExists,
};
