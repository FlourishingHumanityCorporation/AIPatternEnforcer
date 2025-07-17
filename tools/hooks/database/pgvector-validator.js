#!/usr/bin/env node

/**
 * pgvector Validator Hook
 *
 * Validates pgvector usage patterns per CLAUDE.md tech stack:
 * - PostgreSQL + pgvector for vector embeddings
 * - Similarity search optimization
 * - Index configuration best practices
 */

const HookRunner = require("../lib/HookRunner");
const FileAnalyzer = require("../lib/FileAnalyzer");

class PgvectorValidator extends HookRunner {
  constructor() {
    super("pgvector-validator");
  }

  async validateContent(content, filePath) {
    if (!FileAnalyzer.isCodeFile(filePath)) {
      return this.allow();
    }

    if (!this.containsPgvectorPatterns(content)) {
      return this.allow();
    }

    const issues = [];

    this.checkVectorOperations(content, issues);
    this.checkSimilaritySearch(content, issues);
    this.checkIndexConfiguration(content, issues);
    this.checkPerformancePatterns(content, issues);
    this.checkEmbeddingPatterns(content, issues);
    this.checkDimensionValidation(content, issues);

    if (issues.length > 0) {
      return this.block(issues.join("\n"));
    }

    return this.allow();
  }

  containsPgvectorPatterns(content) {
    const patterns = [
      /pgvector/i,
      /vector/i,
      /embedding/i,
      /cosine|l2|inner_product/i,
      /<->|<#>|<=>|<=>/,
      /similarity/i,
      /ivfflat|hnsw/i,
      /dimension/i,
      /normalize/i,
      /euclidean/i,
    ];

    return patterns.some((pattern) => pattern.test(content));
  }

  checkVectorOperations(content, issues) {
    const vectorPatterns = [
      {
        pattern: /vector\(\s*\)/g,
        message: "Vector column without dimension specification",
        suggestion: "Specify dimension: vector(1536) for OpenAI embeddings",
      },
      {
        pattern: /vector\(\s*[0-9]+\s*\)(?![^;]*NOT\s+NULL)/gi,
        message: "Vector column without NOT NULL constraint",
        suggestion: "Add NOT NULL: vector(1536) NOT NULL",
      },
      {
        pattern: /INSERT.*vector.*\[.*\]/gs,
        check: (match) => {
          const vectorMatch = match.match(/\[([^\]]+)\]/);
          if (vectorMatch) {
            const values = vectorMatch[1].split(",").map((v) => v.trim());
            return values.some((v) => isNaN(parseFloat(v)));
          }
          return false;
        },
        message: "Vector contains non-numeric values",
        suggestion: "Ensure all vector values are numeric: [0.1, 0.2, 0.3]",
      },
      {
        pattern: /\[.*\](?!\s*::vector)/g,
        message: "Array literal without vector cast",
        suggestion: "Cast to vector: [0.1, 0.2, 0.3]::vector",
      },
    ];

