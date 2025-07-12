# Metrics and Analytics Tools

**Purpose**: Collection of tools for measuring project performance, user feedback, and system analytics.

## Available Tools

### Performance Metrics
- **performance-benchmarks.js**: Measures system performance across different operations
- **generator-analytics.js**: Tracks generator usage patterns and performance

### User Feedback
- **user-feedback-system.js**: Collects and analyzes user experience data

### Data Storage
- **documentation-history.json**: Historical documentation metrics
- **documentation-metrics.json**: Current documentation analysis data
- **claude-onboarding-*.json**: Claude Code onboarding tracking data

## Usage

```bash
# Performance benchmarking
npm run benchmarks
npm run benchmarks:generators

# User feedback analysis
npm run metrics:report
npm run metrics:friction

# Analytics export
npm run analytics:export
```

## Integration

These tools integrate with:
- ProjectTemplate enforcement system
- Claude Code onboarding process
- User testing programs
- Performance monitoring workflows

For detailed usage instructions, see individual tool documentation.