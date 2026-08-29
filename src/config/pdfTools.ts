import { ToolDefinition } from '../types';

export const PDF_TOOLS_REGISTRY: ToolDefinition[] = [
  // ----------------------------------------------------
  // A. PDF CONVERSION (PDF TO X & X TO PDF)
  // ----------------------------------------------------
  {
    id: 'pdf-to-word',
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    shortDescription: 'Convert PDF documents to editable Microsoft Word DOCX files with formatting intact.',
    fullDescription: 'Fast, secure, and free PDF to Word converter. Extract text, tables, and multi-page layouts into clean, 100% editable Microsoft Word (.docx) documents.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'FileText',
    route: '/pdf-to-word',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    isPopular: true,
    isNew: true,
    features: [
      'Extracts structured text, paragraphs, and headings to .docx',
      'Preserves original multi-page order and page breaks',
      '100% private in-browser client processing with zero file uploads',
      'Download individual DOCX or bulk batch archive'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Drag and drop your PDF document or choose a file from your device.' },
      { step: 2, title: 'Convert to Word', description: 'Our converter parses text blocks and formats them into a Microsoft Word document.' },
      { step: 3, title: 'Download DOCX', description: 'Download your editable Word document immediately.' }
    ],
    faqs: [
      { question: 'Is converted Word text editable?', answer: 'Yes! The generated DOCX file can be opened and edited in Microsoft Word, Google Docs, or LibreOffice.' },
      { question: 'Are my confidential documents uploaded to a server?', answer: 'No. All conversion takes place locally in your web browser memory for absolute data privacy.' }
    ],
    seo: {
      title: 'PDF to Word Converter – Convert PDF to Editable DOCX Online Free',
      description: 'Convert PDF to Microsoft Word (.docx) online for free. Fast, private in-browser conversion with editable text, tables, and intact page layout.',
      keywords: ['pdf to word', 'convert pdf to word', 'pdf to docx', 'pdf to docx converter online', 'free pdf to word'],
      canonicalSlug: 'pdf-to-word'
    }
  },
  {
    id: 'pdf-to-docx',
    slug: 'pdf-to-docx',
    name: 'PDF to DOCX',
    shortDescription: 'Transform PDF pages into genuine Microsoft Word DOCX format.',
    fullDescription: 'Convert PDF files directly to Microsoft Word OpenXML (.docx) format with instant client-side processing.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'FileCode',
    route: '/pdf-to-docx',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    seo: {
      title: 'PDF to DOCX Converter – Convert PDF to Word Online',
      description: 'Convert PDF files into standard DOCX format in your browser. Fast, accurate, and completely private.',
      keywords: ['pdf to docx', 'pdf to docx converter', 'export pdf as docx'],
      canonicalSlug: 'pdf-to-word'
    }
  },
  {
    id: 'pdf-to-jpg',
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    shortDescription: 'Convert PDF pages into high-resolution JPG images with instant ZIP download.',
    fullDescription: 'Extract every page of your PDF as a crisp, high-resolution JPEG image. Download individual page photos or save all pages in a single ZIP archive.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Image',
    route: '/pdf-to-jpg',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    isPopular: true,
    features: [
      'Render pages up to Ultra HD 300 DPI resolution',
      'Export individual page JPGs or download all pages in one organized ZIP',
      'Select custom page ranges or convert all pages at once',
      'Batch process multiple PDF files concurrently'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Select or drag-and-drop your PDF document.' },
      { step: 2, title: 'Choose Quality & Pages', description: 'Select your preferred image resolution and page range.' },
      { step: 3, title: 'Download JPGs', description: 'Download pages individually or grab the entire ZIP package.' }
    ],
    faqs: [
      { question: 'What resolution are the extracted JPGs?', answer: 'Images are rendered at high-density 2x/300 DPI retina quality for sharp, readable text and graphics.' }
    ],
    seo: {
      title: 'PDF to JPG Converter – Convert PDF Pages to JPG Images Online',
      description: 'Convert PDF to JPG online for free. Render high-quality JPG photos from every PDF page and download all as a ZIP.',
      keywords: ['pdf to jpg', 'convert pdf to jpg', 'pdf to image', 'pdf to jpeg converter online', 'save pdf as picture'],
      canonicalSlug: 'pdf-to-jpg'
    }
  },
  {
    id: 'pdf-to-png',
    slug: 'pdf-to-png',
    name: 'PDF to PNG',
    shortDescription: 'Convert PDF pages into transparent, lossless 32-bit PNG graphics.',
    fullDescription: 'Turn PDF document pages into lossless, high-definition PNG images. Ideal for illustrations, vector diagrams, and transparent graphical elements.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'ImagePlus',
    route: '/pdf-to-png',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    isPopular: true,
    seo: {
      title: 'PDF to PNG Converter – High-Quality Lossless PNG Export',
      description: 'Convert PDF pages to lossless PNG images online. Free, fast, private, and supports bulk multi-page ZIP export.',
      keywords: ['pdf to png', 'convert pdf to png', 'export pdf as png', 'pdf pages to png images'],
      canonicalSlug: 'pdf-to-png'
    }
  },
  {
    id: 'pdf-to-webp',
    slug: 'pdf-to-webp',
    name: 'PDF to WebP',
    shortDescription: 'Convert PDF pages into lightweight, ultra-fast modern WebP images.',
    fullDescription: 'Transcode PDF documents into lightweight WebP format for fast-loading web applications, portfolios, and online previews.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'FileImage',
    route: '/pdf-to-webp',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    seo: {
      title: 'PDF to WebP Converter – Convert PDF to WebP Images Online',
      description: 'Convert PDF documents to modern WebP image format with small file sizes and crisp visual fidelity.',
      keywords: ['pdf to webp', 'convert pdf to webp', 'export pdf pages as webp'],
      canonicalSlug: 'pdf-to-webp'
    }
  },
  {
    id: 'pdf-to-txt',
    slug: 'pdf-to-txt',
    name: 'PDF to TXT',
    shortDescription: 'Extract raw text, paragraphs, and data strings from any PDF.',
    fullDescription: 'Extract pure plaintext from PDF documents without layout clutter. Copy to clipboard or download as a .txt file immediately.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'FileText',
    route: '/pdf-to-txt',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    seo: {
      title: 'PDF to Text Converter – Extract Text from PDF Online Free',
      description: 'Extract raw text from PDF files online. Copy to clipboard or download as TXT file instantly.',
      keywords: ['pdf to txt', 'pdf to text', 'extract text from pdf', 'pdf text grabber'],
      canonicalSlug: 'pdf-to-txt'
    }
  },
  {
    id: 'pdf-to-html',
    slug: 'pdf-to-html',
    name: 'PDF to HTML',
    shortDescription: 'Convert PDF pages into structured, web-ready HTML code.',
    fullDescription: 'Convert PDF text, paragraphs, and structures into clean HTML web pages for online publishing.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Code',
    route: '/pdf-to-html',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    seo: {
      title: 'PDF to HTML Converter – Convert PDF to Web Pages Online',
      description: 'Convert PDF documents into clean, responsive HTML markup in your browser.',
      keywords: ['pdf to html', 'convert pdf to html', 'pdf to web page'],
      canonicalSlug: 'pdf-to-html'
    }
  },
  {
    id: 'jpg-to-pdf',
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    shortDescription: 'Combine multiple JPG photos into a clean, standardized PDF document.',
    fullDescription: 'Convert one or dozens of JPG images into a single professional PDF. Adjust orientation (Portrait/Landscape), page dimensions (A4, Letter, Fit), and margins.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Layers',
    route: '/jpg-to-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 100,
    isPopular: true,
    features: [
      'Combine up to 100 JPG images into one multi-page PDF',
      'Drag-and-drop to reorder photo sequence before merging',
      'Preset page formats: A4, A3, Letter, Legal, or Fit to Image Size',
      'Custom margin settings (None, Small, Large) and image fit modes'
    ],
    howToSteps: [
      { step: 1, title: 'Upload JPGs', description: 'Drag and drop your photos into the workspace.' },
      { step: 2, title: 'Customize Layout', description: 'Set page size (A4/Letter), margins, and reorder photos.' },
      { step: 3, title: 'Generate PDF', description: 'Click Convert to PDF and download your combined document.' }
    ],
    faqs: [
      { question: 'Can I combine multiple pictures into one PDF?', answer: 'Yes! You can upload dozens of photos, drag to rearrange their order, and save as a unified PDF.' }
    ],
    seo: {
      title: 'JPG to PDF Converter – Combine Multiple JPG Images into PDF',
      description: 'Convert JPG to PDF online for free. Combine multiple photos into a single PDF document with custom page sizes, margins, and layout controls.',
      keywords: ['jpg to pdf', 'convert jpg to pdf', 'images to pdf', 'merge photos into pdf', 'pictures to pdf converter'],
      canonicalSlug: 'jpg-to-pdf'
    }
  },
  {
    id: 'png-to-pdf',
    slug: 'png-to-pdf',
    name: 'PNG to PDF',
    shortDescription: 'Convert PNG graphics and illustrations into print-ready PDF files.',
    fullDescription: 'Convert PNG images into high-resolution PDF documents with preserved sharpness, transparency fills, and customizable margins.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'FileImage',
    route: '/png-to-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    maxFileSizeMB: 100,
    seo: {
      title: 'PNG to PDF Converter – Convert PNG Images to PDF Online',
      description: 'Turn PNG images into clean PDF documents for printing and sharing. 100% private and free.',
      keywords: ['png to pdf', 'convert png to pdf', 'save png as pdf'],
      canonicalSlug: 'png-to-pdf'
    }
  },
  {
    id: 'word-to-pdf',
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    shortDescription: 'Convert Word DOC and DOCX files into formatted PDF documents.',
    fullDescription: 'Transform Word documents into universal, unalterable PDF files ready for printing, submission, and archiving.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'FileUp',
    route: '/word-to-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'],
    maxFileSizeMB: 100,
    isPopular: true,
    seo: {
      title: 'Word to PDF Converter – Convert DOCX to PDF Online Free',
      description: 'Convert Microsoft Word DOCX documents to PDF online for free. Fast, private, and browser-based.',
      keywords: ['word to pdf', 'convert word to pdf', 'docx to pdf', 'save docx as pdf'],
      canonicalSlug: 'word-to-pdf'
    }
  },
  {
    id: 'txt-to-pdf',
    slug: 'txt-to-pdf',
    name: 'TXT to PDF',
    shortDescription: 'Convert raw text files into clean, paginated PDF documents.',
    fullDescription: 'Convert plain text (.txt) files into clean, formatted PDF documents with custom typography, page numbers, and margins.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'FileText',
    route: '/txt-to-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain'],
    maxFileSizeMB: 50,
    seo: {
      title: 'TXT to PDF Converter – Convert Plain Text to PDF Online',
      description: 'Convert TXT text files into formatted PDF documents with customizable page sizing and fonts.',
      keywords: ['txt to pdf', 'text to pdf', 'convert txt to pdf'],
      canonicalSlug: 'txt-to-pdf'
    }
  },
  {
    id: 'images-to-pdf',
    slug: 'images-to-pdf',
    name: 'Images to PDF',
    shortDescription: 'Bulk convert mixed format photos (JPG, PNG, WebP) into one structured PDF.',
    fullDescription: 'Universal image-to-PDF compiler. Combine mixed JPG, PNG, and WebP photos into a multi-page PDF book with reordering and layout styling.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'GalleryVerticalEnd',
    route: '/images-to-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSizeMB: 100,
    isPopular: true,
    seo: {
      title: 'Images to PDF Converter – Combine Photos into Multi-Page PDF',
      description: 'Convert multiple photos into a single PDF document online. Supports JPG, PNG, and WebP with drag-and-drop reordering.',
      keywords: ['images to pdf', 'photos to pdf', 'combine pictures into pdf', 'multi image pdf creator'],
      canonicalSlug: 'images-to-pdf'
    }
  },

  // ----------------------------------------------------
  // B. PDF ORGANIZATION (MERGE, SPLIT, ROTATE, REORDER)
  // ----------------------------------------------------
  {
    id: 'merge-pdf',
    slug: 'merge-pdf',
    name: 'Merge PDF',
    shortDescription: 'Combine multiple PDF files into a single unified document in any order.',
    fullDescription: 'Effortlessly merge two or more PDF files into a single master document. Drag and drop to rearrange files, preview page counts, and download instantly.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Merge',
    route: '/merge-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    isPopular: true,
    features: [
      'Merge unlimited PDF files into one clean document',
      'Interactive visual thumbnail reordering before merging',
      'Preserves original vector sharpness, links, and page structures',
      '100% private in-browser merging with zero server latency'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDFs', description: 'Select two or more PDF files to combine.' },
      { step: 2, title: 'Arrange Order', description: 'Drag cards to place files in your desired sequence.' },
      { step: 3, title: 'Merge & Save', description: 'Click Merge PDF and download your combined document.' }
    ],
    faqs: [
      { question: 'Is there a limit on how many PDFs I can merge?', answer: 'No! You can merge multiple PDF documents without limitations in modern web browsers.' },
      { question: 'Will bookmarks and links be preserved?', answer: 'Yes, page structures, vector text, and embedded graphics remain intact.' }
    ],
    seo: {
      title: 'Merge PDF Online Free – Combine PDF Files in Any Order',
      description: 'Merge multiple PDF files into one document online for free. Fast, private, browser-based PDF joiner with drag-and-drop reordering.',
      keywords: ['merge pdf', 'combine pdf', 'pdf joiner', 'merge pdf files online free', 'bind pdf documents'],
      canonicalSlug: 'merge-pdf'
    }
  },
  {
    id: 'split-pdf',
    slug: 'split-pdf',
    name: 'Split PDF',
    shortDescription: 'Split PDF into individual pages, custom page ranges, or extract specific sheets.',
    fullDescription: 'Split a large PDF into separate single-page documents, extract custom page intervals (e.g., 1-3, 5, 8-10), or extract selected pages into a ZIP archive.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Split',
    route: '/split-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    isPopular: true,
    features: [
      'Split all pages into individual single-page PDF files',
      'Extract custom page ranges (e.g., "1-5, 8, 12-15")',
      'Select visual page thumbnails to extract into a new PDF',
      'Download all extracted split files in a single ZIP archive'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Select the multi-page PDF document you wish to split.' },
      { step: 2, title: 'Select Mode', description: 'Choose between "Extract All Pages", "Page Ranges", or "Selected Thumbnails".' },
      { step: 3, title: 'Split & Download', description: 'Click Split PDF to download individual PDFs or a ZIP package.' }
    ],
    faqs: [
      { question: 'How do I specify custom page ranges?', answer: 'Type ranges separated by commas, such as "1-4, 7, 9-12". Our engine parses each range into distinct PDF files.' }
    ],
    seo: {
      title: 'Split PDF Online – Separate PDF Pages and Ranges for Free',
      description: 'Split PDF files online for free. Extract individual pages, custom ranges, or separate all pages into a ZIP archive.',
      keywords: ['split pdf', 'separate pdf pages', 'extract pdf pages', 'split pdf online free', 'cut pdf pages'],
      canonicalSlug: 'split-pdf'
    }
  },
  {
    id: 'rotate-pdf',
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    shortDescription: 'Rotate PDF pages 90°, 180°, or 270° permanently across all or selected pages.',
    fullDescription: 'Fix upside-down or sideways scanned PDF pages. Rotate all pages, odd pages, even pages, or selected individual sheets permanently.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'RotateCw',
    route: '/rotate-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    isPopular: true,
    seo: {
      title: 'Rotate PDF Online Free – Rotate PDF Pages 90, 180 or 270 Degrees',
      description: 'Rotate PDF pages permanently online for free. Rotate all pages or selected sheets clockwise or counter-clockwise.',
      keywords: ['rotate pdf', 'rotate pdf online', 'turn pdf sideways', 'flip pdf upside down', 'rotate pdf pages permanently'],
      canonicalSlug: 'rotate-pdf'
    }
  },
  {
    id: 'reorder-pdf-pages',
    slug: 'reorder-pdf-pages',
    name: 'Reorder & Organize PDF',
    shortDescription: 'Rearrange, delete, duplicate, and organize PDF pages visually.',
    fullDescription: 'Visual page organizer for PDF documents. Drag and drop thumbnail cards to reorder pages, click the trash icon to delete unwanted sheets, and export a clean PDF.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Move',
    route: '/reorder-pdf-pages',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    isPopular: true,
    seo: {
      title: 'Organize PDF Pages – Reorder, Delete & Rearrange PDF Online',
      description: 'Organize PDF pages with visual drag-and-drop thumbnails. Rearrange page order, delete sheets, and export a clean document.',
      keywords: ['reorder pdf pages', 'organize pdf', 'rearrange pdf pages', 'delete pdf pages online'],
      canonicalSlug: 'reorder-pdf-pages'
    }
  },
  {
    id: 'delete-pdf-pages',
    slug: 'delete-pdf-pages',
    name: 'Delete PDF Pages',
    shortDescription: 'Remove unwanted pages and blank sheets from any PDF file.',
    fullDescription: 'Quickly remove unwanted, blank, or confidential pages from your PDF document and download the cleaned version.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Trash2',
    route: '/delete-pdf-pages',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    seo: {
      title: 'Delete PDF Pages Online Free – Remove Pages from PDF',
      description: 'Remove unwanted pages from PDF documents online for free. Select pages visually and download your updated PDF.',
      keywords: ['delete pdf pages', 'remove pages from pdf', 'cut pages out of pdf'],
      canonicalSlug: 'reorder-pdf-pages'
    }
  },

  // ----------------------------------------------------
  // C. PDF COMPRESSION & TARGET SIZE
  // ----------------------------------------------------
  {
    id: 'compress-pdf',
    slug: 'compress-pdf',
    name: 'Compress PDF',
    shortDescription: 'Reduce PDF file size up to 90% while preserving sharp vector text and layout.',
    fullDescription: 'Smart browser-side PDF compressor. Optimize object streams, remove duplicate font dictionaries, and downsample heavy raster images to achieve maximum compression with zero privacy risk.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Minimize2',
    route: '/compress-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    isPopular: true,
    features: [
      'Choose between Low, Recommended, Extreme, or Exact Target Size modes',
      'Live metric inspection: Original size, Output size, Saved bytes, and % reduction',
      'Preserves crisp typography, bookmarks, and document metadata',
      'Batch compress dozens of PDF documents and download all in a ZIP file'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Drag and drop your PDF document.' },
      { step: 2, title: 'Select Mode', description: 'Choose "Recommended" for balanced quality or "Target Size" for exact KB limits.' },
      { step: 3, title: 'Compress & Download', description: 'Inspect the compression report and download your slimmed document.' }
    ],
    faqs: [
      { question: 'Will compressing my PDF make the text blurry?', answer: 'No! Vector typography remains crisp and razor-sharp because vector glyphs are preserved without raster distortion.' }
    ],
    seo: {
      title: 'Compress PDF Online Free – Reduce PDF File Size Up to 90%',
      description: 'Compress PDF documents online for free. Reduce file size for email, web uploads, and government portals with 100% browser privacy.',
      keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf compressor online free', 'compress pdf to 100kb'],
      canonicalSlug: 'compress-pdf'
    }
  },
  {
    id: 'compress-pdf-to-50kb',
    slug: 'compress-pdf-to-50kb',
    name: 'Compress PDF to 50KB',
    shortDescription: 'Reduce PDF document file size under 50KB for strict online upload portals.',
    fullDescription: 'Targeted PDF optimization engineered to fit documents under strict 50 Kilobyte limits required by government recruitment and visa portals.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Minimize',
    route: '/compress-pdf-to-50kb',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 50,
    isPopular: true,
    seo: {
      title: 'Compress PDF to 50KB Online Free – Hit 50 KB Limit',
      description: 'Compress your PDF file under 50KB online for free. Ideal for job applications, government portals, and visa submissions.',
      keywords: ['compress pdf to 50kb', 'reduce pdf size to 50 kb', 'pdf compressor 50kb online', 'shrink pdf to 50kb'],
      canonicalSlug: 'compress-pdf-to-50kb'
    }
  },
  {
    id: 'compress-pdf-to-100kb',
    slug: 'compress-pdf-to-100kb',
    name: 'Compress PDF to 100KB',
    shortDescription: 'Shrink PDF file size under 100KB with crisp readable text.',
    fullDescription: 'Optimize PDF files to fit within standard 100KB upload constraints with adaptive image downsampling and object stream compaction.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Minimize',
    route: '/compress-pdf-to-100kb',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 80,
    isPopular: true,
    seo: {
      title: 'Compress PDF to 100KB Online Free – Reduce PDF Size Under 100 KB',
      description: 'Compress PDF documents to 100KB online for free. Fast, private, in-browser PDF compressor.',
      keywords: ['compress pdf to 100kb', 'pdf compressor 100kb', 'reduce pdf to 100kb online free', 'shrink pdf under 100kb'],
      canonicalSlug: 'compress-pdf-to-100kb'
    }
  },
  {
    id: 'compress-pdf-to-200kb',
    slug: 'compress-pdf-to-200kb',
    name: 'Compress PDF to 200KB',
    shortDescription: 'Optimize multi-page PDF documents under 200KB.',
    fullDescription: 'Compress PDF files to meet 200KB maximum limits for admissions, visa portals, and email attachments.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Minimize',
    route: '/compress-pdf-to-200kb',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    seo: {
      title: 'Compress PDF to 200KB Online – Free PDF Size Reducer',
      description: 'Compress PDF files to 200KB online for free. Keep text sharp while meeting portal limits.',
      keywords: ['compress pdf to 200kb', 'reduce pdf size to 200kb', 'shrink pdf to 200 kb'],
      canonicalSlug: 'compress-pdf-to-200kb'
    }
  },
  {
    id: 'compress-pdf-to-500kb',
    slug: 'compress-pdf-to-500kb',
    name: 'Compress PDF to 500KB',
    shortDescription: 'Reduce heavy PDF brochures and reports under 500KB.',
    fullDescription: 'Slim down heavy PDF manuals, presentations, and graphic portfolios under 500KB without visual artifacts.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Minimize',
    route: '/compress-pdf-to-500kb',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    seo: {
      title: 'Compress PDF to 500KB Online Free – Reduce PDF Size',
      description: 'Compress PDF documents under 500KB online for free with balanced visual clarity and file size.',
      keywords: ['compress pdf to 500kb', 'shrink pdf to 500kb', 'reduce pdf to 500 kb online'],
      canonicalSlug: 'compress-pdf-to-500kb'
    }
  },
  {
    id: 'compress-pdf-to-1mb',
    slug: 'compress-pdf-to-1mb',
    name: 'Compress PDF to 1MB',
    shortDescription: 'Compress large PDF files under 1 Megabyte for email attachments.',
    fullDescription: 'Optimize high-resolution PDF documents to fit standard 1MB email attachment thresholds.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Minimize',
    route: '/compress-pdf-to-1mb',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 200,
    seo: {
      title: 'Compress PDF to 1MB Online Free – Fit Email Limits',
      description: 'Compress large PDF files under 1MB online for free. Perfect for email attachments and fast downloads.',
      keywords: ['compress pdf to 1mb', 'reduce pdf size to 1mb', 'shrink pdf to 1 mb online'],
      canonicalSlug: 'compress-pdf-to-1mb'
    }
  },

  // ----------------------------------------------------
  // D. PDF SECURITY (PROTECT & UNLOCK)
  // ----------------------------------------------------
  {
    id: 'protect-pdf',
    slug: 'protect-pdf',
    name: 'Protect & Encrypt PDF',
    shortDescription: 'Encrypt PDF files with strong password protection and permission limits.',
    fullDescription: 'Lock sensitive documents with standard encryption. Set user passwords to prevent unauthorized viewing and restrict printing/copying.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Lock',
    route: '/protect-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    isPopular: true,
    features: [
      'Strong AES password protection applied directly in your browser',
      'Configurable user viewing passwords and owner management passwords',
      'Optional restrictions on document printing and text copying',
      '100% private client processing with zero cloud transmission'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Select the PDF document you want to encrypt.' },
      { step: 2, title: 'Set Password', description: 'Enter your desired secure password and confirm.' },
      { step: 3, title: 'Protect & Save', description: 'Click Protect PDF and download your encrypted file.' }
    ],
    seo: {
      title: 'Protect PDF Online Free – Add Password Encryption to PDF',
      description: 'Encrypt PDF files with secure password protection online for free. Restrict unauthorized viewing and printing with 100% privacy.',
      keywords: ['protect pdf', 'password protect pdf', 'encrypt pdf online', 'lock pdf with password'],
      canonicalSlug: 'protect-pdf'
    }
  },
  {
    id: 'unlock-pdf',
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    shortDescription: 'Remove passwords and security restrictions from authorized PDF files.',
    fullDescription: 'Decrypt and remove password protection from PDF documents you own. Type the authorized password once to generate an unencrypted, permanent copy.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Unlock',
    route: '/unlock-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    isPopular: true,
    seo: {
      title: 'Unlock PDF Online Free – Remove Password & Restrictions',
      description: 'Unlock password-protected PDF documents online for free. Remove security restrictions when authorized with 100% browser safety.',
      keywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf online', 'remove pdf restrictions'],
      canonicalSlug: 'unlock-pdf'
    }
  },

  // ----------------------------------------------------
  // E. PDF WATERMARK, PAGE NUMBERS & HEADER/FOOTER
  // ----------------------------------------------------
  {
    id: 'watermark-pdf',
    slug: 'watermark-pdf',
    name: 'Watermark PDF',
    shortDescription: 'Add text or logo image watermarks with custom opacity, rotation, and position.',
    fullDescription: 'Protect document copyright by stamping custom text (e.g. "CONFIDENTIAL", "DRAFT") or logo graphics onto PDF pages with precision opacity and rotation.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Stamp',
    route: '/watermark-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    isPopular: true,
    features: [
      'Add custom text or upload brand logo images',
      'Adjust transparency (10% to 100%), font size, color, and angle',
      'Positioning modes: Diagonal center, tiled pattern, or corner stamps',
      'Apply to all pages, first page only, or custom page selections'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Drag and drop your PDF document.' },
      { step: 2, title: 'Configure Watermark', description: 'Type text or upload a logo, then adjust opacity and angle.' },
      { step: 3, title: 'Apply & Download', description: 'Download your watermarked PDF immediately.' }
    ],
    seo: {
      title: 'Watermark PDF Online Free – Add Text or Logo Watermark to PDF',
      description: 'Add text or logo image watermarks to PDF files online for free. Customize font, opacity, rotation, and placement.',
      keywords: ['watermark pdf', 'add watermark to pdf', 'stamp pdf', 'confidential watermark pdf', 'logo on pdf'],
      canonicalSlug: 'watermark-pdf'
    }
  },
  {
    id: 'add-page-numbers-to-pdf',
    slug: 'add-page-numbers-to-pdf',
    name: 'Add Page Numbers to PDF',
    shortDescription: 'Insert standardized page numbering into headers or footers across all pages.',
    fullDescription: 'Add clean page numbers ("Page 1 of 10", "1", "Doc 1") to any position (top/bottom left, center, right) with custom start numbers and formatting.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Hash',
    route: '/add-page-numbers-to-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    isPopular: true,
    seo: {
      title: 'Add Page Numbers to PDF Online Free – Number PDF Pages',
      description: 'Add page numbers to PDF documents online for free. Select position, format (Page X of Y), font size, and margins.',
      keywords: ['add page numbers to pdf', 'number pdf pages', 'pdf page numbering online', 'paginate pdf'],
      canonicalSlug: 'add-page-numbers-to-pdf'
    }
  },

  // ----------------------------------------------------
  // F. PDF SIGNING & ANNOTATIONS
  // ----------------------------------------------------
  {
    id: 'sign-pdf',
    slug: 'sign-pdf',
    name: 'Sign PDF',
    shortDescription: 'Draw, type, or upload your electronic signature and stamp it on any page.',
    fullDescription: 'Easily sign PDF contracts, invoices, and documents. Draw your digital signature on canvas, type an elegant cursive signature, or upload a signature image and position it anywhere.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'PenTool',
    route: '/sign-pdf',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    isPopular: true,
    features: [
      'Draw signature smoothly with mouse, stylus, or touchscreen',
      'Type signatures using beautiful handwriting cursive fonts',
      'Upload signature PNG/JPG images with automatic background transparency',
      'Drag, resize, and position your signature stamp on any page'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Select the document you need to sign.' },
      { step: 2, title: 'Create Signature', description: 'Draw, type, or upload your personal signature.' },
      { step: 3, title: 'Place & Save', description: 'Position the signature on the required page and download.' }
    ],
    seo: {
      title: 'Sign PDF Online Free – Electronic Signature for PDF Documents',
      description: 'Sign PDF documents online for free. Draw, type, or upload your signature and place it anywhere with 100% browser privacy.',
      keywords: ['sign pdf', 'e-sign pdf free', 'electronic signature pdf', 'draw signature on pdf', 'sign contract online'],
      canonicalSlug: 'sign-pdf'
    }
  },

  // ----------------------------------------------------
  // G. PDF OCR & METADATA
  // ----------------------------------------------------
  {
    id: 'ocr-pdf',
    slug: 'ocr-pdf',
    name: 'OCR PDF / Scanned to Text',
    shortDescription: 'Extract text from scanned PDFs and document images into searchable text.',
    fullDescription: 'Convert scanned PDF pages and photos into selectable, searchable text. Copy extracted text directly or download as a clean .txt file.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'ScanText',
    route: '/ocr-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
    maxFileSizeMB: 50,
    isPopular: true,
    seo: {
      title: 'OCR PDF Online Free – Extract Text from Scanned PDF Documents',
      description: 'Extract text from scanned PDF pages and documents online for free using optical character recognition.',
      keywords: ['ocr pdf', 'scanned pdf to text', 'extract text from scanned pdf', 'pdf ocr online free'],
      canonicalSlug: 'ocr-pdf'
    }
  },
  {
    id: 'pdf-metadata',
    slug: 'pdf-metadata',
    name: 'PDF Metadata & EXIF Viewer',
    shortDescription: 'Inspect and edit PDF document properties, author, title, and creation dates.',
    fullDescription: 'Examine internal PDF metadata (Title, Author, Subject, Keywords, Producer, Creation Date) and update or strip all tags for confidential distribution.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'Info',
    route: '/pdf-metadata',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    seo: {
      title: 'PDF Metadata Viewer & Editor – Inspect PDF Properties Online',
      description: 'View and edit PDF metadata online for free. Change or wipe Title, Author, Subject, and Producer tags.',
      keywords: ['pdf metadata', 'view pdf metadata', 'edit pdf author title', 'pdf properties viewer'],
      canonicalSlug: 'pdf-metadata'
    }
  },
  {
    id: 'remove-pdf-metadata',
    slug: 'remove-pdf-metadata',
    name: 'Remove PDF Metadata',
    shortDescription: 'Sanitize PDF documents by wiping all private author, device, and GPS tags.',
    fullDescription: 'Completely sanitize PDF documents by stripping all embedded author metadata, software producer tags, and creation histories before public sharing.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'ShieldCheck',
    route: '/remove-pdf-metadata',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    seo: {
      title: 'Remove PDF Metadata Online Free – Sanitize PDF Properties',
      description: 'Strip all metadata from PDF documents online for free. Clean author, title, software, and creation tags.',
      keywords: ['remove pdf metadata', 'clean pdf properties', 'sanitize pdf file', 'strip exif from pdf'],
      canonicalSlug: 'remove-pdf-metadata'
    }
  },
  {
    id: 'extract-images-from-pdf',
    slug: 'extract-images-from-pdf',
    name: 'Extract Images from PDF',
    shortDescription: 'Extract all embedded graphics and photos from PDF files into a ZIP package.',
    fullDescription: 'Extract pictures and illustrations from inside any PDF document and download them as individual JPG/PNG files or a combined ZIP archive.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'ImageDown',
    route: '/extract-images-from-pdf',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    seo: {
      title: 'Extract Images from PDF Online Free – Download PDF Pictures',
      description: 'Extract all embedded photos and graphics from PDF documents online for free. Download as JPG or ZIP.',
      keywords: ['extract images from pdf', 'get pictures from pdf', 'pdf image extractor', 'save images from pdf'],
      canonicalSlug: 'extract-images-from-pdf'
    }
  },
  {
    id: 'pdf-info',
    slug: 'pdf-info',
    name: 'PDF Inspector & Validator',
    shortDescription: 'Analyze PDF structural health, page dimensions, encryption status, and form fields.',
    fullDescription: 'Deep diagnostic utility for PDF documents. Check page counts, dimensional aspect ratios, structural health, and embedded form fields.',
    category: 'pdf',
    processingType: 'browser',
    icon: 'SearchCheck',
    route: '/pdf-info',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    seo: {
      title: 'PDF Inspector & Validator – Analyze PDF Health & Specs',
      description: 'Inspect PDF structure, page count, dimensions, and encryption online for free.',
      keywords: ['pdf inspector', 'validate pdf', 'pdf page counter', 'pdf size checker'],
      canonicalSlug: 'pdf-info'
    }
  }
];

export function getPdfToolByRoute(path: string): ToolDefinition | undefined {
  const normalized = path.split('?')[0].replace(/\/$/, '') || '/';
  return PDF_TOOLS_REGISTRY.find(
    (t) => t.route === normalized || `/${t.slug}` === normalized || `/${t.id}` === normalized
  );
}
