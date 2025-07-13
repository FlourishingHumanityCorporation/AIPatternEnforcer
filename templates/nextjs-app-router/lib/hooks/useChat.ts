'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatResponse {
  content: string
  model: string
  provider: string
  latencyMs: number
}

export function useChat() {
  const queryClient = useQueryClient()
  const { messages, addMessage, setLoading, clearMessages } = useAppStore()

  const sendMessage = useMutation({
    mutationFn: async (message: ChatMessage): Promise<ChatResponse> => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, message],
          preferLocal: true,
          fallbackToAPI: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      return response.json()
    },
    onMutate: (message) => {
      // Add user message immediately
      addMessage(message)
      setLoading(true)
    },
    onSuccess: (response) => {
      // Add AI response
      addMessage({
        role: 'assistant',
        content: response.content,
      })
      setLoading(false)
    },
    onError: (error) => {
      console.error('Chat error:', error)
      setLoading(false)
      // Add error message
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      })
    },
  })

  const models = useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const response = await fetch('/api/ai/models')
      if (!response.ok) {
        throw new Error('Failed to fetch models')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    messages,
    sendMessage: sendMessage.mutate,
    isLoading: sendMessage.isPending,
    clearMessages,
    models: models.data,
    isModelsLoading: models.isLoading,
  }
}

export function useEmbedding() {
  return useMutation({
    mutationFn: async (text: string): Promise<number[]> => {
      const response = await fetch('/api/ai/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          preferLocal: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate embedding')
      }

      const data = await response.json()
      return data.embedding
    },
  })
}

export function useVision() {
  return useMutation({
    mutationFn: async ({ 
      image, 
      prompt 
    }: { 
      image: File
      prompt: string 
    }): Promise<ChatResponse> => {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('prompt', prompt)
      formData.append('preferLocal', 'true')

      const response = await fetch('/api/ai/vision', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      return response.json()
    },
  })
}