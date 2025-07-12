#!/bin/bash
# Create new project from template

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get project name from argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: Project name required${NC}"
    echo "Usage: $0 <project-name>"
    exit 1
fi

PROJECT_NAME=$1
TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_DIR="../$PROJECT_NAME"

echo -e "${BLUE}Creating new project: $PROJECT_NAME${NC}"

# Check if directory already exists
if [ -d "$TARGET_DIR" ]; then
    echo -e "${RED}Error: Directory $TARGET_DIR already exists${NC}"
    exit 1
fi

# Create project directory
mkdir -p "$TARGET_DIR"

# Copy template files
echo -e "${BLUE}Copying template files...${NC}"
cp -r "$TEMPLATE_DIR"/* "$TARGET_DIR/" 2>/dev/null || true
cp "$TEMPLATE_DIR"/.gitignore "$TARGET_DIR/" 2>/dev/null || true
cp "$TEMPLATE_DIR"/.aiignore.template "$TARGET_DIR/.aiignore" 2>/dev/null || true

# Remove template-specific files
cd "$TARGET_DIR"
rm -f "template architecture.md"
rm -rf examples/
rm -f scripts/init/create-project.sh

# Update project-specific files
echo -e "${BLUE}Updating project configuration...${NC}"

# Update package.json with project name
if [ -f "package.json" ]; then
    sed -i.bak "s/\"name\": \"project-template\"/\"name\": \"$PROJECT_NAME\"/" package.json
    sed -i.bak "s/\"description\": \"Meta project template for AI-assisted development\"/\"description\": \"$PROJECT_NAME project\"/" package.json
    rm package.json.bak
fi

# Update README
if [ -f "README.md" ]; then
    echo "# $PROJECT_NAME" > README.md
    echo "" >> README.md
    echo "Project created from [project-template](https://github.com/yourusername/project-template)" >> README.md
    echo "" >> README.md
    echo "## Quick Start" >> README.md
    echo "" >> README.md
    echo "\`\`\`bash" >> README.md
    echo "npm install" >> README.md
    echo "npm run dev" >> README.md
    echo "\`\`\`" >> README.md
    echo "" >> README.md
    echo "## Development" >> README.md
    echo "" >> README.md
    echo "See \`docs/\` for detailed documentation." >> README.md
fi

# Initialize git repository
echo -e "${BLUE}Initializing git repository...${NC}"
git init
git add .
git commit -m "Initial commit from project-template"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

echo -e "${GREEN}✅ Project created successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  cd $TARGET_DIR"
echo "  code ."
echo ""
echo -e "${YELLOW}Customize for your project:${NC}"
echo "  1. Update docs/decisions/project-requirements.md"
echo "  2. Configure ai/.cursorrules for your stack"
echo "  3. Run: npm run ai:context"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"