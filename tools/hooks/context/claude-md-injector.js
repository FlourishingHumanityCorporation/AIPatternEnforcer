#!/usr/bin/env node

/**
 * CLAUDE.md Injector
 *
 * Auto-injects relevant CLAUDE.md sections based on file path
 * Ensures AI always has the right context for the task
 */

const { HookRunner } = require("../lib");
const { getCached, setCached } = require("../lib/state-manager");
const { readFileSync, existsSync } = require("fs");
const path = require("path");

// Map file patterns to relevant CLAUDE.md sections
const SECTION_MAPPINGS = {
  "components/": ["GENERATOR USAGE", "TESTING REQUIREMENTS"],
  "tools/hooks/": ["PRIMARY AI PROTECTION SYSTEM", "Hook Development"],
  "docs/": ["DOCUMENTATION STANDARDS", "Template Requirements"],
  "tests/": ["TESTING REQUIREMENTS", "Test Coverage"],
  "scripts/": ["DEBUGGING METHODOLOGY", "Arrow-Chain RCA"],
  "ai/": ["AI ASSISTANT INTEGRATION", "AI Tool Configuration"],
};

function claudeMdInjector(hookData, runner) {
  try {
    const startTime = Date.now();

    // Only inject for Write/Edit operations
    if (!["Write", "Edit", "MultiEdit"].includes(hookData.tool_name)) {
      return runner.allow();
    }

    const filePath = hookData.file_path || hookData.tool_input?.file_path;
    if (!filePath) {
      return runner.allow();
    }

    // Check if CLAUDE.md context already present
    const input = JSON.stringify(hookData).toLowerCase();
    if (input.includes("claude.md") || input.includes("@claude")) {
      return runner.allow(); // Already has context
    }

    // Find relevant sections based on file path
    const relevantSections = findRelevantSections(filePath);

    if (relevantSections.length > 0) {
      // Get cached CLAUDE.md content
      let claudeMdContent = getCached("claude-md-content");

      if (!claudeMdContent) {
        const claudeMdPath = path.join(process.cwd(), "CLAUDE.md");
        if (existsSync(claudeMdPath)) {
          claudeMdContent = readFileSync(claudeMdPath, "utf8");
          setCached("claude-md-content", claudeMdContent);
        }
      }

      if (claudeMdContent) {
        // Extract and inject relevant sections
        const sectionsToInject = extractSections(
          claudeMdContent,
          relevantSections,
        );

        if (sectionsToInject) {
          // Modify the hook data to prepend context
          const contextMessage = [
            "📋 Relevant CLAUDE.md context for this file:",
            "",
            sectionsToInject,
            "",
            "---",
            "",
          ].join("\n");

          // Log injection for debugging
          if (process.env.HOOK_VERBOSE === "true") {
            console.error(
              `Injecting ${relevantSections.length} CLAUDE.md sections for ${filePath}`,
            );
          }

          // Note: In a real implementation, we'd modify the prompt
          // For now, just warn the user to add context
          console.warn(
            [
              "💡 CLAUDE.md context suggested for this operation:",
              `   Sections: ${relevantSections.join(", ")}`,
              '   Run "npm run context" to ensure AI has full context',
            ].join("\n"),
          );
        }
      }
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Context injection took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`Context injection failed: ${error.message}`);
    return runner.allow();
  }
}

function findRelevantSections(filePath) {
  const sections = new Set();

  // Check each pattern
  for (const [pattern, sectionList] of Object.entries(SECTION_MAPPINGS)) {
    if (filePath.includes(pattern)) {
      sectionList.forEach((section) => sections.add(section));
    }
  }

  // Always include critical rules
  sections.add("CRITICAL RULES");

  return Array.from(sections);
}

function extractSections(content, sectionNames) {
  const extracted = [];

  sectionNames.forEach((sectionName) => {
    // Simple regex to find sections
    const regex = new RegExp(`^##.*${sectionName}.*$`, "mi");
    const match = content.match(regex);

    if (match) {
      const startIndex = match.index;
      // Find next section header
      const nextMatch = content
        .slice(startIndex + match[0].length)
        .match(/^##\s/m);
      const endIndex = nextMatch
        ? startIndex + match[0].length + nextMatch.index
        : content.length;

      const section = content.slice(startIndex, endIndex).trim();
      if (section.length < 1000) {
        // Keep sections reasonably sized
        extracted.push(section);
      } else {
        // Extract just the key points
        const lines = section.split("\n").slice(0, 15);
        extracted.push(lines.join("\n") + "\n... (truncated for brevity)");
      }
    }
  });

  return extracted.length > 0 ? extracted.join("\n\n") : null;
}

// Create and run the hook
HookRunner.create("claude-md-injector", claudeMdInjector, {
  timeout: 50,
  priority: "medium",
  family: "context",
});
