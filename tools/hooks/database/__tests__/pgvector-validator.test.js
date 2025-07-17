const PgvectorValidator = require("../pgvector-validator");

describe("PgvectorValidator", () => {
  let validator;
  let originalEnv;

  beforeEach(() => {
    validator = new PgvectorValidator();
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("containsPgvectorPatterns", () => {
    it("should detect pgvector patterns", () => {
      const content = "CREATE EXTENSION pgvector";
      expect(validator.containsPgvectorPatterns(content)).toBe(true);
    });

    it("should detect vector data type", () => {
      const content = "embedding vector(1536)";
      expect(validator.containsPgvectorPatterns(content)).toBe(true);
    });

    it("should detect similarity operators", () => {
      const content = "ORDER BY embedding <-> query_vector";
      expect(validator.containsPgvectorPatterns(content)).toBe(true);
    });

    it("should detect cosine distance", () => {
      const content = "cosine similarity search";
      expect(validator.containsPgvectorPatterns(content)).toBe(true);
    });

    it("should detect embedding patterns", () => {
      const content = "store embedding vectors";
      expect(validator.containsPgvectorPatterns(content)).toBe(true);
    });

    it("should detect index types", () => {
      const content = "CREATE INDEX USING ivfflat";
      expect(validator.containsPgvectorPatterns(content)).toBe(true);
    });

    it("should return false for non-pgvector content", () => {
      const content = "SELECT * FROM users";
      expect(validator.containsPgvectorPatterns(content)).toBe(false);
    });
  });

  describe("checkVectorOperations", () => {
    it("should flag vector column without dimension", () => {
      const content = "embedding vector()";
      const issues = [];
      validator.checkVectorOperations(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain(
        "Vector column without dimension specification",
      );
    });

    it("should flag vector column without NOT NULL", () => {
      const content = "embedding vector(1536)";
      const issues = [];
      validator.checkVectorOperations(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Vector column without NOT NULL constraint");
    });

    it("should flag vector with non-numeric values", () => {
      const content = 'INSERT INTO table VALUES ([1.0, "invalid", 3.0])';
      const issues = [];
      validator.checkVectorOperations(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Vector contains non-numeric values");
    });

    it("should flag array literal without vector cast", () => {
      const content = "INSERT INTO table VALUES ([1.0, 2.0, 3.0])";
      const issues = [];
      validator.checkVectorOperations(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Array literal without vector cast");
    });

    it("should not flag proper vector definition", () => {
      const content = "embedding vector(1536) NOT NULL";
      const issues = [];
      validator.checkVectorOperations(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag proper vector cast", () => {
      const content = "INSERT INTO table VALUES ([1.0, 2.0, 3.0]::vector)";
      const issues = [];
      validator.checkVectorOperations(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkSimilaritySearch", () => {
    it("should flag similarity search without LIMIT", () => {
      const content = "SELECT * FROM table ORDER BY embedding <-> query_vector";
      const issues = [];
      validator.checkSimilaritySearch(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Vector similarity search without LIMIT");
    });

    it("should flag function instead of operator", () => {
      const content = "ORDER BY cosine_distance(embedding, query)";
      const issues = [];
      validator.checkSimilaritySearch(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using function instead of operator");
    });

    it("should flag distance operator without ORDER BY", () => {
      const content = "SELECT embedding <-> query_vector FROM table";
      const issues = [];
      validator.checkSimilaritySearch(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("L2 distance operator without ORDER BY");
    });

    it("should flag distance operator in WHERE clause", () => {
      const content = "SELECT * FROM table WHERE embedding <-> query < 0.5";
      const issues = [];
      validator.checkSimilaritySearch(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using distance operator in WHERE clause");
    });

    it("should not flag proper similarity search", () => {
      const content =
        "SELECT * FROM table ORDER BY embedding <-> query_vector LIMIT 10";
      const issues = [];
      validator.checkSimilaritySearch(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkIndexConfiguration", () => {
    it("should flag vector index without proper type", () => {
      const content = "CREATE INDEX ON table(embedding)";
      const issues = [];
      validator.checkIndexConfiguration(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Vector index without proper index type");
    });

    it("should flag IVFFlat index without lists parameter", () => {
      const content =
        "CREATE INDEX ON table USING ivfflat (embedding vector_l2_ops)";
      const issues = [];
      validator.checkIndexConfiguration(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("IVFFlat index without lists parameter");
    });

    it("should flag HNSW index without m parameter", () => {
      const content =
        "CREATE INDEX ON table USING hnsw (embedding vector_l2_ops)";
      const issues = [];
      validator.checkIndexConfiguration(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("HNSW index without m parameter");
    });

    it("should flag operator class without proper index type", () => {
      const content = "CREATE INDEX ON table (embedding vector_l2_ops)";
      const issues = [];
      validator.checkIndexConfiguration(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain(
        "Vector operator class without proper index type",
      );
    });

    it("should not flag proper IVFFlat index", () => {
      const content =
        "CREATE INDEX ON table USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)";
      const issues = [];
      validator.checkIndexConfiguration(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag proper HNSW index", () => {
      const content =
        "CREATE INDEX ON table USING hnsw (embedding vector_l2_ops) WITH (m = 16)";
      const issues = [];
      validator.checkIndexConfiguration(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkPerformancePatterns", () => {
    it("should flag individual vector inserts in loop", () => {
      const content =
        "for (const item of items) { INSERT INTO table (embedding) VALUES (item.vector); }";
      const issues = [];
      validator.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Individual vector inserts in loop");
    });

    it("should flag large LIMIT in similarity search", () => {
      const content =
        "SELECT * FROM table ORDER BY embedding <-> query LIMIT 5000";
      const issues = [];
      validator.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Large LIMIT in vector similarity search");
    });

    it("should flag SELECT * in similarity search", () => {
      const content = "SELECT * FROM table ORDER BY embedding <-> query";
      const issues = [];
      validator.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("SELECT * in vector similarity search");
    });

    it("should flag global seqscan disable", () => {
      const content = "SET enable_seqscan = off";
      const issues = [];
      validator.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Disabling sequential scan globally");
    });

    it("should not flag reasonable LIMIT", () => {
      const content =
        "SELECT * FROM table ORDER BY embedding <-> query LIMIT 10";
      const issues = [];
      validator.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(0);
    });

    it("should not flag batch INSERT", () => {
      const content =
        "INSERT INTO table VALUES (vector1), (vector2), (vector3)";
      const issues = [];
      validator.checkPerformancePatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkEmbeddingPatterns", () => {
    it("should flag hardcoded OpenAI embedding dimension", () => {
      const content = "embedding vector(1536)";
      const issues = [];
      validator.checkEmbeddingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Hardcoded OpenAI embedding dimension");
    });

    it("should flag vector normalization without cast", () => {
      const content = "normalize(embedding_vector)";
      const issues = [];
      validator.checkEmbeddingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Vector normalization without cast");
    });

    it("should flag embedding array without vector cast", () => {
      const content = "embedding_array for vector search";
      const issues = [];
      validator.checkEmbeddingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Embedding array without vector cast");
    });

    it("should flag embedding column with NULL", () => {
      const content = "embedding vector(1536) NULL";
      const issues = [];
      validator.checkEmbeddingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Embedding column allows NULL values");
    });

    it("should not flag proper normalization", () => {
      const content = "normalize(embedding_vector)::vector";
      const issues = [];
      validator.checkEmbeddingPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkDimensionValidation", () => {
    it("should flag very high vector dimension", () => {
      const content = "embedding vector(5000)";
      const issues = [];
      validator.checkDimensionValidation(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Very high vector dimension");
    });

    it("should flag very low vector dimension", () => {
      const content = "embedding vector(10)";
      const issues = [];
      validator.checkDimensionValidation(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Very low vector dimension");
    });

    it("should flag hardcoded dimension check", () => {
      const content = "array_length(embedding) != 1536";
      const issues = [];
      validator.checkDimensionValidation(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Hardcoded dimension check");
    });

    it("should not flag reasonable dimensions", () => {
      const content = "embedding vector(768)";
      const issues = [];
      validator.checkDimensionValidation(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("validateContent", () => {
    it("should pass for non-code files", async () => {
      const result = await validator.validateContent(
        "some content",
        "file.txt",
      );
      expect(result.allow).toBe(true);
    });

    it("should pass for code without pgvector patterns", async () => {
      const result = await validator.validateContent(
        "SELECT * FROM users",
        "file.sql",
      );
      expect(result.allow).toBe(true);
    });

    it("should fail for code with pgvector issues", async () => {
      const content =
        "embedding vector(); SELECT * FROM table ORDER BY embedding <-> query";
      const result = await validator.validateContent(content, "file.sql");
      expect(result.allow).toBe(false);
      expect(result.message).toBeDefined();
    });

    it("should pass for properly configured pgvector code", async () => {
      const content = `
        CREATE TABLE embeddings (
          id SERIAL PRIMARY KEY,
          embedding vector(1536) NOT NULL
        );
        
        CREATE INDEX ON embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
        
        SELECT id FROM embeddings 
        ORDER BY embedding <-> '[0.1, 0.2, 0.3]'::vector 
        LIMIT 10;
      `;
      const result = await validator.validateContent(content, "file.sql");
      expect(result.allow).toBe(true);
    });
  });

  describe("integration tests", () => {
    it("should handle pgvector schema creation", async () => {
      const content = `
        CREATE EXTENSION IF NOT EXISTS vector;
        
        CREATE TABLE documents (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          embedding vector(1536) NOT NULL
        );
        
        CREATE INDEX ON documents USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
      `;
      const result = await validator.validateContent(content, "schema.sql");
      expect(result.allow).toBe(true);
    });

    it("should handle similarity search queries", async () => {
      const content = `
        SELECT 
          id, 
          content,
          embedding <-> $1 as distance
        FROM documents 
        ORDER BY embedding <-> $1 
        LIMIT 5;
      `;
      const result = await validator.validateContent(content, "search.sql");
      expect(result.allow).toBe(true);
    });

    it("should handle TypeScript with pgvector", async () => {
      const content = `
        import { PrismaClient } from '@prisma/client';
        
        const OPENAI_EMBEDDING_DIM = 1536;
        
        async function searchSimilar(queryEmbedding: number[]) {
          const vectorStr = '[' + queryEmbedding.join(',') + ']';
          
          return await prisma.$queryRaw\`
            SELECT id, content
            FROM documents
            ORDER BY embedding <-> \${vectorStr}::vector
            LIMIT 10
          \`;
        }
      `;
      const result = await validator.validateContent(content, "search.ts");
      expect(result.allow).toBe(true);
    });
  });

  describe("environment-based bypass", () => {
    it("should bypass when HOOK_DATABASE is false", async () => {
      process.env.HOOK_DATABASE = "false";
      const content =
        "embedding vector(); SELECT * FROM table ORDER BY embedding <-> query";
      const result = await validator.validateContent(content, "file.sql");
      expect(result.allow).toBe(true);
      expect(result.bypass).toBe(true);
    });

    it("should run when HOOK_DATABASE is true", async () => {
      process.env.HOOK_DATABASE = "true";
      const content =
        "embedding vector(); SELECT * FROM table ORDER BY embedding <-> query";
      const result = await validator.validateContent(content, "file.sql");
      expect(result.allow).toBe(false);
      expect(result.bypass).toBeUndefined();
    });
  });
});
