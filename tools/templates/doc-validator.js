#!/usr/bin/env node

/**
 * Documentation Template Validator
 *
 * CLI wrapper around the Claude Code hook system for documentation validation.
 * Uses the exact same validation logic as the hooks to ensure consistency.
 */

const fs = require("fs");
const path = require("path");

// Import hook functions directly - single source of truth
const {
  enforceDocumentation,
  determineDocumentType,
  TEMPLATE_REQUIREMENTS,
} = require("../hooks/cleanup/docs-enforcer");

const {
  enforceDocumentationTemplate,
  TEMPLATE_VALIDATION,
} = require("../hooks/validation/doc-template-enforcer");

// Command line arguments
const args = process.argv.slice(2);
const options = {
  all: args.includes("--all"),
  strict: args.includes("--strict"),
  verbose: args.includes("--verbose"),
  file: args.find((arg) => !arg.startsWith("--")),
};

// Logger utility
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  debug: (msg) => options.verbose && console.log(`🔍 ${msg}`),
};

/**
 * Main validation function
 */
async function main() {
  logger.info("📝 Documentation Template Validator");
  logger.info("");

  if (options.file) {
    await validateSingleFile(options.file);
  } else if (options.all) {
    await validateAllDocumentation();
  } else {
    await validateDocsDirectory();
  }
}

/**
 * Validate a single documentation file
 */
async function validateSingleFile(filePath) {
  logger.info(`Validating: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    logger.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const result = await validateDocumentationFile(filePath);
  reportValidationResult(filePath, result);
}

/**
 * Validate all documentation in docs/ directory
 */
async function validateDocsDirectory() {
  logger.info("Validating docs/ directory");

  const docsPath = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsPath)) {
    logger.warn("No docs/ directory found - skipping validation");
    return;
  }

  const files = findMarkdownFiles(docsPath);
  await validateFiles(files);
}

/**
 * Validate all documentation files in the project
 */
async function validateAllDocumentation() {
  logger.info("Validating all documentation files");

  const files = [
    ...findMarkdownFiles(path.join(process.cwd(), "docs")),
    ...findRootMarkdownFiles(),
  ];

  await validateFiles(files);
}

/**
 * Validate an array of files
 */
async function validateFiles(files) {
  if (files.length === 0) {
    logger.warn("No documentation files found");
    return;
  }

  logger.info(`Found ${files.length} documentation files`);
  logger.info("");

  const results = [];
  for (const file of files) {
    const result = await validateDocumentationFile(file);
    results.push({ file, result });
  }

  // Report summary
  reportValidationSummary(results);
}

/**
 * Validate a single documentation file using the hook system
 */
async function validateDocumentationFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath, ".md").toLowerCase();
  const docType = determineDocumentType(fileName, filePath);

  const result = {
    file: filePath,
    docType,
    passed: true,
    issues: [],
    warnings: [],
    stats: {
      wordCount: content.split(/\s+/).length,
      charCount: content.length,
      headerCount: (content.match(/^#+/gm) || []).length,
      codeBlockCount: (content.match(/```/g) || []).length / 2,
    },
  };

  // Skip validation for unknown document types
  if (!docType) {
    result.warnings.push("Unknown document type - template validation skipped");
    return result;
  }

  // Create hook data format that matches Claude Code's expectations
  const hookData = {
    filePath: filePath,
    file_path: filePath,
    content: content,
    new_string: content,
  };

  // Mock runner that captures hook messages
  const mockRunner = {
    formatError: (title, ...details) => `${title}: ${details.join(" ")}`,
    matchesPatterns: (text, patterns) => {
      return patterns.some((pattern) => pattern.test(text));
    },
  };

  // Run documentation enforcement hook (docs-enforcer.js)
  try {
    const docsResult = enforceDocumentation(hookData, mockRunner);
    if (docsResult.block) {
      result.passed = false;
      result.issues.push({
        type: "documentation",
        message: docsResult.message,
      });
    }
  } catch (error) {
    result.passed = false;
    result.issues.push({
      type: "docs-enforcer-error",
      message: `Documentation enforcement error: ${error.message}`,
    });
  }

  // Run template enforcement hook (doc-template-enforcer.js)
  try {
    const templateResult = enforceDocumentationTemplate(hookData, mockRunner);
    if (templateResult.block) {
      result.passed = false;
      result.issues.push({
        type: "template",
        message: templateResult.message,
      });
    }
  } catch (error) {
    result.passed = false;
    result.issues.push({
      type: "template-enforcer-error",
      message: `Template enforcement error: ${error.message}`,
    });
  }

  return result;
}

