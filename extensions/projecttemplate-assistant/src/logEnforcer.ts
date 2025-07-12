import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';

export interface LogViolation {
  line: number;
  column: number;
  type: 'console_usage' | 'print_statement';
  method?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fixable: boolean;
}

export interface LogEnforcementResult {
  success: boolean;
  violations: LogViolation[];
  stats: {
    filesAnalyzed: number;
    filesExcluded: number;
    totalViolations: number;
    timeElapsed: number;
  };
}

export class LogEnforcer {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private statusBarItem: vscode.StatusBarItem;
  private workspaceRoot: string;
  private isEnabled: boolean = true;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('projecttemplate-log-enforcement');
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    this.statusBarItem.command = 'projecttemplate.showLogEnforcementStatus';
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    this.workspaceRoot = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';
    
    this.updateConfiguration();
    this.updateStatusBar();
  }

  public updateConfiguration() {
    const config = vscode.workspace.getConfiguration('projecttemplate');
    this.isEnabled = config.get('enableLogEnforcement', true);
    
    if (this.isEnabled) {
      this.statusBarItem.show();
    } else {
      this.statusBarItem.hide();
      this.diagnosticCollection.clear();
    }
    
    this.updateStatusBar();
  }

  public async checkDocument(document: vscode.TextDocument): Promise<void> {
    if (!this.isEnabled) return;
    if (!this.isSupportedLanguage(document.languageId)) return;
    if (this.isTestFile(document.fileName)) return;

    try {
      const result = await this.analyzeFile(document.fileName);
      this.updateDiagnostics(document, result.violations);
      this.updateStatusBar(result.violations.length);
    } catch (error) {
      console.error('Log enforcement check failed:', error);
    }
  }

  public async checkWorkspace(): Promise<LogEnforcementResult> {
    if (!this.workspaceRoot) {
      throw new Error('No workspace folder found');
    }

    return new Promise((resolve, reject) => {
      const logEnforcerPath = path.join(this.workspaceRoot, 'tools/enforcement/log-enforcer.js');
      
      const child = spawn('node', [logEnforcerPath, 'check', '--format=json'], {
        cwd: this.workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        try {
          // Extract JSON from the output (skip the initial status messages)
          const jsonStart = stdout.indexOf('{');
          if (jsonStart === -1) {
            reject(new Error('No JSON output found from log enforcer'));
            return;
          }

          const jsonOutput = stdout.substring(jsonStart);
          const result = JSON.parse(jsonOutput);
          
          // Convert to our format
          const violations: LogViolation[] = result.violations.map((v: any) => ({
            line: v.line,
            column: v.column,
            type: v.type,
            method: v.method,
            message: v.message,
            severity: 'error' as const,
            fixable: true
          }));

          resolve({
            success: result.summary.totalViolations === 0,
            violations,
            stats: {
              filesAnalyzed: result.summary.filesAnalyzed,
              filesExcluded: result.summary.filesExcluded,
              totalViolations: result.summary.totalViolations,
              timeElapsed: result.summary.timeElapsed
            }
          });
        } catch (error) {
          reject(new Error(`Failed to parse log enforcer output: ${error}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to run log enforcer: ${error}`));
      });
    });
  }

  public async fixDocument(document: vscode.TextDocument): Promise<boolean> {
    if (!this.workspaceRoot) return false;

    return new Promise((resolve, reject) => {
      const logEnforcerPath = path.join(this.workspaceRoot, 'tools/enforcement/log-enforcer.js');
      
      const child = spawn('node', [logEnforcerPath, 'fix', document.fileName], {
        cwd: this.workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`Log enforcer fix failed: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to run log enforcer fix: ${error}`));
      });
    });
  }

  public async fixWorkspace(): Promise<void> {
    if (!this.workspaceRoot) return;

    return new Promise((resolve, reject) => {
      const logEnforcerPath = path.join(this.workspaceRoot, 'tools/enforcement/log-enforcer.js');
      
      const child = spawn('node', [logEnforcerPath, 'fix'], {
        cwd: this.workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          vscode.window.showInformationMessage('✅ Log enforcement fixes applied');
          resolve();
        } else {
          reject(new Error(`Log enforcer fix failed: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to run log enforcer fix: ${error}`));
      });
    });
  }

  private async analyzeFile(filePath: string): Promise<{ violations: LogViolation[] }> {
    if (!this.workspaceRoot) {
      return { violations: [] };
    }

    return new Promise((resolve, reject) => {
      const logEnforcerPath = path.join(this.workspaceRoot, 'tools/enforcement/log-enforcer.js');
      
      const child = spawn('node', [logEnforcerPath, 'check', '--format=json', filePath], {
        cwd: this.workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        try {
          // Extract JSON from the output
          const jsonStart = stdout.indexOf('{');
          if (jsonStart === -1) {
            resolve({ violations: [] });
            return;
          }

          const jsonOutput = stdout.substring(jsonStart);
          const result = JSON.parse(jsonOutput);
          
          // Convert to our format
          const violations: LogViolation[] = result.violations
            .filter((v: any) => v.filepath === filePath)
            .map((v: any) => ({
              line: v.line,
              column: v.column,
              type: v.type,
              method: v.method,
              message: v.message,
              severity: 'error' as const,
              fixable: true
            }));

          resolve({ violations });
        } catch (error) {
          console.error('Failed to parse log enforcer output:', error);
          resolve({ violations: [] });
        }
      });

      child.on('error', (error) => {
        console.error('Failed to run log enforcer:', error);
        resolve({ violations: [] });
      });
    });
  }

  private updateDiagnostics(document: vscode.TextDocument, violations: LogViolation[]) {
    const diagnostics: vscode.Diagnostic[] = violations.map(violation => {
      const range = new vscode.Range(
        Math.max(0, violation.line - 1),
        Math.max(0, violation.column - 1),
        Math.max(0, violation.line - 1),
        document.lineAt(Math.max(0, violation.line - 1)).text.length
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        violation.message,
        violation.severity === 'error' ? vscode.DiagnosticSeverity.Error :
        violation.severity === 'warning' ? vscode.DiagnosticSeverity.Warning :
        vscode.DiagnosticSeverity.Information
      );

      diagnostic.source = 'ProjectTemplate Log Enforcer';
      diagnostic.code = violation.type;

      return diagnostic;
    });

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  private updateStatusBar(violationCount?: number) {
    if (!this.isEnabled) {
      this.statusBarItem.hide();
      return;
    }

    if (violationCount !== undefined) {
      if (violationCount > 0) {
        this.statusBarItem.text = `$(warning) Log: ${violationCount}`;
        this.statusBarItem.tooltip = `${violationCount} logging violations found`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      } else {
        this.statusBarItem.text = `$(check) Log: Clean`;
        this.statusBarItem.tooltip = 'No logging violations';
        this.statusBarItem.backgroundColor = undefined;
      }
    } else {
      this.statusBarItem.text = `$(eye) Log: Active`;
      this.statusBarItem.tooltip = 'Log enforcement is active';
      this.statusBarItem.backgroundColor = undefined;
    }

    this.statusBarItem.show();
  }

  private isSupportedLanguage(languageId: string): boolean {
    return ['javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'python'].includes(languageId);
  }

  private isTestFile(fileName: string): boolean {
    const config = vscode.workspace.getConfiguration('projecttemplate');
    const excludeTests = config.get('logEnforcementExcludeTests', true);
    
    if (!excludeTests) return false;

    const testPatterns = [
      /\.test\.[jt]sx?$/,
      /\.spec\.[jt]sx?$/,
      /test_.*\.py$/,
      /.*_test\.py$/,
      /\/tests?\//,
      /\/__tests__\//,
      /\/testing\//
    ];

    return testPatterns.some(pattern => pattern.test(fileName));
  }

  public dispose() {
    this.diagnosticCollection.dispose();
    this.statusBarItem.dispose();
  }
}

export class LogEnforcementCodeActionProvider implements vscode.CodeActionProvider {
  private logEnforcer: LogEnforcer;

  constructor(logEnforcer: LogEnforcer) {
    this.logEnforcer = logEnforcer;
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    // Check if there are log enforcement diagnostics in range
    const logDiagnostics = context.diagnostics.filter(
      diagnostic => diagnostic.source === 'ProjectTemplate Log Enforcer'
    );

    if (logDiagnostics.length > 0) {
      // Quick fix for current line
      const quickFixAction = new vscode.CodeAction(
        'Fix logging violation',
        vscode.CodeActionKind.QuickFix
      );
      quickFixAction.command = {
        command: 'projecttemplate.fixLogViolation',
        title: 'Fix logging violation',
        arguments: [document.uri, range]
      };
      actions.push(quickFixAction);

      // Fix all violations in file
      const fixAllAction = new vscode.CodeAction(
        'Fix all logging violations in file',
        vscode.CodeActionKind.QuickFix
      );
      fixAllAction.command = {
        command: 'projecttemplate.fixAllLogViolations',
        title: 'Fix all logging violations in file',
        arguments: [document.uri]
      };
      actions.push(fixAllAction);

      // Disable for this line
      const disableLineAction = new vscode.CodeAction(
        'Disable log enforcement for this line',
        vscode.CodeActionKind.QuickFix
      );
      disableLineAction.command = {
        command: 'projecttemplate.disableLogEnforcementLine',
        title: 'Disable log enforcement for this line',
        arguments: [document.uri, range]
      };
      actions.push(disableLineAction);
    }

    return actions;
  }
}