# Examples Directory

**Purpose**: Read-only reference implementations and patterns for AI development

## What's Here

- **Code Examples**: Demonstrating specific AI integration patterns
- **Anti-Patterns**: Examples of what NOT to do (for educational purposes)
- **Implementation References**: Showing best practices for common scenarios
- **Pattern Libraries**: Reusable code snippets and utilities

## Directory Structure

```
examples/
├── ai-nextjs-reference/     # Complete Next.js AI integration examples
├── react-vite/             # React + Vite AI patterns
├── good-patterns/           # Best practices demonstrations
│   ├── authentication/     # Auth patterns for AI apps
│   ├── data-fetching/      # AI data fetching patterns
│   ├── error-handling/     # AI error handling strategies
│   └── state-management/   # State management for AI features
├── anti-patterns/          # What to avoid (educational)
│   ├── claude-code-specific/ # Claude Code anti-patterns
│   ├── maintenance/        # Hard-to-maintain code examples
│   ├── performance/        # Performance mistakes
│   └── security/           # Security vulnerabilities
└── ui-patterns/            # UI component patterns
    ├── data-display/       # Data visualization components
    ├── feedback/           # Loading and feedback UI
    ├── forms/              # AI-enhanced form patterns
    └── overlays/           # Modal and overlay patterns
```

## Available Examples

### 1. ai-nextjs-reference/
Complete AI integration patterns:
- OpenAI and Anthropic API integration
- Streaming chat interfaces
- Vector embeddings and search
- Vision analysis with GPT-4V

### 2. react-vite/
Frontend AI patterns:
- React components for AI features
- State management for AI responses
- Real-time streaming interfaces
- Error handling and loading states

## How to Use

Each example includes:
- Complete implementation following template patterns
- README with setup instructions
- Docker Compose for local development
- Example tests and documentation

### Quick Start
```bash
# Copy an example
cp -r examples/nextjs-postgres ../my-new-project
cd ../my-new-project

# Remove example-specific files
rm -rf .git
git init

# Install and start
npm install
npm run dev
```

## Adding New Examples

To add a new example:
1. Create a new directory with descriptive name
2. Implement using template patterns
3. Include comprehensive README
4. Add to this index with description
5. Test complete setup flow

## Example Requirements

Each example should demonstrate:
- ✅ Proper project structure
- ✅ AI-friendly documentation
- ✅ Security optimal practices
- ✅ Testing setup
- ✅ Development workflow
- ✅ Error handling patterns
- ✅ State management
- ✅ API patterns