#!/usr/bin/env node

/**
 * Execution Context for Learning Hook System
 * Captures comprehensive context data for learning and analysis
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");

class ExecutionContext {
  constructor(hookData, runner) {
    this.hookData = hookData;
    this.runner = runner;
    this.timestamp = Date.now();
    this.context = null;
  }

  /**
   * Capture comprehensive execution context
   */
  async capture() {
    if (this.context) return this.context;

    this.context = {
      // Basic execution context
      hookName: this.runner.name,
      hookFamily: this.runner.family,
      hookPriority: this.runner.priority,
      executionId: this.runner.executionId,
      timestamp: this.timestamp,

      // File analysis
      filePath: this.hookData.filePath || this.hookData.file_path,
      fileExtension: this.getFileExtension(),
      contentHash: await this.calculateContentHash(),
      fileSize: await this.getFileSize(),
      codeComplexity: await this.analyzeCodeComplexity(),

      // Pattern analysis
      architecturalPatterns: await this.detectArchitecturalPatterns(),
      codePatterns: await this.extractCodePatterns(),
      usagePatterns: await this.detectUsagePatterns(),

      // System context
      systemLoad: await this.getSystemLoad(),
      memoryUsage: await this.getMemoryUsage(),
      recentActivity: await this.getRecentActivity(),
      userBehavior: await this.analyzeUserBehavior(),

      // Environment context
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      workingDirectory: process.cwd(),

      // Time context
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      isWeekend: this.isWeekend(),

      // Project context
      projectType: await this.detectProjectType(),
      frameworks: await this.detectFrameworks(),
    };

    return this.context;
  }

  /**
   * Get file extension
   */
  getFileExtension() {
    const filePath = this.hookData.filePath || this.hookData.file_path;
    return filePath ? path.extname(filePath).toLowerCase() : null;
  }

  /**
   * Calculate content hash for deduplication
   */
  async calculateContentHash() {
    const content = this.hookData.content || this.hookData.new_string;
    if (!content) return null;

    return crypto.createHash("md5").update(content).digest("hex");
  }

  /**
   * Get file size
   */
  async getFileSize() {
    const filePath = this.hookData.filePath || this.hookData.file_path;
    if (!filePath) return null;

    try {
      const stats = await fs.promises.stat(filePath);
      return stats.size;
    } catch (error) {
      return null;
    }
  }

  /**
   * Analyze code complexity
   */
  async analyzeCodeComplexity() {
    const content = this.hookData.content || this.hookData.new_string;
    if (!content) return null;

    const lines = content.split("\n");
    const complexity = {
      lineCount: lines.length,
      functionCount: (content.match(/function\s+\w+|=>\s*\{|\w+\s*\(/g) || [])
        .length,
      classCount: (content.match(/class\s+\w+/g) || []).length,
      importCount: (content.match(/import\s+|require\s*\(/g) || []).length,
      conditionalCount: (
        content.match(/if\s*\(|switch\s*\(|while\s*\(|for\s*\(/g) || []
      ).length,
      tryCount: (content.match(/try\s*\{|catch\s*\(/g) || []).length,
      cyclomaticComplexity: this.calculateCyclomaticComplexity(content),
      nestingDepth: this.calculateNestingDepth(content),
    };

    return complexity;
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateCyclomaticComplexity(content) {
    const patterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g,
    ];

    let complexity = 1; // Base complexity

    patterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Calculate nesting depth
   */
  calculateNestingDepth(content) {
    let maxDepth = 0;
    let currentDepth = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      if (char === "{") {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === "}") {
        currentDepth--;
      }
    }

    return maxDepth;
  }

  /**
   * Detect architectural patterns
   */
  async detectArchitecturalPatterns() {
    const content = this.hookData.content || this.hookData.new_string;
    const filePath = this.hookData.filePath || this.hookData.file_path;

    if (!content && !filePath) return [];

    const patterns = [];

    // React patterns
    if ((content && content.includes("React")) || content.includes("jsx")) {
      patterns.push("react");
    }

    // Next.js patterns
    if (
      filePath &&
      (filePath.includes("app/") || filePath.includes("pages/"))
    ) {
      patterns.push("nextjs");
    }

    // Component patterns
    if (content && content.match(/export\s+(default\s+)?function\s+\w+/)) {
      patterns.push("functional-component");
    }

    // Hook patterns
    if (content && content.match(/use\w+/)) {
      patterns.push("react-hooks");
    }

    // API patterns
    if (filePath && filePath.includes("api/")) {
      patterns.push("api-route");
    }

    // Test patterns
    if (filePath && (filePath.includes("test") || filePath.includes("spec"))) {
      patterns.push("test-file");
    }

    return patterns;
  }

  /**
   * Extract code patterns
   */
  async extractCodePatterns() {
    const content = this.hookData.content || this.hookData.new_string;
    if (!content) return [];

    const patterns = [];

    // Import patterns
    const importMatches = content.match(
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    );
    if (importMatches) {
      patterns.push({
        type: "imports",
        patterns: importMatches.map(
          (match) => match.match(/from\s+['"]([^'"]+)['"]/)[1],
        ),
      });
    }

    // Function patterns
    const functionMatches = content.match(
      /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*)?=>)/g,
    );
    if (functionMatches) {
      patterns.push({
        type: "functions",
        count: functionMatches.length,
        patterns: functionMatches,
      });
    }

    // Variable patterns
    const varMatches = content.match(/(?:const|let|var)\s+(\w+)/g);
    if (varMatches) {
      patterns.push({
        type: "variables",
        count: varMatches.length,
      });
    }

    return patterns;
  }

  /**
   * Detect usage patterns
   */
  async detectUsagePatterns() {
    const patterns = [];

    // Tool usage pattern
    if (this.hookData.tool) {
      patterns.push({
        type: "tool_usage",
        tool: this.hookData.tool,
      });
    }

    // File operation pattern
    const filePath = this.hookData.filePath || this.hookData.file_path;
    if (filePath) {
      patterns.push({
        type: "file_operation",
        fileType: path.extname(filePath),
        directory: path.dirname(filePath),
      });
    }

    // Content modification pattern
    if (this.hookData.content || this.hookData.new_string) {
      patterns.push({
        type: "content_modification",
        hasContent: true,
      });
    }

    return patterns;
  }

  /**
   * Get system load
   */
  async getSystemLoad() {
    try {
      const loadAverage = os.loadavg();
      const cpuCount = os.cpus().length;

      return {
        loadAverage: loadAverage[0],
        loadPercent: (loadAverage[0] / cpuCount) * 100,
        cpuCount: cpuCount,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get memory usage
   */
  async getMemoryUsage() {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      return {
        totalMemory: totalMemory,
        freeMemory: freeMemory,
        usedMemory: usedMemory,
        usagePercent: (usedMemory / totalMemory) * 100,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get recent activity (simplified)
   */
  async getRecentActivity() {
    // This would track recent hook executions, file modifications, etc.
    // For now, return a simplified version
    return {
      recentExecutions: 0,
      recentFileModifications: 0,
      lastActivityTime: Date.now(),
    };
  }

  /**
   * Analyze user behavior patterns
   */
  async analyzeUserBehavior() {
    // This would analyze patterns like:
    // - Frequency of hook executions
    // - Types of operations performed
    // - Time patterns
    // For now, return basic information
    return {
      sessionDuration: Date.now() - this.timestamp,
      operationType: this.hookData.tool || "unknown",
      workingHours: this.isWorkingHours(),
    };
  }

  /**
   * Check if it's weekend
   */
  isWeekend() {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  }

  /**
   * Check if it's working hours
   */
  isWorkingHours() {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17;
  }

  /**
   * Detect project type
   */
  async detectProjectType() {
    const cwd = process.cwd();

    try {
      // Check package.json for project type
      const packageJsonPath = path.join(cwd, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8"),
        );

        if (packageJson.dependencies) {
          if (packageJson.dependencies["next"]) return "nextjs";
          if (packageJson.dependencies["react"]) return "react";
          if (packageJson.dependencies["express"]) return "express";
          if (packageJson.dependencies["vue"]) return "vue";
        }
      }

      // Check for framework-specific files
      if (fs.existsSync(path.join(cwd, "next.config.js"))) return "nextjs";
      if (fs.existsSync(path.join(cwd, "vue.config.js"))) return "vue";
      if (fs.existsSync(path.join(cwd, "angular.json"))) return "angular";

      return "unknown";
    } catch (error) {
      return "unknown";
    }
  }

  /**
   * Detect frameworks
   */
  async detectFrameworks() {
    const cwd = process.cwd();
    const frameworks = [];

    try {
      const packageJsonPath = path.join(cwd, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8"),
        );

        const allDependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        // Check for common frameworks
        const frameworkPatterns = {
          react: ["react"],
          nextjs: ["next"],
          vue: ["vue"],
          angular: ["@angular/core"],
          express: ["express"],
          fastify: ["fastify"],
          tailwind: ["tailwindcss"],
          typescript: ["typescript"],
          eslint: ["eslint"],
          jest: ["jest"],
          prisma: ["prisma", "@prisma/client"],
        };

        Object.entries(frameworkPatterns).forEach(([framework, patterns]) => {
          if (patterns.some((pattern) => allDependencies[pattern])) {
            frameworks.push(framework);
          }
        });
      }
    } catch (error) {
      // Ignore errors in framework detection
    }

    return frameworks;
  }

  /**
   * Serialize context for storage
   */
  serialize() {
    return JSON.stringify(this.context);
  }

  /**
   * Get fingerprint for similar contexts
   */
  getFingerprint() {
    const key = [
      this.context?.hookName,
      this.context?.fileExtension,
      this.context?.projectType,
      this.context?.frameworks?.join(","),
    ].join("|");

    return crypto.createHash("md5").update(key).digest("hex");
  }
}

module.exports = ExecutionContext;
