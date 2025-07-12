# TestCapability Component

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Props Interface](#props-interface)
   4. [Required Props](#required-props)
   5. [Optional Props](#optional-props)
6. [Usage Examples](#usage-examples)
   7. [Basic Usage](#basic-usage)
   8. [State Management](#state-management)
   9. [Accessibility Features](#accessibility-usage)
   10. [Common Patterns](#common-patterns)
       11. [Pattern 1: Interactive Button](#pattern-1-interactive-button)
       12. [Pattern 2: Async Operations](#pattern-2-async-operations)
       13. [Pattern 3: Error Handling](#pattern-3-error-handling)
14. [Styling](#styling)
   15. [CSS Classes](#css-classes)
   16. [Design Tokens](#design-tokens)
   17. [Responsive Design](#responsive-design)
   18. [Customization Example](#customization-example)
19. [States and Behaviors](#states-and-behaviors)
   20. [Component States](#component-states)
   21. [Keyboard Navigation](#keyboard-navigation)
22. [Accessibility](#accessibility)
   23. [ARIA Support](#aria-support)
   24. [Accessibility Features](#accessibility-features)
   25. [Screen Reader Support](#screen-reader-support)
26. [Performance Considerations](#performance-considerations)
27. [Testing](#testing)
   28. [Unit Tests](#unit-tests)
29. [Storybook Stories](#storybook-stories)
30. [Implementation Details](#implementation-details)
   31. [Component Structure](#component-structure)
   32. [Dependencies](#dependencies)
   33. [Browser Support](#browser-support)
34. [Troubleshooting](#troubleshooting)
   35. [Common Issues](#common-issues)
36. [Contributing](#contributing)

## Overview

TestCapability is an advanced interactive React component designed for testing user interface capabilities including
buttons, inputs, toggles, and other interactive elements. It provides comprehensive state management, accessibility
features, and responsive design patterns.

**Component Type**: Functional  
**Category**: Interactive/Testing  
**Complexity**: Medium

## Quick Start

```tsx
import { TestCapability } from './TestCapability';

function App() {
  return (
    <TestCapability 
      ariaLabel="Interactive test element"
      disabled={false}
    >
      Interactive Content
    </TestCapability>
  );
}
```

## Props Interface

```typescript
export interface TestCapabilityProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Disabled state */
  disabled?: boolean;
  /** Accessible label */
  ariaLabel?: string;
  /** Aria described by ID */
  ariaDescribedBy?: string;
  /** Test ID for testing */
  testId?: string;
}
```

### Required Props
None - all props are optional with sensible defaults

### Optional Props
- `children`: Content to display inside the component. Hidden during loading and error states
- `className`: Additional CSS classes for custom styling
- `isLoading`: When true, displays a loading spinner instead of content
- `error`: Error message string. When provided, displays error state instead of content
- `disabled`: When true, makes the component non-interactive with visual indication
- `ariaLabel`: Accessible label for screen readers
- `ariaDescribedBy`: ID of element that describes this component
- `testId`: Custom test identifier (defaults to 'test-capability')

## Usage Examples

### Basic Usage

```tsx
<TestCapability>
  Basic interactive content
</TestCapability>
```

### State Management

```tsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

<TestCapability
  isLoading={isLoading}
  error={error}
  disabled={isLoading}
>
  Content with state management
</TestCapability>
```

### Accessibility Usage

```tsx
<TestCapability
  ariaLabel="Submit form data"
  ariaDescribedBy="submit-help-text"
  testId="form-submit-button"
>
  Submit
</TestCapability>
<div id="submit-help-text">
  This will save your changes and send the form
</div>
```

### Common Patterns

#### Pattern 1: Interactive Button
```tsx
// Use for testing button interactions
<TestCapability 
  ariaLabel="Test button functionality"
  testId="button-test"
>
  Click to test button behavior
</TestCapability>
```

#### Pattern 2: Async Operations
```tsx
// Handle async operations with loading and error states
const handleAsyncAction = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    await performAsyncOperation();
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

<TestCapability
  isLoading={isLoading}
  error={error}
  disabled={isLoading}
>
  Async Action
</TestCapability>
```

#### Pattern 3: Error Handling
```tsx
// Display and handle error states
<TestCapability
  error="Network connection failed"
  testId="network-test"
>
  Network Test Component
</TestCapability>
```

## Styling

### CSS Classes

The component applies these CSS classes:

```css
.container {
  /* Base styles using design tokens */
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
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

.container[aria-disabled="true"] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading state */
.loading {
  position: relative;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Error state */
.error {
  background-color: var(--color-error-background);
  border: 1px solid var(--color-error);
  color: var(--color-error);
}
```

### Design Tokens

The component uses a comprehensive design token system:

```css
/* Spacing tokens */
--spacing-sm: 0.5rem;
--spacing-md: 1rem;

/* Color tokens */
--color-background: #ffffff;
--color-background-hover: #f5f5f5;
--color-text: #333333;
--color-primary: #007bff;
--color-error: #dc3545;
--color-error-background: #f8d7da;

/* Typography tokens */
--font-size-base: 1rem;
--line-height-base: 1.5;

/* Border radius tokens */
--radius-md: 0.375rem;
```

### Responsive Design

```css
/* Mobile optimization */
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
}
```

### Customization Example

```css
/* Override design tokens for custom styling */
.my-custom-capability {
  --color-background: #e3f2fd;
  --color-background-hover: #bbdefb;
  --color-primary: #1976d2;
  --spacing-md: 1.5rem;
}
```

## States and Behaviors

### Component States
- **Default**: Interactive button-like element with hover and focus effects
- **Loading**: Displays animated spinner, content hidden, minimum height maintained
- **Error**: Red styling with error message, original content hidden
- **Disabled**: Reduced opacity, no interaction, cursor changes to not-allowed
- **Focus**: Visible outline for keyboard navigation
- **Hover**: Slight background change and upward translation effect

### Keyboard Navigation
- `Tab`: Navigate to component (unless disabled)
- `Enter`: Activate component (role="button" behavior)
- `Space`: Activate component (role="button" behavior)

## Accessibility

### ARIA Support
- `role="button"` for interactive elements
- `aria-disabled` for disabled state
- `aria-label` for accessible naming
- `aria-describedby` for additional descriptions
- `role="alert"` for error messages

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support with proper tab order
- **Screen Reader**: Comprehensive ARIA attributes and semantic markup
- **Focus Management**: Clear focus indicators that meet contrast requirements
- **Loading States**: Accessible loading announcements
- **Error Handling**: Alert role for immediate error communication

### Screen Reader Support
```tsx
// Example with full accessibility features
<TestCapability
  ariaLabel="Save document"
  ariaDescribedBy="save-description"
  isLoading={isSaving}
  error={saveError}
  testId="save-button"
>
  Save Document
</TestCapability>
<div id="save-description">
  Saves the current document to your account
</div>
```

## Performance Considerations

- Efficient state management with early returns for loading/error states
- CSS animations respect `prefers-reduced-motion` user preference
- Design tokens enable efficient style updates across themes
- Minimal re-renders through proper prop handling
- Loading state prevents unnecessary content rendering

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { TestCapability } from './TestCapability';

describe('TestCapability', () => {
  it('renders children correctly', () => {
    render(<TestCapability>Test Content</TestCapability>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const { container } = render(<TestCapability disabled>Disabled</TestCapability>);
    expect(container.firstChild).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows loading state', () => {
    render(<TestCapability isLoading>Content</TestCapability>);
    expect(screen.getByTestId('test-capability-loading')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('displays error state', () => {
    render(<TestCapability error="Test error">Content</TestCapability>);
    expect(screen.getByRole('alert')).toHaveTextContent('Test error');
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('applies custom accessibility attributes', () => {
    render(
      <TestCapability 
        ariaLabel="Custom label"
        ariaDescribedBy="description"
        testId="custom-id"
      >
        Content
      </TestCapability>
    );
    
    const element = screen.getByTestId('custom-id');
    expect(element).toHaveAttribute('aria-label', 'Custom label');
    expect(element).toHaveAttribute('aria-describedby', 'description');
  });
});
```

## Storybook Stories

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { TestCapability } from './TestCapability';

const meta: Meta<typeof TestCapability> = {
  title: 'Interactive/TestCapability',
  component: TestCapability,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
component: 'Advanced interactive component for testing UI capabilities with state management and accessibility features'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    error: { control: 'text' },
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Interactive Content',
  },
};

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
};

export const WithAccessibility: Story = {
  args: {
    children: 'Accessible Button',
    ariaLabel: 'Perform important action',
    ariaDescribedBy: 'help-text',
  },
};
```

## Implementation Details

### Component Structure

```text
TestCapability/
├── TestCapability.tsx          # Main component file
├── TestCapability.module.css   # Component styles with design tokens
├── TestCapability.test.tsx     # Comprehensive unit tests
├── TestCapability.stories.tsx  # Storybook stories
└── index.ts                    # Export file (if present)
```

### Dependencies
- React: ^18.0.0
- CSS Modules: Built-in support required
- Design Token System: CSS custom properties

### Browser Support
- Modern browsers (ES2018+)
- Full accessibility features in browsers supporting ARIA
- Responsive design works in all modern mobile browsers

## Troubleshooting

### Common Issues

**Issue**: Loading spinner not visible  
**Solution**: Ensure `isLoading` prop is set to `true` and CSS animations are enabled

**Issue**: Error state not displaying  
**Solution**: Check that `error` prop contains a string value (not null or undefined)

**Issue**: Accessibility warnings  
**Solution**: Provide `ariaLabel` for interactive elements and ensure proper ARIA attributes

**Issue**: Custom styling not applying  
**Solution**: Verify design token overrides and CSS module imports are correct

**Issue**: Disabled state not working  
**Solution**: Check `disabled` prop is boolean `true` and CSS supports `aria-disabled` selectors

**Issue**: Focus outline not visible  
**Solution**: Ensure focus-visible styles are not overridden and contrast meets accessibility guidelines

## Contributing

### Development Setup

```bash
# Install dependencies
npm install

# Start development server with Storybook
npm run storybook

# Run tests
npm run test TestCapability

# Run accessibility tests
npm run test:a11y
```

### Code Style
- Follow project ESLint configuration
- Use TypeScript for all component code
- Implement comprehensive ARIA support
- Write tests for all state combinations
- Maintain design token consistency
- Support responsive design patterns

---

**Last Updated**: 2025-07-12  
**Component Version**: 1.0.0  
**Maintainer**: ProjectTemplate Team  
**Status**: Stable