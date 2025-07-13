# OCR Document Processor

An AI-powered document analysis and text extraction application built with Next.js, designed for local single-user projects.

## Features

### 📄 Document Processing
- **Multi-format Support**: PDF, images (PNG, JPG, TIFF, BMP, GIF), Word documents
- **OCR Engine**: Tesseract.js for accurate text extraction
- **Batch Processing**: Upload and process multiple documents simultaneously
- **Processing Queue**: Real-time status tracking and progress monitoring

### 🔍 Advanced OCR Capabilities
- **Language Detection**: Support for multiple languages (English, Spanish, French, German)
- **Document Type Classification**: Automatic detection of invoices, receipts, contracts, forms
- **Confidence Scoring**: OCR quality assessment for each document
- **Structured Data Extraction**: Tables, forms, and key-value pairs
- **Handwriting Recognition**: Optional handwritten text detection

### 📊 Analysis & Intelligence
- **AI-Powered Summarization**: Automatic document summaries
- **Entity Extraction**: Emails, phone numbers, dates, amounts
- **Keyword Identification**: Automatic tagging and categorization
- **Search & Filter**: Full-text search across all processed documents
- **Quality Metrics**: Processing time, confidence scores, text density

### 💾 Data Management
- **PostgreSQL Database**: Robust document storage and metadata
- **File Storage**: Organized file system with thumbnails
- **Version Control**: Processing history and audit trails
- **Export Options**: Extract text, download originals, share documents

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- 10GB+ storage space for documents

### Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Set up database**:
```bash
# Configure your DATABASE_URL in .env
cp .env.example .env

# Initialize database
npm run db:push
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open application**:
Navigate to `http://localhost:3000`

## Usage

### Upload Documents
1. Click "Upload" tab in the header
2. Drag and drop files or click to select
3. Configure OCR settings (language, document type, options)
4. Monitor processing in real-time

### View Documents
1. Switch to "Documents" tab
2. Browse processed documents with status indicators
3. Filter by type, date, or processing status
4. Click any document to view details

### Search & Analysis
1. Use "Search" tab for full-text queries
2. Apply filters for document type, confidence, date range
3. Sort results by relevance, date, or filename
4. View extracted entities and structured data

### Document Viewer
- **Preview**: Visual document preview with zoom and rotation
- **Text**: Extracted text with search highlighting
- **Data**: Structured entities, keywords, and metadata
- **Analysis**: Quality metrics, summary, and recommendations

## Configuration

### OCR Settings
Configure processing options in the upload interface:
- **Language**: Target language for OCR (auto-detect available)
- **Document Type**: Optimize processing for specific document types
- **Structured Data**: Extract tables and form fields
- **Summary Generation**: AI-powered document summarization
- **Handwriting Detection**: Process handwritten content

### File Types Supported
- **Images**: PNG, JPG, JPEG, TIFF, BMP, GIF
- **Documents**: PDF, DOC, DOCX
- **Size Limit**: 10MB per file
- **Batch Upload**: Multiple files simultaneously

### Processing Options
- **OCR Engine**: Tesseract.js with multiple language packs
- **Image Preprocessing**: Automatic enhancement for better recognition
- **Quality Assurance**: Confidence scoring and error detection
- **Retry Logic**: Automatic retry for failed processing

## Database Schema

### Core Models
- **Document**: File metadata, processing status, results
- **DocumentPage**: Individual page data for multi-page documents
- **DocumentChunk**: Text chunks for large documents and embeddings
- **Extraction**: Structured data elements (tables, forms, entities)
- **ProcessingJob**: Queue management and progress tracking

### Analytics Models
- **Usage**: Processing metrics and performance tracking
- **AIResponse**: Caching for AI-generated summaries and analysis

## API Endpoints

### Document Management
- `POST /api/documents/upload` - Upload and process documents
- `GET /api/documents` - List documents with filtering and pagination
- `GET /api/documents/[id]` - Get document details
- `DELETE /api/documents/[id]` - Delete document and files

### Search & Query
- `GET /api/search` - Full-text search across documents
- `GET /api/documents/[id]/text` - Get extracted text
- `GET /api/documents/[id]/entities` - Get extracted entities

### Processing
- `GET /api/processing/status` - Get processing queue status
- `POST /api/processing/retry/[id]` - Retry failed processing
- `GET /api/processing/jobs` - List processing jobs

## Development

### Project Structure
```
app/
├── api/               # API routes
│   ├── documents/     # Document management
│   ├── search/        # Search functionality
│   └── processing/    # Processing queue
├── components/
│   └── ocr/           # OCR-specific components
├── lib/               # Utilities and database
└── prisma/            # Database schema
```

### Key Components
- **DocumentUpload**: Drag-drop interface with progress tracking
- **DocumentList**: Filterable document browser
- **DocumentViewer**: Multi-tab document analysis interface
- **ProcessingStatus**: Real-time processing monitoring
- **SearchAndFilter**: Advanced search with filtering options

### Testing
```bash
npm test              # Run all tests
npm run test:coverage # Generate coverage report
npm run type-check    # TypeScript validation
```

### Build & Deploy
```bash
npm run build         # Production build
npm start             # Start production server
npm run db:migrate    # Run database migrations
```

## Performance

### Optimization Features
- **Thumbnail Generation**: Fast preview images
- **Text Chunking**: Efficient storage and search for large documents
- **Processing Queue**: Background processing with priority handling
- **Caching**: API response caching for repeated queries
- **Progressive Loading**: Incremental loading of document lists

### Resource Usage
- **CPU**: OCR processing is CPU-intensive, queue manages load
- **Memory**: ~2GB recommended for processing large documents
- **Storage**: Original files + processed data + thumbnails
- **Database**: Efficient indexing for fast search and retrieval

## Troubleshooting

### Common Issues
1. **Processing Failures**: Check image quality, file format, language settings
2. **Low OCR Confidence**: Try higher resolution images, better lighting
3. **Missing Text**: Verify document orientation, language detection
4. **Slow Processing**: Check CPU usage, reduce batch sizes

### Debug Commands
```bash
npm run debug:ocr     # OCR processing debug
npm run logs:processing # View processing logs
npm run db:studio     # Database inspection
```

## Local Development Focus

This template is specifically designed for:
- **Personal Projects**: Individual document processing needs
- **Local Deployment**: No cloud services or external dependencies
- **Single User**: Simplified authentication and data model
- **Development**: Easy setup and customization

### Not Included
- Multi-tenancy or user management
- Cloud storage integration
- Enterprise security features
- Scaling for high-volume processing

## Contributing

This template follows the AIPatternEnforcer project standards:
- Use generators for new components: `npm run g:c ComponentName`
- Write tests first: All new features require tests
- Follow enforcement rules: `npm run check:all` before commits
- Document changes: Update README and inline documentation

## License

Part of the AIPatternEnforcer project - Local development template for AI-assisted applications.