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

// Template definitions
const templates = {
  component: `import * as React from 'react';
import styles from './{{name}}.module.css';

export interface {{name}}Props {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * {{name}} component
 * 
 * @example
 * <{{name}} onClick={() => { /* handle click */ }}>
 *   Content here
 * </{{name}}>
 */
export const {{name}}: React.FC<{{name}}Props> = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={\`\${styles.container} \${className}\`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

{{name}}.displayName = '{{name}}';`,

  test: `import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { {{name}} } from './{{name}}';

describe('{{name}}', () => {
  it('renders children correctly', () => {
    render(<{{name}}>Test Content</{{name}}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<{{name}} className="custom-class">Content</{{name}}>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<{{name}} onClick={handleClick}>Clickable</{{name}}>);
    
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events when clickable', () => {
    const handleClick = jest.fn();
    render(<{{name}} onClick={handleClick}>Clickable</{{name}}>);
    
    const element = screen.getByText('Clickable');
    fireEvent.keyDown(element, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(element, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('does not handle keyboard events when not clickable', () => {
    const { container } = render(<{{name}}>Not Clickable</{{name}}>);
    expect(container.firstChild).not.toHaveAttribute('role');
    expect(container.firstChild).not.toHaveAttribute('tabIndex');
  });

  it('renders without children', () => {
    const { container } = render(<{{name}} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});`,

  story: `import type { Meta, StoryObj } from '@storybook/react';
import { {{name}} } from './{{name}}';

const meta = {
  title: 'Components/{{name}}',
  component: {{name}},
  parameters: {
    layout: 'centered',
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
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler',
    },
  },
} satisfies Meta<typeof {{name}}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default {{name}}',
  },
};

export const Clickable: Story = {
  args: {
    children: 'Click me!',
    onClick: () => { /* Handle {{name}} click */ },
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Styled {{name}}',
    className: 'custom-styling',
  },
};

export const Empty: Story = {
  args: {},
};`,

  styles: `.container {
  /* Default styles for {{name}} */
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--background-secondary, #f5f5f5);
  transition: all 0.2s ease-in-out;
}

.container:hover {
  background-color: var(--background-hover, #ebebeb);
}

/* Clickable state */
.container[role="button"] {
  cursor: pointer;
  user-select: none;
}

.container[role="button"]:active {
  transform: scale(0.98);
}

.container[role="button"]:focus-visible {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0.75rem;
  }
}`,

  index: `export { {{name}} } from './{{name}}';
export type { {{name}}Props } from './{{name}}';`,
};

// Generate component files
async function generateComponent(name, options) {
  console.log(chalk.blue(`\n🚀 Generating component: ${name}\n`));

  // Validate component name
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    console.error(
      chalk.red("❌ Component name must be in PascalCase (e.g., MyComponent)"),
    );
    process.exit(1);
  }

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
    const content = compiledTemplate({ name });

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
  console.log(chalk.green(`\n✨ Component ${name} generated successfully!\n`));
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
}

// CLI setup
program
  .name("generate-component")
  .description("Generate a React component with tests and stories")
  .argument("<name>", "Component name in PascalCase")
  .option("-f, --force", "Overwrite existing files")
  .option("--no-storybook", "Skip Storybook story generation")
  .option("-d, --dir <dir>", "Output directory", config.outputDir)
  .action(async (name, options) => {
    if (options.dir) {
      config.outputDir = options.dir;
    }
    await generateComponent(name, options);
  });

// Parse CLI arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
