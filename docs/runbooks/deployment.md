# Deployment Runbook

This runbook provides step-by-step instructions for deploying to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Steps](#deployment-steps)
  3. [1. Prepare Release](#1-prepare-release)
  4. [2. Run Pre-Deployment Checks](#2-run-pre-deployment-checks)
  5. [3. Deploy to Staging](#3-deploy-to-staging)
  6. [4. Production Deployment](#4-production-deployment)
  7. [5. Post-Deployment Verification](#5-post-deployment-verification)
  8. [6. Monitor Application](#6-monitor-application)
9. [Rollback Procedure](#rollback-procedure)
  10. [Immediate Rollback (< 5 minutes)](#immediate-rollback-5-minutes)
  11. [Database Rollback](#database-rollback)
12. [Deployment Windows](#deployment-windows)
  13. [Standard Deployments](#standard-deployments)
  14. [Emergency Deployments](#emergency-deployments)
  15. [Blackout Periods](#blackout-periods)
16. [Communication Plan](#communication-plan)
  17. [Before Deployment](#before-deployment)
  18. [After Deployment](#after-deployment)
  19. [If Issues Occur](#if-issues-occur)
20. [Service-Specific Instructions](#service-specific-instructions)
  21. [Vercel](#vercel)
  22. [AWS](#aws)
  23. [Heroku](#heroku)
24. [Troubleshooting](#troubleshooting)
  25. [Build Failures](#build-failures)
  26. [Migration Failures](#migration-failures)
  27. [Performance Issues](#performance-issues)
28. [Emergency Contacts](#emergency-contacts)
  29. [Escalation Path](#escalation-path)
  30. [External Services](#external-services)
31. [Post-Deployment Tasks](#post-deployment-tasks)
32. [Deployment Metrics](#deployment-metrics)
33. [Appendix: Quick Commands](#appendix-quick-commands)

## Pre-Deployment Checklist

- [ ] All tests passing in CI
- [ ] Code reviewed and approved
- [ ] No security vulnerabilities (npm audit)
- [ ] Database migrations tested on staging
- [ ] CHANGELOG.md updated
- [ ] Stakeholders notified of deployment window

## Deployment Steps

### 1. Prepare Release

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Create release tag
VERSION=v1.2.3
git tag -a $VERSION -m "Release $VERSION: Brief description"
git push origin $VERSION

# Create GitHub release
gh release create $VERSION --generate-notes
```

### 2. Run Pre-Deployment Checks

```bash
# Run full test suite
npm test

# Check for security issues
npm audit --production
./scripts/dev/check-security.sh

# Verify build
npm run build

# Test database migrations
npm run db:migrate:dry-run
```

### 3. Deploy to Staging

```bash
# Deploy to staging
npm run deploy:staging

# Wait for deployment to complete
echo "Waiting for staging deployment..."
sleep 60

# Verify staging deployment
curl -f https://staging.example.com/api/health || exit 1

# Run smoke tests on staging
npm run test:smoke:staging
```

### 4. Production Deployment

```bash
# Enable maintenance mode (if needed)
npm run maintenance:enable

# Deploy to production
npm run deploy:production

# Monitor deployment
npm run deploy:status

# Disable maintenance mode
npm run maintenance:disable
```

### 5. Post-Deployment Verification

```bash
# Health check
curl -f https://api.example.com/health

# Verify version
curl https://api.example.com/version

# Run critical path tests
npm run test:critical:production

# Check error rates
npm run monitor:errors -- --last=5m
```

### 6. Monitor Application

Monitor these metrics for 30 minutes post-deployment:

- Error rate (should be < 0.1%)
- Response time (p95 < 500ms)
- CPU usage (< 70%)
- Memory usage (< 80%)

## Rollback Procedure

If issues are detected:

### Immediate Rollback (< 5 minutes)

```bash
# Revert to previous version
npm run deploy:rollback

# Or manually
vercel rollback
# Select previous production deployment

# Verify rollback
curl https://api.example.com/version
```

### Database Rollback

If database changes need reverting:

```bash
# Check migration status
npm run db:status

# Rollback last migration
npm run db:rollback

# If data corruption, restore from backup
npm run db:restore -- --backup=pre-deployment-backup
```

## Deployment Windows

### Standard Deployments

- Tuesday/Thursday: 10:00-12:00 EST
- Avoid: Monday (high traffic), Friday (limited support)

### Emergency Deployments

Require approval from:

- Tech Lead
- Product Manager
- On-call engineer

### Blackout Periods

No deployments during:

- Black Friday week
- December 15 - January 2
- Major marketing campaigns

## Communication Plan

### Before Deployment

```slack
@channel Deploying version 1.2.3 to production at 10:00 EST
Changes: [link to release notes]
Expected downtime: None
```

### After Deployment

```slack
@channel Deployment complete ✅
Version 1.2.3 is now live
All systems operational
```

### If Issues Occur

```slack
@channel Deployment issue detected 🚨
Impact: [describe impact]
Action: Rolling back to previous version
ETA: 5 minutes
```

## Service-Specific Instructions

### Vercel

```bash
# Deploy
vercel --prod

# Rollback
vercel rollback

# Check status
vercel ls
```

### AWS

```bash
# Deploy
aws deploy push --application-name myapp
aws deploy create-deployment --application-name myapp

# Rollback
aws deploy stop-deployment --deployment-id xxx
```

### Heroku

```bash
# Deploy
git push heroku main

# Rollback
heroku rollback

# Check status
heroku releases
```

## Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm ci
npm run build

# Check for missing env vars
npm run build:debug
```

### Migration Failures

```bash
# Check migration logs
npm run db:migrate:status

# Run specific migration
npm run db:migrate:up -- --name=20240101-add-user-table

# Connect to database directly
npm run db:console
```

### Performance Issues

```bash
# Profile production build
npm run build:analyze

# Check for large dependencies
npm run analyze:deps

# Review bundle size
npm run bundle:report
```

## Emergency Contacts

### Escalation Path

1. On-call engineer: Check PagerDuty
2. Tech Lead: [Name] - [Phone]
3. Infrastructure: [Name] - [Phone]
4. CTO: [Name] - [Phone]

### External Services

- Vercel Support: support@vercel.com
- AWS Support: [Support Case URL]
- Database Provider: [Contact Info]

## Post-Deployment Tasks

- [ ] Update status page
- [ ] Send deployment notification email
- [ ] Update project documentation
- [ ] Schedule retrospective if issues occurred
- [ ] Update this runbook with learnings

## Deployment Metrics

Track these for each deployment:

- Deployment duration
- Downtime (if any)
- Rollback needed (yes/no)
- Issues encountered
- Time to resolution

## Appendix: Quick Commands

```bash
# Full deployment pipeline
./scripts/deploy.sh production

# Emergency rollback
./scripts/emergency-rollback.sh

# Check all systems
./scripts/health-check-all.sh

# View deployment history
npm run deploy:history
```

Remember: When in doubt, rollback first and investigate later. Customer experience is the priority.
