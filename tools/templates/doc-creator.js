#!/usr/bin/env node
/**
 * Documentation Creator CLI
 *
 * Creates new documentation files from ProjectTemplate templates.
 * Provides interactive interface for selecting templates and customizing content.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Logger utility
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
};

const TEMPLATE_TYPES = {
  readme: {
    name: "README",
    template: "templates/documentation/project/README.md",
    description: "Main project documentation",
    defaultName: "README.md",
  },
  feature: {
    name: "Feature",
    template: "templates/documentation/feature/FEATURE.md",
    description: "Feature specification and implementation guide",
    defaultName: "feature-name.md",
  },
  api: {
    name: "API",
    template: "templates/documentation/api/API.md",
    description: "API reference documentation",
    defaultName: "api-reference.md",
  },
  guide: {
    name: "Guide",
    template: "templates/documentation/guide/GUIDE.md",
    description: "Step-by-step guide or tutorial",
    defaultName: "setup-guide.md",
  },
  report: {
    name: "Report",
    template: "templates/documentation/report/ANALYSIS-TEMPLATE.md",
    description: "Technical analysis or audit report",
    defaultName: "analysis-report.md",
  },
  plan: {
    name: "Plan",
    template: "templates/documentation/plan/PLAN-TEMPLATE.md",
    description: "Project plan or implementation roadmap",
    defaultName: "implementation-plan.md",
  },
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function validateTemplateExists(templatePath) {
  if (!fs.existsSync(templatePath)) {
    logger.error(`❌ Template not found: ${templatePath}`);
    logger.error("💡 Run: npm run doc:templates to see available templates");
    return false;
  }
  return true;
}

function validateDestinationPath(destPath) {
  const destDir = path.dirname(destPath);

  if (!fs.existsSync(destDir)) {
    try {
      fs.mkdirSync(destDir, { recursive: true });
      logger.info(`📁 Created directory: ${destDir}`);
    } catch (error) {
      logger.error(`❌ Cannot create directory: ${destDir}`);
      logger.error(`   Error: ${error.message}`);
      return false;
    }
  }

  if (fs.existsSync(destPath)) {
    logger.error(`❌ File already exists: ${destPath}`);
    logger.error("💡 Choose a different name or remove the existing file");
    return false;
  }

  return true;
}

function replaceTemplatePlaceholders(content, replacements) {
  let result = content;

  // Apply user-provided replacements
  for (const [placeholder, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`\\{${placeholder}\\}`, "g");
    result = result.replace(pattern, value);
  }

  // Replace common placeholders with sensible defaults
  result = result.replace(
    /\{PROJECT_NAME\}/g,
    replacements.PROJECT_NAME || "Your Project",
  );
  result = result.replace(
    /\{PROJECT_DESCRIPTION\}/g,
    replacements.PROJECT_DESCRIPTION ||
      "A modern application built with best practices",
  );
  result = result.replace(
    /\{PROJECT_PURPOSE\}/g,
    replacements.PROJECT_PURPOSE ||
      "Solves specific technical challenges efficiently",
  );
  result = result.replace(
    /\{FEATURE_1\}/g,
    replacements.FEATURE_1 || "Core functionality implementation",
  );
  result = result.replace(
    /\{FEATURE_2\}/g,
    replacements.FEATURE_2 || "User interface and experience",
  );
  result = result.replace(
    /\{FEATURE_3\}/g,
    replacements.FEATURE_3 || "API and data management",
  );
  result = result.replace(
    /\{PRIMARY_LANGUAGE\}/g,
    replacements.PRIMARY_LANGUAGE || "TypeScript 5.0+",
  );
  result = result.replace(
    /\{FRAMEWORK\}/g,
    replacements.FRAMEWORK || "React 18.2+",
  );
  result = result.replace(
    /\{BUILD_TOOL\}/g,
    replacements.BUILD_TOOL || "Vite 4.3+",
  );
  result = result.replace(
    /\{PACKAGE_MANAGER\}/g,
    replacements.PACKAGE_MANAGER || "npm",
  );
  result = result.replace(
    /\{TESTING_FRAMEWORK\}/g,
    replacements.TESTING_FRAMEWORK || "Jest 29.5+",
  );

  // Legacy format support
  result = result.replace(
    /\[Project Name\]/g,
    replacements.projectName || "Your Project",
  );
  result = result.replace(
    /\[Feature Name\]/g,
    replacements.featureName || "New Feature",
  );
  result = result.replace(/\[API Name\]/g, replacements.apiName || "API");
  result = result.replace(/\[Topic Name\]/g, replacements.topicName || "Topic");
  result = result.replace(
    /\[Report Title\]/g,
    replacements.reportTitle || "Analysis Report",
  );

  // Replace date placeholders
  const today = new Date().toISOString().split("T")[0];
  result = result.replace(/\{DATE\}/g, today);
  result = result.replace(/\[Date\]/g, today);

  return result;
}

async function createDocumentInteractive() {
  logger.info("📝 ProjectTemplate Documentation Creator");
  logger.info("");

  // Show available templates
  logger.info("Available templates:");
  Object.entries(TEMPLATE_TYPES).forEach(([key, template]) => {
    logger.info(`  ${key.padEnd(8)} - ${template.description}`);
  });
  logger.info("");

  // Get template type
  let templateType;
  while (!templateType) {
    const input = await question("Select template type: ");
    if (TEMPLATE_TYPES[input]) {
      templateType = input;
    } else {
      logger.info(
        "❌ Invalid template type. Choose from: " +
          Object.keys(TEMPLATE_TYPES).join(", "),
      );
    }
  }

  const template = TEMPLATE_TYPES[templateType];

  // Validate template exists
  if (!validateTemplateExists(template.template)) {
    process.exit(1);
  }

  // Get document details
  const documentName =
    (await question(`Document name (${template.defaultName}): `)) ||
    template.defaultName;
  const destination = (await question(`Destination path (docs/): `)) || "docs/";

  const fullPath = path.join(destination, documentName);

  // Validate destination
  if (!validateDestinationPath(fullPath)) {
    process.exit(1);
  }

  // Get template-specific details
  const replacements = {};

  if (templateType === "readme") {
    replacements.projectName = await question("Project name: ");
    replacements.description = await question("Project description: ");
  } else if (templateType === "feature") {
    replacements.featureName = await question("Feature name: ");
  } else if (templateType === "api") {
    replacements.apiName = await question("API name: ");
  } else if (templateType === "guide") {
    replacements.topicName = await question("Guide topic: ");
  } else if (templateType === "report") {
    replacements.reportTitle = await question("Report title: ");
  } else if (templateType === "plan") {
    replacements.planTitle = await question("Plan title: ");
  }

  // Create document
  try {
    const templateContent = fs.readFileSync(template.template, "utf8");
    const customizedContent = replaceTemplatePlaceholders(
      templateContent,
      replacements,
    );

    fs.writeFileSync(fullPath, customizedContent);

    logger.info("");
    logger.info(`✅ Document created: ${fullPath}`);
    logger.info("");
    logger.info("Next steps:");
    logger.info(`1. Edit the document: ${fullPath}`);
    logger.info(`2. Validate: npm run doc:validate ${fullPath}`);
    logger.info(
      '3. Commit: git add . && git commit -m "docs: add new documentation"',
    );
  } catch (error) {
    logger.error(`❌ Error creating document: ${error.message}`);
    process.exit(1);
  }

  rl.close();
}

async function createDocumentCommand(templateType, options = {}) {
  const template = TEMPLATE_TYPES[templateType];

  if (!template) {
    logger.error(`❌ Unknown template type: ${templateType}`);
    logger.error("Available types: " + Object.keys(TEMPLATE_TYPES).join(", "));
    process.exit(1);
  }

  if (!validateTemplateExists(template.template)) {
    process.exit(1);
  }

  const documentName = options.name || template.defaultName;
  const destination = options.dest || "docs/";
  const fullPath = path.join(destination, documentName);

  if (!validateDestinationPath(fullPath)) {
    process.exit(1);
  }

  try {
    const templateContent = fs.readFileSync(template.template, "utf8");
    const replacements = options.replacements || {};
    const customizedContent = replaceTemplatePlaceholders(
      templateContent,
      replacements,
    );

    fs.writeFileSync(fullPath, customizedContent);

    logger.info(`✅ ${template.name} document created: ${fullPath}`);
    logger.info(`💡 Validate with: npm run doc:validate ${fullPath}`);
  } catch (error) {
    logger.error(`❌ Error creating document: ${error.message}`);
    process.exit(1);
  }
}

function showHelp() {
  logger.info("📝 ProjectTemplate Documentation Creator");
  logger.info("");
  logger.info("Usage:");
  logger.info("  npm run doc:create                    # Interactive mode");
  logger.info("  npm run doc:create:readme             # Create README");
  logger.info("  npm run doc:create:feature            # Create feature doc");
  logger.info("  npm run doc:create:api                # Create API doc");
  logger.info("  npm run doc:create:guide              # Create guide");
  logger.info("  npm run doc:create:report             # Create report");
  logger.info("  npm run doc:create:plan               # Create plan");
  logger.info("");
  logger.info("Options:");
  logger.info("  --name <filename>     Document filename");
  logger.info("  --dest <directory>    Destination directory");
  logger.info("  --help               Show this help");
  logger.info("");
  logger.info("Examples:");
  logger.info(
    "  npm run doc:create:feature -- --name user-auth.md --dest docs/features/",
  );
  logger.info("  npm run doc:create:api -- --name user-api.md");
  logger.info("");
  logger.info("Templates:");
  Object.entries(TEMPLATE_TYPES).forEach(([key, template]) => {
    logger.info(`  ${key.padEnd(8)} - ${template.description}`);
  });
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  let templateType = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      showHelp();
      process.exit(0);
    } else if (arg === "--type") {
      templateType = args[++i];
    } else if (arg === "--name") {
      options.name = args[++i];
    } else if (arg === "--dest") {
      options.dest = args[++i];
    } else if (arg.startsWith("--type=")) {
      templateType = arg.split("=")[1];
    } else if (arg.startsWith("--name=")) {
      options.name = arg.split("=")[1];
    } else if (arg.startsWith("--dest=")) {
      options.dest = arg.split("=")[1];
    }
  }

  return { templateType, options };
}

// Main execution
async function main() {
  const { templateType, options } = parseArgs();

  if (templateType) {
    await createDocumentCommand(templateType, options);
  } else {
    await createDocumentInteractive();
  }
}

// Handle CLI execution
if (require.main === module) {
  main().catch((error) => {
    logger.error("❌ Error:", error.message);
    process.exit(1);
  });
}

module.exports = {
  createDocumentCommand,
  TEMPLATE_TYPES,
  replaceTemplatePlaceholders,
};
