'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  File, 
  Download, 
  Share, 
  Copy, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Eye,
  FileText,
  BarChart3,
  Search,
  Highlight
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DocumentViewerProps {
  documentId: string
}

interface DocumentData {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  status: string
  uploadedAt: string
  processedAt?: string
  extractedText?: string
  ocrConfidence?: number
  language?: string
  documentType?: string
  pageCount?: number
  keywords?: string[]
  entities?: any
  summary?: string
  pages?: DocumentPage[]
}

interface DocumentPage {
  pageNumber: number
  imageUrl: string
  extractedText: string
  ocrConfidence: number
  boundingBoxes?: any[]
}

const mockDocument: DocumentData = {
  id: '1',
  filename: 'invoice_001.pdf',
  originalName: 'Company Invoice #001.pdf',
  mimeType: 'application/pdf',
  size: 245760,
  status: 'COMPLETED',
  uploadedAt: '2024-01-15T10:30:00Z',
  processedAt: '2024-01-15T10:32:15Z',
  extractedText: `INVOICE #INV-2024-001

ABC Company Inc.
123 Business Street
New York, NY 10001
Phone: (555) 123-4567
Email: billing@abccompany.com

Bill To:
XYZ Corporation
456 Client Avenue
Los Angeles, CA 90210

Invoice Date: January 15, 2024
Due Date: February 15, 2024
Payment Terms: Net 30

DESCRIPTION                QTY    RATE      AMOUNT
Web Development Services    40    $125.00   $5,000.00
UI/UX Design               20    $100.00   $2,000.00
Project Management         10    $150.00   $1,500.00

                          SUBTOTAL:  $8,500.00
                          TAX (8.5%): $722.50
                          TOTAL:     $9,222.50

Payment Instructions:
Please remit payment within 30 days of invoice date.
Make checks payable to ABC Company Inc.

Thank you for your business!`,
  ocrConfidence: 0.95,
  language: 'en',
  documentType: 'invoice',
  pageCount: 1,
  keywords: ['invoice', 'payment', 'ABC Company', 'XYZ Corporation', 'web development'],
  summary: 'Invoice #INV-2024-001 from ABC Company Inc. to XYZ Corporation for web development services totaling $9,222.50, due February 15, 2024.',
  entities: {
    companies: ['ABC Company Inc.', 'XYZ Corporation'],
    amounts: ['$5,000.00', '$2,000.00', '$1,500.00', '$9,222.50'],
    dates: ['January 15, 2024', 'February 15, 2024'],
    emails: ['billing@abccompany.com'],
    phones: ['(555) 123-4567']
  },
  pages: [
    {
      pageNumber: 1,
      imageUrl: '/api/documents/1/pages/1/image',
      extractedText: `INVOICE #INV-2024-001\n\nABC Company Inc.\n123 Business Street...`,
      ocrConfidence: 0.95
    }
  ]
}

