#!/bin/bash
# Claude Code Specific Context Loader
# Optimizes context loading for Claude Code's unique capabilities

set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[Claude Context]${NC} $1"; }
success() { echo -e "${GREEN}✅${NC} $1"; }
warning() { echo -e "${YELLOW}⚠️${NC} $1"; }

# Default context mode
CONTEXT_MODE="full"
TARGET_FILE=""
MAX_TOKENS=32000

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode|-m)
            CONTEXT_MODE="$2"
            shift 2
            ;;
        --file|-f)
            TARGET_FILE="$2"
            shift 2
            ;;
        --tokens|-t)
            MAX_TOKENS="$2"
            shift 2
            ;;
        --help|-h)
            echo "Claude Code Context Loader"
            echo ""
            echo "Usage: $0 [options] [file_path]"
            echo ""
            echo "Options:"
            echo "  -m, --mode MODE     Context mode: full, focused, minimal (default: full)"
            echo "  -f, --file FILE     Specific file to focus context on"
            echo "  -t, --tokens NUM    Maximum tokens for context (default: 32000)"
            echo "  -h, --help          Show this help"
            echo ""
            echo "Context Modes:"
            echo "  full      - Complete project context (default)"
            echo "  focused   - Task-specific context"
            echo "  minimal   - Essential rules only"
            echo ""
            echo "Examples:"
            echo "  $0                              # Full context"
            echo "  $0 --mode focused               # Focused context"
            echo "  $0 --file src/components/App.tsx # File-specific context"
            exit 0
            ;;
        *)
            if [[ -z "$TARGET_FILE" ]]; then
                TARGET_FILE="$1"
            fi
            shift
            ;;
    esac
done

# Ensure we're in project root
if [[ ! -f "CLAUDE.md" ]] || [[ ! -f "package.json" ]]; then
    echo "❌ Must be run from ProjectTemplate root directory"
    exit 1
fi

# Generate context header
generate_context_header() {
    echo "# Claude Code Session Context"
    echo "Generated: $(date)"
    echo "Mode: $CONTEXT_MODE"
    echo "Max Tokens: $MAX_TOKENS"
    echo ""
}

# Load core project rules (always included)
load_core_rules() {
    echo "## 🚨 PROJECT AI INSTRUCTIONS"
    echo ""
    echo "**Essential rules for this Claude Code session:**"
    echo ""
    
    # Extract critical rules from CLAUDE.md
    if [[ -f "CLAUDE.md" ]]; then
        # Never do these
        echo "### ❌ NEVER DO THESE (WILL BREAK THE PROJECT)"
        grep -A 10 "NEVER DO THESE" CLAUDE.md | tail -n +2 | head -10
        echo ""
        
        # Always do these
        echo "### ✅ ALWAYS DO THESE"
        grep -A 10 "ALWAYS DO THESE" CLAUDE.md | tail -n +2 | head -10
        echo ""
    fi
    
    # Project overview
    echo "### 📁 PROJECT OVERVIEW"
    echo "ProjectTemplate is a meta-project creating reusable project template structures that solve AI development friction."
    echo ""
    
    # Key commands
    echo "### 🚀 KEY COMMANDS"
    echo "- \`npm run g:c ComponentName\` - Generate components"
    echo "- \`npm run validate\` - Run validation"
    echo "- \`npm run check:all\` - Check enforcement rules"
    echo "- \`npm test\` - Run tests"
    echo ""
}

