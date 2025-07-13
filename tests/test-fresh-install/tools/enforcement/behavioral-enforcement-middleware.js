#!/usr/bin/env node

/**
 * Behavioral Enforcement Middleware System
 * Real-time compliance enforcement for Claude Code responses
 * Prevents non-compliant responses rather than detecting them after
 */

class BehavioralEnforcementMiddleware {
  constructor() {
    this.enforcementRules = this.loadEnforcementRules();
    this.responseFilters = this.initializeResponseFilters();
    this.complianceTemplates = this.loadComplianceTemplates();
    this.emergencyCorrections = this.initializeEmergencyCorrections();
    
    this.stats = {
      intercepted: 0,
      corrected: 0,
      blocked: 0,
      passed: 0
    };
  }

  loadEnforcementRules() {
    return {
      critical: {
        promptImprovement: {
          enabled: true,
          enforcement: 'BLOCK', // BLOCK, CORRECT, WARN
          pattern: /^\*\*Improved Prompt\*\*:/,
          action: 'injectPromptImprovement'
        },
        antiImprovedFiles: {
          enabled: true,
          enforcement: 'BLOCK',
          patterns: [/_improved\.|_enhanced\.|_v2\.|better version/i],
          action: 'blockImprovedFileResponse'
        },
        generatorRecommendation: {
          enabled: true,
          enforcement: 'CORRECT',
          triggers: [/new.*component/i, /create.*component/i],
          requiredContent: ['npm run g:c', 'generator'],
          action: 'injectGeneratorRecommendation'
        }
      },
      methodology: {
        rcaApplication: {
          enabled: true,
          enforcement: 'CORRECT',
          triggers: [/debug/i, /crash/i, /error/i, /failing/i],
          requiredContent: ['symptom', 'trace', 'arrow chain'],
          action: 'injectRCAFramework'
        },
        todoWriteUsage: {
          enabled: true,
          enforcement: 'CORRECT',
          triggers: [/implement.*and/i, /create.*with.*and/i],
          requiredContent: ['TodoWrite'],
          action: 'injectTodoWriteUsage'
        }
      }
    };
  }

  initializeResponseFilters() {
    return {
      preResponse: [
        this.checkPromptImprovementCompliance.bind(this),
        this.checkFileNamingCompliance.bind(this),
        this.checkGeneratorUsage.bind(this),
        this.checkRCAUsage.bind(this),
        this.checkTodoWriteUsage.bind(this)
      ],
      postResponse: [
        this.validateOverallCompliance.bind(this),
        this.injectMissingPatterns.bind(this),
        this.logComplianceMetrics.bind(this)
      ]
    };
  }

  loadComplianceTemplates() {
    return {
      promptImprovement: {
        template: `**Improved Prompt**: {enhancedPrompt}

**Implementation Plan**:
1. {step1}
2. {step2}
3. {step3}

{originalResponse}`,
        variables: ['enhancedPrompt', 'step1', 'step2', 'step3', 'originalResponse']
      },
      generatorRecommendation: {
        template: `For component creation, use the enhanced generator:

\`\`\`bash
npm run g:c {componentName}
\`\`\`

This ensures proper structure, testing, and ProjectTemplate compliance.

{originalResponse}`,
        variables: ['componentName', 'originalResponse']
      },
      rcaFramework: {
        template: `Using Arrow-Chain Root Cause Analysis (S-T-A-H-V-P):

1. **Symptom**: {symptomDescription}
2. **Trace**: {traceDescription}
3. **Arrow Chain**: {arrowChain}
4. **Hypothesis**: {hypothesis}
5. **Validate**: {validationMethod}
6. **Patch**: {patchStrategy}

{originalResponse}`,
        variables: ['symptomDescription', 'traceDescription', 'arrowChain', 'hypothesis', 'validationMethod', 'patchStrategy', 'originalResponse']
      }
    };
  }

  // Main enforcement entry point
  async enforceCompliance(userPrompt, claudeResponse) {
    const enforcementResult = {
      originalResponse: claudeResponse,
      finalResponse: claudeResponse,
      actions: [],
      compliance: true,
      warnings: [],
      blocked: false
    };

    try {
      // Pre-response filters
      for (const filter of this.responseFilters.preResponse) {
        const filterResult = await filter(userPrompt, enforcementResult.finalResponse);
        
        if (filterResult.action === 'BLOCK') {
          enforcementResult.blocked = true;
          enforcementResult.finalResponse = filterResult.blockMessage;
          this.stats.blocked++;
          break;
        } else if (filterResult.action === 'CORRECT') {
          enforcementResult.finalResponse = filterResult.correctedResponse;
          enforcementResult.actions.push(filterResult.correction);
          this.stats.corrected++;
        } else if (filterResult.action === 'WARN') {
          enforcementResult.warnings.push(filterResult.warning);
        }
      }

      // Post-response filters (if not blocked)
      if (!enforcementResult.blocked) {
        for (const filter of this.responseFilters.postResponse) {
          const filterResult = await filter(userPrompt, enforcementResult.finalResponse);
          
          if (filterResult.enhancements) {
            enforcementResult.finalResponse = filterResult.enhancedResponse;
            enforcementResult.actions.push(...filterResult.enhancements);
          }
        }
      }

      // Update statistics
      if (enforcementResult.actions.length === 0 && !enforcementResult.blocked) {
        this.stats.passed++;
      } else {
        this.stats.intercepted++;
      }

      return enforcementResult;

    } catch (error) {
      console.error('Enforcement middleware error:', error);
      return {
        originalResponse: claudeResponse,
        finalResponse: claudeResponse,
        actions: [],
        compliance: false,
        warnings: [`Enforcement error: ${error.message}`],
        blocked: false
      };
    }
  }

