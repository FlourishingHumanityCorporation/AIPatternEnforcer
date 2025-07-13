#!/usr/bin/env node
/**
 * Root File Enforcement
 * 
 * Ensures only allowed files exist in the project root directory.
 * Part of ProjectTemplate's enforcement system.
 */

const fs = require('fs');
const path = require('path');

const ROOT_FILE_ALLOWLIST = {
  // Exact filenames allowed in root
  exact: [
  // Core documentation
  'README.md',
  'LICENSE',
  'CLAUDE.md',
  'CONTRIBUTING.md',
  'SETUP.md',
  'FRICTION-MAPPING.md', // Core template feature
  'QUICK-START.md', // 5-minute setup guide (from user journey plan)
  'USER-JOURNEY.md', // User path definitions (from user journey plan)
  'FULL-GUIDE.md', // Comprehensive methodology (from user journey plan)
  'DOCS_INDEX.md', // Complete navigation hub (referenced in CLAUDE.md)

  // Package management - Node.js
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',

  // Package management - Python
  'requirements.txt',
  'Pipfile',
  'Pipfile.lock',
  'poetry.lock',
  'pyproject.toml',

  // Package management - Other languages
  'Gemfile',
  'Gemfile.lock',
  'go.mod',
  'go.sum',
  'Cargo.toml',
  'Cargo.lock',

  // Configuration files
  '.gitignore',
  '.aiignore',
  '.cursorrules', // Cursor AI rules
  '.env.example',
  '.nvmrc',
  '.editorconfig',
  '.prettierrc',
  '.prettierrc.json',
  '.prettierignore',
  '.eslintrc.json',
  '.eslintrc.js',
  '.eslintignore',
  'tsconfig.json',
  'jest.config.js',
  'vite.config.js',
  'vite.config.ts',
  'webpack.config.js',
  'next.config.js',
  'nuxt.config.js',
  'astro.config.mjs',
  'svelte.config.js',
  '.enforcement-config.json',
  '.enforcement-metrics.json',

  // CI/CD
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  '.dockerignore',
  'Makefile',
  'Procfile',
  '.gitlab-ci.yml',
  '.travis.yml',
  'Jenkinsfile',
  'netlify.toml',
  'vercel.json',

  // Monorepo tools
  'lerna.json',
  'nx.json',
  'pnpm-workspace.yaml',
  'rush.json',
  'turbo.json',
  'workspace.json'],


  // Pattern-based rules for dynamic filenames
  patterns: [
  /^\.env\..*$/, // .env.local, .env.production, etc.
  /^\..*rc$/, // .babelrc, .npmrc, etc.
  /^\..*rc\.(json|js|yml)$/, // .babelrc.json, etc.
  /^\..*ignore$/, // .gitignore, .dockerignore, etc.
  /^.*\.config\.(js|ts|json|mjs)$/ // Various config files
  ],

  // Directories allowed in root
  directories: [
  '.github',
  '.vscode',
  '.idea',
  '.husky',
  '.ai-compiled', // AI compiled contexts
  '.ai-context', // AI context management
  '.claude', // Claude configuration
  '.context-cache', // Context caching
  'src',
  'docs',
  'tests',
  'scripts',
  'config',
  'public',
  'assets',
  'static',
  'tools',
  'templates',
  'examples',
  'starters',
  'extensions',
  'ai',
  'dist', // Build output
  'build', // Build output
  '.next', // Next.js build
  'out', // Static export
  'node_modules', // Dependencies
  '.git' // Git repository
  ]
};

function checkRootFiles() {
  const rootPath = process.cwd();
  const items = fs.readdirSync(rootPath);
  const violations = [];

  items.forEach((item) => {
    const itemPath = path.join(rootPath, item);
    let stats;

    try {
      stats = fs.statSync(itemPath);
    } catch (error) {
      // Skip if can't read stats (e.g., broken symlinks)
      return;
    }

    if (stats.isDirectory()) {
      if (!ROOT_FILE_ALLOWLIST.directories.includes(item)) {
        violations.push({
          file: item,
          type: 'directory',
          message: `Directory "${item}" not allowed in root`,
          suggestion: 'Move to appropriate location or add to allowlist if legitimate'
        });
      }
    } else {
      const allowed =
      ROOT_FILE_ALLOWLIST.exact.includes(item) ||
      ROOT_FILE_ALLOWLIST.patterns.some((pattern) => pattern.test(item));

      if (!allowed) {
        violations.push({
          file: item,
          type: 'file',
          message: `File "${item}" not allowed in root`,
          suggestion: getSuggestion(item)
        });
      }
    }
  });

  return violations;
}

function getSuggestion(filename) {
  const lower = filename.toLowerCase();

  // Documentation files
  if (filename.endsWith('.md')) {
    if (lower.includes('summary') || lower.includes('report') || lower.includes('audit')) {
      return 'Move to docs/reports/ or delete if status/completion document';
    }
    if (lower.includes('plan') || lower.includes('proposal')) {
      return 'Move to docs/plans/';
    }
    if (lower.includes('todo')) {
      return 'Move to project management tool or docs/';
    }
    if (lower.includes('architecture')) {
      return 'Move to docs/architecture/';
    }
    if (lower.includes('snapshot') || lower.includes('debug')) {
      return 'Delete or add to .gitignore';
    }
    return 'Move to docs/';
  }

  // Log files
  if (filename.endsWith('.log')) {
    return 'Delete and add *.log to .gitignore';
  }

  // Script files
  if (filename.endsWith('.sh')) {
    return 'Move to scripts/';
  }

  return 'Move to appropriate subdirectory';
}

// Parse command line arguments
const args = process.argv.slice(2);
const isQuiet = args.includes('--quiet');
const isJson = args.includes('--json');

// Run enforcement
const violations = checkRootFiles();

if (violations.length > 0) {
  if (isJson) {
    logger.info(JSON.stringify({ violations }, null, 2));
  } else if (!isQuiet) {
    logger.error('\n❌ Root directory violations found:\n');
    violations.forEach((v) => {
      logger.error(`  📄 ${v.file}`);
      logger.error(`     ${v.message}`);
      logger.error(`     💡 ${v.suggestion}\n`);
    });
    logger.error(`Total violations: ${violations.length}\n`);
    logger.error('To fix: Move files to suggested locations or update the allowlist in');
    logger.error('tools/enforcement/root-file-enforcement.js if they should be allowed.\n');
  }
  process.exit(1);
} else {
  if (!isQuiet && !isJson) {
    logger.info('✅ Root directory is clean - no violations found');
  }
  if (isJson) {
    logger.info(JSON.stringify({ violations: [] }, null, 2));
  }
}