import aiModelsConfig from './ai-models.json';

export type AIProvider = 'openai' | 'anthropic' | 'ollama';
export type TaskType = keyof typeof aiModelsConfig.tasks;
export type ModelCapability = 'chat' | 'vision' | 'embeddings' | 'coding' | 'analysis' | 'function-calling' | 'fast-response' | 'completion';

export interface ModelConfig {
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  contextWindow: number;
  capabilities: ModelCapability[];
  hardware?: {
    minRam: string;
    recommendedGpuLayers: number;
  };
  outputDimensions?: number;
}

export interface TaskConfig {
  description: string;
  preferredModels: string[];
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

export interface AIServiceConfig {
  preferLocal?: boolean;
  fallbackToAPI?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  task?: TaskType;
  provider?: AIProvider;
}

/**
 * Unified AI Configuration Manager
 * 
 * Provides centralized access to AI model configurations,
 * task-specific settings, and provider management.
 */
export class AIConfigManager {
  private config = aiModelsConfig;

  /**
   * Get configuration for a specific task
   */
  getTaskConfig(task: TaskType): TaskConfig {
    return this.config.tasks[task];
  }

  /**
   * Get the best model for a specific task and capability
   */
  getBestModel(task: TaskType, capability: ModelCapability, preferLocal: boolean = true): string {
    const taskConfig = this.getTaskConfig(task);
    const availableModels = taskConfig.preferredModels;

    // Filter models by capability
    const capableModels = availableModels.filter(modelName => {
      const model = this.getModelConfig(modelName);
      return model?.capabilities.includes(capability);
    });

    if (capableModels.length === 0) {
      throw new Error(`No models found for task ${task} with capability ${capability}`);
    }

    // Prefer local models if requested
    if (preferLocal) {
      const localModels = capableModels.filter(model => this.isLocalModel(model));
      if (localModels.length > 0) {
        return localModels[0];
      }
    }

    return capableModels[0];
  }

  /**
   * Get configuration for a specific model
   */
  getModelConfig(modelName: string): ModelConfig | null {
    // Check all providers for the model
    for (const [providerName, provider] of Object.entries(this.config.providers)) {
      if (provider.models && modelName in provider.models) {
        return provider.models[modelName] as ModelConfig;
      }
    }
    return null;
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: AIProvider) {
    return this.config.providers[provider];
  }

  /**
   * Check if a model is local (Ollama)
   */
  isLocalModel(modelName: string): boolean {
    return modelName in this.config.providers.ollama.models;
  }

  /**
   * Get fallback strategy
   */
  getFallbackStrategy() {
    return this.config.fallbackStrategy;
  }

  /**
   * Get models by capability
   */
  getModelsByCapability(capability: ModelCapability): string[] {
    const models: string[] = [];
    
    for (const [providerName, provider] of Object.entries(this.config.providers)) {
      if (provider.models) {
        for (const [modelName, modelConfig] of Object.entries(provider.models)) {
          if ((modelConfig as ModelConfig).capabilities.includes(capability)) {
            models.push(modelName);
          }
        }
      }
    }
    
    return models;
  }

  /**
   * Calculate cost for a model usage
   */
  calculateCost(modelName: string, inputTokens: number, outputTokens: number): number {
    const model = this.getModelConfig(modelName);
    if (!model) return 0;

    return (
      (inputTokens * model.costPer1kInput + outputTokens * model.costPer1kOutput) / 1000
    );
  }

  /**
   * Get recommended models for local development
   */
  getLocalModels(): string[] {
    return Object.keys(this.config.providers.ollama.models);
  }

  /**
   * Get recommended models for production
   */
  getProductionModels(): string[] {
    const openaiModels = Object.keys(this.config.providers.openai.models);
    const anthropicModels = Object.keys(this.config.providers.anthropic.models);
    return [...openaiModels, ...anthropicModels];
  }

  /**
   * Validate model availability for hardware
   */
  canRunLocally(modelName: string, availableRam: number): boolean {
    const model = this.getModelConfig(modelName);
    if (!model || !this.isLocalModel(modelName)) return false;
    
    if (model.hardware?.minRam) {
      const requiredRamGB = parseInt(model.hardware.minRam.replace('GB', ''));
      return availableRam >= requiredRamGB;
    }
    
    return true;
  }

  /**
   * Get context management rules
   */
  getContextRules() {
    return this.config.contextManagement;
  }

  /**
   * Get performance settings
   */
  getPerformanceSettings() {
    return this.config.performance;
  }
}

// Export singleton instance
export const aiConfig = new AIConfigManager();

// Export types and constants
export { aiModelsConfig };
export default aiConfig;