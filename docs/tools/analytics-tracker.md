# Analytics Tracker Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
  4. [Prerequisites](#prerequisites)
  5. [Installation](#installation)
  6. [Configuration](#configuration)
7. [API and Programmatic Usage](#api-and-programmatic-usage)
  8. [Basic Integration](#basic-integration)
  9. [Core Methods](#core-methods)
    10. [`trackPatternUsage(patternName, details)`](#trackpatternusagepatternname-details)
    11. [`trackComplianceScore(score, details)`](#trackcompliancescorescore-details)
    12. [`trackValidationEvent(eventType, details)`](#trackvalidationeventeventtype-details)
    13. [`generateReport(options)`](#generatereportoptions)
14. [Analytics Data Structure](#analytics-data-structure)
  15. [Daily Analytics File](#daily-analytics-file)
  16. [Pattern Usage Tracking](#pattern-usage-tracking)
17. [Reporting and Visualization](#reporting-and-visualization)
  18. [Generate Analytics Report](#generate-analytics-report)
  19. [Sample Report Output](#sample-report-output)
20. [Executive Summary](#executive-summary)
21. [Pattern Analysis](#pattern-analysis)
  22. [Top Violations](#top-violations)
23. [Compliance Trends](#compliance-trends)
24. [Integration with Development Workflow](#integration-with-development-workflow)
  25. [Pre-commit Integration](#pre-commit-integration)
  26. [CI/CD Pipeline](#cicd-pipeline)
  27. [Dashboard Integration](#dashboard-integration)
28. [Performance and Optimization](#performance-and-optimization)
  29. [Performance Characteristics](#performance-characteristics)
  30. [Optimization Strategies](#optimization-strategies)
  31. [Configuration Options](#configuration-options)
32. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
  33. [Common Issues](#common-issues)
    34. [Issue: "Cannot write to analytics directory"](#issue-cannot-write-to-analytics-directory)
    35. [Issue: "Analytics data corrupted"](#issue-analytics-data-corrupted)
  36. [Debug Mode](#debug-mode)
37. [Related Tools and Documentation](#related-tools-and-documentation)

## Overview

A comprehensive analytics system for tracking Claude AI validation patterns, compliance metrics, and behavioral testing
results within the ProjectTemplate ecosystem. This tool provides real-time insights into AI assistant performance and
pattern adherence.

**Tool Type**: Library/Service  
**Language**: JavaScript  
**Dependencies**: fs, path, Node.js built-ins

## Quick Start

```bash
# Direct execution for analytics reports
node tools/claude-validation/analytics-tracker.js

# Or programmatic usage
const AnalyticsTracker = require('./tools/claude-validation/analytics-tracker');
const tracker = new AnalyticsTracker();
```

## Installation and Setup

### Prerequisites
- Node.js >=18.0.0
- ProjectTemplate environment
- Write access to `tools/claude-validation/.analytics/`

### Installation
The analytics tracker is included in the ProjectTemplate. No additional installation required.

### Configuration
Analytics data is automatically stored in:
```bash
tools/claude-validation/.analytics/
├── daily/
│   └── YYYY-MM-DD.json
├── patterns/
│   └── pattern-usage.json
└── compliance/
    └── compliance-trends.json
```

## API and Programmatic Usage

### Basic Integration

```javascript
const AnalyticsTracker = require('./analytics-tracker');

// Initialize tracker
const tracker = new AnalyticsTracker();

// Track pattern usage
tracker.trackPatternUsage('no-improved-files', {
  detected: true,
  severity: 'high',
  context: 'file-creation'
});

// Track compliance score
tracker.trackComplianceScore(85, {
  totalChecks: 100,
  passed: 85,
  failed: 15
});

// Track validation event
tracker.trackValidationEvent('pre-commit', {
  duration: 1250,
  filesChecked: 23,
  violationsFound: 2
});
```

### Core Methods

#### `trackPatternUsage(patternName, details)`
**Purpose**: Records when specific patterns are detected

**Parameters**:
- `patternName` (string): Identifier for the pattern
- `details` (object): Pattern detection details
  - `detected` (boolean): Whether pattern was found
  - `severity` (string): 'low', 'medium', 'high', 'critical'
  - `context` (string): Where pattern was detected
  - `metadata` (object): Additional context

**Example**:
```javascript
tracker.trackPatternUsage('bare-except-clause', {
  detected: true,
  severity: 'high',
  context: 'python-file-validation',
  metadata: {
    file: 'src/utils/helper.py',
    line: 45
  }
});
```

#### `trackComplianceScore(score, details)`
**Purpose**: Records overall compliance metrics

**Parameters**:
- `score` (number): Compliance percentage (0-100)
- `details` (object): Score breakdown
  - `totalChecks` (number): Total validations performed
  - `passed` (number): Successful validations
  - `failed` (number): Failed validations
  - `categories` (object): Breakdown by category

**Example**:
```javascript
tracker.trackComplianceScore(92, {
  totalChecks: 150,
  passed: 138,
  failed: 12,
  categories: {
    patterns: { score: 95, weight: 0.4 },
    style: { score: 88, weight: 0.3 },
    documentation: { score: 94, weight: 0.3 }
  }
});
```

#### `trackValidationEvent(eventType, details)`
**Purpose**: Records validation workflow events

**Parameters**:
- `eventType` (string): Type of validation event
- `details` (object): Event details
  - `duration` (number): Time in milliseconds
  - `filesChecked` (number): Number of files validated
  - `violationsFound` (number): Issues detected
  - `outcome` (string): 'passed', 'failed', 'warning'

#### `generateReport(options)`
**Purpose**: Creates comprehensive analytics reports

**Parameters**:
- `options` (object): Report configuration
  - `period` (string): 'daily', 'weekly', 'monthly'
  - `format` (string): 'json', 'markdown', 'html'
  - `includePatterns` (boolean): Include pattern analysis
  - `includeCompliance` (boolean): Include compliance trends

## Analytics Data Structure

### Daily Analytics File
```json
{
  "date": "2025-07-12",
  "summary": {
    "totalEvents": 245,
    "complianceScore": 88.5,
    "topPatterns": ["no-improved-files", "specific-imports"],
    "validationTime": 15600
  },
  "patterns": {
    "no-improved-files": {
      "occurrences": 12,
      "severity": "high",
      "trend": "decreasing"
    }
  },
  "compliance": {
    "scores": [85, 87, 88, 92, 88.5],
    "average": 88.1,
    "trend": "improving"
  },
  "events": [
    {
      "timestamp": "2025-07-12T10:30:00Z",
      "type": "validation",
      "duration": 1200,
      "outcome": "passed"
    }
  ]
}
```

### Pattern Usage Tracking
```json
{
  "patterns": {
    "no-improved-files": {
      "totalOccurrences": 156,
      "lastSeen": "2025-07-12T10:30:00Z",
      "severityDistribution": {
        "low": 12,
        "medium": 89,
        "high": 55
      },
      "contexts": ["file-creation", "refactoring"],
      "trend": {
        "daily": -2.5,
        "weekly": -8.3,
        "monthly": -15.7
      }
    }
  }
}
```

## Reporting and Visualization

### Generate Analytics Report
```bash
# Generate daily report
node tools/claude-validation/analytics-tracker.js --report daily

# Generate weekly summary with patterns
node tools/claude-validation/analytics-tracker.js --report weekly --include-patterns

# Export as markdown
node tools/claude-validation/analytics-tracker.js --report monthly --format markdown
```

### Sample Report Output
```markdown
# Claude Validation Analytics Report

**Period**: 2025-07-05 to 2025-07-12
**Generated**: 2025-07-12T12:00:00Z

## Executive Summary
- **Average Compliance**: 88.5% ↑ 3.2%
- **Total Validations**: 1,247
- **Pattern Violations**: 89 ↓ 15%
- **Average Validation Time**: 1.3s

## Pattern Analysis
### Top Violations
1. **no-improved-files** (34 occurrences) ↓ 8%
2. **bare-except-clause** (23 occurrences) ↓ 12%
3. **missing-type-hints** (18 occurrences) ↑ 5%

## Compliance Trends
- Week 1: 85.3%
- Week 2: 88.5% ↑ 3.2%
- Projection: 91.2% by Week 4
```

## Integration with Development Workflow

### Pre-commit Integration
```javascript
// .husky/pre-commit
const tracker = require('./tools/claude-validation/analytics-tracker');

// Track pre-commit validation
const startTime = Date.now();
const validationResult = runValidation();

tracker.trackValidationEvent('pre-commit', {
  duration: Date.now() - startTime,
  filesChecked: validationResult.filesChecked,
  violationsFound: validationResult.violations.length,
  outcome: validationResult.passed ? 'passed' : 'failed'
});
```

### CI/CD Pipeline
```yaml
# GitHub Actions integration
- name: Track Validation Analytics
  run: |
    node tools/claude-validation/analytics-tracker.js \
      --event ci-validation \
      --score ${{ steps.validate.outputs.score }} \
      --details '${{ steps.validate.outputs.details }}'
```

### Dashboard Integration
```javascript
// Real-time dashboard endpoint
app.get('/api/analytics/claude', async (req, res) => {
  const tracker = new AnalyticsTracker();
  const report = await tracker.generateReport({
    period: req.query.period || 'daily',
    format: 'json',
    includePatterns: true,
    includeCompliance: true
  });
  res.json(report);
});
```

## Performance and Optimization

### Performance Characteristics
- **Write Speed**: <5ms per event
- **Report Generation**: <100ms for daily, <500ms for monthly
- **Storage**: ~1MB per month of analytics data
- **Memory Usage**: <20MB runtime

### Optimization Strategies

1. **Batch Writing**: Events are buffered and written in batches
2. **Data Rotation**: Old analytics automatically archived after 90 days
3. **Incremental Reports**: Only process new data since last report
4. **Async Operations**: All I/O operations are non-blocking

### Configuration Options
```javascript
const tracker = new AnalyticsTracker({
  batchSize: 100,        // Events per batch write
  flushInterval: 5000,   // Milliseconds between flushes
  retentionDays: 90,     // Days to keep detailed data
  archivePath: './archives/analytics'
});
```

## Error Handling and Troubleshooting

### Common Issues

#### Issue: "Cannot write to analytics directory"
**Solution**:
```bash
# Check permissions
ls -la tools/claude-validation/.analytics/

# Create directory if missing
mkdir -p tools/claude-validation/.analytics/{daily,patterns,compliance}

# Fix permissions
chmod -R 755 tools/claude-validation/.analytics/
```

#### Issue: "Analytics data corrupted"
**Solution**:
```javascript
// Rebuild analytics from validation logs
const tracker = new AnalyticsTracker();
tracker.rebuildFromLogs('./logs/validation/');
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=analytics:* node tools/claude-validation/analytics-tracker.js

# Validate data integrity
node tools/claude-validation/analytics-tracker.js --validate
```

## Related Tools and Documentation

- **Claude Validator**: `validate-claude.js` - Main validation engine
- **Compliance Validator**: `compliance-validator.js` - Compliance checking
- **Config Manager**: `config-manager.js` - Configuration management
- **Dashboard**: `dashboard.html` - Visual analytics interface

---

**Last Updated**: 2025-07-12  
**Module Version**: 1.0.0  
**Maintainer**: ProjectTemplate Claude Validation Team  
**Support**: See [Claude Validation Guide](../guides/ai-development/claude-validation.md)