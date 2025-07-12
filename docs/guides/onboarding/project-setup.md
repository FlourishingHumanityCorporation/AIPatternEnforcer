# Project Setup Guide

This guide walks through setting up a new project using this template, from initial creation to first deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Your Project](#step-1-create-your-project)
  3. [Using the Template](#using-the-template)
  4. [Initial Configuration](#initial-configuration)
5. [Step 2: Customize for Your Project](#step-2-customize-for-your-project)
  6. [Update Project Metadata](#update-project-metadata)
    7. [package.json](#packagejson)
    8. [README.md](#readmemd)
9. [Getting Started](#getting-started)
10. [Tech Stack](#tech-stack)
11. [Documentation](#documentation)
  12. [Configure AI Assistance](#configure-ai-assistance)
    13. [Update .cursorrules](#update-cursorrules)
14. [Project-Specific Rules](#project-specific-rules)
15. [Tech Stack](#tech-stack)
    16. [Update AI Context](#update-ai-context)
17. [Step 3: Set Up Development Environment](#step-3-set-up-development-environment)
  18. [Environment Variables](#environment-variables)
  19. [Database Setup](#database-setup)
    20. [PostgreSQL](#postgresql)
    21. [MongoDB](#mongodb)
  22. [Install Additional Dependencies](#install-additional-dependencies)
23. [Step 4: Configure External Services](#step-4-configure-external-services)
  24. [GitHub Actions](#github-actions)
    25. [.github/workflows/ci.yml](#githubworkflowsciyml)
  26. [Error Tracking (Sentry)](#error-tracking-sentry)
  27. [Analytics](#analytics)
28. [Step 5: Develop Your First Feature](#step-5-develop-your-first-feature)
  29. [Plan the Feature](#plan-the-feature)
  30. [Implement with TDD](#implement-with-tdd)
  31. [Follow the Workflow](#follow-the-workflow)
32. [Step 6: Set Up Deployment](#step-6-set-up-deployment)
  33. [Vercel Deployment](#vercel-deployment)
  34. [Environment Configuration](#environment-configuration)
  35. [Custom Domain](#custom-domain)
36. [Step 7: Set Up Monitoring](#step-7-set-up-monitoring)
  37. [Application Monitoring](#application-monitoring)
  38. [Health Checks](#health-checks)
  39. [Uptime Monitoring](#uptime-monitoring)
40. [Step 8: Documentation](#step-8-documentation)
  41. [Initial Documentation](#initial-documentation)
    42. [docs/getting-started.md](#docsgetting-startedmd)
    43. [docs/architecture/overview.md](#docsarchitectureoverviewmd)
    44. [docs/api/README.md](#docsapireadmemd)
  45. [API Documentation](#api-documentation)
46. [Step 9: Team Setup](#step-9-team-setup)
  47. [Access Control](#access-control)
  48. [Communication](#communication)
49. [Step 10: Go Live Checklist](#step-10-go-live-checklist)
  50. [Security](#security)
  51. [Performance](#performance)
  52. [Monitoring](#monitoring)
  53. [Legal](#legal)
  54. [SEO](#seo)
55. [Common Issues & Solutions](#common-issues-solutions)
  56. [Issue: TypeScript errors](#issue-typescript-errors)
  57. [Issue: Database connection fails](#issue-database-connection-fails)
  58. [Issue: Build fails](#issue-build-fails)
59. [Next Steps](#next-steps)
60. [Maintenance](#maintenance)

## Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- Git configured with SSH keys
- GitHub/GitLab account
- Basic terminal knowledge

## Step 1: Create Your Project

### Using the Template

```bash
# Clone the template
git clone https://github.com/[org]/project-template.git my-new-project
cd my-new-project

# Remove template history
rm -rf .git
git init

# Or use the creation script
./scripts/init/create-project.sh my-new-project
```

### Initial Configuration

```bash
# Install dependencies
npm install

# Set up git
git add .
git commit -m "Initial commit from project-template"

# Create GitHub repo and push
gh repo create my-new-project --private
git remote add origin git@github.com:[username]/my-new-project.git
git push -u origin main
```

## Step 2: Customize for Your Project

### Update Project Metadata

#### package.json

```json
{
  "name": "my-new-project",
  "version": "0.1.0",
  "description": "Your project description",
  "author": "Your Name <email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/[username]/my-new-project"
  }
}
```

#### README.md

Replace the template README with your project-specific content:

````markdown
# My New Project

Brief description of what your project does.

## Getting Started

```bash
npm install
npm run dev
```text
````

## Tech Stack

- [Your technologies]

## Documentation

See `/docs` for detailed documentation.

````

### Configure AI Assistance

#### Update .cursorrules
```markdown
# Project Context for AI Assistant

You are working on [PROJECT NAME], a [TYPE] application.

## Project-Specific Rules
1. [Your specific rule]
2. [Another rule]

## Tech Stack
- Frontend: [Your choice]
- Backend: [Your choice]
- Database: [Your choice]
````

#### Update AI Context

Edit `ai/.cursorrules` to include:

- Your specific tech stack
- Business domain knowledge
- Custom patterns you want to enforce
- Integration details

## Step 3: Set Up Development Environment

### Environment Variables

```bash
# Copy example env file
cp .env.example .env.local

# Edit with your values
vim .env.local
```

Common environment variables:

```env
# Application
NODE_ENV=development
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp

# Authentication
JWT_SECRET=generate-a-secure-secret
SESSION_SECRET=another-secure-secret

# External Services
STRIPE_API_KEY=sk_test_...
SENDGRID_API_KEY=SG...

# Feature Flags
ENABLE_NEW_FEATURE=false
```

### Database Setup

#### PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql
brew services start postgresql

# Create database
createdb my_new_project_dev
createdb my_new_project_test

# Run migrations
npm run db:migrate
```

#### MongoDB

```bash
# Install MongoDB
brew install mongodb-community
brew services start mongodb-community

# Connection will be created automatically
```

### Install Additional Dependencies

Based on your project needs:

```bash
# UI Framework
npm install @nextui-org/react framer-motion

# State Management
npm install zustand immer

# Forms & Validation
npm install react-hook-form zod

# API & Data Fetching
npm install @tanstack/react-query axios

# Authentication
npm install next-auth @auth/prisma-adapter

# Testing
npm install -D @testing-library/react @testing-library/jest-dom
```

## Step 4: Configure External Services

### GitHub Actions

The template includes workflows. Customize them:

#### .github/workflows/ci.yml

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  # Add your secrets
```

Add secrets in GitHub:

1. Go to Settings → Secrets → Actions
2. Add required secrets

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

### Analytics

```bash
# Google Analytics
npm install @next/third-parties

# Or Plausible
npm install plausible-tracker
```

## Step 5: Develop Your First Feature

### Plan the Feature

```bash
# Use the planning template
cat ai/prompts/feature/planning.md

# Create feature structure
npm run generate:feature user-authentication
```

### Implement with TDD

1. Write tests first:

```typescript
// src/features/auth/auth.test.ts
describe("Authentication", () => {
  it("should login with valid credentials", async () => {
    // Test implementation
  });
});
```

2. Implement to pass tests
3. Refactor with AI assistance

### Follow the Workflow

```bash
# Create feature branch
git checkout -b feature/user-auth

# Make changes with AI help
# Commit regularly
git add -p
git commit -m "feat: add login functionality"

# Push and create PR
git push origin feature/user-auth
gh pr create
```

## Step 6: Set Up Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Configuration

Set production environment variables:

```bash
# Using Vercel
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production

# Or in dashboard
# https://vercel.com/[team]/[project]/settings/environment-variables
```

### Custom Domain

1. Add domain in Vercel dashboard
2. Update DNS records
3. Enable SSL (automatic)

## Step 7: Set Up Monitoring

### Application Monitoring

```typescript
// lib/monitoring.ts
import * as Sentry from "@sentry/nextjs";

export function setupMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}
```

### Health Checks

```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

### Uptime Monitoring

Set up with services like:

- UptimeRobot
- Pingdom
- Better Uptime

## Step 8: Documentation

### Initial Documentation

Create these essential docs:

#### docs/getting-started.md

- Local development setup
- Required tools
- Common tasks

#### docs/architecture/overview.md

- High-level architecture
- Key decisions
- Technology choices

#### docs/api/README.md

- API endpoints
- Authentication
- Rate limiting

### API Documentation

```bash
# Generate from code
npm run docs:api:generate

# Or use OpenAPI
npm install @fastify/swagger
```

## Step 9: Team Setup

### Access Control

1. **GitHub Repository**
   - Add team members
   - Set up branch protection
   - Configure required reviews

2. **Environment Access**
   - Vercel team members
   - Database access
   - Monitoring tools

### Communication

1. **Create Slack channels**
   - #project-dev
   - #project-alerts
   - #project-general

2. **Set up integrations**
   - GitHub → Slack
   - Error tracking → Slack
   - Deployment → Slack

## Step 10: Go Live Checklist

Before launching:

### Security

- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Secrets in environment vars
- [ ] Input validation on all forms
- [ ] Rate limiting enabled

### Performance

- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] CDN configured
- [ ] Database indexed

### Monitoring

- [ ] Error tracking active
- [ ] Performance monitoring on
- [ ] Uptime checks configured
- [ ] Alerts set up

### Legal

- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Cookie consent (if needed)
- [ ] GDPR compliance

### SEO

- [ ] Meta tags configured
- [ ] Sitemap generated
- [ ] Robots.txt added
- [ ] Social sharing tags

## Common Issues & Solutions

### Issue: TypeScript errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm ci
npm run type-check
```

### Issue: Database connection fails

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npm run db:test-connection
```

### Issue: Build fails

```bash
# Check for missing env vars
npm run build:debug

# Clear all caches
npm run clean:all
```

## Next Steps

After setup:

1. Review all TODO comments in code
2. Customize GitHub Actions workflows
3. Set up additional integrations
4. Plan your first sprint
5. Start building!

## Maintenance

Regular maintenance tasks:

- Update dependencies monthly
- Review and update documentation
- Clean up unused code
- Optimize performance
- Security audits

Remember: This template is a starting point. Adapt it to your specific needs and keep evolving it as you learn what
works optimal for your project.
