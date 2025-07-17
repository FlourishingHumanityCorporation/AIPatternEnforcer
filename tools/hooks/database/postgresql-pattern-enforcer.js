#!/usr/bin/env node

/**
 * PostgreSQL Pattern Enforcer Hook
 *
 * Validates PostgreSQL database patterns per CLAUDE.md tech stack:
 * - PostgreSQL (Neon) + Prisma + pgvector for local development
 * - Performance and security best practices
 */

const HookRunner = require("../lib/HookRunner");
const FileAnalyzer = require("../lib/FileAnalyzer");

class PostgreSQLPatternEnforcer extends HookRunner {
  constructor() {
    super("postgresql-pattern-enforcer");
  }

  async validateContent(content, filePath) {
    if (!FileAnalyzer.isCodeFile(filePath)) {
      return this.allow();
    }

    if (!this.containsPostgreSQLPatterns(content)) {
      return this.allow();
    }

    const issues = [];

    this.checkConnectionPatterns(content, issues);
    this.checkQueryPatterns(content, issues);
    this.checkNeonPatterns(content, issues);
    this.checkPrismaIntegrationPatterns(content, issues);
    this.checkPerformancePatterns(content, issues);
    this.checkSecurityPatterns(content, issues);

    if (issues.length > 0) {
      return this.block(issues.join("\n"));
    }

    return this.allow();
  }

  containsPostgreSQLPatterns(content) {
    const patterns = [
      /postgresql|postgres/i,
      /DATABASE_URL/,
      /neon\.tech/i,
      /prisma/i,
      /\.query\s*\(/,
      /SELECT|INSERT|UPDATE|DELETE|CREATE/i,
      /pgvector/i,
      /embedding/i,
      /vector/i,
      /pg\.|postgres\./,
    ];

    return patterns.some((pattern) => pattern.test(content));
  }

  checkConnectionPatterns(content, issues) {
    const connectionPatterns = [
      {
        pattern: /DATABASE_URL\s*=\s*['"]postgresql[^'"]*['"](?![^'"]*ssl)/i,
        message: "PostgreSQL connection string without SSL",
        suggestion:
          "Add SSL for security: postgresql://user:pass@host/db?ssl=true",
      },
      {
        pattern: /neon\.tech[^?]*(?!\?)/,
        message: "Neon connection without query parameters",
        suggestion: "Add connection parameters: ?ssl=true&connection_limit=10",
      },
      {
        pattern: /process\.env\.DATABASE_URL(?!\s*\|\|)/,
        message: "No fallback for DATABASE_URL",
        suggestion: 'Add fallback: process.env.DATABASE_URL || "fallback-url"',
      },
    ];

    connectionPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkQueryPatterns(content, issues) {
    const queryPatterns = [
      {
        pattern: /SELECT\s+\*\s+FROM/gi,
        message: "Using SELECT * instead of specific columns",
        suggestion: "Select specific columns: SELECT id, name FROM table",
      },
      {
        pattern: /\.query\s*\(\s*['"][^'"]*\$\{[^}]*\}[^'"]*['"]/g,
        message: "String interpolation in SQL queries (injection risk)",
        suggestion:
          'Use parameterized queries: query("SELECT * FROM users WHERE id = $1", [userId])',
      },
      {
        pattern: /for\s*\([^)]*\)\s*\{[^}]*\.query\s*\(/gs,
        message: "N+1 query pattern in loop",
        suggestion: "Use batch queries or JOIN operations instead",
      },
    ];

    queryPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkNeonPatterns(content, issues) {
    const neonPatterns = [
      {
        pattern: /neon\.tech.*(?!.*pooled)/i,
        message: "Using direct Neon connection instead of pooled",
        suggestion: "Use pooled connection endpoint for better performance",
      },
      {
        pattern: /idle_in_transaction_session_timeout/,
        message: "Manual transaction timeout with Neon",
        suggestion: "Neon handles timeouts automatically in serverless",
      },
    ];

    neonPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkPrismaIntegrationPatterns(content, issues) {
    const prismaPatterns = [
      {
        pattern: /prisma\.[^.]*\.findMany\(\s*\)/g,
        message: "Prisma findMany without pagination",
        suggestion: "Add pagination: findMany({ take: 10, skip: 0 })",
      },
      {
        pattern: /for\s*\([^)]*\)\s*\{[^}]*prisma\.[^.]*\.create/gis,
        message: "Prisma create operations in loop",
        suggestion:
          "Use createMany for bulk operations: createMany({ data: [...] })",
      },
      {
        pattern: /\$queryRaw\s*\`[^`]*\$\{[^}]*\}[^`]*\`/g,
        message: "Raw query with template literal interpolation",
        suggestion: "Use parameterized raw queries",
      },
    ];

    prismaPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkPerformancePatterns(content, issues) {
    const performancePatterns = [
      {
        pattern: /ORDER\s+BY\s+[^L]*(?!LIMIT)/gi,
        message: "ORDER BY without LIMIT clause",
        suggestion: "Add LIMIT: ORDER BY column LIMIT 100",
      },
      {
        pattern: /COUNT\s*\(\s*\*\s*\)/gi,
        message: "COUNT(*) can be slow on large tables",
        suggestion: "Consider COUNT(1) or estimated counts",
      },
      {
        pattern: /CREATE\s+INDEX(?!\s+CONCURRENTLY)/gi,
        message: "Creating index without CONCURRENTLY",
        suggestion: "Use CREATE INDEX CONCURRENTLY to avoid blocking",
      },
    ];

    performancePatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkSecurityPatterns(content, issues) {
    const securityPatterns = [
      {
        pattern: /\.query\s*\(\s*['"][^'"]*\+[^'"]*['"]/g,
        message: "SQL string concatenation (injection risk)",
        suggestion:
          'Use parameterized queries: query("SELECT * FROM users WHERE name = $1", [name])',
      },
      {
        pattern: /password\s*=\s*['"][^'"]*['"](?!\s*process\.env)/i,
        message: "Hardcoded database password",
        suggestion: "Use environment variables: process.env.DATABASE_PASSWORD",
      },
      {
        pattern: /DROP\s+TABLE(?!\s+IF\s+EXISTS)/gi,
        message: "DROP TABLE without IF EXISTS",
        suggestion: "Use DROP TABLE IF EXISTS for safety",
      },
    ];

    securityPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }
}

if (require.main === module) {
  const enforcer = new PostgreSQLPatternEnforcer();
  enforcer.run(async (data) => {
    const { content = "", file_path = "" } = data;
    return await enforcer.validateContent(content, file_path);
  });
}

module.exports = PostgreSQLPatternEnforcer;
