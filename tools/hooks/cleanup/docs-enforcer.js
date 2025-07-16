#!/usr/bin/env node

/**
 * Claude Code Hook: Documentation Enforcer (Consolidated)
 *
 * Enforces documentation standards and organization. Consolidates 2 previous hooks:
 * - docs-lifecycle-enforcer.js - Documentation lifecycle management
 * - docs-organization-enforcer.js - Documentation structure enforcement
 */

const HookRunner = require("../lib/HookRunner");
const path = require("path");
const fs = require("fs");

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
  components: /^components\/[A-Z][a-zA-Z0-9]*\/(README|API)\.md$/,
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

// Required template sections for different doc types (comprehensive validation)
const TEMPLATE_REQUIREMENTS = {
  readme: {
    requiredSections: [
      "installation",
      "usage",
      "features",
      "development",
      "testing",
    ],
    requiredHeaders: [
      "Purpose",
      "Installation",
      "Usage",
      "Development",
      "Testing",
    ],
    templatePath: "templates/documentation/project/README.md",
  },
  guide: {
    requiredSections: [
      "overview",
      "prerequisites",
      "step-by-step",
      "examples",
      "troubleshooting",
    ],
    requiredHeaders: [
      "Overview",
      "Prerequisites",
      "Step-by-Step Instructions",
      "Examples",
    ],
    templatePath: "templates/documentation/guide/GUIDE.md",
  },
  api: {
    requiredSections: [
      "overview",
      "authentication",
      "endpoints",
      "parameters",
      "responses",
    ],
    requiredHeaders: [
      "Overview",
      "Authentication",
      "Endpoints",
      "Data Models",
      "Error Codes",
    ],
    templatePath: "templates/documentation/api/API.md",
  },
  feature: {
    requiredSections: [
      "description",
      "implementation",
      "testing",
      "usage",
      "api",
    ],
    requiredHeaders: [
      "Description",
      "Implementation",
      "Testing",
      "Usage",
      "API Reference",
    ],
    templatePath: "templates/documentation/feature/FEATURE.md",
  },
  report: {
    requiredSections: [
      "executive summary",
      "analysis",
      "findings",
      "recommendations",
    ],
    requiredHeaders: [
      "Executive Summary",
      "Analysis Overview",
      "Detailed Findings",
      "Recommendations",
    ],
    templatePath: "templates/documentation/report/ANALYSIS-TEMPLATE.md",
  },
  plan: {
    requiredSections: [
      "project overview",
      "timeline",
      "implementation",
      "resources",
      "risks",
    ],
    requiredHeaders: [
      "Project Overview",
      "Project Timeline",
      "Implementation Plan",
      "Resource Planning",
      "Risk Management",
    ],
    templatePath: "templates/documentation/plan/PLAN-TEMPLATE.md",
  },
  component: {
    requiredSections: [
      "overview",
      "usage",
      "props",
      "examples",
      "styling",
      "testing",
    ],
    requiredHeaders: [
      "Overview",
      "Usage",
      "Props",
      "Examples",
      "Styling",
      "Testing",
    ],
    templatePath: "templates/documentation/component/COMPONENT-README.md",
  },
  "component-api": {
    requiredSections: [
      "component interface",
      "props documentation",
      "event handlers",
      "css classes",
      "typescript support",
    ],
    requiredHeaders: [
      "Component Interface",
      "Props Documentation",
      "Event Handlers",
      "CSS Classes",
      "TypeScript Support",
    ],
    templatePath: "templates/documentation/component/COMPONENT-API.md",
  },
};

/**
 * Hook logic function - enforces documentation standards
 * @param {Object} hookData - Parsed and standardized hook data
 * @param {HookRunner} runner - Hook runner instance for utilities
 * @returns {Object} Hook result
 */
