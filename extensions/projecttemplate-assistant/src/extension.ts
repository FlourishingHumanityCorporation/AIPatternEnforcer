import * as vscode from "vscode";
import * as path from "path";
import { ContextManager } from "./contextManager";
import { FileNameEnforcer, FileViolation } from "./fileNameEnforcer";
import { DashboardProvider } from "./dashboardProvider";
import { ClaudeValidator } from "./claudeValidator";
import { LogEnforcer, LogEnforcementCodeActionProvider } from "./logEnforcer";

let contextManager: ContextManager;
let fileNameEnforcer: FileNameEnforcer;
let claudeValidator: ClaudeValidator;
let logEnforcer: LogEnforcer;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  logger.info("ProjectTemplate Assistant is now active");

  // Initialize components
  contextManager = new ContextManager(context);
  fileNameEnforcer = new FileNameEnforcer();

  // Initialize log enforcer
  try {
    logEnforcer = new LogEnforcer();
  } catch (error) {
    logger.info("Log enforcer not available:", error);
  }

  // Initialize Claude validator (with error handling for non-ProjectTemplate workspaces)
  try {
    claudeValidator = new ClaudeValidator();
  } catch (error) {
    logger.info("Claude validator not available:", error);
  }

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(rocket) PT: Active";
  statusBarItem.tooltip =
  "ProjectTemplate Assistant is active\nClick to open dashboard";
  statusBarItem.command = "projecttemplate.showDashboard";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands
  registerCommands(context);

  // Set up file system watcher for auto-context
  if (
  vscode.workspace.
  getConfiguration("projecttemplate").
  get("enableAutoContext"))
  {
    setupAutoContext(context);
  }

  // Set up file name enforcement
  if (
  vscode.workspace.
  getConfiguration("projecttemplate").
  get("enableNamingEnforcement"))
  {
    setupNamingEnforcement(context);
  }

  // Set up log enforcement
  if (logEnforcer && vscode.workspace.
  getConfiguration("projecttemplate").
  get("enableLogEnforcement", true))
  {
    setupLogEnforcement(context);
  }

  // Show welcome message on first activation
  if (context.globalState.get("projecttemplate.firstActivation", true)) {
    showWelcomeMessage();
    context.globalState.update("projecttemplate.firstActivation", false);
  }
}

