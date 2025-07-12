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

// UI Pattern definitions (rich, complete examples)
const UI_PATTERNS = {
  "login-form": {
    name: "Login Form",
    description: "Complete login form with validation, error handling, and accessibility",
    category: "forms",
    file: "login-form.tsx",
  },
  "multi-step-form": {
    name: "Multi-Step Form",
    description: "Wizard-style form with progress tracking and step validation", 
    category: "forms",
    file: "multi-step-form.tsx",
  },
  "data-table": {
    name: "Data Table",
    description: "Feature-rich table with sorting, pagination, and search",
    category: "data-display", 
    file: "data-table.tsx",
  },
  "modal-dialog": {
    name: "Modal Dialog",
    description: "Accessible modal with focus trapping and escape handling",
    category: "overlays",
    file: "modal-dialog.tsx",
  },
  "loading-skeletons": {
    name: "Loading Skeletons", 
    description: "Smooth loading states with multiple variants",
    category: "feedback",
    file: "loading-skeletons.tsx",
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
    console.error(
      chalk.red(`❌ Template ${templatePath} not found. All templates must exist.`),
    );
    throw error;
  }
}

// Load UI pattern content
async function loadUIPattern(patternKey) {
  const pattern = UI_PATTERNS[patternKey];
  if (!pattern) {
    throw new Error(`UI pattern ${patternKey} not found`);
  }

  const componentPath = path.join(
    __dirname,
    "../../ai/examples/ui-patterns",
    pattern.category,
    pattern.file,
  );
  
  const cssPath = path.join(
    __dirname,
    "../../ai/examples/ui-patterns", 
    pattern.category,
    pattern.file.replace('.tsx', '.module.css'),
  );

  try {
    const componentContent = await fs.readFile(componentPath, "utf-8");
    let cssContent = "";
    
    try {
      cssContent = await fs.readFile(cssPath, "utf-8");
    } catch {
      // CSS file optional for patterns
      console.warn(chalk.yellow(`⚠️ CSS file not found for pattern ${patternKey}`));
    }

    return { component: componentContent, css: cssContent, pattern };
  } catch (error) {
    console.error(
      chalk.red(`❌ Pattern ${patternKey} not found at ${componentPath}`),
    );
    throw error;
  }
}

// Get templates for component type
async function getTemplates(componentName, templateType) {
  // Load type-specific templates - all must exist
  const component = await loadTemplate(templateType, "component.tsx.hbs");
  const test = await loadTemplate(templateType, "test.tsx.hbs");
  const story = await loadTemplate(templateType, "stories.tsx.hbs");
  const styles = await loadTemplate(templateType, "styles.css.hbs");
  const index = await loadTemplate(templateType, "index.ts.hbs");

  return { component, test, story, styles, index };
}

// Adapt UI pattern to new component name
function adaptPatternToComponent(patternContent, newComponentName, originalName) {
  // Replace all instances of the original component name with the new one
  const originalPattern = originalName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const newPattern = newComponentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  
  let adapted = patternContent
    // Replace component names in imports and exports
    .replace(new RegExp(`export const ${originalName}`, 'g'), `export const ${newComponentName}`)
    .replace(new RegExp(`${originalName}Props`, 'g'), `${newComponentName}Props`)
    .replace(new RegExp(`interface ${originalName}Props`, 'g'), `interface ${newComponentName}Props`)
    .replace(new RegExp(`${originalName}: React.FC`, 'g'), `${newComponentName}: React.FC`)
    // Replace CSS module imports - USE CORRECT FILENAME FORMAT
    .replace(new RegExp(`from "\\.\/${originalPattern}\\.module\\.css"`, 'g'), `from "./${newComponentName}.module.css"`)
    .replace(new RegExp(`from '\\.\/${originalPattern}\\.module\\.css'`, 'g'), `from './${newComponentName}.module.css'`)
    // Replace component displayName
    .replace(new RegExp(`${originalName}\\.displayName`, 'g'), `${newComponentName}.displayName`)
    // Replace story titles and component references
    .replace(new RegExp(`title: ".*/${originalName}"`, 'g'), `title: "Generated/${newComponentName}"`)
    .replace(new RegExp(`component: ${originalName}`, 'g'), `component: ${newComponentName}`)
    .replace(new RegExp(`import { ${originalName} }`, 'g'), `import { ${newComponentName} }`)
    .replace(new RegExp(`<${originalName}`, 'g'), `<${newComponentName}`)
    .replace(new RegExp(`</${originalName}>`, 'g'), `</${newComponentName}>`)
    // Replace CSS class references
    .replace(new RegExp(`data-testid="${originalPattern}"`, 'g'), `data-testid="${newPattern}"`);

  return adapted;
}

