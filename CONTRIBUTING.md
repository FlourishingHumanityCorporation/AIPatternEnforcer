# Contributing to AIPatternEnforcer

Thank you for your interest in contributing to AIPatternEnforcer! This guide helps you get started with 
contributing to our AI development methodology kit.

## Table of Contents

1. [🎯 Quick Contribution Guide](#-quick-contribution-guide)
2. [📋 Before You Contribute](#-before-you-contribute)
3. [🚀 Making Contributions](#-making-contributions)
4. [🧪 Testing Your Changes](#-testing-your-changes)
5. [📝 Documentation Updates](#-documentation-updates)
6. [💡 Enhancement Ideas](#-enhancement-ideas)

## 🎯 Quick Contribution Guide

1. **Read [CLAUDE.md](CLAUDE.md)** - Understand our AI development rules
2. **Follow test-first development** - Write tests before implementation
3. **Use generators** - Don't create boilerplate manually
4. **Check existing code** - Avoid duplicating functionality

## 📋 Before You Contribute

### Required Reading

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive development rules (MANDATORY)
- **[README.md](README.md)** - Project overview and structure
- **[FRICTION-MAPPING.md](FRICTION-MAPPING.md)** - Common problems and solutions
- **[docs/README.md](docs/README.md)** - Documentation navigation hub

### Development Setup

```bash
# Clone the repository
git clone [repository-url] projecttemplate
cd projecttemplate

# Install dependencies and enforcement hooks
npm install
npm run setup:hooks

# Run tests to verify setup
npm test
```

## 🚀 Making Contributions

### 1. Find Something to Work On

- Check [Issues](https://github.com/[org]/projecttemplate/issues) for open tasks
- Look for `good-first-issue` labels for newcomers
- Review [DOCUMENTATION_ROADMAP.md](docs/DOCUMENTATION_ROADMAP.md) for documentation needs

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Follow Development Standards

#### Code Standards

- **NEVER create `*_improved`, `*_v2`, `*_enhanced` files** - Edit originals
- **ALWAYS use specific imports** - No wildcard imports
- **ALWAYS write tests first** - See [Test-First Development](CLAUDE.md#test-first-development)
- **ALWAYS use generators** - `npm run g:component ComponentName`

#### Documentation Standards

- Use technical, timeless language
- No superlatives ("functional", "complete", "operational" preferred)
- Include code examples under 20 lines
- Add cross-references to related docs

#### Commit Standards

```bash
# Use conventional commits
feat: add new validation rule
fix: correct import path in generator
docs: update API design standards
test: add edge cases for auth flow
```

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Check types
npm run typecheck

# Verify enforcement rules
npm run enforcement:status
```

### 5. Submit Pull Request

#### PR Checklist

- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Documentation updated if needed
- [ ] No console.log statements
- [ ] Follows CLAUDE.md rules
- [ ] Includes tests for new features

#### PR Description Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Related Issues
Fixes #123
```

## 🛠️ Specific Contribution Areas

### Adding Generators

1. Create template in `templates/[type]/`
2. Add generator script in `tools/generators/`
3. Update package.json scripts
4. Document in README.md

### Improving Documentation

1. Follow structure in `docs/`
2. Use existing templates from `docs/templates/`
3. Add to navigation in `docs/README.md`
4. Update cross-references

### Adding Enforcement Rules

1. Edit configuration in `tools/enforcement/`
2. Add tests for new rules
3. Update `.enforcement-config.json`
4. Document in CLAUDE.md

### Updating AI Configurations

1. Modify files in `ai/config/`
2. Test with actual AI tools
3. Update relevant documentation
4. Add examples to `ai/examples/`

## 🐛 Reporting Issues

### Bug Reports

Include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Debug snapshot: `npm run debug:snapshot`
- Environment details

### Feature Requests

Include:
- Problem you're trying to solve
- Proposed solution
- Alternative approaches considered
- Impact on existing functionality

## 💬 Getting Help

- **Documentation**: Start with [docs/README.md](docs/README.md)
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions

## 🏆 Recognition

Contributors are recognized in:
- Git history (use proper commit attribution)
- Release notes (for significant contributions)
- README.md (for major features)

## ⚖️ Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow project standards consistently

---

By contributing, you agree that your contributions will be licensed under the same license as the project.