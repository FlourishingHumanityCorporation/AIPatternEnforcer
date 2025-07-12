# ProjectTemplate Assistant - Installation Guide

## Table of Contents

1. [Quick Install](#quick-install)
  2. [Method 1: VS Code Command Palette (Recommended)](#method-1-vs-code-command-palette-recommended)
  3. [Method 2: Command Line](#method-2-command-line)
4. [Verification](#verification)
5. [Configuration](#configuration)
6. [Usage](#usage)
  7. [Loading AI Context](#loading-ai-context)
  8. [File Naming Enforcement](#file-naming-enforcement)
  9. [Project Dashboard](#project-dashboard)
10. [Troubleshooting](#troubleshooting)
  11. [Extension Not Loading](#extension-not-loading)
  12. [Context Not Loading](#context-not-loading)
  13. [Naming Enforcement Not Working](#naming-enforcement-not-working)
14. [Support](#support)
15. [Uninstallation](#uninstallation)

## Quick Install

### Method 1: VS Code Command Palette (Recommended)
1. Download the `projecttemplate-assistant-0.1.0.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
4. Type "Extensions: Install from VSIX..."
5. Select the downloaded VSIX file
6. Restart VS Code when prompted

### Method 2: Command Line
```bash
code --install-extension projecttemplate-assistant-0.1.0.vsix
```

## Verification

After installation, verify the extension works:

1. Open a JavaScript/TypeScript project
2. Press `Ctrl+Shift+P` / `Cmd+Shift+P`
3. Type "ProjectTemplate" - you should see these commands:
   - **ProjectTemplate: Load AI Context** (`Ctrl+Shift+C` / `Cmd+Shift+C`)
   - **ProjectTemplate: Refresh AI Context** (`Ctrl+Shift+R` / `Cmd+Shift+R`)
   - **ProjectTemplate: Show Dashboard**
   - **ProjectTemplate: Check File Naming**

## Configuration

The extension works out of the box, but you can customize it:

1. Go to VS Code Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "ProjectTemplate"
3. Configure:
   - **Enable Auto Context**: Automatically load context when opening files
   - **Context Sources**: Files to include in AI context (default: `.cursorrules`, `ai/config/.cursorrules`, `CLAUDE.md`)
   - **Max Context Tokens**: Maximum tokens to include (default: 4000)
   - **Recent Files Count**: Number of recent files to include (default: 5)
   - **Enable Naming Enforcement**: Show warnings for naming violations

## Usage

### Loading AI Context
- Press `Cmd+Shift+C` (Mac) or `Ctrl+Shift+C` (Windows/Linux)
- Or use Command Palette: "ProjectTemplate: Load AI Context"
- The extension will analyze your project and generate optimized context for AI tools

### File Naming Enforcement
- The extension automatically checks file names as you work
- Red squiggly lines appear under files that violate naming conventions
- Hover for suggestions on how to fix violations

### Project Dashboard
- Use Command Palette: "ProjectTemplate: Show Dashboard"
- View project structure, recent files, and context sources
- Monitor enforcement status

## Troubleshooting

### Extension Not Loading
- Ensure VS Code version is 1.74.0 or higher
- Check that you have TypeScript/JavaScript files in your workspace
- Restart VS Code after installation

### Context Not Loading
- Verify CLAUDE.md exists in your project root
- Check that context source files are accessible
- Ensure file permissions allow reading project files

### Naming Enforcement Not Working
- Verify `projecttemplate.enableNamingEnforcement` is enabled in settings
- Check that you're working with supported file types (.js, .ts, .jsx, .tsx)
- Ensure git hooks are properly installed (`npm run setup:hooks`)

## Support

For issues or questions:
1. Check project documentation in `CLAUDE.md`
2. Review enforcement rules in `tools/enforcement/`
3. File issues at the project repository

## Uninstallation

1. Open VS Code Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Find "ProjectTemplate Assistant"
3. Click the gear icon and select "Uninstall"