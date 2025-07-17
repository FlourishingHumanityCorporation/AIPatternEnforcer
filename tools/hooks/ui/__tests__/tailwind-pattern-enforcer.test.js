const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

describe("tailwind-pattern-enforcer", () => {
  const hookPath = path.join(__dirname, "..", "tailwind-pattern-enforcer.js");
  const projectRoot = path.join(__dirname, "..", "..", "..", "..");
  const envPath = path.join(projectRoot, ".env");
  const envBackupPath = path.join(projectRoot, ".env.backup");
  const envTestPath = path.join(projectRoot, ".env.test");

  beforeAll(() => {
    // Backup original .env file if it exists
    if (fs.existsSync(envPath)) {
      fs.copyFileSync(envPath, envBackupPath);
    }
    // Copy test .env file
    if (fs.existsSync(envTestPath)) {
      fs.copyFileSync(envTestPath, envPath);
    }
  });

  afterAll(() => {
    // Restore original .env file
    if (fs.existsSync(envBackupPath)) {
      fs.copyFileSync(envBackupPath, envPath);
      fs.unlinkSync(envBackupPath);
    }
  });

  function runHook(input) {
    try {
      const result = execSync(
        `echo '${JSON.stringify(input)}' | node ${hookPath}`,
        {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        },
      );
      return { exitCode: 0, stderr: "", stdout: result };
    } catch (error) {
      // For debugging, let's see what's happening
      if (process.env.DEBUG_TESTS) {
        console.error("Hook error:", error.message);
        console.error("Stderr:", error.stderr?.toString());
        console.error("Stdout:", error.stdout?.toString());
      }
      return {
        exitCode: error.status || 1,
        stderr: error.stderr?.toString() || error.message,
        stdout: error.stdout?.toString() || "",
      };
    }
  }

  describe("CSS-in-JS detection", () => {
    it("should block styled-components usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Button.tsx",
          content: `
            import styled from 'styled-components';
            
            const StyledButton = styled.button\`
              background: blue;
              color: white;
            \`;
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Styled-components detected");
      expect(result.stderr).toContain("Use Tailwind utility classes");
    });

    it("should block inline CSS objects", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Card.jsx",
          content: `
            function Card() {
              return <div css={{ backgroundColor: 'red', padding: '20px' }}>Content</div>;
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Inline CSS objects detected");
    });

    it("should block inline style props", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Header.tsx",
          content: `
            <header style={{ backgroundColor: '#333', color: 'white' }}>
              Header Content
            </header>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Inline style prop detected");
    });
  });

  describe("Arbitrary value patterns", () => {
    it("should block excessive arbitrary values", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Layout.tsx",
          content: `
            <div className="w-[420px] h-[280px] mt-[13px] ml-[27px] p-[15px]">
              Too many arbitrary values
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Excessive arbitrary values");
      expect(result.stderr).toContain("custom utility classes");
    });

    it("should allow reasonable arbitrary values", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Hero.tsx",
          content: `
            <div className="max-w-[1280px] mx-auto">
              Hero content with reasonable constraint
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Spacing consistency", () => {
    it("should detect mixed spacing units", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Card.tsx",
          content: `
            <div className="p-4 m-px gap-8 space-x-px">
              Mixed spacing units
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Inconsistent spacing units");
    });
  });

  describe("Responsive patterns", () => {
    it("should warn about missing responsive breakpoints", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Grid.tsx",
          content: `
            <div className="w-full h-screen max-w-6xl min-h-screen max-h-full min-w-0">
              Many layout utilities but no responsive variants
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("No responsive breakpoints detected");
    });

    it("should allow layouts with responsive variants", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/ResponsiveGrid.tsx",
          content: `
            <div className="w-full md:w-1/2 lg:w-1/3 h-auto sm:h-64 md:h-96">
              Responsive layout
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Color consistency", () => {
    it("should detect too many different colors", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Rainbow.tsx",
          content: `
            <div className="text-red-500 bg-blue-400 border-green-300">
              <span className="text-yellow-600 bg-purple-200 border-orange-400">
                <p className="text-pink-700 bg-gray-100 border-indigo-500">
                  Too many colors
                </p>
              </span>
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Too many different colors");
    });
  });

  describe("Hardcoded values", () => {
    it("should detect hardcoded hex colors", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Brand.tsx",
          content: `
            <div className="bg-[#1a73e8] text-[#ffffff] border-[#dadce0]">
              Brand colors
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Hardcoded hex colors");
      expect(result.stderr).toContain("Use theme colors");
    });

    it("should detect hardcoded pixel values", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Fixed.tsx",
          content: `
            <div className="w-[250px] h-[180px]">
              Fixed dimensions
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Hardcoded pixel widths/heights");
    });
  });

  describe("Valid Tailwind patterns", () => {
    it("should allow proper Tailwind usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/ProperButton.tsx",
          content: `
            export function ProperButton({ variant = 'primary' }) {
              return (
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-6 sm:py-3">
                  Click me
                </button>
              );
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });

    it("should allow CN utility helper pattern", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/ConditionalStyles.tsx",
          content: `
            import { cn } from '@/lib/utils';
            
            export function ConditionalButton({ isActive }) {
              return (
                <button className={cn(
                  "px-4 py-2 rounded-md",
                  isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                )}>
                  Toggle
                </button>
              );
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("File type filtering", () => {
    it("should skip non-React files", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "utils/helpers.ts",
          content: 'export const style = { color: "red" };',
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });

    it("should skip documentation files", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "README.md",
          content: 'Use style={{ color: "red" }} for inline styles',
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });
});
