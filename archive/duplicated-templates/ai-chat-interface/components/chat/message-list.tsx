'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import {
  User,
  Bot,
  Copy,
  Edit,
  Trash2,
  RotateCcw,
  Star,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Code,
  Check
} from 'lucide-react'
import { ChatMessage } from '@/components/providers/chat-provider'

interface MessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onEditMessage: (messageId: string, content: string) => Promise<void>
  onDeleteMessage: (messageId: string) => Promise<void>
  onRegenerateMessage: (messageId: string) => Promise<void>
}

export function MessageList({
  messages,
  isStreaming,
  onEditMessage,
  onDeleteMessage,
  onRegenerateMessage
}: MessageListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleStartEdit = (message: ChatMessage) => {
    setEditingId(message.id)
    setEditContent(message.content)
  }

  const handleSaveEdit = async () => {
    if (editingId) {
      await onEditMessage(editingId, editContent)
      setEditingId(null)
      setEditContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You might want to show a toast here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isEditing={editingId === message.id}
          editContent={editContent}
          onEditContent={setEditContent}
          onStartEdit={() => handleStartEdit(message)}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDelete={() => onDeleteMessage(message.id)}
          onRegenerate={() => onRegenerateMessage(message.id)}
          onCopy={() => copyToClipboard(message.content)}
          isStreaming={message.isStreaming || false}
        />
      ))}
    </div>
  )
}

interface MessageItemProps {
  message: ChatMessage
  isEditing: boolean
  editContent: string
  onEditContent: (content: string) => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onRegenerate: () => void
  onCopy: () => void
  isStreaming: boolean
}

function MessageItem({
  message,
  isEditing,
  editContent,
  onEditContent,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onRegenerate,
  onCopy,
  isStreaming
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'USER'
  const isAssistant = message.role === 'ASSISTANT'
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })

  const handleCopy = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          {isEditing && isUser ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => onEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={4}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={onSaveEdit}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {isAssistant ? (
                <div className={`prose prose-sm max-w-none ${
                  isUser ? 'prose-invert' : 'prose-gray'
                }`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      },
                      a({ href, children }) {
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {children}
                          </a>
                        )
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}

              {/* Streaming indicator */}
              {isStreaming && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span>AI is typing...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message metadata */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <span>{timeAgo}</span>
          {message.model && (
            <>
              <span>•</span>
              <span>{message.model}</span>
            </>
          )}
          {message.totalTokens && (
            <>
              <span>•</span>
              <span>{message.totalTokens} tokens</span>
            </>
          )}
          {message.isEdited && (
            <>
              <span>•</span>
              <span>edited</span>
            </>
          )}
        </div>

        {/* Action buttons */}
        {showActions && !isEditing && (
          <div className={`flex items-center gap-1 mt-2 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {isUser && (
              <button
                onClick={onStartEdit}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Edit message"
              >
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
            )}

            {isAssistant && (
              <button
                onClick={onRegenerate}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-4 h-4 text-gray-500" />
              </button>
            )}

            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>

            {/* Message rating for assistant messages */}
            {isAssistant && (
              <>
                <button
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Good response"
                >
                  <ThumbsUp className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Poor response"
                >
                  <ThumbsDown className="w-4 h-4 text-gray-500" />
                </button>
              </>
            )}

            <button
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* Code block actions */}
        {message.content.includes('```') && !isEditing && (
          <CodeBlockActions content={message.content} />
        )}
      </div>
    </div>
  )
}

function CodeBlockActions({ content }: { content: string }) {
  const codeBlocks = content.match(/```[\s\S]*?```/g) || []
  
  const copyCodeBlock = async (code: string) => {
    // Extract code without the ``` wrapper
    const cleanCode = code.replace(/```\w*\n?/, '').replace(/```$/, '')
    try {
      await navigator.clipboard.writeText(cleanCode)
      // Show success feedback
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  if (codeBlocks.length === 0) return null

  return (
    <div className="mt-2 space-y-1">
      {codeBlocks.map((block, index) => (
        <button
          key={index}
          onClick={() => copyCodeBlock(block)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
        >
          <Code className="w-3 h-3" />
          Copy code block {index + 1}
        </button>
      ))}
    </div>
  )
}