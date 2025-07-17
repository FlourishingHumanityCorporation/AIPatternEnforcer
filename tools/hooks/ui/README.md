# UI Framework Validation Hooks

**Category**: `ui/`  
**Environment Variable**: `HOOK_UI`  
**Purpose**: Enforce UI framework best practices and patterns for Tailwind CSS, shadcn/ui, and Radix UI

## Overview

UI Framework hooks ensure consistent and proper usage of modern UI frameworks in the AIPatternEnforcer project. These hooks prevent common anti-patterns and enforce best practices for utility-first CSS, component libraries, and accessibility standards.

## Active Hooks

### 1. tailwind-pattern-enforcer.js

**Purpose**: Enforces Tailwind CSS utility-first patterns and prevents CSS-in-JS mixing

**Validates**:

- Utility-first CSS patterns
- Prevents CSS-in-JS mixing with Tailwind (styled-components, emotion, etc.)
- Ensures consistent spacing and sizing utilities
- Validates responsive breakpoint usage
- Prevents arbitrary value abuse
- Enforces design system compliance
- Detects hardcoded colors and dimensions

**Common Blocks**:

```javascript
// ❌ Blocked: CSS-in-JS
const Button = styled.button`
  background: blue;
`;

// ❌ Blocked: Inline styles
<div style={{ backgroundColor: 'red' }}>

// ❌ Blocked: Too many arbitrary values
<div className="w-[420px] h-[280px] mt-[13px] ml-[27px]">

// ❌ Blocked: Hardcoded colors
<div className="bg-[#1a73e8] text-[#ffffff]">

// ✅ Allowed: Proper Tailwind usage
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 sm:px-6">
```

### 2. shadcn-ui-validator.js (Coming Soon)

**Purpose**: Validates proper shadcn/ui component usage and customization patterns

**Will Validate**:

- Proper component imports from @/components/ui
- Theme consistency with shadcn/ui design system
- Correct variant and size prop usage
- Component composition patterns
- Proper use of cn() utility for conditional classes

### 3. radix-ui-accessibility-checker.js (Coming Soon)

**Purpose**: Ensures Radix UI components maintain accessibility standards

**Will Validate**:

- ARIA attributes on Radix primitives
- Keyboard navigation implementation
- Focus management patterns
- Screen reader compatibility
- Proper use of asChild prop

## Configuration

Enable UI hooks by setting in your `.env` file:

```bash
# Enable UI framework validation
HOOK_UI=true

# Or disable globally
HOOKS_DISABLED=false  # Must be false for any hooks to run
HOOK_UI=true         # Then enable UI category
```

## Testing

Run tests for UI hooks:

```bash
# Test individual hooks
npm test tools/hooks/ui/__tests__/

# Test specific hook
npm test tools/hooks/ui/__tests__/tailwind-pattern-enforcer.test.js
```

## Development Guidelines

When creating new UI hooks:

1. **Focus on Pattern Detection**: Identify common UI anti-patterns specific to each framework
2. **Provide Clear Alternatives**: Always suggest the correct approach
3. **Consider Performance**: UI hooks run frequently, keep them fast
4. **Test Edge Cases**: UI code can be complex, test various scenarios
5. **Document Examples**: Show both blocked and allowed patterns

## Common UI Anti-Patterns

### Tailwind CSS

- Mixing CSS-in-JS with utility classes
- Overusing arbitrary values instead of design tokens
- Inconsistent spacing units (px vs scale)
- Missing responsive variants
- Hardcoded colors instead of theme colors

### shadcn/ui

- Importing from wrong paths
- Modifying component internals instead of using variants
- Inconsistent theme customization
- Breaking component composition patterns

### Radix UI

- Missing accessibility attributes
- Improper focus management
- Breaking keyboard navigation
- Incorrect primitive usage

## Integration with Design System

These hooks help enforce:

- Consistent spacing scale (4, 8, 12, 16, etc.)
- Theme color usage (primary, secondary, destructive)
- Typography scale consistency
- Component variant patterns
- Responsive design patterns

## Resources

- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Accessibility Guide](https://www.radix-ui.com/docs/primitives/guides/accessibility)
