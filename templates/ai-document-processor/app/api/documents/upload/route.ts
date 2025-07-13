import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'
import Tesseract from 'tesseract.js'
import sharp from 'sharp'
import { PDFExtract } from 'pdf.js-extract'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const language = formData.get('language') as string || 'eng'
    const documentType = formData.get('documentType') as string || 'auto'
    const extractStructuredData = formData.get('extractStructuredData') === 'true'
    const generateSummary = formData.get('generateSummary') === 'true'
    const detectHandwriting = formData.get('detectHandwriting') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png', 
      'image/tiff',
      'image/bmp',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Unsupported file type. Please upload PDF, image, or Word document.' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileId = uuidv4()
    const fileExtension = file.name.split('.').pop()
    const filename = `${fileId}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Create database record
    const document = await prisma.document.create({
      data: {
        id: fileId,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${filename}`,
        status: 'PENDING'
      }
    })

    // Create processing job
    await prisma.processingJob.create({
      data: {
        documentId: fileId,
        ocrOptions: {
          language,
          documentType,
          extractStructuredData,
          generateSummary,
          detectHandwriting
        },
        extractTypes: extractStructuredData ? ['TEXT', 'TABLE', 'FORM_FIELD'] : ['TEXT']
      }
    })

    // Start processing asynchronously
    processDocument(fileId, filepath, file.type, {
      language,
      documentType,
      extractStructuredData,
      generateSummary,
      detectHandwriting
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        originalName: document.originalName,
        status: document.status,
        uploadedAt: document.uploadedAt
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during upload' 
    }, { status: 500 })
  }
}

async function processDocument(
  documentId: string, 
  filepath: string, 
  mimeType: string,
  options: {
    language: string
    documentType: string
    extractStructuredData: boolean
    generateSummary: boolean
    detectHandwriting: boolean
  }
) {
  try {
    // Update job status to processing
    await prisma.processingJob.update({
      where: { documentId },
      data: { 
        status: 'PROCESSING',
        startedAt: new Date()
      }
    })

    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' }
    })

    let extractedText = ''
    let ocrConfidence = 0
    let pageCount = 1
    const pages: any[] = []

    if (mimeType === 'application/pdf') {
      // Process PDF
      const result = await processPDF(filepath, options)
      extractedText = result.text
      ocrConfidence = result.confidence
      pageCount = result.pageCount
      pages.push(...result.pages)
    } else if (mimeType.startsWith('image/')) {
      // Process image
      const result = await processImage(filepath, options)
      extractedText = result.text
      ocrConfidence = result.confidence
      pages.push(result.page)
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`)
    }

    // Generate thumbnail
    const thumbnailUrl = await generateThumbnail(filepath, documentId, mimeType)

    // Extract keywords and entities
    const keywords = extractKeywords(extractedText)
    const entities = extractEntities(extractedText)

    // Generate summary if requested
    let summary = null
    if (options.generateSummary && extractedText.length > 100) {
      summary = await generateSummary(extractedText)
    }

    // Detect document type if auto
    let detectedType = options.documentType
    if (detectedType === 'auto') {
      detectedType = detectDocumentType(extractedText)
    }

    // Update document with results
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        extractedText,
        ocrConfidence,
        language: options.language,
        pageCount,
        summary,
        keywords,
        entities,
        documentType: detectedType,
        thumbnailUrl
      }
    })

    // Create document pages
    for (const page of pages) {
      await prisma.documentPage.create({
        data: {
          documentId,
          pageNumber: page.pageNumber,
          imageUrl: page.imageUrl,
          extractedText: page.text,
          ocrConfidence: page.confidence,
          boundingBoxes: page.boundingBoxes
        }
      })
    }

    // Update job status
    await prisma.processingJob.update({
      where: { documentId },
      data: { 
        status: 'COMPLETED',
        completedAt: new Date(),
        progress: 100
      }
    })

    console.log(`Document ${documentId} processed successfully`)

  } catch (error) {
    console.error(`Processing error for document ${documentId}:`, error)

    // Update document and job status to failed
    await Promise.all([
      prisma.document.update({
        where: { id: documentId },
        data: { 
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }),
      prisma.processingJob.update({
        where: { documentId },
        data: { 
          status: 'FAILED',
          statusMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    ])
  }
}

async function processImage(filepath: string, options: any) {
  // Convert image to format suitable for OCR
  const processedImagePath = filepath.replace(/\.[^/.]+$/, '_processed.png')
  await sharp(filepath)
    .png()
    .resize(null, 2000, { withoutEnlargement: true })
    .sharpen()
    .normalise()
    .writeToFile(processedImagePath)

  // Perform OCR
  const { data } = await Tesseract.recognize(processedImagePath, options.language, {
    logger: m => {
      if (m.status === 'recognizing text') {
        // Update progress in database
        const progress = Math.round(m.progress * 100)
        prisma.processingJob.update({
          where: { documentId: options.documentId },
          data: { progress }
        }).catch(console.error)
      }
    }
  })

  return {
    text: data.text,
    confidence: data.confidence / 100,
    page: {
      pageNumber: 1,
      imageUrl: `/api/documents/${options.documentId}/pages/1/image`,
      text: data.text,
      confidence: data.confidence / 100,
      boundingBoxes: data.words.map(word => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox
      }))
    }
  }
}

async function processPDF(filepath: string, options: any) {
  // For now, return mock data
  // In a real implementation, you would:
  // 1. Convert PDF pages to images
  // 2. Run OCR on each page
  // 3. Combine results
  
  return {
    text: 'PDF processing not fully implemented in this demo',
    confidence: 0.9,
    pageCount: 1,
    pages: [{
      pageNumber: 1,
      imageUrl: `/api/documents/${options.documentId}/pages/1/image`,
      text: 'PDF processing not fully implemented in this demo',
      confidence: 0.9,
      boundingBoxes: []
    }]
  }
}

async function generateThumbnail(filepath: string, documentId: string, mimeType: string) {
  const thumbnailsDir = join(process.cwd(), 'uploads', 'thumbnails')
  await mkdir(thumbnailsDir, { recursive: true })
  
  const thumbnailPath = join(thumbnailsDir, `${documentId}_thumb.jpg`)
  
  if (mimeType.startsWith('image/')) {
    await sharp(filepath)
      .resize(200, 300, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath)
  }
  
  return `/uploads/thumbnails/${documentId}_thumb.jpg`
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  const frequency: { [key: string]: number } = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

function extractEntities(text: string) {
  // Simple entity extraction patterns
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
  const amountRegex = /\$[\d,]+\.?\d*/g
  const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g
  
  return {
    emails: text.match(emailRegex) || [],
    phones: text.match(phoneRegex) || [],
    amounts: text.match(amountRegex) || [],
    dates: text.match(dateRegex) || []
  }
}

function detectDocumentType(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('invoice') || lowerText.includes('bill to')) return 'invoice'
  if (lowerText.includes('receipt') || lowerText.includes('total paid')) return 'receipt'
  if (lowerText.includes('contract') || lowerText.includes('agreement')) return 'contract'
  if (lowerText.includes('application') || lowerText.includes('form')) return 'form'
  
  return 'unknown'
}

async function generateSummary(text: string): Promise<string> {
  // Simple extractive summary - take first and last sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length <= 2) return text
  
  return `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`
}