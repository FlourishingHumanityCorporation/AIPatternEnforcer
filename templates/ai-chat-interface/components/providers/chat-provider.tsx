'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Message, Conversation, AIProvider } from '@prisma/client'

export interface ChatMessage extends Omit<Message, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt?: string
}

export interface ChatConversation extends Omit<Conversation, 'createdAt' | 'updatedAt' | 'lastMessageAt'> {
  createdAt: string
  updatedAt: string
  lastMessageAt?: string
  messages?: ChatMessage[]
}

interface ChatState {
  conversations: ChatConversation[]
  currentConversation: ChatConversation | null
  messages: ChatMessage[]
  isLoading: boolean
  isStreaming: boolean
  error: string | null
  selectedModel: string
  selectedProvider: AIProvider
  temperature: number
  maxTokens: number
  searchQuery: string
  sidebarCollapsed: boolean
}

type ChatAction =
  | { type: 'SET_CONVERSATIONS'; payload: ChatConversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: ChatConversation | null }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_PROVIDER'; payload: AIProvider }
  | { type: 'SET_TEMPERATURE'; payload: number }
  | { type: 'SET_MAX_TOKENS'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'CREATE_CONVERSATION'; payload: ChatConversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<ChatConversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  selectedModel: 'gpt-4',
  selectedProvider: 'OPENAI',
  temperature: 0.7,
  maxTokens: 2048,
  searchQuery: '',
  sidebarCollapsed: false,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload }
    
    case 'SET_CURRENT_CONVERSATION':
      return { 
        ...state, 
        currentConversation: action.payload,
        messages: action.payload?.messages || []
      }
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload]
      }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload }
    
    case 'SET_PROVIDER':
      return { ...state, selectedProvider: action.payload }
    
    case 'SET_TEMPERATURE':
      return { ...state, temperature: action.payload }
    
    case 'SET_MAX_TOKENS':
      return { ...state, maxTokens: action.payload }
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }
    
    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        currentConversation: action.payload
      }
    
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id
            ? { ...conv, ...action.payload.updates }
            : conv
        ),
        currentConversation: state.currentConversation?.id === action.payload.id
          ? { ...state.currentConversation, ...action.payload.updates }
          : state.currentConversation
      }
    
    case 'DELETE_CONVERSATION':
      const filteredConversations = state.conversations.filter(conv => conv.id !== action.payload)
      return {
        ...state,
        conversations: filteredConversations,
        currentConversation: state.currentConversation?.id === action.payload
          ? filteredConversations[0] || null
          : state.currentConversation
      }
    
    default:
      return state
  }
}

interface ChatContextType {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  actions: {
    createConversation: (title?: string) => Promise<void>
    selectConversation: (conversationId: string) => Promise<void>
    sendMessage: (content: string) => Promise<void>
    regenerateMessage: (messageId: string) => Promise<void>
    editMessage: (messageId: string, content: string) => Promise<void>
    deleteMessage: (messageId: string) => Promise<void>
    updateConversationSettings: (settings: Partial<ChatConversation>) => Promise<void>
    searchConversations: (query: string) => Promise<void>
    exportConversation: (conversationId: string, format: 'json' | 'markdown') => Promise<void>
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const actions = {
    createConversation: async (title = 'New Conversation') => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            model: state.selectedModel,
            provider: state.selectedProvider,
            temperature: state.temperature,
            maxTokens: state.maxTokens
          })
        })
        
        if (!response.ok) throw new Error('Failed to create conversation')
        
        const conversation = await response.json()
        dispatch({ type: 'CREATE_CONVERSATION', payload: conversation })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    selectConversation: async (conversationId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const response = await fetch(`/api/conversations/${conversationId}`)
        if (!response.ok) throw new Error('Failed to load conversation')
        
        const conversation = await response.json()
        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    sendMessage: async (content: string) => {
      if (!state.currentConversation) return

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: state.currentConversation.id,
        role: 'USER',
        content,
        messageIndex: state.messages.length,
        isStreaming: false,
        isComplete: true,
        isEdited: false,
        isFavorite: false,
        isRegenerating: false,
        createdAt: new Date().toISOString()
      }

      dispatch({ type: 'ADD_MESSAGE', payload: userMessage })
      dispatch({ type: 'SET_STREAMING', payload: true })

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: state.currentConversation.id,
            message: content,
            model: state.selectedModel,
            provider: state.selectedProvider,
            temperature: state.temperature,
            maxTokens: state.maxTokens
          })
        })

        if (!response.ok) throw new Error('Failed to send message')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const assistantMessage: ChatMessage = {
          id: `temp-assistant-${Date.now()}`,
          conversationId: state.currentConversation.id,
          role: 'ASSISTANT',
          content: '',
          messageIndex: state.messages.length + 1,
          isStreaming: true,
          isComplete: false,
          isEdited: false,
          isFavorite: false,
          isRegenerating: false,
          model: state.selectedModel,
          provider: state.selectedProvider,
          createdAt: new Date().toISOString()
        }

        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage })

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  dispatch({
                    type: 'UPDATE_MESSAGE',
                    payload: {
                      id: assistantMessage.id,
                      updates: { content: assistantMessage.content + data.content }
                    }
                  })
                }
                if (data.finished) {
                  dispatch({
                    type: 'UPDATE_MESSAGE',
                    payload: {
                      id: assistantMessage.id,
                      updates: { 
                        isStreaming: false, 
                        isComplete: true,
                        id: data.messageId,
                        totalTokens: data.totalTokens,
                        promptTokens: data.promptTokens,
                        completionTokens: data.completionTokens
                      }
                    }
                  })
                }
              } catch (e) {
                // Invalid JSON, skip
              }
            }
          }
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        dispatch({ type: 'SET_STREAMING', payload: false })
      }
    },

    regenerateMessage: async (messageId: string) => {
      // Implementation for regenerating a message
    },

    editMessage: async (messageId: string, content: string) => {
      // Implementation for editing a message
    },

    deleteMessage: async (messageId: string) => {
      // Implementation for deleting a message
    },

    updateConversationSettings: async (settings: Partial<ChatConversation>) => {
      if (!state.currentConversation) return

      try {
        const response = await fetch(`/api/conversations/${state.currentConversation.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        })

        if (!response.ok) throw new Error('Failed to update conversation')

        const updatedConversation = await response.json()
        dispatch({
          type: 'UPDATE_CONVERSATION',
          payload: { id: state.currentConversation.id, updates: updatedConversation }
        })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
      }
    },

    searchConversations: async (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
      
      if (!query.trim()) {
        // Load all conversations
        const response = await fetch('/api/conversations')
        const conversations = await response.json()
        dispatch({ type: 'SET_CONVERSATIONS', payload: conversations })
        return
      }

      try {
        const response = await fetch(`/api/conversations/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Search failed')
        
        const conversations = await response.json()
        dispatch({ type: 'SET_CONVERSATIONS', payload: conversations })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
      }
    },

    exportConversation: async (conversationId: string, format: 'json' | 'markdown') => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/export?format=${format}`)
        if (!response.ok) throw new Error('Export failed')
        
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `conversation-${conversationId}.${format === 'json' ? 'json' : 'md'}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
  }

  return (
    <ChatContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}