'use client'

import { useState, useEffect } from 'react'
import { Activity, Clock, CheckCircle, AlertCircle, Zap, TrendingUp } from 'lucide-react'

interface ProcessingStats {
  totalDocuments: number
  processing: number
  completed: number
  failed: number
  avgProcessingTime: number
  totalTextExtracted: number
  avgConfidence: number
}

interface QueueItem {
  id: string
  filename: string
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number
  estimatedTime?: number
}

const mockStats: ProcessingStats = {
  totalDocuments: 127,
  processing: 2,
  completed: 118,
  failed: 7,
  avgProcessingTime: 45, // seconds
  totalTextExtracted: 85432, // characters
  avgConfidence: 0.92
}

const mockQueue: QueueItem[] = [
  {
    id: '1',
    filename: 'contract_draft.pdf',
    status: 'PROCESSING',
    progress: 65,
    estimatedTime: 30
  },
  {
    id: '2',
    filename: 'receipt_store.jpg',
    status: 'QUEUED',
    progress: 0,
    estimatedTime: 15
  }
]

export function ProcessingStatus() {
  const [stats, setStats] = useState<ProcessingStats>(mockStats)
  const [queue, setQueue] = useState<QueueItem[]>(mockQueue)
  const [isExpanded, setIsExpanded] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQueue(prev => prev.map(item => {
        if (item.status === 'PROCESSING') {
          const newProgress = Math.min(item.progress + Math.random() * 10, 100)
          const newEstimatedTime = Math.max((item.estimatedTime || 0) - 5, 0)
          
          if (newProgress >= 100) {
            return {
              ...item,
              status: 'COMPLETED' as const,
              progress: 100,
              estimatedTime: 0
            }
          }
          
          return {
            ...item,
            progress: newProgress,
            estimatedTime: newEstimatedTime
          }
        }
        return item
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'PROCESSING':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'QUEUED':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Processing Status</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Processing</p>
                <p className="text-lg font-bold text-blue-600">{stats.processing}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">Completed</p>
                <p className="text-lg font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Detailed Stats */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Total Documents</span>
                <span className="font-medium">{stats.totalDocuments}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">
                  {Math.round((stats.completed / stats.totalDocuments) * 100)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Avg Processing Time</span>
                <span className="font-medium">{formatTime(stats.avgProcessingTime)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Avg OCR Confidence</span>
                <span className="font-medium">{Math.round(stats.avgConfidence * 100)}%</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Text Extracted</span>
                <span className="font-medium">{stats.totalTextExtracted.toLocaleString()} chars</span>
              </div>
            </div>

            {/* Performance Indicator */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">System Performance</p>
                  <p className="text-xs text-gray-600">Running optimally - all systems operational</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Queue */}
      {queue.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Current Queue</h4>
          <div className="space-y-3">
            {queue.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {item.filename}
                    </span>
                  </div>
                  {item.estimatedTime && item.estimatedTime > 0 && (
                    <span className="text-xs text-gray-500">
                      ~{formatTime(item.estimatedTime)} remaining
                    </span>
                  )}
                </div>
                
                {item.status === 'PROCESSING' && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(item.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {item.status === 'QUEUED' && (
                  <div className="text-xs text-gray-500">
                    Waiting in queue...
                  </div>
                )}
                
                {item.status === 'COMPLETED' && (
                  <div className="text-xs text-green-600">
                    Processing completed successfully
                  </div>
                )}
                
                {item.status === 'FAILED' && (
                  <div className="text-xs text-red-600">
                    Processing failed - click to retry
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-900">Recent Activity</h4>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-gray-600 flex justify-between">
            <span>invoice_001.pdf completed</span>
            <span>2 min ago</span>
          </div>
          <div className="text-xs text-gray-600 flex justify-between">
            <span>receipt_grocery.jpg completed</span>
            <span>5 min ago</span>
          </div>
          <div className="text-xs text-gray-600 flex justify-between">
            <span>form_application.png failed</span>
            <span>8 min ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}