export function DocumentViewer({ documentId }: DocumentViewerProps) {
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'text' | 'data' | 'analysis'>('preview')
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedText, setHighlightedText] = useState('')

  useEffect(() => {
    // Simulate API call
    setDocument(mockDocument)
  }, [documentId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadDocument = () => {
    toast.success('Download started!')
  }

  const shareDocument = () => {
    if (navigator.share) {
      navigator.share({
        title: document?.originalName,
        text: document?.summary,
        url: window.location.href
      })
    } else {
      copyToClipboard(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const highlightText = (text: string, term: string) => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  if (!document) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {document.originalName}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{document.documentType}</span>
                <span>•</span>
                <span>{document.pageCount} page{document.pageCount !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{Math.round((document.ocrConfidence || 0) * 100)}% confidence</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(document.extractedText || '')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Copy text"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={downloadDocument}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={shareDocument}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Share"
            >
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'text', label: 'Extracted Text', icon: FileText },
            { id: 'data', label: 'Structured Data', icon: BarChart3 },
            { id: 'analysis', label: 'Analysis', icon: Search }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'preview' && (
          <div className="space-y-4">
            {/* Preview Controls */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={() => setRotation((rotation + 90) % 360)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            </div>

            {/* Document Preview */}
            <div className="border rounded-lg overflow-hidden bg-gray-100 min-h-[400px] flex items-center justify-center">
              {document.pages && document.pages[0] ? (
                <div 
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s'
                  }}
                >
                  <Image
                    src={document.pages[0].imageUrl}
                    alt={`Page 1 of ${document.originalName}`}
                    width={800}
                    height={600}
                    className="max-w-full h-auto"
                    onError={(e) => {
                      // Show fallback when image fails to load
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <File className="h-16 w-16 mx-auto mb-4" />
                  <p>Preview not available</p>
                  <p className="text-sm">This document type doesn&apos;t support preview</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in extracted text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Extracted Text */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre 
                className="whitespace-pre-wrap text-sm font-mono leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: searchTerm 
                    ? highlightText(document.extractedText || '', searchTerm)
                    : document.extractedText || 'No text extracted'
                }}
              />
            </div>

            {/* Text Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-lg font-bold text-blue-600">
                  {(document.extractedText || '').length}
                </p>
                <p className="text-sm text-blue-800">Characters</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-lg font-bold text-green-600">
                  {(document.extractedText || '').split(/\s+/).length}
                </p>
                <p className="text-sm text-green-800">Words</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-lg font-bold text-purple-600">
                  {(document.extractedText || '').split('\n').length}
                </p>
                <p className="text-sm text-purple-800">Lines</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Entities */}
            {document.entities && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Extracted Entities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(document.entities).map(([type, values]) => (
                    <div key={type} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 capitalize mb-2">{type}</h4>
                      <div className="space-y-1">
                        {(values as string[]).map((value, index) => (
                          <span
                            key={index}
                            className="inline-block bg-white px-2 py-1 rounded text-sm text-gray-700 mr-2 mb-1"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {document.keywords && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {document.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Document Metadata</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Language</dt>
                    <dd className="text-sm text-gray-900">{document.language || 'Not detected'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Document Type</dt>
                    <dd className="text-sm text-gray-900">{document.documentType || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">OCR Confidence</dt>
                    <dd className="text-sm text-gray-900">
                      {Math.round((document.ocrConfidence || 0) * 100)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Processing Time</dt>
                    <dd className="text-sm text-gray-900">
                      {document.processedAt && document.uploadedAt
                        ? `${Math.round((new Date(document.processedAt).getTime() - new Date(document.uploadedAt).getTime()) / 1000)}s`
                        : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Summary */}
            {document.summary && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">AI Summary</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700">{document.summary}</p>
                </div>
              </div>
            )}

            {/* Quality Analysis */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quality Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Math.round((document.ocrConfidence || 0) * 100)}%
                  </div>
                  <div className="text-sm text-green-800">OCR Confidence</div>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(document.ocrConfidence || 0) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {document.extractedText ? Math.min(100, Math.round((document.extractedText.length / 1000) * 100)) : 0}%
                  </div>
                  <div className="text-sm text-blue-800">Text Density</div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${document.extractedText ? Math.min(100, Math.round((document.extractedText.length / 1000) * 100)) : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {document.keywords ? Math.min(100, document.keywords.length * 20) : 0}%
                  </div>
                  <div className="text-sm text-purple-800">Structure Recognition</div>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ 
                        width: `${document.keywords ? Math.min(100, document.keywords.length * 20) : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
              <div className="bg-yellow-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  {(document.ocrConfidence || 0) < 0.8 && (
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      Consider rescanning at higher resolution for better text recognition
                    </li>
                  )}
                  {(document.extractedText?.length || 0) < 100 && (
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      Document appears to have minimal text content
                    </li>
                  )}
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Document processed successfully with good quality results
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}