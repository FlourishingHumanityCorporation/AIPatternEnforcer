#!/usr/bin/env node

/**
 * IDE Config Checker
 *
 * Ensures AI tool configurations exist (.cursorrules, .vscode/settings.json)
 * Auto-creates them if missing for optimal AI development experience
 */

const { HookRunner } = require("../lib");
const { fileExists, findProjectRoot } = require("../lib/shared-utils");
const fs = require("fs");
const path = require("path");

const DEFAULT_CURSORRULES = `# Cursor AI Rules

## Project Context
This project uses AIPatternEnforcer - a meta-project for AI-assisted development.
Always reference CLAUDE.md for project-specific rules and patterns.

## Key Rules
1. NEVER create _improved, _enhanced, or _v2 files - always edit originals
2. ALWAYS use generators: npm run g:c ComponentName
3. ALWAYS write tests first
4. NO enterprise features - this is for local development only

## File Structure
- components/ - React components
- lib/ - Shared utilities
- tests/ - Test files
- hooks/ - Custom hooks

## Commands
- npm run g:c ComponentName - Generate component
- npm test - Run tests
- npm run context - Load AI context
`;

const DEFAULT_VSCODE_SETTINGS = {
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/*.tsbuildinfo": true,
    "**/*_improved.*": true,
    "**/*_enhanced.*": true,
    "**/*_v2.*": true,
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
  },
};

function ideConfigChecker(hookData, runner) {
  try {
    const startTime = Date.now();

    // Only run occasionally to avoid performance impact
    const state = require("../lib/state-manager").readState();
    const lastConfigCheck = state.lastConfigCheck || 0;

    // Check every 10 minutes
    if (Date.now() - lastConfigCheck < 10 * 60 * 1000) {
      return runner.allow();
    }

    const projectRoot = findProjectRoot();
    let configsCreated = false;

    // Check and create .cursorrules
    const cursorRulesPath = path.join(projectRoot, ".cursorrules");
    if (!fileExists(cursorRulesPath)) {
      fs.writeFileSync(cursorRulesPath, DEFAULT_CURSORRULES);
      configsCreated = true;

      console.log(
        [
          "",
          "✅ Created .cursorrules for optimal Cursor AI experience",
          "   This file helps Cursor understand your project patterns",
          "",
        ].join("\n"),
      );
    }

    // Check and create .vscode/settings.json
    const vscodeDir = path.join(projectRoot, ".vscode");
    const vscodeSettingsPath = path.join(vscodeDir, "settings.json");

    if (!fileExists(vscodeSettingsPath)) {
      // Create .vscode directory if needed
      if (!fileExists(vscodeDir)) {
        fs.mkdirSync(vscodeDir, { recursive: true });
      }

      fs.writeFileSync(
        vscodeSettingsPath,
        JSON.stringify(DEFAULT_VSCODE_SETTINGS, null, 2),
      );
      configsCreated = true;

      console.log(
        [
          "✅ Created .vscode/settings.json with AI-friendly defaults",
          "   • Auto-formatting enabled",
          "   • ESLint integration configured",
          "   • Junk files hidden from view",
          "",
        ].join("\n"),
      );
    }

    // Check for AI-specific extensions recommendation
    const extensionsPath = path.join(vscodeDir, "extensions.json");
    if (!fileExists(extensionsPath)) {
      const recommendations = {
        recommendations: [
          "dbaeumer.vscode-eslint",
          "esbenp.prettier-vscode",
          "ms-vscode.vscode-typescript-next",
          "bradlc.vscode-tailwindcss",
        ],
      };

      fs.writeFileSync(
        extensionsPath,
        JSON.stringify(recommendations, null, 2),
      );

      if (configsCreated) {
        console.log(
          [
            "✅ Created .vscode/extensions.json with recommended extensions",
            "",
          ].join("\n"),
        );
      }
    }

    // Update last check time
    require("../lib/state-manager").updateState({
      lastConfigCheck: Date.now(),
    });

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`IDE config check took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`IDE config check failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("ide-config-checker", ideConfigChecker, {
  timeout: 100, // Slightly longer for file operations
  priority: "low",
  family: "ide",
});
