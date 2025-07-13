#!/usr/bin/env node
/**
 * Banned Document Types Enforcement
 * 
 * Prevents creation of status/completion/summary documents that violate
 * ProjectTemplate documentation standards as defined in CLAUDE.md.
 * 
 * Banned patterns:
 * - Files ending with SUMMARY, REPORT, COMPLETE, COMPLETION
 * - Files starting with completion markers (✅, FIXED, DONE)
 * - Status announcement documents
 */

const fs = require('fs');
const path = require('path');

// Patterns that indicate banned document types
const BANNED_PATTERNS = {
  // Filename endings (case-insensitive)
  endings: [
  'SUMMARY.md',
  'REPORT.md',
  'COMPLETE.md',
  'COMPLETION.md',
  'FIXED.md',
  'DONE.md',
  'FINISHED.md',
  'STATUS.md',
  'FINAL.md'],


  // Filename patterns (case-insensitive)
  patterns: [
  /^COMPLETE[-_]/i,
  /^DONE[-_]/i,
  /^FIXED[-_]/i,
  /^FINISHED[-_]/i,
  /^FINAL[-_]/i,
  /[-_]COMPLETE$/i,
  /[-_]SUMMARY$/i,
  /[-_]REPORT$/i,
  /[-_]STATUS$/i,
  /[-_]FINAL$/i],


  // Content patterns that indicate completion docs
  contentPatterns: [
  /^#\s*✅.*Complete/i,
  /^#.*Implementation Complete/i,
  /^#.*Audit Complete/i,
  /^#.*Audit Summary$/i,
  /^#.*Final Report/i,
  /^#.*Project.*Summary$/i,
  /^#.*Enhancement.*Summary$/i,
  /^##\s*✅\s*Completed Tasks/i,
  /^##\s*What Was Accomplished/i,
  /^##\s*Audit Completed/i]

};

// Directories to skip
const SKIP_DIRS = [
'node_modules',
'.git',
'dist',
'build',
'.next',
'coverage',
'.turbo'];


function isBannedFilename(filename) {
  const basename = path.basename(filename);
  const upperBase = basename.toUpperCase();

  // Check exact endings
  for (const ending of BANNED_PATTERNS.endings) {
    if (upperBase.endsWith(ending.toUpperCase())) {
      return {
        banned: true,
        reason: `Filename ends with banned pattern: ${ending}`,
        suggestion: 'Remove status/completion suffixes from filenames'
      };
    }
  }

  // Check patterns
  for (const pattern of BANNED_PATTERNS.patterns) {
    if (pattern.test(basename)) {
      return {
        banned: true,
        reason: `Filename matches banned pattern: ${pattern}`,
        suggestion: 'Use descriptive names without status indicators'
      };
    }
  }

  return { banned: false };
}

function checkFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, 10); // Check first 10 lines

    for (const line of lines) {
      for (const pattern of BANNED_PATTERNS.contentPatterns) {
        if (pattern.test(line)) {
          return {
            banned: true,
            reason: 'Content indicates completion/status document',
            line: line.trim(),
            suggestion: 'Convert to technical documentation without status markers'
          };
        }
      }
    }
  } catch (error) {

    // Can't read file, skip content check
  }
  return { banned: false };
}

function findBannedDocuments(dir = '.', violations = []) {
  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const dirname = path.basename(fullPath);
        if (!SKIP_DIRS.includes(dirname) && !dirname.startsWith('.')) {
          findBannedDocuments(fullPath, violations);
        }
      } else if (item.endsWith('.md')) {
        // Check filename
        const filenameCheck = isBannedFilename(item);
        if (filenameCheck.banned) {
          violations.push({
            file: fullPath,
            type: 'filename',
            reason: filenameCheck.reason,
            suggestion: filenameCheck.suggestion
          });
        }

        // Check content for markdown files
        const contentCheck = checkFileContent(fullPath);
        if (contentCheck.banned) {
          violations.push({
            file: fullPath,
            type: 'content',
            reason: contentCheck.reason,
            line: contentCheck.line,
            suggestion: contentCheck.suggestion
          });
        }
      }
    }
  } catch (error) {
    logger.error(`Error scanning directory ${dir}:`, error.message);
  }

  return violations;
}

function main() {
  const args = process.argv.slice(2);
  const isQuiet = args.includes('--quiet');
  const isFix = args.includes('--fix');

  const violations = findBannedDocuments();

  if (violations.length === 0) {
    if (!isQuiet) {
      logger.info('✅ No banned document types found');
    }
    process.exit(0);
  }

  // Report violations
  if (!isQuiet) {
    logger.error('\n❌ Found banned document types:\n');

    const byType = {
      filename: violations.filter((v) => v.type === 'filename'),
      content: violations.filter((v) => v.type === 'content')
    };

    if (byType.filename.length > 0) {
      logger.error('📄 Banned Filenames:');
      byType.filename.forEach((v) => {
        logger.error(`  ${v.file}`);
        logger.error(`    ❌ ${v.reason}`);
        logger.error(`    💡 ${v.suggestion}\n`);
      });
    }

    if (byType.content.length > 0) {
      logger.error('📝 Banned Content Patterns:');
      byType.content.forEach((v) => {
        logger.error(`  ${v.file}`);
        logger.error(`    ❌ ${v.reason}`);
        if (v.line) {
          logger.error(`    📍 "${v.line}"`);
        }
        logger.error(`    💡 ${v.suggestion}\n`);
      });
    }

    logger.error(`Total violations: ${violations.length}\n`);
    logger.error('🚫 These document types are banned by CLAUDE.md standards:');
    logger.error('   - Status/completion announcements');
    logger.error('   - Summary documents');
    logger.error('   - Report documents (except in docs/reports/ for specific purposes)');
    logger.error('   - Any document indicating "done" or "complete"\n');
    logger.error('💡 Fix: Delete these files or convert to proper technical documentation\n');
  }

  if (isFix && !isQuiet) {
    logger.info('--fix option would delete these files (not implemented for safety)');
  }

  // Always exit with error when violations found
  process.exit(1);
}

if (require.main === module) {
  main();
}