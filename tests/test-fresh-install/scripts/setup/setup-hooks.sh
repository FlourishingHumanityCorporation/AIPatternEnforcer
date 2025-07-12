#!/bin/bash
# One-time setup for git hooks and enforcement tools

set -e

echo "🔧 Setting up ProjectTemplate git hooks and enforcement..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "info") echo -e "ℹ️  $2" ;;
    esac
}

# Check if we're in a git repository
if [ ! -d .git ]; then
    print_status "error" "Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_status "error" "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install husky if not already installed
if [ ! -d .husky ]; then
    print_status "info" "Installing husky..."
    npx husky install
    print_status "success" "Husky installed"
else
    print_status "info" "Husky already installed"
fi

# Add prepare script to package.json if not present
if ! grep -q '"prepare"' package.json; then
    print_status "info" "Adding prepare script to package.json..."
    npm pkg set scripts.prepare="husky install"
    print_status "success" "Prepare script added"
fi

# Create pre-commit hook
print_status "info" "Setting up pre-commit hook..."
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run all enforcement checks
npm run check:all

# Run lint-staged for formatting and linting
npx lint-staged

echo "✅ All pre-commit checks passed!"
EOF

chmod +x .husky/pre-commit
print_status "success" "Pre-commit hook created"

# Create commit-msg hook
print_status "info" "Setting up commit-msg hook..."
cat > .husky/commit-msg << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate commit message format
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,100}$'
commit_msg=$(cat "$1")

if ! echo "$commit_msg" | grep -qE "$commit_regex"; then
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Commit message must follow the pattern:"
    echo "  type(scope?): subject"
    echo ""
    echo "Examples:"
    echo "  feat(auth): add login functionality"
    echo "  fix: resolve memory leak in data processor"
    echo "  docs: update API documentation"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    exit 1
fi

echo "✅ Commit message format valid"
EOF

chmod +x .husky/commit-msg
print_status "success" "Commit-msg hook created"

# Create pre-push hook
print_status "info" "Setting up pre-push hook..."
cat > .husky/pre-push << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# Run tests
echo "Running tests..."
npm test

# Check for console.log statements
if git diff --name-only HEAD origin/$(git branch --show-current) | xargs grep -l "console\.log" 2>/dev/null; then
    echo "⚠️  Warning: console.log statements found in changed files"
    read -p "Continue with push? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Pre-push checks passed!"
EOF

chmod +x .husky/pre-push
print_status "success" "Pre-push hook created"

# Create lint-staged configuration if it doesn't exist
if [ ! -f .lintstagedrc.json ]; then
    print_status "info" "Creating lint-staged configuration..."
    cat > .lintstagedrc.json << 'EOF'
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "bash -c 'npm run check:no-improved-files -- \"$@\"' --"
  ],
  "*.{json,yaml,yml}": [
    "prettier --write"
  ],
  "*.md": [
    "prettier --write",
    "bash -c 'npm run check:documentation-style -- \"$@\"' --"
  ],
  "*.{css,scss,less}": [
    "prettier --write"
  ]
}
EOF
    print_status "success" "Lint-staged configuration created"
else
    print_status "info" "Lint-staged configuration already exists"
fi

# Ensure all enforcement scripts exist
print_status "info" "Checking enforcement scripts..."

SCRIPTS_NEEDED=(
    "tools/enforcement/no-improved-files.js"
    "tools/enforcement/check-imports.js"
    "tools/enforcement/documentation-style.js"
)

missing_scripts=()
for script in "${SCRIPTS_NEEDED[@]}"; do
    if [ ! -f "$script" ]; then
        missing_scripts+=("$script")
    fi
done

if [ ${#missing_scripts[@]} -gt 0 ]; then
    print_status "warning" "Missing enforcement scripts:"
    for script in "${missing_scripts[@]}"; do
        echo "  - $script"
    done
    echo ""
    echo "Run 'npm run setup:enforcement' to create missing scripts"
fi

# Final instructions
echo ""
print_status "success" "Git hooks setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create enforcement scripts if they don't exist:"
echo "   npm run setup:enforcement"
echo ""
echo "2. Test the hooks by making a commit:"
echo "   git add ."
echo "   git commit -m 'test: verify hooks are working'"
echo ""
echo "3. Configure your IDE to use the project's ESLint and Prettier settings"
echo ""
echo "🎉 You're all set! The following hooks are now active:"
echo "   - pre-commit: Runs linting, formatting, and custom checks"
echo "   - commit-msg: Validates commit message format"
echo "   - pre-push: Runs tests and final checks"