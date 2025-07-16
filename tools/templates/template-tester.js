#!/usr/bin/env node

/**
 * Documentation Template Tester
 *
 * Tests the documentation template system by:
 * - Validating template files exist and are well-formed
 * - Testing template generation functionality
 * - Verifying template placeholders work correctly
 * - Checking template compliance enforcement
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Import template functions
const {
  createDocumentCommand,
  TEMPLATE_TYPES,
  replaceTemplatePlaceholders,
} = require("./doc-creator");

// Logger utility
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  debug: (msg) => console.log(`🔍 ${msg}`),
};

/**
 * Main testing function
 */
async function main() {
  logger.info("🧪 Documentation Template System Tester");
  logger.info("");

  const results = {
    templateFiles: 0,
    templateFilesPassed: 0,
    placeholderTests: 0,
    placeholderTestsPassed: 0,
    generationTests: 0,
    generationTestsPassed: 0,
    enforcementTests: 0,
    enforcementTestsPassed: 0,
  };

  // Test 1: Template file validation
  logger.info("🔍 Testing template files...");
  await testTemplateFiles(results);

  // Test 2: Placeholder replacement
  logger.info("🔍 Testing placeholder replacement...");
  await testPlaceholderReplacement(results);

  // Test 3: Template generation
  logger.info("🔍 Testing template generation...");
  await testTemplateGeneration(results);

  // Test 4: Enforcement system
  logger.info("🔍 Testing enforcement system...");
  await testEnforcementSystem(results);

  // Report results
  reportResults(results);
}

/**
 * Test that all template files exist and are well-formed
 */
