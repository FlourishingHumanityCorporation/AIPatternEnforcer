#!/usr/bin/env node

/**
 * Claude Code Hook: Block Root Directory Mess
 * 
 * Prevents AI from creating files in the root directory that belong in subdirectories.
 * Enforces the meta-project structure defined in CLAUDE.md.
 * 
 * This is critical for AIPatternEnforcer since it's a META-PROJECT for creating
 * templates, not an application itself.
 * 
 * Usage: Called by Claude Code before Write operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const path = require('path');

// From CLAUDE.md - allowed root files for meta-project
const ALLOWED_ROOT_FILES = new Set([
  // Meta-project Documentation
  'README.md', 'LICENSE', 'CLAUDE.md', 'CONTRIBUTING.md', 'SETUP.md',
  'FRICTION-MAPPING.md', 'QUICK-START.md', 'USER-JOURNEY.md', 'DOCS_INDEX.md',
  
  // Meta-project Configuration  
  'package.json', 'package-lock.json', 'tsconfig.json', '.eslintrc.json',
  '.prettierrc', '.env', '.env.example', '.gitignore',
  
  // CI/CD (allowed since it's for the meta-project)
  '.github', '.husky', '.vscode'
]);

// Directory suggestions for common mistakes
const DIRECTORY_SUGGESTIONS = {
  // Application code patterns
  'app': 'templates/nextjs-app-router/app/',
  'components': 'templates/[framework]/components/', 
  'lib': 'templates/[framework]/lib/',
  'pages': 'templates/nextjs-pages/pages/',
  'src': 'templates/[framework]/src/',
  
  // Config files that belong in templates
  'next.config.js': 'templates/nextjs-app-router/',
  'vite.config.js': 'templates/react-vite/',
  'tailwind.config.js': 'templates/[framework]/',
  'postcss.config.js': 'templates/[framework]/',
  'jest.config.js': 'templates/[framework]/',
  
  // Documentation that's not meta-project level
  'CHANGELOG.md': 'docs/reports/',
  'TODO.md': 'docs/plans/',
  'NOTES.md': 'docs/notes/',
  
  // Build artifacts
  'dist': 'templates/[framework]/dist/ (or add to .gitignore)',
  'build': 'templates/[framework]/build/ (or add to .gitignore)',
  '.next': 'templates/nextjs-app-router/.next/ (or add to .gitignore)'
};

// Read from stdin
let inputData = '';
process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(inputData);
    const toolInput = input.tool_input || {};
    const filePath = toolInput.file_path || toolInput.filePath || '';
    
    // Allow operations without file paths
    if (!filePath) {
      process.exit(0);
    }
    
    const parsed = path.parse(filePath);
    const isInRoot = parsed.dir === '.' || parsed.dir === '' || !parsed.dir || parsed.dir === process.cwd();
    
    // Only check files being created in root
    if (!isInRoot) {
      process.exit(0);
    }
    
    const fileName = parsed.base;
    
    // Allow explicitly approved root files
    if (ALLOWED_ROOT_FILES.has(fileName) || ALLOWED_ROOT_FILES.has(parsed.name)) {
      process.exit(0);
    }
    
    // Block and provide helpful suggestion
    const suggestion = DIRECTORY_SUGGESTIONS[fileName] || 
                      DIRECTORY_SUGGESTIONS[parsed.name] ||
                      getSuggestionByPattern(fileName);
    
    // Exit code 2 blocks the operation and shows stderr to Claude
    console.error(
      `❌ Don't create ${fileName} in root directory\n` +
      `✅ Use proper subdirectory: ${suggestion}\n` +
      `\n` +
      `💡 AIPatternEnforcer is a META-PROJECT for creating templates.\n` +
      `   Application files belong in templates/[framework]/\n` +
      `   Documentation belongs in docs/\n` +
      `\n` +
      `📖 See CLAUDE.md for complete directory structure`
    );
    process.exit(2);
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.error(`Hook error: ${error.message}`);
    process.exit(0);
  }
});

function getSuggestionByPattern(fileName) {
  const lower = fileName.toLowerCase();
  
  if (lower.includes('component') || lower.endsWith('.tsx') || lower.endsWith('.jsx')) {
    return 'templates/[framework]/components/';
  }
  
  if (lower.includes('page') || lower.includes('route')) {
    return 'templates/nextjs-app-router/app/';
  }
  
  if (lower.includes('hook') || lower.startsWith('use')) {
    return 'templates/[framework]/hooks/';
  }
  
  if (lower.includes('util') || lower.includes('helper')) {
    return 'templates/[framework]/lib/';
  }
  
  if (lower.endsWith('.md') && !lower.includes('readme')) {
    return 'docs/[category]/';
  }
  
  if (lower.includes('test') || lower.includes('spec')) {
    return 'tests/ or templates/[framework]/tests/';
  }
  
  if (lower.includes('script')) {
    return 'scripts/';
  }
  
  if (lower.includes('config') || lower.endsWith('.config.js')) {
    return 'templates/[framework]/ or config/';
  }
  
  return 'appropriate subdirectory (see CLAUDE.md)';
}

// Handle timeout
setTimeout(() => {
  console.error('Hook timeout - allowing operation');
  process.exit(0);
}, 1500);

module.exports = { getSuggestionByPattern, ALLOWED_ROOT_FILES, DIRECTORY_SUGGESTIONS };