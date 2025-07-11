#!/bin/bash

# Template Cleanup Script
# Removes template-specific files after project creation
# Usage: ./scripts/init/cleanup-template.sh

set -e

echo "🧹 Cleaning up template-specific files..."

# Function to safely remove file/directory if it exists
safe_remove() {
    local path="$1"
    if [[ -e "$path" ]]; then
        echo "  ✅ Removing: $path"
        rm -rf "$path"
    else
        echo "  ⚠️  Not found: $path"
    fi
}

# Template-specific documentation
echo "📚 Removing template documentation..."
safe_remove "docs/newproject_decisions"
safe_remove "SETUP.md"
safe_remove "FRICTION-MAPPING.md"
safe_remove "template-architecture.md"
safe_remove "TODO.md"
safe_remove "AUDIT_SUMMARY.md"

# Template examples and starters
echo "🏗️  Removing template examples..."
safe_remove "examples"
safe_remove "starters"

# Debug and test snapshots
echo "🐛 Removing debug snapshots..."
for file in debug-snapshot-*.md; do
    if [[ -f "$file" ]]; then
        echo "  ✅ Removing: $file"
        rm -f "$file"
    fi
done
safe_remove "test-snapshot.md"

# Remove this cleanup script itself
echo "🗑️  Removing cleanup script..."
safe_remove "scripts/init/cleanup-template.sh"

# Template-specific sections in README.md
echo "📝 Updating README.md..."
if [[ -f "README.md" ]]; then
    # Create backup
    cp README.md README.md.backup
    
    # Remove template-specific sections
    # This is a basic implementation - may need customization per project
    sed -i '' '/## Template Features/,/^## /d' README.md || true
    sed -i '' '/## ProjectTemplate/,/^## /d' README.md || true
    
    echo "  ✅ README.md updated (backup saved as README.md.backup)"
else
    echo "  ⚠️  README.md not found"
fi

# Update CLAUDE.md to remove template-specific content
echo "🤖 Updating CLAUDE.md..."
if [[ -f "CLAUDE.md" ]]; then
    # Create backup
    cp CLAUDE.md CLAUDE.md.backup
    
    # Replace template name placeholder
    read -p "Enter your project name: " PROJECT_NAME
    if [[ -n "$PROJECT_NAME" ]]; then
        sed -i '' "s/ProjectTemplate/$PROJECT_NAME/g" CLAUDE.md
        sed -i '' "s/ProjectName/$PROJECT_NAME/g" CLAUDE.md
        echo "  ✅ CLAUDE.md updated with project name: $PROJECT_NAME"
    fi
    
    # Remove template-specific sections
    sed -i '' '/## Template Features/,/^## /d' CLAUDE.md || true
    
    echo "  ✅ CLAUDE.md updated (backup saved as CLAUDE.md.backup)"
else
    echo "  ⚠️  CLAUDE.md not found"
fi

# Update package.json
echo "📦 Updating package.json..."
if [[ -f "package.json" ]]; then
    # Create backup
    cp package.json package.json.backup
    
    # Remove template-specific scripts
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Remove template-specific scripts
        if (pkg.scripts) {
            delete pkg.scripts['cleanup:template'];
            delete pkg.scripts['stack-wizard'];
            delete pkg.scripts['choose-stack'];
        }
        
        // Update name if it's still the template name
        if (pkg.name === 'project-template') {
            pkg.name = process.cwd().split('/').pop();
        }
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        console.log('  ✅ package.json updated');
    " || echo "  ⚠️  Failed to update package.json"
else
    echo "  ⚠️  package.json not found"
fi

# Clean up empty directories
echo "🧹 Cleaning up empty directories..."
find . -type d -empty -not -path './.git/*' -not -path './node_modules/*' 2>/dev/null | while read -r dir; do
    if [[ -d "$dir" ]]; then
        echo "  ✅ Removing empty directory: $dir"
        rmdir "$dir" 2>/dev/null || true
    fi
done

echo ""
echo "🎉 Template cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes and remove .backup files if satisfied"
echo "2. Update README.md with your project-specific information"
echo "3. Fill in the Core Features section in CLAUDE.md"
echo "4. Run 'git add .' and commit your initial project setup"
echo ""
echo "Backup files created:"
echo "- README.md.backup"
echo "- CLAUDE.md.backup"
echo "- package.json.backup"
echo ""
echo "You can safely delete these backup files once you're satisfied with the changes."