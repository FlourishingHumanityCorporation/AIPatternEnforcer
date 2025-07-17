import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { logger } from '@/lib/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ModelConfig {
  id: string
  name: string
  displayName: string
  provider: string
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

export async function GET(req: NextRequest) {
  try {
    const models: ModelConfig[] = []

    // OpenAI Models
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiModels = await openai.models.list()
        const availableModels = openaiModels.data.filter(model => 
          model.id.startsWith('gpt-') && !model.id.includes('instruct')
        )

        const openaiConfigs: ModelConfig[] = [
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
            isAvailable: availableModels.some(m => m.id.includes('gpt-4-turbo')),
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
            isAvailable: availableModels.some(m => m.id === 'gpt-4'),
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
            isAvailable: availableModels.some(m => m.id.includes('gpt-3.5-turbo')),
            category: 'chat'
          }
        ]

        models.push(...openaiConfigs.filter(config => config.isAvailable))
      } catch (error) {
        logger.warn('Failed to fetch OpenAI models:', error)
      }
    }

    // Anthropic Models (static config since they don't provide a models API)
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropicConfigs: ModelConfig[] = [
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

      models.push(...anthropicConfigs)
    }

    // Check for local models (Ollama)
    try {
      const response = await fetch('http://localhost:11434/api/tags')
      if (response.ok) {
        const data = await response.json()
        const localModels = data.models?.map((model: any) => ({
          id: model.name.replace(':latest', ''),
          name: model.name,
          displayName: model.name.replace(':latest', '').replace('-', ' ').toUpperCase(),
          provider: 'LOCAL',
          description: `Local model: ${model.name}`,
          contextLength: 4096, // Default assumption
          maxTokens: 2048,
          supportsFunctions: false,
          supportsVision: false,
          supportsStreaming: true,
          isAvailable: true,
          category: 'chat' as const
        })) || []

        models.push(...localModels)
      }
    } catch (error) {
      // Ollama not available, skip local models
      logger.info('Local models (Ollama) not available')
    }

    // Sort models by recommendation and provider
    models.sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1
      if (!a.isRecommended && b.isRecommended) return 1
      return a.provider.localeCompare(b.provider)
    })

    return NextResponse.json({
      models,
      total: models.length,
      providers: [...new Set(models.map(m => m.provider))],
      categories: [...new Set(models.map(m => m.category))]
    })
  } catch (error) {
    logger.error('Failed to fetch models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}