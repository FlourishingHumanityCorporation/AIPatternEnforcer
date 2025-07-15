const {
  analyzeParameterQuality,
  validateFilePathStructure,
  getFileType,
  getOperationThreshold,
  contextValidator,
  OPERATION_THRESHOLDS,
  PARAMETER_QUALITY_INDICATORS,
} = require("../context-validator");
const {
  ClaudeCodeMocks,
  PathFixtures,
  ContentFixtures,
  HookExecutor,
} = require("./test-helpers");

describe("context-validator hook", () => {
  let executor;

  beforeEach(() => {
    executor = new HookExecutor("context-validator");
  });

  describe("getFileType", () => {
    it("identifies documentation files", () => {
      expect(getFileType("README.md")).toBe("documentation");
      expect(getFileType("docs/guide.md")).toBe("documentation");
      expect(getFileType("/project/GUIDE.md")).toBe("documentation");
    });

    it("identifies test files", () => {
      expect(getFileType("test.test.js")).toBe("tests");
      expect(getFileType("utils.spec.ts")).toBe("tests");
      expect(getFileType("/tests/component.test.tsx")).toBe("tests");
    });

    it("identifies component files", () => {
      expect(getFileType("/components/Button.tsx")).toBe("components");
      expect(getFileType("Modal.jsx")).toBe("components");
    });

    it("identifies hook files", () => {
      expect(getFileType("/tools/hooks/validator.js")).toBe("hooks");
      expect(getFileType("custom.hook.ts")).toBe("hooks");
    });

    it("identifies config files", () => {
      expect(getFileType("config.json")).toBe("config");
      expect(getFileType(".env")).toBe("config");
      expect(getFileType("tsconfig.json")).toBe("config");
    });

    it("returns general for unmatched files", () => {
      expect(getFileType("script.py")).toBe("general");
      expect(getFileType("/src/utils.js")).toBe("general");
    });
  });

  describe("analyzeParameterQuality", () => {
    describe("Edit operations", () => {
      it("scores high-quality edit parameters", () => {
        const params = {
          file_path: "/project/src/component.tsx",
          old_string: "const button = <Button>Click me</Button>",
          new_string:
            'const button = <Button variant="primary">Click me</Button>',
        };

        const analysis = analyzeParameterQuality(
          params,
          "Edit",
          params.file_path,
        );

        expect(analysis.score).toBeGreaterThan(10);
        expect(analysis.indicators).toContain(
          "Very specific old_string provided (>20 chars)",
        );
        expect(analysis.indicators).toContain("Meaningful new_string provided");
        expect(analysis.warnings).toHaveLength(0);
      });

      it("penalizes short old_string", () => {
        const params = {
          file_path: "/project/src/utils.js",
          old_string: "x",
          new_string: "newValue",
        };

        const analysis = analyzeParameterQuality(
          params,
          "Edit",
          params.file_path,
        );

        expect(analysis.score).toBeLessThan(0);
        expect(analysis.warnings).toContain(
          "Extremely short old_string - almost certain to match wrong text",
        );
      });

      it("detects no-op edits", () => {
        const params = {
          file_path: "/project/test.js",
          old_string: 'console.log("test")',
          new_string: 'console.log("test")',
        };

        const analysis = analyzeParameterQuality(
          params,
          "Edit",
          params.file_path,
        );

        expect(analysis.warnings).toContain(
          "old_string identical to new_string - no change will occur",
        );
        expect(analysis.score).toBeLessThanOrEqual(-10);
      });

      it("detects root directory violations", () => {
        const params = {
          file_path: "component.tsx",
          old_string: "import React",
          new_string: "import React, { useState }",
        };

        const analysis = analyzeParameterQuality(
          params,
          "Edit",
          params.file_path,
        );

        expect(analysis.warnings).toContain(
          "Editing code file in root directory (violates project structure)",
        );
        expect(analysis.score).toBeLessThan(0);
      });
    });

    describe("Write operations", () => {
      it("scores substantial content positively", () => {
        const params = {
          file_path: "/project/src/components/NewComponent.tsx",
          content:
            'import React from "react";\n\nfunction NewComponent() {\n  return <div>Content</div>;\n}\n\nexport default NewComponent;',
        };

        const analysis = analyzeParameterQuality(
          params,
          "Write",
          params.file_path,
        );

        expect(analysis.score).toBeGreaterThan(10);
        expect(analysis.indicators).toContain(
          "Substantial content provided (>50 chars)",
        );
        // Content is ~110 chars, so won't trigger >200 chars indicator
        expect(analysis.indicators).not.toContain(
          "Detailed content provided (>200 chars)",
        );
      });

      it("penalizes root directory code files", () => {
        const params = {
          file_path: "app.js",
          content: 'console.log("app");',
        };

        const analysis = analyzeParameterQuality(
          params,
          "Write",
          params.file_path,
        );

        expect(analysis.warnings).toContain(
          "Creating code file in root directory (violates project structure)",
        );
        expect(analysis.score).toBeLessThan(0);
      });

      it("penalizes placeholder content", () => {
        const params = {
          file_path: "/project/src/todo.js",
          content: "// TODO: implement this function",
        };

        const analysis = analyzeParameterQuality(
          params,
          "Write",
          params.file_path,
        );

        // Even with penalties, it gets points for valid file path structure
        expect(analysis.score).toBeGreaterThan(5);
        // But ensure it doesn't score as high as good content
        expect(analysis.score).toBeLessThan(10);
      });

      it("detects _improved file patterns", () => {
        const params = {
          file_path: "/project/components/Button_improved.tsx",
          content: "export default function Button() { return null; }",
        };

        const analysis = analyzeParameterQuality(
          params,
          "Write",
          params.file_path,
        );

        expect(analysis.warnings).toContain(
          "File name suggests duplication instead of editing original",
        );
      });
    });

    describe("MultiEdit operations", () => {
      it("validates edit arrays", () => {
        const params = {
          file_path: "/project/src/utils.ts",
          edits: [
            {
              old_string: "function helper1()",
              new_string: "function helper1(param: string)",
            },
            {
              old_string: "function helper2()",
              new_string: "function helper2(data: number)",
            },
          ],
        };

        const analysis = analyzeParameterQuality(
          params,
          "MultiEdit",
          params.file_path,
        );

        expect(analysis.score).toBeGreaterThan(10);
        expect(analysis.indicators).toContain("Valid edits array provided");
        expect(analysis.indicators).toContain(
          "All edits have meaningful old_string",
        );
      });

      it("detects poor quality edits in array", () => {
        const params = {
          file_path: "/project/test.js",
          edits: [
            { old_string: "a", new_string: "newA" },
            { old_string: "b", new_string: "newB" },
          ],
        };

        const analysis = analyzeParameterQuality(
          params,
          "MultiEdit",
          params.file_path,
        );

        // Gets some points for valid edits array and file path, but penalized for short strings
        expect(analysis.score).toBeGreaterThan(0);
        expect(analysis.score).toBeLessThan(15);
      });
    });
  });

  describe("validateFilePathStructure", () => {
    it("allows valid paths", () => {
      const validPaths = [
        "/project/src/components/Button.tsx",
        "/project/docs/readme.md",
        "/project/tests/unit.test.js",
      ];

      validPaths.forEach((path) => {
        const result = validateFilePathStructure(path);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe("");
      });
    });

    it("rejects root directory code files", () => {
      const invalidPaths = ["component.tsx", "utils.js", "main.ts"];

      invalidPaths.forEach((path) => {
        const result = validateFilePathStructure(path);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain(
          "Code files must not be in root directory",
        );
      });
    });

    it("rejects application directories in root", () => {
      const invalidPaths = [
        "app/page.tsx",
        "components/Button.tsx",
        "lib/utils.ts",
        "pages/index.js",
      ];

      invalidPaths.forEach((path) => {
        const result = validateFilePathStructure(path);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain(
          "Application code directories must be inside templates/[framework]/",
        );
      });
    });

    it("rejects _improved file patterns", () => {
      const improvedPaths = [
        "/project/component_improved.tsx",
        "/project/utils_enhanced.js",
        "/project/helper_v2.ts",
      ];

      improvedPaths.forEach((path) => {
        const result = validateFilePathStructure(path);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain(
          "Avoid creating duplicate files - edit originals instead",
        );
      });
    });
  });

  describe("getOperationThreshold", () => {
    it("returns appropriate thresholds for operations", () => {
      expect(getOperationThreshold("Write").minScore).toBe(6);
      expect(getOperationThreshold("Edit").minScore).toBe(10);
      expect(getOperationThreshold("MultiEdit").minScore).toBe(12);
    });

    it("adjusts for file types", () => {
      const docThreshold = getOperationThreshold("Write", "README.md");
      expect(docThreshold.minScore).toBeGreaterThanOrEqual(2);

      const componentThreshold = getOperationThreshold(
        "Write",
        "/components/Button.tsx",
      );
      expect(componentThreshold.minScore).toBeGreaterThanOrEqual(4);
    });
  });

  describe("hook integration", () => {
    it("allows high-quality operations", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Edit",
        tool_input: {
          file_path: "/project/src/components/Button.tsx",
          old_string: "function Button() { return <button>Click</button>; }",
          new_string:
            "function Button({ onClick }: { onClick: () => void }) { return <button onClick={onClick}>Click</button>; }",
        },
      });

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeAllowed();
    });

    it("blocks low-quality edit operations", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Edit",
        tool_input: {
          file_path: "/project/src/utils.js",
          old_string: "x",
          new_string: "y",
        },
      });

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeBlocked();
      expect(result.message).toContain("Parameter quality score");
      expect(result.message).toContain("Extremely short old_string");
    });

    it("blocks root directory violations", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Write",
        tool_input: {
          file_path: "component.tsx",
          content: "export default function Component() { return null; }",
        },
      });

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeBlocked();
      expect(result.message).toContain("File path violation");
      expect(result.message).toContain(
        "Code files must not be in root directory",
      );
    });

    it("blocks _improved file creation", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Write",
        tool_input: {
          file_path: "/project/components/Button_improved.tsx",
          content: "improved version of Button component",
        },
      });

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeBlocked();
      expect(result.message).toContain("File path violation");
      expect(result.message).toContain("Avoid creating duplicate files");
    });

    it("provides helpful improvement suggestions", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Edit",
        tool_input: {
          file_path: "/project/src/test.js",
          old_string: "a",
          new_string: "b",
        },
      });

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeBlocked();
      expect(result.message).toContain("To fix:");
      expect(result.message).toContain("🎯 Provide more specific old_string");
      expect(result.message).toContain(
        "🔍 Use longer, more specific old_string",
      );
    });

    it("allows operations when no parameters provided", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Edit",
        tool_input: {},
      });

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeAllowed();
    });

    it("handles documentation files with lower thresholds", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Write",
        tool_input: {
          file_path: "/project/docs/guide.md",
          content: "# Quick Guide\n\nThis is a short guide.",
        },
      });

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeAllowed();
    });
  });

  describe("edge cases", () => {
    it("handles empty tool input gracefully", async () => {
      const input = {
        raw: {
          tool_name: "Write",
          tool_input: null,
        },
      };

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeAllowed();
    });

    it("handles missing file_path", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Edit",
        tool_input: {
          old_string: "test",
          new_string: "updated",
        },
      });

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeAllowed();
    });

    it("handles unknown operation types", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "UnknownOperation",
        tool_input: {
          file_path: "/project/test.js",
          content: "test content",
        },
      });

      const result = await executor.execute(contextValidator, input);
      expect(result.allow || result.block).toBeDefined();
    });

    it("provides context about good parameters when blocking", async () => {
      const input = ClaudeCodeMocks.createHookInput({
        tool_name: "Edit",
        tool_input: {
          file_path: "/project/src/component.tsx",
          old_string: "a", // Very short - will be blocked
          new_string: "meaningfulReplacement", // Good new_string
        },
      });

      const result = await executor.execute(contextValidator, input);
      expect(result).toBeBlocked();
      expect(result.message).toContain("Good parameters detected");
      expect(result.message).toContain("Meaningful new_string provided");
    });
  });
});
