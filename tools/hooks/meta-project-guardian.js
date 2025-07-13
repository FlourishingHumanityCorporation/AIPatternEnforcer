#!/usr/bin/env node

/**
 * Claude Code Hook: Meta-Project Guardian
 * 
 * Prevents AI from modifying the template system infrastructure itself.
 * This is critical because AIPatternEnforcer IS the meta-project that creates
 * templates - it must protect its own generator and enforcement logic.
 * 
 * Protects:
 * - Generator scripts in tools/generators/
 * - Hook files in tools/hooks/
 * - Template configurations (template.json files)
 * - Onboarding and setup scripts
 * - Enforcement configurations
 * 
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
          }
        }
      }
    }
  } catch (error) {
    // Ignore errors loading .env file
  }
}

// Load environment variables at startup
loadEnvFile();



// Critical infrastructure paths that must not be modified by AI
const PROTECTED_PATHS = [
  // Generator infrastructure
  'tools/generators/',
  'tools/hooks/',
  
  // Template system files
  'templates/**/template.json',
  'templates/**/structure.json',
  'templates/**/variants.json',
  
  // Core scripts
  'scripts/onboarding/',
  'scripts/setup/',
  'scripts/ensure-claude-scripts.js',
  'scripts/validation/',
  
  // Enforcement configurations
  '.claude/settings.json',
  'tools/enforcement/',
  
  // Core documentation that defines the system
  'CLAUDE.md',
  'GOAL.md',
  'FRICTION-MAPPING.md'
];

// Patterns that indicate AI is trying to "improve" the system
const IMPROVEMENT_PATTERNS = [
  /enhance.*generator/i,
  /improve.*template.*system/i,
  /refactor.*enforcement/i,
  /optimize.*hooks/i,
  /update.*onboarding/i,
  /modernize.*setup/i,
  /fix.*generator.*bug/i
];

// Messages that explain why modifications are blocked
const PROTECTION_MESSAGES = {
  generator: 'Generator infrastructure is carefully designed and tested',
  hooks: 'Hook files maintain system integrity',
  template: 'Template configurations define the project structure',
  scripts: 'Setup scripts are tested across many environments',
  enforcement: 'Enforcement logic prevents AI mistakes'
};

function isProtectedPath(filePath) {
  // Normalize path for comparison - remove leading slash and backslashes
  const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\//, '');
  
  for (const protectedPath of PROTECTED_PATHS) {
    // Handle glob patterns
    if (protectedPath.includes('**')) {
      const pattern = protectedPath
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\//g, '\\/');
      const regex = new RegExp(pattern);
      if (regex.test(normalizedPath)) {
        return { protected: true, type: detectPathType(normalizedPath) };
      }
    } else if (normalizedPath.includes(protectedPath)) {
      return { protected: true, type: detectPathType(normalizedPath) };
    }
  }
  
  return { protected: false };
}

function detectPathType(filePath) {
  if (filePath.includes('/generators/')) return 'generator';
  if (filePath.includes('/hooks/')) return 'hooks';
  if (filePath.includes('template.json')) return 'template';
  if (filePath.includes('/scripts/')) return 'scripts';
  if (filePath.includes('/enforcement/')) return 'enforcement';
  if (filePath.includes('CLAUDE.md') || filePath.includes('GOAL.md')) return 'core-docs';
  return 'infrastructure';
}

function checkForImprovementIntent(content, prompt) {
  const combinedText = `${prompt || ''} ${content || ''}`;
  
  for (const pattern of IMPROVEMENT_PATTERNS) {
    if (pattern.test(combinedText)) {
      return true;
    }
  }
  
  return false;
}

function getSuggestion(filePath, pathType) {
  const suggestions = {
    generator: 'Create new generators by copying existing ones to a new file',
    hooks: 'Create new hooks rather than modifying existing ones',
    template: 'Create new templates in templates/[framework-name]/',
    scripts: 'Create project-specific scripts in your application',
    enforcement: 'Configure enforcement via .claude/settings.json',
    'core-docs': 'Create project-specific documentation in docs/'
  };
  
  return suggestions[pathType] || 'Create new files instead of modifying infrastructure';
}

// Read from stdin
let inputData = '';
process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(inputData);
    
    // Claude Code hook format includes tool_name and tool_input
    const toolName = input.tool_name || '';
    const toolInput = input.tool_input || {};
    
    // Extract file path from tool input (different tools use different field names)
    const filePath = toolInput.file_path || toolInput.filePath || toolInput.notebook_path || '';
    const content = toolInput.content || toolInput.new_string || toolInput.new_source || '';
    const prompt = input.prompt || input.message || '';
    
    // Allow operations without file paths
    if (!filePath) {
      process.exit(0);
    }

    // Add this condition to allow hook modifications during development
    const isHookDevelopment = filePath.includes('tools/hooks/') &&
                             process.env.HOOK_DEVELOPMENT === 'true';

    if (isHookDevelopment) {
      process.exit(0); // Allow hook development
    }
    
    // Check if this is a protected path
    const protection = isProtectedPath(filePath);
    
    if (protection.protected) {
      // Debug: Log protection details
      const debugBlock = {
        timestamp: new Date().toISOString(),
        toolName,
        filePath,
        protection,
        hookDev: process.env.HOOK_DEVELOPMENT,
        blocking: true
      };
      require('fs').writeFileSync('meta-project-guardian-block.json', JSON.stringify(debugBlock, null, 2));
      
      // Check if AI is trying to "improve" the system
      const hasImprovementIntent = checkForImprovementIntent(content, prompt);
      
      const protectionReason = PROTECTION_MESSAGES[protection.type] || 
                              'This file is part of the meta-project infrastructure';
      
      const suggestion = getSuggestion(filePath, protection.type);
      
      // Exit code 2 blocks the operation and shows stderr to Claude
      console.error(
        `🛡️ Meta-Project Protection Active\n` +
        `\n` +
        `❌ Cannot modify: ${path.basename(filePath)}\n` +
        `📁 Protected path: ${protection.type} infrastructure\n` +
        `\n` +
        `ℹ️ Why protected: ${protectionReason}\n` +
        `\n` +
        `✅ Instead: ${suggestion}\n` +
        `\n` +
        `💡 AIPatternEnforcer is the meta-project that creates templates.\n` +
        `   Its infrastructure must remain stable to function correctly.\n` +
        `\n` +
        `📖 See docs/architecture/meta-project-design.md for details`
      );
      
      // Log improvement attempts for pattern analysis
      if (hasImprovementIntent) {
        console.error(`\n⚠️ Note: Detected attempt to "${prompt || 'improve system'}"`);
      }
      
      process.exit(2);
    }
    
    // Allow the operation
    process.exit(0);
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.error(`Hook error: ${error.message}`);
    process.exit(0);
  }
});

// Handle timeout
setTimeout(() => {
  console.error('Hook timeout - allowing operation');
  process.exit(0);
}, 1500);

module.exports = { 
  PROTECTED_PATHS, 
  IMPROVEMENT_PATTERNS,
  isProtectedPath,
  detectPathType
};