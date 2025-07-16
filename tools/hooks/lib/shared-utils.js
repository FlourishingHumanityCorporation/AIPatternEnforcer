#!/usr/bin/env node

/**
 * Shared Utilities for Hook System
 *
 * Simple, reusable functions for all hooks
 * KISS principle - keep it simple!
 */

const fs = require("fs");
const path = require("path");
const {
  FILE_EXTENSIONS,
  FILE_STRUCTURE,
  CLAUDE_MD_SECTIONS,
} = require("./constants");

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Read file safely
 */
function readFileSafe(filePath) {
  try {
    if (fileExists(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Find project root by looking for package.json
 */
function findProjectRoot(startPath = process.cwd()) {
  let currentPath = startPath;

  for (let i = 0; i < 10; i++) {
    if (fileExists(path.join(currentPath, "package.json"))) {
      return currentPath;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) break;
    currentPath = parentPath;
  }

  return process.cwd();
}

/**
 * Find CLAUDE.md file
 */
function findClaudeMd() {
  const projectRoot = findProjectRoot();
  const claudeMdPath = path.join(projectRoot, "CLAUDE.md");

  if (fileExists(claudeMdPath)) {
    return claudeMdPath;
  }

  return null;
}

/**
 * Check if CLAUDE.md is referenced in input
 */
function hasClaudeMdReference(input) {
  const searchTerms = [
    "CLAUDE.md",
    "project instructions",
    "@CLAUDE.md",
    "claude.md",
  ];
  const content = JSON.stringify(input).toLowerCase();

  return searchTerms.some((term) => content.includes(term.toLowerCase()));
}

/**
 * Get file extension
 */
function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

/**
 * Check if file is code
 */
function isCodeFile(filePath) {
  const ext = getFileExtension(filePath);
  return FILE_EXTENSIONS.CODE.includes(ext);
}

/**
 * Check if file is test
 */
function isTestFile(filePath) {
  const fileName = path.basename(filePath).toLowerCase();
  return FILE_EXTENSIONS.TEST.some((ext) => fileName.includes(ext));
}

/**
 * Check if file is in root directory
 */
function isInRootDirectory(filePath) {
  const projectRoot = findProjectRoot();
  const fileDir = path.dirname(path.resolve(filePath));
  return fileDir === projectRoot;
}

/**
 * Check if file should be in root
 */
function shouldBeInRoot(fileName) {
  return FILE_STRUCTURE.ROOT_ONLY.includes(fileName);
}

/**
 * Get test file path for a component
 */
function getTestFilePath(componentPath) {
  const dir = path.dirname(componentPath);
  const baseName = path.basename(componentPath, path.extname(componentPath));
  const ext = getFileExtension(componentPath);

  // Try common test file patterns
  const patterns = [
    path.join(dir, `${baseName}.test${ext}`),
    path.join(dir, `${baseName}.spec${ext}`),
    path.join(dir, "__tests__", `${baseName}.test${ext}`),
    path.join(dir, "../__tests__", `${baseName}.test${ext}`),
  ];

  // Return first existing pattern or default
  for (const pattern of patterns) {
    if (fileExists(pattern)) {
      return pattern;
    }
  }

  return patterns[0]; // Default to first pattern
}

/**
 * Check if test file exists for component
 */
function hasTestFile(componentPath) {
  const testPath = getTestFilePath(componentPath);
  return fileExists(testPath);
}

/**
 * Count lines in content
 */
function countLines(content) {
  if (!content) return 0;
  return content.split("\n").length;
}

/**
 * Simple hash function for caching
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Check if operation is for new feature
 */
function isNewFeature(input) {
  const { tool_name, file_path } = input;

  // New file creation is likely new feature
  if (tool_name === "Write" && !fileExists(file_path)) {
    return true;
  }

  // Check for feature keywords in content
  const content = (input.content || input.new_string || "").toLowerCase();
  const featureKeywords = ["feature", "component", "module", "service", "api"];

  return featureKeywords.some((keyword) => content.includes(keyword));
}

/**
 * Check if operation is destructive
 */
function isDestructiveOperation(input) {
  const content = JSON.stringify(input).toLowerCase();
  const destructivePatterns = [
    "delete all",
    "remove everything",
    "clear all",
    "drop table",
    "truncate",
    "rm -rf",
  ];

  return destructivePatterns.some((pattern) => content.includes(pattern));
}

/**
 * Get plan file path
 */
function getPlanFilePath() {
  const projectRoot = findProjectRoot();
  const planPaths = [
    path.join(projectRoot, "PLAN.md"),
    path.join(projectRoot, "TODO.md"),
    path.join(projectRoot, "docs", "PLAN.md"),
  ];

  // Return first existing plan file
  for (const planPath of planPaths) {
    if (fileExists(planPath)) {
      return planPath;
    }
  }

  return planPaths[0]; // Default to PLAN.md in root
}

/**
 * Check if plan file exists
 */
function hasPlanFile() {
  return fileExists(getPlanFilePath());
}

/**
 * Parse CLAUDE.md sections
 */
function parseClaudeMdSections(content) {
  if (!content) return [];

  const sections = [];
  const lines = content.split("\n");
  let currentSection = null;

  for (const line of lines) {
    const headerMatch = line.match(/^#+\s+(.+)$/);

    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        title: headerMatch[1].trim(),
        content: "",
        level: line.indexOf(" "),
      };
    } else if (currentSection) {
      currentSection.content += line + "\n";
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Find relevant CLAUDE.md sections for file path
 */
function findRelevantSections(filePath) {
  const claudeMdPath = findClaudeMd();
  if (!claudeMdPath) return [];

  const content = readFileSafe(claudeMdPath);
  if (!content) return [];

  const sections = parseClaudeMdSections(content);
  const relevant = [];

  // Always include critical sections
  const criticalSections = ["CRITICAL RULES", "NEVER DO", "ALWAYS DO"];

  sections.forEach((section) => {
    // Include critical sections
    if (
      criticalSections.some((critical) =>
        section.title.toUpperCase().includes(critical),
      )
    ) {
      relevant.push(section);
      return;
    }

    // Include sections that might be relevant to file type
    if (
      isCodeFile(filePath) &&
      section.title.match(/ARCHITECTURE|PATTERNS|STANDARDS/i)
    ) {
      relevant.push(section);
    }

    if (isTestFile(filePath) && section.title.match(/TEST|TESTING/i)) {
      relevant.push(section);
    }
  });

  return relevant;
}

/**
 * Clean up common AI-generated junk files
 */
function cleanupJunkFiles(patterns = ["*_improved.*", "*_backup.*", "*.tmp"]) {
  const projectRoot = findProjectRoot();
  let cleaned = 0;

  // Simple implementation - just log what would be cleaned
  // In production, would actually delete files
  console.log(`Would clean files matching: ${patterns.join(", ")}`);

  return cleaned;
}

/**
 * Format execution time for logging
 */
function formatExecutionTime(ms) {
  if (ms < 1) return "<1ms";
  if (ms < 10) return `${ms.toFixed(1)}ms`;
  return `${Math.round(ms)}ms`;
}

module.exports = {
  // File utilities
  fileExists,
  readFileSafe,
  findProjectRoot,
  findClaudeMd,
  hasClaudeMdReference,

  // File type checks
  getFileExtension,
  isCodeFile,
  isTestFile,
  isInRootDirectory,
  shouldBeInRoot,

  // Test utilities
  getTestFilePath,
  hasTestFile,

  // Content utilities
  countLines,
  simpleHash,

  // Operation checks
  isNewFeature,
  isDestructiveOperation,

  // Plan utilities
  getPlanFilePath,
  hasPlanFile,

  // CLAUDE.md utilities
  parseClaudeMdSections,
  findRelevantSections,

  // Cleanup utilities
  cleanupJunkFiles,

  // Performance utilities
  formatExecutionTime,
};
