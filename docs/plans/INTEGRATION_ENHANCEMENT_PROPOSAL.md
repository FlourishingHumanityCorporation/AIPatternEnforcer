# ProjectTemplate Integration Enhancement Initiative

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Analysis](#problem-analysis)
3. [Proposed Solutions](#proposed-solutions)
   - [Phase 1: Quick Wins](#phase-1-quick-wins-week-1-2)
   - [Phase 2: Workflow Integration](#phase-2-workflow-integration-week-3-4)
   - [Phase 3: Advanced Automation](#phase-3-advanced-automation-week-5-6)
   - [Phase 4: AI-Independent Enforcement](#phase-4-ai-independent-enforcement-week-7-8)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Success Metrics](#success-metrics)
6. [Investment & ROI](#investment--roi)
7. [Risk Mitigation](#risk-mitigation)
8. [Conclusion](#conclusion)

## Executive Summary

ProjectTemplate currently operates at ~30% automation efficiency, with 40% of promised features requiring manual
compliance and another 35% weakly integrated. This proposal outlines a systematic approach to achieve 80%+ automation
through targeted enhancements that make the "right thing" the default behavior.

**Key Outcomes:**

- Reduce developer cognitive load by 70%
- Automate enforcement of critical rules
- Make AI development friction solutions truly frictionless
- Achieve compliance through tooling, not documentation

## Problem Analysis

### Current Pain Points

1. **The Meta-Friction Problem**: Solutions to reduce friction create their own friction
2. **Documentation Dependency**: 70% reliance on developers reading/remembering rules
3. **No Enforcement**: Critical rules like "NEVER create improved versions" have zero automation
4. **Manual Overhead**: Developers must remember to run 15+ different scripts
5. **AI Assumption**: Many solutions assume AI compliance without fallbacks

### Current State Assessment

| Category                | Status                | Integration Level |
| ----------------------- | --------------------- | ----------------- |
| Code Generators         | ✅ Implemented        | Strong (25%)      |
| Git Hooks               | ❌ Not Active         | None (0%)         |
| AI Rules Enforcement    | ⚠️ Manual             | Weak (35%)        |
| Context Management      | ⚠️ Scripts Exist      | Weak (35%)        |
| Documentation Standards | ❌ Manual Review      | None (0%)         |
| CRAFT Framework         | ❌ Instructional Only | None (0%)         |
| Arrow-Chain RCA         | ❌ No Tooling         | None (0%)         |

## Proposed Solutions

### Phase 1: Quick Wins (Week 1-2)

_High Impact, Low Effort_

#### 1.1 Active Git Hooks

Create `scripts/setup-hooks.sh`:

```bash
#!/bin/bash
# One-time setup for git hooks

echo "🔧 Setting up git hooks..."

# Install husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run pre-commit"

# Add commit-msg hook
npx husky add .husky/commit-msg "npm run commit-msg"

# Add pre-push hook
npx husky add .husky/pre-push "npm run pre-push"

# Create lint-staged config
cat > .lintstagedrc.json << 'EOF'
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "bash -c 'npm run check:no-improved-files'",
    "bash -c 'npm run check:imports'"
  ],
  "*.md": [
    "bash -c 'npm run check:documentation-style'"
  ],
  "*.{json,yaml,yml}": [
    "prettier --write"
  ]
}
EOF

# Update package.json with prepare script
npm pkg set scripts.prepare="husky install"

echo "✅ Git hooks setup complete!"
```

#### 1.2 Automated Rule Enforcement

Create `tools/enforcement/no-improved-files.js`:

```javascript
#!/usr/bin/env node
const glob = require("glob");
const path = require("path");
const chalk = require("chalk");

const improvedPatterns = [
  "**/*_improved.*",
  "**/*_enhanced.*",
  "**/*_v2.*",
  "**/*_updated.*",
  "**/*_new.*",
  "**/*_refactored.*",
  "**/*_final.*",
  "**/*_copy.*",
];

const violations = improvedPatterns.flatMap((pattern) =>
  glob.sync(pattern, {
    ignore: ["node_modules/**", "dist/**", "build/**"],
  }),
);

if (violations.length > 0) {
  console.error(chalk.red("❌ Found files violating naming rules:"));
  violations.forEach((file) => {
    console.error(chalk.yellow(`  - ${file}`));
    const suggested = file.replace(
      /_(?:improved|enhanced|v2|updated|new|refactored|final|copy)/,
      "",
    );
    console.error(chalk.green(`    → Suggested: ${suggested}`));
  });
  console.error(
    "\n" + chalk.cyan("💡 Rename these files to their original names"),
  );
  console.error(chalk.cyan("   Use: git mv <old-name> <new-name>"));
  process.exit(1);
}

console.log(chalk.green("✅ No naming violations found"));
```

#### 1.3 Smart Context Auto-Loader

Create VS Code extension `extensions/projecttemplate-assistant/src/context-loader.js`:

```javascript
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class SmartContextLoader {
  constructor() {
    this.contextCache = new Map();
    this.recentFiles = [];
  }

  activate(context) {
    // Auto-load context when opening files
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (this.isAIToolActive()) {
        const contextData = this.buildSmartContext(document);
        this.injectContext(contextData);
      }
    });

    // Track recently edited files
    vscode.workspace.onDidChangeTextDocument((event) => {
      const filePath = event.document.fileName;
      this.recentFiles = [
        filePath,
        ...this.recentFiles.filter((f) => f !== filePath),
      ].slice(0, 5);
    });
  }

  buildSmartContext(document) {
    const workspaceRoot = vscode.workspace.rootPath;
    const rules = this.loadRules(workspaceRoot);
    const architecture = this.getRelevantArchitecture(document.fileName);
    const patterns = this.findSimilarPatterns(document.fileName);

    return {
      rules,
      currentFile: document.fileName,
      recentContext: this.recentFiles,
      relevantPatterns: patterns,
      architecture,
    };
  }

  loadRules(root) {
    const rulesPath = path.join(root, "ai/config/.cursorrules");
    if (fs.existsSync(rulesPath)) {
      return fs.readFileSync(rulesPath, "utf8");
    }
    return "";
  }

  getRelevantArchitecture(filePath) {
    // Smart detection of relevant architecture docs
    const component = path.basename(path.dirname(filePath));
    const possibleDocs = [
      `docs/architecture/patterns/${component}.md`,
      `docs/architecture/decisions/${component}-*.md`,
      "docs/architecture/README.md",
    ];

    return possibleDocs
      .filter((doc) => fs.existsSync(doc))
      .map((doc) => fs.readFileSync(doc, "utf8"))
      .join("\n---\n");
  }

  isAIToolActive() {
    // Detect if Cursor, Copilot, or other AI tools are active
    const activeExtensions = vscode.extensions.all
      .filter((ext) => ext.isActive)
      .map((ext) => ext.id);

    return activeExtensions.some((id) =>
      ["GitHub.copilot", "anysphere.cursor", "continue.continue"].includes(id),
    );
  }

  injectContext(contextData) {
    // Inject context into AI tool input
    const formattedContext = this.formatContext(contextData);

    // For Cursor
    if (vscode.extensions.getExtension("anysphere.cursor")) {
      vscode.commands.executeCommand("cursor.prependContext", formattedContext);
    }

    // Store in clipboard as fallback
    vscode.env.clipboard.writeText(formattedContext);
  }

  formatContext(data) {
    return `
# Project Context (Auto-loaded)

${data.rules}

## Current Working Context
- File: ${data.currentFile}
- Recent files: ${data.recentContext.join(", ")}

## Relevant Patterns
${data.relevantPatterns}

## Architecture Context
${data.architecture}

---
# Your request below:
`;
  }
}

module.exports = SmartContextLoader;
```

### Phase 2: Workflow Integration (Week 3-4)

_High Impact, Medium Effort_

#### 2.1 Unified Development Command

Update `package.json`:

```json
{
  "scripts": {
    "dev": "node tools/automation/dev-orchestrator.js",
    "dev:app": "vite",
    "dev:ai-watch": "chokidar '**/*.{ts,tsx,js,jsx}' -c 'npm run ai:context' --ignore node_modules",
    "dev:type-check": "tsc --noEmit --watch --preserveWatchOutput",
    "dev:context-optimize": "node tools/automation/context-watcher.js",
    "dev:architecture-guard": "nodemon --exec 'npm run check:architecture' --watch src",

    "commit": "node tools/automation/smart-commit.js",
    "fix": "node tools/automation/auto-fixer.js",
    "pr": "node tools/automation/smart-pr.js"
  }
}
```

Create `tools/automation/dev-orchestrator.js`:

```javascript
#!/usr/bin/env node
const { spawn } = require("child_process");
const chalk = require("chalk");
const ora = require("ora");

class DevOrchestrator {
  constructor() {
    this.processes = new Map();
    this.startupOrder = [
      "context-optimize",
      "type-check",
      "ai-watch",
      "architecture-guard",
      "app",
    ];
  }

  async start() {
    console.log(
      chalk.blue.bold("🚀 Starting ProjectTemplate Development Environment\n"),
    );

    // Pre-flight checks
    await this.runPreflightChecks();

    // Start services in order
    for (const service of this.startupOrder) {
      await this.startService(service);
    }

    console.log(chalk.green.bold("\n✨ All systems operational!\n"));
    this.showDashboard();
  }

  async runPreflightChecks() {
    const spinner = ora("Running pre-flight checks...").start();

    // Check git hooks
    if (!this.areGitHooksInstalled()) {
      spinner.info("Git hooks not installed. Installing...");
      await this.installGitHooks();
    }

    // Check dependencies
    if (!this.areDependenciesInstalled()) {
      spinner.info("Missing dependencies. Installing...");
      await this.installDependencies();
    }

    // Check environment
    if (!this.isEnvironmentValid()) {
      spinner.fail("Environment issues detected");
      this.showEnvironmentHelp();
      process.exit(1);
    }

    spinner.succeed("Pre-flight checks passed");
  }

  startService(name) {
    return new Promise((resolve) => {
      const spinner = ora(`Starting ${name}...`).start();

      const proc = spawn("npm", ["run", `dev:${name}`], {
        stdio: "pipe",
        shell: true,
      });

      this.processes.set(name, proc);

      proc.stdout.on("data", (data) => {
        // Log output with service prefix
        console.log(chalk.gray(`[${name}]`), data.toString().trim());
      });

      proc.stderr.on("data", (data) => {
        console.error(chalk.red(`[${name}]`), data.toString().trim());
      });

      // Consider service started after 2 seconds
      setTimeout(() => {
        spinner.succeed(`${name} started`);
        resolve();
      }, 2000);
    });
  }

  showDashboard() {
    console.log(chalk.cyan("╔═══════════════════════════════════════╗"));
    console.log(chalk.cyan("║     ProjectTemplate Dev Dashboard     ║"));
    console.log(chalk.cyan("╠═══════════════════════════════════════╣"));
    console.log(chalk.cyan("║ 🌐 App:        http://localhost:3000  ║"));
    console.log(chalk.cyan("║ 📊 Metrics:    http://localhost:3001  ║"));
    console.log(chalk.cyan("║ 📚 Docs:       http://localhost:3003  ║"));
    console.log(chalk.cyan("╠═══════════════════════════════════════╣"));
    console.log(chalk.cyan("║ Commands:                             ║"));
    console.log(chalk.cyan("║   npm run commit  - Smart commit      ║"));
    console.log(chalk.cyan("║   npm run fix     - Auto-fix issues   ║"));
    console.log(chalk.cyan("║   npm run pr      - Create PR         ║"));
    console.log(chalk.cyan("╚═══════════════════════════════════════╝"));
  }
}

// Start orchestrator
new DevOrchestrator().start().catch(console.error);
```

#### 2.2 Smart Commit Assistant

Create `tools/automation/smart-commit.js`:

```javascript
#!/usr/bin/env node
const { execSync } = require("child_process");
const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

class SmartCommit {
  async run() {
    console.log(chalk.blue.bold("🤖 Smart Commit Assistant\n"));

    // 1. Run all checks
    await this.runPreCommitChecks();

    // 2. Analyze changes
    const analysis = await this.analyzeChanges();

    // 3. Check for required updates
    await this.checkRequiredUpdates(analysis);

    // 4. Generate commit message
    const commitMsg = await this.generateCommitMessage(analysis);

    // 5. Confirm and commit
    await this.confirmAndCommit(commitMsg);
  }

  async runPreCommitChecks() {
    console.log(chalk.yellow("🔍 Running pre-commit checks...\n"));

    const checks = [
      { name: "Linting", cmd: "npm run lint" },
      { name: "Type checking", cmd: "npm run type-check" },
      { name: "Tests", cmd: "npm run test:affected" },
      { name: "No improved files", cmd: "npm run check:no-improved-files" },
      { name: "Import validation", cmd: "npm run check:imports" },
      { name: "Documentation style", cmd: "npm run check:documentation-style" },
    ];

    for (const check of checks) {
      process.stdout.write(`${check.name}... `);
      try {
        execSync(check.cmd, { stdio: "pipe" });
        console.log(chalk.green("✓"));
      } catch (error) {
        console.log(chalk.red("✗"));
        console.error(
          chalk.red(`\n${error.stdout?.toString() || error.message}`),
        );

        const { fix } = await inquirer.prompt([
          {
            type: "confirm",
            name: "fix",
            message: "Would you like to auto-fix this issue?",
            default: true,
          },
        ]);

        if (fix) {
          await this.autoFix(check.name);
        } else {
          process.exit(1);
        }
      }
    }

    console.log(chalk.green("\n✅ All checks passed!\n"));
  }

  async analyzeChanges() {
    const diff = execSync("git diff --cached --name-status", {
      encoding: "utf8",
    });
    const files = diff
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [status, ...paths] = line.split("\t");
        return { status, path: paths.join("\t") };
      });

    return {
      files,
      hasArchitecturalChanges: files.some(
        (f) =>
          f.path.includes("src/") &&
          (f.status === "A" || f.path.includes("index")),
      ),
      hasApiChanges: files.some((f) => f.path.includes("api/")),
      hasTestChanges: files.some((f) => f.path.includes(".test.")),
      hasDependencyChanges: files.some((f) => f.path.includes("package.json")),
    };
  }

  async checkRequiredUpdates(analysis) {
    const updates = [];

    if (analysis.hasArchitecturalChanges && !this.isClaudeUpdated()) {
      updates.push("CLAUDE.md - Document architectural changes");
    }

    if (analysis.hasApiChanges && !this.isApiDocsUpdated()) {
      updates.push("API documentation - Update endpoint docs");
    }

    if (updates.length > 0) {
      console.log(chalk.yellow("📝 Required updates detected:\n"));
      updates.forEach((update) => console.log(chalk.yellow(`  - ${update}`)));

      const { autoUpdate } = await inquirer.prompt([
        {
          type: "confirm",
          name: "autoUpdate",
          message: "Auto-update these files?",
          default: true,
        },
      ]);

      if (autoUpdate) {
        await this.performAutoUpdates(analysis);
      }
    }
  }

  async generateCommitMessage(analysis) {
    // Analyze commit intent
    const type = await this.detectCommitType(analysis);
    const scope = await this.detectScope(analysis);
    const summary = await this.generateSummary(analysis);

    // Build commit message
    let message = `${type}`;
    if (scope) message += `(${scope})`;
    message += `: ${summary}`;

    // Add body if needed
    if (analysis.files.length > 3) {
      message += "\n\n" + this.generateBody(analysis);
    }

    // Add metadata
    if (analysis.hasBreakingChanges) {
      message += "\n\nBREAKING CHANGE: " + analysis.breakingChangeDescription;
    }

    return message;
  }

  async confirmAndCommit(message) {
    console.log(chalk.blue("\n📝 Generated commit message:\n"));
    console.log(chalk.white(message));

    const { confirm, editMessage } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Use this commit message?",
        default: true,
      },
      {
        type: "editor",
        name: "editMessage",
        message: "Edit commit message:",
        default: message,
        when: (answers) => !answers.confirm,
      },
    ]);

    const finalMessage = confirm ? message : editMessage;

    try {
      execSync(`git commit -m "${finalMessage.replace(/"/g, '\\"')}"`, {
        stdio: "inherit",
      });
      console.log(chalk.green("\n✅ Commit successful!\n"));

      // Post-commit actions
      await this.postCommitActions();
    } catch (error) {
      console.error(chalk.red("❌ Commit failed:", error.message));
      process.exit(1);
    }
  }

  async postCommitActions() {
    // Update context cache
    execSync("npm run ai:context", { stdio: "pipe" });

    // Show next steps
    console.log(chalk.cyan("Next steps:"));
    console.log(chalk.cyan("  - Push changes: git push"));
    console.log(chalk.cyan("  - Create PR: npm run pr"));
  }
}

// Run smart commit
new SmartCommit().run().catch(console.error);
```

#### 2.3 Automatic Context Optimization

Create `tools/automation/context-watcher.js`:

```javascript
#!/usr/bin/env node
const chokidar = require("chokidar");
const debounce = require("lodash/debounce");
const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");

class ContextWatcher {
  constructor() {
    this.contextCache = new Map();
    this.relatedFiles = new Map();
    this.updateContext = debounce(this._updateContext.bind(this), 1000);
  }

  start() {
    console.log(chalk.blue("👁️  Context Watcher Active\n"));

    // Watch for file changes
    const watcher = chokidar.watch(
      ["src/**/*.{ts,tsx,js,jsx}", "docs/**/*.md"],
      {
        persistent: true,
        ignoreInitial: true,
        ignored: /node_modules/,
      },
    );

    watcher
      .on("change", (path) => this.handleFileChange(path))
      .on("add", (path) => this.handleFileAdd(path))
      .on("unlink", (path) => this.handleFileRemove(path));

    // Initial context build
    this.buildInitialContext();
  }

  async handleFileChange(filePath) {
    console.log(chalk.gray(`📝 File changed: ${filePath}`));

    // Find related files
    const related = await this.findRelatedFiles(filePath);
    this.relatedFiles.set(filePath, related);

    // Update context
    this.updateContext(filePath, related);
  }

  async _updateContext(changedFile, relatedFiles) {
    // Build optimized context
    const context = await this.optimizeContext({
      changedFile,
      relatedFiles,
      maxTokens: 4000,
      includeArchitecture: this.isArchitecturalChange(changedFile),
    });

    // Update context cache
    this.contextCache.set(changedFile, context);

    // Write to AI context cache
    const contextData = {
      timestamp: new Date().toISOString(),
      primaryFile: changedFile,
      context: context,
      relatedFiles: relatedFiles,
    };

    await fs.writeFile(
      ".ai-context-cache.json",
      JSON.stringify(contextData, null, 2),
    );

    // Update IDE context if possible
    this.updateIDEContext(context);

    console.log(
      chalk.green(
        `✓ Context updated (${this.calculateTokens(context)} tokens)`,
      ),
    );
  }

  async findRelatedFiles(filePath) {
    const related = new Set();

    // 1. Find imports/exports
    const content = await fs.readFile(filePath, "utf8");
    const imports = this.extractImports(content);
    imports.forEach((imp) => related.add(imp));

    // 2. Find test files
    const testFile = this.getTestFile(filePath);
    if (await this.fileExists(testFile)) {
      related.add(testFile);
    }

    // 3. Find component files
    if (filePath.includes("/components/")) {
      const componentFiles = await this.getComponentFiles(filePath);
      componentFiles.forEach((f) => related.add(f));
    }

    // 4. Find related documentation
    const docs = await this.findRelatedDocs(filePath);
    docs.forEach((d) => related.add(d));

    return Array.from(related);
  }

  async optimizeContext(options) {
    const { changedFile, relatedFiles, maxTokens, includeArchitecture } =
      options;

    let context = {
      rules: await this.loadProjectRules(),
      currentFile: {
        path: changedFile,
        content: await fs.readFile(changedFile, "utf8"),
      },
      relatedFiles: [],
      architecture: null,
      patterns: [],
    };

    // Add related files within token budget
    let currentTokens = this.calculateTokens(context);

    for (const file of relatedFiles) {
      if (currentTokens >= maxTokens) break;

      const fileContent = await fs.readFile(file, "utf8");
      const fileTokens = this.calculateTokens(fileContent);

      if (currentTokens + fileTokens < maxTokens) {
        context.relatedFiles.push({
          path: file,
          content: fileContent,
        });
        currentTokens += fileTokens;
      }
    }

    // Add architecture if needed and fits
    if (includeArchitecture && currentTokens < maxTokens * 0.9) {
      context.architecture = await this.loadRelevantArchitecture(changedFile);
    }

    // Add relevant patterns
    context.patterns = await this.loadRelevantPatterns(changedFile);

    return context;
  }

  calculateTokens(content) {
    // Rough approximation: 1 token ≈ 4 characters
    const text =
      typeof content === "string" ? content : JSON.stringify(content);
    return Math.ceil(text.length / 4);
  }

  updateIDEContext(context) {
    // Update VS Code context
    if (process.env.VSCODE_PID) {
      // Write to VS Code workspace storage
      const vscodePath = path.join(".vscode", "ai-context.json");
      fs.writeFile(vscodePath, JSON.stringify(context, null, 2)).catch(
        () => {},
      );
    }

    // Update Cursor context
    const cursorPath = path.join(".cursor", "context.json");
    fs.mkdir(path.dirname(cursorPath), { recursive: true })
      .then(() => fs.writeFile(cursorPath, JSON.stringify(context, null, 2)))
      .catch(() => {});
  }
}

// Start watcher
new ContextWatcher().start();
```

### Phase 3: Advanced Automation (Week 5-6)

_Medium Impact, High Effort_

#### 3.1 VS Code Extension for Real-time Enforcement

Create `extensions/projecttemplate-assistant/src/extension.ts`:

```typescript
import * as vscode from "vscode";
import { FileNameEnforcer } from "./enforcers/file-name-enforcer";
import { PromptImprover } from "./assistants/prompt-improver";
import { ArrowChainHelper } from "./assistants/arrow-chain-helper";
import { ArchitectureGuardian } from "./enforcers/architecture-guardian";

export function activate(context: vscode.ExtensionContext) {
  console.log("ProjectTemplate Assistant is active");

  // Initialize enforcers
  const fileNameEnforcer = new FileNameEnforcer();
  const architectureGuardian = new ArchitectureGuardian();

  // Initialize assistants
  const promptImprover = new PromptImprover();
  const arrowChainHelper = new ArrowChainHelper();

  // Real-time file naming enforcement
  const fileWatcher = vscode.workspace.createFileSystemWatcher("**/*");

  fileWatcher.onDidCreate(async (uri) => {
    const violation = fileNameEnforcer.check(uri.fsPath);

    if (violation) {
      const action = await vscode.window.showErrorMessage(
        `File "${path.basename(uri.fsPath)}" violates naming rules: ${violation.reason}`,
        "Rename to Suggested",
        "Ignore for Now",
        "Learn More",
      );

      if (action === "Rename to Suggested") {
        const newUri = vscode.Uri.file(violation.suggestedName);
        await vscode.workspace.fs.rename(uri, newUri);
        vscode.window.showInformationMessage(
          `Renamed to: ${path.basename(newUri.fsPath)}`,
        );
      } else if (action === "Learn More") {
        vscode.env.openExternal(
          vscode.Uri.parse(
            "file://" +
              path.join(
                vscode.workspace.rootPath!,
                "docs/guides/naming-conventions.md",
              ),
          ),
        );
      }
    }
  });

  // Prompt improvement command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "projecttemplate.improvePrompt",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const selection = editor.selection;
        const text = editor.document.getText(
          selection.isEmpty ? undefined : selection,
        );

        const improved = await promptImprover.improve(text);

        if (improved) {
          editor.edit((editBuilder) => {
            const range = selection.isEmpty
              ? new vscode.Range(0, 0, editor.document.lineCount, 0)
              : selection;
            editBuilder.replace(range, improved);
          });

          vscode.window.showInformationMessage(
            "Prompt improved using CRAFT framework",
          );
        }
      },
    ),
  );

  // Arrow-Chain RCA Helper
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "projecttemplate.arrowChainRCA",
      async () => {
        const panel = vscode.window.createWebviewPanel(
          "arrowChainRCA",
          "Arrow-Chain Root Cause Analysis",
          vscode.ViewColumn.Two,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
          },
        );

        panel.webview.html = arrowChainHelper.getWebviewContent();

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
          async (message) => {
            switch (message.command) {
              case "saveAnalysis":
                await arrowChainHelper.saveAnalysis(message.data);
                vscode.window.showInformationMessage("RCA saved to docs/rca/");
                break;
              case "generateTests":
                const tests = await arrowChainHelper.generateTests(
                  message.data,
                );
                panel.webview.postMessage({ command: "testsGenerated", tests });
                break;
            }
          },
          undefined,
          context.subscriptions,
        );
      },
    ),
  );

  // Architecture violation detection
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const violations = await architectureGuardian.check(document);

      if (violations.length > 0) {
        const items = violations.map((v) => ({
          label: v.rule,
          description: v.description,
          detail: `${v.file}:${v.line}`,
        }));

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: "Architecture violations detected",
          canPickMany: false,
        });

        if (selected) {
          // Navigate to violation
          const [file, line] = selected.detail!.split(":");
          const doc = await vscode.workspace.openTextDocument(file);
          const editor = await vscode.window.showTextDocument(doc);
          const position = new vscode.Position(parseInt(line) - 1, 0);
          editor.selection = new vscode.Selection(position, position);
          editor.revealRange(new vscode.Range(position, position));
        }
      }
    }),
  );

  // Status bar item showing context status
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBarItem.text = "$(rocket) PT: Active";
  statusBarItem.tooltip = "ProjectTemplate Assistant is active";
  statusBarItem.command = "projecttemplate.showDashboard";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Dashboard command
  context.subscriptions.push(
    vscode.commands.registerCommand("projecttemplate.showDashboard", () => {
      const panel = vscode.window.createWebviewPanel(
        "projecttemplateDashboard",
        "ProjectTemplate Dashboard",
        vscode.ViewColumn.One,
        { enableScripts: true },
      );

      panel.webview.html = getDashboardHTML();
    }),
  );
}

