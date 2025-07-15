const fs = require("fs");
const path = require("path");

/**
 * PathResolver - Supports both old and new hook paths during transition
 */
class PathResolver {
  constructor() {
    this.basePath = path.join(__dirname, "..");
    this.categoryMapping = {
      "ai-patterns": [
        "prevent-improved-files.js",
        "context-validator.js",
        "streaming-pattern-enforcer.js",
      ],
      cleanup: ["fix-console-logs.js", "import-janitor.js", "docs-enforcer.js"],
      "project-boundaries": [
        "block-root-mess.js",
        "enterprise-antibody.js",
        "meta-project-guardian.js",
      ],
      "local-dev": ["localhost-enforcer.js", "mock-data-enforcer.js"],
      validation: [
        "validate-prisma.js",
        "api-validator.js",
        "template-integrity-validator.js",
      ],
      architecture: ["architecture-validator.js", "test-location-enforcer.js"],
      performance: ["performance-guardian.js", "vector-db-hygiene.js"],
      security: ["scope-limiter.js", "security-scan.js"],
    };
  }

  /**
   * Resolve hook path - try new categorized path first, fall back to old path
   * @param {string} hookName - Name of the hook file
   * @returns {string} - Resolved path to hook file
   */
  resolveHookPath(hookName) {
    // Try to find in categorized structure first
    for (const [category, hooks] of Object.entries(this.categoryMapping)) {
      if (hooks.includes(hookName)) {
        const newPath = path.join(this.basePath, category, hookName);
        if (fs.existsSync(newPath)) {
          return newPath;
        }
      }
    }

    // Fall back to old flat structure
    const oldPath = path.join(this.basePath, hookName);
    if (fs.existsSync(oldPath)) {
      return oldPath;
    }

    throw new Error(`Hook not found: ${hookName}`);
  }

  /**
   * Get all hooks in a category
   * @param {string} category - Category name
   * @returns {Array} - Array of hook file paths
   */
  getHooksInCategory(category) {
    const hooks = this.categoryMapping[category] || [];
    return hooks.map((hookName) => this.resolveHookPath(hookName));
  }

  /**
   * Get all available categories
   * @returns {Array} - Array of category names
   */
  getCategories() {
    return Object.keys(this.categoryMapping);
  }
}

module.exports = PathResolver;
