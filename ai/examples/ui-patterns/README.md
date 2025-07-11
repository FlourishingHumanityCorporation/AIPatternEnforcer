# UI Patterns Library

A comprehensive collection of production-ready UI patterns designed to solve common frontend development challenges when working with AI tools.

## Why These Patterns?

AI tools often generate inconsistent UI code with:

- Missing accessibility features
- Incomplete error handling
- Poor loading states
- Inconsistent styling approaches
- Missing keyboard navigation

These patterns provide complete, tested implementations that AI can reference for better code generation.

## Pattern Categories

### 📝 Forms (`/forms`)

#### Login Form

- **File**: `login-form.tsx`
- **Features**: Client-side validation (Zod), accessible error messages, password visibility toggle, loading states
- **Use Case**: Authentication flows, secure form handling
- **AI Benefit**: Prevents common auth vulnerabilities and accessibility issues

#### Multi-Step Form

- **File**: `multi-step-form.tsx`
- **Features**: Progress tracking, step validation, data persistence, keyboard navigation
- **Use Case**: Onboarding, complex data collection, wizards
- **AI Benefit**: Handles complex state management correctly

### 📊 Data Display (`/data-display`)

#### Data Table

- **File**: `data-table.tsx`
- **Features**: Sorting, pagination, search, row selection, loading states
- **Use Case**: Admin panels, data management, reporting
- **AI Benefit**: Complete implementation prevents partial solutions

### 🎭 Overlays (`/overlays`)

#### Modal Dialog

- **File**: `modal-dialog.tsx`
- **Features**: Focus trapping, escape handling, scroll lock, portal rendering
- **Use Case**: Dialogs, confirmations, forms in overlay
- **AI Benefit**: Proper accessibility and focus management

### 📢 Feedback (`/feedback`)

#### Loading Skeletons

- **File**: `loading-skeletons.tsx`
- **Features**: Multiple variants, smooth animations, respects motion preferences
- **Use Case**: Loading states, progressive enhancement
- **AI Benefit**: Consistent loading patterns across the app

## Usage with AI Tools

### 1. Reference in Prompts

```
Create a user profile form following the pattern in
ai/examples/ui-patterns/forms/multi-step-form.tsx
with these fields: name, email, avatar, bio
```

### 2. Copy Patterns

```bash
# Copy a pattern to your project
cp ai/examples/ui-patterns/forms/login-form.tsx src/features/auth/
```

### 3. Generate Similar Components

```bash
# Use enhanced component generator with template
npm run g:c UserTable --template data

# Then customize using patterns as reference
```

## Pattern Standards

All patterns include:

- ✅ TypeScript with proper types
- ✅ Full accessibility (WCAG 2.1 AA)
- ✅ Loading, error, and empty states
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Performance optimizations
- ✅ Keyboard navigation
- ✅ Screen reader support

## Common Features

### State Management

- Local state for UI
- Controlled components
- Proper error boundaries
- Optimistic updates

### Styling

- CSS Modules with design tokens
- Responsive by default
- Animation with motion preferences
- Theme-aware

### Testing Approach

Each pattern is designed to be easily testable:

- Isolated business logic
- Accessible queries
- Predictable state changes
- Mock-friendly architecture

## Extending Patterns

### Creating New Patterns

1. Identify common UI challenge
2. Create complete implementation
3. Include all states (loading, error, empty)
4. Add accessibility features
5. Document usage and benefits

### Pattern Checklist

- [ ] TypeScript interfaces
- [ ] Loading state
- [ ] Error handling
- [ ] Empty state
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Mobile responsive
- [ ] Dark mode
- [ ] Performance optimized
- [ ] Example usage

## Integration Tips

### With Enhanced Component Generator

```bash
# Generate base component
npm run g:c MyForm --template form

# Then apply patterns from this library
```

### With Existing Projects

1. Copy pattern file
2. Update imports
3. Apply your design tokens
4. Customize for your needs

### With AI Assistants

Always provide pattern reference:

```
Following the data table pattern in
ai/examples/ui-patterns/data-display/data-table.tsx,
create a product inventory table with inline editing
```

## Future Patterns

Planned additions:

- Navigation patterns (breadcrumbs, tabs, steppers)
- Chart components with accessibility
- File upload with progress
- Drag and drop interfaces
- Real-time collaboration UI
- Search with autocomplete
- Infinite scroll
- Virtual lists

## Contributing

When adding new patterns:

1. Solve a real problem
2. Make it complete (all states)
3. Ensure accessibility
4. Add usage examples
5. Document AI benefits
