'use client'

import { useState, useEffect, useCallback } from 'react'
import { useChat } from '@/components/providers/chat-provider'
import { formatDistanceToNow } from 'date-fns'
import {
  Search,
  Plus,
  MessageSquare,
  Settings,
  Archive,
  Star,
  MoreHorizontal,
  Edit3,
  Trash2,
  Download,
  Filter
} from 'lucide-react'

export function ConversationSidebar() {
  const { state, actions, dispatch } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | 'recent'>('all')

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations')
      const conversations = await response.json()
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations })
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }, [dispatch])

  useEffect(() => {
    // Load conversations on mount
    loadConversations()
  }, [loadConversations])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    await actions.searchConversations(query)
  }

  const filteredConversations = state.conversations.filter(conv => {
    if (!showArchived && conv.isArchived) return false
    if (selectedFilter === 'favorites' && !conv.isFavorite) return false
    if (selectedFilter === 'recent') {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return new Date(conv.lastMessageAt || conv.createdAt) > dayAgo
    }
    return true
  })

  const toggleFavorite = async (conversationId: string, isFavorite: boolean) => {
    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFavorite })
      })
      
      dispatch({
        type: 'UPDATE_CONVERSATION',
        payload: { id: conversationId, updates: { isFavorite: !isFavorite } }
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return

    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      })
      
      dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId })
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
          <button
            onClick={() => actions.createConversation()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="New conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="favorites">Favorites</option>
            <option value="recent">Recent</option>
          </select>
          
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`text-sm px-3 py-1 rounded transition-colors ${
              showArchived
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Archive className="w-4 h-4 inline mr-1" />
            Archived
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={state.currentConversation?.id === conversation.id}
                onClick={() => actions.selectConversation(conversation.id)}
                onToggleFavorite={() => toggleFavorite(conversation.id, conversation.isFavorite)}
                onDelete={() => deleteConversation(conversation.id)}
                onExport={(format) => actions.exportConversation(conversation.id, format)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700">Settings</span>
        </button>
      </div>
    </div>
  )
}

interface ConversationItemProps {
  conversation: any
  isActive: boolean
  onClick: () => void
  onToggleFavorite: () => void
  onDelete: () => void
  onExport: (format: 'json' | 'markdown') => void
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  onToggleFavorite,
  onDelete,
  onExport
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(conversation.title)

  const handleSaveTitle = async () => {
    try {
      await fetch(`/api/conversations/${conversation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update title:', error)
      setTitle(conversation.title) // Revert on error
    }
  }

  const lastMessageTime = conversation.lastMessageAt || conversation.createdAt
  const timeAgo = formatDistanceToNow(new Date(lastMessageTime), { addSuffix: true })

  return (
    <div
      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') {
                    setTitle(conversation.title)
                    setIsEditing(false)
                  }
                }}
                className="flex-1 text-sm font-medium bg-transparent border-none outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {conversation.title}
              </h3>
            )}
            {conversation.isFavorite && (
              <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="capitalize">{conversation.provider.toLowerCase()}</span>
            <span>•</span>
            <span>{conversation.model}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
          
          {conversation.tags && conversation.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {conversation.tags.slice(0, 2).map((tag: string) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {conversation.tags.length > 2 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{conversation.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title={conversation.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${conversation.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Edit title"
          >
            <Edit3 className="w-4 h-4 text-gray-400" />
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onExport('markdown')
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as Markdown
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onExport('json')
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as JSON
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}