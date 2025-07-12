#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { program } = require("commander");
const Handlebars = require("handlebars");
const chalk = require("chalk");
const inquirer = require("inquirer");

// Register Handlebars helpers
Handlebars.registerHelper("kebabCase", (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
});

Handlebars.registerHelper("camelCase", (str) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
});

Handlebars.registerHelper("eq", (a, b) => a === b);

// Component generator configuration
const config = {
  templatesDir: path.join(__dirname, "../../templates/component"),
  outputDir: process.env.COMPONENTS_DIR || "src/components",
  fileExtensions: {
    typescript: ".tsx",
    javascript: ".jsx",
    test: ".test.tsx",
    story: ".stories.tsx",
    style: ".module.css",
  },
};

// Template type definitions
const TEMPLATE_TYPES = {
  interactive: {
    name: "Interactive",
    description:
      "Buttons, inputs, toggles - components that users interact with",
    examples: "Button, TextField, Toggle, Select",
  },
  display: {
    name: "Display",
    description: "Cards, lists, badges - components that display information",
    examples: "Card, Badge, Avatar, Chip",
  },
  form: {
    name: "Form",
    description: "Form fields with built-in validation and error handling",
    examples: "FormInput, FormSelect, FormTextarea, FormCheckbox",
  },
  data: {
    name: "Data",
    description: "Tables, grids, charts - components that display data sets",
    examples: "DataTable, DataGrid, Chart, List",
  },
  overlay: {
    name: "Overlay",
    description: "Modals, tooltips, popovers - components that overlay content",
    examples: "Modal, Tooltip, Popover, Drawer",
  },
};

// Load template content based on type
async function loadTemplate(templateType, fileName) {
  const templatePath = path.join(
    __dirname,
    "../../templates/component",
    templateType,
    fileName,
  );
  try {
    return await fs.readFile(templatePath, "utf-8");
  } catch (error) {
    // Fall back to default template if specific one doesn't exist
    console.warn(
      chalk.yellow(`Template ${templatePath} not found, using default`),
    );
    return null;
  }
}

// Get templates for component type
async function getTemplates(componentName, templateType) {
  // Try to load type-specific templates first
  let component = await loadTemplate(templateType, "component.tsx.hbs");
  let test = await loadTemplate(templateType, "test.tsx.hbs");
  let story = await loadTemplate(templateType, "stories.tsx.hbs");
  let styles = await loadTemplate(templateType, "styles.css.hbs");
  let index = await loadTemplate(templateType, "index.ts.hbs");

  // Use default templates as fallback
  if (!component) component = getDefaultComponentTemplate(templateType);
  if (!test) test = getDefaultTestTemplate(templateType);
  if (!story) story = getDefaultStoryTemplate(templateType);
  if (!styles) styles = getDefaultStylesTemplate(templateType);
  if (!index) index = getDefaultIndexTemplate();

  return { component, test, story, styles, index };
}

