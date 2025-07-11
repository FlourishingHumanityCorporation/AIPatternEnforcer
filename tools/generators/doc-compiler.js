#!/usr/bin/env node

/**
 * Unified Documentation Compiler
 * Compiles documentation from a single source to multiple formats:
 * - Human-readable markdown
 * - .cursorrules
 * - CLAUDE.md sections
 * - IDE hints
 */

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { Command } = require("commander");

const program = new Command();

// Documentation source directory
const DOC_SOURCE = path.join(process.cwd(), "docs/unified");
const OUTPUT_DIR = path.join(process.cwd(), ".ai-compiled");

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Parse unified documentation format
function parseUnifiedDoc(content) {
  const sections = {
    meta: {},
    rules: [],
    patterns: [],
    examples: [],
    context: {},
    human: [],
  };

  const lines = content.split("\n");
  let currentSection = "human";
  let currentContent = [];

  for (const line of lines) {
    // Check for section markers
    if (line.startsWith("---ai-rule---")) {
      if (currentContent.length) {
        sections[currentSection].push(currentContent.join("\n"));
      }
      currentSection = "rules";
      currentContent = [];
    } else if (line.startsWith("---ai-pattern---")) {
      if (currentContent.length) {
        sections[currentSection].push(currentContent.join("\n"));
      }
      currentSection = "patterns";
      currentContent = [];
    } else if (line.startsWith("---ai-example---")) {
      if (currentContent.length) {
        sections[currentSection].push(currentContent.join("\n"));
      }
      currentSection = "examples";
      currentContent = [];
    } else if (line.startsWith("---ai-context:")) {
      const contextKey = line.match(/---ai-context:\s*(.+)---/)[1];
      sections.context[contextKey] = [];
      currentSection = "context";
      currentContent = sections.context[contextKey];
    } else if (line.startsWith("---human---")) {
      currentSection = "human";
      currentContent = [];
    } else if (line.startsWith("---meta:")) {
      const metaMatch = line.match(/---meta:\s*(.+?)\s*=\s*(.+)---/);
      if (metaMatch) {
        sections.meta[metaMatch[1]] = metaMatch[2];
      }
    } else {
      currentContent.push(line);
    }
  }

  // Add final section
  if (currentContent.length) {
    if (currentSection === "context") {
      // Context was already added
    } else {
      sections[currentSection].push(currentContent.join("\n"));
    }
  }

  return sections;
}

// Compile to .cursorrules format
function compileToCursorRules(sections) {
  let output = "# Project Rules for AI Assistant\n\n";

  // Add meta information
  if (sections.meta.description) {
    output += `## Context\n${sections.meta.description}\n\n`;
  }

  // Add rules
  if (sections.rules.length) {
    output += "## You MUST follow these rules:\n\n";
    sections.rules.forEach((rule, index) => {
      output += `${index + 1}. ${rule.trim()}\n`;
    });
    output += "\n";
  }

  // Add patterns
  if (sections.patterns.length) {
    output += "## Project-Specific Patterns:\n\n";
    sections.patterns.forEach((pattern) => {
      output += pattern.trim() + "\n\n";
    });
  }

  // Add examples
  if (sections.examples.length) {
    output += "## Code Examples:\n\n";
    sections.examples.forEach((example) => {
      output += example.trim() + "\n\n";
    });
  }

  return output;
}

// Compile to CLAUDE.md section
function compileToClaudeMd(sections, sectionName) {
  let output = `## ${sectionName}\n\n`;

  // Combine rules and patterns for CLAUDE.md
  if (sections.rules.length) {
    output += "### Rules\n\n";
    sections.rules.forEach((rule) => {
      output += `- ${rule.trim()}\n`;
    });
    output += "\n";
  }

  if (sections.patterns.length) {
    output += "### Patterns\n\n";
    sections.patterns.forEach((pattern) => {
      output += pattern.trim() + "\n\n";
    });
  }

  if (sections.context && Object.keys(sections.context).length) {
    output += "### Context\n\n";
    for (const [key, value] of Object.entries(sections.context)) {
      output += `**${key}**: ${value.join(" ")}\n\n`;
    }
  }

  return output;
}

