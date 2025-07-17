const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

describe("radix-ui-accessibility-checker", () => {
  const hookPath = path.join(
    __dirname,
    "..",
    "radix-ui-accessibility-checker.js",
  );
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

  describe("ARIA labels", () => {
    it("should block self-closing buttons without aria-label", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/IconButton.tsx",
          content: `
            <Button asChild>
              <button />
            </Button>
            <IconButton />
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Interactive element without accessible label",
      );
    });

    it("should block Dialog.Close without aria-label", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Modal.tsx",
          content: `
            <Dialog.Close>
              <X />
            </Dialog.Close>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Dialog close button without aria-label");
    });

    it("should allow properly labeled elements", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Accessible.tsx",
          content: `
            <Button aria-label="Save document">
              <SaveIcon />
            </Button>
            <Dialog.Close aria-label="Close">
              <X />
            </Dialog.Close>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Keyboard navigation", () => {
    it("should warn about click handlers without keyboard support", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Clickable.tsx",
          content: `
            <div onClick={handleClick} className="cursor-pointer">
              Click me
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Click handler without keyboard support");
    });

    it("should allow click handlers on buttons", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/ProperButton.tsx",
          content: `
            <button onClick={handleClick}>Click me</button>
            <Button onClick={handleClick}>Click me</Button>
            <a href="#" onClick={handleClick}>Link</a>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Focus management", () => {
    it("should warn about modals without focus management", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Modal.tsx",
          content: `
            <Dialog open={isOpen}>
              <Dialog.Content>
                Modal content
              </Dialog.Content>
            </Dialog>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Modal component without focus management",
      );
    });

    it("should warn about autoFocus usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Form.tsx",
          content: `
            <input autoFocus />
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Using autoFocus can cause accessibility issues",
      );
    });

    it("should allow autoFocus={false}", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Form.tsx",
          content: `
            <input autoFocus={false} />
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("asChild prop usage", () => {
    it("should warn about asChild with generic elements", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Generic.tsx",
          content: `
            <DialogTrigger asChild>
              <div>Open dialog</div>
            </DialogTrigger>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Using asChild with generic HTML elements",
      );
    });

    it("should warn about asChild with non-semantic clickable", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/BadAsChild.tsx",
          content: `
            <DialogTrigger asChild>
              <span onClick={openDialog}>Open</span>
            </DialogTrigger>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "asChild with non-semantic clickable element",
      );
    });

    it("should allow proper asChild usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/GoodAsChild.tsx",
          content: `
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <TooltipTrigger asChild>
              <a href="/help">Help</a>
            </TooltipTrigger>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Role usage", () => {
    it('should warn about role="button" without tabIndex', () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/CustomButton.tsx",
          content: `
            <div role="button" onClick={handleClick}>
              Custom button
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain('role="button" without tabIndex');
    });

    it("should warn about complex roles without ARIA", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Menu.tsx",
          content: `
            <div role="menu">
              <div role="menuitem">Item 1</div>
            </div>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Complex role without required ARIA attributes",
      );
    });
  });

  describe("Form accessibility", () => {
    it("should warn about inputs without labels", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Form.tsx",
          content: `
            <Input type="text" placeholder="Name" />
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Form input without proper labeling");
    });

    it("should warn about RadioGroup without label", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/RadioForm.tsx",
          content: `
            <RadioGroup>
              <RadioGroupItem value="1" />
              <RadioGroupItem value="2" />
            </RadioGroup>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Form group without accessible label");
    });

    it("should warn about aria-invalid without description", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/ErrorInput.tsx",
          content: `
            <Input aria-invalid={hasError} />
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("aria-invalid without error description");
    });

    it("should allow properly labeled forms", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/AccessibleForm.tsx",
          content: `
            <label htmlFor="name">Name</label>
            <Input id="name" />
            
            <Input aria-label="Email address" />
            
            <RadioGroup aria-label="Choose option">
              <RadioGroupItem value="1" />
            </RadioGroup>
            
            <Input 
              aria-invalid={hasError} 
              aria-describedby="error-message" 
            />
            <span id="error-message">Error text</span>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Visual indicators", () => {
    it("should warn about focus states without visible outline", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/FocusStyle.tsx",
          content: `
            <button className="focus:bg-blue-600 hover:bg-blue-500">
              No focus ring
            </button>
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Focus state without visible outline");
    });

    it("should warn about Separator without orientation", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Divider.tsx",
          content: `
            <Separator />
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Separator without orientation");
    });

    it("should allow proper focus indicators", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/GoodFocus.tsx",
          content: `
            <button className="focus:ring-2 focus:ring-blue-500 hover:bg-blue-100">
              Good focus
            </button>
            <Separator aria-orientation="horizontal" />
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
          content: 'export const role = "admin";',
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
          content: "Add aria-label to buttons",
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });
});