function registerCommands(context: vscode.ExtensionContext) {
  // Load context command
  context.subscriptions.push(
    vscode.commands.registerCommand("projecttemplate.loadContext", async () => {
      try {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
          vscode.window.showInformationMessage("No active editor found");
          return;
        }

        const context = await contextManager.buildContext(
          activeEditor.document
        );

        // Copy to clipboard
        await vscode.env.clipboard.writeText(context);

        // Show notification
        vscode.window.
        showInformationMessage(
          `AI context loaded (${contextManager.getTokenCount(context)} tokens). Copied to clipboard!`,
          "View Context"
        ).
        then((selection) => {
          if (selection === "View Context") {
            showContextPreview(context);
          }
        });

        // Update status bar
        updateStatusBar("Context Loaded", 2000);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to load context: ${error}`);
      }
    })
  );

  // Refresh context command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "projecttemplate.refreshContext",
      async () => {
        await contextManager.clearCache();
        vscode.commands.executeCommand("projecttemplate.loadContext");
      }
    )
  );

  // Show dashboard command
  context.subscriptions.push(
    vscode.commands.registerCommand("projecttemplate.showDashboard", () => {
      DashboardProvider.createOrShow(context.extensionUri);
    })
  );

  // Check naming command
  context.subscriptions.push(
    vscode.commands.registerCommand("projecttemplate.checkNaming", async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      const violations = await fileNameEnforcer.checkWorkspace(
        workspaceFolder.uri.fsPath
      );

      if (violations.length === 0) {
        vscode.window.showInformationMessage("✅ No naming violations found!");
      } else {
        const items = violations.map((v) => ({
          label: path.basename(v.file),
          description: v.suggestion,
          detail: v.file,
          violation: v
        }));

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: `Found ${violations.length} naming violations. Select to rename:`,
          canPickMany: false
        });

        if (selected) {
          await handleFileRename(selected.violation);
        }
      }
    })
  );

  // Claude validation commands
  if (claudeValidator) {
    // Validate Claude response from clipboard
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "projecttemplate.validateClaudeFromClipboard",
        async () => {
          try {
            updateStatusBar("Validating...", 0);
            const result = await claudeValidator.validateFromClipboard();
            await claudeValidator.showValidationResult(result);
            updateStatusBar(result.passed ? "✅ Validation Passed" : "❌ Validation Failed", 3000);
          } catch (error) {
            vscode.window.showErrorMessage(`Validation failed: ${error}`);
            updateStatusBar("Validation Error", 2000);
          }
        }
      )
    );

    // Validate Claude response from input
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "projecttemplate.validateClaude",
        async () => {
          try {
            const input = await vscode.window.showInputBox({
              prompt: "Enter Claude response to validate",
              placeHolder: "Paste Claude response here...",
              value: await vscode.env.clipboard.readText()
            });

            if (!input) return;

            updateStatusBar("Validating...", 0);
            const result = await claudeValidator.validateResponse(input);
            await claudeValidator.showValidationResult(result);
            updateStatusBar(result.passed ? "✅ Validation Passed" : "❌ Validation Failed", 3000);
          } catch (error) {
            vscode.window.showErrorMessage(`Validation failed: ${error}`);
            updateStatusBar("Validation Error", 2000);
          }
        }
      )
    );

    // Open Claude configuration
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "projecttemplate.claudeConfig",
        async () => {
          try {
            await claudeValidator.openConfigurationFile();
          } catch (error) {
            vscode.window.showErrorMessage(`Failed to open config: ${error}`);
          }
        }
      )
    );
  }

  // Log enforcement commands
  if (logEnforcer) {
    // Check log compliance
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "projecttemplate.checkLogCompliance",
        async () => {
          try {
            updateStatusBar("Checking logs...", 0);
            const result = await logEnforcer.checkWorkspace();

            if (result.success) {
              vscode.window.showInformationMessage(
                `✅ No logging violations found! Analyzed ${result.stats.filesAnalyzed} files.`
              );
              updateStatusBar("Log Check: Clean", 3000);
            } else {
              const action = await vscode.window.showWarningMessage(
                `❌ Found ${result.violations.length} logging violations in ${result.stats.filesAnalyzed} files`,
                "Fix All",
                "Show Problems"
              );

              if (action === "Fix All") {
                vscode.commands.executeCommand("projecttemplate.fixAllLogViolations");
              } else if (action === "Show Problems") {
                vscode.commands.executeCommand("workbench.actions.view.problems");
              }

              updateStatusBar(`Log: ${result.violations.length} issues`, 0);
            }
          } catch (error) {
            vscode.window.showErrorMessage(`Log compliance check failed: ${error}`);
            updateStatusBar("Log Check: Error", 2000);
          }
        }
      )
    );

    // Fix all log violations
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "projecttemplate.fixAllLogViolations",
        async () => {
          try {
            updateStatusBar("Fixing logs...", 0);
            await logEnforcer.fixWorkspace();

            // Refresh diagnostics for open documents
            vscode.workspace.textDocuments.forEach((doc) => {
              if (doc.languageId && ['javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'python'].includes(doc.languageId)) {
                logEnforcer.checkDocument(doc);
              }
            });

            updateStatusBar("Log: Fixed", 3000);
          } catch (error) {
            vscode.window.showErrorMessage(`Auto-fix failed: ${error}`);
            updateStatusBar("Log Fix: Error", 2000);
          }
        }
      )
    );

    // Fix single violation
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "projecttemplate.fixLogViolation",
        async (uri: vscode.Uri, _range: vscode.Range) => {
          try {
            const document = await vscode.workspace.openTextDocument(uri);
            await logEnforcer.fixDocument(document);

            // Refresh diagnostics
            await logEnforcer.checkDocument(document);

            vscode.window.showInformationMessage("✅ Logging violation fixed");
          } catch (error) {
            vscode.window.showErrorMessage(`Fix failed: ${error}`);
          }
        }
      )
    );

    // Disable enforcement for line
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "projecttemplate.disableLogEnforcementLine",
        async (uri: vscode.Uri, range: vscode.Range) => {
          try {
            const document = await vscode.workspace.openTextDocument(uri);
            const edit = new vscode.WorkspaceEdit();

            const line = range.start.line;
            const lineText = document.lineAt(line);
            const indent = lineText.text.match(/^\\s*/)?.[0] || '';

            // Determine comment style based on language
            const comment = document.languageId === 'python' ?
            '# log-enforcer-disable-next-line' :
            '// log-enforcer-disable-next-line';

            const disableComment = `${indent}${comment}\\n`;
            edit.insert(uri, new vscode.Position(line, 0), disableComment);

            await vscode.workspace.applyEdit(edit);

            // Refresh diagnostics
            setTimeout(() => logEnforcer.checkDocument(document), 100);

            vscode.window.showInformationMessage("✅ Log enforcement disabled for this line");
          } catch (error) {
            vscode.window.showErrorMessage(`Failed to disable enforcement: ${error}`);
          }
        }
      )
    );

    // Show log enforcement status
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "projecttemplate.showLogEnforcementStatus",
        async () => {
          try {
            const result = await logEnforcer.checkWorkspace();

            const items = [
            {
              label: "📊 Statistics",
              description: `${result.stats.filesAnalyzed} files analyzed, ${result.violations.length} violations`,
              detail: `Analysis completed in ${result.stats.timeElapsed}ms`
            },
            {
              label: "🔧 Fix All Violations",
              description: "Automatically fix all logging violations",
              action: "fix"
            },
            {
              label: "📋 Show Problems Panel",
              description: "View detailed violations in Problems panel",
              action: "problems"
            },
            {
              label: "⚙️ Configure Log Enforcement",
              description: "Open log enforcement settings",
              action: "settings"
            }];


            const selected = await vscode.window.showQuickPick(items, {
              placeHolder: "Log Enforcement Status"
            });

            if (selected?.action === "fix") {
              vscode.commands.executeCommand("projecttemplate.fixAllLogViolations");
            } else if (selected?.action === "problems") {
              vscode.commands.executeCommand("workbench.actions.view.problems");
            } else if (selected?.action === "settings") {
              vscode.commands.executeCommand("workbench.action.openSettings", "projecttemplate.logEnforcement");
            }
          } catch (error) {
            vscode.window.showErrorMessage(`Failed to get status: ${error}`);
          }
        }
      )
    );
  }
}

function setupAutoContext(context: vscode.ExtensionContext) {
  // Watch for active editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (!editor) return;

      // Check if it's a supported language
      const supportedLanguages = [
      "javascript",
      "typescript",
      "javascriptreact",
      "typescriptreact"];

      if (!supportedLanguages.includes(editor.document.languageId)) return;

      // Check if AI extensions are active
      if (isAIExtensionActive()) {
        // Build and inject context automatically
        const contextData = await contextManager.buildContext(editor.document);
        await injectContextToAI(contextData);
        updateStatusBar("Context Auto-loaded", 1500);
      }
    })
  );

  // Track file changes for context relevance
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      contextManager.trackFileChange(document.fileName);
    })
  );
}

function setupNamingEnforcement(context: vscode.ExtensionContext) {
  // Watch for file creation
  const fileWatcher = vscode.workspace.createFileSystemWatcher("**/*");

  fileWatcher.onDidCreate(async (uri) => {
    const violation = fileNameEnforcer.checkFile(uri.fsPath);

    if (violation) {
      const action = await vscode.window.showWarningMessage(
        `File "${path.basename(uri.fsPath)}" violates naming rules`,
        "Rename",
        "Ignore",
        "Disable Warnings"
      );

      switch (action) {
        case "Rename":
          await handleFileRename(violation);
          break;
        case "Disable Warnings":
          vscode.workspace.
          getConfiguration("projecttemplate").
          update("enableNamingEnforcement", false, true);
          break;
      }
    }
  });

  context.subscriptions.push(fileWatcher);
}

function setupLogEnforcement(context: vscode.ExtensionContext) {
  // Register code action provider
  const codeActionProvider = new LogEnforcementCodeActionProvider(logEnforcer);
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [
      { language: 'javascript' },
      { language: 'typescript' },
      { language: 'javascriptreact' },
      { language: 'typescriptreact' },
      { language: 'python' }],

      codeActionProvider
    )
  );

  // Watch for document changes
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      logEnforcer.checkDocument(document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      logEnforcer.checkDocument(document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      // Debounce checking on typing
      setTimeout(() => {
        logEnforcer.checkDocument(event.document);
      }, 1000);
    })
  );

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('projecttemplate.enableLogEnforcement') ||
      event.affectsConfiguration('projecttemplate.logEnforcementExcludeTests')) {
        logEnforcer.updateConfiguration();

        // Re-check all open documents
        vscode.workspace.textDocuments.forEach((doc) => {
          logEnforcer.checkDocument(doc);
        });
      }
    })
  );

  // Check all currently open documents
  vscode.workspace.textDocuments.forEach((document) => {
    logEnforcer.checkDocument(document);
  });
}

async function handleFileRename(violation: FileViolation) {
  const oldUri = vscode.Uri.file(violation.file);
  const newUri = vscode.Uri.file(violation.suggestion);

  try {
    await vscode.workspace.fs.rename(oldUri, newUri);
    vscode.window.showInformationMessage(
      `Renamed to: ${path.basename(violation.suggestion)}`
    );

    // Open the renamed file
    const doc = await vscode.workspace.openTextDocument(newUri);
    vscode.window.showTextDocument(doc);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to rename: ${error}`);
  }
}

function isAIExtensionActive(): boolean {
  // Check for common AI extensions
  const aiExtensions = [
  "GitHub.copilot",
  "GitHub.copilot-chat",
  "anysphere.cursor-ai",
  "continue.continue",
  "tabnine.tabnine-vscode"];


  return aiExtensions.some(
    (id) => vscode.extensions.getExtension(id)?.isActive
  );
}

async function injectContextToAI(context: string) {
  // Try different methods to inject context

  // Method 1: Update workspace settings with context
  const contextFile = path.join(
    vscode.workspace.workspaceFolders![0].uri.fsPath,
    ".vscode",
    "ai-context.md"
  );

  try {
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(contextFile),
      Buffer.from(context, "utf8")
    );
  } catch (error) {
    logger.error("Failed to write context file:", error);
  }

  // Method 2: Try to inject via extension API if available
  const cursorExt = vscode.extensions.getExtension("anysphere.cursor-ai");
  if (cursorExt && cursorExt.exports && cursorExt.exports.setContext) {
    cursorExt.exports.setContext(context);
  }
}

