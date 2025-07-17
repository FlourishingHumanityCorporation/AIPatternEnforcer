'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  error?: string
}

export function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Simulate upload and processing
    newFiles.forEach(uploadedFile => {
      simulateUploadAndProcess(uploadedFile.id)
    })
  }, [])

  const simulateUploadAndProcess = async (fileId: string) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress } : f)
      )
    }

    // Start processing
    setUploadedFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, status: 'processing', progress: 0 } : f)
    )

    // Simulate OCR processing
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress } : f)
      )
    }

    // Complete processing
    const success = Math.random() > 0.1 // 90% success rate
    if (success) {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f)
      )
      toast.success('Document processed successfully!')
    } else {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? 
          { ...f, status: 'failed', error: 'OCR processing failed' } : f
        )
      )
      toast.error('Document processing failed')
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const retryFile = (fileId: string) => {
    setUploadedFiles(prev => 
      prev.map(f => f.id === fileId ? 
        { ...f, status: 'uploading', progress: 0, error: undefined } : f
      )
    )
    simulateUploadAndProcess(fileId)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop files here' : 'Upload documents for OCR'}
          </p>
          <p className="text-sm text-gray-500">
            Drag and drop files here, or click to select
          </p>
          <p className="text-xs text-gray-400">
            Supports: PDF, Images (PNG, JPG, TIFF), Word documents
          </p>
          <p className="text-xs text-gray-400">
            Maximum file size: 10MB
          </p>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Processing Queue
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map(uploadedFile => (
              <div
                key={uploadedFile.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <File className="h-8 w-8 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Status */}
                    <div className="flex items-center space-x-2 mt-1">
                      {uploadedFile.status === 'uploading' && (
                        <span className="text-xs text-blue-600">Uploading...</span>
                      )}
                      {uploadedFile.status === 'processing' && (
                        <span className="text-xs text-yellow-600">Processing OCR...</span>
                      )}
                      {uploadedFile.status === 'completed' && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Completed</span>
                        </div>
                      )}
                      {uploadedFile.status === 'failed' && (
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3 text-red-600" />
                          <span className="text-xs text-red-600">
                            {uploadedFile.error || 'Failed'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {uploadedFile.status === 'failed' && (
                    <button
                      onClick={() => retryFile(uploadedFile.id)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OCR Settings */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          OCR Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
              <option value="deu">German</option>
              <option value="auto">Auto-detect</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="auto">Auto-detect</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="contract">Contract</option>
              <option value="form">Form</option>
              <option value="handwritten">Handwritten</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 mr-2" defaultChecked />
            <span className="text-sm text-gray-700">Extract structured data</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 mr-2" defaultChecked />
            <span className="text-sm text-gray-700">Generate summary</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 mr-2" />
            <span className="text-sm text-gray-700">Detect handwriting</span>
          </label>
        </div>
      </div>
    </div>
  )
}