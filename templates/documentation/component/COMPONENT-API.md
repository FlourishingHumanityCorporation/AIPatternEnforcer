# {COMPONENT_NAME} API Reference

## Component Interface

```typescript
interface {COMPONENT_NAME}Props {
  /** Primary content */
  children?: React.ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Test identifier for testing */
  testId?: string;

  /** {CUSTOM_PROP_1_DESCRIPTION} */
  {CUSTOM_PROP_1}?: {CUSTOM_PROP_1_TYPE};

  /** {CUSTOM_PROP_2_DESCRIPTION} */
  {CUSTOM_PROP_2}?: {CUSTOM_PROP_2_TYPE};

  /** {CUSTOM_PROP_3_DESCRIPTION} */
  {CUSTOM_PROP_3}?: {CUSTOM_PROP_3_TYPE};
}
```

## Props Documentation

### Core Props

#### `children`

- **Type**: `React.ReactNode`
- **Default**: `undefined`
- **Required**: No
- **Description**: Primary content to render inside the component

**Example**:

```tsx
<{COMPONENT_NAME}>
  <p>Content goes here</p>
</{COMPONENT_NAME}>
```

#### `className`

- **Type**: `string`
- **Default**: `""`
- **Required**: No
- **Description**: Additional CSS classes to apply to the component

**Example**:

```tsx
<{COMPONENT_NAME} className="custom-styling">
  Content
</{COMPONENT_NAME}>
```

#### `testId`

- **Type**: `string`
- **Default**: `"{COMPONENT_KEBAB_NAME}"`
- **Required**: No
- **Description**: Test identifier for automated testing

**Example**:

```tsx
<{COMPONENT_NAME} testId="custom-test-id">
  Content
</{COMPONENT_NAME}>
```

### Component-Specific Props

#### `{CUSTOM_PROP_1}`

- **Type**: `{CUSTOM_PROP_1_TYPE}`
- **Default**: `{CUSTOM_PROP_1_DEFAULT}`
- **Required**: {CUSTOM_PROP_1_REQUIRED}
- **Description**: {CUSTOM_PROP_1_DESCRIPTION}

**Values**:
{CUSTOM_PROP_1_VALUES}

**Example**:

```tsx
<{COMPONENT_NAME} {CUSTOM_PROP_1}={CUSTOM_PROP_1_EXAMPLE}>
  Content
</{COMPONENT_NAME}>
```

#### `{CUSTOM_PROP_2}`

- **Type**: `{CUSTOM_PROP_2_TYPE}`
- **Default**: `{CUSTOM_PROP_2_DEFAULT}`
- **Required**: {CUSTOM_PROP_2_REQUIRED}
- **Description**: {CUSTOM_PROP_2_DESCRIPTION}

**Example**:

```tsx
<{COMPONENT_NAME} {CUSTOM_PROP_2}={CUSTOM_PROP_2_EXAMPLE}>
  Content
</{COMPONENT_NAME}>
```

#### `{CUSTOM_PROP_3}`

- **Type**: `{CUSTOM_PROP_3_TYPE}`
- **Default**: `{CUSTOM_PROP_3_DEFAULT}`
- **Required**: {CUSTOM_PROP_3_REQUIRED}
- **Description**: {CUSTOM_PROP_3_DESCRIPTION}

**Example**:

```tsx
<{COMPONENT_NAME} {CUSTOM_PROP_3}={CUSTOM_PROP_3_EXAMPLE}>
  Content
</{COMPONENT_NAME}>
```

## Event Handlers

### `{EVENT_HANDLER_1}`

- **Type**: `{EVENT_HANDLER_1_TYPE}`
- **Description**: {EVENT_HANDLER_1_DESCRIPTION}

**Parameters**:

- `{EVENT_PARAM_1}`: `{EVENT_PARAM_1_TYPE}` - {EVENT_PARAM_1_DESCRIPTION}
- `{EVENT_PARAM_2}`: `{EVENT_PARAM_2_TYPE}` - {EVENT_PARAM_2_DESCRIPTION}

**Example**:

```tsx
<{COMPONENT_NAME}
  {EVENT_HANDLER_1}={({EVENT_PARAM_1}, {EVENT_PARAM_2}) => {
    console.log('Event triggered:', {EVENT_PARAM_1}, {EVENT_PARAM_2});
  }}
>
  Content
</{COMPONENT_NAME}>
```

### `{EVENT_HANDLER_2}`

- **Type**: `{EVENT_HANDLER_2_TYPE}`
- **Description**: {EVENT_HANDLER_2_DESCRIPTION}

**Example**:

```tsx
<{COMPONENT_NAME}
  {EVENT_HANDLER_2}={(event) => {
    // Handle event
  }}
>
  Content
</{COMPONENT_NAME}>
```

## CSS Classes

### Default Classes

The component applies these CSS classes automatically:

- `.container` - Main wrapper element
- `.{CSS_CLASS_1}` - {CSS_CLASS_1_DESCRIPTION}
- `.{CSS_CLASS_2}` - {CSS_CLASS_2_DESCRIPTION}

### Conditional Classes

Classes applied based on props:

| Condition       | Class                    | Description                       |
| --------------- | ------------------------ | --------------------------------- |
| `{CONDITION_1}` | `.{CONDITIONAL_CLASS_1}` | {CONDITIONAL_CLASS_1_DESCRIPTION} |
| `{CONDITION_2}` | `.{CONDITIONAL_CLASS_2}` | {CONDITIONAL_CLASS_2_DESCRIPTION} |