async function testTemplateFiles(results) {
  for (const [templateType, config] of Object.entries(TEMPLATE_TYPES)) {
    results.templateFiles++;

    const templatePath = path.join(process.cwd(), config.template);

    if (!fs.existsSync(templatePath)) {
      logger.error(`Template file missing: ${templatePath}`);
      continue;
    }

    const content = fs.readFileSync(templatePath, "utf8");

    // Basic validation
    const issues = [];

    // Must have a title
    if (!content.match(/^#\s+/m)) {
      issues.push("Missing main title (# Header)");
    }

    // Must have placeholders
    if (!content.includes("{") && !content.includes("[")) {
      issues.push("No placeholders found");
    }

    // Must have substantial content
    if (content.length < 500) {
      issues.push(`Too short (${content.length} chars)`);
    }

    // Must have proper markdown structure
    const headers = content.match(/^#+/gm);
    if (!headers || headers.length < 3) {
      issues.push("Insufficient header structure");
    }

    if (issues.length === 0) {
      results.templateFilesPassed++;
      logger.success(`${templateType} template valid`);
    } else {
      logger.error(`${templateType} template issues: ${issues.join(", ")}`);
    }
  }
}

/**
 * Test placeholder replacement functionality
 */
async function testPlaceholderReplacement(results) {
  const testReplacements = {
    PROJECT_NAME: "Test Project",
    PROJECT_DESCRIPTION: "A test project for validation",
    FEATURE_NAME: "Test Feature",
    API_NAME: "Test API",
    DATE: "2024-01-15",
  };

  for (const [templateType, config] of Object.entries(TEMPLATE_TYPES)) {
    results.placeholderTests++;

    const templatePath = path.join(process.cwd(), config.template);

    if (!fs.existsSync(templatePath)) {
      logger.warn(`Skipping ${templateType} - template file missing`);
      continue;
    }

    const content = fs.readFileSync(templatePath, "utf8");
    const processedContent = replaceTemplatePlaceholders(
      content,
      testReplacements,
    );

    // Check that placeholders were replaced
    const remainingPlaceholders = processedContent.match(/\{[A-Z_]+\}/g);
    const unreplacedCount = remainingPlaceholders
      ? remainingPlaceholders.length
      : 0;

    // Some placeholders are expected to remain (template-specific ones)
    const originalPlaceholders = content.match(/\{[A-Z_]+\}/g);
    const originalCount = originalPlaceholders
      ? originalPlaceholders.length
      : 0;

    if (originalCount === 0) {
      logger.warn(`${templateType} has no placeholders to test`);
      results.placeholderTestsPassed++;
    } else if (unreplacedCount < originalCount) {
      logger.success(
        `${templateType} placeholders working (${originalCount - unreplacedCount}/${originalCount} replaced)`,
      );
      results.placeholderTestsPassed++;
    } else {
      logger.error(`${templateType} placeholder replacement failed`);
    }
  }
}

/**
 * Test template generation functionality
 */
async function testTemplateGeneration(results) {
  const testDir = path.join(process.cwd(), "test-templates");

  // Create test directory
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  for (const [templateType, config] of Object.entries(TEMPLATE_TYPES)) {
    results.generationTests++;

    const testFileName = `test-${templateType}.md`;
    const testFilePath = path.join(testDir, testFileName);

    // Clean up any existing test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    try {
      // Test document creation
      await createDocumentCommand(templateType, {
        name: testFileName,
        dest: testDir,
        replacements: {
          projectName: "Test Project",
          featureName: "Test Feature",
          apiName: "Test API",
          reportTitle: "Test Report",
          planTitle: "Test Plan",
        },
      });

      // Verify file was created
      if (fs.existsSync(testFilePath)) {
        const generatedContent = fs.readFileSync(testFilePath, "utf8");

        // Basic validation of generated content
        const issues = [];

        if (!generatedContent.match(/^#\s+/m)) {
          issues.push("Missing main title");
        }

        if (generatedContent.length < 300) {
          issues.push("Generated content too short");
        }

        if (issues.length === 0) {
          results.generationTestsPassed++;
          logger.success(`${templateType} generation successful`);
        } else {
          logger.error(
            `${templateType} generation issues: ${issues.join(", ")}`,
          );
        }
      } else {
        logger.error(`${templateType} generation failed - file not created`);
      }
    } catch (error) {
      logger.error(`${templateType} generation error: ${error.message}`);
    }
  }

  // Clean up test directory
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

/**
 * Test enforcement system using actual hook functions
 */
async function testEnforcementSystem(results) {
  const testCases = [
    {
      name: "Valid README",
      content:
        "# Test Project\n\n## Purpose\n\nThis is a test project for validation.\n\n## Installation\n\nInstall instructions here with proper detail.\n\n## Usage\n\nUsage instructions with examples.\n\n## Features\n\n- Feature 1 with description\n- Feature 2 with description\n\n## Development\n\nDevelopment info with proper content.\n\n## Testing\n\nTesting info with comprehensive details.",
      fileName: "README.md",
      shouldPass: true,
    },
    {
      name: "Invalid README - missing sections",
      content: "# Test Project\n\nThis is a test.",
      fileName: "README.md",
      shouldPass: false,
    },
    {
      name: "Invalid - unreplaced placeholders",
      content:
        "# {PROJECT_NAME}\n\n## Purpose\n\n{PROJECT_DESCRIPTION}\n\n## Installation\n\nInstall instructions.\n\n## Usage\n\nUsage instructions.\n\n## Features\n\n- Feature 1\n- Feature 2\n\n## Development\n\nDevelopment info.\n\n## Testing\n\nTesting info.",
      fileName: "README.md",
      shouldPass: false,
    },
    {
      name: "Invalid - no headers",
      content: "This is just text without any headers.",
      fileName: "README.md",
      shouldPass: false,
    },
    {
      name: "Invalid - professional standards",
      content:
        "# Test Project\n\nTODO: Write this document\n\n## Purpose\n\nThis document describes the project.\n\n## Installation\n\nInstall instructions.\n\n## Usage\n\nUsage instructions.\n\n## Features\n\n- Feature 1\n- Feature 2\n\n## Development\n\nDevelopment info.\n\n## Testing\n\nTesting info.",
      fileName: "README.md",
      shouldPass: false,
    },
  ];

  for (const testCase of testCases) {
    results.enforcementTests++;

    try {
      // Import hook functions directly
      const {
        enforceDocumentation,
        determineDocumentType,
      } = require("../hooks/cleanup/docs-enforcer");

      const {
        enforceDocumentationTemplate,
      } = require("../hooks/validation/doc-template-enforcer");

      // Create hook data format
      const hookData = {
        filePath: testCase.fileName,
        file_path: testCase.fileName,
        content: testCase.content,
        new_string: testCase.content,
      };

      // Mock runner
      const mockRunner = {
        formatError: (title, ...details) => `${title}: ${details.join(" ")}`,
        matchesPatterns: (text, patterns) => {
          return patterns.some((pattern) => pattern.test(text));
        },
      };

      // Test both hooks
      const docsResult = enforceDocumentation(hookData, mockRunner);
      const templateResult = enforceDocumentationTemplate(hookData, mockRunner);

      // File passes if both hooks allow it
      const passed =
        docsResult.allow !== false && templateResult.allow !== false;

      if (passed === testCase.shouldPass) {
        results.enforcementTestsPassed++;
        logger.success(
          `${testCase.name} - enforcement ${testCase.shouldPass ? "passed" : "blocked"} correctly`,
        );
      } else {
        logger.error(
          `${testCase.name} - enforcement ${passed ? "passed" : "blocked"} incorrectly (expected ${testCase.shouldPass ? "pass" : "block"})`,
        );
        if (docsResult.message) {
          logger.debug(`  Docs message: ${docsResult.message}`);
        }
        if (templateResult.message) {
          logger.debug(`  Template message: ${templateResult.message}`);
        }
      }
    } catch (error) {
      logger.error(
        `${testCase.name} - enforcement test error: ${error.message}`,
      );
    }
  }
}

/**
 * Report test results
 */
function reportResults(results) {
  logger.info("");
  logger.info("📊 Test Results Summary");
  logger.info("");

  const categories = [
    {
      name: "Template Files",
      passed: results.templateFilesPassed,
      total: results.templateFiles,
    },
    {
      name: "Placeholder Tests",
      passed: results.placeholderTestsPassed,
      total: results.placeholderTests,
    },
    {
      name: "Generation Tests",
      passed: results.generationTestsPassed,
      total: results.generationTests,
    },
    {
      name: "Enforcement Tests",
      passed: results.enforcementTestsPassed,
      total: results.enforcementTests,
    },
  ];

  let allPassed = true;

  for (const category of categories) {
    const percentage =
      category.total > 0
        ? Math.round((category.passed / category.total) * 100)
        : 0;
    const status = category.passed === category.total ? "✅" : "❌";

    logger.info(
      `${status} ${category.name}: ${category.passed}/${category.total} (${percentage}%)`,
    );

    if (category.passed !== category.total) {
      allPassed = false;
    }
  }

  logger.info("");

  if (allPassed) {
    logger.success("All tests passed! 🎉");
    logger.info("Documentation template system is working correctly.");
  } else {
    logger.error("Some tests failed! 🚨");
    logger.info("Please review the issues above and fix the template system.");
    process.exit(1);
  }
}

/**
 * Show usage information
 */
function showUsage() {
  logger.info("🧪 Documentation Template System Tester");
  logger.info("");
  logger.info("Tests the complete documentation template system including:");
  logger.info("- Template file validation");
  logger.info("- Placeholder replacement");
  logger.info("- Template generation");
  logger.info("- Enforcement system");
  logger.info("");
  logger.info("Usage:");
  logger.info("  npm run doc:test-templates");
  logger.info("");
}

// Handle command line execution
if (require.main === module) {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showUsage();
    process.exit(0);
  }

  main().catch((error) => {
    logger.error(`Template testing failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testTemplateFiles,
  testPlaceholderReplacement,
  testTemplateGeneration,
  testEnforcementSystem,
  reportResults,
};