# Load current project status
load_project_status() {
    echo "## 📊 CURRENT PROJECT STATUS"
    echo ""
    
    # Git status
    echo "### Git Status"
    echo "\`\`\`"
    git status --porcelain 2>/dev/null || echo "Git not available"
    echo "\`\`\`"
    echo ""
    
    # Recent commits
    echo "### Recent Activity"
    echo "\`\`\`"
    git log --oneline -5 2>/dev/null || echo "No git history"
    echo "\`\`\`"
    echo ""
    
    # Enforcement status
    if [[ -f ".claude/settings.json" ]]; then
        echo "### Enforcement Status"
        echo "✅ Claude Code hooks active"
        echo ""
    else
        echo "### Enforcement Status"  
        echo "⚠️ Claude Code hooks not configured"
        echo ""
    fi
    
    # Onboarding level
    if [[ -f "tools/metrics/claude-onboarding-state.json" ]]; then
        local level=$(node -e "
            try {
                const state = JSON.parse(require('fs').readFileSync('tools/metrics/claude-onboarding-state.json', 'utf8'));
                console.log(state.level || 0);
            } catch { console.log(0); }
        " 2>/dev/null)
        echo "### Capability Level"
        echo "Current Level: $level"
        echo ""
    fi
}

# Load file-specific context
load_file_context() {
    local file="$1"
    
    if [[ ! -f "$file" ]]; then
        warning "Target file not found: $file"
        return 1
    fi
    
    echo "## 📁 FILE CONTEXT: $file"
    echo ""
    
    # File info
    echo "### File Information"
    echo "- Path: \`$file\`"
    echo "- Size: $(wc -l < "$file") lines"
    echo "- Modified: $(stat -f '%Sm' "$file" 2>/dev/null || stat -c '%y' "$file" 2>/dev/null || echo 'Unknown')"
    echo ""
    
    # File contents (with token limit consideration)
    local line_count=$(wc -l < "$file")
    local max_lines=$((MAX_TOKENS / 4)) # Rough estimate: 4 tokens per line
    
    echo "### File Contents"
    if [[ $line_count -gt $max_lines ]]; then
        echo "\`\`\`$(basename "$file")"
        head -n "$max_lines" "$file"
        echo ""
        echo "... (truncated - showing first $max_lines of $line_count lines)"
        echo "\`\`\`"
    else
        echo "\`\`\`$(basename "$file")"
        cat "$file"
        echo "\`\`\`"
    fi
    echo ""
    
    # Related files
    local dir=$(dirname "$file")
    echo "### Related Files in $dir"
    ls -la "$dir" | head -10
    echo ""
}

# Load project architecture overview
load_architecture_context() {
    echo "## 🏗️ ARCHITECTURE OVERVIEW"
    echo ""
    
    # Project structure
    echo "### Project Structure"
    echo "\`\`\`"
    tree -I 'node_modules|dist|build|.git' -L 3 2>/dev/null || (
        echo "src/"
        find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | head -10
        echo "docs/"
        find docs -name "*.md" 2>/dev/null | head -5
        echo "tools/"
        find tools -name "*.js" 2>/dev/null | head -5
    )
    echo "\`\`\`"
    echo ""
    
    # Architecture patterns
    if [[ -d "docs/architecture/patterns" ]]; then
        echo "### Available Patterns"
        ls docs/architecture/patterns/ | head -5
        echo ""
    fi
    
    # AI examples
    if [[ -d "ai/examples" ]]; then
        echo "### AI Pattern Examples"
        find ai/examples -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | head -5
        echo ""
    fi
}

# Load available tools and scripts
load_tools_context() {
    echo "## 🔧 AVAILABLE TOOLS"
    echo ""
    
    # NPM scripts
    echo "### NPM Scripts"
    if command -v npm >/dev/null 2>&1; then
        npm run 2>/dev/null | grep -E "(g:|validate|check|test|dev)" | head -10
    fi
    echo ""
    
    # Generator templates
    if [[ -d "templates" ]]; then
        echo "### Generator Templates"
        find templates -name "*.hbs" 2>/dev/null | head -10
        echo ""
    fi
    
    # Enforcement tools
    if [[ -d "tools/enforcement" ]]; then
        echo "### Enforcement Tools"
        ls tools/enforcement/ | head -5
        echo ""
    fi
}

# Load documentation context
load_documentation_context() {
    echo "## 📚 DOCUMENTATION CONTEXT"
    echo ""
    
    # Key documentation files
    local key_docs=(
        "CLAUDE.md"
        "FRICTION-MAPPING.md"
        "USER-JOURNEY.md"
        "docs/guides/ai-development/ai-assistant-setup.md"
    )
    
    echo "### Key Documentation"
    for doc in "${key_docs[@]}"; do
        if [[ -f "$doc" ]]; then
            echo "- ✅ [\`$doc\`]($doc)"
        else
            echo "- ❌ \`$doc\` (missing)"
        fi
    done
    echo ""
    
    # Architecture decisions
    if [[ -d "docs/architecture/decisions" ]]; then
        echo "### Architecture Decisions"
        find docs/architecture/decisions -name "*.md" 2>/dev/null | head -5
        echo ""
    fi
}

# Load enforcement and validation context
load_validation_context() {
    echo "## 🛡️ VALIDATION & ENFORCEMENT"
    echo ""
    
    # Current enforcement metrics
    if [[ -f ".enforcement-metrics.json" ]]; then
        echo "### Enforcement Metrics"
        echo "\`\`\`json"
        tail -10 ".enforcement-metrics.json" 2>/dev/null || echo "No metrics available"
        echo "\`\`\`"
        echo ""
    fi
    
    # Validation system status
    echo "### Validation System"
    if command -v npm >/dev/null 2>&1; then
        if npm run claude:config:status --silent 2>/dev/null; then
            echo "✅ Claude validation system active"
        else
            echo "⚠️ Claude validation system not configured"
        fi
    fi
    echo ""
    
    # Common anti-patterns to avoid
    echo "### Common Anti-Patterns to Avoid"
    echo "- ❌ Creating \`*_improved.py\`, \`*_enhanced.js\`, \`*_v2.tsx\` files"
    echo "- ❌ Using \`console.log\` instead of proper logging"
    echo "- ❌ Bare except clauses without specific exception types"
    echo "- ❌ Creating files in root directory outside allowlist"
    echo ""
}

# Main context generation based on mode
generate_context() {
    case "$CONTEXT_MODE" in
        "minimal")
            generate_context_header
            load_core_rules
            if [[ -n "$TARGET_FILE" ]]; then
                load_file_context "$TARGET_FILE"
            fi
            ;;
        "focused")
            generate_context_header
            load_core_rules
            load_project_status
            if [[ -n "$TARGET_FILE" ]]; then
                load_file_context "$TARGET_FILE"
            else
                load_tools_context
            fi
            ;;
        "full"|*)
            generate_context_header
            load_core_rules
            load_project_status
            if [[ -n "$TARGET_FILE" ]]; then
                load_file_context "$TARGET_FILE"
            fi
            load_architecture_context
            load_tools_context
            load_documentation_context
            load_validation_context
            ;;
    esac
}

# Footer with interaction guidance
generate_context_footer() {
    echo "## 🤖 CLAUDE CODE INTERACTION GUIDELINES"
    echo ""
    echo "As a Claude Code instance, you have these unique advantages:"
    echo ""
    echo "1. **Persistent Memory** - This context persists across the session"
    echo "2. **Real-time Validation** - Hooks catch violations immediately"
    echo "3. **Direct File Access** - No RAG unreliability"
    echo "4. **Tool Integration** - TodoWrite, generators, validation built-in"
    echo ""
    echo "### Session Objectives"
    echo "- Maintain 90%+ validation compliance"
    echo "- Use generators for new components: \`npm run g:c ComponentName\`"
    echo "- Follow Arrow-Chain RCA for debugging"
    echo "- Edit existing files rather than creating versions"
    echo "- Use TodoWrite for multi-step tasks"
    echo ""
    echo "### Ready for Development Work! 🚀"
    echo ""
}

# Main execution
main() {
    log "Loading Claude Code optimized context..."
    log "Mode: $CONTEXT_MODE"
    
    if [[ -n "$TARGET_FILE" ]]; then
        log "Target file: $TARGET_FILE"
    fi
    
    # Generate the context
    generate_context
    generate_context_footer
    
    success "Context loading complete"
    
    # Optional: Save context to file
    if [[ "${SAVE_CONTEXT:-false}" == "true" ]]; then
        local context_file="tools/metrics/claude-context-$(date +%s).md"
        generate_context > "$context_file"
        log "Context saved to: $context_file"
    fi
}

# Execute main function
main "$@"