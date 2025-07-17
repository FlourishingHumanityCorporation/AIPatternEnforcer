#!/usr/bin/env node

/**
 * zustand-pattern-enforcer.js - Enforces Zustand state management best practices
 *
 * Validates:
 * - Proper store creation patterns
 * - Immer usage for immutability
 * - Selector patterns for performance
 * - Devtools integration
 * - Subscription patterns
 * - Middleware usage
 */

const HookRunner = require("../lib/HookRunner");
const { FileAnalyzer, PatternLibrary } = require("../lib");

function zustandPatternEnforcer(hookData, runner) {
  const { tool_input } = hookData;
  const { file_path, content = "", new_string = "" } = tool_input;

  // Skip non-code files
  if (!FileAnalyzer.isCodeFile(file_path)) {
    return runner.allow();
  }

  // Skip non-JS/TS files
  if (!file_path.match(/\.(jsx?|tsx?)$/)) {
    return runner.allow();
  }

  const combinedContent = `${content} ${new_string}`;
  const issues = [];

  // Check for Zustand imports to determine if this is a store file
  const hasZustandImport = /import\s+.*\s+from\s+['"]zustand['"]/.test(
    combinedContent,
  );
  if (
    !hasZustandImport &&
    !combinedContent.includes("useStore") &&
    !combinedContent.includes("create(")
  ) {
    return runner.allow();
  }

  // Check for anti-patterns in store creation
  const storePatterns = [
    {
      pattern: /create\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*state\s*=[^}]*\}/g,
      message: "Direct state mutation detected in Zustand store",
      suggestion:
        "Use Immer middleware for mutations: create(immer((set) => ({ ... })))",
    },
    {
      pattern: /create\s*\(\s*\(\s*\)\s*=>\s*\([^)]+\)\s*\)/g,
      message: "Store created without set/get functions",
      suggestion: "Use proper store creation: create((set, get) => ({ ... }))",
    },
    {
      pattern: /create<[^>]+>\s*\(\s*\)[^(]/g,
      message: "TypeScript store without proper typing",
      suggestion:
        "Define store interface: interface StoreState { ... } create<StoreState>()(...)",
    },
  ];

  for (const { pattern, message, suggestion } of storePatterns) {
    if (pattern.test(combinedContent)) {
      issues.push(`🏪 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for performance anti-patterns
  const performancePatterns = [
    {
      pattern: /useStore\s*\(\s*\)/g,
      check: (match, context) => {
        // Check if using entire store without selector
        const nearbyCode = context.substring(
          context.indexOf(match) - 50,
          context.indexOf(match) + 200,
        );
        return !/useStore\s*\(\s*\([^)]+\)\s*=>/.test(nearbyCode);
      },
      message:
        "Using entire store without selector causes unnecessary re-renders",
      suggestion:
        "Use selectors: const value = useStore((state) => state.specificValue)",
    },
    {
      pattern: /useStore\s*\(\s*\([^)]+\)\s*=>\s*\{[^}]+\}\s*\)/g,
      check: (match) => {
        // Check for object creation in selector
        return (
          /=>\s*\{[^}]*return\s*\{/.test(match) || /=>\s*\([^)]*\{/.test(match)
        );
      },
      message: "Creating new objects in selectors causes infinite re-renders",
      suggestion:
        "Use shallow equality check or memoize: useStore((state) => state.item, shallow)",
    },
  ];

  for (const { pattern, check, message, suggestion } of performancePatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`⚡ ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check for middleware patterns
  const middlewarePatterns = [
    {
      pattern: /localStorage\s*\.\s*setItem[^}]*useStore/g,
      message: "Manual localStorage sync detected",
      suggestion:
        'Use persist middleware: create(persist((set) => ({ ... }), { name: "store-key" }))',
    },
    {
      pattern: /console\.log.*state.*useStore/g,
      message: "Manual state logging detected",
      suggestion:
        "Use devtools middleware: create(devtools((set) => ({ ... })))",
    },
  ];

  for (const { pattern, message, suggestion } of middlewarePatterns) {
    if (pattern.test(combinedContent)) {
      issues.push(`🔧 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for proper TypeScript patterns
  if (file_path.match(/\.tsx?$/)) {
    const tsPatterns = [
      {
        pattern: /const\s+\w+\s*=\s*useStore\(/g,
        check: (match, context) => {
          // Check if type annotation is missing
          const varName = match.match(/const\s+(\w+)/)?.[1];
          if (!varName) return false;

          const typePattern = new RegExp(`const\\s+${varName}\\s*:`);
          return !typePattern.test(context);
        },
        message: "Missing type annotation for Zustand selector",
        suggestion:
          "Add explicit types: const value: string = useStore((state) => state.value)",
      },
      {
        pattern: /set\s*\(\s*\{[^}]+\}\s*\)/g,
        check: (match) => {
          // Check for any/unknown types in set calls
          return /:\s*(any|unknown)/.test(match);
        },
        message: "Using any/unknown types in state updates",
        suggestion: "Use proper types for all state properties",
      },
    ];

    for (const { pattern, check, message, suggestion } of tsPatterns) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(combinedContent)) !== null) {
        if (!check || check(match[0], combinedContent)) {
          issues.push(`📘 ${message}\n   ✅ ${suggestion}`);
          break;
        }
      }
    }
  }

  // Check for async patterns
  const asyncPatterns = [
    {
      pattern: /set\s*\(\s*async\s*\(/g,
      message: "Async function passed directly to set",
      suggestion:
        "Handle async operations outside set: const data = await fetch(); set({ data })",
    },
    {
      pattern: /create\s*\([^)]*async\s+function/g,
      message: "Async function in store creation",
      suggestion:
        "Create async actions separately: const fetchData = async () => { ... set(...) }",
    },
  ];

  for (const { pattern, message, suggestion } of asyncPatterns) {
    if (pattern.test(combinedContent)) {
      issues.push(`⏳ ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check for subscription patterns
  const subscriptionPatterns = [
    {
      pattern: /useEffect\s*\([^)]*useStore/g,
      check: (match, context) => {
        // Check if subscribing manually in useEffect
        const effectContent = context.substring(
          context.indexOf(match),
          context.indexOf(")", context.indexOf(match)) + 1,
        );
        return /subscribe/.test(effectContent);
      },
      message: "Manual subscription in useEffect",
      suggestion:
        "Use subscribe method outside components or subscribeWithSelector middleware",
    },
  ];

  for (const { pattern, check, message, suggestion } of subscriptionPatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`🔔 ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check for testing patterns
  const testingPatterns = [
    {
      pattern: /jest\.mock\s*\(\s*['"]zustand['"]/g,
      check: (match, context) => {
        // Check if mocking Zustand incorrectly
        return !/createStore/.test(context);
      },
      message: "Incorrect Zustand mocking for tests",
      suggestion:
        'Use zustand/testing utilities: import { createStore } from "zustand/testing"',
    },
  ];

  for (const { pattern, check, message, suggestion } of testingPatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`🧪 ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Return results
  if (issues.length > 0) {
    const report = [
      "🐻 Zustand Pattern Issues Detected",
      "",
      ...issues,
      "",
      "📚 Best Practices:",
      "   • Use selectors to prevent unnecessary re-renders",
      "   • Leverage middleware for common patterns (persist, devtools)",
      "   • Keep stores focused and composable",
      "   • Use TypeScript for better type safety",
      "   • Handle async operations outside of set calls",
    ].join("\n");

    return runner.block(report);
  }

  return runner.allow();
}

// Create and run the hook
HookRunner.create("zustand-pattern-enforcer", zustandPatternEnforcer);
