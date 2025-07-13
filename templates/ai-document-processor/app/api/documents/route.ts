import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const documentType = searchParams.get('documentType')
    const sortBy = searchParams.get('sortBy') || 'uploadedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (documentType && documentType !== 'all') {
      where.documentType = documentType
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Get documents with pagination
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              pages: true,
              extractions: true
            }
          }
        }
      }),
      prisma.document.count({ where })
    ])

    return NextResponse.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        processedAt: doc.processedAt,
        ocrConfidence: doc.ocrConfidence,
        documentType: doc.documentType,
        pageCount: doc.pageCount,
        thumbnailUrl: doc.thumbnailUrl,
        error: doc.error,
        extractionCount: doc._count.extractions,
        pageCount: doc._count.pages || doc.pageCount
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json({ 
        error: 'Document ID is required' 
      }, { status: 400 })
    }

    // Delete document and related records (cascade deletes will handle pages, extractions, etc.)
    await prisma.document.delete({
      where: { id: documentId }
    })

    // TODO: Also delete physical files from disk

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}