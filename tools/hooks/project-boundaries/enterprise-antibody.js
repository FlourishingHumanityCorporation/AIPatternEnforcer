#!/usr/bin/env node

/**
 * Claude Code Hook: Enterprise Antibody
 *
 * Actively prevents enterprise patterns from being introduced into local-only projects.
 * Based on GOAL.md's extensive list of features to EXCLUDE, this hook blocks
 * multi-tenant, authentication, monitoring, and other enterprise complexities.
 *
 * This hook is essential because AI often defaults to "production-ready" code
 * with unnecessary complexity for simple local projects.
 *
 * Blocks:
 * - Multi-tenant architectures
 * - Complex authentication systems
 * - User management features
 * - Audit logging and compliance
 * - Production monitoring
 * - Team collaboration features
 *
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const HookRunner = require("./lib/HookRunner");
const { PatternLibrary } = require("./lib");

// Use shared PatternLibrary for detection (95% code reduction)
function detectEnterprisePatterns(content, filePath) {
  return PatternLibrary.findEnterprisePatterns(content, filePath);
}

// Hook logic
async function enterpriseAntibody(hookData, runner) {
  const { filePath, content } = hookData;

  // Skip if no content to check
  if (!content) {
    return { allow: true };
  }

  // Skip exception files that legitimately need enterprise patterns for development
  const skipPatterns = [
    // Hook development files (need enterprise patterns to detect them)
    /tools\/hooks\//,

    // Documentation files (can show examples)
    /\/docs\//,
    /\.md$/,

    // Configuration files (package.json can have enterprise deps listed)
    /package\.json$/,
  ];

  if (skipPatterns.some((pattern) => pattern.test(filePath))) {
    return { allow: true };
  }

  // Skip content that's clearly documentation or hook development
  const skipContentPatterns = [
    /\/\/ Hook development/i,
    /\/\/ Documentation example/i,
    /patterns.*=.*\[/i, // Pattern definition arrays in hooks
    /ENTERPRISE_PATTERNS|ANTI_PATTERNS/i, // Hook pattern definitions
  ];

  if (skipContentPatterns.some((pattern) => pattern.test(content))) {
    return { allow: true };
  }

  // Detect enterprise patterns using shared library
  const detectedPatterns = detectEnterprisePatterns(content, filePath);

  if (detectedPatterns.length > 0) {
    // Group by category for cleaner output
    const byCategory = {};
    detectedPatterns.forEach((detection) => {
      if (!byCategory[detection.category]) {
        byCategory[detection.category] = [];
      }
      byCategory[detection.category].push(detection);
    });

    let message = `🚫 Enterprise Pattern Blocked\n\n`;
    message += `This is a LOCAL-ONLY project. No enterprise features needed!\n\n`;

    // Show first few detections
    let shown = 0;
    for (const [category, detections] of Object.entries(byCategory)) {
      if (shown >= 3) break;

      const detection = detections[0];
      message += `❌ Detected: ${detection.match}\n`;
      message += `   Category: ${category}\n`;
      message += `   Issue: ${detection.message}\n`;
      message += `   ✅ ${detection.suggestion}\n\n`;
      shown++;
    }

    if (detectedPatterns.length > shown) {
      message += `... and ${detectedPatterns.length - shown} more enterprise patterns\n\n`;
    }

    message += `💡 Remember the KISS principle:\n`;
    message += `   • Single user, local development only\n`;
    message += `   • No authentication needed (use mockUser)\n`;
    message += `   • No monitoring or compliance\n`;
    message += `   • Focus on AI functionality\n\n`;

    message += `📖 See GOAL.md for the complete exclusion list`;

    return {
      block: true,
      message: message,
    };
  }

  return { allow: true };
}

// Run the hook
HookRunner.create("enterprise-antibody", enterpriseAntibody, { timeout: 2000 });

module.exports = {
  detectEnterprisePatterns,
  enterpriseAntibody,
};
