[← Back to Documentation](../../README.md) | [↑ Up to Guides](../README.md)

---

# New Developer Onboarding

Welcome to the team! This guide will get you productive with our codebase in the shortest time possible.

## Table of Contents

1. [Day 1: Environment Setup](#day-1-environment-setup)
  2. [1. Required Tools](#1-required-tools)
  3. [2. IDE Setup](#2-ide-setup)
  4. [3. Clone and Setup](#3-clone-and-setup)
  5. [4. Verify Setup](#4-verify-setup)
6. [Day 2: Codebase Orientation](#day-2-codebase-orientation)
  7. [Project Structure](#project-structure)
  8. [Key Concepts](#key-concepts)
  9. [Essential Reading](#essential-reading)
10. [Day 3: Development Workflow](#day-3-development-workflow)
  11. [Your First Task](#your-first-task)
  12. [Daily Workflow](#daily-workflow)
  13. [Using AI Effectively](#using-ai-effectively)
    14. [Setting Up AI Tools](#setting-up-ai-tools)
    15. [AI Optimal Practices](#ai-optimal-practices)
  16. [Code Review Process](#code-review-process)
17. [Week 1: Deeper Dive](#week-1-deeper-dive)
  18. [Understanding Our Stack](#understanding-our-stack)
  19. [Common Patterns](#common-patterns)
    20. [Component Pattern](#component-pattern)
    21. [API Pattern](#api-pattern)
  22. [Debugging Skills](#debugging-skills)
23. [Week 2: Contributing](#week-2-contributing)
  24. [Finding Work](#finding-work)
  25. [Creating Quality PRs](#creating-quality-prs)
26. [PR Title Format](#pr-title-format)
27. [PR Description Template](#pr-description-template)
  28. [What](#what)
  29. [Why](#why)
  30. [How](#how)
  31. [Testing](#testing)
  32. [Screenshots](#screenshots)
  33. [Code Quality Standards](#code-quality-standards)
34. [Month 1: Becoming Productive](#month-1-becoming-productive)
  35. [Ownership Areas](#ownership-areas)
  36. [Learning Resources](#learning-resources)
  37. [Performance Expectations](#performance-expectations)
    38. [Week 1](#week-1)
    39. [Week 2](#week-2)
    40. [Week 4](#week-4)
41. [Getting Help](#getting-help)
  42. [When Stuck](#when-stuck)
  43. [Good Questions Include](#good-questions-include)
  44. [Communication Channels](#communication-channels)
45. [Tools and Access](#tools-and-access)
  46. [Required Access](#required-access)
  47. [Helpful Tools](#helpful-tools)
48. [Cultural Fit](#cultural-fit)
  49. [Our Values](#our-values)
  50. [Meeting Rhythm](#meeting-rhythm)
51. [First Month Checklist](#first-month-checklist)
  52. [Week 1](#week-1)
  53. [Week 2](#week-2)
  54. [Week 3](#week-3)
  55. [Week 4](#week-4)
56. [Remember](#remember)

## Day 1: Environment Setup

### 1. Required Tools

```bash
# Check if you have required tools
node --version  # Need 18+
npm --version   # Need 9+
git --version   # Need 2.30+

# Install if missing
brew install node git
```

### 2. IDE Setup

- **Recommended**: [Cursor](https://cursor.sh) or VS Code
- Install extensions:
  - ESLint
  - Prettier
  - TypeScript
  - GitLens
  - Error Lens

### 3. Clone and Setup

```bash
# Clone the repository
git clone [repository-url]
cd [project-name]

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run setup script
npm run setup:dev
```

### 4. Verify Setup

```bash
# Run development server
npm run dev

# In another terminal, run tests
npm test

# Check linting
npm run lint
```

## Day 2: Codebase Orientation

### Project Structure

```text
src/
├── features/       # Feature-based modules
├── components/     # Shared components
├── lib/           # Utilities and helpers
├── hooks/         # Custom React hooks
├── types/         # TypeScript types
├── pages/         # Next.js pages (if applicable)
└── api/           # API routes
```

### Key Concepts

1. **Feature-Based Architecture**: Each feature is self-contained
2. **TypeScript First**: Everything is typed
3. **AI-Assisted Development**: We use AI tools actively
4. **Test-Driven**: Write tests first when possible

### Essential Reading

- [ ] `README.md` - Project overview
- [ ] `CONTRIBUTING.md` - How we work
- [ ] `docs/architecture/decisions/000-core-principles.md` - Core principles
- [ ] `ai/.cursorrules` - AI assistant rules

## Day 3: Development Workflow

### Your First Task

1. Pick a "good first issue" from GitHub
2. Create a branch: `git checkout -b feature/[issue-number]-description`
3. Use AI to help plan implementation
4. Write tests first
5. Implement the feature
6. Create a PR

### Daily Workflow

```bash
# Start your day
git pull origin main
npm install  # In case dependencies changed
npm run dev

# Before committing
npm run ai:check  # Runs all checks

# Create commits
git add -p  # Stage selectively
git commit -m "type: description"
```

### Using AI Effectively

#### Setting Up AI Tools

1. **Cursor IDE**:
   - Settings → AI → Enable
   - Verify `.cursorrules` is loaded
2. **GitHub Copilot**:
   - Install extension
   - Sign in with GitHub

#### AI Optimal Practices

```markdown
# Good prompt

"Create a React component for user avatar following patterns in @components/ui/Button.tsx with TypeScript types and
error handling"

# Bad prompt

"Make an avatar component"
```

### Code Review Process

1. **Self-review** your PR first
2. **Run all checks**: `npm run ai:check`
3. **Update tests** if needed
4. **Request review** from team
5. **Address feedback** promptly

## Week 1: Deeper Dive

### Understanding Our Stack

- **Frontend**: [React/Vue/Angular] with TypeScript
- **State Management**: [Zustand/Redux/MobX]
- **Styling**: [Tailwind/CSS Modules/Styled Components]
- **Testing**: [Jest/Vitest] + [React Testing Library/Cypress]
- **Backend**: [Node.js/Python/Go]
- **Database**: [PostgreSQL/MongoDB]

### Common Patterns

#### Component Pattern

```typescript
// Always follow this structure
export const ComponentName: FC<Props> = ({ prop }) => {
  // Hooks first
  const [state, setState] = useState();

  // Handlers
  const handleClick = () => {};

  // Effects
  useEffect(() => {}, []);

  // Render
  return <div>...</div>;
};
```

#### API Pattern

```typescript
// Always use the API client
import { apiClient } from "@/lib/api";

const fetchData = async () => {
  try {
    const data = await apiClient.users.getAll();
    return data;
  } catch (error) {
    projectLogger.error("Failed to fetch users", { error });
    throw error;
  }
};
```

### Debugging Skills

1. **Use the browser DevTools** effectively
2. **Read error messages** carefully
3. **Check the network tab** for API issues
4. **Use debugger statements** when needed
5. **Ask AI for help** with error messages

## Week 2: Contributing

### Finding Work

- GitHub Issues labeled "good first issue"
- Ask team lead for suggestions
- Fix a bug you encounter
- Improve documentation
- Add missing tests

### Creating Quality PRs

```markdown
## PR Title Format

type(scope): description

Types: feat, fix, docs, style, refactor, test, chore

## PR Description Template

### What

Brief description of changes

### Why

Business/technical reason

### How

Implementation approach

### Testing

How you tested

### Screenshots

If UI changes
```

### Code Quality Standards

- No `console.log` statements
- No commented-out code
- All functions have TypeScript types
- Complex logic has comments
- Tests for new features
- Documentation updated

## Month 1: Becoming Productive

### Ownership Areas

By the end of month 1, you should:

- Own a small feature or component
- Have merged 5+ PRs
- Reviewed others' code
- Updated documentation
- Fixed a production bug

### Learning Resources

- **Internal**:
  - Team wiki
  - Recorded demos
  - Architecture docs
  - Previous PRs
- **External**:
  - TypeScript handbook
  - React documentation
  - Testing optimal practices
  - Our tech stack docs

### Performance Expectations

#### Week 1

- Development environment working
- First PR submitted
- Familiar with codebase structure

#### Week 2

- 2-3 PRs merged
- Participating in code reviews
- Using AI tools effectively

#### Week 4

- Contributing independently
- Helping other developers
- Suggesting improvements

## Getting Help

### When Stuck

1. **Try for 30 minutes** first
2. **Check documentation** and existing code
3. **Ask AI** for suggestions
4. **Ask the team** with specific questions

### Good Questions Include

- What you're trying to do
- What you've tried
- Error messages/behavior
- Relevant code snippets

### Communication Channels

- **Slack #dev**: General development
- **Slack #help**: Quick questions
- **GitHub Issues**: Bug reports
- **Team Meetings**: Architecture discussions

## Tools and Access

### Required Access

- [ ] GitHub repository
- [ ] Slack workspace
- [ ] Cloud provider console
- [ ] Error tracking tool
- [ ] Analytics dashboard
- [ ] CI/CD platform

### Helpful Tools

- **Postman/Insomnia**: API testing
- **TablePlus/DBeaver**: Database GUI
- **React DevTools**: React debugging
- **Redux DevTools**: State debugging

## Cultural Fit

### Our Values

- **Quality over speed** (but ship regularly)
- **Clear communication** over assumptions
- **Automated testing** over manual QA
- **Code reviews** are learning opportunities
- **Documentation** is part of the work

### Meeting Rhythm

- **Daily Standup**: 10am (15 min)
- **Sprint Planning**: Monday (1 hour)
- **Retrospective**: Friday (30 min)
- **1-on-1**: Weekly with manager

## First Month Checklist

### Week 1

- [ ] Environment setup complete
- [ ] First PR submitted
- [ ] Met all team members
- [ ] Read core documentation

### Week 2

- [ ] 3+ PRs merged
- [ ] Reviewed someone else's code
- [ ] Fixed a bug
- [ ] Used AI tools effectively

### Week 3

- [ ] Implemented a small feature
- [ ] Wrote comprehensive tests
- [ ] Updated documentation
- [ ] Participated in planning

### Week 4

- [ ] Working independently
- [ ] Helping others
- [ ] Suggesting improvements
- [ ] Planning next contributions

## Remember

- **Ask questions** - We expect them!
- **Make mistakes** - That's how you learn
- **Share knowledge** - Update docs as you learn
- **Have opinions** - Fresh perspectives are valuable

Welcome aboard! We're excited to have you on the team. 🚀