export function deactivate() {}
```

Create `extensions/projecttemplate-assistant/src/assistants/prompt-improver.ts`:

```typescript
import * as vscode from "vscode";

export class PromptImprover {
  async improve(text: string): Promise<string | undefined> {
    // Show CRAFT framework interface
    const panel = vscode.window.createWebviewPanel(
      "promptImprover",
      "CRAFT Prompt Improvement",
      vscode.ViewColumn.Beside,
      { enableScripts: true },
    );

    return new Promise((resolve) => {
      panel.webview.html = this.getWebviewContent(text);

      panel.webview.onDidReceiveMessage((message) => {
        if (message.command === "apply") {
          resolve(message.improvedPrompt);
          panel.dispose();
        } else if (message.command === "cancel") {
          resolve(undefined);
          panel.dispose();
        }
      });
    });
  }

  private getWebviewContent(originalPrompt: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: var(--vscode-font-family); 
            padding: 20px;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        .section {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 5px;
        }
        .section h3 {
            margin-top: 0;
            color: var(--vscode-titleBar-activeForeground);
        }
        textarea {
            width: 100%;
            min-height: 100px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            padding: 8px;
            font-family: var(--vscode-editor-font-family);
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .tip {
            background: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textLink-foreground);
            padding: 10px;
            margin: 10px 0;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <h2>CRAFT Framework Prompt Improvement</h2>
    
    <div class="section">
        <h3>Original Prompt</h3>
        <textarea id="original" readonly>${originalPrompt}</textarea>
    </div>

    <div class="section">
        <h3>C - Context & Constraints</h3>
        <div class="tip">Add missing technical context, environment details, constraints</div>
<textarea id="context" placeholder="e.g., Using TypeScript 5.0, React 18, must be compatible with IE11"></textarea>
    </div>

    <div class="section">
        <h3>R - Role & Audience</h3>
        <div class="tip">Define the AI's role and expertise needed</div>
<textarea id="role" placeholder="e.g., You are a senior TypeScript developer with expertise in React performance
optimization"></textarea>
    </div>

    <div class="section">
        <h3>A - Ask (Structured Request)</h3>
        <div class="tip">Break down into numbered steps with clear actions</div>
<textarea id="ask" placeholder="1. Analyze the current implementation\n2. Identify performance bottlenecks\n3. Suggest
optimizations with code examples"></textarea>
    </div>

    <div class="section">
        <h3>F - Format</h3>
        <div class="tip">Specify desired output format</div>
<textarea id="format" placeholder="e.g., Provide response as:\n- Summary (2-3 sentences)\n- Detailed analysis with code
blocks\n- Step-by-step implementation guide"></textarea>
    </div>

    <div class="section">
        <h3>T - Tone & Temperature</h3>
        <div class="tip">Set communication style and constraints</div>
<textarea id="tone" placeholder="e.g., Technical and concise. Limit response to 500 words. Focus on practical
implementation."></textarea>
    </div>

    <div class="section">
        <h3>Improved Prompt Preview</h3>
        <textarea id="preview" readonly></textarea>
    </div>

    <div>
        <button onclick="applyImprovement()">Apply Improvement</button>
        <button onclick="cancel()">Cancel</button>
        <button onclick="saveAsTemplate()">Save as Template</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function updatePreview() {
            const context = document.getElementById('context').value;
            const role = document.getElementById('role').value;
            const ask = document.getElementById('ask').value;
            const format = document.getElementById('format').value;
            const tone = document.getElementById('tone').value;
            const original = document.getElementById('original').value;
            
            let improved = '';
            
            if (role) improved += role + '\\n\\n';
            if (context) improved += 'Context: ' + context + '\\n\\n';
            improved += original;
            if (ask) improved += '\\n\\n' + ask;
            if (format) improved += '\\n\\nFormat: ' + format;
            if (tone) improved += '\\n\\n' + tone;
            
            document.getElementById('preview').value = improved;
        }
        
        // Update preview on any change
        ['context', 'role', 'ask', 'format', 'tone'].forEach(id => {
            document.getElementById(id).addEventListener('input', updatePreview);
        });
        
        function applyImprovement() {
            vscode.postMessage({
                command: 'apply',
                improvedPrompt: document.getElementById('preview').value
            });
        }
        
        function cancel() {
            vscode.postMessage({ command: 'cancel' });
        }
        
        function saveAsTemplate() {
            // Save current improvement as reusable template
            const template = {
                context: document.getElementById('context').value,
                role: document.getElementById('role').value,
                ask: document.getElementById('ask').value,
                format: document.getElementById('format').value,
                tone: document.getElementById('tone').value
            };
            
            vscode.postMessage({
                command: 'saveTemplate',
                template: template
            });
        }
        
        // Initial preview
        updatePreview();
    </script>
</body>
</html>
        `;
  }
}
```

#### 3.2 Intelligent Test Generation

Create `tools/automation/test-generator.js`:

```javascript
#!/usr/bin/env node
const ts = require("typescript");
const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const { generateTestsWithAI } = require("./ai-test-gen");

class TestGenerator {
  constructor() {
    this.testTemplates = new Map();
    this.loadTemplates();
  }

  async watchForUntested() {
    console.log(chalk.blue("🧪 Test Generator Active\n"));

    // Create TypeScript program
    const configPath = ts.findConfigFile(
      process.cwd(),
      ts.sys.fileExists,
      "tsconfig.json",
    );

    const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
    const { options, fileNames } = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      process.cwd(),
    );

    const program = ts.createProgram(fileNames, options);

    // Check each source file
    for (const sourceFile of program.getSourceFiles()) {
      if (this.shouldTestFile(sourceFile.fileName)) {
        await this.ensureTestExists(sourceFile);
      }
    }

    // Watch for new files
    this.startWatcher();
  }

  async ensureTestExists(sourceFile) {
    const testPath = this.getTestPath(sourceFile.fileName);

    try {
      await fs.access(testPath);
      // Test exists, check if it's comprehensive
      const coverage = await this.checkTestCoverage(sourceFile, testPath);

      if (coverage < 80) {
        console.log(
          chalk.yellow(
            `⚠️  Low test coverage (${coverage}%) for: ${sourceFile.fileName}`,
          ),
        );
        await this.enhanceTests(sourceFile, testPath);
      }
    } catch {
      // Test doesn't exist
      console.log(chalk.red(`❌ Missing tests for: ${sourceFile.fileName}`));
      await this.generateTests(sourceFile);
    }
  }

  async generateTests(sourceFile) {
    const fileName = path.basename(sourceFile.fileName);
    console.log(chalk.blue(`\n🤖 Generating tests for ${fileName}...`));

    // Analyze source file
    const analysis = this.analyzeSourceFile(sourceFile);

    // Generate comprehensive tests
    const tests = await this.createTests(analysis);

    // Write test file
    const testPath = this.getTestPath(sourceFile.fileName);
    await fs.mkdir(path.dirname(testPath), { recursive: true });
    await fs.writeFile(testPath, tests);

    console.log(chalk.green(`✅ Generated tests: ${testPath}`));

    // Run tests to ensure they work
    await this.runTests(testPath);
  }

  analyzeSourceFile(sourceFile) {
    const analysis = {
      fileName: sourceFile.fileName,
      exports: [],
      classes: [],
      functions: [],
      constants: [],
      types: [],
      complexity: 0,
    };

    const visit = (node) => {
      switch (node.kind) {
        case ts.SyntaxKind.FunctionDeclaration:
        case ts.SyntaxKind.FunctionExpression:
        case ts.SyntaxKind.ArrowFunction:
          if (node.name) {
            analysis.functions.push({
              name: node.name.text,
              params: node.parameters.map((p) => ({
                name: p.name.text,
                type: p.type
                  ? sourceFile.text.substring(p.type.pos, p.type.end).trim()
                  : "any",
              })),
              returnType: node.type
                ? sourceFile.text.substring(node.type.pos, node.type.end).trim()
                : "any",
              isAsync: node.modifiers?.some(
                (m) => m.kind === ts.SyntaxKind.AsyncKeyword,
              ),
              isExported: node.modifiers?.some(
                (m) => m.kind === ts.SyntaxKind.ExportKeyword,
              ),
            });
          }
          break;

        case ts.SyntaxKind.ClassDeclaration:
          analysis.classes.push({
            name: node.name.text,
            methods: this.extractClassMethods(node, sourceFile),
            isExported: node.modifiers?.some(
              (m) => m.kind === ts.SyntaxKind.ExportKeyword,
            ),
          });
          break;

        case ts.SyntaxKind.VariableStatement:
          if (
            node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
          ) {
            node.declarationList.declarations.forEach((decl) => {
              if (decl.name.kind === ts.SyntaxKind.Identifier) {
                analysis.constants.push({
                  name: decl.name.text,
                  type: decl.type
                    ? sourceFile.text
                        .substring(decl.type.pos, decl.type.end)
                        .trim()
                    : "any",
                });
              }
            });
          }
          break;
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return analysis;
  }

  async createTests(analysis) {
    const imports = this.generateImports(analysis);
    const setup = this.generateSetup(analysis);
    const tests = [];

    // Generate tests for each function
    for (const func of analysis.functions) {
      if (func.isExported) {
        tests.push(await this.generateFunctionTests(func));
      }
    }

    // Generate tests for each class
    for (const cls of analysis.classes) {
      if (cls.isExported) {
        tests.push(await this.generateClassTests(cls));
      }
    }

    // Generate integration tests if needed
    if (analysis.complexity > 10) {
      tests.push(await this.generateIntegrationTests(analysis));
    }

    // Combine all parts
    return `${imports}\n\n${setup}\n\n${tests.join("\n\n")}`;
  }

  generateFunctionTests(func) {
    const tests = [];

    // Happy path test
    tests.push(`
  describe('${func.name}', () => {
    it('should work with valid inputs', ${func.isAsync ? "async " : ""}() => {
      // Arrange
      ${this.generateTestInputs(func.params)}
      
      // Act
      const result = ${func.isAsync ? "await " : ""}${func.name}(${func.params.map((p) => p.name).join(", ")});
      
      // Assert
      expect(result).toBeDefined();
      ${this.generateAssertions(func.returnType)}
    });
        `);

    // Edge cases
    tests.push(this.generateEdgeCaseTests(func));

    // Error cases
    if (func.isAsync || func.returnType.includes("Error")) {
      tests.push(this.generateErrorTests(func));
    }

    return tests.join("\n");
  }

  generateEdgeCaseTests(func) {
    const edgeCases = [];

    // Null/undefined inputs
    if (func.params.length > 0) {
      edgeCases.push(`
    it('should handle null inputs gracefully', () => {
      expect(() => ${func.name}(${func.params.map(() => "null").join(", ")})).not.toThrow();
    });
            `);
    }

    // Empty inputs
    func.params.forEach((param, index) => {
      if (param.type.includes("[]") || param.type.includes("Array")) {
        edgeCases.push(`
    it('should handle empty array for ${param.name}', () => {
      ${func.params.map((p, i) => (i === index ? `const ${p.name} = [];` : this.generateTestInput(p))).join("\n      ")}
      const result = ${func.name}(${func.params.map((p) => p.name).join(", ")});
      expect(result).toBeDefined();
    });
                `);
      }
    });

    return edgeCases.join("\n");
  }

  generateTestInputs(params) {
    return params
      .map((param) => {
        return `const ${param.name} = ${this.generateMockValue(param.type)};`;
      })
      .join("\n      ");
  }

  generateMockValue(type) {
    const mockGenerators = {
      string: () => "'test-string'",
      number: () => "42",
      boolean: () => "true",
      Date: () => 'new Date("2024-01-01")',
      any: () => "{}",
      void: () => "undefined",
      null: () => "null",
      undefined: () => "undefined",
      object: () => '{ id: 1, name: "test" }',
      array: () => "[1, 2, 3]",
      function: () => "jest.fn()",
    };

    // Check for array types
    if (type.includes("[]")) {
      const baseType = type.replace("[]", "").trim();
      return `[${this.generateMockValue(baseType)}, ${this.generateMockValue(baseType)}]`;
    }

    // Check for generic types
    if (type.includes("<") && type.includes(">")) {
      const baseType = type.substring(0, type.indexOf("<"));
      if (baseType === "Promise") {
        const innerType = type.substring(
          type.indexOf("<") + 1,
          type.lastIndexOf(">"),
        );
        return `Promise.resolve(${this.generateMockValue(innerType)})`;
      }
      if (baseType === "Array") {
        const innerType = type.substring(
          type.indexOf("<") + 1,
          type.lastIndexOf(">"),
        );
        return `[${this.generateMockValue(innerType)}]`;
      }
    }

    // Use generator if available
    const generator =
      mockGenerators[type] || mockGenerators[type.toLowerCase()];
    if (generator) {
      return generator();
    }

    // Default for unknown types
    return `{} as ${type}`;
  }

  getTestPath(sourcePath) {
    const parsed = path.parse(sourcePath);
    const testDir = parsed.dir.replace("/src", "/tests");
    return path.join(testDir, `${parsed.name}.test${parsed.ext}`);
  }

  startWatcher() {
    // Watch for new files and generate tests automatically
    const chokidar = require("chokidar");

    const watcher = chokidar.watch("src/**/*.{ts,tsx,js,jsx}", {
      ignored: /node_modules|\.test\.|\.spec\./,
      persistent: true,
    });

    watcher.on("add", async (filePath) => {
      console.log(chalk.blue(`\n📄 New file detected: ${filePath}`));

      // Wait a bit for the file to be fully written
      setTimeout(async () => {
        const testPath = this.getTestPath(filePath);
        try {
          await fs.access(testPath);
          console.log(chalk.gray("Test file already exists"));
        } catch {
          // Generate test for new file
          const sourceCode = await fs.readFile(filePath, "utf8");
          const sourceFile = ts.createSourceFile(
            filePath,
            sourceCode,
            ts.ScriptTarget.Latest,
            true,
          );

          await this.generateTests(sourceFile);
        }
      }, 1000);
    });
  }
}

// Start generator
new TestGenerator().watchForUntested().catch(console.error);
```

#### 3.3 Architectural Drift Prevention

Create `tools/enforcement/architecture-guardian.js`:

```javascript
#!/usr/bin/env node
const madge = require("madge");
const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");

class ArchitectureGuardian {
  constructor() {
    this.rules = this.loadRules();
    this.cache = new Map();
  }

  async loadRules() {
    try {
      const rulesPath = path.join(process.cwd(), "architecture.rules.json");
      const content = await fs.readFile(rulesPath, "utf8");
      return JSON.parse(content);
    } catch {
      // Default rules
      return {
        layers: {
          components: {
            canImportFrom: ["hooks", "utils", "types"],
            cannotImportFrom: ["pages", "api", "services"],
          },
          services: {
            canImportFrom: ["utils", "types", "api"],
            cannotImportFrom: ["components", "pages"],
          },
          api: {
            canImportFrom: ["utils", "types"],
            cannotImportFrom: ["components", "pages", "services"],
          },
          pages: {
            canImportFrom: [
              "components",
              "hooks",
              "services",
              "utils",
              "types",
            ],
            cannotImportFrom: [],
          },
          utils: {
            canImportFrom: ["types"],
            cannotImportFrom: ["components", "pages", "services", "api"],
          },
        },
        naming: {
          components: /^[A-Z][a-zA-Z]*$/,
          hooks: /^use[A-Z][a-zA-Z]*$/,
          utils: /^[a-z][a-zA-Z]*$/,
          types: /^[A-Z][a-zA-Z]*$/,
        },
        complexity: {
          maxFileLength: 300,
          maxFunctionLength: 50,
          maxCyclomaticComplexity: 10,
          maxCoupling: 5,
        },
      };
    }
  }

  async check() {
    console.log(chalk.blue("🏛️  Checking architecture...\n"));

    const violations = [];

    // Check dependency rules
    violations.push(...(await this.checkDependencies()));

    // Check naming conventions
    violations.push(...(await this.checkNaming()));

    // Check complexity
    violations.push(...(await this.checkComplexity()));

    // Check for circular dependencies
    violations.push(...(await this.checkCircular()));

    if (violations.length === 0) {
      console.log(chalk.green("✅ Architecture check passed!"));
      return true;
    } else {
      console.error(
        chalk.red(`\n❌ Found ${violations.length} architecture violations:\n`),
      );

      violations.forEach((violation, index) => {
        console.error(
          chalk.red(`${index + 1}. ${violation.type}: ${violation.message}`),
        );
        console.error(chalk.yellow(`   File: ${violation.file}`));
        if (violation.suggestion) {
          console.error(chalk.cyan(`   Suggestion: ${violation.suggestion}`));
        }
        console.error("");
      });

      return false;
    }
  }

  async checkDependencies() {
    const violations = [];
    const result = await madge("src", {
      fileExtensions: ["ts", "tsx", "js", "jsx"],
      excludeRegExp: [/node_modules/, /\.test\./, /\.spec\./],
    });

    const dependencies = result.obj();
    const rules = await this.rules;

    for (const [file, deps] of Object.entries(dependencies)) {
      const layer = this.detectLayer(file);
      if (!layer || !rules.layers[layer]) continue;

      const layerRules = rules.layers[layer];

      for (const dep of deps) {
        const depLayer = this.detectLayer(dep);
        if (!depLayer) continue;

        // Check if import is forbidden
        if (layerRules.cannotImportFrom.includes(depLayer)) {
          violations.push({
            type: "Layer Violation",
            message: `${layer} cannot import from ${depLayer}`,
            file: file,
            dependency: dep,
            suggestion: `Move the dependency to ${layerRules.canImportFrom.join(" or ")}`,
          });
        }

        // Check if import is not in allowed list
        if (
          layerRules.canImportFrom.length > 0 &&
          !layerRules.canImportFrom.includes(depLayer) &&
          depLayer !== layer
        ) {
          violations.push({
            type: "Layer Violation",
            message: `${layer} can only import from ${layerRules.canImportFrom.join(", ")}`,
            file: file,
            dependency: dep,
            suggestion: "Refactor to remove this dependency",
          });
        }
      }
    }

    return violations;
  }

  async checkNaming() {
    const violations = [];
    const rules = await this.rules;

    const files = await this.getAllFiles("src");

    for (const file of files) {
      const layer = this.detectLayer(file);
      if (!layer || !rules.naming[layer]) continue;

      const fileName = path.basename(file, path.extname(file));
      const pattern = rules.naming[layer];

      if (!pattern.test(fileName)) {
        violations.push({
          type: "Naming Violation",
          message: `File name doesn't match ${layer} pattern: ${pattern}`,
          file: file,
          suggestion: this.suggestName(fileName, layer),
        });
      }
    }

