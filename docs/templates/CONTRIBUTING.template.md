# Contributing to [Project Name]

First off, thank you for considering contributing to [Project Name]! It's people like you that make this project such a
effective tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to
uphold this code. Please report unacceptable behavior to [email].

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is optimal for the community
- Showing empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/[project-name].git`
3. Add upstream remote: `git remote add upstream https://github.com/[original-owner]/[project-name].git`
4. Create a branch: `git checkout -b feature/your-feature-name`

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as
many details as possible:

**Bug Report Template:**

```markdown
### Description

[Clear description of the bug]

### Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior

[What should happen]

### Actual Behavior

[What actually happens]

### Screenshots

[If applicable]

### Environment

- OS: [e.g. macOS 13.0]
- Node version: [e.g. 18.16.0]
- Browser: [e.g. Chrome 114]
- Project version: [e.g. 1.2.3]

### Additional Context

[Any other relevant information]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed functionality
- Explain why this enhancement would be useful
- List any similar features in other projects

### Your First Code Contribution

Unsure where to begin? Look for these labels:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `easy` - Should be simple to implement
- `documentation` - Documentation improvements

### Pull Requests

1. Ensure your code follows the style guidelines
2. Include tests for new functionality
3. Update documentation as needed
4. Fill out the PR template completely

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+ or yarn 1.22+
- Git

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

### Project Structure

```text
src/
├── features/      # Feature modules
├── components/    # Shared components
├── lib/          # Utilities
├── hooks/        # Custom hooks
└── types/        # TypeScript types
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- user.test.ts
```

## Style Guidelines

### TypeScript/JavaScript

We use ESLint and Prettier. Run `npm run lint:fix` to auto-format.

Key conventions:

- Use functional components and hooks
- Prefer `const` over `let`
- Use TypeScript types, not `any`
- Named exports for components

Example:

```typescript
// Good
export const UserProfile: FC<UserProfileProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Component logic

  return <div>...</div>;
};

// Bad
export default function UserProfile(props: any) {
  let loading = false;
  // ...
}
```

### CSS/Styling

- Use CSS Modules or styled-components
- Follow BEM naming convention
- Mobile-first responsive design
- Use CSS variables for theming

### File Naming

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase with `.types.ts` (e.g., `User.types.ts`)
- Tests: Same as file with `.test.ts` (e.g., `formatDate.test.ts`)

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```bash
feat(auth): add OAuth2 login support

fix(api): handle null response in user endpoint

docs: update installation instructions

refactor(utils): simplify date formatting logic
```

## Pull Request Process

1. **Update your fork**

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make your changes**
   - Write code
   - Add tests
   - Update docs

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add functional feature"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature
   ```

6. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill out the PR template
   - Link any related issues

### PR Template

```markdown
## Description

[Brief description of changes]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code

## Screenshots (if applicable)

[Add screenshots for UI changes]

## Related Issues

Closes #[issue number]
```

### Review Process

1. Automated checks must pass
2. At least one maintainer review required
3. All conversations must be resolved
4. Branch must be up to date with main

## Recognition

### Contributors

We recognize all contributors in our README. Contributions include:

- Code
- Documentation
- Bug reports
- Feature suggestions
- Reviews
- Translations
- Design

### Hall of Fame

Special recognition for:

- First-time contributors
- Significant features
- Consistent contributions
- Community leadership

## Community

### Getting Help

- Discord: [Join our server](https://discord.gg/[invite])
- GitHub Discussions: [Ask questions](https://github.com/[owner]/[project]/discussions)
- Stack Overflow: Tag with `[project-name]`

### Weekly Meetings

- When: Thursdays at 3 PM UTC
- Where: Discord voice channel
- Agenda: GitHub Discussions

### Roadmap

See our [public roadmap](https://github.com/[owner]/[project]/projects/1) for planned features.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE
file).

## Questions?

Don't hesitate to ask! We're here to help. You can:

- Open an issue with the `question` label
- Ask in Discord
- Email maintainers at [email]

Thank you for contributing! 🎉
