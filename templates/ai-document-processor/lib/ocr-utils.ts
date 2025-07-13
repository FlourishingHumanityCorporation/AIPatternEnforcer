import { PrismaClient } from '@prisma/client'

// OCR processing utilities
export interface OCRResult {
  text: string
  confidence: number
  words: Array<{
    text: string
    confidence: number
    bbox: {
      x0: number
      y0: number
      x1: number
      y1: number
    }
  }>
  lines: Array<{
    text: string
    confidence: number
    bbox: {
      x0: number
      y0: number
      x1: number
      y1: number
    }
  }>
}

export interface ProcessingOptions {
  language: string
  documentType: string
  extractStructuredData: boolean
  generateSummary: boolean
  detectHandwriting: boolean
}

export interface DocumentMetrics {
  processingTime: number
  fileSize: number
  pageCount: number
  textLength: number
  confidence: number
  errorRate: number
}

// Database connection singleton
let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  prisma = global.__prisma
}

export { prisma }

// File type validation
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/bmp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const

export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.tiff',
  '.tif',
  '.bmp',
  '.gif',
  '.doc',
  '.docx'
] as const

export function validateFileType(file: File): boolean {
  return ALLOWED_MIME_TYPES.includes(file.type as any)
}

export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'))
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function isPDFFile(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}

export function isWordFile(mimeType: string): boolean {
  return mimeType.includes('word') || mimeType.includes('document')
}

// Text processing utilities
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
    'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopWords.has(word) &&
      !/^\d+$/.test(word) // Exclude pure numbers
    )

  const frequency: { [key: string]: number } = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
}

export function extractEntities(text: string) {
  // Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const emails = Array.from(text.matchAll(emailRegex), m => m[0])

  // Phone numbers (various formats)
  const phoneRegex = /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g
  const phones = Array.from(text.matchAll(phoneRegex), m => m[0])

  // Currency amounts
  const amountRegex = /\$[\d,]+\.?\d*/g
  const amounts = Array.from(text.matchAll(amountRegex), m => m[0])

  // Dates (MM/DD/YYYY, DD/MM/YYYY, Month DD, YYYY)
  const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})\b/g
  const dates = Array.from(text.matchAll(dateRegex), m => m[0])

  // URLs
  const urlRegex = /https?:\/\/[^\s]+/g
  const urls = Array.from(text.matchAll(urlRegex), m => m[0])

  // Social Security Numbers (XXX-XX-XXXX)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g
  const ssns = Array.from(text.matchAll(ssnRegex), m => m[0])

  // ZIP codes
  const zipRegex = /\b\d{5}(-\d{4})?\b/g
  const zipCodes = Array.from(text.matchAll(zipRegex), m => m[0])

  return {
    emails: [...new Set(emails)],
    phones: [...new Set(phones)],
    amounts: [...new Set(amounts)],
    dates: [...new Set(dates)],
    urls: [...new Set(urls)],
    ssns: [...new Set(ssns)],
    zipCodes: [...new Set(zipCodes)]
  }
}

export function detectDocumentType(text: string): string {
  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\s+/)
  
  // Define keyword patterns for different document types
  const patterns = {
    invoice: ['invoice', 'bill to', 'billing', 'payment terms', 'due date', 'total amount'],
    receipt: ['receipt', 'total paid', 'payment method', 'cash', 'credit card', 'change'],
    contract: ['contract', 'agreement', 'terms and conditions', 'party', 'obligations', 'signature'],
    form: ['application', 'form', 'please fill', 'date of birth', 'social security', 'signature'],
    tax: ['tax return', 'irs', 'form 1040', 'taxable income', 'refund', 'w-2'],
    legal: ['legal', 'court', 'plaintiff', 'defendant', 'whereas', 'therefore'],
    medical: ['patient', 'diagnosis', 'prescription', 'doctor', 'hospital', 'medical'],
    financial: ['bank statement', 'balance', 'transaction', 'deposit', 'withdrawal', 'account']
  }

  const scores: { [key: string]: number } = {}
  
  for (const [type, keywords] of Object.entries(patterns)) {
    scores[type] = keywords.reduce((score, keyword) => {
      const occurrences = (lowerText.match(new RegExp(keyword, 'g')) || []).length
      return score + occurrences
    }, 0)
  }

  // Find the type with the highest score
  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return 'unknown'

  const detectedType = Object.entries(scores).find(([, score]) => score === maxScore)?.[0]
  return detectedType || 'unknown'
}

export function calculateConfidenceScore(ocrResult: OCRResult): number {
  if (!ocrResult.words || ocrResult.words.length === 0) return 0

  const wordConfidences = ocrResult.words.map(word => word.confidence)
  const avgConfidence = wordConfidences.reduce((sum, conf) => sum + conf, 0) / wordConfidences.length

  // Normalize confidence score (Tesseract returns 0-100, we want 0-1)
  return Math.min(Math.max(avgConfidence / 100, 0), 1)
}

export function generateTextChunks(text: string, chunkSize: number = 1000): string[] {
  if (text.length <= chunkSize) return [text]

  const chunks: string[] = []
  const words = text.split(/\s+/)
  let currentChunk = ''

  for (const word of words) {
    if ((currentChunk + word).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = word + ' '
    } else {
      currentChunk += word + ' '
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

export function sanitizeFilename(filename: string): string {
  // Remove or replace unsafe characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function calculateProcessingMetrics(
  startTime: Date,
  endTime: Date,
  fileSize: number,
  textLength: number,
  confidence: number
): DocumentMetrics {
  const processingTime = endTime.getTime() - startTime.getTime()
  
  return {
    processingTime,
    fileSize,
    pageCount: 1, // Will be updated based on actual pages
    textLength,
    confidence,
    errorRate: 1 - confidence
  }
}

// Simple text-based summary generation
export function generateSimpleSummary(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text

  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  if (sentences.length <= 2) {
    return text.substring(0, maxLength) + '...'
  }

  // Take first and last sentence, or first two sentences
  let summary = sentences[0].trim()
  
  if (summary.length < maxLength * 0.7 && sentences.length > 1) {
    const lastSentence = sentences[sentences.length - 1].trim()
    if ((summary + '. ' + lastSentence).length <= maxLength) {
      summary += '. ' + lastSentence
    } else if (sentences.length > 1) {
      const secondSentence = sentences[1].trim()
      if ((summary + '. ' + secondSentence).length <= maxLength) {
        summary += '. ' + secondSentence
      }
    }
  }

  return summary + (summary.endsWith('.') ? '' : '.')
}