    return violations;
  }

  async checkComplexity() {
    const violations = [];
    const rules = await this.rules;
    const files = await this.getAllFiles("src");

    for (const file of files) {
      const content = await fs.readFile(file, "utf8");
      const lines = content.split("\n");

      // Check file length
      if (lines.length > rules.complexity.maxFileLength) {
        violations.push({
          type: "Complexity Violation",
          message: `File too long: ${lines.length} lines (max: ${rules.complexity.maxFileLength})`,
          file: file,
          suggestion: "Split into smaller modules",
        });
      }

      // Check function lengths (simple regex-based check)
      const functionMatches = content.matchAll(
        /function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(/g,
      );

      for (const match of functionMatches) {
        const functionStart = match.index;
        const functionLines = this.countFunctionLines(content, functionStart);

        if (functionLines > rules.complexity.maxFunctionLength) {
          violations.push({
            type: "Complexity Violation",
            message: `Function too long: ${functionLines} lines (max: ${rules.complexity.maxFunctionLength})`,
            file: file,
            suggestion: "Extract into smaller functions",
          });
        }
      }
    }

    return violations;
  }

  async checkCircular() {
    const violations = [];
    const result = await madge("src", {
      circular: true,
      fileExtensions: ["ts", "tsx", "js", "jsx"],
    });

    const circular = result.circular();

    for (const cycle of circular) {
      violations.push({
        type: "Circular Dependency",
        message: `Circular dependency detected`,
        file: cycle[0],
        dependency: cycle.join(" → ") + " → " + cycle[0],
        suggestion: "Refactor to break the circular dependency",
      });
    }

    return violations;
  }

  detectLayer(filePath) {
    const normalizedPath = filePath.replace(/\\/g, "/");
    const parts = normalizedPath.split("/");

    // Find the layer based on directory structure
    for (const part of parts) {
      if (
        [
          "components",
          "services",
          "api",
          "pages",
          "utils",
          "hooks",
          "types",
        ].includes(part)
      ) {
        return part;
      }
    }

    return null;
  }

  suggestName(currentName, layer) {
    const suggestions = {
      components: (name) => name.charAt(0).toUpperCase() + name.slice(1),
      hooks: (name) => "use" + name.charAt(0).toUpperCase() + name.slice(1),
      utils: (name) => name.charAt(0).toLowerCase() + name.slice(1),
      types: (name) => name.charAt(0).toUpperCase() + name.slice(1),
    };

    const suggester = suggestions[layer];
    return suggester ? suggester(currentName) : currentName;
  }

  async getAllFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (
        entry.isDirectory() &&
        !["node_modules", ".git", "dist", "build"].includes(entry.name)
      ) {
        files.push(...(await this.getAllFiles(fullPath)));
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  countFunctionLines(content, startIndex) {
    let braceCount = 0;
    let inFunction = false;
    let lines = 0;

    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === "{") {
        braceCount++;
        inFunction = true;
      } else if (content[i] === "}") {
        braceCount--;
        if (braceCount === 0 && inFunction) {
          break;
        }
      } else if (content[i] === "\n" && inFunction) {
        lines++;
      }
    }

    return lines;
  }
}

