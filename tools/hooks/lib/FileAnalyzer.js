const path = require("path");

/**
 * File analysis utilities for hooks
 */
class FileAnalyzer {
  /**
   * Extract file information from a path
   */
  static extractFileInfo(filePath) {
    const normalized = path.normalize(filePath);
    const parsed = path.parse(normalized);

    return {
      fullPath: normalized,
      fileName: parsed.base,
      name: parsed.name,
      extension: parsed.ext,
      directory: parsed.dir,
      isAbsolute: path.isAbsolute(filePath),

      // Helper methods
      isInTools() {
        return (
          normalized.includes("/tools/") || normalized.includes("\\tools\\")
        );
      },

      isInTests() {
        return (
          normalized.includes("/test/") ||
          normalized.includes("\\test\\") ||
          normalized.includes("__tests__") ||
          normalized.includes(".test.") ||
          normalized.includes(".spec.")
        );
      },

      isInDocs() {
        return normalized.includes("/docs/") || normalized.includes("\\docs\\");
      },

      isInRoot() {
        const parts = normalized.split(/[/\\]/);
        return parts.length <= 2; // Root or one level deep
      },
    };
  }

  /**
   * Check if file is a code file
   */
  static isCodeFile(filePath) {
    const codeExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".mjs",
      ".cjs",
      ".py",
      ".go",
      ".rs",
      ".java",
      ".cpp",
      ".c",
      ".h",
      ".php",
      ".rb",
      ".swift",
      ".kt",
      ".cs",
      ".vb",
    ];

    const ext = path.extname(filePath).toLowerCase();
    return codeExtensions.includes(ext);
  }

  /**
   * Check if file is a configuration file
   */
  static isConfigFile(filePath) {
    const configPatterns = [
      /\.env/,
      /config\./,
      /\.json$/,
      /\.yaml$/,
      /\.yml$/,
      /\.toml$/,
      /\.ini$/,
      /package\.json$/,
      /tsconfig\.json$/,
      /\.config\./,
    ];

    return configPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Check if file is documentation
   */
  static isDocumentationFile(filePath) {
    const docExtensions = [".md", ".txt", ".rst", ".adoc"];
    const ext = path.extname(filePath).toLowerCase();
    return docExtensions.includes(ext);
  }

  /**
   * Get relative path from project root
   */
  static getRelativePath(filePath, projectRoot = process.cwd()) {
    return path.relative(projectRoot, filePath);
  }
}

module.exports = FileAnalyzer;
