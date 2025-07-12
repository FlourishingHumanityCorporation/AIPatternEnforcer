# Debugging Production Issues

This runbook provides systematic approaches to debugging issues in production without causing additional problems.

## Table of Contents

1. [Golden Rules](#golden-rules)
2. [Initial Assessment](#initial-assessment)
  3. [1. Gather Symptoms](#1-gather-symptoms)
  4. [2. Identify Scope](#2-identify-scope)
  5. [3. Check Recent Changes](#3-check-recent-changes)
6. [Debugging Techniques](#debugging-techniques)
  7. [Log Analysis](#log-analysis)
    8. [Centralized Logging](#centralized-logging)
    9. [Local Log Inspection](#local-log-inspection)
  10. [Distributed Tracing](#distributed-tracing)
  11. [Database Debugging](#database-debugging)
    12. [Query Performance](#query-performance)
    13. [Connection Issues](#connection-issues)
  14. [Memory Debugging](#memory-debugging)
  15. [CPU Profiling](#cpu-profiling)
16. [Live Debugging Techniques](#live-debugging-techniques)
  17. [Feature Flags](#feature-flags)
  18. [Circuit Breakers](#circuit-breakers)
  19. [Rate Limiting](#rate-limiting)
20. [Service-Specific Debugging](#service-specific-debugging)
  21. [API Gateway](#api-gateway)
  22. [Message Queue](#message-queue)
  23. [Cache Layer](#cache-layer)
24. [Safe Production Queries](#safe-production-queries)
  25. [Read-Only Database Access](#read-only-database-access)
  26. [Sampling Queries](#sampling-queries)
27. [Emergency Debugging Tools](#emergency-debugging-tools)
  28. [Debug Mode](#debug-mode)
  29. [Canary Analysis](#canary-analysis)
30. [Common Issues and Solutions](#common-issues-and-solutions)
  31. [Issue: Slow API Responses](#issue-slow-api-responses)
  32. [Issue: Memory Leaks](#issue-memory-leaks)
  33. [Issue: Connection Errors](#issue-connection-errors)
34. [Debug Information Collection](#debug-information-collection)
  35. [Automated Collection Script](#automated-collection-script)
36. [Post-Debug Cleanup](#post-debug-cleanup)
37. [Remember](#remember)

## Golden Rules

1. **Do No Harm**: Don't make things worse
2. **Preserve Evidence**: Capture state before changing anything
3. **Communicate**: Keep team informed of debugging actions
4. **Document**: Record what you find and what you try
5. **Rollback First**: When in doubt, rollback and debug offline

## Initial Assessment

### 1. Gather Symptoms

```bash
# Check overall health
curl https://api.example.com/health | jq

# Get error rates
npm run monitor:errors -- --last=30m

# Check response times
npm run monitor:latency -- --percentile=95 --last=30m

# Active user count
npm run monitor:users:active
```

### 2. Identify Scope

Questions to answer:

- Which services are affected?
- What percentage of users impacted?
- Is it regional or global?
- When did it start?
- Was there a recent deployment?

### 3. Check Recent Changes

```bash
# Recent deployments
npm run deploy:history -- --last=24h

# Recent config changes
npm run config:audit -- --last=24h

# Infrastructure changes
npm run infra:changes -- --last=24h

# Feature flag changes
npm run features:changes -- --last=24h
```

## Debugging Techniques

### Log Analysis

#### Centralized Logging

```bash
# Search for errors
npm run logs:search -- --level=error --last=1h

# Find specific user's journey
npm run logs:trace -- --user-id=12345 --last=1h

# Correlation across services
npm run logs:correlate -- --request-id=abc-123

# Pattern analysis
npm run logs:patterns -- --anomalies --last=1h
```

#### Local Log Inspection

```bash
# Tail logs in real-time
npm run logs:tail -- --service=api --level=error

# Download logs for analysis
npm run logs:download -- --from="1 hour ago" --to="now" > debug.log

# Search for specific patterns
grep -E "timeout|refused|error" debug.log | less
```

### Distributed Tracing

```bash
# Find slow traces
npm run traces:slow -- --threshold=1000ms --last=30m

# Trace specific request
npm run traces:find -- --request-id=abc-123

# Service dependency analysis
npm run traces:dependencies -- --service=payment-api
```

### Database Debugging

#### Query Performance

```sql
-- Current running queries
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds';

-- Kill long-running query
SELECT pg_cancel_backend(pid);

-- Query execution stats
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### Connection Issues

```sql
-- Connection count by state
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;

-- Connections per database
SELECT datname, count(*)
FROM pg_stat_activity
GROUP BY datname;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < current_timestamp - interval '10 minutes';
```

### Memory Debugging

```bash
# Node.js heap snapshot
npm run debug:heap-snapshot -- --service=api

# Analyze heap dump
npm run debug:heap-analyze -- --file=heap-123.heapsnapshot

# Memory usage over time
npm run metrics:memory -- --service=api --last=1h

# GC statistics
npm run metrics:gc -- --service=api --last=30m
```

### CPU Profiling

```bash
# Start CPU profiling (30 seconds)
npm run debug:cpu-profile -- --duration=30s

# Analyze profile
npm run debug:cpu-analyze -- --file=cpu-profile-123.cpuprofile

# Find hot paths
npm run debug:flamegraph -- --file=cpu-profile-123.cpuprofile
```

## Live Debugging Techniques

### Feature Flags

```bash
# Disable problematic feature
npm run feature:toggle -- --name=new-algorithm --enabled=false

# Gradual rollback
npm run feature:rollout -- --name=new-algorithm --percentage=50
npm run feature:rollout -- --name=new-algorithm --percentage=25
npm run feature:rollout -- --name=new-algorithm --percentage=0
```

### Circuit Breakers

```bash
# Check circuit status
npm run circuits:status

# Manually open circuit
npm run circuits:open -- --service=payment-gateway

# Reset circuit
npm run circuits:reset -- --service=payment-gateway
```

### Rate Limiting

```bash
# Check current limits
npm run ratelimit:status

# Temporarily increase limits
npm run ratelimit:adjust -- --endpoint=/api/search --limit=1000

# Add emergency bypass
npm run ratelimit:bypass -- --user=vip-customer
```

## Service-Specific Debugging

### API Gateway

```bash
# Check route configuration
npm run gateway:routes

# View rate limits
npm run gateway:limits

# Check upstream health
npm run gateway:health:upstreams
```

### Message Queue

```bash
# Queue depth
npm run queue:depth -- --all

# Dead letter queue
npm run queue:dlq:inspect

# Replay failed messages
npm run queue:dlq:replay -- --queue=email-queue --count=10
```

### Cache Layer

```bash
# Cache hit rate
npm run cache:stats

# Clear specific keys
npm run cache:clear -- --pattern="user:*"

# Warm cache
npm run cache:warm -- --type=product-catalog
```

## Safe Production Queries

### Read-Only Database Access

```bash
# Connect to read replica
npm run db:connect:readonly

# Safe queries only
SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY;
```

### Sampling Queries

```sql
-- Sample of recent errors
SELECT * FROM error_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY RANDOM()
LIMIT 100;

-- User distribution
SELECT
  COUNT(*) as count,
  country,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM users
GROUP BY country
ORDER BY count DESC;
```

## Emergency Debugging Tools

### Debug Mode

```bash
# Enable debug mode for specific user
npm run debug:enable -- --user-id=12345 --duration=30m

# This will:
# - Increase logging for this user
# - Capture detailed traces
# - Save all requests/responses
```

### Canary Analysis

```bash
# Deploy debug version to canary
npm run deploy:canary -- --debug=true

# Route specific users to canary
npm run canary:route -- --user-id=12345

# Compare canary vs production
npm run canary:compare -- --metric=error_rate
```

## Common Issues and Solutions

### Issue: Slow API Responses

```bash
# 1. Check database queries
npm run debug:slow-queries

# 2. Check external API calls
npm run debug:external-apis -- --threshold=1000ms

# 3. Check cache misses
npm run cache:misses -- --last=30m

# 4. Profile CPU usage
npm run debug:cpu-profile -- --endpoint=/api/slow
```

### Issue: Memory Leaks

```bash
# 1. Compare heap snapshots
npm run debug:heap-snapshot -- --tag=before
# Wait 10 minutes
npm run debug:heap-snapshot -- --tag=after
npm run debug:heap-diff -- --from=before --to=after

# 2. Check event listeners
npm run debug:event-listeners

# 3. Monitor GC
npm run metrics:gc -- --verbose
```

### Issue: Connection Errors

```bash
# 1. Check connection pools
npm run debug:connections -- --all

# 2. DNS resolution
npm run debug:dns -- --service=api.example.com

# 3. SSL certificates
npm run debug:ssl -- --all-services

# 4. Network latency
npm run debug:network -- --target=database
```

## Debug Information Collection

### Automated Collection Script

```bash
#!/bin/bash
# scripts/debug/collect-all.sh

INCIDENT_ID=$1
OUTPUT_DIR="debug-$INCIDENT_ID-$(date +%Y%m%d-%H%M%S)"

mkdir -p $OUTPUT_DIR

echo "Collecting debug information..."

# System info
npm run debug:system > $OUTPUT_DIR/system.txt

# Recent errors
npm run logs:errors -- --last=1h > $OUTPUT_DIR/errors.log

# Metrics snapshot
npm run metrics:export -- --last=1h > $OUTPUT_DIR/metrics.json

# Database state
npm run db:stats > $OUTPUT_DIR/database.txt

# Configuration
npm run config:dump > $OUTPUT_DIR/config.json

# Create archive
tar -czf $OUTPUT_DIR.tar.gz $OUTPUT_DIR/

echo "Debug archive created: $OUTPUT_DIR.tar.gz"
```

## Post-Debug Cleanup

After debugging:

```bash
# Disable debug mode
npm run debug:disable -- --all

# Clear debug logs
npm run logs:clear-debug

# Reset any temporary changes
npm run config:reset-temp

# Document findings
npm run incident:add-notes -- --id=INC-001
```

## Remember

- **Observe first**: Understand before acting
- **Change one thing**: Isolate variables
- **Have a rollback plan**: For every change
- **Keep notes**: You'll need them later
- **Share findings**: Others might face the same issue

Debugging production is detective work - be methodical, patient, and thorough!
