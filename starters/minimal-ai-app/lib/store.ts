import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Example store for AI chat
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set) => ({
        messages: [],
        isLoading: false,
        error: null,

        addMessage: (message) =>
          set((state) => ({
            messages: [
              ...state.messages,
              {
                ...message,
                id: `msg-${Date.now()}`,
                timestamp: new Date(),
              },
            ],
          })),

        clearMessages: () => set({ messages: [] }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
      }),
      {
        name: "chat-store", // Local storage key
      },
    ),
  ),
);

// Example store for app settings
interface SettingsStore {
  theme: "light" | "dark" | "system";
  aiModel: string;
  temperature: number;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setAiModel: (model: string) => void;
  setTemperature: (temp: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        theme: "system",
        aiModel: "gpt-3.5-turbo",
        temperature: 0.7,

        setTheme: (theme) => set({ theme }),
        setAiModel: (aiModel) => set({ aiModel }),
        setTemperature: (temperature) =>
          set({
            temperature: Math.max(0, Math.min(2, temperature)),
          }),
      }),
      {
        name: "settings-store",
      },
    ),
  ),
);
