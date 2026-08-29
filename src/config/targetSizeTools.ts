import { ToolDefinition } from '../types';

export interface TargetSizeLinkItem {
  slug: string;
  label: string;
  targetSizeKb: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';
  type: 'compress' | 'resize';
  mediaType?: 'image' | 'pdf';
}

export const EXACT_IMAGE_TARGET_SIZE_ITEMS: TargetSizeLinkItem[] = [
  { slug: 'compress-image-to-5kb', label: 'Image to 5KB', targetSizeKb: 5, type: 'compress', mediaType: 'image' },
  { slug: 'compress-jpeg-to-10kb', label: 'JPEG to 10KB', targetSizeKb: 10, format: 'image/jpeg', type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-15kb', label: 'Image to 15KB', targetSizeKb: 15, type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-20kb', label: 'Image to 20KB', targetSizeKb: 20, type: 'compress', mediaType: 'image' },
  { slug: 'compress-jpeg-between-20kb-to-50kb', label: 'JPEG 20KB-50KB', targetSizeKb: 35, format: 'image/jpeg', type: 'compress', mediaType: 'image' },
  { slug: 'compress-jpeg-to-25kb', label: 'JPEG to 25KB', targetSizeKb: 25, format: 'image/jpeg', type: 'compress', mediaType: 'image' },
  { slug: 'compress-jpeg-to-30kb', label: 'JPEG to 30KB', targetSizeKb: 30, format: 'image/jpeg', type: 'compress', mediaType: 'image' },
  { slug: 'compress-jpeg-to-40kb', label: 'JPEG to 40KB', targetSizeKb: 40, format: 'image/jpeg', type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-50kb', label: 'Image to 50KB', targetSizeKb: 50, type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-60kb', label: 'Image to 60KB', targetSizeKb: 60, type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-70kb', label: 'Image to 70KB', targetSizeKb: 70, type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-80kb', label: 'Image to 80KB', targetSizeKb: 80, type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-90kb', label: 'Image to 90KB', targetSizeKb: 90, type: 'compress', mediaType: 'image' },
  { slug: 'resize-image-to-50kb', label: 'Resize to 50KB', targetSizeKb: 50, type: 'resize', mediaType: 'image' },
  { slug: 'compress-image-to-100kb', label: 'Image to 100KB', targetSizeKb: 100, type: 'compress', mediaType: 'image' },
  { slug: 'compress-jpeg-to-150kb', label: 'JPEG to 150KB', targetSizeKb: 150, format: 'image/jpeg', type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-200kb', label: 'Image to 200KB', targetSizeKb: 200, type: 'compress', mediaType: 'image' },
  { slug: 'resize-image-to-200kb', label: 'Resize to 200KB', targetSizeKb: 200, type: 'resize', mediaType: 'image' },
  { slug: 'compress-jpeg-to-300kb', label: 'JPEG to 300KB', targetSizeKb: 300, format: 'image/jpeg', type: 'compress', mediaType: 'image' },
  { slug: 'compress-jpeg-to-500kb', label: 'JPEG to 500KB', targetSizeKb: 500, format: 'image/jpeg', type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-1mb', label: 'Image to 1MB', targetSizeKb: 1000, type: 'compress', mediaType: 'image' },
  { slug: 'compress-image-to-2mb', label: 'Image to 2MB', targetSizeKb: 2000, type: 'compress', mediaType: 'image' },
];

export const EXACT_PDF_TARGET_SIZE_ITEMS: TargetSizeLinkItem[] = [
  { slug: 'compress-pdf-to-20kb', label: 'PDF to 20KB', targetSizeKb: 20, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-50kb', label: 'PDF to 50KB', targetSizeKb: 50, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-100kb', label: 'PDF to 100KB', targetSizeKb: 100, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-150kb', label: 'PDF to 150KB', targetSizeKb: 150, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-200kb', label: 'PDF to 200KB', targetSizeKb: 200, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-250kb', label: 'PDF to 250KB', targetSizeKb: 250, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-300kb', label: 'PDF to 300KB', targetSizeKb: 300, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-400kb', label: 'PDF to 400KB', targetSizeKb: 400, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-500kb', label: 'PDF to 500KB', targetSizeKb: 500, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-600kb', label: 'PDF to 600KB', targetSizeKb: 600, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-800kb', label: 'PDF to 800KB', targetSizeKb: 800, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-1mb', label: 'PDF to 1MB', targetSizeKb: 1000, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-2mb', label: 'PDF to 2MB', targetSizeKb: 2000, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-3mb', label: 'PDF to 3MB', targetSizeKb: 3000, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-5mb', label: 'PDF to 5MB', targetSizeKb: 5000, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
  { slug: 'compress-pdf-to-10mb', label: 'PDF to 10MB', targetSizeKb: 10000, format: 'application/pdf', type: 'compress', mediaType: 'pdf' },
];

export const EXACT_TARGET_SIZE_ITEMS: TargetSizeLinkItem[] = [
  ...EXACT_IMAGE_TARGET_SIZE_ITEMS,
  ...EXACT_PDF_TARGET_SIZE_ITEMS,
];

/**
 * Creates a dynamic ToolDefinition for an exact target-size image route
 */
export function createTargetSizeToolDefinition(
  slug: string,
  targetSizeKb: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  actionType: 'compress' | 'resize' = 'compress'
): ToolDefinition {
  const sizeLabel = targetSizeKb >= 1000 ? `${targetSizeKb / 1000}MB` : `${targetSizeKb}KB`;
  const formatLabel = format === 'image/jpeg' ? 'JPEG' : format === 'image/webp' ? 'WEBP' : 'Image';
  const name = `${actionType === 'resize' ? 'Resize' : 'Compress'} ${formatLabel} to ${sizeLabel}`;

  return {
    id: slug,
    slug: slug,
    name: name,
    shortDescription: `Compress and optimize photos to exact or under ${sizeLabel} with pristine visual quality.`,
    fullDescription: `Instant browser-side image converter to hit exact ${sizeLabel} target file sizes. Features iterative sub-pixel downscaling, JPEG quantizing, and EXIF stripping to ensure your images meet strict portal, job, or passport upload requirements.`,
    category: 'compress',
    processingType: 'browser',
    icon: actionType === 'resize' ? 'Scaling' : 'Minimize2',
    route: `/${slug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: [
      `Exact ${sizeLabel} target file size guarantee`,
      '100% private in-browser compression without server uploads',
      'Supports JPG, PNG, and WebP input images',
      'Automatic dimension calculation for maximum clarity',
      'Instant side-by-side comparison and instant download',
    ],
    howToSteps: [
      { step: 1, title: 'Upload Image', description: `Drag and drop your image or click Select Image to convert to ${sizeLabel}.` },
      { step: 2, title: 'Adjust Target or Format', description: `Target size is preloaded to ${sizeLabel}. Fine-tune dimensions or units if desired.` },
      { step: 3, title: 'Download Compressed File', description: `Download your perfectly sized ${sizeLabel} image instantly.` },
    ],
    faqs: [
      {
        question: `How do I compress an image to exact ${sizeLabel}?`,
        answer: `Simply upload your photo on this page. Our engine automatically calculates optimal quantizing and dimensions to achieve ${sizeLabel} without exceeding the limit.`,
      },
      {
        question: 'Are my images uploaded to external servers?',
        answer: 'No. All compression runs 100% locally inside your web browser using HTML5 Canvas API.',
      },
      {
        question: `Will the compressed image be accepted by online portals with ${sizeLabel} limits?`,
        answer: `Yes! The output file size is strictly optimized to stay at or under ${sizeLabel} with correct headers and clean metadata.`,
      },
    ],
    seo: {
      title: `${name} Online - Free Exact ${sizeLabel} Photo Compressor`,
      description: `Compress and resize ${formatLabel} photos to ${sizeLabel} online for free. Hit exact file size limits for passport, government forms, job applications, and websites.`,
      keywords: [
        `${actionType} image to ${sizeLabel.toLowerCase()}`,
        `compress jpeg to ${sizeLabel.toLowerCase()}`,
        `reduce image size to ${sizeLabel.toLowerCase()}`,
        `image compressor to ${sizeLabel.toLowerCase()}`,
        'exact size photo compressor',
      ],
      canonicalSlug: slug,
    },
  };
}

/**
 * Creates a dynamic ToolDefinition for an exact target-size PDF route
 */
export function createPdfTargetSizeToolDefinition(
  slug: string,
  targetSizeKb: number,
  actionType: 'compress' | 'reduce' = 'compress'
): ToolDefinition {
  const sizeLabel = targetSizeKb >= 1000 ? `${targetSizeKb / 1000}MB` : `${targetSizeKb}KB`;
  const name = `Compress PDF to ${sizeLabel}`;

  return {
    id: slug,
    slug: slug,
    name: name,
    shortDescription: `Compress and reduce PDF document file size under ${sizeLabel} with crisp readable text.`,
    fullDescription: `Instant browser-side PDF compressor engineered to hit exact ${sizeLabel} target file size limits. Optimizes font streams, vector paths, embedded imagery, and removes unneeded metadata to guarantee strict portal, job, or visa upload compliance.`,
    category: 'pdf',
    processingType: 'browser',
    icon: 'Minimize',
    route: `/${slug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    isPopular: true,
    features: [
      `Exact ${sizeLabel} target file size ceiling guarantee`,
      '100% client-side PDF stream optimization with zero server uploads',
      'Preserves sharp vector text glyphs, form fields, and layout structures',
      'Multi-pass raster downsampling for dense image-heavy PDFs',
      'Instant side-by-side comparison of original vs compressed bytes',
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF Document', description: `Drag and drop your PDF file or click to browse. Target is pre-set to ${sizeLabel}.` },
      { step: 2, title: 'Verify Target Settings', description: `Engine automatically tunes object streams and image DPI to stay strictly under ${sizeLabel}.` },
      { step: 3, title: 'Download Compressed PDF', description: `Download your perfectly compressed ${sizeLabel} PDF immediately.` },
    ],
    faqs: [
      {
        question: `How do I compress a PDF under ${sizeLabel}?`,
        answer: `Upload your PDF document on this page. Our engine automatically consolidates object streams, optimizes font subsets, and scales embedded graphics to stay within ${sizeLabel}.`,
      },
      {
        question: 'Are my confidential documents uploaded to any server?',
        answer: 'Never. All PDF compression, stream parsing, and rendering execute 100% locally in your browser memory.',
      },
      {
        question: `Will government and university portals accept this ${sizeLabel} PDF?`,
        answer: `Yes! The output is a standard, fully compliant PDF/A-ready document with valid cross-reference tables and strict file-size limits.`,
      },
    ],
    seo: {
      title: `${name} Online Free – Reduce PDF Size Under ${sizeLabel}`,
      description: `Compress and shrink PDF document size under ${sizeLabel} online for free. Guaranteed to meet strict portal limits for government exams, jobs, visas, and emails.`,
      keywords: [
        `compress pdf to ${sizeLabel.toLowerCase()}`,
        `reduce pdf size to ${sizeLabel.toLowerCase()}`,
        `pdf compressor ${sizeLabel.toLowerCase()} online free`,
        `shrink pdf under ${sizeLabel.toLowerCase()}`,
        `pdf size reducer ${sizeLabel.toLowerCase()}`,
      ],
      canonicalSlug: slug,
    },
  };
}

/**
 * Dynamically parses any route matching pattern /compress-*-to-* or /resize-*-to-* or /reduce-*-to-*
 */
export function parseTargetSizeRoute(path: string): ToolDefinition | undefined {
  const clean = path.replace(/^\/+|\/+$/g, '').toLowerCase();

  // 1. Check exact predefined match in PDF items first
  const predefinedPdf = EXACT_PDF_TARGET_SIZE_ITEMS.find((item) => item.slug.toLowerCase() === clean);
  if (predefinedPdf) {
    return createPdfTargetSizeToolDefinition(predefinedPdf.slug, predefinedPdf.targetSizeKb);
  }

  // 2. Check exact predefined match in Image items
  const predefinedImg = EXACT_IMAGE_TARGET_SIZE_ITEMS.find((item) => item.slug.toLowerCase() === clean);
  if (predefinedImg) {
    const imgFormat = predefinedImg.format === 'image/png' || predefinedImg.format === 'image/webp' ? predefinedImg.format : 'image/jpeg';
    return createTargetSizeToolDefinition(
      predefinedImg.slug,
      predefinedImg.targetSizeKb,
      imgFormat,
      predefinedImg.type
    );
  }

  // 3. Dynamic PDF pattern matching:
  // (compress|reduce|shrink|optimize)-(pdf|document|pdf-file)-(?:between-(\d+)(?:kb)?-to-)?(?:to-)?(\d+)(kb|mb)
  // or reduce-pdf-size-to-(\d+)(kb|mb)
  const pdfMatch = clean.match(/^(compress|reduce|shrink|optimize)-(?:pdf|document|pdf-file|pdf-document)-(?:between-(\d+)(?:kb)?-to-)?(?:to-)?(\d+)(kb|mb)$/i) ||
                   clean.match(/^(?:compress|reduce|shrink)-pdf-size-to-(\d+)(kb|mb)$/i);
  if (pdfMatch) {
    const num = parseInt(pdfMatch[pdfMatch.length - 2], 10);
    const unit = pdfMatch[pdfMatch.length - 1].toLowerCase();
    const targetSizeKb = unit === 'mb' ? num * 1000 : num;

    if (!isNaN(targetSizeKb) && targetSizeKb > 0) {
      return createPdfTargetSizeToolDefinition(clean, targetSizeKb);
    }
  }

  // 4. Dynamic Image pattern matching:
  // Pattern: (compress|resize)-(image|jpeg|jpg|png|webp|photos?)-(?:between-(\d+)(?:kb)?-to-)?(?:to-)?(\d+)(kb|mb)
  const imgMatch = clean.match(/^(compress|resize|reduce)-(image|jpeg|jpg|png|webp|photos?)-(?:between-(\d+)(?:kb)?-to-)?(?:to-)?(\d+)(kb|mb)$/i);
  if (imgMatch) {
    const actionType = imgMatch[1] === 'resize' ? 'resize' : 'compress';
    const rawFmt = imgMatch[2].toLowerCase();
    const format: 'image/jpeg' | 'image/png' | 'image/webp' =
      rawFmt === 'png' ? 'image/png' : rawFmt === 'webp' ? 'image/webp' : 'image/jpeg';
    const num = parseInt(imgMatch[4], 10);
    const unit = imgMatch[5].toLowerCase();
    const targetSizeKb = unit === 'mb' ? num * 1000 : num;

    if (!isNaN(targetSizeKb) && targetSizeKb > 0) {
      return createTargetSizeToolDefinition(clean, targetSizeKb, format, actionType);
    }
  }

  // Pattern: compress-*-between-20kb-to-50kb
  if (clean.includes('between-20kb-to-50kb')) {
    if (clean.includes('pdf')) {
      return createPdfTargetSizeToolDefinition(clean, 35);
    }
    return createTargetSizeToolDefinition(clean, 35, 'image/jpeg', 'compress');
  }

  return undefined;
}

