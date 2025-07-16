#!/usr/bin/env node

/**
 * Shortcut Protector
 *
 * Prevents AI tools from overriding important shortcuts
 * Protects developer productivity by maintaining familiar keybindings
 */

const { HookRunner } = require("../lib");
const path = require("path");

// Critical shortcuts that should never be overridden
const PROTECTED_SHORTCUTS = {
  // VSCode critical shortcuts
  "cmd+s": "Save file",
  "ctrl+s": "Save file",
  "cmd+z": "Undo",
  "ctrl+z": "Undo",
  "cmd+shift+z": "Redo",
  "ctrl+shift+z": "Redo",
  "cmd+c": "Copy",
  "ctrl+c": "Copy",
  "cmd+v": "Paste",
  "ctrl+v": "Paste",
  "cmd+x": "Cut",
  "ctrl+x": "Cut",
  "cmd+f": "Find",
  "ctrl+f": "Find",
  "cmd+shift+f": "Find in files",
  "ctrl+shift+f": "Find in files",
  "cmd+p": "Quick open",
  "ctrl+p": "Quick open",
  "cmd+shift+p": "Command palette",
  "ctrl+shift+p": "Command palette",
  f12: "Go to definition",
  "cmd+click": "Go to definition",
  "ctrl+click": "Go to definition",
};

function shortcutProtector(hookData, runner) {
  try {
    const startTime = Date.now();

    // Check if modifying keybindings or settings files
    const filePath = hookData.file_path || hookData.tool_input?.file_path || "";
    const fileName = path.basename(filePath).toLowerCase();

    const isKeybindingsFile =
      fileName.includes("keybindings") ||
      fileName.includes("shortcuts") ||
      (fileName === "settings.json" && filePath.includes(".vscode"));

    if (!isKeybindingsFile) {
      return runner.allow();
    }

    // Check content for shortcut modifications
    const content = (
      hookData.content ||
      hookData.new_string ||
      ""
    ).toLowerCase();

    // Look for protected shortcuts in content
    const foundProtected = [];
    Object.keys(PROTECTED_SHORTCUTS).forEach((shortcut) => {
      const shortcutPattern = shortcut
        .replace("+", "\\+")
        .replace("cmd", "(cmd|command)");
      const regex = new RegExp(shortcutPattern, "i");

      if (regex.test(content)) {
        foundProtected.push({
          shortcut,
          purpose: PROTECTED_SHORTCUTS[shortcut],
        });
      }
    });

    if (foundProtected.length > 0) {
      return runner.block(
        [
          "⌨️ Protected Shortcuts Detected",
          "",
          "❌ Attempting to modify critical keyboard shortcuts:",
          "",
          ...foundProtected.map(
            ({ shortcut, purpose }) => `  • ${shortcut} → ${purpose}`,
          ),
          "",
          "💡 These shortcuts are essential for productivity.",
          "",
          "✅ Safe alternatives:",
          "  • Use different key combinations for AI tools",
          "  • Add shortcuts that don't conflict with system defaults",
          "  • Use chord shortcuts (e.g., cmd+k cmd+i)",
          "",
          "📋 Example safe AI shortcuts:",
          "  • cmd+k cmd+a → AI assist",
          "  • cmd+k cmd+g → Generate code",
          "  • alt+shift+a → AI context",
        ].join("\n"),
      );
    }

    // Warn about potential conflicts
    if (content.includes("keybinding") || content.includes("shortcut")) {
      console.warn(
        [
          "",
          "⚠️  Modifying keyboard shortcuts",
          "💡 Please ensure new shortcuts don't conflict with:",
          "   • System shortcuts (cmd+c, cmd+v, etc.)",
          "   • IDE defaults (F12, cmd+p, etc.)",
          "   • Extension shortcuts",
          "",
        ].join("\n"),
      );
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Shortcut check took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`Shortcut protection failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("shortcut-protector", shortcutProtector, {
  timeout: 50,
  priority: "high",
  family: "ide",
});
