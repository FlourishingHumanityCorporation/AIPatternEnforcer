#!/usr/bin/env node

/**
 * AI Context Annotation Parser
 * Parses source files for AI context annotations and generates context files
 *
 * Supported annotations:
 * - @ai-context: [context-name] - Define context for following code
 * - @ai-previous: [file/decision] - Reference previous decisions
 * - @ai-pattern: [pattern-name] - Indicate pattern being used
 * - @ai-ignore - Tell AI to ignore this section
 * - @ai-important - Highlight critical sections
 */

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const glob = require("glob");

// Context storage
const contexts = new Map();
const patterns = new Map();
const references = new Map();
const importantSections = [];

// Supported file extensions
const FILE_EXTENSIONS = [
  "**/*.js",
  "**/*.jsx",
  "**/*.ts",
  "**/*.tsx",
  "**/*.py",
  "**/*.go",
  "**/*.rs",
  "**/*.java",
  "**/*.cs",
  "**/*.rb",
  "**/*.php",
  "**/*.md",
];

// Exclude patterns
const EXCLUDE_PATTERNS = [
  "node_modules/**",
  "dist/**",
  "build/**",
  ".next/**",
  "coverage/**",
  "*.min.js",
  "*.bundle.js",
  "vendor/**",
  ".git/**",
];

// Parse AI annotations from a file
function parseFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const fileContexts = [];

  let currentContext = null;
  let contextStartLine = null;
  let inIgnoreBlock = false;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check for AI annotations
    const contextMatch = line.match(/@ai-context:\s*([^\s]+)/);
    const previousMatch = line.match(/@ai-previous:\s*([^\s]+)/);
    const patternMatch = line.match(/@ai-pattern:\s*([^\s]+)/);
    const ignoreMatch = line.match(/@ai-ignore/);
    const ignoreEndMatch = line.match(/@ai-ignore-end/);
    const importantMatch = line.match(/@ai-important/);

    // Handle ignore blocks
    if (ignoreMatch) {
      inIgnoreBlock = true;
      return;
    }

    if (ignoreEndMatch) {
      inIgnoreBlock = false;
      return;
    }

    if (inIgnoreBlock) {
      return;
    }

    // Handle context definitions
    if (contextMatch) {
      // Save previous context if exists
      if (currentContext && contextStartLine) {
        const contextCode = lines.slice(contextStartLine, index).join("\n");
        fileContexts.push({
          name: currentContext,
          file: filePath,
          startLine: contextStartLine + 1,
          endLine: index,
          code: contextCode,
        });
      }

      currentContext = contextMatch[1];
      contextStartLine = index;
    }

    // Handle previous references
    if (previousMatch) {
      const reference = previousMatch[1];
      if (!references.has(reference)) {
        references.set(reference, []);
      }
      references.get(reference).push({
        file: filePath,
        line: lineNumber,
        context: currentContext,
      });
    }

    // Handle pattern annotations
    if (patternMatch) {
      const pattern = patternMatch[1];
      if (!patterns.has(pattern)) {
        patterns.set(pattern, []);
      }

      // Extract next 20 lines or until next annotation
      const patternEndLine = Math.min(index + 20, lines.length);
      const patternCode = lines.slice(index + 1, patternEndLine).join("\n");

      patterns.get(pattern).push({
        file: filePath,
        line: lineNumber,
        code: patternCode,
        context: currentContext,
      });
    }

    // Handle important sections
    if (importantMatch) {
      // Extract next 10 lines
      const importantEndLine = Math.min(index + 10, lines.length);
      const importantCode = lines.slice(index + 1, importantEndLine).join("\n");

      importantSections.push({
        file: filePath,
        line: lineNumber,
        code: importantCode,
        context: currentContext,
      });
    }
  });

  // Save final context
  if (currentContext && contextStartLine) {
    const contextCode = lines.slice(contextStartLine).join("\n");
    fileContexts.push({
      name: currentContext,
      file: filePath,
      startLine: contextStartLine + 1,
      endLine: lines.length,
      code: contextCode,
    });
  }

  // Store contexts
  fileContexts.forEach((ctx) => {
    if (!contexts.has(ctx.name)) {
      contexts.set(ctx.name, []);
    }
    contexts.get(ctx.name).push(ctx);
  });
}

// Generate context file for a specific feature/context
function generateContextFile(contextName) {
  const outputDir = path.join(process.cwd(), ".ai-context", "parsed");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const contextData = contexts.get(contextName);
  if (!contextData || contextData.length === 0) {
    console.log(chalk.yellow(`No context found for: ${contextName}`));
    return;
  }

  let output = `# AI Context: ${contextName}\n\n`;
  output += `Generated: ${new Date().toISOString()}\n\n`;

  // Add context sections
  output += `## Code Sections\n\n`;
  contextData.forEach((ctx) => {
    output += `### ${path.relative(process.cwd(), ctx.file)} (lines ${ctx.startLine}-${ctx.endLine})\n\n`;
    output += "```" + path.extname(ctx.file).slice(1) + "\n";
    output += ctx.code + "\n";
    output += "```\n\n";
  });

  // Add related patterns
  const relatedPatterns = Array.from(patterns.entries()).filter(
    ([_, instances]) => instances.some((inst) => inst.context === contextName),
  );

  if (relatedPatterns.length > 0) {
    output += `## Related Patterns\n\n`;
    relatedPatterns.forEach(([patternName, instances]) => {
      output += `### Pattern: ${patternName}\n\n`;
      instances
        .filter((inst) => inst.context === contextName)
        .forEach((inst) => {
          output += `Used in ${path.relative(process.cwd(), inst.file)}:${inst.line}\n\n`;
          output += "```\n" + inst.code + "\n```\n\n";
        });
    });
  }

  // Add references
  const contextReferences = Array.from(references.entries()).filter(
    ([_, refs]) => refs.some((ref) => ref.context === contextName),
  );

  if (contextReferences.length > 0) {
    output += `## References\n\n`;
    contextReferences.forEach(([refName, refs]) => {
      refs
        .filter((ref) => ref.context === contextName)
        .forEach((ref) => {
          output += `- ${refName} (referenced in ${path.relative(process.cwd(), ref.file)}:${ref.line})\n`;
        });
    });
  }

  // Write context file
  const outputPath = path.join(outputDir, `${contextName}.context.md`);
  fs.writeFileSync(outputPath, output);
  console.log(chalk.green(`✓ Generated context file: ${outputPath}`));
}

