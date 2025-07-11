import * as vscode from "vscode";

export class DashboardProvider {
  public static currentPanel: DashboardProvider | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (DashboardProvider.currentPanel) {
      DashboardProvider.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      "projecttemplateDashboard",
      "ProjectTemplate Dashboard",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );

    DashboardProvider.currentPanel = new DashboardProvider(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables,
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "refresh":
            this._update();
            break;
          case "openSettings":
            vscode.commands.executeCommand(
              "workbench.action.openSettings",
              "projecttemplate",
            );
            break;
          case "runCommand":
            vscode.commands.executeCommand(message.commandId);
            break;
        }
      },
      null,
      this._disposables,
    );
  }

  public dispose() {
    DashboardProvider.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;
    this._panel.title = "ProjectTemplate Dashboard";
    this._panel.webview.html = await this._getHtmlForWebview(webview);
  }

  private async _getHtmlForWebview(webview: vscode.Webview) {
    // Get configuration
    const config = vscode.workspace.getConfiguration("projecttemplate");
    const stats = await this._gatherStats();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProjectTemplate Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 0;
            margin: 0;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            color: var(--vscode-titleBar-activeForeground);
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
        }
        
        .card h2 {
            margin-top: 0;
            color: var(--vscode-titleBar-activeForeground);
            font-size: 18px;
        }
        
        .stat {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .stat:last-child {
            border-bottom: none;
        }
        
        .stat-value {
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        
        .button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
            display: inline-block;
        }
        
        .button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .feature-list {
            list-style: none;
            padding: 0;
        }
        
        .feature-list li {
            padding: 8px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
        }
        
        .status-indicator.active {
            background: #4caf50;
        }
        
        .status-indicator.inactive {
            background: #f44336;
        }
        
        .command-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        
        .settings-grid {
            display: grid;
            gap: 15px;
        }
        
        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: var(--vscode-input-background);
            border-radius: 4px;
        }
        
        .icon {
            font-size: 24px;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>
            <span class="icon">🚀</span>
            ProjectTemplate Dashboard
        </h1>
        
        <div class="grid">
            <!-- Status Card -->
            <div class="card">
                <h2>Extension Status</h2>
                <ul class="feature-list">
                    <li>
                        <span class="status-indicator ${config.get("enableAutoContext") ? "active" : "inactive"}"></span>
                        Auto Context Loading
                    </li>
                    <li>
                        <span class="status-indicator ${config.get("enableNamingEnforcement") ? "active" : "inactive"}"></span>
                        File Naming Enforcement
                    </li>
                    <li>
                        <span class="status-indicator active"></span>
                        Git Hooks Active
                    </li>
                </ul>
                <button class="button" onclick="openSettings()">Configure Settings</button>
            </div>
            
            <!-- Statistics Card -->
            <div class="card">
                <h2>Project Statistics</h2>
                <div class="stat">
                    <span>Files Processed</span>
                    <span class="stat-value">${stats.filesProcessed}</span>
                </div>
                <div class="stat">
                    <span>Context Loads Today</span>
                    <span class="stat-value">${stats.contextLoads}</span>
                </div>
                <div class="stat">
                    <span>Violations Found</span>
                    <span class="stat-value">${stats.violations}</span>
                </div>
                <div class="stat">
                    <span>Recent Files Tracked</span>
                    <span class="stat-value">${stats.recentFiles}</span>
                </div>
            </div>
            
            <!-- Quick Actions Card -->
            <div class="card">
                <h2>Quick Actions</h2>
                <div class="command-grid">
                    <button class="button" onclick="runCommand('projecttemplate.loadContext')">
                        Load Context
                    </button>
                    <button class="button" onclick="runCommand('projecttemplate.checkNaming')">
                        Check Naming
                    </button>
                    <button class="button" onclick="runCommand('projecttemplate.refreshContext')">
                        Refresh Context
                    </button>
                    <button class="button secondary" onclick="refresh()">
                        Refresh Dashboard
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Configuration Card -->
        <div class="card">
            <h2>Current Configuration</h2>
            <div class="settings-grid">
                <div class="setting-item">
                    <span>Max Context Tokens</span>
                    <span class="stat-value">${config.get("maxContextTokens")}</span>
                </div>
                <div class="setting-item">
                    <span>Recent Files Count</span>
                    <span class="stat-value">${config.get("recentFilesCount")}</span>
                </div>
                <div class="setting-item">
                    <span>Context Sources</span>
                    <span class="stat-value">${config.get<string[]>("contextSources")?.length || 0} files</span>
                </div>
            </div>
        </div>
        
        <!-- Help Card -->
        <div class="card">
            <h2>Keyboard Shortcuts</h2>
            <div class="settings-grid">
                <div class="setting-item">
                    <span>Load AI Context</span>
                    <code>Cmd+Shift+C</code>
                </div>
                <div class="setting-item">
                    <span>Refresh Context</span>
                    <code>Cmd+Shift+R</code>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }
        
        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
        }
        
        function runCommand(commandId) {
            vscode.postMessage({ command: 'runCommand', commandId: commandId });
        }
    </script>
</body>
</html>`;
  }

  private async _gatherStats(): Promise<any> {
    // Gather statistics (in a real implementation, these would come from actual tracking)
    const workspaceState = this.context?.workspaceState;

    return {
      filesProcessed: workspaceState?.get("filesProcessed", 0) || 0,
      contextLoads: workspaceState?.get("contextLoadsToday", 0) || 0,
      violations: workspaceState?.get("violationsFound", 0) || 0,
      recentFiles: workspaceState?.get<string[]>("recentFiles", []).length || 0,
    };
  }

  private get context(): vscode.ExtensionContext | undefined {
    // In a real implementation, this would be passed in constructor
    return undefined;
  }
}
