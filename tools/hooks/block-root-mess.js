#!/usr/bin/env node

/**
 * Claude Code Hook: Block Root Directory Mess
 *
 * Prevents AI from creating files in the root directory that belong in subdirectories.
 * Enforces the meta-project structure defined in CLAUDE.md.
 *
 * This is critical for AIPatternEnforcer since it's a META-PROJECT for creating
 * templates, not an application itself.
 *
 * Usage: Called by Claude Code before Write operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const { HookRunner, FileAnalyzer, ErrorFormatter } = require("./lib");

// From CLAUDE.md - allowed root files for meta-project
const ALLOWED_ROOT_FILES = new Set([
  // Meta-project Documentation
  "README.md",
  "LICENSE",
  "CLAUDE.md",
  "CONTRIBUTING.md",
  "SETUP.md",
  "FRICTION-MAPPING.md",
  "QUICK-START.md",
  "USER-JOURNEY.md",
  "DOCS_INDEX.md",

  // Meta-project Configuration
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  ".eslintrc.json",
  ".prettierrc",
  ".env",
  ".env.example",
  ".gitignore",

  // CI/CD (allowed since it's for the meta-project)
  ".github",
  ".husky",
  ".vscode",
]);

// Directory suggestions for common mistakes
const DIRECTORY_SUGGESTIONS = {
  // Application code patterns
  app: "templates/nextjs-app-router/app/",
  components: "templates/[framework]/components/",
  lib: "templates/[framework]/lib/",
  pages: "templates/nextjs-pages/pages/",
  src: "templates/[framework]/src/",

  // Config files that belong in templates
  "next.config.js": "templates/nextjs-app-router/",
  "vite.config.js": "templates/react-vite/",
  "tailwind.config.js": "templates/[framework]/",
  "postcss.config.js": "templates/[framework]/",
  "jest.config.js": "templates/[framework]/",

  // Documentation that's not meta-project level
  "CHANGELOG.md": "docs/reports/",
  "TODO.md": "docs/plans/",
  "NOTES.md": "docs/notes/",

  // Build artifacts
  dist: "templates/[framework]/dist/ (or add to .gitignore)",
  build: "templates/[framework]/build/ (or add to .gitignore)",
  ".next": "templates/nextjs-app-router/.next/ (or add to .gitignore)",
};

// Hook logic
async function blockRootMess(input) {
  const { filePath } = input;

  // Allow operations without file paths
  if (!filePath) {
    return { allow: true };
  }

  const fileInfo = FileAnalyzer.extractFileInfo(filePath);
  const pathParts = fileInfo.pathParts;
  const topLevelDir = pathParts[0];

  // If it's just a filename (no directories), check if it's allowed in root
  if (pathParts.length === 1) {
    const fileName = pathParts[0];
    if (
      ALLOWED_ROOT_FILES.has(fileName) ||
      ALLOWED_ROOT_FILES.has(fileInfo.nameWithoutExt)
    ) {
      return { allow: true };
    }
    // Fall through to block forbidden root files
  } else {
    // Check if the top-level directory is forbidden
    const forbiddenRootDirs = [
      "components",
      "src",
      "app",
      "pages",
      "lib",
      "config",
      "tests",
    ];
    if (forbiddenRootDirs.includes(topLevelDir)) {
      // Fall through to block - this would create a forbidden root directory
    } else {
      // It's in an allowed subdirectory like docs/, tools/, templates/
      return { allow: true };
    }
  }

  const fileName = pathParts[pathParts.length - 1];
  const directoryToBlock = pathParts.length === 1 ? fileName : topLevelDir;

  // Block and provide helpful suggestion
  const suggestion =
    DIRECTORY_SUGGESTIONS[directoryToBlock] ||
    DIRECTORY_SUGGESTIONS[fileName] ||
    DIRECTORY_SUGGESTIONS[fileInfo.nameWithoutExt] ||
    getSuggestionByPattern(fileName);

  const errorMessage =
    ErrorFormatter.structure(
      `${directoryToBlock} in root directory`,
      suggestion,
    ) +
    `\n\n💡 AIPatternEnforcer is a META-PROJECT for creating templates.\n` +
    `   Application files belong in templates/[framework]/\n` +
    `   Documentation belongs in docs/\n` +
    `\n📖 See CLAUDE.md for complete directory structure`;

  return {
    block: true,
    message: errorMessage,
  };
}

function getSuggestionByPattern(fileName) {
  const lower = fileName.toLowerCase();

  if (
    lower.includes("component") ||
    lower.endsWith(".tsx") ||
    lower.endsWith(".jsx")
  ) {
    return "templates/[framework]/components/";
  }

  if (lower.includes("page") || lower.includes("route")) {
    return "templates/nextjs-app-router/app/";
  }

  if (lower.includes("hook") || lower.startsWith("use")) {
    return "templates/[framework]/hooks/";
  }

  if (lower.includes("util") || lower.includes("helper")) {
    return "templates/[framework]/lib/";
  }

  if (lower.endsWith(".md") && !lower.includes("readme")) {
    return "docs/[category]/";
  }

  if (lower.includes("test") || lower.includes("spec")) {
    return "tests/ or templates/[framework]/tests/";
  }

  if (lower.includes("script")) {
    return "scripts/";
  }

  if (lower.includes("config") || lower.endsWith(".config.js")) {
    return "templates/[framework]/ or config/";
  }

  return "appropriate subdirectory (see CLAUDE.md)";
}

// Run the hook
const runner = new HookRunner("block-root-mess", { timeout: 1500 });
runner.run(blockRootMess);

module.exports = {
  getSuggestionByPattern,
  ALLOWED_ROOT_FILES,
  DIRECTORY_SUGGESTIONS,
  blockRootMess,
};
