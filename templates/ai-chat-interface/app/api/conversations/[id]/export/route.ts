import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { formatDistanceToNow } from 'date-fns'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'markdown'

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { messageIndex: 'asc' }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    let content: string
    let mimeType: string
    let filename: string

    if (format === 'json') {
      content = JSON.stringify(conversation, null, 2)
      mimeType = 'application/json'
      filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    } else {
      content = generateMarkdown(conversation)
      mimeType = 'text/markdown'
      filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    }

    return new Response(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    logger.error('Failed to export conversation:', error)
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    )
  }
}

function generateMarkdown(conversation: any): string {
  const { title, description, model, provider, systemPrompt, temperature, messages, createdAt } = conversation
  
  let markdown = `# ${title}\n\n`
  
  // Metadata
  markdown += `**Created:** ${new Date(createdAt).toLocaleDateString()}\n`
  markdown += `**Model:** ${model} (${provider})\n`
  markdown += `**Temperature:** ${temperature}\n`
  if (description) {
    markdown += `**Description:** ${description}\n`
  }
  markdown += `**Messages:** ${messages.length}\n\n`
  
  // System prompt
  if (systemPrompt) {
    markdown += `## System Prompt\n\n`
    markdown += `\`\`\`\n${systemPrompt}\n\`\`\`\n\n`
  }
  
  // Conversation
  markdown += `## Conversation\n\n`
  
  messages.forEach((message: any, index: number) => {
    const role = message.role === 'USER' ? 'User' : 'Assistant'
    const timestamp = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    
    markdown += `### ${role} ${timestamp}\n\n`
    
    // Handle code blocks and formatting
    let content = message.content
    
    // Ensure proper code block formatting
    if (content.includes('```')) {
      content = content.replace(/```(\w+)?\n/g, '```$1\n')
      content = content.replace(/```\n/g, '```\n')
    }
    
    markdown += `${content}\n\n`
    
    // Add metadata for assistant messages
    if (message.role === 'ASSISTANT' && message.totalTokens) {
      markdown += `*Tokens: ${message.totalTokens}*\n\n`
    }
    
    markdown += `---\n\n`
  })
  
  // Footer
  markdown += `*Exported from AI Chat Interface on ${new Date().toLocaleDateString()}*\n`
  
  return markdown
}