// Generate from UI pattern
async function generateFromPattern(name, patternKey, options) {
  console.log(
    chalk.blue(`\n🎨 Generating component from pattern: ${UI_PATTERNS[patternKey].name}\n`),
  );

  const patternData = await loadUIPattern(patternKey);
  const originalName = patternData.pattern.file.replace('.tsx', '').split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');

  // Adapt pattern content to new component name
  const adaptedComponent = adaptPatternToComponent(patternData.component, name, originalName);
  const adaptedCss = adaptPatternToComponent(patternData.css, name, originalName);

  // Generate basic test and story files for the pattern
  const basicTest = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  // TODO: Add specific tests for ${UI_PATTERNS[patternKey].name} functionality
  // This component was generated from the ${patternKey} pattern
  // See ai/examples/ui-patterns/${patternData.pattern.category}/${patternData.pattern.file} for the original
});`;

  const basicStory = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta = {
  title: 'Generated/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

// This component was generated from the ${patternKey} pattern
// See ai/examples/ui-patterns/${patternData.pattern.category}/${patternData.pattern.file} for the original`;

  const basicIndex = `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';`;

  return {
    component: adaptedComponent,
    test: basicTest,
    story: basicStory,
    styles: adaptedCss,
    index: basicIndex,
  };
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
  // Validate component name
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    console.error(
      chalk.red("❌ Component name must be in PascalCase (e.g., MyComponent)"),
    );
    process.exit(1);
  }

  let templates;
  
  // Generate from pattern or template
  if (options.pattern) {
    templates = await generateFromPattern(name, options.pattern, options);
  } else {
    console.log(
      chalk.blue(`\n🚀 Generating ${options.template} component: ${name}\n`),
    );
    templates = await getTemplates(name, options.template);
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

    let content;
    
    // For patterns, content is already adapted - don't use Handlebars
    if (options.pattern) {
      content = file.template;
    } else {
      // For templates, use Handlebars compilation
      const compiledTemplate = Handlebars.compile(file.template);
      content = compiledTemplate({
        name,
        templateType: options.template,
      });
    }

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

// Interactive pattern selection
async function selectPattern() {
  const { pattern } = await inquirer.prompt([
    {
      type: "list",
      name: "pattern",
      message: "Select UI pattern to use as base:",
      choices: Object.entries(UI_PATTERNS).map(([key, value]) => ({
        name: `${value.name} - ${value.description}`,
        value: key,
        short: value.name,
      })),
    },
  ]);

  console.log(
    chalk.cyan(
      `\n🎨 Using ${UI_PATTERNS[pattern].name} pattern from ${UI_PATTERNS[pattern].category} category\n`,
    ),
  );

  return pattern;
}

// CLI setup
program
  .name("enhanced-component-generator")
  .description(
    "Generate React components with AI-optimized templates or UI patterns",
  )
  .argument("<name>", "Component name in PascalCase")
  .option("-t, --template <type>", "Component template type", "display")
  .option("-p, --pattern <pattern>", "UI pattern to use as base")
  .option("-i, --interactive", "Interactive template/pattern selection")
  .option("-f, --force", "Overwrite existing files")
  .option("--no-storybook", "Skip Storybook story generation")
  .option("-d, --dir <dir>", "Output directory", config.outputDir)
  .action(async (name, options) => {
    // Ensure template directories exist
    await ensureTemplateDirectories();

    if (options.dir) {
      config.outputDir = options.dir;
    }

    // Handle interactive selection
    if (options.interactive) {
      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "What would you like to generate?",
          choices: [
            { name: "Basic Template - Simple, scaffolded component", value: "template" },
            { name: "UI Pattern - Rich, complete component from patterns", value: "pattern" },
          ],
        },
      ]);

      if (choice === "template") {
        options.template = await selectTemplate();
      } else {
        options.pattern = await selectPattern();
      }
    }

    // Validate options
    if (options.pattern) {
      if (!UI_PATTERNS[options.pattern]) {
        console.error(chalk.red(`❌ Invalid pattern: ${options.pattern}`));
        console.log(chalk.cyan("\nAvailable patterns:"));
        Object.entries(UI_PATTERNS).forEach(([key, value]) => {
          console.log(chalk.gray(`  - ${key}: ${value.description}`));
        });
        process.exit(1);
      }
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

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.cyan("\n📚 Template Types:"));
  Object.entries(TEMPLATE_TYPES).forEach(([key, value]) => {
    console.log(chalk.gray(`\n  ${chalk.bold(key)} - ${value.description}`));
    console.log(chalk.gray(`  Examples: ${value.examples}`));
  });
  
  console.log(chalk.cyan("\n🎨 UI Patterns:"));
  Object.entries(UI_PATTERNS).forEach(([key, value]) => {
    console.log(chalk.gray(`\n  ${chalk.bold(key)} - ${value.description}`));
    console.log(chalk.gray(`  Category: ${value.category}`));
  });
  
  console.log(chalk.cyan("\n💡 Usage Examples:"));
  console.log(chalk.gray("  # Basic template"));
  console.log(chalk.gray("  enhanced-component-generator MyButton --template interactive"));
  console.log(chalk.gray("\n  # Rich UI pattern"));
  console.log(chalk.gray("  enhanced-component-generator UserLogin --pattern login-form"));
  console.log(chalk.gray("\n  # Interactive selection"));
  console.log(chalk.gray("  enhanced-component-generator MyComponent --interactive"));
  process.exit(0);
}

// Parse CLI arguments
program.parse(process.argv);