// Generate AI hints file for IDE
function generateIDEHints() {
  const hints = {
    "ai-context": {
      scope: "comment.line",
      prefix: "@ai-context",
      body: "@ai-context: ${1:context-name}",
      description: "Define AI context for the following code section",
    },
    "ai-previous": {
      scope: "comment.line",
      prefix: "@ai-previous",
      body: "@ai-previous: ${1:reference-file}",
      description: "Reference previous AI decisions or documentation",
    },
    "ai-pattern": {
      scope: "comment.line",
      prefix: "@ai-pattern",
      body: "@ai-pattern: ${1:pattern-name}",
      description: "Indicate the pattern being used in this code",
    },
    "ai-important": {
      scope: "comment.line",
      prefix: "@ai-important",
      body: "@ai-important",
      description: "Mark this section as important for AI to understand",
    },
    "ai-ignore": {
      scope: "comment.line",
      prefix: "@ai-ignore",
      body: "@ai-ignore\n$0\n@ai-ignore-end",
      description: "Tell AI to ignore this code section",
    },
  };

  const outputPath = path.join(
    process.cwd(),
    ".vscode",
    "ai-annotations.code-snippets",
  );
  fs.writeFileSync(outputPath, JSON.stringify(hints, null, 2));
  console.log(chalk.green("✓ Generated VS Code AI annotation snippets"));
}

// Generate summary report
function generateSummaryReport() {
  const outputPath = path.join(process.cwd(), ".ai-context", "summary.md");

  let report = "# AI Context Annotation Summary\n\n";
  report += `Generated: ${new Date().toISOString()}\n\n`;

  // Context summary
  report += `## Contexts Found (${contexts.size})\n\n`;
  Array.from(contexts.keys())
    .sort()
    .forEach((contextName) => {
      const instances = contexts.get(contextName);
      report += `- **${contextName}** (${instances.length} sections)\n`;
    });

  // Pattern summary
  report += `\n## Patterns Used (${patterns.size})\n\n`;
  Array.from(patterns.keys())
    .sort()
    .forEach((patternName) => {
      const instances = patterns.get(patternName);
      report += `- **${patternName}** (${instances.length} instances)\n`;
    });

  // Important sections
  if (importantSections.length > 0) {
    report += `\n## Important Sections (${importantSections.length})\n\n`;
    importantSections.forEach((section) => {
      report += `- ${path.relative(process.cwd(), section.file)}:${section.line}`;
      if (section.context) {
        report += ` (context: ${section.context})`;
      }
      report += "\n";
    });
  }

  // Write report
  fs.writeFileSync(outputPath, report);
  console.log(chalk.green("✓ Generated summary report"));
}

// Main execution
function main() {
  console.log(chalk.blue("Parsing AI context annotations...\n"));

  // Find all source files
  const files = [];
  FILE_EXTENSIONS.forEach((pattern) => {
    const matches = glob.sync(pattern, {
      ignore: EXCLUDE_PATTERNS,
      nodir: true,
    });
    files.push(...matches);
  });

  console.log(chalk.yellow(`Found ${files.length} files to parse\n`));

  // Parse each file
  let processedCount = 0;
  files.forEach((file) => {
    try {
      parseFile(file);
      processedCount++;

      // Show progress
      if (processedCount % 100 === 0) {
        process.stdout.write(".");
      }
    } catch (error) {
      console.error(chalk.red(`\nError parsing ${file}: ${error.message}`));
    }
  });

  console.log(chalk.green(`\n\n✓ Parsed ${processedCount} files`));

  // Generate context files
  console.log(chalk.blue("\nGenerating context files..."));
  Array.from(contexts.keys()).forEach((contextName) => {
    generateContextFile(contextName);
  });

  // Generate IDE hints
  generateIDEHints();

  // Generate summary report
  generateSummaryReport();

  // Display summary
  console.log(chalk.green("\n✨ AI Context Parsing Complete!\n"));
  console.log(chalk.cyan("Summary:"));
  console.log(`  - Contexts discovered: ${contexts.size}`);
  console.log(`  - Patterns found: ${patterns.size}`);
  console.log(`  - Important sections: ${importantSections.length}`);
  console.log(`  - References tracked: ${references.size}`);

  // Suggest next steps
  if (contexts.size > 0) {
    console.log(chalk.yellow("\nNext steps:"));
    console.log(
      '  1. Use "npm run ai:focus [context-name]" to focus on specific contexts',
    );
    console.log("  2. Check .ai-context/summary.md for full analysis");
    console.log("  3. Use VS Code snippets for adding more annotations");
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  parseFile,
  generateContextFile,
  contexts,
  patterns,
  references,
};
