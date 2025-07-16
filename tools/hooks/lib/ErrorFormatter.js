/**
 * Enhanced error formatting utilities for hooks
 * Provides rich context, file locations, and specific fix suggestions
 * for improved AI development debugging experience
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

  /**
   * Enhanced error formatting with rich context and debugging information
   */
  static formatEnhancedError(error, context = {}) {
    const {
      filePath,
      hookName,
      pattern,
      lineNumber,
      columnNumber,
      content,
      suggestions = [],
    } = context;

    let message = `🚫 ${error.title || "Hook Validation Error"}\n\n`;

    // File location context
    if (filePath) {
      message += `📁 File: ${this.formatFilePath(filePath)}\n`;

      if (lineNumber) {
        message += `📍 Location: Line ${lineNumber}${columnNumber ? `, Column ${columnNumber}` : ""}\n`;
      }
    }

    // Hook context
    if (hookName) {
      message += `🔗 Hook: ${hookName}\n`;
    }

    // Pattern context
    if (pattern) {
      message += `🎯 Pattern: ${pattern}\n`;
    }

    message += "\n";

    // Error details
    if (error.details) {
      if (Array.isArray(error.details)) {
        error.details.forEach((detail, index) => {
          message += `❌ ${index + 1}. ${detail}\n`;
        });
      } else {
        message += `❌ ${error.details}\n`;
      }
    }

    // Code context if available
    if (content && lineNumber) {
      message += "\n📝 Code Context:\n";
      message += this.formatCodeContext(content, lineNumber, 2);
    }

    // Enhanced suggestions
    if (suggestions.length > 0) {
      message += "\n✅ Suggested Fixes:\n";
      suggestions.forEach((suggestion, index) => {
        message += `   ${index + 1}. ${suggestion}\n`;
      });
    }

    // Debugging information
    message += "\n🔍 Debug Information:\n";
    message += `   Hook Path: ${this.getHookPath(hookName)}\n`;
    message += `   Timestamp: ${new Date().toISOString()}\n`;
    message += `   Process: ${process.pid}\n`;

    return message;
  }

  /**
   * Format code context around a specific line
   */
  static formatCodeContext(content, lineNumber, contextLines = 2) {
    const lines = content.split("\n");
    const startLine = Math.max(0, lineNumber - contextLines - 1);
    const endLine = Math.min(lines.length, lineNumber + contextLines);

    let context = "";
    for (let i = startLine; i < endLine; i++) {
      const currentLine = i + 1;
      const isTargetLine = currentLine === lineNumber;
      const prefix = isTargetLine ? "→" : " ";
      const lineNum = currentLine.toString().padStart(3, " ");

      context += `${prefix}${lineNum}: ${lines[i]}\n`;

      if (isTargetLine) {
        // Add pointer to exact column if available
        context += `    ${" ".repeat(lineNum.length + 1)}${"~".repeat(Math.min(lines[i].length, 50))}\n`;
      }
    }

    return context;
  }

  /**
   * Get specific suggestions based on common error patterns
   */
  static getContextualSuggestions(errorType, filePath, content = "") {
    const fileExt = filePath.split(".").pop();
    const suggestions = [];

    switch (errorType) {
      case "improved-file":
        suggestions.push(
          "Edit the original file instead of creating a new one",
        );
        suggestions.push(
          'Use descriptive names like "component-new.tsx" instead of "component_improved.tsx"',
        );
        suggestions.push(
          "Consider using git branches for experimental changes",
        );
        break;

      case "root-violation":
        suggestions.push(
          "Move application files to appropriate subdirectories",
        );
        suggestions.push(
          'Use "app/" for Next.js pages and "components/" for React components',
        );
        suggestions.push("Keep only configuration files in the root directory");
        break;

      case "security-vulnerability":
        if (content.includes("innerHTML")) {
          suggestions.push(
            "Use textContent instead of innerHTML for user data",
          );
          suggestions.push("If HTML is needed, use DOMPurify.sanitize()");
          suggestions.push(
            "Consider using a templating library for safe HTML generation",
          );
        }
        if (content.includes("eval")) {
          suggestions.push("Avoid using eval() - use JSON.parse() for data");
          suggestions.push("Use Function constructor only for trusted code");
          suggestions.push(
            "Consider using a safe expression evaluator library",
          );
        }
        break;

      case "console-log":
        suggestions.push('Use proper logging: import logger from "lib/logger"');
        suggestions.push(
          "For debugging, use logger.debug() instead of console.log()",
        );
        suggestions.push("Remove console statements before committing");
        break;

      case "missing-context":
        suggestions.push(
          'Include architectural references like "@lib/auth patterns"',
        );
        suggestions.push(
          "Reference existing components or patterns being followed",
        );
        suggestions.push("Add context about why this change is needed");
        break;

      default:
        suggestions.push(
          "Check the hook documentation for specific requirements",
        );
        suggestions.push(
          'Use "npm run debug:hooks test <hook-name>" to test this hook',
        );
        suggestions.push("Review similar files in the codebase for patterns");
    }

    // Add file type specific suggestions
    if (fileExt === "tsx" || fileExt === "jsx") {
      suggestions.push("Follow React component naming conventions");
      suggestions.push("Use TypeScript types for better code safety");
    }

    return suggestions;
  }

  /**
   * Get hook path for debugging information
   */
  static getHookPath(hookName) {
    if (!hookName) return "Unknown hook";

    const hookCategories = [
      "ai-patterns",
      "architecture",
      "cleanup",
      "local-dev",
      "performance",
      "project-boundaries",
      "security",
      "validation",
    ];

    for (const category of hookCategories) {
      const path = `tools/hooks/${category}/${hookName}.js`;
      try {
        const fs = require("fs");
        if (fs.existsSync(path)) {
          return path;
        }
      } catch (e) {
        // Continue searching
      }
    }

    return `tools/hooks/**/${hookName}.js`;
  }

  /**
   * Format debugging command suggestions
   */
  static formatDebugCommands(hookName, filePath = "") {
    const commands = [];

    if (hookName) {
      commands.push(`npm run debug:hooks test ${hookName}`);
    }

    commands.push("npm run debug:hooks diagnose");
    commands.push("npm run debug:hooks env");

    if (filePath) {
      const fileName = filePath.split("/").pop();
      commands.push(`npm run debug:hooks logs ${fileName}`);
    }

    let message = "\n🛠️  Debug Commands:\n";
    commands.forEach((cmd) => {
      message += `   ${cmd}\n`;
    });

    return message;
  }

  /**
   * Format performance context for slow hooks
   */
  static formatPerformanceContext(executionTime, threshold = 500) {
    if (executionTime < threshold) return "";

    let message = "\n⚡ Performance Information:\n";
    message += `   Execution Time: ${executionTime}ms\n`;
    message += `   Threshold: ${threshold}ms\n`;

    if (executionTime > threshold * 2) {
      message +=
        "   ⚠️  This hook is running significantly slower than expected\n";
      message += "   💡 Consider optimizing patterns or reducing file I/O\n";
    }

    return message;
  }

  /**
   * All-in-one enhanced error formatter
   */
  static formatComprehensiveError(options = {}) {
    const {
      title = "Hook Validation Error",
      details = [],
      hookName = "",
      filePath = "",
      lineNumber = null,
      columnNumber = null,
      content = "",
      pattern = "",
      errorType = "generic",
      executionTime = 0,
      suggestions = [],
    } = options;

    // Get contextual suggestions
    const contextualSuggestions = this.getContextualSuggestions(
      errorType,
      filePath,
      content,
    );
    const allSuggestions = [...suggestions, ...contextualSuggestions];

    // Format main error
    let message = this.formatEnhancedError(
      { title, details },
      {
        filePath,
        hookName,
        pattern,
        lineNumber,
        columnNumber,
        content,
        suggestions: allSuggestions,
      },
    );

    // Add performance context if relevant
    message += this.formatPerformanceContext(executionTime);

    // Add debug commands
    message += this.formatDebugCommands(hookName, filePath);

    return message;
  }
}

module.exports = ErrorFormatter;
