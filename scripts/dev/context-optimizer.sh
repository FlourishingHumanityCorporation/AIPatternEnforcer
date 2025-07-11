#!/bin/bash

# Context Optimizer for AI Development
# Intelligently manages and optimizes context for AI tools

set -euo pipefail

# Configuration
MAX_CONTEXT_SIZE=${MAX_CONTEXT_SIZE:-32000}  # tokens (approximate)
CONTEXT_DIR=${CONTEXT_DIR:-.ai-context}
RELEVANCE_THRESHOLD=${RELEVANCE_THRESHOLD:-0.7}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create context directory if it doesn't exist
mkdir -p "$CONTEXT_DIR"

# Function to estimate token count (rough approximation)
estimate_tokens() {
    local file="$1"
    # Rough estimate: 1 token ≈ 4 characters
    wc -c < "$file" | awk '{print int($1/4)}'
}

# Function to calculate file relevance based on recent activity
calculate_relevance() {
    local file="$1"
    local score=0
    
    # Check if file was modified recently (last 7 days)
    if find "$file" -mtime -7 -print -quit | grep -q .; then
        score=$((score + 30))
    fi
    
    # Check if file is in git staging area
    if git diff --cached --name-only | grep -q "^$file$"; then
        score=$((score + 40))
    fi
    
    # Check if file has recent git commits (last 10 commits)
    if git log -n 10 --name-only --pretty=format: | grep -q "^$file$"; then
        score=$((score + 20))
    fi
    
    # Check if file is imported by many others (high connectivity)
    local import_count=$(grep -r "from.*$(basename "$file" .ts)" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
    if [ "$import_count" -gt 5 ]; then
        score=$((score + 10))
    fi
    
    echo "$score"
}

# Function to extract essential content from files
extract_essential_content() {
    local file="$1"
    local output_file="$2"
    
    echo "// File: $file" > "$output_file"
    echo "// Generated: $(date)" >> "$output_file"
    echo "" >> "$output_file"
    
    # Extract imports
    echo "// Imports:" >> "$output_file"
    grep -E "^import|^export.*from" "$file" 2>/dev/null >> "$output_file" || true
    echo "" >> "$output_file"
    
    # Extract interfaces and types
    echo "// Types & Interfaces:" >> "$output_file"
    awk '/^(export )?(interface|type) / {p=1} p && /^}/ {print; p=0} p' "$file" >> "$output_file"
    echo "" >> "$output_file"
    
    # Extract function signatures (without implementation)
    echo "// Function Signatures:" >> "$output_file"
    grep -E "^(export )?(async )?function|^(export )?const.*=.*(\(|async|function)" "$file" | \
        sed 's/{.*/{ ... }/' >> "$output_file" || true
    echo "" >> "$output_file"
    
    # Extract class definitions (without methods)
    echo "// Classes:" >> "$output_file"
    awk '/^(export )?class / {print; p=1; next} p && /^  (constructor|[a-zA-Z])/ {print "  // ... methods"} p && /^}/ {print; p=0}' "$file" >> "$output_file" || true
}

# Function to build optimized context
build_context() {
    local target_path="${1:-.}"
    local context_file="$CONTEXT_DIR/optimized-context.md"
    local manifest_file="$CONTEXT_DIR/context-manifest.json"
    
    echo -e "${BLUE}🔍 Analyzing project structure...${NC}"
    
    # Start context file
    cat > "$context_file" << EOF
# Optimized Project Context
Generated: $(date)
Target: $target_path

## Project Overview
$(head -n 20 README.md 2>/dev/null | grep -v "^#" | head -10 || echo "No README found")

## Key Files and Signatures
EOF

    # Initialize manifest
    echo '{"files": [' > "$manifest_file"
    local first=true
    local total_tokens=0
    
    # Find and rank relevant files
    echo -e "${BLUE}📊 Calculating file relevance...${NC}"
    
    # Create temporary file for sorted results
    temp_ranked=$(mktemp)
    
    # Process TypeScript/JavaScript files
    find "$target_path" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -not -path "*/build/*" \
        -not -path "*/*.test.*" \
        -not -path "*/*.spec.*" | while read -r file; do
        
        relevance=$(calculate_relevance "$file")
        tokens=$(estimate_tokens "$file")
        echo "$relevance $tokens $file"
    done | sort -nr > "$temp_ranked"
    
    # Process files by relevance until context limit
    while IFS=' ' read -r relevance tokens file; do
        if [ "$relevance" -lt "$RELEVANCE_THRESHOLD" ]; then
            continue
        fi
        
        new_total=$((total_tokens + tokens))
        if [ "$new_total" -gt "$MAX_CONTEXT_SIZE" ]; then
            echo -e "${YELLOW}⚠️  Context limit reached at $total_tokens tokens${NC}"
            break
        fi
        
        echo -e "${GREEN}✓ Including $file (relevance: $relevance, tokens: ~$tokens)${NC}"
        
        # Add to manifest
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$manifest_file"
        fi
        
        printf '  {"file": "%s", "relevance": %d, "tokens": %d}' "$file" "$relevance" "$tokens" >> "$manifest_file"
        
        # Extract essential content
        temp_extract=$(mktemp)
        extract_essential_content "$file" "$temp_extract"
        
        # Add to context
        echo "" >> "$context_file"
        echo "### $file" >> "$context_file"
        echo '```typescript' >> "$context_file"
        cat "$temp_extract" >> "$context_file"
        echo '```' >> "$context_file"
        
        rm "$temp_extract"
        total_tokens=$new_total
        
    done < "$temp_ranked"
    
    # Close manifest
    echo -e '\n]}' >> "$manifest_file"
    
    # Add architecture information
    echo -e "\n## Architecture Patterns" >> "$context_file"
    if [ -d "docs/architecture/patterns" ]; then
        for pattern in docs/architecture/patterns/*.md; do
            if [ -f "$pattern" ]; then
                echo -e "\n### $(basename "$pattern" .md)" >> "$context_file"
                head -n 30 "$pattern" | tail -n +3 >> "$context_file"
            fi
        done
    fi
    
    # Add current git status
    echo -e "\n## Current Git Status" >> "$context_file"
    echo '```' >> "$context_file"
    git status --short >> "$context_file" 2>/dev/null || echo "Not a git repository"
    echo '```' >> "$context_file"
    
    # Cleanup
    rm "$temp_ranked"
    
    echo -e "${GREEN}✨ Context optimization complete!${NC}"
    echo -e "${BLUE}📄 Context file: $context_file${NC}"
    echo -e "${BLUE}📊 Total tokens: ~$total_tokens${NC}"
    echo -e "${BLUE}📋 Manifest: $manifest_file${NC}"
}

# Function to create focused context for specific feature
create_feature_context() {
    local feature="$1"
    local context_file="$CONTEXT_DIR/feature-$feature-context.md"
    
    echo -e "${BLUE}🎯 Creating focused context for feature: $feature${NC}"
    
    cat > "$context_file" << EOF
# Feature Context: $feature
Generated: $(date)

## Related Files
EOF

    # Find files related to the feature
    find . -type f \( -name "*$feature*" -o -path "*/$feature/*" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" | while read -r file; do
        
        echo -e "${GREEN}✓ Including $file${NC}"
        echo -e "\n### $file" >> "$context_file"
        echo '```' >> "$context_file"
        head -n 100 "$file" >> "$context_file"
        echo '```' >> "$context_file"
    done
    
    # Find imports of the feature
    echo -e "\n## Files importing this feature" >> "$context_file"
    grep -r "from.*$feature" --include="*.ts" --include="*.tsx" 2>/dev/null | \
        cut -d: -f1 | sort -u | while read -r file; do
        echo "- $file" >> "$context_file"
    done
    
    echo -e "${GREEN}✨ Feature context created: $context_file${NC}"
}

# Function to clean old context files
clean_old_contexts() {
    echo -e "${BLUE}🧹 Cleaning old context files...${NC}"
    find "$CONTEXT_DIR" -name "*.md" -mtime +7 -delete
    find "$CONTEXT_DIR" -name "*.json" -mtime +7 -delete
    echo -e "${GREEN}✓ Cleaned old context files${NC}"
}

# Main menu
show_usage() {
    cat << EOF
Context Optimizer for AI Development

Usage: $0 [command] [options]

Commands:
    build [path]     Build optimized context for path (default: current directory)
    feature <name>   Create focused context for specific feature
    clean           Clean old context files
    help            Show this help message

Options:
    MAX_CONTEXT_SIZE    Maximum context size in tokens (default: 32000)
    RELEVANCE_THRESHOLD Minimum relevance score (default: 0.7)
    CONTEXT_DIR         Directory for context files (default: .ai-context)

Examples:
    $0 build                    # Build context for current directory
    $0 build src/components     # Build context for specific directory
    $0 feature authentication   # Create context for authentication feature
    $0 clean                   # Clean old context files

EOF
}

# Parse command line arguments
case "${1:-help}" in
    build)
        build_context "${2:-.}"
        ;;
    feature)
        if [ -z "${2:-}" ]; then
            echo -e "${RED}❌ Error: Feature name required${NC}"
            show_usage
            exit 1
        fi
        create_feature_context "$2"
        ;;
    clean)
        clean_old_contexts
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_usage
        exit 1
        ;;
esac