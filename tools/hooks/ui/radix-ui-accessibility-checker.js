#!/usr/bin/env node

/**
 * radix-ui-accessibility-checker.js - Ensures Radix UI components maintain accessibility standards
 *
 * Validates:
 * - ARIA attributes on Radix primitives
 * - Keyboard navigation implementation
 * - Focus management patterns
 * - Screen reader compatibility
 * - Proper use of asChild prop
 * - Role and semantic HTML usage
 */

const HookRunner = require("../lib/HookRunner");
const { FileAnalyzer, PatternLibrary } = require("../lib");

function radixUIAccessibilityChecker(hookData, runner) {
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

  // Check for missing ARIA labels on interactive elements
  const ariaPatterns = [
    {
      pattern: /<(Button|IconButton|Trigger)[^>]*>/g,
      check: (match) => {
        // Check if has aria-label or children with text
        const hasAriaLabel = /aria-label\s*=/i.test(match);
        const hasAriaLabelledBy = /aria-labelledby\s*=/i.test(match);
        const isSelfClosing = /\/>$/.test(match);

        // If self-closing without aria attributes, it's likely problematic
        return isSelfClosing && !hasAriaLabel && !hasAriaLabelledBy;
      },
      message: "Interactive element without accessible label",
      suggestion: "Add aria-label or aria-labelledby for screen readers",
    },
    {
      pattern: /<Dialog\.Close[^>]*>/g,
      check: (match) => !/aria-label\s*=/i.test(match),
      message: "Dialog close button without aria-label",
      suggestion: 'Add aria-label="Close" to Dialog.Close',
    },
    {
      pattern: /<(Popover|DropdownMenu|Select|Dialog)\.Content[^>]*>/g,
      check: (match) => {
        const hasAriaDescribedBy = /aria-describedby\s*=/i.test(match);
        const hasRole = /role\s*=/i.test(match);
        return false; // These usually have defaults, only check specific cases
      },
      message: "Content element may need additional ARIA attributes",
      suggestion: "Consider adding aria-describedby for complex content",
    },
  ];

  for (const { pattern, check, message, suggestion } of ariaPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (check(match[0])) {
        issues.push(`♿ ${message}\n   ✅ ${suggestion}`);
        break; // Report once per pattern
      }
    }
  }

  // Check for keyboard navigation patterns
  const keyboardPatterns = [
    {
      pattern: /<(Select|DropdownMenu|NavigationMenu)[^>]*>/g,
      check: (match, context) => {
        // Check if onKeyDown handlers are implemented nearby
        const componentStart = context.indexOf(match);
        const nearbyCode = context.substring(
          componentStart - 200,
          componentStart + 500,
        );
        const hasKeyHandler = /onKeyDown|onKeyPress|onKeyUp/i.test(nearbyCode);
        const hasRovingFocus = /roving|RovingFocus/i.test(nearbyCode);

        return false; // Radix handles this by default, only flag custom implementations
      },
      message: "Complex navigation component",
      suggestion: "Ensure keyboard navigation works with arrow keys",
    },
    {
      pattern: /onClick\s*=\s*{[^}]+}(?![\s\S]*onKeyDown)/g,
      check: (match) => {
        // Check if clickable element also has keyboard handler
        return !/Button|button|a\s|Link/.test(match);
      },
      message: "Click handler without keyboard support",
      suggestion:
        "Add onKeyDown handler for Enter/Space keys on custom clickable elements",
    },
  ];

  for (const { pattern, check, message, suggestion } of keyboardPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (check(match[0], combinedContent)) {
        issues.push(`⌨️  ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check for focus management
  const focusPatterns = [
    {
      pattern: /<(Modal|Dialog|Popover)[^>]*open\s*=\s*{/g,
      check: (match, context) => {
        const componentStart = context.indexOf(match);
        const nearbyCode = context.substring(
          componentStart,
          componentStart + 1000,
        );
        const hasFocusTrap = /FocusTrap|focusTrap|FocusScope/i.test(nearbyCode);
        const hasAutoFocus = /autoFocus/i.test(nearbyCode);

        return !hasFocusTrap && !hasAutoFocus;
      },
      message: "Modal component without focus management",
      suggestion: "Ensure focus is trapped within modal and returns on close",
    },
    {
      pattern: /autoFocus(?!\s*=\s*false)/g,
      message: "Using autoFocus can cause accessibility issues",
      suggestion:
        "Consider using focus management utilities or useEffect for controlled focus",
    },
  ];

  for (const { pattern, check, message, suggestion } of focusPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`🎯 ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check for asChild prop usage
  const asChildPatterns = [
    {
      pattern: /asChild[^>]*>\s*<(div|span|p)\s/g,
      message: "Using asChild with generic HTML elements",
      suggestion:
        "asChild works best with semantic elements like Button, Link, etc.",
    },
    {
      pattern: /asChild[^>]*>\s*<[^>]*onClick/g,
      check: (match) => {
        // Check if the child element is properly interactive
        return !/Button|button|a\s|Link/.test(match);
      },
      message: "asChild with non-semantic clickable element",
      suggestion:
        "Use semantic HTML elements (button, a) with asChild for better accessibility",
    },
  ];

  for (const { pattern, check, message, suggestion } of asChildPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0])) {
        issues.push(`🏗️  ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check for proper role usage
  const rolePatterns = [
    {
      pattern: /role\s*=\s*["']button["'][^>]*(?!tabIndex)/g,
      message: 'role="button" without tabIndex',
      suggestion: "Add tabIndex={0} to make element keyboard accessible",
    },
    {
      pattern: /role\s*=\s*["'](menu|listbox|combobox)["']/g,
      check: (match, context) => {
        const roleStart = context.indexOf(match);
        const nearbyCode = context.substring(roleStart - 100, roleStart + 300);
        const hasAriaAttrs = /aria-(expanded|haspopup|controls)/i.test(
          nearbyCode,
        );

        return !hasAriaAttrs;
      },
      message: "Complex role without required ARIA attributes",
      suggestion:
        "Add required ARIA attributes for the role (aria-expanded, aria-haspopup, etc.)",
    },
  ];

  for (const { pattern, check, message, suggestion } of rolePatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`🏷️  ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check for form accessibility
  const formPatterns = [
    {
      pattern:
        /<(Input|Textarea|Select)[^>]*(?!aria-label|aria-labelledby|id)/g,
      check: (match) => {
        // Check if it's not properly labeled
        return !/aria-label|aria-labelledby|id/.test(match);
      },
      message: "Form input without proper labeling",
      suggestion: "Connect inputs to labels using id/htmlFor or aria-label",
    },
    {
      pattern: /<(RadioGroup|Checkbox)[^>]*>/g,
      check: (match, context) => {
        const componentStart = context.indexOf(match);
        const nearbyCode = context.substring(
          componentStart,
          componentStart + 200,
        );
        const hasAriaLabel = /aria-label/i.test(nearbyCode);
        const hasLegend = /<legend/i.test(nearbyCode);

        return !hasAriaLabel && !hasLegend;
      },
      message: "Form group without accessible label",
      suggestion: "Add aria-label to RadioGroup or use fieldset with legend",
    },
    {
      pattern: /aria-invalid\s*=\s*{[^}]+}(?![\s\S]*aria-describedby)/g,
      message: "aria-invalid without error description",
      suggestion: "Add aria-describedby pointing to error message element",
    },
  ];

  for (const { pattern, check, message, suggestion } of formPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`📝 ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check for color contrast and visual indicators
  const visualPatterns = [
    {
      pattern: /(?:hover|focus):[^{};]*(?:bg-|text-)[^{};]*/g,
      check: (match) => {
        // Check if focus states have visible indicators beyond color
        const hasFocusRing =
          /focus:.*ring|focus:.*outline|focus-visible:/i.test(match);
        return !hasFocusRing && /focus:/.test(match);
      },
      message: "Focus state without visible outline",
      suggestion:
        "Add focus:ring or focus:outline for keyboard navigation visibility",
    },
    {
      pattern: /<Separator[^>]*>/g,
      check: (match) => !/aria-orientation/i.test(match),
      message: "Separator without orientation",
      suggestion:
        'Add aria-orientation="horizontal" or "vertical" to Separator',
    },
  ];

  for (const { pattern, check, message, suggestion } of visualPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0])) {
        issues.push(`👁️  ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Return results
  if (issues.length > 0) {
    const report = [
      "♿ Radix UI Accessibility Issues Detected",
      "",
      ...issues,
      "",
      "📚 Resources:",
      "   • Radix UI Accessibility: https://www.radix-ui.com/docs/primitives/overview/accessibility",
      "   • ARIA Authoring Guide: https://www.w3.org/WAI/ARIA/apg/",
      "   • Focus Management: https://www.radix-ui.com/docs/primitives/utilities/focus-scope",
    ].join("\n");

    return runner.block(report);
  }

  return runner.allow();
}

// Create and run the hook
HookRunner.create(
  "radix-ui-accessibility-checker",
  radixUIAccessibilityChecker,
);
