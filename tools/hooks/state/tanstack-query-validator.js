#!/usr/bin/env node

/**
 * tanstack-query-validator.js - Validates TanStack Query (React Query) best practices
 *
 * Validates:
 * - Query key patterns and consistency
 * - Query function patterns
 * - Mutation patterns
 * - Cache invalidation strategies
 * - Error handling patterns
 * - Optimistic updates
 */

const HookRunner = require("../lib/HookRunner");
const { FileAnalyzer, PatternLibrary } = require("../lib");

function tanstackQueryValidator(hookData, runner) {
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

  // Check for TanStack Query imports
  const hasTanstackImport =
    /import\s+.*\s+from\s+['"]@tanstack\/react-query['"]/.test(combinedContent);
  const hasLegacyImport = /import\s+.*\s+from\s+['"]react-query['"]/.test(
    combinedContent,
  );

  if (
    !hasTanstackImport &&
    !hasLegacyImport &&
    !combinedContent.includes("useQuery") &&
    !combinedContent.includes("useMutation")
  ) {
    return runner.allow();
  }

  // Check for legacy imports
  if (hasLegacyImport) {
    issues.push(
      `📦 Using legacy 'react-query' import\n   ✅ Update to '@tanstack/react-query'`,
    );
  }

  // Check query key patterns
  const queryKeyPatterns = [
    {
      pattern: /useQuery\s*\(\s*\[[^\]]*\+[^\]]*\]/g,
      message: "String concatenation in query keys",
      suggestion:
        'Use array format: ["users", userId] instead of ["users" + userId]',
    },
    {
      pattern: /useQuery\s*\(\s*['"`][^'"`]+['"`]\s*,/g,
      message: "Using string query key instead of array",
      suggestion:
        'Use array format for better cache management: ["queryName"] or ["queryName", param]',
    },
    {
      pattern: /queryKey:\s*\[[^\]]*Date\.now\(\)[^\]]*\]/g,
      message: "Using Date.now() in query keys prevents caching",
      suggestion:
        "Remove timestamps from query keys or use staleTime/cacheTime options",
    },
  ];

  for (const { pattern, message, suggestion } of queryKeyPatterns) {
    if (pattern.test(combinedContent)) {
      issues.push(`🔑 ${message}\n   ✅ ${suggestion}`);
    }
  }

  // Check query function patterns
  const queryFunctionPatterns = [
    {
      pattern:
        /useQuery\s*\([^)]*\{\s*queryFn:\s*async\s*\(\)\s*=>\s*\{[^}]*try\s*\{/g,
      check: (match) => {
        // Check if error is properly handled
        return !/catch/.test(match);
      },
      message: "Query function with try block but no catch",
      suggestion: "Let React Query handle errors or add proper error handling",
    },
    {
      pattern: /queryFn:\s*\(\)\s*=>\s*fetch\(/g,
      check: (match, context) => {
        // Check if response is checked
        const functionEnd = context.indexOf("}", context.indexOf(match));
        const functionContent = context.substring(
          context.indexOf(match),
          functionEnd,
        );
        return !(
          /\.ok/.test(functionContent) ||
          /response\.status/.test(functionContent)
        );
      },
      message: "Fetch without response validation",
      suggestion:
        "Check response.ok or handle HTTP errors: if (!response.ok) throw new Error(...)",
    },
  ];

  for (const { pattern, check, message, suggestion } of queryFunctionPatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`🔧 ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check mutation patterns
  const mutationPatterns = [
    {
      pattern:
        /useMutation\s*\([^)]*\{[^}]*onSuccess[^}]*\{[^}]*queryClient\.invalidateQueries\(/g,
      check: (match) => {
        // Check if invalidation is too broad
        return /invalidateQueries\s*\(\s*\)/.test(match);
      },
      message: "Invalidating all queries on mutation success",
      suggestion:
        'Invalidate specific queries: queryClient.invalidateQueries({ queryKey: ["specific"] })',
    },
    {
      pattern: /useMutation\s*\([^)]*\{[^}]*mutationFn[^}]*\}[^)]*\)/g,
      check: (match) => {
        // Check if error handling is missing
        return !/onError/.test(match);
      },
      message: "Mutation without error handling",
      suggestion: "Add onError handler for user feedback",
    },
  ];

  for (const { pattern, check, message, suggestion } of mutationPatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`🔄 ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check optimistic update patterns
  const optimisticPatterns = [
    {
      pattern: /onMutate[^}]*setQueryData\(/g,
      check: (match, context) => {
        // Check if previous data is saved
        const mutateBlock = context.substring(
          context.indexOf(match),
          context.indexOf("}", context.indexOf(match)) + 1,
        );
        return !/getQueryData|previousData|oldData/.test(mutateBlock);
      },
      message: "Optimistic update without saving previous data",
      suggestion:
        "Save previous data for rollback: const previousData = queryClient.getQueryData(queryKey)",
    },
    {
      pattern: /onError[^}]*setQueryData\(/g,
      check: (match, context) => {
        // Check if context is used
        const errorBlock = context.substring(
          context.indexOf(match),
          context.indexOf("}", context.indexOf(match)) + 1,
        );
        return !/context\.|ctx\./.test(errorBlock);
      },
      message: "Error handler not using context for rollback",
      suggestion:
        "Use context from onMutate: onError: (err, variables, context) => { ... }",
    },
  ];

  for (const { pattern, check, message, suggestion } of optimisticPatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`🎯 ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check configuration patterns
  const configPatterns = [
    {
      pattern: /staleTime:\s*0\s*[,}]/g,
      message: "Using staleTime: 0 causes excessive refetching",
      suggestion:
        "Set appropriate staleTime based on data freshness requirements",
    },
    {
      pattern: /retry:\s*(false|0)\s*[,}]/g,
      check: (match, context) => {
        // Check if it's a mutation (mutations shouldn't retry by default)
        const nearbyCode = context.substring(
          context.indexOf(match) - 200,
          context.indexOf(match),
        );
        return /useQuery/.test(nearbyCode);
      },
      message: "Disabling retry for queries may harm UX",
      suggestion: "Consider retry: 3 with retryDelay for network resilience",
    },
    {
      pattern: /refetchInterval:\s*\d{1,3}\s*[,}]/g,
      message: "Very short refetch interval detected",
      suggestion:
        "Consider WebSockets or Server-Sent Events for real-time data",
    },
  ];

  for (const { pattern, check, message, suggestion } of configPatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`⚙️ ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check TypeScript patterns
  if (file_path.match(/\.tsx?$/)) {
    const tsPatterns = [
      {
        pattern: /useQuery<([^,>]+)>/g,
        check: (match) => {
          // Check if using any type
          return /useQuery<any>/.test(match);
        },
        message: "Using any type for useQuery",
        suggestion: "Define proper types: useQuery<User[], Error>({ ... })",
      },
      {
        pattern: /useMutation\([^)]+\)/g,
        check: (match) => {
          // Check if mutation has type parameters
          return !/useMutation</.test(match);
        },
        message: "Mutation without type parameters",
        suggestion:
          "Add types: useMutation<TData, TError, TVariables, TContext>({ ... })",
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

  // Check error boundary patterns
  const errorBoundaryPatterns = [
    {
      pattern: /useQuery\([^)]*\{[^}]*throwOnError:\s*true/g,
      check: (match, context) => {
        // Check if component has error boundary
        const fileContent = context;
        return !/ErrorBoundary|useErrorBoundary/.test(fileContent);
      },
      message: "Using throwOnError without error boundary",
      suggestion:
        "Wrap component with QueryErrorResetBoundary or handle errors inline",
    },
  ];

  for (const { pattern, check, message, suggestion } of errorBoundaryPatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`🚨 ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Check suspense patterns
  const suspensePatterns = [
    {
      pattern: /useQuery\([^)]*\{[^}]*suspense:\s*true/g,
      check: (match, context) => {
        // Check if component is wrapped in Suspense
        const fileContent = context;
        return !/Suspense|useSuspenseQuery/.test(fileContent);
      },
      message: "Using suspense without Suspense boundary",
      suggestion: "Use useSuspenseQuery or wrap with <Suspense fallback={...}>",
    },
  ];

  for (const { pattern, check, message, suggestion } of suspensePatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(combinedContent)) !== null) {
      if (!check || check(match[0], combinedContent)) {
        issues.push(`⏳ ${message}\n   ✅ ${suggestion}`);
        break;
      }
    }
  }

  // Return results
  if (issues.length > 0) {
    const report = [
      "🔍 TanStack Query Issues Detected",
      "",
      ...issues,
      "",
      "📚 Best Practices:",
      "   • Use array format for query keys",
      "   • Handle errors appropriately",
      "   • Invalidate queries specifically",
      "   • Configure staleTime and cacheTime thoughtfully",
      "   • Use TypeScript for better type safety",
      "   • Implement optimistic updates correctly",
    ].join("\n");

    return runner.block(report);
  }

  return runner.allow();
}

// Create and run the hook
HookRunner.create("tanstack-query-validator", tanstackQueryValidator);
