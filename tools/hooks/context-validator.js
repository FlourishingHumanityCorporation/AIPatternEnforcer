#!/usr/bin/env node

/**
 * Claude Code Hook: Context Validation
 * 
 * Ensures AI has sufficient context to make good decisions before operations.
 * Addresses friction points 1.1-1.4 from FRICTION-MAPPING.md:
 * - Context window constraints
 * - Flawed retrieval/RAG unreliability  
 * - Architectural blindness
 * - Context vs latency tradeoff
 * 
 * Validates:
 * - Sufficient context for the operation type
 * - Relevant architectural patterns included
 * - Current file context provided for edits
 * - Dependencies and imports context available
 * 
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const fs = require('fs');
const path = require('path');

// Context requirements by operation type
const CONTEXT_REQUIREMENTS = {
  'Write': {
    minContextLines: 50,
    requiresArchitecture: true,
    requiresPatterns: true,
    description: 'creating new files'
  },
  'Edit': {
    minContextLines: 30,
    requiresCurrentFile: true,
    requiresRelatedFiles: true,
    description: 'modifying existing files'
  },
  'MultiEdit': {
    minContextLines: 100,
    requiresArchitecture: true,
    requiresImpactAnalysis: true,
    description: 'multi-file changes'
  }
};

// Critical context files that should be referenced
const CRITICAL_CONTEXT_FILES = [
  'CLAUDE.md',
  'docs/architecture/README.md',
  'docs/architecture/patterns/',
  'ai/examples/good-patterns/',
  'package.json'
];

// Patterns that indicate good context provision
const CONTEXT_INDICATORS = [
  {
    pattern: /current.*code|existing.*implementation|paste.*code/i,
    weight: 10,
    description: 'Current code context provided'
  },
  {
    pattern: /@[a-zA-Z0-9_\-\/\.]+\.(md|ts|js|tsx|jsx)/gi,
    weight: 5,
    description: 'File references included'
  },
  {
    pattern: /architecture|pattern|structure|design/i,
    weight: 8,
    description: 'Architectural context mentioned'
  },
  {
    pattern: /test|spec|coverage/i,
    weight: 6,
    description: 'Testing context included'
  },
  {
    pattern: /import|require|dependency|package/i,
    weight: 4,
    description: 'Dependency context provided'
  },
  {
    pattern: /error|issue|problem|debug/i,
    weight: 7,
    description: 'Problem context described'
  }
];

// Warning patterns that suggest insufficient context
const INSUFFICIENT_CONTEXT_PATTERNS = [
  {
    pattern: /create.*component|add.*feature|implement.*function/i,
    warning: 'Generic implementation request - needs specific requirements'
  },
  {
    pattern: /fix.*bug|resolve.*issue/i,
    warning: 'Bug fix request - needs current code and error details'
  },
  {
    pattern: /refactor|improve|optimize/i,
    warning: 'Refactoring request - needs current implementation and goals'
  },
  {
    pattern: /integrate|connect|add.*api/i,
    warning: 'Integration request - needs existing architecture context'
  }
];

function analyzeContextQuality(input, operationType) {
  const content = input.content || input.new_string || '';
  const prompt = input.prompt || input.message || '';
  const combinedText = `${prompt} ${content}`.toLowerCase();
  
  let contextScore = 0;
  const foundIndicators = [];
  
  // Score context indicators
  for (const {pattern, weight, description} of CONTEXT_INDICATORS) {
    const matches = combinedText.match(pattern);
    if (matches) {
      contextScore += weight * Math.min(matches.length, 3); // Cap at 3 matches per pattern
      foundIndicators.push(description);
    }
  }
  
  // Check for insufficient context warnings
  const warnings = [];
  for (const {pattern, warning} of INSUFFICIENT_CONTEXT_PATTERNS) {
    if (pattern.test(combinedText) && contextScore < 20) {
      warnings.push(warning);
    }
  }
  
  return {
    score: contextScore,
    indicators: foundIndicators,
    warnings,
    textLength: combinedText.length
  };
}

function checkArchitecturalContext(filePath) {
  if (!filePath) return { hasContext: true, message: '' };
  
  const issues = [];
  
  // Check if modifying core architectural files
  if (filePath.includes('/components/') || filePath.includes('/lib/') || filePath.includes('/hooks/')) {
    // Should reference architectural patterns
    const patternsDir = 'docs/architecture/patterns';
    if (!fs.existsSync(patternsDir)) {
      issues.push('Missing architectural patterns documentation');
    }
  }
  
  // Check if creating new features
  if (filePath.includes('/features/') || filePath.includes('/pages/') || filePath.includes('/app/')) {
    // Should have feature structure documentation
    const featurePatterns = 'ai/examples/good-patterns/feature-structure';
    if (!fs.existsSync(featurePatterns)) {
      issues.push('Missing feature structure patterns');
    }
  }
  
  return {
    hasContext: issues.length === 0,
    message: issues.join('; ')
  };
}

function getContextSuggestions(operationType, filePath) {
  const suggestions = [];
  
  switch (operationType) {
    case 'Write':
      suggestions.push('📋 Include current project architecture context');
      suggestions.push('🎯 Reference relevant patterns from ai/examples/');
      suggestions.push('📝 Specify exact requirements and constraints');
      break;
      
    case 'Edit':
      suggestions.push('📋 Paste current file content that needs modification');
      suggestions.push('🔍 Describe specific changes needed and why');
      suggestions.push('⚡ Include related files that might be affected');
      break;
      
    case 'MultiEdit':
      suggestions.push('📋 Provide complete context of all files being changed');
      suggestions.push('🗺️ Include architecture overview and impact analysis');
      suggestions.push('🧪 Specify how changes will be tested');
      break;
  }
  
  if (filePath) {
    const dir = path.dirname(filePath);
    suggestions.push(`📁 Include context from related files in ${dir}/`);
  }
  
  return suggestions;
}

function checkFile(args) {
  try {
    // Parse Claude Code hook input
    const input = JSON.parse(args[0] || '{}');
    const filePath = input.file_path || input.filePath || '';
    const operationType = input.tool || 'Write'; // Default to Write if not specified
    
    // Get context requirements for operation type
    const requirements = CONTEXT_REQUIREMENTS[operationType] || CONTEXT_REQUIREMENTS['Write'];
    
    // Analyze context quality
    const contextAnalysis = analyzeContextQuality(input, operationType);
    
    // Check architectural context if required
    const archCheck = requirements.requiresArchitecture ? 
      checkArchitecturalContext(filePath) : { hasContext: true };
    
    // Determine if context is sufficient
    const minScore = requirements.minContextLines / 2; // Rough heuristic
    const hasMinimumContext = contextAnalysis.score >= minScore;
    const hasArchitecturalContext = archCheck.hasContext;
    
    // Check for specific warnings
    const hasWarnings = contextAnalysis.warnings.length > 0;
    
    if (!hasMinimumContext || !hasArchitecturalContext || hasWarnings) {
      const suggestions = getContextSuggestions(operationType, filePath);
      
      let message = `🧠 Insufficient context for ${requirements.description}\n\n`;
      
      if (!hasMinimumContext) {
        message += `❌ Context score: ${contextAnalysis.score}/${minScore} (need more detail)\n`;
      }
      
      if (!hasArchitecturalContext) {
        message += `❌ Architectural context: ${archCheck.message}\n`;
      }
      
      if (hasWarnings) {
        message += `⚠️ Context warnings:\n`;
        contextAnalysis.warnings.forEach(warning => {
          message += `   • ${warning}\n`;
        });
      }
      
      message += `\n✅ To improve context:\n`;
      suggestions.forEach(suggestion => {
        message += `   ${suggestion}\n`;
      });
      
      if (contextAnalysis.indicators.length > 0) {
        message += `\n💡 Good context found: ${contextAnalysis.indicators.join(', ')}`;
      }
      
      message += `\n\n📖 See ai/prompts/templates/explicit-context.md for examples`;
      
      console.log(JSON.stringify({
        status: 'blocked',
        message
      }));
      return;
    }
    
    // Context is sufficient
    console.log(JSON.stringify({ 
      status: 'ok',
      debug: `Context score: ${contextAnalysis.score}, indicators: ${contextAnalysis.indicators.length}`
    }));
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.log(JSON.stringify({ 
      status: 'ok',
      debug: `Context validator error: ${error.message}` 
    }));
  }
}

// Handle command line execution
if (require.main === module) {
  checkFile(process.argv.slice(2));
}

module.exports = { 
  checkFile, 
  analyzeContextQuality, 
  checkArchitecturalContext,
  CONTEXT_REQUIREMENTS,
  CONTEXT_INDICATORS
};