function enforceDocumentation(hookData, runner) {
  // Only validate markdown files
  const filePath = hookData.filePath || hookData.file_path || "";
  if (!filePath.endsWith(".md")) {
    return { allow: true };
  }

  const fileName = path.basename(filePath);
  const content = hookData.content || hookData.new_string || "";

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

  // 4. Strong template compliance enforcement
  const templateViolation = enforceTemplateCompliance(
    content,
    filePath,
    runner,
  );
  if (templateViolation.block) {
    return templateViolation;
  }

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
      `Maintain single source of truth for documentation`,
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
  const isInDocsDir = filePath.startsWith("docs/");

  if (!isInDocsDir && !DOC_STRUCTURE.root.test(fileName)) {
    // Allow some flexibility but warn
    console.warn(
      `⚠️  Consider moving ${fileName} to docs/ directory for better organization`,
    );
  }

  // Block clearly misplaced documentation
  if (
    fileName.toLowerCase().includes("guide") &&
    !filePath.includes("docs/guides/")
  ) {
    const message = runner.formatError(
      `Guide documents should be in docs/guides/`,
      `❌ ${fileName} appears to be a guide`,
      `✅ Move to docs/guides/ directory`,
      `Maintain consistent documentation structure`,
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
  const violations = ANNOUNCEMENT_PATTERNS.filter((pattern) =>
    pattern.test(content),
  );

  if (violations.length > 0) {
    const message = runner.formatError(
      `Avoid announcement-style documentation`,
      `❌ Found announcement patterns in content`,
      `✅ Use direct, technical language instead`,
      `From CLAUDE.md: "NO announcement-style docs"`,
      `Write timeless, professional documentation`,
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Strong template compliance enforcement - blocks non-compliant documentation
 */
function enforceTemplateCompliance(content, filePath, runner) {
  if (!content) return { allow: true };

  const fileName = path.basename(filePath, ".md").toLowerCase();
  const docType = determineDocumentType(fileName, filePath);

  if (!docType) {
    // Unknown document type - allow with warning
    console.warn(
      `⚠️  Unknown document type for ${path.basename(filePath)} - template validation skipped`,
    );
    return { allow: true };
  }

  const requirements = TEMPLATE_REQUIREMENTS[docType];
  if (!requirements) {
    return { allow: true };
  }

  // Check for unreplaced placeholders
  const placeholderViolation = checkForUnreplacedPlaceholders(
    content,
    filePath,
    runner,
  );
  if (placeholderViolation.block) {
    return placeholderViolation;
  }

  // Check for required headers
  const headerViolation = checkRequiredHeaders(
    content,
    requirements,
    filePath,
    runner,
  );
  if (headerViolation.block) {
    return headerViolation;
  }

  // Check for proper markdown structure
  const structureViolation = checkMarkdownStructure(content, filePath, runner);
  if (structureViolation.block) {
    return structureViolation;
  }

  // Check for minimum content requirements
  const contentViolation = checkMinimumContent(
    content,
    docType,
    filePath,
    runner,
  );
  if (contentViolation.block) {
    return contentViolation;
  }

  return { allow: true };
}

/**
 * Determine document type from filename and path
 */
function determineDocumentType(fileName, filePath) {
  // Component documentation detection (components/ComponentName/README.md or API.md)
  const componentMatch = filePath.match(
    /^components\/[A-Z][a-zA-Z0-9]*\/(README|API)\.md$/,
  );
  if (componentMatch) {
    const docType = componentMatch[1].toLowerCase();
    return docType === "api" ? "component-api" : "component";
  }

  // Direct filename matches
  if (fileName.includes("readme")) return "readme";
  if (fileName.includes("guide")) return "guide";
  if (fileName.includes("api")) return "api";
  if (fileName.includes("feature")) return "feature";
  if (fileName.includes("analysis") || fileName.includes("report"))
    return "report";
  if (fileName.includes("plan")) return "plan";

  // Path-based detection
  if (filePath.includes("docs/guides/")) return "guide";
  if (filePath.includes("docs/api/")) return "api";
  if (filePath.includes("docs/features/")) return "feature";
  if (filePath.includes("docs/reports/")) return "report";
  if (filePath.includes("docs/plans/")) return "plan";

  return null;
}

/**
 * Check for unreplaced template placeholders
 */
function checkForUnreplacedPlaceholders(content, filePath, runner) {
  const placeholderPatterns = [
    /\{[A-Z_]+\}/g, // {PLACEHOLDER_NAME}
    /\[Project Name\]/g, // [Project Name]
    /\[Feature Name\]/g, // [Feature Name]
    /\[API Name\]/g, // [API Name]
    /\[Date\]/g, // [Date]
  ];

  const foundPlaceholders = [];
  placeholderPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      foundPlaceholders.push(...matches);
    }
  });

  if (foundPlaceholders.length > 0) {
    const uniquePlaceholders = [...new Set(foundPlaceholders)];
    const message = runner.formatError(
      `Template placeholders must be replaced`,
      `❌ Found unreplaced placeholders in ${path.basename(filePath)}`,
      `✅ Replace these placeholders with actual values:`,
      `   ${uniquePlaceholders.slice(0, 5).join(", ")}${uniquePlaceholders.length > 5 ? "..." : ""}`,
      `📖 Use documentation templates: npm run doc:create`,
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Check for required headers in the document
 */
function checkRequiredHeaders(content, requirements, filePath, runner) {
  const missingHeaders = [];

  requirements.requiredHeaders.forEach((header) => {
    const headerPattern = new RegExp(`^#+\\s*${header}`, "im");
    if (!headerPattern.test(content)) {
      missingHeaders.push(header);
    }
  });

  if (missingHeaders.length > 0) {
    const message = runner.formatError(
      `Document missing required template sections`,
      `❌ ${path.basename(filePath)} missing required headers:`,
      `   ${missingHeaders.join(", ")}`,
      `✅ Add these sections to follow the template structure`,
      `📖 See template: ${requirements.templatePath}`,
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Check for proper markdown structure
 */
function checkMarkdownStructure(content, filePath, runner) {
  // Must have at least one header
  if (!content.includes("#")) {
    const message = runner.formatError(
      `Document must have proper markdown structure`,
      `❌ ${path.basename(filePath)} has no headers`,
      `✅ Add markdown headers (# ## ###) to structure content`,
      `📖 Follow markdown best practices`,
      `Use documentation templates: npm run doc:create`,
    );

    return {
      block: true,
      message,
    };
  }

  // Must have a main title (H1)
  if (!content.match(/^#\s+/m)) {
    const message = runner.formatError(
      `Document must have a main title`,
      `❌ ${path.basename(filePath)} missing main title (# Header)`,
      `✅ Add a main title at the top: # Your Document Title`,
      `📖 Follow markdown hierarchy conventions`,
      `Use documentation templates: npm run doc:create`,
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Check for minimum content requirements
 */
function checkMinimumContent(content, docType, filePath, runner) {
  const minContentLength = 500; // Minimum characters for substantial documentation

  if (content.length < minContentLength) {
    const message = runner.formatError(
      `Document content too minimal`,
      `❌ ${path.basename(filePath)} has insufficient content (${content.length} chars)`,
      `✅ Provide comprehensive documentation (minimum ${minContentLength} chars)`,
      `📖 Follow the template structure for ${docType} documents`,
      `Use documentation templates: npm run doc:create`,
    );

    return {
      block: true,
      message,
    };
  }

  // Check for empty sections (headers with no content)
  const emptySections = content.match(/^#+\s+.+\n\s*(?=^#+)/gm);
  if (emptySections && emptySections.length > 2) {
    const message = runner.formatError(
      `Document has too many empty sections`,
      `❌ ${path.basename(filePath)} has ${emptySections.length} empty sections`,
      `✅ Provide content for all sections or remove empty ones`,
      `📖 Follow the template structure for ${docType} documents`,
      `Use documentation templates: npm run doc:create`,
    );

    return {
      block: true,
      message,
    };
  }

  return { allow: true };
}

/**
 * Check for duplicate documentation
 */
function checkDuplicateDocumentation(filePath, content) {
  // This would require file system scanning - implement as needed
  // For now, just log a reminder
  if (content && content.length > 2000) {
    console.warn(
      `⚠️  Large documentation file - ensure no duplication with existing docs`,
    );
  }
}

// Create and run the hook only when executed directly (not when imported)
if (require.main === module) {
  HookRunner.create("docs-enforcer", enforceDocumentation, {
    timeout: 2000,
  });
}

module.exports = {
  COMPLETION_PATTERNS,
  ANNOUNCEMENT_PATTERNS,
  DOC_STRUCTURE,
  TEMPLATE_REQUIREMENTS,
  enforceDocumentation,
  checkCompletionPatterns,
  checkOrganization,
  checkAnnouncementStyle,
  enforceTemplateCompliance,
  determineDocumentType,
  checkForUnreplacedPlaceholders,
  checkRequiredHeaders,
  checkMarkdownStructure,
  checkMinimumContent,
};
