#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { program } = require("commander");
const Handlebars = require("handlebars");
const chalk = require("chalk");

// Register Handlebars helpers
Handlebars.registerHelper("kebabCase", (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
});

Handlebars.registerHelper("camelCase", (str) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
});

Handlebars.registerHelper("pascalCase", (str) => {
  return str.
  split("-").
  map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).
  join("");
});

// Feature generator configuration
const config = {
  outputDir: process.env.FEATURES_DIR || "src/features",
  structure: {
    api: true,
    components: true,
    hooks: true,
    store: true,
    types: true,
    utils: true,
    tests: true
  }
};

// Template definitions
const templates = {
  // Main index file
  index: `// Feature: {{name}}
export * from './types';
export * from './components';
export * from './hooks';
export * from './api';
export * from './store';`,

  // Types definition
  types: `// {{name}} feature types

export interface {{pascalCase name}}State {
  loading: boolean;
  error: Error | null;
  data: {{pascalCase name}}Data | null;
}

export interface {{pascalCase name}}Data {
  id: string;
  // Add your data properties here
  createdAt: Date;
  updatedAt: Date;
}

export interface Create{{pascalCase name}}Dto {
  // Add creation fields here
}

export interface Update{{pascalCase name}}Dto {
  // Add update fields here
}

export type {{pascalCase name}}Action = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: {{pascalCase name}}Data }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'UPDATE'; payload: Partial<{{pascalCase name}}Data> }
  | { type: 'RESET' };`,

  // API service
  api: `import { 
  {{pascalCase name}}Data, 
  Create{{pascalCase name}}Dto, 
  Update{{pascalCase name}}Dto 
} from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export class {{pascalCase name}}Api {
  private static endpoint = \`\${API_BASE}/{{kebabCase name}}\`;

  static async getAll(): Promise<{{pascalCase name}}Data[]> {
    const response = await fetch(this.endpoint);
    if (!response.ok) {
      throw new Error(\`Failed to fetch {{name}}: \${response.statusText}\`);
    }
    return response.json();
  }

  static async getById(id: string): Promise<{{pascalCase name}}Data> {
    const response = await fetch(\`\${this.endpoint}/\${id}\`);
    if (!response.ok) {
      throw new Error(\`Failed to fetch {{name}}: \${response.statusText}\`);
    }
    return response.json();
  }

  static async create(data: Create{{pascalCase name}}Dto): Promise<{{pascalCase name}}Data> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(\`Failed to create {{name}}: \${response.statusText}\`);
    }
    return response.json();
  }

  static async update(id: string, data: Update{{pascalCase name}}Dto): Promise<{{pascalCase name}}Data> {
    const response = await fetch(\`\${this.endpoint}/\${id}\`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(\`Failed to update {{name}}: \${response.statusText}\`);
    }
    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(\`\${this.endpoint}/\${id}\`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(\`Failed to delete {{name}}: \${response.statusText}\`);
    }
  }
}`,

  // Store/Context
  store: `import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { {{pascalCase name}}State, {{pascalCase name}}Action } from '../types';

const initialState: {{pascalCase name}}State = {
  loading: false,
  error: null,
  data: null,
};

function {{camelCase name}}Reducer(
  state: {{pascalCase name}}State,
  action: {{pascalCase name}}Action
): {{pascalCase name}}State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE':
      return {
        ...state,
        data: state.data ? { ...state.data, ...action.payload } : null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface {{pascalCase name}}ContextValue {
  state: {{pascalCase name}}State;
  dispatch: React.Dispatch<{{pascalCase name}}Action>;
}

const {{pascalCase name}}Context = createContext<{{pascalCase name}}ContextValue | undefined>(undefined);

export function {{pascalCase name}}Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer({{camelCase name}}Reducer, initialState);

  return (
    <{{pascalCase name}}Context.Provider value={{"{{"}} state, dispatch }}>
      {children}
    </{{pascalCase name}}Context.Provider>
  );
}

export function use{{pascalCase name}}Context() {
  const context = useContext({{pascalCase name}}Context);
  if (!context) {
    throw new Error('use{{pascalCase name}}Context must be used within {{pascalCase name}}Provider');
  }
  return context;
}`,

  // Custom hooks
  hooks: `import { useCallback, useEffect } from 'react';
import { use{{pascalCase name}}Context } from '../store';
import { {{pascalCase name}}Api } from '../api';
import { Create{{pascalCase name}}Dto, Update{{pascalCase name}}Dto } from '../types';

export function use{{pascalCase name}}() {
  const { state, dispatch } = use{{pascalCase name}}Context();

  const fetch{{pascalCase name}} = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await {{pascalCase name}}Api.getById(id);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
    }
  }, [dispatch]);

  const create{{pascalCase name}} = useCallback(async (data: Create{{pascalCase name}}Dto) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await {{pascalCase name}}Api.create(data);
      dispatch({ type: 'FETCH_SUCCESS', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const update{{pascalCase name}} = useCallback(async (id: string, data: Update{{pascalCase name}}Dto) => {
    try {
      const result = await {{pascalCase name}}Api.update(id, data);
      dispatch({ type: 'UPDATE', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const delete{{pascalCase name}} = useCallback(async (id: string) => {
    try {
      await {{pascalCase name}}Api.delete(id);
      dispatch({ type: 'RESET' });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  return {
    ...state,
    fetch{{pascalCase name}},
    create{{pascalCase name}},
    update{{pascalCase name}},
    delete{{pascalCase name}},
  };
}

export function use{{pascalCase name}}List() {
  const { state, dispatch } = use{{pascalCase name}}Context();

  const fetchAll = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await {{pascalCase name}}Api.getAll();
      // For list view, we might want different state management
      // This is a simplified example
      dispatch({ type: 'FETCH_SUCCESS', payload: data[0] || null });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    ...state,
    refetch: fetchAll,
  };
}`,

  // Main component
  component: `import * as React from 'react';
import { {{pascalCase name}}Provider } from '../store';
import { use{{pascalCase name}} } from '../hooks';
import styles from './{{pascalCase name}}.module.css';

interface {{pascalCase name}}ViewProps {
  id?: string;
}

function {{pascalCase name}}Content({ id }: {{pascalCase name}}ViewProps) {
  const { data, loading, error, fetch{{pascalCase name}} } = use{{pascalCase name}}();

  React.useEffect(() => {
    if (id) {
      fetch{{pascalCase name}}(id);
    }
  }, [id, fetch{{pascalCase name}}]);

  if (loading) return <div className={styles.loading}>Loading {{name}}...</div>;
  if (error) return <div className={styles.error}>Error: {error.message}</div>;
  if (!data) return <div className={styles.empty}>No {{name}} data available</div>;

  return (
    <div className={styles.container}>
      <h2>{{pascalCase name}} Details</h2>
      <pre className={styles.data}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export function {{pascalCase name}}View(props: {{pascalCase name}}ViewProps) {
  return (
    <{{pascalCase name}}Provider>
      <{{pascalCase name}}Content {...props} />
    </{{pascalCase name}}Provider>
  );
}`,

  // Component styles
  componentStyles: `.container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.loading {
  background-color: #f0f0f0;
  color: #666;
}

.error {
  background-color: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.empty {
  background-color: #f5f5f5;
  color: #999;
}

.data {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.875rem;
}`,

  // Components index
  componentsIndex: `export { {{pascalCase name}}View } from './{{pascalCase name}}View';`,

  // API index
  apiIndex: `export { {{pascalCase name}}Api } from './{{camelCase name}}.api';`,

  // Hooks index
  hooksIndex: `export { use{{pascalCase name}}, use{{pascalCase name}}List } from './use{{pascalCase name}}';`,

  // Store index
  storeIndex: `export { {{pascalCase name}}Provider, use{{pascalCase name}}Context } from './{{camelCase name}}.store';`,

  // Types index
  typesIndex: `export * from './{{camelCase name}}.types';`,

  // Feature test
  test: `import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { {{pascalCase name}}View } from '../components/{{pascalCase name}}View';
import { {{pascalCase name}}Api } from '../api';

// Mock the API
jest.mock('../api');

describe('{{pascalCase name}} Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<{{pascalCase name}}View id="test-id" />);
    expect(screen.getByText('Loading {{name}}...')).toBeInTheDocument();
  });

  it('renders data when loaded', async () => {
    const mockData = {
      id: 'test-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    ({{pascalCase name}}Api.getById as jest.Mock).mockResolvedValueOnce(mockData);

    render(<{{pascalCase name}}View id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('{{pascalCase name}} Details')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    const errorMessage = 'Failed to load';
    ({{pascalCase name}}Api.getById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<{{pascalCase name}}View id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText(\`Error: \${errorMessage}\`)).toBeInTheDocument();
    });
  });

  it('renders empty state when no id provided', () => {
    render(<{{pascalCase name}}View />);
    expect(screen.getByText('No {{name}} data available')).toBeInTheDocument();
  });
});`,

  // README
  readme: `# {{pascalCase name}} Feature

This feature provides functionality for managing {{name}}.

## Structure

- \`api/\` - API service layer
- \`components/\` - React components
- \`hooks/\` - Custom React hooks
- \`store/\` - State management
- \`types/\` - TypeScript type definitions
- \`utils/\` - Utility functions
- \`__tests__/\` - Test files

## Usage

### Basic Usage

\`\`\`tsx
import { {{pascalCase name}}View } from '@/features/{{kebabCase name}}';

function App() {
  return <{{pascalCase name}}View id="123" />;
}
\`\`\`

### With Provider

\`\`\`tsx
import { {{pascalCase name}}Provider, use{{pascalCase name}} } from '@/features/{{kebabCase name}}';

function MyComponent() {
  const { data, loading, create{{pascalCase name}} } = use{{pascalCase name}}();
  
  // Use the hook functions
}

function App() {
  return (
    <{{pascalCase name}}Provider>
      <MyComponent />
    </{{pascalCase name}}Provider>
  );
}
\`\`\`

## API

### Hooks

- \`use{{pascalCase name}}()\` - Main hook for CRUD operations
- \`use{{pascalCase name}}List()\` - Hook for list operations

### API Service

- \`{{pascalCase name}}Api.getAll()\` - Fetch all items
- \`{{pascalCase name}}Api.getById(id)\` - Fetch single item
- \`{{pascalCase name}}Api.create(data)\` - Create new item
- \`{{pascalCase name}}Api.update(id, data)\` - Update existing item
- \`{{pascalCase name}}Api.delete(id)\` - Delete item

## Development

To extend this feature:

1. Add new types in \`types/\`
2. Extend API methods in \`api/\`
3. Add new components in \`components/\`
4. Create custom hooks in \`hooks/\`
5. Add tests in \`__tests__/\`
`
};

