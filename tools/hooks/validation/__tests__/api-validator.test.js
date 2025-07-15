const {
  validateImports,
  validateAPIs,
  validateBuiltInAPIs,
  resolveImportPath,
  apiValidator,
} = require("../api-validator");
const {
  ClaudeCodeMocks,
  PathFixtures,
  ContentFixtures,
  HookExecutor,
} = require("./test-helpers");
const path = require("path");
const fs = require("fs");

jest.mock("fs");

describe("api-validator hook", () => {
  let mockCwd;
  let executor;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCwd = PathFixtures.LOCAL_PROJECT;
    process.cwd = jest.fn(() => mockCwd);
    executor = new HookExecutor("api-validator");

    // Default fs mock behavior
    fs.existsSync.mockReturnValue(false);
    fs.readFileSync.mockReturnValue("");
  });

  describe("resolveImportPath", () => {
    it("recognizes built-in Node.js modules", () => {
      const builtins = ["fs", "path", "crypto", "http", "os", "node:test"];

      builtins.forEach((module) => {
        const result = resolveImportPath(module, "/project/file.js");
        expect(result).toEqual({ exists: true, type: "built-in" });
      });
    });

    it("checks package.json for npm packages", () => {
      const packageJson = {
        dependencies: { react: "^18.0.0" },
        devDependencies: { jest: "^29.0.0" },
      };

      fs.existsSync.mockImplementation((p) => p.endsWith("package.json"));
      fs.readFileSync.mockImplementation((p) => {
        if (p.endsWith("package.json")) {
          return JSON.stringify(packageJson);
        }
        return "";
      });

      // Should find installed packages
      expect(resolveImportPath("react", "/project/file.js")).toEqual({
        exists: true,
        type: "package",
        packageName: "react",
      });
      expect(resolveImportPath("jest", "/project/file.js")).toEqual({
        exists: true,
        type: "package",
        packageName: "jest",
      });

      // Should not find uninstalled packages
      expect(resolveImportPath("express", "/project/file.js")).toEqual({
        exists: false,
        type: "package",
        packageName: "express",
      });
    });

    it("resolves relative imports with extensions", () => {
      fs.existsSync.mockImplementation((p) =>
        p.endsWith("/components/Button.tsx"),
      );

      const result = resolveImportPath(
        "./components/Button",
        "/project/pages/index.tsx",
      );

      expect(result).toEqual({
        exists: true,
        type: "file",
        path: path.resolve("/project/pages", "./components/Button.tsx"),
      });
    });

    it("resolves index files in directories", () => {
      fs.existsSync.mockImplementation((p) => p.endsWith("/utils/index.js"));

      const result = resolveImportPath("./utils", "/project/src/app.js");

      expect(result).toEqual({
        exists: true,
        type: "file",
        path: path.resolve("/project/src/utils", "index.js"),
      });
    });
  });

  describe("validateImports", () => {
    it("detects missing local imports", () => {
      const content = `
import React from 'react';
import { Button } from './components/Button';
import utils from '../utils/helpers';
`;

      // Mock react as installed
      fs.existsSync.mockImplementation((p) => p.endsWith("package.json"));
      fs.readFileSync.mockImplementation((p) => {
        if (p.endsWith("package.json")) {
          return JSON.stringify({ dependencies: { react: "^18.0.0" } });
        }
        return "";
      });

      const issues = validateImports(content, "/project/pages/index.tsx");

      expect(issues).toHaveLength(2);
      expect(issues[0].type).toBe("missing-import");
      expect(issues[0].message).toContain("./components/Button");
      expect(issues[1].message).toContain("../utils/helpers");
    });

    it("detects missing npm packages", () => {
      const content = `
import express from 'express';
import cors from 'cors';
`;

      fs.existsSync.mockReturnValue(false);

      const issues = validateImports(content, "/project/server.js");

      expect(issues).toHaveLength(2);
      expect(issues[0].suggestion).toContain("npm install express");
      expect(issues[1].suggestion).toContain("npm install cors");
    });

    it("handles CommonJS requires", () => {
      const content = `
const fs = require('fs');
const missing = require('./missing-module');
`;

      const issues = validateImports(content, "/project/script.js");

      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain("CommonJS require");
      expect(issues[0].message).toContain("./missing-module");
    });
  });

  describe("validateAPIs", () => {
    it("detects missing API endpoints", () => {
      const content = `
fetch('/api/users');
fetch('/api/products/list');
`;

      const issues = validateAPIs(content, "/project/pages/index.tsx");

      expect(issues).toHaveLength(2);
      expect(issues[0].type).toBe("missing-api");
      expect(issues[0].message).toContain("/api/users");
      expect(issues[1].message).toContain("/api/products/list");
    });

    it("detects axios API calls", () => {
      const content = `
axios.get('/api/data');
axios.post('/api/submit');
`;

      const issues = validateAPIs(content, "/project/components/Form.tsx");

      expect(issues).toHaveLength(2);
      expect(issues[0].message).toContain("Axios API call");
      expect(issues[0].suggestion).toContain("pages/api/data.ts");
    });

    it("validates existing API endpoints", () => {
      fs.existsSync.mockImplementation((p) => p.includes("pages/api/users.ts"));

      const content = `fetch('/api/users');`;
      const issues = validateAPIs(content, "/project/pages/index.tsx");

      expect(issues).toHaveLength(0);
    });
  });

  describe("validateBuiltInAPIs", () => {
    it("detects hallucinated React APIs", () => {
      const content = `
const state = useServerState();
form.autoSave();
`;

      const issues = validateBuiltInAPIs(content);

      expect(issues).toHaveLength(2);
      expect(issues[0].type).toBe("hallucinated-api");
      expect(issues[0].message).toContain("useServerState is not a real");
      expect(issues[1].message).toContain("autoSave is not a standard");
    });

    it("detects console.table usage", () => {
      const content = `console.table(data);`;

      const issues = validateBuiltInAPIs(content);

      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain("should not be used in production");
      expect(issues[0].suggestion).toContain("logger.info()");
    });

    it("detects invalid fetch URLs", () => {
      const content = `
fetch('users');
fetch('data.json');
`;

      const issues = validateBuiltInAPIs(content);

      expect(issues).toHaveLength(2);
      expect(issues[0].message).toContain("Potentially invalid fetch URL");
    });
  });

  describe("hook integration", () => {
    it("allows operations when no issues found", async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue("const x = 1;");

      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Edit",
        tool_input: {
          file_path: "/project/src/utils.js",
          old_string: "x = 1",
          new_string: "x = 2",
        },
      });

      const result = await executor.execute(apiValidator, input);
      expect(result).toBeAllowed();
    });

    it("blocks operations with import issues", async () => {
      const content = `
import { missing } from './not-found';
export const test = missing();
`;

      fs.existsSync.mockImplementation(
        (p) => p.endsWith(".js") || p.endsWith(".ts"),
      );
      fs.readFileSync.mockReturnValue(content);

      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Write",
        tool_input: {
          file_path: "/project/src/component.tsx",
          content: content,
        },
      });

      const result = await executor.execute(apiValidator, input);
      expect(result).toBeBlocked();
      expect(result.message).toContain("API validation issues");
      expect(result.message).toContain("./not-found");
    });

    it("blocks operations with hallucinated APIs", async () => {
      const content = `
import React from 'react';

function Component() {
  const data = useServerState();
  return <div>{data}</div>;
}
`;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(content);

      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Write",
        tool_input: {
          file_path: "/project/components/Test.tsx",
          content: content,
        },
      });

      const result = await executor.execute(apiValidator, input);
      expect(result).toBeBlocked();
      expect(result.message).toContain("useServerState is not a real");
    });

    it("skips non-code files", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Write",
        tool_input: {
          file_path: "/project/README.md",
          content: "Documentation with code examples",
        },
      });

      const result = await executor.execute(apiValidator, input);
      expect(result).toBeAllowed();
    });

    it("handles files without content gracefully", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Edit",
        tool_input: {
          file_path: "/project/empty.js",
        },
      });

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue("");

      const result = await executor.execute(apiValidator, input);
      expect(result).toBeAllowed();
    });
  });

  describe("edge cases", () => {
    it("handles malformed import statements", () => {
      const content = `
import from 'module';
import { } from './empty';
import
`;

      const issues = validateImports(content, "/project/test.js");
      // Should not crash, just skip malformed imports
      expect(Array.isArray(issues)).toBe(true);
    });

    it("handles scoped npm packages", () => {
      const packageJson = {
        dependencies: { "@company/lib": "^1.0.0" },
      };

      fs.existsSync.mockImplementation((p) => p.endsWith("package.json"));
      fs.readFileSync.mockImplementation((p) => {
        if (p.endsWith("package.json")) {
          return JSON.stringify(packageJson);
        }
        return "";
      });

      const result = resolveImportPath("@company/lib", "/project/app.js");
      expect(result.exists).toBe(true);
      expect(result.packageName).toBe("@company/lib");
    });

    it("handles dynamic imports", () => {
      const content = `
const module = await import('./dynamic');
import('./lazy-load');
`;

      const issues = validateImports(content, "/project/app.js");
      expect(issues).toHaveLength(2);
      expect(issues[0].type).toBe("missing-import");
      expect(issues[0].message).toContain("Dynamic import");
    });
  });
});
