# VS Code Extension Manual Test Checklist

## Table of Contents

1. [Pre-Test Setup](#pre-test-setup)
2. [Test 1: Extension Activation](#test-1-extension-activation)
3. [Test 2: Command Palette Integration  ](#test-2-command-palette-integration-)
4. [Test 3: Load AI Context Command](#test-3-load-ai-context-command)
5. [Test 4: Keyboard Shortcuts](#test-4-keyboard-shortcuts)
6. [Test 5: File Naming Enforcement](#test-5-file-naming-enforcement)
7. [Test 6: Check Naming Command](#test-6-check-naming-command)
8. [Test 7: Dashboard Command](#test-7-dashboard-command)
9. [Test 8: Status Bar Integration](#test-8-status-bar-integration)
10. [Test 9: Auto Context (if enabled)](#test-9-auto-context-if-enabled)
11. [Test 10: Configuration Settings](#test-10-configuration-settings)
12. [Test Results Summary](#test-results-summary)
  13. [Working Features ✅](#working-features-)
  14. [Issues Found ❌](#issues-found-)
15. [Critical Test: End-to-End AI Workflow](#critical-test-end-to-end-ai-workflow)
16. [Performance Test](#performance-test)
17. [Error Handling Test](#error-handling-test)

## Pre-Test Setup
- [ ] VS Code installed and running
- [ ] Extension installed: `code --install-extension dist/projecttemplate-assistant-0.1.0.vsix`
- [ ] ProjectTemplate workspace open in VS Code
- [ ] Some JavaScript/TypeScript files available for testing

## Test 1: Extension Activation
- [ ] Open a `.js` or `.ts` file in VS Code
- [ ] Look for "$(rocket) PT: Active" in the status bar (bottom right)
- [ ] Expected: Status bar shows ProjectTemplate is active

## Test 2: Command Palette Integration  
- [ ] Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- [ ] Type "ProjectTemplate"
- [ ] Expected: See these commands:
  - [ ] **ProjectTemplate: Load AI Context**
  - [ ] **ProjectTemplate: Refresh AI Context**
  - [ ] **ProjectTemplate: Show Dashboard**
  - [ ] **ProjectTemplate: Check File Naming**

## Test 3: Load AI Context Command
- [ ] Open a JavaScript/TypeScript file
- [ ] Run command: "ProjectTemplate: Load AI Context"
- [ ] Expected results:
  - [ ] Notification appears: "AI context loaded (X tokens). Copied to clipboard!"
  - [ ] Click "View Context" in notification
  - [ ] Context preview window opens in VS Code
  - [ ] Context includes project rules from CLAUDE.md
  - [ ] Context is copied to clipboard (test with Cmd+V)

## Test 4: Keyboard Shortcuts
- [ ] Open a JavaScript/TypeScript file
- [ ] Press `Cmd+Shift+C` (Mac) or `Ctrl+Shift+C` (Windows/Linux)
- [ ] Expected: Same result as "Load AI Context" command
- [ ] Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)  
- [ ] Expected: Context refreshes and loads

## Test 5: File Naming Enforcement
- [ ] Create a new file with problematic name: `test_improved.js`
- [ ] Expected: Warning message appears about naming violation
- [ ] Options should include: "Rename", "Ignore", "Disable Warnings"
- [ ] Click "Rename" 
- [ ] Expected: File gets renamed to proper name (e.g., `test.js`)

## Test 6: Check Naming Command
- [ ] Run command: "ProjectTemplate: Check File Naming"
- [ ] If no violations: Expected message "✅ No naming violations found!"
- [ ] If violations exist: Quick pick list shows problematic files
- [ ] Select a file from the list
- [ ] Expected: File rename option appears

## Test 7: Dashboard Command
- [ ] Run command: "ProjectTemplate: Show Dashboard"
- [ ] Expected: Dashboard webview panel opens
- [ ] Dashboard should show:
  - [ ] Project overview
  - [ ] Recent files
  - [ ] Context sources
  - [ ] Enforcement status

## Test 8: Status Bar Integration
- [ ] Click on the "$(rocket) PT: Active" status bar item
- [ ] Expected: Dashboard opens (same as dashboard command)
- [ ] After running context command, status should briefly show "Context Loaded"

## Test 9: Auto Context (if enabled)
- [ ] Check VS Code settings for "ProjectTemplate › Enable Auto Context"
- [ ] If enabled, switch between different TypeScript/JavaScript files
- [ ] Expected: Context auto-loads when switching files
- [ ] Status bar briefly shows "Context Auto-loaded"

## Test 10: Configuration Settings
- [ ] Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
- [ ] Search for "ProjectTemplate"
- [ ] Expected settings visible:
  - [ ] Enable Auto Context
  - [ ] Context Sources
  - [ ] Max Context Tokens
  - [ ] Recent Files Count
  - [ ] Enable Naming Enforcement

## Test Results Summary

### Working Features ✅
- [ ] Extension activates properly
- [ ] Commands appear in Command Palette
- [ ] Load AI Context works
- [ ] Keyboard shortcuts work
- [ ] File naming enforcement works
- [ ] Check naming command works
- [ ] Dashboard opens
- [ ] Status bar integration works
- [ ] Configuration settings accessible

### Issues Found ❌
- [ ] List any commands that don't work
- [ ] List any error messages encountered
- [ ] List any features that behave unexpectedly

## Critical Test: End-to-End AI Workflow
1. [ ] Open a TypeScript file with some code
2. [ ] Press `Cmd+Shift+C` to load context
3. [ ] Paste context into Claude Code or Claude web interface
4. [ ] Ask Claude to explain the code using the context
5. [ ] Expected: Claude should have good understanding of project structure

## Performance Test
- [ ] Test context loading on large project (>100 files)
- [ ] Expected: Context loads within 5 seconds
- [ ] Status bar updates appropriately

## Error Handling Test
- [ ] Try loading context with no workspace open
- [ ] Try file naming check with no workspace open
- [ ] Expected: Appropriate error messages, no crashes

---

**Test Completion**: ___/10 major features working

**Overall Status**: ✅ Ready for pilot testing / ❌ Needs fixes before pilot testing

**Notes**: [Add any specific observations or recommendations]