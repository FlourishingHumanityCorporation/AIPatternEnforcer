# React + Vite + TypeScript Configuration Template

This template provides a complete, production-ready configuration for modern React applications using Vite, TypeScript,
and industry optimal practices.

## Table of Contents

1. [What's Included](#whats-included)
  2. [Core Configuration Files](#core-configuration-files)
  3. [Features](#features)
4. [Usage](#usage)
  5. [Apply Template to New Project](#apply-template-to-new-project)
  6. [Template Variables](#template-variables)
  7. [Generated Project Structure](#generated-project-structure)
  8. [Available Scripts](#available-scripts)
9. [Path Mapping](#path-mapping)
10. [Testing Setup](#testing-setup)
11. [Environment Variables](#environment-variables)
12. [Optimal Practices Enforced](#optimal-practices-enforced)
  13. [Code Quality](#code-quality)
  14. [Performance](#performance)
  15. [Developer Experience  ](#developer-experience-)
16. [Integration with Config Enforcer](#integration-with-config-enforcer)
17. [Customization](#customization)
  18. [Adding Dependencies](#adding-dependencies)
  19. [Modifying Configuration](#modifying-configuration)
20. [Troubleshooting](#troubleshooting)
  21. [Common Issues](#common-issues)
  22. [Getting Help](#getting-help)

## What's Included

### Core Configuration Files
- **package.json** - Optimized scripts and dependencies for React + Vite development
- **tsconfig.json** - Strict TypeScript configuration with path mapping
- **vite.config.ts** - Vite build configuration with React plugin and optimizations
- **.eslintrc.json** - ESLint rules for React and TypeScript
- **.prettierrc** - Code formatting configuration
- **src/test-setup.ts** - Vitest testing environment setup
- **.env.example** - Environment variables template

### Features
✅ **TypeScript** - Strict configuration with path mapping (@/ aliases)  
✅ **Vite** - Fast build tool with HMR and optimizations  
✅ **ESLint** - Code quality rules for React and TypeScript  
✅ **Prettier** - Consistent code formatting  
✅ **Vitest** - Modern testing framework with jsdom  
✅ **Path Mapping** - Clean imports with @ aliases  
✅ **Environment Variables** - Structured env var management  
✅ **Pre-commit Ready** - Husky integration configured  

## Usage

### Apply Template to New Project

```bash
# Using the config enforcer (when implemented)
npm run apply:template react-vite

# Manual application
cp templates/config/react-vite/*.hbs ./
# Process handlebars templates with your project variables
```

### Template Variables

When applying this template, you'll be prompted for:

- **projectName** - Name of your project (e.g., "my-effective-app")
- **description** - Brief project description
- **author** - Your name or organization  
- **license** - Project license (default: MIT)

### Generated Project Structure

```text
my-project/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── assets/
│   └── test-setup.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .eslintrc.json
├── .prettierrc
└── .env.example
```

### Available Scripts

After applying the template:

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run lint         # Lint code with ESLint
npm run lint:fix     # Fix linting issues
npm run type-check   # Check TypeScript types
npm run format       # Format code with Prettier
npm run check:all    # Run all quality checks
```

## Path Mapping

The template configures path aliases for clean imports:

```typescript
// Instead of relative imports
import Button from '../../components/ui/Button'
import { formatDate } from '../../../utils/date'

// Use clean absolute imports
import Button from '@/components/ui/Button'
import { formatDate } from '@/utils/date'
```

## Testing Setup

The template includes Vitest configuration with:
- **jsdom environment** - For React component testing
- **Testing Library integration** - Jest DOM matchers included
- **Coverage reporting** - Built-in coverage analysis
- **UI mode** - Visual test runner interface

## Environment Variables

All environment variables use the `VITE_` prefix and are documented in `.env.example`:

```env
VITE_APP_TITLE=My React App
VITE_API_BASE_URL=http://localhost:3001/api
```

## Optimal Practices Enforced

### Code Quality
- **Strict TypeScript** - No `any` types, unused variables caught
- **ESLint Rules** - React Hooks rules, TypeScript recommendations
- **Prettier Formatting** - Consistent code style across team

### Performance
- **Code Splitting** - Vendor chunks separated for better caching
- **Tree Shaking** - Unused code automatically removed
- **Source Maps** - Debugging support in production builds

### Developer Experience  
- **Fast Refresh** - Instant updates during development
- **Type Checking** - Real-time TypeScript validation
- **Auto-fixing** - Automated code formatting and linting

## Integration with Config Enforcer

This template is designed to work with the ProjectTemplate config enforcer:

- **Validation** - All generated configs pass enforcer checks
- **Auto-fixing** - Compatible with automated config fixing
- **Cross-file Validation** - Template ensures file consistency
- **Optimal Practices** - Follows ProjectTemplate conventions

## Customization

### Adding Dependencies

After applying the template, you can customize by:

1. **UI Libraries** - Add Material-UI, Chakra UI, etc.
2. **Routing** - Install React Router
3. **State Management** - Add Redux, Zustand, etc.
4. **API Clients** - Configure Axios, TanStack Query, etc.

### Modifying Configuration

All configuration files are heavily commented and can be customized:

- **vite.config.ts** - Adjust build settings, plugins
- **tsconfig.json** - Modify TypeScript strictness  
- **.eslintrc.json** - Add or remove linting rules
- **package.json** - Customize scripts and dependencies

## Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Change port in vite.config.ts or use different port
npm run dev -- --port 3001
```

**Import path not resolved**:
```bash
# Check tsconfig.json paths configuration
# Ensure baseUrl and paths are correctly set
```

**Tests not running**:
```bash
# Verify test-setup.ts is in src/
# Check vitest configuration in vite.config.ts
```

### Getting Help

- Check the [Config Enforcer Guide](../../../docs/guides/config-enforcement/config-enforcer-guide.md)
- Review [ProjectTemplate Documentation](../../../DOCS_INDEX.md)
- Run config validation: `npm run check:config`

---

**Note**: This template is part of the ProjectTemplate system and follows all ProjectTemplate conventions and optimal
practices.