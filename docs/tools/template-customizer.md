# Template Customizer Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
  4. [Prerequisites](#prerequisites)
  5. [Installation](#installation)
6. [Command Line Interface](#command-line-interface)
  7. [Basic Syntax](#basic-syntax)
  8. [Options](#options)
  9. [Examples](#examples)
10. [Framework Configurations](#framework-configurations)
  11. [React Configuration](#react-configuration)
  12. [Next.js Configuration](#nextjs-configuration)
  13. [Express Configuration](#express-configuration)
14. [Presets](#presets)
  15. [Available Presets](#available-presets)
    16. [enterprise-react](#enterprise-react)
    17. [minimal-react](#minimal-react)
    18. [nextjs-commerce](#nextjs-commerce)
    19. [express-microservice](#express-microservice)
  20. [Creating Custom Presets](#creating-custom-presets)
21. [Customization Process](#customization-process)
  22. [Step 1: Framework Selection](#step-1-framework-selection)
  23. [Step 2: Feature Configuration](#step-2-feature-configuration)
  24. [Step 3: Dependency Management](#step-3-dependency-management)
  25. [Step 4: Project Structure](#step-4-project-structure)
26. [Output and Results](#output-and-results)
  27. [Generated Structure (React Example)](#generated-structure-react-example)
  28. [Modified Files](#modified-files)
29. [Integration Features](#integration-features)
  30. [Git Integration](#git-integration)
  31. [NPM Scripts Added](#npm-scripts-added)
  32. [VS Code Configuration](#vs-code-configuration)
33. [Advanced Usage](#advanced-usage)
  34. [Configuration File](#configuration-file)
  35. [Programmatic API](#programmatic-api)
36. [Error Handling](#error-handling)
  37. [Common Issues](#common-issues)
    38. [Issue: "Framework not supported"](#issue-framework-not-supported)
    39. [Issue: "Dependency conflicts"](#issue-dependency-conflicts)
    40. [Issue: "File already exists"](#issue-file-already-exists)
41. [Performance Optimization](#performance-optimization)
  42. [Fast Mode](#fast-mode)
  43. [Caching](#caching)
44. [Testing](#testing)
  45. [Unit Tests](#unit-tests)
  46. [Integration Tests](#integration-tests)
47. [Optimal Practices](#optimal-practices)
48. [Related Tools](#related-tools)

## Overview

A powerful framework customization tool that adapts the ProjectTemplate for specific technology stacks. This tool
transforms the base template into specialized configurations for React, Next.js, Express, or other frameworks while
maintaining ProjectTemplate's core standards and practices.

**Tool Type**: CLI/Configuration Tool  
**Language**: JavaScript  
**Dependencies**: fs-extra, inquirer, chalk, glob

## Quick Start

```bash
# Interactive mode
node tools/generators/template-customizer.js

# Direct framework selection
node tools/generators/template-customizer.js --framework react
node tools/generators/template-customizer.js --framework nextjs
node tools/generators/template-customizer.js --framework express

# With preset
node tools/generators/template-customizer.js --preset enterprise-react
```

## Installation and Setup

### Prerequisites
- Node.js >=18.0.0
- npm >=9.0.0
- Clean ProjectTemplate installation
- Git repository (for version control)

### Installation
The template customizer is included in ProjectTemplate:
```bash
npm install
```

## Command Line Interface

### Basic Syntax
```bash
node tools/generators/template-customizer.js [options]
```

### Options
- `--framework <name>`: Target framework (react|nextjs|express|vue|angular)
- `--preset <name>`: Use predefined configuration preset
- `--output <path>`: Custom output directory (default: current)
- `--config <path>`: Load configuration from file
- `--skip-install`: Skip dependency installation
- `--dry-run`: Preview changes without applying
- `--verbose`: Show detailed operation logs

### Examples
```bash
# Interactive framework selection
node tools/generators/template-customizer.js

# React with TypeScript
node tools/generators/template-customizer.js --framework react --preset typescript

# Next.js enterprise setup
node tools/generators/template-customizer.js --framework nextjs --preset enterprise

# Express API template
node tools/generators/template-customizer.js --framework express --preset api

# Preview changes
node tools/generators/template-customizer.js --framework vue --dry-run
```

## Framework Configurations

### React Configuration
```javascript
{
  framework: 'react',
  features: {
    typescript: true,
    routing: 'react-router',
    stateManagement: 'context',
    styling: 'css-modules',
    testing: 'jest-rtl',
    bundler: 'vite'
  },
  dependencies: [
    'react',
    'react-dom',
    'react-router-dom'
  ],
  devDependencies: [
    '@types/react',
    '@testing-library/react',
    '@vitejs/plugin-react'
  ],
  structure: {
    'src/': {
      'components/': {},
      'hooks/': {},
      'pages/': {},
      'utils/': {},
      'styles/': {}
    }
  }
}
```

### Next.js Configuration
```javascript
{
  framework: 'nextjs',
  features: {
    typescript: true,
    api: true,
    ssr: true,
    styling: 'styled-components',
    testing: 'jest-rtl',
    deployment: 'vercel'
  },
  dependencies: [
    'next',
    'react',
    'react-dom',
    'styled-components'
  ],
  structure: {
    'pages/': {
      'api/': {},
      '_app.tsx': 'template:nextjs/app',
      'index.tsx': 'template:nextjs/index'
    },
    'components/': {},
    'lib/': {},
    'public/': {},
    'styles/': {}
  }
}
```

### Express Configuration
```javascript
{
  framework: 'express',
  features: {
    typescript: true,
    database: 'postgres',
    orm: 'prisma',
    authentication: 'jwt',
    validation: 'joi',
    documentation: 'swagger'
  },
  dependencies: [
    'express',
    'cors',
    'helmet',
    'compression',
    'express-rate-limit'
  ],
  structure: {
    'src/': {
      'controllers/': {},
      'middleware/': {},
      'models/': {},
      'routes/': {},
      'services/': {},
      'utils/': {}
    }
  }
}
```

## Presets

### Available Presets

#### enterprise-react
Full-featured React setup with:
- TypeScript strict mode
- Redux Toolkit for state
- React Query for data fetching
- Material-UI components
- Comprehensive testing setup
- CI/CD configurations

#### minimal-react
Lightweight React configuration:
- JavaScript (no TypeScript)
- Basic routing
- CSS modules
- Essential testing only

#### nextjs-commerce
E-commerce oriented Next.js:
- TypeScript
- Stripe integration ready
- Tailwind CSS
- Prisma ORM setup
- Auth.js configured

#### express-microservice
Microservice-ready Express:
- TypeScript
- Docker configuration
- Kubernetes manifests
- Health checks
- OpenAPI documentation

### Creating Custom Presets
```javascript
// presets/my-custom-preset.js
module.exports = {
  name: 'my-custom-preset',
  framework: 'react',
  description: 'Custom React configuration',
  features: {
    // Feature configuration
  },
  dependencies: [
    // Required packages
  ],
  scripts: {
    // NPM scripts to add
  },
  files: {
    // Files to create/modify
  }
};
```

## Customization Process

### Step 1: Framework Selection
```text
? Select target framework: (Use arrow keys)
❯ React - Modern React application
  Next.js - Full-stack React framework
  Express - Node.js web framework
  Vue - Progressive JavaScript framework
  Angular - Platform for web applications
  Custom - Define your own configuration
```

### Step 2: Feature Configuration
```text
? Select features to include: (Press <space> to select)
❯◉ TypeScript - Add type safety
 ◉ ESLint - Code linting
 ◉ Prettier - Code formatting
 ◯ Docker - Container support
 ◯ CI/CD - GitHub Actions
 ◯ E2E Testing - Cypress/Playwright
```

### Step 3: Dependency Management
```text
? Select additional libraries:
❯◉ State Management (Redux/MobX/Zustand)
 ◯ UI Component Library
 ◯ Form Handling
 ◯ Animation Library
 ◯ Utility Libraries
```

### Step 4: Project Structure
The tool automatically:
1. Creates framework-specific directories
2. Generates configuration files
3. Updates package.json
4. Creates example components
5. Sets up development environment

## Output and Results

### Generated Structure (React Example)
```text
project-root/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── features/
│   │   └── layout/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── styles/
│   ├── utils/
│   └── App.tsx
├── public/
├── tests/
├── .env.example
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Modified Files
- `package.json`: Updated with framework dependencies
- `tsconfig.json`: Framework-specific TypeScript config
- `.eslintrc.json`: Framework-specific linting rules
- `README.md`: Updated with framework instructions
- Configuration files for selected bundler

## Integration Features

### Git Integration
```bash
# Commits changes automatically
git add .
git commit -m "feat: customize template for React with TypeScript"
```

### NPM Scripts Added
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

### VS Code Configuration
Automatically updates:
- `.vscode/settings.json`
- `.vscode/extensions.json`
- `.vscode/launch.json`

## Advanced Usage

### Configuration File
```javascript
// template-config.js
module.exports = {
  framework: 'react',
  preset: 'enterprise',
  features: {
    typescript: true,
    testing: {
      framework: 'jest',
      coverage: true,
      e2e: 'playwright'
    },
    styling: {
      solution: 'styled-components',
      theme: true
    }
  },
  customize: {
    packageJson: {
      scripts: {
        'test:watch': 'jest --watch'
      }
    }
  }
};

// Usage
node tools/generators/template-customizer.js --config template-config.js
```

### Programmatic API
```javascript
const TemplateCustomizer = require('./tools/generators/template-customizer');

const customizer = new TemplateCustomizer({
  framework: 'nextjs',
  output: './my-nextjs-app',
  features: {
    typescript: true,
    tailwind: true
  }
});

await customizer.customize();
```

## Error Handling

### Common Issues

#### Issue: "Framework not supported"
**Solution**:
```bash
# Check supported frameworks
node tools/generators/template-customizer.js --list-frameworks

# Use custom configuration
node tools/generators/template-customizer.js --framework custom
```

#### Issue: "Dependency conflicts"
**Solution**:
```bash
# Skip auto-install and resolve manually
node tools/generators/template-customizer.js --skip-install

# Then manually install and resolve
npm install
```

#### Issue: "File already exists"
**Solution**:
```bash
# Use force flag (careful!)
node tools/generators/template-customizer.js --force

# Or backup first
cp -r . ../project-backup
```

## Performance Optimization

### Fast Mode
```bash
# Skip optional features for speed
node tools/generators/template-customizer.js --fast

# Minimal installation
node tools/generators/template-customizer.js --minimal
```

### Caching
- Templates cached in `.template-cache/`
- Dependencies cached for offline use
- Configuration presets stored locally

## Testing

### Unit Tests
```bash
npm test tools/generators/template-customizer.test.js
```

### Integration Tests
```bash
# Test all framework configurations
npm run test:template-customizer

# Test specific framework
npm run test:template-customizer -- --framework react
```

## Optimal Practices

1. **Always review changes** with `--dry-run` first
2. **Commit before customizing** to track changes
3. **Test the generated setup** immediately
4. **Document customizations** in project README
5. **Keep presets updated** with latest optimal practices

## Related Tools

- **stack-decision-wizard.js**: Helps choose the right framework
- **component-generator.js**: Generate framework-specific components
- **project-init**: Full project initialization
- **create-project.js**: Project creation from templates

---

**Last Updated**: 2025-07-12  
**Version**: 2.0.0  
**Maintainer**: ProjectTemplate Team