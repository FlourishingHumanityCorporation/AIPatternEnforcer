#!/usr/bin/env node

/**
 * Claude Code Hook: Meta-Project Guardian
 *
 * Prevents AI from modifying the template system infrastructure itself.
 * This is critical because AIPatternEnforcer IS the meta-project that creates
 * templates - it must protect its own generator and enforcement logic.
 *
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const path = require("path");
const fs = require("fs");

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      const lines = envContent.split("\n");

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          const [key, ...valueParts] = trimmedLine.split("=");
          if (key && valueParts.length > 0) {
            const value = valueParts.join("=").trim();
            process.env[key.trim()] = value;
          }
        }
      }
    }
  } catch (error) {
    // Fail silently if .env file cannot be read
  }
}

// Load environment variables
loadEnvFile();

// Critical infrastructure paths that must not be modified by AI
const PROTECTED_PATHS = [
  "tools/generators/",
  "tools/hooks/",
  "scripts/onboarding/",
  "scripts/setup/",
  ".claude/settings.json",
  "CLAUDE.md",
  "GOAL.md",
];

function isProtectedPath(filePath) {
  const normalizedPath = filePath.replace(/\\/g, "/").replace(/^\//, "");

  return PROTECTED_PATHS.some((protectedPath) =>
    normalizedPath.includes(protectedPath),
  );
}

// Read from stdin
let inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += chunk;
});

process.stdin.on("end", () => {
  try {
    const input = JSON.parse(inputData);
    const toolInput = input.tool_input || {};
    const filePath = toolInput.file_path || toolInput.filePath || "";

    // Allow operations without file paths
    if (!filePath) {
      process.exit(0);
    }

    // Allow hook development if environment variable is set
    if (
      filePath.includes("tools/hooks/") &&
      process.env.HOOK_DEVELOPMENT === "true"
    ) {
      process.exit(0);
    }

    // Allow ALL protected file modifications in development mode
    if (process.env.HOOK_DEVELOPMENT === "true") {
      process.exit(0);
    }

    // Check if this is a protected path
    if (isProtectedPath(filePath)) {
      console.error(
        `🛡️ Meta-Project Protection Active\n\n` +
          `❌ Cannot modify: ${path.basename(filePath)}\n` +
          `📁 Protected infrastructure file\n\n` +
          `💡 AIPatternEnforcer is the meta-project that creates templates.\n` +
          `   Its infrastructure must remain stable to function correctly.\n`,
      );
      process.exit(2);
    }

    // Allow the operation
    process.exit(0);
  } catch (error) {
    // Always allow operation if hook fails - fail open
    process.exit(0);
  }
});

// Handle timeout
setTimeout(() => {
  process.exit(0);
}, 1500);

module.exports = {
  PROTECTED_PATHS,
  isProtectedPath,
};