function showContextPreview(context: string) {
  const panel = vscode.window.createWebviewPanel(
    "contextPreview",
    "AI Context Preview",
    vscode.ViewColumn.Two,
    {}
  );

  panel.webview.html = getContextPreviewHtml(context);
}

function getContextPreviewHtml(context: string): string {
  // Escape HTML
  const escapedContext = context.
  replace(/&/g, "&amp;").
  replace(/</g, "&lt;").
  replace(/>/g, "&gt;").
  replace(/"/g, "&quot;").
  replace(/'/g, "&#039;");

  return `
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
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .stats {
            background: #e8f4f8;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .copy-button {
            background: #007acc;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 10px;
        }
        .copy-button:hover {
            background: #005a9e;
        }
    </style>
</head>
<body>
    <h2>AI Context Preview</h2>
    <div class="stats">
        <strong>Token Count:</strong> ~${Math.ceil(context.length / 4)} tokens<br>
        <strong>Character Count:</strong> ${context.length} characters
    </div>
    <button class="copy-button" onclick="copyToClipboard()">Copy to Clipboard</button>
    <pre id="context">${escapedContext}</pre>
    
    <script>
        function copyToClipboard() {
            const text = document.getElementById('context').textContent;
            navigator.clipboard.writeText(text).then(() => {
                const button = document.querySelector('.copy-button');
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy to Clipboard';
                }, 2000);
            });
        }
    </script>
</body>
</html>
    `;
}

function updateStatusBar(text: string, duration = 0) {
  const originalText = statusBarItem.text;
  statusBarItem.text = `$(check) ${text}`;

  if (duration > 0) {
    setTimeout(() => {
      statusBarItem.text = originalText;
    }, duration);
  }
}

function showWelcomeMessage() {
  vscode.window.
  showInformationMessage(
    "Welcome to ProjectTemplate Assistant! This extension helps with AI-assisted development.",
    "Open Dashboard",
    "View Settings"
  ).
  then((selection) => {
    if (selection === "Open Dashboard") {
      vscode.commands.executeCommand("projecttemplate.showDashboard");
    } else if (selection === "View Settings") {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "projecttemplate"
      );
    }
  });
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }

  if (logEnforcer) {
    logEnforcer.dispose();
  }
}