// Compile to human-readable documentation
function compileToHumanDocs(sections, fileName) {
  let output = `# ${sections.meta.title || fileName}\n\n`;

  if (sections.meta.description) {
    output += `${sections.meta.description}\n\n`;
  }

  sections.human.forEach((content) => {
    output += content.trim() + "\n\n";
  });

  // Add patterns as appendix
  if (sections.patterns.length) {
    output += "## Technical Patterns\n\n";
    sections.patterns.forEach((pattern) => {
      output += pattern.trim() + "\n\n";
    });
  }

  // Add examples
  if (sections.examples.length) {
    output += "## Examples\n\n";
    sections.examples.forEach((example) => {
      output += example.trim() + "\n\n";
    });
  }

  return output;
}

// Compile to IDE hints (VS Code snippets)
function compileToIDEHints(sections) {
  const snippets = {};

  // Convert patterns to snippets
  sections.patterns.forEach((pattern, index) => {
    const lines = pattern.split("\n");
    const name = lines[0].replace(/[#\s]/g, "") || `pattern${index}`;

    snippets[name] = {
      prefix: name.toLowerCase(),
      body: lines.slice(1),
      description: sections.meta.description || "Project pattern",
    };
  });

  // Convert examples to snippets
  sections.examples.forEach((example, index) => {
    if (example.includes("```")) {
      const codeMatch = example.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeMatch) {
        const name = `example${index}`;
        snippets[name] = {
          prefix: name,
          body: codeMatch[1].split("\n"),
          description: "Code example from documentation",
        };
      }
    }
  });

  return JSON.stringify(snippets, null, 2);
}

// Process a single documentation file
function processDocFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath, ".md");
  const sections = parseUnifiedDoc(content);

  console.log(chalk.blue(`Processing: ${fileName}`));

  // Ensure output directories exist
  ensureDir(OUTPUT_DIR);
  ensureDir(path.join(OUTPUT_DIR, "cursor"));
  ensureDir(path.join(OUTPUT_DIR, "claude"));
  ensureDir(path.join(OUTPUT_DIR, "human"));
  ensureDir(path.join(OUTPUT_DIR, "ide"));

  // Compile to different formats
  const cursorRules = compileToCursorRules(sections);
  const claudeMd = compileToClaudeMd(sections, fileName);
  const humanDocs = compileToHumanDocs(sections, fileName);
  const ideHints = compileToIDEHints(sections);

  // Write outputs
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "cursor", `${fileName}.cursorrules`),
    cursorRules,
  );

  fs.writeFileSync(path.join(OUTPUT_DIR, "claude", `${fileName}.md`), claudeMd);

  fs.writeFileSync(path.join(OUTPUT_DIR, "human", `${fileName}.md`), humanDocs);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "ide", `${fileName}.code-snippets`),
    ideHints,
  );

  console.log(chalk.green(`✓ Compiled ${fileName} to all formats`));
}

// Merge all compiled files into final outputs
function mergeCompiledFiles() {
  console.log(chalk.yellow("\nMerging compiled files..."));

  // Merge .cursorrules
  const cursorFiles = fs.readdirSync(path.join(OUTPUT_DIR, "cursor"));
  let mergedCursor = "# Complete Project Rules for AI Assistant\n\n";

  cursorFiles.forEach((file) => {
    const content = fs.readFileSync(
      path.join(OUTPUT_DIR, "cursor", file),
      "utf8",
    );
    mergedCursor += content + "\n\n";
  });

  fs.writeFileSync(path.join(process.cwd(), ".cursorrules"), mergedCursor);
  console.log(chalk.green("✓ Generated .cursorrules"));

  // Create CLAUDE.md sections
  const claudeFiles = fs.readdirSync(path.join(OUTPUT_DIR, "claude"));
  let claudeSections = "\n\n## AI-Compiled Documentation\n\n";

  claudeFiles.forEach((file) => {
    const content = fs.readFileSync(
      path.join(OUTPUT_DIR, "claude", file),
      "utf8",
    );
    claudeSections += content + "\n\n";
  });

  // Append to CLAUDE.md (don't overwrite)
  const claudeMdPath = path.join(process.cwd(), "CLAUDE.md");
  if (fs.existsSync(claudeMdPath)) {
    const existing = fs.readFileSync(claudeMdPath, "utf8");

    // Remove old compiled section if exists
    const compiledMarker = "## AI-Compiled Documentation";
    const markerIndex = existing.indexOf(compiledMarker);

    let updated;
    if (markerIndex !== -1) {
      updated = existing.substring(0, markerIndex) + claudeSections;
    } else {
      updated = existing + claudeSections;
    }

    fs.writeFileSync(claudeMdPath, updated);
    console.log(chalk.green("✓ Updated CLAUDE.md"));
  }

  // Copy human docs to docs directory
  const humanFiles = fs.readdirSync(path.join(OUTPUT_DIR, "human"));
  const docsDir = path.join(process.cwd(), "docs", "compiled");
  ensureDir(docsDir);

  humanFiles.forEach((file) => {
    fs.copyFileSync(
      path.join(OUTPUT_DIR, "human", file),
      path.join(docsDir, file),
    );
  });
  console.log(chalk.green("✓ Generated human documentation"));

  // Merge IDE snippets
  const ideFiles = fs.readdirSync(path.join(OUTPUT_DIR, "ide"));
  let mergedSnippets = {};

  ideFiles.forEach((file) => {
    const content = JSON.parse(
      fs.readFileSync(path.join(OUTPUT_DIR, "ide", file), "utf8"),
    );
    mergedSnippets = { ...mergedSnippets, ...content };
  });

  const snippetsPath = path.join(
    process.cwd(),
    ".vscode",
    "project.code-snippets",
  );
  fs.writeFileSync(snippetsPath, JSON.stringify(mergedSnippets, null, 2));
  console.log(chalk.green("✓ Generated VS Code snippets"));
}

