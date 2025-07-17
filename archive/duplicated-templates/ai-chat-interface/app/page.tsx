import { ChatInterface } from '@/components/chat/chat-interface'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { ChatProvider } from '@/components/providers/chat-provider'

export default function Home() {
  return (
    <ChatProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <ConversationSidebar />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>
      </div>
    </ChatProvider>
  )
}