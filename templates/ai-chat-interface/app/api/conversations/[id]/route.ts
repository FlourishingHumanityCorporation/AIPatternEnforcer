import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { messageIndex: 'asc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...conversation,
      messageCount: conversation._count.messages,
      _count: undefined
    })
  } catch (error) {
    logger.error('Failed to fetch conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const updates = await req.json()

    // Validate conversation exists
    const existingConversation = await prisma.conversation.findUnique({
      where: { id }
    })

    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Filter allowed updates
    const allowedFields = [
      'title',
      'description',
      'systemPrompt',
      'temperature',
      'maxTokens',
      'model',
      'provider',
      'tags',
      'isFavorite',
      'isArchived'
    ]

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    const conversation = await prisma.conversation.update({
      where: { id },
      data: {
        ...filteredUpdates,
        updatedAt: new Date()
      }
    })

    logger.info('Updated conversation:', { id, updates: Object.keys(filteredUpdates) })

    return NextResponse.json(conversation)
  } catch (error) {
    logger.error('Failed to update conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Validate conversation exists
    const existingConversation = await prisma.conversation.findUnique({
      where: { id }
    })

    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Delete conversation (cascades to messages)
    await prisma.conversation.delete({
      where: { id }
    })

    logger.info('Deleted conversation:', { id })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete conversation:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}