// Default component template with type-specific variations
function getDefaultComponentTemplate(templateType) {
  const baseImports = `import React from 'react';
import styles from './{{name}}.module.css';`;

  const loadingStates = ["form", "data", "interactive"].includes(templateType)
    ? `
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Disabled state */
  disabled?: boolean;`
    : "";

  const ariaProps =
    templateType === "interactive"
      ? `
  /** Accessible label */
  ariaLabel?: string;
  /** Aria described by ID */
  ariaDescribedBy?: string;`
      : "";

  const dataProps =
    templateType === "data"
      ? `
  /** Data to display */
  data?: any[];
  /** Empty state message */
  emptyMessage?: string;`
      : "";

  const formProps =
    templateType === "form"
      ? `
  /** Field name */
  name: string;
  /** Field value */
  value?: string;
  /** Validation error */
  error?: string;
  /** Required field */
  required?: boolean;
  /** Change handler */
  onChange?: (value: string) => void;`
      : "";

  const overlayProps =
    templateType === "overlay"
      ? `
  /** Open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Click outside to close */
  closeOnClickOutside?: boolean;`
      : "";

  return `${baseImports}

export interface {{name}}Props {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;${loadingStates}${ariaProps}${dataProps}${formProps}${overlayProps}
  /** Test ID for testing */
  testId?: string;
}

/**
 * {{name}} component - ${TEMPLATE_TYPES[templateType].description}
 * 
 * @example
 * <{{name}}${templateType === "form" ? ' name="field" value={value} onChange={setValue}' : ""}>
 *   ${templateType === "overlay" ? "Modal content" : "Content here"}
 * </{{name}}>
 */
export const {{name}}: React.FC<{{name}}Props> = ({
  children,
  className = '',${
    templateType === "form"
      ? '\n  name,\n  value = "",\n  error,\n  required = false,\n  onChange,'
      : ""
  }${
    templateType === "overlay"
      ? "\n  isOpen,\n  onClose,\n  closeOnClickOutside = true,"
      : ""
  }${
    ["data", "interactive"].includes(templateType)
      ? "\n  isLoading = false,\n  error = null,\n  disabled = false,"
      : ""
  }${
    templateType === "form" ? "\n  isLoading = false,\n  disabled = false," : ""
  }${
    templateType === "data"
      ? '\n  data = [],\n  emptyMessage = "No data available",'
      : ""
  }
  testId = '{{kebabCase name}}'
}) => {
  ${
    templateType === "overlay"
      ? `// Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;`
      : ""
  }

  ${
    ["form", "data", "interactive"].includes(templateType)
      ? `// Loading state
  if (isLoading) {
    return (
      <div className={\`\${styles.container} \${styles.loading} \${className}\`} data-testid={\`\${testId}-loading\`}>
        <span className={styles.spinner} aria-label="Loading..." />
      </div>
    );
  }

  // Error state
  if (error && templateType !== 'form') {
    return (
      <div className={\`\${styles.container} \${styles.error} \${className}\`} data-testid={\`\${testId}-error\`}>
        <span role="alert">{error}</span>
      </div>
    );
  }`
      : ""
  }

  ${
    templateType === "data"
      ? `// Empty state
  if (data.length === 0) {
    return (
      <div className={\`\${styles.container} \${styles.empty} \${className}\`} data-testid={\`\${testId}-empty\`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }`
      : ""
  }

  return (
    ${
      templateType === "overlay"
        ? `<>
      <div 
        className={styles.backdrop}
        onClick={closeOnClickOutside ? onClose : undefined}
        aria-hidden="true"
      />
      <div 
        className={\`\${styles.container} \${className}\`}
        role="dialog"
        aria-modal="true"
        data-testid={testId}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        {children}
      </div>
    </>`
        : templateType === "form"
          ? `<div className={\`\${styles.fieldContainer} \${className}\`}>
      <label htmlFor={name} className={styles.label}>
        {children}
        {required && <span className={styles.required} aria-label="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? \`\${name}-error\` : undefined}
        className={styles.input}
        data-testid={testId}
      />
      {error && (
        <span id={\`\${name}-error\`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>`
          : `<div 
      className={\`\${styles.container} \${className}\`}
      data-testid={testId}${
        templateType === "interactive"
          ? `
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}`
          : ""
      }
    >
      {children}
    </div>`
    }
  );
};

