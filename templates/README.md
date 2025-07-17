# Templates Directory

**Purpose**: Code generation templates used by generators to create new files and components

## What's Here

- **Component Templates**: Handlebars templates for generating React components
- **API Templates**: Templates for creating API routes and services
- **Configuration Templates**: Framework-specific configuration files
- **Documentation Templates**: Templates for generating project documentation
- **Hook Templates**: Templates for React custom hooks

## Directory Structure

```
templates/
├── component/              # React component templates
│   ├── Component.tsx.hbs   # Main component template
│   ├── Component.test.tsx.hbs # Test template
│   ├── Component.stories.tsx.hbs # Storybook template
│   ├── Component.module.css.hbs # CSS module template
│   └── index.ts.hbs        # Export index template
├── api/                    # API generation templates
│   ├── Controller.ts.hbs   # API controller template
│   ├── Repository.ts.hbs   # Data repository template
│   ├── Routes.ts.hbs       # Route definitions
│   ├── Schema.ts.hbs       # Validation schemas
│   └── Tests.ts.hbs        # API test template
├── hooks/                  # React hooks templates
│   ├── use{{name}}.ts.hbs  # Custom hook template
│   └── use{{name}}.test.ts.hbs # Hook test template
├── documentation/          # Documentation templates
│   ├── README.md           # Project README template
│   ├── API.md              # API documentation template
│   ├── COMPONENT-README.md # Component documentation
│   └── GUIDE.md            # Guide template
├── config/                 # Configuration templates
│   └── react-vite/         # Vite configuration templates
└── next-ai-unified/        # Unified AI starter template
    ├── app/                # Next.js App Router structure
    ├── components/         # Pre-built AI components
    ├── lib/                # Shared utilities
    └── package.json        # Dependency configuration
```

## How Generators Use Templates

### 1. Component Generation
```bash
npm run g:c MyComponent
```
Uses templates from `templates/component/` to create:
- `components/MyComponent/MyComponent.tsx`
- `components/MyComponent/MyComponent.test.tsx`
- `components/MyComponent/MyComponent.stories.tsx`
- `components/MyComponent/MyComponent.module.css`
- `components/MyComponent/index.ts`

### 2. API Generation
```bash
npm run g:api UserService
```
Uses templates from `templates/api/` to create:
- `app/api/users/route.ts` (controller)
- `lib/services/UserService.ts` (service)
- `lib/repositories/UserRepository.ts` (repository)
- `__tests__/api/users.test.ts` (tests)

### 3. Hook Generation
```bash
npm run g:hook useUserData
```
Uses templates from `templates/hooks/` to create:
- `lib/hooks/useUserData.ts`
- `lib/hooks/useUserData.test.ts`

## Template Syntax

Templates use Handlebars syntax with these variables:
- `{{name}}` - The provided name (e.g., "MyComponent")
- `{{pascalCase name}}` - PascalCase version
- `{{camelCase name}}` - camelCase version
- `{{kebabCase name}}` - kebab-case version
- `{{description}}` - Optional description
- `{{timestamp}}` - Current timestamp

Example template snippet:
```handlebars
import React from 'react';
import { render, screen } from '@testing-library/react';
import { {{pascalCase name}} } from './{{pascalCase name}}';

describe('{{pascalCase name}}', () => {
  it('renders correctly', () => {
    render(<{{pascalCase name}} />);
    expect(screen.getByRole('{{kebabCase name}}')).toBeInTheDocument();
  });
});
```

## Key Differences

| Directory | Purpose | Usage |
|-----------|---------|-------|
| **examples/** | Reference & learning | Read-only patterns and code snippets |
| **templates/** | Code generation | Used by generators to create new files |
| **starters/** | Project foundation | Copy-paste ready complete projects |

## Adding New Templates

When creating new templates:
1. Use `.hbs` extension for Handlebars templates
2. Include comprehensive placeholders for customization
3. Follow existing naming conventions
4. Test template generation works correctly
5. Add corresponding generator logic if needed

## Template Categories

### 1. Basic Templates
Simple file templates for common patterns

### 2. Framework Templates
Complete project structures for specific frameworks

### 3. AI-Specific Templates
Templates optimized for AI development patterns:
- Chat interfaces
- Document processing
- Vision analysis
- Vector search components