/**
 * Report validation result for a single file
 */
function reportValidationResult(filePath, result) {
  const fileName = path.basename(filePath);

  if (result.passed) {
    logger.success(`${fileName} passed validation`);
    if (result.docType) {
      logger.info(`  Document type: ${result.docType}`);
      logger.info(`  Word count: ${result.stats.wordCount}`);
      logger.info(`  Headers: ${result.stats.headerCount}`);
      logger.info(`  Code blocks: ${result.stats.codeBlockCount}`);
    }
  } else {
    logger.error(`${fileName} failed validation`);

    result.issues.forEach((issue) => {
      logger.error(`  [${issue.type}] ${issue.message}`);
    });
  }

  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      logger.warn(`  ${warning}`);
    });
  }

  logger.info("");
}

/**
 * Report validation summary for multiple files
 */
function reportValidationSummary(results) {
  const totalFiles = results.length;
  const passedFiles = results.filter((r) => r.result.passed).length;
  const failedFiles = totalFiles - passedFiles;

  logger.info("📊 Validation Summary");
  logger.info(`Total files: ${totalFiles}`);
  logger.success(`Passed: ${passedFiles}`);

  if (failedFiles > 0) {
    logger.error(`Failed: ${failedFiles}`);

    logger.info("");
    logger.info("Failed files:");
    results
      .filter((r) => !r.result.passed)
      .forEach(({ file, result }) => {
        logger.error(
          `  ${path.basename(file)}: ${result.issues.length} issues`,
        );
        if (options.verbose) {
          result.issues.forEach((issue) => {
            logger.error(`    [${issue.type}] ${issue.message}`);
          });
        }
      });
  }

  // Exit with error code if any files failed
  if (failedFiles > 0) {
    process.exit(1);
  }
}

/**
 * Find all markdown files in a directory
 */
function findMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Find markdown files in the root directory
 */
function findRootMarkdownFiles() {
  const rootDir = process.cwd();
  const files = [];

  // Important root markdown files
  const rootFiles = [
    "README.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "SETUP.md",
    "QUICK-START.md",
    "CLAUDE.md",
  ];

  for (const file of rootFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      files.push(filePath);
    }
  }

  return files;
}

/**
 * Show usage information
 */
function showUsage() {
  logger.info("📝 Documentation Template Validator");
  logger.info("");
  logger.info("Usage:");
  logger.info(
    "  npm run doc:validate [file]           # Validate specific file or docs/ directory",
  );
  logger.info(
    "  npm run doc:validate:all              # Validate all documentation files",
  );
  logger.info(
    "  npm run doc:validate:strict           # Strict validation with all checks",
  );
  logger.info("");
  logger.info("Options:");
  logger.info("  --all       Validate all documentation files");
  logger.info("  --strict    Enable strict validation");
  logger.info("  --verbose   Show detailed output");
  logger.info("");
  logger.info("Examples:");
  logger.info("  npm run doc:validate docs/guides/setup.md");
  logger.info("  npm run doc:validate -- --all --verbose");
}

// Handle command line execution
if (require.main === module) {
  if (args.includes("--help") || args.includes("-h")) {
    showUsage();
    process.exit(0);
  }

  main().catch((error) => {
    logger.error(`Validation failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  validateDocumentationFile,
  validateFiles,
  validateAllDocumentation,
  findMarkdownFiles,
  findRootMarkdownFiles,
};
