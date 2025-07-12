#!/bin/bash
# Security check script for development

set -e

echo "🔒 Running Security Checks..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Function to check for common security issues
check_secrets() {
    echo "🔍 Checking for hardcoded secrets..."
    
    # Common patterns for secrets
    patterns=(
        "password.*=.*['\"].*['\"]"
        "api[_-]?key.*=.*['\"].*['\"]"
        "secret.*=.*['\"].*['\"]"
        "token.*=.*['\"].*['\"]"
        "private[_-]?key"
        "-----BEGIN.*PRIVATE KEY-----"
        "aws[_-]?access[_-]?key"
        "aws[_-]?secret"
    )
    
    found_issues=0
    
    for pattern in "${patterns[@]}"; do
        if git grep -i -E "$pattern" --cached 2>/dev/null | grep -v -E "(test|spec|mock|example|template)" | grep -v "check-security.sh"; then
            found_issues=1
        fi
    done
    
    if [ $found_issues -eq 0 ]; then
        echo "✅ No hardcoded secrets found"
    else
        echo "❌ Potential secrets found! Please review above matches"
        return 1
    fi
}

# Check for console.log statements
check_console_logs() {
    echo ""
    echo "🔍 Checking for console.log statements..."
    
    if git grep -E "console\.(log|debug|info)" --cached 2>/dev/null | grep -v -E "(test|spec|mock)" | grep -v "check-security.sh"; then
        echo "⚠️  console.log statements found (use projectLogger instead)"
    else
        echo "✅ No console.log statements found"
    fi
}

# Check for TODO comments without ticket references
check_todos() {
    echo ""
    echo "🔍 Checking for TODOs without ticket references..."
    
    if git grep -E "TODO(?!.*[A-Z]+-[0-9]+)" --cached 2>/dev/null | grep -v "check-security.sh"; then
        echo "⚠️  TODOs found without ticket references"
    else
        echo "✅ All TODOs have ticket references"
    fi
}

# Check dependencies for known vulnerabilities
check_dependencies() {
    echo ""
    echo "🔍 Checking dependencies for vulnerabilities..."
    
    if [ -f "package.json" ]; then
        if command -v npm &> /dev/null; then
            npm audit --audit-level=moderate 2>/dev/null || echo "⚠️  Some vulnerabilities found"
        else
            echo "⚠️  npm not found, skipping dependency audit"
        fi
    else
        echo "⚠️  No package.json found"
    fi
}

# Check for sensitive file patterns
check_sensitive_files() {
    echo ""
    echo "🔍 Checking for sensitive files..."
    
    sensitive_patterns=(
        "*.pem"
        "*.key"
        "*.p12"
        "*.pfx"
        ".env"
        ".env.*"
        "id_rsa*"
        "*.ppk"
    )
    
    found_sensitive=0
    
    for pattern in "${sensitive_patterns[@]}"; do
        if git ls-files --cached | grep -E "$pattern" 2>/dev/null; then
            found_sensitive=1
        fi
    done
    
    if [ $found_sensitive -eq 0 ]; then
        echo "✅ No sensitive files in git"
    else
        echo "❌ Sensitive files found in git! Review above"
        return 1
    fi
}

# Check TypeScript strict mode
check_typescript_strict() {
    echo ""
    echo "🔍 Checking TypeScript configuration..."
    
    if [ -f "tsconfig.json" ]; then
        if grep -q '"strict": true' tsconfig.json; then
            echo "✅ TypeScript strict mode enabled"
        else
            echo "⚠️  TypeScript strict mode not enabled"
        fi
    else
        echo "⚠️  No tsconfig.json found"
    fi
}

# Main execution
echo "Starting security checks..."
echo "========================="

check_secrets
check_console_logs
check_todos
check_dependencies
check_sensitive_files
check_typescript_strict

echo ""
echo "========================="
echo "🔒 Security check complete!"
echo ""
echo "Note: This is a basic security check."
echo "For production, use comprehensive security scanning tools."