  // Pre-response filters
  async checkPromptImprovementCompliance(userPrompt, response) {
    const rule = this.enforcementRules.critical.promptImprovement;
    if (!rule.enabled) return { action: 'PASS' };

    // Check if response needs prompt improvement
    const needsImprovement = this.isComplexRequest(userPrompt);
    const hasImprovement = rule.pattern.test(response);

    if (needsImprovement && !hasImprovement) {
      if (rule.enforcement === 'BLOCK') {
        return {
          action: 'BLOCK',
          blockMessage: `Response blocked: Missing mandatory prompt improvement protocol. Please start response with "**Improved Prompt**:" followed by CRAFT framework enhancement.`
        };
      } else if (rule.enforcement === 'CORRECT') {
        const enhanced = await this.injectPromptImprovement(userPrompt, response);
        return {
          action: 'CORRECT',
          correctedResponse: enhanced,
          correction: 'Injected mandatory prompt improvement protocol'
        };
      }
    }

    return { action: 'PASS' };
  }

  async checkFileNamingCompliance(userPrompt, response) {
    const rule = this.enforcementRules.critical.antiImprovedFiles;
    if (!rule.enabled) return { action: 'PASS' };

    // Check for forbidden file naming patterns
    for (const pattern of rule.patterns) {
      if (pattern.test(response)) {
        if (rule.enforcement === 'BLOCK') {
          return {
            action: 'BLOCK',
            blockMessage: `Response blocked: Suggests creating improved/enhanced file versions. ProjectTemplate requires editing original files directly. Never create *_improved.*, *_enhanced.*, or *_v2.* files.`
          };
        }
      }
    }

    return { action: 'PASS' };
  }

  async checkGeneratorUsage(userPrompt, response) {
    const rule = this.enforcementRules.critical.generatorRecommendation;
    if (!rule.enabled) return { action: 'PASS' };

    // Check if request is for component creation
    const needsGenerator = rule.triggers.some(trigger => trigger.test(userPrompt));
    const hasGenerator = rule.requiredContent.some(content => 
      response.toLowerCase().includes(content.toLowerCase())
    );

    if (needsGenerator && !hasGenerator) {
      if (rule.enforcement === 'CORRECT') {
        const enhanced = await this.injectGeneratorRecommendation(userPrompt, response);
        return {
          action: 'CORRECT',
          correctedResponse: enhanced,
          correction: 'Injected generator recommendation for component creation'
        };
      }
    }

    return { action: 'PASS' };
  }

  async checkRCAUsage(userPrompt, response) {
    const rule = this.enforcementRules.methodology.rcaApplication;
    if (!rule.enabled) return { action: 'PASS' };

    // Check if request is debugging-related
    const needsRCA = rule.triggers.some(trigger => trigger.test(userPrompt));
    const hasRCA = rule.requiredContent.some(content => 
      response.toLowerCase().includes(content.toLowerCase())
    );

    if (needsRCA && !hasRCA) {
      if (rule.enforcement === 'CORRECT') {
        const enhanced = await this.injectRCAFramework(userPrompt, response);
        return {
          action: 'CORRECT',
          correctedResponse: enhanced,
          correction: 'Injected Arrow-Chain RCA methodology'
        };
      }
    }

    return { action: 'PASS' };
  }

  async checkTodoWriteUsage(userPrompt, response) {
    const rule = this.enforcementRules.methodology.todoWriteUsage;
    if (!rule.enabled) return { action: 'PASS' };

    // Check if request is multi-step
    const isMultiStep = rule.triggers.some(trigger => trigger.test(userPrompt));
    const hasTodoWrite = rule.requiredContent.some(content => 
      response.toLowerCase().includes(content.toLowerCase())
    );

    if (isMultiStep && !hasTodoWrite) {
      if (rule.enforcement === 'CORRECT') {
        const enhanced = await this.injectTodoWriteUsage(userPrompt, response);
        return {
          action: 'CORRECT',
          correctedResponse: enhanced,
          correction: 'Added TodoWrite for multi-step task tracking'
        };
      }
    }

    return { action: 'PASS' };
  }

