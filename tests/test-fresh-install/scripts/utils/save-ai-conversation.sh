#!/bin/bash
# Save important AI conversations for future reference

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
CONVERSATIONS_DIR="docs/ai-conversations"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Check if title provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a conversation title${NC}"
    echo "Usage: $0 \"Title of conversation\" [optional-file-path]"
    echo "Example: $0 \"Debugging database connection issue\""
    exit 1
fi

TITLE="$1"
SAFE_TITLE=$(echo "$TITLE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g')
OUTPUT_FILE="$CONVERSATIONS_DIR/${TIMESTAMP}-${SAFE_TITLE}.md"

# Create directory if it doesn't exist
mkdir -p "$CONVERSATIONS_DIR"

# If file path provided, use it as source
if [ -n "$2" ] && [ -f "$2" ]; then
    SOURCE_FILE="$2"
    echo -e "${BLUE}Using provided file: $SOURCE_FILE${NC}"
else
    # Interactive mode - user will paste content
    SOURCE_FILE=""
    echo -e "${YELLOW}No file provided. Please paste the conversation content.${NC}"
fi

# Create the conversation file
cat > "$OUTPUT_FILE" << EOF
# AI Conversation: $TITLE

**Date**: $(date +"%Y-%m-%d %H:%M:%S")
**Tool**: [Cursor/Copilot/ChatGPT/Claude]
**Model**: [gpt-4/claude-3/etc]
**Context**: [Brief context of what you were trying to solve]

## Problem Statement

[Describe the problem you were trying to solve]

## Key Insights

1. [Important learning or insight]
2. [Another key point]
3. [Etc]

## Conversation

EOF

# Add conversation content
if [ -n "$SOURCE_FILE" ]; then
    # From file
    cat "$SOURCE_FILE" >> "$OUTPUT_FILE"
else
    # From clipboard or manual input
    echo -e "${YELLOW}Paste the conversation below. Press Ctrl+D when done:${NC}"
    cat >> "$OUTPUT_FILE"
fi

# Add footer
cat >> "$OUTPUT_FILE" << EOF

## Outcome

[What was the result? Did it solve the problem?]

## Follow-up Actions

- [ ] [Any follow-up tasks]
- [ ] [Documentation to update]
- [ ] [Patterns to add to examples]

## Tags

#ai-conversation #$SAFE_TITLE

---

*Saved from: $(pwd)*
EOF

# Create index entry
INDEX_FILE="$CONVERSATIONS_DIR/INDEX.md"
if [ ! -f "$INDEX_FILE" ]; then
    cat > "$INDEX_FILE" << EOF
# AI Conversations Index

A collection of useful AI conversations for reference.

## Conversations

EOF
fi

# Add to index
echo "- [$(date +%Y-%m-%d) - $TITLE](./${TIMESTAMP}-${SAFE_TITLE}.md)" >> "$INDEX_FILE"

# Summary
echo -e "${GREEN}✅ Conversation saved successfully!${NC}"
echo -e "File: $OUTPUT_FILE"
echo -e "Index: $INDEX_FILE"

# Prompt for additional actions
echo -e "\n${BLUE}Suggested next steps:${NC}"
echo "1. Review and edit the saved conversation"
echo "2. Extract any reusable prompts to ai/prompts/"
echo "3. Add any new patterns to ai/examples/"
echo "4. Update .cursorrules if you discovered new rules"

# Optional: Git add the files
read -p "Add to git? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add "$OUTPUT_FILE" "$INDEX_FILE"
    echo -e "${GREEN}Files added to git${NC}"
fi

# Optional: Extract patterns
echo
read -p "Extract reusable patterns? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Creating pattern extraction template...${NC}"
    
    PATTERN_FILE="ai/prompts/extracted/${SAFE_TITLE}.md"
    mkdir -p "ai/prompts/extracted"
    
    cat > "$PATTERN_FILE" << EOF
# Extracted Pattern: $TITLE

**Source**: $OUTPUT_FILE
**Date**: $(date +%Y-%m-%d)

## Pattern

\`\`\`markdown
[Extract the reusable prompt pattern here]
\`\`\`

## When to Use

[Describe when this pattern is useful]

## Example Usage

[Show an example of using this pattern]

## Variations

[Any variations or parameters that can be adjusted]
EOF

    echo -e "${GREEN}Pattern template created: $PATTERN_FILE${NC}"
    echo "Please edit this file to extract the reusable pattern"
fi