// Generate feature files
async function generateFeature(name, options) {
  logger.info(chalk.blue(`\n🚀 Generating feature: ${name}\n`));

  // Convert to kebab-case for directory name
  const featureDirName = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  const featureDir = path.join(config.outputDir, featureDirName);

  try {
    await fs.mkdir(featureDir, { recursive: true });
  } catch (error) {
    logger.error(chalk.red(`❌ Failed to create directory: ${error.message}`));
    process.exit(1);
  }

  // Create subdirectories
  const subdirs = Object.keys(config.structure).filter(
    (key) => config.structure[key]
  );
  for (const subdir of subdirs) {
    if (subdir === "tests") {
      await fs.mkdir(path.join(featureDir, "__tests__"), { recursive: true });
    } else {
      await fs.mkdir(path.join(featureDir, subdir), { recursive: true });
    }
  }

  // Context for templates
  const context = { name, kebabCase: featureDirName, pascalCase: name };

  // Files to generate
  const files = [
  { path: "index.ts", template: templates.index },
  { path: "README.md", template: templates.readme }];


  if (config.structure.types) {
    files.push(
      {
        path: `types/${context.kebabCase}.types.ts`,
        template: templates.types
      },
      { path: "types/index.ts", template: templates.typesIndex }
    );
  }

  if (config.structure.api) {
    files.push(
      { path: `api/${context.kebabCase}.api.ts`, template: templates.api },
      { path: "api/index.ts", template: templates.apiIndex }
    );
  }

  if (config.structure.store) {
    files.push(
      {
        path: `store/${context.kebabCase}.store.tsx`,
        template: templates.store
      },
      { path: "store/index.ts", template: templates.storeIndex }
    );
  }

  if (config.structure.hooks) {
    files.push(
      { path: `hooks/use${name}.ts`, template: templates.hooks },
      { path: "hooks/index.ts", template: templates.hooksIndex }
    );
  }

  if (config.structure.components) {
    files.push(
      { path: `components/${name}View.tsx`, template: templates.component },
      {
        path: `components/${name}.module.css`,
        template: templates.componentStyles
      },
      { path: "components/index.ts", template: templates.componentsIndex }
    );
  }

  if (config.structure.tests) {
    files.push({
      path: `__tests__/${context.kebabCase}.test.tsx`,
      template: templates.test
    });
  }

  // Generate each file
  for (const file of files) {
    const filePath = path.join(featureDir, file.path);

    // Skip if file exists and not forcing
    if (!options.force) {
      try {
        await fs.access(filePath);
        logger.info(chalk.yellow(`⚠️  Skipping ${file.path} (already exists)`));
        continue;
      } catch {}
    }

    // Compile and write template
    const compiledTemplate = Handlebars.compile(file.template);
    const content = compiledTemplate(context);

    try {
      await fs.writeFile(filePath, content);
      logger.info(chalk.green(`✅ Created ${file.path}`));
    } catch (error) {
      logger.error(
        chalk.red(`❌ Failed to create ${file.path}: ${error.message}`));

    }
  }

  // Success message
  logger.info(chalk.green(`\n✨ Feature ${name} generated successfully!\n`));
  logger.info(chalk.cyan("📁 Structure created:"));
  logger.info(chalk.gray(`   ${featureDir}/`));
  logger.info(chalk.gray(`   ├── api/`));
  logger.info(chalk.gray(`   ├── components/`));
  logger.info(chalk.gray(`   ├── hooks/`));
  logger.info(chalk.gray(`   ├── store/`));
  logger.info(chalk.gray(`   ├── types/`));
  logger.info(chalk.gray(`   ├── __tests__/`));
  logger.info(chalk.gray(`   ├── index.ts`));
  logger.info(chalk.gray(`   └── README.md`));

  logger.info(chalk.cyan("\n🎯 Next steps:"));
  logger.info(
    chalk.gray(
      `   1. Import feature: import { ${name}View } from '${path.relative(process.cwd(), featureDir)}';`
    ));

  logger.info(
    chalk.gray(`   2. Customize types in types/${context.kebabCase}.types.ts`));

  logger.info(chalk.gray(`   3. Implement API endpoints`));
  logger.info(chalk.gray(`   4. Run tests: npm test ${context.kebabCase}`));
}

// CLI setup
program.
name("generate-feature").
description(
  "Generate a complete feature module with API, components, hooks, and state management"
).
argument("<name>", "Feature name in PascalCase").
option("-f, --force", "Overwrite existing files").
option("-d, --dir <dir>", "Output directory", config.outputDir).
option("--no-api", "Skip API generation").
option("--no-components", "Skip components generation").
option("--no-hooks", "Skip hooks generation").
option("--no-store", "Skip store/context generation").
option("--no-tests", "Skip tests generation").
action(async (name, options) => {
  if (options.dir) {
    config.outputDir = options.dir;
  }

  // Update structure based on options
  Object.keys(options).forEach((key) => {
    if (key.startsWith("no") && key !== "noHelp") {
      const feature = key.substring(2).toLowerCase();
      if (feature in config.structure) {
        config.structure[feature] = false;
      }
    }
  });

  await generateFeature(name, options);
});

// Parse CLI arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}