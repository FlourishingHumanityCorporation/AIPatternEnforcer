#!/usr/bin/env node

/**
 * Tests for folder-level hook control functionality
 */

const HookEnvUtils = require("../lib/hook-env-utils");

describe("Folder-Level Hook Control", () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear all hook-related environment variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("HOOK_")) {
        delete process.env[key];
      }
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Global Controls", () => {
    test("HOOK_DEVELOPMENT=true bypasses all hooks", () => {
      process.env.HOOK_DEVELOPMENT = "true";

      expect(HookEnvUtils.shouldBypassHooks()).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("ai-patterns")).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("security")).toBe(true);
    });

    test("HOOK_TESTING=true bypasses all hooks", () => {
      process.env.HOOKS_TESTING_MODE = "true";

      expect(HookEnvUtils.shouldBypassHooks()).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("ai-patterns")).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("security")).toBe(true);
    });

    test("No global bypass when both are false", () => {
      process.env.HOOK_DEVELOPMENT = "false";
      process.env.HOOKS_TESTING_MODE = "false";

      expect(HookEnvUtils.shouldBypassHooks()).toBe(false);
    });
  });

  describe("Folder-Specific Controls", () => {
    beforeEach(() => {
      // Ensure global controls are disabled
      process.env.HOOK_DEVELOPMENT = "false";
      process.env.HOOKS_TESTING_MODE = "false";
    });

    test("HOOK_AI_PATTERNS=false bypasses only ai-patterns folder", () => {
      process.env.HOOK_AI_PATTERNS = "false";

      expect(HookEnvUtils.shouldBypassHookFolder("ai-patterns")).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("security")).toBe(false);
      expect(HookEnvUtils.shouldBypassHookFolder("validation")).toBe(false);
    });

    test("HOOK_SECURITY=false bypasses only security folder", () => {
      process.env.HOOK_SECURITY = "false";

      expect(HookEnvUtils.shouldBypassHookFolder("ai-patterns")).toBe(false);
      expect(HookEnvUtils.shouldBypassHookFolder("security")).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("validation")).toBe(false);
    });

    test("Multiple folder controls work independently", () => {
      process.env.HOOK_AI_PATTERNS = "false";
      process.env.HOOK_SECURITY = "false";
      process.env.HOOK_VALIDATION = "true";

      expect(HookEnvUtils.shouldBypassHookFolder("ai-patterns")).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("security")).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("validation")).toBe(false);
      expect(HookEnvUtils.shouldBypassHookFolder("cleanup")).toBe(false);
    });

    test("Explicit true enables folder even when others disabled", () => {
      process.env.HOOK_AI_PATTERNS = "true";
      process.env.HOOK_SECURITY = "false";

      expect(HookEnvUtils.shouldBypassHookFolder("ai-patterns")).toBe(false);
      expect(HookEnvUtils.shouldBypassHookFolder("security")).toBe(true);
    });

    test("Default behavior (no env vars) enables all folders", () => {
      expect(HookEnvUtils.shouldBypassHookFolder("ai-patterns")).toBe(false);
      expect(HookEnvUtils.shouldBypassHookFolder("security")).toBe(false);
      expect(HookEnvUtils.shouldBypassHookFolder("validation")).toBe(false);
      expect(HookEnvUtils.shouldBypassHookFolder("cleanup")).toBe(false);
    });
  });

  describe("Hook Command Path Extraction", () => {
    test("extracts folder from hook command path", () => {
      const testCases = [
        {
          command: "node tools/hooks/ai-patterns/prevent-improved-files.js",
          expected: "ai-patterns",
        },
        {
          command: "node tools/hooks/security/security-scan.js",
          expected: "security",
        },
        {
          command: "node tools/hooks/project-boundaries/block-root-mess.js",
          expected: "project-boundaries",
        },
        {
          command: "some/other/path.js",
          expected: null,
        },
      ];

      testCases.forEach(({ command, expected }) => {
        expect(HookEnvUtils.extractFolderFromHookCommand(command)).toBe(
          expected,
        );
      });
    });

    test("shouldBypassHook uses folder extraction", () => {
      process.env.HOOK_DEVELOPMENT = "false";
      process.env.HOOKS_TESTING_MODE = "false";
      process.env.HOOK_AI_PATTERNS = "false";

      const aiPatternsCommand =
        "node tools/hooks/ai-patterns/prevent-improved-files.js";
      const securityCommand = "node tools/hooks/security/security-scan.js";

      expect(HookEnvUtils.shouldBypassHook(aiPatternsCommand)).toBe(true);
      expect(HookEnvUtils.shouldBypassHook(securityCommand)).toBe(false);
    });
  });

  describe("Priority and Override Behavior", () => {
    test("Global development mode overrides folder controls", () => {
      process.env.HOOK_DEVELOPMENT = "true";
      process.env.HOOK_AI_PATTERNS = "true"; // Try to enable
      process.env.HOOK_SECURITY = "true"; // Try to enable

      expect(HookEnvUtils.shouldBypassHookFolder("ai-patterns")).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("security")).toBe(true);
    });

    test("Global testing mode overrides folder controls", () => {
      process.env.HOOKS_TESTING_MODE = "true";
      process.env.HOOK_AI_PATTERNS = "true"; // Try to enable
      process.env.HOOK_SECURITY = "true"; // Try to enable

      expect(HookEnvUtils.shouldBypassHookFolder("ai-patterns")).toBe(true);
      expect(HookEnvUtils.shouldBypassHookFolder("security")).toBe(true);
    });
  });

  describe("Environment Status Reporting", () => {
    test("getEnvStatus includes folder status", () => {
      process.env.HOOK_DEVELOPMENT = "false";
      process.env.HOOKS_TESTING_MODE = "false";
      process.env.HOOK_AI_PATTERNS = "false";
      process.env.HOOK_SECURITY = "true";

      const status = HookEnvUtils.getEnvStatus();

      expect(status.folderStatus).toBeDefined();
      expect(status.folderStatus["ai-patterns"].value).toBe("false");
      expect(status.folderStatus["ai-patterns"].bypassed).toBe(true);
      expect(status.folderStatus["security"].value).toBe("true");
      expect(status.folderStatus["security"].bypassed).toBe(false);
    });

    test("getHookBypassReason returns correct reason for folder bypass", () => {
      process.env.HOOK_DEVELOPMENT = "false";
      process.env.HOOKS_TESTING_MODE = "false";
      process.env.HOOK_AI_PATTERNS = "false";

      const command = "node tools/hooks/ai-patterns/prevent-improved-files.js";
      const reason = HookEnvUtils.getHookBypassReason(command);

      expect(reason).toBe("HOOK_AI_PATTERNS=false");
    });
  });

  describe("Folder Environment Variable Mapping", () => {
    test("FOLDER_ENV_MAP contains all expected folders", () => {
      const expectedFolders = [
        "ai-patterns",
        "architecture",
        "cleanup",
        "local-dev",
        "performance",
        "project-boundaries",
        "security",
        "validation",
      ];

      expectedFolders.forEach((folder) => {
        expect(HookEnvUtils.FOLDER_ENV_MAP[folder]).toBeDefined();
        expect(HookEnvUtils.FOLDER_ENV_MAP[folder]).toMatch(/^HOOK_[A-Z_]+$/);
      });
    });

    test("Environment variable names follow consistent pattern", () => {
      const testCases = [
        { folder: "ai-patterns", envVar: "HOOK_AI_PATTERNS" },
        { folder: "project-boundaries", envVar: "HOOK_PROJECT_BOUNDARIES" },
        { folder: "local-dev", envVar: "HOOK_LOCAL_DEV" },
      ];

      testCases.forEach(({ folder, envVar }) => {
        expect(HookEnvUtils.FOLDER_ENV_MAP[folder]).toBe(envVar);
      });
    });
  });
});
