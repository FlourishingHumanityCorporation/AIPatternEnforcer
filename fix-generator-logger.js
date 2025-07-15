#!/usr/bin/env node

/**
 * Emergency fix script for logger issues in generators
 * This fixes the critical showstoppers identified
 */

const fs = require("fs");
const path = require("path");

// Simple logger for console output
const logger = console;

const fixes = [
  {
    file: "tools/generators/enhanced-component-generator.js",
    search:
      'const fs = require("fs").promises;\nconst path = require("path");\nconst { program } = require("commander");\nconst Handlebars = require("handlebars");\nconst chalk = require("chalk");\nconst inquirer = require("inquirer");',
    replace:
      'const fs = require("fs").promises;\nconst path = require("path");\nconst { program } = require("commander");\nconst Handlebars = require("handlebars");\nconst chalk = require("chalk");\nconst inquirer = require("inquirer");\n\n// Simple logger for console output\nconst logger = console;',
  },
  {
    file: "tools/generators/project-init/create-project.js",
    search: 'const fs = require("fs").promises;\nconst path = require("path");',
    replace:
      'const fs = require("fs").promises;\nconst path = require("path");\n\n// Simple logger for console output\nconst logger = console;',
  },
];

async function applyFixes() {
  logger.info("🔧 Applying critical generator fixes...");

  for (const fix of fixes) {
    try {
      const filePath = path.join(__dirname, fix.file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, "utf8");

        // Only apply fix if logger is not already defined
        if (!content.includes("const logger = console;")) {
          content = content.replace(fix.search, fix.replace);
          fs.writeFileSync(filePath, content);
          logger.info(`✅ Fixed ${fix.file}`);
        } else {
          logger.info(`⚠️  ${fix.file} already has logger defined`);
        }
      } else {
        logger.info(`❌ File not found: ${fix.file}`);
      }
    } catch (error) {
      logger.error(`❌ Error fixing ${fix.file}:`, error.message);
    }
  }

  logger.info("\n🎯 Generator fixes applied! You can now run:");
  logger.info("   npm run g:c TestComponent");
  logger.info("   npm run onboard");
}

applyFixes();
