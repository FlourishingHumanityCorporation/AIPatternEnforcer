'use client'

import { useState, useEffect } from 'react'
import { AIProvider } from '@prisma/client'
import {
  X,
  Check,
  Zap,
  Brain,
  Code,
  Image as ImageIcon,
  Cpu,
  Cloud,
  Globe,
  Star,
  TrendingUp,
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react'

interface ModelConfig {
  id: string
  name: string
  displayName: string
  provider: AIProvider
  description: string
  contextLength: number
  maxTokens: number
  supportsFunctions: boolean
  supportsVision: boolean
  supportsStreaming: boolean
  inputCost?: number
  outputCost?: number
  isAvailable: boolean
  isRecommended?: boolean
  category: 'chat' | 'code' | 'vision' | 'reasoning'
}

interface ModelSelectorProps {
  onClose: () => void
  selectedModel: string
  selectedProvider: AIProvider
  onModelChange: (model: string, provider: AIProvider) => void
}

export function ModelSelector({
  onClose,
  selectedModel,
  selectedProvider,
  onModelChange
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'chat' | 'code' | 'vision' | 'reasoning'>('all')
  const [providerFilter, setProviderFilter] = useState<AIProvider | 'all'>('all')

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setLoading(false)
    }
  }

  const defaultModels: ModelConfig[] = [
    {
      id: 'gpt-4-turbo',
      name: 'gpt-4-turbo',
      displayName: 'GPT-4 Turbo',
      provider: 'OPENAI',
      description: 'Most capable model for complex reasoning and analysis',
      contextLength: 128000,
      maxTokens: 4096,
      supportsFunctions: true,
      supportsVision: true,
      supportsStreaming: true,
      inputCost: 0.01,
      outputCost: 0.03,
      isAvailable: true,
      isRecommended: true,
      category: 'reasoning'
    },
    {
      id: 'gpt-4',
      name: 'gpt-4',
      displayName: 'GPT-4',
      provider: 'OPENAI',
      description: 'High-quality responses for complex tasks',
      contextLength: 8192,
      maxTokens: 4096,
      supportsFunctions: true,
      supportsVision: false,
      supportsStreaming: true,
      inputCost: 0.03,
      outputCost: 0.06,
      isAvailable: true,
      category: 'reasoning'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'gpt-3.5-turbo',
      displayName: 'GPT-3.5 Turbo',
      provider: 'OPENAI',
      description: 'Fast and efficient for most tasks',
      contextLength: 16384,
      maxTokens: 4096,
      supportsFunctions: true,
      supportsVision: false,
      supportsStreaming: true,
      inputCost: 0.001,
      outputCost: 0.002,
      isAvailable: true,
      category: 'chat'
    },
    {
      id: 'claude-3-opus',
      name: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus',
      provider: 'ANTHROPIC',
      description: 'Most powerful Claude model for complex reasoning',
      contextLength: 200000,
      maxTokens: 4096,
      supportsFunctions: false,
      supportsVision: true,
      supportsStreaming: true,
      inputCost: 0.015,
      outputCost: 0.075,
      isAvailable: true,
      isRecommended: true,
      category: 'reasoning'
    },
    {
      id: 'claude-3-sonnet',
      name: 'claude-3-sonnet-20240229',
      displayName: 'Claude 3 Sonnet',
      provider: 'ANTHROPIC',
      description: 'Balanced performance and speed',
      contextLength: 200000,
      maxTokens: 4096,
      supportsFunctions: false,
      supportsVision: true,
      supportsStreaming: true,
      inputCost: 0.003,
      outputCost: 0.015,
      isAvailable: true,
      category: 'chat'
    },
    {
      id: 'claude-3-haiku',
      name: 'claude-3-haiku-20240307',
      displayName: 'Claude 3 Haiku',
      provider: 'ANTHROPIC',
      description: 'Fast and cost-effective for simple tasks',
      contextLength: 200000,
      maxTokens: 4096,
      supportsFunctions: false,
      supportsVision: false,
      supportsStreaming: true,
      inputCost: 0.00025,
      outputCost: 0.00125,
      isAvailable: true,
      category: 'chat'
    }
  ]

  const availableModels = models.length > 0 ? models : defaultModels

  const filteredModels = availableModels.filter(model => {
    if (!model.isAvailable) return false
    if (filter !== 'all' && model.category !== filter) return false
    if (providerFilter !== 'all' && model.provider !== providerFilter) return false
    return true
  })

  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = []
    }
    acc[model.provider].push(model)
    return acc
  }, {} as Record<AIProvider, ModelConfig[]>)

  const handleModelSelect = (model: ModelConfig) => {
    onModelChange(model.name, model.provider)
    onClose()
  }

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'OPENAI':
        return <Brain className="w-4 h-4" />
      case 'ANTHROPIC':
        return <Zap className="w-4 h-4" />
      case 'LOCAL':
        return <Cpu className="w-4 h-4" />
      default:
        return <Cloud className="w-4 h-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chat':
        return <Brain className="w-4 h-4" />
      case 'code':
        return <Code className="w-4 h-4" />
      case 'vision':
        return <ImageIcon className="w-4 h-4" />
      case 'reasoning':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Model</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose the AI model that best fits your needs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="chat">General Chat</option>
                <option value="code">Code Generation</option>
                <option value="vision">Vision & Images</option>
                <option value="reasoning">Complex Reasoning</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value as any)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Providers</option>
                <option value="OPENAI">OpenAI</option>
                <option value="ANTHROPIC">Anthropic</option>
                <option value="LOCAL">Local Models</option>
              </select>
            </div>
          </div>
        </div>

        {/* Models List */}
        <div className="overflow-y-auto max-h-96">
          {Object.entries(groupedModels).map(([provider, providerModels]) => (
            <div key={provider} className="p-6 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-2 mb-4">
                {getProviderIcon(provider as AIProvider)}
                <h3 className="font-semibold text-gray-900 capitalize">
                  {provider.toLowerCase()}
                </h3>
                <span className="text-sm text-gray-500">
                  ({providerModels.length} models)
                </span>
              </div>

              <div className="grid gap-3">
                {providerModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`p-4 border rounded-lg text-left transition-all hover:border-blue-300 hover:shadow-sm ${
                      selectedModel === model.name && selectedProvider === model.provider
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {model.displayName}
                          </h4>
                          {model.isRecommended && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Recommended
                            </span>
                          )}
                          {getCategoryIcon(model.category)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {model.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {model.contextLength.toLocaleString()} context
                          </div>
                          
                          {model.inputCost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${model.inputCost}/1K tokens
                            </div>
                          )}
                          
                          <div className="flex gap-1">
                            {model.supportsFunctions && (
                              <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded">
                                Functions
                              </span>
                            )}
                            {model.supportsVision && (
                              <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded">
                                Vision
                              </span>
                            )}
                            {model.supportsStreaming && (
                              <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded">
                                Streaming
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {selectedModel === model.name && selectedProvider === model.provider && (
                        <Check className="w-5 h-5 text-blue-600 mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No models found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}