// Main command
program
  .name("doc-compiler")
  .description("Compile unified documentation to multiple formats")
  .version("1.0.0");

program
  .command("compile")
  .description("Compile all documentation files")
  .action(() => {
    console.log(chalk.blue("Starting documentation compilation...\n"));

    // Ensure source directory exists
    if (!fs.existsSync(DOC_SOURCE)) {
      console.log(chalk.yellow(`Creating ${DOC_SOURCE} directory...`));
      ensureDir(DOC_SOURCE);

      // Create example file
      const exampleContent = `---meta: title = API Documentation---
---meta: description = This document defines our API patterns and rules---

---human---
# API Documentation

This document describes our API design patterns and best practices.

## RESTful Endpoints

Our API follows RESTful principles with consistent naming and behavior.

---ai-rule---
Always use RESTful naming conventions: GET /users, POST /users, GET /users/:id

---ai-rule---
Return consistent error responses with code, message, and details fields

---ai-pattern---
### Error Response Format
\`\`\`typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}
\`\`\`

---ai-example---
### Successful Response Example
\`\`\`typescript
// GET /api/users/123
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
\`\`\`

---ai-context: endpoint-naming---
Use plural nouns for collections (users, not user)

---ai-context: http-methods---
GET for reading, POST for creating, PUT for full updates, PATCH for partial updates, DELETE for removal
`;

      fs.writeFileSync(
        path.join(DOC_SOURCE, "api-patterns.md"),
        exampleContent,
      );

      console.log(chalk.green("✓ Created example documentation file"));
    }

    // Find all .md files in source directory
    const files = fs
      .readdirSync(DOC_SOURCE)
      .filter((file) => file.endsWith(".md"));

    if (files.length === 0) {
      console.log(chalk.red("No documentation files found in " + DOC_SOURCE));
      process.exit(1);
    }

    // Process each file
    files.forEach((file) => {
      processDocFile(path.join(DOC_SOURCE, file));
    });

    // Merge all compiled files
    mergeCompiledFiles();

    console.log(chalk.green("\n✨ Documentation compilation complete!"));
  });

program
  .command("watch")
  .description("Watch for documentation changes and recompile")
  .action(() => {
    console.log(chalk.blue("Watching for documentation changes...\n"));

    const chokidar = require("chokidar");

    const watcher = chokidar.watch(path.join(DOC_SOURCE, "*.md"), {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("change", (filePath) => {
      console.log(chalk.yellow(`\nFile changed: ${path.basename(filePath)}`));
      processDocFile(filePath);
      mergeCompiledFiles();
    });

    watcher.on("add", (filePath) => {
      console.log(chalk.yellow(`\nFile added: ${path.basename(filePath)}`));
      processDocFile(filePath);
      mergeCompiledFiles();
    });
  });

program.parse(process.argv);
