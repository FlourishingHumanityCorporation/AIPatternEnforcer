'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/components/providers/chat-provider'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { ChatHeader } from './chat-header'
import { ModelSelector } from './model-selector'
import { ConversationSettings } from './conversation-settings'
import { EmptyState } from './empty-state'

export function ChatInterface() {
  const { state, actions } = useChat()
  const [showSettings, setShowSettings] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [state.messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return
    
    // Create conversation if none exists
    if (!state.currentConversation) {
      await actions.createConversation()
    }
    
    await actions.sendMessage(content)
  }

  const handleRegenerateLastMessage = async () => {
    const lastAssistantMessage = state.messages
      .filter(msg => msg.role === 'ASSISTANT')
      .pop()
    
    if (lastAssistantMessage) {
      await actions.regenerateMessage(lastAssistantMessage.id)
    }
  }

  if (!state.currentConversation) {
    return (
      <div className="flex-1 flex flex-col">
        <ChatHeader
          conversation={null}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onToggleModelSelector={() => setShowModelSelector(!showModelSelector)}
        />
        <EmptyState onCreateConversation={() => actions.createConversation()} />
        
        {/* Model Selector Overlay */}
        {showModelSelector && (
          <ModelSelector
            onClose={() => setShowModelSelector(false)}
            selectedModel={state.selectedModel}
            selectedProvider={state.selectedProvider}
            onModelChange={(model, provider) => {
              // Update the selected model/provider
              actions.updateConversationSettings({ model, provider })
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <ChatHeader
        conversation={state.currentConversation}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onToggleModelSelector={() => setShowModelSelector(!showModelSelector)}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {state.messages.length === 0 ? (
          <EmptyState 
            hasConversation 
            onSendMessage={handleSendMessage}
          />
        ) : (
          <MessageList
            messages={state.messages}
            isStreaming={state.isStreaming}
            onEditMessage={actions.editMessage}
            onDeleteMessage={actions.deleteMessage}
            onRegenerateMessage={actions.regenerateMessage}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onRegenerateLastMessage={handleRegenerateLastMessage}
        disabled={state.isLoading || state.isStreaming}
        placeholder={
          state.isStreaming 
            ? 'AI is responding...' 
            : state.currentConversation 
              ? 'Type your message...' 
              : 'Start a conversation...'
        }
      />

      {/* Settings Sidebar */}
      {showSettings && (
        <ConversationSettings
          conversation={state.currentConversation}
          onClose={() => setShowSettings(false)}
          onUpdateSettings={actions.updateConversationSettings}
        />
      )}

      {/* Model Selector Overlay */}
      {showModelSelector && (
        <ModelSelector
          onClose={() => setShowModelSelector(false)}
          selectedModel={state.selectedModel}
          selectedProvider={state.selectedProvider}
          onModelChange={(model, provider) => {
            actions.updateConversationSettings({ model, provider })
          }}
        />
      )}

      {/* Error Display */}
      {state.error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm">{state.error}</span>
            <button
              onClick={() => actions.dispatch({ type: 'SET_ERROR', payload: null })}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}