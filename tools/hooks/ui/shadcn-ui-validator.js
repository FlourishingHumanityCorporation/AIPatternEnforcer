#!/usr/bin/env node

/**
 * shadcn-ui-validator.js - Validates proper shadcn/ui component usage
 *
 * Validates:
 * - Proper component imports from @/components/ui
 * - Theme consistency with shadcn/ui design system
 * - Correct variant and size prop usage
 * - Component composition patterns
 * - Proper use of cn() utility for conditional classes
 * - Prevents modifying internal component structure
 */

const HookRunner = require("../lib/HookRunner");
const { FileAnalyzer, PatternLibrary } = require("../lib");

function shadcnUIValidator(hookData, runner) {
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

  // Check for incorrect import paths
  const importPatterns = [
    {
      pattern: /import\s+.*\s+from\s+['"]@radix-ui\/[^'"]+['"]/g,
      message: "Direct Radix UI imports detected",
      suggestion:
        "Import from @/components/ui/* instead for consistent theming",
    },
    {
      pattern: /import\s+.*\s+from\s+['"]@\/components\/ui\/primitives['"]/g,
      message: "Importing from internal primitives folder",
      suggestion: "Use the public component exports from @/components/ui/*",
    },
    {
      pattern: /import\s+.*\s+from\s+['"]\.\.\/ui\/[^'"]+['"]/g,
      message: "Relative imports to UI components",
      suggestion: "Use absolute imports: @/components/ui/*",
    },
  ];

  for (const { pattern, message, suggestion } of importPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(combinedContent)) {
      issues.push(`📦 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for cn() utility usage patterns
  const cnPatterns = [
    {
      pattern: /className\s*=\s*{[^}]*\?[^}]*:[^}]*}/g,
      message: "Ternary operators in className without cn()",
      suggestion:
        'Use cn() utility: className={cn(condition ? "class1" : "class2")}',
    },
    {
      pattern: /className\s*=\s*[`"'][^`"']*\$\{[^}]*\}[^`"']*[`"']/g,
      notPattern: /cn\s*\(/,
      message: "Template literals in className without cn()",
      suggestion: "Use cn() utility for dynamic classes",
    },
    {
      pattern: /clsx\s*\(/g,
      message: "Using clsx instead of cn",
      suggestion: "Use the cn() utility from @/lib/utils for consistency",
    },
  ];

  for (const { pattern, notPattern, message, suggestion } of cnPatterns) {
    pattern.lastIndex = 0;
    const matches = pattern.test(combinedContent);
    const hasNotPattern = notPattern ? notPattern.test(combinedContent) : false;

    if (matches && !hasNotPattern) {
      issues.push(`🎨 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for component modification anti-patterns
  const componentPatterns = [
    {
      pattern: /Button\s*=\s*styled\(/g,
      message: "Styling shadcn/ui components with styled-components",
      suggestion: "Use variant props or extend with cn() utility",
    },
    {
      pattern: /extends\s+Button/g,
      message: "Extending shadcn/ui components",
      suggestion: "Compose components instead of extending them",
    },
    {
      pattern: /<(Button|Card|Dialog|Select|Input)[^>]*style\s*=/g,
      message: "Inline styles on shadcn/ui components",
      suggestion: "Use className with Tailwind utilities or component variants",
    },
  ];

  for (const { pattern, message, suggestion } of componentPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(combinedContent)) {
      issues.push(`🚫 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for variant misuse
  const variantPatterns = [
    {
      pattern: /variant\s*=\s*['"][^'"]*['"]/g,
      check: (match) => {
        const variant = match.match(/variant\s*=\s*['"](.*?)['"]/)?.[1];
        const validVariants = [
          "default",
          "destructive",
          "outline",
          "secondary",
          "ghost",
          "link",
        ];
        return variant && !validVariants.includes(variant);
      },
      message: "Invalid variant prop value",
      suggestion:
        "Use valid variants: default, destructive, outline, secondary, ghost, link",
    },
    {
      pattern: /size\s*=\s*['"][^'"]*['"]/g,
      check: (match) => {
        const size = match.match(/size\s*=\s*['"](.*?)['"]/)?.[1];
        const validSizes = ["default", "sm", "lg", "icon"];
        return size && !validSizes.includes(size);
      },
      message: "Invalid size prop value",
      suggestion: "Use valid sizes: default, sm, lg, icon",
    },
  ];

  for (const { pattern, check, message, suggestion } of variantPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (check(match[0])) {
        issues.push(`⚠️  ${message}\n   ✅ ${suggestion}`);
        break; // Only report once per pattern
      }
    }
  }

  // Check for theme inconsistency
  const themePatterns = [
    {
      pattern: /colors:\s*{[^}]*primary:\s*{[^}]*}/g,
      message: "Customizing primary color directly",
      suggestion: "Use CSS variables in globals.css for theme customization",
    },
    {
      pattern: /theme\(\s*['"]colors\./g,
      message: "Using theme() function",
      suggestion: "Use CSS variables: var(--primary), var(--secondary), etc.",
    },
  ];

  for (const { pattern, message, suggestion } of themePatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(combinedContent)) {
      issues.push(`🎨 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for accessibility patterns with shadcn/ui
  const a11yPatterns = [
    {
      pattern: /<Button[^>]*>(?!.*<[^>]*>)[^<]*<\/Button>/g,
      check: (match) => {
        // Check if button has only text content (no icon) but no aria-label
        return !match.includes("aria-label") && !match.includes("Icon");
      },
      message: "Button without descriptive content or aria-label",
      suggestion: "Add descriptive text or aria-label for accessibility",
    },
    {
      pattern: /<Dialog[^>]*>/g,
      check: (match, content) => {
        // Check if Dialog is used without DialogContent
        const dialogMatch = content.indexOf(match);
        const nextContent = content.substring(dialogMatch, dialogMatch + 500);
        return !nextContent.includes("DialogContent");
      },
      message: "Dialog used without DialogContent",
      suggestion:
        "Always use Dialog with DialogContent for proper accessibility",
    },
  ];

  for (const { pattern, check, message, suggestion } of a11yPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (check(match[0], combinedContent)) {
        issues.push(`♿ ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Return results
  if (issues.length > 0) {
    const report = [
      "🎨 shadcn/ui Component Issues Detected",
      "",
      ...issues,
      "",
      "📚 Resources:",
      "   • shadcn/ui docs: https://ui.shadcn.com",
      "   • Component examples: https://ui.shadcn.com/examples",
      "   • Theming guide: https://ui.shadcn.com/docs/theming",
    ].join("\n");

    return runner.block(report);
  }

  return runner.allow();
}

// Create and run the hook
HookRunner.create("shadcn-ui-validator", shadcnUIValidator);
