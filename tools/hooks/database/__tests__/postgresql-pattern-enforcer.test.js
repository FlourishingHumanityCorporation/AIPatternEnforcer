const PostgreSQLPatternEnforcer = require("../postgresql-pattern-enforcer");

describe("PostgreSQLPatternEnforcer", () => {
  let enforcer;
  let originalEnv;

  beforeEach(() => {
    enforcer = new PostgreSQLPatternEnforcer();
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("containsPostgreSQLPatterns", () => {
    it("should detect PostgreSQL patterns", () => {
      const content = "postgresql://user:pass@host/db";
      expect(enforcer.containsPostgreSQLPatterns(content)).toBe(true);
    });

    it("should detect DATABASE_URL", () => {
      const content = "DATABASE_URL=postgresql://localhost/db";
      expect(enforcer.containsPostgreSQLPatterns(content)).toBe(true);
    });

    it("should detect Neon patterns", () => {
      const content = "neon.tech connection string";
      expect(enforcer.containsPostgreSQLPatterns(content)).toBe(true);
    });

    it("should detect Prisma patterns", () => {
      const content = "prisma.user.findMany()";
      expect(enforcer.containsPostgreSQLPatterns(content)).toBe(true);
    });

    it("should detect SQL queries", () => {
      const content = "SELECT * FROM users";
      expect(enforcer.containsPostgreSQLPatterns(content)).toBe(true);
    });

    it("should detect pgvector patterns", () => {
      const content = "pgvector embedding search";
      expect(enforcer.containsPostgreSQLPatterns(content)).toBe(true);
    });

    it("should return false for non-PostgreSQL content", () => {
      const content = 'console.log("hello world");';
      expect(enforcer.containsPostgreSQLPatterns(content)).toBe(false);
    });
  });

  describe("checkConnectionPatterns", () => {
    it("should flag PostgreSQL connection without SSL", () => {
      const content = 'DATABASE_URL="postgresql://user:pass@host/db"';
      const issues = [];
      enforcer.checkConnectionPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("PostgreSQL connection string without SSL");
    });

    it("should flag Neon connection without query parameters", () => {
      const content = "neon.tech/db";
      const issues = [];
      enforcer.checkConnectionPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Neon connection without query parameters");
    });

    it("should flag DATABASE_URL without fallback", () => {
      const content = "const db = process.env.DATABASE_URL";
      const issues = [];
      enforcer.checkConnectionPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("No fallback for DATABASE_URL");
    });

    it("should not flag proper SSL connection", () => {
      const content = 'DATABASE_URL="postgresql://user:pass@host/db?ssl=true"';
      const issues = [];
      enforcer.checkConnectionPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag DATABASE_URL with fallback", () => {
      const content = 'const db = process.env.DATABASE_URL || "fallback"';
      const issues = [];
      enforcer.checkConnectionPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkQueryPatterns", () => {
    it("should flag SELECT * queries", () => {
      const content = "SELECT * FROM users";
      const issues = [];
      enforcer.checkQueryPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using SELECT * instead of specific columns");
    });

    it("should flag string interpolation in queries", () => {
      const content = "query(`SELECT * FROM users WHERE id = ${userId}`)";
      const issues = [];
      enforcer.checkQueryPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("String interpolation in SQL queries");
    });

    it("should flag N+1 query patterns", () => {
      const content =
        'for (const user of users) { await query("SELECT * FROM posts WHERE user_id = $1", [user.id]); }';
      const issues = [];
      enforcer.checkQueryPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("N+1 query pattern in loop");
    });

    it("should not flag specific column selection", () => {
      const content = "SELECT id, name FROM users";
      const issues = [];
      enforcer.checkQueryPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag parameterized queries", () => {
      const content = 'query("SELECT * FROM users WHERE id = $1", [userId])';
      const issues = [];
      enforcer.checkQueryPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkNeonPatterns", () => {
    it("should flag direct Neon connection", () => {
      const content = "neon.tech/database";
      const issues = [];
      enforcer.checkNeonPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain(
        "Using direct Neon connection instead of pooled",
      );
    });

    it("should flag manual transaction timeout", () => {
      const content = "idle_in_transaction_session_timeout = 300";
      const issues = [];
      enforcer.checkNeonPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Manual transaction timeout with Neon");
    });

    it("should not flag pooled connection", () => {
      const content = "neon.tech/database?pooled=true";
      const issues = [];
      enforcer.checkNeonPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkPrismaIntegrationPatterns", () => {
    it("should flag findMany without pagination", () => {
      const content = "prisma.user.findMany()";
      const issues = [];
      enforcer.checkPrismaIntegrationPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Prisma findMany without pagination");
    });

    it("should flag create operations in loop", () => {
      const content =
        "for (const user of users) { await prisma.user.create({ data: user }); }";
      const issues = [];
      enforcer.checkPrismaIntegrationPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Prisma create operations in loop");
    });

    it("should flag raw query with template literal interpolation", () => {
      const content =
        "prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`";
      const issues = [];
      enforcer.checkPrismaIntegrationPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain(
        "Raw query with template literal interpolation",
      );
    });

    it("should not flag findMany with pagination", () => {
      const content = "prisma.user.findMany({ take: 10, skip: 0 })";
      const issues = [];
      enforcer.checkPrismaIntegrationPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag createMany for bulk operations", () => {
      const content = "prisma.user.createMany({ data: users })";
      const issues = [];
      enforcer.checkPrismaIntegrationPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkPerformancePatterns", () => {
    it("should flag ORDER BY without LIMIT", () => {
      const content = "SELECT * FROM users ORDER BY name";
      const issues = [];
      enforcer.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("ORDER BY without LIMIT clause");
    });

    it("should flag COUNT(*) usage", () => {
      const content = "SELECT COUNT(*) FROM users";
      const issues = [];
      enforcer.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("COUNT(*) can be slow on large tables");
    });

    it("should flag CREATE INDEX without CONCURRENTLY", () => {
      const content = "CREATE INDEX idx_name ON users(name)";
      const issues = [];
      enforcer.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Creating index without CONCURRENTLY");
    });

    it("should not flag ORDER BY with LIMIT", () => {
      const content = "SELECT * FROM users ORDER BY name LIMIT 10";
      const issues = [];
      enforcer.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag COUNT(1)", () => {
      const content = "SELECT COUNT(1) FROM users";
      const issues = [];
      enforcer.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag CREATE INDEX CONCURRENTLY", () => {
      const content = "CREATE INDEX CONCURRENTLY idx_name ON users(name)";
      const issues = [];
      enforcer.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkSecurityPatterns", () => {
    it("should flag SQL string concatenation", () => {
      const content = 'query("SELECT * FROM users WHERE name = " + name)';
      const issues = [];
      enforcer.checkSecurityPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("SQL string concatenation");
    });

    it("should flag hardcoded database password", () => {
      const content = 'password = "secret123"';
      const issues = [];
      enforcer.checkSecurityPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Hardcoded database password");
    });

    it("should flag DROP TABLE without IF EXISTS", () => {
      const content = "DROP TABLE users";
      const issues = [];
      enforcer.checkSecurityPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("DROP TABLE without IF EXISTS");
    });

    it("should not flag parameterized queries", () => {
      const content = 'query("SELECT * FROM users WHERE name = $1", [name])';
      const issues = [];
      enforcer.checkSecurityPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag environment variable passwords", () => {
      const content = "password = process.env.DATABASE_PASSWORD";
      const issues = [];
      enforcer.checkSecurityPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag DROP TABLE IF EXISTS", () => {
      const content = "DROP TABLE IF EXISTS users";
      const issues = [];
      enforcer.checkSecurityPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("validateContent", () => {
    it("should pass for non-code files", async () => {
      const result = await enforcer.validateContent("some content", "file.txt");
      expect(result.allow).toBe(true);
    });

    it("should pass for code without PostgreSQL patterns", async () => {
      const result = await enforcer.validateContent(
        'console.log("hello");',
        "file.js",
      );
      expect(result.allow).toBe(true);
    });

    it("should fail for code with PostgreSQL issues", async () => {
      const content =
        'DATABASE_URL="postgresql://user:pass@host/db"; SELECT * FROM users';
      const result = await enforcer.validateContent(content, "file.js");
      expect(result.allow).toBe(false);
      expect(result.message).toBeDefined();
    });

    it("should pass for properly configured PostgreSQL code", async () => {
      const content = `
        const db = process.env.DATABASE_URL || "fallback";
        const users = await query("SELECT id, name FROM users WHERE active = $1 LIMIT 10", [true]);
        const result = await prisma.user.findMany({ take: 10, skip: 0 });
      `;
      const result = await enforcer.validateContent(content, "file.js");
      expect(result.allow).toBe(true);
    });
  });

  describe("integration tests", () => {
    it("should handle SQL migration files", async () => {
      const content = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL
        );
        
        CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
      `;
      const result = await enforcer.validateContent(content, "migration.sql");
      expect(result.allow).toBe(true);
    });

    it("should handle Prisma schema files", async () => {
      const content = `
        model User {
          id    Int     @id @default(autoincrement())
          name  String
          email String  @unique
          posts Post[]
        }
        
        model Post {
          id       Int    @id @default(autoincrement())
          title    String
          content  String
          userId   Int
          user     User   @relation(fields: [userId], references: [id])
        }
      `;
      const result = await enforcer.validateContent(content, "schema.prisma");
      expect(result.allow).toBe(true);
    });

    it("should handle TypeScript database files", async () => {
      const content = `
        import { PrismaClient } from '@prisma/client';
        
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: process.env.DATABASE_URL || "fallback"
            }
          }
        });
        
        export async function getUsers(page: number = 0) {
          return await prisma.user.findMany({
            take: 10,
            skip: page * 10,
            select: {
              id: true,
              name: true,
              email: true
            }
          });
        }
      `;
      const result = await enforcer.validateContent(content, "database.ts");
      expect(result.allow).toBe(true);
    });
  });

  describe("environment-based bypass", () => {
    it("should bypass when HOOK_DATABASE is false", async () => {
      process.env.HOOK_DATABASE = "false";
      const content =
        'DATABASE_URL="postgresql://user:pass@host/db"; SELECT * FROM users';
      const result = await enforcer.validateContent(content, "file.js");
      expect(result.allow).toBe(true);
      expect(result.bypass).toBe(true);
    });

    it("should run when HOOK_DATABASE is true", async () => {
      process.env.HOOK_DATABASE = "true";
      const content =
        'DATABASE_URL="postgresql://user:pass@host/db"; SELECT * FROM users';
      const result = await enforcer.validateContent(content, "file.js");
      expect(result.allow).toBe(false);
      expect(result.bypass).toBeUndefined();
    });
  });
});