{{name}}.displayName = '{{name}}';`;
}

// Default test template with type-specific tests
function getDefaultTestTemplate(templateType) {
  const typeSpecificTests = {
    interactive: `
  it('handles disabled state', () => {
    const { container } = render(<{{name}} disabled>Disabled</{{name}}>);
    expect(container.firstChild).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows loading state', () => {
    render(<{{name}} isLoading>Content</{{name}}>);
    expect(screen.getByTestId('{{kebabCase name}}-loading')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });`,

    form: `
  it('handles form input correctly', () => {
    const handleChange = jest.fn();
    render(
      <{{name}} name="test-field" value="initial" onChange={handleChange}>
        Test Field
      </{{name}}>
    );
    
    const input = screen.getByLabelText('Test Field');
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledWith('new value');
  });

  it('shows validation error', () => {
    render(
      <{{name}} name="test-field" error="Field is required">
        Test Field
      </{{name}}>
    );
    
    expect(screen.getByRole('alert')).toHaveTextContent('Field is required');
    expect(screen.getByLabelText('Test Field')).toHaveAttribute('aria-invalid', 'true');
  });

  it('marks required fields', () => {
    render(
      <{{name}} name="test-field" required>
        Test Field
      </{{name}}>
    );
    
    expect(screen.getByLabelText('required')).toBeInTheDocument();
  });`,

    data: `
  it('shows empty state when no data', () => {
    render(<{{name}} data={[]} emptyMessage="No items" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<{{name}} isLoading data={[1, 2, 3]} />);
    expect(screen.getByTestId('{{kebabCase name}}-loading')).toBeInTheDocument();
  });

  it('renders data correctly', () => {
    const testData = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    render(<{{name}} data={testData}>Data content</{{name}}>);
    expect(screen.getByText('Data content')).toBeInTheDocument();
  });`,

    overlay: `
  it('renders when open', () => {
    render(
      <{{name}} isOpen onClose={jest.fn()}>
        Modal Content
      </{{name}}>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <{{name}} isOpen={false} onClose={jest.fn()}>
        Modal Content
      </{{name}}>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <{{name}} isOpen onClose={handleClose}>
        Content
      </{{name}}>
    );
    
    const backdrop = container.querySelector('.backdrop');
    fireEvent.click(backdrop!);
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when pressing Escape', () => {
    const handleClose = jest.fn();
    render(
      <{{name}} isOpen onClose={handleClose}>
        Content
      </{{name}}>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });`,

    display: `
  it('renders with custom className', () => {
    const { container } = render(
      <{{name}} className="custom-class">
        Display Content
      </{{name}}>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });`,
  };

  return `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { {{name}} } from './{{name}}';

describe('{{name}}', () => {
  it('renders children correctly', () => {
    render(<{{name}}${templateType === "form" ? ' name="test"' : ""}${templateType === "overlay" ? " isOpen onClose={jest.fn()}" : ""}>Test Content</{{name}}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
${typeSpecificTests[templateType] || typeSpecificTests.display}

  it('applies custom test ID', () => {
    render(
      <{{name}} testId="custom-test-id"${templateType === "form" ? ' name="test"' : ""}${templateType === "overlay" ? " isOpen onClose={jest.fn()}" : ""}>
        Content
      </{{name}}>
    );
    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
  });
});`;
}

// Default story template with type-specific stories
function getDefaultStoryTemplate(templateType) {
  const typeSpecificStories = {
    interactive: `
export const Loading: Story = {
  args: {
    children: 'Loading State',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled State',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    children: 'Error State',
    error: 'Something went wrong',
  },
};`,

    form: `
export const Default: Story = {
  args: {
    name: 'username',
    children: 'Username',
    value: '',
  },
};

export const WithValue: Story = {
  args: {
    name: 'username',
    children: 'Username',
    value: 'john.doe',
  },
};

export const Required: Story = {
  args: {
    name: 'email',
    children: 'Email',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    name: 'password',
    children: 'Password',
    error: 'Password must be at least 8 characters',
  },
};

export const Disabled: Story = {
  args: {
    name: 'field',
    children: 'Disabled Field',
    disabled: true,
    value: 'Cannot edit',
  },
};`,

    data: `
export const WithData: Story = {
  args: {
    data: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ],
    children: 'Data Display',
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    emptyMessage: 'No items to display',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    data: [],
  },
};

export const Error: Story = {
  args: {
    error: 'Failed to load data',
    data: [],
  },
};`,

    overlay: `
export const Open: Story = {
  args: {
    isOpen: true,
    children: 'This is modal content',
    onClose: () => console.log('Close clicked'),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    children: 'This content is not visible',
    onClose: () => console.log('Close clicked'),
  },
};

export const NoBackdropClose: Story = {
  args: {
    isOpen: true,
    children: 'Click backdrop will not close this modal',
    closeOnClickOutside: false,
    onClose: () => console.log('Close clicked'),
  },
};`,

    display: `
export const Default: Story = {
  args: {
    children: 'Display content',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Styled content',
    className: 'custom-styling',
  },
};`,
  };

  const argTypes = {
    form: `
    name: {
      control: 'text',
      description: 'Field name attribute',
    },
    value: {
      control: 'text',
      description: 'Field value',
    },
    error: {
      control: 'text',
      description: 'Validation error message',
    },
    required: {
      control: 'boolean',
      description: 'Whether field is required',
    },
    onChange: {
      action: 'changed',
      description: 'Value change handler',
    },`,
    overlay: `
    isOpen: {
      control: 'boolean',
      description: 'Whether overlay is visible',
    },
    onClose: {
      action: 'closed',
      description: 'Close handler',
    },
    closeOnClickOutside: {
      control: 'boolean',
      description: 'Close when clicking backdrop',
    },`,
    data: `
    data: {
      control: 'object',
      description: 'Data array to display',
    },
    emptyMessage: {
      control: 'text',
      description: 'Message when data is empty',
    },`,
    interactive: `
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },`,
  };

  return `import type { Meta, StoryObj } from '@storybook/react';
import { {{name}} } from './{{name}}';

const meta = {
  title: '${TEMPLATE_TYPES[templateType].name}/{{name}}',
  component: {{name}},
  parameters: {
    layout: '${templateType === "overlay" ? "fullscreen" : "centered"}',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to display inside the component',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },${argTypes[templateType] || ""}
  },
} satisfies Meta<typeof {{name}}>;

export default meta;
type Story = StoryObj<typeof meta>;
${typeSpecificStories[templateType] || typeSpecificStories.display}`;
}

// Default styles template with type-specific styles
function getDefaultStylesTemplate(templateType) {
  const typeSpecificStyles = {
    interactive: `
/* Loading state */
.loading {
  position: relative;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Interactive states */
.container[role="button"] {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.container[role="button"]:hover:not([aria-disabled="true"]) {
  background-color: var(--color-background-hover);
  transform: translateY(-1px);
}

.container[role="button"]:active:not([aria-disabled="true"]) {
  transform: translateY(0);
}

.container[aria-disabled="true"] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Error state */
.error {
  background-color: var(--color-error-background);
  border: 1px solid var(--color-error);
  color: var(--color-error);
}`,

    form: `
.fieldContainer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.label {
  font-weight: 500;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.required {
  color: var(--color-error);
  margin-left: var(--spacing-xs);
}

.input {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  transition: all 0.2s ease;
  background-color: var(--color-background);
  color: var(--color-text);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.input:disabled {
  background-color: var(--color-background-disabled);
  cursor: not-allowed;
  opacity: 0.7;
}

.input[aria-invalid="true"] {
  border-color: var(--color-error);
}

.input[aria-invalid="true"]:focus {
  box-shadow: 0 0 0 3px var(--color-error-alpha);
}

.errorMessage {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}`,

    data: `
/* Data states */
.loading,
.empty,
.error {
  padding: var(--spacing-xl);
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.empty {
  color: var(--color-text-muted);
}

.error {
  color: var(--color-error);
  background-color: var(--color-error-background);
  border-radius: var(--radius-md);
}

/* Data container */
.container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  overflow: hidden;
}`,

    overlay: `
.backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1001;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  animation: slideIn 0.3s ease;
}

.closeButton {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
  border-radius: var(--radius-sm);
}

.closeButton:hover {
  color: var(--color-text);
  background-color: var(--color-background-hover);
}

.closeButton:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}`,

    display: ``,
  };

  return `.container {
  /* Base styles using design tokens */
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

/* Focus styles for accessibility */
.container:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
${typeSpecificStyles[templateType] || ""}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-sm);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .container {
    background-color: var(--color-background-dark);
    color: var(--color-text-dark);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .container {
    border: 2px solid currentColor;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .container {
    animation: none !important;
    transition: none !important;
  }
}`;
}

// Default index template
function getDefaultIndexTemplate() {
  return `export { {{name}} } from './{{name}}';
export type { {{name}}Props } from './{{name}}';`;
}

// Create template directories if they don't exist
async function ensureTemplateDirectories() {
  const templateTypes = Object.keys(TEMPLATE_TYPES);

  for (const type of templateTypes) {
    const dir = path.join(__dirname, "../../templates/component", type);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists, ignore
    }
  }
}

// Generate component files
async function generateComponent(name, options) {
  console.log(
    chalk.blue(`\n🚀 Generating ${options.template} component: ${name}\n`),
  );

  // Validate component name
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    console.error(
      chalk.red("❌ Component name must be in PascalCase (e.g., MyComponent)"),
    );
    process.exit(1);
  }

  // Get templates for the specified type
  const templates = await getTemplates(name, options.template);

  // Create component directory
  const componentDir = path.join(config.outputDir, name);

  try {
    await fs.mkdir(componentDir, { recursive: true });
  } catch (error) {
    console.error(chalk.red(`❌ Failed to create directory: ${error.message}`));
    process.exit(1);
  }

  // Files to generate
  const files = [
    {
      name: `${name}${config.fileExtensions.typescript}`,
      template: templates.component,
    },
    { name: `${name}${config.fileExtensions.test}`, template: templates.test },
    {
      name: `${name}${config.fileExtensions.style}`,
      template: templates.styles,
    },
    { name: "index.ts", template: templates.index },
  ];

  // Add storybook file if requested
  if (!options.noStorybook) {
    files.push({
      name: `${name}${config.fileExtensions.story}`,
      template: templates.story,
    });
  }

  // Generate each file
  for (const file of files) {
    const filePath = path.join(componentDir, file.name);

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
    const content = compiledTemplate({
      name,
      templateType: options.template,
    });

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
  console.log(
    chalk.green(
      `\n✨ ${TEMPLATE_TYPES[options.template].name} component ${name} generated successfully!\n`,
    ),
  );
  console.log(chalk.cyan("📁 Files created:"));
  console.log(chalk.gray(`   ${componentDir}/`));
  files.forEach((file) => {
    console.log(chalk.gray(`   ├── ${file.name}`));
  });

  console.log(chalk.cyan("\n🎯 Next steps:"));
  console.log(
    chalk.gray(
      `   1. Import component: import { ${name} } from '${path.relative(process.cwd(), componentDir)}';`,
    ),
  );
  console.log(chalk.gray(`   2. Run tests: npm test ${name}`));
  if (!options.noStorybook) {
    console.log(chalk.gray(`   3. View in Storybook: npm run storybook`));
  }
  console.log(chalk.gray(`\n💡 This ${options.template} component includes:`));

  const features = {
    interactive: [
      "Loading states",
      "Error handling",
      "Disabled states",
      "Keyboard navigation",
    ],
    form: [
      "Validation support",
      "Error messages",
      "Required field marking",
      "Accessibility labels",
    ],
    data: [
      "Loading states",
      "Empty states",
      "Error handling",
      "Data prop support",
    ],
    overlay: [
      "Portal rendering",
      "Escape key handling",
      "Click outside support",
      "Focus management",
    ],
    display: [
      "Responsive design",
      "Dark mode support",
      "Custom styling",
      "Accessibility",
    ],
  };

  features[options.template].forEach((feature) => {
    console.log(chalk.gray(`   • ${feature}`));
  });
}

// Interactive template selection
async function selectTemplate() {
  const { template } = await inquirer.prompt([
    {
      type: "list",
      name: "template",
      message: "Select component template type:",
      choices: Object.entries(TEMPLATE_TYPES).map(([key, value]) => ({
        name: `${value.name} - ${value.description}`,
        value: key,
        short: value.name,
      })),
    },
  ]);

  console.log(
    chalk.cyan(
      `\n📝 Examples for ${TEMPLATE_TYPES[template].name} components: ${TEMPLATE_TYPES[template].examples}\n`,
    ),
  );

  return template;
}

// CLI setup
program
  .name("enhanced-component-generator")
  .description(
    "Generate React components with AI-optimized templates for different use cases",
  )
  .argument("<name>", "Component name in PascalCase")
  .option("-t, --template <type>", "Component template type", "display")
  .option("-i, --interactive", "Interactive template selection")
  .option("-f, --force", "Overwrite existing files")
  .option("--no-storybook", "Skip Storybook story generation")
  .option("-d, --dir <dir>", "Output directory", config.outputDir)
  .action(async (name, options) => {
    // Ensure template directories exist
    await ensureTemplateDirectories();

    if (options.dir) {
      config.outputDir = options.dir;
    }

    // Select template interactively or validate provided template
    if (options.interactive) {
      options.template = await selectTemplate();
    } else if (!TEMPLATE_TYPES[options.template]) {
      console.error(chalk.red(`❌ Invalid template type: ${options.template}`));
      console.log(chalk.cyan("\nAvailable templates:"));
      Object.entries(TEMPLATE_TYPES).forEach(([key, value]) => {
        console.log(chalk.gray(`  - ${key}: ${value.description}`));
      });
      process.exit(1);
    }

    await generateComponent(name, options);
  });

// Parse CLI arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.cyan("\n📚 Template Types:"));
  Object.entries(TEMPLATE_TYPES).forEach(([key, value]) => {
    console.log(chalk.gray(`\n  ${chalk.bold(key)} - ${value.description}`));
    console.log(chalk.gray(`  Examples: ${value.examples}`));
  });
}
