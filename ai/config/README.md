# AI Configuration Directory

This directory contains configuration files for various AI tools used in development.

## Table of Contents

1. [Structure](#structure)
2. [Configuration Files](#configuration-files)
  3. [`.claude`](#claude)
  4. [`.cursorrules`](#cursorrules)
  5. [`.copilot`](#copilot)
  6. [`models.json`](#modelsjson)
  7. [`context-rules.json`](#context-rulesjson)
8. [Usage](#usage)
9. [Optimal Practices](#optimal-practices)

## Structure

```text
ai/config/
├── README.md           # This file
├── .claude            # Claude-specific configuration (moved from ai/.claude)
├── .cursorrules       # Cursor IDE rules (moved from ai/.cursorrules)
├── .copilot          # GitHub Copilot configuration
├── models.json       # Local model preferences and settings
└── context-rules.json # Context inclusion/exclusion rules
```

## Configuration Files

### `.claude`

Configuration loaded by Claude Desktop and API integrations. Contains:

- Project context and technology stack
- Coding standards and conventions
- Security and performance requirements
- Local model integration settings

### `.cursorrules`

Rules for Cursor IDE's AI features:

- Code style enforcement
- Import conventions
- Security patterns
- Anti-patterns to avoid

### `.copilot`

GitHub Copilot configuration:

- Completion preferences
- Context awareness settings
- Language-specific rules

### `models.json`

Local model selection and configuration:

```json
{
  "default": "codellama:13b",
  "tasks": {
    "code_completion": "codellama:13b",
    "documentation": "llama3:8b",
    "refactoring": "mixtral:8x7b",
    "quick_fix": "mistral:7b"
  },
  "endpoints": {
    "ollama": "http://localhost:11434",
    "localai": "http://localhost:8080"
  }
}
```

### `context-rules.json`

Rules for context optimization:

```json
{
  "include": {
    "patterns": ["src/**/*.ts", "src/**/*.tsx"],
    "recent_days": 7,
    "staged_files": true
  },
  "exclude": {
    "patterns": ["**/*.test.*", "**/*.spec.*", "**/node_modules/**"],
    "large_files_kb": 100
  },
  "limits": {
    "max_tokens": 32000,
    "max_files": 50
  }
}
```

## Usage

These configuration files are automatically loaded by:

- AI development tools (Cursor, Claude, Copilot)
- Context optimization scripts
- Local model integrations
- Generator tools

To customize for your project:

1. Copy relevant configs from this directory
2. Modify according to your project needs
3. Commit to your repository

## Optimal Practices

1. **Keep configs in sync**: When updating one AI tool config, review others
2. **Document changes**: Add comments explaining non-obvious settings
3. **Version control**: Track changes to understand evolution
4. **Share with team**: Ensure consistent AI assistance across developers
