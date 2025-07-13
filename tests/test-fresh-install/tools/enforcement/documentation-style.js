#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const glob = require("glob");
const { loadConfig, shouldBlock, logMetrics } = require('./enforcement-config');

// Banned phrases and patterns
const bannedPhrases = [
{
  pattern: /we'?re\s+excited\s+to/gi,
  suggestion: "Use neutral announcement language"
},
{
  pattern: /successfully\s+implemented/gi,
  suggestion: "State what was implemented without qualifier"
},
{
  pattern: /as\s+of\s+\w+\s+\d{4}/gi,
  suggestion: "Remove temporal references"
},
{
  pattern: /\b(perfect|perfectly)\b/gi,
  suggestion: 'Use "functional" or "complete"'
},
{
  pattern: /\b(amazing|amazingly)\b/gi,
  suggestion: "Use descriptive technical terms"
},
{
  pattern: /\b(excellent|excellently)\b/gi,
  suggestion: 'Use "effective" or "robust"'
},
{
  pattern: /\b(awesome|awesomely)\b/gi,
  suggestion: "Use professional language"
},
{ pattern: /\bcool\b/gi, suggestion: "Use technical descriptors" },
{ pattern: /\b(best|worst)\b/gi, suggestion: "Use objective comparisons" },
{
  pattern: /\bflawless(ly)?\b/gi,
  suggestion: 'Use "functional" or "tested"'
}];


// Status announcements to avoid
const statusAnnouncements = [
"COMPLETE",
"FIXED",
"DONE",
"FINISHED",
"FINAL",
"RESOLVED",
"SHIPPED",
"DELIVERED",
"RELEASED",
"READY"];


// Configuration
const config = {
  maxLineLength: 120,
  maxFileLength: 500,
  maxCodeBlockLength: 20
};

// Check a single markdown file
function checkMarkdownFile(filePath, content) {
  const violations = [];
  const lines = content.split("\n");

  // Check for banned phrases
  lines.forEach((line, index) => {
    bannedPhrases.forEach(({ pattern, suggestion }) => {
      const matches = line.match(pattern);
      if (matches) {
        violations.push({
          type: "Banned Phrase",
          file: filePath,
          line: index + 1,
          context:
          line.trim().substring(0, 80) + (line.length > 80 ? "..." : ""),
          issue: matches[0],
          suggestion
        });
      }
    });

    // Check for status announcements (not in code blocks or as part of other words)
    statusAnnouncements.forEach((status) => {
      const regex = new RegExp(`\\b${status}\\b`, "g");
      if (regex.test(line) && !line.includes("TODO") && !line.includes("```")) {
        violations.push({
          type: "Status Announcement",
          file: filePath,
          line: index + 1,
          context:
          line.trim().substring(0, 80) + (line.length > 80 ? "..." : ""),
          issue: status,
          suggestion: "Remove status announcements, use git commits for status"
        });
      }
    });

    // Check line length (not in code blocks)
    if (!isInCodeBlock(lines, index) && line.length > config.maxLineLength) {
      violations.push({
        type: "Line Too Long",
        file: filePath,
        line: index + 1,
        context: `Line has ${line.length} characters`,
        issue: `${line.substring(0, 50)}...`,
        suggestion: `Keep lines under ${config.maxLineLength} characters`
      });
    }
  });

  // Check file length
  if (lines.length > config.maxFileLength) {
    violations.push({
      type: "File Too Long",
      file: filePath,
      line: lines.length,
      context: `File has ${lines.length} lines`,
      issue: "Exceeds maximum file length",
      suggestion: `Split into multiple files (max ${config.maxFileLength} lines)`
    });
  }

  // Check structure
  const structure = analyzeStructure(content);

  if (!structure.hasTitle) {
    violations.push({
      type: "Missing Title",
      file: filePath,
      line: 1,
      context: "No H1 heading found",
      issue: "Missing main title",
      suggestion: "Add a title with # at the beginning"
    });
  }

  if (!structure.hasTableOfContents && lines.length > 100) {
    violations.push({
      type: "Missing Table of Contents",
      file: filePath,
      line: 1,
      context: `Long document (${lines.length} lines) without TOC`,
      issue: "No table of contents",
      suggestion: "Add ## Table of Contents section for long documents"
    });
  }

  // Check code blocks
  const codeBlocks = extractCodeBlocks(content);
  codeBlocks.forEach((block) => {
    if (block.lines > config.maxCodeBlockLength) {
      violations.push({
        type: "Code Block Too Long",
        file: filePath,
        line: block.startLine,
        context: `Code block has ${block.lines} lines`,
        issue: "Exceeds maximum code block length",
        suggestion: "Link to source file or split into smaller examples"
      });
    }

    if (!block.language) {
      violations.push({
        type: "Missing Language Specification",
        file: filePath,
        line: block.startLine,
        context: "Code block without language",
        issue: "```",
        suggestion: "Add language after ``` (e.g., ```javascript)"
      });
    }
  });

  return violations;
}

