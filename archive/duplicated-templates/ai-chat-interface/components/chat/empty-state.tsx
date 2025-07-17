'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Zap,
  Code,
  Lightbulb,
  FileText,
  Image,
  Calculator,
  BookOpen,
  Brain,
  Sparkles
} from 'lucide-react'

interface EmptyStateProps {
  hasConversation?: boolean
  onCreateConversation?: () => void
  onSendMessage?: (message: string) => void
}

export function EmptyState({
  hasConversation = false,
  onCreateConversation,
  onSendMessage
}: EmptyStateProps) {
  const [selectedExample, setSelectedExample] = useState<string | null>(null)

  const examples = [
    {
      icon: Code,
      category: 'Coding',
      title: 'Code Review',
      description: 'Get feedback on your code',
      prompt: 'Can you review this code and suggest improvements?\n\n```javascript\n// Paste your code here\n```'
    },
    {
      icon: Lightbulb,
      category: 'Creative',
      title: 'Brainstorming',
      description: 'Generate ideas for your project',
      prompt: 'I need creative ideas for a project about [describe your project]. Can you help me brainstorm?'
    },
    {
      icon: FileText,
      category: 'Writing',
      title: 'Content Creation',
      description: 'Help with writing and editing',
      prompt: 'Help me write a professional email about [describe the topic and context]'
    },
    {
      icon: Calculator,
      category: 'Analysis',
      title: 'Problem Solving',
      description: 'Break down complex problems',
      prompt: 'I have a problem with [describe your problem]. Can you help me analyze it step by step?'
    },
    {
      icon: BookOpen,
      category: 'Learning',
      title: 'Explain Concepts',
      description: 'Learn something new',
      prompt: 'Can you explain [concept/topic] in simple terms with examples?'
    },
    {
      icon: Image,
      category: 'Visual',
      title: 'Image Analysis',
      description: 'Describe and analyze images',
      prompt: 'I&apos;ll share an image. Please analyze it and tell me what you see, including any relevant details.'
    }
  ]

  const quickStarters = [
    'What can you help me with?',
    'Explain quantum computing in simple terms',
    'Write a Python function to sort a list',
    'Help me plan a project timeline',
    'Review my business idea',
    'Debug this error message'
  ]

  const handleExampleClick = (prompt: string) => {
    if (onSendMessage) {
      onSendMessage(prompt)
    }
  }

  const handleQuickStarterClick = (starter: string) => {
    if (onSendMessage) {
      onSendMessage(starter)
    }
  }

  if (!hasConversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to AI Chat
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Start a conversation with AI. Ask questions, get help with code, 
            brainstorm ideas, or just have a chat.
          </p>
          
          <button
            onClick={onCreateConversation}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Sparkles className="w-5 h-5" />
            Start New Conversation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            What can I help you with?
          </h2>
          
          <p className="text-gray-600">
            Choose an example below or ask me anything
          </p>
        </div>

        {/* Example Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.prompt)}
              className="p-6 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <example.icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {example.category}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {example.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {example.description}
              </p>
            </button>
          ))}
        </div>

        {/* Quick Starters */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Or try these quick starters:
          </h3>
          
          <div className="flex flex-wrap justify-center gap-2">
            {quickStarters.map((starter, index) => (
              <button
                key={index}
                onClick={() => handleQuickStarterClick(starter)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-8 h-8 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Real-time Streaming</h4>
              <p className="text-sm text-gray-600">Get responses as they&apos;re generated</p>
            </div>
            
            <div>
              <div className="w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Multi-format Support</h4>
              <p className="text-sm text-gray-600">Text, code, images, and documents</p>
            </div>
            
            <div>
              <div className="w-8 h-8 mx-auto mb-2 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-orange-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Conversation Memory</h4>
              <p className="text-sm text-gray-600">Context-aware responses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}