#!/usr/bin/env node

/**
 * Claude Code Hook: Vector DB Hygiene
 *
 * Enforces pgvector and embedding best practices for AI applications.
 * Critical for GOAL.md's recommended PostgreSQL + pgvector + embeddings stack.
 *
 * Validates:
 * - Embedding dimension consistency (1536 for OpenAI, 768 for others)
 * - Proper index usage for vector operations
 * - Batch operations for multiple embeddings
 * - Cache implementation for expensive operations
 * - Vector similarity search patterns
 * - Embedding table schema best practices
 *
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Blocks operations that would introduce vector DB anti-patterns
 */

const {
  HookRunner,
  FileAnalyzer,
  PatternLibrary,
  ErrorFormatter,
} = require("./lib");

// Standard embedding dimensions for different models
const EMBEDDING_DIMENSIONS = {
  "text-embedding-ada-002": 1536, // OpenAI Ada v2
  "text-embedding-3-small": 1536, // OpenAI v3 small
  "text-embedding-3-large": 3072, // OpenAI v3 large
  "all-MiniLM-L6-v2": 384, // Sentence Transformers
  "all-mpnet-base-v2": 768, // Sentence Transformers
  "e5-large-v2": 1024, // E5 embeddings
};

// Patterns that indicate vector DB operations
const VECTOR_PATTERNS = {
  // Embedding generation
  embedding_generation: [
    /openai\.embeddings\.create/i,
    /embeddings\.create/i,
    /generateEmbedding/i,
    /getEmbedding/i,
    /embed\(/i,
  ],

  // Vector storage
  vector_storage: [
    /INSERT.*embedding/i,
    /UPDATE.*embedding/i,
    /CREATE TABLE.*embedding/i,
    /vector\s*\[\s*\d+\s*\]/i,
    /pgvector/i,
  ],

  // Vector queries
  vector_queries: [
    /<->|<#>|<=>/, // pgvector operators
    /ORDER BY.*<->|<#>|<=>/,
    /cosine_similarity/i,
    /euclidean_distance/i,
    /dot_product/i,
    /similarity_search/i,
  ],

  // Index operations
  vector_indexes: [
    /CREATE INDEX.*USING ivfflat/i,
    /CREATE INDEX.*USING hnsw/i,
    /ivfflat|hnsw/i,
    /vector_cosine_ops|vector_l2_ops|vector_ip_ops/i,
  ],
};

// Anti-patterns that should be avoided
const ANTI_PATTERNS = {
  // Performance anti-patterns
  single_embedding_inserts: [
    /INSERT.*embedding.*VALUES.*\n.*INSERT.*embedding/i,
    /(?:^|\n).*INSERT.*embedding.*(?:\n.*INSERT.*embedding.*){2,}/m,
  ],

  // Dimension inconsistencies
  hardcoded_dimensions: [/vector\[\s*(?!1536|768|384|1024|3072)\d+\s*\]/i],

  // Missing indexes
  unindexed_similarity: [
    /ORDER BY.*<->(?!.*INDEX)/i,
    /WHERE.*<->.*<(?!.*INDEX)/i,
  ],

  // Inefficient patterns
  inefficient_queries: [
    /SELECT \* FROM.*ORDER BY.*<->/i, // Select all with similarity
    /ORDER BY.*<->.*LIMIT \d{3,}/i, // Large result sets
    /WHERE.*<->.*< 0\.\d{4,}/i, // Very small thresholds
  ],

  // Security issues
  embedding_injection: [
    /embedding.*\$\{|embedding.*\+.*\'/i,
    /vector.*\$\{|vector.*\+.*\'/i,
  ],
};

// Best practice patterns we should encourage
const BEST_PRACTICES = {
  // Proper batch operations
  batch_inserts: [
    /INSERT.*embedding.*VALUES\s*\(\s*\$\d+.*\),\s*\(\s*\$\d+/i,
    /batch.*embed|embed.*batch/i,
    /Promise\.all.*embed/i,
  ],

  // Proper indexing
  vector_indexes: [
    /CREATE INDEX.*USING (ivfflat|hnsw)/i,
    /vector_(cosine|l2|ip)_ops/i,
  ],

  // Caching
  embedding_cache: [
    /cache.*embed|embed.*cache/i,
    /redis.*embed|embed.*redis/i,
    /memoize.*embed/i,
  ],

  // Proper error handling
  error_handling: [
    /try.*embed.*catch/i,
    /embed.*\.catch/i,
    /if.*embedding.*throw/i,
  ],
};

// Helpful suggestions for common issues
const SUGGESTIONS = {
  dimension_mismatch: `
🔧 Embedding Dimension Best Practices:
  ✅ Use consistent dimensions across your application
  ✅ OpenAI Ada v2: vector[1536]
  ✅ OpenAI v3 Small: vector[1536] 
  ✅ OpenAI v3 Large: vector[3072]
  ✅ Sentence Transformers: vector[384] or vector[768]
  
📖 See: docs/guides/ai-integration/vector-db-setup.md`,

  missing_indexes: `
🔧 Vector Index Best Practices:
  ✅ CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
  ✅ CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);
  ✅ Use ivfflat for datasets < 1M vectors
  ✅ Use hnsw for datasets > 1M vectors
  
📖 See: docs/guides/ai-integration/vector-indexing.md`,

  batch_operations: `
🔧 Batch Operation Best Practices:
  ✅ Batch embed 50-100 texts at once
  ✅ Use Promise.all() for parallel embedding generation
  ✅ Use single INSERT with multiple VALUES
  ✅ Implement embedding cache to avoid re-computation
  
📖 See: docs/guides/ai-integration/embedding-optimization.md`,

  query_optimization: `
🔧 Vector Query Optimization:
  ✅ Use LIMIT to restrict result sets (typically 5-20)
  ✅ Combine with WHERE clauses for filtering
  ✅ Use appropriate similarity thresholds (0.7-0.9)
  ✅ Consider semantic vs. exact matching needs
  
📖 See: docs/guides/ai-integration/similarity-search.md`,
};

function detectVectorOperations(content) {
  const operations = [];

  Object.entries(VECTOR_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach((pattern) => {
      if (pattern.test(content)) {
        operations.push(category);
      }
    });
  });

  return [...new Set(operations)];
}

function checkDimensionConsistency(content) {
  const issues = [];

  // Look for vector type declarations
  const vectorTypeMatches = content.match(/vector\[\s*(\d+)\s*\]/gi) || [];
  const dimensions = vectorTypeMatches
    .map((match) => {
      const dim = match.match(/\d+/);
      return dim ? parseInt(dim[0]) : null;
    })
    .filter(Boolean);

  // Check for consistent dimensions
  const uniqueDimensions = [...new Set(dimensions)];
  if (uniqueDimensions.length > 1) {
    issues.push({
      type: "dimension_inconsistency",
      message: `Inconsistent embedding dimensions found: ${uniqueDimensions.join(", ")}`,
      suggestion: "dimension_mismatch",
    });
  }

  // Check for non-standard dimensions
  const standardDims = Object.values(EMBEDDING_DIMENSIONS);
  const nonStandardDims = uniqueDimensions.filter(
    (dim) => !standardDims.includes(dim),
  );
  if (nonStandardDims.length > 0) {
    issues.push({
      type: "non_standard_dimensions",
      message: `Non-standard dimensions: ${nonStandardDims.join(", ")}`,
      suggestion: "dimension_mismatch",
    });
  }

  return issues;
}

function checkAntiPatterns(content) {
  const issues = [];

  Object.entries(ANTI_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach((pattern) => {
      if (pattern.test(content)) {
        let suggestion, message;

        switch (category) {
          case "single_embedding_inserts":
            message = "Multiple single INSERT statements detected";
            suggestion = "batch_operations";
            break;
          case "hardcoded_dimensions":
            message = "Hardcoded non-standard vector dimensions";
            suggestion = "dimension_mismatch";
            break;
          case "unindexed_similarity":
            message = "Similarity queries without proper indexes";
            suggestion = "missing_indexes";
            break;
          case "inefficient_queries":
            message = "Inefficient vector query patterns detected";
            suggestion = "query_optimization";
            break;
          case "embedding_injection":
            message = "Potential embedding injection vulnerability";
            suggestion = "query_optimization";
            break;
        }

        issues.push({
          type: category,
          message,
          suggestion,
        });
      }
    });
  });

  return issues;
}

function checkBestPractices(content) {
  const practices = [];

  Object.entries(BEST_PRACTICES).forEach(([category, patterns]) => {
    patterns.forEach((pattern) => {
      if (pattern.test(content)) {
        practices.push(category);
      }
    });
  });

  return [...new Set(practices)];
}

function isVectorDbFile(filePath, content) {
  // Check file extension and content for vector DB operations
  const isCodeFile =
    FileAnalyzer.isCodeFile(filePath) ||
    filePath.endsWith(".sql") ||
    filePath.endsWith(".prisma");

  if (!isCodeFile) return false;

  const vectorOperations = detectVectorOperations(content);
  return vectorOperations.length > 0;
}

function validateVectorDbHygiene(content, filePath) {
  if (!isVectorDbFile(filePath, content)) {
    return {
      valid: true,
      issues: [],
      bestPractices: [],
      vectorOperations: [],
    };
  }

  const dimensionIssues = checkDimensionConsistency(content) || [];
  const antiPatternIssues = checkAntiPatterns(content) || [];
  const bestPractices = checkBestPractices(content) || [];
  const vectorOperations = detectVectorOperations(content) || [];

  const allIssues = [...dimensionIssues, ...antiPatternIssues];

  return {
    valid: allIssues.length === 0,
    issues: allIssues,
    bestPractices,
    vectorOperations,
  };
}

// Hook logic
async function vectorDbHygiene(input) {
  const { filePath, content } = input;

  // Skip if no file path or content
  if (!filePath || !content) {
    return { allow: true };
  }

  // Skip exception files that legitimately need vector patterns for development
  const skipPatterns = [
    // Hook development files (need vector patterns to detect them)
    /tools\/hooks\//,

    // Documentation files (can show examples)
    /\/docs\//,
    /\.md$/,

    // Configuration files
    /package\.json$/,
  ];

  if (skipPatterns.some((pattern) => pattern.test(filePath))) {
    return { allow: true };
  }

  // Skip content that's clearly documentation or hook development
  const skipContentPatterns = [
    /\/\/ Hook development/i,
    /\/\/ Documentation example/i,
    /VECTOR_PATTERNS|ANTI_PATTERNS/i, // Hook pattern definitions
    /const.*PATTERNS.*=.*\{/i, // Pattern definition objects in hooks
  ];

  if (skipContentPatterns.some((pattern) => pattern.test(content))) {
    return { allow: true };
  }

  const validation = validateVectorDbHygiene(content, filePath);

  // Add null check for vectorOperations
  if (!validation.vectorOperations) {
    validation.vectorOperations = [];
  }

  if (!validation.valid) {
    // Group issues by type for better error messages
    const issuesByType = validation.issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = [];
      acc[issue.type].push(issue);
      return acc;
    }, {});

    let errorMessage = "🧬 Vector DB Hygiene Issues Detected\n\n";

    Object.entries(issuesByType).forEach(([type, issues]) => {
      errorMessage += `❌ ${issues[0].message}\n`;
      if (issues[0].suggestion && SUGGESTIONS[issues[0].suggestion]) {
        errorMessage += SUGGESTIONS[issues[0].suggestion] + "\n";
      }
      errorMessage += "\n";
    });

    // Show detected operations for context
    if (validation.vectorOperations.length > 0) {
      errorMessage += `🔍 Detected vector operations: ${validation.vectorOperations.join(", ")}\n\n`;
    }

    errorMessage +=
      "💡 Vector DB operations require careful attention to performance\n";
    errorMessage +=
      "   and consistency. Please review the suggested best practices.\n\n";
    errorMessage +=
      "📖 Full guide: docs/guides/ai-integration/vector-db-best-practices.md";

    return { block: true, message: errorMessage };
  }

  // Log best practices detected (for positive reinforcement)
  if (validation.bestPractices.length > 0) {
    process.stderr.write(
      `🧬 Vector DB: Good practices detected - ${validation.bestPractices.join(", ")}\n`,
    );
  }

  return { allow: true };
}

// Run the hook
// Create and run the hook
HookRunner.create("vector-db-hygiene", vectorDbHygiene, {
  timeout: 2000,
});

module.exports = {
  EMBEDDING_DIMENSIONS,
  VECTOR_PATTERNS,
  ANTI_PATTERNS,
  detectVectorOperations,
  checkDimensionConsistency,
  checkAntiPatterns,
  validateVectorDbHygiene,
  vectorDbHygiene,
};