// Helper function to check if a line is inside a code block
function isInCodeBlock(lines, lineIndex) {
  let inBlock = false;
  for (let i = 0; i < lineIndex; i++) {
    if (lines[i].startsWith("```")) {
      inBlock = !inBlock;
    }
  }
  return inBlock;
}

// Analyze document structure
function analyzeStructure(content) {
  const lines = content.split("\n");
  return {
    hasTitle: lines.some((line) => /^#\s+[^#]/.test(line)),
    hasTableOfContents: lines.some(
      (line) =>
      /table of contents/i.test(line) ||
      /## Contents/i.test(line) ||
      /## TOC/i.test(line)
    ),
    headingLevels: lines.
    filter((line) => /^#+\s/.test(line)).
    map((line) => line.match(/^#+/)[0].length)
  };
}

// Extract code blocks with metadata
function extractCodeBlocks(content) {
  const blocks = [];
  const lines = content.split("\n");
  let inBlock = false;
  let blockStart = 0;
  let blockLines = 0;
  let language = "";

  lines.forEach((line, index) => {
    if (line.startsWith("```")) {
      if (!inBlock) {
        inBlock = true;
        blockStart = index + 1;
        blockLines = 0;
        language = line.substring(3).trim();
      } else {
        blocks.push({
          startLine: blockStart,
          lines: blockLines,
          language: language
        });
        inBlock = false;
      }
    } else if (inBlock) {
      blockLines++;
    }
  });

  return blocks;
}

// Main function
async function checkDocumentationStyle(specificFiles = []) {
  const config = loadConfig();

  // Get ignore patterns from config
  const baseIgnorePatterns = [
  "node_modules/**",
  "dist/**",
  "build/**",
  ".next/**",
  "coverage/**"];


  const ignorePatterns = config.checks.documentation.enabled ?
  [...baseIgnorePatterns, ...config.checks.documentation.ignorePatterns] :
  baseIgnorePatterns;

  const filesToCheck =
  specificFiles.length > 0 ?
  specificFiles.filter((f) => f.endsWith(".md")) :
  glob.sync("**/*.md", {
    ignore: ignorePatterns
  });

  let allViolations = [];

  for (const file of filesToCheck) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const violations = checkMarkdownFile(file, content);
      allViolations = allViolations.concat(violations);
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }

  // Log metrics regardless of blocking behavior
  logMetrics('documentation', allViolations, config);

  const shouldBlockCommit = shouldBlock('documentation', config);

  if (allViolations.length > 0) {
    const messageType = shouldBlockCommit ? "❌ Found documentation style violations:" : "⚠️  Documentation style warnings:";
    logger.error(chalk.red.bold(`\n${messageType}\n`));

    // Group by file
    const byFile = allViolations.reduce((acc, v) => {
      if (!acc[v.file]) acc[v.file] = [];
      acc[v.file].push(v);
      return acc;
    }, {});

    Object.entries(byFile).forEach(([file, violations]) => {
      logger.error(chalk.yellow.bold(`${file}:`));
      violations.forEach((v) => {
        logger.error(chalk.white(`  Line ${v.line}: ${v.type}`));
        if (v.issue) {
          logger.error(chalk.gray(`    Issue: "${v.issue}"`));
        }
        if (v.context && v.context !== v.issue) {
          logger.error(chalk.gray(`    Context: ${v.context}`));
        }
        logger.error(chalk.cyan(`    Fix: ${v.suggestion}`));
      });
      logger.error("");
    });

    logger.error(chalk.cyan.bold("📚 Documentation Best Practices:"));
    logger.error(chalk.white("  - Use neutral, professional language"));
    logger.error(
      chalk.white("  - Avoid temporal references and status announcements"));

    logger.error(chalk.white("  - Keep lines under 120 characters"));
    logger.error(
      chalk.white("  - Include language specifiers in code blocks"));

    logger.error(
      chalk.white("  - Add table of contents for long documents\n"));


    if (shouldBlockCommit) {
      logger.error(chalk.red.bold("🚫 Commit blocked due to documentation violations."));
      logger.error(chalk.yellow("💡 To change enforcement level: npm run enforcement:config set-level WARNING"));
      process.exit(1);
    } else {
      logger.error(chalk.yellow.bold("⏩ Commit proceeding with warnings."));
      logger.error(chalk.cyan("💡 To fix issues: Follow suggestions above"));
      logger.error(chalk.cyan("💡 To block on violations: npm run enforcement:config set-level FULL"));
    }
  } else {
    if (!specificFiles || specificFiles.length === 0) {
      logger.info(
        chalk.green("✅ All documentation follows style guidelines!"));

    }
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const files = args.filter((arg) => !arg.startsWith("-"));

  checkDocumentationStyle(files).catch((error) => {
    logger.error(chalk.red("Error checking documentation:"), error);
    process.exit(1);
  });
}

module.exports = { checkDocumentationStyle };