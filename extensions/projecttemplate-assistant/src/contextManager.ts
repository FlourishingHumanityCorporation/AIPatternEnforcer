import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export class ContextManager {
  private context: vscode.ExtensionContext;
  private contextCache: Map<string, string>;
  private recentFiles: string[];
  private fileRelationships: Map<string, Set<string>>;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.contextCache = new Map();
    this.recentFiles = context.workspaceState.get("recentFiles", []);
    this.fileRelationships = new Map();
  }

  async buildContext(document: vscode.TextDocument): Promise<string> {
    const config = vscode.workspace.getConfiguration("projecttemplate");
    const maxTokens = config.get<number>("maxContextTokens", 4000);

    // Check cache first
    const cacheKey = this.getCacheKey(document);
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey)!;
    }

    const contextParts: string[] = [];
    let currentTokens = 0;

    // 1. Load project rules
    const rules = await this.loadProjectRules();
    if (rules) {
      contextParts.push("# Project Rules and Context\n\n" + rules);
      currentTokens += this.estimateTokens(rules);
    }

    // 2. Add current file info
    const currentFileInfo = this.getCurrentFileInfo(document);
    contextParts.push("\n## Current File\n" + currentFileInfo);
    currentTokens += this.estimateTokens(currentFileInfo);

    // 3. Add recent files context
    const recentContext = await this.getRecentFilesContext();
    if (
      recentContext &&
      currentTokens + this.estimateTokens(recentContext) < maxTokens
    ) {
      contextParts.push("\n## Recent Context\n" + recentContext);
      currentTokens += this.estimateTokens(recentContext);
    }

    // 4. Add related files
    const relatedFiles = await this.findRelatedFiles(document);
    if (relatedFiles.length > 0 && currentTokens < maxTokens * 0.8) {
      const relatedContext = await this.getRelatedFilesContext(
        relatedFiles,
        maxTokens - currentTokens,
      );
      if (relatedContext) {
        contextParts.push("\n## Related Files\n" + relatedContext);
        currentTokens += this.estimateTokens(relatedContext);
      }
    }

    // 5. Add architecture context if relevant
    const archContext = await this.getArchitectureContext(document);
    if (
      archContext &&
      currentTokens + this.estimateTokens(archContext) < maxTokens
    ) {
      contextParts.push("\n## Architecture Context\n" + archContext);
      currentTokens += this.estimateTokens(archContext);
    }

    // 6. Add relevant patterns
    const patterns = await this.getRelevantPatterns(document);
    if (patterns && currentTokens + this.estimateTokens(patterns) < maxTokens) {
      contextParts.push("\n## Relevant Patterns\n" + patterns);
    }

    const finalContext = contextParts.join("\n");

    // Cache the result
    this.contextCache.set(cacheKey, finalContext);

    // Clean cache if too large
    if (this.contextCache.size > 10) {
      const oldestKey = this.contextCache.keys().next().value;
      this.contextCache.delete(oldestKey);
    }

    return finalContext;
  }

  private async loadProjectRules(): Promise<string | null> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return null;

    const config = vscode.workspace.getConfiguration("projecttemplate");
    const contextSources = config.get<string[]>("contextSources", [
      ".cursorrules",
      "ai/config/.cursorrules",
      "CLAUDE.md",
    ]);

    for (const source of contextSources) {
      const filePath = path.join(workspaceFolder.uri.fsPath, source);
      try {
        const content = await fs.promises.readFile(filePath, "utf8");
        if (content) {
          // Extract only the most important parts if file is too large
          if (content.length > 5000) {
            return this.extractImportantSections(content);
          }
          return content;
        }
      } catch {
        // File doesn't exist, try next
        continue;
      }
    }

    return null;
  }

  private extractImportantSections(content: string): string {
    const sections = [];

    // Extract critical rules section
    const criticalMatch = content.match(
      /## [🛑🚨]*\s*CRITICAL RULES[\s\S]*?(?=\n##|$)/iu,
    );
    if (criticalMatch) {
      sections.push(criticalMatch[0]);
    }

    // Extract quick reference
    const quickRefMatch = content.match(
      /## [🎯]*\s*QUICK REFERENCE[\s\S]*?(?=\n##|$)/iu,
    );
    if (quickRefMatch) {
      sections.push(quickRefMatch[0]);
    }

    // Extract file organization
    const fileOrgMatch = content.match(
      /### File Organization[\s\S]*?(?=\n###|\n##|$)/i,
    );
    if (fileOrgMatch) {
      sections.push(fileOrgMatch[0]);
    }

    return sections.join("\n\n---\n\n");
  }

  private getCurrentFileInfo(document: vscode.TextDocument): string {
    const relativePath = vscode.workspace.asRelativePath(document.uri);
    const language = document.languageId;
    const lineCount = document.lineCount;

    // Extract imports/exports for context
    const imports = this.extractImports(document.getText());
    const exports = this.extractExports(document.getText());

    let info = `- **File**: ${relativePath}\n`;
    info += `- **Language**: ${language}\n`;
    info += `- **Lines**: ${lineCount}\n`;

    if (imports.length > 0) {
      info += `- **Imports**: ${imports.join(", ")}\n`;
    }

    if (exports.length > 0) {
      info += `- **Exports**: ${exports.join(", ")}\n`;
    }

    return info;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];

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

  private extractExports(content: string): string[] {
    const exports: string[] = [];

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

  private async getRecentFilesContext(): Promise<string> {
    const recentCount = vscode.workspace
      .getConfiguration("projecttemplate")
      .get<number>("recentFilesCount", 5);

    const relevantFiles = this.recentFiles
      .slice(0, recentCount)
      .filter((file) => fs.existsSync(file));

    if (relevantFiles.length === 0) return "";

    const context = ["Recently edited files:"];
    for (const file of relevantFiles) {
      const relativePath = vscode.workspace.asRelativePath(file);
      context.push(`- ${relativePath}`);
    }

    return context.join("\n");
  }

  private async findRelatedFiles(
    document: vscode.TextDocument,
  ): Promise<string[]> {
    const related: Set<string> = new Set();
    const filePath = document.fileName;
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));

    // 1. Test files
    const testPatterns = [
      path.join(dir, `${baseName}.test.*`),
      path.join(dir, `${baseName}.spec.*`),
      path.join(dir, "__tests__", `${baseName}.*`),
    ];

    for (const pattern of testPatterns) {
      const files = await vscode.workspace.findFiles(
        vscode.workspace.asRelativePath(pattern),
        null,
        5,
      );
      files.forEach((f) => related.add(f.fsPath));
    }

    // 2. Component files (for React/Vue)
    if (filePath.includes("components")) {
      const componentDir = path.dirname(filePath);
      const componentFiles = [
        "index.ts",
        "index.tsx",
        "index.js",
        "index.jsx",
        `${baseName}.stories.tsx`,
        `${baseName}.stories.js`,
        `${baseName}.module.css`,
        `${baseName}.css`,
      ];

      for (const file of componentFiles) {
        const fullPath = path.join(componentDir, file);
        if (fs.existsSync(fullPath) && fullPath !== filePath) {
          related.add(fullPath);
        }
      }
    }

    // 3. Files that import this file
    const fileName = path.basename(filePath);
    const searchPattern = `from ['"].*${fileName}['"]|require\\(['"].*${fileName}['"]\\)`;

    try {
      const files = await vscode.workspace.findFiles(
        "**/*.{js,jsx,ts,tsx}",
        null,
        10,
      );
      for (const file of files) {
        const content = await fs.promises.readFile(file.fsPath, "utf8");
        if (new RegExp(searchPattern).test(content)) {
          related.add(file.fsPath);
        }
      }
    } catch {
      // Search failed, continue
    }

    return Array.from(related);
  }

  private async getRelatedFilesContext(
    files: string[],
    maxTokens: number,
  ): Promise<string> {
    const contexts: string[] = [];
    let currentTokens = 0;

    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file, "utf8");
        const preview = this.createFilePreview(file, content);
        const tokens = this.estimateTokens(preview);

        if (currentTokens + tokens > maxTokens) break;

        contexts.push(preview);
        currentTokens += tokens;
      } catch {
        // Skip files that can't be read
        continue;
      }
    }

    return contexts.join("\n\n");
  }

  private createFilePreview(filePath: string, content: string): string {
    const relativePath = vscode.workspace.asRelativePath(filePath);
    const lines = content.split("\n");

    // For large files, just show imports and main exports
    if (lines.length > 50) {
      const imports = lines
        .filter((line) => line.includes("import") || line.includes("require"))
        .slice(0, 5);

      const exports = lines
        .filter((line) => line.includes("export"))
        .slice(0, 5);

      return `### ${relativePath}\n\`\`\`\n${imports.join("\n")}\n...\n${exports.join("\n")}\n\`\`\``;
    }

    // For small files, show the whole content
    return `### ${relativePath}\n\`\`\`\n${content}\n\`\`\``;
  }

  private async getArchitectureContext(
    document: vscode.TextDocument,
  ): Promise<string | null> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return null;

    const filePath = document.fileName;
    const component = this.detectComponent(filePath);

    // Look for relevant architecture docs
    const possibleDocs = [
      `docs/architecture/patterns/${component}.md`,
      `docs/architecture/README.md`,
      `docs/guides/${component}.md`,
    ];

    for (const doc of possibleDocs) {
      const fullPath = path.join(workspaceFolder.uri.fsPath, doc);
      try {
        const content = await fs.promises.readFile(fullPath, "utf8");
        if (content) {
          // Return first section or up to 1000 chars
          const firstSection = content.split(/\n##/)[0];
          return firstSection.substring(0, 1000);
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private detectComponent(filePath: string): string {
    const parts = filePath.split(path.sep);

    // Look for common component indicators
    const componentIndicators = [
      "components",
      "features",
      "modules",
      "services",
      "api",
    ];

    for (let i = parts.length - 1; i >= 0; i--) {
      if (componentIndicators.includes(parts[i]) && i < parts.length - 1) {
        return parts[i + 1];
      }
    }

    // Default to file name without extension
    return path.basename(filePath, path.extname(filePath));
  }

  private async getRelevantPatterns(
    document: vscode.TextDocument,
  ): Promise<string | null> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return null;

    const fileType = this.detectFileType(document);
    const patternFiles = [
      `ai/examples/good-patterns/${fileType}`,
      `ai/prompts/templates/${fileType}.md`,
    ];

    for (const patternFile of patternFiles) {
      const fullPath = path.join(workspaceFolder.uri.fsPath, patternFile);
      try {
        const content = await fs.promises.readFile(fullPath, "utf8");
        if (content) {
          return content.substring(0, 500) + "...";
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private detectFileType(document: vscode.TextDocument): string {
    const fileName = path.basename(document.fileName);
    const content = document.getText();

    if (fileName.includes(".test.") || fileName.includes(".spec."))
      return "testing";
    if (fileName.includes("component") || content.includes("React.FC"))
      return "component";
    if (fileName.includes("service")) return "service";
    if (fileName.includes("api") || fileName.includes("route")) return "api";
    if (fileName.includes("hook") || fileName.startsWith("use")) return "hooks";

    return "general";
  }

  trackFileChange(filePath: string) {
    // Update recent files
    this.recentFiles = this.recentFiles.filter((f) => f !== filePath);
    this.recentFiles.unshift(filePath);
    this.recentFiles = this.recentFiles.slice(0, 20); // Keep last 20

    // Save to workspace state
    this.context.workspaceState.update("recentFiles", this.recentFiles);

    // Clear relevant cache entries
    for (const [key] of this.contextCache) {
      if (key.includes(filePath)) {
        this.contextCache.delete(key);
      }
    }
  }

  async clearCache() {
    this.contextCache.clear();
  }

  getTokenCount(text: string): number {
    return this.estimateTokens(text);
  }

  private estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private getCacheKey(document: vscode.TextDocument): string {
    return `${document.fileName}_${document.version}`;
  }
}