// Export for use in other tools
module.exports = ArchitectureGuardian;

// Run if called directly
if (require.main === module) {
  const guardian = new ArchitectureGuardian();
  guardian.check().then((passed) => {
    process.exit(passed ? 0 : 1);
  });
}
```

### Phase 4: AI-Independent Enforcement (Week 7-8)

#### 4.1 Custom ESLint Rules

Create `eslint-rules/index.js`:

```javascript
module.exports = {
  rules: {
    "no-console-log": require("./no-console-log"),
    "no-improved-files": require("./no-improved-files"),
    "enforce-error-handling": require("./enforce-error-handling"),
    "require-explicit-types": require("./require-explicit-types"),
    "max-file-length": require("./max-file-length"),
    "enforce-naming": require("./enforce-naming"),
  },
};
```

Create `eslint-rules/no-console-log.js`:

```javascript
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow console.log in favor of projectLogger",
      category: "Optimal Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      useProjectLogger:
        "Use projectLogger.{{method}}() instead of console.{{method}}",
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      MemberExpression(node) {
        if (
          node.object.name === "console" &&
          ["log", "error", "warn", "info", "debug"].includes(node.property.name)
        ) {
          const method = node.property.name;

          context.report({
            node,
            messageId: "useProjectLogger",
            data: { method },
            fix(fixer) {
              // Check if projectLogger is imported
              const hasImport = sourceCode.ast.body.some(
                (node) =>
                  node.type === "ImportDeclaration" &&
                  node.source.value === "@/utils/logger",
              );

              const fixes = [];

              // Add import if missing
              if (!hasImport) {
                const firstImport = sourceCode.ast.body.find(
                  (node) => node.type === "ImportDeclaration",
                );

                if (firstImport) {
                  fixes.push(
                    fixer.insertTextBefore(
                      firstImport,
                      "import { projectLogger } from '@/utils/logger';\n",
                    ),
                  );
                } else {
                  fixes.push(
                    fixer.insertTextBeforeRange(
                      [0, 0],
                      "import { projectLogger } from '@/utils/logger';\n\n",
                    ),
                  );
                }
              }

              // Replace console with projectLogger
              fixes.push(fixer.replaceText(node.object, "projectLogger"));

              return fixes;
            },
          });
        }
      },
    };
  },
};
```

Create `eslint-rules/enforce-error-handling.js`:

```javascript
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce proper error handling in async functions",
      category: "Error Prevention",
      recommended: true,
    },
    schema: [],
    messages: {
      missingTryCatch: "Async function should have try-catch block",
      missingErrorType: "Catch block should specify error type",
      missingErrorLogging: "Errors should be logged before re-throwing",
    },
  },

  create(context) {
    return {
      FunctionDeclaration(node) {
        if (node.async) {
          checkAsyncFunction(node, context);
        }
      },

      FunctionExpression(node) {
        if (node.async) {
          checkAsyncFunction(node, context);
        }
      },

      ArrowFunctionExpression(node) {
        if (node.async) {
          checkAsyncFunction(node, context);
        }
      },

      CatchClause(node) {
        // Check for error type
        if (
          node.param &&
          node.param.type === "Identifier" &&
          !node.param.typeAnnotation
        ) {
          context.report({
            node: node.param,
            messageId: "missingErrorType",
          });
        }

        // Check for error logging
        const hasLogging = node.body.body.some(
          (statement) =>
            statement.type === "ExpressionStatement" &&
            statement.expression.type === "CallExpression" &&
            ((statement.expression.callee.type === "MemberExpression" &&
              statement.expression.callee.object.name === "projectLogger") ||
              (statement.expression.callee.type === "MemberExpression" &&
                statement.expression.callee.object.name === "console")),
        );

        if (!hasLogging) {
          context.report({
            node: node,
            messageId: "missingErrorLogging",
          });
        }
      },
    };
  },
};

