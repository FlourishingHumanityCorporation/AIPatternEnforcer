#!/usr/bin/env node

/**
 * Simplified Claude Code Hook: Block Root Directory Mess
 *
 * Prevents AI from creating application files in the root directory.
 * Maintains clean project structure for AI apps.
 */

const path = require("path");

// Files that belong in the root directory
const ALLOWED_ROOT_FILES = [
  // Package management
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",

  // Configuration files
  ".env",
  ".env.example",
  ".env.local",
  ".env.development",
  ".env.production",
  ".eslintrc.json",
  ".eslintrc.js",
  ".prettierrc",
  ".gitignore",
  ".gitattributes",
  "tsconfig.json",
  "jsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "postcss.config.js",
  "jest.config.js",
  "jest.setup.js",
  "vitest.config.ts",

  // Documentation
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "CONTRIBUTING.md",

  // Build files (should be gitignored)
  "next-env.d.ts",
];

// Directories that are allowed in root
const ALLOWED_ROOT_DIRS = [
  "app",
  "components",
  "lib",
  "prisma",
  "public",
  "docs",
  "scripts",
  "types",
  "__mocks__",
  ".next",
  "node_modules",
  ".git",
  ".claude",
];

async function main() {
  try {
    const input = await readStdin();
    let parsedInput;

    try {
      parsedInput = input ? JSON.parse(input) : {};
    } catch (e) {
      process.exit(0);
    }

    if (process.env.HOOKS_DISABLED === "true") {
      process.exit(0);
    }

    const filePath =
      parsedInput.tool_input?.file_path ||
      parsedInput.file_path ||
      parsedInput.path;

    if (!filePath) {
      process.exit(0);
    }

    // Check if file is being created in root directory
    const relativePath = path.relative(process.cwd(), filePath);
    const pathParts = relativePath.split(path.sep);

    // If file is directly in root (no subdirectory)
    if (pathParts.length === 1) {
      const fileName = pathParts[0];

      // Check if it's an allowed root file
      if (!ALLOWED_ROOT_FILES.includes(fileName)) {
        const errorMessage = [
          "❌ Root Directory Violation Detected",
          "",
          `File: ${fileName}`,
          "Location: Project root directory",
          "",
          "💡 Application files should be organized in subdirectories:",
          "✅ Components → components/",
          "✅ Pages → app/",
          "✅ Utilities → lib/",
          "✅ Types → types/",
          "✅ Tests → __tests__/ or colocated",
          "",
          "This maintains a clean, scalable project structure.",
        ].join("\n");

        process.stderr.write(errorMessage + "\n");
        process.exit(1);
      }
    }

    // Check if creating a new directory in root
    if (pathParts.length > 1) {
      const rootDir = pathParts[0];

      // If it's a new directory not in the allowed list
      if (!ALLOWED_ROOT_DIRS.includes(rootDir)) {
        const errorMessage = [
          "❌ Unexpected Root Directory Creation",
          "",
          `Directory: ${rootDir}/`,
          "",
          "💡 Consider using existing directories:",
          "✅ app/ - for Next.js pages and layouts",
          "✅ components/ - for React components",
          "✅ lib/ - for utilities and shared code",
          "✅ types/ - for TypeScript type definitions",
          "",
          "Or ensure this is intentional for your project structure.",
        ].join("\n");

        process.stderr.write(errorMessage + "\n");
        // Warning only for new directories - don't block
        process.exit(0);
      }
    }

    process.exit(0);
  } catch (error) {
    process.exit(0);
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";

    process.stdin.on("data", (chunk) => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      resolve(data);
    });

    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
}

main();
