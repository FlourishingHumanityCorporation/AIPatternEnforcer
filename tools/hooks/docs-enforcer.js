#!/usr/bin/env node

/**
 * Claude Code Hook: Documentation Enforcer (Consolidated)
 * 
 * Enforces documentation standards and organization. Consolidates 2 previous hooks:
 * - docs-lifecycle-enforcer.js - Documentation lifecycle management
 * - docs-organization-enforcer.js - Documentation structure enforcement
 */

const HookRunner = require("./lib/HookRunner");
const path = require("path");

// Blocked completion document patterns (from CLAUDE.md rules)
const COMPLETION_PATTERNS = [
  /COMPLETE\.md$/i,
  /FINAL\.md$/i,
  /SUMMARY\.md$/i,
  /DONE\.md$/i,
  /FINISHED\.md$/i,
  /IMPLEMENTATION.*COMPLETE/i,
  /.*_COMPLETE\.md$/i,
  /.*_FINAL\.md$/i,
];

// Proper documentation organization
const DOC_STRUCTURE = {
  guides: /^docs\/guides\//,
  architecture: /^docs\/architecture\//,
  api: /^docs\/api\//,
  reports: /^docs\/reports\//,
  plans: /^docs\/plans\//,
  root: /^(README|CONTRIBUTING|LICENSE|CHANGELOG|SETUP|QUICK-START)\.md$/i,
};

// Announcement-style patterns to block (from CLAUDE.md)
const ANNOUNCEMENT_PATTERNS = [
  /this document describes/i,
  /implemented!/i,
  /we are pleased to announce/i,
  /this section provides/i,
  /this guide will show you/i,
];

// Required template sections for different doc types
const TEMPLATE_REQUIREMENTS = {
  readme: ['installation', 'usage', 'features'],
  guide: ['overview', 'steps', 'examples'],
  api: ['endpoints', 'parameters', 'responses'],
  feature: ['description', 'implementation', 'testing'],
};

/**
 * Hook logic function - enforces documentation standards
 * @param {Object} hookData - Parsed and standardized hook data
 * @param {HookRunner} runner - Hook runner instance for utilities
 * @returns {Object} Hook result
 */
function enforceDocumentation(hookData, runner) {
  // Only validate markdown files
  const filePath = hookData.filePath || hookData.file_path || '';
  if (!filePath.endsWith('.md')) {
    return { allow: true };
  }

  const fileName = path.basename(filePath);
  const content = hookData.content || hookData.new_string || '';

  // 1. Block completion documents (CRITICAL - from CLAUDE.md)
  const completionViolation = checkCompletionPatterns(fileName, runner);
  if (completionViolation.block) {
    return completionViolation;
  }

  // 2. Check for proper organization
  const organizationViolation = checkOrganization(filePath, fileName, runner);
  if (organizationViolation.block) {
    return organizationViolation;
  }

  // 3. Check for announcement-style writing
  const announcementViolation = checkAnnouncementStyle(content, runner);
  if (announcementViolation.block) {
    return announcementViolation;
  }

  // 4. Validate template compliance (warnings only)
  validateTemplateCompliance(content, filePath);

  return { allow: true };
}

/**
 * Check for blocked completion document patterns
 */
function checkCompletionPatterns(fileName, runner) {
  // Critical block: completion documents
  if (runner.matchesPatterns(fileName, COMPLETION_PATTERNS)) {
    const message = runner.formatError(
      `Completion documents are not allowed`,
      `❌ Don't create ${fileName}`,
      `✅ Update existing documentation instead`,
      `From CLAUDE.md: "DELETE completion docs immediately"`,
      `Maintain single source of truth for documentation`
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Check for proper documentation organization
 */
function checkOrganization(filePath, fileName, runner) {
  // Allow root-level important docs
  if (DOC_STRUCTURE.root.test(fileName)) {
    return { allow: true };
  }

  // Check if doc is in proper directory
  const isInDocsDir = filePath.startsWith('docs/');
  
  if (!isInDocsDir && !DOC_STRUCTURE.root.test(fileName)) {
    // Allow some flexibility but warn
    console.warn(`⚠️  Consider moving ${fileName} to docs/ directory for better organization`);
  }

  // Block clearly misplaced documentation
  if (fileName.toLowerCase().includes('guide') && !filePath.includes('docs/guides/')) {
    const message = runner.formatError(
      `Guide documents should be in docs/guides/`,
      `❌ ${fileName} appears to be a guide`,
      `✅ Move to docs/guides/ directory`,
      `Maintain consistent documentation structure`
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Check for announcement-style writing patterns
 */
function checkAnnouncementStyle(content, runner) {
  if (!content) return { allow: true };

  // Check for announcement patterns
  const violations = ANNOUNCEMENT_PATTERNS.filter(pattern => pattern.test(content));
  
  if (violations.length > 0) {
    const message = runner.formatError(
      `Avoid announcement-style documentation`,
      `❌ Found announcement patterns in content`,
      `✅ Use direct, technical language instead`,
      `From CLAUDE.md: "NO announcement-style docs"`,
      `Write timeless, professional documentation`
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Validate template compliance (warnings only)
 */
function validateTemplateCompliance(content, filePath) {
  if (!content) return;

  const fileName = path.basename(filePath, '.md').toLowerCase();
  
  // Determine document type
  let docType = null;
  if (fileName.includes('readme')) docType = 'readme';
  else if (fileName.includes('guide')) docType = 'guide';
  else if (fileName.includes('api')) docType = 'api';
  else if (fileName.includes('feature')) docType = 'feature';

  if (!docType) return;

  // Check for required sections
  const requiredSections = TEMPLATE_REQUIREMENTS[docType] || [];
  const missingSections = requiredSections.filter(section => {
    const sectionPattern = new RegExp(`#+.*${section}`, 'i');
    return !sectionPattern.test(content);
  });

  if (missingSections.length > 0) {
    console.warn(`⚠️  ${path.basename(filePath)} missing sections: ${missingSections.join(', ')}`);
  }

  // Check for proper markdown structure
  if (!content.includes('#')) {
    console.warn(`⚠️  ${path.basename(filePath)} should include header structure`);
  }
}

/**
 * Check for duplicate documentation
 */
function checkDuplicateDocumentation(filePath, content) {
  // This would require file system scanning - implement as needed
  // For now, just log a reminder
  if (content && content.length > 2000) {
    console.warn(`⚠️  Large documentation file - ensure no duplication with existing docs`);
  }
}

// Create and run the hook
HookRunner.create("docs-enforcer", enforceDocumentation, {
  timeout: 2000,
});

module.exports = { 
  COMPLETION_PATTERNS,
  ANNOUNCEMENT_PATTERNS,
  DOC_STRUCTURE,
  TEMPLATE_REQUIREMENTS,
  enforceDocumentation,
  checkCompletionPatterns,
  checkOrganization,
  checkAnnouncementStyle
};