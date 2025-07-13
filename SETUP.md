# 🎯 PROJECT AIPATTERN ENFORCER SETUP GUIDE

This guide helps you customize the AIPatternEnforcer for your specific project.

## Table of Contents

1. [🚀 Quick Setup (5 minutes)](#-quick-setup-5-minutes)
2. [📋 Full Setup (20 minutes)](#-full-setup-20-minutes)
  3. [1. Complete All Placeholder Sections](#1-complete-all-placeholder-sections)
  4. [2. Configure AI Development Tools](#2-configure-ai-development-tools)
5. [Key Technologies](#key-technologies)
6. [Project-Specific Rules](#project-specific-rules)
7. [Never Do](#never-do)
  8. [3. Customize for Your Workflow](#3-customize-for-your-workflow)
  9. [4. Set Up Git Repository](#4-set-up-git-repository)
  10. [5. Verify Setup](#5-verify-setup)
11. [🔄 Keeping Template Updated](#-keeping-template-updated)
12. [📚 Next Steps](#-next-steps)
13. [❓ Common Questions](#-common-questions)

## 🚀 Quick Setup (5 minutes)

1. **Clone and Rename**

   ```bash
   git clone [template-repo] my-project-name
   cd my-project-name
   rm -rf .git
   git init
   ```

2. **Find & Replace Core Values**
   - Find & Replace "ProjectName" → Your actual project name
   - Update in: CLAUDE.md, README.md, package.json

3. **Fill Core Features** in CLAUDE.md
   Replace the example features with your actual features:

   ```markdown
   ### Core Features:

   - User authentication with JWT tokens
   - Real-time notifications via WebSocket
   - RESTful API with automatic documentation
   - PostgreSQL database with migrations
   - Comprehensive test coverage
   ```

4. **Choose Your Tech Stack**
   Review decision matrices in `docs/newproject_decisions/`:
   - Backend: Node.js/Express, Python/FastAPI, Go/Gin, or Rust/Actix
   - Frontend: React/Next.js, Vue/Nuxt, Angular, or Svelte/SvelteKit
   - Database: PostgreSQL, SQLite, MongoDB, or Redis

5. **Set Port Allocation** in CLAUDE.md

   ```markdown
   ### Port Allocation:

   - Frontend: 3000
   - Backend API: 8000
   - Database: 5432
   - Redis/Cache: 6379
   ```

## 📋 Full Setup (20 minutes)

### 1. Complete All Placeholder Sections

- [ ] Project Overview - Add detailed description
- [ ] Technical Architecture - Fill in your choices
- [ ] Database Configuration - Add connection details
- [ ] Quick Start Commands - Verify they work for your stack
- [ ] Testing Requirements - Adjust for your test framework

### 2. Configure AI Development Tools

**Create `.cursorrules`** in project root:

```markdown
# Project: [Your Project Name]

# Stack: [Your Tech Stack]

You are working on [project description].

## Key Technologies

- Backend: [Your choice]
- Frontend: [Your choice]
- Database: [Your choice]

## Project-Specific Rules

1. [Add your specific rules]
2. [Coding standards]
3. [Patterns to follow]

## Never Do

1. [Project-specific anti-patterns]
```

**Create `.aiignore`**:

```text
node_modules/
dist/
.env*
*.log
coverage/
# Add project-specific excludes
```

### 3. Customize for Your Workflow

- [ ] Add project-specific common issues
- [ ] Update testing requirements for your stack
- [ ] Add team-specific conventions
- [ ] Configure IDE settings for your tools

### 4. Set Up Git Repository

```bash
# Initial commit
git add .
git commit -m "Initial project setup from template"

# Add remote
git remote add origin [your-repo-url]
git push -u origin main
```

### 5. Verify Setup

Run through the quick start commands to ensure everything works:

```bash
npm install
npm test
npm run dev
```

## 🔄 Keeping Template Updated

To incorporate template improvements:

```bash
# Add template as upstream
git remote add template [template-repo-url]

# Fetch updates
git fetch template

# Cherry-pick improvements
git cherry-pick [commit-hash]
```

## 📚 Next Steps

1. Review all documentation in `docs/`
2. Set up CI/CD using `.github/workflows/`
3. Configure your development environment
4. Start building!

## ❓ Common Questions

**Q: Should I keep all template files?**
A: No, remove what you don't need. The template is intentionally comprehensive.

**Q: Can I change the structure?**
A: Yes! The template is a starting point. Adapt it to your needs.

**Q: How do I contribute improvements back?**
A: Fork the template, make improvements, and submit a PR with your learnings.

---

Remember: This template is a living system. It improves with each project that uses it. Document your learnings and
share them back!
