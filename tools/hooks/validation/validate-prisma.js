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

// Neon-specific patterns for PostgreSQL + pgvector
const NEON_PATTERNS = {
  requiredForNeon: {
    pattern: /provider\s*=\s*["']postgresql["']/,
    message: "Neon requires PostgreSQL provider",
  },
  connectionPooling: {
    pattern: /DATABASE_URL/,
    message: "Use Neon connection pooling for serverless",
  },
  pgvectorExtension: {
    pattern:
      /generator\s+client\s*{[^}]*previewFeatures\s*=\s*\[[^\]]*["']postgresqlExtensions["'][^\]]*\]/,
    message: "Enable postgresqlExtensions for pgvector support",
  },
};

// Tech stack specific patterns
const TECH_STACK_PATTERNS = {
  vectorSupport: {
    pattern: /Unsupported\s*\("vector"\)/,
    message: "pgvector support for AI embeddings",
  },
  aiModels: {
    pattern: /model\s+(Document|Embedding|Vector|Chat|Message|User)/i,
    message: "AI application models detected",
  },
  timestamps: {
    pattern: /@updatedAt|@default\(now\(\)\)/,
    message: "Timestamp fields for AI application audit",
  },
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
  // Neon-specific issues
  {
    pattern: /provider\s*=\s*["']mysql["']|provider\s*=\s*["']sqlite["']/,
    check: () => true,
    warning: "Consider PostgreSQL provider for Neon compatibility",
  },
  {
    pattern: /url\s*=\s*["'][^"']*localhost[^"']*["']/,
    check: () => true,
    warning: "Use Neon connection string for production",
  },
  // pgvector specific
  {
    pattern: /vector\s*\(/,
    check: (match, content) => !content.includes('extensions = ["pgvector"]'),
    warning: "pgvector extension required for vector data types",
  },
  {
    pattern: /Unsupported\s*\("vector"\)/,
    check: (match, content) =>
      !content.includes('previewFeatures = ["postgresqlExtensions"]'),
    warning: "Enable postgresqlExtensions preview feature for pgvector",
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

  // Check for Neon-specific patterns
  checkNeonPatterns(actualContent, warnings);

  // Check for tech stack integration
  checkTechStackIntegration(actualContent, warnings);

  // Check for common issues
  for (const issue of COMMON_ISSUES) {
    const matches = actualContent.match(issue.pattern);
    if (matches) {
      for (const match of matches) {
        if (issue.check(match, actualContent)) {
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

/**
 * Check for Neon-specific patterns and recommendations
 */
function checkNeonPatterns(content, warnings) {
  // Check for PostgreSQL provider
  if (!NEON_PATTERNS.requiredForNeon.pattern.test(content)) {
    warnings.push("Consider using PostgreSQL provider for Neon compatibility");
  }

  // Check for pgvector extension setup
  if (
    content.includes("vector(") ||
    content.includes('Unsupported("vector")')
  ) {
    if (!content.includes('extensions = ["pgvector"]')) {
      warnings.push('Add pgvector extension: extensions = ["pgvector"]');
    }
    if (!content.includes('previewFeatures = ["postgresqlExtensions"]')) {
      warnings.push("Enable postgresqlExtensions preview feature for pgvector");
    }
  }

  // Check for Neon connection pattern
  if (content.includes('env("DATABASE_URL")')) {
    if (!content.includes("?")) {
      warnings.push(
        "Consider adding Neon connection parameters: ?ssl=true&connection_limit=10",
      );
    }
  }
}

/**
 * Check for tech stack integration patterns
 */
function checkTechStackIntegration(content, warnings) {
  // Check for AI application models
  if (TECH_STACK_PATTERNS.aiModels.pattern.test(content)) {
    // Suggest common AI application patterns
    if (!content.includes("createdAt") && !content.includes("updatedAt")) {
      warnings.push(
        "Consider adding timestamp fields for AI application audit trails",
      );
    }

    // Check for embedding models
    if (
      content.includes("model Embedding") ||
      content.includes("model Document")
    ) {
      if (!content.includes("vector(")) {
        warnings.push(
          'Consider adding vector field for embeddings: embedding Unsupported("vector")',
        );
      }
    }
  }

  // Check for user authentication patterns
  if (content.includes("model User")) {
    if (!content.includes("@unique") && !content.includes("@@unique")) {
      warnings.push(
        "Consider unique constraints for User model fields (email, etc.)",
      );
    }
  }

  // Check for proper indexing
  if (content.includes("model") && !content.includes("@@index")) {
    warnings.push("Consider adding database indexes for query performance");
  }
}

// Run the hook
// Create and run the hook
HookRunner.create("validate-prisma", validatePrisma, {
  timeout: 1500,
});

module.exports = {
  REQUIRED_SECTIONS,
  COMMON_ISSUES,
  NEON_PATTERNS,
  TECH_STACK_PATTERNS,
  validatePrisma,
};
