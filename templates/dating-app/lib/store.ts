// Global app state management with Zustand
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types for the store
interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface AppState {
  // Chat state
  messages: ChatMessage[]
  isLoading: boolean
  currentModel: string
  
  // UI state
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  
  // User preferences
  preferences: {
    temperature: number
    maxTokens: number
    autoSave: boolean
  }
}

interface AppActions {
  // Chat actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setModel: (model: string) => void
  
  // UI actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Preferences
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void
}

type Store = AppState & AppActions

// Create the store
export const useAppStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        messages: [],
        isLoading: false,
        currentModel: 'gpt-3.5-turbo',
        sidebarOpen: true,
        theme: 'system',
        preferences: {
          temperature: 0.7,
          maxTokens: 2000,
          autoSave: true,
        },

        // Chat actions
        addMessage: (message) => {
          const newMessage: ChatMessage = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          }
          set((state) => ({
            messages: [...state.messages, newMessage],
          }))
        },

        clearMessages: () => set({ messages: [] }),

        setLoading: (loading) => set({ isLoading: loading }),

        setModel: (model) => set({ currentModel: model }),

        // UI actions
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        setTheme: (theme) => set({ theme }),

        // Preferences
        updatePreferences: (newPreferences) =>
          set((state) => ({
            preferences: { ...state.preferences, ...newPreferences },
          })),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          theme: state.theme,
          preferences: state.preferences,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: 'AIPatternEnforcer Store',
    }
  )
)

// Selector hooks for better performance
export const useMessages = () => useAppStore((state) => state.messages)
export const useIsLoading = () => useAppStore((state) => state.isLoading)
export const useCurrentModel = () => useAppStore((state) => state.currentModel)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)
export const useTheme = () => useAppStore((state) => state.theme)
export const usePreferences = () => useAppStore((state) => state.preferences)

// Action hooks
export const useChatActions = () => useAppStore((state) => ({
  addMessage: state.addMessage,
  clearMessages: state.clearMessages,
  setLoading: state.setLoading,
  setModel: state.setModel,
}))

export const useUIActions = () => useAppStore((state) => ({
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  setTheme: state.setTheme,
}))