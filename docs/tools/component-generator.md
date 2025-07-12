# Component Generator Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Command Line Interface](#command-line-interface)
5. [Generated Files and Structure](#generated-files-and-structure)
6. [Template System](#template-system)
7. [Usage Examples](#usage-examples)
8. [Configuration](#configuration)
9. [Output and Results](#output-and-results)
10. [Integration with Development Workflow](#integration-with-development-workflow)
11. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
12. [API and Programmatic Usage](#api-and-programmatic-usage)
13. [Development and Contributing](#development-and-contributing)

## Overview

Automated React component generator that creates complete, production-ready components with TypeScript, tests, stories,
and styles. Follows ProjectTemplate standards and optimal practices for accessibility, testing, and maintainability.

**Tool Type**: CLI Code Generator  
**Language**: JavaScript (Node.js)  
**Dependencies**: `commander`, `handlebars`, `chalk`, `fs/promises`  
**Location**: `tools/generators/component-generator.js`

## Quick Start

```bash
# Generate a basic component
node tools/generators/component-generator.js Button

# Generate with custom output directory
node tools/generators/component-generator.js Header --dir src/layout

# Generate without Storybook story
node tools/generators/component-generator.js Utility --no-storybook

# Force overwrite existing files
node tools/generators/component-generator.js Button --force
```

## Installation and Setup

### Prerequisites
- Node.js 18+ required
- ProjectTemplate base structure
- React development environment
- TypeScript configuration
- Testing framework (Vitest recommended)

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # Installs commander, handlebars, chalk dependencies
```

### Configuration
Set environment variables if needed:
```bash
# Custom components directory (optional)
export COMPONENTS_DIR="src/ui/components"

# Or modify config in the script directly
```

## Command Line Interface

### Basic Syntax
```bash
node tools/generators/component-generator.js <name> [options]
```

### Arguments
- `<name>`: Component name in PascalCase (required)

### Options
- `-f, --force`: Overwrite existing files
- `--no-storybook`: Skip Storybook story generation
- `-d, --dir <dir>`: Custom output directory (default: src/components)

### Validation Rules
- Component name must be in PascalCase (e.g., `MyComponent`, `UserProfile`)
- Must start with uppercase letter
- Can contain letters and numbers only
- No spaces, hyphens, or underscores

## Generated Files and Structure

### Default File Structure
```text
src/components/ComponentName/
├── ComponentName.tsx        # Main component file
├── ComponentName.test.tsx   # Test file
├── ComponentName.stories.tsx # Storybook stories
├── ComponentName.module.css # Scoped styles
└── index.ts                # Export file
```

### File Descriptions

#### Component File (`ComponentName.tsx`)
**Features**:
- TypeScript with proper interface definition
- React.FC with comprehensive props
- Accessibility attributes (role, tabIndex, keyboard handling)
- CSS modules integration
- JSDoc documentation with examples
- Event handling patterns

#### Test File (`ComponentName.test.tsx`)
**Features**:
- Vitest testing framework
- React Testing Library integration
- Comprehensive test coverage:
  - Renders children correctly
  - Applies custom className
  - Handles click events
  - Keyboard accessibility
  - Edge cases (no children, no onClick)

#### Storybook File (`ComponentName.stories.tsx`)
**Features**:
- TypeScript story definitions
- Multiple story variants (Default, Clickable, WithCustomClass, Empty)
- Documented controls and argTypes
- Accessibility-friendly layouts

#### Styles File (`ComponentName.module.css`)
**Features**:
- Scoped CSS modules
- CSS custom properties for theming
- Responsive design patterns
- Accessibility focus states
- Hover and active states

#### Index File (`index.ts`)
**Features**:
- Clean exports for component and types
- Enables clean imports from other files

## Template System

### Handlebars Templates
The generator uses Handlebars templating with custom helpers:

#### Custom Helpers
```javascript
// Convert PascalCase to kebab-case
Handlebars.registerHelper("kebabCase", (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
});

// Convert PascalCase to camelCase
Handlebars.registerHelper("camelCase", (str) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
});
```

#### Template Variables
- `{{name}}`: Component name in PascalCase
- `{{kebabCase name}}`: Component name in kebab-case
- `{{camelCase name}}`: Component name in camelCase

### Component Template Structure
```typescript
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
 * <{{name}} onClick={() => alert('clicked')}>
 *   Content here
 * </{{name}}>
 */
export const {{name}}: React.FC<{{name}}Props> = ({
  children,
  className = '',
  onClick
}) => {
  // Implementation with accessibility features
};
```

## Usage Examples

### Example 1: Basic Component Generation
```bash
node tools/generators/component-generator.js Button

# Output:
🚀 Generating component: Button

✅ Created Button.tsx
✅ Created Button.test.tsx
✅ Created Button.module.css
✅ Created index.ts
✅ Created Button.stories.tsx

✨ Component Button generated successfully!

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
```

### Example 2: Custom Directory
```bash
node tools/generators/component-generator.js Navigation --dir src/layout

# Creates: src/layout/Navigation/
```

### Example 3: Without Storybook
```bash
node tools/generators/component-generator.js Utility --no-storybook

# Skips creating Utility.stories.tsx
```

### Example 4: Force Overwrite
```bash
node tools/generators/component-generator.js Button --force

# Overwrites existing Button component files
```

### Example 5: Complex Component Name
```bash
node tools/generators/component-generator.js UserProfileCard

# Creates: UserProfileCard component with proper naming
```

## Configuration

### Environment Variables
```bash
# Set custom components directory
export COMPONENTS_DIR="src/ui/components"

# Set custom template directory (advanced)
export TEMPLATES_DIR="custom-templates/component"
```

### Configuration Object
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

### Custom Templates
You can modify the built-in templates by editing the `templates` object in the script:

```javascript
const templates = {
  component: `/* Your custom component template */`,
  test: `/* Your custom test template */`,
  story: `/* Your custom story template */`,
  styles: `/* Your custom styles template */`,
  index: `/* Your custom index template */`,
};
```

## Output and Results

### Successful Generation
```text
🚀 Generating component: UserCard

✅ Created UserCard.tsx
✅ Created UserCard.test.tsx
✅ Created UserCard.module.css
✅ Created index.ts
✅ Created UserCard.stories.tsx

✨ Component UserCard generated successfully!

📁 Files created:
   src/components/UserCard/
   ├── UserCard.tsx
   ├── UserCard.test.tsx
   ├── UserCard.stories.tsx
   ├── UserCard.module.css
   └── index.ts

🎯 Next steps:
   1. Import component: import { UserCard } from 'src/components/UserCard';
   2. Run tests: npm test UserCard
   3. View in Storybook: npm run storybook
```

### File Already Exists
```text
🚀 Generating component: Button

⚠️  Skipping Button.tsx (already exists)
⚠️  Skipping Button.test.tsx (already exists)
⚠️  Skipping Button.module.css (already exists)
⚠️  Skipping index.ts (already exists)
⚠️  Skipping Button.stories.tsx (already exists)

✨ Component Button generated successfully!
```

### Generated Component Example
```typescript
// Button.tsx
import * as React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Button component
 * 
 * @example
 * <Button onClick={() => alert('clicked')}>
 *   Click me
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`${styles.container} ${className}`}
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

Button.displayName = 'Button';
```

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "g:component": "node tools/generators/component-generator.js",
    "g:c": "node tools/generators/component-generator.js",
    "generate:ui": "node tools/generators/component-generator.js --dir src/ui",
    "generate:layout": "node tools/generators/component-generator.js --dir src/layout"
  }
}
```

### Common Workflow
```bash
# 1. Generate component
npm run g:c UserProfile

# 2. Implement specific functionality
# Edit src/components/UserProfile/UserProfile.tsx

# 3. Run tests
npm test UserProfile

# 4. View in Storybook
npm run storybook

# 5. Import and use
# import { UserProfile } from './components/UserProfile';
```

### IDE Integration
**VS Code Tasks** (`.vscode/tasks.json`):
```json
{
  "label": "Generate Component",
  "type": "shell",
  "command": "node",
  "args": [
    "tools/generators/component-generator.js",
    "${input:componentName}"
  ],
  "group": "build",
  "presentation": {
    "echo": true,
    "reveal": "always",
    "panel": "new"
  }
}
```

### Git Workflow
```bash
# Generate component
npm run g:c FeatureCard

# Review generated files
git status
git diff

# Commit the scaffold
git add src/components/FeatureCard/
git commit -m "feat: add FeatureCard component scaffold"

# Implement and test
# ... development work ...

# Commit implementation
git add .
git commit -m "feat: implement FeatureCard with user data display"
```

## Error Handling and Troubleshooting

### Common Errors

#### Invalid Component Name
```text
❌ Component name must be in PascalCase (e.g., MyComponent)
```
**Solutions**:
```bash
# Correct formats
node tools/generators/component-generator.js Button         # ✅
node tools/generators/component-generator.js UserProfile   # ✅
node tools/generators/component-generator.js Modal2        # ✅

# Incorrect formats
node tools/generators/component-generator.js button        # ❌
node tools/generators/component-generator.js user-profile  # ❌
node tools/generators/component-generator.js User Profile  # ❌
```

#### Directory Creation Failed
```text
❌ Failed to create directory: EACCES: permission denied
```
**Solutions**:
```bash
# Check permissions
ls -la src/
ls -la src/components/

# Fix permissions
chmod 755 src/components/

# Use sudo if necessary (not recommended)
sudo node tools/generators/component-generator.js Button
```

#### Template Compilation Errors
```text
❌ Failed to create Button.tsx: Template compilation failed
```
**Solutions**:
```bash
# Check Handlebars syntax in templates
# Verify all {{name}} placeholders are correct
# Check for syntax errors in template strings
```

### Debug Mode
Add debug logging to troubleshoot issues:
```javascript
// Temporary debug addition
console.log('Config:', config);
console.log('Component name:', name);
console.log('Output directory:', componentDir);
```

## API and Programmatic Usage

### Node.js Integration
```javascript
const path = require('path');
const generateComponent = require('./tools/generators/component-generator');

// Programmatic generation
async function createComponents() {
  const components = ['Button', 'Card', 'Modal'];
  
  for (const name of components) {
    try {
      await generateComponent(name, {
        force: false,
        noStorybook: false,
        dir: 'src/ui/components'
      });
      console.log(`✅ Generated ${name}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error);
    }
  }
}

createComponents();
```

### Batch Generation
```javascript
const fs = require('fs').promises;
const path = require('path');

// Generate components from a list
async function batchGenerate() {
  const componentsList = await fs.readFile('components.txt', 'utf-8');
  const components = componentsList.split('\n').filter(Boolean);
  
  for (const component of components) {
    const [name, ...options] = component.split(' ');
    
    process.argv = [
      'node', 
      'component-generator.js', 
      name,
      ...options
    ];
    
    // Execute generator
    require('./tools/generators/component-generator.js');
  }
}
```

### Custom Template Generation
```javascript
const Handlebars = require('handlebars');

// Create custom component with different template
function generateCustomComponent(name, customTemplate) {
  const compiledTemplate = Handlebars.compile(customTemplate);
  const content = compiledTemplate({ name });
  
  // Write to file
  const filePath = `src/components/${name}/${name}.tsx`;
  return fs.writeFile(filePath, content);
}

// Usage
const customTemplate = `
export const {{name}} = () => {
  return <div>Custom {{name}}</div>;
};
`;

generateCustomComponent('CustomButton', customTemplate);
```

## Development and Contributing

### Project Structure
```text
tools/generators/component-generator.js
├── Configuration (config object)
├── Templates (templates object)
├── Handlebars helpers
├── generateComponent() function
├── CLI setup (commander)
└── Template compilation
```

### Adding New File Types
To add a new file type to generated components:

1. **Add to Configuration**:
```javascript
const config = {
  fileExtensions: {
    // ... existing
    hook: ".hook.tsx",  // New file type
  },
};
```

2. **Add Template**:
```javascript
const templates = {
  // ... existing
  hook: `import { useState, useEffect } from 'react';

export const use{{name}} = () => {
  // Custom hook implementation
  return {};
};`,
};
```

3. **Add to Files Array**:
```javascript
const files = [
  // ... existing files
  { 
    name: `use${name}${config.fileExtensions.hook}`, 
    template: templates.hook 
  },
];
```

### Custom Handlebars Helpers
```javascript
// Add new text transformation helpers
Handlebars.registerHelper("snakeCase", (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
});

Handlebars.registerHelper("upperCase", (str) => {
  return str.toUpperCase();
});

// Usage in templates
// {{snakeCase name}} -> user_profile_card
// {{upperCase name}} -> USERPROFILECARD
```

### Testing the Generator
```bash
# Test basic generation
node tools/generators/component-generator.js TestComponent

# Test with options
node tools/generators/component-generator.js TestComponent --no-storybook --force

# Verify generated files
ls -la src/components/TestComponent/
cat src/components/TestComponent/TestComponent.tsx

# Clean up test components
rm -rf src/components/TestComponent/
```

### Metrics and Analytics
The generator tracks usage metrics:
```javascript
// Automatic tracking (already included)
const { execSync } = require('child_process');
execSync('node tools/metrics/user-feedback-system.js track-generator component 15', { 
  stdio: 'ignore' 
});
```

## Related Tools and Documentation

- **enhanced-component-generator.js**: Advanced component generator with interactive prompts
- **template-customizer.js**: Framework-specific template customization
- **generator-wrapper.js**: Wrapper for multiple generator types
- **Component Development Guide**: docs/guides/generators/using-generators.md
- **React Patterns**: docs/architecture/patterns/

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines