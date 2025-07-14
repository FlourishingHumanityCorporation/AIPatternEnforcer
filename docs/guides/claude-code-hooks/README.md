# Claude Code Hooks System Documentation

**Last Updated**: 2025-07-14  
**System Version**: 3.0 (Consolidated Architecture)  
**Active Hooks**: 19 configured in `.claude/settings.json`  
**Architecture**: Modular with shared utilities in `tools/hooks/lib/`

This documentation provides comprehensive guidance for understanding, configuring, and troubleshooting the Claude Code hooks system in AIPatternEnforcer.

## 📚 Documentation Index

### 1. [Hooks Overview](./01-hooks-overview.md)

**Start here** - Complete system overview including:

- What are Claude Code hooks?
- System architecture and execution flow
- Hook categories and performance characteristics
- Core protection and AI quality hooks
- Key benefits and important notes

### 2. [Configuration Guide](./02-hooks-configuration.md)

**Setup and customization** - Complete configuration reference:

- Configuration file structure
- Hook events (PreToolUse vs PostToolUse)
- Matcher patterns and active configuration
- Adding new hooks and performance optimization
- Session management and best practices

### 3. [Troubleshooting Guide](./03-hooks-troubleshooting.md)

**Debug and resolve issues** - Solutions from real debugging experience:

- Critical insight: Session configuration loading
- Troubleshooting decision tree
- Hook-specific problem solving
- Performance troubleshooting and recovery procedures

### 4. [Hook Reference](./04-hooks-reference.md)

**Complete hook documentation** - Individual documentation for all 19 hooks:

- Detailed functionality and purpose
- Configuration examples and parameters
- Input/output specifications
- Common use cases and examples
- Performance characteristics

### 5. [Development Guide](./05-hooks-development.md)

**Creating custom hooks** - Comprehensive development guide:

- Hook templates and patterns
- Input/output specifications
- Error handling and performance
- Testing requirements
- Integration and deployment

### 6. [Usage Examples](./06-hooks-examples.md)

**Real-world scenarios** - Practical examples and use cases:

- Common development scenarios
- Hook examples by category
- Error resolution examples
- Integration workflows
- Performance optimization examples

### 7. [Testing Guide](./07-hooks-testing.md)

**Testing and validation** - Comprehensive testing procedures:

- Manual and automated testing
- Performance testing
- Integration testing
- Test infrastructure and CI/CD
- Testing best practices

### 8. [Performance Guide](./08-hooks-performance.md)

**Performance optimization** - Performance analysis and optimization:

- Performance monitoring and profiling
- Optimization techniques
- Bottleneck analysis
- Memory management
- Scaling considerations

### 9. [Official Documentation](./09-hooks-official-documentation.md)

**Complete Claude Code hooks reference** - Official Anthropic documentation:

- Comprehensive hook event coverage
- Complete JSON input/output schemas
- Security considerations and best practices
- MCP integration patterns
- Advanced configuration options

### 10. [Development History & Refactoring Analysis](./10-hooks-development-history.md)

**Hook system evolution and optimization opportunities** - Development history analysis:

- Complete hook inventory and evolution timeline
- Redundancy analysis and consolidation opportunities
- Performance optimization recommendations
- Detailed refactoring roadmap with quantified benefits
- Implementation priorities and risk assessment

### 11. [Changelog](./11-hooks-changelog.md)

**Version history and changes** - Complete record of hook system evolution:

- Version 3.0: Major consolidation refactoring
- Hook consolidation patterns
- Shared utilities implementation
- Performance improvements

## 🔄 Recent Major Refactoring (v3.0)

The hook system underwent a major consolidation refactoring to improve maintainability and reduce code duplication:

### Key Changes:

- **Hook Count**: Reduced from 24 to 19 through intelligent consolidation
- **Shared Utilities**: New `tools/hooks/lib/` directory with reusable components
- **Consolidated Hooks**:
  - `architecture-validator.js`: Combines AI integration, architecture drift, and Next.js structure validation
  - `performance-guardian.js`: Merges 5 performance-related hooks into one comprehensive system
  - `docs-enforcer.js`: Consolidates documentation lifecycle and organization enforcement
- **Code Reduction**: 85% reduction in duplicate code through shared utilities
- **Performance**: Maintained < 500ms total execution time despite consolidation

## 🚀 Quick Start

### Essential Commands

```bash
# Test if hooks are working
echo '{"tool_name": "Write", "tool_input": {"file_path": "test_improved.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js

# Validate configuration
cat .claude/settings.json | jq .

# Run hook tests
npm test tools/hooks/__tests__/
```

### Most Important Rules

1. **Session Loading**: Hooks load once at Claude Code startup - changes require new session
2. **Configuration Changes**: Always close Claude Code before editing `.claude/settings.json`
3. **Fail-Open Architecture**: Operations proceed if hooks error (safety first)
4. **Performance Target**: < 500ms total execution time for all hooks

## 🎯 Hook Categories

| Category                  | Count | Purpose                   | Key Hooks                                               |
| ------------------------- | ----- | ------------------------- | ------------------------------------------------------- |
| **Core Protection**       | 5     | Prevent system damage     | `meta-project-guardian.js`, `prevent-improved-files.js` |
| **Enterprise Prevention** | 3     | Block enterprise features | `enterprise-antibody.js`, `mock-data-enforcer.js`       |
| **AI Quality**            | 6     | Optimize AI interactions  | `context-validator.js`, `test-first-enforcer.js`        |
| **Auto-Fix**              | 5     | Clean up after operations | `fix-console-logs.js`, `import-janitor.js`              |
| **Performance**           | 4     | Maintain limits           | `performance-checker.js`, `code-bloat-detector.js`      |

## 🔧 Configuration File

All hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/prevent-improved-files.js",
            "timeout": 2
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/fix-console-logs.js",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

## 🛠️ Testing and Validation

### Manual Testing

```bash
# Test prevent-improved-files (should block)
echo '{"tool_name": "Write", "tool_input": {"file_path": "test_improved.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js

# Test context-validator (should block single char edit)
echo '{"tool_name": "Edit", "tool_input": {"file_path": "/test.js", "old_string": "a", "new_string": "b"}}' | node tools/hooks/context-validator.js

# Test fix-console-logs (should auto-convert)
echo "console.log('test');" > /tmp/test.js
echo '{"tool_name": "Write", "tool_input": {"file_path": "/tmp/test.js"}, "tool_response": {"filePath": "/tmp/test.js"}}' | node tools/hooks/fix-console-logs.js
cat /tmp/test.js  # Should show logger.info('test');
```

### Automated Testing

```bash
# Run all hook tests
npm test tools/hooks/__tests__/

# Performance testing
time echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/meta-project-guardian.js
```

## 🚨 Common Issues

### 1. Hooks Not Running

**Symptom**: Expected validations not occurring  
**Solution**: Start new Claude Code session (90% of cases)

### 2. Configuration Changes Ignored

**Symptom**: Modified `.claude/settings.json` but no effect  
**Solution**: Close Claude Code completely, then restart

### 3. Hook Blocking Everything

**Symptom**: All operations blocked  
**Solution**: Check matcher patterns and exit codes in hooks

### 4. Performance Issues

**Symptom**: Operations taking too long  
**Solution**: Profile individual hooks, optimize or increase timeouts

## 📋 Supported Hook Events

### PreToolUse Hooks

- Execute **before** AI tool operations
- Can **block** operations (exit code 2)
- Used for validation and prevention

### PostToolUse Hooks

- Execute **after** AI tool operations
- Can **modify** file contents
- Used for auto-fixing and cleanup

## 🎯 Key Benefits

1. **Prevents Common Mistakes**: Blocks duplicate files, enterprise complexity
2. **Maintains Code Quality**: Enforces tests, proper logging, security
3. **Optimizes AI Interactions**: Validates parameters, prevents low-quality edits
4. **Auto-Fixes Issues**: Cleans up imports, converts console.log, validates schemas
5. **Preserves Project Structure**: Keeps files organized, prevents root directory mess

## 📞 Getting Help

### Debug Information to Collect

```bash
# System information
uname -a
node --version

# Configuration
cat .claude/settings.json | jq .

# Hook files
ls -la tools/hooks/

# Test hook execution
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js", "content": "test"}}' | node tools/hooks/prevent-improved-files.js
```

### Support Resources

- **[Troubleshooting Guide](./03-hooks-troubleshooting.md)** - Complete problem-solving guide
- **[Configuration Guide](./02-hooks-configuration.md)** - Setup and customization
- **[Hook Reference](./04-hooks-reference.md)** - Individual hook documentation
- **[Development Guide](./05-hooks-development.md)** - Creating custom hooks
- **[Usage Examples](./06-hooks-examples.md)** - Real-world scenarios
- **[Testing Guide](./07-hooks-testing.md)** - Testing procedures
- **[Performance Guide](./08-hooks-performance.md)** - Performance optimization
- **Hook Tests**: `tools/hooks/__tests__/` - Automated test suite
- **Main Documentation**: `CLAUDE.md` - Project-wide instructions

## 🔄 Maintenance

### Regular Checks

- Monitor hook performance (< 500ms total)
- Test configuration changes in new sessions
- Keep hooks simple and focused
- Document custom hooks thoroughly

### Updates

- Hook system version tracked in documentation
- Configuration format is stable
- New hooks added via configuration only
- Backward compatibility maintained

---

**Note**: This documentation represents the complete, expanded guide for the Claude Code hooks system in AIPatternEnforcer. With 8 comprehensive guides covering all aspects from basic usage to advanced development, this is the definitive resource for understanding and working with the 23-hook system.
