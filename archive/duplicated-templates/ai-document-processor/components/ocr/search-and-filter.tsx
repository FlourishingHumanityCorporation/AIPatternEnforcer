'use client'

import { useState } from 'react'
import { Search, Filter, Calendar, FileText, Tag, SortAsc, SortDesc } from 'lucide-react'

interface SearchAndFilterProps {
  onSelectDocument: (documentId: string) => void
}

interface SearchResult {
  id: string
  filename: string
  originalName: string
  documentType: string
  extractedText: string
  uploadedAt: string
  ocrConfidence: number
  matchType: 'filename' | 'content' | 'metadata'
  matchSnippet: string
  relevanceScore: number
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    filename: 'invoice_001.pdf',
    originalName: 'Company Invoice #001.pdf',
    documentType: 'invoice',
    extractedText: 'INVOICE #INV-2024-001 ABC Company Inc. Total: $9,222.50',
    uploadedAt: '2024-01-15T10:30:00Z',
    ocrConfidence: 0.95,
    matchType: 'content',
    matchSnippet: '...ABC Company Inc. 123 Business Street New York, NY 10001...',
    relevanceScore: 0.92
  },
  {
    id: '2',
    filename: 'receipt_grocery.jpg',
    originalName: 'Grocery Receipt.jpg',
    documentType: 'receipt',
    extractedText: 'GROCERY STORE Receipt #12345 Total: $45.67',
    uploadedAt: '2024-01-15T09:15:00Z',
    ocrConfidence: 0.88,
    matchType: 'filename',
    matchSnippet: 'Grocery Receipt.jpg',
    relevanceScore: 0.85
  }
]

export function SearchAndFilter({ onSelectDocument }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState({
    documentType: 'all',
    dateRange: 'all',
    confidenceMin: 0,
    sortBy: 'relevance',
    sortOrder: 'desc'
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate API search delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Filter mock results based on query
    const filteredResults = mockSearchResults.filter(result =>
      result.originalName.toLowerCase().includes(query.toLowerCase()) ||
      result.extractedText.toLowerCase().includes(query.toLowerCase()) ||
      result.documentType.toLowerCase().includes(query.toLowerCase())
    )
    
    setResults(filteredResults)
    setIsSearching(false)
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    // Re-apply filters to current results
    applyFilters(results)
  }

  const applyFilters = (searchResults: SearchResult[]) => {
    let filtered = [...searchResults]

    // Document type filter
    if (filters.documentType !== 'all') {
      filtered = filtered.filter(result => result.documentType === filters.documentType)
    }

    // Confidence filter
    filtered = filtered.filter(result => result.ocrConfidence >= filters.confidenceMin / 100)

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(result => 
        new Date(result.uploadedAt) >= cutoffDate
      )
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore
          break
        case 'date':
          comparison = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          break
        case 'filename':
          comparison = a.originalName.localeCompare(b.originalName)
          break
        case 'confidence':
          comparison = b.ocrConfidence - a.ocrConfidence
          break
      }
      
      return filters.sortOrder === 'desc' ? comparison : -comparison
    })

    setResults(filtered)
  }

  const getMatchTypeIcon = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'filename':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'content':
        return <Search className="h-4 w-4 text-green-500" />
      case 'metadata':
        return <Tag className="h-4 w-4 text-purple-500" />
    }
  }

  const getMatchTypeLabel = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'filename':
        return 'Filename match'
      case 'content':
        return 'Content match'
      case 'metadata':
        return 'Metadata match'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents, content, or metadata..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handleSearch(e.target.value)
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Advanced Filters</span>
          </div>
          <span className="text-gray-500">
            {showAdvancedFilters ? '−' : '+'}
          </span>
        </button>

        {showAdvancedFilters && (
          <div className="px-4 pb-4 border-t space-y-4">
            {/* Document Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={filters.documentType}
                onChange={(e) => handleFilterChange('documentType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="invoice">Invoice</option>
                <option value="receipt">Receipt</option>
                <option value="contract">Contract</option>
                <option value="form">Form</option>
                <option value="handwritten">Handwritten</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            {/* Confidence Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum OCR Confidence: {filters.confidenceMin}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.confidenceMin}
                onChange={(e) => handleFilterChange('confidenceMin', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="filename">Filename</option>
                  <option value="confidence">OCR Confidence</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Search Results
              {results.length > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({results.length} {results.length === 1 ? 'result' : 'results'})
                </span>
              )}
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Searching documents...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents found</p>
                <p className="text-sm">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {results.map(result => (
                  <div
                    key={result.id}
                    onClick={() => onSelectDocument(result.id)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getMatchTypeIcon(result.matchType)}
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {result.originalName}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {getMatchTypeLabel(result.matchType)}
                          </span>
                        </div>

                        <p
                          className="text-sm text-gray-600 mb-2"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(result.matchSnippet, searchQuery)
                          }}
                        />

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{result.documentType}</span>
                          <span>•</span>
                          <span>{formatDate(result.uploadedAt)}</span>
                          <span>•</span>
                          <span>{Math.round(result.ocrConfidence * 100)}% confidence</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {Math.round(result.relevanceScore * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">relevance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Tips */}
      {!searchQuery && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Search Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Search by filename, document content, or metadata</li>
            <li>• Use quotation marks for exact phrases</li>
            <li>• Filter by document type, date, or OCR confidence</li>
            <li>• Sort results by relevance, date, or filename</li>
          </ul>
        </div>
      )}
    </div>
  )
}