function checkAsyncFunction(node, context) {
  const body = node.body;

  if (body.type === "BlockStatement") {
    const hasTryCatch = body.body.some(
      (statement) => statement.type === "TryStatement",
    );

    if (!hasTryCatch) {
      context.report({
        node: node,
        messageId: "missingTryCatch",
      });
    }
  }
}
```

#### 4.2 Automated Documentation Compliance

Create `tools/enforcement/doc-compliance.js`:

````javascript
#!/usr/bin/env node
const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const natural = require("natural");
const glob = require("glob");

class DocComplianceChecker {
  constructor() {
    this.bannedPhrases = [
      {
        pattern: /we're\s+excited\s+to/gi,
        suggestion: "Use neutral announcement",
      },
      {
        pattern: /successfully\s+implemented/gi,
        suggestion: "State what was implemented",
      },
      {
        pattern: /as\s+of\s+\w+\s+\d{4}/gi,
        suggestion: "Remove temporal references",
      },
      {
        pattern: /complete(ly)?/gi,
        suggestion: 'Use "functional" or "complete"',
      },
      {
        pattern: /functional(ly)?/gi,
        suggestion: "Use descriptive technical terms",
      },
      { pattern: /robust/gi, suggestion: 'Use "effective" or "robust"' },
      { pattern: /effective/gi, suggestion: "Use professional language" },
      { pattern: /cool/gi, suggestion: "Use technical descriptors" },
    ];

    this.statusAnnouncements = [
      "COMPLETE",
      "FIXED",
      "DONE",
      "FINISHED",
      "FINAL",
      "RESOLVED",
      "SHIPPED",
      "DELIVERED",
      "RELEASED",
    ];

    this.maxLineLength = 120;
    this.maxFileLength = 500;
  }

  async check() {
    console.log(chalk.blue("📚 Checking documentation compliance...\n"));

    const files = glob.sync("**/*.md", {
      ignore: ["node_modules/**", "dist/**", "build/**"],
    });

    let totalViolations = 0;
    const results = [];

    for (const file of files) {
      const violations = await this.checkFile(file);

      if (violations.length > 0) {
        totalViolations += violations.length;
        results.push({ file, violations });
      }
    }

    if (totalViolations === 0) {
      console.log(chalk.green("✅ All documentation compliant!"));
      return true;
    } else {
      console.error(
        chalk.red(`\n❌ Found ${totalViolations} documentation violations:\n`),
      );

      for (const result of results) {
        console.error(chalk.yellow(`\n${result.file}:`));

        for (const violation of result.violations) {
          console.error(
            chalk.red(`  Line ${violation.line}: ${violation.type}`),
          );
          console.error(chalk.gray(`    ${violation.context}`));
          if (violation.suggestion) {
            console.error(
              chalk.cyan(`    Suggestion: ${violation.suggestion}`),
            );
          }
        }
      }

      return false;
    }
  }

  async checkFile(filePath) {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n");
    const violations = [];

    // Check for banned phrases
    lines.forEach((line, index) => {
      for (const banned of this.bannedPhrases) {
        if (banned.pattern.test(line)) {
          violations.push({
            type: "Banned phrase",
            line: index + 1,
            context: line.trim(),
            suggestion: banned.suggestion,
          });
        }
      }

      // Check for status announcements
      for (const status of this.statusAnnouncements) {
        if (line.includes(status) && !line.includes("TODO")) {
          violations.push({
            type: "Status announcement",
            line: index + 1,
            context: line.trim(),
            suggestion: "Remove status announcements, use git commits",
          });
        }
      }

      // Check line length
      if (line.length > this.maxLineLength) {
        violations.push({
          type: "Line too long",
          line: index + 1,
          context: `${line.substring(0, 50)}... (${line.length} chars)`,
          suggestion: `Keep lines under ${this.maxLineLength} characters`,
        });
      }
    });

    // Check file length
    if (lines.length > this.maxFileLength) {
      violations.push({
        type: "File too long",
        line: lines.length,
        context: `File has ${lines.length} lines`,
        suggestion: `Split into multiple files (max ${this.maxFileLength} lines)`,
      });
    }

    // Check for proper structure
    const structure = this.analyzeStructure(content);

    if (!structure.hasTitle) {
      violations.push({
        type: "Missing title",
        line: 1,
        context: "No H1 heading found",
        suggestion: "Add a title with # at the beginning",
      });
    }

    if (!structure.hasTableOfContents && lines.length > 100) {
      violations.push({
        type: "Missing table of contents",
        line: 1,
        context: "Long document without TOC",
        suggestion: "Add ## Table of Contents section",
      });
    }

    // Check code blocks
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];

    codeBlocks.forEach((block, index) => {
      const blockLines = block.split("\n");

      if (blockLines.length > 20) {
        const lineNumber = content
          .substring(0, content.indexOf(block))
          .split("\n").length;

        violations.push({
          type: "Code block too long",
          line: lineNumber,
          context: `Code block has ${blockLines.length} lines`,
          suggestion: "Link to source file instead",
        });
      }

      // Check for language specification
      if (!/^```\w+/.test(block)) {
        const lineNumber = content
          .substring(0, content.indexOf(block))
          .split("\n").length;

        violations.push({
          type: "Missing language specification",
          line: lineNumber,
          context: "Code block without language",
          suggestion: "Add language after ``` (e.g., ```javascript)",
        });
      }
    });

    return violations;
  }

  analyzeStructure(content) {
    const lines = content.split("\n");

    return {
      hasTitle: lines.some((line) => /^#\s+[^#]/.test(line)),
      hasTableOfContents: lines.some(
        (line) => /table of contents/i.test(line) || /## Contents/i.test(line),
      ),
      headingLevels: lines
        .filter((line) => /^#+\s/.test(line))
        .map((line) => line.match(/^#+/)[0].length),
    };
  }

  async fix(filePath) {
    let content = await fs.readFile(filePath, "utf8");

    // Fix banned phrases
    for (const banned of this.bannedPhrases) {
      content = content.replace(banned.pattern, (match) => {
        console.log(chalk.yellow(`Replacing "${match}" with neutral language`));
        return this.getNeutralReplacement(match, banned.suggestion);
      });
    }

    // Remove status announcements
    const lines = content.split("\n");
    const filteredLines = lines.filter((line) => {
      for (const status of this.statusAnnouncements) {
        if (line.includes(status) && !line.includes("TODO")) {
          console.log(
            chalk.yellow(`Removing status announcement: ${line.trim()}`),
          );
          return false;
        }
      }
      return true;
    });

    content = filteredLines.join("\n");

    // Write fixed content
    await fs.writeFile(filePath, content);
    console.log(chalk.green(`✅ Fixed ${filePath}`));
  }

  getNeutralReplacement(original, suggestion) {
    const replacements = {
      "we're excited to": "This document describes",
      "successfully implemented": "implemented",
      complete: "functional",
      perfectly: "completely",
      functional: "effective",
      amazingly: "effectively",
      robust: "robust",
      effective: "powerful",
      cool: "useful",
    };

    const lower = original.toLowerCase();
    return replacements[lower] || suggestion;
  }
}

// Export for use in other tools
module.exports = DocComplianceChecker;

// Run if called directly
if (require.main === module) {
  const checker = new DocComplianceChecker();

  const command = process.argv[2];

  if (command === "fix") {
    const file = process.argv[3];
    if (file) {
      checker.fix(file).catch(console.error);
    } else {
      console.error("Please specify a file to fix");
    }
  } else {
    checker.check().then((passed) => {
      process.exit(passed ? 0 : 1);
    });
  }
}
````

## Implementation Roadmap

### Week 1-2: Foundation ✅ **COMPLETED**

- [x] Implement git hooks with Husky
- [x] Create basic enforcement scripts (no-improved-files, import validation)
- [x] Add smart context auto-loader
- [x] Update package.json with unified commands
- [x] Create setup script for one-command initialization

**Status**: Foundation layer is functional. Git hooks prevent violations, enforcement scripts catch common issues, and unified commands work reliably.

### Week 3-4: Integration ⚠️ **PARTIALLY COMPLETE**

- [x] Build smart commit assistant with auto-fixes (basic version)
- [x] Implement context watcher for real-time optimization (basic version)
- [x] Create unified dev command with orchestrator (npm run dev works)
- [x] Add architectural drift detection (basic checks)
- [x] Integrate with existing AI tools (Cursor, Copilot via hooks)

**Status**: Core integration workflows are functional but need refinement. Template customization, project creation, and dev environment all work. Context management is operational.

### Week 5-6: Advanced Tools 🔄 **IN PROGRESS**

- [x] Develop VS Code extension for real-time enforcement (basic version exists)
- [ ] Implement intelligent test generation (concept exists, needs completion)
- [ ] Add CRAFT prompt improver (planned in extension)
- [ ] Create Arrow-Chain RCA tooling (planned in extension)
- [ ] Build architecture guardian with visual reports (basic checks exist)

**Status**: VS Code extension framework is built with basic enforcement. Advanced AI tooling concepts are designed but need implementation.

### Week 7-8: Polish & Rollout

- [ ] Add custom ESLint rules for all critical patterns
- [ ] Implement documentation compliance checker
- [ ] Create onboarding automation script
- [ ] Build metrics dashboard
- [ ] Document and train team

## Success Metrics

### Quantitative Metrics

| Metric           | Current  | Target     | Measurement Method                          |
| ---------------- | -------- | ---------- | ------------------------------------------- |
| Automation Rate  | 30%      | 80%+       | Count of automated vs manual checks         |
| Manual Commands  | 15+      | 3          | Number of commands developers must remember |
| Time to Onboard  | 2 hours  | 15 minutes | Time from clone to productive               |
| Rule Violations  | ~50/week | <5/week    | Git hook rejection rate                     |
| Context Accuracy | ~40%     | 85%+       | Developer survey on context relevance       |
| Test Coverage    | Variable | 90%+       | Automated coverage reports                  |
| PR Review Time   | 45 min   | 15 min     | Average time to review AI-generated PRs     |

### Qualitative Metrics

- **Developer Satisfaction**: Monthly survey on tool effectiveness
- **Code Quality**: Reduction in architectural violations over time
- **AI Productivity**: Lines of usable code per AI interaction
- **Team Adoption**: Percentage of team actively using all tools

### Leading Indicators

1. **Daily Active Usage**: Track which tools are actually being used
2. **Bypass Rate**: How often developers skip automated checks
3. **Fix Success Rate**: Percentage of auto-fixes that work correctly
4. **Context Hit Rate**: How often the auto-loaded context is relevant

## Investment & ROI

### Investment Required

| Resource                 | Effort                            | Cost                   |
| ------------------------ | --------------------------------- | ---------------------- |
| Development Time         | 8 weeks × 1 developer             | $32,000 (@ $200k/year) |
| Testing & Refinement     | 2 weeks × 0.5 developer           | $4,000                 |
| Documentation & Training | 1 week × 1 developer              | $4,000                 |
| Infrastructure           | VS Code marketplace, npm registry | $500                   |
| **Total**                | **11 developer-weeks**            | **~$40,500**           |

### Expected ROI

| Benefit                    | Weekly Hours Saved | Annual Value              |
| -------------------------- | ------------------ | ------------------------- |
| Reduced Context Switching  | 3 hours/dev/week   | $93,600 (10 devs)         |
| Fewer Bugs from Violations | 2 hours/dev/week   | $62,400 (10 devs)         |
| Faster Onboarding          | 20 hours/new dev   | $16,000 (4 new devs/year) |
| Improved AI Productivity   | 2 hours/dev/week   | $62,400 (10 devs)         |
| **Total Annual Savings**   | **~150 hours/dev** | **~$234,400**             |

**Break-even**: 2.1 months
**First Year ROI**: 478%

## Risk Mitigation

### Technical Risks

1. **Over-automation Creating Rigidity**
   - Mitigation: Provide escape hatches and override options
   - Implementation: `--skip-checks` flags, `.aiignore` patterns

2. **Performance Impact on Development**
   - Mitigation: Incremental processing, smart caching
   - Implementation: Background workers, debounced operations

3. **Tool Conflicts with Existing Setup**
   - Mitigation: Extensive compatibility testing
   - Implementation: Feature flags, gradual rollout

### Organizational Risks

1. **Team Resistance to New Workflows**
   - Mitigation: Involve team in design, gradual adoption
   - Implementation: Opt-in period, feedback loops

2. **Maintenance Burden**
   - Mitigation: Comprehensive tests, clear documentation
   - Implementation: Automated testing, self-documenting code

3. **Dependency on Specific Tools**
   - Mitigation: Abstract interfaces, plugin architecture
   - Implementation: Tool-agnostic core, adapters for each AI tool

## Conclusion

This proposal transforms ProjectTemplate from a well-intentioned but manual framework into a truly integrated
development environment. By automating the enforcement of optimal practices and making the right thing the easiest
thing,
we can achieve the original vision of friction-free AI-assisted development.

The phased approach ensures quick wins while building toward comprehensive automation. Each phase delivers immediate
value while laying groundwork for the next, with clear metrics to track success.

The investment is modest compared to the potential returns, with break-even in just over two months and nearly 5x ROI in
the first year. More importantly, it will make developers happier and more productive by removing the meta-friction of
using friction-reduction tools.

By implementing this proposal, ProjectTemplate will become not just a template, but an intelligent development assistant
that actively guides teams toward excellence.
