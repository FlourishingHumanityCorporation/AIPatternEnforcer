'use client'

import { useState, useEffect } from 'react'
import { File, FileText, Image as ImageIcon, Calendar, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Document {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  uploadedAt: string
  processedAt?: string
  ocrConfidence?: number
  documentType?: string
  pageCount?: number
  thumbnailUrl?: string
}

interface DocumentListProps {
  onSelectDocument: (documentId: string) => void
  selectedDocument: string | null
}

// Mock data for demonstration
const mockDocuments: Document[] = [
  {
    id: '1',
    filename: 'invoice_001.pdf',
    originalName: 'Company Invoice #001.pdf',
    mimeType: 'application/pdf',
    size: 245760,
    status: 'COMPLETED',
    uploadedAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T10:32:15Z',
    ocrConfidence: 0.95,
    documentType: 'invoice',
    pageCount: 2,
    thumbnailUrl: '/api/documents/1/thumbnail'
  },
  {
    id: '2',
    filename: 'receipt_grocery.jpg',
    originalName: 'Grocery Receipt.jpg',
    mimeType: 'image/jpeg',
    size: 156432,
    status: 'COMPLETED',
    uploadedAt: '2024-01-15T09:15:00Z',
    processedAt: '2024-01-15T09:16:45Z',
    ocrConfidence: 0.88,
    documentType: 'receipt',
    pageCount: 1,
    thumbnailUrl: '/api/documents/2/thumbnail'
  },
  {
    id: '3',
    filename: 'contract_draft.pdf',
    originalName: 'Service Contract Draft.pdf',
    mimeType: 'application/pdf',
    size: 512000,
    status: 'PROCESSING',
    uploadedAt: '2024-01-15T11:00:00Z',
    documentType: 'contract',
    pageCount: 5
  },
  {
    id: '4',
    filename: 'form_application.png',
    originalName: 'Application Form.png',
    mimeType: 'image/png',
    size: 89756,
    status: 'FAILED',
    uploadedAt: '2024-01-15T08:45:00Z',
    documentType: 'form',
    pageCount: 1
  }
]

export function DocumentList({ onSelectDocument, selectedDocument }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [filter, setFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all')
  const [sortBy, setSortBy] = useState<'uploadedAt' | 'filename' | 'size'>('uploadedAt')

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true
    return doc.status.toLowerCase() === filter
  })

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'filename':
        return a.filename.localeCompare(b.filename)
      case 'size':
        return b.size - a.size
      case 'uploadedAt':
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    }
  })

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Documents</h3>
          <span className="text-sm text-gray-500">{documents.length} total</span>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-4">
          {(['all', 'completed', 'processing', 'failed'] as const).map(filterOption => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                filter === filterOption
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              {filterOption !== 'all' && (
                <span className="ml-1">
                  ({documents.filter(d => d.status.toLowerCase() === filterOption).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full text-sm border border-gray-300 rounded-md px-3 py-1"
        >
          <option value="uploadedAt">Sort by date</option>
          <option value="filename">Sort by name</option>
          <option value="size">Sort by size</option>
        </select>
      </div>

      {/* Document List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents found</p>
            <p className="text-sm">Upload some documents to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedDocuments.map(document => (
              <div
                key={document.id}
                onClick={() => onSelectDocument(document.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedDocument === document.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* File Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getFileIcon(document.mimeType)}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {document.originalName}
                      </h4>
                      {getStatusIcon(document.status)}
                    </div>

                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(document.size)}</span>
                      {document.pageCount && (
                        <span>{document.pageCount} page{document.pageCount > 1 ? 's' : ''}</span>
                      )}
                      <span>{formatDate(document.uploadedAt)}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                        {document.status}
                      </span>
                      
                      {document.ocrConfidence && (
                        <span className="text-xs text-gray-500">
                          {Math.round(document.ocrConfidence * 100)}% confidence
                        </span>
                      )}
                    </div>

                    {/* Document Type */}
                    {document.documentType && (
                      <div className="mt-1">
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {document.documentType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}