#!/bin/bash
# Gathers all files related to a specific feature for AI context

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for feature name argument
if [ -z "$1" ]; then
    echo "Usage: $0 <feature-name> [output-file]"
    echo "Example: $0 auth context.md"
    exit 1
fi

FEATURE=$1
OUTPUT_FILE=${2:-"${FEATURE}-context.md"}

echo -e "${BLUE}Gathering context for feature: $FEATURE${NC}"

# Start the context file
cat > "$OUTPUT_FILE" << EOF
# Feature Context: $FEATURE
Generated on: $(date)

## Feature Structure
EOF

# Find feature directory
FEATURE_DIRS=$(find . -type d -name "*${FEATURE}*" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/.git/*" | head -10)

if [ -z "$FEATURE_DIRS" ]; then
    echo -e "${YELLOW}Warning: No directories found matching '$FEATURE'${NC}"
else
    echo -e "\n### Feature Directories\n" >> "$OUTPUT_FILE"
    echo "$FEATURE_DIRS" >> "$OUTPUT_FILE"
fi

# Find all related files
echo -e "\n## Related Files\n" >> "$OUTPUT_FILE"

# TypeScript/JavaScript files
echo -e "\n### Code Files\n" >> "$OUTPUT_FILE"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -path "*${FEATURE}*" -not -path "*/node_modules/*" -not -path "*/dist/*" 2>/dev/null | while read -r file; do
    echo "- $file" >> "$OUTPUT_FILE"
done

# Test files
echo -e "\n### Test Files\n" >> "$OUTPUT_FILE"
find . -type f \( -name "*.test.*" -o -name "*.spec.*" \) -path "*${FEATURE}*" -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    echo "- $file" >> "$OUTPUT_FILE"
done

# API routes
echo -e "\n### API Routes\n" >> "$OUTPUT_FILE"
grep -r "router.*${FEATURE}" --include="*.ts" --include="*.js" . 2>/dev/null | grep -v node_modules | head -10 >> "$OUTPUT_FILE" || echo "No API routes found" >> "$OUTPUT_FILE"

# Database models
echo -e "\n### Database Models\n" >> "$OUTPUT_FILE"
find . -type f -name "*.prisma" -o -name "*.sql" | xargs grep -l "$FEATURE" 2>/dev/null | head -10 >> "$OUTPUT_FILE" || echo "No database models found" >> "$OUTPUT_FILE"

# Component usage
echo -e "\n## Component Usage\n" >> "$OUTPUT_FILE"
echo "### Import statements referencing $FEATURE:" >> "$OUTPUT_FILE"
grep -r "import.*${FEATURE}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | head -20 >> "$OUTPUT_FILE" || echo "No imports found" >> "$OUTPUT_FILE"

# State management
echo -e "\n## State Management\n" >> "$OUTPUT_FILE"
echo "### Store references:" >> "$OUTPUT_FILE"
grep -r "use.*${FEATURE}.*Store\|${FEATURE}.*State\|${FEATURE}.*Context" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | head -10 >> "$OUTPUT_FILE" || echo "No state management found" >> "$OUTPUT_FILE"

# Configuration
echo -e "\n## Configuration\n" >> "$OUTPUT_FILE"
echo "### Environment variables:" >> "$OUTPUT_FILE"
grep -r "${FEATURE^^}_\|NEXT_PUBLIC_${FEATURE^^}_\|VITE_${FEATURE^^}_" --include="*.env*" --include="*.ts" --include="*.js" . 2>/dev/null | head -10 >> "$OUTPUT_FILE" || echo "No env vars found" >> "$OUTPUT_FILE"

# Types and interfaces
echo -e "\n## Types and Interfaces\n" >> "$OUTPUT_FILE"
echo "### Type definitions:" >> "$OUTPUT_FILE"
grep -r "interface.*${FEATURE}\|type.*${FEATURE}" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | head -20 >> "$OUTPUT_FILE" || echo "No types found" >> "$OUTPUT_FILE"

# File contents for key files
echo -e "\n## Key File Contents\n" >> "$OUTPUT_FILE"

# Find the main feature file
MAIN_FILE=$(find . -type f -name "${FEATURE}.ts" -o -name "${FEATURE}.tsx" -o -name "index.ts" -path "*${FEATURE}*" -not -path "*/node_modules/*" | head -1)

if [ -n "$MAIN_FILE" ]; then
    echo -e "\n### Main Feature File: $MAIN_FILE\n" >> "$OUTPUT_FILE"
    echo '```typescript' >> "$OUTPUT_FILE"
    head -50 "$MAIN_FILE" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
fi

# Summary
echo -e "\n## Summary\n" >> "$OUTPUT_FILE"
FILE_COUNT=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -path "*${FEATURE}*" -not -path "*/node_modules/*" 2>/dev/null | wc -l)
echo "- Total files found: $FILE_COUNT" >> "$OUTPUT_FILE"
echo "- Context file: $OUTPUT_FILE" >> "$OUTPUT_FILE"

echo -e "${GREEN}✅ Context gathered and saved to: $OUTPUT_FILE${NC}"
echo -e "${YELLOW}Tip: Review and edit the file before sharing with AI${NC}"