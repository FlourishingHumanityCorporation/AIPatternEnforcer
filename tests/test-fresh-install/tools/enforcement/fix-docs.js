#!/usr/bin/env node
/**
 * Documentation Style Auto-Fixer
 * 
 * Automatically fixes common documentation style violations:
 * - Line length issues (breaks at 120 chars)
 * - Replaces superlatives with technical terms  
 * - Adds language specs to code blocks
 * - Adds table of contents to long documents
 */

const fs = require('fs');
const path = require('path');

// Superlative replacement mapping
const SUPERLATIVE_REPLACEMENTS = {
  'amazing': 'functional',
  'awesome': 'effective', 
  'perfect': 'complete',
  'best': 'optimal',
  'excellent': 'robust',
  'fantastic': 'reliable',
  'incredible': 'comprehensive',
  'outstanding': 'well-designed',
  'wonderful': 'well-structured',
  'brilliant': 'efficient'
};

// Common code block language detection
const CODE_PATTERNS = {
  'npm run': 'bash',
  'git ': 'bash',
  'cd ': 'bash',
  'mkdir': 'bash',
  'import ': 'javascript',
  'export ': 'javascript',
  'function ': 'javascript',
  'const ': 'javascript',
  'interface ': 'typescript',
  'type ': 'typescript',
  'class ': 'typescript',
  'def ': 'python',
  'import ': 'python',
  'from ': 'python'
};

function fixLineLength(content) {
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (let line of lines) {
    if (line.length <= 120) {
      fixedLines.push(line);
      continue;
    }
    
    // Skip code blocks and headers
    if (line.startsWith('```') || line.startsWith('#') || line.trim().startsWith('- ')) {
      fixedLines.push(line);
      continue;
    }
    
    // Break long lines at logical points
    const words = line.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length > 120) {
        if (currentLine) {
          fixedLines.push(currentLine.trim());
          currentLine = word;
        } else {
          fixedLines.push(word); // Single word longer than 120
        }
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    }
    
    if (currentLine) {
      fixedLines.push(currentLine.trim());
    }
  }
  
  return fixedLines.join('\n');
}

function fixSuperlatives(content) {
  let fixed = content;
  
  for (const [superlative, replacement] of Object.entries(SUPERLATIVE_REPLACEMENTS)) {
    // Case-insensitive replacement, preserving original case
    const regex = new RegExp(`\\b${superlative}\\b`, 'gi');
    fixed = fixed.replace(regex, (match) => {
      if (match === match.toLowerCase()) return replacement;
      if (match === match.toUpperCase()) return replacement.toUpperCase();
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    });
  }
  
  return fixed;
}

function fixCodeBlocks(content) {
  const lines = content.split('\n');
  const fixedLines = [];
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('```')) {
      if (!inCodeBlock && line === '```') {
        // Start of code block without language
        const nextLine = lines[i + 1];
        if (nextLine) {
          // Try to detect language from content
          for (const [pattern, lang] of Object.entries(CODE_PATTERNS)) {
            if (nextLine.includes(pattern)) {
              fixedLines.push(`\`\`\`${lang}`);
              inCodeBlock = true;
              break;
            }
          }
          if (!inCodeBlock) {
            fixedLines.push('```text'); // Default fallback
            inCodeBlock = true;
          }
        } else {
          fixedLines.push(line);
        }
      } else {
        fixedLines.push(line);
        inCodeBlock = !inCodeBlock;
      }
    } else {
      fixedLines.push(line);
    }
  }
  
  return fixedLines.join('\n');
}

function generateTableOfContents(content) {
  const lines = content.split('\n');
  const headers = [];
  
  for (const line of lines) {
    const match = line.match(/^(#{2,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2];
      const anchor = title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
      
      headers.push({
        level,
        title,
        anchor
      });
    }
  }
  
  if (headers.length < 3) {
    return content; // Don't add TOC for short documents
  }
  
  // Generate TOC
  const toc = ['## Table of Contents', ''];
  let counter = 1;
  
  for (const header of headers) {
    const indent = '  '.repeat(header.level - 2);
    toc.push(`${indent}${counter}. [${header.title}](#${header.anchor})`);
    counter++;
  }
  
  toc.push('');
  
  // Insert TOC after first H1 header
  const firstHeaderIndex = lines.findIndex(line => line.startsWith('# '));
  if (firstHeaderIndex !== -1) {
    // Find the end of the intro section (before first ## header)
    let insertIndex = firstHeaderIndex + 1;
    while (insertIndex < lines.length && !lines[insertIndex].startsWith('## ')) {
      insertIndex++;
    }
    
    lines.splice(insertIndex, 0, ...toc);
  }
  
  return lines.join('\n');
}

function fixDocument(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes
    content = fixLineLength(content);
    content = fixSuperlatives(content);
    content = fixCodeBlocks(content);
    
    // Add TOC if document is long enough and doesn't already have one
    if (content.split('\n').length > 50 && !content.includes('## Table of Contents')) {
      content = generateTableOfContents(content);
    }
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return {
        fixed: true,
        changes: [
          'Line length optimized',
          'Superlatives replaced with technical terms',
          'Code blocks properly labeled',
          'Table of contents added (if needed)'
        ]
      };
    }
    
    return { fixed: false };
  } catch (error) {
    return { error: error.message };
  }
}

function findMarkdownFiles(dir = '.') {
  const files = [];
  const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!skipDirs.includes(item) && !item.startsWith('.')) {
          files.push(...findMarkdownFiles(fullPath));
        }
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }
  
  return files;
}

function main() {
  const args = process.argv.slice(2);
  const isQuiet = args.includes('--quiet');
  const isDryRun = args.includes('--dry-run');
  const specificFile = args.find(arg => arg.endsWith('.md') && !arg.startsWith('--'));
  
  let files;
  if (specificFile) {
    files = [specificFile];
  } else {
    files = findMarkdownFiles();
  }
  
  if (!isQuiet) {
    console.log(`🔧 Fixing documentation style in ${files.length} files...\n`);
  }
  
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const result = isDryRun ? { fixed: true, changes: ['Dry run - no changes made'] } : fixDocument(file);
    
    if (result.error) {
      if (!isQuiet) {
        console.error(`❌ Error fixing ${file}: ${result.error}`);
      }
      errorCount++;
    } else if (result.fixed) {
      if (!isQuiet) {
        console.log(`✅ Fixed ${file}`);
        if (result.changes) {
          result.changes.forEach(change => console.log(`   - ${change}`));
        }
        console.log();
      }
      fixedCount++;
    }
  }
  
  if (!isQuiet) {
    console.log(`\n📊 Summary:`);
    console.log(`   Files processed: ${files.length}`);
    console.log(`   Files fixed: ${fixedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    if (isDryRun) {
      console.log('\n🚨 DRY RUN - No files were actually modified');
    }
  }
  
  process.exit(errorCount > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { fixDocument, findMarkdownFiles };