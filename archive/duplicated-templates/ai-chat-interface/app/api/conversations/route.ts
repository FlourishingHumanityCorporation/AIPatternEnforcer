import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { nanoid } from 'nanoid'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const archived = searchParams.get('archived') === 'true'

    const conversations = await prisma.conversation.findMany({
      where: {
        isArchived: archived
      },
      include: {
        messages: {
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true
          },
          orderBy: { messageIndex: 'desc' },
          take: 1 // Get last message for preview
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const formattedConversations = conversations.map(conv => ({
      ...conv,
      messageCount: conv._count.messages,
      lastMessage: conv.messages[0] || null,
      messages: undefined,
      _count: undefined
    }))

    return NextResponse.json({
      conversations: formattedConversations,
      total: await prisma.conversation.count({
        where: { isArchived: archived }
      })
    })
  } catch (error) {
    logger.error('Failed to fetch conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, model, provider, systemPrompt, temperature, maxTokens } = await req.json()

    if (!title || !model || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: title, model, provider' },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.create({
      data: {
        id: nanoid(),
        title,
        model,
        provider,
        systemPrompt: systemPrompt || null,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 2048,
        lastMessageAt: new Date()
      }
    })

    logger.info('Created conversation:', { id: conversation.id, title })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    logger.error('Failed to create conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}