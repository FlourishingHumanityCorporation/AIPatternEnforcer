import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Search conversations by title, description, and message content
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            tags: {
              hasSome: [query]
            }
          },
          {
            messages: {
              some: {
                content: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
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
          take: 1
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      },
      take: limit
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
      query,
      total: formattedConversations.length
    })
  } catch (error) {
    logger.error('Failed to search conversations:', error)
    return NextResponse.json(
      { error: 'Failed to search conversations' },
      { status: 500 }
    )
  }
}