import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { spawn } from "child_process";

export interface ValidationResult {
  passed: boolean;
  score: number;
  violations: Array<{
    rule: string;
    severity: string;
    description: string;
    context?: string;
  }>;
  summary: string;
  processingTime: number;
}

export class ClaudeValidator {
  private workspacePath: string;
  private validatorPath: string;

  constructor() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder found");
    }
    
    this.workspacePath = workspaceFolder.uri.fsPath;
    this.validatorPath = path.join(
      this.workspacePath,
      "tools",
      "claude-validation",
      "validate-claude.js"
    );
  }

  async isValidatorAvailable(): Promise<boolean> {
    try {
      return fs.existsSync(this.validatorPath);
    } catch {
      return false;
    }
  }

  async validateResponse(responseText: string): Promise<ValidationResult> {
    if (!await this.isValidatorAvailable()) {
      throw new Error("Claude validator not found. Make sure you're in a ProjectTemplate workspace.");
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const child = spawn("node", [this.validatorPath, "--json"], {
        cwd: this.workspacePath,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        const processingTime = Date.now() - startTime;

        if (code !== 0) {
          reject(new Error(`Validation failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          // Parse the JSON output from the validator
          const result = JSON.parse(stdout);
          
          // Track validation result
          this.trackValidation({
            ...result,
            processingTime,
          });

          resolve({
            ...result,
            processingTime,
          });
        } catch (error) {
          reject(new Error(`Failed to parse validation result: ${error}`));
        }
      });

      child.on("error", (error) => {
        reject(new Error(`Failed to run validator: ${error.message}`));
      });

      // Send the response text to the validator
      child.stdin.write(responseText);
      child.stdin.end();
    });
  }

  async validateFromClipboard(): Promise<ValidationResult> {
    const clipboardText = await vscode.env.clipboard.readText();
    
    if (!clipboardText || clipboardText.trim().length === 0) {
      throw new Error("Clipboard is empty");
    }

    return this.validateResponse(clipboardText);
  }

  async showValidationResult(result: ValidationResult): Promise<void> {
    const { passed, score, violations } = result;

    // Create result message
    const icon = passed ? "✅" : "❌";
    const title = `${icon} Claude Validation ${passed ? "Passed" : "Failed"}`;
    const scoreText = `Score: ${score}/100`;
    
    if (passed) {
      // Show success notification
      vscode.window.showInformationMessage(
        `${title} (${scoreText})`,
        "View Details"
      ).then((selection) => {
        if (selection === "View Details") {
          this.showDetailedResults(result);
        }
      });
    } else {
      // Show failure with violations
      const violationCount = violations.length;
      const criticalCount = violations.filter(v => v.severity === "CRITICAL").length;
      
      const message = criticalCount > 0 
        ? `${title} - ${criticalCount} critical violations`
        : `${title} - ${violationCount} violations (${scoreText})`;

      vscode.window.showWarningMessage(
        message,
        "View Details",
        "Fix Issues",
        "Ignore"
      ).then((selection) => {
        if (selection === "View Details") {
          this.showDetailedResults(result);
        } else if (selection === "Fix Issues") {
          this.showFixSuggestions(violations);
        }
      });
    }
  }

  private showDetailedResults(result: ValidationResult): void {
    const panel = vscode.window.createWebviewPanel(
      "claudeValidationResults",
      "Claude Validation Results",
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        localResourceRoots: [],
      }
    );

    panel.webview.html = this.getResultsHtml(result);
  }

  private getResultsHtml(result: ValidationResult): string {
    const { passed, score, violations, summary, processingTime } = result;
    
    const violationsHtml = violations.map(v => `
      <div class="violation ${v.severity.toLowerCase()}">
        <div class="violation-header">
          <span class="severity">${v.severity}</span>
          <span class="rule">${v.rule}</span>
        </div>
        <div class="description">${v.description}</div>
        ${v.context ? `<div class="context">${v.context}</div>` : ''}
      </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            line-height: 1.6;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        .header {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .status {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .passed { color: #4CAF50; }
        .failed { color: #F44336; }
        .score {
            font-size: 18px;
            color: var(--vscode-descriptionForeground);
        }
        .summary {
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textBlockQuote-border);
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .violations {
            margin-top: 20px;
        }
        .violation {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            margin-bottom: 15px;
            overflow: hidden;
        }
        .violation-header {
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .critical .violation-header { background: rgba(244, 67, 54, 0.1); }
        .warning .violation-header { background: rgba(255, 152, 0, 0.1); }
        .info .violation-header { background: rgba(33, 150, 243, 0.1); }
        .severity {
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 12px;
          font-size: 12px;
        }
        .critical .severity { background: #F44336; color: white; }
        .warning .severity { background: #FF9800; color: white; }
        .info .severity { background: #2196F3; color: white; }
        .rule {
          font-family: monospace;
          background: var(--vscode-textCodeBlock-background);
          padding: 2px 6px;
          border-radius: 3px;
        }
        .description {
          padding: 15px;
        }
        .context {
          padding: 0 15px 15px;
          font-family: monospace;
          background: var(--vscode-textCodeBlock-background);
          border-top: 1px solid var(--vscode-panel-border);
          font-size: 12px;
        }
        .stats {
          display: flex;
          gap: 20px;
          margin-top: 20px;
          font-size: 14px;
          color: var(--vscode-descriptionForeground);
        }
        .no-violations {
          text-align: center;
          padding: 40px;
          color: var(--vscode-descriptionForeground);
        }
        .actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        .btn {
          padding: 8px 16px;
          border: 1px solid var(--vscode-button-border);
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          text-decoration: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn:hover {
          background: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="status ${passed ? 'passed' : 'failed'}">
            ${passed ? '✅' : '❌'} Claude Validation ${passed ? 'Passed' : 'Failed'}
        </div>
        <div class="score">Score: ${score}/100</div>
    </div>

    ${summary ? `<div class="summary">${summary}</div>` : ''}

    <div class="violations">
        <h3>Validation Results (${violations.length} ${violations.length === 1 ? 'issue' : 'issues'})</h3>
        ${violations.length > 0 ? violationsHtml : '<div class="no-violations">🎉 No violations found!</div>'}
    </div>

    <div class="stats">
        <span>Processing Time: ${processingTime}ms</span>
        <span>Critical: ${violations.filter(v => v.severity === 'CRITICAL').length}</span>
        <span>Warnings: ${violations.filter(v => v.severity === 'WARNING').length}</span>
        <span>Info: ${violations.filter(v => v.severity === 'INFO').length}</span>
    </div>

    <div class="actions">
        <button class="btn" onclick="openConfig()">Open Config</button>
        <button class="btn" onclick="runAgain()">Run Again</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function openConfig() {
            vscode.postMessage({ command: 'openConfig' });
        }
        
        function runAgain() {
            vscode.postMessage({ command: 'runAgain' });
        }
    </script>
</body>
</html>
    `;
  }

  private showFixSuggestions(violations: Array<{ rule: string; severity: string; description: string; context?: string }>): void {
    const suggestions = violations.map(v => {
      switch (v.rule) {
        case 'promptImprovement':
          return '• Start complex requests with "**Improved Prompt**:"';
        case 'noImprovedFiles':
          return '• Edit original files instead of creating _improved versions';
        case 'generatorUsage':
          return '• Use component generators: npm run g:c ComponentName';
        case 'todoWriteUsage':
          return '• Break multi-step tasks into TodoWrite entries';
        default:
          return `• ${v.description}`;
      }
    }).join('\n');

    const panel = vscode.window.createWebviewPanel(
      "claudeFixSuggestions",
      "Fix Suggestions",
      vscode.ViewColumn.Two,
      {}
    );

    panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            line-height: 1.6;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 4px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <h2>🔧 Fix Suggestions</h2>
    <p>Here are specific actions to address the validation issues:</p>
    <pre>${suggestions}</pre>
    <p>For more details, see the <a href="file://${this.workspacePath}/CLAUDE.md">CLAUDE.md</a> file.</p>
</body>
</html>
    `;
  }

  private async trackValidation(result: ValidationResult): Promise<void> {
    try {
      // Track via existing metrics system
      const metricsPath = path.join(this.workspacePath, "tools", "metrics", "user-feedback-system.js");
      if (fs.existsSync(metricsPath)) {
        spawn("node", [
          metricsPath,
          "track-claude",
          result.passed.toString(),
          result.score.toString(),
          result.processingTime.toString()
        ], {
          cwd: this.workspacePath,
          stdio: 'ignore'
        });
      }
    } catch (error) {
      // Don't break validation for tracking failures
      console.warn("Failed to track validation:", error);
    }
  }

  async openConfigurationFile(): Promise<void> {
    const configPath = path.join(
      this.workspacePath,
      "tools",
      "claude-validation",
      ".claude-validation-config.json"
    );

    if (fs.existsSync(configPath)) {
      const doc = await vscode.workspace.openTextDocument(configPath);
      vscode.window.showTextDocument(doc);
    } else {
      vscode.window.showErrorMessage("Claude validation config file not found");
    }
  }

  async runConfigCommand(command: string, ...args: string[]): Promise<void> {
    const configManagerPath = path.join(
      this.workspacePath,
      "tools",
      "claude-validation",
      "config-manager.js"
    );

    if (!fs.existsSync(configManagerPath)) {
      vscode.window.showErrorMessage("Claude validation config manager not found");
      return;
    }

    const terminal = vscode.window.createTerminal("Claude Config");
    terminal.sendText(`node "${configManagerPath}" ${command} ${args.join(" ")}`);
    terminal.show();
  }
}