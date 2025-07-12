# Enhanced Component Generator Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Command Line Interface](#command-line-interface)
5. [Template Types](#template-types)
6. [UI Patterns](#ui-patterns)
7. [Interactive Mode](#interactive-mode)
8. [Usage Examples](#usage-examples)
9. [Configuration](#configuration)
10. [Output and Results](#output-and-results)
11. [Integration with Development Workflow](#integration-with-development-workflow)
12. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
13. [API and Programmatic Usage](#api-and-programmatic-usage)
14. [Development and Contributing](#development-and-contributing)

## Overview

Advanced React component generator with AI-optimized templates and rich UI patterns. Goes beyond basic scaffolding to provide complete, production-ready components with sophisticated state management, accessibility, and testing patterns.

**Tool Type**: Advanced CLI Code Generator  
**Language**: JavaScript (Node.js)  
**Dependencies**: `commander`, `handlebars`, `chalk`, `inquirer`, `fs/promises`  
**Location**: `tools/generators/enhanced-component-generator.js`

## Quick Start

```bash
# Interactive mode - best for learning
node tools/generators/enhanced-component-generator.js MyComponent --interactive

# Generate from template type
node tools/generators/enhanced-component-generator.js Button --template interactive

# Generate from UI pattern
node tools/generators/enhanced-component-generator.js LoginForm --pattern login-form

# Generate form component with validation
node tools/generators/enhanced-component-generator.js UserForm --template form
```

## Installation and Setup

### Prerequisites
- Node.js 18+ required
- ProjectTemplate base structure
- React development environment with TypeScript
- Storybook setup (optional but recommended)
- Template directories in `templates/component/`

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # Installs commander, handlebars, chalk, inquirer dependencies
```

### Template Directory Structure
```text
templates/component/
├── interactive/        # Interactive components (buttons, inputs)
├── display/           # Display components (cards, badges)
├── form/              # Form components with validation
├── data/              # Data components (tables, lists)
└── overlay/           # Overlay components (modals, tooltips)
```

## Command Line Interface

### Basic Syntax
```bash
node tools/generators/enhanced-component-generator.js <name> [options]
```

### Arguments
- `<name>`: Component name in PascalCase (required)

### Options
- `-t, --template <type>`: Component template type (interactive, display, form, data, overlay)
- `-p, --pattern <pattern>`: UI pattern to use as base
- `-i, --interactive`: Interactive template/pattern selection
- `-f, --force`: Overwrite existing files
- `--no-storybook`: Skip Storybook story generation
- `-d, --dir <dir>`: Custom output directory (default: src/components)

### Help and Examples
```bash
# Show help with examples
node tools/generators/enhanced-component-generator.js

# Shows available templates and patterns with descriptions
```

## Template Types

### Interactive Components
**Use Case**: Components users interact with directly  
**Features**: Loading states, error handling, disabled states, keyboard navigation  
**Examples**: Button, TextField, Toggle, Select

**Generated Features**:
- Click and keyboard event handling
- Loading and disabled states
- ARIA attributes for accessibility
- Focus management
- Error boundaries

### Display Components
**Use Case**: Components that display information  
**Features**: Responsive design, dark mode support, custom styling  
**Examples**: Card, Badge, Avatar, Chip

**Generated Features**:
- Responsive CSS with breakpoints
- CSS custom properties for theming
- Multiple size variants
- Accessibility labels

### Form Components
**Use Case**: Form fields with validation and error handling  
**Features**: Validation support, error messages, required field marking  
**Examples**: FormInput, FormSelect, FormTextarea, FormCheckbox

**Generated Features**:
- Built-in validation hooks
- Error message display
- Required field indicators
- Form submission handling
- Accessibility compliance

### Data Components
**Use Case**: Components that display data sets  
**Features**: Loading states, empty states, error handling, data prop support  
**Examples**: DataTable, DataGrid, Chart, List

**Generated Features**:
- Data loading states
- Empty state handling
- Sorting and filtering
- Pagination support
- Performance optimization

### Overlay Components
**Use Case**: Components that overlay content  
**Features**: Portal rendering, escape key handling, focus management  
**Examples**: Modal, Tooltip, Popover, Drawer

**Generated Features**:
- React Portal integration
- Escape key handling
- Click outside detection
- Focus trapping
- Z-index management

## UI Patterns

### Available Patterns

#### login-form
**Category**: forms  
**Description**: Complete login form with validation, error handling, and accessibility  
**Features**: Field validation, submit handling, error states, loading states

#### multi-step-form
**Category**: forms  
**Description**: Wizard-style form with progress tracking and step validation  
**Features**: Step navigation, progress indicator, validation per step, data persistence

#### data-table
**Category**: data-display  
**Description**: Feature-rich table with sorting, pagination, and search  
**Features**: Column sorting, row selection, search filtering, pagination

#### modal-dialog
**Category**: overlays  
**Description**: Accessible modal with focus trapping and escape handling  
**Features**: Focus management, backdrop click, escape key, portal rendering

#### loading-skeletons
**Category**: feedback  
**Description**: Smooth loading states with multiple variants  
**Features**: Multiple skeleton types, shimmer animation, responsive sizing

### Pattern Adaptation
When using patterns, the generator automatically:
1. Replaces component names throughout the code
2. Updates CSS module imports to match new component name
3. Adapts test descriptions and story titles
4. Maintains all original functionality and styling

## Interactive Mode

### Template vs Pattern Selection
```text
? What would you like to generate?
❯ Basic Template - Simple, scaffolded component
  UI Pattern - Rich, complete component from patterns
```

### Template Selection
```text
? Select component template type:
❯ Interactive - Buttons, inputs, toggles - components that users interact with
  Display - Cards, lists, badges - components that display information  
  Form - Form fields with built-in validation and error handling
  Data - Tables, grids, charts - components that display data sets
  Overlay - Modals, tooltips, popovers - components that overlay content
```

### Pattern Selection
```text
? Select UI pattern to use as base:
❯ Login Form - Complete login form with validation, error handling, and accessibility
  Multi-Step Form - Wizard-style form with progress tracking and step validation
  Data Table - Feature-rich table with sorting, pagination, and search
  Modal Dialog - Accessible modal with focus trapping and escape handling
  Loading Skeletons - Smooth loading states with multiple variants
```

## Usage Examples

### Example 1: Interactive Component
```bash
node tools/generators/enhanced-component-generator.js SubmitButton --template interactive

# Output:
🚀 Generating Interactive component: SubmitButton

✅ Created SubmitButton.tsx
✅ Created SubmitButton.test.tsx
✅ Created SubmitButton.module.css
✅ Created index.ts
✅ Created SubmitButton.stories.tsx

✨ Interactive component SubmitButton generated successfully!

💡 This interactive component includes:
   • Loading states
   • Error handling
   • Disabled states
   • Keyboard navigation
```

### Example 2: UI Pattern Usage
```bash
node tools/generators/enhanced-component-generator.js UserLogin --pattern login-form

# Output:
🎨 Generating component from pattern: Login Form

✅ Created UserLogin.tsx
✅ Created UserLogin.test.tsx
✅ Created UserLogin.module.css
✅ Created index.ts
✅ Created UserLogin.stories.tsx

✨ Interactive component UserLogin generated successfully!

# Generated component includes complete login functionality:
# - Email/password fields with validation
# - Submit handling with loading states
# - Error message display
# - Accessibility features
```

### Example 3: Interactive Mode
```bash
node tools/generators/enhanced-component-generator.js ProductCard --interactive

# Interactive prompts:
? What would you like to generate? Basic Template
? Select component template type: Display - Cards, lists, badges

📝 Examples for Display components: Card, Badge, Avatar, Chip

🚀 Generating Display component: ProductCard
# ... files created
```

### Example 4: Form Component
```bash
node tools/generators/enhanced-component-generator.js ContactForm --template form

# Generates form component with:
# - Built-in validation hooks
# - Error message handling
# - Required field indicators
# - Accessibility compliance
```

## Configuration

### Environment Variables
```bash
# Custom components directory
export COMPONENTS_DIR="src/ui/components"
```

### Template Configuration
```javascript
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
```

### Template Types Definition
```javascript
const TEMPLATE_TYPES = {
  interactive: {
    name: "Interactive",
    description: "Buttons, inputs, toggles - components that users interact with",
    examples: "Button, TextField, Toggle, Select",
  },
  display: {
    name: "Display", 
    description: "Cards, lists, badges - components that display information",
    examples: "Card, Badge, Avatar, Chip",
  },
  // ... other types
};
```

## Output and Results

### Generated File Structure
```text
src/components/ComponentName/
├── ComponentName.tsx        # Main component with advanced features
├── ComponentName.test.tsx   # Comprehensive test suite
├── ComponentName.stories.tsx # Storybook stories with variants
├── ComponentName.module.css # Advanced CSS with theming
└── index.ts                # Clean exports
```

### Advanced Component Features

#### Interactive Component Example
```typescript
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium", 
  loading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (loading || disabled) return;
    setIsPressed(true);
    onClick?.(event);
    setTimeout(() => setIsPressed(false), 150);
  }, [loading, disabled, onClick]);

  // Advanced keyboard handling, focus management, etc.
};
```

#### Form Component Example
```typescript
export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required,
  validation,
  ...props
}) => {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Built-in validation, error handling, accessibility
};
```

### Success Output
```text
✨ Interactive component Button generated successfully!

📁 Files created:
   src/components/Button/
   ├── Button.tsx
   ├── Button.test.tsx
   ├── Button.stories.tsx
   ├── Button.module.css
   └── index.ts

🎯 Next steps:
   1. Import component: import { Button } from 'src/components/Button';
   2. Run tests: npm test Button
   3. View in Storybook: npm run storybook

💡 This interactive component includes:
   • Loading states
   • Error handling
   • Disabled states
   • Keyboard navigation
```

## Integration with Development Workflow

### NPM Scripts Integration
```json
{
  "scripts": {
    "g:enhanced": "node tools/generators/enhanced-component-generator.js",
    "g:interactive": "node tools/generators/enhanced-component-generator.js --interactive",
    "g:pattern": "node tools/generators/enhanced-component-generator.js --pattern",
    "g:form": "node tools/generators/enhanced-component-generator.js --template form",
    "g:modal": "node tools/generators/enhanced-component-generator.js --pattern modal-dialog"
  }
}
```

### Development Workflow
```bash
# 1. Generate advanced component
npm run g:enhanced UserProfile --template interactive

# 2. Or use rich pattern
npm run g:enhanced DataViewer --pattern data-table

# 3. Customize implementation
# Edit src/components/UserProfile/UserProfile.tsx

# 4. Test thoroughly 
npm test UserProfile

# 5. View in Storybook
npm run storybook
```

### Team Workflow
```bash
# Design team provides component specs
# Developer generates from appropriate template/pattern
npm run g:enhanced PaymentForm --pattern multi-step-form

# Component comes with advanced features built-in:
# - Multi-step navigation
# - Validation per step
# - Progress tracking
# - Error handling
```

## Error Handling and Troubleshooting

### Common Issues

#### Template Files Not Found
```text
❌ Template /path/to/template not found. All templates must exist.
```
**Cause**: Missing template files in templates/component/ directory  
**Solutions**:
```bash
# Check template structure
ls -la templates/component/interactive/
ls -la templates/component/display/

# Ensure all required templates exist:
# - component.tsx.hbs
# - test.tsx.hbs  
# - stories.tsx.hbs
# - styles.css.hbs
# - index.ts.hbs
```

#### Pattern Files Not Found
```text
❌ Pattern login-form not found at /path/to/pattern
```
**Cause**: Missing UI pattern files in ai/examples/ui-patterns/  
**Solutions**:
```bash
# Check pattern structure
ls -la ai/examples/ui-patterns/forms/
ls -la ai/examples/ui-patterns/overlays/

# Ensure pattern files exist
```

#### Invalid Component Name
```text
❌ Component name must be in PascalCase (e.g., MyComponent)
```
**Solution**: Use PascalCase naming: `UserProfile`, `DataTable`, `SubmitButton`

### Debug Template Issues
```bash
# Test template compilation manually
node -e "
const Handlebars = require('handlebars');
const fs = require('fs');
const template = fs.readFileSync('templates/component/interactive/component.tsx.hbs', 'utf8');
const compiled = Handlebars.compile(template);
console.log(compiled({name: 'TestComponent'}));
"
```

## API and Programmatic Usage

### Node.js Integration
```javascript
const { spawn } = require('child_process');

// Generate component programmatically
function generateComponent(name, options = {}) {
  return new Promise((resolve, reject) => {
    const args = [
      'tools/generators/enhanced-component-generator.js',
      name,
      ...(options.template ? ['--template', options.template] : []),
      ...(options.pattern ? ['--pattern', options.pattern] : []),
      ...(options.force ? ['--force'] : []),
      ...(options.noStorybook ? ['--no-storybook'] : [])
    ];

    const child = spawn('node', args, { stdio: 'pipe' });
    
    child.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`Generator failed with code ${code}`));
    });
  });
}

