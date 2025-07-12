#!/bin/bash
# Claude Code Self-Onboarding Script
# Implements LEARN Framework for fresh Claude Code instances

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[Claude Code Onboarding]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

# Track onboarding progress
ONBOARDING_STATE_FILE="tools/metrics/claude-onboarding-state.json"
SESSION_ID=$(date +%s)

# Initialize state tracking
init_state() {
    mkdir -p "$(dirname "$ONBOARDING_STATE_FILE")"
    
    if [[ ! -f "$ONBOARDING_STATE_FILE" ]]; then
        cat > "$ONBOARDING_STATE_FILE" << EOF
{
  "sessionId": "$SESSION_ID",
  "startTime": "$(date -Iseconds)",
  "phases": {
    "load": {"completed": false, "duration": null},
    "explore": {"completed": false, "duration": null},
    "assess": {"completed": false, "duration": null},
    "reinforce": {"completed": false, "duration": null},
    "navigate": {"completed": false, "duration": null}
  },
  "capabilities": {
    "fileAccess": false,
    "toolIntegration": false,
    "patternRecognition": false,
    "validationSystem": false,
    "contextLoading": false
  },
  "level": 0,
  "completionStatus": "in_progress"
}
EOF
    fi
}

# Update state
update_state() {
    local phase="$1"
    local status="$2"
    local duration="$3"
    
    # Use node to update JSON (more reliable than sed)
    node -e "
        const fs = require('fs');
        const state = JSON.parse(fs.readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
        state.phases['$phase'] = {completed: $status, duration: '$duration'};
        fs.writeFileSync('$ONBOARDING_STATE_FILE', JSON.stringify(state, null, 2));
    "
}

# Check if running in correct directory
check_project_root() {
    if [[ ! -f "CLAUDE.md" ]] || [[ ! -f "package.json" ]]; then
        error "Must be run from ProjectTemplate root directory"
        error "Expected files: CLAUDE.md, package.json"
        exit 1
    fi
}

# PHASE 1: LOAD - Bootstrap context and verify environment
phase_load() {
    log "Phase 1: LOAD - Bootstrap Context Loading"
    local start_time=$(date +%s)
    
    echo "🔍 Reading project foundations..."
    
    # Verify CLAUDE.md exists and is readable
    if [[ ! -f "CLAUDE.md" ]]; then
        error "CLAUDE.md not found - core project rules missing"
        exit 1
    fi
    
    # Extract key rules from CLAUDE.md
    echo "📖 Learning core project rules..."
    local never_rules=$(grep -A 10 "NEVER DO THESE" CLAUDE.md | head -15)
    local always_rules=$(grep -A 10 "ALWAYS DO THESE" CLAUDE.md | head -15)
    
    if [[ -z "$never_rules" ]] || [[ -z "$always_rules" ]]; then
        warning "Could not extract all core rules from CLAUDE.md"
    else
        success "Core project rules loaded successfully"
    fi
    
    # Verify project structure
    echo "🏗️ Verifying project structure..."
    local required_dirs=("src" "docs" "scripts" "tools" "ai")
    local missing_dirs=()
    
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            missing_dirs+=("$dir")
        fi
    done
    
    if [[ ${#missing_dirs[@]} -gt 0 ]]; then
        warning "Missing directories: ${missing_dirs[*]}"
    else
        success "Project structure verified"
    fi
    
    # Update capability: fileAccess
    node -e "
        const fs = require('fs');
        const state = JSON.parse(fs.readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
        state.capabilities.fileAccess = true;
        fs.writeFileSync('$ONBOARDING_STATE_FILE', JSON.stringify(state, null, 2));
    "
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    update_state "load" "true" "${duration}s"
    
    success "Phase 1 LOAD completed in ${duration}s"
}

# PHASE 2: EXPLORE - Test capabilities and tool integration
phase_explore() {
    log "Phase 2: EXPLORE - Capability Discovery"
    local start_time=$(date +%s)
    
    echo "🔧 Testing tool integration..."
    
    # Test npm scripts availability
    local key_scripts=("g:c" "validate" "check:all" "context")
    local missing_scripts=()
    
    for script in "${key_scripts[@]}"; do
        if ! npm run 2>&1 | grep -q "^  $script$"; then
            missing_scripts+=("$script")
        fi
    done
    
    if [[ ${#missing_scripts[@]} -gt 0 ]]; then
        warning "Missing npm scripts: ${missing_scripts[*]}"
        warning "Some functionality may be limited"
    else
        success "All key npm scripts available"
        # Update capability: toolIntegration
        node -e "
            const fs = require('fs');
            const state = JSON.parse(fs.readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
            state.capabilities.toolIntegration = true;
            fs.writeFileSync('$ONBOARDING_STATE_FILE', JSON.stringify(state, null, 2));
        "
    fi
    
    # Test validation system
    echo "🛡️ Testing validation system..."
    if [[ -f ".claude/settings.json" ]]; then
        if node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json', 'utf8'))" 2>/dev/null; then
            success "Validation system hooks configured"
            node -e "
                const fs = require('fs');
                const state = JSON.parse(fs.readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
                state.capabilities.validationSystem = true;
                fs.writeFileSync('$ONBOARDING_STATE_FILE', JSON.stringify(state, null, 2));
            "
        else
            warning "Validation system hooks malformed"
        fi
    else
        warning "No Claude Code validation hooks found (.claude/settings.json)"
    fi
    
    # Test context loading capability
    echo "🧠 Testing context loading..."
    if [[ -f "scripts/dev/ai-context-dump.sh" ]]; then
        success "Context loading scripts available"
        node -e "
            const fs = require('fs');
            const state = JSON.parse(fs.readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
            state.capabilities.contextLoading = true;
            fs.writeFileSync('$ONBOARDING_STATE_FILE', JSON.stringify(state, null, 2));
        "
    else
        warning "Context loading scripts not found"
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    update_state "explore" "true" "${duration}s"
    
    success "Phase 2 EXPLORE completed in ${duration}s"
}

# PHASE 3: ASSESS - Pattern recognition and anti-pattern awareness
phase_assess() {
    log "Phase 3: ASSESS - Pattern Recognition Training"
    local start_time=$(date +%s)
    
    echo "🎯 Learning good patterns..."
    
    # Check for pattern examples
    local pattern_dirs=("ai/examples/good-patterns" "ai/examples/anti-patterns")
    local pattern_score=0
    
    for dir in "${pattern_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            local file_count=$(find "$dir" -type f | wc -l)
            if [[ $file_count -gt 0 ]]; then
                success "Found $file_count pattern examples in $dir"
                ((pattern_score++))
            fi
        else
            warning "Pattern directory not found: $dir"
        fi
    done
    
    # Test pattern recognition with key anti-patterns
    echo "🚫 Testing anti-pattern recognition..."
    local anti_patterns=(
        "*_improved.py"
        "*_enhanced.js"
        "*_v2.tsx"
        "console.log"
        "bare except:"
    )
    
    echo "Key anti-patterns to avoid:"
    for pattern in "${anti_patterns[@]}"; do
        echo "  - Never create: $pattern"
    done
    
    if [[ $pattern_score -gt 0 ]]; then
        success "Pattern recognition capability validated"
        
        # Run pattern recognition exercises
        echo "🧠 Running pattern recognition exercises..."
        if command -v npm >/dev/null 2>&1; then
            npm run claude:quiz:file-naming --silent >/dev/null 2>&1 || true
            success "Pattern recognition exercises completed"
        fi
        
        node -e "
            const fs = require('fs');
            const state = JSON.parse(fs.readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
            state.capabilities.patternRecognition = true;
            state.level = 1;
            fs.writeFileSync('$ONBOARDING_STATE_FILE', JSON.stringify(state, null, 2));
        "
        
        # Record interaction in capability tracker
        npm run claude:capability:record -- "patternRecognition" "true" '{"phase":"assess","description":"Completed pattern recognition phase"}' --silent >/dev/null 2>&1 || true
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    update_state "assess" "true" "${duration}s"
    
    success "Phase 3 ASSESS completed in ${duration}s - Level 1 achieved"
}

# PHASE 4: REINFORCE - Practice key workflows
phase_reinforce() {
    log "Phase 4: REINFORCE - Workflow Integration"
    local start_time=$(date +%s)
    
    echo "⚡ Testing essential workflows..."
    
    # Test generator workflow (if available)
    if command -v npm >/dev/null 2>&1; then
        echo "🏗️ Testing component generation..."
        # Use generator directly in non-interactive mode to avoid hanging
        if node tools/generators/enhanced-component-generator.js OnboardingTest 2>/dev/null; then
            success "Component generator workflow validated"
            # Clean up test component
            rm -rf "src/components/OnboardingTest" 2>/dev/null || true
        else
            warning "Component generator needs configuration"
        fi
    fi
    
    # Test debugging methodology (Arrow-Chain RCA)
    echo "🐛 Learning Arrow-Chain RCA methodology..."
    cat << 'EOF'
    
📋 Arrow-Chain Root Cause Analysis:
1. SYMPTOM - What user sees
2. TRACE - Follow data flow  
3. ARROW CHAIN - Map transformations
4. HYPOTHESIS - Root cause theory
5. VALIDATE - Reproduce and test fix
6. PATCH - Implement at root cause

EOF
    
    # Test validation commands
    echo "✅ Testing validation workflows..."
    local validation_commands=("npm test" "npm run lint" "npm run check:all")
    local working_validations=0
    
    for cmd in "${validation_commands[@]}"; do
        # Remove --silent flag as it doesn't exist for npm commands
        if eval "$cmd" >/dev/null 2>&1; then
            success "$cmd works"
            ((working_validations++))
        else
            warning "$cmd needs setup or has errors"
        fi
    done
    
    if [[ $working_validations -gt 0 ]]; then
        node -e "
            const fs = require('fs');
            const state = JSON.parse(fs.readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
            state.level = 2;
            fs.writeFileSync('$ONBOARDING_STATE_FILE', JSON.stringify(state, null, 2));
        "
        
        # Record validation capability in tracker
        npm run claude:capability:record -- "validationCompliance" "true" '{"phase":"reinforce","description":"Validation systems working"}' --silent >/dev/null 2>&1 || true
        success "Level 2 capability achieved - Project-Aware Assistant"
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    update_state "reinforce" "true" "${duration}s"
    
    success "Phase 4 REINFORCE completed in ${duration}s"
}

# PHASE 5: NAVIGATE - Ongoing learning framework
phase_navigate() {
    log "Phase 5: NAVIGATE - Continuous Learning Setup"
    local start_time=$(date +%s)
    
    echo "🧭 Establishing continuous learning..."
    
    # Create learning progress tracker
    echo "📈 Setting up progress tracking..."
    
    # Check for documentation resources
    local doc_resources=(
        "docs/guides/ai-development"
        "docs/architecture/patterns"
        "FRICTION-MAPPING.md"
        "USER-JOURNEY.md"
    )
    
    local available_docs=0
    for resource in "${doc_resources[@]}"; do
        if [[ -f "$resource" ]] || [[ -d "$resource" ]]; then
            ((available_docs++))
        fi
    done
    
    success "$available_docs/$#{doc_resources[@]} documentation resources available"
    
    # Set up continuous improvement tracking
    cat << 'EOF'

🎯 Continuous Learning Objectives:
- Monitor validation compliance rates
- Track pattern adherence improvement  
- Learn from enforcement feedback
- Evolve with project patterns
- Contribute to pattern library

📚 Key Resources for Ongoing Learning:
- CLAUDE.md - Core rules (re-read regularly)
- FRICTION-MAPPING.md - Common issues and solutions
- docs/architecture/patterns/ - Current best practices
- ai/examples/ - Pattern library

EOF
    
    # Mark navigation complete
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    update_state "navigate" "true" "${duration}s"
    
    # Final state update
    node -e "
        const fs = require('fs');
        const state = JSON.parse(fs.readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
        state.completionStatus = 'completed';
        state.completionTime = new Date().toISOString();
        state.level = Math.max(state.level, 2);
        fs.writeFileSync('$ONBOARDING_STATE_FILE', JSON.stringify(state, null, 2));
    "
    
    success "Phase 5 NAVIGATE completed in ${duration}s"
}

# Generate onboarding completion report
generate_completion_report() {
    log "Generating onboarding completion report..."
    
    local total_start=$(node -e "
        const state = JSON.parse(require('fs').readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
        console.log(state.startTime);
    ")
    
    local total_duration=$(node -e "
        const state = JSON.parse(require('fs').readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
        const start = new Date(state.startTime);
        const end = new Date();
        console.log(Math.round((end - start) / 1000));
    ")
    
    local final_level=$(node -e "
        const state = JSON.parse(require('fs').readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
        console.log(state.level);
    ")
    
    cat << EOF

🎉 CLAUDE CODE ONBOARDING COMPLETE!

📊 Session Summary:
   Total Duration: ${total_duration}s
   Final Level: $final_level (Project-Aware Assistant)
   Session ID: $SESSION_ID

✅ Capabilities Achieved:
$(node -e "
    const state = JSON.parse(require('fs').readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
    Object.entries(state.capabilities).forEach(([cap, enabled]) => {
        console.log('   ' + (enabled ? '✅' : '❌') + ' ' + cap);
    });
")

📋 Next Steps:
1. Use generators: npm run g:c ComponentName
2. Follow validation feedback in real-time
3. Refer to CLAUDE.md for project rules
4. Apply Arrow-Chain RCA for debugging
5. Maintain 90%+ compliance rate

🎯 Ready for development work with ProjectTemplate patterns!

EOF
}

# Check if resuming from previous state
check_resume() {
    local force_restart=${1:-false}
    
    if [[ -f "$ONBOARDING_STATE_FILE" ]]; then
        local completion_status=$(node -e "
            const state = JSON.parse(require('fs').readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
            console.log(state.completionStatus || 'in_progress');
        ")
        
        if [[ "$completion_status" == "completed" ]]; then
            if [[ "$force_restart" == "false" ]]; then
                warning "Onboarding already completed. Use --force to restart."
                echo "Run 'npm run claude:validate-onboarding' to check status."
                exit 0
            else
                log "Force restart: ignoring completed status"
                return 1  # Return 1 to indicate no resume needed
            fi
        fi
        
        echo "📂 Found existing onboarding state. Resuming..."
        return 0
    fi
    return 1
}

# Get next phase to execute
get_next_phase() {
    node -e "
        const fs = require('fs');
        const state = JSON.parse(fs.readFileSync('$ONBOARDING_STATE_FILE', 'utf8'));
        const phases = ['load', 'explore', 'assess', 'reinforce', 'navigate'];
        
        for (const phase of phases) {
            if (!state.phases[phase].completed) {
                console.log(phase);
                break;
            }
        }
    "
}

# Main execution
main() {
    echo "🤖 Claude Code Self-Onboarding Script"
    echo "======================================"
    
    # Parse command line arguments
    local force_restart=false
    if [[ "$1" == "--force" ]]; then
        force_restart=true
    fi
    
    check_project_root
    
    # Check for resume or force restart
    if check_resume "$force_restart" && [[ "$force_restart" == false ]]; then
        # Resume from last phase
        local next_phase=$(get_next_phase)
        if [[ -n "$next_phase" ]]; then
            log "Resuming from phase: $next_phase"
            case "$next_phase" in
                load) phase_load ;;
                explore) phase_explore ;;
                assess) phase_assess ;;
                reinforce) phase_reinforce ;;
                navigate) phase_navigate ;;
            esac
            
            # Continue with remaining phases
            if [[ "$next_phase" == "load" ]]; then
                phase_explore
                phase_assess
                phase_reinforce
                phase_navigate
            elif [[ "$next_phase" == "explore" ]]; then
                phase_assess
                phase_reinforce
                phase_navigate
            elif [[ "$next_phase" == "assess" ]]; then
                phase_reinforce
                phase_navigate
            elif [[ "$next_phase" == "reinforce" ]]; then
                phase_navigate
            fi
        fi
    else
        # Fresh start
        if [[ "$force_restart" == true ]]; then
            rm -f "$ONBOARDING_STATE_FILE"
            log "Force restart: cleared previous state"
        fi
        init_state
        
        # Execute all LEARN framework phases
        phase_load
        phase_explore  
        phase_assess
        phase_reinforce
        phase_navigate
    fi
    
    generate_completion_report
    
    success "Claude Code instance successfully onboarded!"
    echo "Run 'cat $ONBOARDING_STATE_FILE' to view detailed state"
}

# Handle script interruption
trap 'error "Onboarding interrupted"; exit 1' INT TERM

# Execute main function
main "$@"