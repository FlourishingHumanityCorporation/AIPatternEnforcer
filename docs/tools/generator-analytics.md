# Generator Analytics Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Command Line Interface](#command-line-interface)
5. [API Reference](#api-reference)
6. [Metrics Collection](#metrics-collection)
7. [Usage Examples](#usage-examples)
8. [Data Storage](#data-storage)
9. [Integration Guide](#integration-guide)
10. [Implementation Details](#implementation-details)
11. [Troubleshooting](#troubleshooting)
12. [Architecture](#architecture)
13. [FAQs](#faqs)

## Overview

The Generator Analytics system tracks usage patterns, performance metrics, and success rates for all code generators in
the ProjectTemplate ecosystem. It provides insights into generator effectiveness and helps identify areas for
improvement.

### Key Features

- **Session Tracking**: Records each generator invocation
- **Performance Metrics**: Measures generation time and success rates
- **Error Tracking**: Captures and categorizes failures
- **Aggregate Analytics**: Provides overall and per-generator statistics
- **Persistent Storage**: Maintains historical data across sessions
- **CLI Interface**: View reports and manage data from command line

### Purpose

This tool helps:
- Monitor generator adoption and usage patterns
- Identify frequently failing generators
- Track performance improvements over time
- Understand which generators provide most value
- Guide future development priorities

### Data Privacy

All analytics are stored locally in the user's home directory. No data is transmitted externally.

## Quick Start

```bash
# View analytics report
node tools/metrics/generator-analytics.js report

# Export raw data
node tools/metrics/generator-analytics.js export > analytics.json

# Reset analytics data
node tools/metrics/generator-analytics.js reset
```

### Integration with Generators

```javascript
const GeneratorAnalytics = require('./generator-analytics');
const analytics = new GeneratorAnalytics();

// Start tracking
await analytics.init();
const sessionId = await analytics.trackStart('component', 'MyComponent');

// ... generator logic ...

// Track completion
await analytics.trackComplete(sessionId, {
  success: true,
  filesCreated: 5
});
```

## Installation and Setup

### Prerequisites

- Node.js 14.0.0 or higher
- Write access to home directory

### Installation

The analytics system initializes automatically on first use:

```javascript
const GeneratorAnalytics = require('./tools/metrics/generator-analytics');
const analytics = new GeneratorAnalytics();
await analytics.init();
```

### Storage Location

Analytics data is stored in:
- **macOS/Linux**: `~/.projecttemplate/analytics/`
- **Windows**: `%USERPROFILE%\.projecttemplate\analytics\`

### Files Created

- `generator-metrics.json`: Aggregate metrics
- `current-session.json`: Active session tracking (temporary)

## Command Line Interface

### Usage

```bash
node tools/metrics/generator-analytics.js [command]
```

### Commands

#### report
Displays formatted analytics report.

```bash
node tools/metrics/generator-analytics.js report

# Output:
📊 Generator Analytics Report
============================

Summary:
  Total Generations: 156
  Success Rate: 94%
  Average Time: 2.3s

By Generator:

  component:
    Uses: 89
    Success Rate: 96%
    Avg Duration: 2.1s
    Files/Generation: 4.2
```

#### export
Exports raw analytics data as JSON.

```bash
node tools/metrics/generator-analytics.js export

# Output: JSON data
{
  "totalSessions": 156,
  "generators": { ... },
  "successRate": 94,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

#### reset
Clears all analytics data.

```bash
node tools/metrics/generator-analytics.js reset

# Output:
Analytics data reset
```

## API Reference

### Class: GeneratorAnalytics

Main analytics tracking class.

#### Constructor

```javascript
new GeneratorAnalytics()
```

Creates new analytics instance with default storage paths.

#### Methods

##### init()

Initializes analytics system and loads existing data.

**Returns:** `Promise<void>`

```javascript
await analytics.init();
```

##### trackStart(generatorType, componentName)

Starts tracking a new generator session.

**Parameters:**
- `generatorType` (string): Type of generator (e.g., 'component', 'api')
- `componentName` (string): Name being generated

**Returns:** `Promise<string>` - Session ID

```javascript
const sessionId = await analytics.trackStart('component', 'UserProfile');
```

##### trackComplete(sessionId, options)

Completes tracking for a session.

**Parameters:**
- `sessionId` (string): ID from trackStart
- `options` (Object):
  - `success` (boolean): Whether generation succeeded
  - `filesCreated` (number): Number of files created
  - `error` (string): Error message if failed

**Returns:** `Promise<Object>` - Completed session data

```javascript
await analytics.trackComplete(sessionId, {
  success: true,
  filesCreated: 4
});
```

##### getReport()

Generates formatted analytics report.

**Returns:** `Promise<Object>` - Report data

```javascript
const report = await analytics.getReport();
console.log(report.summary.totalGenerations);
```

##### exportData()

Exports raw analytics data.

**Returns:** `Promise<Object>` - Raw metrics data

```javascript
const data = await analytics.exportData();
```

##### reset()

Clears all analytics data.

**Returns:** `Promise<void>`

```javascript
await analytics.reset();
```

## Metrics Collection

### Session Metrics

Each generation session tracks:
- **Start Time**: When generation began
- **End Time**: When generation completed
- **Duration**: Total time in milliseconds
- **Success**: Boolean success indicator
- **Files Created**: Number of files generated
- **Error**: Error message if failed

### Aggregate Metrics

#### Global Metrics
- Total sessions across all generators
- Overall success rate percentage
- Average generation time
- Last updated timestamp

#### Per-Generator Metrics
- Total uses
- Success count
- Failure count
- Total duration
- Average duration
- Files created
- Recent errors (last 5)

### Calculated Metrics

- **Success Rate**: `(successes / total uses) * 100`
- **Average Duration**: `total duration / total uses`
- **Files per Generation**: `total files / total uses`

## Usage Examples

### Example 1: Basic Integration

```javascript
const GeneratorAnalytics = require('./generator-analytics');

class ComponentGenerator {
  constructor() {
    this.analytics = new GeneratorAnalytics();
  }
  
  async generate(componentName) {
    await this.analytics.init();
    const sessionId = await this.analytics.trackStart('component', componentName);
    
    try {
      // Generation logic
      const files = await this.createFiles(componentName);
      
      await this.analytics.trackComplete(sessionId, {
        success: true,
        filesCreated: files.length
      });
      
      return files;
    } catch (error) {
      await this.analytics.trackComplete(sessionId, {
        success: false,
        error: error.message
      });
      throw error;
    }
  }
}
```

### Example 2: Error Tracking

```javascript
const sessionId = await analytics.trackStart('api', 'UserAPI');

try {
  await generateAPIFiles();
} catch (error) {
  await analytics.trackComplete(sessionId, {
    success: false,
    filesCreated: 0,
    error: `${error.name}: ${error.message}`
  });
  
  // Re-throw for caller
  throw error;
}
```

### Example 3: Performance Monitoring

```javascript
// Monitor generation performance
const report = await analytics.getReport();
const componentGen = report.generators.component;

if (componentGen && parseFloat(componentGen.averageDuration) > 5000) {
  console.warn('Component generation is taking longer than expected');
  console.warn(`Average time: ${componentGen.averageDuration}`);
}
```

### Example 4: CLI Report Generation

```javascript
// Custom report formatting
async function generateDetailedReport() {
  const analytics = new GeneratorAnalytics();
  const data = await analytics.exportData();
  
  console.log('=== Generator Performance Report ===');
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log('');
  
  // Sort generators by usage
  const sorted = Object.entries(data.generators)
    .sort((a, b) => b[1].uses - a[1].uses);
    
  sorted.forEach(([name, metrics]) => {
    console.log(`${name}:`);
    console.log(`  Usage: ${metrics.uses} times`);
    console.log(`  Success: ${metrics.successes}/${metrics.uses}`);
    console.log(`  Performance: ${(metrics.averageDuration/1000).toFixed(2)}s avg`);
    console.log('');
  });
}
```

## Data Storage

### File Structure

#### generator-metrics.json
```json
{
  "totalSessions": 156,
  "generators": {
    "component": {
      "uses": 89,
      "successes": 85,
      "failures": 4,
      "totalDuration": 187000,
      "averageDuration": 2101,
      "filesCreated": 374,
      "errors": [
        {
          "timestamp": "2024-01-15T10:00:00Z",
          "error": "Template not found"
        }
      ]
    }
  },
  "successRate": 94,
  "averageGenerationTime": 2300,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

#### current-session.json (temporary)
```json
{
  "id": "1705315200000",
  "generator": "component",
  "componentName": "UserProfile",
  "startTime": 1705315200000,
  "endTime": null,
  "duration": null,
  "success": null,
  "filesCreated": 0,
  "error": null
}
```

### Data Persistence

- **Automatic Save**: After each completed session
- **Crash Recovery**: Session files cleaned up on next init
- **Data Migration**: Handled automatically between versions

## Integration Guide

### Generator Wrapper Integration

```javascript
// In generator-wrapper.js
const GeneratorAnalytics = require('./generator-analytics');

function wrapGenerator(generator) {
  const analytics = new GeneratorAnalytics();
  
  return async function(...args) {
    await analytics.init();
    const sessionId = await analytics.trackStart(
      generator.type,
      args[0] // component name
    );
    
    try {
      const result = await generator.apply(this, args);
      await analytics.trackComplete(sessionId, {
        success: true,
        filesCreated: result.files?.length || 0
      });
      return result;
    } catch (error) {
      await analytics.trackComplete(sessionId, {
        success: false,
        error: error.message
      });
      throw error;
    }
  };
}
```

### npm Scripts Integration

```json
{
  "scripts": {
    "analytics:report": "node tools/metrics/generator-analytics.js report",
    "analytics:export": "node tools/metrics/generator-analytics.js export",
    "analytics:reset": "node tools/metrics/generator-analytics.js reset",
    "postgenerate": "npm run analytics:report"
  }
}
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Check Generator Performance
  run: |
    node tools/metrics/generator-analytics.js export > analytics.json
    node scripts/check-generator-performance.js analytics.json
```

## Implementation Details

### Session Management

Sessions ensure accurate tracking even if generators crash:
1. Create session file on start
2. Update metrics on completion
3. Clean up session file
4. Orphaned sessions ignored

### Performance Considerations

- **File I/O**: Minimized by batching updates
- **Memory**: Metrics kept in memory during session
- **Initialization**: One-time cost per process
- **File Size**: Metrics file typically < 10KB

### Error Handling

- **Missing Directory**: Created automatically
- **Corrupted Data**: Falls back to empty metrics
- **Write Failures**: Logged but don't break generation
- **Session Mismatches**: Logged and ignored

## Troubleshooting

### Common Issues

#### 1. Permission Denied
```bash
Error: EACCES: permission denied, mkdir '/home/user/.projecttemplate'
```
**Solution:**
```bash
mkdir -p ~/.projecttemplate/analytics
chmod 755 ~/.projecttemplate/analytics
```

#### 2. Corrupted Metrics
```text
SyntaxError: Unexpected token in JSON
```
**Solution:**
```bash
# Reset analytics
node tools/metrics/generator-analytics.js reset
```

#### 3. Session Not Found
```text
Error: Session ID mismatch
```
**Solution:** Session tracking issue, check for multiple generator instances

### Debug Mode

Enable verbose logging:
```javascript
// Set environment variable
process.env.DEBUG_ANALYTICS = 'true';

// Or in code
analytics.debug = true;
```

## Architecture

### Component Overview

```text
GeneratorAnalytics
├── Storage Management
│   ├── Directory Creation
│   ├── File I/O
│   └── Path Resolution
├── Session Tracking
│   ├── Start Session
│   ├── Update Session
│   └── Complete Session
├── Metrics Calculation
│   ├── Per-Generator Stats
│   ├── Global Aggregates
│   └── Success Rates
├── Reporting
│   ├── CLI Formatter
│   ├── JSON Export
│   └── Report Generation
└── Data Management
    ├── Load Metrics
    ├── Save Metrics
    └── Reset Data
```

### Data Flow

```text
Generator Start → Create Session → Track Progress → Complete Session → Update Metrics → Save Data
       ↓               ↓                ↓                 ↓                ↓             ↓
   trackStart()   Session File    In Progress      trackComplete()   Calculate      Write
                                                                     Aggregates      JSON
```

## FAQs

### Is data shared between users?
No, all analytics are stored locally in each user's home directory.

### How much disk space does it use?
Typically less than 100KB even with thousands of generations tracked.

### Can I disable analytics?
Set environment variable: `DISABLE_GENERATOR_ANALYTICS=true`

### How far back does history go?
All history is preserved unless manually reset. Consider periodic resets for long-term use.

### Can I export to other formats?
Use the JSON export and transform as needed:
```bash
node tools/metrics/generator-analytics.js export | jq '.generators | to_entries[] | .value'
```

### What happens if a generator crashes?
Incomplete sessions are ignored. The next init() cleans up orphaned session files.

### Can I track custom metrics?
Extend the options object in trackComplete():
```javascript
await analytics.trackComplete(sessionId, {
  success: true,
  filesCreated: 4,
  customMetric: 'value' // Stored but not aggregated
});
```

---

**Source**: [generator-analytics.js](/Users/paulrohde/CodeProjects/ProjectTemplate/tools/metrics/generator-analytics.js)