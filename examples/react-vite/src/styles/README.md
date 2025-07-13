# Design System

This directory contains the design token system for AIPatternEnforcer. Design tokens are the visual design atoms of the
design system — specifically, they are named entities that store visual design attributes.

## Table of Contents

1. [Structure](#structure)
2. [Usage](#usage)
  3. [In Your Application](#in-your-application)
  4. [In CSS Modules](#in-css-modules)
5. [Token Categories](#token-categories)
  6. [Colors](#colors)
  7. [Typography](#typography)
  8. [Spacing](#spacing)
  9. [Border Radius](#border-radius)
  10. [Shadows](#shadows)
  11. [Animation](#animation)
  12. [Z-Index](#z-index)
13. [Dark Mode](#dark-mode)
14. [Extending the System](#extending-the-system)
15. [Optimal Practices](#optimal-practices)

## Structure

- `tokens.css` - All design tokens as CSS custom properties
- `globals.css` - Global styles and CSS reset
- `index.css` - Main entry point

## Usage

### In Your Application

Import the design system in your main application file:

```typescript
// In your main App.tsx or index.tsx
import "@/styles/index.css";
```

### In CSS Modules

Use the design tokens in your component styles:

```css
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: background-color var(--duration-fast) var(--easing-base);
}

.button:hover {
  background-color: var(--color-primary-dark);
}
```

## Token Categories

### Colors

- Primary, error, success, warning colors
- Background and text colors
- Border colors
- Alpha variants for transparency

### Typography

- Font sizes (xs to 3xl)
- Line heights
- Font weights
- Font families

### Spacing

- Consistent spacing scale (xs to 3xl)
- Used for padding, margins, gaps

### Border Radius

- Radius scale (sm to 2xl, plus full)
- Used for rounded corners

### Shadows

- Shadow scale (sm to 2xl)
- Used for elevation and depth

### Animation

- Duration tokens (fast, base, slow)
- Easing functions

### Z-Index

- Layering scale for modals, tooltips, etc.

## Dark Mode

The design system supports dark mode through:

1. **Automatic**: Uses `prefers-color-scheme` media query
2. **Manual**: Add `data-theme="dark"` to the root element

## Extending the System

To add new tokens:

1. Add them to the appropriate section in `tokens.css`
2. Follow the naming convention: `--category-name-variant`
3. Document the token in this README
4. Update components to use the new token

## Optimal Practices

1. **Always use tokens** - Never hardcode values
2. **Semantic naming** - Use `--color-primary` not `--color-blue`
3. **Consistent scale** - Follow the existing size/spacing patterns
4. **Document changes** - Update this README when adding tokens
