#!/usr/bin/env node

/**
 * Prompt Improver
 *
 * Suggests improvements for common vague requests
 * Helps users write more effective prompts
 */

const { HookRunner } = require("../lib");
const { PATTERNS } = require("../lib/constants");

// Common vague requests and their improvements
const PROMPT_IMPROVEMENTS = {
  fix: {
    pattern: /^fix(\s+it)?$/i,
    suggestion:
      'Specify what to fix: "Fix the TypeError in [file] where [specific issue]"',
  },
  update: {
    pattern: /^update(\s+it)?$/i,
    suggestion:
      'Specify what to update: "Update [component] to [add feature/fix issue]"',
  },
  improve: {
    pattern: /^improve(\s+it)?$/i,
    suggestion: 'Specify improvements: "Improve [area] by [specific changes]"',
  },
  "make it work": {
    pattern: /^make\s+it\s+work$/i,
    suggestion:
      'Describe the issue: "Make [feature] work by fixing [specific problem]"',
  },
  optimize: {
    pattern: /^optimize(\s+it)?$/i,
    suggestion:
      'Specify optimization: "Optimize [component] rendering/performance by [method]"',
  },
  refactor: {
    pattern: /^refactor(\s+it)?$/i,
    suggestion:
      'Specify refactoring: "Refactor [code] to [use pattern/improve structure]"',
  },
  "add feature": {
    pattern: /^add\s+(a\s+)?feature$/i,
    suggestion:
      'Describe feature: "Add [feature name] that [does what] to [where]"',
  },
  debug: {
    pattern: /^debug(\s+it)?$/i,
    suggestion:
      'Describe issue: "Debug [error/behavior] in [component/file] when [condition]"',
  },
};

// Templates for common operations
const OPERATION_TEMPLATES = {
  component: `Create a [ComponentName] component that:
- Accepts props: [list key props]
- Displays: [what it shows]
- Handles: [user interactions]
- Uses: [styling approach]
Follow the existing component patterns in components/`,

  feature: `Implement [feature name] that:
- Allows users to: [user action]
- Integrates with: [existing systems]
- Stores data in: [where/how]
- Follows patterns from: [similar feature]`,

  bugfix: `Fix the [error type] in [file/component]:
- Error occurs when: [condition]
- Expected behavior: [what should happen]
- Current behavior: [what happens now]
- Error message: [paste if available]`,

  api: `Create API endpoint for [resource]:
- Method: [GET/POST/PUT/DELETE]
- Path: /api/[path]
- Input: [request schema]
- Output: [response schema]
- Validation: [rules]`,
};

function promptImprover(hookData, runner) {
  try {
    const startTime = Date.now();

    // Extract prompt
    const prompt = (
      hookData.prompt ||
      hookData.user_prompt ||
      hookData.instruction ||
      hookData.content ||
      ""
    ).trim();

    if (!prompt || prompt.length > 100) {
      return runner.allow(); // Only check short prompts
    }

    // Check for vague patterns
    let matchedImprovement = null;

    for (const [key, { pattern, suggestion }] of Object.entries(
      PROMPT_IMPROVEMENTS,
    )) {
      if (pattern.test(prompt)) {
        matchedImprovement = { key, suggestion };
        break;
      }
    }

    if (matchedImprovement) {
      // Detect what type of operation they might want
      const fileName = hookData.file_path || "";
      let template = "";

      if (fileName.includes("component")) {
        template = OPERATION_TEMPLATES.component;
      } else if (prompt.includes("bug") || prompt.includes("error")) {
        template = OPERATION_TEMPLATES.bugfix;
      } else if (prompt.includes("api") || fileName.includes("api")) {
        template = OPERATION_TEMPLATES.api;
      } else {
        template = OPERATION_TEMPLATES.feature;
      }

      return runner.block(
        [
          "✨ Prompt Improvement Suggested",
          "",
          `📝 Your prompt: "${prompt}"`,
          "",
          "❌ This prompt is too vague for optimal results.",
          "",
          `💡 ${matchedImprovement.suggestion}`,
          "",
          "📋 Try this template:",
          "```",
          template,
          "```",
          "",
          "✅ Benefits of specific prompts:",
          "  • AI understands exactly what you want",
          "  • Fewer iterations needed",
          "  • Better code quality",
          "  • Follows project patterns",
          "",
          "🎯 Pro tip: Include file paths, error messages, and examples!",
        ].join("\n"),
      );
    }

    // Check for missing key information
    const missingInfo = [];

    if (!prompt.includes("/") && !prompt.includes(".")) {
      missingInfo.push("file paths or names");
    }

    if (prompt.includes("error") && !prompt.includes("message")) {
      missingInfo.push("error message or stack trace");
    }

    if (prompt.includes("like") && !prompt.includes("example")) {
      missingInfo.push("specific example to follow");
    }

    if (missingInfo.length > 0) {
      console.warn(
        [
          "",
          "💡 Prompt Tip: Consider adding:",
          ...missingInfo.map((info) => `  • ${info}`),
          "",
        ].join("\n"),
      );
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(
        `Prompt improvement took ${executionTime}ms (target: <50ms)`,
      );
    }

    return runner.allow();
  } catch (error) {
    console.error(`Prompt improvement failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("prompt-improver", promptImprover, {
  timeout: 50,
  priority: "medium",
  family: "prompt",
});
