# Rollback Runbook

This runbook covers how to safely rollback deployments when issues are detected in production.

## Table of Contents

1. [When to Rollback](#when-to-rollback)
2. [Rollback Decision Tree](#rollback-decision-tree)
3. [Emergency Rollback (< 2 minutes)](#emergency-rollback-2-minutes)
4. [Standard Rollback (< 5 minutes)](#standard-rollback-5-minutes)
  5. [Step 1: Initiate Rollback](#step-1-initiate-rollback)
  6. [Step 2: Verify Rollback](#step-2-verify-rollback)
  7. [Step 3: Monitor Metrics](#step-3-monitor-metrics)
8. [Database Rollback](#database-rollback)
  9. [Check If Database Changes Were Made](#check-if-database-changes-were-made)
  10. [Rollback Database Changes](#rollback-database-changes)
  11. [Data Recovery](#data-recovery)
12. [Feature Flag Rollback](#feature-flag-rollback)
13. [Service-Specific Rollbacks](#service-specific-rollbacks)
  14. [Vercel](#vercel)
  15. [AWS ECS](#aws-ecs)
  16. [Kubernetes](#kubernetes)
17. [Communication During Rollback](#communication-during-rollback)
  18. [Initial Alert](#initial-alert)
  19. [Updates Every 5 Minutes](#updates-every-5-minutes)
  20. [Resolution Message](#resolution-message)
21. [Post-Rollback Actions](#post-rollback-actions)
  22. [Immediate (Within 30 minutes)](#immediate-within-30-minutes)
  23. [Within 24 Hours](#within-24-hours)
24. [Rollback Testing](#rollback-testing)
25. [Common Rollback Scenarios](#common-rollback-scenarios)
  26. [Scenario 1: API Breaking Change](#scenario-1-api-breaking-change)
  27. [Scenario 2: Database Migration Issue](#scenario-2-database-migration-issue)
  28. [Scenario 3: Performance Degradation](#scenario-3-performance-degradation)
29. [Rollback Metrics](#rollback-metrics)
30. [Tools and Scripts](#tools-and-scripts)
  31. [Automated Rollback Script](#automated-rollback-script)
  32. [Rollback Verification](#rollback-verification)
33. [Remember](#remember)

## When to Rollback

Rollback immediately if you observe:

- 🔴 Error rate > 5%
- 🔴 Response time > 2x normal
- 🔴 Critical functionality broken
- 🔴 Data corruption detected
- 🔴 Security vulnerability exposed

## Rollback Decision Tree

```text
Is the site completely down?
├─ Yes → Execute Emergency Rollback
└─ No → Is error rate > 5%?
    ├─ Yes → Execute Standard Rollback
    └─ No → Is it affecting payments/auth?
        ├─ Yes → Execute Standard Rollback
        └─ No → Can it be fixed forward in < 30min?
            ├─ Yes → Attempt Fix Forward
            └─ No → Execute Standard Rollback
```

## Emergency Rollback (< 2 minutes)

For complete outages:

```bash
# 1. Immediately revert deployment
npm run deploy:emergency-rollback

# 2. Notify team
./scripts/notify-emergency.sh "Emergency rollback initiated"

# 3. Verify service restored
curl -f https://api.example.com/health || echo "STILL DOWN!"
```

## Standard Rollback (< 5 minutes)

### Step 1: Initiate Rollback

```bash
# Get current version
CURRENT_VERSION=$(curl -s https://api.example.com/version | jq -r .version)
echo "Current version: $CURRENT_VERSION"

# List recent deployments
npm run deploy:history

# Rollback to specific version
npm run deploy:rollback -- --version=v1.2.2

# Or rollback to previous
npm run deploy:rollback:previous
```

### Step 2: Verify Rollback

```bash
# Check version changed
NEW_VERSION=$(curl -s https://api.example.com/version | jq -r .version)
echo "Rolled back to: $NEW_VERSION"

# Run health checks
npm run health:check:all

# Verify critical paths
npm run test:critical:production
```

### Step 3: Monitor Metrics

```bash
# Check error rates
npm run monitor:errors -- --last=10m

# Check response times
npm run monitor:performance -- --last=10m

# Watch real-time logs
npm run logs:production:follow
```

## Database Rollback

### Check If Database Changes Were Made

```bash
# View recent migrations
npm run db:migration:history

# Check current version
npm run db:version
```

### Rollback Database Changes

```bash
# Rollback last migration
npm run db:rollback:last

# Rollback to specific version
npm run db:rollback -- --to-version=20240101120000

# Verify rollback
npm run db:version
```

### Data Recovery

If data was corrupted:

```bash
# List available backups
npm run db:backups:list

# Restore from backup
npm run db:restore -- --backup=prod-backup-20240115-1200

# Verify data integrity
npm run db:verify:integrity
```

## Feature Flag Rollback

For feature-specific issues:

```javascript
// Disable feature immediately
await featureFlags.disable("problematic-feature");

// Or reduce rollout percentage
await featureFlags.setRollout("problematic-feature", 0);

// Verify feature disabled
const isEnabled = await featureFlags.isEnabled("problematic-feature");
console.log("Feature disabled:", !isEnabled);
```

## Service-Specific Rollbacks

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback

# Rollback to specific deployment
vercel rollback [deployment-url]

# Verify
vercel inspect [deployment-url]
```

### AWS ECS

```bash
# Update service to previous task definition
aws ecs update-service \
  --cluster production \
  --service myapp \
  --task-definition myapp:45

# Wait for rollout
aws ecs wait services-stable \
  --cluster production \
  --services myapp
```

### Kubernetes

```bash
# Check rollout history
kubectl rollout history deployment/myapp

# Rollback to previous
kubectl rollout undo deployment/myapp

# Rollback to specific revision
kubectl rollout undo deployment/myapp --to-revision=2

# Monitor rollback
kubectl rollout status deployment/myapp
```

## Communication During Rollback

### Initial Alert

```text
🚨 PRODUCTION ISSUE DETECTED
Impact: [Brief description]
Action: Initiating rollback
ETA: 5 minutes
Incident Commander: [Name]
```

### Updates Every 5 Minutes

```text
UPDATE [Time]
Status: Rollback in progress
Progress: [X%] complete
Current impact: [Description]
Next update: [Time]
```

### Resolution Message

```text
✅ ISSUE RESOLVED
Rollback completed at [Time]
Service restored to version [X]
Post-mortem scheduled for [Date/Time]
```

## Post-Rollback Actions

### Immediate (Within 30 minutes)

1. **Verify System Stability**

```bash
# Run full system check
./scripts/post-rollback-verify.sh

# Monitor for 30 minutes
npm run monitor:dashboard
```

2. **Preserve Evidence**

```bash
# Capture logs
npm run logs:export -- --from="1 hour ago" --to="now" > incident-logs.txt

# Save metrics
npm run metrics:export -- --period=2h > incident-metrics.json

# Document timeline
echo "Incident Timeline" > incident-timeline.md
echo "Deployment: $(date -d '1 hour ago')" >> incident-timeline.md
echo "Issue detected: $(date -d '30 minutes ago')" >> incident-timeline.md
echo "Rollback started: $(date -d '25 minutes ago')" >> incident-timeline.md
echo "Rollback completed: $(date -d '20 minutes ago')" >> incident-timeline.md
```

### Within 24 Hours

1. **Root Cause Analysis**
   - What changed in the deployment?
   - Why wasn't it caught in testing?
   - What monitoring failed?

2. **Create Fix**
   - Fix the issue in a new branch
   - Add tests to prevent recurrence
   - Test thoroughly on staging

3. **Update Documentation**
   - Add to known issues
   - Update rollback procedures
   - Document lessons learned

## Rollback Testing

Practice rollbacks regularly:

```bash
# Monthly rollback drill
npm run drill:rollback

# This will:
# 1. Deploy a canary version
# 2. Simulate an issue
# 3. Execute rollback
# 4. Verify recovery
# 5. Generate report
```

## Common Rollback Scenarios

### Scenario 1: API Breaking Change

```bash
# Quick fix: Revert API version
npm run api:version:revert

# Full rollback if needed
npm run deploy:rollback
```

### Scenario 2: Database Migration Issue

```bash
# Stop application to prevent data corruption
npm run maintenance:enable

# Rollback database
npm run db:rollback:last

# Rollback application
npm run deploy:rollback

# Re-enable application
npm run maintenance:disable
```

### Scenario 3: Performance Degradation

```bash
# First try: Scale up
npm run scale:up -- --instances=+2

# If not resolved: Rollback
npm run deploy:rollback

# Scale back down after stable
npm run scale:down -- --instances=-2
```

## Rollback Metrics

Track for each rollback:

- Time to detect issue
- Time to decision
- Time to complete rollback
- Total downtime
- Customer impact
- Root cause category

## Tools and Scripts

### Automated Rollback Script

```bash
#!/bin/bash
# scripts/auto-rollback.sh

# Check error rate
ERROR_RATE=$(npm run monitor:errors -- --last=5m --format=number)

if [ $ERROR_RATE -gt 5 ]; then
  echo "Error rate $ERROR_RATE% exceeds threshold"
  npm run deploy:rollback:auto
  npm run notify:oncall "Auto-rollback triggered: Error rate $ERROR_RATE%"
fi
```

### Rollback Verification

```bash
#!/bin/bash
# scripts/verify-rollback.sh

echo "Verifying rollback completed..."

# Check version
VERSION=$(curl -s https://api.example.com/version | jq -r .version)
echo "Current version: $VERSION"

# Check health
HEALTH=$(curl -s https://api.example.com/health | jq -r .status)
echo "Health status: $HEALTH"

# Check errors
ERRORS=$(npm run monitor:errors -- --last=5m --format=number)
echo "Error rate: $ERRORS%"

if [ "$HEALTH" = "ok" ] && [ $ERRORS -lt 1 ]; then
  echo "✅ Rollback successful"
  exit 0
else
  echo "❌ Rollback verification failed"
  exit 1
fi
```

## Remember

- **Speed over perfection**: Fast rollback is better than complete diagnosis
- **Communicate often**: Over-communicate during incidents
- **Document everything**: You'll need it for the post-mortem
- **No blame**: Focus on fixing, not fault-finding
- **Learn and improve**: Every rollback is a learning opportunity

When in doubt, roll it back!
