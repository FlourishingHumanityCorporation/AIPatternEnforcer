# {COMPONENT_NAME} Component

## Overview

{COMPONENT_DESCRIPTION}

**Component Type**: {COMPONENT_TYPE}  
**Location**: `components/{COMPONENT_NAME}/`

## Usage

### Basic Usage

```tsx
import { {COMPONENT_NAME} } from './components/{COMPONENT_NAME}';

function App() {
  return (
    <{COMPONENT_NAME}>
      {BASIC_USAGE_EXAMPLE}
    </{COMPONENT_NAME}>
  );
}
```

### With Props

```tsx
import { {COMPONENT_NAME} } from './components/{COMPONENT_NAME}';

function App() {
  return (
    <{COMPONENT_NAME}
      {PROP_EXAMPLE_1}={PROP_VALUE_1}
      {PROP_EXAMPLE_2}={PROP_VALUE_2}
      className="custom-style"
    >
      {ADVANCED_USAGE_EXAMPLE}
    </{COMPONENT_NAME}>
  );
}
```

## Props

| Prop              | Type                   | Default                    | Required                 | Description                 |
| ----------------- | ---------------------- | -------------------------- | ------------------------ | --------------------------- |
| `children`        | `React.ReactNode`      | `undefined`                | No                       | Primary content             |
| `className`       | `string`               | `""`                       | No                       | Additional CSS classes      |
| `testId`          | `string`               | `"{COMPONENT_KEBAB_NAME}"` | No                       | Test identifier             |
| `{CUSTOM_PROP_1}` | `{CUSTOM_PROP_1_TYPE}` | `{CUSTOM_PROP_1_DEFAULT}`  | {CUSTOM_PROP_1_REQUIRED} | {CUSTOM_PROP_1_DESCRIPTION} |
| `{CUSTOM_PROP_2}` | `{CUSTOM_PROP_2_TYPE}` | `{CUSTOM_PROP_2_DEFAULT}`  | {CUSTOM_PROP_2_REQUIRED} | {CUSTOM_PROP_2_DESCRIPTION} |

## Examples

### Default State

```tsx
<{COMPONENT_NAME}>
  Default content
</{COMPONENT_NAME}>
```

### {EXAMPLE_STATE_1}

```tsx
<{COMPONENT_NAME} {EXAMPLE_PROP_1}={EXAMPLE_VALUE_1}>
  {EXAMPLE_STATE_1_CONTENT}
</{COMPONENT_NAME}>
```

### {EXAMPLE_STATE_2}

```tsx
<{COMPONENT_NAME}
  {EXAMPLE_PROP_2}={EXAMPLE_VALUE_2}
  {EXAMPLE_PROP_3}={EXAMPLE_VALUE_3}
>
  {EXAMPLE_STATE_2_CONTENT}
</{COMPONENT_NAME}>
```

## Styling

### CSS Classes

The component uses CSS modules for styling. Available CSS classes:

- `.container` - Main component wrapper
- `.{STYLE_CLASS_1}` - {STYLE_CLASS_1_DESCRIPTION}
- `.{STYLE_CLASS_2}` - {STYLE_CLASS_2_DESCRIPTION}

### Custom Styling

```css
/* Override default styles */
.{COMPONENT_KEBAB_NAME} {
  /* Custom styles */
}

/* Target specific elements */
.{COMPONENT_KEBAB_NAME} .custom-element {
  /* Element-specific styles */
}
```

### CSS Variables

```css
.{COMPONENT_KEBAB_NAME} {
  --{COMPONENT_KEBAB_NAME}-{CSS_VAR_1}: {CSS_VAR_1_DEFAULT};
  --{COMPONENT_KEBAB_NAME}-{CSS_VAR_2}: {CSS_VAR_2_DEFAULT};
}
```

## Testing

### Unit Tests

Tests are located in `{COMPONENT_NAME}.test.tsx`. Run tests with:

```bash
npm test {COMPONENT_NAME}
```

### Test Examples

```tsx
import { render, screen } from '@testing-library/react';
import { {COMPONENT_NAME} } from './{COMPONENT_NAME}';

test('renders with default props', () => {
  render(<{COMPONENT_NAME}>Test content</{COMPONENT_NAME}>);
  expect(screen.getByTestId('{COMPONENT_KEBAB_NAME}')).toBeInTheDocument();
});
```

## Accessibility

### ARIA Support

- Uses semantic HTML elements
- Includes proper ARIA labels and roles
- Supports keyboard navigation
- Compatible with screen readers

### Keyboard Navigation

| Key       | Action         |
| --------- | -------------- |
| `{KEY_1}` | {KEY_1_ACTION} |
| `{KEY_2}` | {KEY_2_ACTION} |

## Storybook

View component stories in Storybook:

```bash
npm run storybook
```

Stories location: `{COMPONENT_NAME}.stories.tsx`

Available stories:

- Default
- {STORY_1}
- {STORY_2}

## File Structure

```
components/{COMPONENT_NAME}/
├── {COMPONENT_NAME}.tsx           # Component implementation
├── {COMPONENT_NAME}.test.tsx      # Unit tests
├── {COMPONENT_NAME}.stories.tsx   # Storybook stories
├── {COMPONENT_NAME}.module.css    # Component styles
├── index.ts                       # Exports
└── README.md                      # Component documentation
```

## Dependencies

### Required Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

### Development Dependencies

```json
{
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@storybook/react": "^9.0.0"
}
```

## Related Components

- `{RELATED_COMPONENT_1}` - {RELATED_COMPONENT_1_DESCRIPTION}
- `{RELATED_COMPONENT_2}` - {RELATED_COMPONENT_2_DESCRIPTION}

## Design System

Part of the {DESIGN_SYSTEM_NAME} design system:

- **Category**: {COMPONENT_CATEGORY}
- **Variants**: {COMPONENT_VARIANTS}
- **Design Tokens**: Uses standard spacing, colors, and typography tokens

## Changelog

### Version {COMPONENT_VERSION}

- Initial component implementation
- Basic props and styling
- Unit tests and Storybook stories
- Accessibility support

---

**Generated**: {DATE}  
**Component Type**: {COMPONENT_TYPE}  
**Template Version**: 1.0.0
