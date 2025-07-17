#!/usr/bin/env node

/**
 * tailwind-pattern-enforcer.js - Enforces Tailwind CSS utility-first patterns
 *
 * Validates:
 * - Utility-first CSS patterns
 * - Prevents CSS-in-JS mixing with Tailwind
 * - Ensures consistent spacing and sizing utilities
 * - Validates responsive breakpoint usage
 * - Prevents arbitrary value abuse
 * - Enforces design system compliance
 */

const HookRunner = require("../lib/HookRunner");
const { FileAnalyzer, PatternLibrary } = require("../lib");

function tailwindPatternEnforcer(hookData, runner) {
  const { tool_input } = hookData;
  const { file_path, content = "", new_string = "" } = tool_input;

  // Skip non-code files
  if (!FileAnalyzer.isCodeFile(file_path)) {
    return runner.allow();
  }

  // Skip non-React/JSX/TSX files
  if (!file_path.match(/\.(jsx?|tsx?)$/)) {
    return runner.allow();
  }

  const combinedContent = `${content} ${new_string}`;
  const issues = [];

  // Debug logging
  if (process.env.HOOK_VERBOSE === "true") {
    runner.logDebug(`Processing file: ${file_path}`);
    runner.logDebug(`Content length: ${combinedContent.length}`);
  }

  // Check for CSS-in-JS mixing with Tailwind
  const cssInJsPatterns = [
    {
      pattern: /styled\s*\.\s*\w+|styled\s*\(/gi,
      message: "Styled-components detected",
      suggestion: "Use Tailwind utility classes instead of CSS-in-JS",
    },
    {
      pattern: /css\s*=\s*\{[\s\S]*?\}/gi,
      message: "Inline CSS objects detected",
      suggestion: "Use Tailwind utility classes via className prop",
    },
    {
      pattern: /style\s*=\s*\{\{[\s\S]*?\}\}/gi,
      message: "Inline style prop detected",
      suggestion: "Use Tailwind utilities for styling",
    },
  ];

  for (const { pattern, message, suggestion } of cssInJsPatterns) {
    // Reset regex lastIndex to ensure proper matching
    pattern.lastIndex = 0;
    if (pattern.test(combinedContent)) {
      issues.push(`🎨 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for arbitrary value abuse
  const arbitraryValuePattern =
    /className\s*=\s*[`"']([^`"']*\[[^\]]+\][^`"']*)+[`"']/g;
  let match;
  let arbitraryCount = 0;

  while ((match = arbitraryValuePattern.exec(combinedContent)) !== null) {
    const classNames = match[1];
    const arbitraryValues = classNames.match(/\[[^\]]+\]/g) || [];
    arbitraryCount += arbitraryValues.length;

    if (arbitraryValues.length > 3) {
      issues.push(
        `🎨 Excessive arbitrary values in one element (${arbitraryValues.length} found)\n` +
          `   ✅ Consider creating custom utility classes or using design tokens`,
      );
    }
  }

  // Check for inconsistent spacing patterns
  const spacingPatterns = [
    {
      pattern: /(?:p|m|gap|space)-(?:\d+|px)/g,
      check: (matches) => {
        const hasPx = matches.some((m) => m.endsWith("-px"));
        const hasScale = matches.some((m) => /\d+$/.test(m));
        return hasPx && hasScale;
      },
      message: "Inconsistent spacing units (mixing px and scale values)",
      suggestion: "Use consistent Tailwind spacing scale (4, 8, 12, etc.)",
    },
  ];

  for (const { pattern, check, message, suggestion } of spacingPatterns) {
    const matches = combinedContent.match(pattern) || [];
    if (matches.length > 0 && check(matches)) {
      issues.push(`🎨 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for non-responsive patterns
  const layoutClasses =
    combinedContent.match(/(?:w|h|max-w|max-h|min-w|min-h)-\S+/g) || [];
  const responsiveLayouts =
    combinedContent.match(/(?:sm|md|lg|xl|2xl):/g) || [];

  if (layoutClasses.length > 5 && responsiveLayouts.length === 0) {
    issues.push(
      `📱 No responsive breakpoints detected despite layout utilities\n` +
        `   ✅ Add responsive variants (sm:, md:, lg:) for better mobile experience`,
    );
  }

  // Check for color inconsistency
  const colorPattern = /(?:text|bg|border|ring)-(?:\w+)-(?:\d+)/g;
  const colors = [
    ...new Set(
      (combinedContent.match(colorPattern) || []).map((c) => {
        const parts = c.split("-");
        return parts[1]; // Extract color name
      }),
    ),
  ];

  if (colors.length > 5) {
    issues.push(
      `🎨 Too many different colors used (${colors.length} found: ${colors.join(", ")})\n` +
        `   ✅ Stick to your design system color palette`,
    );
  }

  // Check for hardcoded values that should use theme
  const hardcodedPatterns = [
    {
      pattern: /(?:text|bg|border)-\[#[0-9a-fA-F]{3,6}\]/g,
      message: "Hardcoded hex colors detected",
      suggestion: "Use theme colors (e.g., bg-primary, text-secondary)",
    },
    {
      pattern: /(?:w|h)-\[\d+px\]/g,
      message: "Hardcoded pixel widths/heights",
      suggestion: "Use Tailwind sizing scale or percentages",
    },
  ];

  for (const { pattern, message, suggestion } of hardcodedPatterns) {
    if (pattern.test(combinedContent)) {
      issues.push(`🎨 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for utility order (helps with consistency)
  const classNamePattern = /className\s*=\s*[`"']([^`"']+)[`"']/g;
  const unorderedClasses = [];

  while ((match = classNamePattern.exec(combinedContent)) !== null) {
    const classes = match[1].split(/\s+/);
    const expectedOrder = [
      "layout",
      "spacing",
      "sizing",
      "typography",
      "colors",
      "effects",
    ];

    // Simplified check - just ensure modifiers come last
    const hasModifiersFirst = classes.some(
      (cls, idx) =>
        cls.includes(":") &&
        idx < classes.length - 1 &&
        !classes[idx + 1].includes(":"),
    );

    if (hasModifiersFirst) {
      unorderedClasses.push(match[1].substring(0, 30) + "...");
    }
  }

  if (unorderedClasses.length > 0) {
    issues.push(
      `🎨 Unordered utility classes detected\n` +
        `   ✅ Place responsive/state modifiers at the end for consistency`,
    );
  }

  // Return results
  if (issues.length > 0) {
    const report = [
      "🎨 Tailwind CSS Pattern Issues Detected",
      "",
      ...issues,
      "",
      "📚 Resources:",
      "   • Tailwind best practices: https://tailwindcss.com/docs/reusing-styles",
      "   • Utility ordering: https://github.com/tailwindlabs/prettier-plugin-tailwindcss",
    ].join("\n");

    return runner.block(report);
  }

  return runner.allow();
}

// Create and run the hook
HookRunner.create("tailwind-pattern-enforcer", tailwindPatternEnforcer);
