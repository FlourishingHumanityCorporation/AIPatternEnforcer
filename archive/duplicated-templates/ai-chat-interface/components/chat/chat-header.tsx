'use client'

import { useState } from 'react'
import { ChatConversation } from '@/components/providers/chat-provider'
import {
  Settings,
  ChevronDown,
  Share,
  Download,
  MoreHorizontal,
  Star,
  Archive,
  Trash2,
  Edit3,
  Copy,
  ExternalLink
} from 'lucide-react'

interface ChatHeaderProps {
  conversation: ChatConversation | null
  onToggleSettings: () => void
  onToggleModelSelector: () => void
}

export function ChatHeader({
  conversation,
  onToggleSettings,
  onToggleModelSelector
}: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(conversation?.title || '')

  const handleSaveTitle = async () => {
    if (!conversation) return
    
    try {
      await fetch(`/api/conversations/${conversation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Failed to update title:', error)
      setTitle(conversation.title) // Revert on error
    }
  }

  const shareConversation = async () => {
    if (!conversation) return
    
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/share`, {
        method: 'POST'
      })
      const { shareUrl } = await response.json()
      
      await navigator.clipboard.writeText(shareUrl)
      // Show success toast
    } catch (error) {
      console.error('Failed to share conversation:', error)
    }
  }

  const exportConversation = async (format: 'json' | 'markdown') => {
    if (!conversation) return
    
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/export?format=${format}`)
      const blob = await response.blob()
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format === 'json' ? 'json' : 'md'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export conversation:', error)
    }
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Chat Interface</h1>
            <p className="text-sm text-gray-500">Select a conversation or start a new one</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleModelSelector}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>Select Model</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <button
            onClick={onToggleSettings}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Conversation Title */}
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') {
                  setTitle(conversation.title)
                  setIsEditingTitle(false)
                }
              }}
              className="text-lg font-semibold bg-transparent border-none outline-none w-full"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 
                className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-gray-700"
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit title"
              >
                {conversation.title}
              </h1>
              {conversation.isFavorite && (
                <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
              )}
              {conversation.isArchived && (
                <Archive className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </div>
          )}
          
          {/* Model and Provider Info */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="capitalize">{conversation.provider.toLowerCase()}</span>
            <span>•</span>
            <button
              onClick={onToggleModelSelector}
              className="hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <span>{conversation.model}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {conversation.temperature !== 0.7 && (
              <>
                <span>•</span>
                <span>temp: {conversation.temperature}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Share Button */}
        <button
          onClick={shareConversation}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Share conversation"
        >
          <Share className="w-5 h-5" />
        </button>

        {/* Export Button */}
        <button
          onClick={() => exportConversation('markdown')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Export conversation"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setIsEditingTitle(true)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit title
              </button>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy link
              </button>
              
              <div className="border-t border-gray-100" />
              
              <button
                onClick={() => {
                  exportConversation('json')
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export as JSON
              </button>
              
              <button
                onClick={() => {
                  exportConversation('markdown')
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export as Markdown
              </button>
              
              <div className="border-t border-gray-100" />
              
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete conversation
              </button>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={onToggleSettings}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Conversation settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}