#!/usr/bin/env node
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");
const { execSync } = require("child_process");

class ContextLoader {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.contextSources = [
    ".cursorrules",
    "ai/config/.cursorrules",
    "CLAUDE.md",
    "docs/architecture/README.md"];

    this.recentFilesCache = path.join(
      this.projectRoot,
      ".context-cache",
      "recent-files.json"
    );
    this.maxTokens = 4000;
    this.recentFilesCount = 5;
  }

  findProjectRoot() {
    let currentDir = process.cwd();
    while (currentDir !== "/") {
      if (
      fs.existsSync(path.join(currentDir, "package.json")) ||
      fs.existsSync(path.join(currentDir, ".git")))
      {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return process.cwd();
  }

  async build(targetFile = null) {
    const spinner = ora("Building AI context...").start();

    try {
      const contextParts = [];
      let tokenCount = 0;

      // 1. Load project rules
      spinner.text = "Loading project rules...";
      const rules = await this.loadProjectRules();
      if (rules) {
        contextParts.push({
          title: "# Project Rules and Context",
          content: rules,
          tokens: this.estimateTokens(rules)
        });
        tokenCount += this.estimateTokens(rules);
      }

      // 2. Add current file context if specified
      if (targetFile) {
        spinner.text = "Analyzing target file...";
        const fileContext = await this.getFileContext(targetFile);
        if (fileContext) {
          contextParts.push({
            title: "## Current File",
            content: fileContext,
            tokens: this.estimateTokens(fileContext)
          });
          tokenCount += this.estimateTokens(fileContext);
        }
      }

      // 3. Add recent files
      spinner.text = "Loading recent files...";
      const recentFiles = await this.getRecentFiles();
      if (recentFiles && tokenCount < this.maxTokens * 0.7) {
        contextParts.push({
          title: "## Recent Context",
          content: recentFiles,
          tokens: this.estimateTokens(recentFiles)
        });
        tokenCount += this.estimateTokens(recentFiles);
      }

      // 4. Add git context
      spinner.text = "Loading git context...";
      const gitContext = await this.getGitContext();
      if (gitContext && tokenCount < this.maxTokens * 0.8) {
        contextParts.push({
          title: "## Current Git State",
          content: gitContext,
          tokens: this.estimateTokens(gitContext)
        });
        tokenCount += this.estimateTokens(gitContext);
      }

      // 5. Add architecture context
      if (targetFile && tokenCount < this.maxTokens * 0.9) {
        spinner.text = "Loading architecture docs...";
        const archContext = await this.getArchitectureContext(targetFile);
        if (archContext) {
          contextParts.push({
            title: "## Architecture Context",
            content: archContext,
            tokens: this.estimateTokens(archContext)
          });
          tokenCount += this.estimateTokens(archContext);
        }
      }

      // Build final context
      const finalContext = contextParts.
      map((part) => `${part.title}\n\n${part.content}`).
      join("\n\n---\n\n");

      spinner.succeed(
        chalk.green(`Context built successfully (${tokenCount} tokens)`)
      );

      return {
        context: finalContext,
        tokenCount,
        parts: contextParts.length
      };
    } catch (error) {
      spinner.fail(chalk.red("Failed to build context"));
      throw error;
    }
  }

  async loadProjectRules() {
    for (const source of this.contextSources) {
      const filePath = path.join(this.projectRoot, source);
      try {
        const content = await fsPromises.readFile(filePath, "utf8");
        if (content) {
          // For large files, extract key sections
          if (content.length > 5000) {
            return this.extractKeyRuleSections(content);
          }
          return content;
        }
      } catch {

        // Continue to next source
      }}
    return null;
  }

  extractKeyRuleSections(content) {
    const sections = [];

    // Extract critical rules
    const criticalMatch = content.match(
      /## [🛑🚨]*\s*CRITICAL RULES[\s\S]*?(?=\n##|$)/i
    );
    if (criticalMatch) {
      sections.push(criticalMatch[0]);
    }

    // Extract quick reference
    const quickRefMatch = content.match(
      /## [🎯]*\s*QUICK REFERENCE[\s\S]*?(?=\n##|$)/i
    );
    if (quickRefMatch) {
      sections.push(quickRefMatch[0].substring(0, 1000) + "...");
    }

    // Extract architecture section
    const archMatch = content.match(
      /##\s*(?:TECHNICAL\s+)?ARCHITECTURE[\s\S]*?(?=\n##|$)/i
    );
    if (archMatch) {
      sections.push(archMatch[0].substring(0, 800) + "...");
    }

    return sections.join("\n\n---\n\n");
  }

  async getFileContext(filePath) {
    try {
      const content = await fsPromises.readFile(filePath, "utf8");
      const stats = await fsPromises.stat(filePath);
      const relativePath = path.relative(this.projectRoot, filePath);

      const lines = content.split("\n");
      const imports = this.extractImports(content);
      const exports = this.extractExports(content);

      let context = `- **File**: ${relativePath}\n`;
      context += `- **Size**: ${this.formatBytes(stats.size)}\n`;
      context += `- **Lines**: ${lines.length}\n`;
      context += `- **Language**: ${path.extname(filePath).substring(1) || "unknown"}\n`;

      if (imports.length > 0) {
        context += `- **Imports**: ${imports.slice(0, 5).join(", ")}${imports.length > 5 ? "..." : ""}\n`;
      }

      if (exports.length > 0) {
        context += `- **Exports**: ${exports.slice(0, 5).join(", ")}${exports.length > 5 ? "..." : ""}\n`;
      }

      // Add file preview for small files
      if (lines.length < 50) {
        context += "\n### Content Preview\n```\n" + content + "\n```";
      } else {
        // For large files, show structure
        context += "\n### Structure Preview\n```\n";
        context += lines.slice(0, 20).join("\n");
        context += "\n...\n";
        context += lines.slice(-10).join("\n");
        context += "\n```";
      }

      return context;
    } catch (error) {
      return null;
    }
  }

  extractImports(content) {
    const imports = [];

    // ES6 imports
    const es6Regex = /import\s+(?:{[^}]+}|[^'"]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = es6Regex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // CommonJS requires
    const cjsRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = cjsRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return [...new Set(imports)];
  }

  extractExports(content) {
    const exports = [];

    // Named exports
    const namedRegex = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
    let match;
    while ((match = namedRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    // Default export
    if (/export\s+default\s+/g.test(content)) {
      exports.push("default");
    }

    return exports;
  }

  async getRecentFiles() {
    try {
      // Try to load from cache
      const cacheData = await this.loadRecentFilesCache();
      if (cacheData && cacheData.files.length > 0) {
        const files = cacheData.files.slice(0, this.recentFilesCount);
        const context = ["Recently edited files:"];

        for (const file of files) {
          const relativePath = path.relative(this.projectRoot, file.path);
          const timeAgo = this.getTimeAgo(new Date(file.timestamp));
          context.push(`- ${relativePath} (${timeAgo})`);
        }

        return context.join("\n");
      }
    } catch {

      // Cache not available
    }
    // Fallback to git
    try {
      const recentFiles = execSync(
        'git log --name-only --pretty=format: -n 20 | grep -v "^$" | sort | uniq | head -10',
        { cwd: this.projectRoot, encoding: "utf8" }
      ).
      trim().
      split("\n").
      filter(Boolean);

      if (recentFiles.length > 0) {
        return (
          "Recently changed files (from git):\n- " + recentFiles.join("\n- "));

      }
    } catch {

      // Git not available
    }
    return null;
  }

  async getGitContext() {
    try {
      const branch = execSync("git branch --show-current", {
        cwd: this.projectRoot,
        encoding: "utf8"
      }).trim();

      const status = execSync("git status --short", {
        cwd: this.projectRoot,
        encoding: "utf8"
      }).trim();

      const recentCommits = execSync("git log --oneline -5", {
        cwd: this.projectRoot,
        encoding: "utf8"
      }).trim();

      let context = `- **Current Branch**: ${branch}\n`;

      if (status) {
        const changes = status.split("\n").length;
        context += `- **Uncommitted Changes**: ${changes} files\n`;
        context += "\n### Changed Files\n```\n" + status + "\n```";
      }

      context += "\n### Recent Commits\n```\n" + recentCommits + "\n```";

      return context;
    } catch {
      return null;
    }
  }

  async getArchitectureContext(filePath) {
    const component = this.detectComponent(filePath);
    const possibleDocs = [
    `docs/architecture/patterns/${component}.md`,
    `docs/architecture/decisions/*${component}*.md`,
    `docs/guides/${component}/*.md`];


    for (const pattern of possibleDocs) {
      const files = await this.findFiles(pattern);
      if (files.length > 0) {
        try {
          const content = await fsPromises.readFile(files[0], "utf8");
          // Return first section or summary
          const lines = content.split("\n");
          const firstSection = [];
          let foundContent = false;

          for (const line of lines) {
            if (line.startsWith("##") && foundContent) break;
            if (line.trim()) foundContent = true;
            firstSection.push(line);
            if (firstSection.length > 30) break;
          }

          return firstSection.join("\n") + "\n...";
        } catch {

          // Continue to next
        }}
    }

    return null;
  }

  detectComponent(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const parts = relativePath.split(path.sep);

    // Look for feature/component indicators
    for (let i = 0; i < parts.length - 1; i++) {
      if (
      ["components", "features", "services", "api", "modules"].includes(
        parts[i]
      ))
      {
        return parts[i + 1];
      }
    }

    return path.basename(filePath, path.extname(filePath));
  }

  async findFiles(pattern) {
    const glob = require("glob");
    return new Promise((resolve) => {
      glob(pattern, { cwd: this.projectRoot }, (err, files) => {
        resolve(err ? [] : files.map((f) => path.join(this.projectRoot, f)));
      });
    });
  }

  async saveToFile(context, outputPath) {
    await fsPromises.writeFile(outputPath, context, "utf8");
  }

  async copyToClipboard(context) {
    try {
      if (process.platform === "darwin") {
        execSync("pbcopy", { input: context });
      } else if (process.platform === "linux") {
        execSync("xclip -selection clipboard", { input: context });
      } else if (process.platform === "win32") {
        execSync("clip", { input: context });
      }
      return true;
    } catch {
      return false;
    }
  }

  async loadRecentFilesCache() {
    try {
      const data = await fsPromises.readFile(this.recentFilesCache, "utf8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async updateRecentFile(filePath) {
    try {
      let cache = (await this.loadRecentFilesCache()) || { files: [] };

      // Remove if already exists
      cache.files = cache.files.filter((f) => f.path !== filePath);

      // Add to front
      cache.files.unshift({
        path: filePath,
        timestamp: new Date().toISOString()
      });

      // Keep only recent
      cache.files = cache.files.slice(0, 20);

      // Ensure directory exists
      await fsPromises.mkdir(path.dirname(this.recentFilesCache), {
        recursive: true
      });

      // Save
      await fsPromises.writeFile(
        this.recentFilesCache,
        JSON.stringify(cache, null, 2)
      );
    } catch {

      // Cache update failed, not critical
    }}

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  formatBytes(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " hours ago";
    if (seconds < 604800) return Math.floor(seconds / 86400) + " days ago";

    return date.toLocaleDateString();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const loader = new ContextLoader();

  // Parse arguments
  let targetFile = null;
  let outputFile = null;
  let shouldCopy = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-f" || args[i] === "--file") {
      targetFile = args[++i];
    } else if (args[i] === "-o" || args[i] === "--output") {
      outputFile = args[++i];
      shouldCopy = false;
    } else if (args[i] === "--no-copy") {
      shouldCopy = false;
    } else if (args[i] === "-h" || args[i] === "--help") {
      showHelp();
      return;
    } else if (!targetFile) {
      targetFile = args[i];
    }
  }

  try {
    // Update recent files if target specified
    if (targetFile) {
      const absolutePath = path.resolve(targetFile);
      await loader.updateRecentFile(absolutePath);
    }

    // Build context
    const result = await loader.build(targetFile);

    // Output
    if (outputFile) {
      await loader.saveToFile(result.context, outputFile);
      logger.info(chalk.green(`✅ Context saved to ${outputFile}`));
    } else {
      logger.info("\n" + chalk.blue("=== AI Context ===\n"));
      logger.info(result.context);
    }

    // Copy to clipboard
    if (shouldCopy) {
      const copied = await loader.copyToClipboard(result.context);
      if (copied) {
        logger.info(chalk.green("\n✅ Context copied to clipboard!"));
      }
    }

    // Show stats
    logger.info(
      chalk.gray(
        `\n📊 Stats: ${result.tokenCount} tokens, ${result.parts} sections`
      ));

  } catch (error) {
    logger.error(chalk.red("Error:"), error.message);
    process.exit(1);
  }
}

function showHelp() {
  logger.info(`
${chalk.blue("AI Context Loader")}

Load intelligent context for AI-assisted development.

${chalk.yellow("Usage:")}
  context-loader [options] [file]

${chalk.yellow("Options:")}
  -f, --file <path>     Target file to build context for
  -o, --output <path>   Save context to file instead of stdout
  --no-copy             Don't copy to clipboard
  -h, --help            Show this help

${chalk.yellow("Examples:")}
  context-loader                           # Load general project context
  context-loader src/index.js              # Load context for specific file
  context-loader -o context.md             # Save to file
  context-loader --file src/app.js --no-copy  # Don't copy to clipboard
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ContextLoader;