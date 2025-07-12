[← Back to Documentation](../README.md)

---

# Testing Documentation

Testing frameworks, strategies, and validation for ProjectTemplate.

## Available Documentation

- **[Template Validation Framework](TEMPLATE_VALIDATION_FRAMEWORK.md)** - Comprehensive template testing methodology
- **[VS Code Extension Test Checklist](VSCODE_EXTENSION_TEST_CHECKLIST.md)** - Testing the ProjectTemplate VS Code extension

## Testing Categories

### Template Testing
- Functional validation
- AI integration testing
- User experience testing
- See [Template Validation Framework](TEMPLATE_VALIDATION_FRAMEWORK.md)

### Extension Testing
- VS Code extension functionality
- Real-time validation features
- See [VS Code Extension Test Checklist](VSCODE_EXTENSION_TEST_CHECKLIST.md)

## Running Tests

```bash
# Run all template tests
npm run test:template

# Run specific test categories
npm run test:functional
npm run test:ai
npm run test:ux

# Validate with verbose output
npm run validate
```

## See Also

- [Comprehensive Testing Guide](../guides/testing/comprehensive-testing-guide.md) - General testing patterns
- [Test-First Development](../../CLAUDE.md#test-first-development) - Testing methodology
- [Contributing Guide](../../CONTRIBUTING.md) - How to contribute tests
- [Main Documentation](../README.md)