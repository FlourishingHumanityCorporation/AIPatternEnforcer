# ProjectTemplate Assistant VS Code Extension

A VS Code extension that enhances AI-assisted development by automatically loading context, enforcing naming
conventions, and streamlining workflows.

## Table of Contents

1. [Features](#features)
  2. [🤖 Smart Context Loading](#-smart-context-loading)
  3. [📝 File Naming Enforcement](#-file-naming-enforcement)
  4. [📊 Project Dashboard](#-project-dashboard)
  5. [⚡ Keyboard Shortcuts](#-keyboard-shortcuts)
6. [Installation](#installation)
7. [Configuration](#configuration)
8. [Commands](#commands)
9. [How It Works](#how-it-works)
  10. [Context Building](#context-building)
  11. [Naming Enforcement](#naming-enforcement)
12. [Development](#development)
13. [Troubleshooting](#troubleshooting)
  14. [Context not loading automatically](#context-not-loading-automatically)
  15. [Naming enforcement not working](#naming-enforcement-not-working)
16. [Contributing](#contributing)
17. [License](#license)

## Features

### 🤖 Smart Context Loading

- Automatically loads project rules and context when opening files
- Includes relevant files, recent edits, and architecture documentation
- Optimizes context for AI token limits
- Integrates with Cursor, GitHub Copilot, and other AI tools

### 📝 File Naming Enforcement

- Real-time detection of files that violate naming rules
- Suggests better names and offers one-click renaming
- Prevents `_improved`, `_v2`, `_final` anti-patterns
- Configurable enforcement levels

### 📊 Project Dashboard

- Visual overview of extension status
- Quick access to common commands
- Configuration management
- Usage statistics

### ⚡ Keyboard Shortcuts

- `Cmd+Shift+C` (Mac) / `Ctrl+Shift+C` (Windows/Linux): Load AI context
- `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows/Linux): Refresh context

## Installation

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "ProjectTemplate Assistant"
4. Click Install

Or install from VSIX:

```bash
code --install-extension projecttemplate-assistant-0.1.0.vsix
```

## Configuration

Access settings through VS Code preferences or the dashboard:

```json
{
  "projecttemplate.enableAutoContext": true,
  "projecttemplate.contextSources": [
    ".cursorrules",
    "ai/config/.cursorrules",
    "CLAUDE.md"
  ],
  "projecttemplate.maxContextTokens": 4000,
  "projecttemplate.recentFilesCount": 5,
  "projecttemplate.enableNamingEnforcement": true
}
```

## Commands

- **ProjectTemplate: Load AI Context** - Build and copy context to clipboard
- **ProjectTemplate: Refresh Context** - Clear cache and reload context
- **ProjectTemplate: Show Dashboard** - Open the visual dashboard
- **ProjectTemplate: Check File Naming** - Scan workspace for naming violations

## How It Works

### Context Building

1. Loads project-specific rules from configured sources
2. Analyzes current file for imports, exports, and structure
3. Includes recently edited files for continuity
4. Finds related files (tests, components, styles)
5. Adds relevant architecture documentation
6. Optimizes for token limits

### Naming Enforcement

1. Monitors file creation and renames
2. Checks against configured patterns
3. Suggests improvements based on rules
4. Offers one-click fixes

## Development

```bash
# Clone the extension
cd extensions/projecttemplate-assistant

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run tests
npm test
```

## Troubleshooting

### Context not loading automatically

- Check that AI extensions are active
- Verify `enableAutoContext` is true in settings
- Ensure context source files exist

### Naming enforcement not working

- Verify `enableNamingEnforcement` is true
- Check that files aren't in ignored directories
- Review patterns in enforcement rules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT
