#!/bin/bash

# Setup script for Claude Code validation system
# Automates installation and configuration of claude-validation tools

set -euo pipefail

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${CYAN}🔧 $1${NC}"
}

# Check if we're in the right directory
check_project_root() {
    if [[ ! -f "package.json" ]] || [[ ! -f "CLAUDE.md" ]]; then
        log_error "This script must be run from the ProjectTemplate root directory"
        exit 1
    fi
}

# Verify Node.js version
check_node_version() {
    log_header "Checking Node.js version"
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    local node_version=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [[ $node_version -lt 18 ]]; then
        log_error "Node.js version 18+ required. Current version: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js version $(node --version) is compatible"
}

# Install npm dependencies if needed
install_dependencies() {
    log_header "Installing dependencies"
    
    if [[ ! -d "node_modules" ]]; then
        log_info "Installing npm dependencies..."
        npm install
        log_success "Dependencies installed"
    else
        log_success "Dependencies already installed"
    fi
}

# Create claude-validation directory structure
create_directory_structure() {
    log_header "Setting up directory structure"
    
    # Ensure claude-validation directory exists
    if [[ ! -d "tools/claude-validation" ]]; then
        mkdir -p tools/claude-validation
        log_success "Created tools/claude-validation directory"
    else
        log_success "tools/claude-validation directory already exists"
    fi
}

# Set up configuration file
setup_configuration() {
    log_header "Setting up configuration"
    
    local config_file="tools/claude-validation/.claude-validation-config.json"
    
    if [[ ! -f "$config_file" ]]; then
        log_info "Creating default configuration file..."
        
        cat > "$config_file" << 'EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "claude-validation-config",
  "title": "Claude Code Validation Configuration",
  "description": "Configuration for Claude Code rule validation system",
  "version": "1.0.0",
  "enabled": true,
  "severityLevels": {
    "global": "WARNING",
    "description": "Global severity filter: CRITICAL, WARNING, INFO, or DISABLED"
  },
  "patterns": {
    "promptImprovement": {
      "enabled": true,
      "severity": "CRITICAL",
      "description": "Complex requests must start with '**Improved Prompt**:'"
    },
    "noImprovedFiles": {
      "enabled": true,
      "severity": "CRITICAL",
      "description": "Never create _improved, _enhanced, _v2 files"
    },
    "generatorUsage": {
      "enabled": true,
      "severity": "WARNING",
      "description": "Should recommend component generators for new components"
    },
    "todoWriteUsage": {
      "enabled": true,
      "severity": "WARNING",
      "description": "Should use TodoWrite for multi-step tasks"
    },
    "originalFileEditing": {
      "enabled": true,
      "severity": "INFO",
      "description": "Should mention editing original files for improvements"
    },
    "conciseResponse": {
      "enabled": true,
      "severity": "INFO",
      "description": "Simple queries should get concise responses (<4 lines)"
    }
  },
  "contextRules": {
    "complexRequestThreshold": 20,
    "simpleQueryMaxLines": 4,
    "multiStepKeywords": [
      "implement",
      "build",
      "create",
      "multiple",
      "several",
      "steps"
    ]
  },
  "scoring": {
    "critical": -25,
    "warning": -10,
    "info": -5
  },
  "output": {
    "showPassedRules": false,
    "showTimestamp": true,
    "colorOutput": true,
    "verboseMode": false
  }
}
EOF
        log_success "Created default configuration file"
    else
        log_success "Configuration file already exists"
    fi
}

# Install and verify npm scripts
install_npm_scripts() {
    log_header "Installing npm scripts"
    
    if [[ -f "scripts/ensure-claude-scripts.js" ]]; then
        log_info "Installing claude-validation npm scripts..."
        if node scripts/ensure-claude-scripts.js install; then
            log_success "npm scripts installed successfully"
        else
            log_error "Failed to install npm scripts"
            exit 1
        fi
    else
        log_warning "Script installer not found, skipping automatic installation"
    fi
}

# Verify npm scripts are installed
verify_npm_scripts() {
    log_header "Verifying npm scripts"
    
    if [[ -f "scripts/ensure-claude-scripts.js" ]]; then
        if node scripts/ensure-claude-scripts.js validate; then
            log_success "All npm scripts are properly configured"
        else
            log_error "npm script validation failed"
            exit 1
        fi
    else
        log_warning "Script validator not found, skipping verification"
    fi
}

# Test basic functionality
test_basic_functionality() {
    log_header "Testing basic functionality"
    
    # Test config manager
    if [[ -f "tools/claude-validation/config-manager.js" ]]; then
        if node tools/claude-validation/config-manager.js status > /dev/null 2>&1; then
            log_success "Configuration manager is working"
        else
            log_warning "Configuration manager test failed"
        fi
    else
        log_warning "Configuration manager not found"
    fi
    
    # Test compliance validator
    if [[ -f "tools/claude-validation/compliance-validator.js" ]]; then
        if node -e "require('./tools/claude-validation/compliance-validator.js')" 2>/dev/null; then
            log_success "Compliance validator loads successfully"
        else
            log_warning "Compliance validator test failed"
        fi
    else
        log_warning "Compliance validator not found"
    fi
}

# Show usage instructions
show_usage_instructions() {
    log_header "Setup Complete!"
    
    echo -e "\n${GREEN}🎉 Claude validation system is now ready to use!${NC}\n"
    
    echo -e "${CYAN}Quick Commands:${NC}"
    echo "  npm run claude:config:status    # Show current settings"
    echo "  npm run claude:validate         # Validate Claude responses"
    echo "  npm run claude:test             # Run compliance tests"
    echo ""
    
    echo -e "${CYAN}Configuration:${NC}"
    echo "  npm run claude:config enable promptImprovement"
    echo "  npm run claude:config disable generatorUsage"
    echo "  npm run claude:config set-severity CRITICAL"
    echo ""
    
    echo -e "${CYAN}Configuration file:${NC}"
    echo "  tools/claude-validation/.claude-validation-config.json"
    echo ""
    
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Review configuration: npm run claude:config:status"
    echo "  2. Test with sample input: echo 'test response' | npm run claude:validate"
    echo "  3. Customize patterns in the config file as needed"
}

# Main setup function
main() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  Claude Validation Setup                    ║"
    echo "║              ProjectTemplate Rule Compliance                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_project_root
    check_node_version
    install_dependencies
    create_directory_structure
    setup_configuration
    install_npm_scripts
    verify_npm_scripts
    test_basic_functionality
    show_usage_instructions
    
    log_success "Setup completed successfully!"
}

# Run setup if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi