/**
 * Basic smoke tests for AIPatternEnforcer template
 * These tests verify the template serves its core purpose:
 * - Being a copy-paste template for local AI apps
 * - Following GOAL.md requirements (simple, local, no enterprise)
 */

const fs = require("fs");
const path = require("path");

describe("AIPatternEnforcer Template Core Requirements", () => {
  test("CLAUDE.md exists and contains critical rules", () => {
    const claudePath = path.join(__dirname, "..", "CLAUDE.md");
    expect(fs.existsSync(claudePath)).toBe(true);

    const content = fs.readFileSync(claudePath, "utf8");
    expect(content).toContain("NEVER create `*_improved.*`");
    expect(content).toContain("LOCAL ONE-PERSON AI APPS ONLY");
    expect(content).toContain("NO enterprise features");
  });

  test("package.json has essential AI development dependencies", () => {
    const packagePath = path.join(__dirname, "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    // AI-related dependencies for local development
    expect(pkg.dependencies).toHaveProperty("@anthropic-ai/sdk");
    expect(pkg.dependencies).toHaveProperty("openai");
    expect(pkg.dependencies).toHaveProperty("next");
    expect(pkg.dependencies).toHaveProperty("react");
    expect(pkg.dependencies).toHaveProperty("zustand");

    // Should NOT have enterprise dependencies
    expect(pkg.dependencies).not.toHaveProperty("auth0");
    expect(pkg.dependencies).not.toHaveProperty("aws-sdk");
    expect(pkg.dependencies).not.toHaveProperty("datadog");
  });

  test("essential npm scripts exist and are simple", () => {
    const packagePath = path.join(__dirname, "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    // Core development scripts
    expect(pkg.scripts).toHaveProperty("onboard");
    expect(pkg.scripts).toHaveProperty("test");
    expect(pkg.scripts).toHaveProperty("lint");
    expect(pkg.scripts).toHaveProperty("check:all");

    // AI-specific scripts
    expect(pkg.scripts).toHaveProperty("g:c");
    expect(pkg.scripts).toHaveProperty("context");
  });

  test("Claude Code hooks directory exists", () => {
    const hooksPath = path.join(__dirname, "..", "tools", "hooks");
    expect(fs.existsSync(hooksPath)).toBe(true);

    // Should have basic hooks for AI development
    const hookFiles = fs.readdirSync(hooksPath);
    expect(hookFiles).toContain("prevent-improved-files.js");
    expect(hookFiles).toContain("block-root-mess.js");
  });

  test("templates directory exists for copy-paste functionality", () => {
    const templatesPath = path.join(__dirname, "..", "templates");
    expect(fs.existsSync(templatesPath)).toBe(true);
  });

  test("tools/generators directory exists for AI development", () => {
    const generatorsPath = path.join(__dirname, "..", "tools", "generators");
    expect(fs.existsSync(generatorsPath)).toBe(true);

    const generatorFiles = fs.readdirSync(generatorsPath);
    expect(generatorFiles.some((f) => f.includes("component-generator"))).toBe(
      true,
    );
  });
});

describe("Template Simplicity (GOAL.md Compliance)", () => {
  test("no complex enterprise directories exist", () => {
    const rootPath = path.join(__dirname, "..");
    const items = fs.readdirSync(rootPath);

    // Should NOT have enterprise directories
    expect(items).not.toContain("docker");
    expect(items).not.toContain("kubernetes");
    expect(items).not.toContain("terraform");
    expect(items).not.toContain("monitoring");
    expect(items).not.toContain("auth");
    expect(items).not.toContain("deployment");
  });

  test("README focuses on local AI development", () => {
    const readmePath = path.join(__dirname, "..", "README.md");
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, "utf8").toLowerCase();
      expect(content).toContain("ai");
      expect(content).not.toContain("enterprise");
      expect(content).not.toContain("production deployment");
      expect(content).not.toContain("kubernetes");
    }
  });
});
