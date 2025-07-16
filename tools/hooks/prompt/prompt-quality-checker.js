#!/usr/bin/env node

/**
 * Prompt Quality Checker
 *
 * Detects vague prompts and suggests improvements
 * Helps lazy developers write better AI prompts
 */

const { HookRunner } = require("../lib");
const { PATTERNS, PROMPT_QUALITY, MESSAGES } = require("../lib/constants");

function promptQualityChecker(hookData, runner) {
  try {
    const startTime = Date.now();

    // Extract prompt/content from various places
    const prompt =
      hookData.prompt ||
      hookData.user_prompt ||
      hookData.instruction ||
      hookData.content ||
      "";

    if (!prompt) {
      return runner.allow();
    }

    // Check prompt length
    const promptLength = prompt.trim().length;

    if (promptLength < PROMPT_QUALITY.MIN_LENGTH) {
      // Check if it's a vague command
      const isVagueCommand = PATTERNS.VAGUE_PROMPTS.some((pattern) =>
        pattern.test(prompt.trim()),
      );

      if (isVagueCommand) {
        return runner.block(
          [
            "💭 Vague Prompt Detected",
            "",
            `❌ Your prompt: "${prompt.trim()}"`,
            "",
            "🎯 This prompt is too vague for good AI results.",
            "",
            "💡 Add specifics:",
            "  • What exactly needs to be done?",
            "  • Which files or components?",
            "  • What constraints or requirements?",
            "  • Any specific patterns to follow?",
            "",
            "📋 Better prompt examples:",
            '  ❌ "fix the bug"',
            '  ✅ "Fix the TypeError in Button.tsx line 45 where props.onClick might be undefined"',
            "",
            '  ❌ "update component"',
            '  ✅ "Update Header component to add dark mode toggle using Zustand state"',
            "",
            '  ❌ "improve performance"',
            '  ✅ "Optimize ProductList rendering by implementing React.memo and pagination"',
          ].join("\n"),
        );
      }

      // Warn about short prompts
      console.warn(
        [
          "",
          `⚠️  Short prompt detected (${promptLength} chars)`,
          "💡 More context = better AI results",
          "",
        ].join("\n"),
      );
    }

    // Check for missing context indicators
    const hasContext = PROMPT_QUALITY.CONTEXT_KEYWORDS.some((keyword) =>
      prompt.toLowerCase().includes(keyword),
    );

    const hasSpecificity = PROMPT_QUALITY.SPECIFICITY_KEYWORDS.some((keyword) =>
      prompt.toLowerCase().includes(keyword),
    );

    // Calculate quality score
    let qualityScore = 0;

    if (promptLength >= PROMPT_QUALITY.MIN_LENGTH) qualityScore += 25;
    if (promptLength >= PROMPT_QUALITY.GOOD_LENGTH) qualityScore += 25;
    if (hasContext) qualityScore += 25;
    if (hasSpecificity) qualityScore += 25;

    // Include file paths bonus
    if (
      prompt.includes("/") ||
      prompt.includes(".tsx") ||
      prompt.includes(".js")
    ) {
      qualityScore += 10;
    }

    // Store quality score for learning
    const state = require("../lib/state-manager").readState();
    const promptHistory = state.promptHistory || [];
    promptHistory.push({
      timestamp: Date.now(),
      length: promptLength,
      score: qualityScore,
    });

    // Keep last 50 prompts
    if (promptHistory.length > 50) {
      promptHistory.shift();
    }

    require("../lib/state-manager").updateState({ promptHistory });

    // Provide suggestions for low quality prompts
    if (qualityScore < 50 && promptLength > PROMPT_QUALITY.MIN_LENGTH) {
      const suggestions = [];

      if (!hasContext) {
        suggestions.push(
          '• Add context: "based on...", "following...", "using..."',
        );
      }

      if (!hasSpecificity) {
        suggestions.push(
          '• Be specific: "create...", "implement...", "fix..."',
        );
      }

      if (promptLength < PROMPT_QUALITY.GOOD_LENGTH) {
        suggestions.push(
          "• Add more details about requirements and constraints",
        );
      }

      if (suggestions.length > 0) {
        console.log(
          [
            "",
            "💡 Prompt Quality Tips:",
            ...suggestions,
            `📊 Quality score: ${qualityScore}/100`,
            "",
          ].join("\n"),
        );
      }
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(`Prompt check took ${executionTime}ms (target: <50ms)`);
    }

    return runner.allow();
  } catch (error) {
    console.error(`Prompt quality check failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("prompt-quality-checker", promptQualityChecker, {
  timeout: 50,
  priority: "medium",
  family: "prompt",
});
