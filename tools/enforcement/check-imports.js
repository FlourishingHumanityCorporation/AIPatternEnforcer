#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const glob = require("glob");

// Patterns for checking imports
const importPatterns = {
  // Absolute imports that should be relative
  absoluteImports: /from\s+['"](?![@./])[^'"]+['"]/g,

  // Wildcard imports
  wildcardImports: /import\s+\*\s+as\s+\w+\s+from/g,

  // Default imports from libraries that don't have them
  problematicDefaults: [
    {
      pattern: /import\s+React\s+from\s+['"]react['"]/,
      correct: "import * as React from 'react'",
    },
    {
      pattern: /import\s+lodash\s+from\s+['"]lodash['"]/,
      correct:
        "import * as _ from 'lodash' or import { specific } from 'lodash'",
    },
  ],

  // Banned imports
  bannedImports: [
    {
      pattern: /import.*from\s+['"]fs['"]/,
      message: "Use fs/promises instead of fs for async operations",
    },
    {
      pattern: /console\.(log|error|warn)/,
      message: "Use projectLogger instead of console",
    },
  ],

  // Circular dependency check patterns
  parentImports: /from\s+['"]\.\.[\/\.].*['"]/g,
};

// Check a single file for import issues
function checkFile(filePath, content) {
  const violations = [];
  const lines = content.split("\n");

  // Check for absolute imports in src files (but allow library imports)
  if (filePath.includes("/src/") || filePath.includes("/components/")) {
    const absoluteMatches = content.match(importPatterns.absoluteImports) || [];
    absoluteMatches.forEach((match) => {
      // Extract the module name
      const moduleMatch = match.match(/from\s+['"]([^'"]+)['"]/);
      if (moduleMatch) {
        const moduleName = moduleMatch[1];
        // Skip if it's a library import (no dots or slashes)
        if (!moduleName.includes("/") && !moduleName.startsWith(".")) {
          return; // This is a library import, allow it
        }
      }

      // Skip node_modules and valid absolute imports
      if (!match.includes("node_modules") && !match.includes("@/")) {
        const lineNum = lines.findIndex((line) => line.includes(match)) + 1;
        violations.push({
          type: "Absolute Import",
          file: filePath,
          line: lineNum,
          issue: match,
          suggestion: "Use relative imports for project files",
        });
      }
    });
  }

  // Check for wildcard imports (except allowed ones)
  const wildcardMatches = content.match(importPatterns.wildcardImports) || [];
  wildcardMatches.forEach((match) => {
    // Allow common wildcard patterns
    if (!match.includes("React") && !match.includes("lodash")) {
      // Allow wildcards for VS Code extensions
      if (
        filePath.includes("extensions/") &&
        (match.includes("vscode") ||
          match.includes("path") ||
          match.includes("fs"))
      ) {
        return;
      }
      const lineNum = lines.findIndex((line) => line.includes(match)) + 1;
      violations.push({
        type: "Wildcard Import",
        file: filePath,
        line: lineNum,
        issue: match,
        suggestion: "Import specific items instead of using wildcard",
      });
    }
  });

  // Check for problematic default imports
  importPatterns.problematicDefaults.forEach(({ pattern, correct }) => {
    if (pattern.test(content)) {
      const match = content.match(pattern)[0];
      const lineNum = lines.findIndex((line) => line.includes(match)) + 1;
      violations.push({
        type: "Problematic Default Import",
        file: filePath,
        line: lineNum,
        issue: match,
        suggestion: correct,
      });
    }
  });

  // Check for banned imports
  importPatterns.bannedImports.forEach(({ pattern, message }) => {
    // Skip console checks for enforcement tools and dev scripts
    if (
      pattern.toString().includes("console") &&
      (filePath.includes("tools/enforcement/") ||
        filePath.includes("tools/generators/") ||
        filePath.includes("scripts/dev/"))
    ) {
      return;
    }

    const matches = content.match(pattern) || [];
    matches.forEach((match) => {
      const lineNum = lines.findIndex((line) => line.includes(match)) + 1;
      violations.push({
        type: "Banned Import/Usage",
        file: filePath,
        line: lineNum,
        issue: match,
        suggestion: message,
      });
    });
  });

  // Check for too many parent directory traversals (potential circular deps)
  const parentMatches = content.match(importPatterns.parentImports) || [];
  parentMatches.forEach((match) => {
    const parentCount = (match.match(/\.\.\//g) || []).length;
    if (parentCount > 2) {
      const lineNum = lines.findIndex((line) => line.includes(match)) + 1;
      violations.push({
        type: "Deep Parent Import",
        file: filePath,
        line: lineNum,
        issue: match,
        suggestion: "Consider restructuring to avoid deep parent imports",
      });
    }
  });

  return violations;
}

// Main function
async function checkImports(specificFiles = []) {
  const filesToCheck =
    specificFiles.length > 0
      ? specificFiles
      : glob.sync("**/*.{js,jsx,ts,tsx}", {
          ignore: [
            "node_modules/**",
            "dist/**",
            "build/**",
            ".next/**",
            "coverage/**",
            "extensions/*/node_modules/**",
            "extensions/*/out/**",
            "ai/examples/**", // Examples show patterns, including anti-patterns
            "examples/**", // Example projects have their own patterns
            "**/*.d.ts", // Type definition files
            "**/*.min.js", // Minified files
          ],
        });

  let allViolations = [];

  for (const file of filesToCheck) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const violations = checkFile(file, content);
      allViolations = allViolations.concat(violations);
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }

  if (allViolations.length > 0) {
    console.error(chalk.red.bold("\n❌ Found import violations:\n"));

    // Group by type
    const byType = allViolations.reduce((acc, v) => {
      if (!acc[v.type]) acc[v.type] = [];
      acc[v.type].push(v);
      return acc;
    }, {});

    Object.entries(byType).forEach(([type, violations]) => {
      console.error(chalk.yellow.bold(`${type}:`));
      violations.forEach((v) => {
        console.error(chalk.white(`  ${v.file}:${v.line}`));
        console.error(chalk.gray(`    Issue: ${v.issue}`));
        console.error(chalk.cyan(`    Fix: ${v.suggestion}`));
      });
      console.error("");
    });

    console.error(chalk.cyan.bold("📚 Import Best Practices:"));
    console.error(chalk.white("  - Use relative imports for project files"));
    console.error(chalk.white("  - Import specific functions/components"));
    console.error(chalk.white("  - Use path aliases (@/) for deep imports"));
    console.error(chalk.white("  - Avoid circular dependencies\n"));

    process.exit(1);
  } else {
    if (!specificFiles || specificFiles.length === 0) {
      console.log(chalk.green("✅ All imports are valid!"));
    }
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const files = args.filter((arg) => !arg.startsWith("-"));

  checkImports(files).catch((error) => {
    console.error(chalk.red("Error checking imports:"), error);
    process.exit(1);
  });
}

module.exports = { checkImports };
