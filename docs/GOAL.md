NEVER CHANGE THIS DOCUMENT

AIPatternEnforcer is a meta project.

The goal is to create a codebase that prevents and solves common friction points described in @FrictionMapping when developing software with AI tools like Cursor and Claude Code (terminal) as a design default.

I should be able to copy this project and get started with new vibe AI coding project and AI will be automatically corrected when it does bad coding pattern. Assume the coder is super lazy and can't detect when AI is doing bad coding pattern and always ends up with a bloated mess of a coding project (like this one, lol).

The projects it should work for are local one-person web app projects that leverage AI functionalities (OCR, VLM, LLMs, etc.) like for an fully automated AI dating assistant (writing messages, swiping, understanding user background, etc.). No need for any enterprise stuff.

The recommended stack is

Frontend: Next.js (App Router) + React
UI: Tailwind CSS + shadcn/ui + Radix UI
State: Zustand + TanStack Query
Backend: Next.js API Routes + Serverless Functions
Database: PostgreSQL (Neon) + Prisma + pgvector


No-Need Enterprise Features for AIPatternEnforcer
Features to EXCLUDE from the template:
Authentication & User Management

❌ User sign-up/login systems (Clerk, Auth.js, Supabase Auth)
❌ Role-based access control (RBAC)
❌ User profiles and settings
❌ Password reset flows
❌ Multi-factor authentication
❌ Session management
❌ API key management for external users

Infrastructure & DevOps

❌ CI/CD pipelines (GitHub Actions beyond basic linting)
❌ Docker/Kubernetes configs
❌ Multi-environment deployments (staging, production)
❌ Load balancers and auto-scaling
❌ CDN configuration
❌ Database migrations and rollbacks
❌ Backup and disaster recovery
❌ Health check endpoints
❌ Graceful shutdown handlers

Monitoring & Observability

❌ Application Performance Monitoring (APM)
❌ Distributed tracing (OpenTelemetry)
❌ Log aggregation (DataDog, Splunk)
❌ Custom metrics and dashboards
❌ Error tracking services (Sentry)
❌ Uptime monitoring
❌ Real user monitoring (RUM)

Security & Compliance

❌ SOC2/HIPAA/GDPR compliance features
❌ Audit logging
❌ Data encryption at rest
❌ IP whitelisting
❌ DDoS protection
❌ Web Application Firewall (WAF)
❌ Security headers beyond basics
❌ Penetration testing tools

Team & Collaboration

❌ Code review workflows
❌ Team documentation wikis
❌ Shared development environments
❌ Feature flags systems
❌ A/B testing frameworks
❌ Multi-developer git workflows
❌ Project management integrations

Business Features

❌ Payment processing (Stripe, PayPal)
❌ Subscription management
❌ Usage-based billing
❌ Invoice generation
❌ Admin dashboards
❌ Customer support tools
❌ Email notification systems
❌ Marketing analytics
❌ Referral systems

API & Integration

❌ GraphQL layers
❌ REST API versioning
❌ API documentation (Swagger/OpenAPI)
❌ Webhook systems
❌ Rate limiting for external APIs
❌ API gateway patterns
❌ Third-party OAuth integrations
❌ Event-driven architectures

Data & Analytics

❌ Data warehousing
❌ ETL pipelines
❌ Business intelligence tools
❌ Complex caching strategies (Redis clusters)
❌ Read replicas
❌ Database sharding
❌ Change data capture (CDC)

ANYTHING THAT'S ABOUT TEAMS



All implementations should be robust and functional while leveraging the KISS principle. The plans should be aligned yet not overly simple in a way that causes issues later for me.