    vectorPatterns.forEach(({ pattern, check, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!check || check(match)) {
            issues.push(`❌ ${message}\n✅ ${suggestion}`);
          }
        });
      }
    });
  }

  checkSimilaritySearch(content, issues) {
    const searchPatterns = [
      {
        pattern: /ORDER\s+BY\s+[^<]*<->[^L]*(?!LIMIT)/gi,
        message: "Vector similarity search without LIMIT",
        suggestion:
          "Add LIMIT for performance: ORDER BY embedding <-> query_vector LIMIT 10",
      },
      {
        pattern: /cosine_distance|euclidean_distance/gi,
        message: "Using function instead of operator",
        suggestion: "Use operators: <=> for cosine, <-> for L2 distance",
      },
      {
        pattern: /<->/g,
        check: (match, context) => {
          const nearbyCode = context.substring(
            context.indexOf(match) - 50,
            context.indexOf(match) + 50,
          );
          return !/ORDER\s+BY/i.test(nearbyCode);
        },
        message: "L2 distance operator without ORDER BY",
        suggestion: "Use in ORDER BY: ORDER BY embedding <-> query_vector",
      },
      {
        pattern: /WHERE.*<->.*[<>]/g,
        message: "Using distance operator in WHERE clause",
        suggestion: "Use distance operators in ORDER BY for index efficiency",
      },
    ];

    searchPatterns.forEach(({ pattern, check, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!check || check(match, content)) {
            issues.push(`❌ ${message}\n✅ ${suggestion}`);
          }
        });
      }
    });
  }

  checkIndexConfiguration(content, issues) {
    const indexPatterns = [
      {
        pattern: /CREATE\s+INDEX.*vector.*(?!USING\s+(ivfflat|hnsw))/gi,
        message: "Vector index without proper index type",
        suggestion: "Use USING ivfflat or USING hnsw for vector indexes",
      },
      {
        pattern: /USING\s+ivfflat(?!\s*\([^)]*lists\s*=)/gi,
        message: "IVFFlat index without lists parameter",
        suggestion:
          "Set lists parameter: USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)",
      },
      {
        pattern: /USING\s+hnsw(?!\s*\([^)]*m\s*=)/gi,
        message: "HNSW index without m parameter",
        suggestion:
          "Set m parameter: USING hnsw (embedding vector_l2_ops) WITH (m = 16)",
      },
      {
        pattern: /vector_l2_ops|vector_ip_ops|vector_cosine_ops/g,
        check: (match, context) => {
          const nearbyCode = context.substring(
            context.indexOf(match) - 100,
            context.indexOf(match) + 100,
          );
          return !/USING\s+(ivfflat|hnsw)/i.test(nearbyCode);
        },
        message: "Vector operator class without proper index type",
        suggestion:
          "Use with appropriate index: USING ivfflat (col vector_l2_ops)",
      },
    ];

    indexPatterns.forEach(({ pattern, check, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!check || check(match, content)) {
            issues.push(`❌ ${message}\n✅ ${suggestion}`);
          }
        });
      }
    });
  }

  checkPerformancePatterns(content, issues) {
    const performancePatterns = [
      {
        pattern: /for\s*\([^)]*\)\s*\{[^}]*INSERT.*vector/gis,
        message: "Individual vector inserts in loop",
        suggestion:
          "Use batch INSERT for multiple vectors: INSERT INTO table VALUES (vector1), (vector2), ...",
      },
      {
        pattern: /ORDER\s+BY.*<->.*LIMIT\s+([0-9]+)/gi,
        check: (match) => {
          const limitMatch = match.match(/LIMIT\s+([0-9]+)/i);
          if (limitMatch) {
            const limit = parseInt(limitMatch[1]);
            return limit > 1000;
          }
          return false;
        },
        message: "Large LIMIT in vector similarity search",
        suggestion:
          "Use smaller LIMIT for better performance (typically < 100)",
      },
      {
        pattern: /SELECT\s+\*.*ORDER\s+BY.*<->/gis,
        message: "SELECT * in vector similarity search",
        suggestion: "Select only needed columns for better performance",
      },
      {
        pattern: /SET\s+enable_seqscan\s*=\s*off/gi,
        message: "Disabling sequential scan globally",
        suggestion: "Disable seqscan only for specific queries or sessions",
      },
    ];

    performancePatterns.forEach(({ pattern, check, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!check || check(match)) {
            issues.push(`❌ ${message}\n✅ ${suggestion}`);
          }
        });
      }
    });
  }

  checkEmbeddingPatterns(content, issues) {
    const embeddingPatterns = [
      {
        pattern: /embedding.*1536|1536.*embedding/gi,
        message: "Hardcoded OpenAI embedding dimension",
        suggestion: "Use constant: const OPENAI_EMBEDDING_DIM = 1536",
      },
      {
        pattern: /normalize\s*\([^)]*\)(?!\s*::vector)/g,
        message: "Vector normalization without cast",
        suggestion: "Cast normalized result: normalize(vector)::vector",
      },
      {
        pattern: /\[.*\](?!\s*::vector).*(?:embed|vector)/gi,
        message: "Embedding array without vector cast",
        suggestion: "Cast embedding arrays: embedding_array::vector",
      },
      {
        pattern: /embedding.*null|null.*embedding/gi,
        message: "Embedding column allows NULL values",
        suggestion: "Use NOT NULL for embedding columns",
      },
    ];

    embeddingPatterns.forEach(({ pattern, message, suggestion }) => {
      if (pattern.test(content)) {
        issues.push(`❌ ${message}\n✅ ${suggestion}`);
      }
    });
  }

  checkDimensionValidation(content, issues) {
    const dimensionPatterns = [
      {
        pattern: /vector\(\s*([0-9]+)\s*\)/g,
        check: (match) => {
          const dimMatch = match.match(/vector\(\s*([0-9]+)\s*\)/);
          if (dimMatch) {
            const dimension = parseInt(dimMatch[1]);
            return dimension > 2000;
          }
          return false;
        },
        message: "Very high vector dimension",
        suggestion:
          "Consider dimension reduction or verify if dimension is correct",
      },
      {
        pattern: /vector\(\s*([0-9]+)\s*\)/g,
        check: (match) => {
          const dimMatch = match.match(/vector\(\s*([0-9]+)\s*\)/);
          if (dimMatch) {
            const dimension = parseInt(dimMatch[1]);
            return dimension < 50;
          }
          return false;
        },
        message: "Very low vector dimension",
        suggestion: "Verify vector dimension is appropriate for your use case",
      },
      {
        pattern: /array_length\([^)]*\)\s*!=\s*[0-9]+/g,
        message: "Hardcoded dimension check",
        suggestion: "Use dynamic dimension validation or named constants",
      },
    ];

    dimensionPatterns.forEach(({ pattern, check, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!check || check(match)) {
            issues.push(`❌ ${message}\n✅ ${suggestion}`);
          }
        });
      }
    });
  }
}

if (require.main === module) {
  const validator = new PgvectorValidator();
  validator.run(async (data) => {
    const { content = "", file_path = "" } = data;
    return await validator.validateContent(content, file_path);
  });
}

module.exports = PgvectorValidator;
