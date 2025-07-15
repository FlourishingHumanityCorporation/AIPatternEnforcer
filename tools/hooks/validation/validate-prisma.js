#!/usr/bin/env node

/**
 * Claude Code Hook: Validate Prisma Schema
 *
 * Performs basic validation on Prisma schema files to catch common AI mistakes.
 * Checks for required sections and basic syntax.
 *
 * Usage: Called by Claude Code after Write/Edit operations on schema.prisma
 * Returns: { status: 'ok' | 'warning', message?: string }
 */

const fs = require("fs");
const {
  HookRunner,
  FileAnalyzer,
  PatternLibrary,
  ErrorFormatter,
} = require("../lib");

// Required sections in a Prisma schema
const REQUIRED_SECTIONS = {
  "generator client": "Prisma Client generator",
  "datasource db": "Database connection",
};

// Common mistakes to detect
const COMMON_ISSUES = [
  {
    pattern: /model\s+\w+\s*{[^}]*}/g,
    check: (match) => !match.includes("@@map"),
    warning: "Models without @@map annotations may cause issues",
  },
  {
    pattern: /String\s*@id/g,
    check: () => true,
    warning: "Consider using cuid() for String @id fields",
  },
];

// Hook logic
async function validatePrisma(input) {
  const { filePath, content } = input;

  // Only process schema.prisma files
  if (!filePath.endsWith("schema.prisma")) {
    return { allow: true };
  }

  // Get content from input or read from file
  let actualContent = content;

  // If no content in input, try reading from file
  if (!actualContent && fs.existsSync(filePath)) {
    actualContent = fs.readFileSync(filePath, "utf8");
  }

  // Skip if no content available
  if (!actualContent) {
    return { allow: true };
  }

  const warnings = [];

  // Check for required sections
  for (const [section, description] of Object.entries(REQUIRED_SECTIONS)) {
    if (!actualContent.includes(section)) {
      warnings.push(`Missing ${description} (${section})`);
    }
  }

  // Check for common issues
  for (const issue of COMMON_ISSUES) {
    const matches = actualContent.match(issue.pattern);
    if (matches) {
      for (const match of matches) {
        if (issue.check(match)) {
          warnings.push(issue.warning);
          break; // Only warn once per issue type
        }
      }
    }
  }

  // Additional basic syntax checks
  if (actualContent.includes("model") && !actualContent.includes("{")) {
    warnings.push("Models must have field definitions in braces");
  }

  if (actualContent.includes("enum") && !actualContent.includes("{")) {
    warnings.push("Enums must have value definitions in braces");
  }

  // Report warnings if any
  if (warnings.length > 0) {
    // PostToolUse hooks show stdout in transcript mode
    process.stdout.write(
      `⚠️ Prisma schema validation:\n${warnings.map((w) => `  • ${w}`).join("\n")}\n\n` +
        `💡 These are suggestions, not blocking issues.\n` +
        `📖 See Prisma docs for best practices.\n`,
    );
  } else {
    // No issues found
    process.stdout.write("✅ Prisma schema looks good\n");
  }

  return { allow: true };
}

// Run the hook
// Create and run the hook
HookRunner.create("validate-prisma", validatePrisma, {
  timeout: 1500,
});

module.exports = { REQUIRED_SECTIONS, COMMON_ISSUES, validatePrisma };
