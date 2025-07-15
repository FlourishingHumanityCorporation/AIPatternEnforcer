/**
 * Error formatting utilities for hooks
 */
class ErrorFormatter {
  /**
   * Format a hook blocking message
   */
  static formatBlockMessage(title, details, suggestions = []) {
    let message = `🚫 ${title}\n\n`;

    if (Array.isArray(details)) {
      details.forEach((detail) => {
        message += `❌ ${detail}\n`;
      });
    } else {
      message += `❌ ${details}\n`;
    }

    if (suggestions.length > 0) {
      message += `\n✅ Suggestions:\n`;
      suggestions.forEach((suggestion) => {
        message += `   • ${suggestion}\n`;
      });
    }

    return message;
  }

  /**
   * Format a warning message
   */
  static formatWarning(title, details) {
    let message = `⚠️ ${title}\n`;

    if (Array.isArray(details)) {
      details.forEach((detail) => {
        message += `   ${detail}\n`;
      });
    } else {
      message += `   ${details}\n`;
    }

    return message;
  }

  /**
   * Format file path for display
   */
  static formatFilePath(filePath, projectRoot = process.cwd()) {
    const path = require("path");
    try {
      return path.relative(projectRoot, filePath);
    } catch {
      return filePath;
    }
  }

  /**
   * Format pattern match details
   */
  static formatPatternMatch(match, context = "") {
    let formatted = `Pattern: ${match.pattern}\n`;
    formatted += `Match: "${match.match}"\n`;

    if (context) {
      formatted += `Context: ${context}\n`;
    }

    if (match.index !== undefined) {
      formatted += `Position: ${match.index}\n`;
    }

    return formatted;
  }

  /**
   * Create a summary of multiple issues
   */
  static createIssueSummary(issues, maxDisplay = 3) {
    if (issues.length === 0) return "";

    let summary = "";
    const displayed = issues.slice(0, maxDisplay);

    displayed.forEach((issue, index) => {
      summary += `${index + 1}. ${issue.message || issue}\n`;
    });

    if (issues.length > maxDisplay) {
      summary += `... and ${issues.length - maxDisplay} more issues\n`;
    }

    return summary;
  }

  /**
   * Format structure violations for file organization
   */
  static structure(problem, suggestion) {
    return `🚫 Don't create ${problem}\n✅ Use ${suggestion} instead`;
  }

  /**
   * Format file operation context
   */
  static formatFileOperation(operation, filePath, content = "") {
    const FileAnalyzer = require("./FileAnalyzer");
    const fileInfo = FileAnalyzer.extractFileInfo(filePath);

    let context = `Operation: ${operation}\n`;
    context += `File: ${fileInfo.fileName}\n`;
    context += `Path: ${this.formatFilePath(filePath)}\n`;
    context += `Type: ${fileInfo.extension || "unknown"}\n`;

    if (content) {
      const lineCount = content.split("\n").length;
      context += `Lines: ${lineCount}\n`;
    }

    return context;
  }
}

module.exports = ErrorFormatter;
