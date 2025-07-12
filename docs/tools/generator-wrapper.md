# Generator Wrapper Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Command Line Interface](#command-line-interface)
5. [Analytics Tracking](#analytics-tracking)
6. [Generator Integration](#generator-integration)
7. [Usage Examples](#usage-examples)
8. [Configuration](#configuration)
9. [Output and Results](#output-and-results)
10. [Integration with Development Workflow](#integration-with-development-workflow)
11. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
12. [API and Programmatic Usage](#api-and-programmatic-usage)
13. [Development and Contributing](#development-contributing)

## Overview

Analytics wrapper that adds usage tracking to all code generators in ProjectTemplate. Provides insights into generator
usage patterns, success rates, and performance metrics to help improve development tools and workflows.

**Tool Type**: Analytics Wrapper / Middleware  
**Language**: JavaScript (Node.js)  
**Dependencies**: `child_process`, `path`, `GeneratorAnalytics`  
**Location**: `tools/generators/generator-wrapper.js`

## Quick Start

```bash
# The wrapper is typically used automatically by npm scripts
# Direct usage (wraps any generator):
node tools/generators/generator-wrapper.js enhanced-component-generator.js MyComponent --template interactive

# Check analytics dashboard to see tracked data
npm run analytics:dashboard
```

## Installation and Setup

### Prerequisites
- Node.js 18+ required
- ProjectTemplate base installation
- GeneratorAnalytics module (tools/metrics/generator-analytics.js)
- Configured analytics storage
- Generator scripts to wrap

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # All dependencies included
```

### Analytics Configuration
```bash
# Enable analytics tracking (if not already enabled)
export GENERATOR_ANALYTICS_ENABLED=true

# Set analytics storage location (optional)
export ANALYTICS_DATA_DIR="./analytics-data"
```

## Command Line Interface

### Basic Syntax
```bash
node tools/generators/generator-wrapper.js <generator-script> [generator-args...]
```

### Arguments
- `<generator-script>`: Path to generator script to wrap (required)
- `[generator-args...]`: All arguments passed through to the wrapped generator

### Environment Variables
- `GENERATOR_SESSION_ID`: Set automatically for tracking session
- `GENERATOR_ANALYTICS_ENABLED`: Enable/disable analytics (default: true)

## Analytics Tracking

### Tracked Metrics

#### Session Start Tracking
- **Generator Type**: component-enhanced, component-basic, api, feature, hook
- **Component Name**: Name of component/feature being generated
- **Start Time**: Timestamp when generation begins
- **Session ID**: Unique identifier for tracking session

#### Session Completion Tracking
- **Success Status**: Whether generation completed successfully
- **Files Created**: Number of files successfully generated
- **Duration**: Total time from start to completion
- **Error Information**: Error details if generation failed
- **Exit Code**: Process exit code from generator

#### Performance Metrics
- **Processing Time**: Time taken for each generation
- **Success Rate**: Percentage of successful generations
- **Most Used Generators**: Frequency of generator usage
- **Common Errors**: Error patterns and frequencies

### Generator Type Mapping
```javascript
const generatorMap = {
  'enhanced-component-generator.js': 'component-enhanced',
  'component-generator.js': 'component-basic', 
  'api-generator.js': 'api',
  'feature-generator.js': 'feature',
  'hook-generator.js': 'hook'
};
```

### File Creation Estimation
```javascript
// Estimated files created by generator type
if (generatorType.includes('component')) {
  filesCreated = 4; // component, test, styles, index
} else if (generatorType === 'api') {
  filesCreated = 5; // routes, controller, service, types, tests
} else if (generatorType === 'feature') {
  filesCreated = 3; // index, README, component
} else if (generatorType === 'hook') {
  filesCreated = 3; // hook, test, index
}
```

## Generator Integration

### Automatic Integration
The wrapper automatically:
1. **Detects generator type** from script filename
2. **Extracts component name** from arguments
3. **Starts tracking session** before generator runs
4. **Monitors generator process** during execution
5. **Records completion data** when generator finishes
6. **Handles interruptions** gracefully (Ctrl+C, kill signals)

### Supported Generators
- **enhanced-component-generator.js**: Advanced React components
- **component-generator.js**: Basic React components
- **api-generator.js**: API endpoint generation
- **feature-generator.js**: Feature module generation
- **hook-generator.js**: React hook generation

### Session Lifecycle
```text
1. Start → Parse arguments, determine generator type
2. Track → Create session ID, record start time
3. Execute → Spawn generator process with stdio inherit
4. Monitor → Track process events and completion
5. Complete → Record success/failure, files created, duration
6. Exit → Exit with same code as wrapped generator
```

## Usage Examples

### Example 1: Component Generation with Analytics
```bash
# Using wrapper directly
node tools/generators/generator-wrapper.js enhanced-component-generator.js UserCard --template display

# Output includes both generator output and analytics:
🚀 Generating Display component: UserCard
✅ Created UserCard.tsx
✅ Created UserCard.test.tsx
✅ Created UserCard.module.css
✅ Created index.ts
✅ Created UserCard.stories.tsx

# Analytics data automatically recorded:
# - Generator: component-enhanced
# - Component: UserCard
# - Files: 5
# - Duration: 1.2s
# - Success: true
```

### Example 2: Via NPM Scripts
```bash
# NPM scripts typically use the wrapper automatically
npm run g:enhanced UserProfile --template interactive

# Wrapper tracks:
# - Session start for component-enhanced
# - Component name: UserProfile
# - All generation steps
# - Success/failure status
```

### Example 3: API Generation
```bash
node tools/generators/generator-wrapper.js api-generator.js UserAPI --crud

# Analytics tracks:
# - Generator type: api
# - Component: UserAPI
# - Estimated files: 5 (routes, controller, service, types, tests)
```

### Example 4: Interrupted Generation
```bash
node tools/generators/generator-wrapper.js component-generator.js Button
# Press Ctrl+C during generation

# Analytics records:
# - Success: false
# - Error: "User interrupted"
# - Partial completion data
```

## Configuration

### Analytics Module Integration
```javascript
const GeneratorAnalytics = require('../metrics/generator-analytics');

async function runGeneratorWithAnalytics() {
  const analytics = new GeneratorAnalytics();
  await analytics.init();
  
  // ... wrapper logic
}
```

### Environment Variables
```bash
# Enable/disable analytics
export GENERATOR_ANALYTICS_ENABLED=true

# Custom data directory
export ANALYTICS_DATA_DIR="./custom-analytics"

# Debug mode
export DEBUG_GENERATOR_WRAPPER=true
```

### Session ID Propagation
```javascript
// Session ID passed to wrapped generator
const child = spawn('node', [generatorPath, ...generatorArgs], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    GENERATOR_SESSION_ID: sessionId 
  }
});
```

## Output and Results

### Normal Generation Output
```text
# Wrapper is transparent - shows generator output directly
🚀 Generating Interactive component: SubmitButton

✅ Created SubmitButton.tsx
✅ Created SubmitButton.test.tsx
✅ Created SubmitButton.module.css
✅ Created index.ts
✅ Created SubmitButton.stories.tsx

✨ Interactive component SubmitButton generated successfully!
```

### Analytics Data Generated
```json
{
  "sessionId": "gen_20250712_143052_abc123",
  "generatorType": "component-enhanced",
  "componentName": "SubmitButton",
  "startTime": "2025-07-12T14:30:52.123Z",
  "endTime": "2025-07-12T14:30:54.456Z",
  "duration": 2333,
  "success": true,
  "filesCreated": 5,
  "error": null,
  "arguments": ["--template", "interactive"]
}
```

### Error Tracking
```json
{
  "sessionId": "gen_20250712_143100_def456", 
  "generatorType": "component-basic",
  "componentName": "Invalid-Name",
  "startTime": "2025-07-12T14:31:00.000Z",
  "endTime": "2025-07-12T14:31:01.200Z",
  "duration": 1200,
  "success": false,
  "filesCreated": 0,
  "error": "Process exited with code 1",
  "exitCode": 1
}
```

## Integration with Development Workflow

### NPM Scripts Integration
```json
{
  "scripts": {
    "g:c": "node tools/generators/generator-wrapper.js enhanced-component-generator.js",
    "g:component": "node tools/generators/generator-wrapper.js component-generator.js",
    "g:api": "node tools/generators/generator-wrapper.js api-generator.js",
    "g:feature": "node tools/generators/generator-wrapper.js feature-generator.js",
    "analytics:dashboard": "node tools/metrics/analytics-dashboard.js"
  }
}
```

### Team Analytics
```bash
# Generate components with automatic tracking
npm run g:c Header --template display
npm run g:c LoginForm --pattern login-form
npm run g:api UserService --crud

# View team analytics
npm run analytics:dashboard

# Analytics show:
# - Most used generators
# - Average generation time
# - Success rates by generator type
# - Common error patterns
```

### CI/CD Integration
```bash
# Track generator usage in CI/CD
npm run g:c TestComponent --template display --force

# Analytics help identify:
# - Which generators are used in automation
# - Success rates in different environments
# - Performance differences across platforms
```

### Performance Monitoring
```bash
# Wrapper tracks performance metrics automatically
# No additional configuration needed

# Data helps optimize:
# - Generator performance
# - Template efficiency
# - Common workflow patterns
```

## Error Handling and Troubleshooting

### Common Issues

#### Analytics Module Not Found
```text
Error: Cannot find module '../metrics/generator-analytics'
```
**Solutions**:
```bash
# Check module exists
ls tools/metrics/generator-analytics.js

# Install missing dependencies
npm install

# Create missing analytics module
npm run setup:analytics
```

#### Permission Errors
```text
Error: EACCES: permission denied, open 'analytics-data.json'
```
**Solutions**:
```bash
# Check analytics directory permissions
ls -la tools/metrics/

# Fix permissions
chmod 755 tools/metrics/
chmod 644 tools/metrics/analytics-data.json

# Use custom directory
export ANALYTICS_DATA_DIR="~/analytics"
```

#### Generator Process Fails
```text
Analytics wrapper error: spawn ENOENT
```
**Solutions**:
```bash
# Check generator script exists
ls tools/generators/enhanced-component-generator.js

# Verify script permissions
chmod +x tools/generators/enhanced-component-generator.js

# Check Node.js path
which node
```

### Debug Mode
Enable debug logging:
```bash
export DEBUG_GENERATOR_WRAPPER=true
node tools/generators/generator-wrapper.js enhanced-component-generator.js Button

# Shows detailed logging:
# - Argument parsing
# - Generator type detection
# - Session tracking
# - Process monitoring
```

### Analytics Validation
```bash
# Validate analytics data
node -e "
const analytics = require('./tools/metrics/generator-analytics');
analytics.validateData().then(console.log);
"

# Check for corrupted sessions
# Verify data integrity
# Show recent statistics
```

## API and Programmatic Usage

### Node.js Integration
```javascript
const { spawn } = require('child_process');
const path = require('path');

// Use wrapper programmatically
function runGeneratorWithAnalytics(generator, args) {
  return new Promise((resolve, reject) => {
    const wrapperPath = path.join(__dirname, 'tools/generators/generator-wrapper.js');
    
    const child = spawn('node', [
      wrapperPath,
      generator,
      ...args
    ], {
      stdio: 'pipe'
    });

    child.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`Generator failed with code ${code}`));
    });
  });
}

// Usage
await runGeneratorWithAnalytics(
  'enhanced-component-generator.js',
  ['UserCard', '--template', 'display']
);
```

### Batch Generation with Analytics
```javascript
const components = [
  { name: 'Header', template: 'display' },
  { name: 'Footer', template: 'display' },
  { name: 'LoginForm', pattern: 'login-form' }
];

for (const component of components) {
  console.log(`Generating ${component.name}...`);
  
  await runGeneratorWithAnalytics(
    'enhanced-component-generator.js',
    [component.name, '--template', component.template]
  );
  
  console.log(`✅ ${component.name} completed with analytics`);
}

// All generations automatically tracked
// Analytics dashboard shows batch operation
```

### Custom Analytics Processing
```javascript
const GeneratorAnalytics = require('./tools/metrics/generator-analytics');

// Process analytics data
async function analyzeGeneratorUsage() {
  const analytics = new GeneratorAnalytics();
  await analytics.init();
  
  const data = await analytics.getSessionData();
  
  // Calculate metrics
  const successRate = data.filter(s => s.success).length / data.length;
  const avgDuration = data.reduce((sum, s) => sum + s.duration, 0) / data.length;
  const mostUsed = data.reduce((acc, s) => {
    acc[s.generatorType] = (acc[s.generatorType] || 0) + 1;
    return acc;
  }, {});
  
  console.log('Generator Analytics:', {
    totalSessions: data.length,
    successRate: `${(successRate * 100).toFixed(1)}%`,
    avgDuration: `${(avgDuration / 1000).toFixed(1)}s`,
    mostUsedGenerator: Object.keys(mostUsed).sort((a, b) => mostUsed[b] - mostUsed[a])[0]
  });
}

analyzeGeneratorUsage();
```

## Development and Contributing

### Project Structure
```text
tools/generators/generator-wrapper.js
├── runGeneratorWithAnalytics() - Main wrapper function
├── Generator type detection logic
├── Session tracking setup
├── Process spawning and monitoring
├── Completion tracking
└── Error handling and cleanup
```

### Adding New Generator Support
1. **Update Generator Mapping**:
```javascript
const generatorMap = {
  // ... existing generators
  'new-generator.js': 'new-type',
};
```

2. **Add File Estimation**:
```javascript
if (generatorType === 'new-type') {
  filesCreated = 6; // Estimate based on generator output
}
```

3. **Test Integration**:
```bash
node tools/generators/generator-wrapper.js new-generator.js TestName --option value
```

### Extending Analytics
```javascript
// Add custom tracking data
await analytics.trackComplete(sessionId, {
  success,
  filesCreated,
  error: success ? null : `Process exited with code ${code}`,
  // Add custom fields
  customOptions: generatorArgs.filter(arg => arg.startsWith('--')),
  projectType: process.env.PROJECT_TYPE,
  teamId: process.env.TEAM_ID
});
```

### Testing the Wrapper
```bash
# Test with different generators
node tools/generators/generator-wrapper.js enhanced-component-generator.js TestComponent
node tools/generators/generator-wrapper.js component-generator.js TestBasic
node tools/generators/generator-wrapper.js api-generator.js TestAPI

# Test error conditions
node tools/generators/generator-wrapper.js non-existent-generator.js Test

# Test interruption
node tools/generators/generator-wrapper.js enhanced-component-generator.js Test
# Press Ctrl+C during execution

# Verify analytics data
cat tools/metrics/analytics-data.json
```

### Performance Considerations
- Wrapper adds minimal overhead (~10-50ms)
- Analytics writes are asynchronous
- Process spawning is efficient
- Memory usage is minimal
- No impact on generator performance

## Related Tools and Documentation

- **GeneratorAnalytics**: tools/metrics/generator-analytics.js - Core analytics module
- **Enhanced Component Generator**: tools/generators/enhanced-component-generator.js
- **Component Generator**: tools/generators/component-generator.js
- **Analytics Dashboard**: tools/metrics/analytics-dashboard.js
- **Generator Usage Guide**: docs/guides/generators/using-generators.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines