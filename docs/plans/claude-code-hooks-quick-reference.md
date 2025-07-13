# Claude Code Hooks Expansion - Quick Reference

## 🎯 New Hooks Summary

### Phase 1: Foundation Protection
| Hook | Purpose | Priority |
|------|---------|----------|
| `meta-project-guardian.js` | Prevent AI from modifying template system | P0 |
| `enterprise-antibody.js` | Block enterprise patterns in local projects | P0 |
| `template-integrity-validator.js` | Ensure template files remain valid | P0 |

### Phase 2: AI Development Patterns
| Hook | Purpose | Priority |
|------|---------|----------|
| `ai-integration-validator.js` | Validate AI service integration patterns | P0 |
| `vector-db-hygiene.js` | Enforce pgvector best practices | P1 |
| `streaming-pattern-enforcer.js` | Ensure proper streaming implementations | P1 |

### Phase 3: Lazy Coder Protection
| Hook | Purpose | Priority |
|------|---------|----------|
| `import-janitor.js` | Auto-clean imports and dependencies | P1 |
| `code-bloat-detector.js` | Prevent code accumulation | P2 |
| `mock-data-enforcer.js` | Force mock data usage | P0 |

### Phase 4: Cost & Performance
| Hook | Purpose | Priority |
|------|---------|----------|
| `token-economics-guardian.js` | Manage AI API costs | P1 |
| `localhost-enforcer.js` | Ensure local-only configurations | P0 |
| `performance-budget-keeper.js` | Maintain performance budgets | P2 |

## 🚀 Quick Implementation Commands

```bash
# Create new hook from template
npm run create:hook <hook-name>

# Test hook locally
npm run test:hook <hook-name>

# Benchmark hook performance
npm run benchmark:hook <hook-name>

# Deploy hook to Claude Code
npm run deploy:hook <hook-name>
```

## 📊 Key Metrics to Track

1. **Execution Time**: Target <100ms
2. **False Positive Rate**: Target <2%
3. **Block Rate**: Expected 5-10%
4. **Developer Override**: Target <1%

## 🔧 Implementation Checklist

For each new hook:
- [ ] Create hook file in `tools/hooks/`
- [ ] Add test file in `tools/hooks/__tests__/`
- [ ] Update `.claude/settings.json`
- [ ] Add to pattern-updater.js metrics
- [ ] Document in hook header comment
- [ ] Add examples to FRICTION-MAPPING.md
- [ ] Update this quick reference

## 🎨 Hook Message Template

```
❌ [What not to do]
✅ [What to do instead]
💡 [Why this matters]

[Optional additional context]
📖 See [relevant docs link]
```

## 🔍 Priority Definitions

- **P0**: Critical - implement immediately
- **P1**: Important - implement in phase
- **P2**: Nice-to-have - implement if time allows