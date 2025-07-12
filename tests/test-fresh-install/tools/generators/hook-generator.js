#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { program } = require("commander");
const Handlebars = require("handlebars");
const chalk = require("chalk");

// Register Handlebars helpers
Handlebars.registerHelper("camelCase", (str) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
});

Handlebars.registerHelper("pascalCase", (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

// Hook generator configuration
const config = {
  outputDir: process.env.HOOKS_DIR || "src/hooks",
  fileExtensions: {
    typescript: ".ts",
    test: ".test.ts",
  },
};

// Template definitions
const templates = {
  // Standard hook template
  standard: `import { useState, useCallback, useEffect } from 'react';

export interface {{name}}Options {
  // Add your hook options here
  initialValue?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface {{name}}Return {
  // Add your return values here
  data: any;
  loading: boolean;
  error: Error | null;
  execute: () => void;
  reset: () => void;
}

/**
 * {{name}} - {{description}}
 * 
 * @param options - Hook configuration options
 * @returns Hook state and methods
 * 
 * @example
 * const { data, loading, error, execute } = {{name}}({
 *   onSuccess: (data) => console.log('Success:', data),
 *   onError: (error) => console.error('Error:', error),
 * });
 */
export function {{name}}(options: {{name}}Options = {}): {{name}}Return {
  const { initialValue = null, onSuccess, onError } = options;

  const [data, setData] = useState<any>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement your hook logic here
      const result = await new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 1000);
      });

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setData(initialValue);
    setLoading(false);
    setError(null);
  }, [initialValue]);

  useEffect(() => {
    // Cleanup function
    return () => {
      // Add any cleanup logic here
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}`,

  // Data fetching hook template
  fetch: `import { useState, useCallback, useEffect, useRef } from 'react';

export interface {{name}}Options<T = any> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  autoFetch?: boolean;
  cache?: boolean;
  cacheTime?: number; // in milliseconds
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface {{name}}Return<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetch: () => Promise<void>;
  refetch: () => Promise<void>;
  abort: () => void;
}

const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * {{name}} - {{description}}
 * 
 * @param options - Fetch configuration options
 * @returns Fetch state and methods
 * 
 * @example
 * const { data, loading, error, fetch } = {{name}}<User>({
 *   url: '/api/users/123',
 *   autoFetch: true,
 *   cache: true,
 *   cacheTime: 5 * 60 * 1000, // 5 minutes
 * });
 */
export function {{name}}<T = any>(options: {{name}}Options<T>): {{name}}Return<T> {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    autoFetch = false,
    cache: useCache = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback(() => {
    return \`\${method}:\${url}:\${JSON.stringify(body || {})}\`;
  }, [method, url, body]);

  const fetchData = useCallback(async (ignoreCache = false) => {
    // Check cache first
    if (useCache && !ignoreCache) {
      const cacheKey = getCacheKey();
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        onSuccess?.(cached.data);
        return;
      }
    }

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const result = await response.json();
      
      // Update cache
      if (useCache) {
        const cacheKey = getCacheKey();
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      setData(result);
      onSuccess?.(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, body, useCache, cacheTime, getCacheKey, onSuccess, onError]);

  const fetch = useCallback(() => fetchData(false), [fetchData]);
  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }

    return () => {
      abort();
    };
  }, [autoFetch]); // Only run on mount or when autoFetch changes

  return {
    data,
    loading,
    error,
    fetch,
    refetch,
    abort,
  };
}`,

  // Local storage hook template
  localStorage: `import { useState, useCallback, useEffect } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

export interface {{name}}Options<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  syncAcrossTabs?: boolean;
}

/**
 * {{name}} - {{description}}
 * 
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @param options - Hook configuration options
 * @returns [storedValue, setValue, removeValue]
 * 
 * @example
 * const [theme, setTheme, removeTheme] = {{name}}('theme', 'light', {
 *   syncAcrossTabs: true,
 * });
 */
export function {{name}}<T>(
  key: string,
  initialValue: T,
  options: {{name}}Options<T> = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncAcrossTabs = false,
  } = options;

  // Get value from localStorage or use initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.error(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  }, [key, initialValue, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Set value to localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === 'undefined') {
        console.warn(\`Tried to set localStorage key "\${key}" on server\`);
        return;
      }

      try {
        // Allow value to be a function
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save to state
        setStoredValue(valueToStore);
        
        // Save to localStorage
        window.localStorage.setItem(key, serializer(valueToStore));
        
        // Dispatch custom event for cross-tab sync
        if (syncAcrossTabs) {
          window.dispatchEvent(
            new CustomEvent('local-storage', {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.error(\`Error setting localStorage key "\${key}":\`, error);
      }
    },
    [key, storedValue, serializer, syncAcrossTabs]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      if (syncAcrossTabs) {
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, value: null },
          })
        );
      }
    } catch (error) {
      console.error(\`Error removing localStorage key "\${key}":\`, error);
    }
  }, [key, initialValue, syncAcrossTabs]);

  // Handle storage change events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserializer(e.newValue));
        } catch (error) {
          console.error(\`Error parsing localStorage value for key "\${key}":\`, error);
        }
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.key === key) {
        setStoredValue(customEvent.detail.value ?? initialValue);
      }
    };

    // Listen to storage events from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Listen to custom events from same tab
    if (syncAcrossTabs) {
      window.addEventListener('local-storage', handleCustomEvent);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (syncAcrossTabs) {
        window.removeEventListener('local-storage', handleCustomEvent);
      }
    };
  }, [key, initialValue, deserializer, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}`,

  // Test template
  test: `import { renderHook, act } from '@testing-library/react-hooks';
import { {{name}} } from './{{name}}';

describe('{{name}}', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => {{name}}());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state', async () => {
    const { result } = renderHook(() => {{name}}());

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle success state', async () => {
    const onSuccess = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      {{name}}({ onSuccess })
    );

    act(() => {
      result.current.execute();
    });

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
    expect(onSuccess).toHaveBeenCalledWith(result.current.data);
  });

  it('should handle error state', async () => {
    const onError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      {{name}}({ onError })
    );

    // Mock implementation to throw error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Test error'));

    act(() => {
      result.current.execute();
    });

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Test error');
    expect(onError).toHaveBeenCalledWith(result.current.error);
  });

  it('should reset state', () => {
    const { result } = renderHook(() => {{name}}({ initialValue: 'test' }));

    // Modify state
    act(() => {
      result.current.execute();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe('test');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => {{name}}());

    expect(() => {
      unmount();
    }).not.toThrow();
  });
});`,

  // Index file
  index: `export { {{name}} } from './{{name}}';
export type { {{name}}Options, {{name}}Return } from './{{name}}';`,
};

// Hook type templates
const hookTypes = {
  standard: {
    template: templates.standard,
    description: "Standard hook with state management",
  },
  fetch: {
    template: templates.fetch,
    description: "Data fetching hook with caching",
  },
  localStorage: {
    template: templates.localStorage,
    description: "Local storage hook with sync",
  },
};

// Generate hook files
async function generateHook(name, options) {
  console.log(chalk.blue(`\n🚀 Generating hook: ${name}\n`));

  // Ensure hook name starts with 'use'
  if (!name.startsWith("use")) {
    name = "use" + name.charAt(0).toUpperCase() + name.slice(1);
    console.log(chalk.yellow(`📝 Hook name adjusted to: ${name}`));
  }

  // Create hook directory
  const hookDir = path.join(config.outputDir, name);

  try {
    await fs.mkdir(hookDir, { recursive: true });
  } catch (error) {
    console.error(chalk.red(`❌ Failed to create directory: ${error.message}`));
    process.exit(1);
  }

  // Get template based on type
  const hookType = hookTypes[options.type] || hookTypes.standard;
  const hookTemplate = hookType.template;

  // Context for templates
  const context = {
    name,
    description: options.description || hookType.description,
  };

  // Files to generate
  const files = [
    {
      name: `${name}${config.fileExtensions.typescript}`,
      template: hookTemplate,
    },
    { name: `${name}${config.fileExtensions.test}`, template: templates.test },
    { name: "index.ts", template: templates.index },
  ];

  // Generate each file
  for (const file of files) {
    const filePath = path.join(hookDir, file.name);

    // Skip if file exists and not forcing
    if (!options.force) {
      try {
        await fs.access(filePath);
        console.log(chalk.yellow(`⚠️  Skipping ${file.name} (already exists)`));
        continue;
      } catch {}
    }

    // Compile and write template
    const compiledTemplate = Handlebars.compile(file.template);
    const content = compiledTemplate(context);

    try {
      await fs.writeFile(filePath, content);
      console.log(chalk.green(`✅ Created ${file.name}`));
    } catch (error) {
      console.error(
        chalk.red(`❌ Failed to create ${file.name}: ${error.message}`),
      );
    }
  }

  // Success message
  console.log(chalk.green(`\n✨ Hook ${name} generated successfully!\n`));
  console.log(chalk.cyan("📁 Files created:"));
  console.log(chalk.gray(`   ${hookDir}/`));
  files.forEach((file) => {
    console.log(chalk.gray(`   ├── ${file.name}`));
  });

  console.log(chalk.cyan("\n🎯 Next steps:"));
  console.log(
    chalk.gray(
      `   1. Import hook: import { ${name} } from '${path.relative(process.cwd(), hookDir)}';`,
    ),
  );
  console.log(chalk.gray(`   2. Implement hook logic`));
  console.log(chalk.gray(`   3. Update tests`));
  console.log(chalk.gray(`   4. Run tests: npm test ${name}`));

  if (options.type === "fetch") {
    console.log(chalk.gray(`   5. Configure API endpoint in the hook`));
  } else if (options.type === "localStorage") {
    console.log(chalk.gray(`   5. Define storage key and data structure`));
  }
}

// CLI setup
program
  .name("generate-hook")
  .description("Generate a React hook with TypeScript and tests")
  .argument("<name>", 'Hook name (will be prefixed with "use" if not present)')
  .option("-f, --force", "Overwrite existing files")
  .option("-d, --dir <dir>", "Output directory", config.outputDir)
  .option(
    "-t, --type <type>",
    "Hook type (standard, fetch, localStorage)",
    "standard",
  )
  .option("--description <desc>", "Hook description")
  .action(async (name, options) => {
    if (options.dir) {
      config.outputDir = options.dir;
    }
    await generateHook(name, options);
  });

// Parse CLI arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.cyan("\nHook Types:"));
  Object.entries(hookTypes).forEach(([type, info]) => {
    console.log(chalk.gray(`  ${type.padEnd(15)} - ${info.description}`));
  });
}
