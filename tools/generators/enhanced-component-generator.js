#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { program } = require("commander");
const Handlebars = require("handlebars");
const chalk = require("chalk");
const inquirer = require("inquirer");

// Simple logger for console output
const logger = console;

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
  docTemplatesDir: path.join(
    __dirname,
    "../../templates/documentation/component",
  ),
  outputDir: process.env.COMPONENTS_DIR || "components",
  fileExtensions: {
    typescript: ".tsx",
    javascript: ".jsx",
    test: ".test.tsx",
    story: ".stories.tsx",
    style: ".module.css",
    readme: ".md",
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
    description:
      "Complete login form with validation, error handling, and accessibility",
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
    logger.error(
      chalk.red(
        `❌ Template ${templatePath} not found. All templates must exist.`,
      ),
    );

    throw error;
  }
}

// Load documentation template content
async function loadDocumentationTemplate(fileName) {
  const templatePath = path.join(config.docTemplatesDir, fileName);
  try {
    return await fs.readFile(templatePath, "utf-8");
  } catch (error) {
    logger.error(
      chalk.red(`❌ Documentation template ${templatePath} not found.`),
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
    pattern.file.replace(".tsx", ".module.css"),
  );

  try {
    const componentContent = await fs.readFile(componentPath, "utf-8");
    let cssContent = "";

    try {
      cssContent = await fs.readFile(cssPath, "utf-8");
    } catch {
      // CSS file optional for patterns
      logger.warn(
        chalk.yellow(`⚠️ CSS file not found for pattern ${patternKey}`),
      );
    }

    return { component: componentContent, css: cssContent, pattern };
  } catch (error) {
    logger.error(
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

// Get documentation templates
async function getDocumentationTemplates() {
  try {
    const readme = await loadDocumentationTemplate("COMPONENT-README.md");
    const api = await loadDocumentationTemplate("COMPONENT-API.md");
    return { readme, api };
  } catch (error) {
    logger.warn(
      chalk.yellow(
        "⚠️ Documentation templates not found, skipping documentation generation",
      ),
    );
    return null;
  }
}

// Generate documentation context based on component type and name
function generateDocumentationContext(name, templateType) {
  const kebabName = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  const templateInfo = TEMPLATE_TYPES[templateType];

  return {
    COMPONENT_NAME: name,
    COMPONENT_KEBAB_NAME: kebabName,
    COMPONENT_TYPE: templateInfo.name,
    COMPONENT_DESCRIPTION: `${templateInfo.description} component`,
    COMPONENT_CATEGORY: templateType,
    COMPONENT_VERSION: "1.0.0",
    API_VERSION: "1.0.0",
    DATE: new Date().toISOString().split("T")[0],

    // Basic prop examples - these would be extracted from component template in a more advanced implementation
    BASIC_USAGE_EXAMPLE: "Basic content",
    ADVANCED_USAGE_EXAMPLE: "Advanced content with props",
    PROP_EXAMPLE_1: "variant",
    PROP_VALUE_1: '"primary"',
    PROP_EXAMPLE_2: "size",
    PROP_VALUE_2: '"medium"',

    // Custom prop placeholders - to be replaced by user
    CUSTOM_PROP_1: "variant",
    CUSTOM_PROP_1_TYPE: "string",
    CUSTOM_PROP_1_DEFAULT: '"default"',
    CUSTOM_PROP_1_REQUIRED: "No",
    CUSTOM_PROP_1_DESCRIPTION: "Visual variant of the component",

    CUSTOM_PROP_2: "size",
    CUSTOM_PROP_2_TYPE: "string",
    CUSTOM_PROP_2_DEFAULT: '"medium"',
    CUSTOM_PROP_2_REQUIRED: "No",
    CUSTOM_PROP_2_DESCRIPTION: "Size of the component",

    CUSTOM_PROP_3: "disabled",
    CUSTOM_PROP_3_TYPE: "boolean",
    CUSTOM_PROP_3_DEFAULT: "false",
    CUSTOM_PROP_3_REQUIRED: "No",
    CUSTOM_PROP_3_DESCRIPTION: "Whether the component is disabled",

    // Example states
    EXAMPLE_STATE_1: "Loading State",
    EXAMPLE_PROP_1: "loading",
    EXAMPLE_VALUE_1: "true",
    EXAMPLE_STATE_1_CONTENT: "Loading...",

    EXAMPLE_STATE_2: "Error State",
    EXAMPLE_PROP_2: "error",
    EXAMPLE_VALUE_2: "true",
    EXAMPLE_PROP_3: "message",
    EXAMPLE_VALUE_3: '"Something went wrong"',
    EXAMPLE_STATE_2_CONTENT: "Error content",

    // Styling
    STYLE_CLASS_1: "primary",
    STYLE_CLASS_1_DESCRIPTION: "Primary styling variant",
    STYLE_CLASS_2: "secondary",
    STYLE_CLASS_2_DESCRIPTION: "Secondary styling variant",

    // CSS Variables
    CSS_VAR_1: "color",
    CSS_VAR_1_DEFAULT: "#000000",
    CSS_VAR_1_DESCRIPTION: "Primary text color",
    CSS_VAR_1_VALUES: "Any valid CSS color",

    CSS_VAR_2: "background",
    CSS_VAR_2_DEFAULT: "#ffffff",
    CSS_VAR_2_DESCRIPTION: "Background color",
    CSS_VAR_2_VALUES: "Any valid CSS color",

    CSS_VAR_3: "border-radius",
    CSS_VAR_3_DEFAULT: "4px",
    CSS_VAR_3_DESCRIPTION: "Border radius",

    // Keyboard navigation
    KEY_1: "Enter",
    KEY_1_ACTION: "Activate component",
    KEY_2: "Escape",
    KEY_2_ACTION: "Close/cancel action",

    // Stories
    STORY_1: "With Props",
    STORY_2: "Error State",

    // Dependencies - based on template
    DESIGN_SYSTEM_NAME: "Project",
    COMPONENT_VARIANTS: "primary, secondary, error",

    // Event handlers
    EVENT_HANDLER_1: "onClick",
    EVENT_HANDLER_1_TYPE: "(event: React.MouseEvent) => void",
    EVENT_HANDLER_1_DESCRIPTION: "Handles click events",
    EVENT_PARAM_1: "event",
    EVENT_PARAM_1_TYPE: "React.MouseEvent",
    EVENT_PARAM_1_DESCRIPTION: "The click event",
    EVENT_PARAM_2: "value",
    EVENT_PARAM_2_TYPE: "string",
    EVENT_PARAM_2_DESCRIPTION: "The component value",

    EVENT_HANDLER_2: "onChange",
    EVENT_HANDLER_2_TYPE: "(value: string) => void",
    EVENT_HANDLER_2_DESCRIPTION: "Handles value changes",

    // CSS classes
    CSS_CLASS_1: "content",
    CSS_CLASS_1_DESCRIPTION: "Content area styling",
    CSS_CLASS_2: "actions",
    CSS_CLASS_2_DESCRIPTION: "Action buttons area",

    // Conditional classes
    CONDITION_1: "error === true",
    CONDITIONAL_CLASS_1: "error",
    CONDITIONAL_CLASS_1_DESCRIPTION: "Applied when component has error state",

    CONDITION_2: "loading === true",
    CONDITIONAL_CLASS_2: "loading",
    CONDITIONAL_CLASS_2_DESCRIPTION: "Applied when component is loading",

    // Methods (for ref API)
    METHOD_1: "focus",
    METHOD_1_PARAMS: "",
    METHOD_1_RETURN: "void",
    METHOD_1_ARGS: "",

    METHOD_2: "reset",
    METHOD_2_PARAMS: "",
    METHOD_2_RETURN: "void",

    // Error scenarios
    ERROR_SCENARIO_1: "Invalid props",
    ERROR_SCENARIO_1_DESCRIPTION:
      "Handles cases where invalid props are passed",
    ERROR_SCENARIO_2: "Network errors",
    ERROR_SCENARIO_2_DESCRIPTION: "Handles network-related errors gracefully",

    // Browser features
    BROWSER_FEATURES_USED: "CSS Grid, CSS Custom Properties, ES2020",

    // Migration info
    PREVIOUS_VERSION: "0.9.0",
    CURRENT_VERSION: "1.0.0",
    BREAKING_CHANGE_1: "oldProp",
    BREAKING_CHANGE_1_NEW: "newProp",
    BREAKING_CHANGE_2: "deprecatedMethod",
    OLD_PROP: "oldProp",
    NEW_PROP: "newProp",
    OLD_EVENT: "onOldEvent",
    NEW_EVENT: "onNewEvent",
    OLD_CLASS: "old-class",
    NEW_CLASS: "new-class",

    // Related components
    RELATED_COMPONENT_1: "Button",
    RELATED_COMPONENT_1_DESCRIPTION: "Basic button component",
    RELATED_COMPONENT_2: "Input",
    RELATED_COMPONENT_2_DESCRIPTION: "Form input component",
  };
}

// Adapt UI pattern to new component name
function adaptPatternToComponent(
  patternContent,
  newComponentName,
  originalName,
) {
  // Replace all instances of the original component name with the new one
  const originalPattern = originalName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
  const newPattern = newComponentName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();

  let adapted = patternContent
    // Replace component names in imports and exports
    .replace(
      new RegExp(`export const ${originalName}`, "g"),
      `export const ${newComponentName}`,
    )
    .replace(
      new RegExp(`${originalName}Props`, "g"),
      `${newComponentName}Props`,
    )
    .replace(
      new RegExp(`interface ${originalName}Props`, "g"),
      `interface ${newComponentName}Props`,
    )
    .replace(
      new RegExp(`${originalName}: React.FC`, "g"),
      `${newComponentName}: React.FC`,
    )
    // Replace CSS module imports - USE CORRECT FILENAME FORMAT
    .replace(
      new RegExp(`from "\\.\/${originalPattern}\\.module\\.css"`, "g"),
      `from "./${newComponentName}.module.css"`,
    )
    .replace(
      new RegExp(`from '\\.\/${originalPattern}\\.module\\.css'`, "g"),
      `from './${newComponentName}.module.css'`,
    )
    // Replace component displayName
    .replace(
      new RegExp(`${originalName}\\.displayName`, "g"),
      `${newComponentName}.displayName`,
    )
    // Replace story titles and component references
    .replace(
      new RegExp(`title: ".*/${originalName}"`, "g"),
      `title: "Generated/${newComponentName}"`,
    )
    .replace(
      new RegExp(`component: ${originalName}`, "g"),
      `component: ${newComponentName}`,
    )
    .replace(
      new RegExp(`import { ${originalName} }`, "g"),
      `import { ${newComponentName} }`,
    )
    .replace(new RegExp(`<${originalName}`, "g"), `<${newComponentName}`)
    .replace(new RegExp(`</${originalName}>`, "g"), `</${newComponentName}>`)
    // Replace CSS class references
    .replace(
      new RegExp(`data-testid="${originalPattern}"`, "g"),
      `data-testid="${newPattern}"`,
    );

  return adapted;
}

// Generate from UI pattern
async function generateFromPattern(name, patternKey, options) {
  logger.info(
    chalk.blue(
      `\n🎨 Generating component from pattern: ${UI_PATTERNS[patternKey].name}\n`,
    ),
  );

  const patternData = await loadUIPattern(patternKey);
  const originalName = patternData.pattern.file
    .replace(".tsx", "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  // Adapt pattern content to new component name
  const adaptedComponent = adaptPatternToComponent(
    patternData.component,
    name,
    originalName,
  );
  const adaptedCss = adaptPatternToComponent(
    patternData.css,
    name,
    originalName,
  );

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
    logger.error(
      chalk.red("❌ Component name must be in PascalCase (e.g., MyComponent)"),
    );

    process.exit(1);
  }

  let templates;
  let documentationTemplates = null;

  // Load documentation templates if requested
  if (options.withDocs || options.fullDocs) {
    documentationTemplates = await getDocumentationTemplates();
    if (documentationTemplates) {
      logger.info(chalk.blue("📖 Documentation generation enabled"));
    }
  }

  // Generate from pattern or template
  if (options.pattern) {
    templates = await generateFromPattern(name, options.pattern, options);
  } else {
    logger.info(
      chalk.blue(`\n🚀 Generating ${options.template} component: ${name}\n`),
    );

    templates = await getTemplates(name, options.template);
  }

  // Create component directory
  const componentDir = path.join(config.outputDir, name);

  try {
    await fs.mkdir(componentDir, { recursive: true });
  } catch (error) {
    logger.error(chalk.red(`❌ Failed to create directory: ${error.message}`));
    process.exit(1);
  }

  // Files to generate
  const files = [
    {
      name: `${name}${config.fileExtensions.typescript}`,
      template: templates.component,
      type: "component",
    },
    {
      name: `${name}${config.fileExtensions.test}`,
      template: templates.test,
      type: "component",
    },
    {
      name: `${name}${config.fileExtensions.style}`,
      template: templates.styles,
      type: "component",
    },
    {
      name: "index.ts",
      template: templates.index,
      type: "component",
    },
  ];

  // Add storybook file if requested
  if (!options.noStorybook) {
    files.push({
      name: `${name}${config.fileExtensions.story}`,
      template: templates.story,
      type: "component",
    });
  }

  // Add documentation files if requested
  if ((options.withDocs || options.fullDocs) && documentationTemplates) {
    files.push({
      name: "README.md",
      template: documentationTemplates.readme,
      type: "documentation",
    });

    if (options.fullDocs) {
      files.push({
        name: "API.md",
        template: documentationTemplates.api,
        type: "documentation",
      });
    }
  }

  // Generate each file
  for (const file of files) {
    const filePath = path.join(componentDir, file.name);

    // Skip if file exists and not forcing
    if (!options.force) {
      try {
        await fs.access(filePath);
        logger.info(chalk.yellow(`⚠️  Skipping ${file.name} (already exists)`));
        continue;
      } catch {}
    }

    let content;

    // For patterns, content is already adapted - don't use Handlebars
    if (options.pattern && file.type === "component") {
      content = file.template;
    } else if (file.type === "documentation") {
      // For documentation templates, use documentation context
      const docContext = generateDocumentationContext(
        name,
        options.template || "display",
      );
      const compiledTemplate = Handlebars.compile(file.template);
      content = compiledTemplate(docContext);
    } else {
      // For component templates, use component context
      const compiledTemplate = Handlebars.compile(file.template);
      content = compiledTemplate({
        name,
        templateType: options.template,
      });
    }

    try {
      await fs.writeFile(filePath, content);
      logger.info(chalk.green(`✅ Created ${file.name}`));
    } catch (error) {
      logger.error(
        chalk.red(`❌ Failed to create ${file.name}: ${error.message}`),
      );
    }
  }

  // Success message
  const componentType = options.template
    ? TEMPLATE_TYPES[options.template].name
    : "Pattern-based";
  const docsStatus =
    options.withDocs || options.fullDocs
      ? options.fullDocs
        ? " with full documentation"
        : " with documentation"
      : "";

  logger.info(
    chalk.green(
      `\n✨ ${componentType} component ${name} generated successfully${docsStatus}!\n`,
    ),
  );

  logger.info(chalk.cyan("📁 Files created:"));
  logger.info(chalk.gray(`   ${componentDir}/`));
  files.forEach((file) => {
    const icon = file.type === "documentation" ? "📖" : "⚛️";
    logger.info(chalk.gray(`   ├── ${icon} ${file.name}`));
  });

  logger.info(chalk.cyan("\n🎯 Next steps:"));
  logger.info(
    chalk.gray(
      `   1. Import component: import { ${name} } from '${path.relative(process.cwd(), componentDir)}';`,
    ),
  );

  logger.info(chalk.gray(`   2. Run tests: npm test ${name}`));
  if (!options.noStorybook) {
    logger.info(chalk.gray(`   3. View in Storybook: npm run storybook`));
  }
  if (options.withDocs || options.fullDocs) {
    logger.info(
      chalk.gray(
        `   4. Review documentation: ${path.relative(process.cwd(), componentDir)}/README.md`,
      ),
    );
    if (options.fullDocs) {
      logger.info(
        chalk.gray(
          `   5. Check API reference: ${path.relative(process.cwd(), componentDir)}/API.md`,
        ),
      );
    }
  }

  const templateType = options.template || "pattern";
  logger.info(chalk.gray(`\n💡 This ${templateType} component includes:`));

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

  const templateFeatures = features[options.template] || features.display;
  templateFeatures.forEach((feature) => {
    logger.info(chalk.gray(`   • ${feature}`));
  });

  if (options.withDocs || options.fullDocs) {
    logger.info(chalk.gray(`\n📖 Documentation includes:`));
    logger.info(chalk.gray(`   • Component usage guide`));
    logger.info(chalk.gray(`   • Props documentation`));
    logger.info(chalk.gray(`   • Styling information`));
    logger.info(chalk.gray(`   • Testing examples`));
    if (options.fullDocs) {
      logger.info(chalk.gray(`   • Detailed API reference`));
      logger.info(chalk.gray(`   • TypeScript interfaces`));
      logger.info(chalk.gray(`   • Performance guidance`));
    }
  }
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

  logger.info(
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

  logger.info(
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
  .option("--with-docs", "Generate component documentation (README.md)")
  .option(
    "--full-docs",
    "Generate full documentation suite (README.md + API.md)",
  )
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
            {
              name: "Basic Template - Simple, scaffolded component",
              value: "template",
            },
            {
              name: "UI Pattern - Rich, complete component from patterns",
              value: "pattern",
            },
          ],
        },
      ]);

      if (choice === "template") {
        options.template = await selectTemplate();
      } else {
        options.pattern = await selectPattern();
      }

      // Ask about documentation generation
      const { docChoice } = await inquirer.prompt([
        {
          type: "list",
          name: "docChoice",
          message: "Include documentation?",
          choices: [
            {
              name: "No documentation",
              value: "none",
            },
            {
              name: "Basic documentation (README.md)",
              value: "basic",
            },
            {
              name: "Full documentation suite (README.md + API.md)",
              value: "full",
            },
          ],
        },
      ]);

      if (docChoice === "basic") {
        options.withDocs = true;
      } else if (docChoice === "full") {
        options.withDocs = true;
        options.fullDocs = true;
      }
    }

    // Validate options
    if (options.pattern) {
      if (!UI_PATTERNS[options.pattern]) {
        logger.error(chalk.red(`❌ Invalid pattern: ${options.pattern}`));
        logger.info(chalk.cyan("\nAvailable patterns:"));
        Object.entries(UI_PATTERNS).forEach(([key, value]) => {
          logger.info(chalk.gray(`  - ${key}: ${value.description}`));
        });
        process.exit(1);
      }
    } else if (!TEMPLATE_TYPES[options.template]) {
      logger.error(chalk.red(`❌ Invalid template type: ${options.template}`));
      logger.info(chalk.cyan("\nAvailable templates:"));
      Object.entries(TEMPLATE_TYPES).forEach(([key, value]) => {
        logger.info(chalk.gray(`  - ${key}: ${value.description}`));
      });
      process.exit(1);
    }

    await generateComponent(name, options);
  });

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
  logger.info(chalk.cyan("\n📚 Template Types:"));
  Object.entries(TEMPLATE_TYPES).forEach(([key, value]) => {
    logger.info(chalk.gray(`\n  ${chalk.bold(key)} - ${value.description}`));
    logger.info(chalk.gray(`  Examples: ${value.examples}`));
  });

  logger.info(chalk.cyan("\n🎨 UI Patterns:"));
  Object.entries(UI_PATTERNS).forEach(([key, value]) => {
    logger.info(chalk.gray(`\n  ${chalk.bold(key)} - ${value.description}`));
    logger.info(chalk.gray(`  Category: ${value.category}`));
  });

  logger.info(chalk.cyan("\n💡 Usage Examples:"));
  logger.info(chalk.gray("  # Basic template"));
  logger.info(
    chalk.gray(
      "  enhanced-component-generator MyButton --template interactive",
    ),
  );
  logger.info(chalk.gray("\n  # Rich UI pattern"));
  logger.info(
    chalk.gray("  enhanced-component-generator UserLogin --pattern login-form"),
  );
  logger.info(chalk.gray("\n  # Interactive selection"));
  logger.info(
    chalk.gray("  enhanced-component-generator MyComponent --interactive"),
  );
  process.exit(0);
}

// Parse CLI arguments
program.parse(process.argv);
