'use client'

import { useState, useRef, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  Send,
  Paperclip,
  Mic,
  RotateCcw,
  Square,
  Image,
  File,
  Code,
  Zap
} from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>
  onRegenerateLastMessage?: () => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSendMessage,
  onRegenerateLastMessage,
  disabled = false,
  placeholder = 'Type your message...'
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the textarea
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled])

  // Hotkeys
  useHotkeys('cmd+enter,ctrl+enter', () => handleSubmit(), {
    enableOnFormTags: ['textarea']
  })

  useHotkeys('cmd+k,ctrl+k', (e) => {
    e.preventDefault()
    setShowSuggestions(!showSuggestions)
  })

  const handleSubmit = async () => {
    if (!message.trim() || disabled) return

    const messageToSend = message.trim()
    setMessage('')
    setAttachments([])
    
    try {
      await onSendMessage(messageToSend)
    } catch (error) {
      // Restore message on error
      setMessage(messageToSend)
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const insertTemplate = (template: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentMessage = message
    const newMessage = currentMessage.slice(0, start) + template + currentMessage.slice(end)
    
    setMessage(newMessage)
    setShowSuggestions(false)
    
    // Focus and set cursor position after template
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + template.length, start + template.length)
    }, 0)
  }

  const suggestions = [
    { icon: Code, text: 'Explain this code:', template: 'Explain this code:\n\n```\n\n```' },
    { icon: Image, text: 'Analyze this image:', template: 'Analyze this image and tell me:' },
    { icon: File, text: 'Summarize this document:', template: 'Please summarize the key points from this document:' },
    { icon: Zap, text: 'Quick question:', template: 'I have a quick question about ' },
  ]

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex gap-2 flex-wrap">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1 text-sm"
              >
                <File className="w-4 h-4 text-gray-500" />
                <span className="truncate max-w-40">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && (
        <div className="border-b border-gray-100 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => insertTemplate(suggestion.template)}
                className="flex items-center gap-3 p-3 text-left hover:bg-white rounded-lg transition-colors"
              >
                <suggestion.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <div className="flex items-end gap-3">
          {/* Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <TextareaAutosize
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={disabled ? 'AI is responding...' : placeholder}
              disabled={disabled}
              minRows={1}
              maxRows={10}
              className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            
            {/* Character count for long messages */}
            {message.length > 1000 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {message.length}/4000
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Regenerate Button */}
            {onRegenerateLastMessage && (
              <button
                onClick={onRegenerateLastMessage}
                disabled={disabled}
                className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerate last response"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}

            {/* Send/Stop Button */}
            {disabled ? (
              <button
                className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Stop generation"
              >
                <Square className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
                className="flex-shrink-0 p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                title="Send message (Ctrl+Enter)"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Ctrl+Enter to send</span>
            <span>Shift+Enter for new line</span>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="hover:text-gray-700 transition-colors"
            >
              Ctrl+K for suggestions
            </button>
          </div>
          {message.trim() && (
            <span>{message.trim().split(/\s+/).length} words</span>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.txt,.md,.doc,.docx"
      />
    </div>
  )
}