// Usage
await generateComponent('UserCard', { template: 'display' });
await generateComponent('LoginModal', { pattern: 'login-form' });
```

### Batch Generation
```javascript
const components = [
  { name: 'PrimaryButton', template: 'interactive' },
  { name: 'UserCard', template: 'display' },
  { name: 'LoginForm', pattern: 'login-form' },
  { name: 'DataGrid', pattern: 'data-table' }
];

for (const component of components) {
  console.log(`Generating ${component.name}...`);
  await generateComponent(component.name, component);
  console.log(`✅ ${component.name} completed`);
}
```

## Development and Contributing

### Adding New Template Types
1. **Create Template Directory**:
```bash
mkdir templates/component/new-type
```

2. **Add Template Files**:
```text
templates/component/new-type/
├── component.tsx.hbs
├── test.tsx.hbs
├── stories.tsx.hbs
├── styles.css.hbs
└── index.ts.hbs
```

3. **Update Configuration**:
```javascript
const TEMPLATE_TYPES = {
  // ... existing types
  newType: {
    name: "New Type",
    description: "Description of new component type",
    examples: "Example1, Example2, Example3",
  },
};
```

### Adding New UI Patterns
1. **Create Pattern Files**:
```text
ai/examples/ui-patterns/category/
├── pattern-name.tsx
└── pattern-name.module.css
```

2. **Register Pattern**:
```javascript
const UI_PATTERNS = {
  // ... existing patterns
  "pattern-name": {
    name: "Pattern Name",
    description: "Description of what this pattern does",
    category: "category",
    file: "pattern-name.tsx",
  },
};
```

### Testing New Templates
```bash
# Test template generation
node tools/generators/enhanced-component-generator.js TestComponent --template new-type

# Test pattern generation  
node tools/generators/enhanced-component-generator.js TestPattern --pattern pattern-name

# Test interactive mode
node tools/generators/enhanced-component-generator.js TestInteractive --interactive
```

### Handlebars Helpers
The generator includes custom Handlebars helpers:
```javascript
// Convert PascalCase to kebab-case
Handlebars.registerHelper("kebabCase", (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
});

// Convert PascalCase to camelCase
Handlebars.registerHelper("camelCase", (str) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
});

// Equality comparison
Handlebars.registerHelper("eq", (a, b) => a === b);
```

## Related Tools and Documentation

- **component-generator.js**: Basic component generator
- **generator-wrapper.js**: Analytics wrapper for all generators
- **template-customizer.js**: Framework-specific customization
- **UI Pattern Library**: ai/examples/ui-patterns/
- **Component Development Guide**: docs/guides/generators/using-generators.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines