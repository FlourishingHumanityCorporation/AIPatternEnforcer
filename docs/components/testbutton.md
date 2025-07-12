# TestButton Component

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Props Interface](#props-interface)
   4. [Required Props](#required-props)
   5. [Optional Props](#optional-props)
6. [Usage Examples](#usage-examples)
   7. [Basic Usage](#basic-usage)
   8. [With Props](#with-props)
   9. [Common Patterns](#common-patterns)
      10. [Pattern 1: Clickable Content](#pattern-1-clickable-content)
      11. [Pattern 2: Display Container](#pattern-2-display-container)
13. [Styling](#styling)
   14. [CSS Classes](#css-classes)
   15. [CSS Custom Properties](#css-custom-properties)
   16. [Customization Example](#customization-example)
17. [States and Behaviors](#states-and-behaviors)
   18. [Component States](#component-states)
   19. [Keyboard Navigation](#keyboard-navigation)
20. [Accessibility](#accessibility)
   21. [ARIA Support](#aria-support)
   22. [Accessibility Features](#accessibility-features)
23. [Performance Considerations](#performance-considerations)
24. [Testing](#testing)
   25. [Unit Tests](#unit-tests)
26. [Storybook Stories](#storybook-stories)
27. [Implementation Details](#implementation-details)
   28. [Component Structure](#component-structure)
   29. [Dependencies](#dependencies)
   30. [Browser Support](#browser-support)
31. [Troubleshooting](#troubleshooting)
   32. [Common Issues](#common-issues)
33. [Contributing](#contributing)

## Overview

TestButton is a versatile React component that renders a styled container with optional click functionality. It
automatically transforms into an interactive button when an onClick handler is provided, while maintaining accessibility
standards.

**Component Type**: Functional  
**Category**: UI/Interactive  
**Complexity**: Simple

## Quick Start

```tsx
import { TestButton } from './TestButton';

function App() {
  return (
    <TestButton onClick={() => console.log('clicked')}>
      Click me!
    </TestButton>
  );
}
```

## Props Interface

```typescript
export interface TestButtonProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}
```

### Required Props
None - all props are optional

### Optional Props
- `children`: Content to display inside the component. Can be text, elements, or other React components
- `className`: Additional CSS classes to apply to the component for custom styling
- `onClick`: Function to execute when the component is clicked or activated via keyboard

## Usage Examples

### Basic Usage

```tsx
<TestButton>
  Basic content display
</TestButton>
```

### With Props

```tsx
<TestButton
  className="custom-styling"
  onClick={() => alert('Button clicked!')}
>
  Interactive button with custom styling
</TestButton>
```

### Common Patterns

#### Pattern 1: Clickable Content
```tsx
// Use as an interactive button
<TestButton onClick={() => handleAction()}>
  Perform Action
</TestButton>
```

#### Pattern 2: Display Container
```tsx
// Use as a styled content container
<TestButton className="info-panel">
  <h3>Information</h3>
  <p>Content without interaction</p>
</TestButton>
```

## Styling

### CSS Classes

The component applies these CSS classes:

```css
.container {
  /* Base styles */
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
```

### CSS Custom Properties

```css
.container {
  --background-secondary: #f5f5f5;
  --background-hover: #ebebeb;
  --focus-color: #0066cc;
}
```

### Customization Example

```css
/* Override default styles */
.my-custom-testbutton {
  --background-secondary: #e3f2fd;
  --background-hover: #bbdefb;
  --focus-color: #1976d2;
  border: 1px solid #90caf9;
}
```

## States and Behaviors

### Component States
- **Default**: Static container with light background and padding
- **Hover**: Slightly darker background color when mouse hovers over
- **Focus**: Visible outline when focused via keyboard navigation
- **Active**: Slightly scaled down when clicked (for clickable instances)
- **Non-interactive**: No special states when onClick is not provided

### Keyboard Navigation
- `Tab`: Navigate to component (only when onClick is provided)
- `Enter`: Activate onClick handler
- `Space`: Activate onClick handler

## Accessibility

### ARIA Support
- Component includes `role="button"` when interactive
- Supports keyboard navigation with proper tabIndex
- Focus management for keyboard users

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support when interactive
- **Focus Indicators**: Clear focus visualization with outline
- **Semantic Roles**: Proper ARIA roles based on functionality
- **Non-interactive State**: No confusing interactive indicators when not clickable

## Performance Considerations

- Lightweight component with minimal re-render triggers
- Efficient conditional role and event handler application
- CSS transitions optimized for smooth interactions
- Responsive design with mobile-optimized padding

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TestButton } from './TestButton';

describe('TestButton', () => {
  it('renders children correctly', () => {
    render(<TestButton>Test Content</TestButton>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<TestButton onClick={handleClick}>Clickable</TestButton>);
    
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events when clickable', () => {
    const handleClick = vi.fn();
    render(<TestButton onClick={handleClick}>Clickable</TestButton>);
    
    const element = screen.getByText('Clickable');
    fireEvent.keyDown(element, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(element, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
```

## Storybook Stories

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { TestButton } from './TestButton';

const meta: Meta<typeof TestButton> = {
  title: 'Components/TestButton',
  component: TestButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default TestButton',
  },
};

export const Clickable: Story = {
  args: {
    children: 'Click me!',
    onClick: () => { /* Handle TestButton click */ },
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Styled TestButton',
    className: 'custom-styling',
  },
};
```

## Implementation Details

### Component Structure

```text
TestButton/
├── TestButton.tsx          # Main component file
├── TestButton.module.css   # Component styles
├── TestButton.test.tsx     # Unit tests
├── TestButton.stories.tsx  # Storybook stories
└── index.ts                # Export file (if present)
```

### Dependencies
- React: ^18.0.0
- CSS Modules: Built-in support required

### Browser Support
- Modern browsers (ES2018+)
- IE11 support: No

## Troubleshooting

### Common Issues

**Issue**: Component doesn't respond to clicks  
**Solution**: Ensure `onClick` prop is provided. Component only becomes interactive when onClick is supplied.

**Issue**: Keyboard navigation not working  
**Solution**: Verify that onClick handler is provided - keyboard support is only active for clickable instances.

**Issue**: Custom styles not applying  
**Solution**: Check that CSS module imports are correct and custom className is being passed properly.

**Issue**: Focus outline not visible  
**Solution**: Ensure your CSS doesn't override focus-visible styles and that focus-color custom property is set.

## Contributing

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run storybook

# Run tests
npm run test TestButton

# Run component in isolation
npm run dev
```

### Code Style
- Follow project ESLint configuration
- Use TypeScript for all component code
- Include comprehensive prop documentation with JSDoc comments
- Write unit tests for all interactive features
- Maintain accessibility standards

---

**Last Updated**: 2025-07-12  
**Component Version**: 1.0.0  
**Maintainer**: ProjectTemplate Team  
**Status**: Stable