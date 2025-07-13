'use client'

import { useState } from 'react'
import { ChatConversation } from '@/components/providers/chat-provider'
import {
  X,
  Settings,
  Thermometer,
  Hash,
  Type,
  Tag,
  Palette,
  Download,
  Share,
  Archive,
  Star,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'

interface ConversationSettingsProps {
  conversation: ChatConversation
  onClose: () => void
  onUpdateSettings: (settings: Partial<ChatConversation>) => Promise<void>
}

export function ConversationSettings({
  conversation,
  onClose,
  onUpdateSettings
}: ConversationSettingsProps) {
  const [settings, setSettings] = useState({
    title: conversation.title,
    description: conversation.description || '',
    systemPrompt: conversation.systemPrompt || '',
    temperature: conversation.temperature,
    maxTokens: conversation.maxTokens || 2048,
    tags: conversation.tags || [],
    isFavorite: conversation.isFavorite,
    isArchived: conversation.isArchived
  })

  const [newTag, setNewTag] = useState('')
  const [isModified, setIsModified] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setIsModified(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdateSettings(settings)
      setIsModified(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !settings.tags.includes(newTag.trim())) {
      handleSettingChange('tags', [...settings.tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleSettingChange('tags', settings.tags.filter(tag => tag !== tagToRemove))
  }

  const resetToDefaults = () => {
    setSettings({
      ...settings,
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 2048
    })
    setIsModified(true)
  }

  const presetPrompts = [
    {
      name: 'Creative Writer',
      prompt: 'You are a creative writing assistant. Help with storytelling, character development, and narrative structure. Be imaginative and inspiring.'
    },
    {
      name: 'Code Reviewer',
      prompt: 'You are an experienced software engineer. Review code for best practices, performance, security, and maintainability. Provide constructive feedback.'
    },
    {
      name: 'Research Assistant',
      prompt: 'You are a research assistant. Help analyze information, find sources, and synthesize complex topics. Be thorough and cite relevant information.'
    },
    {
      name: 'Problem Solver',
      prompt: 'You are a systematic problem solver. Break down complex problems into manageable steps and provide clear, actionable solutions.'
    }
  ]

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-40 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Conversation Settings</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Basic Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => handleSettingChange('title', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Conversation title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={settings.description}
              onChange={(e) => handleSettingChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional description"
            />
          </div>
        </div>

        {/* Model Parameters */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Model Parameters
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {settings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Focused</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              min="1"
              max="8192"
              value={settings.maxTokens}
              onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum length of AI responses
            </p>
          </div>

          <button
            onClick={resetToDefaults}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Reset to defaults
          </button>
        </div>

        {/* System Prompt */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            System Prompt
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions
            </label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Tell the AI how to behave, what role to play, or specific instructions..."
            />
          </div>

          {/* Preset Prompts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="space-y-2">
              {presetPrompts.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSettingChange('systemPrompt', preset.prompt)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {preset.name}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {preset.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add tag"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          {settings.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSettingChange('isFavorite', !settings.isFavorite)}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                settings.isFavorite
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-4 h-4 ${settings.isFavorite ? 'fill-current' : ''}`} />
              <span className="text-sm">Favorite</span>
            </button>

            <button
              onClick={() => handleSettingChange('isArchived', !settings.isArchived)}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                settings.isArchived
                  ? 'bg-gray-50 border-gray-300 text-gray-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span className="text-sm">Archive</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <h3 className="font-medium text-red-600 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </h3>

          <button className="w-full flex items-center gap-2 p-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete Conversation</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isModified || saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}