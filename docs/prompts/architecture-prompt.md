## Comprehensive Architecture Selection Prompt

Here's a deep, systematic architecture prompt that incorporates all the mitigation strategies from your guide:

**architecture-prompt.md**:

````markdown
# Comprehensive Tech Stack Selection for Modern Web Application

You are an expert architect tasked with selecting a tech stack for a new web application in 2025. Your recommendations must be production-ready, secure by default, and optimized for AI-assisted development.

## Critical Constraints

### Non-Negotiable Requirements

1. **TypeScript with strict mode** - no exceptions
2. **Type safety end-to-end** - from database to frontend
3. **Security by default** - authentication, authorization, input validation built-in
4. **Observable systems** - structured logging, error tracking, performance monitoring
5. **Testable architecture** - dependency injection, clear boundaries
6. **AI-friendly structure** - clear file organization, consistent patterns

### Anti-Requirements (What to Avoid)

- No "starter templates" with 50+ dependencies
- No experimental or beta frameworks
- No libraries with last commit > 6 months ago
- No complex build configurations requiring PhD to understand
- No "magic" - explicit over implicit
- No framework-specific lock-in for business logic

## Selection Criteria

For EACH technology choice, provide:

### 1. Verification Command

```bash
# Show me how to verify this is actively maintained
npm view [package] time.modified
# GitHub stats showing community health
```
````

### 2. Security Posture

- Known vulnerabilities check
- Default security features
- Common misconfiguration risks
- How it prevents OWASP Top 10

### 3. AI Development Compatibility

- How well does it work with Cursor/Copilot?
- Are types/interfaces AI-readable?
- Can AI easily understand the patterns?
- Error messages quality for AI debugging

### 4. Production Readiness Score

Rate 1-10 with justification:

- Observability support
- Error handling patterns
- Performance optimization options
- Deployment complexity
- Scaling considerations

## Required Stack Components

### 1. Frontend Framework

Consider:

- Bundle size and performance
- Learning curve vs power
- Component composition patterns
- State management integration
- SSR/SSG/SPA tradeoffs
- Built-in security features (XSS prevention)

Evaluate at minimum:

- Next.js 14+ (App Router)
- Remix
- SvelteKit
- Why not others?

### 2. State Management

Requirements:

- TypeScript inference quality
- DevTools support
- Time-travel debugging
- Persistence options
- Optimistic updates
- Conflict resolution

Evaluate:

- Zustand
- TanStack Query (React Query) for server state
- Valtio
- Why not Redux Toolkit/MobX/others?

### 3. UI Layer

Needs:

- Accessibility by default
- Theme system
- Responsive design system
- Component composition
- Performance (runtime vs build-time)

Options:

- Tailwind CSS + Headless UI/Radix
- CSS-in-JS solutions (which one?)
- Component libraries (shadcn/ui, Mantine, etc.)

### 4. Data Layer Architecture

Critical decisions:

- API design (REST/GraphQL/tRPC/Server Actions)
- Type safety across network boundary
- Caching strategy
- Optimistic updates
- Offline support
- Real-time requirements

For each approach, show:

- Type safety mechanism
- Error handling pattern
- Auth integration
- File upload handling

### 5. Backend Architecture

Choose between:

**Option A: Full-Stack Framework**

- Next.js API routes
- Remix loaders/actions
- SvelteKit endpoints

**Option B: Separate API**

- Fastify vs Express vs Hono
- API framework choice
- Hosting considerations

**Option C: Backend-as-a-Service**

- Supabase vs Firebase vs AWS Amplify
- Vendor lock-in analysis
- Cost projection at scale

### 6. Database & ORM

Requirements:

- Type-safe queries
- Migration system
- Relationship handling
- Performance at scale
- Local development story

Evaluate:

- PostgreSQL + Prisma
- PostgreSQL + Drizzle
- SQLite for development
- Edge databases (Turso, Neon)

### 7. Authentication & Authorization

Must support:

- Social logins
- Magic links
- MFA/2FA ready
- Session management
- Role-based access

Options:

- Clerk
- Auth.js (NextAuth)
- Supabase Auth
- Lucia
- Roll your own (with what?)

### 8. Testing Strategy

Full testing pyramid:

- Unit tests: Vitest vs Jest
- Integration tests approach
- E2E tests: Playwright vs Cypress
- API testing strategy
- Visual regression testing
- Performance testing

### 9. Development Infrastructure

Local development:

