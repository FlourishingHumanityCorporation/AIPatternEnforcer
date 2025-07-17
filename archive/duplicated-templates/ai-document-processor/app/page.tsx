'use client'

import { useState } from 'react'
import { DocumentUpload } from '@/components/ocr/document-upload'
import { DocumentList } from '@/components/ocr/document-list'
import { ProcessingStatus } from '@/components/ocr/processing-status'
import { DocumentViewer } from '@/components/ocr/document-viewer'
import { SearchAndFilter } from '@/components/ocr/search-and-filter'
import { FileText, Upload, Search, Settings } from 'lucide-react'

export default function OCRDashboard() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [view, setView] = useState<'upload' | 'documents' | 'search'>('upload')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  OCR Document Processor
                </h1>
                <p className="text-sm text-gray-500">
                  AI-powered document analysis and text extraction
                </p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              <button
                onClick={() => setView('upload')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </button>
              <button
                onClick={() => setView('documents')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'documents'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </button>
              <button
                onClick={() => setView('search')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'search'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Navigation/Actions */}
          <div className="lg:col-span-1">
            {view === 'upload' && (
              <div className="space-y-6">
                <DocumentUpload />
                <ProcessingStatus />
              </div>
            )}
            
            {view === 'documents' && (
              <DocumentList
                onSelectDocument={setSelectedDocument}
                selectedDocument={selectedDocument}
              />
            )}
            
            {view === 'search' && (
              <SearchAndFilter onSelectDocument={setSelectedDocument} />
            )}
          </div>

          {/* Right Panel - Document Viewer */}
          <div className="lg:col-span-2">
            {selectedDocument ? (
              <DocumentViewer documentId={selectedDocument} />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400">
                  <FileText className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No document selected
                  </h3>
                  <p className="text-gray-500">
                    {view === 'upload'
                      ? 'Upload a document to get started with OCR processing'
                      : 'Select a document to view its content and analysis'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quick Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <div className="flex space-x-6">
            <span>Total Documents: <span className="font-medium">0</span></span>
            <span>Processing: <span className="font-medium">0</span></span>
            <span>Completed: <span className="font-medium">0</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>OCR Engine: Tesseract.js</span>
          </div>
        </div>
      </div>
    </div>
  )
}