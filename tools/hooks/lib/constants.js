#!/usr/bin/env node

/**
 * Shared Constants for Hook System
 *
 * Simple constants used across all hooks
 */

// Performance budgets
const PERFORMANCE = {
  HOOK_TIMEOUT_MS: 50, // Individual hook max execution time
  TOTAL_TIMEOUT_MS: 300, // Total execution time for all hooks
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minute cache TTL
};

// Context thresholds
const CONTEXT_THRESHOLDS = {
  Write: 60,
  Edit: 50,
  MultiEdit: 70,
  Default: 50,
};

// Drift thresholds
const DRIFT_THRESHOLDS = {
  LOW: 0.3, // Suggest refresh
  MEDIUM: 0.6, // Warn about quality
  HIGH: 0.8, // Block operation
};

// Common patterns to check
const PATTERNS = {
  IMPROVED_FILES: [
    /_improved\./i,
    /_enhanced\./i,
    /_v2\./i,
    /_backup\./i,
    /_old\./i,
    /_copy\./i,
  ],

  TEMP_FILES: [/\.tmp$/i, /\.temp$/i, /\.bak$/i, /~$/],

  VAGUE_PROMPTS: [
    /^fix$/i,
    /^update$/i,
    /^change$/i,
    /^modify$/i,
    /^improve$/i,
  ],

  DESTRUCTIVE_OPERATIONS: [
    /delete all/i,
    /remove everything/i,
    /clear all/i,
    /reset/i,
  ],
};

// File structure patterns
const FILE_STRUCTURE = {
  COMPONENT_DIRS: ["components/", "src/components/", "app/components/"],
  TEST_DIRS: ["__tests__/", "tests/", "test/"],
  LIB_DIRS: ["lib/", "src/lib/", "utils/", "src/utils/"],
  APP_DIRS: ["app/", "src/", "pages/"],
  ROOT_ONLY: [
    "package.json",
    "README.md",
    "LICENSE",
    ".gitignore",
    "CLAUDE.md",
  ],
};

// Common file extensions
const FILE_EXTENSIONS = {
  CODE: [".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go", ".rs"],
  TEST: [".test.js", ".spec.js", ".test.ts", ".spec.ts", ".test.tsx"],
  CONFIG: [".json", ".yaml", ".yml", ".toml", ".env"],
  DOCS: [".md", ".txt", ".rst", ".adoc"],
};

// Prompt quality indicators
const PROMPT_QUALITY = {
  MIN_LENGTH: 50,
  GOOD_LENGTH: 200,
  CONTEXT_KEYWORDS: ["based on", "according to", "following", "using", "with"],
  SPECIFICITY_KEYWORDS: [
    "create",
    "implement",
    "add",
    "fix",
    "update",
    "refactor",
  ],
};

// Session limits
const SESSION_LIMITS = {
  MAX_MESSAGE_COUNT: 50,
  MAX_SESSION_HOURS: 4,
  IDLE_TIME_MINUTES: 30,
  MAX_PR_FILES: 15,
  MAX_PR_LINES: 500,
};

// Claude.md sections to look for
const CLAUDE_MD_SECTIONS = [
  "GOAL",
  "PROJECT",
  "RULES",
  "CRITICAL RULES",
  "NEVER DO",
  "ALWAYS DO",
  "ARCHITECTURE",
  "PATTERNS",
  "STANDARDS",
  "TARGET",
];

// Simple messages
const MESSAGES = {
  INSUFFICIENT_CONTEXT: "Add context: Run 'npm run context' first",
  STALE_CONTEXT: "Context stale. Refresh with 'npm run context'",
  PLAN_REQUIRED: "Create PLAN.md first with your approach",
  TEST_REQUIRED: "Create test file first",
  PR_TOO_LARGE: "PR getting large. Consider splitting.",
  VAGUE_PROMPT: "Add more context for better results",
  DESTRUCTIVE_CONFIRM: "Destructive operation needs explicit confirmation",
};

module.exports = {
  PERFORMANCE,
  CONTEXT_THRESHOLDS,
  DRIFT_THRESHOLDS,
  PATTERNS,
  FILE_STRUCTURE,
  FILE_EXTENSIONS,
  PROMPT_QUALITY,
  SESSION_LIMITS,
  CLAUDE_MD_SECTIONS,
  MESSAGES,
};
