# Feature Lifecycle Guide

## Overview

This guide covers the complete lifecycle of a feature from conception to deployment, with AI assistance at each stage.

## Feature Lifecycle Stages

```mermaid
graph LR
    A[Requirements] --> B[Design]
    B --> C[Implementation]
    C --> D[Testing]
    D --> E[Review]
    E --> F[Deployment]
    F --> G[Monitoring]
```

## Stage 1: Requirements Gathering

### 1.1 Understand the Need

```markdown
## Feature Request Analysis

- User Story: As a [user], I want [feature] so that [benefit]
- Acceptance Criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
- Success Metrics:
  - Metric 1: [how measured]
  - Metric 2: [how measured]
```

### 1.2 Technical Requirements

```bash
# Create requirements doc
cat > docs/decisions/[feature]-requirements.md << EOF
# [Feature Name] Requirements

## Business Requirements
[What business problem does this solve?]

## Technical Requirements
- Performance: [targets]
- Security: [considerations]
- Scalability: [needs]

## Dependencies
- External APIs: [list]
- Libraries: [list]
- Services: [list]

## Constraints
- Timeline: [deadline]
- Resources: [team/budget]
- Technical: [limitations]
EOF
```

### 1.3 AI-Assisted Research

```markdown
Research prompt for AI:
"Research best practices for implementing [feature type].
Consider:

- Security implications
- Performance patterns
- Common pitfalls
- Industry standards
  Reference: @docs/architecture/patterns/"
```

## Stage 2: Design

### 2.1 Architecture Design

```bash
# Create ADR for the feature
cp docs/architecture/decisions/template-adr.md \
   docs/architecture/decisions/$(date +%Y%m%d)-[feature]-design.md
```

### 2.2 API Design

````markdown
## API Design Template

### Endpoint: [/api/resource]

Method: [POST/GET/PUT/DELETE]
Auth: [Required/Optional]

Request:

```json
{
  "field1": "type",
  "field2": "type"
}
```
````

Response:

```json
{
  "data": {},
  "meta": {}
}
```

Errors:

- 400: Validation error
- 401: Unauthorized
- 404: Not found

````

### 2.3 Data Model Design
```sql
-- Example schema design
CREATE TABLE feature_entity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feature_user_id ON feature_entity(user_id);
````

### 2.4 UI/UX Design

- Create mockups/wireframes
- Define component hierarchy
- Plan state management
- Consider accessibility

## Stage 3: Implementation

### 3.1 Setup Feature Structure

```bash
# Generate feature scaffold
npm run generate:feature [feature-name]

# This creates:
# src/features/[feature-name]/
# ├── components/
# ├── hooks/
# ├── services/
# ├── types/
# ├── index.ts
# └── README.md
```

### 3.2 Test-Driven Development

```typescript
// 1. Write tests first
describe("FeatureName", () => {
  it("should handle happy path", () => {
    // Test implementation
  });

  it("should handle error cases", () => {
    // Error handling tests
  });
});

// 2. Implement to pass tests
// 3. Refactor with AI assistance
```

### 3.3 Implementation Checklist

- [ ] Core functionality
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Accessibility
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Security measures

### 3.4 AI-Assisted Implementation

```markdown
Implementation prompt:
"Implement [specific component] following:

- Pattern: @docs/architecture/patterns/[pattern].md
- Example: @src/features/[similar]/
- Requirements: [specific needs]
- Constraints: [performance/security]
  Include comprehensive error handling and TypeScript types."
```

## Stage 4: Testing

### 4.1 Testing Pyramid

```
         /\
        /  \    E2E Tests (10%)
       /----\
      /      \  Integration Tests (30%)
     /--------\
    /          \ Unit Tests (60%)
```

### 4.2 Test Categories

```bash
# Unit tests
npm run test:unit src/features/[feature]

# Integration tests
npm run test:integration src/features/[feature]

# E2E tests
npm run test:e2e features/[feature].spec.ts
```

### 4.3 Test Coverage Requirements

- Minimum 80% code coverage
- 100% coverage for critical paths
- All edge cases covered
- Performance benchmarks met

### 4.4 AI-Assisted Testing

```markdown
Test generation prompt:
"Generate comprehensive tests for @[component-file].
Include:

- Happy path scenarios
- Error conditions
- Edge cases
- Performance considerations
  Use existing test patterns from @[test-examples]"
```

## Stage 5: Code Review

### 5.1 Pre-Review Checklist

```bash
# Run all checks
npm run ai:check

# Specific checks
npm run lint
npm run type-check
npm run test
npm run security:check
./scripts/quality/verify-imports.sh
```

### 5.2 Self-Review

Before creating PR:

1. Review your own diff
2. Check for console.logs
3. Verify no secrets
4. Ensure tests pass
5. Update documentation

### 5.3 PR Creation

```bash
# Create PR with template
gh pr create --template .github/PULL_REQUEST_TEMPLATE.md

# Include:
# - Feature description
# - Testing evidence
# - Screenshots (if UI)
# - AI usage declaration
```

### 5.4 Review Process

- Respond to feedback promptly
- Don't take criticism personally
- Make requested changes
- Re-request review when ready

## Stage 6: Deployment

### 6.1 Pre-Deployment

```bash
# Merge to main
git checkout main
git pull
git merge --no-ff feature/[branch]

# Tag release
git tag -a v[version] -m "Release: [feature]"
git push origin v[version]
```

### 6.2 Deployment Steps

```bash
# Deploy to staging
npm run deploy:staging

# Run smoke tests
npm run test:smoke:staging

# Deploy to production
npm run deploy:production

# Verify deployment
npm run health:check:production
```

### 6.3 Feature Flags

```typescript
// Use feature flags for gradual rollout
if (featureFlags.isEnabled('new-feature')) {
  return <NewFeature />;
} else {
  return <OldFeature />;
}
```

## Stage 7: Monitoring

### 7.1 Setup Monitoring

```typescript
// Add metrics
metrics.increment("feature.usage", {
  feature: "feature-name",
  action: "specific-action",
});

// Add logging
logger.info("Feature action performed", {
  userId,
  feature: "feature-name",
  metadata,
});
```

### 7.2 Monitor Health

- Error rates
- Performance metrics
- User engagement
- Business metrics

### 7.3 Incident Response

If issues arise:

1. Check monitoring dashboards
2. Review recent deployments
3. Check error logs
4. Rollback if necessary
5. Fix forward if possible

## Feature Completion

### Documentation Update

```bash
# Update user docs
vim docs/features/[feature].md

# Update API docs
npm run docs:api:generate

# Update changelog
vim CHANGELOG.md
```

### Retrospective

```markdown
## Feature Retrospective

### What went well?

- [Point 1]
- [Point 2]

### What could improve?

- [Point 1]
- [Point 2]

### Action items:

- [ ] [Action 1]
- [ ] [Action 2]
```

### Knowledge Sharing

- Present feature in team meeting
- Write blog post if innovative
- Update team playbook
- Share effective AI prompts

## Templates and Tools

### Feature Tracking

```markdown
# Feature: [Name]

- [ ] Requirements documented
- [ ] Design approved
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Deployed to production
- [ ] Monitoring configured
- [ ] Retrospective completed
```

### Time Estimates

- Small feature: 1-3 days
- Medium feature: 1-2 weeks
- Large feature: 2-4 weeks
- Epic: 1-3 months

Remember: Each stage benefits from AI assistance, but human judgment and creativity remain essential throughout the lifecycle.