- Docker requirements?
- Environment management
- Secret handling
- Database seeding
- API mocking

CI/CD Pipeline:

- GitHub Actions config
- Pre-commit hooks
- Automated security scanning
- Dependency updates

### 10. Deployment & Hosting

Evaluate with pros/cons:

- Vercel
- Fly.io
- Railway
- AWS (which services?)
- Self-hosted options

Consider:

- Cold start times
- Geographic distribution
- Database proximity
- Cost at scale
- Monitoring integration

## Architectural Patterns

### Error Handling Strategy

Show me:

1. Global error boundary implementation
2. API error format (use RFC 7807?)
3. Client-side error recovery
4. Logging strategy with correlation IDs
5. User-facing error messages

### Security Implementation

Demonstrate:

1. Input validation approach
2. SQL injection prevention
3. XSS prevention
4. CSRF protection
5. Rate limiting
6. API authentication

### Performance Patterns

Include:

1. Code splitting strategy
2. Image optimization
3. Font loading approach
4. Critical CSS handling
5. API response caching
6. Database query optimization

## Code Generation

After selection, generate these files:

### 1. Complete package.json

With:

- All dependencies with exact versions
- Scripts for every common task
- Pre-commit hooks configuration

### 2. Project Structure

```
src/
├── app/           # or pages/ - justify choice
├── components/    # organization strategy
├── lib/          # shared utilities
├── server/       # backend logic
├── types/        # TypeScript types
└── [what else?]
```

### 3. Configuration Files

- tsconfig.json (with explanation of each option)
- .eslintrc.js (security plugins configured)
- prettier.config.js
- Environment variable schema
- Docker files if needed

### 4. Working Starter Code

Create a COMPLETE mini-app showing:

- User registration/login flow
- CRUD operations on a "Task" entity
- Real-time updates
- Error handling
- Loading states
- Optimistic updates
- Proper logging

### 5. Development Guides

Generate:

- README.md with setup instructions
- ARCHITECTURE.md with key decisions
- SECURITY.md with checklist
- CONTRIBUTING.md with AI usage guidelines

## Verification Questions

Answer these to validate your choices:

1. **Maintenance Risk**: What happens if any library is abandoned?
2. **Scaling Path**: How do we go from 100 to 1M users?
3. **Team Growth**: Can a junior developer be productive in one week?
4. **AI Compatibility**: Can Cursor understand and modify every part?
5. **Security Audit**: What would a penetration tester find?
6. **Performance Budget**: Initial load time? Core Web Vitals?
7. **Cost Analysis**: Monthly cost at 10K, 100K, 1M users?
8. **Escape Hatches**: How hard to migrate away from each choice?

## Final Deliverable Format

Structure your response as:

1. **Executive Summary** - One paragraph explaining the overall philosophy
2. **Stack Overview** - Bullet list of all choices
3. **Decision Rationale** - Why each choice wins
4. **Risk Analysis** - What could go wrong
5. **Implementation Code** - All the actual files
6. **Next Steps** - Prioritized todo list

Remember: Every choice must be justified with data from 2024-2025, not outdated knowledge. Include npm download stats, GitHub activity, and security audit results where relevant.

````

## How to Use This Prompt

1. **Copy this entire prompt** into a new file in your project
2. **Open Cursor** and load the prompt with @ reference
3. **Add any specific requirements** (e.g., "must integrate with Stripe", "needs real-time collaboration")
4. **Ask Claude to execute** the prompt completely
5. **Save the response** as `docs/decisions/001-initial-architecture.md`
6. **Challenge any suspicious recommendations** with follow-up questions

## Red Flags to Watch For

When Claude responds, be alert for:
- Recommending deprecated packages (verify with `npm view`)
- Over-engineering (too many abstractions)
- Missing security considerations
- No mention of testing strategy
- Vague justifications ("it's popular")
- Old patterns (class components, callback hell)

## Follow-Up Prompts

After the initial architecture selection:

```markdown
# Verification Prompt
Take your recommended stack and:
1. Show me the exact npm install command with current versions
2. Run a security audit simulation
3. Calculate the total bundle size
4. Show me potential version conflicts
5. List every breaking change from major versions in last year
````

```markdown
# Security Hardening Prompt

For the stack you recommended:

1. Show me how to implement CSP headers
2. Configure rate limiting for all endpoints
3. Set up input validation for common attacks
4. Implement audit logging for all state changes
5. Show me the production environment variables needed
```