  // Post-response filters
  async validateOverallCompliance(userPrompt, response) {
    const complianceScore = this.calculateResponseCompliance(response);
    
    if (complianceScore < 70) {
      const enhancements = await this.generateComplianceEnhancements(userPrompt, response);
      return {
        enhancedResponse: enhancements.response,
        enhancements: enhancements.actions
      };
    }

    return { action: 'PASS' };
  }

  async injectMissingPatterns(userPrompt, response) {
    const missing = this.identifyMissingPatterns(userPrompt, response);
    
    if (missing.length > 0) {
      const enhanced = await this.addMissingPatterns(response, missing);
      return {
        enhancedResponse: enhanced,
        enhancements: missing.map(pattern => `Added missing pattern: ${pattern}`)
      };
    }

    return { action: 'PASS' };
  }

  async logComplianceMetrics(userPrompt, response) {
    const metrics = {
      timestamp: new Date().toISOString(),
      promptType: this.classifyPromptType(userPrompt),
      responseLength: response.length,
      complianceScore: this.calculateResponseCompliance(response),
      patternsFound: this.extractPatterns(response)
    };

    this.logMetrics(metrics);
    return { action: 'PASS' };
  }

  // Enhancement methods
  async injectPromptImprovement(userPrompt, response) {
    const template = this.complianceTemplates.promptImprovement;
    const enhanced = await this.enhancePromptWithCRAFT(userPrompt);
    const steps = this.extractImplementationSteps(userPrompt);

    return template.template
      .replace('{enhancedPrompt}', enhanced)
      .replace('{step1}', steps[0] || 'Analyze current state')
      .replace('{step2}', steps[1] || 'Implement solution')
      .replace('{step3}', steps[2] || 'Validate results')
      .replace('{originalResponse}', response);
  }

  async injectGeneratorRecommendation(userPrompt, response) {
    const template = this.complianceTemplates.generatorRecommendation;
    const componentName = this.extractComponentName(userPrompt);

    return template.template
      .replace('{componentName}', componentName)
      .replace('{originalResponse}', response);
  }

  async injectRCAFramework(userPrompt, response) {
    const template = this.complianceTemplates.rcaFramework;
    const rcaElements = this.generateRCAElements(userPrompt);

    return template.template
      .replace('{symptomDescription}', rcaElements.symptom)
      .replace('{traceDescription}', rcaElements.trace)
      .replace('{arrowChain}', rcaElements.arrowChain)
      .replace('{hypothesis}', rcaElements.hypothesis)
      .replace('{validationMethod}', rcaElements.validation)
      .replace('{patchStrategy}', rcaElements.patch)
      .replace('{originalResponse}', response);
  }

  async injectTodoWriteUsage(userPrompt, response) {
    const tasks = this.extractTasksFromPrompt(userPrompt);
    const todoWriteCall = this.generateTodoWriteCall(tasks);

    return `${todoWriteCall}\n\n${response}`;
  }

  // Utility methods
  isComplexRequest(prompt) {
    const complexityIndicators = [
      /implement/i, /create/i, /build/i, /develop/i,
      /fix/i, /debug/i, /solve/i, /design/i,
      /and/g, /with/g, /that/g  // Multiple requirements
    ];

    const wordCount = prompt.split(/\s+/).length;
    const indicatorCount = complexityIndicators.reduce((count, pattern) => {
      const matches = prompt.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    return wordCount > 10 || indicatorCount > 2;
  }

  calculateResponseCompliance(response) {
    let score = 100;
    
    // Check for required patterns
    const patterns = {
      promptImprovement: /\*\*Improved Prompt\*\*:/,
      todoWrite: /TodoWrite/,
      generators: /npm run g:c|generator/,
      rca: /symptom.*trace.*arrow/i
    };

    // Deduct points for missing critical patterns
    Object.entries(patterns).forEach(([name, pattern]) => {
      if (!pattern.test(response)) {
        score -= 20; // Each missing pattern reduces score
      }
    });

    return Math.max(0, score);
  }

  extractComponentName(prompt) {
    const match = prompt.match(/(?:new|create).*?(\w+).*?component/i);
    return match ? match[1] : 'ComponentName';
  }

  extractTasksFromPrompt(prompt) {
    // Extract multi-step tasks from prompt
    const tasks = prompt.split(/\s+and\s+|,\s+|\s+with\s+/i)
      .map(task => task.trim())
      .filter(task => task.length > 3);
    
    return tasks.slice(0, 5); // Limit to 5 tasks
  }

  generateTodoWriteCall(tasks) {
    const todos = tasks.map((task, i) => ({
      id: `task-${i + 1}`,
      content: task,
      status: 'pending',
      priority: i === 0 ? 'high' : 'medium'
    }));

    return `I'll use TodoWrite to track these multi-step tasks:

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">${JSON.stringify(todos)}</parameter>
</invoke>
</function_calls>`;
  }
}

module.exports = BehavioralEnforcementMiddleware;