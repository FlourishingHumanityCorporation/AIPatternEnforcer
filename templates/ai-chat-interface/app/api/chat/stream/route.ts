import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'
import { nanoid } from 'nanoid'
import { logger } from '@/lib/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const { conversationId, message, model, provider, temperature, maxTokens } = await req.json()

    // Validate required fields
    if (!conversationId || !message || !model || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get conversation and message history
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { messageIndex: 'asc' },
          take: 50 // Limit context window
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        id: nanoid(),
        conversationId,
        role: 'USER',
        content: message,
        messageIndex: conversation.messages.length,
        isComplete: true,
        isStreaming: false
      }
    })

    // Prepare context messages
    const contextMessages = conversation.messages.map(msg => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: msg.content
    }))

    // Add current user message
    contextMessages.push({
      role: 'user',
      content: message
    })

    // Add system prompt if exists
    if (conversation.systemPrompt) {
      contextMessages.unshift({
        role: 'system',
        content: conversation.systemPrompt
      })
    }

    const assistantMessageId = nanoid()
    let completionContent = ''
    let promptTokens = 0
    let completionTokens = 0

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (provider === 'OPENAI') {
            const stream = await openai.chat.completions.create({
              model,
              messages: contextMessages,
              temperature: temperature || 0.7,
              max_tokens: maxTokens || 2048,
              stream: true
            })

            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta
              
              if (delta?.content) {
                completionContent += delta.content
                
                // Send chunk to client
                const data = JSON.stringify({
                  content: delta.content,
                  messageId: assistantMessageId
                })
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
              }

              // Handle usage information
              if (chunk.usage) {
                promptTokens = chunk.usage.prompt_tokens
                completionTokens = chunk.usage.completion_tokens
              }
            }
          } else if (provider === 'ANTHROPIC') {
            const stream = await anthropic.messages.create({
              model,
              messages: contextMessages.filter(m => m.role !== 'system'),
              system: conversation.systemPrompt || undefined,
              temperature: temperature || 0.7,
              max_tokens: maxTokens || 2048,
              stream: true
            })

            for await (const chunk of stream) {
              if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                completionContent += chunk.delta.text
                
                // Send chunk to client
                const data = JSON.stringify({
                  content: chunk.delta.text,
                  messageId: assistantMessageId
                })
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
              }

              if (chunk.type === 'message_start') {
                promptTokens = chunk.message.usage.input_tokens
              }

              if (chunk.type === 'message_delta') {
                completionTokens = chunk.delta.usage?.output_tokens || 0
              }
            }
          } else {
            throw new Error(`Unsupported provider: ${provider}`)
          }

          // Save assistant message to database
          const assistantMessage = await prisma.message.create({
            data: {
              id: assistantMessageId,
              conversationId,
              role: 'ASSISTANT',
              content: completionContent,
              messageIndex: conversation.messages.length + 1,
              model,
              provider,
              temperature,
              promptTokens,
              completionTokens,
              totalTokens: promptTokens + completionTokens,
              isComplete: true,
              isStreaming: false
            }
          })

          // Update conversation last message time
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
          })

          // Send completion signal
          const finishData = JSON.stringify({
            finished: true,
            messageId: assistantMessage.id,
            totalTokens: promptTokens + completionTokens,
            promptTokens,
            completionTokens
          })
          controller.enqueue(new TextEncoder().encode(`data: ${finishData}\n\n`))

          // Track usage
          await prisma.usage.create({
            data: {
              feature: 'chat',
              model,
              provider,
              tokens: promptTokens + completionTokens,
              cost: calculateCost(model, provider, promptTokens, completionTokens)
            }
          })

          controller.close()
        } catch (error) {
          logger.error('Streaming error:', error)
          
          const errorData = JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
            messageId: assistantMessageId
          })
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    logger.error('Chat stream error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateCost(model: string, provider: string, promptTokens: number, completionTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
  }

  const modelPricing = pricing[model]
  if (!modelPricing) return 0

  const inputCost = (promptTokens / 1000) * modelPricing.input
  const outputCost = (completionTokens / 1000) * modelPricing.output
  
  return inputCost + outputCost
}