## CSS Variables

### Available Variables

```css
.{COMPONENT_KEBAB_NAME} {
  --{COMPONENT_KEBAB_NAME}-{CSS_VAR_1}: {CSS_VAR_1_DEFAULT};
  --{COMPONENT_KEBAB_NAME}-{CSS_VAR_2}: {CSS_VAR_2_DEFAULT};
  --{COMPONENT_KEBAB_NAME}-{CSS_VAR_3}: {CSS_VAR_3_DEFAULT};
}
```

### Variable Descriptions

#### `--{COMPONENT_KEBAB_NAME}-{CSS_VAR_1}`

- **Default**: `{CSS_VAR_1_DEFAULT}`
- **Description**: {CSS_VAR_1_DESCRIPTION}
- **Values**: {CSS_VAR_1_VALUES}

#### `--{COMPONENT_KEBAB_NAME}-{CSS_VAR_2}`

- **Default**: `{CSS_VAR_2_DEFAULT}`
- **Description**: {CSS_VAR_2_DESCRIPTION}
- **Values**: {CSS_VAR_2_VALUES}

## TypeScript Support

### Type Exports

```typescript
// Import component and types
import { {COMPONENT_NAME}, type {COMPONENT_NAME}Props } from './components/{COMPONENT_NAME}';

// Use in your component
const MyComponent: React.FC = () => {
  const props: {COMPONENT_NAME}Props = {
    {CUSTOM_PROP_1}: {CUSTOM_PROP_1_EXAMPLE},
    {CUSTOM_PROP_2}: {CUSTOM_PROP_2_EXAMPLE},
  };

  return <{COMPONENT_NAME} {...props}>Content</{COMPONENT_NAME}>;
};
```

### Generic Types

```typescript
// If component uses generics
interface {COMPONENT_NAME}Props<T = any> {
  data?: T;
  onSelect?: (item: T) => void;
}

// Usage with specific type
const TypedComponent = () => {
  return (
    <{COMPONENT_NAME}<User>
      data={userData}
      onSelect={(user) => console.log(user.name)}
    />
  );
};
```

## Refs and Imperative API

### Ref Usage

```typescript
import { useRef } from 'react';
import { {COMPONENT_NAME} } from './components/{COMPONENT_NAME}';

const MyComponent = () => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    componentRef.current?.focus();
  };

  return (
    <{COMPONENT_NAME} ref={componentRef}>
      Content
    </{COMPONENT_NAME}>
  );
};
```

### Imperative Methods

If the component exposes imperative methods:

```typescript
interface {COMPONENT_NAME}Ref {
  {METHOD_1}: ({METHOD_1_PARAMS}) => {METHOD_1_RETURN};
  {METHOD_2}: ({METHOD_2_PARAMS}) => {METHOD_2_RETURN};
}

// Usage
const componentRef = useRef<{COMPONENT_NAME}Ref>(null);

// Call imperative method
componentRef.current?.{METHOD_1}({METHOD_1_ARGS});
```

## Error Boundaries

### Error Handling

The component handles these error scenarios:

- **{ERROR_SCENARIO_1}**: {ERROR_SCENARIO_1_DESCRIPTION}
- **{ERROR_SCENARIO_2}**: {ERROR_SCENARIO_2_DESCRIPTION}

### Error Props

```typescript
interface {COMPONENT_NAME}Props {
  onError?: (error: Error) => void;
  fallback?: React.ComponentType<{ error: Error }>;
}
```

## Performance Considerations

### Memoization

The component is optimized for performance:

```typescript
import { memo } from 'react';

const Optimized{COMPONENT_NAME} = memo({COMPONENT_NAME});
```

### Prop Optimization

For optimal performance:

- **Stable References**: Use `useCallback` for event handlers
- **Memoized Values**: Use `useMemo` for complex calculations
- **Avoid Inline Objects**: Define objects outside render function

**Example**:

```tsx
const MyComponent = () => {
  const handleClick = useCallback(() => {
    // Handle click
  }, []);

  const complexData = useMemo(() => {
    return processData(rawData);
  }, [rawData]);

  return (
    <{COMPONENT_NAME}
      onClick={handleClick}
      data={complexData}
    >
      Content
    </{COMPONENT_NAME}>
  );
};
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: {BROWSER_FEATURES_USED}

## Migration Guide

### From Previous Versions

#### Version {PREVIOUS_VERSION} → {CURRENT_VERSION}

**Breaking Changes**:

- `{BREAKING_CHANGE_1}` → `{BREAKING_CHANGE_1_NEW}`
- `{BREAKING_CHANGE_2}` removed

**Migration Steps**:

1. Update prop names: `{OLD_PROP}` → `{NEW_PROP}`
2. Update event handlers: `{OLD_EVENT}` → `{NEW_EVENT}`
3. Update CSS classes: `.{OLD_CLASS}` → `.{NEW_CLASS}`

**Before**:

```tsx
<{COMPONENT_NAME} {OLD_PROP}={value} {OLD_EVENT}={handler} />
```

**After**:

```tsx
<{COMPONENT_NAME} {NEW_PROP}={value} {NEW_EVENT}={handler} />
```

---

**API Version**: {API_VERSION}  
**Component Version**: {COMPONENT_VERSION}  
**Last Updated**: {DATE}
