const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

describe("shadcn-ui-validator", () => {
  const hookPath = path.join(__dirname, "..", "shadcn-ui-validator.js");
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
      return {
        exitCode: error.status || 1,
        stderr: error.stderr?.toString() || error.message,
        stdout: error.stdout?.toString() || "",
      };
    }
  }

  describe("Import validation", () => {
    it("should block direct Radix UI imports", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/MyButton.tsx",
          content: `
            import { Button } from '@radix-ui/react-button';
            
            export function MyButton() {
              return <Button>Click me</Button>;
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Direct Radix UI imports detected");
      expect(result.stderr).toContain("Import from @/components/ui/*");
    });

    it("should block internal primitives imports", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Custom.tsx",
          content: `
            import { Primitive } from '@/components/ui/primitives';
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Importing from internal primitives");
    });

    it("should block relative UI imports", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "features/dashboard/Dashboard.tsx",
          content: `
            import { Button } from '../ui/button';
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Relative imports to UI components");
      expect(result.stderr).toContain("Use absolute imports");
    });

    it("should allow proper shadcn/ui imports", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/MyComponent.tsx",
          content: `
            import { Button } from '@/components/ui/button';
            import { Card } from '@/components/ui/card';
            import { cn } from '@/lib/utils';
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("cn() utility usage", () => {
    it("should block ternary in className without cn", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Status.tsx",
          content: `
            <div className={isActive ? "bg-green-500" : "bg-red-500"}>
              Status
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Ternary operators in className without cn()",
      );
    });

    it("should block template literals without cn", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Dynamic.tsx",
          content: `
            <div className={\`px-4 py-2 \${isLarge ? 'text-lg' : 'text-sm'}\`}>
              Dynamic text
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Template literals in className without cn()",
      );
    });

    it("should block clsx usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Clsx.tsx",
          content: `
            import clsx from 'clsx';
            
            <div className={clsx('base', { active: isActive })}>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Using clsx instead of cn");
    });

    it("should allow proper cn usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Proper.tsx",
          content: `
            import { cn } from '@/lib/utils';
            
            <div className={cn(
              "base-class",
              isActive && "active-class",
              size === "large" ? "text-lg" : "text-sm"
            )}>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Component modification patterns", () => {
    it("should block styled-components on shadcn components", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/StyledButton.tsx",
          content: `
            import styled from 'styled-components';
            import { Button } from '@/components/ui/button';
            
            const StyledButton = styled(Button)\`
              margin: 20px;
            \`;
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Styling shadcn/ui components with styled-components",
      );
    });

    it("should block extending shadcn components", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/ExtendedButton.tsx",
          content: `
            class MyButton extends Button {
              render() {
                return super.render();
              }
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Extending shadcn/ui components");
    });

    it("should block inline styles on shadcn components", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/InlineStyle.tsx",
          content: `
            <Button style={{ margin: '20px' }}>
              Click me
            </Button>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Inline styles on shadcn/ui components");
    });
  });

  describe("Variant validation", () => {
    it("should block invalid variant props", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/BadVariant.tsx",
          content: `
            <Button variant="primary">Primary Button</Button>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Invalid variant prop value");
      expect(result.stderr).toContain("Use valid variants");
    });

    it("should block invalid size props", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/BadSize.tsx",
          content: `
            <Button size="xl">Extra Large</Button>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Invalid size prop value");
      expect(result.stderr).toContain("Use valid sizes");
    });

    it("should allow valid variants and sizes", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/ValidVariants.tsx",
          content: `
            <Button variant="destructive" size="lg">Delete</Button>
            <Button variant="outline" size="sm">Cancel</Button>
            <Button variant="ghost" size="icon"><Icon /></Button>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Theme consistency", () => {
    it("should block direct color customization", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "tailwind.config.js",
          content: `
            module.exports = {
              theme: {
                extend: {
                  colors: {
                    primary: {
                      DEFAULT: '#1a73e8'
                    }
                  }
                }
              }
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Customizing primary color directly");
    });

    it("should block theme() function usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Themed.tsx",
          content: `
            const styles = {
              color: theme('colors.primary')
            };
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Using theme() function");
      expect(result.stderr).toContain("Use CSS variables");
    });
  });

  describe("Accessibility patterns", () => {
    it("should warn about buttons without labels", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/IconButton.tsx",
          content: `
            <Button>X</Button>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Button without descriptive content");
    });

    it("should warn about Dialog without DialogContent", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/BadDialog.tsx",
          content: `
            <Dialog>
              <div>Some content</div>
            </Dialog>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Dialog used without DialogContent");
    });

    it("should allow proper Dialog usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/GoodDialog.tsx",
          content: `
            <Dialog>
              <DialogTrigger>Open</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Title</DialogTitle>
                </DialogHeader>
              </DialogContent>
            </Dialog>
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
          content: 'export const variant = "primary";',
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
          content: 'Use variant="primary" for main actions',
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });
});
