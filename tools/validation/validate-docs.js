#!/usr/bin/env node

/**
 * Comprehensive Documentation Validation Script
 *
 * This script validates all documentation files to ensure they meet
 * the template requirements and quality standards.
 *
 * Usage:
 *   node tools/validation/validate-docs.js
 *   npm run validate:docs
 */

const fs = require("fs");
const path = require("path");

// Import the hook functions directly
const {
  enforceDocumentation,
  TEMPLATE_REQUIREMENTS,
  determineDocumentType,
} = require("../hooks/cleanup/docs-enforcer");

const {
  enforceDocumentationTemplate,
  TEMPLATE_VALIDATION,
} = require("../hooks/validation/doc-template-enforcer");

const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
};

/**
 * Enhanced document type detection
 */
function enhancedDocumentTypeDetection(fileName, filePath, content) {
  // Use the existing function first
  let docType = determineDocumentType(fileName, filePath);

  if (docType) {
    return docType;
  }

  // Enhanced detection based on content patterns
  if (content) {
    // Check for README-like patterns
    if (content.includes("## Installation") && content.includes("## Usage")) {
      return "readme";
    }

    // Check for API documentation patterns
    if (
      content.includes("## Endpoints") ||
      content.includes("## Authentication")
    ) {
      return "api";
    }

    // Check for feature documentation patterns
    if (
      content.includes("## Implementation") &&
      content.includes("## Testing")
    ) {
      return "feature";
    }

    // Check for guide patterns
    if (content.includes("## Prerequisites") || content.includes("## Step")) {
      return "guide";
    }

    // Check for report patterns
    if (
      content.includes("## Executive Summary") ||
      content.includes("## Analysis")
    ) {
      return "report";
    }

    // Check for plan patterns
    if (content.includes("## Timeline") || content.includes("## Resources")) {
      return "plan";
    }
  }

  // Default to guide for documentation files
  if (filePath.includes("docs/") || fileName.includes("doc")) {
    return "guide";
  }

  // For any markdown file that doesn't match patterns, default to guide
  // This ensures all markdown files get validated rather than skipped
  return "guide";
}

/**
 * Validate a single documentation file
 */
function validateDocFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { passed: false, error: "File not found" };
  }

  const content = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath, ".md").toLowerCase();
  const docType = enhancedDocumentTypeDetection(fileName, filePath, content);

  const result = {
    file: filePath,
    docType,
    passed: true,
    issues: [],
    warnings: [],
  };

  // Skip validation for unknown document types
  if (!docType) {
    result.warnings.push("Unknown document type - validation skipped");
    return result;
  }

  // Log for debugging (remove in production)
  // console.log(`Validating ${fileName} as ${docType}`);

  // Create hook data format
  const hookData = {
    filePath: filePath,
    file_path: filePath,
    content: content,
    new_string: content,
    // Override the determineDocumentType function to use our enhanced detection
    _overrideDocType: docType,
  };

  // Mock runner
  const mockRunner = {
    formatError: (title, ...details) => `${title}: ${details.join(" ")}`,
    matchesPatterns: (text, patterns) => {
      return patterns.some((pattern) => pattern.test(text));
    },
  };

  // Run documentation enforcement manually since the hooks use their own document type detection
  const templateRequirements = TEMPLATE_REQUIREMENTS[docType];
  if (templateRequirements) {
    // Check for unreplaced placeholders
    const placeholderPatterns = [
      /\{[A-Z_]+\}/g,
      /\[Project Name\]/g,
      /\[Feature Name\]/g,
      /\[API Name\]/g,
      /\[Date\]/g,
    ];

    const foundPlaceholders = [];
    placeholderPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        foundPlaceholders.push(...matches);
      }
    });

    if (foundPlaceholders.length > 0) {
      result.passed = false;
      result.issues.push({
        type: "documentation",
        message: `Template placeholders must be replaced: ${foundPlaceholders.slice(0, 5).join(", ")}`,
      });
    }

    // Check for required headers
    const missingHeaders = [];
    templateRequirements.requiredHeaders.forEach((header) => {
      const headerPattern = new RegExp(`^#+\\s*${header}`, "im");
      if (!headerPattern.test(content)) {
        missingHeaders.push(header);
      }
    });

    if (missingHeaders.length > 0) {
      result.passed = false;
      result.issues.push({
        type: "documentation",
        message: `Document missing required headers: ${missingHeaders.join(", ")}`,
      });
    }

    // Check for minimum content
    if (content.length < 500) {
      result.passed = false;
      result.issues.push({
        type: "documentation",
        message: `Document content too minimal (${content.length} chars, needs 500+)`,
      });
    }
  }

  // Run template enforcement from doc-template-enforcer
  const templateValidation = TEMPLATE_VALIDATION.requiredPatterns[docType];
  if (templateValidation) {
    const missingPatterns = [];
    templateValidation.forEach((pattern) => {
      if (!pattern.test(content)) {
        missingPatterns.push(pattern.toString());
      }
    });

    if (missingPatterns.length > 0) {
      result.passed = false;
      result.issues.push({
        type: "template",
        message: `Missing required ${docType} sections: ${missingPatterns.slice(0, 3).join(", ")}`,
      });
    }
  }

  return result;
}

/**
 * Find all markdown files in the project
 */
function findMarkdownFiles() {
  const files = [];

  // Important root files
  const rootFiles = [
    "README.md",
    "CLAUDE.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "SETUP.md",
    "QUICK-START.md",
  ];

  rootFiles.forEach((file) => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      files.push(fullPath);
    }
  });

  // Documentation directory
  const docsDir = path.join(process.cwd(), "docs");
  if (fs.existsSync(docsDir)) {
    files.push(...findMarkdownInDir(docsDir));
  }

  return files;
}

/**
 * Recursively find markdown files in a directory
 */
function findMarkdownInDir(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findMarkdownInDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main validation function
 */
function main() {
  logger.info("📝 Comprehensive Documentation Validation");
  logger.info("");

  const files = findMarkdownFiles();

  if (files.length === 0) {
    logger.warn("No documentation files found");
    return;
  }

  logger.info(`Found ${files.length} documentation files to validate`);
  logger.info("");

  const results = [];
  let totalIssues = 0;

  for (const file of files) {
    const result = validateDocFile(file);
    results.push(result);

    const fileName = path.basename(file);

    if (result.passed) {
      logger.success(`${fileName} - ${result.docType || "unknown"}`);
    } else {
      logger.error(`${fileName} - ${result.issues.length} issues`);
      totalIssues += result.issues.length;

      // Show first few issues
      result.issues.slice(0, 2).forEach((issue) => {
        logger.error(`  [${issue.type}] ${issue.message.split("\n")[0]}`);
      });
    }

    // Show warnings
    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) => {
        logger.warn(`  ${warning}`);
      });
    }
  }

  logger.info("");
  logger.info("📊 Validation Summary");
  logger.info(`Total files: ${files.length}`);
  logger.success(`Passed: ${results.filter((r) => r.passed).length}`);

  if (totalIssues > 0) {
    logger.error(`Failed: ${results.filter((r) => !r.passed).length}`);
    logger.error(`Total issues: ${totalIssues}`);
    logger.info("");
    logger.info("💡 Run with --verbose for detailed issue descriptions");
    logger.info("💡 Use templates: npm run doc:create");
    process.exit(1);
  } else {
    logger.success("All documentation files passed validation!");
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateDocFile,
  enhancedDocumentTypeDetection,
  findMarkdownFiles,
};
